import { Button } from '@/components/ui/button';
import { DialogTitle } from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { getAllCategories } from '@/lib/actions/product.actions';
import { MenuIcon } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const CategoryDrawer = async () => {
  const categories = await getAllCategories();

  return (
    <Drawer direction='left'>
      <DrawerTrigger asChild>
        <Button variant='outline'>
          <MenuIcon />
        </Button>
      </DrawerTrigger>
      <DrawerContent className='h-full max-w-sm'>
        <DialogTitle>Categories</DialogTitle>
        <DrawerHeader>Select a category</DrawerHeader>
        <div className='space-y-1 mt-4'>
          {categories.map((x) => (
            <Button
              variant={'ghost'}
              className='w-full justify-start'
              key={x.category}
              asChild
            >
              <DrawerClose asChild>
                <Link href={`/search?category=${x.category}`}>
                  {x.category} ({x._count})
                </Link>
              </DrawerClose>
            </Button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CategoryDrawer;
