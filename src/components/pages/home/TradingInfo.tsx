import React from 'react';
import { Box } from '@mui/material';
import { Skeleton } from '@mui/lab';
import { formatCompact } from 'utils';
import { useTranslation } from 'next-i18next';
import { ChainId } from '@uniswap/sdk';
import styles from 'styles/pages/Home.module.scss';
import { useActiveWeb3React } from 'hooks';
import { getConfig } from 'config/index';
import DragonLayerInfoCard from './DragonLayerInfoCard';
import { useAnalyticsGlobalData } from 'hooks/useFetchAnalyticsData';
import { ZkEvmTvlInfoCard } from './ZkEvmTvlInfoCard';

const TradingInfo: React.FC = () => {
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;

  const config = getConfig(chainIdToUse);

  const { t } = useTranslation();

  const v2 = config['v2'];
  const v3 = config['v3'];

  const {
    isLoading: loadingV2GlobalData,
    data: globalData,
  } = useAnalyticsGlobalData('v2', chainId);
  const {
    isLoading: loadingV3GlobalData,
    data: v3GlobalData,
  } = useAnalyticsGlobalData('v3', chainId);
  const loading =
    (v2 ? loadingV2GlobalData : false) && (v3 ? loadingV3GlobalData : false);

  return (
    <>
      <Box className={styles.tradingSection}>
        {loading ? (
          <Skeleton variant='rectangular' width={100} height={45} />
        ) : (
          <h3>
            {(
              (v2 && globalData && globalData.oneDayTxns
                ? Number(globalData.oneDayTxns)
                : 0) +
              (v3 && v3GlobalData && v3GlobalData.txCount
                ? Number(v3GlobalData.txCount)
                : 0)
            ).toLocaleString('us')}
          </h3>
        )}
        <p className='text-uppercase'>{t('24hTxs')}</p>
      </Box>
      <Box className={styles.tradingSection}>
        {loading ? (
          <Skeleton variant='rectangular' width={100} height={45} />
        ) : (
          <Box display='flex'>
            <h6>$</h6>
            <h3>
              {formatCompact(
                (v2 && globalData && globalData.oneDayVolumeUSD
                  ? Number(globalData.oneDayVolumeUSD)
                  : 0) +
                  (v3 && v3GlobalData && v3GlobalData.oneDayVolumeUSD
                    ? Number(v3GlobalData.oneDayVolumeUSD)
                    : 0),
              )}
            </h3>
          </Box>
        )}
        <p>{t('24hTradingVol')}</p>
      </Box>
      <Box className={styles.tradingSection}>
        {loading ? (
          <Skeleton variant='rectangular' width={100} height={45} />
        ) : (
          <h3>
            {(
              (v2 && globalData && globalData.pairCount
                ? Number(globalData.pairCount)
                : 0) +
              (v3 && v3GlobalData && v3GlobalData.poolCount
                ? Number(v3GlobalData.poolCount)
                : 0)
            ).toLocaleString('us', {
              maximumFractionDigits: 0,
            })}
          </h3>
        )}
        <p>{t('totalTradingPairs')}</p>
      </Box>
      <DragonLayerInfoCard chainId={chainIdToUse} config={config} />
      {chainIdToUse === ChainId.ZKEVM && <ZkEvmTvlInfoCard />}
    </>
  );
};

export default TradingInfo;
