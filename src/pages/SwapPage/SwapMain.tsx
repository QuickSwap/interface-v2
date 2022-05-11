import React, { useState } from 'react';
import { Box, Typography } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
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
  const { palette } = useTheme();
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
        display='flex'
        alignItems='center'
        justifyContent='space-between'
        className={isProMode ? 'proModeWrapper' : ''}
      >
        <Box display='flex'>
          <Box
            className={`${swapIndex === SWAP_NORMAL &&
              'activeSwap'} swapItem headingItem
            `}
            onClick={() => setSwapIndex(SWAP_NORMAL)}
          >
            <Typography variant='body1'>Market</Typography>
          </Box>
          <Box
            className={`${swapIndex === SWAP_LIMIT &&
              'activeSwap'} swapItem headingItem`}
            borderRight={isProMode ? `1px solid ${palette.divider}` : ''}
            onClick={() => setSwapIndex(SWAP_LIMIT)}
          >
            <Typography variant='body1'>Limit</Typography>
          </Box>
        </Box>
        <Box display='flex' alignItems='center'>
          {!isProMode && (
            <Box display='flex' alignItems='center' mr={1}>
              <Typography
                variant='caption'
                style={{ color: palette.text.secondary, marginRight: 8 }}
              >
                PRO MODE
              </Typography>
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
              <Typography variant='body2'>
                <b>* Disclaimer:</b> Limit Orders on QuickSwap are provided by
                Gelato, a 3rd party protocol and should be considered in beta.
                DYOR and use at your own risk. QuickSwap is not responsible.
                More info can be found&nbsp;
                <a
                  style={{ color: palette.text.primary }}
                  target='_blank'
                  rel='noopener noreferrer'
                  href='https://www.certik.org/projects/gelato'
                >
                  here.
                </a>
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </>
  );
};

export default SwapMain;
