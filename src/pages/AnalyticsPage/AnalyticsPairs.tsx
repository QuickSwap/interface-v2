import React, { useEffect, useState } from 'react';
import { Box } from '@material-ui/core';
import { PairTable } from 'components';
import { getTopPairs, getBulkPairData } from 'utils';
import { Skeleton } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';
import { GlobalConst } from 'constants/index';
import { useEthPrice } from 'state/application/hooks';
import { useIsV3 } from 'state/analytics/hooks';
import { getTopPairsV3 } from 'utils/v3-graph';
import { useDispatch } from 'react-redux';
import { setAnalyticsLoaded } from 'state/analytics/actions';

const AnalyticsPairs: React.FC = () => {
  const { t } = useTranslation();
  const [topPairs, updateTopPairs] = useState<any[] | null>(null);
  const { ethPrice } = useEthPrice();

  const dispatch = useDispatch();

  const isV3 = useIsV3();

  useEffect(() => {
    updateTopPairs(null);

    const fetchTopPairs = async () => {
      updateTopPairs(null);
      const topPairsFn = isV3
        ? getTopPairsV3(GlobalConst.utils.ANALYTICS_PAIRS_COUNT)
        : getTopPairs(GlobalConst.utils.ANALYTICS_PAIRS_COUNT).then(
            async (pairs) => {
              const formattedPairs = pairs
                ? pairs.map((pair: any) => {
                    return pair.id;
                  })
                : [];
              const pairData = await getBulkPairData(
                formattedPairs,
                ethPrice.price,
              );
              return pairData;
            },
          );

      topPairsFn.then((data) => {
        if (data) {
          updateTopPairs(data);
        }
      });
    };
    if (ethPrice.price) {
      fetchTopPairs();
    }
  }, [updateTopPairs, ethPrice.price, isV3]);

  useEffect(() => {
    if (topPairs) {
      dispatch(setAnalyticsLoaded(true));
    }
  }, [topPairs]);

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
