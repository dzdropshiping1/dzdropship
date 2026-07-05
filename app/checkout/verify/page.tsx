import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { SofizPay } from '@/lib/sofizpay';
import VerifyClient from './VerifyClient';

interface PageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function VerifyPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const orderId = params.orderId;

  if (!orderId) {
    notFound();
  }

  // Fetch the order from the database
  let order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    notFound();
  }

  let initialStatus = order.paymentStatus;
  let initialDetails: Record<string, unknown> | null = null;

  // Perform initial server-side check if transaction ID is available
  if (order.sofizPayPaymentId && (order.paymentStatus === 'PENDING' || order.paymentStatus === 'FAILED')) {
    try {
      const sofizpay = new SofizPay();
      const statusRes = await sofizpay.payments.retrieve(order.sofizPayPaymentId);

      initialDetails = statusRes.rawData || null;

      if (statusRes.status !== 'PENDING' && order.paymentStatus === 'PENDING') {
        let newPaymentStatus = order.paymentStatus;
        if (statusRes.status === 'PAID') {
          newPaymentStatus = order.paymentMethod === 'ONLINE' ? 'PAID' : 'PARTIALLY_PAID';
        } else if (statusRes.status === 'FAILED') {
          newPaymentStatus = 'FAILED';
        }

        // Update database
        order = await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: newPaymentStatus },
        });

        initialStatus = newPaymentStatus;

        // Ensure transaction log exists
        const logExists = await prisma.paymentLog.findFirst({
          where: { 
            orderId: order.id, 
            sofizPayId: order.sofizPayPaymentId!,
            status: statusRes.status === 'PAID' ? 'COMPLETED' : 'FAILED' 
          }
        });

        if (!logExists) {
          await prisma.paymentLog.create({
            data: {
              orderId: order.id,
              sofizPayId: order.sofizPayPaymentId!,
              amount: order.onlineAmount,
              status: statusRes.status === 'PAID' ? 'COMPLETED' : 'FAILED',
              paymentMethod: 'CIB',
              reconciled: false,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error fetching CIB status during server-side page load:', error);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--bg-primary)',
    }}>
      <VerifyClient 
        order={order}
        initialStatus={initialStatus}
        initialDetails={initialDetails}
      />
    </div>
  );
}
