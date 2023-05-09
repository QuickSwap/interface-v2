import React, { useEffect, useState } from 'react';
import { Box } from '@material-ui/core';
import { PairTable } from 'components';
import { Skeleton } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';
import { useEthPrice } from 'state/application/hooks';
import { useDispatch } from 'react-redux';
import { setAnalyticsLoaded } from 'state/analytics/actions';
import { useActiveWeb3React, useAnalyticsVersion } from 'hooks';

const AnalyticsPairs: React.FC = () => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const [topPairs, updateTopPairs] = useState<any[] | null>(null);
  const { ethPrice } = useEthPrice();

  const dispatch = useDispatch();

  const version = useAnalyticsVersion();

  useEffect(() => {
    if (!chainId) return;
    (async () => {
      const res = await fetch(
        `${process.env.REACT_APP_LEADERBOARD_APP_URL}/analytics/top-pairs/${version}?chainId=${chainId}`,
      );
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          errorText || res.statusText || `Failed to get top pairs ${version}`,
        );
      }
      const pairsData = await res.json();
      if (pairsData.data) {
        updateTopPairs(pairsData.data);
      }
    })();
  }, [ethPrice.price, version, chainId]);

  useEffect(() => {
    updateTopPairs(null);
  }, [version]);

  useEffect(() => {
    if (topPairs) {
      dispatch(setAnalyticsLoaded(true));
    } else {
      dispatch(setAnalyticsLoaded(false));
    }
  }, [topPairs, dispatch]);

  return (
    <Box width='100%' mb={3}>
      <p>{t('allPairs')}</p>
      <Box mt={4} className='panel'>
        {topPairs ? (
          <PairTable data={topPairs} />
        ) : (
          <Skeleton variant='rect' width='100%' height={150} />
        )}
      </Box>
    </Box>
  );
};

export default AnalyticsPairs;
