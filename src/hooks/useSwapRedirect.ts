import { ChainId, currencyEquals, ETHER } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import useParsedQueryString from './useParsedQueryString';

export default function useSwapRedirects() {
  const history = useHistory();
  const currentPath = history.location.pathname + history.location.search;
  const parsedQs = useParsedQueryString();
  const isProMode = parsedQs.isProMode;
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;

  const redirectWithCurrency = useCallback(
    (currency: any, isInput: boolean, isV2 = true) => {
      let redirectPath = '';
      const currencyId = (isV2
      ? currencyEquals(currency, ETHER[chainIdToUse])
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
    [
      chainIdToUse,
      currentPath,
      history,
      parsedQs.currency0,
      parsedQs.currency1,
      parsedQs.inputCurrency,
      parsedQs.outputCurrency,
    ],
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
            `outputCurrency=${parsedQs.outputCurrency}`,
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
            `inputCurrency=${parsedQs.inputCurrency}`,
            `currency0=${outputCurrencyId}`,
          );
        }
      } else {
        if (parsedQs.currency0) {
          redirectPath = currentPath.replace(
            `currency0=${inputCurrencyId}`,
            `currency1=${inputCurrencyId}`,
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
            `currency1=${outputCurrencyId}`,
            `currency0=${outputCurrencyId}`,
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

  const redirectWithProMode = (proMode: boolean) => {
    const currentPath = history.location.pathname + history.location.search;
    let redirectPath = '';
    if (isProMode) {
      redirectPath = currentPath.replace(
        `isProMode=${isProMode}`,
        `isProMode=${proMode}`,
      );
    } else {
      redirectPath = `${currentPath}${
        Object.values(parsedQs).length > 0 ? '&' : '?'
      }isProMode=${proMode}`;
    }
    history.push(redirectPath);
  };

  return { redirectWithProMode, redirectWithCurrency, redirectWithSwitch };
}
