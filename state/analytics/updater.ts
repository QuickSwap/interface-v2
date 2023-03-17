import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { setAnalyticsLoaded } from './actions';

export default function Updater(): null {
  //For cases when link is shared
  const { pathname } = useRouter();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setAnalyticsLoaded(false));
  }, [pathname, dispatch]);

  return null;
}
