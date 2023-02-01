import React, { useEffect, useState } from 'react';
import { Box } from '@material-ui/core';
import { ReactComponent as SettingsIcon } from 'assets/images/SettingsIcon.svg';
import { useIsV2 } from 'state/application/hooks';
import { Swap, SettingsModal, ToggleSwitch } from 'components';
import { useTranslation } from 'react-i18next';
import { SwapBestTrade } from 'components/Swap';
import SwapV3Page from './V3/Swap';
import { getConfig } from '../../config/index';
import { useActiveWeb3React } from 'hooks';
import { useHistory } from 'react-router-dom';
import useParsedQueryString from 'hooks/useParsedQueryString';
import useSwapRedirects from 'hooks/useSwapRedirect';
import SwapLimitOrder from './SwapLimitOrder';

const SWAP_BEST_TRADE = '0';
const SWAP_NORMAL = '1';
const SWAP_V3 = '2';
const SWAP_LIMIT = '3';

const SwapMain: React.FC = () => {
  const parsedQs = useParsedQueryString();
  const swapType = parsedQs.swapIndex;
  const isProMode = Boolean(
    parsedQs.isProMode && parsedQs.isProMode === 'true',
  );
  const history = useHistory();
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const { chainId } = useActiveWeb3React();

  const { redirectWithProMode } = useSwapRedirects();
  const { updateIsV2 } = useIsV2();

  const { t } = useTranslation();
  const config = getConfig(chainId);
  const v2 = config['v2'];
  const v3 = config['v3'];
  const showBestTrade = config['swap']['bestTrade'];
  const showProMode = config['swap']['proMode'];
  const showLimitOrder = config['swap']['limitOrder'];

  const redirectWithSwapType = (swapTypeTo: string) => {
    const currentPath = history.location.pathname + history.location.search;
    let redirectPath = '';
    if (swapType) {
      redirectPath = currentPath.replace(
        `swapIndex=${swapType}`,
        `swapIndex=${swapTypeTo}`,
      );
    } else {
      redirectPath = `${currentPath}${
        Object.values(parsedQs).length > 0 ? '&' : '?'
      }swapIndex=${swapTypeTo}`;
    }
    history.push(redirectPath);
  };

  const swapTabClass = (currentSwapType: string) => {
    return `${
      swapType === currentSwapType ? 'activeSwap' : ''
    } swapItem headingItem
    `;
  };

  useEffect(() => {
    if (
      !swapType ||
      (swapType === SWAP_BEST_TRADE && !showBestTrade) ||
      (swapType === SWAP_NORMAL && !v2) ||
      (swapType === SWAP_V3 && !v3) ||
      (swapType === SWAP_LIMIT && !showLimitOrder)
    ) {
      const availableSwapTypes = [
        SWAP_BEST_TRADE,
        SWAP_NORMAL,
        SWAP_V3,
        SWAP_LIMIT,
      ].filter((sType) =>
        sType === SWAP_BEST_TRADE
          ? showBestTrade
          : sType === SWAP_NORMAL
          ? v2
          : sType === SWAP_V3
          ? v3
          : showLimitOrder,
      );
      if (availableSwapTypes.length > 0) {
        const aSwapType = availableSwapTypes[0];
        if (aSwapType === SWAP_V3) {
          updateIsV2(false);
        } else {
          updateIsV2(true);
        }
        redirectWithSwapType(availableSwapTypes[0]);
      } else {
        history.push('/');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapType, v2, v3, showBestTrade, showLimitOrder]);

  useEffect(() => {
    if (swapType) {
      if (swapType === SWAP_V3) {
        updateIsV2(false);
      } else {
        updateIsV2(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapType]);

  return (
    <>
      {openSettingsModal && (
        <SettingsModal
          open={openSettingsModal}
          onClose={() => setOpenSettingsModal(false)}
        />
      )}
      <Box
        className={`flex flex-wrap items-center justify-between ${
          isProMode ? ' proModeWrapper' : ''
        }`}
      >
        <Box display='flex'>
          {showBestTrade && (
            <Box
              className={swapTabClass(SWAP_BEST_TRADE)}
              onClick={() => {
                redirectWithSwapType(SWAP_BEST_TRADE);
              }}
            >
              <p>{t('bestTrade')}</p>
            </Box>
          )}
          {v2 && (
            <Box
              className={swapTabClass(SWAP_NORMAL)}
              onClick={() => {
                redirectWithSwapType(SWAP_NORMAL);
              }}
            >
              <p>{t('market')}</p>
            </Box>
          )}
          {v3 && (
            <Box
              className={swapTabClass(SWAP_V3)}
              onClick={() => {
                redirectWithSwapType(SWAP_V3);
              }}
            >
              <p>{t('marketV3')}</p>
            </Box>
          )}
          {showLimitOrder && (
            <Box
              className={swapTabClass(SWAP_LIMIT)}
              onClick={() => {
                redirectWithSwapType(SWAP_LIMIT);
              }}
            >
              <p>{t('limit')}</p>
            </Box>
          )}
        </Box>
        <Box margin='8px 16px 0' className='flex items-center'>
          {!isProMode && showProMode && (
            <Box className='flex items-center' mr={1}>
              <span
                className='text-secondary text-uppercase'
                style={{ marginRight: 8 }}
              >
                {t('proMode')}
              </span>
              <ToggleSwitch
                toggled={false}
                onToggle={() => {
                  redirectWithProMode(true);
                }}
              />
            </Box>
          )}
          <Box className='headingItem'>
            <SettingsIcon onClick={() => setOpenSettingsModal(true)} />
          </Box>
        </Box>
      </Box>
      <Box padding={isProMode ? '0 24px' : '0'} mt={3.5}>
        {swapType === SWAP_BEST_TRADE && showBestTrade && <SwapBestTrade />}
        {swapType === SWAP_NORMAL && v2 && <Swap />}
        {swapType === SWAP_V3 && v3 && <SwapV3Page />}
        {swapType === SWAP_LIMIT && showLimitOrder && <SwapLimitOrder />}
      </Box>
    </>
  );
};

export default SwapMain;
