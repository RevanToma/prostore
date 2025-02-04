import ProductCard from '@/components/shared/prodoct/product-card';
import { Button } from '@/components/ui/button';
import {
  getAllCategories,
  getAllProducts,
} from '@/lib/actions/product.actions';
import { Product } from '@/types';
import Link from 'next/link';
import React from 'react';

const ratings = [4, 3, 2, 1];

const sortOrders = ['newest', 'lowest', 'highest', 'rating'];

const prices = [
  {
    name: '$1 to $50',
    value: '1-50',
  },
  {
    name: '$51 to $100',
    value: '50-100',
  },
  {
    name: '$101 to $200',
    value: '100-200',
  },
  {
    name: '$201 & Above',
    value: '200-10000',
  },
];

export async function generateMetaData(props: {
  searchParams: Promise<{
    q: string;
    c: string;
    p: string;
    r: string;
  }>;
}) {
  const { q = 'all', c = 'all', p = '1', r = 'all' } = await props.searchParams;

  const isQuerySet = q && q !== 'all' && q.trim() !== '',
    isCategorySet = c && c !== 'all' && c.trim() !== '',
    isPriceSet = p && p !== 'all' && p.trim() !== '',
    isRatingSet = r && r !== 'all' && r.trim() !== '';

  if (isQuerySet || isCategorySet || isPriceSet || isRatingSet) {
    return {
      title: `Search ${isQuerySet ? q : ''} 
      ${isCategorySet ? `: Category ${c}` : ''}
      ${isPriceSet ? `: Price ${p}` : ''}
      ${isRatingSet ? `: Price ${r}` : ''}
      
      `,
    };
  } else {
    return {
      title: 'Search Products',
    };
  }
}

const SearchPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    price?: string;
    rating?: string;
    sort?: string;
    page?: string;
  }>;
}) => {
  const {
    q = 'all',
    category = 'all',
    page = '1',
    price = 'all',
    rating = 'all',
    sort = 'newest',
  } = await searchParams;

  const getFilterUrl = ({
    c,
    s,
    p,
    r,
    pg,
  }: {
    c?: string;
    s?: string;
    p?: string;
    r?: string;
    pg?: string;
  }) => {
    const params = { q, category, price, rating, sort, page };

    if (c) params.category = c;
    if (s) params.sort = s;
    if (p) params.price = p;
    if (r) params.rating = r;
    if (pg) params.page = pg;

    return `/search?${new URLSearchParams(params).toString()}`;
  };

  const products = await getAllProducts({
    query: q,
    category,
    price,
    rating,
    sort,
    page: Number(page),
  });

  const categories = await getAllCategories();

  return (
    <div className='grid md:grid-cols-5 md:gap-5'>
      <div className='filter-links'>
        <div className='text-xl mb-2 mt-3'>Department</div>
        <div>
          <ul className='space-y-1'>
            <li>
              <Link
                className={`${
                  (category === 'all' || category === '') && 'font-bold'
                }`}
                href={getFilterUrl({ c: 'all' })}
              >
                Any
              </Link>
            </li>
            {categories.map((x) => (
              <li key={x.category}>
                <Link
                  className={`${category === x.category && 'font-bold'}`}
                  href={getFilterUrl({ c: x.category })}
                >
                  {x.category}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className='text-xl mb-2 mt-7'>Prices</div>
        <div>
          <ul className='space-y-1'>
            <li>
              <Link
                className={`${price === 'all' && 'font-bold'}`}
                href={getFilterUrl({ p: 'all' })}
              >
                Any
              </Link>
            </li>
            {prices.map((p) => (
              <li key={p.value}>
                <Link
                  className={`${price === p.value && 'font-bold'}`}
                  href={getFilterUrl({ p: p.value })}
                >
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className='text-xl mb-2 mt-3'>Customer Ratings</div>
        <div>
          <ul className='space-y-1'>
            <li>
              <Link
                className={`${rating === 'all' && 'font-bold'}`}
                href={getFilterUrl({ r: 'all' })}
              >
                Any
              </Link>
            </li>
            {ratings.map((r) => (
              <li key={r}>
                <Link
                  className={`${rating === r.toString() && 'font-bold'}`}
                  href={getFilterUrl({ r: `${r}` })}
                >
                  {`${r} stars & up`}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className='space-y-4 md:col-span-4'>
        <div className='flex-between flex-col md:flex-row my-4'>
          <div className='flex items-center'>
            {q !== 'all' && q !== '' && 'Query: ' + q}
            {category !== 'all' && category !== '' && 'Category: ' + category}
            {price !== 'all' && ' Price: ' + price}
            {rating !== 'all' && ' Rating: ' + rating + ' stars & up'}
            &nbsp;
            {(q !== 'all' && q !== '') ||
            (category !== 'all' && category !== '') ||
            rating !== 'all' ||
            price !== 'all' ? (
              <Button variant={'link'} asChild>
                <Link href={'/search'}>Clear</Link>
              </Button>
            ) : null}
          </div>
          <div>
            Sort By{' '}
            {sortOrders.map((s) => (
              <Link
                key={s}
                className={`mx-2 ${sort === s && 'font-bold'}`}
                href={getFilterUrl({ s })}
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
        <div className='grid grid-cols-1 gap-4  md:grid-cols-3'>
          {products.data.length === 0 && <div>No Prodcts Found</div>}
          {products.data.map((prod) => (
            <ProductCard key={prod.id} product={prod as Product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
