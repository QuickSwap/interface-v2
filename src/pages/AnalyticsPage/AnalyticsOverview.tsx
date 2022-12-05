import React, { useState, useEffect, useMemo } from 'react';
import { Box, Grid } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import Skeleton from '@material-ui/lab/Skeleton';
import { ArrowForwardIos } from '@material-ui/icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  useEthPrice,
  useGlobalData,
  useMaticPrice,
  useIsV2,
} from 'state/application/hooks';
import {
  getTopPairs,
  getTopTokens,
  getGlobalData,
  getBulkPairData,
} from 'utils';
import { GlobalConst } from 'constants/index';
import { TokensTable, PairTable } from 'components';
import AnalyticsInfo from './AnalyticsInfo';
import AnalyticsLiquidityChart from './AnalyticsLiquidityChart';
import AnalyticsVolumeChart from './AnalyticsVolumeChart';
import { useTranslation } from 'react-i18next';
import {
  getGlobalDataV3,
  getPairsAPR,
  getTopPairsV3,
  getTopTokensV3,
} from 'utils/v3-graph';
import { useDispatch } from 'react-redux';
import { setAnalyticsLoaded } from 'state/analytics/actions';

dayjs.extend(utc);

const AnalyticsOverview: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { globalData, updateGlobalData } = useGlobalData();
  const [topTokens, updateTopTokens] = useState<any[] | null>(null);
  const [topPairs, updateTopPairs] = useState<any[] | null>(null);
  const { ethPrice } = useEthPrice();
  const { maticPrice } = useMaticPrice();

  const dispatch = useDispatch();

  const { isV2 } = useIsV2();
  const version = useMemo(() => `${isV2 ? `v2` : 'v3'}`, [isV2]);

  useEffect(() => {
    if (isV2 === undefined) return;

    (async () => {
      if (!isV2) {
        const data = await getGlobalDataV3();
        if (data) {
          updateGlobalData({ data });
        }
      } else if (ethPrice.price && ethPrice.oneDayPrice) {
        const data = await getGlobalData(ethPrice.price, ethPrice.oneDayPrice);
        if (data) {
          updateGlobalData({ data });
        }
      }
    })();

    (async () => {
      if (!isV2) {
        if (maticPrice.price && maticPrice.oneDayPrice) {
          const data = await getTopTokensV3(
            maticPrice.price,
            maticPrice.oneDayPrice,
            GlobalConst.utils.ANALYTICS_TOKENS_COUNT,
          );
          if (data) {
            updateTopTokens(data);
          }
        }
      } else {
        if (ethPrice.price && ethPrice.oneDayPrice) {
          const data = await getTopTokens(
            ethPrice.price,
            ethPrice.oneDayPrice,
            GlobalConst.utils.ANALYTICS_TOKENS_COUNT,
          );
          if (data) {
            updateTopTokens(data);
          }
        }
      }
    })();

    (async () => {
      if (!isV2) {
        const pairsData = await getTopPairsV3(
          GlobalConst.utils.ANALYTICS_PAIRS_COUNT,
        );
        if (pairsData) {
          const data = pairsData.filter((item: any) => !!item);
          updateTopPairs(data);
          if (!isV2) {
            (async () => {
              try {
                const aprs = await getPairsAPR(
                  data.map((item: any) => item.id),
                );

                updateTopPairs(
                  data.map((item: any, ind: number) => {
                    return {
                      ...item,
                      apr: aprs[ind].apr,
                      farmingApr: aprs[ind].farmingApr,
                    };
                  }),
                );
              } catch (e) {
                console.log(e);
              }
            })();
          }
        }
      } else {
        if (ethPrice.price) {
          const pairs = await getTopPairs(
            GlobalConst.utils.ANALYTICS_PAIRS_COUNT,
          );
          const formattedPairs = pairs
            ? pairs.map((pair: any) => {
                return pair.id;
              })
            : [];
          const data = await getBulkPairData(formattedPairs, ethPrice.price);
          if (data) {
            updateTopPairs(data);
          }
        }
      }
    })();
  }, [
    updateGlobalData,
    ethPrice.price,
    ethPrice.oneDayPrice,
    maticPrice.price,
    maticPrice.oneDayPrice,
    isV2,
  ]);

  useEffect(() => {
    if (isV2 !== undefined) {
      updateGlobalData({ data: null });
      updateTopPairs(null);
      updateTopTokens(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isV2]);

  useEffect(() => {
    if (globalData && topTokens && topPairs) {
      dispatch(setAnalyticsLoaded(true));
    }
  }, [globalData, topTokens, topPairs, dispatch]);

  return (
    <Box width='100%' mb={3}>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={6}>
          <Box className='panel' width={1}>
            <AnalyticsLiquidityChart />
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <Box className='analyticsVolumeChart panel'>
            <AnalyticsVolumeChart />
          </Box>
        </Grid>
      </Grid>
      <Box mt={4}>
        <Box className='panel flex flex-wrap'>
          {globalData ? (
            <AnalyticsInfo data={globalData} />
          ) : (
            <Skeleton width='100%' height={20} />
          )}
        </Box>
      </Box>
      <Box mt={4}>
        <Box className='flex justify-between items-center'>
          <Box className='headingWrapper'>
            <p className='weight-600'>{t('topTokens')}</p>
          </Box>
          <Box
            className='headingWrapper cursor-pointer'
            onClick={() => history.push(`/analytics/${version}/tokens`)}
          >
            <p className='weight-600'>{t('seeAll')}</p>
            <ArrowForwardIos />
          </Box>
        </Box>
      </Box>
      <Box mt={3} className='panel'>
        {topTokens ? (
          <TokensTable data={topTokens} showPagination={false} />
        ) : (
          <Skeleton variant='rect' width='100%' height={150} />
        )}
      </Box>
      <Box mt={4}>
        <Box className='flex items-center justify-between'>
          <Box className='headingWrapper'>
            <p className='weight-600'>{t('topPairs')}</p>
          </Box>
          <Box
            className='headingWrapper cursor-pointer'
            onClick={() => history.push(`/analytics/${version}/pairs`)}
          >
            <p className='weight-600'>{t('seeAll')}</p>
            <ArrowForwardIos />
          </Box>
        </Box>
      </Box>
      <Box mt={3} className='panel'>
        {topPairs ? (
          <PairTable data={topPairs} showPagination={false} />
        ) : (
          <Skeleton variant='rect' width='100%' height={150} />
        )}
      </Box>
    </Box>
  );
};

export default AnalyticsOverview;
