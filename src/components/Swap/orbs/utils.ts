import { Currency, JSBI } from '@uniswap/sdk';
import {
  CurrencyAmount as CurrencyAmountV3,
  Currency as CurrencyV3,
} from '@uniswap/sdk-core';
import { QUOTE_ERRORS } from '@orbs-network/liquidity-hub-sdk';
import { BigNumber } from 'ethers';

export const subtractSlippage = (allowedSlippage = 0, outAmount?: string) => {
  if (!outAmount) return undefined;

  return BigNumber.from(outAmount)
    .mul(BigNumber.from(10000 - Number(allowedSlippage.toFixed(0))))
    .div(BigNumber.from(10000))
    .toString();
};

export async function promiseWithTimeout<T>(
  promise: Promise<T>,
  timeout: number,
): Promise<T> {
  let timer: any;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error('timeout'));
    }, timeout);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer);
    return result;
  } catch (error) {
    clearTimeout(timer);
    throw error;
  }
}

export const fromRawAmount = (currency?: Currency, amount?: string) => {
  if (!currency || !amount) return undefined;
  return CurrencyAmountV3.fromRawAmount(
    currency as CurrencyV3,
    JSBI.BigInt(amount),
  );
};

export const isRejectedError = (error: any) => {
  const message = error.message?.toLowerCase();
  return message?.includes('rejected') || message?.includes('denied');
};

export const isTimeoutError = (error: any) => {
  const message = error.message?.toLowerCase();
  return message?.includes('timeout');
};

export const makeElipsisAddress = (address?: string, padding = 6): string => {
  if (!address) return '';
  return `${address.substring(0, padding)}...${address.substring(
    address.length - padding,
  )}`;
};

export const isLowInAmountError = (error: any) => {
  return (error as Error)?.message === QUOTE_ERRORS.ldv;
};
