'use server';
import {
  shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
  paymentMethodSchema,
  updateProfileSchema,
  updateUserSchema,
} from '../validators';
import { auth, signIn, signOut } from '@/auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { hashSync } from 'bcrypt-ts-edge';
import { prisma } from '@/db/prisma';
import { formatError } from '../utils';
import { ShippingAddress } from '@/types';
import { z } from 'zod';
import { PAGE_SIZE } from '../constants';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

export const signInWithCredentials = async (
  prevState: unknown,
  formDate: FormData
) => {
  try {
    const user = signInFormSchema.parse({
      email: formDate.get('email'),
      password: formDate.get('password'),
    });

    await signIn('credentials', {
      email: user.email,
      password: user.password,
    });

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
};

export const signUpUser = async (prevState: unknown, formData: FormData) => {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    });
    const plainPassword = user.password;
    user.password = hashSync(user.password, 10);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        emailVerified: new Date(),
      },
    });

    await signIn('credentials', {
      email: user.email,
      password: plainPassword,
    });

    return { success: true, message: 'Signed up successfully' };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: formatError(error) };
  }
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

export const updateUserAddress = async (data: ShippingAddress) => {
  try {
    const session = await auth(),
      currentUser = await prisma.user.findFirst({
        where: { id: session?.user?.id },
      });

    if (!currentUser) throw new Error('User not found');

    const address = shippingAddressSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { address },
    });

    return { success: true, message: 'Address updated successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

export const updateUserPaymentMethod = async (
  data: z.infer<typeof paymentMethodSchema>
) => {
  try {
    const session = await auth(),
      currentUser = await prisma.user.findFirst({
        where: { id: session?.user?.id },
      });

    if (!currentUser) throw new Error('User not found');

    const paymentMethod = paymentMethodSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { paymentMethod: paymentMethod.type },
    });

    return { success: true, message: 'Payment method updated successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

export const updateUserProfile = async (
  data: z.infer<typeof updateProfileSchema>
) => {
  try {
    const session = await auth(),
      currentUser = await prisma.user.findFirst({
        where: { id: session?.user?.id },
      });

    if (!currentUser) throw new Error('User not found');

    const profile = updateProfileSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { name: profile.name, email: profile.email },
    });

    return { success: true, message: 'Profile updated successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

export const getAllUsers = async ({
  limit = PAGE_SIZE,
  page = 1,
  query,
}: {
  limit?: number;
  page: number;
  query: string;
}) => {
  const queryFilter: Prisma.UserWhereInput =
    query && query !== 'all'
      ? {
          name: {
            contains: query,
            mode: 'insensitive',
          } as Prisma.StringFilter,
        }
      : {};

  try {
    const users = await prisma.user.findMany({
        where: { ...queryFilter },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      dataCount = await prisma.user.count();

    return {
      data: users,
      totalPages: Math.ceil(dataCount / limit),
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

export const deleteUser = async (id: string) => {
  try {
    await prisma.user.delete({ where: { id } });

    revalidatePath('/admin/users');
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

export const updateUser = async (user: z.infer<typeof updateUserSchema>) => {
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        role: user.role,
      },
    });

    revalidatePath('/admin/users');

    return { success: true, message: 'User updated successfully', user };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};
