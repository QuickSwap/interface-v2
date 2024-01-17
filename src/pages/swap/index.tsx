import { Box, useTheme, useMediaQuery } from '@mui/material';
import { HypeLabAds, SettingsModal } from 'components';
import { useActiveWeb3React, useIsProMode } from 'hooks';
import React, { useState } from 'react';
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
import { useQuery } from '@tanstack/react-query';
import { LiquidityHubAd } from 'components/pages/swap/LiquidityHubAd';

const SwapPage = (_props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const { isV2 } = useIsV2();
  const isProMode = useIsProMode();

  const { currencies } = useDerivedSwapInfo();
  const { currencies: currenciesV3 } = useDerivedSwapInfoV3();
  const { chainId } = useActiveWeb3React();
  const token1 = wrappedCurrency(currencies[Field.INPUT], chainId);
  const token2 = wrappedCurrency(currencies[Field.OUTPUT], chainId);

  const { breakpoints } = useTheme();
  const isTablet = useMediaQuery(breakpoints.down('sm'));
  const token1V3 = wrappedCurrencyV3(currenciesV3[Field.INPUT], chainId);
  const token2V3 = wrappedCurrencyV3(currenciesV3[Field.OUTPUT], chainId);

  const getPairId = async () => {
    if (token1 && token2) {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_LEADERBOARD_APP_URL}/utils/pair-address/${token1.address}/${token2.address}?chainId=${chainId}`,
      );
      if (!res.ok) {
        return null;
      }
      const data = await res.json();

      if (data && data.data) {
        return {
          tokenReversed: isV2
            ? data.data.v2
              ? data.data.v2.tokenReversed
              : false
            : data.data.v3
            ? data.data.v3.tokenReversed
            : false,
          pairId: { v2: data.data.v2?.pairId, v3: data.data.v3?.pairId },
        };
      }
    }
    return null;
  };

  const { data } = useQuery({
    queryKey: ['fetchPairId', token1?.address, token2?.address, chainId],
    queryFn: getPairId,
  });

  return (
    <Box width='100%' mb={3} id='swap-page'>
      {openSettingsModal && (
        <SettingsModal
          open={openSettingsModal}
          onClose={() => setOpenSettingsModal(false)}
        />
      )}

      <SwapPageHeader proMode={isProMode} isTablet={isTablet} />
      <Box margin='24px auto'>
        <HypeLabAds />
      </Box>

      {isProMode ? (
        <SwapProMain
          pairId={data?.pairId}
          pairTokenReversed={data?.tokenReversed ?? false}
          token1={isV2 ? token1 : token1V3}
          token2={isV2 ? token2 : token2V3}
        />
      ) : (
        <>
          <Box mb={1} sx={{ display: { xs: 'block', md: 'none' } }}>
            <LiquidityHubAd />
          </Box>

          <SwapDefaultMode
            token1={isV2 ? token1 : token1V3}
            token2={isV2 ? token2 : token2V3}
          />
        </>
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
