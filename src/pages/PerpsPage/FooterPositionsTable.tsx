import React, { useEffect, useState } from 'react';
import { usePositionStream } from '@orderly.network/hooks';
import { API } from '@orderly.network/types';
import './Layout.scss';
import { Box, Grid, useMediaQuery, useTheme } from '@material-ui/core';
import { formatNumber } from 'utils';
import { ClosePositionButton } from './ClosePositionButton';
import { formatDecimalInput } from 'utils/numbers';
import { useQuery } from '@tanstack/react-query';
import { FooterPagination } from './FooterPagination';

const FooterPositionsTable: React.FC<{ token?: string }> = ({ token }) => {
  const [{ rows }] = usePositionStream(token);
  const [countPerPage, setCountPerPage] = useState(5);
  const [pageIndex, setPageIndex] = useState(0);

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
        <small>{item.symbol.replace('PERP_', '')}</small>
      ),
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
      html: (item: API.PositionExt, ind: number) => (
        <ClosePositionButton
          position={item}
          quantity={Number(positionQtyInputs[ind] ?? '0')}
          price={
            !positionPriceInputs[ind] || positionPriceInputs[ind] === ''
              ? undefined
              : Number(positionPriceInputs[ind])
          }
        />
      ),
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
