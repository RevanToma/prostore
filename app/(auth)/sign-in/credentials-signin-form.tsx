'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signInDefaultValues } from '@/lib/constants';
import { useActionState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { signInWithCredentials } from '@/lib/actions/user.actions';
import Link from 'next/link';

const CredentialsSignInForm = () => {
  const [data, action] = useActionState(signInWithCredentials, {
    success: false,
    message: '',
  });

  const SignInButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button variant={'default'} className='w-full' disabled={pending}>
        {pending ? 'Signin In...' : 'Sign In'}
      </Button>
    );
  };
  return (
    <form action={action}>
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
