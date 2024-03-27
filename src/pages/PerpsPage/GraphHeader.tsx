import React, { useState, useEffect } from 'react';
import { useMarketsStream } from '@orderly.network/hooks';
import { SearchOutlined } from '@material-ui/icons';
import { Box, Popover } from '@material-ui/core';
import { formatNumber } from 'utils';
import { WSMessage } from '@orderly.network/types';

interface MarketData {
  symbol: string;
  index_price: number;
  mark_price: number;
  sum_unitary_funding: number;
  est_funding_rate: number;
  last_funding_rate: number;
  next_funding_time: number;
  open_interest: number;
  '24h_open': number;
  '24h_close': number;
  '24h_high': number;
  '24h_low': number;
  '24h_volume': number;
  '24h_amount': number;
  '24h_volumn': number;
  change: number;
}

interface Props {
  setTokenName: (token: string) => void;
}

export const GraphHeader: React.FC<Props> = ({ setTokenName }) => {
  const { data } = useMarketsStream();
  const [tokenSymbol, setTokenSymbol] = useState<string | null>();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const handleTokenSelect = (token: any) => {
    setTokenSymbol(token.symbol);
    setTokenName(token.symbol);
    handleClose();
  };

  useEffect(() => {
    setTokenSymbol('PERP_ETH_USDC');
  }, []);

  const token: any = data?.find((item) => item.symbol === tokenSymbol);

  return (
    <Box className='border flex items-center' height='48px' gridGap={12}>
      <Box className='perpsTokenSelect' onClick={handleClick}>
        {token ? token.symbol.replace("_USDC", "").replace("_", "-") : 'Tokens'}
      </Box>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <div style={{ position: 'relative' }}>
          <input
            type='text'
            placeholder='Search'
            style={{
              width: '100%',
              marginBottom: '20px',
              padding: '10px 35px 10px 10px',
              borderRadius: '4px',
              border: '1px solid #61657a',
              backgroundColor: '#2c303e',
              color: '#c7cad9',
              fontFamily: 'Inter',
              fontSize: '14px',
              fontWeight: 500,
            }}
          />
          <SearchOutlined
            style={{
              position: 'absolute',
              right: '10px',
              top: '35%',
              transform: 'translateY(-50%)',
              color: '#61657a',
            }}
          />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr
              style={{
                fontFamily: 'Inter',
                fontSize: 12,
                fontWeight: 500,
                color: '#61657a',
              }}
            >
              <th style={{ textAlign: 'start' }}>Instrument</th>
              <th style={{ textAlign: 'end' }}>Last</th>
              <th style={{ textAlign: 'end' }}>24h%</th>
              <th style={{ textAlign: 'end' }}>Volume</th>
            </tr>
          </thead>
          <tbody
            style={{
              fontFamily: 'Inter',
              fontSize: 14,
              fontWeight: 500,
              color: '#c7cad9',
            }}
          >
            {data ? (
              data.map((item: any, index) => (
                <tr
                  key={index}
                  onClick={() => handleTokenSelect(item)}
                  style={{
                    margin: '7px 0',
                    cursor: 'pointer',
                  }}
                  className='hover-row'
                >
                  <td
                    style={{
                      textAlign: 'start',
                      verticalAlign: 'middle',
                      margin: '0 5px',
                    }}
                  >
                    {item.symbol.replace("_USDC", "").replace("_", "-")}
                  </td>
                  <td style={{ textAlign: 'end', verticalAlign: 'middle' }}>
                    {item?.index_price}
                  </td>
                  <td
                    style={{
                      textAlign: 'end',
                      verticalAlign: 'middle',
                      color: (item?.change ?? 0) < 0 ? 'red' : '#51b29f',
                    }}
                  >
                    {formatNumber(item?.change)}
                  </td>
                  <td style={{ textAlign: 'end', verticalAlign: 'middle' }}>
                    {item?.['24h_volume']}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  style={{ textAlign: 'center', verticalAlign: 'middle' }}
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Popover>

      {/* Render Token Info */}
      <p>{token?.mark_price}</p>
      {/* Additional Flex Columns */}
      <Box>
        <p className='span text-secondary'>24h Change</p>
        <p
          className={`span weight-500 ${
            (token?.change ?? 0) < 0 ? 'text-error' : 'text-success'
          }`}
        >
          {formatNumber(token?.change)}
        </p>
      </Box>
      <Box>
        <p className='span text-secondary'>Mark</p>
        <p className='span'>{token?.mark_price}</p>
      </Box>
      <Box>
        <p className='span text-secondary'>Index</p>
        <p className='span'>{token?.index_price}</p>
      </Box>
      <Box>
        <p className='span text-secondary'>24h Volume</p>
        <p className='span'>{token?.['24h_volume']}</p>
      </Box>
      <Box>
        <p className='span text-secondary'>Funding Rate</p>
        <p className='span'>{token?.est_funding_rate}</p>
      </Box>
      <Box>
        <p className='span text-secondary'>Open Interest</p>
        <p className='span'>{token?.open_interest}</p>
      </Box>
    </Box>
  );
};
