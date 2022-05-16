import React, { useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { TokenAmount } from '@uniswap/sdk';
import { TransactionResponse } from '@ethersproject/providers';
import { CustomModal, ColoredSlider, NumericalInput } from 'components';
import { useDerivedSyrupInfo } from 'state/stake/hooks';
import { SyrupInfo } from 'types';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import { useTokenBalance } from 'state/wallet/hooks';
import { useActiveWeb3React } from 'hooks';
import { useApproveCallback, ApprovalState } from 'hooks/useApproveCallback';
import { useStakingContract } from 'hooks/useContract';
import useTransactionDeadline from 'hooks/useTransactionDeadline';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { wrappedCurrencyAmount } from 'utils/wrappedCurrency';
import {
  formatTokenAmount,
  maxAmountSpend,
  formatNumber,
  getSecondsOneDay,
  getExactTokenAmount,
  getValueTokenDecimals,
  getPartialTokenAmount,
} from 'utils';

interface StakeSyrupModalProps {
  open: boolean;
  onClose: () => void;
  syrup: SyrupInfo;
}

const StakeSyrupModal: React.FC<StakeSyrupModalProps> = ({
  open,
  onClose,
  syrup,
}) => {
  const [attempting, setAttempting] = useState(false);
  const [hash, setHash] = useState('');
  const { account, chainId, library } = useActiveWeb3React();
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();
  const userLiquidityUnstaked = useTokenBalance(
    account ?? undefined,
    syrup.stakedAmount?.token,
  );
  const [typedValue, setTypedValue] = useState('');
  const [stakePercent, setStakePercent] = useState(0);
  const [approving, setApproving] = useState(false);
  const maxAmountInput = maxAmountSpend(userLiquidityUnstaked);
  const { parsedAmount, error } = useDerivedSyrupInfo(
    typedValue,
    syrup.stakedAmount?.token,
    userLiquidityUnstaked,
  );

  const parsedAmountWrapped = wrappedCurrencyAmount(parsedAmount, chainId);

  let hypotheticalRewardRate = syrup.rewardRate
    ? new TokenAmount(syrup.rewardRate.token, '0')
    : undefined;
  if (parsedAmountWrapped && parsedAmountWrapped.greaterThan('0')) {
    hypotheticalRewardRate =
      syrup.stakedAmount && syrup.totalStakedAmount
        ? syrup.getHypotheticalRewardRate(
            syrup.stakedAmount.add(parsedAmountWrapped),
            syrup.totalStakedAmount.add(parsedAmountWrapped),
          )
        : undefined;
  }

  const deadline = useTransactionDeadline();

  const [approval, approveCallback] = useApproveCallback(
    parsedAmount,
    syrup.stakingRewardAddress,
  );
  const [signatureData, setSignatureData] = useState<{
    v: number;
    r: string;
    s: string;
    deadline: number;
  } | null>(null);

  const stakingContract = useStakingContract(syrup.stakingRewardAddress);

  const onAttemptToApprove = async () => {
    if (!library || !deadline) throw new Error('missing dependencies');
    const liquidityAmount = parsedAmount;
    if (!liquidityAmount) throw new Error('missing liquidity amount');
    return approveCallback();
  };

  const onStake = async () => {
    setAttempting(true);
    if (stakingContract && parsedAmount && deadline) {
      if (approval === ApprovalState.APPROVED) {
        stakingContract
          .stake(`0x${parsedAmount.raw.toString(16)}`, { gasLimit: 350000 })
          .then(async (response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Deposit ${syrup.stakingToken.symbol}`,
            });
            try {
              const receipt = await response.wait();
              finalizedTransaction(receipt, {
                summary: `Deposit ${syrup.stakingToken.symbol}`,
              });
              setAttempting(false);
              setStakePercent(0);
              setTypedValue('');
            } catch (e) {
              setAttempting(false);
              setStakePercent(0);
              setTypedValue('');
            }
          })
          .catch((error: any) => {
            setAttempting(false);
            console.log(error);
          });
      } else if (signatureData) {
        stakingContract
          .stakeWithPermit(
            `0x${parsedAmount.raw.toString(16)}`,
            signatureData.deadline,
            signatureData.v,
            signatureData.r,
            signatureData.s,
            { gasLimit: 350000 },
          )
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Deposit liquidity`,
            });
            setHash(response.hash);
          })
          .catch((error: any) => {
            setAttempting(false);
            console.log(error);
          });
      } else {
        setAttempting(false);
        throw new Error(
          'Attempting to stake without approval or a signature. Please contact support.',
        );
      }
    }
  };

  return (
    <CustomModal open={open} onClose={onClose}>
      <Box paddingX={3} paddingY={4}>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <h5>Stake {syrup.stakingToken.symbol}</h5>
          <CloseIcon style={{ cursor: 'pointer' }} onClick={onClose} />
        </Box>
        <Box
          mt={3}
          className='bg-default border-gray14'
          borderRadius='10px'
          padding='16px'
        >
          <Box
            display='flex'
            alignItems='center'
            justifyContent='space-between'
          >
            <small>{syrup.stakingToken.symbol}</small>
            <small>Balance: {formatTokenAmount(maxAmountInput)}</small>
          </Box>
          <Box mt={2} display='flex' alignItems='center'>
            <NumericalInput
              placeholder='0'
              value={typedValue}
              fontSize={28}
              onUserInput={(value) => {
                setSignatureData(null);
                const totalBalance = getExactTokenAmount(maxAmountInput);
                const exactTypedValue = getValueTokenDecimals(
                  value,
                  syrup.stakedAmount?.token,
                );
                // this is to avoid input amount more than balance
                if (Number(exactTypedValue) <= totalBalance) {
                  setTypedValue(exactTypedValue);
                  setStakePercent(
                    totalBalance > 0
                      ? (Number(exactTypedValue) / totalBalance) * 100
                      : 0,
                  );
                }
              }}
            />
            <span
              className='text-primary text-bold cursor-pointer'
              onClick={() => {
                setTypedValue(maxAmountInput ? maxAmountInput.toExact() : '0');
                setStakePercent(100);
              }}
            >
              MAX
            </span>
          </Box>
          <Box display='flex' alignItems='center'>
            <Box flex={1} mr={2} mt={0.5}>
              <ColoredSlider
                min={1}
                max={100}
                step={1}
                value={stakePercent}
                handleChange={(_, value) => {
                  const percent = value as number;
                  setStakePercent(percent);
                  setTypedValue(getPartialTokenAmount(percent, maxAmountInput));
                }}
              />
            </Box>
            <small>{Math.min(stakePercent, 100).toLocaleString()}%</small>
          </Box>
        </Box>
        <Box
          mt={2}
          display='flex'
          alignItems='center'
          justifyContent='space-between'
        >
          <p>Daily Rewards</p>
          <p>
            {hypotheticalRewardRate
              ? formatNumber(
                  Number(hypotheticalRewardRate.toExact()) * getSecondsOneDay(),
                )
              : '-'}{' '}
            {syrup.token.symbol} / day
          </p>
        </Box>
        <Box
          mt={3}
          display='flex'
          justifyContent='space-between'
          alignItems='center'
        >
          <Button
            className='stakeButton'
            disabled={approving || approval !== ApprovalState.NOT_APPROVED}
            onClick={async () => {
              setApproving(true);
              try {
                await onAttemptToApprove();
                setApproving(false);
              } catch (e) {
                setApproving(false);
              }
            }}
          >
            {approving ? 'Approving...' : 'Approve'}
          </Button>
          <Button
            className='stakeButton'
            disabled={
              !!error || attempting || approval !== ApprovalState.APPROVED
            }
            onClick={onStake}
          >
            {attempting ? 'Staking...' : 'Stake'}
          </Button>
        </Box>
      </Box>
    </CustomModal>
  );
};

export default StakeSyrupModal;
