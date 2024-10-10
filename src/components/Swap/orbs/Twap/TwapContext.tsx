import React, { createContext, useEffect, useMemo, useState } from 'react';
import {
  Configs,
  constructSDK,
  DerivedSwapValuesResponse,
  TimeDuration,
  TwapSDK,
} from '@orbs-network/twap-sdk';
import { useActiveWeb3React } from 'hooks';
import { useTwapState } from 'state/swap/twap/hooks';
import { Field } from '../../../../state/swap/actions';
import { useCurrency } from 'hooks/Tokens';
import { tryParseAmount } from 'state/swap/hooks';
import { ChainId, Currency, CurrencyAmount } from '@uniswap/sdk';
import { SwapSide } from '@paraswap/sdk';
import { paraswapTaxBuy, paraswapTaxSell, GlobalValue } from 'constants/index';
import {
  getBestTradeCurrencyAddress,
  useParaswap,
} from '../../../../hooks/useParaswap';
import { useQuery } from '@tanstack/react-query';
import { useExpertModeManager } from 'state/user/hooks';
import useUSDCPrice from 'utils/useUSDCPrice';
import { useCurrencyBalances } from 'state/wallet/hooks';

interface ContextValues {
  isLimitPanel: boolean;
  twapSDK: TwapSDK;
  isMarketOrder: boolean;
  currencies: {
    [Field.INPUT]: Currency | undefined;
    [Field.OUTPUT]: Currency | undefined;
  };
  tradePrice: string | undefined;
  maxImpactAllowed: number;
  currencyBalances: {
    [Field.INPUT]: CurrencyAmount | undefined;
    [Field.OUTPUT]: CurrencyAmount | undefined;
  };
  parsedAmount?: CurrencyAmount;
  derivedSwapValues: DerivedSwapValuesResponse;
  tradeDeadline: number;
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

const useDealine = (twapSDK: TwapSDK, duration: TimeDuration) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    setInterval(() => {
      setCurrentTime(Date.now());
    }, 60_000);
  }, []);

  return useMemo(() => twapSDK.orderDeadline(currentTime, duration), [
    currentTime,
    duration,
    twapSDK,
  ]);
};

export const TwapContextProvider = ({
  children,
  isLimitPanel,
}: {
  children: React.ReactNode;
  isLimitPanel?: boolean;
}) => {
  const state = useTwapState();
  const isMarketOrder = isLimitPanel ? false : !!state.isMarketOrder;
  const twapSDK = useTwapSDK();
  const currencies = useCurrencies();
  const tradePrice = usePrice(isMarketOrder);
  const maxImpactAllowed = useMaxImpactAllowed();
  const currencyBalances = useTokenBalances();
  const parsedAmount = useParsedAmount();

  const derivedSwapValues = useDerivedTwapSwapData(
    isLimitPanel,
    isMarketOrder,
    tradePrice,
  );
  const tradeDeadline = useDealine(twapSDK, derivedSwapValues.duration);

  return (
    <Context.Provider
      value={{
        isLimitPanel: !!isLimitPanel,
        twapSDK,
        isMarketOrder,
        currencies,
        tradePrice,
        maxImpactAllowed,
        currencyBalances,
        parsedAmount,
        derivedSwapValues,
        tradeDeadline
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

const usePrice = (isMarketOrder?: boolean) => {
  const currencies = useCurrencies();
  const state = useTwapState();
  const { chainId } = useActiveWeb3React();
  const { data } = useOptimalRate();
  const marketPrice = data?.rate?.destAmount;

  return useMemo(() => {
    if (isMarketOrder) return marketPrice;
    let result = marketPrice;
    if (state.tradePrice !== undefined) {
      result = tryParseAmount(
        chainId,
        state.isTradePriceInverted
          ? (1 / Number(state.tradePrice)).toString()
          : state.tradePrice,
        currencies[Field.OUTPUT],
      )?.raw.toString();
    }
    return result;
  }, [
    state.tradePrice,
    chainId,
    currencies[Field.OUTPUT],
    marketPrice,
    state.isTradePriceInverted,
    isMarketOrder,
  ]);
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

export const useOptimalRate = () => {
  const paraswap = useParaswap();
  const currencies = useCurrencies();
  const maxImpactAllowed = useMaxImpactAllowed();

  const { chainId, account } = useActiveWeb3React();
  const chainIdToUse = chainId || ChainId.MATIC;
  const inputCurrency = currencies[Field.INPUT];
  const outputCurrency = currencies[Field.OUTPUT];

  // we always use 1 as the amount for the market price
  const srcAmount = tryParseAmount(
    chainIdToUse,
    '1',
    inputCurrency,
  )?.raw.toString();

  const srcToken = inputCurrency
    ? getBestTradeCurrencyAddress(inputCurrency, chainIdToUse)
    : undefined;
  const destToken = outputCurrency
    ? getBestTradeCurrencyAddress(outputCurrency, chainIdToUse)
    : undefined;

  return useQuery({
    queryKey: [
      'fetchTwapOptimalRate',
      srcToken,
      destToken,
      srcAmount,
      account,
      chainId,
      maxImpactAllowed,
    ],
    queryFn: async () => {
      if (!srcToken || !destToken || !srcAmount || !account)
        return { error: undefined, rate: undefined };
      try {
        const rate = await paraswap.getRate({
          srcToken,
          destToken,
          srcDecimals: inputCurrency?.decimals,
          destDecimals: outputCurrency?.decimals,
          amount: srcAmount,
          side: SwapSide.SELL,
          options: {
            includeDEXS: 'quickswap,quickswapv3,quickswapv3.1,quickperps',
            maxImpact: maxImpactAllowed,
            partner: 'quickswapv3',
            //@ts-ignore
            srcTokenTransferFee: paraswapTaxSell[srcToken.toLowerCase()],
            destTokenTransferFee: paraswapTaxBuy[destToken.toLowerCase()],
          },
        });

        return { error: undefined, rate };
      } catch (err) {
        return { error: err.message, rate: undefined };
      }
    },
    refetchInterval: 5000,
    enabled: !!srcToken && !!destToken && !!account,
  });
};

export const useTokenBalances = () => {
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

const useParsedAmount = () => {
  const { chainId } = useActiveWeb3React();
  const typedValue = useTwapState().typedValue;
  const inputCurrency = useCurrencies()[Field.INPUT];
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  return useMemo(() => {
    return tryParseAmount(chainId, typedValue, inputCurrency);
  }, [chainIdToUse, inputCurrency, typedValue, chainId]);
};

const useDerivedTwapSwapData = (
  isLimitPanel?: boolean,
  isMarketOrder?: boolean,
  price?: string,
) => {
  const parsedAmount = useParsedAmount();
  const currencies = useCurrencies();
  const twapSDK = useTwapSDK();
  const state = useTwapState();
  const oneSrcTokenUsd = Number(
    useUSDCPrice(currencies[Field.INPUT])?.toSignificant() ?? 0,
  );

  return twapSDK.derivedSwapValues({
    srcAmount: parsedAmount?.raw.toString(),
    price,
    customDuration: state.duration,
    customChunks: state.chunks,
    customFillDelay: state.fillDelay,
    isLimitPanel,
    oneSrcTokenUsd,
    srcDecimals: currencies[Field.INPUT]?.decimals,
    destDecimals: currencies[Field.OUTPUT]?.decimals,
    isMarketOrder,
  });
};
