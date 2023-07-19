import React, { useMemo } from 'react';
import { useActiveWeb3React } from 'hooks';
import { constructSimpleSDK } from '@paraswap/sdk';
import { ChainId, Currency, ETHER, Token } from '@uniswap/sdk';
import { paraswapAPIURL } from 'constants/index';

const PARASWAP_NATIVE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export function getBestTradeCurrencyAddress(
  currency: Currency,
  chainId: ChainId,
) {
  return currency instanceof Token
    ? currency.address
    : currency === ETHER[chainId]
    ? PARASWAP_NATIVE_ADDRESS
    : '';
}

export function useParaswap() {
  const { chainId } = useActiveWeb3React();
  return useMemo(() => {
    const paraswapSDK = constructSimpleSDK({
      network: <number>chainId,
      fetch: window.fetch,
      apiURL: paraswapAPIURL[chainId],
    });

    return paraswapSDK;
  }, [chainId]);
}
