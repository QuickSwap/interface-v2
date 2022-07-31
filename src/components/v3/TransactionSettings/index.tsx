import { useState } from 'react';
import { Percent } from '@uniswap/sdk-core';
import QuestionHelper from '../../QuestionHelper';
import { TYPE } from 'theme/index';
import { AutoColumn } from '../Column';
import { RowBetween, RowFixed } from '../Row';

import {
  useSetUserSlippageTolerance,
  useUserSlippageTolerance,
  useUserTransactionTTL,
} from 'state/user/v3/hooks';
import { useActiveWeb3React } from 'hooks';
import { Input, Option, OptionCustom, SlippageEmojiContainer } from './styled';
import { DEFAULT_DEADLINE_FROM_NOW } from 'constants/v3/misc';

enum SlippageError {
  InvalidInput = 'InvalidInput',
}

enum DeadlineError {
  InvalidInput = 'InvalidInput',
}

interface TransactionSettingsProps {
  placeholderSlippage: Percent; // varies according to the context in which the settings dialog is placed
}

export default function TransactionSettings({
  placeholderSlippage,
}: TransactionSettingsProps) {
  const { chainId } = useActiveWeb3React();

  const userSlippageTolerance = useUserSlippageTolerance();
  const setUserSlippageTolerance = useSetUserSlippageTolerance();

  const [deadline, setDeadline] = useUserTransactionTTL();

  const [slippageInput, setSlippageInput] = useState('');
  const [slippageError, setSlippageError] = useState<SlippageError | false>(
    false,
  );

  const [deadlineInput, setDeadlineInput] = useState('');
  const [deadlineError, setDeadlineError] = useState<DeadlineError | false>(
    false,
  );

  function parseSlippageInput(value: string) {
    // populate what the user typed and clear the error
    setSlippageInput(value);
    setSlippageError(false);

    if (value.length === 0) {
      setUserSlippageTolerance('auto');
    } else {
      const parsed = Math.floor(Number.parseFloat(value) * 100);

      if (!Number.isInteger(parsed) || parsed < 0 || parsed > 5000) {
        setUserSlippageTolerance('auto');
        if (value !== '.') {
          setSlippageError(SlippageError.InvalidInput);
        }
      } else {
        setUserSlippageTolerance(new Percent(parsed, 10_000));
      }
    }
  }

  const tooLow =
    userSlippageTolerance !== 'auto' &&
    userSlippageTolerance.lessThan(new Percent(5, 10_000));
  const tooHigh =
    userSlippageTolerance !== 'auto' &&
    userSlippageTolerance.greaterThan(new Percent(1, 100));

  function parseCustomDeadline(value: string) {
    // populate what the user typed and clear the error
    setDeadlineInput(value);
    setDeadlineError(false);

    if (value.length === 0) {
      setDeadline(DEFAULT_DEADLINE_FROM_NOW);
    } else {
      try {
        const parsed: number = Math.floor(Number.parseFloat(value) * 60);
        if (!Number.isInteger(parsed) || parsed < 60 || parsed > 180 * 60) {
          setDeadlineError(DeadlineError.InvalidInput);
        } else {
          setDeadline(parsed);
        }
      } catch (error) {
        setDeadlineError(DeadlineError.InvalidInput);
        throw new Error('Transaction Deadline' + error);
      }
    }
  }

  const showCustomDeadlineRow = Boolean(chainId);

  return (
    <AutoColumn gap='md'>
      <AutoColumn gap='sm'>
        <RowFixed>
          <TYPE.black fontWeight={400} fontSize={14} color={'var(--white)'}>
            Slippage tolerance
          </TYPE.black>
          <QuestionHelper
            text={`Your transaction will revert if the price changes unfavorably by
                                more than this percentage.`}
          />
        </RowFixed>
        <RowBetween>
          <Option
            onClick={() => {
              parseSlippageInput('');
            }}
            active={userSlippageTolerance === 'auto'}
          >
            Auto
          </Option>
          <OptionCustom
            active={userSlippageTolerance !== 'auto'}
            warning={!!slippageError}
            tabIndex={-1}
          >
            <div className={'flex-s-between c-p'}>
              {tooLow || tooHigh ? (
                <SlippageEmojiContainer>
                  <span role='img' aria-label='warning'>
                    ⚠️
                  </span>
                </SlippageEmojiContainer>
              ) : null}
              <Input
                placeholder={placeholderSlippage.toFixed(2)}
                value={
                  slippageInput.length > 0
                    ? slippageInput
                    : userSlippageTolerance === 'auto'
                    ? ''
                    : userSlippageTolerance.toFixed(2)
                }
                onChange={(e) => parseSlippageInput(e.target.value)}
                onBlur={() => {
                  setSlippageInput('');
                  setSlippageError(false);
                }}
                color={slippageError ? 'red' : ''}
              />
              %
            </div>
          </OptionCustom>
        </RowBetween>
        {slippageError || tooLow || tooHigh ? (
          <RowBetween
            style={{
              fontSize: '14px',
              paddingTop: '7px',
              color: slippageError ? 'red' : '#F3841E',
            }}
          >
            {slippageError
              ? 'Enter a valid slippage percentage'
              : tooLow
              ? 'Your transaction may fail'
              : 'Your transaction may be frontrun'}
          </RowBetween>
        ) : null}
      </AutoColumn>

      {showCustomDeadlineRow && (
        <AutoColumn gap='sm'>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={'var(--white)'}>
              Transaction deadline
            </TYPE.black>
            <QuestionHelper
              text={`Your transaction will revert if it is pending for more than this period of time.`}
            />
          </RowFixed>
          <RowFixed>
            <OptionCustom
              style={{ width: '80px' }}
              warning={!!deadlineError}
              tabIndex={-1}
            >
              <Input
                placeholder={(DEFAULT_DEADLINE_FROM_NOW / 60).toString()}
                value={
                  deadlineInput.length > 0
                    ? deadlineInput
                    : deadline === DEFAULT_DEADLINE_FROM_NOW
                    ? ''
                    : (deadline / 60).toString()
                }
                onChange={(e) => parseCustomDeadline(e.target.value)}
                onBlur={() => {
                  setDeadlineInput('');
                  setDeadlineError(false);
                }}
                color={deadlineError ? 'red' : ''}
              />
            </OptionCustom>
            <TYPE.body
              style={{ paddingLeft: '8px', color: 'var(--white)' }}
              fontSize={14}
            >
              minutes
            </TYPE.body>
          </RowFixed>
        </AutoColumn>
      )}
    </AutoColumn>
  );
}
