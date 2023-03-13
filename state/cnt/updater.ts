import { useActiveWeb3React } from 'hooks';
import { useCNTFarmListCallback } from 'hooks/useCNTFarmListCallback';
import useInterval from 'hooks/useInterval';
import useIsWindowVisible from 'hooks/useIsWindowVisible';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from 'state';
import { acceptCNTFarmUpdate } from './actions';

export default function Updater(): null {
  const { library } = useActiveWeb3React();
  const dispatch = useDispatch<AppDispatch>();
  const cntFarms = useSelector<AppState, AppState['cntFarms']['byUrl']>(
    (state) => state.cntFarms.byUrl,
  );

  const isWindowVisible = useIsWindowVisible();
  const fetchCNTFarmList = useCNTFarmListCallback();
  const fetchAllListsCallback = useCallback(() => {
    if (!isWindowVisible) return;

    Object.keys(cntFarms).forEach((url) =>
      fetchCNTFarmList(url).catch((error) =>
        console.debug('interval list fetching error', error),
      ),
    );
  }, [fetchCNTFarmList, isWindowVisible, cntFarms]);

  // fetch all lists every 10 minutes, but only after we initialize library
  useInterval(fetchAllListsCallback, library ? 1000 * 60 * 10 : null);

  // whenever a list is not loaded and not loading, try again to load it
  useEffect(() => {
    Object.keys(cntFarms).forEach((listUrl) => {
      const farm = cntFarms[listUrl];

      if (!farm.current && !farm.loadingRequestId && !farm.error) {
        fetchCNTFarmList(listUrl).catch((error) =>
          console.debug('list added fetching error', error),
        );
      }
    });
  }, [dispatch, fetchCNTFarmList, library, cntFarms]);

  // automatically update lists if versions are minor/patch
  useEffect(() => {
    Object.keys(cntFarms).forEach((listUrl) => {
      const farm = cntFarms[listUrl];
      if (farm.current && farm.pendingUpdate) {
        //Auto update farms until we create the versioning infrastructure that the tokens list has
        dispatch(acceptCNTFarmUpdate(listUrl));
      }
    });
  }, [dispatch, cntFarms]);

  return null;
}
