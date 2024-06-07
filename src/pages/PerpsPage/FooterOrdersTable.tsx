import React, { useEffect, useMemo, useState } from 'react';
import { useOrderStream } from '@orderly.network/hooks';
import {
  AlgoOrderRootType,
  OrderSide,
  OrderStatus,
  OrderType,
} from '@orderly.network/types';
import './Layout.scss';
import { Box, Grid, useMediaQuery, useTheme } from '@material-ui/core';
import { formatNumber, getPerpsSymbol } from 'utils';
import dayjs from 'dayjs';
import { CancelOrderButton } from './CancelOrderButton';
import { FooterPagination } from './FooterPagination';

type Order = {
  symbol: string;
  price: number;
  quantity: number;
  created_time: string;
  order_id?: number;
  algo_order_id?: number;
  side: OrderSide;
  type: OrderType;
  status?: OrderStatus;
  algo_status?: OrderStatus;
  algo_type?: string;
  total_executed_quantity: number;
  average_executed_price: number;
  total_fee: number;
  reduce_only?: boolean;
  visible_quantity?: number;
  trigger_price?: number;
  trigger_price_type?: string;
  root_algo_order_id?: number;
  root_algo_status?: string;
};

const FooterOrdersTable: React.FC<{
  token?: string;
  selectedItem: string;
  selectedSide: string;
  setToken?: (token: string) => void;
}> = ({ token, selectedItem, selectedSide, setToken }) => {
  const [countPerPage, setCountPerPage] = useState(5);
  const [pageIndex, setPageIndex] = useState(0);

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

  const [o, { cancelOrder, cancelAlgoOrder, isLoading }] = useOrderStream({
    symbol: token,
    status: orderStatus,
    excludes: [AlgoOrderRootType.TP_SL, AlgoOrderRootType.POSITIONAL_TP_SL],
  });

  const orders = o as Order[] | null;

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((order) =>
      selectedSide === 'all'
        ? true
        : order.side.toLowerCase() === selectedSide.toLowerCase(),
    );
  }, [orders, selectedSide]);

  const showTriggerPriceCol = !!filteredOrders.find(
    (order) => !!order.algo_order_id,
  );

  useEffect(() => {
    setPageIndex(0);
  }, [selectedItem, selectedSide]);

  const orderHeadCells = [
    {
      id: 'instrument',
      label: 'Instrument',
      html: (item: Order) => (
        <small
          className={setToken ? 'cursor-pointer' : ''}
          onClick={() => {
            if (setToken) {
              setToken(item.symbol);
            }
          }}
        >
          {getPerpsSymbol(item.symbol)}
        </small>
      ),
    },
    {
      id: 'type',
      label: 'Type',
      html: (item: Order) => (
        <small>
          {item.algo_order_id ? 'STOP ' : ''}
          {item.type}
        </small>
      ),
    },
    {
      id: 'side',
      label: 'Side',
      html: (item: Order) => (
        <small
          className={
            item.side === OrderSide.BUY ? 'text-success' : 'text-error'
          }
        >
          {item.side}
        </small>
      ),
    },
    {
      id: 'quantity',
      label: 'Filled / Quantity',
      html: (item: Order) => (
        <small
          className={
            item.side === OrderSide.BUY ? 'text-success' : 'text-error'
          }
        >
          {formatNumber(item.total_executed_quantity)} /
          {formatNumber(item.quantity)}
        </small>
      ),
    },
    {
      id: 'price',
      label: 'Order Price',
      html: (item: Order) => (
        <small>
          {!Number(item.price) ? 'Market' : formatNumber(item.price)}
        </small>
      ),
    },
    ...(showTriggerPriceCol
      ? [
          {
            id: 'triggerPrice',
            label: 'Trigger',
            html: (item: Order) => (
              <small>
                {item.trigger_price ? formatNumber(item.trigger_price) : '-'}
              </small>
            ),
          },
        ]
      : []),
    {
      id: 'avgPrice',
      label: 'Avg. Price',
      html: (item: Order) => (
        <small>{formatNumber(item.average_executed_price)}</small>
      ),
    },
    {
      id: 'estTotal',
      label: 'Est. total',
      html: (item: Order) => (
        <small>
          {formatNumber(
            (item.average_executed_price > 0
              ? item.average_executed_price
              : item.trigger_price
              ? item.trigger_price
              : item.price) * item.quantity,
          )}
        </small>
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
      html: (item: Order) => <small>{item.status ?? item.algo_status}</small>,
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
                <CancelOrderButton
                  order_id={item.order_id ?? item.algo_order_id}
                  symbol={item.symbol}
                  cancelOrder={
                    item.algo_order_id ? cancelAlgoOrder : cancelOrder
                  }
                />
              ),
          },
        ]),
  ];

  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));

  return (
    <div>
      {isMobile ? (
        filteredOrders.length > 0 ? (
          filteredOrders
            .slice(countPerPage * pageIndex, countPerPage * (pageIndex + 1))
            .map((order) => (
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
            <p>{isLoading ? 'Loading...' : 'No Orders'}</p>
          </Box>
        )
      ) : (
        <div className='perpsFooterTable'>
          <table>
            <thead>
              <tr>
                {orderHeadCells.map((item) => (
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
              {filteredOrders.length > 0 ? (
                filteredOrders
                  .slice(
                    countPerPage * pageIndex,
                    countPerPage * (pageIndex + 1),
                  )
                  .map((order) => (
                    <tr key={order.order_id}>
                      {orderHeadCells.map((cell) => (
                        <td key={cell.id}>
                          <Box
                            p='6px'
                            height='40px'
                            className='flex items-center'
                          >
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
                      <p>{isLoading ? 'Loading...' : 'No Orders'}</p>
                    </Box>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {filteredOrders.length > 5 && (
        <FooterPagination
          countPerPage={countPerPage}
          setCountPerPage={setCountPerPage}
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
          dataCount={filteredOrders.length}
        />
      )}
    </div>
  );
};

export default React.memo(FooterOrdersTable);
