import { nanoid } from '@reduxjs/toolkit';
import { MATIC_CHAIN } from 'constants/index';
import { useActiveWeb3React } from 'hooks';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'state';
import { fetchCNTFarmList } from 'state/cnt/actions';
import getCNTFarmList from 'utils/getCNTFarmList';
import resolveENSContentHash from 'utils/resolveENSContentHash';

export function useCNTFarmListCallback(): (url: string) => Promise<any> {
  const { library, chainId, account } = useActiveWeb3React();
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
    async (url: string) => {
      const requestId = nanoid();
      dispatch(fetchCNTFarmList.pending({ url, requestId }));
      return getCNTFarmList(chainId || MATIC_CHAIN, account, ensResolver)
        .then((cntFarmList) => {
          dispatch(
            fetchCNTFarmList.fulfilled({
              url,
              farmList: cntFarmList,
              requestId,
            }),
          );
          return cntFarmList;
        })
        .catch((error) => {
          console.debug(
            `Failed to get list for cnt with chainId ${chainId}`,
            error,
          );
          dispatch(
            fetchCNTFarmList.rejected({
              url,
              requestId,
              errorMessage: error.message,
            }),
          );
          throw error;
        });
    },
    [dispatch, ensResolver, account, chainId],
  );
}
