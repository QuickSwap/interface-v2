import React from 'react';
import { Box, Divider } from '@material-ui/core';
import { SwapHoriz } from '@material-ui/icons';
import { ChainId, Currency, Token } from '@uniswap/sdk';
import { CurrencyLogo } from '~/components';
import { formatNumber } from '~/utils';
import { unwrappedToken } from '~/utils/wrappedCurrency';
import Skeleton from '@material-ui/lab/Skeleton';
import SwapInfoTx from './SwapInfoTx';
import { useTranslation } from 'react-i18next';
import { useActiveWeb3React } from '~/hooks';
import { useQuery } from '@tanstack/react-query';

const SwapProInfo: React.FC<{
  token1?: Token;
  token2?: Token;
  transactions?: any[];
  showHeading?: boolean;
}> = ({ token1, token2, transactions, showHeading = true }) => {
  const { t } = useTranslation();
  const token1Address = token1?.address;
  const token2Address = token2?.address;
  const currency1 = token1 ? unwrappedToken(token1) : undefined;
  const currency2 = token2 ? unwrappedToken(token2) : undefined;
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;

  const fetchTokenData = async (tokenAddress?: string) => {
    if (!tokenAddress) return null;
    const res = await fetch(
      `${import.meta.env.VITE_LEADERBOARD_APP_URL}/analytics/top-token-details/${tokenAddress}/v2?chainId=${chainIdToUse}`,
    );
    let tokenV2;
    if (res.ok) {
      const data = await res.json();
      tokenV2 =
        data && data.data && data.data.token ? data.data.token : undefined;
    }
    if (tokenV2 && tokenV2.priceUSD) {
      return tokenV2;
    }
    const v3Res = await fetch(
      `${import.meta.env.VITE_LEADERBOARD_APP_URL}/analytics/top-token-details/${tokenAddress}/v3?chainId=${chainIdToUse}`,
    );
    if (!v3Res.ok) {
      return null;
    }
    const data = await res.json();
    const tokenV3 =
      data && data.data && data.data.token ? data.data.token : undefined;
    if (tokenV3) {
      return tokenV3;
    }
    return null;
  };

  const fetchDataForToken1 = async () => {
    const data = await fetchTokenData(token1Address);
    return data;
  };

  const fetchDataForToken2 = async () => {
    const data = await fetchTokenData(token2Address);
    return data;
  };

  const { isLoading: loadingToken1Data, data: token1Data } = useQuery({
    queryKey: ['fetchToken1DataSwapPro', token1Address, chainIdToUse],
    queryFn: fetchDataForToken1,
  });

  const { isLoading: loadingToken2Data, data: token2Data } = useQuery({
    queryKey: ['fetchToken2DataSwapPro', token2Address, chainIdToUse],
    queryFn: fetchDataForToken2,
  });

  const TokenInfo: React.FC<{
    currency: Currency;
    tokenData: any;
    loading: boolean;
  }> = ({ currency, tokenData, loading }) => {
    const priceUpPercent = Number(tokenData?.priceChangeUSD);
    return (
      <>
        <Box p={1} display='flex'>
          <CurrencyLogo currency={currency} />
          <Box ml={1} flex={1}>
            <Box className='flex justify-between'>
              <small>{currency.symbol}</small>
              {loading ? (
                <Skeleton width={60} height={14} />
              ) : tokenData ? (
                <small>${formatNumber(tokenData.priceUSD)}</small>
              ) : (
                <></>
              )}
            </Box>
            {loading ? (
              <Skeleton width={60} height={12} />
            ) : tokenData ? (
              <span>
                {t('24h')}:{' '}
                <span
                  className={priceUpPercent > 0 ? 'text-success' : 'text-error'}
                >
                  {formatNumber(priceUpPercent)}%
                </span>
              </span>
            ) : (
              <></>
            )}
          </Box>
        </Box>
        <Divider />
      </>
    );
  };

  return (
    <>
      {showHeading && (
        <Box>
          <Box p={1}>
            <p className='text-uppercase'>{t('info')}:</p>
          </Box>
          <Divider />
        </Box>
      )}
      {currency1 && (
        <TokenInfo
          currency={currency1}
          tokenData={token1Data}
          loading={loadingToken1Data}
        />
      )}
      {currency2 && (
        <TokenInfo
          currency={currency2}
          tokenData={token2Data}
          loading={loadingToken2Data}
        />
      )}
      {currency1 && currency2 && (
        <>
          <Box py={2} px={1}>
            <Box mb={1} px={1} className='flex items-center justify-between'>
              <small>
                {currency1.symbol} / {currency2.symbol}
              </small>
              <Box className='swapIcon'>
                <SwapHoriz />
              </Box>
            </Box>
            <SwapInfoTx transactions={transactions} />
          </Box>
          <Divider />
        </>
      )}
    </>
  );
};

export default React.memo(SwapProInfo);
