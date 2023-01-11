import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DollarSign, StopCircle } from 'react-feather';
import { Currency, Token, Price } from '@uniswap/sdk-core';
import Loader from 'components/Loader';
import { PriceFormats } from 'components/v3/PriceFomatToggler';
import { useInitialTokenPrice, useInitialUSDPrices } from 'state/mint/v3/hooks';
import './index.scss';
import { useTranslation } from 'react-i18next';

interface ISelectRangeUSDC {
  currencyA: Currency;
  currencyB: Currency;
  currencyAUSDC: Price<Currency, Token> | undefined;
  currencyBUSDC: Price<Currency, Token> | undefined;
  priceFormat: PriceFormats;
}

export function USDPrices({
  currencyA,
  currencyB,
  currencyAUSDC,
  currencyBUSDC,
  priceFormat,
}: ISelectRangeUSDC) {
  const { t } = useTranslation();
  const isUSD = useMemo(() => {
    return priceFormat === PriceFormats.USD;
  }, [priceFormat]);

  const userUSDPrices = useInitialUSDPrices();
  const userTokenPrice = useInitialTokenPrice();

  const [loadingTimedout, setLoadingTimedout] = useState(false);

  const hasUSDPrices = useMemo(() => {
    return Boolean(
      userUSDPrices.CURRENCY_A ||
        userUSDPrices.CURRENCY_B ||
        currencyAUSDC ||
        currencyBUSDC ||
        userUSDPrices.CURRENCY_A ||
        currencyBUSDC ||
        userUSDPrices.CURRENCY_B ||
        currencyAUSDC,
    );
  }, [userUSDPrices, currencyAUSDC, currencyBUSDC]);

  const usdA = useMemo(() => {
    if (userUSDPrices.CURRENCY_A) return parseFloat(userUSDPrices.CURRENCY_A);
    if (currencyAUSDC) return parseFloat(currencyAUSDC.toSignificant(8));
    return;
  }, [userUSDPrices, currencyAUSDC]);

  const usdB = useMemo(() => {
    if (userUSDPrices.CURRENCY_B) return parseFloat(userUSDPrices.CURRENCY_B);
    if (currencyBUSDC) return parseFloat(currencyBUSDC.toSignificant(8));
    return;
  }, [userUSDPrices, currencyBUSDC]);

  useEffect(() => {
    setTimeout(() => {
      if (!hasUSDPrices) {
        setLoadingTimedout(true);
      }
    }, 5000);
  }, [currencyAUSDC, currencyBUSDC, hasUSDPrices, userUSDPrices]);

  return (
    <div
      className={
        'preset-ranges-wrapper pl-1 mb-2 mxs_pl-0 mxs_mb-2 ms_pl-0 ms_mb-2'
      }
    >
      <div className='mb-1 f f-ac'>
        {isUSD ? (
          <StopCircle style={{ display: 'block' }} size={15} />
        ) : (
          <DollarSign style={{ display: 'block' }} size={15} />
        )}
        <span className='ml-05'>
          {isUSD ? t('tokenPrices') : t('usdPrices')}
        </span>
      </div>

      {hasUSDPrices ? (
        !isUSD ? (
          <div className='fs-085'>
            <div className='mb-05'>{`1 ${currencyA.symbol} = $ ${usdA ||
              '???'}`}</div>
            <div className='mb-05'>{`1 ${currencyB.symbol} = $ ${usdB ||
              '???'}`}</div>
          </div>
        ) : (
          <div className='fs-085'>
            {usdA && usdB ? (
              <>
                <div className='mb-05'>{`1 ${currencyA.symbol} = ${parseFloat(
                  String(+usdA / (+usdB || 1)),
                )} ${currencyB.symbol}`}</div>
                <div className='mb-05'>{`1 ${currencyB.symbol} = ${parseFloat(
                  String(+usdB / (+usdA || 1)),
                )} ${currencyA.symbol}`}</div>
              </>
            ) : (
              <>
                <div className='mb-05'>{`1 ${currencyA.symbol} = ${usdA ||
                  '???'} ${currencyB.symbol}`}</div>
                <div className='mb-05'>{`1 ${currencyB.symbol} = ${usdB ||
                  '???'} ${currencyA.symbol}`}</div>
              </>
            )}
          </div>
        )
      ) : !loadingTimedout ? (
        <Loader stroke='white' />
      ) : (
        <div>{t('cantFetchPrices')}</div>
      )}
    </div>
  );
}
