'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { convertToPlainObj, formatError } from '../utils';
import { auth } from '@/auth';
import { getMyCart } from './cart.action';
import { getUserById } from './user.actions';
import { insertOrderSchema } from '../validators';
import { prisma } from '@/db/prisma';
import { CartItem } from '@/types';

export const createOrder = async () => {
  try {
    const session = await auth();

    if (!session) throw new Error('User not authenticated');
    const cart = await getMyCart(),
      userId = session?.user?.id;

    if (!userId) throw new Error('User not found');

    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: ' Your cart is empty',
        redirectTo: '/cart',
      };
    }
    if (!user.address) {
      return {
        success: false,
        message: 'No shipping address',
        redirectTo: '/shipping-address',
      };
    }
    if (!user.paymentMethod) {
      return {
        success: false,
        message: 'No payment method',
        redirectTo: '/payment-method',
      };
    }

    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    const insertedOrderId = await prisma.$transaction(async (tx) => {
      const indertedOrder = await tx.order.create({ data: order });

      for (const item of cart.items as CartItem[]) {
        await tx.orderItem.create({
          data: {
            ...item,
            price: item.price,
            orderId: indertedOrder.id,
          },
        });
      }
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          taxPrice: 0,
          shippingPrice: 0,
          itemsPrice: 0,
        },
      });
      return indertedOrder.id;
    });

    if (!insertedOrderId) throw new Error('Failed to create order');

    return {
      success: true,
      message: ' Order created',
      redirectTo: `order/${insertedOrderId}`,
    };
  } catch (error) {
    if (isRedirectError(error)) {
      return { success: false, message: formatError(error) };
    }
  }
};

export const getOrderById = async (orderId: string) => {
  const session = await auth();

  try {
    if (!session) throw new Error('User not authenticated');

    const order = await prisma.order.findFirst({
      where: { id: orderId },
      include: {
        orderitems: true,
        user: { select: { name: true, email: true } },
      },
    });

    if (!order) throw new Error('Order not found');

    return convertToPlainObj(order);
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};
