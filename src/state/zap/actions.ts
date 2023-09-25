import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core';
import { Pair, ChainId } from '@uniswap/sdk';
import { ZapType } from '@ape.swap/v2-zap-sdk';
import { createAction } from '@reduxjs/toolkit';
import { PairState } from 'data/Reserves';
import JSBI from 'jsbi';

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

type CurrencyOut = {
  outputCurrency: Token;
  path: Token[];
  outputAmount: CurrencyAmount<Currency>;
  minOutputAmount: string;
};

export type MergedZap = {
  currencyIn: {
    currency: Currency;
    inputAmount: JSBI;
  };
  currencyOut1: CurrencyOut;
  currencyOut2: CurrencyOut;
  pairOut: {
    pair: Pair;
    pairState: PairState;
    inAmount: {
      token1: CurrencyAmount<Currency>;
      token2: CurrencyAmount<Currency>;
    };
    minInAmount: { token1: string; token2: string };
    totalPairSupply: CurrencyAmount<Token>;
    liquidityMinted: CurrencyAmount<Token>;
    poolTokenPercentage: Percent;
  };
  liquidityProviderFee: CurrencyAmount<Currency>;
  totalPriceImpact: Percent;
  chainId: ChainId;
};

export const selectInputCurrency = createAction<{ currencyId: string }>(
  'zap/selectInputCurrency',
);
export const selectOutputCurrency = createAction<{
  currency1: string;
  currency2: string;
}>('zap/selectOutputCurrency');
export const setZapType = createAction<{ zapType: ZapType }>('zap/setZapType');
export const typeInput = createAction<{ field: Field; typedValue: string }>(
  'zap/typeInput',
);
export const replaceZapState = createAction<{
  field: string;
  typedValue: string;
  inputCurrencyId?: string;
  outputCurrencyId?: { currency1: string; currency2: string };
  recipient: string | undefined;
  zapType: ZapType;
}>('zap/replaceSwapState');
export const setRecipient = createAction<{ recipient: string | null }>(
  'zap/setRecipient',
);
export const setInputList = createAction<{
  zapInputList: { [symbol: string]: Token };
}>('zap/setInputList');
export const setZapNewOutputList = createAction<{
  zapNewOutputList: { currencyIdA: string; currencyIdB: string }[];
}>('zap/setZapNewOutputList');
