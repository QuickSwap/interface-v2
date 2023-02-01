import React, { useEffect, useState } from 'react';
import { Box, Skeleton } from 'theme/components';
import { PairTable } from 'components';
import { getTopPairs, getBulkPairData } from 'utils';
import { useTranslation } from 'react-i18next';
import { GlobalConst } from 'constants/index';
import { useEthPrice } from 'state/application/hooks';
import { getTopPairsV3, getPairsAPR, getTopPairsTotal } from 'utils/v3-graph';
import { useDispatch } from 'react-redux';
import { setAnalyticsLoaded } from 'state/analytics/actions';
import { useParams } from 'react-router-dom';

const AnalyticsPairs: React.FC = () => {
  const { t } = useTranslation();
  const [topPairs, updateTopPairs] = useState<any[] | null>(null);
  const { ethPrice } = useEthPrice();

  const dispatch = useDispatch();

  const params: any = useParams();
  const version = params && params.version ? params.version : 'total';

  useEffect(() => {
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
  }, [ethPrice.price, version]);

  useEffect(() => {
    updateTopPairs(null);
  }, [version]);

  useEffect(() => {
    if (topPairs) {
      dispatch(setAnalyticsLoaded(true));
    }
  }, [topPairs, dispatch]);

  return (
    <Box width='100%' margin='0 0 24px'>
      <p>{t('allPairs')}</p>
      <Box margin='32px 0 0' className='panel'>
        {topPairs ? (
          <PairTable data={topPairs} />
        ) : (
          <Skeleton variant='rect' width='100%' height='150px' />
        )}
      </Box>
    </Box>
  );
};

export default AnalyticsPairs;
