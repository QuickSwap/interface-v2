import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { setAnalyticsLoaded, toggleAnalyticsVersion } from './actions';
import { useIsV3 } from './hooks';

export default function Updater(): null {
  //For cases when link is shared
  const { pathname } = useLocation();
  const isV3 = useIsV3();
  const dispatch = useDispatch();

  const path = pathname.split('/');

  if (path[1] === 'analytics' && (isV3 ? path[2] === 'v2' : path[2] === 'v3')) {
    dispatch(toggleAnalyticsVersion());
  }

  useEffect(() => {
    dispatch(setAnalyticsLoaded(false));
  }, [pathname, isV3, dispatch]);

  return null;
}
