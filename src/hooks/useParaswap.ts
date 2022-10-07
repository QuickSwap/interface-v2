import React, { useMemo } from 'react';
import { useActiveWeb3React } from 'hooks';
import { constructSimpleSDK } from '@paraswap/sdk';
import { Currency, ETHER, Token } from '@uniswap/sdk';

const PARASWAP_NATIVE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export function getBestTradeCurrencyAddress(currency: Currency) {
  return currency instanceof Token
    ? currency.address
    : currency === ETHER
    ? PARASWAP_NATIVE_ADDRESS
    : '';
}

export function useParaswap() {
  const { chainId } = useActiveWeb3React();
  return useMemo(() => {
    const paraswapSDK = constructSimpleSDK({
      network: <number>chainId,
      fetch: window.fetch,
    });

    return paraswapSDK;
  }, [chainId]);
}
