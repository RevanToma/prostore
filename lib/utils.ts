import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import qs from 'query-string';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const convertToPlainObj = <T>(value: T) => {
  return JSON.parse(JSON.stringify(value));
};

export const formatNumberWithDecimal = (num: number): string => {
  const [int, decimal] = num.toString().split('.');

  return decimal ? `${int}.${decimal.padEnd(2, '0')}` : `${int}.00`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatError = (error: any) => {
  if (error.name === 'ZodError') {
    const fieldErrors = Object.keys(error.errors).map(
      (field) => error.errors[field].message
    );
    return fieldErrors.join('. ');
  } else if (
    error.name === 'PrismaClientKnownRequestError' &&
    error.code === 'P2002'
  ) {
    const field = error.meta?.target ? error.meta.target[0] : 'Field';

    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else {
    return typeof error.message === 'string'
      ? error.message
      : JSON.stringify(error.message);
  }
};

export const round2 = (value: number | string) => {
  if (typeof value === 'number') {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  } else if (typeof value === 'string') {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  } else {
    throw new Error('Value is not a number or string');
  }
};

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency',
  minimumFractionDigits: 2,
});

export const formatCurrency = (value: number | string | null) => {
  if (typeof value === 'number') {
    return CURRENCY_FORMATTER.format(value);
  } else if (typeof value === 'string') {
    return CURRENCY_FORMATTER.format(Number(value));
  } else {
    return 'NaN';
  }
};

const NUMBER_FORMATTER = new Intl.NumberFormat('en-US');

export const formatNumber = (value: number) => {
  return NUMBER_FORMATTER.format(value);
};

export const formatId = (id: string) => `..${id.substring(id.length - 6)}`;

export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    year: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    year: 'numeric',
    day: 'numeric',
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };

  const formattedDateTime: string = new Date(dateString).toLocaleDateString(
    'en-US',
    dateTimeOptions
  );

  const formattedDate: string = new Date(dateString).toLocaleDateString(
    'en-US',
    dateOptions
  );

  const formattedTime: string = new Date(dateString).toLocaleTimeString(
    'en-US',
    timeOptions
  );

  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

export const formUrlQuery = ({
  params,
  key,
  value,
}: {
  params: string;
  key: string;
  value: string | null;
}) => {
  const query = qs.parse(params);

  query[key] = value;

  return qs.stringifyUrl({
    url: window.location.pathname,
    query,
  });
};

// export async function generateMetaData(props: {
//   searchParams: Promise<{
//     q: string;
//     c: string;
//     p: string;
//     r: string;
//   }>;
// }) {
//   const { q = 'all', c = 'all', p = '1', r = 'all' } = await props.searchParams;

//   const isQuerySet = q && q !== 'all' && q.trim() !== '',
//     isCategorySet = c && c !== 'all' && c.trim() !== '',
//     isPriceSet = p && p !== 'all' && p.trim() !== '',
//     isRatingSet = r && r !== 'all' && r.trim() !== '';

//   if (isQuerySet || isCategorySet || isPriceSet || isRatingSet) {
//     return {
//       title: `Search ${isQuerySet ? q : ''}
//       ${isCategorySet ? `: Category ${c}` : ''}
//       ${isPriceSet ? `: Price ${p}` : ''}
//       ${isRatingSet ? `: Price ${r}` : ''}

//       `,
//     };
//   } else {
//     return {
//       title: 'Search Products',
//     };
//   }
// }
