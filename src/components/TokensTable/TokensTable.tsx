import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { ChainId, Token } from '@uniswap/sdk';
import { CurrencyLogo, CustomTable } from 'components';
import { ReactComponent as StarChecked } from 'assets/images/StarChecked.svg';
import { ReactComponent as StarUnchecked } from 'assets/images/StarUnchecked.svg';

interface TokensTableProps {
  data: any[];
}

const headCells = () => [
  {
    id: 'tokenName',
    numeric: false,
    label: 'Name',
    sortKey: (item: any) => item.name,
  },
  {
    id: 'tokenPrice',
    numeric: false,
    label: 'Price',
    sortKey: (item: any) => item.price,
  },
  {
    id: 'tokenUpPercent',
    numeric: false,
    label: '24H %',
    sortKey: (item: any) => item.percent,
  },
  {
    id: 'tokenVolume',
    numeric: false,
    label: '24H Volume',
    sortKey: (item: any) => item.volume,
  },
  {
    id: 'tokenLiquidity',
    numeric: false,
    label: 'Liquidity',
    align: 'right',
    sortKey: (item: any) => item.liquidity,
  },
];

const TokensTable: React.FC<TokensTableProps> = ({ data }) => {
  const tokenHeadCells = headCells();
  console.log('ccc', data);
  const mobileHTML = (token: any) => {
    return (
      <Box>
        <Typography>Token</Typography>
      </Box>
    );
  };

  const desktopHTML = (token: any) => {
    const tokenCurrency = new Token(
      ChainId.MATIC,
      token.id,
      Number(token.decimals),
    );
    return [
      {
        html: (
          <Box display='flex' alignItems='center'>
            <Box display='flex' mr={1}>
              <StarChecked />
            </Box>
            <CurrencyLogo currency={tokenCurrency} size='28px' />
            <Box ml={1}>
              <Typography variant='body1' style={{ color: '#ebecf2' }}>
                {token.name}{' '}
                <span style={{ color: '#636780' }}>({token.symbol})</span>
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        html: (
          <Box>
            <Typography>${Number(token.priceUSD).toLocaleString()}</Typography>
          </Box>
        ),
      },
      {
        html: (
          <Box>
            <Typography>
              {Number(token.priceChangeUSD).toLocaleString()}%
            </Typography>
          </Box>
        ),
      },
      {
        html: (
          <Box>
            <Typography>
              ${Number(token.oneDayVolumeUSD).toLocaleString()}
            </Typography>
          </Box>
        ),
      },
      {
        html: (
          <Box>
            <Typography>
              ${Number(token.totalLiquidityUSD).toLocaleString()}
            </Typography>
          </Box>
        ),
      },
    ];
  };

  return (
    <CustomTable
      showPagination={data.length > 10}
      headCells={tokenHeadCells}
      rowsPerPage={10}
      data={data}
      mobileHTML={mobileHTML}
      desktopHTML={desktopHTML}
    />
  );
};

export default TokensTable;
