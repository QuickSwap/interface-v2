import { currencyEquals, ETHER } from '@uniswap/sdk';
import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import useParsedQueryString from './useParsedQueryString';

export default function useSwapRedirects() {
  const history = useHistory();
  const currentPath = history.location.pathname + history.location.search;
  const parsedQs = useParsedQueryString();

  const redirectWithCurrency = useCallback(
    (currency: any, isInput: boolean, isV2 = true) => {
      let redirectPath = '';
      const currencyId = (isV2
      ? currencyEquals(currency, ETHER)
      : currency.isNative)
        ? 'ETH'
        : currency.address;
      if (isInput) {
        if (parsedQs.currency0 ?? parsedQs.inputCurrency) {
          if (parsedQs.currency0) {
            redirectPath = currentPath.replace(
              `currency0=${parsedQs.currency0}`,
              `currency0=${currencyId}`,
            );
          } else {
            redirectPath = currentPath.replace(
              `inputCurrency=${parsedQs.inputCurrency}`,
              `inputCurrency=${currencyId}`,
            );
          }
        } else {
          redirectPath = `${currentPath}${
            history.location.search === '' ? '?' : '&'
          }currency0=${currencyId}`;
        }
      } else {
        if (parsedQs.currency1 ?? parsedQs.outputCurrency) {
          if (parsedQs.currency1) {
            redirectPath = currentPath.replace(
              `currency1=${parsedQs.currency1}`,
              `currency1=${currencyId}`,
            );
          } else {
            redirectPath = currentPath.replace(
              `outputCurrency=${parsedQs.outputCurrency}`,
              `outputCurrency=${currencyId}`,
            );
          }
        } else {
          redirectPath = `${currentPath}${
            history.location.search === '' ? '?' : '&'
          }currency1=${currencyId}`;
        }
      }
      history.push(redirectPath);
    },
    [currentPath, history, parsedQs],
  );

  const redirectWithSwitch = useCallback(() => {
    let redirectPath = '';
    const inputCurrencyId = parsedQs.currency0 ?? parsedQs.inputCurrency;
    const outputCurrencyId = parsedQs.currency1 ?? parsedQs.outputCurrency;
    if (inputCurrencyId) {
      if (outputCurrencyId) {
        if (parsedQs.currency1) {
          redirectPath = currentPath.replace(
            `currency1=${parsedQs.currency1}`,
            `currency1=${inputCurrencyId}`,
          );
        } else {
          redirectPath = currentPath.replace(
            `outputCurrency=${parsedQs.currency1}`,
            `currency1=${inputCurrencyId}`,
          );
        }
        if (parsedQs.currency0) {
          redirectPath = redirectPath.replace(
            `currency0=${parsedQs.currency0}`,
            `currency0=${outputCurrencyId}`,
          );
        } else {
          redirectPath = redirectPath.replace(
            `inputCurrency=${parsedQs.currency0}`,
            `currency0=${outputCurrencyId}`,
          );
        }
      } else {
        if (parsedQs.currency0) {
          redirectPath = currentPath.replace(
            `currency0=${parsedQs.currency0}`,
            `currency1=${parsedQs.currency0}`,
          );
        } else {
          redirectPath = currentPath.replace(
            `inputCurrency=${inputCurrencyId}`,
            `currency1=${inputCurrencyId}`,
          );
        }
      }
    } else {
      if (outputCurrencyId) {
        if (parsedQs.currency1) {
          redirectPath = currentPath.replace(
            `currency1=${parsedQs.currency1}`,
            `currency0=${parsedQs.currency1}`,
          );
        } else {
          redirectPath = currentPath.replace(
            `outputCurrency=${outputCurrencyId}`,
            `currency0=${outputCurrencyId}`,
          );
        }
      }
    }
    history.push(redirectPath);
  }, [currentPath, history, parsedQs]);

  return { redirectWithCurrency, redirectWithSwitch };
}
