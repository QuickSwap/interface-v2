import { Currency, currencyEquals, ETHER, WETH } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback';
import { useCallback, useMemo } from 'react';
import { tryParseAmount } from 'state/swap/hooks';
import { getTokenLogoURL } from 'utils/getTokenLogoURL';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import { V3Currency } from 'v3lib/entities/v3Currency';

export const useLogo = (currency?: Currency) => {
  const getLogo = useGetLogoCallback();
  return useMemo(() => {
    return !currency ? undefined : getLogo(currency);
  }, [currency, getLogo]);
};

export const useGetLogoCallback = () => {
  const { chainId } = useActiveWeb3React();
  const isNativeCurrency = useIsNativeCurrencyCallback();
  return useCallback(
    (currency?: Currency | null) => {
      if (!currency) return undefined;
      if (isNativeCurrency(currency)) {
        return '/' + currency?.symbol + '.png';
      }
      const token = wrappedCurrency(currency, chainId);
      const address = token?.address;
      if (!address) return undefined;
      try {
        const logo = getTokenLogoURL(address, []).find(
          (it) => it !== 'error',
        ) as any;
        if (logo) return logo;
      } catch (error) {}

      if ((token as any)?.tokenInfo?.logoURI) {
        return (token as any).tokenInfo.logoURI;
      }
      return undefined;
    },
    [chainId, isNativeCurrency],
  );
};

export const useIsNativeCurrencyCallback = () => {
  const { chainId } = useActiveWeb3React();
  return useCallback(
    (currency?: Currency) => {
      if (!chainId || !currency) return false;
      const nativeCurrency = ETHER[chainId];
      return (
        currencyEquals(currency, nativeCurrency) ||
        (currency as V3Currency).isNative
      );
    },
    [chainId],
  );
};

export const useApproval = (
  spender?: string,
  inCurrency?: Currency,
  amount?: string,
) => {
  const { chainId } = useActiveWeb3React();
  const isNative = useIsNativeCurrencyCallback();

  const approvalAmount = useMemo(() => {
    return tryParseAmount(
      chainId,
      amount,
      isNative(inCurrency) ? WETH[chainId] : inCurrency,
    );
  }, [chainId, amount, inCurrency, isNative]);

  const [approvalState, approve] = useApproveCallback(approvalAmount, spender);

  return {
    approve,
    approvalState,
    isApproved: approvalState === ApprovalState.APPROVED,
    isPending:
      approvalState === ApprovalState.PENDING ||
      approvalState === ApprovalState.UNKNOWN,
  };
};
