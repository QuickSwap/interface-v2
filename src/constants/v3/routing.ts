// a list of tokens by chain
import { ChainId } from '@uniswap/sdk';
import { Currency, Token } from '@uniswap/sdk-core';
import { GlobalValue } from 'constants/index';
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

const DAI = toToken(GlobalValue.tokens.COMMON.DAI);
const USDC = toToken(GlobalValue.tokens.COMMON.USDC);
const USDT = toToken(GlobalValue.tokens.COMMON.USDT);
const OLD_QUICK = toToken(GlobalValue.tokens.COMMON.OLD_QUICK);
const NEW_QUICK = toToken(GlobalValue.tokens.COMMON.NEW_QUICK);
const ETHER = toToken(GlobalValue.tokens.COMMON.ETHER);
const WBTC = toToken(GlobalValue.tokens.COMMON.WBTC);

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
  [ChainId.MATIC]: [...WETH_ONLY[ChainId.MATIC], USDC],
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
    USDC,
    OLD_QUICK,
  ],
};

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MATIC]: [
    ...WETH_ONLY[ChainId.MATIC],
    DAI,
    USDC,
    USDT,
    OLD_QUICK,
    NEW_QUICK,
    ETHER,
    WBTC,
  ],
};
export const PINNED_PAIRS: { readonly [chainId: number]: [Token, Token][] } = {
  [ChainId.MATIC]: [[USDC, USDT]],
};
