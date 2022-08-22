import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useActiveWeb3React } from 'hooks';
import useInterval from 'hooks/useInterval';
import useIsWindowVisible from 'hooks/useIsWindowVisible';
import { AppDispatch, AppState } from 'state';
import { acceptAdsUpdate } from './actions';
import { useFetchAdsListCallback } from 'hooks/useFetchAdsListCallback';

export default function Updater(): null {
  const { library } = useActiveWeb3React();
  const dispatch = useDispatch<AppDispatch>();
  const ads = useSelector<AppState, AppState['ads']['byUrl']>(
    (state) => state.ads.byUrl,
  );

  const isWindowVisible = useIsWindowVisible();

  const fetchAdsList = useFetchAdsListCallback();
  const fetchAllListsCallback = useCallback(() => {
    if (!isWindowVisible) return;
    Object.keys(ads).forEach((url) =>
      fetchAdsList(url).catch((error) =>
        console.debug('interval list fetching error', error),
      ),
    );
  }, [fetchAdsList, isWindowVisible, ads]);

  // fetch all lists every 10 minutes, but only after we initialize library
  useInterval(fetchAllListsCallback, library ? 1000 * 60 * 10 : null);

  // whenever a list is not loaded and not loading, try again to load it
  useEffect(() => {
    Object.keys(ads).forEach((listUrl) => {
      const adsObj = ads[listUrl];

      if (!adsObj.current && !adsObj.loadingRequestId && !adsObj.error) {
        fetchAdsList(listUrl).catch((error) =>
          console.debug('list added fetching error', error),
        );
      }
    });
  }, [dispatch, fetchAdsList, library, ads]);

  // automatically update lists if versions are minor/patch
  useEffect(() => {
    Object.keys(ads).forEach((listUrl) => {
      const farm = ads[listUrl];
      if (farm.current && farm.pendingUpdate) {
        //Auto update farms until we create the versioning infrastructure that the tokens list has
        dispatch(acceptAdsUpdate(listUrl));
      }
    });
  }, [dispatch, ads]);

  return null;
}
