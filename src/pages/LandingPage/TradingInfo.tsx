import React from 'react';
import { Box } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { formatCompact } from 'utils';
import { useTranslation } from 'react-i18next';
import { ChainId } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { getConfig } from '../../config/index';
import DragonLayerInfoCard from './TradingInfoCards/DragonLayerInfoCard';
import { useAnalyticsGlobalData } from 'hooks/useFetchAnalyticsData';
import { ZkEvmTvlInfoCard } from './TradingInfoCards/ZkEvmTvlInfoCard';

const TradingInfo: React.FC = () => {
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;

  const config = getConfig(chainIdToUse);

  const { t } = useTranslation();

  const v2 = config['v2'];
  const v3 = config['v3'];

  const { data: globalData } = useAnalyticsGlobalData('v2', chainId);
  const { data: v3GlobalData } = useAnalyticsGlobalData('v3', chainId);

  return (
    <>
      <Box className='tradingSection'>
        {(v2 ? globalData : true) && (v3 ? v3GlobalData : true) ? (
          <h3>
            {(
              (v2 ? Number(globalData.oneDayTxns) : 0) +
              (v3 ? Number(v3GlobalData.txCount) : 0)
            ).toLocaleString('us')}
          </h3>
        ) : (
          <Skeleton variant='rect' width={100} height={45} />
        )}
        <p className='text-uppercase'>{t('24hTxs')}</p>
      </Box>
      <Box className='tradingSection'>
        {(v2 ? globalData : true) && (v3 ? v3GlobalData : true) ? (
          <Box display='flex'>
            <h6>$</h6>
            <h3>
              {formatCompact(
                (v2 ? Number(globalData.oneDayVolumeUSD) : 0) +
                  (v3 ? Number(v3GlobalData.oneDayVolumeUSD) : 0),
              )}
            </h3>
          </Box>
        ) : (
          <Skeleton variant='rect' width={100} height={45} />
        )}
        <p>{t('24hTradingVol')}</p>
      </Box>
      <Box className='tradingSection'>
        {(v2 ? globalData : true) && (v3 ? v3GlobalData : true) ? (
          <h3>
            {(
              (v2 ? Number(globalData.pairCount) : 0) +
              (v3 ? Number(v3GlobalData.poolCount) : 0)
            ).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </h3>
        ) : (
          <Skeleton variant='rect' width={100} height={45} />
        )}
        <p>{t('totalTradingPairs')}</p>
      </Box>
      <DragonLayerInfoCard chainId={chainIdToUse} config={config} />
      {chainIdToUse === ChainId.ZKEVM && <ZkEvmTvlInfoCard />}
    </>
  );
};

export default TradingInfo;
