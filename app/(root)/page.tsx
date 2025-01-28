import ProductList from '@/components/shared/prodoct/product-list';
import sampleData from '@/db/sample-data';
import React from 'react';

function HomePage() {
  return (
    <>
      <ProductList
        data={sampleData.products}
        title='Newest arrivel'
        limit={4}
      />
    </>
  );
}

export default HomePage;
