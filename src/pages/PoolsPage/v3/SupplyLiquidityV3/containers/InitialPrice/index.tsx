import React, { useEffect } from 'react';
import { Currency } from '@uniswap/sdk-core';
import { PriceFormats } from 'components/v3/PriceFomatToggler';
import StartingPrice from '../../components/StartingPrice';
import { IDerivedMintInfo, useV3MintActionHandlers } from 'state/mint/v3/hooks';
import { Box } from '@material-ui/core';

import './index.scss';
import { useTranslation } from 'react-i18next';

interface IInitialPrice {
  currencyA: Currency | undefined;
  currencyB: Currency | undefined;
  mintInfo: IDerivedMintInfo;
  priceFormat: PriceFormats;
}

export function InitialPrice({
  currencyA,
  currencyB,
  mintInfo,
  priceFormat,
}: IInitialPrice) {
  const { t } = useTranslation();
  // may be needed when we enabled token, usd toggler
  // const currencyAUSDC = useUSDCPrice(currencyA ?? undefined);
  // const currencyBUSDC = useUSDCPrice(currencyB ?? undefined);

  const { onStartPriceInput } = useV3MintActionHandlers(mintInfo.noLiquidity);

  return (
    <Box>
      <small className='weight-600'>{t('setInitialPrice')}</small>
      <Box mt={1}>
        <StartingPrice
          currencyA={currencyA}
          currencyB={currencyB}
          mintInfo={mintInfo}
          startPriceHandler={onStartPriceInput}
          priceFormat={priceFormat}
        />
        {/* <div className='ml-2 mxs_ml-0 mxs_mt-1'>
          {currencyA && currencyB && (
            <USDPrices
              currencyA={currencyA}
              currencyB={currencyB}
              currencyAUSDC={currencyAUSDC}
              currencyBUSDC={currencyBUSDC}
              priceFormat={priceFormat}
            />
          )}
        </div> */}
      </Box>
    </Box>
  );
}
