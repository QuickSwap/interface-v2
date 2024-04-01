import React, { useEffect, useMemo, useState } from 'react';
import {
  useOrderEntry,
  useOrderStream,
  usePositionStream,
} from '@orderly.network/hooks';
import { API, OrderSide, OrderStatus, OrderType } from '@orderly.network/types';
import './Layout.scss';
import { Box, Button } from '@material-ui/core';
import CustomTabSwitch from 'components/v3/CustomTabSwitch';
import { PortfolioStatus } from './PortfolioStatus';
import { Check } from '@material-ui/icons';
import { formatNumber } from 'utils';
import dayjs from 'dayjs';
import { CustomTable } from 'components';
import { GlobalConst } from 'constants/index';

type Order = {
  symbol: string;
  price: number;
  quantity: number;
  created_time: string;
  order_id: number;
  side: OrderSide;
  type: OrderType;
  status: OrderStatus;
  total_executed_quantity: number;
  average_executed_price: number;
  total_fee: number;
  reduce_only?: boolean;
  visible_quantity?: number;
};
export const Footer: React.FC<{ token: string }> = ({ token }) => {
  const [selectedItem, setSelectedItem] = useState('Portfolio');
  const [selectedSide, setSelectedSide] = useState<string>('');
  const [showAllInstrument, setShowAllInstrument] = useState(false);
  const [{ rows }, _, { refresh }] = usePositionStream(
    showAllInstrument ? undefined : token,
  );

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

  const orderStatus = useMemo(() => {
    if (selectedItem === 'Pending') {
      return OrderStatus.INCOMPLETE;
    } else if (selectedItem === 'Filled') {
      return OrderStatus.FILLED;
    } else if (selectedItem === 'Cancelled') {
      return OrderStatus.CANCELLED;
    } else if (selectedItem === 'Rejected') {
      return OrderStatus.REJECTED;
    }
    return;
  }, [selectedItem]);

  const [o, { cancelOrder }] = useOrderStream({
    symbol: showAllInstrument ? undefined : token,
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

  const orders = o as Order[] | null;

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((order) =>
      selectedSide === '' || selectedSide === 'all'
        ? true
        : order.side.toLowerCase() === selectedSide.toLowerCase(),
    );
  }, [orders, selectedSide]);

  const portfolioHeadCells = [
    {
      id: 'instrument',
      label: 'Instrument',
      sortKey: (item: API.PositionExt) => item.symbol,
    },
    {
      id: 'quantity',
      numeric: false,
      label: 'Quantity',
      sortKey: (item: API.PositionExt) => item.position_qty,
    },
    {
      id: 'avgOpen',
      numeric: false,
      label: 'Avg.open',
      sortKey: (item: API.PositionExt) => item.average_open_price,
    },
    {
      id: 'markPrice',
      numeric: true,
      label: 'Mark price',
      sortKey: (item: API.PositionExt) => item.mark_price,
    },
    {
      id: 'liqPrice',
      numeric: true,
      label: 'Liq. price',
      sortKey: (item: API.PositionExt) => item.est_liq_price,
    },
    {
      id: 'unrealPNL',
      numeric: true,
      label: 'Unreal. PnL',
      sortKey: (item: API.PositionExt) => item.unrealized_pnl,
    },
    {
      id: 'estTotal',
      numeric: true,
      label: 'Est. total',
      sortKey: (item: API.PositionExt) => item.mark_price * item.position_qty,
    },
    {
      id: 'qtyInput',
      label: 'Qty.',
      sortDisabled: true,
    },
    {
      id: 'priceInput',
      label: 'Price',
      sortDisabled: true,
    },
  ];

  const orderHeadCells = [
    {
      id: 'instrument',
      label: 'Instrument',
      sortKey: (item: Order) => item.symbol,
    },
    {
      id: 'type',
      label: 'Type',
      sortKey: (item: Order) => item.type,
    },
    {
      id: 'side',
      label: 'Side',
      sortKey: (item: Order) => item.side,
    },
    {
      id: 'quantity',
      numeric: true,
      label: 'Filled / Quantity',
      sortKey: (item: Order) => item.quantity,
    },
    {
      id: 'price',
      numeric: true,
      label: 'Order Price',
      sortKey: (item: Order) => item.price,
    },
    {
      id: 'avgPrice',
      numeric: true,
      label: 'Avg. Price',
      sortKey: (item: Order) => item.average_executed_price,
    },
    {
      id: 'fee',
      numeric: true,
      label: 'Fee',
      sortKey: (item: Order) => item.total_fee,
    },
    {
      id: 'status',
      label: 'Status',
      sortKey: (item: Order) => item.status,
    },
    {
      id: 'reduce',
      label: 'Reduce',
      sortKey: (item: Order) => !!item.reduce_only,
    },
    {
      id: 'hidden',
      label: 'Hidden',
      sortKey: (item: Order) => !item.visible_quantity,
    },
    {
      id: 'orderTime',
      numeric: true,
      label: 'Order Time',
      sortKey: (item: Order) => item.created_time,
    },
  ];

  const portfolioMobileHTML = (item: API.PositionExt, index: number) => {
    return (
      <Box mt={index === 0 ? 0 : 3}>
        <Box className='mobileRow'>
          <p>Instrument</p>
          <p>{item.symbol}</p>
        </Box>
        <Box className='mobileRow'>
          <p>Quantity</p>
          <p>{formatNumber(item.position_qty)}</p>
        </Box>
        <Box className='mobileRow'>
          <p>Avg.open</p>
          <p>{formatNumber(item.average_open_price)}</p>
        </Box>
        <Box className='mobileRow'>
          <p>Mark price</p>
          <p>{formatNumber(item.mark_price)}</p>
        </Box>
        <Box className='mobileRow'>
          <p>Liq. price</p>
          <p>{formatNumber(item.est_liq_price ?? 0)}</p>
        </Box>
        <Box className='mobileRow'>
          <p>Unreal. PnL</p>
          <p>{formatNumber(item.unrealized_pnl)}</p>
        </Box>
        <Box className='mobileRow'>
          <p>Est. total</p>
          <p>{formatNumber(item.mark_price * item.position_qty)}</p>
        </Box>
        <Box className='mobileRow'>
          <p>Qty</p>
        </Box>
        <Box className='mobileRow'>
          <p>Price</p>
        </Box>
      </Box>
    );
  };

  const portfolioDesktopHTML = (item: API.PositionExt) => {
    return [
      {
        html: <small>{item.symbol}</small>,
      },
      {
        html: <small>{formatNumber(item.position_qty)}</small>,
      },
      {
        html: <small>{formatNumber(item.average_open_price)}</small>,
      },
      {
        html: <small>{formatNumber(item.mark_price)}</small>,
      },
      {
        html: <small>{formatNumber(item.est_liq_price ?? 0)}</small>,
      },
      {
        html: <small>{formatNumber(item.unrealized_pnl)}</small>,
      },
      {
        html: (
          <small>{formatNumber(item.mark_price * item.position_qty)}</small>
        ),
      },
    ];
  };

  const orderMobileHTML = (item: Order, index: number) => {
    return (
      <Box mt={index === 0 ? 0 : 3}>
        <Box className='mobileRow'>
          <p>Instrument</p>
          <p>{item.symbol}</p>
        </Box>
        <Box className='mobileRow'>
          <p>Type</p>
          <p>{item.type}</p>
        </Box>
        <Box className='mobileRow'>
          <p>Side</p>
          <p>{item.side}</p>
        </Box>
        <Box className='mobileRow'>
          <p>Filled / Quantity</p>
          <p>
            {formatNumber(item.total_executed_quantity)} /
            {formatNumber(item.quantity)}
          </p>
        </Box>
        <Box className='mobileRow'>
          <p>Order Price</p>
          <p>{formatNumber(item.price)}</p>
        </Box>
        <Box className='mobileRow'>
          <p>Avg. Price</p>
          <p>{formatNumber(item.average_executed_price)}</p>
        </Box>
        <Box className='mobileRow'>
          <p>Fee</p>
          <p>{formatNumber(item.total_fee)}</p>
        </Box>
        <Box className='mobileRow'>
          <p>Status</p>
          <p>{item.status}</p>
        </Box>
        <Box className='mobileRow'>
          <p>Reduce</p>
          <p>{item.reduce_only ? 'Yes' : 'No'}</p>
        </Box>
        <Box className='mobileRow'>
          <p>Hidden</p>
          <p>{!item.visible_quantity ? 'Yes' : 'No'}</p>
        </Box>
        <Box className='mobileRow'>
          <p>Order Time</p>
          <p>{dayjs(item.created_time).format('YYYY-MM-DD HH:mm:ss')}</p>
        </Box>
      </Box>
    );
  };

  const orderDesktopHTML = (item: Order) => {
    return [
      {
        html: <small>{item.symbol}</small>,
      },
      {
        html: <small>{item.type}</small>,
      },
      {
        html: <small>{item.side}</small>,
      },
      {
        html: (
          <small>
            {formatNumber(item.total_executed_quantity)} /
            {formatNumber(item.quantity)}
          </small>
        ),
      },
      {
        html: <small>{formatNumber(item.price)}</small>,
      },
      {
        html: <small>{formatNumber(item.average_executed_price)}</small>,
      },
      {
        html: <small>{formatNumber(item.total_fee)}</small>,
      },
      {
        html: <small>{item.status}</small>,
      },
      {
        html: <small>{item.reduce_only ? 'Yes' : 'No'}</small>,
      },
      {
        html: <small>{!item.visible_quantity ? 'Yes' : 'No'}</small>,
      },
      {
        html: (
          <small>
            {dayjs(item.created_time).format('YYYY-MM-DD HH:mm:ss')}
          </small>
        ),
      },
    ];
  };

  return (
    <div>
      <Box
        className='flex items-center flex-wrap justify-between border-bottom'
        gridGap={12}
      >
        <Box flex={1}>
          <CustomTabSwitch
            items={footerTabs}
            value={selectedItem}
            handleTabChange={setSelectedItem}
            height={45}
          />
        </Box>
        <Box
          className='flex items-center cursor-pointer'
          onClick={() => setShowAllInstrument(!showAllInstrument)}
          gridGap={5}
          pr='12px'
        >
          <Box
            className={`checkbox-wrapper ${
              showAllInstrument ? 'checkbox-wrapper-filled' : ''
            }`}
          >
            {showAllInstrument && (
              <Check fontSize='small' className='text-bgColor' />
            )}
          </Box>
          Show All Instruments
        </Box>
      </Box>
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
      <CustomTable
        headCells={
          selectedItem === 'Portfolio' ? portfolioHeadCells : orderHeadCells
        }
        rowsPerPage={GlobalConst.utils.ROWSPERPAGE}
        data={selectedItem === 'Portfolio' ? rows ?? [] : filteredOrders}
        mobileHTML={
          selectedItem === 'Portfolio' ? portfolioMobileHTML : orderMobileHTML
        }
        desktopHTML={
          selectedItem === 'Portfolio' ? portfolioDesktopHTML : orderDesktopHTML
        }
      />
    </div>
  );
};
