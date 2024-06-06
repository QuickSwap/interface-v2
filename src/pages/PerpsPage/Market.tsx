import React from 'react';
import { useMarketTradeStream } from '@orderly.network/hooks';
import { FC } from 'react';
import './Layout.scss';
import { Box } from '@material-ui/core';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export const Market: FC<{ token?: string }> = ({ token }) => {
  const { data, isLoading } = useMarketTradeStream(token || 'PERP_ETH_USDC');
  if (isLoading)
    return (
      <div
        className='flex justify-center items-center'
        style={{ height: '100%' }}
      >
        Loading...
      </div>
    );

  return (
    <Box className='orderbookTradeTable'>
      {!isLoading && (
        <table>
          <thead>
            <tr>
              <th className='span text-secondary' align='left'>
                Time
              </th>
              <th className='span text-secondary' align='left'>
                Price
              </th>
              <th className='span text-secondary' align='right'>
                Qty(ETH)
              </th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 23).map((item: any, ind: number) => {
              return (
                <tr key={ind}>
                  <td className='span'>
                    {dayjs.utc(item.ts).format('hh:mm:ss')}
                  </td>
                  <td
                    className={`span ${
                      item.side === 'BUY' ? 'text-success' : 'text-error'
                    }`}
                  >
                    {item.price}
                  </td>
                  <td
                    className={`span ${
                      item.side === 'BUY' ? 'text-success' : 'text-error'
                    }`}
                    align='right'
                  >
                    {item.size}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Box>
  );
};
