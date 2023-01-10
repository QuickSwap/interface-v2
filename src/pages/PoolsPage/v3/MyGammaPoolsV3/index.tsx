import React, { useEffect, useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { useActiveWeb3React } from 'hooks';
import Loader from 'components/Loader';
import { useWalletModalToggle } from 'state/application/hooks';
import { useTranslation } from 'react-i18next';
import GammaLPList from './GammaLPList';

export default function MyLiquidityPoolsV3() {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();

  const showConnectAWallet = Boolean(!account);

  const toggleWalletModal = useWalletModalToggle();
  const [gammaPositions, setGammaPositions] = useState<any>(undefined);
  const [positionsLoading, setPositionsLoading] = useState(false);

  useEffect(() => {
    if (!account) return;
    setPositionsLoading(true);
    (async () => {
      try {
        const data = await fetch(
          `https://gammawire.net/quickswap/polygon/user/${account}`,
        );
        const positions = await data.json();
        setGammaPositions(positions[account.toLowerCase()]);
        setPositionsLoading(false);
      } catch (e) {
        console.log(e);
        setPositionsLoading(false);
      }
    })();
  }, [account]);

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
