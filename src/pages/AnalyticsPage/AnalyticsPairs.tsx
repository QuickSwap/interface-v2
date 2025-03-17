import React from 'react';
import { Box } from '@material-ui/core';
import { PairTable } from 'components';
import { Skeleton } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';
import { useActiveWeb3React, useAnalyticsVersion } from 'hooks';
import { useAnalyticsTopPairs } from 'hooks/useFetchAnalyticsData';

const AnalyticsPairs: React.FC = () => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();

  const version = useAnalyticsVersion();

  const { isLoading: topPairsLoading, data: topPairs } = useAnalyticsTopPairs(
    version,
    chainId,
  );

  return (
    <Box width='100%' mb={3}>
      <p>{t('allPairs')}</p>
      <Box mt={4} className='panel'>
        {topPairsLoading ? (
          <Skeleton variant='rect' width='100%' height={150} />
        ) : topPairs ? (
          <PairTable data={topPairs} />
        ) : (
          <></>
        )}
      </Box>
    </Box>
  );
};

export default AnalyticsPairs;
