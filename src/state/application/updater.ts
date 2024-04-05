import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import useDebounce from 'hooks/useDebounce';
import useIsWindowVisible from 'hooks/useIsWindowVisible';
import { updateBlockNumber, updateSoulZap } from './actions';
import { useMaticPrice } from './hooks';
import { getEthPrice } from 'utils';
import { getMaticPrice } from 'utils/v3-graph';
import { useActiveWeb3React } from 'hooks';
import { SoulZap_UniV2_ApeBond } from '@soulsolidity/soulzap-v1';
import { JsonRpcProvider } from '@ethersproject/providers';
import { rpcMap } from 'constants/providers';
import { ChainId } from '@uniswap/sdk';

export default function Updater(): null {
  const {
    library,
    chainId,
    connector,
    provider,
    account,
  } = useActiveWeb3React();

  const dispatch = useDispatch();
  const { updateMaticPrice } = useMaticPrice();

  const windowVisible = useIsWindowVisible();

  const [state, setState] = useState<{
    chainId: number | undefined;
    blockNumber: number | null;
  }>({
    chainId,
    blockNumber: null,
  });

  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  const blockNumberCallback = useCallback(
    (blockNumber: number) => {
      setState((state) => {
        if (chainId === state.chainId) {
          if (typeof state.blockNumber !== 'number')
            return { chainId, blockNumber };
          return {
            chainId,
            blockNumber,
          };
        }
        return state;
      });
    },
    [chainId, setState],
  );

  // this is for refreshing eth price every 10 mins
  useEffect(() => {
    const interval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000);
      setCurrentTime(_currentTime);
    }, 600000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!chainId || state.chainId !== chainId) return;
    const fetchMaticPrice = async () => {
      try {
        const [
          maticPrice,
          maticOneDayPrice,
          maticPriceChange,
        ] = await getMaticPrice(chainId);
        updateMaticPrice({
          price: maticPrice,
          oneDayPrice: maticOneDayPrice,
          maticPriceChange,
        });
      } catch (e) {
        console.log(e);
      }
    };
    fetchMaticPrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime, chainId, state.chainId]);

  // attach/detach listeners
  useEffect(() => {
    if (!library || !chainId || !windowVisible) return undefined;

    setState({ chainId, blockNumber: null });

    library
      .getBlockNumber()
      .then(blockNumberCallback)
      .catch((error) =>
        console.error(
          `Failed to get block number for chainId: ${chainId}`,
          error,
        ),
      );

    library.on('block', blockNumberCallback);

    if (connector.provider) {
      connector.provider.on('chainChanged', () => {
        setTimeout(() => {
          document.location.reload();
        }, 1500);
      });
    }

    return () => {
      library.removeListener('block', blockNumberCallback);
      if (connector.provider) {
        connector.provider.removeListener('chainChanged', () => {
          setTimeout(() => {
            document.location.reload();
          }, 1500);
        });
      }
    };
  }, [
    dispatch,
    chainId,
    library,
    blockNumberCallback,
    windowVisible,
    connector,
  ]);

  const debouncedState = useDebounce(state, 100);

  useEffect(() => {
    if (
      !debouncedState.chainId ||
      !debouncedState.blockNumber ||
      !windowVisible
    )
      return;
    dispatch(
      updateBlockNumber({
        chainId: debouncedState.chainId,
        blockNumber: debouncedState.blockNumber,
      }),
    );
  }, [
    windowVisible,
    dispatch,
    debouncedState.blockNumber,
    debouncedState.chainId,
  ]);

  const ethersProvider = useMemo(() => {
    if (chainId) return new JsonRpcProvider(rpcMap?.[chainId]?.[0]);
  }, [chainId]);

  const soulZapSupportChainId = [ChainId.MATIC];
  useEffect(() => {
    // Ensuring instance is only created on the client-side
    if (
      typeof window !== 'undefined' &&
      chainId &&
      provider &&
      ethersProvider &&
      soulZapSupportChainId.includes(chainId)
    ) {
      console.log('Initiating soul zap instance');
      // web3 provider is works funny if user is not connected, so in those cases we use ethers instead
      const soulZapInstance = new SoulZap_UniV2_ApeBond(
        chainId as number,
        account ? provider.getSigner() : ethersProvider,
      );
      dispatch(updateSoulZap(soulZapInstance));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, provider, ethersProvider, account]);

  return null;
}
