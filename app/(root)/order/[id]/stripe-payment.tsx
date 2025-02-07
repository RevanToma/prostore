import { FC, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { SERVER_URL } from '@/lib/constants';

type StripePaymentProps = {
  priceInCents: number;
  orderId: string;
  clientSecret: string;
};
const StripePayment: FC<StripePaymentProps> = ({
  clientSecret,
  orderId,
  priceInCents,
}) => {
  const stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHIER_KEY as string
    ),
    { theme, systemTheme } = useTheme();

  const StripeForm = () => {
    const stripe = useStripe(),
      elements = useElements();

    const [isLoading, setIsLoading] = useState(false),
      [errorMsg, setErrorMsg] = useState(''),
      [email, setEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (stripe == null || elements == null || email == null) return;

      setIsLoading(true);

      stripe
        .confirmPayment({
          elements,
          confirmParams: {
            return_url: `${SERVER_URL}/order/${orderId}/stripe-payment-success`,
          },
        })
        .then(({ error }) => {
          if (
            error?.type === 'card_error' ||
            error?.type === 'validation_error'
          ) {
            setErrorMsg(error.message ?? 'An error occurred');
          } else if (error) {
            setErrorMsg('An error occurred');
          }
        })
        .finally(() => setIsLoading(false));
    };

    return (
      <form className='space-y-4' onSubmit={handleSubmit}>
        <div className='text-xl'>Stripe Checkout</div>
        {errorMsg && <div className='text-destructive'>{errorMsg}</div>}
        <PaymentElement />
        <div>
          <LinkAuthenticationElement
            onChange={(e) => setEmail(e.value.email)}
          />
        </div>
        <Button
          className='w-full'
          size={'lg'}
          disabled={stripe == null || elements == null || isLoading}
        >
          {isLoading
            ? 'Purchasing...'
            : `Purchase ${formatCurrency(priceInCents / 100)}`}
        </Button>
      </form>
    );
  };

  return (
    <Elements
      options={{
        clientSecret,
        appearance: {
          theme:
            theme === 'dark'
              ? 'night'
              : theme === 'light'
              ? 'stripe'
              : systemTheme === 'light'
              ? 'stripe'
              : 'night',
        },
      }}
      stripe={stripePromise}
    >
      <StripeForm />
    </Elements>
  );
};

export default StripePayment;
