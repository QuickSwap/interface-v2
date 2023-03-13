import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { AdsListInfo, AdsRaw } from 'types';

export type AdsListMap = Readonly<{
  data: {
    [sort: string]: Readonly<AdsRaw[]>;
  };
  config: any;
}>;

/**
 * An empty result, useful as a default.
 */
const EMPTY_LIST: AdsListMap = { data: {}, config: {} };

const adsCache: WeakMap<AdsListInfo, AdsListMap> | null =
  typeof WeakMap !== 'undefined'
    ? new WeakMap<AdsListInfo, AdsListMap>()
    : null;

export function listToAdsMap(list: AdsListInfo): AdsListMap | undefined {
  const result = adsCache?.get(list);
  if (result) return result;

  const map = list.ads.length > 0 ? list.ads[0] : undefined;

  if (map) {
    adsCache?.set(list, map);
  }
  return map;
}

export function useAdsList(url: string | undefined): AdsListMap {
  const ads = useSelector<AppState, AppState['ads']['byUrl']>(
    (state) => state.ads.byUrl,
  );

  const current = url ? ads[url]?.current : null;

  return useMemo(() => {
    if (!current) return EMPTY_LIST;
    try {
      return listToAdsMap(current) ?? EMPTY_LIST;
    } catch (error) {
      console.error('Could not show token list due to error', error);
      return EMPTY_LIST;
    }
  }, [current]);
}

export function useDefaultAdsList(): AdsListMap {
  return useAdsList(process.env.REACT_APP_ADS_LIST_DEFAULT_URL);
}

// returns all downloaded current lists
export function useAllAds(): AdsListInfo[] {
  const ads = useSelector<AppState, AppState['ads']['byUrl']>(
    (state) => state.ads.byUrl,
  );

  return useMemo(
    () =>
      Object.keys(ads)
        .map((url) => ads[url].current)
        .filter((l): l is AdsListInfo => Boolean(l)),
    [ads],
  );
}
