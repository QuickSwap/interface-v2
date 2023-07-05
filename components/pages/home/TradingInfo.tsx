import React, { useState } from 'react';
import { Box } from '@mui/material';
import { Skeleton } from '@mui/lab';
import { StakeQuickModal } from 'components';
import { useNewLairInfo, useTotalRewardsDistributed } from 'state/stake/hooks';
import { formatCompact, useLairDQUICKAPY } from 'utils';
import { useTranslation } from 'next-i18next';
import { ChainId } from '@uniswap/sdk';
import styles from 'styles/pages/Home.module.scss';
import { useActiveWeb3React } from 'hooks';
import { getConfig } from 'config';
import { useV3DistributedRewards } from 'hooks/v3/useV3DistributedRewards';
import { DLQUICK } from 'constants/v3/addresses';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';

const TradingInfo: React.FC<{ globalData: any; v3GlobalData: any }> = ({
  globalData,
  v3GlobalData,
}) => {
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const lairInfo = useNewLairInfo();
  const quickToken = DLQUICK[chainIdToUse];
  const quickPrice = useUSDCPriceFromAddress(quickToken?.address);

  const [openStakeModal, setOpenStakeModal] = useState(false);

  const dQUICKAPY = useLairDQUICKAPY(true, lairInfo);
  const config = getConfig(chainIdToUse);
  const oldLair = config['lair']['oldLair'];
  const newLair = config['lair']['newLair'];
  const farmEnabled = config['farm']['available'];
  //TODO: Support Multichain
  const totalRewardsUSD = useTotalRewardsDistributed(chainIdToUse);
  const totalRewardsUSDV3 = useV3DistributedRewards(chainIdToUse);
  const { t } = useTranslation();

  const v2 = config['v2'];
  const v3 = config['v3'];

  return (
    <>
      {openStakeModal && (
        <StakeQuickModal
          open={openStakeModal}
          onClose={() => setOpenStakeModal(false)}
        />
      )}
      <Box className={styles.tradingSection}>
        {(v2 ? globalData : true) && (v3 ? v3GlobalData : true) ? (
          <h3>
            {(
              (v2 ? Number(globalData.oneDayTxns) : 0) +
              (v3 ? Number(v3GlobalData.txCount) : 0)
            ).toLocaleString('us')}
          </h3>
        ) : (
          <Skeleton variant='rectangular' width={100} height={45} />
        )}
        <p className='text-uppercase'>{t('24hTxs')}</p>
      </Box>
      <Box className={styles.tradingSection}>
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
          <Skeleton variant='rectangular' width={100} height={45} />
        )}
        <p>{t('24hTradingVol')}</p>
      </Box>
      {farmEnabled && (
        <Box className={styles.tradingSection}>
          {(v2 ? totalRewardsUSD !== undefined : true) &&
          (v3 ? totalRewardsUSDV3 !== undefined : true) ? (
            <Box display='flex'>
              <h6>$</h6>
              <h3>
                {formatCompact(
                  (v2 ? totalRewardsUSD ?? 0 : 0) +
                    (v3 ? totalRewardsUSDV3 ?? 0 : 0),
                )}
              </h3>
            </Box>
          ) : (
            <Skeleton variant='rectangular' width={100} height={45} />
          )}
          <p>{t('24hRewardsDistributed')}</p>
        </Box>
      )}
      <Box className={styles.tradingSection}>
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
          <Skeleton variant='rectangular' width={100} height={45} />
        )}
        <p>{t('totalTradingPairs')}</p>
      </Box>
      {(oldLair || newLair) && (
        <Box className={styles.tradingSection} pt='20px'>
          {dQUICKAPY ? (
            <Box>
              <Box display='flex'>
                <h6>$</h6>
                <h3>
                  {lairInfo && quickPrice
                    ? formatCompact(
                        Number(lairInfo.totalQuickBalance.toExact()) *
                          quickPrice,
                        18,
                        3,
                        3,
                      )
                    : 0}
                </h3>
              </Box>
              <Box className='text-success text-center'>
                <small>{dQUICKAPY}%</small>
              </Box>
            </Box>
          ) : (
            <Skeleton variant='rectangular' width={100} height={45} />
          )}
          <p>dQUICK {t('apy')}</p>
          <h4 onClick={() => setOpenStakeModal(true)}>
            {t('stake')} {'>'}
          </h4>
        </Box>
      )}
    </>
  );
};

export default TradingInfo;
