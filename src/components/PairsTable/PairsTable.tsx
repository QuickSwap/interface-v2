import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { ChainId, Token } from '@uniswap/sdk';
import { getAddress } from '@ethersproject/address';
import { DoubleCurrencyLogo, CustomTable } from 'components';
import { useBookmarkPairs } from 'state/application/hooks';
import { ReactComponent as StarChecked } from 'assets/images/StarChecked.svg';
import { ReactComponent as StarUnchecked } from 'assets/images/StarUnchecked.svg';

interface TokensTableProps {
  data: any[];
}

const headCells = () => [
  {
    id: 'pairName',
    numeric: false,
    label: 'Name',
    sortKey: (pair: any) => pair.token0.symbol + ' ' + pair.token1.symbol,
  },
  {
    id: 'pairLiquidity',
    numeric: false,
    label: 'Liquidity',
    sortKey: (pair: any) =>
      pair.trackedReserveUSD ? pair.trackedReserveUSD : pair.reserveUSD,
  },
  {
    id: 'pairdayVolume',
    numeric: false,
    label: '24h Volume',
    sortKey: (pair: any) =>
      pair.oneDayVolumeUSD ? pair.oneDayVolumeUSD : pair.oneDayVolumeUntracked,
  },
  {
    id: 'pairweekVolume',
    numeric: false,
    label: '7d Volume',
    sortKey: (pair: any) =>
      pair.oneWeekVolumeUSD
        ? pair.oneWeekVolumeUSD
        : pair.oneWeekVolumeUntracked,
  },
  {
    id: 'pairdayFee',
    numeric: false,
    label: '24h Fees',
    align: 'right',
    sortKey: (pair: any) =>
      pair.oneDayVolumeUSD ? pair.oneDayVolumeUSD : pair.oneDayVolumeUntracked,
  },
];

const PairTable: React.FC<TokensTableProps> = ({ data }) => {
  const tokenHeadCells = headCells();
  const {
    bookmarkPairs,
    addBookmarkPair,
    removeBookmarkPair,
  } = useBookmarkPairs();
  const mobileHTML = (token: any) => {
    return (
      <Box>
        <Typography>Token</Typography>
      </Box>
    );
  };

  const desktopHTML = (pair: any) => {
    const token0 = new Token(
      ChainId.MATIC,
      getAddress(pair.token0.id),
      Number(pair.token0.decimals),
      pair.token0.symbol,
    );
    const token1 = new Token(
      ChainId.MATIC,
      getAddress(pair.token1.id),
      Number(pair.token1.decimals),
      pair.token1.symbol,
    );
    const liquidity = pair.trackedReserveUSD
      ? pair.trackedReserveUSD
      : pair.reserveUSD;
    const oneDayVolume = pair.oneDayVolumeUSD
      ? pair.oneDayVolumeUSD
      : pair.oneDayVolumeUntracked;
    const oneWeekVolume = pair.oneWeekVolumeUSD
      ? pair.oneWeekVolumeUSD
      : pair.oneWeekVolumeUntracked;
    const oneDayFee = (Number(oneDayVolume) * 0.003).toLocaleString();
    return [
      {
        html: (
          <Box display='flex' alignItems='center'>
            <Box
              display='flex'
              mr={1}
              onClick={() => {
                const tokenIndex = bookmarkPairs.indexOf(pair.id);
                if (tokenIndex === -1) {
                  addBookmarkPair(pair.id);
                } else {
                  removeBookmarkPair(pair.id);
                }
              }}
            >
              {bookmarkPairs.indexOf(pair.id) > -1 ? (
                <StarChecked />
              ) : (
                <StarUnchecked />
              )}
            </Box>
            <DoubleCurrencyLogo
              currency0={token0}
              currency1={token1}
              size={28}
            />
            <Box ml={1}>
              <Typography variant='body1'>
                {token0.symbol} / {token1.symbol}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        html: (
          <Typography variant='body1'>
            ${Number(liquidity).toLocaleString()}
          </Typography>
        ),
      },
      {
        html: (
          <Typography variant='body1'>
            ${Number(oneDayVolume).toLocaleString()}
          </Typography>
        ),
      },
      {
        html: (
          <Typography variant='body1'>
            ${Number(oneWeekVolume).toLocaleString()}
          </Typography>
        ),
      },
      {
        html: <Typography variant='body1'>${oneDayFee}</Typography>,
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

export default PairTable;
