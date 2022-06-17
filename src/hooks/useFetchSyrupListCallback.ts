import { nanoid } from '@reduxjs/toolkit';
import { ChainId } from '@uniswap/sdk';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { getNetworkLibrary, NETWORK_CHAIN_ID } from '../connectors';
import { AppDispatch } from 'state';
import resolveENSContentHash from 'utils/resolveENSContentHash';
import { useActiveWeb3React } from 'hooks';
import { fetchSyrupList } from 'state/syrups/actions';
import getSyrupList from 'utils/getSyrupList';
import { SyrupListInfo } from 'types';

export function useFetchSyrupListCallback(): (
  listUrl: string,
) => Promise<SyrupListInfo> {
  const { chainId, library } = useActiveWeb3React();
  const dispatch = useDispatch<AppDispatch>();

  const ensResolver = useCallback(
    (ensName: string) => {
      if (!library || chainId !== ChainId.MUMBAI) {
        if (NETWORK_CHAIN_ID === ChainId.MUMBAI) {
          const networkLibrary = getNetworkLibrary();
          if (networkLibrary) {
            return resolveENSContentHash(ensName, networkLibrary);
          }
        }
        throw new Error('Could not construct mainnet ENS resolver');
      }
      return resolveENSContentHash(ensName, library);
    },
    [chainId, library],
  );

  return useCallback(
    async (listUrl: string) => {
      const requestId = nanoid();
      dispatch(fetchSyrupList.pending({ requestId, url: listUrl }));
      return getSyrupList(listUrl, ensResolver)
        .then((syrupList) => {
          dispatch(
            fetchSyrupList.fulfilled({ url: listUrl, syrupList, requestId }),
          );
          return syrupList;
        })
        .catch((error) => {
          console.debug(`Failed to get list at url ${listUrl}`, error);
          dispatch(
            fetchSyrupList.rejected({
              url: listUrl,
              requestId,
              errorMessage: error.message,
            }),
          );
          throw error;
        });
    },
    [dispatch, ensResolver],
  );
}
