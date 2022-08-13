import React, { useEffect, useMemo, useState } from 'react';
import { useActiveWeb3React } from 'hooks';
import {
  constructSimpleSDK,
  OptimalRate,
  SDKFetchMethods,
  SwapSide,
} from '@paraswap/sdk';
import { Currency, ETHER, JSBI, Token, Trade } from '@uniswap/sdk';

const PARASWAP_NATIVE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export function getBestTradeCurrencyAddress(currency: Currency) {
  return currency instanceof Token
    ? currency.address
    : currency === ETHER
    ? PARASWAP_NATIVE_ADDRESS
    : '';
} 

export function useParaswap() {
  const { account, chainId, library } = useActiveWeb3React();
  return useMemo(() => {
    const paraswapSDK = constructSimpleSDK({
      network: <number>chainId,
      fetch: window.fetch,
    });

    return paraswapSDK;
  }, [library, chainId]);
}

export function useOptimateRateFetcher(trade: Trade | undefined) {
  const paraswap = useParaswap();
  const [optimalRate, setOptimalRate] = useState<OptimalRate | undefined>();
  const [optimalRateLoading, setOptimalRateLoading] = useState<boolean>(false);

  async function fetchOptimalRate() {
    if (!trade) {
      return;
    }
    setOptimalRateLoading(true);

    try {
      const srcAmount = trade.inputAmount
        .multiply(JSBI.BigInt(10 ** trade.inputAmount.currency.decimals))
        .toFixed(0);

      const lastPathIndex = trade.route.path.length - 1;
      const srcToken = trade.route.path[0].address;
      const destToken = trade.route.path[lastPathIndex].address;

      const rate = await paraswap.getRate({
        srcToken,
        destToken,
        amount: srcAmount,
        side: SwapSide.SELL,
        options: {
          includeDEXS: 'quickswap,quickswapv3',
        },
      });
      setOptimalRate(rate);
    } catch (err) {
      console.error('Gas price fetching failed', err.code, err.message);
    }
    setOptimalRateLoading(false);
  }

  return { fetchOptimalRate, optimalRate, optimalRateLoading };
}
