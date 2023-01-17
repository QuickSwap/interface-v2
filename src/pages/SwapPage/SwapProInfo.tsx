import React, { useState, useEffect } from 'react';
import { Box, Divider, Skeleton } from 'theme/components';
import { Repeat } from 'react-feather';
import { Currency, Token } from '@uniswap/sdk';
import { CurrencyLogo } from 'components';
import { getTokenInfo, formatNumber } from 'utils';
import { unwrappedToken } from 'utils/wrappedCurrency';
import SwapInfoTx from './SwapInfoTx';
import { useTranslation } from 'react-i18next';
import { useEthPrice } from 'state/application/hooks';

const SwapProInfo: React.FC<{
  token1?: Token;
  token2?: Token;
  transactions?: any[];
}> = ({ token1, token2, transactions }) => {
  const { t } = useTranslation();
  const [token1Data, setToken1Data] = useState<any>(null);
  const [token2Data, setToken2Data] = useState<any>(null);
  const token1Address = token1?.address;
  const token2Address = token2?.address;
  const currency1 = token1 ? unwrappedToken(token1) : undefined;
  const currency2 = token2 ? unwrappedToken(token2) : undefined;
  const { ethPrice } = useEthPrice();

  useEffect(() => {
    (async () => {
      if (ethPrice.price && ethPrice.oneDayPrice) {
        if (token1Address) {
          const tokenInfo = await getTokenInfo(
            ethPrice.price,
            ethPrice.oneDayPrice,
            token1Address,
          );
          if (tokenInfo) {
            setToken1Data(tokenInfo[0]);
          }
        }
        if (token2Address) {
          const tokenInfo = await getTokenInfo(
            ethPrice.price,
            ethPrice.oneDayPrice,
            token2Address,
          );
          if (tokenInfo) {
            setToken2Data(tokenInfo[0]);
          }
        }
      }
    })();
  }, [token1Address, token2Address, ethPrice.price, ethPrice.oneDayPrice]);

  const TokenInfo: React.FC<{ currency: Currency; tokenData: any }> = ({
    currency,
    tokenData,
  }) => {
    const priceUpPercent = Number(tokenData?.priceChangeUSD);
    return (
      <>
        <Box padding='8px' className='flex'>
          <CurrencyLogo currency={currency} />
          <Box margin='0 0 0 8px' flex={1}>
            <Box className='flex justify-between'>
              <small>{currency.symbol}</small>
              {tokenData ? (
                <small>${formatNumber(tokenData?.priceUSD)}</small>
              ) : (
                <Skeleton width='60px' height='14px' />
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
              <Skeleton width='60px' height='12px' />
            )}
          </Box>
        </Box>
        <Divider />
      </>
    );
  };

  return (
    <>
      <Box padding='8px'>
        <p className='text-uppercase'>{t('info')}:</p>
      </Box>
      <Divider />
      {currency1 && <TokenInfo currency={currency1} tokenData={token1Data} />}
      {currency2 && <TokenInfo currency={currency2} tokenData={token2Data} />}
      {currency1 && currency2 && (
        <>
          <Box padding='16px 8px'>
            <Box
              margin='0 0 8px'
              padding='0 8px'
              className='flex items-center justify-between'
            >
              <small>
                {currency1.symbol} / {currency2.symbol}
              </small>
              <Box className='swapIcon'>
                <Repeat />
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
