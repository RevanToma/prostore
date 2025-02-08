'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import Image from 'next/image';
import { useEffect, useState } from 'react';

//utc time
const TARGET_DATE = new Date('2025-02-20T00:00:00Z'); // 'Z' enforces UTC

const calculateTimeRemaining = (targetDate: Date) => {
  const currentTime = new Date();
  const timeDifference = Math.max(
    targetDate.getTime() - currentTime.getTime(),
    0
  ); // Use getTime() for accurate millisecs

  return {
    days: Math.floor(timeDifference / (1000 * 60 * 60 * 24)),
    hours: Math.floor(
      (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    ),
    minutes: Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((timeDifference % (1000 * 60)) / 1000),
  };
};

const DealCountdown = () => {
  const [time, setTime] = useState(calculateTimeRemaining(TARGET_DATE));

  useEffect(() => {
    const now = new Date();
    console.log('Current Time:', now.toString(), 'UTC:', now.toUTCString());
    console.log(
      'Target Date:',
      TARGET_DATE.toString(),
      'UTC:',
      TARGET_DATE.toUTCString()
    );
    setTime(calculateTimeRemaining(TARGET_DATE));

    const timerInterval = setInterval(() => {
      const newTime = calculateTimeRemaining(TARGET_DATE);
      setTime(newTime);

      if (
        newTime.days === 0 &&
        newTime.hours === 0 &&
        newTime.minutes === 0 &&
        newTime.seconds === 0
      ) {
        clearInterval(timerInterval);
      }
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  if (!time) {
    return (
      <section className='grid grid-cols-1 md:grid-cols-2 my-20'>
        <div className='flex flex-col gap-2 justify-center'>
          <h3 className='text-3xl font-bold'>Loading Countdown...</h3>
        </div>
      </section>
    );
  }

  if (
    time.days === 0 &&
    time.hours === 0 &&
    time.minutes === 0 &&
    time.seconds === 0
  ) {
    return (
      <section className='grid grid-cols-1 md:grid-cols-2 my-20'>
        <div className='flex flex-col gap-2 justify-center'>
          <h3 className='text-3xl font-bold'>Deal has Ended</h3>
          <p>This deal no longer available. Check out our latest promotions!</p>

          <div className='text-center'>
            <Button asChild>
              <Link href='/search'>View Products</Link>
            </Button>
          </div>
        </div>
        <div className='flex justify-center'>
          <Image
            src='/images/promo.jpg'
            alt='promotion'
            width={300}
            height={200}
          />
        </div>
      </section>
    );
  }

  return (
    <section className='grid grid-cols-1 md:grid-cols-2 my-20'>
      <div className='flex flex-col gap-2 justify-center'>
        <h3 className='text-3xl font-bold'>Deal Of The Month</h3>
        <p>
          Get ready for a shopping experience like never before with our Deals
          of the Month! Every puchase comes with exclusive perks and offers,
          makign this month a celebration of savvy choices and amazing deals.
          Don&apos;t miss out! 🎁🛒
        </p>
        <ul className='grid grid-cols-4'>
          <StatBox lable='Days' value={time.days} />
          <StatBox lable='Hours' value={time.hours} />
          <StatBox lable='Minutes' value={time.minutes} />
          <StatBox lable='Seconds' value={time.seconds} />
        </ul>
        <div className='text-center'>
          <Button asChild>
            <Link href='/search'>View Products</Link>
          </Button>
        </div>
      </div>
      <div className='flex justify-center'>
        <Image
          src='/images/promo.jpg'
          alt='promotion'
          width={300}
          height={200}
        />
      </div>
    </section>
  );
};

const StatBox = ({ lable, value }: { lable: string; value: number }) => (
  <li className='p-4 w-full text-center'>
    <p className='text-3xl font-bold'>{value}</p>
    <p>{lable}</p>
  </li>
);

export default DealCountdown;
