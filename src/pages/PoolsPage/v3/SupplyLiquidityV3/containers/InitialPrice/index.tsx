import React, { useEffect } from 'react';
import { Currency } from '@uniswap/sdk-core';
import useUSDCPrice from 'hooks/v3/useUSDCPrice';
import { PriceFormats } from 'components/v3/PriceFomatToggler';
import StartingPrice from '../../components/StartingPrice';
import { USDPrices } from '../../components/USDPrices';
// import { useHistory } from 'react-router-dom';
import { useAppDispatch } from 'state/hooks';
// import { updateCurrentStep } from 'state/mint/v3/actions';
import { IDerivedMintInfo, useV3MintActionHandlers } from 'state/mint/v3/hooks';
import { Box } from '@material-ui/core';

import './index.scss';

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
  const currencyAUSDC = useUSDCPrice(currencyA ?? undefined);
  const currencyBUSDC = useUSDCPrice(currencyB ?? undefined);

  const dispatch = useAppDispatch();

  const { onStartPriceInput } = useV3MintActionHandlers(mintInfo.noLiquidity);

  // const history = useHistory();

  // useEffect(() => {
  //   return () => {
  //     if (history.action === 'POP') {
  //       dispatch(updateCurrentStep({ currentStep: backStep }));
  //     }
  //   };
  // }, []);

  return (
    <Box>
      <small className='weight-600'>Set Initial Price</small>
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
