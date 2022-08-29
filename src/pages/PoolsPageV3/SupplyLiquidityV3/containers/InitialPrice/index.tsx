import React, { useEffect } from 'react';
import { Currency } from '@uniswap/sdk-core';
import useUSDCPrice from 'hooks/v3/useUSDCPrice';
import { PriceFormats } from '../../components/PriceFomatToggler';
import StartingPrice from '../../components/StartingPrice';
import { StepTitle } from '../../components/StepTitle';
import { USDPrices } from '../../components/USDPrices';
import { useHistory } from 'react-router-dom';
import { useAppDispatch } from 'state/hooks';
import { updateCurrentStep } from 'state/mint/v3/actions';
import { IDerivedMintInfo, useV3MintActionHandlers } from 'state/mint/v3/hooks';

import './index.scss';

interface IInitialPrice {
  currencyA: Currency | undefined;
  currencyB: Currency | undefined;
  mintInfo: IDerivedMintInfo;
  isCompleted: boolean;
  priceFormat: PriceFormats;
  backStep: number;
}

export function InitialPrice({
  currencyA,
  currencyB,
  mintInfo,
  isCompleted,
  priceFormat,
  backStep,
}: IInitialPrice) {
  const currencyAUSDC = useUSDCPrice(currencyA ?? undefined);
  const currencyBUSDC = useUSDCPrice(currencyB ?? undefined);

  const dispatch = useAppDispatch();

  const { onStartPriceInput } = useV3MintActionHandlers(mintInfo.noLiquidity);

  const history = useHistory();

  useEffect(() => {
    return () => {
      if (history.action === 'POP') {
        dispatch(updateCurrentStep({ currentStep: backStep }));
      }
    };
  }, []);

  return (
    <div className='initial-price-wrapper f c'>
      <StepTitle
        title={`Set initial price`}
        isCompleted={isCompleted}
        step={2}
      />
      <div className='f mxs_fd-c'>
        <StartingPrice
          currencyA={currencyA}
          currencyB={currencyB}
          mintInfo={mintInfo}
          startPriceHandler={onStartPriceInput}
          priceFormat={priceFormat}
        />
        <div className='ml-2 mxs_ml-0 mxs_mt-1'>
          {currencyA && currencyB && (
            <USDPrices
              currencyA={currencyA}
              currencyB={currencyB}
              currencyAUSDC={currencyAUSDC}
              currencyBUSDC={currencyBUSDC}
              priceFormat={priceFormat}
            />
          )}
        </div>
      </div>
    </div>
  );
}
