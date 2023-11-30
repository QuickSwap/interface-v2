import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import { useTheme } from '@material-ui/core/styles';
import { CurrencyLogo, CopyHelper } from 'components';
import { formatNumber, shortenAddress } from 'utils';
import { LineChart } from 'components';
import { Token } from '@uniswap/sdk';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { useActiveWeb3React } from 'hooks';
import { getConfig } from 'config';
import { useQuery } from '@tanstack/react-query';

const SwapTokenDetailsHorizontal: React.FC<{
  token: Token;
  isTablet: boolean;
}> = ({ token, isTablet = false }) => {
  const { chainId } = useActiveWeb3React();
  const currency = unwrappedToken(token);
  const tokenAddress = token.address;
  const { palette } = useTheme();
  const config = getConfig(chainId);
  const v2 = config['v2'];

  const fetchTokenInterval = async () => {
    let tokenPriceDataV3;
    const res = await fetch(
      `${process.env.REACT_APP_LEADERBOARD_APP_URL}/utils/token-interval-data/${tokenAddress}/v3?chainId=${chainId}`,
    );
    if (res.ok) {
      const data = await res.json();
      tokenPriceDataV3 =
        data && data.data && data.data.intervalTokenData
          ? data.data.intervalTokenData
          : null;
    }

    if (
      tokenPriceDataV3 &&
      !!tokenPriceDataV3.find((item: any) => item.open && item.close)
    ) {
      return tokenPriceDataV3;
    } else if (v2) {
      const res = await fetch(
        `${process.env.REACT_APP_LEADERBOARD_APP_URL}/utils/token-interval-data/${tokenAddress}/v2?chainId=${chainId}`,
      );
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      const tokenPriceDataV2 =
        data && data.data && data.data.intervalTokenData
          ? data.data.intervalTokenData
          : null;
      return tokenPriceDataV2;
    }
    return null;
  };

  const fetchTokenData = async () => {
    let tokenV3;
    const tokenDetailsRes = await fetch(
      `${process.env.REACT_APP_LEADERBOARD_APP_URL}/analytics/top-token-details/${tokenAddress}/v3?chainId=${chainId}`,
    );
    if (tokenDetailsRes.ok) {
      const tokenDetailsData = await tokenDetailsRes.json();
      tokenV3 =
        tokenDetailsData && tokenDetailsData.data && tokenDetailsData.data.token
          ? tokenDetailsData.data.token
          : null;
    }
    if (tokenV3) {
      return tokenV3;
    } else if (v2 && (!tokenV3 || !tokenV3.priceUSD)) {
      const res = await fetch(
        `${process.env.REACT_APP_LEADERBOARD_APP_URL}/analytics/top-token-details/${tokenAddress}/v2?chainId=${chainId}`,
      );
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      const token0 =
        data && data.data && data.data.token ? data.data.token : null;
      if (token0 && token0.priceUSD) {
        return token0;
      }
    }
    return null;
  };

  const {
    isLoading: loadingPriceData,
    data: priceData,
    refetch: refetchPriceData,
  } = useQuery({
    queryKey: ['fetchTokenIntervalData', tokenAddress, chainId],
    queryFn: fetchTokenInterval,
  });

  const {
    isLoading: loadingTokenData,
    data: tokenData,
    refetch: refetchTokenData,
  } = useQuery({
    queryKey: ['fetchTokenDataSwap', tokenAddress, chainId],
    queryFn: fetchTokenData,
  });

  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000);
      setCurrentTime(_currentTime);
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    refetchPriceData();
    refetchTokenData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  const priceUp = Number(tokenData?.priceChangeUSD) > 0;
  const priceUpPercent = Number(tokenData?.priceChangeUSD).toFixed(2);
  const prices = priceData ? priceData.map((price: any) => price.close) : [];

  return (
    <Grid container spacing={1}>
      {isTablet ? (
        <>
          {/* Token Symbol */}
          <Grid item xs={5}>
            <Box className='flex items-center'>
              <CurrencyLogo currency={currency} size='28px' />
              <Box ml={1.5}>
                <small>{currency.symbol}</small>
              </Box>
            </Box>
          </Grid>

          {/* Token Price */}
          <Grid item xs={4}>
            <Box className='flex items-center'>
              {loadingTokenData ? (
                <Skeleton variant='rect' width={140} height={30} />
              ) : tokenData ? (
                <Box pt={0.6}>${formatNumber(tokenData.priceUSD)}</Box>
              ) : (
                <></>
              )}
            </Box>
          </Grid>

          {/* Change in Price */}
          <Grid item xs={3}>
            <Box className='flex'>
              {loadingTokenData ? (
                <Skeleton variant='rect' width={140} height={30} />
              ) : tokenData ? (
                <Box
                  ml='auto'
                  className={` ${priceUp ? 'box-success' : 'box-error'}`}
                >
                  {priceUp ? '+' : ''}
                  {priceUpPercent}%
                </Box>
              ) : (
                <></>
              )}
            </Box>
          </Grid>
        </>
      ) : (
        <>
          <Grid item xs={4}>
            <Box className='flex items-center'>
              <CurrencyLogo currency={currency} size='28px' />
              <Box ml={0.5}>
                <small>{currency.symbol}</small>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box>
              <small className='swapTxInfoHeader'>Price</small>
              {loadingTokenData ? (
                <Skeleton variant='rect' width={80} height={20} />
              ) : tokenData ? (
                <Box>${formatNumber(tokenData.priceUSD)}</Box>
              ) : (
                <></>
              )}
            </Box>
          </Grid>
          <Grid item xs={2}>
            <Box>
              <small className='swapTxInfoHeader'>24h</small>
              {loadingTokenData ? (
                <Skeleton variant='rect' width={60} height={20} />
              ) : tokenData ? (
                <Box className={`${priceUp ? 'text-success' : 'text-error'}`}>
                  {priceUp ? '+' : ''}
                  {priceUpPercent}%
                </Box>
              ) : (
                <></>
              )}
            </Box>
          </Grid>
          <Grid item xs={3}>
            {loadingTokenData || loadingPriceData ? (
              <Skeleton variant='rect' width={88} height={47} />
            ) : tokenData && priceData ? (
              <Box width={88} height={47} position='relative'>
                <Box position='absolute' top={-30} width={1}>
                  {prices.length > 0 && (
                    <LineChart
                      data={prices}
                      width='100%'
                      height={120}
                      color={
                        priceUp ? palette.success.main : palette.error.main
                      }
                    />
                  )}
                </Box>
              </Box>
            ) : (
              <></>
            )}
          </Grid>
          <Grid item xs={12}>
            <Box className='flex items-center' py={1}>
              <a
                href={`${config.blockExplorer}/token/${tokenAddress}`}
                target='_blank'
                rel='noopener noreferrer'
                className='no-decoration'
              >
                <small className='text-primary'>
                  {shortenAddress(tokenAddress)}
                </small>
              </a>
              <Box className='flex' ml='5px'>
                <CopyHelper toCopy={tokenAddress} />
              </Box>
            </Box>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default SwapTokenDetailsHorizontal;
