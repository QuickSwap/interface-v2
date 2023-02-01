import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Box } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { isSupportedNetwork, addMaticToMetamask } from 'utils';
import { useActiveWeb3React } from 'hooks';
import { useWalletModalToggle } from 'state/application/hooks';
import { useTranslation } from 'react-i18next';
import { ChainId } from '@uniswap/sdk';
import { getConfig } from 'config';

const HeroSection: React.FC<{ globalData: any; v3GlobalData: any }> = ({
  globalData,
  v3GlobalData,
}) => {
  const history = useHistory();
  const { chainId, account } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const { ethereum } = window as any;
  const toggleWalletModal = useWalletModalToggle();
  const { t } = useTranslation();
  const config = getConfig(chainIdToUse);
  const v2 = config['v2'];
  const v3 = config['v3'];

  return (
    <Box className='heroSection'>
      <small className='text-bold'>{t('totalValueLocked')}</small>
      {(v2 ? globalData : true) && (v3 ? v3GlobalData : true) ? (
        <Box display='flex' pt='5px'>
          <h3>$</h3>
          <h1>
            {(
              (v2 ? Number(globalData.totalLiquidityUSD) : 0) +
              (v3 ? Number(v3GlobalData.totalLiquidityUSD) : 0)
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
