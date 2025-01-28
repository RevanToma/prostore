import ProductList from '@/components/shared/prodoct/product-list';
import { getLatestProducts } from '@/lib/actions/product.actions';
import React from 'react';

async function HomePage() {
  const latestProducts = await getLatestProducts();
  return (
    <>
      <ProductList data={latestProducts} title='Newest arrivel' limit={4} />
    </>
  );
}

export default HomePage;
