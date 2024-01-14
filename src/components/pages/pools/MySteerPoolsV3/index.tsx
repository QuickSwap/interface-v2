import React from 'react';
import { Box, Button } from '@mui/material';
import { useActiveWeb3React } from 'hooks';
import { useWalletModalToggle } from 'state/application/hooks';
import { useTranslation } from 'next-i18next';
import SteerLPItem from './SteerLPItem';
import { useV3SteerPositions } from 'hooks/v3/useV3Positions';

export default function MySteerPoolsV3() {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();

  const showConnectAWallet = Boolean(!account);

  const toggleWalletModal = useWalletModalToggle();

  const steerPositions = useV3SteerPositions();

  return (
    <Box>
      {steerPositions && steerPositions.length > 0 ? (
        <Box>
          {steerPositions.map((position, index) => (
            <SteerLPItem key={index} position={position} />
          ))}
        </Box>
      ) : (
        <Box mt={2} textAlign='center'>
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
  );
}
