import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import { ArrowDropUp, ArrowDropDown } from '@material-ui/icons';
import { useTheme } from '@material-ui/core/styles';
import { CurrencyLogo, CopyHelper } from 'components';
import {
  useBlockNumber,
  useEthPrice,
  useMaticPrice,
  useTokenDetails,
} from 'state/application/hooks';
import {
  shortenAddress,
  formatCompact,
  getTokenInfo,
  getIntervalTokenData,
  formatNumber,
} from 'utils';
import { LineChart } from 'components';
import { Token } from '@uniswap/sdk';
import dayjs from 'dayjs';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { useTranslation } from 'react-i18next';
import { getIntervalTokenDataV3, getTokenInfoV3 } from 'utils/v3-graph';

const SwapTokenDetailsHorizontal: React.FC<{
  token: Token;
}> = ({ token }) => {
  const { t } = useTranslation();
  const currency = unwrappedToken(token);
  const tokenAddress = token.address;
  const { palette } = useTheme();
  const latestBlock = useBlockNumber();
  const { tokenDetails, updateTokenDetails } = useTokenDetails();
  const [tokenData, setTokenData] = useState<any>(null);
  const [priceData, setPriceData] = useState<any>(null);
  const priceUp = Number(tokenData?.priceChangeUSD) > 0;
  const priceUpPercent = Number(tokenData?.priceChangeUSD).toFixed(2);
  const prices = priceData ? priceData.map((price: any) => price.close) : [];
  const { ethPrice } = useEthPrice();
  const { maticPrice } = useMaticPrice();

  useEffect(() => {
    (async () => {
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
      const tokenPriceDataV2 = await getIntervalTokenData(
        tokenAddress,
        startTime,
        3600,
        latestBlock,
      );
      const tokenPriceDataV3 = await getIntervalTokenDataV3(
        tokenAddress.toLowerCase(),
        startTime,
        3600,
        latestBlock,
      );
      const tokenPriceIsV2 = !!tokenPriceDataV2.find(
        (item) => item.open && item.close,
      );
      const tokenPriceData = tokenPriceIsV2
        ? tokenPriceDataV2
        : tokenPriceDataV3;
      setPriceData(tokenPriceData);

      if (ethPrice.price && ethPrice.oneDayPrice) {
        const tokenInfo = await getTokenInfo(
          ethPrice.price,
          ethPrice.oneDayPrice,
          tokenAddress,
        );
        const token0 =
          tokenInfo && tokenInfo.length > 0 ? tokenInfo[0] : tokenInfo;
        if (token0 && token0.priceUSD) {
          setTokenData(token0);
          const tokenDetailToUpdate = {
            address: tokenAddress,
            tokenData: token0,
            priceData: tokenPriceData,
          };
          updateTokenDetails(tokenDetailToUpdate);
        } else if (maticPrice.price && maticPrice.oneDayPrice) {
          const tokenInfoV3 = await getTokenInfoV3(
            maticPrice.price,
            maticPrice.oneDayPrice,
            tokenAddress.toLowerCase(),
          );
          const tokenV3 =
            tokenInfoV3 && tokenInfoV3.length > 0
              ? tokenInfoV3[0]
              : tokenInfoV3;
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
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tokenAddress,
    ethPrice.price,
    ethPrice.oneDayPrice,
    maticPrice.price,
    maticPrice.oneDayPrice,
  ]);

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
            <Skeleton variant='rect' width={80} height={20} />
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
            <Skeleton variant='rect' width={60} height={20} />
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
          <Skeleton variant='rect' width={88} height={47} />
        )}
      </Grid>
      <Grid item xs={12}>
        <Box className='flex items-center' py={1}>
          <a
            href={`${process.env.REACT_APP_SCAN_BASE_URL}/token/${tokenAddress}`}
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
