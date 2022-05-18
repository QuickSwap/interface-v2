import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Divider } from '@material-ui/core';
import { getAddress } from '@ethersproject/address';
import { ChainId, Token } from '@uniswap/sdk';
import { CurrencyLogo, CustomTable } from 'components';
import { GlobalConst } from 'constants/index';
import { formatNumber, getFormattedPrice, getPriceClass } from 'utils';
import { useBookmarkTokens } from 'state/application/hooks';
import { ReactComponent as StarChecked } from 'assets/images/StarChecked.svg';
import { ReactComponent as StarUnchecked } from 'assets/images/StarUnchecked.svg';
import 'components/styles/TokensTable.scss';

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
    sortKey: (item: any) => item.priceUSD,
  },
  {
    id: 'tokenUpPercent',
    numeric: false,
    label: '24H %',
    sortKey: (item: any) => item.priceChangeUSD,
  },
  {
    id: 'tokenVolume',
    numeric: false,
    label: '24H Volume',
    sortKey: (item: any) => item.oneDayVolumeUSD,
  },
  {
    id: 'tokenLiquidity',
    numeric: false,
    label: 'Liquidity',
    align: 'right',
    sortKey: (item: any) => item.totalLiquidityUSD,
  },
];

const liquidityHeadCellIndex = 4;

const TokensTable: React.FC<TokensTableProps> = ({ data }) => {
  const tokenHeadCells = headCells();
  const {
    bookmarkTokens,
    addBookmarkToken,
    removeBookmarkToken,
  } = useBookmarkTokens();
  const mobileHTML = (token: any, index: number) => {
    const tokenCurrency = new Token(
      ChainId.MATIC,
      getAddress(token.id),
      Number(token.decimals),
      token.symbol,
      token.name,
    );
    const priceClass = getPriceClass(Number(token.priceChangeUSD));
    return (
      <Box mt={index === 0 ? 0 : 3}>
        <Box display='flex' alignItems='center' mb={1}>
          <Box
            display='flex'
            mr={1}
            onClick={() => {
              const tokenIndex = bookmarkTokens.indexOf(token.id);
              if (tokenIndex === -1) {
                addBookmarkToken(token.id);
              } else {
                removeBookmarkToken(token.id);
              }
            }}
          >
            {bookmarkTokens.indexOf(token.id) > -1 ? (
              <StarChecked />
            ) : (
              <StarUnchecked />
            )}
          </Box>
          <Link
            to={`/analytics/token/${tokenCurrency.address}`}
            style={{ textDecoration: 'none' }}
          >
            <Box display='flex' alignItems='center'>
              <CurrencyLogo currency={tokenCurrency} size='28px' />
              <Box ml={1}>
                <p className='text-gray25'>
                  {token.name}{' '}
                  <span className='text-hint'>({token.symbol})</span>
                </p>
              </Box>
            </Box>
          </Link>
        </Box>
        <Divider />
        <Box className='mobileRow'>
          <p>Price</p>
          <p>${formatNumber(token.priceUSD)}</p>
        </Box>
        <Box className='mobileRow'>
          <p>24H %</p>
          <Box className={`priceChangeWrapper ${priceClass}`}>
            <small>{getFormattedPrice(Number(token.priceChangeUSD))}%</small>
          </Box>
        </Box>
        <Box className='mobileRow'>
          <p>24H Volume</p>
          <p>${Number(token.oneDayVolumeUSD).toLocaleString()}</p>
        </Box>
        <Box className='mobileRow'>
          <p>Liquidity</p>
          <p>${Number(token.totalLiquidityUSD).toLocaleString()}</p>
        </Box>
      </Box>
    );
  };

  const desktopHTML = (token: any) => {
    const tokenCurrency = new Token(
      ChainId.MATIC,
      getAddress(token.id),
      Number(token.decimals),
      token.symbol,
      token.name,
    );
    const priceClass = getPriceClass(Number(token.priceChangeUSD));

    return [
      {
        html: (
          <Box display='flex' alignItems='center'>
            <Box
              display='flex'
              mr={1}
              onClick={() => {
                const tokenIndex = bookmarkTokens.indexOf(token.id);
                if (tokenIndex === -1) {
                  addBookmarkToken(token.id);
                } else {
                  removeBookmarkToken(token.id);
                }
              }}
            >
              {bookmarkTokens.indexOf(token.id) > -1 ? (
                <StarChecked />
              ) : (
                <StarUnchecked />
              )}
            </Box>
            <Link
              to={`/analytics/token/${tokenCurrency.address}`}
              style={{ textDecoration: 'none' }}
            >
              <Box display='flex' alignItems='center'>
                <CurrencyLogo currency={tokenCurrency} size='28px' />
                <Box ml={1}>
                  <p className='text-gray25'>
                    {token.name}{' '}
                    <span className='text-hint'>({token.symbol})</span>
                  </p>
                </Box>
              </Box>
            </Link>
          </Box>
        ),
      },
      {
        html: (
          <Box>
            <p>${Number(token.priceUSD).toLocaleString()}</p>
          </Box>
        ),
      },
      {
        html: (
          <Box className={`priceChangeWrapper ${priceClass}`} mr={2}>
            <small>{getFormattedPrice(Number(token.priceChangeUSD))}%</small>
          </Box>
        ),
      },
      {
        html: <p>${Number(token.oneDayVolumeUSD).toLocaleString()}</p>,
      },
      {
        html: <p>${Number(token.totalLiquidityUSD).toLocaleString()}</p>,
      },
    ];
  };

  return (
    <CustomTable
      defaultOrderBy={tokenHeadCells[liquidityHeadCellIndex]}
      defaultOrder='desc'
      showPagination={data.length > GlobalConst.utils.ROWSPERPAGE}
      headCells={tokenHeadCells}
      rowsPerPage={GlobalConst.utils.ROWSPERPAGE}
      data={data}
      mobileHTML={mobileHTML}
      desktopHTML={desktopHTML}
    />
  );
};

export default TokensTable;
