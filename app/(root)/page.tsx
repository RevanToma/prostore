import ProductList from '@/components/shared/prodoct/product-list';
import { getLatestProducts } from '@/lib/actions/product.actions';

async function HomePage() {
  const latestProducts = await getLatestProducts();
  return (
    <>
      <ProductList data={latestProducts} title='Newest arrivel' limit={4} />
    </>
  );
}

export default HomePage;
