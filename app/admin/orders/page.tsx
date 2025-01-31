import { auth } from '@/auth';
import OrdersTable from '@/components/shared/orders-table';
import Pagination from '@/components/shared/pagination';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAllOrders } from '@/lib/actions/order.action';
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
  title: 'Admin Orders',
};

const AdminOrdersPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page: string }>;
}) => {
  const session = await auth(),
    { page = '1' } = await searchParams;

  if (session?.user?.role !== 'admin') {
    throw new Error('Not authorized');
  }

  const orders = await getAllOrders({ page: Number(page) });

  return (
    <div className='space-y-2'>
      <h2 className='h2-bold'>Orders</h2>
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
