import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Divider } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { getAddress } from '@ethersproject/address';
import { ChainId, Token } from '@uniswap/sdk';
import { CurrencyLogo, CustomTable } from 'components';
import { ROWSPERPAGE } from 'constants/index';
import { getformattedValue } from 'utils';
import { useBookmarkTokens } from 'state/application/hooks';
import { ReactComponent as StarChecked } from 'assets/images/StarChecked.svg';
import { ReactComponent as StarUnchecked } from 'assets/images/StarUnchecked.svg';

const useStyles = makeStyles(({}) => ({
  priceChangeWrapper: {
    height: 25,
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  mobileRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: '8px 0',
  },
}));

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
  const classes = useStyles();
  const { palette } = useTheme();
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
                <Typography
                  variant='body1'
                  style={{ color: palette.text.primary }}
                >
                  {token.name}{' '}
                  <span style={{ color: palette.text.hint }}>
                    ({token.symbol})
                  </span>
                </Typography>
              </Box>
            </Box>
          </Link>
        </Box>
        <Divider />
        <Box className={classes.mobileRow}>
          <Typography variant='body1'>Price</Typography>
          <Typography variant='body1'>
            ${Number(token.priceUSD).toLocaleString()}
          </Typography>
        </Box>
        <Box className={classes.mobileRow}>
          <Typography variant='body1'>24H %</Typography>
          <Box
            className={classes.priceChangeWrapper}
            bgcolor={
              Number(token.priceChangeUSD) > 0
                ? palette.success.light
                : Number(token.priceChangeUSD) < 0
                ? palette.error.light
                : palette.grey.A100
            }
            color={
              Number(token.priceChangeUSD) > 0
                ? palette.success.main
                : Number(token.priceChangeUSD) < 0
                ? palette.error.main
                : palette.text.hint
            }
          >
            <Typography variant='body2'>
              {getformattedValue(Number(token.priceChangeUSD))}%
            </Typography>
          </Box>
        </Box>
        <Box className={classes.mobileRow}>
          <Typography variant='body1'>24H Volume</Typography>
          <Typography variant='body1'>
            ${Number(token.oneDayVolumeUSD).toLocaleString()}
          </Typography>
        </Box>
        <Box className={classes.mobileRow}>
          <Typography variant='body1'>Liquidity</Typography>
          <Typography variant='body1'>
            ${Number(token.totalLiquidityUSD).toLocaleString()}
          </Typography>
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
                  <Typography
                    variant='body1'
                    style={{ color: palette.text.primary }}
                  >
                    {token.name}{' '}
                    <span style={{ color: palette.text.hint }}>
                      ({token.symbol})
                    </span>
                  </Typography>
                </Box>
              </Box>
            </Link>
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
          <Box
            className={classes.priceChangeWrapper}
            mr={2}
            bgcolor={
              Number(token.priceChangeUSD) > 0
                ? palette.success.light
                : Number(token.priceChangeUSD) < 0
                ? palette.error.light
                : palette.grey.A100
            }
            color={
              Number(token.priceChangeUSD) > 0
                ? palette.success.main
                : Number(token.priceChangeUSD) < 0
                ? palette.error.main
                : palette.text.hint
            }
          >
            <Typography variant='body2'>
              {getformattedValue(Number(token.priceChangeUSD))}%
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
      defaultOrderBy={tokenHeadCells[liquidityHeadCellIndex]}
      defaultOrder='desc'
      showPagination={data.length > ROWSPERPAGE}
      headCells={tokenHeadCells}
      rowsPerPage={ROWSPERPAGE}
      data={data}
      mobileHTML={mobileHTML}
      desktopHTML={desktopHTML}
    />
  );
};

export default TokensTable;
