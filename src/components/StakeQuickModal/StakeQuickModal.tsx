import React, { useState } from 'react';
import { Box, Typography, Button } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { TransactionResponse } from '@ethersproject/providers';
import { CustomModal, ColoredSlider } from 'components';
import { useLairInfo, useDerivedLairInfo } from 'state/stake/hooks';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import { useCurrencyBalance, useTokenBalance } from 'state/wallet/hooks';
import { useActiveWeb3React } from 'hooks';
import { useApproveCallback, ApprovalState } from 'hooks/useApproveCallback';
import { useLairContract } from 'hooks/useContract';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';

const useStyles = makeStyles(({ palette }) => ({
  input: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    color: palette.text.primary,
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
      backgroundColor: palette.secondary.dark,
    },
  },
}));

interface StakeQuickModalProps {
  open: boolean;
  onClose: () => void;
}

const StakeQuickModal: React.FC<StakeQuickModalProps> = ({ open, onClose }) => {
  const classes = useStyles();
  const { palette } = useTheme();
  const [attempting, setAttempting] = useState(false);
  const { account } = useActiveWeb3React();
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();
  const lairInfo = useLairInfo();
  const QUICK = lairInfo.QUICKBalance.token;
  const quickBalance = useCurrencyBalance(account ?? undefined, QUICK);
  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, QUICK);
  const [typedValue, setTypedValue] = useState('');
  const [stakePercent, setStakePercent] = useState(0);
  const { parsedAmount, error } = useDerivedLairInfo(
    typedValue,
    QUICK,
    userLiquidityUnstaked,
  );

  const lairContract = useLairContract();
  const [approval, approveCallback] = useApproveCallback(
    parsedAmount,
    lairInfo.lairAddress,
  );

  const onAttemptToApprove = async () => {
    if (!lairContract) throw new Error('missing dependencies');
    const liquidityAmount = parsedAmount;
    if (!liquidityAmount) throw new Error('missing liquidity amount');
    return approveCallback();
  };

  const onStake = async () => {
    setAttempting(true);
    if (lairContract && parsedAmount) {
      if (approval === ApprovalState.APPROVED) {
        try {
          const response: TransactionResponse = await lairContract.enter(
            `0x${parsedAmount.raw.toString(16)}`,
            {
              gasLimit: 350000,
            },
          );
          addTransaction(response, {
            summary: `Stake QUICK`,
          });
          const receipt = await response.wait();
          finalizedTransaction(receipt, {
            summary: `Deposit dQUICK`,
          });
          setAttempting(false);
          setStakePercent(0);
          setTypedValue('');
        } catch (err) {
          setAttempting(false);
        }
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
          <Typography variant='h5'>Stake QUICK</Typography>
          <CloseIcon style={{ cursor: 'pointer' }} onClick={onClose} />
        </Box>
        <Box
          mt={3}
          bgcolor={palette.background.default}
          border='1px solid rgba(105, 108, 128, 0.12)'
          borderRadius='10px'
          padding='16px'
        >
          <Box
            display='flex'
            alignItems='center'
            justifyContent='space-between'
          >
            <Typography variant='body2'>QUICK</Typography>
            <Typography variant='body2'>
              Balance: {quickBalance?.toSignificant(3)}
            </Typography>
          </Box>
          <Box mt={2} display='flex' alignItems='center'>
            <input
              placeholder='0'
              className={classes.input}
              value={typedValue}
              onChange={(evt: any) => {
                const totalBalance = quickBalance
                  ? Number(quickBalance.toSignificant())
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
                color: palette.primary.main,
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
              onClick={() => {
                setTypedValue(
                  quickBalance ? quickBalance.toSignificant() : '0',
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
                    quickBalance
                      ? (
                          (Number(quickBalance.toSignificant()) *
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

export default StakeQuickModal;
