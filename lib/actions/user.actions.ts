'use server';
import { signInFormSchema } from '../validators';
import { signIn, signOut } from '@/auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

export const signInWithCredentials = async (
  prevState: unknown,
  formDate: FormData
) => {
  try {
    const user = signInFormSchema.parse({
      email: formDate.get('email'),
      password: formDate.get('password'),
    });

    await signIn('credentials', user);

    return { success: true, message: 'Signed in successfully' };
  } catch (error) {
    if (isRedirectError(error)) {
      return { success: false, message: 'Invalid credentials' };
    }
    return { success: false, message: 'Invalid Credentials' };
  }
};

export const signOutUser = async () => {
  await signOut();
  return { success: true, message: 'Signed out successfully' };
};
