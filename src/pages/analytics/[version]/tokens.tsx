import React, { useState, useMemo } from 'react';
import { Box } from '@mui/material';
import { TopMovers, TokensTable } from 'components';
import { useBookmarkTokens } from 'state/application/hooks';
import { Skeleton } from '@mui/lab';
import { useTranslation } from 'next-i18next';
import { useActiveWeb3React, useAnalyticsVersion } from 'hooks';
import { GetStaticProps, InferGetStaticPropsType, GetStaticPaths } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import AnalyticsHeader from 'components/pages/analytics/AnalyticsHeader';
import { useAnalyticsTopTokens } from 'hooks/useFetchAnalyticsData';
import styles from 'styles/pages/Analytics.module.scss';

const AnalyticsTokens = (
  _props: InferGetStaticPropsType<typeof getStaticProps>,
) => {
  const { t } = useTranslation();
  const [tokensFilter, setTokensFilter] = useState(0);

  const { bookmarkTokens } = useBookmarkTokens();
  const { chainId } = useActiveWeb3React();
  const version = useAnalyticsVersion();

  const {
    isLoading: topTokensLoading,
    data: topTokens,
  } = useAnalyticsTopTokens(version, chainId);

  const favoriteTokens = useMemo(() => {
    if (topTokens) {
      return topTokens.filter(
        (token: any) => bookmarkTokens.indexOf(token.id) > -1,
      );
    } else {
      return [];
    }
  }, [topTokens, bookmarkTokens]);

  return (
    <Box width='100%'>
      <AnalyticsHeader />
      <TopMovers hideArrow={true} />
      <Box my={4} px={2} className='flex flex-wrap items-center'>
        <Box
          className={`${styles.tokensFilter} ${
            tokensFilter === 0 ? 'text-primary' : 'text-disabled'
          }`}
          onClick={() => setTokensFilter(0)}
        >
          <p className='weight-600'>{t('allCryptos')}</p>
        </Box>
        <Box
          className={`${styles.tokensFilter} ${
            tokensFilter === 1 ? 'text-primary' : 'text-disabled'
          }`}
          onClick={() => setTokensFilter(1)}
        >
          <p className='weight-600'>{t('favourites')}</p>
        </Box>
        <Box
          className={`${styles.tokensFilter} ${
            tokensFilter === 2 ? 'text-primary' : 'text-disabled'
          }`}
          onClick={() => setTokensFilter(2)}
        >
          <p className='weight-600'>{t('newListing')}</p>
        </Box>
      </Box>
      <Box className={styles.panel}>
        {topTokensLoading ? (
          <Skeleton variant='rectangular' width='100%' height={150} />
        ) : topTokens ? (
          <TokensTable data={tokensFilter === 0 ? topTokens : favoriteTokens} />
        ) : (
          <></>
        )}
      </Box>
    </Box>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const versions = ['v2', 'v3', 'total'];
  const paths =
    versions?.map((version) => ({
      params: { version },
    })) || [];

  return {
    paths,
    fallback: 'blocking',
  };
};

export default AnalyticsTokens;
