import { NextRequest, NextResponse } from 'next/server';
import { updateOrderToPaid } from '@/lib/actions/order.action';
import Stripe from 'stripe';

// Initialize Stripe instance
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  console.log('Received Webhook Request');

  // Get Stripe signature
  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    console.error('⚠️ Missing Stripe signature');
    return new NextResponse('Missing Stripe signature', { status: 400 });
  }
  console.log('Stripe Signature:', sig);

  let event;
  try {
    // Read raw body as an ArrayBuffer
    const rawBody = await req.arrayBuffer();

    // Convert raw body to string
    const bodyString = new TextDecoder('utf-8').decode(rawBody);
    console.log('RAW BODY:', bodyString);

    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      bodyString,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('❌ Error verifying webhook signature:', err);
    return new NextResponse('Webhook signature verification failed', {
      status: 400,
    });
  }

  console.log('✅ Webhook Verified:', event.type);

  // Handle charge succeeded event
  if (event.type === 'charge.succeeded') {
    const { object } = event.data;
    console.log(
      'Charge Succeeded Event Data:',
      JSON.stringify(object, null, 2)
    );

    if (!object.metadata?.orderId) {
      console.error('⚠️ Order ID is missing in metadata:', object.metadata);
      return new NextResponse('Missing orderId in metadata', { status: 400 });
    }

    try {
      await updateOrderToPaid({
        orderId: object.metadata.orderId,
        paymentResult: {
          id: object.id,
          status: object.status,
          email_address: object.billing_details.email!,
          pricePaid: (object.amount / 100).toFixed(),
        },
      });

      console.log('✅ updateOrderToPaid completed successfully');
      return NextResponse.json({ message: 'UpdateOrderToPaid was successful' });
    } catch (error) {
      console.error('❌ Error updating order:', error);
      return new NextResponse('Error updating order', { status: 500 });
    }
  }

  return NextResponse.json({ message: 'Event is not charge.succeeded' });
}

// 🚀 Important: Prevent Next.js from parsing the body
export const config = {
  api: {
    bodyParser: false,
  },
};
