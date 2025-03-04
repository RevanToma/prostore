import React from 'react';
import { auth } from '@/auth';
import { Metadata } from 'next';
import { ShippingAddress } from '@/types';
import { getMyCart } from '@/lib/actions/cart.action';
import { redirect } from 'next/navigation';
import { getUserById } from '@/lib/actions/user.actions';
import ShippingAddressForm from './shipping-address-form';
import CheckoutSteps from '@/components/shared/checkout-steps';

export const metadata: Metadata = {
  title: 'Shipping Address',
};

const ShippingAddressPage = async () => {
  const cart = await getMyCart();

  if (!cart || cart.items.length === 0) redirect('/cart');

  const session = await auth(),
    userId = session?.user?.id;

  if (!userId) {
    const currentPath = encodeURIComponent('/shipping-address');

    redirect(`/sign-in?callbackUrl=${currentPath}`);
  }

  const user = await getUserById(userId);

  return (
    <>
      <CheckoutSteps current={1} />
      <ShippingAddressForm address={user.address as ShippingAddress} />
    </>
  );
};

export default ShippingAddressPage;
