import React, { useState, useMemo } from 'react';
import { Box, Divider } from '@material-ui/core';
import { KeyboardArrowDown } from '@material-ui/icons';
import { AlertTriangle } from 'react-feather';
import { useTheme } from '@material-ui/core/styles';
import {
  CustomModal,
  NumericalInput,
  QuestionHelper,
  ToggleSwitch,
} from 'components';
import cx from 'classnames';
import { useSwapActionHandlers } from 'state/swap/hooks';
import {
  useExpertModeManager,
  useUserTransactionTTL,
  useUserSlippageTolerance,
} from 'state/user/hooks';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import 'components/styles/SettingsModal.scss';

enum SlippageError {
  InvalidInput = 'InvalidInput',
  RiskyLow = 'RiskyLow',
  RiskyHigh = 'RiskyHigh',
}

enum DeadlineError {
  InvalidInput = 'InvalidInput',
}

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose }) => {
  const { palette } = useTheme();
  const [
    userSlippageTolerance,
    setUserslippageTolerance,
  ] = useUserSlippageTolerance();
  const [ttl, setTtl] = useUserTransactionTTL();
  const { onChangeRecipient } = useSwapActionHandlers();
  const [expertMode, toggleExpertMode] = useExpertModeManager();
  const [slippageInput, setSlippageInput] = useState('');
  const [deadlineInput, setDeadlineInput] = useState('');
  const [expertConfirm, setExpertConfirm] = useState(false);
  const [expertConfirmText, setExpertConfirmText] = useState('');

  const slippageInputIsValid =
    slippageInput === '' ||
    (userSlippageTolerance / 100).toFixed(2) ===
      Number.parseFloat(slippageInput).toFixed(2);
  const deadlineInputIsValid =
    deadlineInput === '' || (ttl / 60).toString() === deadlineInput;

  const slippageError = useMemo(() => {
    if (slippageInput !== '' && !slippageInputIsValid) {
      return SlippageError.InvalidInput;
    } else if (slippageInputIsValid && userSlippageTolerance < 50) {
      return SlippageError.RiskyLow;
    } else if (slippageInputIsValid && userSlippageTolerance > 500) {
      return SlippageError.RiskyHigh;
    } else {
      return undefined;
    }
  }, [slippageInput, userSlippageTolerance, slippageInputIsValid]);

  const slippageAlert =
    !!slippageInput &&
    (slippageError === SlippageError.RiskyLow ||
      slippageError === SlippageError.RiskyHigh);

  const deadlineError = useMemo(() => {
    if (deadlineInput !== '' && !deadlineInputIsValid) {
      return DeadlineError.InvalidInput;
    } else {
      return undefined;
    }
  }, [deadlineInput, deadlineInputIsValid]);

  const parseCustomSlippage = (value: string) => {
    setSlippageInput(value);

    try {
      const valueAsIntFromRoundedFloat = Number.parseInt(
        (Number.parseFloat(value) * 100).toString(),
      );
      if (
        !Number.isNaN(valueAsIntFromRoundedFloat) &&
        valueAsIntFromRoundedFloat < 5000
      ) {
        setUserslippageTolerance(valueAsIntFromRoundedFloat);
      }
    } catch {}
  };

  const parseCustomDeadline = (value: string) => {
    setDeadlineInput(value);

    try {
      const valueAsInt: number = Number.parseInt(value) * 60;
      if (!Number.isNaN(valueAsInt) && valueAsInt > 0) {
        setTtl(valueAsInt);
      }
    } catch {}
  };

  return (
    <CustomModal open={open} onClose={onClose}>
      <CustomModal open={expertConfirm} onClose={() => setExpertConfirm(false)}>
        <Box paddingX={3} paddingY={4}>
          <Box
            mb={3}
            display='flex'
            justifyContent='space-between'
            alignItems='center'
          >
            <h5>Are you sure?</h5>
            <CloseIcon
              style={{ cursor: 'pointer' }}
              onClick={() => setExpertConfirm(false)}
            />
          </Box>
          <Divider />
          <Box mt={2.5} mb={1.5}>
            <p>
              Expert mode turns off the confirm transaction prompt and allows
              high slippage trades that often result in bad rates and lost
              funds.
            </p>
            <Box mt={3}>
              <p className='text-bold'>
                ONLY USE THIS MODE IF YOU KNOW WHAT YOU ARE DOING.
              </p>
            </Box>
            <Box mt={3}>
              <p className='text-bold'>
                Please type the word &quot;confirm&quot; to enable expert mode.
              </p>
            </Box>
          </Box>
          <Box
            height={40}
            borderRadius={10}
            mb={2.5}
            px={2}
            display='flex'
            alignItems='center'
            bgcolor={palette.background.default}
            border={`1px solid ${palette.secondary.light}`}
          >
            <input
              style={{ textAlign: 'left' }}
              className='settingsInput'
              value={expertConfirmText}
              onChange={(e: any) => setExpertConfirmText(e.target.value)}
            />
          </Box>
          <Box
            style={{
              cursor: 'pointer',
              opacity: expertConfirmText === 'confirm' ? 1 : 0.6,
            }}
            bgcolor='rgb(255, 104, 113)'
            height={42}
            borderRadius={10}
            display='flex'
            alignItems='center'
            justifyContent='center'
            onClick={() => {
              if (expertConfirmText === 'confirm') {
                toggleExpertMode();
                setExpertConfirm(false);
              }
            }}
          >
            <p className='weight-600'>Turn on Expert Mode</p>
          </Box>
        </Box>
      </CustomModal>
      <Box paddingX={3} paddingY={4}>
        <Box
          mb={3}
          display='flex'
          justifyContent='space-between'
          alignItems='center'
        >
          <h5>Settings</h5>
          <CloseIcon onClick={onClose} />
        </Box>
        <Divider />
        <Box my={2.5} display='flex' alignItems='center'>
          <Box mr='6px'>
            <p>Slippage Tolerance</p>
          </Box>
          <QuestionHelper
            size={20}
            text='Your transaction will revert if the price changes unfavorably by more than this percentage.'
          />
        </Box>
        <Box mb={2.5}>
          <Box display='flex' alignItems='center'>
            <Box
              className={`slippageButton${
                userSlippageTolerance === 10 ? ' activeSlippageButton' : ''
              }`}
              onClick={() => {
                setSlippageInput('');
                setUserslippageTolerance(10);
              }}
            >
              <small>0.1%</small>
            </Box>
            <Box
              className={`slippageButton${
                userSlippageTolerance === 50 ? ' activeSlippageButton' : ''
              }`}
              onClick={() => {
                setSlippageInput('');
                setUserslippageTolerance(50);
              }}
            >
              <small>0.5%</small>
            </Box>
            <Box
              className={`slippageButton${
                userSlippageTolerance === 100 ? ' activeSlippageButton' : ''
              }`}
              onClick={() => {
                setSlippageInput('');
                setUserslippageTolerance(100);
              }}
            >
              <small>1%</small>
            </Box>
            <Box
              flex={1}
              height={40}
              borderRadius={10}
              px={2}
              display='flex'
              alignItems='center'
              bgcolor={palette.background.default}
              border={`1px solid
                ${
                  slippageAlert ? palette.primary.main : palette.secondary.light
                }
              `}
            >
              {slippageAlert && <AlertTriangle color='#ffa000' size={16} />}
              <NumericalInput
                placeholder={(userSlippageTolerance / 100).toFixed(2)}
                value={slippageInput}
                fontSize={14}
                fontWeight={500}
                align='right'
                color='rgba(212, 229, 255, 0.8)'
                onBlur={() => {
                  parseCustomSlippage((userSlippageTolerance / 100).toFixed(2));
                }}
                onUserInput={(value) => parseCustomSlippage(value)}
              />
              <small>%</small>
            </Box>
          </Box>
          {slippageError && (
            <Box mt={1.5}>
              <small className='text-yellow3'>
                {slippageError === SlippageError.InvalidInput
                  ? 'Enter a valid slippage percentage'
                  : slippageError === SlippageError.RiskyLow
                  ? 'Your transaction may fail'
                  : 'Your transaction may be frontrun'}
              </small>
            </Box>
          )}
        </Box>
        <Divider />
        <Box my={2.5} display='flex' alignItems='center'>
          <Box mr='6px'>
            <p>Transaction Deadline</p>
          </Box>
          <QuestionHelper
            size={20}
            text='Your transaction will revert if it is pending for more than this long.'
          />
        </Box>
        <Box mb={2.5} display='flex' alignItems='center'>
          <Box
            height={40}
            borderRadius={10}
            px={2}
            display='flex'
            alignItems='center'
            bgcolor={palette.background.default}
            border={`1px solid ${palette.secondary.light}`}
            maxWidth={168}
          >
            <NumericalInput
              placeholder={(ttl / 60).toString()}
              value={deadlineInput}
              fontSize={14}
              fontWeight={500}
              color='rgba(212, 229, 255, 0.8)'
              onBlur={() => {
                parseCustomDeadline((ttl / 60).toString());
              }}
              onUserInput={(value) => parseCustomDeadline(value)}
            />
          </Box>
          <Box ml={1}>
            <small>minutes</small>
          </Box>
        </Box>
        {deadlineError && (
          <Box mt={1.5}>
            <small className='text-yellow3'>Enter a valid deadline</small>
          </Box>
        )}
        <Divider />
        <Box
          my={2.5}
          display='flex'
          justifyContent='space-between'
          alignItems='center'
        >
          <Box display='flex' alignItems='center'>
            <p style={{ marginRight: 6 }}>Expert Mode</p>
            <QuestionHelper
              size={20}
              text='Bypasses confirmation modals and allows high slippage trades. Use at your own risk.'
            />
          </Box>
          <ToggleSwitch
            toggled={expertMode}
            onToggle={() => {
              if (expertMode) {
                toggleExpertMode();
                onChangeRecipient(null);
              } else {
                setExpertConfirm(true);
              }
            }}
          />
        </Box>
        <Divider />
        <Box
          mt={2.5}
          display='flex'
          justifyContent='space-between'
          alignItems='center'
        >
          <p>Language</p>
          <Box display='flex' alignItems='center'>
            <p>English (default)</p>
            <KeyboardArrowDown />
          </Box>
        </Box>
      </Box>
    </CustomModal>
  );
};

export default SettingsModal;
