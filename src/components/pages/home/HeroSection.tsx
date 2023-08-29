import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Button, Box } from '@mui/material';
import { Skeleton } from '@mui/lab';
import { useIsSupportedNetwork } from 'utils';
import { useActiveWeb3React } from 'hooks';
import {
  useWalletModalToggle,
  useNetworkSelectionModalToggle,
} from 'state/application/hooks';
import { useTranslation } from 'next-i18next';
import styles from 'styles/pages/Home.module.scss';
import { ChainId } from '@uniswap/sdk';
import { getConfig } from 'config';

// To compute dragon's lair
import { useNewLairInfo } from 'state/stake/hooks';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';
import { DLQUICK } from 'constants/v3/addresses';
import { useAnalyticsGlobalData } from 'hooks/useFetchAnalyticsData';

const HeroSection: React.FC = () => {
  const router = useRouter();
  const isSupportedNetwork = useIsSupportedNetwork();
  const { chainId, account } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const toggleWalletModal = useWalletModalToggle();
  const toggleNetworkSelectionModal = useNetworkSelectionModalToggle();
  const { t } = useTranslation();
  const config = getConfig(chainIdToUse);
  const v2 = config['v2'];
  const v3 = config['v3'];

  const lairInfo = useNewLairInfo();
  const quickToken = DLQUICK[chainIdToUse];
  const quickPrice = useUSDCPriceFromAddress(quickToken?.address);

  const { data: globalData } = useAnalyticsGlobalData('v2', chainId);
  const { data: v3GlobalData } = useAnalyticsGlobalData('v3', chainId);

  const dragonReward = useMemo(() => {
    if (lairInfo && quickPrice) {
      const newReward =
        Number(lairInfo.totalQuickBalance.toExact()) * quickPrice;

      return newReward || 0;
    }
    return 0;
  }, [lairInfo, quickPrice]);

  return (
    <Box className={styles.heroSection}>
      <small className='text-bold'>{t('totalValueLocked')}</small>
      {(v2 ? globalData : true) && (v3 ? v3GlobalData : true) ? (
        <Box display='flex' pt='5px'>
          <h3>$</h3>
          <h1>
            {(
              (v2 ? Number(globalData.totalLiquidityUSD) : 0) +
              (v3 ? Number(v3GlobalData.totalLiquidityUSD) : 0) +
              dragonReward
            ).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </h1>
        </Box>
      ) : (
        <Box my={1}>
          <Skeleton variant='rectangular' width={400} height={72} />
        </Box>
      )}
      <h5>{t('topAssetExchange')}</h5>
      <Button
        fullWidth
        size='large'
        variant='contained'
        onClick={() => {
          !isSupportedNetwork
            ? toggleNetworkSelectionModal()
            : account
            ? router.push('/swap')
            : toggleWalletModal();
        }}
      >
        {!isSupportedNetwork
          ? t('switchNetwork')
          : account
          ? t('enterApp')
          : t('connectWallet')}
      </Button>
    </Box>
  );
};

export default HeroSection;
