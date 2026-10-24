import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { amount, currency = 'INR', receipt, notes } = body;

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment amount specified' },
        { status: 400 }
      );
    }

    // Convert amount to paise (e.g. ₹9,998 -> 999800 paise)
    const amountInPaise = Math.round(numAmount * 100);

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_Sk4qWthxF0XqKy';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'K5NRM5QgWoUopxJllqu2wHAM';

    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const orderPayload = {
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      receipt: receipt || `rcpt_talent_${Date.now()}`,
      notes: notes || {
        source: 'MP Production Atelier Booking',
      },
    };

    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[Razorpay Order Creation Failed]:', data);
      return NextResponse.json(
        {
          success: false,
          message: data?.error?.description || 'Failed to create Razorpay payment order',
        },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      key: keyId,
      receipt: data.receipt,
    });
  } catch (error: any) {
    console.error('[Razorpay Order API Error]:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Internal server error while initializing payment',
      },
      { status: 500 }
    );
  }
}
