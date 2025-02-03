import { auth } from '@/auth';
import OrdersTable from '@/components/shared/orders-table';
import { Button } from '@/components/ui/button';
import { getAllOrders } from '@/lib/actions/order.action';
import { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
  title: 'Admin Orders',
};

const AdminOrdersPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page: string; query: string }>;
}) => {
  const session = await auth(),
    { page = '1', query: searchText } = await searchParams;

  if (session?.user?.role !== 'admin') {
    throw new Error('Not authorized');
  }

  const orders = await getAllOrders({ page: Number(page), query: searchText });

  return (
    <div className='space-y-2'>
      <div className='flex-items-center gap-3'>
        <h1 className='h2-bold'>Orders</h1>
        {searchText && (
          <div>
            Filtered by <i>&quot;{searchText}&quot;</i>{' '}
            <Link href={'/admin/orders'}>
              <Button variant={'outline'} size={'sm'}>
                Remove Filter
              </Button>
            </Link>
          </div>
        )}
      </div>
      <OrdersTable
        orders={orders?.data}
        page={Number(page) || 1}
        totalPages={orders?.totalPages}
        renderActions
      />
    </div>
  );
};

export default AdminOrdersPage;
