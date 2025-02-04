'use client';
import { Review } from '@/types';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Reviewform from './review-form';
import { getReviews } from '@/lib/actions/review.actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, UserIcon } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import Rating from '@/components/rating';

type ReviewListProps = {
  userId: string;
  productId: string;
  productSlug: string;
};
const ReviewList: React.FC<ReviewListProps> = ({
  userId,
  productId,
  productSlug,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await getReviews({ productId });
      setReviews(data);
      console.log('reviews', data);
    };
    fetchReviews();
  }, [productId]);

  const reload = async () => {
    const { data } = await getReviews({ productId });

    setReviews([...data]);
  };

  return (
    <div className='space-y-4'>
      {reviews.length === 0 && <div>No reviews yet</div>}
      {userId ? (
        <Reviewform
          userId={userId}
          productId={productId}
          onReviewSubmitted={reload}
        />
      ) : (
        <div>
          Please{' '}
          <Link
            className='text-blue-700 px-2'
            href={`/sign-in?callbackUrl=/product/${productSlug}`}
          >
            Sign in
          </Link>
          to write a review
        </div>
      )}
      <div className='flex-col gap-3'>
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className='flex-between'>
                <CardTitle>{review.title}</CardTitle>
              </div>
              <CardDescription>{review.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-x-4 text-sm text-muted-foreground'>
                <Rating value={review.rating} />
                <div className='flex items-center'>
                  <UserIcon className='mr-1 h-3 w-3' />

                  {review.user?.name || 'Anonymous'}
                </div>
                <div className='flex items-center'>
                  <Calendar className='mr-1 h-3 w-3' />
                  {formatDateTime(review.createdAt).dateTime}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
