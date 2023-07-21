import { ChainId, ETHER } from '@uniswap/sdk';
import { useActiveWeb3React, useIsProMode } from 'hooks';
import { useCallback } from 'react';
import { useRouter } from 'next/router';

export default function useSwapRedirects() {
  const router = useRouter();
  const currentPath = router.asPath;
  const isProMode = useIsProMode();
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const currency0Str = router.query.currency0
    ? (router.query.currency0 as string)
    : undefined;
  const inputCurrencyStr = router.query.inputCurrency
    ? (router.query.inputCurrency as string)
    : undefined;
  const currency1Str = router.query.currency1
    ? (router.query.currency1 as string)
    : undefined;
  const outputCurrencyStr = router.query.outputCurrency
    ? (router.query.outputCurrency as string)
    : undefined;

  const isEther = useCallback(
    (currency: any) => {
      // ether does not have address
      if (currency?.address) return false;

      // Check if it is actually an ether;
      // don't use 'currencyEquals' method from uniswap because,
      // the structure of current currency is modified already
      // thus that method returns always false value in case if the selected
      // token is ETHER.
      const ether = ETHER[chainIdToUse];
      return (
        ether.decimals === currency?.decimals &&
        ether.name === currency?.name &&
        ether.symbol === currency?.symbol
      );
    },
    [chainIdToUse],
  );

  const redirectWithCurrency = useCallback(
    (currency: any, isInput: boolean, isV2 = true) => {
      let redirectPath = '';
      const currencyId = (isV2
      ? isEther(currency)
      : currency.isNative)
        ? 'ETH'
        : currency.address;
      if (isInput) {
        if (currency0Str ?? inputCurrencyStr) {
          if (currency0Str) {
            redirectPath = currentPath.replace(
              `currency0=${currency0Str}`,
              `currency0=${currencyId}`,
            );
          } else {
            redirectPath = currentPath.replace(
              `inputCurrency=${inputCurrencyStr}`,
              `inputCurrency=${currencyId}`,
            );
          }
        } else {
          redirectPath = `${currentPath}${
            Object.values(router.query).length === 0 ? '?' : '&'
          }currency0=${currencyId}`;
        }
      } else {
        if (currency1Str ?? outputCurrencyStr) {
          if (currency1Str) {
            redirectPath = currentPath.replace(
              `currency1=${currency1Str}`,
              `currency1=${currencyId}`,
            );
          } else {
            redirectPath = currentPath.replace(
              `outputCurrency=${outputCurrencyStr}`,
              `outputCurrency=${currencyId}`,
            );
          }
        } else {
          redirectPath = `${currentPath}${
            Object.values(router.query).length === 0 ? '?' : '&'
          }currency1=${currencyId}`;
        }
      }
      router.push(redirectPath);
    },
    [
      currency0Str,
      currency1Str,
      currentPath,
      inputCurrencyStr,
      isEther,
      outputCurrencyStr,
      router,
    ],
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
            `outputCurrency=${router.query.outputCurrency}`,
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
            `inputCurrency=${router.query.inputCurrency}`,
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

  const redirectWithProMode = (proMode: boolean) => {
    const currentPath = router.asPath;
    let redirectPath = '';
    if (isProMode) {
      redirectPath = currentPath.replace(
        `isProMode=${isProMode}`,
        `isProMode=${proMode}`,
      );
    } else {
      redirectPath = `${currentPath}${
        Object.values(router.query).length > 0 ? '&' : '?'
      }isProMode=${proMode}`;
    }
    router.push(redirectPath);
  };

  return { redirectWithProMode, redirectWithCurrency, redirectWithSwitch };
}
