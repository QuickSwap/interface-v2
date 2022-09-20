import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { StakeQuickModal } from 'components';
import { useOldLairInfo, useTotalRewardsDistributed } from 'state/stake/hooks';
import { formatCompact, useLairDQUICKAPY } from 'utils';
import { useTranslation } from 'react-i18next';
import { ChainId } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';

export const TradingInfo: React.FC<{ globalData: any; v3GlobalData: any }> = ({
  globalData,
  v3GlobalData,
}) => {
  const lairInfo = useOldLairInfo();
  const [openStakeModal, setOpenStakeModal] = useState(false);

  const dQUICKAPY = useLairDQUICKAPY(false, lairInfo);
  console.log('cc', dQUICKAPY);
  const { chainId } = useActiveWeb3React();
  const chainIdOrDefault = chainId ?? ChainId.MATIC;
  const totalRewardsUSD = useTotalRewardsDistributed(chainIdOrDefault);
  const { t } = useTranslation();

  return (
    <>
      {openStakeModal && (
        <StakeQuickModal
          open={openStakeModal}
          onClose={() => setOpenStakeModal(false)}
        />
      )}
      <Box className='tradingSection'>
        {globalData && v3GlobalData ? (
          <h3>
            {(
              Number(globalData.oneDayTxns) + Number(v3GlobalData.txCount)
            ).toLocaleString()}
          </h3>
        ) : (
          <Skeleton variant='rect' width={100} height={45} />
        )}
        <p className='text-uppercase'>{t('24hTxs')}</p>
      </Box>
      <Box className='tradingSection'>
        {globalData && v3GlobalData ? (
          <Box display='flex'>
            <h6>$</h6>
            <h3>
              {formatCompact(
                Number(globalData.oneDayVolumeUSD) +
                  Number(v3GlobalData.oneDayVolumeUSD),
              )}
            </h3>
          </Box>
        ) : (
          <Skeleton variant='rect' width={100} height={45} />
        )}
        <p>{t('24hTradingVol')}</p>
      </Box>
      <Box className='tradingSection'>
        {totalRewardsUSD ? (
          <Box display='flex'>
            <h6>$</h6>
            <h3>{totalRewardsUSD.toLocaleString()}</h3>
          </Box>
        ) : (
          <Skeleton variant='rect' width={100} height={45} />
        )}
        <p>{t('24hRewardsDistributed')}</p>
      </Box>
      <Box className='tradingSection'>
        {globalData && v3GlobalData ? (
          <h3>
            {(
              Number(globalData.pairCount) + Number(v3GlobalData.poolCount)
            ).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </h3>
        ) : (
          <Skeleton variant='rect' width={100} height={45} />
        )}
        <p>{t('totalTradingPairs')}</p>
      </Box>
      <Box className='tradingSection' pt='20px'>
        {dQUICKAPY ? (
          <h3>{dQUICKAPY.toLocaleString()}%</h3>
        ) : (
          <Skeleton variant='rect' width={100} height={45} />
        )}
        <p>dQUICK {t('apy')}</p>
        <h4 onClick={() => setOpenStakeModal(true)}>
          {t('stake')} {'>'}
        </h4>
      </Box>
    </>
  );
};
