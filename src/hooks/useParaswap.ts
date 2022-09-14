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
