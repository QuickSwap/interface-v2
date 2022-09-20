// a list of tokens by chain
import { ChainId } from '@uniswap/sdk';
import { Currency, Token } from '@uniswap/sdk-core';
import { GlobalTokens } from 'constants/index';
import { ExtendedEther, WMATIC_EXTENDED } from 'constants/tokens';

export const toToken = (t: {
  chainId: number;
  address: string;
  decimals: number;
  symbol?: string;
  name?: string;
}): Token => {
  return new Token(t.chainId, t.address, t.decimals, t.symbol, t.name);
};

type ChainTokenList = {
  readonly [chainId: number]: Token[];
};

type ChainCurrencyList = {
  readonly [chainId: number]: Currency[];
};

const WETH_ONLY: ChainTokenList = Object.fromEntries(
  Object.entries(WMATIC_EXTENDED).map(([key, value]) => [key, [value]]),
);

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MATIC]: [
    ...WETH_ONLY[ChainId.MATIC],
    toToken(GlobalTokens[ChainId.MATIC]['USDC']),
  ],
};

export const ADDITIONAL_BASES: {
  [chainId: number]: { [tokenAddress: string]: Token[] };
} = {};
/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: {
  [chainId: number]: { [tokenAddress: string]: Token[] };
} = {};

/**
 * Shows up in the currency select for swap and add liquidity
 */
export const COMMON_BASES: ChainCurrencyList = {
  [ChainId.MATIC]: [
    ExtendedEther.onChain(ChainId.MATIC),
    WMATIC_EXTENDED[ChainId.MATIC],
    toToken(GlobalTokens[ChainId.MATIC]['USDC']),
    toToken(GlobalTokens[ChainId.MATIC]['OLD_QUICK']),
  ],
};

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MATIC]: [
    ...WETH_ONLY[ChainId.MATIC],
    toToken(GlobalTokens[ChainId.MATIC]['DAI']),
    toToken(GlobalTokens[ChainId.MATIC]['USDC']),
    toToken(GlobalTokens[ChainId.MATIC]['USDT']),
    toToken(GlobalTokens[ChainId.MATIC]['OLD_QUICK']),
    toToken(GlobalTokens[ChainId.MATIC]['NEW_QUICK']),
    toToken(GlobalTokens[ChainId.MATIC]['ETHER']),
    toToken(GlobalTokens[ChainId.MATIC]['WBTC']),
  ],
};
export const PINNED_PAIRS: { readonly [chainId: number]: [Token, Token][] } = {
  [ChainId.MATIC]: [
    [
      toToken(GlobalTokens[ChainId.MATIC]['USDC']),
      toToken(GlobalTokens[ChainId.MATIC]['USDT']),
    ],
  ],
};
