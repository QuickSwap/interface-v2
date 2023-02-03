import React, { useState, useEffect } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { Box, Grid, useMediaQuery } from '@material-ui/core';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { SettingsModal, SwapTokenDetails, ToggleSwitch } from 'components';
import { useIsProMode, useIsV2 } from 'state/application/hooks';
import { useDerivedSwapInfo } from 'state/swap/hooks';
import { useDerivedSwapInfo as useDerivedSwapInfoV3 } from 'state/swap/v3/hooks';
import { Field } from 'state/swap/actions';
import { getPairAddress, getSwapTransactions } from 'utils';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import { useActiveWeb3React } from 'hooks';
import SwapMain from './SwapMain';
import LiquidityPools from './LiquidityPools';
import { useTranslation } from 'react-i18next';
import 'pages/styles/swap.scss';
import AdsSlider from 'components/AdsSlider';
import { SwapBuySellWidget } from './BuySellWidget';
import { Token } from '@uniswap/sdk';
import SwapProMain from './SwapProMain';
import SwapDefaultMode from './SwapDefaultMode';

const SwapPage: React.FC = () => {
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const { isProMode, updateIsProMode } = useIsProMode();
  const { breakpoints } = useTheme();
  const isTiny = useMediaQuery(breakpoints.down('xs'));
  const [pairId, setPairId] = useState<string | undefined>(undefined);
  const [pairTokenReversed, setPairTokenReversed] = useState(false);
  const [transactions, setTransactions] = useState<any[] | undefined>(
    undefined,
  );
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const { currencies } = useDerivedSwapInfo();
  const { currencies: currenciesV3 } = useDerivedSwapInfoV3();
  const { chainId } = useActiveWeb3React();

  const token1 = wrappedCurrency(currencies[Field.INPUT], chainId);
  const token2 = wrappedCurrency(currencies[Field.OUTPUT], chainId);

  const token1V3 = currenciesV3[Field.INPUT]?.wrapped;
  const token2V3 = currenciesV3[Field.OUTPUT]?.wrapped;
  const { isV2 } = useIsV2();

  // this is for refreshing data of trades table every 60 seconds
  useEffect(() => {
    if (!isProMode) {
      // TODO - Make it true
      updateIsProMode(false);
    }
    const interval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000);
      setCurrentTime(_currentTime);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function getPairId(token1Address: string, token2Address: string) {
      const pairData = await getPairAddress(token1Address, token2Address);
      if (pairData) {
        setPairTokenReversed(pairData.tokenReversed);
        setPairId(pairData.pairId);
      }
    }
    if (token1?.address && token2?.address) {
      getPairId(token1?.address, token2?.address);
    }
  }, [token1?.address, token2?.address]);

  useEffect(() => {
    (async () => {
      if (pairId && transactions && transactions.length > 0) {
        const txns = await getSwapTransactions(
          pairId,
          Number(transactions[0].transaction.timestamp),
        );
        if (txns) {
          const filteredTxns = txns.filter(
            (txn) =>
              !transactions.find(
                (tx) => tx.transaction.id === txn.transaction.id,
              ),
          );
          setTransactions([...filteredTxns, ...transactions]);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  useEffect(() => {
    async function getTradesData(pairId: string) {
      setTransactions(undefined);
      const transactions = await getSwapTransactions(pairId);
      setTransactions(transactions);
    }
    if (pairId && isProMode) {
      getTradesData(pairId);
    }
  }, [pairId, isProMode]);

  const { t } = useTranslation();
  const helpURL = process.env.REACT_APP_HELP_URL;
  return (
    <Box width='100%' mb={3} id='swap-page'>
      {openSettingsModal && (
        <SettingsModal
          open={openSettingsModal}
          onClose={() => setOpenSettingsModal(false)}
        />
      )}
      {!isProMode && (
        <Box className='pageHeading'>
          <h4>{t('swap')}</h4>
          {helpURL && (
            <Box
              className='helpWrapper'
              onClick={() => window.open(helpURL, '_blank')}
            >
              <small>{t('help')}</small>
              <HelpIcon />
            </Box>
          )}
        </Box>
      )}
      {!isProMode ? (
        <SwapDefaultMode isTiny={isTiny} token1={token1} token2={token2} />
      ) : (
        <SwapProMain
          pairId={pairId}
          pairTokenReversed={pairTokenReversed}
          token1={token1}
          token2={token2}
          transactions={transactions}
        />
      )}
    </Box>
  );
};

export default SwapPage;
