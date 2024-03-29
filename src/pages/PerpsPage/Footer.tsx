import React, { useState } from 'react';
import { useOrderStream, usePositionStream } from '@orderly.network/hooks';
import { OrderSide, OrderStatus, OrderType } from '@orderly.network/types';
import './Layout.scss';
import { Box } from '@material-ui/core';
import CustomTabSwitch from 'components/v3/CustomTabSwitch';

type Order = {
  price: number;
  quantity: number;
  created_time: number;
  order_id: number;
  side: OrderSide;
  type: OrderType;
  status: OrderStatus;
  executed: number;
  average_executed_price: number;
};
export const Footer: React.FC<{ token: string; selectedTab: string }> = ({
  token,
  selectedTab,
}) => {
  const [orderStatus, setOrderStatus] = React.useState(OrderStatus.COMPLETED);
  // switch (selectedTab) {
  //   case 'Portfolio':
  //     setOrderStatus(OrderStatus.COMPLETED);
  //     break;
  //   case 'Pending':
  //     setOrderStatus(OrderStatus.INCOMPLETE);
  //     break;
  //   case 'Filled':
  //     setOrderStatus(OrderStatus.FILLED);
  //     break;
  //   case 'Cancelled':
  //     setOrderStatus(OrderStatus.CANCELLED);
  //     break;
  //   case 'Rejected':
  //     setOrderStatus(OrderStatus.REJECTED);
  //     break;
  //   case 'Order History':
  //     setOrderStatus(OrderStatus.COMPLETED);
  //     break;
  //   default:
  //     setOrderStatus(OrderStatus.COMPLETED);
  //     break;
  // }
  const footerTabs = [
    {
      id: 'Portfolio',
      text: 'Portfolio',
    },
    {
      id: 'Pending',
      text: 'Pending',
    },
    {
      id: 'Filled',
      text: 'Filled',
    },
    {
      id: 'Cancelled',
      text: 'Cancelled',
    },
    {
      id: 'Rejected',
      text: 'Rejected',
    },
    {
      id: 'OrderHistory',
      text: 'Order History',
    },
  ];

  const [o] = useOrderStream({
    symbol: token,
    status: OrderStatus.COMPLETED,
  });
  const orders = o as Order[] | null;
  const [selectedItem, setSelectedItem] = useState('Portfolio');
  const [selectedSide, setSelectedSide] = useState<string>('');

  const [data] = usePositionStream(token);

  return (
    <div>
      <div className='flex items-center justify-between border-bottom'>
        <CustomTabSwitch
          items={footerTabs}
          value={selectedItem}
          handleTabChange={setSelectedItem}
          height={45}
        />
        {/* <div className='footer-right'>Show All Instrument</div> */}
      </div>
      {selectedItem !== 'Portfolio' ? (
        <div className='dropdown'>
          <select
            id='dropdownSelect'
            onChange={(e) => {
              setSelectedSide(e.target.value);
            }}
          >
            <option value='all' disabled selected>
              All
            </option>
            <option value='buy'>Buy</option>
            <option value='sell'>Sell</option>
          </select>
        </div>
      ) : (
        <div className='portfolio_status'>
          <div className='portfolio_status_item'>
            <p>Unreal. PnL</p>
            <p>{data.aggregated?.unrealPnL?.toFixed(2)}%</p>
          </div>
          <div className='portfolio_status_item'>
            <p>Notional</p>
            <p>{data.aggregated?.notional?.toFixed(2)}%</p>
          </div>
          <div className='portfolio_status_item'>
            <p>Unsettled PnL</p>
            <p>{data.aggregated?.unsettledPnL?.toFixed(2)}%</p>
          </div>
        </div>
      )}
      <div className='footer_data'>
        <span className='text-secondary weight-500'>Price</span>
        <span className='text-secondary weight-500'>Quantity</span>
        <span className='text-secondary weight-500'>Created At</span>
        <span className='text-secondary weight-500'>Side</span>
        <span className='text-secondary weight-500'>Type</span>
        <span className='text-secondary weight-500'>Status</span>
        <span className='text-secondary weight-500'>Price</span>
      </div>
      <div className='orders'>
        {orders && orders.length > 0 ? (
          orders.map((order) => (
            <div key={order?.order_id} className='order'>
              <span>{order?.price}</span>
              <span>{order?.quantity}</span>
              <span>{order?.created_time}</span>
              <span>{order?.side}</span>
              <span>{order?.type}</span>
              <span>{order?.status}</span>
              <span>{order?.average_executed_price}</span>
            </div>
          ))
        ) : (
          <Box padding='20px 16px' className='flex justify-center'>
            <small>No orders available</small>
          </Box>
        )}
      </div>
    </div>
  );
};
