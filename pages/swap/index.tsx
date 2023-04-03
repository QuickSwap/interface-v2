import { Box } from '@mui/material';
import { SettingsModal } from 'components';
import { ChainId } from '@uniswap/sdk';
import { useActiveWeb3React, useIsProMode } from 'hooks';
import React, { useEffect, useState } from 'react';
import { useIsV2 } from 'state/application/hooks';
import { Field } from 'state/swap/actions';
import { useDerivedSwapInfo } from 'state/swap/hooks';
import { useDerivedSwapInfo as useDerivedSwapInfoV3 } from 'state/swap/v3/hooks';
import SwapDefaultMode from 'components/pages/swap/SwapDefaultMode';
import SwapPageHeader from 'components/pages/swap/SwapPageHeader';
import SwapProMain from 'components/pages/swap/SwapProMain';
import { getPairAddress, getPairAddressV3 } from 'utils';
import { wrappedCurrency, wrappedCurrencyV3 } from 'utils/wrappedCurrency';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const SwapPage: React.FC = (
  _props: InferGetStaticPropsType<typeof getStaticProps>,
) => {
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
    <Box width='100%' mb={3} pt='88px'>
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

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

export default SwapPage;
