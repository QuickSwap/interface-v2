import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useCurrency } from 'hooks/v3/Tokens';
import usePrevious from 'hooks/usePrevious';
import { useActiveWeb3React } from 'hooks';
import { useParams } from 'react-router-dom';
import {
  useV3DerivedMintInfo,
  useV3MintState,
  useV3MintActionHandlers,
  useInitialUSDPrices,
  useCurrentStep,
} from 'state/mint/v3/hooks';
import { InitialPrice } from './containers/InitialPrice';
import { EnterAmounts } from './containers/EnterAmounts';
import { SelectPair } from './containers/SelectPair';
import { SelectRange } from './containers/SelectRange';

import { Currency, Percent } from '@uniswap/sdk-core';

import './index.scss';
import { WMATIC_EXTENDED } from 'constants/tokens';
import {
  setInitialTokenPrice,
  setInitialUSDPrices,
  updateCurrentStep,
  updateSelectedPreset,
} from 'state/mint/v3/actions';
import { Field } from 'state/mint/actions';
import useUSDCPrice from 'hooks/v3/useUSDCPrice';
import {
  PriceFormats,
  PriceFormatToggler,
} from 'components/v3/PriceFomatToggler';
import { AddLiquidityButton } from './containers/AddLiquidityButton';
import { PoolState } from 'hooks/v3/usePools';
import { RouterGuard } from './routing/router-guards';
import { useAppDispatch } from 'state/hooks';
// import SettingsTab from "components/Settings";
import { Aftermath } from './containers/Aftermath';
import { useWalletModalToggle } from 'state/application/hooks';
import { isMobileOnly } from 'react-device-detect';
import { ZERO_PERCENT } from 'constants/v3/misc';
import { useIsExpertMode, useUserSlippageTolerance } from 'state/user/hooks';
import { JSBI } from '@uniswap/sdk';
import { currencyId } from 'utils/v3/currencyId';
import { Box, Button } from '@material-ui/core';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { SettingsModal } from 'components';
import { ReactComponent as SettingsIcon } from 'assets/images/SettingsIcon.svg';

export function SupplyLiquidityV3() {
  const params: any = useParams();
  const parsedQuery = useParsedQueryString();
  const currencyIdAParam =
    params && params.currencyIdA
      ? params.currencyIdA.toLowerCase() === 'matic' ||
        params.currencyIdA.toLowerCase() === 'eth'
        ? 'matic'
        : params.currencyIdA
      : parsedQuery && parsedQuery.currency0
      ? (parsedQuery.currency0 as string).toLowerCase() === 'eth' ||
        (parsedQuery.currency0 as string).toLowerCase() === 'matic'
        ? 'matic'
        : (parsedQuery.currency0 as string)
      : undefined;
  const currencyIdBParam =
    params && params.currencyIdB
      ? params.currencyIdB.toLowerCase() === 'matic' ||
        params.currencyIdB.toLowerCase() === 'eth'
        ? 'matic'
        : params.currencyIdB
      : parsedQuery && parsedQuery.currency1
      ? (parsedQuery.currency1 as string).toLowerCase() === 'eth' ||
        (parsedQuery.currency1 as string).toLowerCase() === 'matic'
        ? 'matic'
        : (parsedQuery.currency1 as string)
      : undefined;

  const [currencyIdA, setCurrencyIdA] = useState(currencyIdAParam);
  const [currencyIdB, setCurrencyIdB] = useState(currencyIdBParam);

  const { account, chainId } = useActiveWeb3React();

  const toggleWalletModal = useWalletModalToggle(); // toggle wallet when disconnected

  const dispatch = useAppDispatch();

  const feeAmount = 100;

  const currentStep = useCurrentStep();

  const expertMode = useIsExpertMode();

  const [priceFormat, setPriceFormat] = useState(PriceFormats.TOKEN);
  const [openSettingsModal, setOpenSettingsModal] = useState(false);

  useEffect(() => {
    onFieldAInput('');
    onFieldBInput('');
    onLeftRangeInput('');
    onRightRangeInput('');
  }, [currencyIdA, currencyIdB]);

  const baseCurrency = useCurrency(currencyIdA);
  const currencyB = useCurrency(currencyIdB);
  // prevent an error if they input ETH/WETH
  //TODO
  const quoteCurrency =
    baseCurrency && currencyB && baseCurrency.wrapped.equals(currencyB.wrapped)
      ? undefined
      : currencyB;

  const derivedMintInfo = useV3DerivedMintInfo(
    baseCurrency ?? undefined,
    quoteCurrency ?? undefined,
    feeAmount,
    baseCurrency ?? undefined,
    undefined,
  );
  const prevDerivedMintInfo = usePrevious({ ...derivedMintInfo });

  const mintInfo = useMemo(() => {
    if (
      (!derivedMintInfo.pool ||
        !derivedMintInfo.price ||
        derivedMintInfo.noLiquidity) &&
      prevDerivedMintInfo
    ) {
      return {
        ...prevDerivedMintInfo,
        pricesAtTicks: derivedMintInfo.pricesAtTicks,
        ticks: derivedMintInfo.ticks,
        parsedAmounts: derivedMintInfo.parsedAmounts,
      };
    }
    return {
      ...derivedMintInfo,
    };
  }, [derivedMintInfo, baseCurrency, quoteCurrency]);

  const initialUSDPrices = useInitialUSDPrices();
  const usdPriceA = useUSDCPrice(baseCurrency ?? undefined);
  const usdPriceB = useUSDCPrice(quoteCurrency ?? undefined);

  const {
    onFieldAInput,
    onFieldBInput,
    onLeftRangeInput,
    onRightRangeInput,
    onStartPriceInput,
  } = useV3MintActionHandlers(mintInfo.noLiquidity);

  const { startPriceTypedValue } = useV3MintState();

  const handleCurrencySelect = useCallback(
    (
      currencyNew: Currency,
      currencyIdOther?: string,
    ): (string | undefined)[] => {
      const currencyIdNew = currencyId(currencyNew, chainId || 137);

      let chainSymbol;

      if (chainId === 137) {
        chainSymbol = 'MATIC';
      }

      resetState();

      if (currencyIdNew.toLowerCase() === currencyIdOther?.toLowerCase()) {
        // not ideal, but for now clobber the other if the currency ids are equal
        return [currencyIdNew, undefined];
      } else {
        // prevent weth + eth
        const isETHOrWETHNew =
          currencyIdNew === chainSymbol ||
          (chainId !== undefined &&
            currencyIdNew === WMATIC_EXTENDED[chainId]?.address);
        const isETHOrWETHOther =
          currencyIdOther !== undefined &&
          (currencyIdOther === chainSymbol ||
            (chainId !== undefined &&
              currencyIdOther === WMATIC_EXTENDED[chainId]?.address));

        if (isETHOrWETHNew && isETHOrWETHOther) {
          return [currencyIdNew, undefined];
        } else {
          return [currencyIdNew, currencyIdOther];
        }
      }
    },
    [chainId],
  );

  const handleCurrencyASelect = useCallback(
    (currencyANew: Currency) => {
      const [idA] = handleCurrencySelect(currencyANew);
      setCurrencyIdA(idA);
    },
    [handleCurrencySelect],
  );

  const handleCurrencyBSelect = useCallback(
    (currencyBNew: Currency) => {
      const [idB] = handleCurrencySelect(currencyBNew);
      setCurrencyIdB(idB);
    },
    [handleCurrencySelect],
  );

  const handleCurrencySwap = useCallback(() => {
    // history.push(`/add/${currencyIdB}/${currencyIdA}`);
    resetState();
  }, [handleCurrencySelect, currencyIdA, currencyIdB]);

  const handlePopularPairSelection = useCallback((pair: [string, string]) => {
    const WMATIC = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270';
    // history.push(
    //   `/add/${pair[0] === WMATIC ? 'MATIC' : pair[0]}/${
    //     pair[1] === WMATIC ? 'MATIC' : pair[1]
    //   }`,
    // );
    resetState();
  }, []);

  // const handleStepChange = useCallback(
  //   (_step) => {
  //     history.push(`/add/${currencyIdA}/${currencyIdB}/${_step}`);
  //   },
  //   [currencyIdA, currencyIdB, history],
  // );

  const handlePriceFormat = useCallback((priceFormat: PriceFormats) => {
    setPriceFormat(priceFormat);
  }, []);

  function resetState() {
    dispatch(updateSelectedPreset({ preset: null }));
    dispatch(setInitialTokenPrice({ typedValue: '' }));
    dispatch(setInitialUSDPrices({ field: Field.CURRENCY_A, typedValue: '' }));
    dispatch(setInitialUSDPrices({ field: Field.CURRENCY_B, typedValue: '' }));
    onStartPriceInput('');
  }

  const stepLinks = useMemo(() => {
    const _stepLinks = [
      {
        link: 'select-pair',
        title: `Select a pair`,
      },
    ];

    if (mintInfo.noLiquidity && baseCurrency && quoteCurrency) {
      _stepLinks.push({
        link: 'initial-price',
        title: `Set initial price`,
      });
    }

    _stepLinks.push(
      {
        link: 'select-range',
        title: `Select a range`,
      },
      {
        link: 'enter-amounts',
        title: `Enter amounts`,
      },
    );
    return _stepLinks;
  }, [baseCurrency, quoteCurrency, mintInfo]);

  const stepPair = useMemo(() => {
    return Boolean(
      baseCurrency &&
        quoteCurrency &&
        mintInfo.poolState !== PoolState.INVALID &&
        mintInfo.poolState !== PoolState.LOADING,
    );
  }, [baseCurrency, quoteCurrency, mintInfo]);

  const stepRange = useMemo(() => {
    return Boolean(
      mintInfo.lowerPrice &&
        mintInfo.upperPrice &&
        !mintInfo.invalidRange &&
        account,
    );
  }, [mintInfo]);

  const stepAmounts = useMemo(() => {
    if (mintInfo.outOfRange) {
      return Boolean(
        mintInfo.parsedAmounts[Field.CURRENCY_A] ||
          (mintInfo.parsedAmounts[Field.CURRENCY_B] && account),
      );
    }
    return Boolean(
      mintInfo.parsedAmounts[Field.CURRENCY_A] &&
        mintInfo.parsedAmounts[Field.CURRENCY_B] &&
        account,
    );
  }, [mintInfo]);

  const stepInitialPrice = useMemo(() => {
    return mintInfo.noLiquidity
      ? Boolean(+startPriceTypedValue && account)
      : false;
  }, [mintInfo, startPriceTypedValue]);

  const steps = useMemo(() => {
    if (mintInfo.noLiquidity) {
      return [stepPair, stepInitialPrice, stepRange, stepAmounts];
    }

    return [stepPair, stepRange, stepAmounts];
  }, [stepPair, stepRange, stepAmounts, stepInitialPrice, mintInfo]);

  const completedSteps = useMemo(() => {
    return Array(currentStep).map((_, i) => i + 1);
  }, [currentStep]);

  const [allowedSlippage] = useUserSlippageTolerance();
  const allowedSlippagePercent: Percent = useMemo(() => {
    return new Percent(JSBI.BigInt(allowedSlippage), JSBI.BigInt(10000));
  }, [allowedSlippage]);

  const hidePriceFormatter = useMemo(() => {
    return true;
    // if (stepInitialPrice && currentStep < 2) {
    //   return false;
    // }

    // if (!stepInitialPrice && currentStep < 1) {
    //   return false;
    // }

    // return Boolean(
    //   (mintInfo.noLiquidity ? stepInitialPrice : stepPair) &&
    //     !initialUSDPrices.CURRENCY_A &&
    //     !initialUSDPrices.CURRENCY_B &&
    //     !usdPriceA &&
    //     !usdPriceB,
    // );
  }, [
    mintInfo,
    currentStep,
    stepRange,
    stepInitialPrice,
    usdPriceA,
    usdPriceB,
    initialUSDPrices,
  ]);

  useEffect(() => {
    if (hidePriceFormatter) {
      handlePriceFormat(PriceFormats.TOKEN);
      setPriceFormat(PriceFormats.TOKEN);
    }
  }, [hidePriceFormatter]);

  // useEffect(() => {
  //   return () => {
  //     resetState();
  //     dispatch(updateCurrentStep({ currentStep: 0 }));
  //   };
  // }, []);

  // useEffect(() => {
  //   switch (currentStep) {
  //     // case 0: {
  //     //     history.push(`/add/${currencyIdA}/${currencyIdB}/select-pair`);
  //     //     break;
  //     // }
  //     case 1: {
  //       if (!mintInfo.noLiquidity) {
  //         history.push(`/add/${currencyIdA}/${currencyIdB}/select-range`);
  //       } else {
  //         history.push(`/add/${currencyIdA}/${currencyIdB}/initial-price`);
  //       }
  //       break;
  //     }
  //     case 2: {
  //       if (!mintInfo.noLiquidity) {
  //         history.push(`/add/${currencyIdA}/${currencyIdB}/enter-amounts`);
  //       } else {
  //         history.push(`/add/${currencyIdA}/${currencyIdB}/select-range`);
  //       }
  //       break;
  //     }
  //     case 3: {
  //       if (mintInfo.noLiquidity) {
  //         history.push(`/add/${currencyIdA}/${currencyIdB}/enter-amounts`);
  //       }
  //       break;
  //     }
  //   }
  // }, [currencyIdA, currencyIdB, history, currentStep, mintInfo.noLiquidity]);

  return (
    <Box>
      {openSettingsModal && (
        <SettingsModal
          open={openSettingsModal}
          onClose={() => setOpenSettingsModal(false)}
        />
      )}
      <Box className='flex justify-between items-center'>
        <p className='weight-600'>Supply Liquidity</p>
        <Box className='flex items-center'>
          <small
            className='cursor-pointer text-primary'
            onClick={() => {
              setCurrencyIdA(currencyIdAParam);
              setCurrencyIdB(currencyIdBParam);
              resetState();
              onFieldAInput('');
              onFieldBInput('');
            }}
          >
            Clear all
          </small>
          {!hidePriceFormatter && (
            <Box className='flex' ml={1}>
              <PriceFormatToggler
                currentFormat={priceFormat}
                handlePriceFormat={handlePriceFormat}
              />
            </Box>
          )}
          <Box className='flex cursor-pointer'>
            <SettingsIcon onClick={() => setOpenSettingsModal(true)} />
          </Box>
        </Box>
      </Box>
      <Box mt={2}>
        {account ? (
          <SelectPair
            baseCurrency={baseCurrency}
            quoteCurrency={quoteCurrency}
            mintInfo={mintInfo}
            isCompleted={stepPair}
            handleCurrencySwap={handleCurrencySwap}
            handleCurrencyASelect={handleCurrencyASelect}
            handleCurrencyBSelect={handleCurrencyBSelect}
            handlePopularPairSelection={handlePopularPairSelection}
            priceFormat={priceFormat}
          />
        ) : (
          <Button
            className='v3-supply-liquidity-button'
            onClick={toggleWalletModal}
          >
            Connect Wallet
          </Button>
        )}
      </Box>
      <Box mt={4} position='relative'>
        {(!baseCurrency || !quoteCurrency) && (
          <Box className='v3-supply-liquidity-overlay' />
        )}
        {mintInfo.noLiquidity && baseCurrency && quoteCurrency && (
          <Box mb={2}>
            <InitialPrice
              currencyA={baseCurrency ?? undefined}
              currencyB={currencyB ?? undefined}
              mintInfo={mintInfo}
              priceFormat={priceFormat}
            />
          </Box>
        )}
        <SelectRange
          currencyA={baseCurrency}
          currencyB={quoteCurrency}
          mintInfo={mintInfo}
          priceFormat={priceFormat}
        />
        <Box mt={4}>
          <EnterAmounts
            currencyA={baseCurrency ?? undefined}
            currencyB={currencyB ?? undefined}
            mintInfo={mintInfo}
            isCompleted={stepAmounts}
            additionalStep={stepInitialPrice}
            priceFormat={priceFormat}
            backStep={stepInitialPrice ? 2 : 1}
          />
        </Box>

        <Box mt={2}>
          <AddLiquidityButton
            baseCurrency={baseCurrency ?? undefined}
            quoteCurrency={quoteCurrency ?? undefined}
            mintInfo={mintInfo}
            handleAddLiquidity={() => {
              resetState();
              onFieldAInput('');
              onFieldBInput('');
            }}
            title={expertMode ? `Add liquidity` : 'Preview'}
          />
        </Box>
      </Box>
    </Box>
  );
}
