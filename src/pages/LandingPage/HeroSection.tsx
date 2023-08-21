import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Box } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { useIsSupportedNetwork } from 'utils';
import { useActiveWeb3React } from 'hooks';
import {
  useWalletModalToggle,
  useNetworkSelectionModalToggle,
} from 'state/application/hooks';
import { useTranslation } from 'react-i18next';
import { ChainId } from '@uniswap/sdk';
import { getConfig } from 'config';

// To compute dragon's lair
import { useNewLairInfo } from 'state/stake/hooks';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';
import { DLQUICK } from 'constants/v3/addresses';
import { useAnalyticsGlobalData } from 'hooks/useFetchAnalyticsData';

const HeroSection: React.FC = () => {
  const history = useHistory();
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

  const [dragonReward, setDraonReward] = useState(0);

  const { data: globalData } = useAnalyticsGlobalData('v2', chainId);
  const { data: v3GlobalData } = useAnalyticsGlobalData('v3', chainId);

  useEffect(() => {
    if (lairInfo && quickPrice) {
      const newReward =
        Number(lairInfo.totalQuickBalance.toExact()) * quickPrice;

      setDraonReward(newReward || 0);
    }
  }, [lairInfo, quickPrice]);

  return (
    <Box className='heroSection'>
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
          <Skeleton variant='rect' width={400} height={72} />
        </Box>
      )}
      <h5>{t('topAssetExchange')}</h5>
      <Box mt={2} width={200} height={48}>
        <Button
          fullWidth
          className='bg-blue1 p'
          style={{
            borderRadius: '30px',
            height: '100%',
          }}
          onClick={() => {
            !isSupportedNetwork
              ? toggleNetworkSelectionModal()
              : account
              ? history.push('/swap')
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
    </Box>
  );
};

export default HeroSection;
