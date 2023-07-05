import React, { useState, useEffect } from 'react';
import { Box, Divider } from '@mui/material';
import { SwapHoriz } from '@mui/icons-material';
import { ChainId, Currency, Token } from '@uniswap/sdk';
import { CurrencyLogo } from 'components';
import { formatNumber } from 'utils';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { Skeleton } from '@mui/lab';
import SwapInfoTx from './SwapInfoTx';
import { useTranslation } from 'next-i18next';
import { useEthPrice, useMaticPrice } from 'state/application/hooks';
import { useActiveWeb3React } from 'hooks';

const SwapProInfo: React.FC<{
  token1?: Token;
  token2?: Token;
  transactions?: any[];
  showHeading?: boolean;
}> = ({ token1, token2, transactions, showHeading = true }) => {
  const { t } = useTranslation();
  const [token1Data, setToken1Data] = useState<any>(null);
  const [token2Data, setToken2Data] = useState<any>(null);
  const token1Address = token1?.address;
  const token2Address = token2?.address;
  const currency1 = token1 ? unwrappedToken(token1) : undefined;
  const currency2 = token2 ? unwrappedToken(token2) : undefined;
  const { ethPrice } = useEthPrice();
  const { maticPrice } = useMaticPrice();
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;

  useEffect(() => {
    (async () => {
      if (ethPrice.price && ethPrice.oneDayPrice) {
        if (token1Address) {
          const res = await fetch(
            `${process.env.REACT_APP_LEADERBOARD_APP_URL}/analytics/top-token-details/${token1Address}/v2?chainId=${chainIdToUse}`,
          );
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(
              errorText || res.statusText || `Failed to get top token details`,
            );
          }
          const data = await res.json();
          const token =
            data && data.data && data.data.token ? data.data.token : undefined;
          if (token && token.priceUSD) {
            setToken1Data(token);
          } else if (maticPrice.price && maticPrice.oneDayPrice) {
            const res = await fetch(
              `${process.env.REACT_APP_LEADERBOARD_APP_URL}/analytics/top-token-details/${token1Address}/v3?chainId=${chainIdToUse}`,
            );
            if (!res.ok) {
              const errorText = await res.text();
              throw new Error(
                errorText ||
                  res.statusText ||
                  `Failed to get top token details`,
              );
            }
            const data = await res.json();
            const tokenV3 =
              data && data.data && data.data.token
                ? data.data.token
                : undefined;
            if (tokenV3) {
              setToken1Data(tokenV3);
            }
          }
        }
        if (token2Address) {
          const res = await fetch(
            `${process.env.REACT_APP_LEADERBOARD_APP_URL}/analytics/top-token-details/${token2Address}/v2?chainId=${chainIdToUse}`,
          );
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(
              errorText || res.statusText || `Failed to get top token details`,
            );
          }
          const data = await res.json();
          const token =
            data && data.data && data.data.token ? data.data.token : undefined;
          if (token && token.priceUSD) {
            setToken2Data(token);
          } else if (maticPrice.price && maticPrice.oneDayPrice) {
            const res = await fetch(
              `${process.env.REACT_APP_LEADERBOARD_APP_URL}/analytics/top-token-details/${token2Address}/v3?chainId=${chainIdToUse}`,
            );
            if (!res.ok) {
              const errorText = await res.text();
              throw new Error(
                errorText ||
                  res.statusText ||
                  `Failed to get top token details`,
              );
            }
            const data = await res.json();
            const tokenV3 =
              data && data.data && data.data.token
                ? data.data.token
                : undefined;
            if (tokenV3) {
              setToken2Data(tokenV3);
            }
          }
        }
      }
    })();
  }, [
    token1Address,
    token2Address,
    ethPrice.price,
    ethPrice.oneDayPrice,
    chainIdToUse,
    maticPrice.price,
    maticPrice.oneDayPrice,
  ]);

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
            <Box className='flex justify-between'>
              <small>{currency.symbol}</small>
              {tokenData ? (
                <small>${formatNumber(tokenData?.priceUSD)}</small>
              ) : (
                <Skeleton width={60} height={14} />
              )}
            </Box>
            {tokenData ? (
              <span>
                {t('24h')}:{' '}
                <span
                  className={priceUpPercent > 0 ? 'text-success' : 'text-error'}
                >
                  {formatNumber(priceUpPercent)}%
                </span>
              </span>
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
      {showHeading && (
        <Box>
          <Box p={1}>
            <p className='text-uppercase'>{t('info')}:</p>
          </Box>
          <Divider />
        </Box>
      )}
      {currency1 && <TokenInfo currency={currency1} tokenData={token1Data} />}
      {currency2 && <TokenInfo currency={currency2} tokenData={token2Data} />}
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
