import React from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { useActiveWeb3React } from 'hooks';
import { useWalletModalToggle } from 'state/application/hooks';
import { useTranslation } from 'next-i18next';
import DefiedgeLPList from './DefiedgeLPList';
import { useDefiedgePositions } from 'hooks/v3/useV3Positions';

export default function MyDefiedgePoolsV3() {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();

  const showConnectAWallet = Boolean(!account);

  const toggleWalletModal = useWalletModalToggle();

  const { positions, loading } = useDefiedgePositions(account, chainId);

  return (
    <Box>
      {loading ? (
        <Box mt={2} className='flex justify-center'>
          <CircularProgress size={'2rem'} />
        </Box>
      ) : positions.length > 0 ? (
        <DefiedgeLPList defiedgePositions={positions} />
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
