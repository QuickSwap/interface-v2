import { Box } from '@material-ui/core';
import { Percent } from '@uniswap/sdk-core';
import { CustomModal, NumericalInput } from 'components';
import { DEFAULT_DEADLINE_FROM_NOW } from 'constants/v3/misc';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useUserTransactionTTL,
  useUserZapSlippageTolerance,
} from 'state/user/hooks';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';

enum SlippageError {
  InvalidInput = 'InvalidInput',
}

enum DeadlineError {
  InvalidInput = 'InvalidInput',
}
const ZapSlippage: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const [
    userSlippageTolerance,
    setUserSlippageTolerance,
  ] = useUserZapSlippageTolerance();

  const [deadline, setDeadline] = useUserTransactionTTL();

  const [slippageInput, setSlippageInput] = useState('');
  const [slippageError, setSlippageError] = useState<SlippageError | false>(
    false,
  );

  const [deadlineInput, setDeadlineInput] = useState('');
  const [deadlineError, setDeadlineError] = useState<DeadlineError | false>(
    false,
  );
  function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }
  const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`); // match escaped "." characters via in a non-capturing group
  const parseSlippageInput = (value: string) => {
    if (value === '' || inputRegex.test(escapeRegExp(value))) {
      setSlippageInput(value);

      try {
        const valueAsIntFromRoundedFloat = Number.parseInt(
          (Number.parseFloat(value) * 100).toString(),
        );
        if (
          !Number.isNaN(valueAsIntFromRoundedFloat) &&
          valueAsIntFromRoundedFloat < 5000
        ) {
          const asd = new Percent(valueAsIntFromRoundedFloat, 10_000);
          setUserSlippageTolerance(
            new Percent(valueAsIntFromRoundedFloat, 10_000),
          );
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  function parseCustomDeadline(value: string) {
    // populate what the user typed and clear the error
    setDeadlineInput(value);
    setDeadlineError(false);

    if (value.length === 0) {
      setDeadline(DEFAULT_DEADLINE_FROM_NOW);
    } else {
      try {
        const parsed: number = Math.floor(Number.parseFloat(value) * 60);
        // Three days in seconds
        if (!Number.isInteger(parsed) || parsed < 60 || parsed > 259200) {
          setDeadlineError(DeadlineError.InvalidInput);
        } else {
          setDeadline(parsed);
        }
      } catch (error) {
        console.error(error);
        setDeadlineError(DeadlineError.InvalidInput);
      }
    }
  }

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      modalWrapper='zapSlippageWrapper'
    >
      <Box p={2}>
        <Box
          className='flex items-center justify-between border-bottom'
          pb={2}
          mb={2}
        >
          <h4>{t('zapSettings')}</h4>
          <CloseIcon className='cursor-pointer' onClick={onClose} />
        </Box>
        <h6>{t('slippageTolerance')}</h6>
        <Box className='flex items-center' my='12px' gridGap={8}>
          <Box
            className={`zapSlippageButton ${
              userSlippageTolerance.toFixed(2) === '0.10'
                ? 'activeZapSlippageButton'
                : ''
            } `}
            onClick={() => {
              setSlippageInput('');
              parseSlippageInput('0.1');
            }}
          >
            <p> 0.1% </p>
          </Box>
          <Box
            className={`zapSlippageButton ${
              userSlippageTolerance.toFixed(2) === '0.50'
                ? 'activeZapSlippageButton'
                : ''
            } `}
            onClick={() => {
              setSlippageInput('');
              parseSlippageInput('0.5');
            }}
          >
            <p> 0.5% </p>
          </Box>
          <Box
            className={`zapSlippageButton ${
              userSlippageTolerance.toFixed(2) === '1.00'
                ? 'activeZapSlippageButton'
                : ''
            } `}
            onClick={() => {
              setSlippageInput('');
              parseSlippageInput('1.0');
            }}
          >
            <p> 1.0% </p>
          </Box>
          <Box
            className={`zapSlippageInput ${
              slippageError ? 'zapSlippageErrorInput' : ''
            }`}
            gridGap={8}
          >
            <NumericalInput
              value={
                slippageInput.length > 0
                  ? slippageInput
                  : userSlippageTolerance.toFixed(2)
              }
              onUserInput={parseSlippageInput}
              onBlur={() => {
                setSlippageInput('');
                setSlippageError(false);
              }}
            />
            <p>%</p>
          </Box>
        </Box>
        <Box className='flex items-center' gridGap={8}>
          <p>{t('txDeadlineMin')}</p>
          <Box
            className={`zapSlippageDeadlineInput ${
              deadlineError ? 'zapSlippageErrorInput' : ''
            }`}
          >
            <NumericalInput
              placeholder={(DEFAULT_DEADLINE_FROM_NOW / 60).toString()}
              value={
                deadlineInput.length > 0
                  ? deadlineInput
                  : deadline === DEFAULT_DEADLINE_FROM_NOW
                  ? ''
                  : (deadline / 60).toString()
              }
              onUserInput={parseCustomDeadline}
              onBlur={() => {
                setDeadlineInput('');
                setDeadlineError(false);
              }}
            />
          </Box>
        </Box>
      </Box>
    </CustomModal>
  );
};

export default ZapSlippage;
