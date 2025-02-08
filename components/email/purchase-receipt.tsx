import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
  Img,
} from '@react-email/components';

import { Order } from '@/types';
import React from 'react';
import { formatCurrency } from '@/lib/utils';

const dateFormatter = new Intl.DateTimeFormat('en', { dateStyle: 'short' });

type OrderInformationProps = {
  order: Order;
};

const PurchaseReceiptEmail = ({ order }: OrderInformationProps) => {
  return (
    <Html>
      <Preview>View order receipt</Preview>
      <Tailwind>
        <Head />
        <Body className='font-sans bg-white'>
          <Container className='max-w-xl'>
            <Heading>Purchase Receipt</Heading>
            <Section>
              <Column>
                <Text className='mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap'>
                  Order Id
                </Text>
                <Text className='mt-0 mr-4'>{order.id.toString()}</Text>
              </Column>
              <Column>
                <Text className='mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap'>
                  Purchase Date
                </Text>
                <Text className='mt-0 mr-4'>
                  {dateFormatter.format(new Date(order.createdAt))}
                </Text>
              </Column>
              <Column>
                <Text className='mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap'>
                  Price Paid
                </Text>
                <Text className='mt-0 mr-4'>
                  {formatCurrency(order.totalPrice)}
                </Text>
              </Column>
            </Section>
            <Section className='border border-solid border-gray-500 rounded-lg p-4 md:p-6 my-4'>
              {order.orderitems.map((item) => (
                <Row key={item.productId} className='mt-8'>
                  <Column className='w-20'>
                    <Img
                      width={80}
                      alt={item.name}
                      className='rounded'
                      src={
                        item.image.startsWith('/')
                          ? `${process.env.NEXT_PUBLIC_SERVER_URL}${item.image}`
                          : item.image
                      }
                    />
                  </Column>
                  <Column className='align-top'>
                    {item.name} x {item.qty}
                  </Column>
                  <Column align='right' className='align-top'>
                    {formatCurrency(item.price)}
                  </Column>
                </Row>
              ))}
              {[
                { name: 'Items', price: order.itemsPrice },
                { name: 'Tax', price: order.taxPrice },
                { name: 'Shipping', price: order.shippingPrice },
                { name: 'Total', price: order.totalPrice },
              ].map(({ name, price }) => (
                <Row key={name} className='py-1'>
                  <Column align='right'>{name}: </Column>
                  <Column align='right' width={70} className='align-top'>
                    <Text className='m-0'>{formatCurrency(price)}</Text>
                  </Column>
                </Row>
              ))}
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
export default PurchaseReceiptEmail;
