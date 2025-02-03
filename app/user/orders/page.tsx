import OrdersTable from '@/components/shared/orders-table';
import { getMyOrders } from '@/lib/actions/order.action';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Orders',
};

const OrdersPage = async (props: {
  searchParams: Promise<{ page: string }>;
}) => {
  const { page } = await props.searchParams,
    orders = await getMyOrders({ page: Number(page) || 1 });

  return (
    <div className='space-y-2'>
      <h2 className='h2-bold'>Orders</h2>
      <OrdersTable
        orders={orders.data || []}
        page={Number(page) || 1}
        totalPages={orders?.totalPages || 1}
      />
    </div>
  );
};

export default OrdersPage;
