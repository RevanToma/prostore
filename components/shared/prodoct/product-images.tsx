'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState } from 'react';

const ProductImages = ({ images }: { images: string[] }) => {
  const [current, setCurrent] = useState(0);
  return (
    <div className='space-y-4'>
      <Image
        src={images[current]}
        alt={images[current]}
        width={1000}
        height={1000}
        className='min-h-[300px] object-cover object-center'
      />
      <div className='flex'>
        {images.map((img, idx) => (
          <div
            key={img}
            onClick={() => setCurrent(idx)}
            className={cn(
              'border mr-2 cursor-pointer hover:border-orange-600 ',
              current === idx && 'border-orange-500'
            )}
          >
            <Image
              src={img}
              alt={img}
              width={100}
              height={100}
              className='bg-transparent'
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImages;
