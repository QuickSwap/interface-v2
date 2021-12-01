import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ChainId, Token } from '@uniswap/sdk';
import { CurrencyLogo, CustomTable } from 'components';
import { useBookmarkTokens } from 'state/application/hooks';
import { ReactComponent as StarChecked } from 'assets/images/StarChecked.svg';
import { ReactComponent as StarUnchecked } from 'assets/images/StarUnchecked.svg';

const useStyles = makeStyles(({}) => ({
  priceChangeWrapper: {
    height: 25,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderRadius: 16,
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

const TokensTable: React.FC<TokensTableProps> = ({ data }) => {
  const tokenHeadCells = headCells();
  const classes = useStyles();
  const {
    bookmarkTokens,
    addBookmarkToken,
    removeBookmarkToken,
  } = useBookmarkTokens();
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
          <Box
            className={classes.priceChangeWrapper}
            bgcolor={
              Number(token.priceChangeUSD) > 0
                ? 'rgba(15, 198, 121, 0.1)'
                : Number(token.priceChangeUSD) < 0
                ? 'rgba(255, 82, 82, 0.1)'
                : 'rgba(99, 103, 128, 0.1)'
            }
            color={
              Number(token.priceChangeUSD) > 0
                ? 'rgb(15, 198, 121)'
                : Number(token.priceChangeUSD) < 0
                ? 'rgb(255, 82, 82)'
                : 'rgb(99, 103, 128)'
            }
          >
            <Typography variant='body2'>
              {Number(token.priceChangeUSD) < 0.001 &&
              Number(token.priceChangeUSD) > 0
                ? '<0.001'
                : Number(token.priceChangeUSD) > -0.001 &&
                  Number(token.priceChangeUSD) < 0
                ? '>-0.001'
                : (Number(token.priceChangeUSD) > 0 ? '+' : '') +
                  Number(token.priceChangeUSD).toLocaleString()}
              %
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
