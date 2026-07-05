import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SofizPay } from '@/lib/sofizpay';

interface CheckoutRequestBody {
  paymentMethod?: string;
  onlineAmount?: number | string;
  paymentMethodDetails?: string;
  forceOfflineComplete?: boolean;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // CUID or transaction ID
    let body: CheckoutRequestBody = {};
    try {
      body = await request.json();
    } catch {
      console.warn('Empty or invalid JSON body received during checkout');
    }
    const { paymentMethod, onlineAmount, paymentMethodDetails, forceOfflineComplete } = body;

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: id },
          { sofizPayPaymentId: id }
        ]
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const total = order.sellingPriceDzd + order.shippingPriceDzd;

    // Option A: 100% Cash on Delivery (COD)
    if (paymentMethod === 'COD') {
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentMethod: 'COD',
          onlineAmount: 0,
          codAmount: total,
          paymentStatus: 'PENDING',
        },
      });
      return NextResponse.json({ success: true, order: updatedOrder });
    }

    // Option B & C: ONLINE or SPLIT payment
    const computedOnlineAmount = paymentMethod === 'ONLINE' ? total : Number(onlineAmount);
    const computedCodAmount = total - computedOnlineAmount;

    // Fetch the user's SofizPay public key from the DB
    let userSofizPayKey: string | undefined;
    if (order.userId) {
      const user = await prisma.user.findUnique({
        where: { id: order.userId },
        select: { sofizPayPublicKey: true },
      });
      userSofizPayKey = user?.sofizPayPublicKey ?? undefined;
    }

    // Initialise SDK with user's key (falls back to env if not set)
    const sofizpay = new SofizPay(userSofizPayKey);

    // Check if we have a configured merchant account public key
    const merchantAccount = userSofizPayKey || process.env.SOFIZPAY_MERCHANT_ACCOUNT;
    let finalCheckoutUrl = order.sofizPayCheckoutUrl;
    let finalPaymentId = order.sofizPayPaymentId;

    const isRealTx = merchantAccount && merchantAccount.startsWith('G');

    // Validate SofizPay minimum transaction amount limit (100 DZD)
    if (computedOnlineAmount < 100) {
      return NextResponse.json({ error: 'The online payment amount must be at least 100 DA.' }, { status: 400 });
    }

    if (isRealTx) {
      const origin = request.headers.get('origin') || new URL(request.url).origin;

      // Trigger SDK to create transaction link
      const paymentResponse = await sofizpay.payments.create({
        amount: computedOnlineAmount,
        currency: 'DZD',
        description: `Order ${order.productName} - Customer: ${order.customerName}`,
        customer: {
          phone: order.customerPhone,
          name: order.customerName,
        },
        successUrl: `${origin}/checkout/verify?orderId=${order.id}`,
        cancelUrl: `${origin}/checkout/verify?orderId=${order.id}`,
      });

      finalPaymentId = paymentResponse.id; // cib_transaction_id returned from SDK
      finalCheckoutUrl = paymentResponse.checkoutUrl;
    }

    // For online payments, status is PENDING until webhook or redirect completes
    // In simulated offline mode, we mark it as PAID/PARTIALLY_PAID immediately
    let paymentStatus = 'PENDING';
    if (!isRealTx || forceOfflineComplete) {
      paymentStatus = paymentMethod === 'ONLINE' ? 'PAID' : 'PARTIALLY_PAID';
    }

    // Update order status in the DB
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentMethod,
        onlineAmount: computedOnlineAmount,
        codAmount: computedCodAmount,
        paymentStatus,
        sofizPayPaymentId: finalPaymentId, // Stores the cib_transaction_id returned from SofizPay
        sofizPayCheckoutUrl: finalCheckoutUrl,
      },
    });

    // Create payment transaction log
    await prisma.paymentLog.create({
      data: {
        orderId: order.id,
        sofizPayId: finalPaymentId || 'MOCK_PAY',
        amount: computedOnlineAmount,
        status: 'COMPLETED',
        paymentMethod: paymentMethodDetails || 'EDAHABIYA',
        reconciled: false,
      },
    });

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder,
      url: finalCheckoutUrl
    });
  } catch (error) {
    console.error('Error in checkout submission:', error);
    return NextResponse.json({ error: 'Checkout submission failed' }, { status: 500 });
  }
}
