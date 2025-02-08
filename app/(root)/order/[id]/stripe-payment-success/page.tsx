import { Button } from '@/components/ui/button';
import { getOrderById } from '@/lib/actions/order.action';
import { isApiError } from '@/types';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import Stripe from 'stripe';

const SucessPage = async (props: {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ payment_intent: string }>;
}) => {
  const { id } = await props.params,
    { payment_intent: paymentIntentId } = await props.searchParams,
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

  const order = await getOrderById(id);

  if (!order) notFound();

  if (isApiError(order)) {
    throw new Error(order.message);
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (
    paymentIntent.metadata.orderId == null ||
    paymentIntent.metadata.orderId !== order.id.toString()
  ) {
    return notFound();
  }

  const isSucess = paymentIntent.status === 'succeeded';

  if (!isSucess) return redirect(`/order/${order.id}`);

  return (
    <div className='max-w-4x w-full mx-auto space-y-8'>
      <div className='flex flex-col gap-6 items-center'>
        <h1 className='h1-bold'>Thanks for your purchase</h1>
        <div>We are processing your order</div>
        <Button asChild>
          <Link href={`/order/${id}`}>View Order</Link>
        </Button>
      </div>
    </div>
  );
};

export default SucessPage;
