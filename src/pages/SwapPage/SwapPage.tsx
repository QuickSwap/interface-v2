import { Box, useMediaQuery, useTheme } from '@material-ui/core';
import { ChainId } from '@uniswap/sdk';
import { SettingsModal } from 'components';
import AdsSlider from 'components/AdsSlider';
import { useActiveWeb3React, useIsProMode } from 'hooks';
import 'pages/styles/swap.scss';
import React, { useEffect, useState } from 'react';
import { useIsV2 } from 'state/application/hooks';
import { Field } from 'state/swap/actions';
import { useDerivedSwapInfo } from 'state/swap/hooks';
import { useDerivedSwapInfo as useDerivedSwapInfoV3 } from 'state/swap/v3/hooks';
import { getPairAddress, getPairAddressV3 } from 'utils';
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

  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const token1V3 = wrappedCurrencyV3(currenciesV3[Field.INPUT], chainIdToUse);
  const token2V3 = wrappedCurrencyV3(currenciesV3[Field.OUTPUT], chainIdToUse);

  useEffect(() => {
    const token1Address = isV2 ? token1?.address : token1V3?.address;
    const token2Address = isV2 ? token2?.address : token2V3?.address;
    async function getPairId(token1Address: string, token2Address: string) {
      let pairData;
      if (isV2) {
        pairData = await getPairAddress(
          token1Address,
          token2Address,
          chainIdToUse,
        );
      } else {
        pairData = await getPairAddressV3(
          token1Address,
          token2Address,
          chainIdToUse,
        );
      }
      if (pairData) {
        setPairTokenReversed(pairData.tokenReversed);
        setPairId(pairData.pairId);
      }
    }
    if (token1Address && token2Address) {
      getPairId(token1Address, token2Address);
    }
  }, [
    chainIdToUse,
    isV2,
    token1?.address,
    token2?.address,
    token1V3?.address,
    token2V3?.address,
  ]);

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
      <Box maxWidth={isMobile ? '320px' : '1136px'} margin='24px auto 0'>
        <AdsSlider sort='analytics' />
      </Box>
      <Box className='flex justify-center' margin='16px auto 24px'>
        {isMobile ? (
          <div
            className='_0cbf1c3d417e250a'
            data-placement='0d0cfcd486a34feaa39ee2bf22c383ce'
            style={{
              width: 320,
              height: 50,
              display: 'inline-block',
              margin: '0 auto',
            }}
          />
        ) : (
          <div
            className='_0cbf1c3d417e250a'
            data-placement='b694dc6256a744bdb31467ccec38def3'
            style={{
              width: 970,
              height: 90,
              display: 'inline-block',
              margin: '0 auto',
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default SwapPage;
