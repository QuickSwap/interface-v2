import React, { useEffect, useState } from 'react';
import {
  useOrderEntry,
  useOrderStream,
  usePositionStream,
} from '@orderly.network/hooks';
import { OrderSide, OrderStatus, OrderType } from '@orderly.network/types';
import './Layout.scss';
import { Box, Button } from '@material-ui/core';
import CustomTabSwitch from 'components/v3/CustomTabSwitch';
import { PortfolioStatus } from './PortfolioStatus';
import dayjs from 'dayjs';

type Order = {
  price: number;
  quantity: number;
  created_time: string;
  order_id: number;
  side: OrderSide;
  type: OrderType;
  status: OrderStatus;
  executed: number;
  average_executed_price: number;
};
export const Footer: React.FC<{ token: string }> = ({ token }) => {
  const [orderStatus, setOrderStatus] = React.useState(OrderStatus.COMPLETED);
  const [selectedItem, setSelectedItem] = useState('Portfolio');
  const [selectedSide, setSelectedSide] = useState<string>('');
  const [positions, _, { refresh }] = usePositionStream('PERP_ETH_USDC');

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
    status: orderStatus,
  });
  const { onSubmit, maxQty } = useOrderEntry(
    {
      symbol: token,
      side: OrderSide.BUY,
      order_type: OrderType.MARKET,
      reduce_only: true,
    },
    { watchOrderbook: true },
  );

  useEffect(() => {
    switch (selectedItem) {
      case 'Pending':
        setOrderStatus(OrderStatus.INCOMPLETE);
        break;
      case 'Filled':
        setOrderStatus(OrderStatus.FILLED);
        break;
      case 'Cancelled':
        setOrderStatus(OrderStatus.CANCELLED);
        break;
      case 'Rejected':
        setOrderStatus(OrderStatus.REJECTED);
        break;
      default:
        setOrderStatus(OrderStatus.COMPLETED);
        break;
    }
  }, [selectedItem]);
  const orders = o as Order[] | null;

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
        <Box className='perpsBottomDropdown' padding='16px 12px'>
          <select
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
        </Box>
      ) : (
        <PortfolioStatus token={token} />
      )}
      <div className='footer_data'>
        <span className='text-secondary weight-500'>Price</span>
        <span className='text-secondary weight-500'>Quantity</span>
        <span className='text-secondary weight-500'>Created At</span>
        <span className='text-secondary weight-500'>Side</span>
        <span className='text-secondary weight-500'>Type</span>
        <span className='text-secondary weight-500'>Status</span>
        <span className='text-secondary weight-500'>Price</span>
        <span className='text-secondary weight-500'>Action</span>
      </div>
      <div className='orders'>
        {orders && orders.length > 0 ? (
          orders.map((order) => (
            <div key={order?.order_id} className='order'>
              <span>{order?.price}</span>
              <span>{order?.quantity}</span>
              <span>{new Date(order?.created_time).toLocaleString()}</span>
              <span>{order?.side}</span>
              <span>{order?.type}</span>
              <span>{order?.status}</span>
              <span>{order?.average_executed_price}</span>
              <span>
                {' '}
                <Button
                  onClick={async () => {
                    await onSubmit({
                      order_type: OrderType.MARKET,
                      symbol: order?.side === 'BUY' ? 'SELL' : 'BUY',
                      reduce_only: true,
                      side: OrderSide.BUY,
                      order_quantity: order?.quantity,
                    });
                    refresh();
                  }}
                >
                  Cancel
                </Button>
              </span>
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
