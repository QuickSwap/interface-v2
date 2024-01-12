import React from 'react';
import { Box, Button } from '@material-ui/core';
import { useActiveWeb3React } from 'hooks';
import { useWalletModalToggle } from 'state/application/hooks';
import { useTranslation } from 'react-i18next';
import ICHILPItem from './ICHILPItem';
import { useICHIPositions } from 'hooks/v3/useV3Positions';

export default function MyICHIPools() {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();

  const showConnectAWallet = Boolean(!account);

  const toggleWalletModal = useWalletModalToggle();

  const { positions } = useICHIPositions();

  return (
    <Box>
      {positions && positions.length > 0 ? (
        <>
          {positions.map((position, index) => (
            <ICHILPItem key={index} position={position} />
          ))}
        </>
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
