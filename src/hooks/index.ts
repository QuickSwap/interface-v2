import { useMemo } from 'react';
import { ChainId, Pair } from '@uniswap/sdk';
import { getSigner } from 'utils';
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
  useWeb3Modal,
} from '@web3modal/ethers5/react';
import { useSingleCallResult, NEVER_RELOAD } from 'state/multicall/hooks';
import {
  useArgentWalletDetectorContract,
  usePriceGetterContract,
} from './useContract';
import { toV2LiquidityToken, useTrackedTokenPairs } from 'state/user/hooks';
import { useTokenBalancesWithLoadingIndicator } from 'state/wallet/hooks';
import { usePairs } from 'data/Reserves';
import useParsedQueryString from './useParsedQueryString';
import { useParams } from 'react-router-dom';
import { getConfig } from 'config/index';
import { SUPPORTED_CHAINIDS } from 'constants/index';
import { useMasaAnalyticsReact } from '@masa-finance/analytics-react';
import { Currency } from '@uniswap/sdk-core';
import { BigNumber, providers } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { useOpenNetworkSelection } from 'state/application/hooks';

export function useActiveWeb3React() {
  const {
    chainId: web3ModalChainId,
    address,
    isConnected,
  } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  const chainId: ChainId | undefined = useMemo(() => {
    if (!web3ModalChainId) {
      const localChainId = localStorage.getItem('localChainId');
      if (localChainId) {
        return Number(localChainId) as ChainId;
      } else {
        return ChainId.MATIC;
      }
    }
    if (!SUPPORTED_CHAINIDS.includes(web3ModalChainId)) {
      return ChainId.MATIC;
    }
    return web3ModalChainId;
  }, [web3ModalChainId]);

  const provider = walletProvider
    ? new providers.Web3Provider(walletProvider)
    : undefined;

  return {
    account: address,
    chainId,
    currentChainId: web3ModalChainId,
    provider,
    library: provider,
    isActive: isConnected,
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
  const parsedQs = useParsedQueryString();
  const isProMode = Boolean(
    parsedQs.isProMode && parsedQs.isProMode === 'true',
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
  const params: any = useParams();
  const version = params && params.version ? params.version : defaultVersion;
  return version;
};

export const useMasaAnalytics = () => {
  const masaAnalytics = useMasaAnalyticsReact({
    clientId: process.env.REACT_APP_MASA_CLIENT_ID ?? '',
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

export function useGetSigner() {
  const { account, library } = useActiveWeb3React();
  if (!library || !account) {
    return null;
  }
  const signer = getSigner(library, account);
  return signer;
}
export const useConnectWallet = (isSupportedNetwork: boolean) => {
  const { open } = useWeb3Modal();
  const { setOpenNetworkSelection } = useOpenNetworkSelection();

  const connectWallet = () => {
    if (!isSupportedNetwork) {
      setOpenNetworkSelection(true);
    } else {
      open();
    }
  };

  return { connectWallet };
};
