import React, { useEffect, useMemo, useState } from 'react';
import {
  useOrderEntry,
  useOrderStream,
  usePositionStream,
} from '@orderly.network/hooks';
import { API, OrderSide, OrderStatus, OrderType } from '@orderly.network/types';
import './Layout.scss';
import { Box, Button, Grid, useMediaQuery, useTheme } from '@material-ui/core';
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

  const [positionQtyInputs, setPositionQtyInputs] = useState<string[]>([]);
  const [positionPriceInputs, setPositionPriceInputs] = useState<string[]>([]);

  useEffect(() => {
    if (rows && rows.length > 0) {
      setPositionQtyInputs(
        rows.map((row) => Math.abs(row.position_qty).toString()),
      );
      setPositionPriceInputs(rows.map(() => ''));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows?.length]);

  const portfolioHeadCells = [
    {
      id: 'instrument',
      label: 'Instrument',
      html: (item: API.PositionExt) => <small>{item.symbol}</small>,
    },
    {
      id: 'quantity',
      label: 'Quantity',
      html: (item: API.PositionExt) => (
        <small>{formatNumber(item.position_qty)}</small>
      ),
    },
    {
      id: 'avgOpen',
      label: 'Avg.open',
      html: (item: API.PositionExt) => (
        <small>{formatNumber(item.average_open_price)}</small>
      ),
    },
    {
      id: 'markPrice',
      label: 'Mark price',
      html: (item: API.PositionExt) => (
        <small>{formatNumber(item.mark_price)}</small>
      ),
    },
    {
      id: 'liqPrice',
      label: 'Liq. price',
      html: (item: API.PositionExt) => (
        <small>{formatNumber(item.est_liq_price ?? 0)}</small>
      ),
    },
    {
      id: 'unrealPNL',
      label: 'Unreal. PnL',
      html: (item: API.PositionExt) => (
        <small>{formatNumber(item.unrealized_pnl)}</small>
      ),
    },
    {
      id: 'estTotal',
      label: 'Est. total',
      html: (item: API.PositionExt) => (
        <small>{formatNumber(item.mark_price * item.position_qty)}</small>
      ),
    },
    {
      id: 'qtyInput',
      label: 'Qty.',
      html: (_: API.PositionExt, ind: number) => (
        <input className='perpsTableInput' value={positionQtyInputs[ind]} />
      ),
    },
    {
      id: 'priceInput',
      label: 'Price',
      html: (_: API.PositionExt, ind: number) => (
        <input
          className='perpsTableInput'
          placeholder='Market'
          value={positionPriceInputs[ind]}
        />
      ),
    },
    {
      id: 'action',
      label: '',
      html: (item: API.PositionExt, ind: number) => (
        <Button
          className='orderTableActionButton'
          onClick={() => {
            onSubmit({
              order_quantity: Number(positionQtyInputs[ind]),
              order_type: positionPriceInputs[ind]
                ? OrderType.LIMIT
                : OrderType.MARKET,
              order_price: positionPriceInputs[ind] ?? undefined,
              reduce_only: true,
              side: item.position_qty < 0 ? OrderSide.BUY : OrderSide.SELL,
              symbol: item.symbol,
            });
          }}
        >
          Close
        </Button>
      ),
    },
  ];

  const orderHeadCells = [
    {
      id: 'instrument',
      label: 'Instrument',
      html: (item: Order) => <small>{item.symbol}</small>,
    },
    {
      id: 'type',
      label: 'Type',
      html: (item: Order) => <small>{item.type}</small>,
    },
    {
      id: 'side',
      label: 'Side',
      html: (item: Order) => <small>{item.side}</small>,
    },
    {
      id: 'quantity',
      label: 'Filled / Quantity',
      html: (item: Order) => (
        <small>
          {formatNumber(item.total_executed_quantity)} /
          {formatNumber(item.quantity)}
        </small>
      ),
    },
    {
      id: 'price',
      label: 'Order Price',
      html: (item: Order) => <small>{formatNumber(item.price)}</small>,
    },
    {
      id: 'avgPrice',
      label: 'Avg. Price',
      html: (item: Order) => (
        <small>{formatNumber(item.average_executed_price)}</small>
      ),
    },
    {
      id: 'fee',
      label: 'Fee',
      html: (item: Order) => <small>{formatNumber(item.total_fee)}</small>,
    },
    {
      id: 'status',
      label: 'Status',
      html: (item: Order) => <small>{item.status}</small>,
    },
    {
      id: 'reduce',
      label: 'Reduce',
      html: (item: Order) => <small>{item.reduce_only ? 'Yes' : 'No'}</small>,
    },
    {
      id: 'hidden',
      label: 'Hidden',
      html: (item: Order) => (
        <small>{!item.visible_quantity ? 'Yes' : 'No'}</small>
      ),
    },
    {
      id: 'orderTime',
      label: 'Order Time',
      html: (item: Order) => (
        <small>{dayjs(item.created_time).format('YYYY-MM-DD HH:mm:ss')}</small>
      ),
    },
    ...(orderStatus === OrderStatus.FILLED ||
    orderStatus === OrderStatus.REJECTED ||
    orderStatus === OrderStatus.CANCELLED
      ? []
      : [
          {
            id: 'action',
            label: '',
            html: (item: Order) =>
              item.status === OrderStatus.FILLED ||
              item.status === OrderStatus.REJECTED ||
              item.status === OrderStatus.CANCELLED ? (
                <></>
              ) : (
                <Button
                  className='orderTableActionButton'
                  onClick={() => {
                    cancelOrder(item.order_id, item.symbol);
                  }}
                >
                  Cancel
                </Button>
              ),
          },
        ]),
  ];

  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));

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
          p='12px'
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
            defaultValue='all'
            onChange={(e) => {
              setSelectedSide(e.target.value);
            }}
          >
            <option value='all' disabled>
              All
            </option>
            <option value='buy'>Buy</option>
            <option value='sell'>Sell</option>
          </select>
        </Box>
      ) : (
        <PortfolioStatus token={token} />
      )}
      {isMobile ? (
        selectedItem === 'Portfolio' ? (
          rows && rows.length > 0 ? (
            rows.map((row, ind) => (
              <Box key={ind} padding='12px'>
                <Grid container spacing={1}>
                  {portfolioHeadCells.map((item) => (
                    <Grid item xs={6} sm={4} key={item.id}>
                      <small className='text-secondary weight-500'>
                        {item.label}
                      </small>
                      <Box mt='6px'>{item.html(row, ind)}</Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))
          ) : (
            <Box className='flex items-center justify-center' p={2}>
              <p>No Positions</p>
            </Box>
          )
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <Box key={order.order_id} padding='12px'>
              <Grid container spacing={1}>
                {orderHeadCells.map((item) => (
                  <Grid item key={item.id} xs={6} sm={4}>
                    <small className='text-secondary weight-500'>
                      {item.label}
                    </small>
                    <Box mt='6px'>{item.html(order)}</Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))
        ) : (
          <Box className='flex items-center justify-center' p={2}>
            <p>No Positions</p>
          </Box>
        )
      ) : (
        <table className='perpsFooterTable'>
          <thead>
            <tr>
              {(selectedItem === 'Portfolio'
                ? portfolioHeadCells
                : orderHeadCells
              ).map((item) => (
                <th key={item.id} align='left' className='border-bottom'>
                  <Box p='6px' height='40px' className='flex items-center'>
                    <small className='text-secondary weight-500'>
                      {item.label}
                    </small>
                  </Box>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {selectedItem === 'Portfolio' ? (
              rows && rows.length > 0 ? (
                rows.map((row, ind) => (
                  <tr key={ind}>
                    {portfolioHeadCells.map((cell) => (
                      <td key={cell.id}>
                        <Box p='6px'>{cell.html(row, ind)}</Box>
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={portfolioHeadCells.length}>
                    <Box className='flex items-center justify-center' py={2}>
                      <p>No Positions</p>
                    </Box>
                  </td>
                </tr>
              )
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.order_id}>
                  {orderHeadCells.map((cell) => (
                    <td key={cell.id}>
                      <Box p='6px' height='40px' className='flex items-center'>
                        {cell.html(order)}
                      </Box>
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={orderHeadCells.length}>
                  <Box className='flex items-center justify-center' py={2}>
                    <p>No Orders</p>
                  </Box>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};
