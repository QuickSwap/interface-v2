import { useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ChainId, Pair } from '@uniswap/sdk';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'state';
// @ts-ignore
import transakSDK from '@transak/transak-sdk';
import { addPopup } from 'state/application/actions';
import { useSingleCallResult, NEVER_RELOAD } from 'state/multicall/hooks';
import { useArgentWalletDetectorContract } from './useContract';
import { toV2LiquidityToken, useTrackedTokenPairs } from 'state/user/hooks';
import { useTokenBalancesWithLoadingIndicator } from 'state/wallet/hooks';
import { usePairs } from 'data/Reserves';
import { useRouter } from 'next/router';
import { getConfig } from 'config';
import { SUPPORTED_CHAINIDS } from 'constants/index';

export function useActiveWeb3React() {
  const context = useWeb3React();

  const chainId: ChainId | undefined = useMemo(() => {
    if (!context.chainId || !SUPPORTED_CHAINIDS.includes(context.chainId)) {
      return ChainId.MATIC;
    }
    return context.chainId;
  }, [context.chainId]);

  return {
    ...context,
    chainId,
    currentChainId: context.chainId,
    library: context.provider,
  };
}

export function useIsArgentWallet(): boolean {
  const { account } = useActiveWeb3React();
  const argentWalletDetector = useArgentWalletDetectorContract();
  const call = useSingleCallResult(
    argentWalletDetector,
    'isArgentWallet',
    [account ?? undefined],
    NEVER_RELOAD,
  );
  return call?.result?.[0] ?? false;
}

export function useInitTransak() {
  const dispatch = useDispatch<AppDispatch>();
  const initTransak = (account: any, mobileWindowSize: boolean) => {
    const transak = new transakSDK({
      apiKey: process.env.NEXT_PUBLIC_TRANSAK_KEY, // Your API Key
      environment: 'PRODUCTION', // STAGING/PRODUCTION
      defaultCryptoCurrency: 'MATIC',
      walletAddress: account, // Your customer's wallet address
      themeColor: '2891f9', // App theme color
      redirectURL: 'window.location.origin',
      hostURL: window.location.origin,
      widgetHeight: mobileWindowSize ? '450px' : '600px',
      widgetWidth: mobileWindowSize ? '360px' : '450px',
      networks: 'matic',
    });

    transak.init();

    // To get all the events
    transak.on(transak.TRANSAK_ORDER_FAILED, (data: any) => {
      dispatch(
        addPopup({
          key: 'abc',
          content: {
            txn: { hash: '', summary: 'Buy order failed', success: false },
          },
        }),
      );
      console.log(data);
    });

    // This will trigger when the user marks payment is made.
    transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData: any) => {
      dispatch(
        addPopup({
          key: 'abc',
          content: {
            txn: {
              hash: '',
              summary:
                'Buy ' +
                orderData.status.cryptoAmount +
                ' ' +
                orderData.status.cryptocurrency +
                ' for ' +
                orderData.status.fiatAmount +
                ' ' +
                orderData.status.fiatCurrency,
              success: true,
            },
          },
        }),
      );
      console.log(orderData);
      transak.close();
    });
  };

  return { initTransak };
}

export function useV2LiquidityPools(account?: string) {
  const trackedTokenPairs = useTrackedTokenPairs();
  const tokenPairsWithLiquidityTokens = useMemo(
    () =>
      trackedTokenPairs.map((tokens) => ({
        liquidityToken: toV2LiquidityToken(tokens),
        tokens,
      })),
    [trackedTokenPairs],
  );
  const liquidityTokens = useMemo(
    () => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken),
    [tokenPairsWithLiquidityTokens],
  );
  const [
    v2PairsBalances,
    fetchingV2PairBalances,
  ] = useTokenBalancesWithLoadingIndicator(account, liquidityTokens);

  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0'),
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances],
  );

  const v2Pairs = usePairs(
    liquidityTokensWithBalances.map(({ tokens }) => tokens),
  );
  const v2IsLoading =
    fetchingV2PairBalances ||
    v2Pairs?.length < liquidityTokensWithBalances.length ||
    v2Pairs?.some((V2Pair) => !V2Pair);

  const allV2PairsWithLiquidity = v2Pairs
    .map(([, pair]) => pair)
    .filter((v2Pair): v2Pair is Pair => Boolean(v2Pair));

  return { loading: v2IsLoading, pairs: allV2PairsWithLiquidity };
}

export const useIsProMode = () => {
  const { chainId } = useActiveWeb3React();
  const config = getConfig(chainId);
  const proModeEnabled = config['swap']['proMode'];
  const router = useRouter();
  const isProMode = Boolean(
    router.query.isProMode && router.query.isProMode === 'true',
  );
  return proModeEnabled && isProMode;
};

export const useAnalyticsVersion = () => {
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const config = getConfig(chainIdToUse);
  const v2 = config['v2'];
  const v3 = config['v3'];
  const defaultVersion = v2 && v3 ? 'total' : v2 ? 'v2' : 'v3';
  const router = useRouter();
  const version =
    router && router.query.version
      ? (router.query.version as string)
      : defaultVersion;
  return version;
};
