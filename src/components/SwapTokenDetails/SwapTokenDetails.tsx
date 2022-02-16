import React, { useEffect, useMemo, useState } from 'react';
import { Box, Grid, Typography } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import { ArrowDropUp, ArrowDropDown } from '@material-ui/icons';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { CurrencyLogo } from 'components';
import { useBlockNumber, useTokenDetails } from 'state/application/hooks';
import useCopyClipboard from 'hooks/useCopyClipboard';
import { ReactComponent as CopyIcon } from 'assets/images/CopyIcon.svg';
import {
  shortenAddress,
  formatCompact,
  getTokenInfo,
  getEthPrice,
  getIntervalTokenData,
  formatNumber,
} from 'utils';
import { LineChart } from 'components';
import { Token } from '@uniswap/sdk';
import dayjs from 'dayjs';
import { unwrappedToken } from 'utils/wrappedCurrency';

const useStyles = makeStyles(({ palette }) => ({
  success: {
    color: palette.success.main,
  },
  danger: {
    color: palette.error.main,
  },
}));

const SwapTokenDetails: React.FC<{
  token: Token;
}> = ({ token }) => {
  const classes = useStyles();
  const currency = unwrappedToken(token);
  const tokenAddress = token.address;
  const { palette } = useTheme();
  const latestBlock = useBlockNumber();
  const { tokenDetails, updateTokenDetails } = useTokenDetails();
  const [tokenData, setTokenData] = useState<any>(null);
  const [priceData, setPriceData] = useState<any>(null);
  const priceUp = Number(tokenData?.priceChangeUSD) > 0;
  const priceUpPercent = Number(tokenData?.priceChangeUSD).toFixed(2);
  const [isCopied, setCopied] = useCopyClipboard();
  const prices = priceData ? priceData.map((price: any) => price.close) : [];

  useEffect(() => {
    async function fetchTokenData() {
      const tokenDetail = tokenDetails.find(
        (item) => item.address === tokenAddress,
      );
      setTokenData(tokenDetail?.tokenData);
      setPriceData(tokenDetail?.priceData);
      const currentTime = dayjs.utc();
      const startTime = currentTime
        .subtract(1, 'day')
        .startOf('hour')
        .unix();
      const tokenPriceData = await getIntervalTokenData(
        tokenAddress,
        startTime,
        3600,
        latestBlock,
      );
      setPriceData(tokenPriceData);

      const [newPrice, oneDayPrice] = await getEthPrice();
      const tokenInfo = await getTokenInfo(newPrice, oneDayPrice, tokenAddress);
      if (tokenInfo) {
        const token0 = tokenInfo[0];
        setTokenData(token0);
        const tokenDetailToUpdate = {
          address: tokenAddress,
          tokenData: token0,
          priceData: tokenPriceData,
        };
        updateTokenDetails(tokenDetailToUpdate);
      }
    }
    fetchTokenData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenAddress]);

  return (
    <Box>
      <Box
        display='flex'
        alignItems='center'
        justifyContent='space-between'
        px={2}
        py={1.5}
      >
        <Box display='flex' alignItems='center'>
          <CurrencyLogo currency={currency} size='28px' />
          <Box ml={1}>
            <Typography variant='body2'>{currency.symbol}</Typography>
            {tokenData ? (
              <Box display='flex' alignItems='center'>
                <Typography variant='body2'>
                  ${formatNumber(tokenData.priceUSD)}
                </Typography>
                <Box
                  ml={0.5}
                  display='flex'
                  alignItems='center'
                  className={priceUp ? classes.success : classes.danger}
                >
                  {priceUp ? <ArrowDropUp /> : <ArrowDropDown />}
                  <Typography variant='body2'>{priceUpPercent}%</Typography>
                </Box>
              </Box>
            ) : (
              <Skeleton variant='rect' width={100} height={20} />
            )}
          </Box>
        </Box>
        {tokenData && priceData ? (
          <Box width={88} height={47} position='relative'>
            <Box position='absolute' top={-30} width={1}>
              {prices.length > 0 && (
                <LineChart
                  data={prices}
                  width='100%'
                  height={120}
                  color={priceUp ? palette.success.main : palette.error.main}
                />
              )}
            </Box>
          </Box>
        ) : (
          <Skeleton variant='rect' width={88} height={47} />
        )}
      </Box>
      <Box
        borderTop={`1px solid ${palette.secondary.light}`}
        borderBottom={`1px solid ${palette.secondary.light}`}
        px={2}
      >
        <Grid container>
          <Grid item xs={6}>
            <Box borderRight={`1px solid ${palette.secondary.light}`} py={1}>
              {tokenData ? (
                <Typography
                  variant='body2'
                  style={{ color: palette.text.secondary }}
                >
                  TVL: {formatCompact(tokenData?.totalLiquidityUSD)}
                </Typography>
              ) : (
                <Skeleton variant='rect' width={100} height={16} />
              )}
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box py={1} pl={2}>
              {tokenData ? (
                <Typography
                  variant='body2'
                  style={{ color: palette.text.secondary }}
                >
                  24h VOL: {formatCompact(tokenData?.oneDayVolumeUSD)}
                </Typography>
              ) : (
                <Skeleton variant='rect' width={100} height={16} />
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        py={1}
        px={2}
      >
        <a
          href={`https://polygonscan.com/token/${tokenAddress}`}
          target='_blank'
          rel='noreferrer'
          style={{ textDecoration: 'none' }}
        >
          <Typography variant='body2' style={{ color: palette.primary.main }}>
            {shortenAddress(tokenAddress)}
          </Typography>
        </a>
        <Box
          display='flex'
          style={{ cursor: 'pointer', opacity: isCopied ? 0.5 : 1 }}
          onClick={() => {
            setCopied(tokenAddress);
          }}
        >
          <CopyIcon />
        </Box>
      </Box>
    </Box>
  );
};

export default SwapTokenDetails;
