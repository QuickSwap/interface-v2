import React, { useState } from 'react';
import { Box, Typography, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { TokenAmount } from '@uniswap/sdk';
import { TransactionResponse } from '@ethersproject/providers';
import { CustomModal, ColoredSlider } from 'components';
import { useDerivedSyrupInfo, SyrupInfo } from 'state/stake/hooks';
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
import { maxAmountSpend } from 'utils';

const useStyles = makeStyles(({}) => ({
  input: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    color: '#c7cad9',
    fontSize: 28,
    fontWeight: 600,
  },
  stakeButton: {
    backgroundImage:
      'linear-gradient(104deg, #004ce6 -32%, #0098ff 54%, #00cff3 120%, #64fbd3 198%)',
    backgroundColor: 'transparent',
    height: 48,
    width: '48%',
    borderRadius: 10,
    '& span': {
      fontSize: 16,
      fontWeight: 600,
    },
    '&.Mui-disabled': {
      backgroundImage: 'none',
      backgroundColor: '#282d3d',
    },
  },
}));

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
  const classes = useStyles();
  const [attempting, setAttempting] = useState(false);
  const [hash, setHash] = useState('');
  const { account, chainId, library } = useActiveWeb3React();
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();
  const userLiquidityUnstaked = useTokenBalance(
    account ?? undefined,
    syrup.stakedAmount.token,
  );
  const [typedValue, setTypedValue] = useState('');
  const [stakePercent, setStakePercent] = useState(0);
  const maxAmountInput = maxAmountSpend(userLiquidityUnstaked);
  const { parsedAmount, error } = useDerivedSyrupInfo(
    typedValue,
    syrup.stakedAmount.token,
    userLiquidityUnstaked,
  );

  const parsedAmountWrapped = wrappedCurrencyAmount(parsedAmount, chainId);

  let hypotheticalRewardRate: TokenAmount = new TokenAmount(
    syrup.rewardRate.token,
    '0',
  );
  if (parsedAmountWrapped?.greaterThan('0')) {
    hypotheticalRewardRate = syrup.getHypotheticalRewardRate(
      syrup.stakedAmount.add(parsedAmountWrapped),
      syrup.totalStakedAmount.add(parsedAmountWrapped),
      syrup.totalRewardRate,
    );
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
              summary: `Deposit dQUICK`,
            });
            setHash(response.hash);
            const receipt = await response.wait();
            finalizedTransaction(receipt, {
              summary: `Deposit dQUICK`,
            });
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
          <Typography variant='h5'>Stake dQUICK</Typography>
          <CloseIcon style={{ cursor: 'pointer' }} onClick={onClose} />
        </Box>
        <Box
          mt={3}
          bgcolor='#12131a'
          border='1px solid rgba(105, 108, 128, 0.12)'
          borderRadius='10px'
          padding='16px'
        >
          <Box
            display='flex'
            alignItems='center'
            justifyContent='space-between'
          >
            <Typography variant='body2'>dQUICK</Typography>
            <Typography variant='body2'>
              Balance: {maxAmountInput?.toSignificant(3)}
            </Typography>
          </Box>
          <Box mt={2} display='flex' alignItems='center'>
            <input
              placeholder='0'
              className={classes.input}
              value={typedValue}
              onChange={(evt: any) => {
                setSignatureData(null);
                const totalBalance = maxAmountInput
                  ? Number(maxAmountInput.toSignificant())
                  : 0;
                setTypedValue(evt.target.value);
                setStakePercent(
                  totalBalance > 0
                    ? (Number(evt.target.value) / totalBalance) * 100
                    : 0,
                );
              }}
            />
            <Typography
              variant='caption'
              style={{
                color: '#448aff',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
              onClick={() => {
                setTypedValue(
                  maxAmountInput ? maxAmountInput.toSignificant() : '0',
                );
                setStakePercent(100);
              }}
            >
              MAX
            </Typography>
          </Box>
          <Box display='flex' alignItems='center'>
            <Box flex={1} mr={2} mt={0.5}>
              <ColoredSlider
                min={1}
                max={100}
                step={1}
                value={stakePercent}
                onChange={(evt: any, value) => {
                  setStakePercent(value as number);
                  setTypedValue(
                    maxAmountInput
                      ? (
                          (Number(maxAmountInput.toSignificant()) *
                            stakePercent) /
                          100
                        ).toFixed(8)
                      : '0',
                  );
                }}
              />
            </Box>
            <Typography variant='body2'>
              {Math.min(stakePercent, 100).toLocaleString()}%
            </Typography>
          </Box>
        </Box>
        <Box
          mt={2}
          display='flex'
          alignItems='center'
          justifyContent='space-between'
        >
          <Typography variant='body1'>Daily Rewards</Typography>
          <Typography variant='body1'>
            {hypotheticalRewardRate
              .multiply((60 * 60 * 24).toString())
              .toSignificant(4, { groupSeparator: ',' })}{' '}
            {syrup.token.symbol} / day
          </Typography>
        </Box>
        <Box
          mt={3}
          display='flex'
          justifyContent='space-between'
          alignItems='center'
        >
          <Button
            className={classes.stakeButton}
            disabled={approval !== ApprovalState.NOT_APPROVED}
            onClick={onAttemptToApprove}
          >
            Approve
          </Button>
          <Button
            className={classes.stakeButton}
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
