import { Box } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { ArrowForwardIos } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { PairTable } from 'components';
import { useHistory } from 'react-router-dom';
import Skeleton from '@material-ui/lab/Skeleton';
import { useActiveWeb3React, useAnalyticsVersion } from 'hooks';
import { useAnalyticsTopPairs } from 'hooks/useFetchAnalyticsData';
import { exportToXLSX } from 'utils/exportToXLSX';
import Loader from 'components/Loader';
import { formatNumber } from 'utils';
import { GlobalConst } from 'constants/index';
import { getConfig } from 'config/index';

const AnalyticsTopPairs: React.FC = () => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const history = useHistory();
  const version = useAnalyticsVersion();
  const { isLoading: topPairsLoading, data: topPairs } = useAnalyticsTopPairs(
    version,
    chainId,
  );
  const config = getConfig(chainId);
  const networkName = config['networkName'];

  const [xlsExported, setXLSExported] = useState(false);

  useEffect(() => {
    if (xlsExported) {
      const exportData = topPairs
        .sort((pair1: any, pair2: any) => {
          const liquidity1 = pair1.trackedReserveUSD
            ? pair1.trackedReserveUSD
            : pair1.reserveUSD ?? 0;
          const liquidity2 = pair2.trackedReserveUSD
            ? pair2.trackedReserveUSD
            : pair2.reserveUSD ?? 0;
          return liquidity1 > liquidity2 ? -1 : 1;
        })
        .map((pair: any) => {
          const oneDayVolume =
            pair.oneDayVolumeUSD && !isNaN(pair.oneDayVolumeUSD)
              ? pair.oneDayVolumeUSD
              : pair.oneDayVolumeUntracked && !isNaN(pair.oneDayVolumeUntracked)
              ? pair.oneDayVolumeUntracked
              : 0;
          const totalPairObj = { '#': pair.isV3 ? 'V3' : 'V2' };
          const v2PairObj = {
            '24h Fees':
              '$' +
              formatNumber(Number(oneDayVolume) * GlobalConst.utils.FEEPERCENT),
          };
          const v3PairObj = {
            APR: formatNumber(pair.apr) + '%',
            'Farming APR': formatNumber(pair.farmingApr) + '%',
          };
          return {
            ...(version === 'total' ? totalPairObj : {}),
            Name: `${pair?.token0?.symbol} / ${pair?.token1?.symbol}${
              version !== 'v2' && pair.isV3
                ? ` ${formatNumber(pair.fee / 10000)}% ${
                    pair.isUni ? '(F)' : 'Fee'
                  }`
                : ''
            }`,
            Liquidity:
              '$' +
              formatNumber(
                pair.trackedReserveUSD
                  ? pair.trackedReserveUSD
                  : pair.reserveUSD ?? 0,
              ),
            '24h Volume': '$' + formatNumber(oneDayVolume),
            '7d Volume':
              '$' +
              formatNumber(
                pair.oneWeekVolumeUSD && !isNaN(pair.oneWeekVolumeUSD)
                  ? pair.oneWeekVolumeUSD
                  : pair.oneWeekVolumeUntracked &&
                    !isNaN(pair.oneWeekVolumeUntracked)
                  ? pair.oneWeekVolumeUntracked
                  : 0,
              ),
            ...(version === 'v2' ? v2PairObj : v3PairObj),
          };
        });
      exportToXLSX(
        exportData,
        'Quickswap-Pairs-' + networkName + '-' + version,
      );
      setTimeout(() => {
        setXLSExported(false);
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xlsExported]);

  return (
    <>
      <Box className='flex items-center justify-between'>
        <Box className='headingWrapper'>
          <p className='weight-600'>{t('topPairs')}</p>
        </Box>
        <Box className='flex items-center' gridGap={8}>
          <Box
            className={`bg-secondary1 flex items-center ${
              xlsExported ? '' : 'cursor-pointer'
            }`}
            padding='4px 8px'
            borderRadius={6}
            onClick={() => {
              if (!xlsExported) setXLSExported(true);
            }}
          >
            {xlsExported ? <Loader /> : <small>{t('export')}</small>}
          </Box>
          <Box
            className='cursor-pointer headingWrapper'
            onClick={() => history.push(`/analytics/${version}/pairs`)}
          >
            <p className='weight-600'>{t('seeAll')}</p>
            <ArrowForwardIos />
          </Box>
        </Box>
      </Box>
      <Box mt={3} className='panel'>
        {topPairsLoading ? (
          <Skeleton variant='rect' width='100%' height={150} />
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
    </>
  );
};

export default AnalyticsTopPairs;
