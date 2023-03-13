import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { setAnalyticsLoaded } from './actions';

export default function Updater(): null {
  //For cases when link is shared
  const { pathname } = useLocation();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setAnalyticsLoaded(false));
  }, [pathname, dispatch]);

  return null;
}
