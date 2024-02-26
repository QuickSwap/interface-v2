import React from 'react';
import { useMarketTradeStream } from '@orderly.network/hooks';
import { OrderSide, OrderStatus, OrderType } from '@orderly.network/types';
import { Button, Flex, Heading, Table } from '@radix-ui/themes';
import { FC } from 'react';
import { API } from '@orderly.network/types';

type MarketOrder = {
  price: number;
  size: number;
  ts: number;
  side: OrderSide;
};

export const Market: FC = () => {
  const { data, isLoading } = useMarketTradeStream('PERP_ETH_USDC');
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className='text-sm'>
      {data.map((item) => {
        return (
          <div key={item.ts} className='flex justify-between border-b'>
            <span>{item.price}</span>
            <span>{item.size}</span>
            <span>{item.side}</span>
          </div>
        );
      })}
    </div>
  );
};
