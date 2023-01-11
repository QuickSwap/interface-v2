import React from 'react';
import { Box, Button } from '@material-ui/core';
import { useActiveWeb3React } from 'hooks';
import Loader from 'components/Loader';
import { useWalletModalToggle } from 'state/application/hooks';
import { useTranslation } from 'react-i18next';
import GammaLPList from './GammaLPList';
import { useQuery } from 'react-query';

export default function MyLiquidityPoolsV3() {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();

  const showConnectAWallet = Boolean(!account);

  const toggleWalletModal = useWalletModalToggle();

  const fetchGammaPositions = async () => {
    if (!account) return;
    try {
      const data = await fetch(
        `https://gammawire.net/quickswap/polygon/user/${account}`,
      );
      const positions = await data.json();
      return positions[account.toLowerCase()];
    } catch (e) {
      console.log(e);
      return;
    }
  };

  const { isLoading: positionsLoading, data: gammaPositions } = useQuery(
    'fetchGammaPositions',
    fetchGammaPositions,
    {
      refetchInterval: 30000,
    },
  );

  return (
    <Box>
      <p className='weight-600'>{t('myGammaLP')}</p>
      <Box mt={2}>
        {positionsLoading ? (
          <Box className='flex justify-center'>
            <Loader stroke='white' size={'2rem'} />
          </Box>
        ) : gammaPositions ? (
          <GammaLPList gammaPositions={gammaPositions} />
        ) : (
          <Box textAlign='center'>
            <p>{t('noLiquidityPositions')}.</p>
            {showConnectAWallet && (
              <Box maxWidth={250} margin='20px auto 0'>
                <Button fullWidth onClick={toggleWalletModal}>
                  {t('connectWallet')}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
