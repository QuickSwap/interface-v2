import { Box, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { SettingsModal } from 'components';

import { useActiveWeb3React } from 'hooks';
import 'pages/styles/swap.scss';
import React, { useEffect, useState } from 'react';
import { useIsProMode, useIsV2 } from 'state/application/hooks';
import { Field } from 'state/swap/actions';
import { useDerivedSwapInfo } from 'state/swap/hooks';
import { useDerivedSwapInfo as useDerivedSwapInfoV3 } from 'state/swap/v3/hooks';
import { getPairAddress, getSwapTransactions } from 'utils';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import SwapDefaultMode from './SwapDefaultMode';
import SwapPageHeader from './SwapPageHeader';

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

  return (
    <Box width='100%' mb={3} id='swap-page'>
      {openSettingsModal && (
        <SettingsModal
          open={openSettingsModal}
          onClose={() => setOpenSettingsModal(false)}
        />
      )}
      <SwapPageHeader proMode={isProMode} />
      <SwapDefaultMode
        isTiny={isTiny}
        token1={isV2 ? token1 : token1V3}
        token2={isV2 ? token2 : token2V3}
      />
    </Box>
    // <Box width='100%' mb={3} id='swap-page'>

    //   {!isProMode ? (
    //     <SwapDefaultMode
    //       isTiny={isTiny}
    //       token1={isV2 ? token1 : token1V3}
    //       token2={isV2 ? token2 : token2V3}
    //     />
    //   ) : (
    //     <SwapProMain
    //       pairId={pairId}
    //       pairTokenReversed={pairTokenReversed}
    //       token1={isV2 ? token1 : token1V3}
    //       token2={isV2 ? token2 : token2V3}
    //       transactions={transactions}
    //     />
    //   )}
    // </Box>
  );
};

export default SwapPage;
