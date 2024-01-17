import { useCallback, useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ChainId, Pair } from '@uniswap/sdk';
import {
  ConnectionType,
  arkaneConnection,
  bitgetConnection,
  blockWalletConnection,
  braveWalletConnection,
  coinbaseWalletConnection,
  cryptoComConnection,
  cypherDConnection,
  getConnections,
  gnosisSafeConnection,
  metamaskConnection,
  networkConnection,
  okxWalletConnection,
  phantomConnection,
  trustWalletConnection,
  walletConnectConnection,
  unstoppableDomainsConnection,
  binanceWalletConnection,
} from 'connectors';
import { useSingleCallResult, NEVER_RELOAD } from 'state/multicall/hooks';
import {
  useArgentWalletDetectorContract,
  usePriceGetterContract,
} from './useContract';
import { toV2LiquidityToken, useTrackedTokenPairs } from 'state/user/hooks';
import { useTokenBalancesWithLoadingIndicator } from 'state/wallet/hooks';
import { usePairs } from 'data/Reserves';
import { useRouter } from 'next/router';
import { getConfig } from 'config/index';
import { SUPPORTED_CHAINIDS } from 'constants/index';
import { Connector } from '@web3-react/types';
import { useMasaAnalyticsReact } from '@masa-finance/analytics-react';
import { Currency } from '@uniswap/sdk-core';
import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

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

export function useGetConnection() {
  return useCallback((c: Connector | ConnectionType) => {
    if (c instanceof Connector) {
      const connection = getConnections().find(
        (connection) => connection.connector === c,
      );
      if (!connection) {
        throw Error('unsupported connector');
      }
      return connection;
    } else {
      switch (c) {
        case ConnectionType.METAMASK:
          return metamaskConnection;
        case ConnectionType.COINBASE_WALLET:
          return coinbaseWalletConnection;
        case ConnectionType.WALLET_CONNECT:
          return walletConnectConnection;
        case ConnectionType.NETWORK:
          return networkConnection;
        case ConnectionType.GNOSIS_SAFE:
          return gnosisSafeConnection;
        case ConnectionType.ARKANE:
          return arkaneConnection;
        case ConnectionType.PHATOM:
          return phantomConnection;
        case ConnectionType.TRUSTWALLET:
          return trustWalletConnection;
        case ConnectionType.BITGET:
          return bitgetConnection;
        case ConnectionType.BLOCKWALLET:
          return blockWalletConnection;
        case ConnectionType.BRAVEWALLET:
          return braveWalletConnection;
        case ConnectionType.CYPHERD:
          return cypherDConnection;
        case ConnectionType.OKXWALLET:
          return okxWalletConnection;
        case ConnectionType.CRYPTOCOM:
          return cryptoComConnection;
        case ConnectionType.UNSTOPPABLEDOMAINS:
          return unstoppableDomainsConnection;
        case ConnectionType.BINANCEWALLET:
          return binanceWalletConnection;
        default:
          throw Error('unsupported connector');
      }
    }
  }, []);
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

export const useMasaAnalytics = () => {
  const masaAnalytics = useMasaAnalyticsReact({
    clientId: process.env.NEXT_PUBLIC_MASA_CLIENT_ID ?? '',
    clientApp: 'Quickswap',
    clientName: 'Quickswap',
  });
  return masaAnalytics;
};

export const useTokenPriceUsd = (
  token: Currency | undefined | null,
  lpFlag?: boolean,
): [number, boolean] => {
  const priceGetterContract = usePriceGetterContract();
  const address = token && token.isToken ? token.address : undefined;
  const isNative = token ? token.isNative : undefined;

  const { result, loading } = useSingleCallResult(
    priceGetterContract,
    // TODO: Typecheck these calls to ensure they are correct
    // NOTE: Having to use 'getETHPrice()' due to function overloading
    lpFlag ? 'getLPPrice' : isNative ? 'getETHPrice()' : 'getPrice',
    lpFlag ? [address, 18] : isNative ? [] : [address, 0],
  );

  const bigNumberResponse = BigNumber.from(result?.toString() || 0);
  const value = Number(formatUnits(bigNumberResponse, 18));
  return [value, loading];
};
