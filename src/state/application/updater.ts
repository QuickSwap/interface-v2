import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useActiveWeb3React } from 'hooks';
import useDebounce from 'hooks/useDebounce';
import useIsWindowVisible from 'hooks/useIsWindowVisible';
import { updateBlockNumber } from './actions';
import { useEthPrice, useLocalChainId, useMaticPrice } from './hooks';
import { getEthPrice } from 'utils';
import { getMaticPrice } from 'utils/v3-graph';
import { ChainId } from '@uniswap/sdk';

export default function Updater(): null {
  const { library, chainId, connector } = useActiveWeb3React();
  const dispatch = useDispatch();
  const { updateEthPrice } = useEthPrice();
  const { updateMaticPrice } = useMaticPrice();
  const { updateLocalChainId } = useLocalChainId();

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
    const localChainIdStr = localStorage.getItem('quickswap_chainId');
    const localChainId = localChainIdStr
      ? (Number(localChainIdStr) as ChainId)
      : ChainId.MATIC;
    updateLocalChainId(localChainId);
  }, [updateLocalChainId]);

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
    const fetchETHPrice = async () => {
      try {
        const [price, oneDayPrice, ethPriceChange] = await getEthPrice(chainId);
        updateEthPrice({ price, oneDayPrice, ethPriceChange });
      } catch (e) {
        console.log(e);
      }
    };
    fetchMaticPrice();
    fetchETHPrice();
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
        document.location.reload();
      });
    }

    return () => {
      library.removeListener('block', blockNumberCallback);
      if (connector.provider) {
        connector.provider.removeListener('chainChanged', () => {
          document.location.reload();
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

  return null;
}
