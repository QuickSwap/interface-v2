import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { CustomTable } from 'components';

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
  const mobileHTML = (token: any) => {
    return (
      <Box>
        <Typography>Token</Typography>
      </Box>
    );
  };

  const desktopHTML = (token: any) => {
    return [
      {
        html: (
          <Box>
            <Typography>{token.name}</Typography>
          </Box>
        ),
      },
      {
        html: (
          <Box>
            <Typography>{token.price}</Typography>
          </Box>
        ),
      },
      {
        html: (
          <Box>
            <Typography>{token.percent}</Typography>
          </Box>
        ),
      },
      {
        html: (
          <Box>
            <Typography>{token.volume}</Typography>
          </Box>
        ),
      },
      {
        html: (
          <Box>
            <Typography>{token.liquidity}</Typography>
          </Box>
        ),
      },
    ];
  };

  return (
    <CustomTable
      headCells={tokenHeadCells}
      data={data}
      mobileHTML={mobileHTML}
      desktopHTML={desktopHTML}
    />
  );
};

export default TokensTable;
