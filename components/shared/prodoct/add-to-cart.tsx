'use client';
import { Cart, CartItem } from '@/types';
import { Plus, Minus, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useCartAction } from '@/hooks/use-cart-action';

const AddToCart = ({ item, cart }: { item: CartItem; cart?: Cart }) => {
  const { handleAddToCart, handleRemoveFromCart, isPending } = useCartAction();

  const existItem =
    cart && cart.items.find((x) => x.productId === item.productId);

  return existItem ? (
    <div>
      <Button
        type='button'
        variant={'outline'}
        onClick={() => handleRemoveFromCart(item.productId)}
      >
        {isPending ? (
          <Loader className='w-4 h-4 animate-spin' />
        ) : (
          <Minus className='h-4 w-4' />
        )}
      </Button>
      <span className='px-2'>{existItem.qty}</span>
      <Button
        type='button'
        variant={'outline'}
        onClick={() => handleAddToCart(item)}
      >
        {isPending ? (
          <Loader className='w-4 h-4 animate-spin' />
        ) : (
          <Plus className='h-4 w-4' />
        )}
      </Button>
    </div>
  ) : (
    <Button
      className='w-full'
      type='button'
      onClick={() => handleAddToCart(item)}
    >
      {isPending ? (
        <Loader className='w-4 h-4 animate-spin' />
      ) : (
        <Plus className='h-4 w-4' />
      )}
      Add to Cart
    </Button>
  );
};

export default AddToCart;
