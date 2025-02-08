import { Order } from '@/types';
const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export const sendPurchaseReceipt = async (order: Order) => {
  const response = await fetch(`${BASE_URL}/api/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order }),
  });

  if (!response.ok) {
    throw new Error('Failed to send email');
  }

  return await response.json();
};
