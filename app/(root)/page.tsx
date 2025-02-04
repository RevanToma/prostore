import ProductCarousel from '@/components/shared/prodoct/product-carousel';
import ProductList from '@/components/shared/prodoct/product-list';
import {
  getFeaturedProducts,
  getLatestProducts,
} from '@/lib/actions/product.actions';

async function HomePage() {
  const latestProducts = await getLatestProducts(),
    featuredProducts = await getFeaturedProducts();

  return (
    <>
      {featuredProducts.length > 0 && (
        <ProductCarousel data={featuredProducts} />
      )}
      <ProductList data={latestProducts} title='Newest arrivel' limit={10} />
    </>
  );
}

export default HomePage;
