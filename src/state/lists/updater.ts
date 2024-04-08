import {
  getVersionUpgrade,
  minVersionBump,
  VersionUpgrade,
} from '@uniswap/token-lists';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useActiveWeb3React } from 'hooks';
import { useFetchListCallback } from 'hooks/useFetchListCallback';
import useInterval from 'hooks/useInterval';
import useIsWindowVisible from 'hooks/useIsWindowVisible';
import { addPopup } from 'state/application/actions';
import { AppDispatch, AppState } from 'state';
import { acceptListUpdate } from './actions';
import { DEFAULT_LIST_OF_LISTS } from 'constants/index';

export default function Updater(): null {
  const { library } = useActiveWeb3React();
  const dispatch = useDispatch<AppDispatch>();
  const lists = useSelector<AppState, AppState['lists']['byUrl']>(
    (state) => state.lists.byUrl,
  );

  const isWindowVisible = useIsWindowVisible();

  const fetchList = useFetchListCallback();
  const fetchAllListsCallback = useCallback(() => {
    if (!isWindowVisible) return;
    DEFAULT_LIST_OF_LISTS.forEach((url) =>
      fetchList(url, true).catch((error) =>
        console.debug('interval list fetching error', error),
      ),
    );
  }, [fetchList, isWindowVisible]);

  // fetch all lists every 10 minutes, but only after we initialize library
  useInterval(fetchAllListsCallback, library ? 100000 * 60 * 10 : null);

  // whenever a list is not loaded and not loading, try again to load it
  useEffect(() => {
    Object.keys(lists).forEach((listUrl) => {
      const list = lists[listUrl];

      if (!list.current && !list.loadingRequestId && !list.error) {
        fetchList(listUrl).catch((error) =>
          console.debug('list added fetching error', error),
        );
      }
    });
  }, [dispatch, fetchList, library, lists]);

  // automatically update lists if versions are minor/patch
  useEffect(() => {
    Object.keys(lists).forEach((listUrl) => {
      const list = lists[listUrl];
      if (list.current && list.pendingUpdate) {
        const bump = getVersionUpgrade(
          list.current.version,
          list.pendingUpdate.version,
        );
        switch (bump) {
          case VersionUpgrade.NONE:
            throw new Error('unexpected no version bump');
          case VersionUpgrade.PATCH:
          case VersionUpgrade.MINOR:
          case VersionUpgrade.MAJOR:
            dispatch(acceptListUpdate(listUrl));
        }
      }
    });
  }, [dispatch, lists]);

  return null;
}
