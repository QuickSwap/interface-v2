import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography, Grid, Divider } from '@material-ui/core';
import { SwapHoriz } from '@material-ui/icons';
import { Currency, Token } from '@uniswap/sdk';
import { ButtonSwitch, CurrencyLogo } from 'components';
import { getTokenInfo, getEthPrice, formatNumber } from 'utils';
import { unwrappedToken } from 'utils/wrappedCurrency';
import Skeleton from '@material-ui/lab/Skeleton';
import SwapInfoTx from './SwapInfoTx';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  success: {
    color: palette.success.main,
  },
  danger: {
    color: palette.error.main,
  },
  swapIcon: {
    background: '#c5cbe0',
    width: 16,
    height: 16,
    borderRadius: 7,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'black',
    cursor: 'pointer',
    '& svg': {
      width: 14,
    },
  },
}));

const SwapProInfo: React.FC<{ token1?: Token; token2?: Token }> = ({
  token1,
  token2,
}) => {
  const classes = useStyles();
  const [token1Data, setToken1Data] = useState<any>(null);
  const [token2Data, setToken2Data] = useState<any>(null);
  const token1Address = token1?.address;
  const token2Address = token2?.address;
  const currency1 = token1 ? unwrappedToken(token1) : undefined;
  const currency2 = token2 ? unwrappedToken(token2) : undefined;
  const [txFilter, setTxFilter] = useState('5m');

  useEffect(() => {
    async function fetchTokenData() {
      const [newPrice, oneDayPrice] = await getEthPrice();
      if (token1Address) {
        const tokenInfo = await getTokenInfo(
          newPrice,
          oneDayPrice,
          token1Address,
        );
        if (tokenInfo) {
          setToken1Data(tokenInfo[0]);
        }
      }
      if (token2Address) {
        const tokenInfo = await getTokenInfo(
          newPrice,
          oneDayPrice,
          token2Address,
        );
        if (tokenInfo) {
          setToken2Data(tokenInfo[0]);
        }
      }
    }
    fetchTokenData();
  }, [token1Address, token2Address]);

  const TokenInfo: React.FC<{ currency: Currency; tokenData: any }> = ({
    currency,
    tokenData,
  }) => {
    const priceUpPercent = Number(tokenData?.priceChangeUSD);
    return (
      <>
        <Box p={1} display='flex'>
          <CurrencyLogo currency={currency} />
          <Box ml={1} flex={1}>
            <Box display='flex' justifyContent='space-between'>
              <Typography variant='body2'>{currency.symbol}</Typography>
              {tokenData ? (
                <Typography variant='body2'>
                  ${formatNumber(tokenData?.priceUSD)}
                </Typography>
              ) : (
                <Skeleton width={60} height={14} />
              )}
            </Box>
            {tokenData ? (
              <Typography variant='caption'>
                24h:{' '}
                <span
                  className={
                    priceUpPercent > 0 ? classes.success : classes.danger
                  }
                >
                  {formatNumber(priceUpPercent)}%
                </span>
              </Typography>
            ) : (
              <Skeleton width={60} height={12} />
            )}
          </Box>
        </Box>
        <Divider />
      </>
    );
  };

  return (
    <>
      <Box p={1}>
        <Typography variant='body1'>Info:</Typography>
      </Box>
      <Divider />
      {currency1 && <TokenInfo currency={currency1} tokenData={token1Data} />}
      {currency2 && <TokenInfo currency={currency2} tokenData={token2Data} />}
      {currency1 && currency2 && (
        <>
          <Box py={2} px={1}>
            <Box
              mb={1}
              px={1}
              display='flex'
              alignItems='center'
              justifyContent='space-between'
            >
              <Typography variant='body2'>
                {currency1.symbol} / {currency2.symbol}
              </Typography>
              <Box className={classes.swapIcon}>
                <SwapHoriz />
              </Box>
            </Box>
            <SwapInfoTx />
          </Box>
          <Divider />
        </>
      )}
    </>
  );
};

export default React.memo(SwapProInfo);
