import { auth } from '@/auth';
import AddToCart from '@/components/shared/prodoct/add-to-cart';
import ProductImages from '@/components/shared/prodoct/product-images';
import ProductPrice from '@/components/shared/prodoct/product-price';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getMyCart } from '@/lib/actions/cart.action';
import { getProductBySlug } from '@/lib/actions/product.actions';
import { notFound } from 'next/navigation';
import ReviewList from './review-list';
import Rating from '@/components/rating';

const ProductDetailsPage = async (props: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await props.params,
    product = await getProductBySlug(slug),
    session = await auth(),
    userId = session?.user.id;

  if (!product) notFound();

  const cart = await getMyCart();

  return (
    <>
      <section>
        <div className='grid grid-cols-1 md:grid-cols-5 gap-6'>
          <div className='col-span-2'>
            <ProductImages images={product.images} />
          </div>
          <div className='col-span-2 p-5'>
            <div className='flex flex-col gap-6'>
              <p>
                {product.brand} {product.category}
              </p>
              <h1 className='h3-bold'>{product.name}</h1>
              <Rating value={Number(product.rating)} />
              <p>{product.numReviews} reviews</p>
              <div className='flex flex-col sm:flex-row sm:items-center gap-3'>
                <ProductPrice
                  value={Number(product.price)}
                  className='w-24 rounded-full bg-green-100 text-green-700 px-5 py-2'
                />
              </div>
            </div>
            <div className='mt-10'>
              <p className='font-semibold'>Description</p>
              <p>{product.description}</p>
            </div>
          </div>

          <div className='col-span-1 flex items-start'>
            <Card className='w-full'>
              <CardContent className='p-4'>
                <div className='mb-2 flex justify-between'>
                  <div>Price</div>
                  <div>
                    <ProductPrice value={Number(product.price)} />
                  </div>
                </div>
                <div className='mb-2 flex justify-between'>
                  <div>Status</div>
                  {product.stock > 0 ? (
                    <Badge variant='outline'>In Stock</Badge>
                  ) : (
                    <Badge variant='destructive'>Out Of Stock</Badge>
                  )}
                </div>
                {product.stock > 0 && (
                  <div className='flex-center'>
                    <AddToCart
                      cart={cart}
                      item={{
                        productId: product.id,
                        name: product.name,
                        slug: product.slug,
                        image: product.images![0],
                        qty: 1,
                        price: product.price,
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <section className='mt-10'>
        <h2 className='h2-bold mb-3'>Customer Reviews</h2>
        <ReviewList
          userId={userId || ''}
          productId={product.id}
          productSlug={product.slug}
        />
      </section>
    </>
  );
};

export default ProductDetailsPage;
