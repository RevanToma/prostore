import Link from 'next/link';
import { getAllProducts, deleteProduct } from '@/lib/actions/product.actions';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatId } from '@/lib/utils';
import Pagination from '@/components/shared/pagination';
import DeleteDialog from '@/components/shared/delete-dialog';

const AdminProductsPage = async (props: {
  searchParams: Promise<{ page: string; query: string; category: string }>;
}) => {
  const searchParams = await props.searchParams,
    page = Number(searchParams.page) || 1,
    searchText = searchParams.query || '',
    category = searchParams.category || '';

  const { data, totalPages } = await getAllProducts({
    query: searchText,
    page,
    category,
  });

  return (
    <div className='space-y-2'>
      <div className='flex-between'>
        <div className='flex-items-center gap-3'>
          <h1 className='h2-bold'>Products</h1>
          {searchText && (
            <div>
              Filtered by <i>&quot;{searchText}&quot;</i>{' '}
              <Link href={'/admin/products'}>
                <Button variant={'outline'} size={'sm'}>
                  Remove Filter
                </Button>
              </Link>
            </div>
          )}
        </div>

        <Button asChild variant={'default'}>
          <Link href={'/admin/products/create'}>Create Product</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>NAME</TableHead>
            <TableHead className='text-right'>PRICE</TableHead>
            <TableHead>CATEGORY</TableHead>
            <TableHead>STOCK</TableHead>
            <TableHead>RATING</TableHead>
            <TableHead>isFeatured</TableHead>
            <TableHead className='w-[100px]'>ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{formatId(product.id)}</TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell className='text-right'>
                {formatCurrency(product.price)}
              </TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>{product.rating}</TableCell>
              {product.isFeatured && <TableCell>Yes</TableCell>}
              {!product.isFeatured && <TableCell>No</TableCell>}
              <TableCell className='flex gap-1'>
                <Button asChild variant={'outline'} size={'sm'}>
                  <Link href={`/admin/products/${product.id}`}>Edit</Link>
                </Button>

                <DeleteDialog id={product.id} action={deleteProduct} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} />}
    </div>
  );
};

export default AdminProductsPage;
