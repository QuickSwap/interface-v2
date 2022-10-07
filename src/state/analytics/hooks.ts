import { useSelector } from 'react-redux';
import { AppState } from 'state';

export function useIsAnalyticsLoaded() {
  return useSelector<AppState, AppState['analytics']['isLoaded']>(
    (state) => state.analytics.isLoaded,
  );
}
