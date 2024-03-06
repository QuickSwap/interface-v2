import { Box } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PairTable } from 'components';
import { useActiveWeb3React, useAnalyticsVersion } from 'hooks';
import { exportToXLSX } from 'utils/exportToXLSX';
import { formatNumber } from 'utils';
import { GlobalConst } from 'constants/index';
import { getConfig } from 'config/index';
import Loader from 'components/Loader';

interface Props {
  pools: any[];
  symbol: string;
}

const AnalyticsTokenPools: React.FC<Props> = ({ pools, symbol }) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const version = useAnalyticsVersion();

  const config = getConfig(chainId);
  const networkName = config['networkName'];

  const [xlsExported, setXLSExported] = useState(false);

  useEffect(() => {
    if (xlsExported) {
      const exportData = pools
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
        `Quickswap-${symbol}-Pools-${networkName}-${version}`,
      );
      setTimeout(() => {
        setXLSExported(false);
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xlsExported]);

  return (
    <>
      <Box width={1} className='flex items-center justify-between'>
        <p>
          {symbol} {t('pools')}
        </p>
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
      </Box>
      <Box width={1} className='panel' mt={4}>
        <PairTable data={pools} />
      </Box>
    </>
  );
};

export default AnalyticsTokenPools;
