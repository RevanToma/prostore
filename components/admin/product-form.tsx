'use client';
import { useToast } from '@/hooks/use-toast';
import { productDefaultValues } from '@/lib/constants';
import { Product } from '@/types';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { ControllerRenderProps, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { insertProductSchema, updateProductSchema } from '@/lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import slugify from 'slugify';
import { createProduct, updateProduct } from '@/lib/actions/product.actions';

type ProductFormProps = {
  type: 'Create' | 'Update';
  product?: Product;
  productId?: string;
};

const ProductForm: FC<ProductFormProps> = ({ type, product, productId }) => {
  const router = useRouter(),
    { toast } = useToast(),
    form = useForm<z.infer<typeof insertProductSchema>>({
      resolver:
        type === 'Update'
          ? zodResolver(updateProductSchema)
          : zodResolver(insertProductSchema),
      defaultValues:
        product && type === 'Update' ? product : productDefaultValues,
    });

  const onSubmit: SubmitHandler<z.infer<typeof insertProductSchema>> = async (
    values
  ) => {
    if (type === 'Create') {
      const { message, success } = await createProduct(values);

      if (!success) {
        toast({
          variant: 'destructive',
          description: message,
        });
      } else {
        toast({
          description: message,
        });

        router.push('/admin/products');
      }
    }

    if (type === 'Update') {
      if (!productId) {
        router.push('/admin/products');
        return;
      }

      const { message, success } = await updateProduct({
        ...values,
        id: productId,
      });

      if (!success) {
        toast({
          variant: 'destructive',
          description: message,
        });
      } else {
        toast({
          description: message,
        });

        router.push('/admin/products');
      }
    }
  };
  return (
    <Form {...form}>
      <form
        method='post'
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-8'
      >
        <div className='flex flex-col md:flex-row gap-5'>
          {/* NAME */}
          <FormField
            control={form.control}
            name='name'
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                'name'
              >;
            }) => (
              <FormItem className='w-full'>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='Enter product name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* SLUG */}
          <FormField
            control={form.control}
            name='slug'
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                'slug'
              >;
            }) => (
              <FormItem className='w-full'>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Input placeholder='Enter slug' {...field} />
                    <Button
                      onClick={() => {
                        form.setValue(
                          'slug',
                          slugify(form.getValues('name'), { lower: true })
                        );
                      }}
                      type='button'
                      className='bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 mt-2'
                    >
                      Generate
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>{' '}
        <div className='flex flex-col md:flex-row gap-5'>
          {/* CATEGORY */}
          <FormField
            control={form.control}
            name='category'
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                'category'
              >;
            }) => (
              <FormItem className='w-full'>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='Enter category' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* BRANND */}
          <FormField
            control={form.control}
            name='brand'
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                'brand'
              >;
            }) => (
              <FormItem className='w-full'>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder='Enter brand' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>{' '}
        <div className='flex flex-col md:flex-row gap-5'>
          {/* PRICE */}
          <FormField
            control={form.control}
            name='price'
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                'price'
              >;
            }) => (
              <FormItem className='w-full'>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input placeholder='Enter Price' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* STOCK */}
          <FormField
            control={form.control}
            name='stock'
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                'stock'
              >;
            }) => (
              <FormItem className='w-full'>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input placeholder='Enter Stock' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='upload-field flex flex-col md:flex-row gap-5'>
          {/* IMAGES */}
        </div>
        <div className='upload-field'>{/* ISFEATIRED */}</div>
        <div>
          {/* DESCRIPTION */}
          <FormField
            control={form.control}
            name='description'
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                'description'
              >;
            }) => (
              <FormItem className='w-full'>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Enter product description'
                    {...field}
                    className='resize-none'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <Button
            type='submit'
            size={'lg'}
            disabled={form.formState.isSubmitting}
            className='button col-span-2 w-full'
          >
            {form.formState.isSubmitting ? 'Submitting...' : `${type} Product`}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
