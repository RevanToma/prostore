'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Input } from '../ui/input';

const AdminSearch = () => {
  const pathName = usePathname(),
    formActionUrl = pathName.includes('/admin/orders')
      ? '/admin/orders'
      : pathName.includes('/admin/users')
      ? '/admin/users'
      : '/admin/products',
    searchParams = useSearchParams(),
    [queryValue, setQueryValue] = useState(searchParams.get('query') || '');

  useEffect(() => {
    setQueryValue(searchParams.get('query') || '');
  }, [searchParams]);

  return (
    <form action={formActionUrl} method='GET'>
      <Input
        type='search'
        placeholder='Search...'
        name='query'
        value={queryValue}
        onChange={(e) => setQueryValue(e.target.value)}
        className='md:w-[100px] lg:w-[300px]'
      />
      <button className='sr-only' type='submit'>
        Search
      </button>
    </form>
  );
};

export default AdminSearch;
