import React, { useState, useEffect } from 'react';
import { Box, Grid } from '@mui/material';
import { useRouter } from 'next/router';
import { Skeleton } from '@mui/lab';
import { ArrowForwardIos } from '@mui/icons-material';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useEthPrice, useMaticPrice } from 'state/application/hooks';
import { TokensTable, PairTable } from 'components';
import AnalyticsInfo from 'components/pages/analytics/AnalyticsInfo';
import AnalyticsLiquidityChart from 'components/pages/analytics/AnalyticsLiquidityChart';
import AnalyticsVolumeChart from 'components/pages/analytics/AnalyticsVolumeChart';
import AnalyticsHeader from 'components/pages/analytics/AnalyticsHeader';
import { useTranslation } from 'next-i18next';
import { useDispatch } from 'react-redux';
import { setAnalyticsLoaded } from 'state/analytics/actions';
import { useActiveWeb3React, useAnalyticsVersion } from 'hooks';
import { GetStaticProps, InferGetStaticPropsType, GetStaticPaths } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styles from 'styles/pages/Analytics.module.scss';

dayjs.extend(utc);

const AnalyticsPage = (
  _props: InferGetStaticPropsType<typeof getStaticProps>,
) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const router = useRouter();
  const [globalData, updateGlobalData] = useState<any>(null);
  const [topTokens, updateTopTokens] = useState<any[] | null>(null);
  const [topPairs, updateTopPairs] = useState<any[] | null>(null);
  const [liquidityChartLoaded, setLiquidityChartLoaded] = useState(false);
  const [volumeChartLoaded, setVolumeChartLoaded] = useState(false);
  const { ethPrice } = useEthPrice();
  const { maticPrice } = useMaticPrice();
  const dispatch = useDispatch();
  const version = useAnalyticsVersion();

  useEffect(() => {
    if (!chainId) return;
    (async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_LEADERBOARD_APP_URL}/analytics/global-data/${version}?chainId=${chainId}`,
      );
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          errorText || res.statusText || `Failed to get global data ${version}`,
        );
      }

      const data = await res.json();

      if (data.data) {
        updateGlobalData(data.data);
      }
    })();

    (async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_LEADERBOARD_APP_URL}/analytics/top-tokens/${version}?chainId=${chainId}`,
      );
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          errorText || res.statusText || `Failed to get top tokens`,
        );
      }
      const data = await res.json();
      if (data.data) {
        updateTopTokens(data.data);
      }
    })();

    (async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_LEADERBOARD_APP_URL}/analytics/top-pairs/${version}?chainId=${chainId}`,
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
  }, [
    ethPrice.price,
    ethPrice.oneDayPrice,
    maticPrice.price,
    maticPrice.oneDayPrice,
    version,
    chainId,
  ]);

  useEffect(() => {
    updateGlobalData(null);
    updateTopPairs(null);
    updateTopTokens(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  useEffect(() => {
    if (
      globalData &&
      topTokens &&
      topPairs &&
      liquidityChartLoaded &&
      volumeChartLoaded
    ) {
      dispatch(setAnalyticsLoaded(true));
    } else {
      dispatch(setAnalyticsLoaded(false));
    }
  }, [
    globalData,
    topTokens,
    topPairs,
    dispatch,
    liquidityChartLoaded,
    volumeChartLoaded,
  ]);

  return (
    <Box width='100%' mb={3}>
      <AnalyticsHeader />
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={6}>
          <Box className='panel'>
            <AnalyticsLiquidityChart
              globalData={globalData}
              setDataLoaded={setLiquidityChartLoaded}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <Box className='panel'>
            <AnalyticsVolumeChart
              globalData={globalData}
              setDataLoaded={setVolumeChartLoaded}
            />
          </Box>
        </Grid>
      </Grid>
      <Box mt={4}>
        <Box className='flex flex-wrap panel'>
          {globalData ? (
            <AnalyticsInfo data={globalData} />
          ) : (
            <Skeleton width='100%' height={20} />
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
        {topTokens ? (
          <TokensTable
            data={topTokens
              .sort((token1, token2) => {
                return token1.totalLiquidityUSD > token2.totalLiquidityUSD
                  ? -1
                  : 1;
              })
              .slice(0, 10)}
            showPagination={false}
          />
        ) : (
          <Skeleton variant='rectangular' width='100%' height={150} />
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
        {topPairs ? (
          <PairTable
            data={topPairs
              .sort((pair1, pair2) => {
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
          <Skeleton variant='rectangular' width='100%' height={150} />
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
