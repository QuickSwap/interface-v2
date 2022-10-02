import React, { useEffect, useState } from 'react';
import { Box } from '@material-ui/core';
import { PairTable } from 'components';
import { getTopPairs, getBulkPairData } from 'utils';
import { Skeleton } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';
import { GlobalConst } from 'constants/index';
import { useEthPrice, useIsV3 } from 'state/application/hooks';
import { getTopPairsV3, getPairsAPR } from 'utils/v3-graph';
import { useDispatch } from 'react-redux';
import { setAnalyticsLoaded } from 'state/analytics/actions';
import { useActiveWeb3React } from 'hooks';
import { ChainId } from '@uniswap/sdk';

const AnalyticsPairs: React.FC = () => {
  const { t } = useTranslation();
  const [topPairs, updateTopPairs] = useState<any[] | null>(null);
  const { ethPrice } = useEthPrice();

  const dispatch = useDispatch();

  const { isV3 } = useIsV3();
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;

  useEffect(() => {
    if (isV3 === undefined) return;

    (async () => {
      updateTopPairs(null);
      if (isV3) {
        const data = await getTopPairsV3(
          GlobalConst.utils.ANALYTICS_PAIRS_COUNT,
          chainIdToUse,
        );
        if (data) {
          updateTopPairs(data);
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
      } else {
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
      }
    })();
  }, [ethPrice.price, isV3, chainIdToUse]);

  useEffect(() => {
    if (topPairs) {
      dispatch(setAnalyticsLoaded(true));
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
