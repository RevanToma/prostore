import { Resend } from 'resend';
import { SENDER_EMAIL, APP_NAME } from '@/lib/constants';
import PurchaseReceiptEmail from '@/components/email/purchase-receipt';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order } = body;

    if (!order || !order.user?.email) {
      return NextResponse.json(
        { error: 'Invalid order data' },
        { status: 400 }
      );
    }

    // Convert dates to ISO strings before passing to the email component
    const safeOrder = JSON.parse(
      JSON.stringify({
        ...order,
        createdAt: order.createdAt
          ? new Date(order.createdAt).toISOString()
          : null,
        deliveredAt: order.deliveredAt
          ? new Date(order.deliveredAt).toISOString()
          : null,
        paidAt: order.paidAt ? new Date(order.paidAt).toISOString() : null,
      })
    );

    // Send email with React Email template
    const { data, error } = await resend.emails.send({
      from: `${APP_NAME} <${SENDER_EMAIL}>`,
      to: order.user.email,
      subject: `Order Confirmation: ${order.id}`,
      react: PurchaseReceiptEmail({ order: safeOrder }),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
