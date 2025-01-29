import { addItemToCart, removeItemFromCart } from '@/lib/actions/cart.action';
import { useToast } from './use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useTransition } from 'react';
import { CartItem } from '@/types';
import { useRouter } from 'next/navigation';

export const useCartAction = () => {
  const { toast } = useToast(),
    [isPending, startTransition] = useTransition(),
    router = useRouter();

  const handleAddToCart = async (item: CartItem) => {
    startTransition(async () => {
      const { success, message } = await addItemToCart(item);

      if (!success) {
        toast({
          variant: 'destructive',
          description: message,
        });
        return;
      }

      toast({
        description: message,
        action: (
          <ToastAction
            className='bg-primary dark:bg-gray-800 text-white hover:bg-gray-700'
            altText='Go To Cart'
            onClick={() => router.push('/cart')}
          >
            Go To Cart
          </ToastAction>
        ),
      });
    });
  };

  const handleRemoveFromCart = async (itemId: string) => {
    startTransition(async () => {
      const { success, message } = await removeItemFromCart(itemId);

      toast({
        variant: success ? 'default' : 'destructive',
        description: message,
      });
      return;
    });
  };

  return { handleAddToCart, handleRemoveFromCart, isPending };
};
