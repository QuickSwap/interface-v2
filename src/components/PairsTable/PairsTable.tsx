import React from 'react';
import { Box, Typography, Divider } from '@material-ui/core';
import { Link } from 'react-router-dom';
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
  const mobileHTML = (pair: any, index: number) => {
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
    return (
      <Box mt={index === 0 ? 0 : 3}>
        <Box display='flex' alignItems='center' mb={1}>
          <Box
            display='flex'
            mr={1}
            onClick={() => {
              const pairIndex = bookmarkPairs.indexOf(pair.id);
              if (pairIndex === -1) {
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
          <Link
            to={`/analytics/pair/${pair.id}`}
            style={{ textDecoration: 'none' }}
          >
            <Box display='flex' alignItems='center'>
              <DoubleCurrencyLogo
                currency0={token0}
                currency1={token1}
                size={28}
              />
              <Box ml={1}>
                <Typography variant='body1' color='textPrimary'>
                  {token0.symbol} / {token1.symbol}
                </Typography>
              </Box>
            </Box>
          </Link>
        </Box>
        <Divider />
        <Box
          mt={1}
          display='flex'
          alignItems='center'
          justifyContent='space-between'
        >
          <Typography variant='body1'>Liquidity</Typography>
          <Typography variant='body1'>
            ${Number(liquidity).toLocaleString()}
          </Typography>
        </Box>
        <Box
          mt={1}
          display='flex'
          alignItems='center'
          justifyContent='space-between'
        >
          <Typography variant='body1'>24h Volume</Typography>
          <Typography variant='body1'>
            ${Number(liquidity).toLocaleString()}
          </Typography>
        </Box>
        <Box
          mt={1}
          display='flex'
          alignItems='center'
          justifyContent='space-between'
        >
          <Typography variant='body1'>7d Volume</Typography>
          <Typography variant='body1'>
            ${Number(oneDayVolume).toLocaleString()}
          </Typography>
        </Box>
        <Box
          mt={1}
          display='flex'
          alignItems='center'
          justifyContent='space-between'
        >
          <Typography variant='body1'>24h Fees</Typography>
          <Typography variant='body1'>
            ${Number(oneWeekVolume).toLocaleString()}
          </Typography>
        </Box>
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
    const oneDayVolume =
      pair.oneDayVolumeUSD && !isNaN(pair.oneDayVolumeUSD)
        ? pair.oneDayVolumeUSD
        : pair.oneDayVolumeUntracked && !isNaN(pair.oneDayVolumeUntracked)
        ? pair.oneDayVolumeUntracked
        : 0;
    const oneWeekVolume =
      pair.oneWeekVolumeUSD && !isNaN(pair.oneWeekVolumeUSD)
        ? pair.oneWeekVolumeUSD
        : pair.oneWeekVolumeUntracked && !isNaN(pair.oneWeekVolumeUntracked)
        ? pair.oneWeekVolumeUntracked
        : 0;
    const oneDayFee = (Number(oneDayVolume) * 0.003).toLocaleString();
    return [
      {
        html: (
          <Box display='flex' alignItems='center'>
            <Box
              display='flex'
              mr={1}
              onClick={() => {
                const pairIndex = bookmarkPairs.indexOf(pair.id);
                if (pairIndex === -1) {
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
            <Link
              to={`/analytics/pair/${pair.id}`}
              style={{ textDecoration: 'none' }}
            >
              <Box display='flex' alignItems='center'>
                <DoubleCurrencyLogo
                  currency0={token0}
                  currency1={token1}
                  size={28}
                />
                <Box ml={1}>
                  <Typography variant='body1' color='textPrimary'>
                    {token0.symbol} / {token1.symbol}
                  </Typography>
                </Box>
              </Box>
            </Link>
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
