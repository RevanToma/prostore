'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signInDefaultValues } from '@/lib/constants';
import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { signInWithCredentials } from '@/lib/actions/user.actions';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const CredentialsSignInForm = () => {
  const [data, action] = useActionState(signInWithCredentials, {
      success: false,
      message: '',
    }),
    searchParams = useSearchParams(),
    callbackUrl = searchParams.get('callbackUrl') || '/';

  const SignInButton = () => {
    const { pending } = useFormStatus();

    return (
      <Button variant={'default'} className='w-full' disabled={pending}>
        {pending ? 'Signin In...' : 'Sign In'}
      </Button>
    );
  };

  useEffect(() => {
    if (data.success) {
      window.location.href = '/';
    }
  }, [data.success]);

  return (
    <form action={action}>
      <input type='hidden' name='callbackUrl' value={callbackUrl} />
      <div className='space-y-6'>
        <div className='space-y-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            type='email'
            id='email'
            name='email'
            required
            autoComplete='email'
            defaultValue={signInDefaultValues.email}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='password'>Password</Label>
          <Input
            type='password'
            id='password'
            name='password'
            required
            autoComplete='password'
            defaultValue={signInDefaultValues.password}
          />
        </div>
        <div>
          <SignInButton />
        </div>
        {data && !data.success && (
          <div className='text-center text-destructive'>{data.message}</div>
        )}
        <div className='text-sm text-center text-muted-foreground'>
          Don&apos;t have an account ?{' '}
          <Link href='/sign-up' target='_self' className='link'>
            Sign Up
          </Link>
        </div>
      </div>
    </form>
  );
};

export default CredentialsSignInForm;
