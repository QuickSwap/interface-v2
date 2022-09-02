import React, { useEffect, useState } from 'react';
import { Box } from '@material-ui/core';
import { ReactComponent as SettingsIcon } from 'assets/images/SettingsIcon.svg';
import { useIsProMode, useIsV3 } from 'state/application/hooks';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { useCurrency } from 'hooks/Tokens';
import { Swap, SettingsModal, ToggleSwitch } from 'components';
import {
  GelatoLimitOrderPanel,
  GelatoLimitOrdersHistoryPanel,
} from '@gelatonetwork/limit-orders-react';
import { Trans, useTranslation } from 'react-i18next';
import { SwapBestTrade } from 'components/Swap';
import SwapV3Page from './V3/Swap';
import { useHistory, useParams } from 'react-router-dom';

const SWAP_BEST_TRADE = 0;
const SWAP_NORMAL = 1;
const SWAP_V3 = 2;
const SWAP_LIMIT = 3;

const SwapMain: React.FC = () => {
  const [swapIndex, setSwapIndex] = useState(SWAP_BEST_TRADE);
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const { isProMode, updateIsProMode } = useIsProMode();

  const { isV3, updateIsV3 } = useIsV3();
  const params: any = useParams();
  const history = useHistory();
  const isOnV3 = params ? params.version === 'v3' : false;
  const parsedQuery = useParsedQueryString();
  const currency0 = useCurrency(
    parsedQuery && (parsedQuery.currency0 || parsedQuery.inputCurrency)
      ? ((parsedQuery.currency0 ?? parsedQuery.inputCurrency) as string)
      : undefined,
  );
  const currency1 = useCurrency(
    parsedQuery && (parsedQuery.currency1 || parsedQuery.outputCurrency)
      ? ((parsedQuery.currency1 ?? parsedQuery.outputCurrency) as string)
      : undefined,
  );
  const { t } = useTranslation();

  useEffect(() => {
    updateIsV3(isOnV3);
    if (isOnV3) {
      setSwapIndex(SWAP_V3);
    }
  }, [isOnV3]);

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
          <Box
            //TODO: Active class resolution should come from from a func
            className={`${
              swapIndex === SWAP_BEST_TRADE ? 'activeSwap' : ''
            } swapItem headingItem
            `}
            onClick={() => {
              history.push('/swap');
              setSwapIndex(SWAP_BEST_TRADE);
            }}
          >
            <p>{t('bestTrade')}</p>
          </Box>
          <Box
            className={`${
              swapIndex === SWAP_NORMAL ? 'activeSwap' : ''
            } swapItem headingItem
            `}
            onClick={() => {
              history.push('/swap');
              setSwapIndex(SWAP_NORMAL);
            }}
          >
            <p>{t('market')}</p>
          </Box>
          <Box
            className={`${
              swapIndex === SWAP_V3 ? 'activeSwap' : ''
            } swapItem headingItem
            `}
            onClick={() => history.push('/swap/v3')}
          >
            <p>{t('marketV3')}</p>
          </Box>
          <Box
            className={`${
              swapIndex === SWAP_LIMIT ? 'activeSwap' : ''
            } swapItem headingItem ${isProMode ? 'border-right' : ''}`}
            onClick={() => {
              history.push('/swap');
              setSwapIndex(SWAP_LIMIT);
            }}
          >
            <p>{t('limit')}</p>
          </Box>
        </Box>
        <Box my={1} className='flex items-center'>
          {!isProMode && (
            <Box className='flex items-center' mr={1}>
              <span
                className='text-secondary text-uppercase'
                style={{ marginRight: 8 }}
              >
                {t('proMode')}
              </span>
              <ToggleSwitch
                toggled={isProMode}
                onToggle={() => updateIsProMode(!isProMode)}
              />
            </Box>
          )}
          <Box className='headingItem' marginRight={isProMode ? 2.5 : 0}>
            <SettingsIcon onClick={() => setOpenSettingsModal(true)} />
          </Box>
        </Box>
      </Box>
      <Box padding={isProMode ? '0 24px' : '0'} mt={3.5}>
        {swapIndex === SWAP_BEST_TRADE && (
          <SwapBestTrade
            currency0={currency0 ?? undefined}
            currency1={currency1 ?? undefined}
          />
        )}
        {swapIndex === SWAP_NORMAL && (
          <Swap
            currency0={currency0 ?? undefined}
            currency1={currency1 ?? undefined}
          />
        )}
        {swapIndex === SWAP_V3 && <SwapV3Page></SwapV3Page>}
        {swapIndex === SWAP_LIMIT && (
          <Box className='limitOrderPanel'>
            <GelatoLimitOrderPanel />
            <GelatoLimitOrdersHistoryPanel />
            <Box mt={2} textAlign='center'>
              <small>
                <Trans
                  i18nKey='limitOrderDisclaimer'
                  components={{
                    bold: <b />,
                    alink: (
                      <a
                        target='_blank'
                        rel='noopener noreferrer'
                        href='https://www.certik.org/projects/gelato'
                      />
                    ),
                  }}
                />
              </small>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};

export default SwapMain;
