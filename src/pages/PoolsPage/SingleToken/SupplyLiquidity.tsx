import React, { useCallback, useState } from 'react';
import { useActiveWeb3React, useConnectWallet } from 'hooks';
// import { useHistory } from 'react-router-dom';
import { Currency } from '@uniswap/sdk-core';
import { useIsSupportedNetwork } from 'utils';
import { Box, Button } from '@material-ui/core';
// import { SettingsModal } from 'components';
// import { ReactComponent as SettingsIcon } from 'assets/images/SettingsIcon.svg';
import usePoolsRedirect from 'hooks/usePoolsRedirect';
import { useTranslation } from 'react-i18next';
import V3CurrencySelect from 'components/v3/CurrencySelect';
import SingleTokenSelectPool from './components/SelectPool';
import SingleTokenEnterAmount from './components/EnterAmount';
// import ICHILogo from 'assets/images/ichi_logo.png';
import './index.scss';
import {
  useSingleTokenCurrency,
  useSingleTokenVault,
} from 'state/singleToken/hooks';
import SingleTokenDepositButton from './components/DepositButton';

export function SingleTokenSupplyLiquidity() {
  const { t } = useTranslation();
  // const history = useHistory();
  const isSupportedNetwork = useIsSupportedNetwork();
  const { account } = useActiveWeb3React();

  const currency = useSingleTokenCurrency();
  const { selectedVault, selectVault } = useSingleTokenVault();

  const { connectWallet } = useConnectWallet(isSupportedNetwork);

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
      {/* <Box className='flex justify-between items-center'>
        <p className='weight-600'>{t('supplyLiquidity')}</p>
        <Box className='flex items-center' gridGap={5}>
          <Box className='flex items-center' gridGap={5}>
            <small className='text-secondary'>{t('poweredBy')}</small>
            <img src={ICHILogo} alt='ICHI' className='ichiLogo' />
          </Box>
          <small
            className='cursor-pointer text-primary'
            onClick={() => {
              history.push('/pools/singleToken');
            }}
          >
            {t('clearAll')}
          </small>
          <Box className='flex cursor-pointer'>
            <SettingsIcon onClick={() => setOpenSettingsModal(true)} />
          </Box>
        </Box>
      </Box> */}
      <Box mt={2}>
        {account && isSupportedNetwork ? (
          <Box>
            {/* <small className='weight-600'>1. {t('selectToken')}</small> */}
            <Box mt={1.5}>
              <V3CurrencySelect
                currency={currency ?? undefined}
                handleCurrencySelect={handleCurrencySelect}
              />
            </Box>
          </Box>
        ) : (
          <Button className='singleTokenDepositButton' onClick={connectWallet}>
            {account ? t('switchNetwork') : t('connectWallet')}
          </Button>
        )}
      </Box>
      <Box mt={3} position='relative'>
        {(!currency || !account || !isSupportedNetwork) && (
          <Box className='singleTokenSupplyLiquidityOverlay' />
        )}
        <SingleTokenSelectPool currency={currency ?? undefined} />
        <Box my={3} position='relative'>
          {!selectedVault && (
            <Box className='singleTokenSupplyLiquidityOverlay' />
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
