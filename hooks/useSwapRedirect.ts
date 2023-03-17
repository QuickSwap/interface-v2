import { currencyEquals, ETHER } from '@uniswap/sdk';
import { useCallback } from 'react';
import { useRouter } from 'next/router';

export default function useSwapRedirects() {
  const router = useRouter();
  const currentPath = router.asPath;

  const redirectWithCurrency = useCallback(
    (currency: any, isInput: boolean, isV2 = true) => {
      let redirectPath = '';
      const currencyId = (isV2
      ? currencyEquals(currency, ETHER)
      : currency.isNative)
        ? 'ETH'
        : currency.address;
      if (isInput) {
        if (router.query.currency0 ?? router.query.inputCurrency) {
          if (router.query.currency0) {
            redirectPath = currentPath.replace(
              `currency0=${router.query.currency0}`,
              `currency0=${currencyId}`,
            );
          } else {
            redirectPath = currentPath.replace(
              `inputCurrency=${router.query.inputCurrency}`,
              `inputCurrency=${currencyId}`,
            );
          }
        } else {
          // redirectPath = `${currentPath}${
          //   history.location.search === '' ? '?' : '&'
          // }currency0=${currencyId}`;
        }
      } else {
        if (router.query.currency1 ?? router.query.outputCurrency) {
          if (router.query.currency1) {
            redirectPath = currentPath.replace(
              `currency1=${router.query.currency1}`,
              `currency1=${currencyId}`,
            );
          } else {
            redirectPath = currentPath.replace(
              `outputCurrency=${router.query.outputCurrency}`,
              `outputCurrency=${currencyId}`,
            );
          }
        } else {
          // redirectPath = `${currentPath}${
          //   history.location.search === '' ? '?' : '&'
          // }currency1=${currencyId}`;
        }
      }
      router.push(redirectPath);
    },
    [currentPath, router],
  );

  const redirectWithSwitch = useCallback(() => {
    let redirectPath = '';
    const inputCurrencyId =
      router.query.currency0 ?? router.query.inputCurrency;
    const outputCurrencyId =
      router.query.currency1 ?? router.query.outputCurrency;
    if (inputCurrencyId) {
      if (outputCurrencyId) {
        if (router.query.currency1) {
          redirectPath = currentPath.replace(
            `currency1=${router.query.currency1}`,
            `currency1=${inputCurrencyId}`,
          );
        } else {
          redirectPath = currentPath.replace(
            `outputCurrency=${router.query.currency1}`,
            `currency1=${inputCurrencyId}`,
          );
        }
        if (router.query.currency0) {
          redirectPath = redirectPath.replace(
            `currency0=${router.query.currency0}`,
            `currency0=${outputCurrencyId}`,
          );
        } else {
          redirectPath = redirectPath.replace(
            `inputCurrency=${router.query.currency0}`,
            `currency0=${outputCurrencyId}`,
          );
        }
      } else {
        if (router.query.currency0) {
          redirectPath = currentPath.replace(
            `currency0=${router.query.currency0}`,
            `currency1=${router.query.currency0}`,
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
        if (router.query.currency1) {
          redirectPath = currentPath.replace(
            `currency1=${router.query.currency1}`,
            `currency0=${router.query.currency1}`,
          );
        } else {
          redirectPath = currentPath.replace(
            `outputCurrency=${outputCurrencyId}`,
            `currency0=${outputCurrencyId}`,
          );
        }
      }
    }
    router.push(redirectPath);
  }, [currentPath, router]);

  return { redirectWithCurrency, redirectWithSwitch };
}
