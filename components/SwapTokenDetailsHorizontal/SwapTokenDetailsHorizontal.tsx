import React, { useEffect, useState } from 'react';
import { Box, Grid, useTheme } from '@mui/material';
import { Skeleton } from '@mui/lab';
import { CurrencyLogo, CopyHelper } from 'components';
import { useTokenDetails } from 'state/application/hooks';
import { formatNumber, shortenAddress } from 'utils';
import { LineChart } from 'components';
import { ChainId, Token } from '@uniswap/sdk';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { useActiveWeb3React } from 'hooks';
import { getConfig } from 'config';

const SwapTokenDetailsHorizontal: React.FC<{
  token: Token;
}> = ({ token }) => {
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const currency = unwrappedToken(token);
  const tokenAddress = token.address;
  const { palette } = useTheme();
  const { tokenDetails, updateTokenDetails } = useTokenDetails();
  const [tokenData, setTokenData] = useState<any>(null);
  const [priceData, setPriceData] = useState<any>(null);
  const priceUp = Number(tokenData?.priceChangeUSD) > 0;
  const priceUpPercent = Number(tokenData?.priceChangeUSD).toFixed(2);
  const prices = priceData ? priceData.map((price: any) => price.close) : [];
  const config = getConfig(chainId);
  const v2 = config['v2'];

  useEffect(() => {
    (async () => {
      const tokenDetail = tokenDetails.find(
        (item) => item.address === tokenAddress,
      );
      setTokenData(tokenDetail?.tokenData);
      setPriceData(tokenDetail?.priceData);

      let tokenPriceDataV2, tokenPriceIsV2;
      if (v2) {
        const res = await fetch(
          `${process.env.REACT_APP_LEADERBOARD_APP_URL}/utils/token-interval-data/${tokenAddress}/v2?chainId=${chainId}`,
        );
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            errorText || res.statusText || `Failed to get top token details`,
          );
        }
        const data = await res.json();
        tokenPriceDataV2 =
          data && data.data && data.data.intervalTokenData
            ? data.data.intervalTokenData
            : undefined;
        tokenPriceIsV2 = !!tokenPriceDataV2.find(
          (item: any) => item.open && item.close,
        );
      }

      const res = await fetch(
        `${process.env.REACT_APP_LEADERBOARD_APP_URL}/utils/token-interval-data/${tokenAddress}/v3?chainId=${chainId}`,
      );
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          errorText || res.statusText || `Failed to get top token details`,
        );
      }
      const data = await res.json();
      const tokenPriceDataV3 =
        data && data.data && data.data.intervalTokenData
          ? data.data.intervalTokenData
          : undefined;

      const tokenPriceData = tokenPriceIsV2
        ? tokenPriceDataV2
        : tokenPriceDataV3;
      setPriceData(tokenPriceData);

      let token0;
      if (v2) {
        const res = await fetch(
          `${process.env.REACT_APP_LEADERBOARD_APP_URL}/analytics/top-token-details/${tokenAddress}/v2?chainId=${chainId}`,
        );
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            errorText || res.statusText || `Failed to get top token details`,
          );
        }
        const data = await res.json();
        token0 =
          data && data.data && data.data.token ? data.data.token : undefined;
        if (token0 && token0.priceUSD) {
          setTokenData(token0);
          const tokenDetailToUpdate = {
            address: tokenAddress,
            tokenData: token0,
            priceData: tokenPriceData,
          };
          updateTokenDetails(tokenDetailToUpdate);
        }
      }
      if (!token0 || !token0.priceUSD) {
        const res = await fetch(
          `${process.env.REACT_APP_LEADERBOARD_APP_URL}/analytics/top-token-details/${tokenAddress}/v3?chainId=${chainId}`,
        );
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            errorText || res.statusText || `Failed to get top token details`,
          );
        }
        const data = await res.json();
        const tokenV3 =
          data && data.data && data.data.token ? data.data.token : undefined;
        if (tokenV3) {
          setTokenData(tokenV3);
          const tokenDetailToUpdate = {
            address: tokenAddress,
            tokenData: tokenV3,
            priceData: tokenPriceData,
          };
          updateTokenDetails(tokenDetailToUpdate);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenAddress, chainIdToUse]);

  return (
    <Grid container spacing={1}>
      <Grid item xs={4}>
        <Box className='flex items-center'>
          <CurrencyLogo currency={currency} size='28px' />
          <Box ml={1}>
            <small>{currency.symbol}</small>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={3}>
        <Box>
          <small className='swapTxInfoHeader'>Price</small>
          {tokenData ? (
            <Box>${formatNumber(tokenData.priceUSD)}</Box>
          ) : (
            <Skeleton variant='rectangular' width={80} height={20} />
          )}
        </Box>
      </Grid>
      <Grid item xs={2}>
        <Box>
          <small className='swapTxInfoHeader'>24h</small>
          {tokenData ? (
            <Box className={`${priceUp ? 'text-success' : 'text-error'}`}>
              {priceUp ? '+' : ''}
              {priceUpPercent}%
            </Box>
          ) : (
            <Skeleton variant='rectangular' width={60} height={20} />
          )}
        </Box>
      </Grid>
      <Grid item xs={3}>
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
          <Skeleton variant='rectangular' width={88} height={47} />
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
    </Grid>
  );
};

export default SwapTokenDetailsHorizontal;
