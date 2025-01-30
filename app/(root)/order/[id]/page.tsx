import { getOrderById } from '@/lib/actions/order.action';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Order Details',
};

const OrderDetailsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params,
    order = await getOrderById(id);

  if (!order) notFound();
  return <div>Details{order.totalPrice}</div>;
};

export default OrderDetailsPage;
