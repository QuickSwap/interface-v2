import { Box } from '@material-ui/core';
import { ChainId } from '@uniswap/sdk';
import { SettingsModal } from 'components';

import { useActiveWeb3React, useIsProMode } from 'hooks';
import 'pages/styles/swap.scss';
import React, { useEffect, useState } from 'react';
import { useIsV2 } from 'state/application/hooks';
import { Field } from 'state/swap/actions';
import { useDerivedSwapInfo } from 'state/swap/hooks';
import { useDerivedSwapInfo as useDerivedSwapInfoV3 } from 'state/swap/v3/hooks';
import { getPairAddress } from 'utils';
import { wrappedCurrency, wrappedCurrencyV3 } from 'utils/wrappedCurrency';
import SwapDefaultMode from './SwapDefaultMode';
import SwapPageHeader from './SwapPageHeader';
import SwapProMain from './SwapProMain';

const SwapPage: React.FC = () => {
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const { isV2 } = useIsV2();
  const isProMode = useIsProMode();
  const [pairId, setPairId] = useState<string | undefined>(undefined);
  const [pairTokenReversed, setPairTokenReversed] = useState(false);

  const { currencies } = useDerivedSwapInfo();
  const { currencies: currenciesV3 } = useDerivedSwapInfoV3();
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const token1 = wrappedCurrency(currencies[Field.INPUT], chainIdToUse);
  const token2 = wrappedCurrency(currencies[Field.OUTPUT], chainIdToUse);

  const token1V3 = wrappedCurrencyV3(currenciesV3[Field.INPUT], chainIdToUse);
  const token2V3 = wrappedCurrencyV3(currenciesV3[Field.OUTPUT], chainIdToUse);

  useEffect(() => {
    async function getPairId(token1Address: string, token2Address: string) {
      const pairData = await getPairAddress(
        token1Address,
        token2Address,
        chainIdToUse,
      );
      if (pairData) {
        setPairTokenReversed(pairData.tokenReversed);
        setPairId(pairData.pairId);
      }
    }
    if (token1?.address && token2?.address) {
      getPairId(token1?.address, token2?.address);
    }
  }, [chainIdToUse, token1?.address, token2?.address]);

  return (
    <Box width='100%' mb={3} id='swap-page'>
      {openSettingsModal && (
        <SettingsModal
          open={openSettingsModal}
          onClose={() => setOpenSettingsModal(false)}
        />
      )}
      <SwapPageHeader proMode={isProMode} />
      {isProMode ? (
        <SwapProMain
          pairId={pairId}
          pairTokenReversed={pairTokenReversed}
          token1={isV2 ? token1 : token1V3}
          token2={isV2 ? token2 : token2V3}
        />
      ) : (
        <SwapDefaultMode
          token1={isV2 ? token1 : token1V3}
          token2={isV2 ? token2 : token2V3}
        />
      )}
    </Box>
  );
};

export default SwapPage;
