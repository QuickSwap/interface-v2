import React from 'react';
import { Box } from '@mui/material';
import { PairTable } from 'components';
import { Skeleton } from '@mui/lab';
import { useTranslation } from 'next-i18next';
import { useActiveWeb3React, useAnalyticsVersion } from 'hooks';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import AnalyticsHeader from 'components/pages/analytics/AnalyticsHeader';
import { useAnalyticsTopPairs } from 'hooks/useFetchAnalyticsData';
import styles from 'styles/pages/Analytics.module.scss';

const AnalyticsPairs = (
  _props: InferGetServerSidePropsType<typeof getServerSideProps>,
) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();

  const version = useAnalyticsVersion();

  const { isLoading: topPairsLoading, data: topPairs } = useAnalyticsTopPairs(
    version,
    chainId,
  );

  return (
    <Box width='100%'>
      <AnalyticsHeader />
      <p>{t('allPairs')}</p>
      <Box mt={4} className={styles.panel}>
        {topPairsLoading ? (
          <Skeleton variant='rectangular' width='100%' height={150} />
        ) : topPairs ? (
          <PairTable data={topPairs} />
        ) : (
          <></>
        )}
      </Box>
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

export default AnalyticsPairs;
