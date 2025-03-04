import DealCountdown from '@/components/deal-countdown';
import IconBoxes from '@/components/icon-boxes';
import ProductCarousel from '@/components/shared/prodoct/product-carousel';
import ProductList from '@/components/shared/prodoct/product-list';
import ViewAllProdBtn from '@/components/view-all-products-btn';
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
      <ViewAllProdBtn />
      <DealCountdown />
      <IconBoxes />
    </>
  );
}

export default HomePage;
