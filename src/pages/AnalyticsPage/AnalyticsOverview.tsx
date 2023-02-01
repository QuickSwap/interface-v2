import React, { useState, useEffect, useMemo } from 'react';
import { Box, Grid, Skeleton } from 'theme/components';
import { useHistory, useParams } from 'react-router-dom';
import { ChevronRight } from 'react-feather';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  useEthPrice,
  useGlobalData,
  useMaticPrice,
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
  getGlobalDataTotal,
  getPairsAPR,
  getTopPairsV3,
  getTopTokensV3,
  getTopTokensTotal,
  getTopPairsTotal,
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
  const params: any = useParams();
  const version = params && params.version ? params.version : 'total';

  useEffect(() => {
    (async () => {
      if (version === 'v3') {
        const data = await getGlobalDataV3();
        if (data) {
          updateGlobalData({ data });
        }
      } else if (version === 'total') {
        if (ethPrice.price && ethPrice.oneDayPrice) {
          const data = await getGlobalDataTotal(
            ethPrice.price,
            ethPrice.oneDayPrice,
          );
          if (data) {
            updateGlobalData({ data });
          }
        }
      } else if (ethPrice.price && ethPrice.oneDayPrice) {
        const data = await getGlobalData(ethPrice.price, ethPrice.oneDayPrice);
        if (data) {
          updateGlobalData({ data });
        }
      }
    })();

    (async () => {
      if (version === 'v3') {
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
      } else if (version === 'v2') {
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
      } else {
        if (
          maticPrice.price &&
          maticPrice.oneDayPrice &&
          ethPrice.price &&
          ethPrice.oneDayPrice
        ) {
          const data = await getTopTokensTotal(
            ethPrice.price,
            ethPrice.oneDayPrice,
            maticPrice.price,
            maticPrice.oneDayPrice,
            GlobalConst.utils.ANALYTICS_TOKENS_COUNT,
          );
          if (data) {
            updateTopTokens(data);
          }
        }
      }
    })();

    (async () => {
      if (version === 'v3') {
        const pairsData = await getTopPairsV3(
          GlobalConst.utils.ANALYTICS_PAIRS_COUNT,
        );
        if (pairsData) {
          const data = pairsData.filter((item: any) => !!item);
          updateTopPairs(data);
          try {
            const aprs = await getPairsAPR(data.map((item: any) => item.id));

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
        }
      } else if (version === 'v2') {
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
      } else {
        const pairsData = await getTopPairsTotal(
          GlobalConst.utils.ANALYTICS_PAIRS_COUNT,
        );
        if (pairsData) {
          const data = pairsData.filter((item: any) => !!item);
          updateTopPairs(data);
          try {
            const aprs = await getPairsAPR(data.map((item: any) => item.id));

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
        }
      }
    })();
  }, [
    updateGlobalData,
    ethPrice.price,
    ethPrice.oneDayPrice,
    maticPrice.price,
    maticPrice.oneDayPrice,
    version,
  ]);

  useEffect(() => {
    updateGlobalData({ data: null });
    updateTopPairs(null);
    updateTopTokens(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  useEffect(() => {
    if (globalData && topTokens && topPairs) {
      dispatch(setAnalyticsLoaded(true));
    }
  }, [globalData, topTokens, topPairs, dispatch]);

  return (
    <Box width='100%' margin='0 0 24px'>
      <Grid container spacing={4}>
        <Grid item spacing={4} xs={12} sm={12} md={6}>
          <Box className='panel' width='100%'>
            <AnalyticsLiquidityChart />
          </Box>
        </Grid>
        <Grid item spacing={4} xs={12} sm={12} md={6}>
          <Box className='analyticsVolumeChart panel'>
            <AnalyticsVolumeChart />
          </Box>
        </Grid>
      </Grid>
      <Box margin='32px 0 0'>
        <Box className='panel flex flex-wrap'>
          {globalData ? (
            <AnalyticsInfo data={globalData} />
          ) : (
            <Skeleton width='100%' height='20px' />
          )}
        </Box>
      </Box>
      <Box margin='32px 0 0'>
        <Box className='flex justify-between items-center'>
          <Box className='headingWrapper'>
            <p className='weight-600'>{t('topTokens')}</p>
          </Box>
          <Box
            className='headingWrapper cursor-pointer'
            onClick={() => history.push(`/analytics/${version}/tokens`)}
          >
            <p className='weight-600'>{t('seeAll')}</p>
            <ChevronRight />
          </Box>
        </Box>
      </Box>
      <Box margin='24px 0 0' className='panel'>
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
          <Skeleton variant='rect' width='100%' height='150px' />
        )}
      </Box>
      <Box margin='32px 0 0'>
        <Box className='flex items-center justify-between'>
          <Box className='headingWrapper'>
            <p className='weight-600'>{t('topPairs')}</p>
          </Box>
          <Box
            className='headingWrapper cursor-pointer'
            onClick={() => history.push(`/analytics/${version}/pairs`)}
          >
            <p className='weight-600'>{t('seeAll')}</p>
            <ChevronRight />
          </Box>
        </Box>
      </Box>
      <Box margin='24px 0 0' className='panel'>
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
          <Skeleton variant='rect' width='100%' height='150px' />
        )}
      </Box>
    </Box>
  );
};

export default AnalyticsOverview;
