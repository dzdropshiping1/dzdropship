import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paymentId, status, paymentMethod } = body; // status: "PAID" or "FAILED"

    if (!paymentId || !status) {
      return NextResponse.json({ error: 'Missing paymentId or status' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { sofizPayPaymentId: paymentId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    let newPaymentStatus = order.paymentStatus;
    if (status === 'PAID') {
      if (order.paymentMethod === 'ONLINE') {
        newPaymentStatus = 'PAID';
      } else if (order.paymentMethod === 'SPLIT') {
        newPaymentStatus = 'PARTIALLY_PAID'; // Deposit paid, remaining COD is pending
      }
    } else if (status === 'FAILED') {
      newPaymentStatus = 'FAILED';
    }

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: newPaymentStatus,
      },
    });

    // Log the transaction
    await prisma.paymentLog.create({
      data: {
        orderId: order.id,
        sofizPayId: paymentId,
        amount: order.onlineAmount,
        status: status === 'PAID' ? 'COMPLETED' : 'FAILED',
        paymentMethod: paymentMethod || 'EDAHABIYA',
        reconciled: false,
      },
    });

    return NextResponse.json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing SofizPay webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
