import { auth } from '@/auth';
import { getUserById } from '@/lib/actions/user.actions';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import React from 'react';
import PaymentMethodForm from './payment-method-form';
import CheckoutSteps from '@/components/shared/checkout-steps';

export const metadata: Metadata = {
  title: 'Select Payment Method',
};

const PaymentMethodPAge = async () => {
  const session = await auth(),
    userId = session?.user?.id;

  if (!userId) {
    return redirect('/sign-in');
  }
  const user = await getUserById(userId);

  return (
    <div>
      <CheckoutSteps current={2} />
      <PaymentMethodForm prefPaymentMethod={user.paymentMethod} />
    </div>
  );
};

export default PaymentMethodPAge;
