import React, { useCallback, useState } from 'react';
import { useActiveWeb3React } from 'hooks';
import { Currency } from '@uniswap/sdk-core';
import {
  useNetworkSelectionModalToggle,
  useWalletModalToggle,
} from 'state/application/hooks';
import { useIsSupportedNetwork } from 'utils';
import { Box, Button } from '@mui/material';
import { Settings } from '@mui/icons-material';
import { SettingsModal } from 'components';
import usePoolsRedirect from 'hooks/usePoolsRedirect';
import { useTranslation } from 'next-i18next';
import V3CurrencySelect from 'components/v3/CurrencySelect';
import SingleTokenSelectPool from './SelectPool';
import SingleTokenEnterAmount from './EnterAmount';
import styles from 'styles/components/PoolsSingleToken.module.scss';
import {
  useSingleTokenCurrency,
  useSingleTokenVault,
} from 'state/singleToken/hooks';
import SingleTokenDepositButton from './DepositButton';
import { useRouter } from 'next/router';

export function SingleTokenSupplyLiquidity() {
  const { t } = useTranslation();
  const router = useRouter();
  const isSupportedNetwork = useIsSupportedNetwork();
  const { account } = useActiveWeb3React();

  const currency = useSingleTokenCurrency();
  const { selectedVault, selectVault } = useSingleTokenVault();

  const toggleWalletModal = useWalletModalToggle(); // toggle wallet when disconnected
  const toggletNetworkSelectionModal = useNetworkSelectionModalToggle();

  const [openSettingsModal, setOpenSettingsModal] = useState(false);

  const { redirectWithCurrencySingleToken } = usePoolsRedirect();

  const handleCurrencySelect = useCallback(
    (currencyNew: Currency) => {
      redirectWithCurrencySingleToken(currencyNew);
      selectVault(undefined);
    },
    [redirectWithCurrencySingleToken, selectVault],
  );

  return (
    <Box>
      {openSettingsModal && (
        <SettingsModal
          open={openSettingsModal}
          onClose={() => setOpenSettingsModal(false)}
        />
      )}
      <Box className='flex justify-between items-center'>
        <p className='weight-600'>{t('supplyLiquidity')}</p>
        <Box className='flex items-center' gap='8px'>
          <Box className='flex items-center'>
            <small className='text-secondary'>{t('poweredBy')}</small>
            <img
              src='/assets/images/ichi_logo.png'
              alt='ICHI'
              height={16}
              style={{ marginLeft: 5 }}
            />
          </Box>
          <small
            className='cursor-pointer text-primary'
            onClick={() => {
              router.push('/pools/singleToken');
            }}
          >
            {t('clearAll')}
          </small>
          <Box className='flex cursor-pointer'>
            <Settings onClick={() => setOpenSettingsModal(true)} />
          </Box>
        </Box>
      </Box>
      <Box mt={2}>
        {account && isSupportedNetwork ? (
          <Box>
            <small className='weight-600'>1. {t('selectToken')}</small>
            <Box mt={1.5}>
              <V3CurrencySelect
                currency={currency ?? undefined}
                handleCurrencySelect={handleCurrencySelect}
              />
            </Box>
          </Box>
        ) : (
          <Button
            className={styles.singleTokenDepositButton}
            onClick={() => {
              if (account) {
                toggletNetworkSelectionModal();
              } else {
                toggleWalletModal();
              }
            }}
          >
            {account ? t('switchNetwork') : t('connectWallet')}
          </Button>
        )}
      </Box>
      <Box mt={3} position='relative'>
        {(!currency || !account || !isSupportedNetwork) && (
          <Box className={styles.singleTokenSupplyLiquidityOverlay} />
        )}
        <SingleTokenSelectPool currency={currency ?? undefined} />
        <Box my={3} position='relative'>
          {!selectedVault && (
            <Box className={styles.singleTokenSupplyLiquidityOverlay} />
          )}
          <SingleTokenEnterAmount />
          <Box mt={2}>
            <SingleTokenDepositButton />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
