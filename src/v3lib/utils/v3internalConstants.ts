import { Currency, CurrencyAmount } from '@uniswap/sdk';
import {
  Currency as CurrencyV3,
  CurrencyAmount as CurrencyAmountV3,
  Token as TokenV3,
} from '@uniswap/sdk-core';
import { useToken } from 'hooks/v3/Tokens';
import JSBI from 'jsbi';

// constants used internally but not expected to be used externally
export const NEGATIVE_ONE = JSBI.BigInt(-1);
export const ZERO = JSBI.BigInt(0);
export const ONE = JSBI.BigInt(1);

// used in liquidity amount math
export const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));
export const Q192 = JSBI.exponentiate(Q96, JSBI.BigInt(2));

// // export function CurrencyV2ToV3(currency: Currency): CurrencyV3 {
// //   return {address:'',chainId:'',decimals:currency?.decimals, wrapped}
// // }
// export const CurrencyV3ToV2 = (currency: CurrencyV3) => {};

// export const CurrencyAmountV2ToV3 = (
//   currencyAmount: CurrencyAmount,
//   currency: Currency,
// ) => {};

// export const CurrencyAmountV3ToV2 = (
//   currencyAmount: CurrencyAmountV3<CurrencyV3>,
// ) => {};
