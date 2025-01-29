'use client';

import { Cart } from '@/types';
import { Minus, Plus, Loader } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useCartAction } from '@/hooks/use-cart-action';

const CartTable = ({ cart }: { cart?: Cart }) => {
  const { handleAddToCart, handleRemoveFromCart, isPending } = useCartAction();

  return (
    <>
      <h1 className='py-4 h2-bold'>Shopping Cart</h1>
      {!cart || cart.items.length === 0 ? (
        <div>
          Cart is empty. <Link href='/'>Go Shopping</Link>
        </div>
      ) : (
        <div className='grid md:grid-cols-4 md:gap-5'>
          <div className='overflow-x-auto md:col-span-3'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className='text-center'>Quantity</TableHead>
                  <TableHead className='text-right'>Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.items.map((item) => (
                  <TableRow key={item.slug}>
                    <TableCell>
                      <Link
                        href={`/product/${item.slug}`}
                        className='flex items-center'
                      >
                        <Image
                          src={item.image}
                          width={50}
                          height={50}
                          alt={item.name}
                        />
                        <span className='px-2'>{item.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell className='flex-center gap-2'>
                      <Button
                        disabled={isPending}
                        variant={'outline'}
                        type='button'
                        onClick={() => handleRemoveFromCart(item.productId)}
                      >
                        {isPending ? (
                          <Loader className='w-4 h-4 animate-spin' />
                        ) : (
                          <Minus className='h-4 w-4' />
                        )}
                      </Button>
                      <span>{item.qty}</span>
                      <Button
                        disabled={isPending}
                        variant={'outline'}
                        type='button'
                        onClick={() => handleAddToCart(item)}
                      >
                        {isPending ? (
                          <Loader className='w-4 h-4 animate-spin' />
                        ) : (
                          <Plus className='h-4 w-4' />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className='text-right'>${item.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </>
  );
};

export default CartTable;
