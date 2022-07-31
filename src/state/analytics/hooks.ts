import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { AnalyticsBasic } from 'types';

export class AnalyticsInfo implements AnalyticsBasic {
  public readonly isV3: boolean;

  constructor() {
    this.isV3 = false;
  }
}

export function useIsV3() {
  return useSelector<AppState, AppState['analytics']['isV3']>(
    (state) => state.analytics.isV3,
  );
}
