import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SofizPay } from '@/lib/sofizpay';

const sofizpay = new SofizPay();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cib_transaction_id = searchParams.get('cib_transaction_id');

    if (!cib_transaction_id) {
      return NextResponse.json({ error: 'Missing cib_transaction_id' }, { status: 400 });
    }

    // Retrieve payment status from SofizPay using the SDK's CIB status checker
    const statusRes = await sofizpay.payments.retrieve(cib_transaction_id);

    // Find the corresponding order
    let order = await prisma.order.findFirst({
      where: { sofizPayPaymentId: cib_transaction_id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Sync database status based on the retrieved payment status
    if (statusRes.status !== 'PENDING') {
      let newPaymentStatus = order.paymentStatus;
      if (statusRes.status === 'PAID') {
        newPaymentStatus = order.paymentMethod === 'ONLINE' ? 'PAID' : 'PARTIALLY_PAID';
      } else if (statusRes.status === 'FAILED') {
        newPaymentStatus = 'FAILED';
      }

      if (newPaymentStatus !== order.paymentStatus) {
        order = await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: newPaymentStatus,
          },
        });

        // Ensure we log this transaction status update
        const logExists = await prisma.paymentLog.findFirst({
          where: { 
            orderId: order.id, 
            sofizPayId: cib_transaction_id,
            status: statusRes.status === 'PAID' ? 'COMPLETED' : 'FAILED' 
          }
        });

        if (!logExists) {
          await prisma.paymentLog.create({
            data: {
              orderId: order.id,
              sofizPayId: cib_transaction_id,
              amount: order.onlineAmount,
              status: statusRes.status === 'PAID' ? 'COMPLETED' : 'FAILED',
              paymentMethod: 'CIB',
              reconciled: false,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      status: statusRes.status,
      order,
      ...(statusRes.rawData || {}),
    });
  } catch (error) {
    console.error('Error in CIB transaction check:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
