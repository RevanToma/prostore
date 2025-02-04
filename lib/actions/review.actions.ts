'use server';

import { z } from 'zod';
import { insertReviewSchema } from '../validators';
import { formatError } from '../utils';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/db/prisma';

export const upsertReview = async (
  data: z.infer<typeof insertReviewSchema>
) => {
  try {
    const session = await auth();

    if (!session) {
      throw new Error('You need to be authenticated to review a product');
    }

    const review = insertReviewSchema.parse({
      ...data,
      userId: session.user.id,
    });

    const product = await prisma.product.findFirst({
      where: { id: review.productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const existingReview = await prisma.review.findFirst({
      where: { productId: review.productId, userId: review.userId },
    });

    await prisma.$transaction(async (tx) => {
      if (existingReview) {
        await tx.review.update({
          where: { id: existingReview.id },
          data: {
            title: review.title,
            description: review.description,
            rating: review.rating,
          },
        });
      } else {
        await tx.review.create({ data: review });
      }

      const averageRating = await tx.review.aggregate({
          _avg: { rating: true },
          where: { productId: review.productId },
        }),
        numReviews = await tx.review.count({
          where: { productId: review.productId },
        });

      await tx.product.update({
        where: { id: review.productId },
        data: {
          rating: averageRating._avg.rating || 0,
          numReviews,
        },
      });
    });
    revalidatePath(`/product/${product.slug}`);

    return { success: true, message: 'Review submitted successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

export const getReviews = async ({ productId }: { productId: string }) => {
  const data = await prisma.review.findMany({
    where: { productId },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return { data };
};

export const getReviewByProductId = async ({
  productId,
}: {
  productId: string;
}) => {
  const session = await auth();

  if (!session) {
    throw new Error('You need to be authenticated to review a product');
  }

  return await prisma.review.findFirst({
    where: { productId, userId: session.user.id },
  });
};
