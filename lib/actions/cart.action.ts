'use server';

import { Cart, CartItem } from '@/types';
import { convertToPlainObj, formatError, round2 } from '../utils';
import { cookies } from 'next/headers';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import { cartItemSchema, insertCartSchema } from '../validators';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
    items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
  );

  const shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    taxPrice = round2(0.15 * itemsPrice),
    totalPrice = round2(itemsPrice + taxPrice + shippingPrice);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

export const addItemToCart = async (data: CartItem) => {
  try {
    const sessionCartId =
      ((await cookies()).get('sessionCartId')?.value as string) || '';

    if (!sessionCartId) throw new Error('Cart Session not found');

    const session = await auth(),
      userId = session?.user?.id ? (session.user.id as string) : undefined,
      cart = await getMyCart(),
      item = cartItemSchema.parse(data),
      product = await prisma.product.findFirst({
        where: { id: item.productId },
      });

    if (!product) throw new Error('Product not found');

    if (!cart) {
      const newCart = await insertCartSchema.parse({
        userId: userId,
        items: [item],
        sessionCartId: sessionCartId,
        ...calcPrice([item]),
      });

      await prisma.cart.create({ data: newCart });

      revalidatePath(`/product/${product.slug}`);
      return {
        success: true,
        message: `${product.name} added to cart`,
      };
    } else {
      // check if its the same product then update the quantity
      const existingItem = (cart.items as CartItem[]).find(
        (x) => x.productId === item.productId
      );
      if (existingItem) {
        if (product.stock < existingItem.qty + 1) {
          throw new Error('Product out of stock');
        }

        (cart.items as CartItem[]).find(
          (x) => x.productId === item.productId
        )!.qty = existingItem.qty + 1;
      } else {
        if (product.stock < 1) throw new Error('Product out of stock');
        cart.items.push(item);
      }
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calcPrice(cart.items as CartItem[]),
        },
      });

      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} ${
          existingItem ? 'updated' : 'added'
        } to cart`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
};

export const getMyCart = async () => {
  const sessionCartId =
    ((await cookies()).get('sessionCartId')?.value as string) || '';

  if (!sessionCartId) throw new Error('Cart Session not found');

  const session = await auth(),
    userId = session?.user?.id ? (session.user.id as string) : undefined,
    cart = await prisma.cart.findFirst({
      where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
    });

  if (!cart) return undefined;

  return convertToPlainObj({
    ...cart,
    items: cart.items as CartItem[],
    ...calcPrice(cart.items as CartItem[]),
  });
};

export const removeItemFromCart = async (productId: string) => {
  try {
    const sessionCartId =
      ((await cookies()).get('sessionCartId')?.value as string) || '';

    if (!sessionCartId) throw new Error('Cart Session not found');

    const product = await prisma.product.findFirst({
      where: { id: productId },
    });

    if (!product) throw new Error('Product not found');

    const cart = await getMyCart();

    if (!cart) throw new Error('Cart not found');

    const existingItem = (cart.items as CartItem[]).find(
      (x) => x.productId === productId
    );

    if (!existingItem) throw new Error('Item not found in cart');

    if (existingItem.qty === 1) {
      cart.items = (cart.items as CartItem[]).filter(
        (x) => x.productId !== existingItem.productId
      );
    } else {
      (cart.items as CartItem[]).find((x) => x.productId === productId)!.qty =
        existingItem.qty - 1;
    }

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...calcPrice(cart.items as CartItem[]),
      },
    });

    revalidatePath(`/product/${product.slug}`);
    return {
      success: true,
      message: `${product.name} removed from cart`,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
};
