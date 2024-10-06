import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'state';
import {
  updateMatchesDarkMode,
  updateSlippageManuallySet,
  updateUserAmlScore,
} from './actions';
import { useActiveWeb3React } from 'hooks';

export default function Updater(): null {
  const dispatch = useDispatch<AppDispatch>();
  const { account } = useActiveWeb3React();

  // keep dark mode in sync with the system
  useEffect(() => {
    dispatch(updateMatchesDarkMode({ matchesDarkMode: true }));
    dispatch(updateSlippageManuallySet({ slippageManuallySet: false }));
  }, [dispatch]);

  // Refetch user aml score on page refresh
  useEffect(() => {
    const fetchAmlScore = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_LEADERBOARD_APP_URL}/utils/qr-screen?address=${account}`,
        );
        if (res.ok) {
          const ret = await res.json();
          dispatch(updateUserAmlScore({ score: ret.score }));
        }
      } catch (e) {}
    };
    if (account) {
      fetchAmlScore();
    } else {
      dispatch(updateUserAmlScore({ score: 0 }));
    }
  }, [account, dispatch]);

  return null;
}
