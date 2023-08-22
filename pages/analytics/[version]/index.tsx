import React from 'react';
import { Box, Grid } from '@mui/material';
import { useRouter } from 'next/router';
import { Skeleton } from '@mui/lab';
import { ArrowForwardIos } from '@mui/icons-material';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { TokensTable, PairTable } from 'components';
import AnalyticsInfo from 'components/pages/analytics/AnalyticsInfo';
import AnalyticsLiquidityChart from 'components/pages/analytics/AnalyticsLiquidityChart';
import AnalyticsVolumeChart from 'components/pages/analytics/AnalyticsVolumeChart';
import { useTranslation } from 'next-i18next';
import { useActiveWeb3React, useAnalyticsVersion } from 'hooks';
import { GetStaticProps, InferGetStaticPropsType, GetStaticPaths } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styles from 'styles/pages/Analytics.module.scss';
import {
  useAnalyticsGlobalData,
  useAnalyticsTopPairs,
  useAnalyticsTopTokens,
} from 'hooks/useFetchAnalyticsData';
import { ChainId } from '@uniswap/sdk';
import AnalyticsExtraInfo from 'components/pages/analytics/AnalyticsExtraInfo';

dayjs.extend(utc);

const AnalyticsPage = (
  _props: InferGetStaticPropsType<typeof getStaticProps>,
) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const router = useRouter();
  const version = useAnalyticsVersion();

  const {
    isLoading: globalDataLoading,
    data: globalData,
  } = useAnalyticsGlobalData(version, chainId);

  const {
    isLoading: topTokensLoading,
    data: topTokens,
  } = useAnalyticsTopTokens(version, chainId);

  const { isLoading: topPairsLoading, data: topPairs } = useAnalyticsTopPairs(
    version,
    chainId,
  );

  return (
    <Box width='100%' mb={3}>
      {(chainId === ChainId.DOGECHAIN || chainId === ChainId.MATIC) && (
        <AnalyticsExtraInfo data={globalData} chainId={chainId} />
      )}
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={6}>
          <Box className='panel' width={1}>
            <AnalyticsLiquidityChart globalData={globalData} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <Box className='analyticsVolumeChart panel'>
            <AnalyticsVolumeChart globalData={globalData} />
          </Box>
        </Grid>
      </Grid>
      <Box mt={4}>
        <Box className='flex flex-wrap panel'>
          {globalDataLoading ? (
            <Skeleton width='100%' height={20} />
          ) : globalData ? (
            <AnalyticsInfo data={globalData} />
          ) : (
            <></>
          )}
        </Box>
      </Box>
      <Box mt={4}>
        <Box className='flex items-center justify-between'>
          <Box className={styles.headingWrapper}>
            <p className='weight-600'>{t('topTokens')}</p>
          </Box>
          <Box
            className={`cursor-pointer ${styles.headingWrapper}`}
            onClick={() => router.push(`/analytics/${version}/tokens`)}
          >
            <p className='weight-600'>{t('seeAll')}</p>
            <ArrowForwardIos />
          </Box>
        </Box>
      </Box>
      <Box mt={3} className='panel'>
        {topTokensLoading ? (
          <Skeleton variant='rectangular' width='100%' height={150} />
        ) : topTokens ? (
          <TokensTable
            data={topTokens
              .sort((token1: any, token2: any) => {
                return token1.totalLiquidityUSD > token2.totalLiquidityUSD
                  ? -1
                  : 1;
              })
              .slice(0, 10)}
            showPagination={false}
          />
        ) : (
          <></>
        )}
      </Box>
      <Box mt={4}>
        <Box className='flex items-center justify-between'>
          <Box className={styles.headingWrapper}>
            <p className='weight-600'>{t('topPairs')}</p>
          </Box>
          <Box
            className={`cursor-pointer ${styles.headingWrapper}`}
            onClick={() => router.push(`/analytics/${version}/pairs`)}
          >
            <p className='weight-600'>{t('seeAll')}</p>
            <ArrowForwardIos />
          </Box>
        </Box>
      </Box>
      <Box mt={3} className='panel'>
        {topPairsLoading ? (
          <Skeleton variant='rectangular' width='100%' height={150} />
        ) : topPairs ? (
          <PairTable
            data={topPairs
              .sort((pair1: any, pair2: any) => {
                const liquidity1 = pair1.trackedReserveUSD
                  ? pair1.trackedReserveUSD
                  : pair1.reserveUSD ?? 0;
                const liquidity2 = pair2.trackedReserveUSD
                  ? pair2.trackedReserveUSD
                  : pair2.reserveUSD ?? 0;
                return liquidity1 > liquidity2 ? -1 : 1;
              })
              .slice(0, 10)}
            showPagination={false}
          />
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

export default AnalyticsPage;
