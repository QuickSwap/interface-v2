import { Box, useMediaQuery, useTheme } from '@material-ui/core';
import { HypeLabAds, SettingsModal } from 'components';
import { useActiveWeb3React, useIsProMode } from 'hooks';
import 'pages/styles/swap.scss';
import React, { useState, useEffect } from 'react';
import { useIsV2 } from 'state/application/hooks';
import { Field } from 'state/swap/actions';
import { useDerivedSwapInfo } from 'state/swap/hooks';
import { useDerivedSwapInfo as useDerivedSwapInfoV3 } from 'state/swap/v3/hooks';
import { wrappedCurrency, wrappedCurrencyV3 } from 'utils/wrappedCurrency';
import SwapDefaultMode from './SwapDefaultMode';
import SwapPageHeader from './SwapPageHeader';
import SwapProMain from './SwapProMain';
import { useQuery } from '@tanstack/react-query';
import { LiquidityHubAd } from './LiquidityHubAd';
import { getConfig } from 'config/index';

const SwapPage: React.FC = () => {
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

  const config = getConfig(chainId);
  const showSwap = config['swap']['available'];

  if (!showSwap) {
    location.href = '/';
  }

  useEffect(() => {
    if (!showSwap) {
      location.href = '/';
    }
  }, [showSwap]);

  const getPairId = async () => {
    if (token1 && token2) {
      const res = await fetch(
        `${process.env.REACT_APP_LEADERBOARD_APP_URL}/utils/pair-address/${token1.address}/${token2.address}?chainId=${chainId}`,
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

      {isProMode ? (
        <SwapProMain
          pairId={data?.pairId}
          pairTokenReversed={data?.tokenReversed ?? false}
          token1={isV2 ? token1 : token1V3}
          token2={isV2 ? token2 : token2V3}
        />
      ) : (
        <>
          <Box sx={{ maxWidth: '1536px', margin: '12px auto' }}>
            <SwapDefaultMode
              token1={isV2 ? token1 : token1V3}
              token2={isV2 ? token2 : token2V3}
            />
          </Box>
          <Box mb={1} sx={{ display: { xs: 'block', md: 'none' } }}>
            <LiquidityHubAd />
          </Box>
        </>
      )}

      <Box margin='24px auto'>
        <HypeLabAds />
      </Box>
    </Box>
  );
};

export default SwapPage;
