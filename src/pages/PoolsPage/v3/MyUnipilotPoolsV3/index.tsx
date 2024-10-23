import React from 'react';
import { Box, Button } from '@material-ui/core';
import { useActiveWeb3React } from 'hooks';
import Loader from 'components/Loader';
import { useTranslation } from 'react-i18next';
import UnipilotLPItem from './UnipilotLPItem';
import {
  UnipilotPosition,
  useUnipilotPositions,
} from 'hooks/v3/useV3Positions';
import { useWeb3Modal } from '@web3modal/ethers5/react';

export default function MyUnipilotPoolsV3() {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();

  const showConnectAWallet = Boolean(!account);

  const { open } = useWeb3Modal();

  const {
    loading: uniPilotPositionsLoading,
    unipilotPositions,
  } = useUnipilotPositions(account, chainId);

  return (
    <Box>
      {uniPilotPositionsLoading ? (
        <Box mt={2} className='flex justify-center'>
          <Loader stroke='white' size={'2rem'} />
        </Box>
      ) : unipilotPositions && unipilotPositions.length > 0 ? (
        <Box>
          {unipilotPositions.map(
            (position: UnipilotPosition, index: number) => (
              <UnipilotLPItem key={index} position={position} />
            ),
          )}
        </Box>
      ) : (
        <Box mt={2} textAlign='center'>
          <p>{t('noLiquidityPositions')}.</p>
          {showConnectAWallet && (
            <Box maxWidth={250} margin='20px auto 0'>
              <Button fullWidth onClick={() => open()}>
                {t('connectWallet')}
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
