import { NextRequest, NextResponse } from 'next/server';
import { updateOrderToPaid } from '@/lib/actions/order.action';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  // build the webook event
  const event = stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get('stripe-signature') as string,
    process.env.STRIPE_WEBHOOK_SECRET as string
  );

  // check for scucessfull payment
  if (event.type === 'charge.succeeded') {
    const { object } = event.data;

    // update order status

    await updateOrderToPaid({
      orderId: object.metadata.orderId,
      paymentResult: {
        id: object.id,
        status: object.status,
        email_address: object.billing_details.email!,
        pricePaid: (object.amount / 100).toFixed(),
      },
    });

    return NextResponse.json({
      message: 'UpdateOrderToPaid was successful',
    });
  }
  return NextResponse.json({
    message: 'Event is not charge.succeeded',
  });
}
