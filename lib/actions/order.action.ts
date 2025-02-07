'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { convertToPlainObj, formatError } from '../utils';
import { auth } from '@/auth';
import { getMyCart } from './cart.action';
import { getUserById } from './user.actions';
import { insertOrderSchema } from '../validators';
import { prisma } from '@/db/prisma';
import { CartItem, PaymentResult } from '@/types';
import { paypal } from '../paypal';
import { revalidatePath } from 'next/cache';
import { PAGE_SIZE } from '../constants';
import { Prisma } from '@prisma/client';

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

export const createPayPalOrder = async (orderId: string) => {
  try {
    const order = await getOrderById(orderId);

    if (!order) throw new Error('Order not found');

    const payPalOrder = await paypal.createOrder(Number(order.totalPrice));

    if (!payPalOrder) throw new Error('Failed to create payment');

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentResult: {
          id: payPalOrder.id,
          email_address: '',
          status: '',
          pricePaid: 0,
        },
      },
    });

    return {
      success: true,
      message: 'Payment created successfully',
      data: payPalOrder.id,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

export const approvePayPalOrder = async (
  orderId: string,
  data: { orderID: string }
) => {
  try {
    const order = await getOrderById(orderId);

    if (!order) throw new Error('Order not found');

    const captureData = await paypal.capturePayment(data.orderID);

    if (
      !captureData ||
      captureData.id !== (order.paymentResult as PaymentResult)?.id ||
      captureData.status !== 'COMPLETED'
    ) {
      throw new Error('Failed to capture payment');
    }

    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        status: captureData.status,
        email_address: captureData.payer.email_address,
        pricePaid:
          captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
      },
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: 'Your order has been paid',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};
export const updateOrderToPaid = async ({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) => {
  console.log('🛠 Updating order:', { orderId, paymentResult });

  const order = await getOrderById(orderId);

  if (!order) throw new Error(`Order with ID ${orderId} not found`);

  if (order.isPaid) return order;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          isPaid: true,
          paidAt: new Date(),
          paymentResult,
        },
      });
    });

    const updatedOrder = await getOrderById(orderId);
    if (!updatedOrder) throw new Error(`Failed to update order ${orderId}`);

    console.log('✅ Order successfully updated:', updatedOrder.id);
    return updatedOrder;
  } catch (error) {
    console.error('❌ Order update failed:', error);
    throw error;
  }
};

export const getMyOrders = async ({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) => {
  const session = await auth();

  try {
    if (!session) throw new Error('User not authenticated');

    const userId = session?.user?.id;
    const data = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    });

    const dataCount = await prisma.order.count({
      where: { userId },
    });

    return {
      data,
      totalPages: Math.ceil(dataCount / limit),
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

export const getOrderSummary = async () => {
  const ordersCount = await prisma.order.count(),
    productsCount = await prisma.product.count(),
    usersCount = await prisma.user.count(),
    totalSales = await prisma.order.aggregate({
      _sum: { totalPrice: true },
    });

  const salesDataRaw = await prisma.$queryRaw<
    Array<{ month: string; totalSales: Prisma.Decimal }>
  >`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY')`;

  const salesData = salesDataRaw.map((entry) => ({
    month: entry.month,
    totalSales: Number(entry.totalSales),
  }));

  const latestSale = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true },
      },
    },
    take: 6,
  });

  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    salesData,
    latestSale,
  };
};

export const getAllOrders = async ({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query: string;
}) => {
  const queryFilter: Prisma.OrderWhereInput =
    query && query !== 'all'
      ? {
          user: {
            name: {
              contains: query,
              mode: 'insensitive',
            } as Prisma.StringFilter,
          },
        }
      : {};

  const data = await prisma.order.findMany({
    where: { ...queryFilter },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: (page - 1) * limit,
    include: {
      user: { select: { name: true } },
    },
  });

  const dataCount = await prisma.order.count();

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
};

export const deleteOrder = async (orderId: string) => {
  try {
    await prisma.order.delete({ where: { id: orderId } });

    revalidatePath('/admin/orders');

    return {
      success: true,
      message: 'Order deleted',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

// update COD order to paid

export const updateOrderToPaidCOD = async (orderId: string) => {
  try {
    await updateOrderToPaid({ orderId });
    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: 'Order marked as Paid',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

export const deliverOrder = async (orderId: string) => {
  try {
    const order = await getOrderById(orderId);

    if (!order) throw new Error('Order not found');
    if (!order.isPaid) throw new Error('Order not paid');
    if (order.isDelivered) throw new Error('Order already delivered');

    await prisma.order.update({
      where: { id: orderId },
      data: {
        isDelivered: true,
        deliveredAt: new Date(),
      },
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: 'Order marked as delivered',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};
