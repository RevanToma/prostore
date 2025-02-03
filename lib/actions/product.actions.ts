'use server';
import { convertToPlainObj, formatError } from '../utils';
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from '../constants';
import { prisma } from '@/db/prisma';
import { revalidatePath } from 'next/cache';
import { insertProductSchema, updateProductSchema } from '../validators';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

export const getLatestProducts = async () => {
  const products = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return convertToPlainObj(products);
};

export const getProductBySlug = async (slug: string) => {
  return await prisma.product.findFirst({
    where: {
      slug,
    },
  });
};

export const getProductById = async (productId: string) => {
  const data = await prisma.product.findFirst({
    where: { id: productId },
  });

  return convertToPlainObj(data);
};

export const getAllProducts = async ({
  query,
  limit = PAGE_SIZE,
  page,
  category,
}: {
  query: string;
  limit?: number;
  page: number;
  category?: string;
}) => {
  const whereClause: Prisma.ProductWhereInput = {};

  if (query) {
    whereClause.OR = [
      { name: { contains: query, mode: 'insensitive' } }, // Case-insensitive name search
      { category: { contains: query, mode: 'insensitive' } }, // Case-insensitive category search
    ];
  }

  if (category) {
    whereClause.category = category;
  }

  const data = await prisma.product.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  const dataCount = await prisma.product.count({
    where: whereClause,
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
};

export const deleteProduct = async (id: string) => {
  try {
    const productExist = await prisma.product.findFirst({
      where: {
        id,
      },
    });

    if (!productExist) throw new Error('Product not found');

    await prisma.product.delete({
      where: {
        id,
      },
    });

    revalidatePath('/admin/products');

    return { success: true, message: 'Product deleted successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

export const createProduct = async (
  data: z.infer<typeof insertProductSchema>
) => {
  try {
    const product = insertProductSchema.parse(data);

    await prisma.product.create({
      data: product,
    });

    revalidatePath('/admin/products');

    return { success: true, message: 'Product created successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

export const updateProduct = async (
  data: z.infer<typeof updateProductSchema>
) => {
  try {
    const product = updateProductSchema.parse(data),
      prodExist = await prisma.product.findFirst({
        where: {
          id: product.id,
        },
      });

    if (!prodExist) throw new Error('Product not found');

    await prisma.product.update({
      where: { id: product.id },
      data: product,
    });

    revalidatePath('/admin/products');

    return { success: true, message: 'Product updated successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};
