import { nanoid } from '@reduxjs/toolkit';
import { TokenList } from '@uniswap/token-lists';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'state';
import { fetchTokenList } from 'state/lists/actions';
import getTokenList from 'utils/getTokenList';
import resolveENSContentHash from 'utils/resolveENSContentHash';
import { useActiveWeb3React } from 'hooks';

export function useFetchListCallback(): (
  listUrl: string,
  skipValidation?: boolean,
) => Promise<TokenList> {
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
    async (listUrl: string, skipValidation?: boolean) => {
      const requestId = nanoid();
      dispatch(fetchTokenList.pending({ requestId, url: listUrl }));
      return getTokenList(listUrl, ensResolver, skipValidation)
        .then((tokenList) => {
          dispatch(
            fetchTokenList.fulfilled({ url: listUrl, tokenList, requestId }),
          );
          return tokenList;
        })
        .catch((error) => {
          console.debug(`Failed to get list at url ${listUrl}`, error);
          dispatch(
            fetchTokenList.rejected({
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
