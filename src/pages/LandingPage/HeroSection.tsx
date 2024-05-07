import React, { useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Box, Typography } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { useIsSupportedNetwork } from 'utils';
import { useActiveWeb3React } from 'hooks';
import {
  useWalletModalToggle,
  useOpenNetworkSelection,
} from 'state/application/hooks';
import { useTranslation } from 'react-i18next';
import { ChainId } from '@uniswap/sdk';
import { getConfig } from 'config/index';

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
  const { setOpenNetworkSelection } = useOpenNetworkSelection();
  const { t } = useTranslation();
  const config = getConfig(chainIdToUse);
  const v2 = config['v2'];
  const v3 = config['v3'];
  const lairAvailable = config['lair']['newLair'];

  const lairInfo = useNewLairInfo(!lairAvailable);
  const quickToken = DLQUICK[chainIdToUse];
  const {
    loading: loadingQuickPrice,
    price: quickPrice,
  } = useUSDCPriceFromAddress(quickToken?.address ?? '');

  const {
    isLoading: loadingV2GlobalData,
    data: globalData,
  } = useAnalyticsGlobalData('v2', chainId);
  const {
    isLoading: loadingV3GlobalData,
    data: v3GlobalData,
  } = useAnalyticsGlobalData('v3', chainId);

  const dragonReward = useMemo(() => {
    if (lairInfo && quickPrice) {
      const newReward =
        Number(lairInfo.totalQuickBalance.toExact()) * quickPrice;

      return newReward;
    }
    return 0;
  }, [lairInfo, quickPrice]);

  const loading =
    ((v2 ? loadingV2GlobalData : false) ||
      (v3 ? loadingV3GlobalData : false)) &&
    (loadingQuickPrice || lairInfo?.loading);

  return (
    <Box className='heroSection'>
      {/* <small className='text-bold'>{t('totalValueLocked')}</small> */}
      {loading ? (
        <Box my={1}>
          <Skeleton variant='rect' width={400} height={72} />
        </Box>
      ) : (
        // <Box display='flex' pt='5px'>
        //   <h3>$</h3>
        //   <h1>
        //     {(
        //       (v2 && globalData && globalData.totalLiquidityUSD
        //         ? Number(globalData.totalLiquidityUSD)
        //         : 0) +
        //       (v3 && v3GlobalData && v3GlobalData.totalLiquidityUSD
        //         ? Number(v3GlobalData.totalLiquidityUSD)
        //         : 0) +
        //       dragonReward
        //     ).toLocaleString('us', {
        //       maximumFractionDigits: 0,
        //     })}
        //   </h1>
        // </Box>
        <>
          <Box style={{ maxWidth: '40%', marginBottom: '20px' }}>
            <Typography className='title' style={{ color: '#f6f6f9' }}>
              Leading DEX on
            </Typography>
            <Typography className='title' style={{ color: '#f6f6f9' }}>
              all Polygon Chains
            </Typography>
          </Box>
          <Box sx={{ maxWidth: '40%' }}>
            <Typography
              className='subTitle'
              style={{
                marginBottom: '20px',
                color: '#ccd8e7',
              }}
            >
              {t('introduction')}
            </Typography>
            <Typography
              className='subTitle'
              style={{
                color: '#ccd8e7',
              }}
            >
              {t('feeDescription')}
            </Typography>
          </Box>
        </>
      )}
      {/* <h5>{t('topAssetExchange', { network: config['networkName'] })}</h5> */}
      <Box mt={2} width={156} height={48}>
        <Button
          fullWidth
          className='bg-blue1 p'
          style={{
            borderRadius: '12px',
            height: '100%',
          }}
          onClick={() => {
            !isSupportedNetwork
              ? setOpenNetworkSelection(true)
              : account
              ? history.push('/swap')
              : toggleWalletModal();
          }}
        >
          {!isSupportedNetwork
            ? t('switchNetwork')
            : account
            ? t('enterApp')
            : t('launchApp')}
        </Button>
      </Box>
    </Box>
  );
};

export default HeroSection;
