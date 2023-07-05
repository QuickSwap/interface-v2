import { Box, useTheme, useMediaQuery } from '@mui/material';
import { ChainId } from '@uniswap/sdk';
import { Adshares, SettingsModal } from 'components';
import { useActiveWeb3React, useIsProMode } from 'hooks';
import React, { useEffect, useState } from 'react';
import { useIsV2 } from 'state/application/hooks';
import { Field } from 'state/swap/actions';
import { useDerivedSwapInfo } from 'state/swap/hooks';
import { useDerivedSwapInfo as useDerivedSwapInfoV3 } from 'state/swap/v3/hooks';
import SwapDefaultMode from 'components/pages/swap/SwapDefaultMode';
import SwapPageHeader from 'components/pages/swap/SwapPageHeader';
import SwapProMain from 'components/pages/swap/SwapProMain';
import { wrappedCurrency, wrappedCurrencyV3 } from 'utils/wrappedCurrency';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const SwapPage = (_props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const { isV2 } = useIsV2();
  const isProMode = useIsProMode();
  const [pairId, setPairId] = useState<
    { v2: string | undefined; v3: string | undefined } | undefined
  >(undefined);
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
    async function getPairId(token1Address: string, token2Address: string) {
      const res = await fetch(
        `${process.env.REACT_APP_LEADERBOARD_APP_URL}/utils/pair-address/${token1Address}/${token2Address}?chainId=${chainIdToUse}`,
      );
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          errorText || res.statusText || `Failed to get top token details`,
        );
      }
      const data = await res.json();

      if (data && data.data) {
        setPairTokenReversed(
          isV2
            ? data.data.v2
              ? data.data.v2.tokenReversed
              : false
            : data.data.v3
            ? data.data.v3.tokenReversed
            : false,
        );

        setPairId({ v2: data.data.v2?.pairId, v3: data.data.v3?.pairId });
      }
    }
    if (token1?.address && token2?.address) {
      getPairId(token1?.address, token2?.address);
    }
  }, [chainIdToUse, isV2, token1?.address, token2?.address]);

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
      <Box maxWidth={isMobile ? '320px' : '1136px'} margin='24px auto'>
        <Adshares />
      </Box>
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
