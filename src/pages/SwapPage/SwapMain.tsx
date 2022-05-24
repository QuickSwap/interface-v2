import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { ReactComponent as SettingsIcon } from 'assets/images/SettingsIcon.svg';
import { useIsProMode } from 'state/application/hooks';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { useCurrency } from 'hooks/Tokens';
import { Swap, SettingsModal, ToggleSwitch } from 'components';
import {
  GelatoLimitOrderPanel,
  GelatoLimitOrdersHistoryPanel,
} from '@gelatonetwork/limit-orders-react';

const SWAP_NORMAL = 0;
const SWAP_LIMIT = 1;

const SwapMain: React.FC = () => {
  const [swapIndex, setSwapIndex] = useState(SWAP_NORMAL);
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const { isProMode, updateIsProMode } = useIsProMode();

  const parsedQuery = useParsedQueryString();
  const currency0 = useCurrency(
    parsedQuery && parsedQuery.currency0
      ? (parsedQuery.currency0 as string)
      : undefined,
  );
  const currency1 = useCurrency(
    parsedQuery && parsedQuery.currency1
      ? (parsedQuery.currency1 as string)
      : undefined,
  );

  return (
    <>
      {openSettingsModal && (
        <SettingsModal
          open={openSettingsModal}
          onClose={() => setOpenSettingsModal(false)}
        />
      )}
      <Box
        className={`flex items-center justify-between ${
          isProMode ? ' proModeWrapper' : ''
        }`}
      >
        <Box display='flex'>
          <Box
            className={`${
              swapIndex === SWAP_NORMAL ? 'activeSwap' : ''
            } swapItem headingItem
            `}
            onClick={() => setSwapIndex(SWAP_NORMAL)}
          >
            <p>Market</p>
          </Box>
          <Box
            className={`${
              swapIndex === SWAP_LIMIT ? 'activeSwap' : ''
            } swapItem headingItem ${isProMode ? 'border-right' : ''}`}
            onClick={() => setSwapIndex(SWAP_LIMIT)}
          >
            <p>Limit</p>
          </Box>
        </Box>
        <Box className='flex items-center'>
          {!isProMode && (
            <Box className='flex items-center' mr={1}>
              <span className='text-secondary' style={{ marginRight: 8 }}>
                PRO MODE
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
        {swapIndex === SWAP_NORMAL && (
          <Swap
            currency0={currency0 ?? undefined}
            currency1={currency1 ?? undefined}
          />
        )}
        {swapIndex === SWAP_LIMIT && (
          <>
            <GelatoLimitOrderPanel />
            <GelatoLimitOrdersHistoryPanel />
            <Box mt={2} textAlign='center'>
              <small>
                <b>* Disclaimer:</b> Limit Orders on QuickSwap are provided by
                Gelato, a 3rd party protocol and should be considered in beta.
                DYOR and use at your own risk. QuickSwap is not responsible.
                More info can be found&nbsp;
                <a
                  target='_blank'
                  rel='noopener noreferrer'
                  href='https://www.certik.org/projects/gelato'
                >
                  here.
                </a>
              </small>
            </Box>
          </>
        )}
      </Box>
    </>
  );
};

export default SwapMain;
