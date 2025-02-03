import Pagination from '@/components/shared/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '../ui/button';
import DeleteDialog from './delete-dialog';
import { deleteOrder } from '@/lib/actions/order.action';

type OrdersTableProps = {
  orders: {
    id: string;
    createdAt: Date;
    totalPrice: string;
    isPaid: boolean;
    paidAt?: Date | null;
    isDelivered: boolean;
    deliveredAt?: Date | null;
    user: { name: string };
  }[];
  page: number;
  totalPages: number;
  renderActions?: boolean;
  name?: string;
};

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  page,
  totalPages,
  renderActions,
}) => {
  return (
    <div className='overflow-x-auto'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>DATE</TableHead>
            <TableHead>BUYER</TableHead>
            <TableHead>PAID</TableHead>
            <TableHead>DELIVERED</TableHead>
            <TableHead>ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{formatId(order.id)}</TableCell>
              <TableCell>{formatDateTime(order.createdAt).dateTime}</TableCell>
              <TableCell>{order.user.name}</TableCell>
              <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
              <TableCell>
                {order.isPaid && order.paidAt
                  ? formatDateTime(order.paidAt).dateTime
                  : 'Not Paid'}
              </TableCell>
              <TableCell>
                {order.isDelivered && order.deliveredAt
                  ? formatDateTime(order.deliveredAt).dateTime
                  : 'Not Delivered'}
              </TableCell>
              <TableCell>
                <Button asChild variant={'outline'} size={'sm'}>
                  <Link
                    href={`/order/${order.id}`}
                    className='bg-secondary p-2 rounded-lg'
                  >
                    Details
                  </Link>
                </Button>
                {renderActions && (
                  <DeleteDialog id={order.id} action={deleteOrder} />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} />}
    </div>
  );
};

export default OrdersTable;
