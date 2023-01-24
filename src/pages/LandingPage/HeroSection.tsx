import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Box, Skeleton } from 'theme/components';
import { isSupportedNetwork, addMaticToMetamask } from 'utils';
import { useActiveWeb3React } from 'hooks';
import { useWalletModalToggle } from 'state/application/hooks';
import { useTranslation } from 'react-i18next';

const HeroSection: React.FC<{ globalData: any; v3GlobalData: any }> = ({
  globalData,
  v3GlobalData,
}) => {
  const history = useHistory();
  const { account } = useActiveWeb3React();
  const { ethereum } = window as any;
  const toggleWalletModal = useWalletModalToggle();
  const { t } = useTranslation();

  return (
    <Box className='heroSection'>
      <small className='text-bold'>{t('totalValueLocked')}</small>
      {globalData && v3GlobalData ? (
        <Box className='flex' padding='5px 0 0'>
          <h3>$</h3>
          <h1>
            {(
              Number(globalData.totalLiquidityUSD) +
              Number(v3GlobalData.totalLiquidityUSD)
            ).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </h1>
        </Box>
      ) : (
        <Box margin='8px 0'>
          <Skeleton width='400px' height='72px' />
        </Box>
      )}
      <h5>{t('topAssetExchange')}</h5>
      <Box margin='16px 0 0' width='200px' height='48px'>
        <Button
          width='100%'
          className='bg-blue1 p'
          style={{
            borderRadius: '30px',
            height: '100%',
          }}
          onClick={() => {
            ethereum && !isSupportedNetwork(ethereum)
              ? addMaticToMetamask()
              : account
              ? history.push('/swap')
              : toggleWalletModal();
          }}
        >
          {ethereum && !isSupportedNetwork(ethereum)
            ? t('switchPolygon')
            : account
            ? t('enterApp')
            : t('connectWallet')}
        </Button>
      </Box>
    </Box>
  );
};

export default HeroSection;
