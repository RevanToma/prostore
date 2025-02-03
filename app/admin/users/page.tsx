import DeleteDialog from '@/components/shared/delete-dialog';
import OrdersTable from '@/components/shared/orders-table';
import Pagination from '@/components/shared/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { deleteUser, getAllUsers } from '@/lib/actions/user.actions';
import { formatId } from '@/lib/utils';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Admin User Page' };

const AdminUserPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page: string }>;
}) => {
  const { page = '1' } = await searchParams,
    { totalPages, data } = await getAllUsers({ page: Number(page) });

  return (
    <div className='space-y-2'>
      <h2 className='h2-bold'>Users</h2>
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>NAME</TableHead>
              <TableHead>EMAIL</TableHead>
              <TableHead>ROLE</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{formatId(user.id)}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.role === 'user' ? (
                    <Badge variant={'secondary'}>User</Badge>
                  ) : (
                    <Badge variant={'default'}>Admin</Badge>
                  )}
                </TableCell>

                <TableCell>
                  <Button asChild variant={'outline'} size={'sm'}>
                    <Link
                      href={`/admin/users/${user.id}`}
                      className='bg-secondary p-2 rounded-lg'
                    >
                      Edit
                    </Link>
                  </Button>

                  <DeleteDialog id={user.id} action={deleteUser} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {totalPages && totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} />
        )}
      </div>
    </div>
  );
};

export default AdminUserPage;
