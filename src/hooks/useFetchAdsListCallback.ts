import { nanoid } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'state';
import resolveENSContentHash from 'utils/resolveENSContentHash';
import { useActiveWeb3React } from 'hooks';
import { fetchAdsList } from 'state/ads/actions';
import { AdsListInfo } from 'types';
import getAdsList from 'utils/getAdsList';

export function useFetchAdsListCallback(): (
  listUrl: string,
) => Promise<AdsListInfo> {
  const { library } = useActiveWeb3React();
  const dispatch = useDispatch<AppDispatch>();

  const ensResolver = useCallback(
    (ensName: string) => {
      if (!library) {
        throw new Error('Could not construct mainnet ENS resolver');
      }
      return resolveENSContentHash(ensName, library);
    },
    [library],
  );

  return useCallback(
    async (listUrl: string) => {
      const requestId = nanoid();
      dispatch(fetchAdsList.pending({ requestId, url: listUrl }));
      return getAdsList(listUrl, ensResolver)
        .then((adsList) => {
          dispatch(
            fetchAdsList.fulfilled({ url: listUrl, adsList, requestId }),
          );
          return adsList;
        })
        .catch((error) => {
          console.debug(`Failed to get list at url ${listUrl}`, error);
          dispatch(
            fetchAdsList.rejected({
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
