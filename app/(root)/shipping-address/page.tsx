import React from 'react';
import { auth } from '@/auth';
import { Metadata } from 'next';
import { ShippingAddress } from '@/types';
import { getMyCart } from '@/lib/actions/cart.action';
import { redirect } from 'next/navigation';
import { getUserById } from '@/lib/actions/user.actions';
import ShippingAddressForm from './shipping-address-form';

export const metadata: Metadata = {
  title: 'Shipping Address',
};

export const ShippingAddressPage = async () => {
  const cart = await getMyCart();

  if (!cart || cart.items.length === 0) redirect('/cart');

  const session = await auth(),
    userId = session?.user?.id;

  if (!userId) throw new Error('No user ID');

  const user = await getUserById(userId);

  return <ShippingAddressForm address={user.address as ShippingAddress} />;
};

export default ShippingAddressPage;
