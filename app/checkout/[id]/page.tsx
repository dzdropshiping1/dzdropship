import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import CheckoutSimulator from '@/components/CheckoutSimulator';
import { SofizPay } from '@/lib/sofizpay';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CheckoutPage({ params }: PageProps) {
  const { id } = await params;
  
  // Find order by primary CUID or the SofizPay ID for full compatibility
  let order = await prisma.order.findFirst({
    where: {
      OR: [
        { id: id },
        { sofizPayPaymentId: id }
      ]
    },
  });
  
  if (!order) {
    notFound();
  }

  // If the order has an active online checkout transaction and its status is still PENDING,
  // query SofizPay synchronously to double-check its latest payment state
  if (
    order.sofizPayPaymentId && 
    order.paymentStatus === 'PENDING' && 
    (order.paymentMethod === 'ONLINE' || order.paymentMethod === 'SPLIT')
  ) {
    try {
      const sofizpay = new SofizPay();
      const statusRes = await sofizpay.payments.retrieve(order.sofizPayPaymentId);
      
      if (statusRes.status !== 'PENDING') {
        let newPaymentStatus = order.paymentStatus;
        if (statusRes.status === 'PAID') {
          newPaymentStatus = order.paymentMethod === 'ONLINE' ? 'PAID' : 'PARTIALLY_PAID';
        } else if (statusRes.status === 'FAILED') {
          newPaymentStatus = 'FAILED';
        }

        // Update database synchronously
        order = await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: newPaymentStatus,
          },
        });

        // Add payment log entry if not already present
        const logExists = await prisma.paymentLog.findFirst({
          where: { orderId: order.id, status: statusRes.status === 'PAID' ? 'COMPLETED' : 'FAILED' }
        });

        if (!logExists) {
          await prisma.paymentLog.create({
            data: {
              orderId: order.id,
              sofizPayId: order.sofizPayPaymentId!,
              amount: order.onlineAmount,
              status: statusRes.status === 'PAID' ? 'COMPLETED' : 'FAILED',
              paymentMethod: 'EDAHABIYA',
              reconciled: false,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error in synchronous checkout status check:', error);
    }
  }
  
  return <CheckoutSimulator order={order} />;
}
