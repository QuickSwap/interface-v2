import React from 'react';
import { useMarketsStream } from '@orderly.network/hooks';
import { OrderSide, OrderStatus, OrderType } from '@orderly.network/types';
import { FC } from 'react';

type MarketOrder = {
  price: number;
  size: number;
  ts: number;
  side: OrderSide;
};

export const Pairs: FC = () => {
  const { data } = useMarketsStream();
  console.log(data)
  return (
    <div className='text-sm'>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};
