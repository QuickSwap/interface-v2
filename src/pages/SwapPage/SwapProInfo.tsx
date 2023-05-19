import React, { useState, useEffect } from 'react';
import { Box, Divider } from '@material-ui/core';
import { SwapHoriz } from '@material-ui/icons';
import { ChainId, Currency, Token } from '@uniswap/sdk';
import { CurrencyLogo } from 'components';
import { getTokenInfo, formatNumber } from 'utils';
import { unwrappedToken } from 'utils/wrappedCurrency';
import Skeleton from '@material-ui/lab/Skeleton';
import SwapInfoTx from './SwapInfoTx';
import { useTranslation } from 'react-i18next';
import { useEthPrice, useMaticPrice } from 'state/application/hooks';
import { useActiveWeb3React } from 'hooks';
import { getTokenInfoV3 } from 'utils/v3-graph';

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
          const tokenInfo = await getTokenInfo(
            ethPrice.price,
            ethPrice.oneDayPrice,
            token1Address,
            chainIdToUse,
          );
          const token =
            tokenInfo && tokenInfo.length > 0 ? tokenInfo[0] : tokenInfo;
          if (token && token.priceUSD) {
            setToken1Data(token);
          } else if (maticPrice.price && maticPrice.oneDayPrice) {
            const tokenInfoV3 = await getTokenInfoV3(
              maticPrice.price,
              maticPrice.oneDayPrice,
              token1Address.toLowerCase(),
              chainIdToUse,
            );
            const tokenV3 =
              tokenInfoV3 && tokenInfoV3.length > 0
                ? tokenInfoV3[0]
                : tokenInfoV3;
            if (tokenV3) {
              setToken1Data(tokenV3);
            }
          }
        }
        if (token2Address) {
          const tokenInfo = await getTokenInfo(
            ethPrice.price,
            ethPrice.oneDayPrice,
            token2Address,
            chainIdToUse,
          );
          const token =
            tokenInfo && tokenInfo.length > 0 ? tokenInfo[0] : tokenInfo;
          if (token && token.priceUSD) {
            setToken2Data(token);
          } else if (maticPrice.price && maticPrice.oneDayPrice) {
            const tokenInfoV3 = await getTokenInfoV3(
              maticPrice.price,
              maticPrice.oneDayPrice,
              token2Address.toLowerCase(),
              chainIdToUse,
            );
            const tokenV3 =
              tokenInfoV3 && tokenInfoV3.length > 0
                ? tokenInfoV3[0]
                : tokenInfoV3;
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
