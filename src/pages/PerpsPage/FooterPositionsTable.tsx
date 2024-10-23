import React, { useEffect, useState } from 'react';
import { useOrderStream, usePositionStream } from '@orderly.network/hooks';
import {
  API,
  AlgoOrderRootType,
  AlgoOrderType,
  OrderStatus,
} from '@orderly.network/types';
import './Layout.scss';
import { Box, Grid, useMediaQuery, useTheme } from '@material-ui/core';
import { formatNumber, getPerpsSymbol } from 'utils';
import { ClosePositionButton } from './ClosePositionButton';
import { formatDecimalInput } from 'utils/numbers';
import { useQuery } from '@tanstack/react-query';
import { FooterPagination } from './FooterPagination';
import { TPSLButton } from './TPSLButton';

const FooterPositionsTable: React.FC<{
  token?: string;
  setToken?: (token: string) => void;
}> = ({ token, setToken }) => {
  const [{ rows }] = usePositionStream(token);
  const [countPerPage, setCountPerPage] = useState(5);
  const [pageIndex, setPageIndex] = useState(0);

  const [positionQtyInputs, setPositionQtyInputs] = useState<string[]>([]);
  const [positionPriceInputs, setPositionPriceInputs] = useState<string[]>([]);

  const [orders] = useOrderStream({
    includes: [AlgoOrderRootType.TP_SL, AlgoOrderRootType.POSITIONAL_TP_SL],
    status: OrderStatus.NEW,
  });

  const qtyStr = rows
    ?.map((row) => Math.abs(row.position_qty).toString())
    .join('_');

  useEffect(() => {
    if (qtyStr) {
      setPositionQtyInputs(qtyStr.split('_'));
      setPositionPriceInputs(qtyStr.split('_').map(() => ''));
    }
  }, [qtyStr]);

  useEffect(() => {
    setPageIndex(0);
  }, []);

  const { data: orderFiltersData } = useQuery({
    queryKey: ['orderly-filters'],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.REACT_APP_ORDERLY_API_URL}/v1/public/info`,
      );
      const data = await res.json();
      return data?.data?.rows ?? [];
    },
  });

  const orderFilters: any[] = orderFiltersData ?? [];

  const portfolioHeadCells = [
    {
      id: 'instrument',
      label: 'Instrument',
      html: (item: API.PositionExt) => (
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
      id: 'quantity',
      label: 'Quantity',
      html: (item: API.PositionExt) => (
        <small
          className={
            Number(item.position_qty) > 0
              ? 'text-success'
              : Number(item.position_qty) < 0
              ? 'text-error'
              : ''
          }
        >
          {formatNumber(item.position_qty)}
        </small>
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
        <small className={item.est_liq_price ? 'text-yellow' : ''}>
          {item.est_liq_price ? formatNumber(item.est_liq_price) : '-'}
        </small>
      ),
    },
    {
      id: 'unrealPNL',
      label: 'Unreal. PnL',
      html: (item: API.PositionExt) => (
        <small
          className={
            Number(item.unrealized_pnl) > 0
              ? 'text-success'
              : Number(item.unrealized_pnl) < 0
              ? 'text-error'
              : ''
          }
        >
          {formatNumber(item.unrealized_pnl)} (
          {formatNumber(item.unrealized_pnl_ROI * 100)}%)
        </small>
      ),
    },
    {
      id: 'tpsl',
      label: 'TP/SL',
      html: (item: API.PositionExt) => {
        const tpSLOrder = orders?.find((order) => order.symbol === item.symbol);
        const tpOrder = tpSLOrder?.child_orders.find(
          (order: any) => order.algo_type === AlgoOrderType.TAKE_PROFIT,
        );
        const slOrder = tpSLOrder?.child_orders.find(
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
            {!tpOrder && !slOrder && <small>-</small>}
          </Box>
        );
      },
    },
    {
      id: 'estTotal',
      label: 'Est. total',
      html: (item: API.PositionExt) => (
        <small>
          {formatNumber(Math.abs(item.mark_price * item.position_qty))}
        </small>
      ),
    },
    {
      id: 'margin',
      label: 'Margin',
      html: (item: API.PositionExt) => (
        <small>
          {formatNumber(
            Math.abs(item.mmr * item.mark_price * item.position_qty),
          )}
        </small>
      ),
    },
    {
      id: 'qtyInput',
      label: 'Qty.',
      html: (pos: API.PositionExt, ind: number) => (
        <input
          className='perpsTableInput'
          value={positionQtyInputs[ind] ?? ''}
          onChange={(e) => {
            const orderFilter = orderFilters.find(
              (item) => item.symbol === pos.symbol,
            );
            const value = formatDecimalInput(
              e.target.value,
              orderFilter && orderFilter.base_tick > 0
                ? Math.log10(1 / Number(orderFilter.base_tick))
                : undefined,
            );
            if (value !== null) {
              setPositionQtyInputs([
                ...positionQtyInputs.slice(0, ind),
                value,
                ...positionQtyInputs.slice(ind + 1),
              ]);
            }
          }}
        />
      ),
    },
    {
      id: 'priceInput',
      label: 'Price',
      html: (pos: API.PositionExt, ind: number) => (
        <input
          className='perpsTableInput'
          placeholder='Market'
          value={positionPriceInputs[ind] ?? ''}
          onChange={(e) => {
            const orderFilter = orderFilters.find(
              (item) => item.symbol === pos.symbol,
            );
            const value = formatDecimalInput(
              e.target.value,
              orderFilter && orderFilter.quote_tick > 0
                ? Math.log10(1 / Number(orderFilter.quote_tick))
                : undefined,
            );
            if (value !== null) {
              setPositionPriceInputs([
                ...positionPriceInputs.slice(0, ind),
                value,
                ...positionPriceInputs.slice(ind + 1),
              ]);
            }
          }}
        />
      ),
    },
    {
      id: 'action',
      label: '',
      html: (item: API.PositionExt, ind: number) => {
        const tpSLOrder = orders?.find((order) => order.symbol === item.symbol);
        return (
          <Box className='flex items-center' gridGap={6}>
            <ClosePositionButton
              position={item}
              quantity={Number(positionQtyInputs[ind] ?? '0')}
              price={
                !positionPriceInputs[ind] || positionPriceInputs[ind] === ''
                  ? undefined
                  : Number(positionPriceInputs[ind])
              }
            />
            <TPSLButton
              defaultOrder={tpSLOrder}
              position={item}
              maxQuantity={Number(positionQtyInputs[ind] ?? '0')}
            />
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
        rows && rows.length > 0 ? (
          rows
            .slice(countPerPage * pageIndex, countPerPage * (pageIndex + 1))
            .map((row, ind) => (
              <Box key={ind} padding='12px'>
                <Grid container spacing={1}>
                  {portfolioHeadCells.map((item) => (
                    <Grid item xs={6} sm={4} key={item.id}>
                      <small className='text-secondary weight-500'>
                        {item.label}
                      </small>
                      <Box mt='6px'>
                        {item.html(row, countPerPage * pageIndex + ind)}
                      </Box>
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
              {rows && rows.length > 0 ? (
                rows
                  .slice(
                    countPerPage * pageIndex,
                    countPerPage * (pageIndex + 1),
                  )
                  .map((row, ind) => (
                    <tr key={ind}>
                      {portfolioHeadCells.map((cell) => (
                        <td key={cell.id}>
                          <Box p='6px'>
                            {cell.html(row, countPerPage * pageIndex + ind)}
                          </Box>
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
      {rows && rows.length > 5 && (
        <FooterPagination
          countPerPage={countPerPage}
          setCountPerPage={setCountPerPage}
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
          dataCount={rows.length}
        />
      )}
    </div>
  );
};

export default React.memo(FooterPositionsTable);
