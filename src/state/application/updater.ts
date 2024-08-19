import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import useDebounce from 'hooks/useDebounce';
import useIsWindowVisible from 'hooks/useIsWindowVisible';
import { updateBlockNumber, updateSoulZap } from './actions';
import { useActiveWeb3React } from 'hooks';
import { SoulZap_UniV2_ApeBond } from '@soulsolidity/soulzap-v1';
import { JsonRpcProvider } from '@ethersproject/providers';
import { RPC_PROVIDERS, rpcMap } from 'constants/providers';
import { ChainId } from '@uniswap/sdk';

export default function Updater(): null {
  const {
    library: web3ModalLibrary,
    currentChainId,
    chainId,
    provider,
    account,
  } = useActiveWeb3React();
  const libraryFromChain = RPC_PROVIDERS[chainId];
  const library = web3ModalLibrary ?? libraryFromChain;

  const dispatch = useDispatch();

  const windowVisible = useIsWindowVisible();

  const [state, setState] = useState<{
    chainId: number | undefined;
    blockNumber: number | null;
  }>({
    chainId: currentChainId,
    blockNumber: null,
  });

  const blockNumberCallback = useCallback(
    (blockNumber: number) => {
      setState((state) => {
        if (currentChainId === state.chainId) {
          if (typeof state.blockNumber !== 'number')
            return { chainId: currentChainId, blockNumber };
          return {
            chainId: currentChainId,
            blockNumber,
          };
        }
        return state;
      });
    },
    [currentChainId, setState],
  );

  // attach/detach listeners
  useEffect(() => {
    setState({ chainId: currentChainId, blockNumber: null });
    if (!library || !windowVisible) return undefined;

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

    if (web3ModalLibrary) {
      web3ModalLibrary.on('network', (newNetwork) => {
        if (state.chainId && newNetwork.chainId !== state.chainId) {
          setTimeout(() => {
            document.location.reload();
          }, 1500);
        }
      });
    }

    return () => {
      library.removeListener('block', blockNumberCallback);
      if (web3ModalLibrary) {
        web3ModalLibrary.removeListener('network', (newNetwork) => {
          if (state.chainId && newNetwork.chainId !== state.chainId) {
            setTimeout(() => {
              document.location.reload();
            }, 1500);
          }
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChainId, chainId, windowVisible]);

  const debouncedState = useDebounce(state, 100);

  useEffect(() => {
    if (!chainId || !debouncedState.blockNumber || !windowVisible) return;
    dispatch(
      updateBlockNumber({
        chainId,
        blockNumber: debouncedState.blockNumber,
      }),
    );
  }, [windowVisible, dispatch, debouncedState.blockNumber, chainId]);

  const ethersProvider = useMemo(() => {
    if (chainId) return new JsonRpcProvider(rpcMap?.[chainId]);
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
  }, [chainId, account]);

  return null;
}
