import React, { useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { useActiveWeb3React } from 'hooks';
import { useTranslation } from 'react-i18next';
import { useWalletModalToggle } from 'state/application/hooks';
import ToggleVersion from '../ToggleVersion';

export default function MyLiquidityLocks() {
  const { t } = useTranslation();
  const [isV3, setIsV3] = useState(false);
  const { account } = useActiveWeb3React();

  const showConnectAWallet = Boolean(!account);
  const toggleWalletModal = useWalletModalToggle();

  return (
    <Box>
      <Box className='flex justify-between items-center'>
        <p className='weight-600'>{t('myLiquidityLocks')}</p>
      </Box>
      <Box mt={2}>
        <ToggleVersion method={setIsV3} checkValue={isV3} />
      </Box>
      <Box textAlign='center'>
        <p>{t('noLiquidityLocks')}.</p>
        {showConnectAWallet && (
          <Box maxWidth={250} margin='20px auto 0'>
            <Button fullWidth onClick={toggleWalletModal}>
              {t('connectWallet')}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
