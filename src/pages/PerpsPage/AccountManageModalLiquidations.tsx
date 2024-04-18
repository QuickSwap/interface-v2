import React from 'react';
import { Box } from '@material-ui/core';
import './Layout.scss';
import { usePrivateQuery } from '@orderly.network/hooks';
import dayjs from 'dayjs';
import { formatNumber } from 'utils';

const AccountManageModalLiquidations: React.FC = () => {
  const { data, isLoading } = usePrivateQuery('/v1/liquidations');
  const results = (data ?? []) as any[];

  return (
    <Box className='accountManageLiquidations'>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Ins. Fund Transfer</th>
            <th>Instrument</th>
            <th>Price (USDC)</th>
            <th>Quantity</th>
            <th>Liquidation Fee</th>
          </tr>
        </thead>
        <tbody>
          {results.length > 0 ? (
            results.map((result) => (
              <tr key={result.liquidation_id}>
                <td>{dayjs(result.timestamp).format('YYYY-MM-DD HH:mm:ss')}</td>
                <td>
                  {formatNumber(result.transfer_amount_to_insurance_fund)}
                </td>
                <td>{result.positions_by_perp[0]?.symbol}</td>
                <td>
                  {formatNumber(result.positions_by_perp[0]?.transfer_price)}
                </td>
                <td>
                  {formatNumber(result.positions_by_perp[0]?.position_qty)}
                </td>
                <td>
                  {formatNumber(
                    result.positions_by_perp[0]?.abs_liquidator_fee,
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>
                <Box className='text-center' py={4}>
                  {isLoading ? 'Loading' : 'No Results Found'}
                </Box>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Box>
  );
};
export default AccountManageModalLiquidations;
