import React from 'react';
import { useOrderStream } from '@orderly.network/hooks';
import { OrderSide, OrderStatus, OrderType } from '@orderly.network/types';
import './Layout.css';
type Order = {
  price: number;
  quantity: number;
  created_time: number;
  order_id: number;
  side: OrderSide;
  type: OrderType;
  status: OrderStatus;
  executed: number;
};
export const Footer: React.FC = ({ token }) => {
  console.log(token);
  const [o] = useOrderStream({ symbol: token });
  const orders = o as Order[] | null;
  return (
    <div className='orders'>
      {orders && orders.length > 0 ? (
        orders.map((order) => (
          <div key={order?.order_id} className='order'>
            <div>{order?.price}</div>
            <div>{order?.quantity}</div>
            <div>{order?.created_time}</div>
            <div>{order?.side}</div>
            <div>{order?.type}</div>
            <div>{order?.status}</div>
            <div>{order?.executed}</div>
          </div>
        ))
      ) : (
        <div>No orders available</div>
      )}
    </div>
  );
};
