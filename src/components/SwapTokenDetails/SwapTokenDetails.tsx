import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import { ArrowDropUp, ArrowDropDown } from '@material-ui/icons';
import { useTheme } from '@material-ui/core/styles';
import { CurrencyLogo, CopyHelper } from 'components';
import {
  useBlockNumber,
  useEthPrice,
  useIsV2,
  useMaticPrice,
  useTokenDetails,
} from 'state/application/hooks';
import useCopyClipboard from 'hooks/useCopyClipboard';
import {
  shortenAddress,
  formatCompact,
  getTokenInfo,
  getIntervalTokenData,
  formatNumber,
} from 'utils';
import { LineChart } from 'components';
import { ChainId, Token } from '@uniswap/sdk';
import { Token as TokenV3 } from '@uniswap/sdk-core';
import dayjs from 'dayjs';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { useTranslation } from 'react-i18next';
import { getIntervalTokenDataV3, getTokenInfoV3 } from 'utils/v3-graph';
import { useActiveWeb3React } from 'hooks';
import { getConfig } from '../../config/index';

const SwapTokenDetails: React.FC<{
  token: Token | TokenV3;
}> = ({ token }) => {
  const { t } = useTranslation();
  const currency = unwrappedToken(token);
  const tokenAddress = token.address.toLowerCase();
  const { palette } = useTheme();
  const latestBlock = useBlockNumber();
  const { tokenDetails, updateTokenDetails } = useTokenDetails();
  const [tokenData, setTokenData] = useState<any>(null);
  const [priceData, setPriceData] = useState<any>(null);
  const priceUp = Number(tokenData?.priceChangeUSD) > 0;
  const priceUpPercent = Number(tokenData?.priceChangeUSD).toFixed(2);
  const [isCopied, setCopied] = useCopyClipboard();
  const prices = priceData ? priceData.map((price: any) => price.close) : [];
  const { ethPrice } = useEthPrice();
  const { maticPrice } = useMaticPrice();
  const { chainId } = useActiveWeb3React();
  const { isV2 } = useIsV2();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const config = getConfig(chainIdToUse);
  const v2 = config['v2'];
  useEffect(() => {
    (async () => {
      const tokenDetail = tokenDetails.find(
        (item) => item.address.toLowerCase() === tokenAddress,
      );
      setTokenData(tokenDetail?.tokenData);
      setPriceData(tokenDetail?.priceData);
      const currentTime = dayjs.utc();
      const startTime = currentTime
        .subtract(1, 'day')
        .startOf('hour')
        .unix();

      let tokenPriceData = undefined;

      if ((!v2 || !isV2) && maticPrice.price && maticPrice.oneDayPrice) {
        tokenPriceData = await getIntervalTokenDataV3(
          tokenAddress,
          startTime,
          3600,
          latestBlock,
          chainIdToUse,
        );
        setPriceData(tokenPriceData);
      } else if (v2 && ethPrice.price && ethPrice.oneDayPrice) {
        tokenPriceData = await getIntervalTokenData(
          tokenAddress,
          startTime,
          3600,
          latestBlock,
          chainIdToUse,
        );
        setPriceData(tokenPriceData);
      }
      if ((!v2 || !isV2) && maticPrice.price && maticPrice.oneDayPrice) {
        const tokenInfo = await getTokenInfoV3(
          maticPrice.price,
          maticPrice.oneDayPrice,
          tokenAddress,
          chainIdToUse,
        );
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
      } else if (v2 && ethPrice.price && ethPrice.oneDayPrice) {
        const tokenInfo = await getTokenInfo(
          ethPrice.price,
          ethPrice.oneDayPrice,
          tokenAddress,
          chainIdToUse,
        );
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
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenAddress, ethPrice.price, ethPrice.oneDayPrice]);

  return (
    <Box>
      <Box className='flex items-center justify-between' px={2} py={1.5}>
        <Box className='flex items-center'>
          <CurrencyLogo currency={currency} size='28px' />
          <Box ml={1}>
            <small>{currency.symbol}</small>
            {tokenData ? (
              <Box className='flex items-center'>
                <small>${formatNumber(tokenData.priceUSD)}</small>
                <Box
                  ml={0.5}
                  className={`flex items-center ${
                    priceUp ? 'text-success' : 'text-error'
                  }`}
                >
                  {priceUp ? <ArrowDropUp /> : <ArrowDropDown />}
                  <small>{priceUpPercent}%</small>
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
      <Box className='border-top-secondary1 border-bottom-secondary1' px={2}>
        <Grid container>
          <Grid item xs={6}>
            <Box className='border-right-secondary1' py={1}>
              {tokenData ? (
                <small className='text-secondary'>
                  {t('tvl')}: {formatCompact(tokenData?.totalLiquidityUSD)}
                </small>
              ) : (
                <Skeleton variant='rect' width={100} height={16} />
              )}
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box py={1} pl={2}>
              {tokenData ? (
                <small className='text-secondary'>
                  {t('24hVol1')}: {formatCompact(tokenData?.oneDayVolumeUSD)}
                </small>
              ) : (
                <Skeleton variant='rect' width={100} height={16} />
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Box className='flex justify-between items-center' py={1} px={2}>
        <a
          href={`${process.env.REACT_APP_SCAN_BASE_URL}/token/${tokenAddress}`}
          target='_blank'
          rel='noopener noreferrer'
          className='no-decoration'
        >
          <small className='text-primary'>{shortenAddress(tokenAddress)}</small>
        </a>
        <CopyHelper toCopy={tokenAddress} />
      </Box>
    </Box>
  );
};

export default SwapTokenDetails;
