import { nanoid } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '~/state';
import resolveENSContentHash from '~/utils/resolveENSContentHash';
import { useActiveWeb3React } from '~/hooks';
import { fetchDualFarmList } from '~/state/dualfarms/actions';
import getDualFarmList from '~/utils/getDualFarmList';
import { DualFarmListInfo } from '~/types/index';

export function useFetchDualFarmListCallback(): (
  listUrl: string,
) => Promise<DualFarmListInfo> {
  const { library } = useActiveWeb3React();
  const dispatch = useDispatch<AppDispatch>();

  //TODO: support multi chain
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
      dispatch(fetchDualFarmList.pending({ requestId, url: listUrl }));
      return getDualFarmList(listUrl, ensResolver)
        .then((dualFarmList) => {
          dispatch(
            fetchDualFarmList.fulfilled({
              url: listUrl,
              dualFarmList,
              requestId,
            }),
          );
          return dualFarmList;
        })
        .catch((error) => {
          console.debug(`Failed to get list at url ${listUrl}`, error);
          dispatch(
            fetchDualFarmList.rejected({
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
