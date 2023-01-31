import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'state';
import { updateMatchesDarkMode, updateSlippageManuallySet } from './actions';

export default function Updater(): null {
  const dispatch = useDispatch<AppDispatch>();

  // keep dark mode in sync with the system
  useEffect(() => {
    dispatch(updateMatchesDarkMode({ matchesDarkMode: true }));
    dispatch(updateSlippageManuallySet({ slippageManuallySet: false }));
  }, [dispatch]);

  return null;
}
