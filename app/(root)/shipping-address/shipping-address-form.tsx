'use client';

import { useToast } from '@/hooks/use-toast';
import { shippingAddressDefaultValues } from '@/lib/constants';
import { shippingAddressSchema } from '@/lib/validators';
import { ShippingAddress } from '@/types';
import { useRouter } from 'next/navigation';
import { ControllerRenderProps, useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader } from 'lucide-react';
import { updateUserAddress } from '@/lib/actions/user.actions';

const ShippingAddressForm = ({ address }: { address: ShippingAddress }) => {
  const router = useRouter(),
    { toast } = useToast(),
    form = useForm<z.infer<typeof shippingAddressSchema>>({
      resolver: zodResolver(shippingAddressSchema),
      defaultValues: address || shippingAddressDefaultValues,
    }),
    [isPending, startTransition] = useTransition();

  const onSubmit: SubmitHandler<z.infer<typeof shippingAddressSchema>> = async (
    values
  ) => {
    startTransition(async () => {
      const { success, message } = await updateUserAddress(values);

      if (!success) {
        toast({
          variant: 'destructive',
          description: message,
        });
        return;
      }

      router.push('/payment-method');
    });
  };
  return (
    <div className='max-w-md mx-auto space-y-4'>
      <h1 className='h2-bold mt-4'>Shipping Address</h1>
      <p className='text-sm text-muted-foreground'>
        Please enter an address to ship to
      </p>
      <Form {...form}>
        <form
          action={'post'}
          className='space-y-4'
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className='flex flex-col md:flex-row gap-5'>
            <FormField
              control={form.control}
              name='fullName'
              render={({
                field,
              }: {
                field: ControllerRenderProps<
                  z.infer<typeof shippingAddressSchema>,
                  'fullName'
                >;
              }) => (
                <FormItem className='w-full'>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter full name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
          </div>
          <div className='flex flex-col md:flex-row gap-5'>
            <FormField
              control={form.control}
              name='streetAddress'
              render={({
                field,
              }: {
                field: ControllerRenderProps<
                  z.infer<typeof shippingAddressSchema>,
                  'streetAddress'
                >;
              }) => (
                <FormItem className='w-full'>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter Address' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
          </div>
          <div className='flex flex-col md:flex-row gap-5'>
            <FormField
              control={form.control}
              name='city'
              render={({
                field,
              }: {
                field: ControllerRenderProps<
                  z.infer<typeof shippingAddressSchema>,
                  'city'
                >;
              }) => (
                <FormItem className='w-full'>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter City' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
          </div>
          <div className='flex flex-col md:flex-row gap-5'>
            <FormField
              control={form.control}
              name='postalCode'
              render={({
                field,
              }: {
                field: ControllerRenderProps<
                  z.infer<typeof shippingAddressSchema>,
                  'postalCode'
                >;
              }) => (
                <FormItem className='w-full'>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter Postal Code' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
          </div>
          <div className='flex flex-col md:flex-row gap-5'>
            <FormField
              control={form.control}
              name='country'
              render={({
                field,
              }: {
                field: ControllerRenderProps<
                  z.infer<typeof shippingAddressSchema>,
                  'country'
                >;
              }) => (
                <FormItem className='w-full'>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter Country' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
          </div>
          <div className='flex gap-2 '>
            <Button type='submit' disabled={isPending} className='w-full'>
              {isPending ? (
                <Loader className='w-4 h-4 animate-spin' />
              ) : (
                <ArrowRight className='w-4 h-4' />
              )}
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ShippingAddressForm;
