import React, { useEffect, useMemo, useState } from 'react';
import { useActiveWeb3React } from 'hooks';
import { constructSimpleSDK } from '@paraswap/sdk';
import { ChainId, Currency, ETHER as NATIVE, JSBI, Token, Trade } from '@uniswap/sdk';

const PARASWAP_NATIVE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export function getBestTradeCurrencyAddress(
  currency: Currency,
  chainId: ChainId,
) {
  return currency instanceof Token
    ? currency.address
    : currency === NATIVE[chainId]
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
