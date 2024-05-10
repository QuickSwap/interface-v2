import React, { useEffect, useMemo, useState } from 'react';
import { useOrderStream, usePositionStream } from '@orderly.network/hooks';
import {
  API,
  AlgoOrderRootType,
  AlgoOrderType,
  OrderSide,
  OrderStatus,
} from '@orderly.network/types';
import './Layout.scss';
import { Box, Grid, useMediaQuery, useTheme } from '@material-ui/core';
import { formatNumber, getPerpsSymbol } from 'utils';
import { FooterPagination } from './FooterPagination';
import dayjs from 'dayjs';
import { CancelTPSLOrderButton } from './CancelTPSLOrderButton';
import { TPSLButton } from './TPSLButton';

const FooterTPSLTable: React.FC<{ token?: string; selectedSide: string }> = ({
  token,
  selectedSide,
}) => {
  const [countPerPage, setCountPerPage] = useState(5);
  const [pageIndex, setPageIndex] = useState(0);

  const [{ rows }] = usePositionStream(token);
  const [allOrders] = useOrderStream({
    includes: [AlgoOrderRootType.TP_SL, AlgoOrderRootType.POSITIONAL_TP_SL],
    symbol: token,
    status: OrderStatus.NEW,
  });

  const orders = useMemo(() => {
    if (!allOrders) return [];
    return allOrders.filter((order) =>
      selectedSide === 'all'
        ? true
        : order.side.toLowerCase() === selectedSide.toLowerCase(),
    );
  }, [allOrders, selectedSide]);

  useEffect(() => {
    setPageIndex(0);
  }, []);

  const portfolioHeadCells = [
    {
      id: 'instrument',
      label: 'Instrument',
      html: (item: any) => <small>{getPerpsSymbol(item.symbol)}</small>,
    },
    {
      id: 'side',
      label: 'Side',
      html: (item: any) => (
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
      label: 'Quantity',
      html: (item: any) => (
        <small>
          {Number(item.quantity) === 0
            ? 'Entire Position'
            : formatNumber(item.quantity)}
        </small>
      ),
    },
    {
      id: 'trigger',
      label: 'Trigger',
      html: (item: any) => {
        const tpOrder = item?.child_orders.find(
          (order: any) => order.algo_type === AlgoOrderType.TAKE_PROFIT,
        );
        const slOrder = item?.child_orders.find(
          (order: any) => order.algo_type === AlgoOrderType.STOP_LOSS,
        );

        return (
          <Box minWidth={100}>
            {!!tpOrder?.trigger_price && (
              <p className='small'>
                TP -{' '}
                <small className='text-success'>
                  {formatNumber(tpOrder.trigger_price)}
                </small>
              </p>
            )}
            {!!slOrder?.trigger_price && (
              <p className='small'>
                SL -{' '}
                <small className='text-error'>
                  {formatNumber(slOrder.trigger_price)}
                </small>
              </p>
            )}
          </Box>
        );
      },
    },
    {
      id: 'reduceOnly',
      label: 'Reduce-only',
      html: (item: any) => <small>{item.reduce_only ? 'Yes' : 'No'}</small>,
    },
    {
      id: 'orderTime',
      label: 'Order Time',
      html: (item: any) => (
        <small>{dayjs(item.created_time).format('YYYY-MM-DD HH:mm:ss')}</small>
      ),
    },
    {
      id: 'action',
      label: '',
      html: (item: any) => {
        const position = rows?.find((pos) => pos.symbol === item.symbol);
        return (
          <Box className='flex items-center' gridGap={8}>
            {position && (
              <TPSLButton
                position={position}
                defaultOrder={item}
                label='Edit'
              />
            )}
            <CancelTPSLOrderButton order={item} />
          </Box>
        );
      },
    },
  ];

  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));

  return (
    <div>
      {isMobile ? (
        orders && orders.length > 0 ? (
          orders
            .slice(countPerPage * pageIndex, countPerPage * (pageIndex + 1))
            .map((row, ind) => (
              <Box key={ind} padding='12px'>
                <Grid container spacing={1}>
                  {portfolioHeadCells.map((item) => (
                    <Grid item xs={6} sm={4} key={item.id}>
                      <small className='text-secondary weight-500'>
                        {item.label}
                      </small>
                      <Box mt='6px'>{item.html(row)}</Box>
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
        <div className='perpsFooterTable'>
          <table>
            <thead>
              <tr>
                {portfolioHeadCells.map((item) => (
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
              {orders && orders.length > 0 ? (
                orders
                  .slice(
                    countPerPage * pageIndex,
                    countPerPage * (pageIndex + 1),
                  )
                  .map((row, ind) => (
                    <tr key={ind}>
                      {portfolioHeadCells.map((cell) => (
                        <td key={cell.id}>
                          <Box p='6px'>{cell.html(row)}</Box>
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
              )}
            </tbody>
          </table>
        </div>
      )}
      {orders && orders.length > 5 && (
        <FooterPagination
          countPerPage={countPerPage}
          setCountPerPage={setCountPerPage}
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
          dataCount={orders.length}
        />
      )}
    </div>
  );
};

export default React.memo(FooterTPSLTable);
