import { getUserById } from '@/lib/actions/user.actions';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import UpdateUserForm from './update-user-form';

export const metadata: Metadata = { title: 'Admin User Update Page' };

const AdminUserUpdatePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params,
    user = await getUserById(id);

  if (!user) notFound();

  return (
    <div className='space-y-8 max-w-lg mx-auto'>
      <h1 className='h2-bold'>Update User</h1>
      <UpdateUserForm user={user} />
    </div>
  );
};

export default AdminUserUpdatePage;
