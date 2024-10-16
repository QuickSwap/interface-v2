import React, { createContext, useEffect, useMemo, useState } from 'react';
import {
  Configs,
  constructSDK,
  TimeUnit,
  TwapSDK,
} from '@orbs-network/twap-sdk';
import { useActiveWeb3React } from 'hooks';
import { useTwapState, useTwapSwapActionHandlers } from 'state/swap/twap/hooks';
import { Field } from '../../../../state/swap/actions';
import { useCurrency } from 'hooks/Tokens';
import { tryParseAmount } from 'state/swap/hooks';
import { ChainId, Currency, CurrencyAmount } from '@uniswap/sdk';
import { GlobalValue } from 'constants/index';
import { useExpertModeManager } from 'state/user/hooks';
import { useCurrencyBalances } from 'state/wallet/hooks';
import useParsedQueryString from 'hooks/useParsedQueryString';

interface ContextValues {
  currentTime: number;
  maxImpactAllowed: number;
  parsedAmount?: CurrencyAmount;
  isLimitPanel: boolean;
  twapSDK: TwapSDK;
  isMarketOrder: boolean;
  currencies: {
    [Field.INPUT]?: Currency;
    [Field.OUTPUT]?: Currency;
  };
  currencyBalances: {
    [Field.INPUT]?: CurrencyAmount;
    [Field.OUTPUT]?: CurrencyAmount;
  };
}

const Context = createContext({} as ContextValues);

const useTwapSDK = () => {
  const { chainId } = useActiveWeb3React();
  const config = useMemo(() => {
    switch (chainId) {
      default:
        return Configs.QuickSwap;
    }
  }, [chainId]);

  return useMemo(() => constructSDK({ config }), [config]);
};

const useIsLimitPanel = () => {
  const parsedQs = useParsedQueryString();
  const swapType = parsedQs.swapIndex;

  return Number(swapType) === 3;
};

export const TwapContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const state = useTwapState();
  const isLimitPanel = useIsLimitPanel();

  const { onDurationInput } = useTwapSwapActionHandlers();
  const isMarketOrder = isLimitPanel ? false : !!state.isMarketOrder;
  useEffect(() => {
    if (isLimitPanel) {
      onDurationInput({ unit: TimeUnit.Days, value: 7 });
    } else {
      onDurationInput(undefined);
    }
  }, [isLimitPanel, onDurationInput]);

  useEffect(() => {
    setInterval(() => {
      setCurrentTime(Date.now());
    }, 60_000);
  }, []);

  return (
    <Context.Provider
      value={{
        currentTime,
        maxImpactAllowed: useMaxImpactAllowed(),
        currencies: useCurrencies(),
        currencyBalances: useBalances(),
        parsedAmount: useParsedSrcAmount(),
        isLimitPanel,
        isMarketOrder,
        twapSDK: useTwapSDK(),
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useTwapContext = () => {
  return React.useContext(Context);
};

const useCurrencies = () => {
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useTwapState();

  return {
    [Field.INPUT]: useCurrency(inputCurrencyId) ?? undefined,
    [Field.OUTPUT]: useCurrency(outputCurrencyId) ?? undefined,
  };
};

const useMaxImpactAllowed = () => {
  const [isExpertMode] = useExpertModeManager();

  return isExpertMode
    ? 100
    : Number(
        GlobalValue.percents.BLOCKED_PRICE_IMPACT_NON_EXPERT.multiply(
          '100',
        ).toFixed(4),
      );
};

const useBalances = () => {
  const { account } = useActiveWeb3React();
  const currencies = useCurrencies();

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    currencies[Field.INPUT] ?? undefined,
    currencies[Field.OUTPUT] ?? undefined,
  ]);

  return {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1],
  };
};

const useParsedSrcAmount = () => {
  const { chainId } = useActiveWeb3React();
  const typedValue = useTwapState().typedValue;
  const inputCurrency = useCurrencies()[Field.INPUT];
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  return useMemo(() => {
    return tryParseAmount(chainIdToUse, typedValue, inputCurrency);
  }, [chainIdToUse, inputCurrency, typedValue]);
};
