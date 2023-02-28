import React, { useEffect, useState } from 'react';
import { Box } from '@material-ui/core';
import { PairTable } from 'components';
import { getTopPairs, getBulkPairData } from 'utils';
import { Skeleton } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';
import { GlobalConst } from 'constants/index';
import { useEthPrice } from 'state/application/hooks';
import { getTopPairsV3, getPairsAPR, getTopPairsTotal } from 'utils/v3-graph';
import { useDispatch } from 'react-redux';
import { setAnalyticsLoaded } from 'state/analytics/actions';
import { ChainId } from '@uniswap/sdk';
import { useActiveWeb3React, useAnalyticsVersion } from 'hooks';

const AnalyticsPairs: React.FC = () => {
  const { t } = useTranslation();
  const [topPairs, updateTopPairs] = useState<any[] | null>(null);
  const { ethPrice } = useEthPrice();

  const dispatch = useDispatch();

  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const version = useAnalyticsVersion();

  useEffect(() => {
    (async () => {
      if (version === 'v3') {
        const pairsData = await getTopPairsV3(
          GlobalConst.utils.ANALYTICS_PAIRS_COUNT,
          chainIdToUse,
        );
        if (pairsData) {
          const data = pairsData.filter((item: any) => !!item);
          try {
            const aprs = await getPairsAPR(
              data.map((item: any) => item.id),
              chainIdToUse,
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
        }
      } else if (version === 'v2') {
        if (ethPrice.price) {
          const pairs = await getTopPairs(
            GlobalConst.utils.ANALYTICS_PAIRS_COUNT,
            chainIdToUse,
          );
          const formattedPairs = pairs
            ? pairs.map((pair: any) => {
                return pair.id;
              })
            : [];
          const data = await getBulkPairData(
            formattedPairs,
            ethPrice.price,
            chainIdToUse,
          );
          if (data) {
            updateTopPairs(data);
          }
        }
      } else {
        const pairsData = await getTopPairsTotal(
          GlobalConst.utils.ANALYTICS_PAIRS_COUNT,
          chainIdToUse,
        );
        if (pairsData) {
          const data = pairsData.filter((item: any) => !!item);
          try {
            const aprs = await getPairsAPR(
              data.map((item: any) => item.id),
              chainIdToUse,
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
        }
      }
    })();
  }, [ethPrice.price, version, chainIdToUse]);

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
