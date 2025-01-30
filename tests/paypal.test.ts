import { generateAccessToken, paypal } from '../lib/paypal';

test('generates token from paypal', async () => {
  const token = await generateAccessToken();

  expect(typeof token).toBe('string');
  expect(token.length).toBeGreaterThan(0);
});

test('creates a paypal order', async () => {
  const token = await generateAccessToken(),
    price = 100,
    order = await paypal.createOrder(price);

  expect(order.id).toBeDefined();
  expect(order.status).toBe('CREATED');
});

test('simulate capturing a payment from an order', async () => {
  const orderId = '100',
    mockCapturePayment = jest
      .spyOn(paypal, 'capturePayment')
      .mockResolvedValue({
        status: 'COMPLETED',
      });

  const captureRes = await paypal.capturePayment(orderId);

  expect(captureRes.status).toBe('COMPLETED');

  mockCapturePayment.mockRestore();
});
