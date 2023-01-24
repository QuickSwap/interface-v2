import React, { useEffect, useState } from 'react';
import { Box } from 'theme/components';
import { ReactComponent as SettingsIcon } from 'assets/images/SettingsIcon.svg';
import { useIsProMode, useIsV2 } from 'state/application/hooks';
import { Swap, SettingsModal, ToggleSwitch } from 'components';
import { Trans, useTranslation } from 'react-i18next';
import { SwapBestTrade } from 'components/Swap';
import SwapV3Page from './V3/Swap';
import { useHistory, useParams } from 'react-router-dom';
import useParsedQueryString from 'hooks/useParsedQueryString';
import SwapLimitOrder from './SwapLimitOrder';

const SWAP_BEST_TRADE = '0';
const SWAP_NORMAL = '1';
const SWAP_V3 = '2';
const SWAP_LIMIT = '3';

const SwapMain: React.FC = () => {
  const parsedQs = useParsedQueryString();
  const swapType = parsedQs.swapIndex;
  const history = useHistory();
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const { isProMode, updateIsProMode } = useIsProMode();

  const { updateIsV2 } = useIsV2();
  const params: any = useParams();
  const isOnV3 = params ? params.version === 'v3' : false;
  const isOnV2 = params ? params.version === 'v2' : false;

  const { t } = useTranslation();

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
    updateIsV2(!isOnV2 && !isOnV3 ? true : isOnV2);
    if (!swapType) {
      if (!isOnV3 && isOnV2) {
        redirectWithSwapType(SWAP_NORMAL);
      } else {
        redirectWithSwapType(SWAP_BEST_TRADE);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnV3, isOnV2, swapType]);

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
        <Box className='flex' width='100%'>
          <Box
            //TODO: Active class resolution should come from from a func
            className={swapTabClass(SWAP_BEST_TRADE)}
            onClick={() => {
              redirectWithSwapType(SWAP_BEST_TRADE);
            }}
          >
            <p>{t('bestTrade')}</p>
          </Box>
          <Box
            className={swapTabClass(SWAP_NORMAL)}
            onClick={() => {
              redirectWithSwapType(SWAP_NORMAL);
            }}
          >
            <p>{t('market')}</p>
          </Box>
          <Box
            className={swapTabClass(SWAP_V3)}
            onClick={() => {
              redirectWithSwapType(SWAP_V3);
            }}
          >
            <p>{t('marketV3')}</p>
          </Box>
          <Box
            className={swapTabClass(SWAP_LIMIT)}
            onClick={() => {
              redirectWithSwapType(SWAP_LIMIT);
            }}
          >
            <p>{t('limit')}</p>
          </Box>
        </Box>
        {!isProMode && (
          <Box margin='8px 16px 0' className='flex items-center'>
            <Box className='flex items-center' margin='0 8px 0'>
              <span
                className='text-secondary text-uppercase'
                style={{ marginRight: 8 }}
              >
                {t('proMode')}
              </span>
              <ToggleSwitch
                toggled={false}
                onToggle={() => {
                  updateIsProMode(true);
                }}
              />
            </Box>
            <Box className='headingItem'>
              <SettingsIcon onClick={() => setOpenSettingsModal(true)} />
            </Box>
          </Box>
        )}
      </Box>
      <Box padding={isProMode ? '0 24px' : '0'} margin='28px 0 0'>
        {swapType === SWAP_BEST_TRADE && <SwapBestTrade />}
        {swapType === SWAP_NORMAL && <Swap />}
        {swapType === SWAP_V3 && <SwapV3Page />}
        {swapType === SWAP_LIMIT && <SwapLimitOrder />}
      </Box>
    </>
  );
};

export default SwapMain;
