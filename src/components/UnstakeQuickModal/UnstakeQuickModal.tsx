import React, { useState } from 'react';
import { Box, Typography, Button } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { CustomModal, ColoredSlider, NumericalInput } from 'components';
import { useLairInfo } from 'state/stake/hooks';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import { TransactionResponse } from '@ethersproject/providers';
import { useTransactionAdder } from 'state/transactions/hooks';
import { useLairContract } from 'hooks/useContract';
import Web3 from 'web3';
import { formatTokenAmount } from 'utils';

const web3 = new Web3();

const useStyles = makeStyles(({ palette }) => ({
  stakeButton: {
    backgroundImage:
      'linear-gradient(104deg, #004ce6 -32%, #0098ff 54%, #00cff3 120%, #64fbd3 198%)',
    backgroundColor: 'transparent',
    height: 48,
    width: '100%',
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
  addressLink: {
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: palette.text.primary,
    '& p': {
      marginLeft: 4,
    },
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

interface UnstakeQuickModalProps {
  open: boolean;
  onClose: () => void;
}

const UnstakeQuickModal: React.FC<UnstakeQuickModalProps> = ({
  open,
  onClose,
}) => {
  const classes = useStyles();
  const { palette } = useTheme();
  const [attempting, setAttempting] = useState(false);
  const addTransaction = useTransactionAdder();
  const lairInfo = useLairInfo();
  const dQuickBalance = lairInfo.dQUICKBalance;
  const [typedValue, setTypedValue] = useState('');
  const [stakePercent, setStakePercent] = useState(0);

  const lairContract = useLairContract();
  const error =
    Number(typedValue) > Number(dQuickBalance.toExact()) || !typedValue;

  const onWithdraw = () => {
    if (lairContract && lairInfo?.dQUICKBalance) {
      setAttempting(true);
      const balance = web3.utils.toWei(typedValue, 'ether');
      lairContract
        .leave(balance.toString(), { gasLimit: 300000 })
        .then(async (response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Unstake dQUICK`,
          });
          await response.wait();
          setAttempting(false);
        })
        .catch((error: any) => {
          setAttempting(false);
          console.log(error);
        });
    }
  };

  return (
    <CustomModal open={open} onClose={onClose}>
      <Box paddingX={3} paddingY={4}>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Typography variant='h5'>Unstake dQUICK</Typography>
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
            <Typography variant='body2'>dQUICK</Typography>
            <Typography variant='body2'>
              Balance: {formatTokenAmount(dQuickBalance)}
            </Typography>
          </Box>
          <Box mt={2} display='flex' alignItems='center'>
            <NumericalInput
              placeholder='0'
              value={typedValue}
              fontSize={28}
              onUserInput={(value) => {
                const totalBalance = dQuickBalance
                  ? Number(dQuickBalance.toExact())
                  : 0;
                setTypedValue(value);
                setStakePercent(
                  totalBalance > 0 ? (Number(value) / totalBalance) * 100 : 0,
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
                setTypedValue(dQuickBalance ? dQuickBalance.toExact() : '0');
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
                    dQuickBalance
                      ? stakePercent < 100
                        ? (
                            (Number(dQuickBalance.toExact()) * stakePercent) /
                            100
                          ).toString()
                        : dQuickBalance.toExact()
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
        <Box mt={3}>
          <Button
            className={classes.stakeButton}
            disabled={!!error || attempting}
            onClick={onWithdraw}
          >
            {attempting ? 'Unstaking...' : 'Unstake'}
          </Button>
        </Box>
      </Box>
    </CustomModal>
  );
};

export default UnstakeQuickModal;
