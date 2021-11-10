import React, { useState } from 'react';
import { ArrowLeft, ArrowDown } from 'react-feather';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Currency } from '@uniswap/sdk';
import { CustomModal, ColoredSlider } from 'components';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  input: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    color: '#c7cad9',
    fontSize: 28,
    fontWeight: 600
  }
}));

interface RemoveLiquidityModalProps {
  currency0: Currency,
  currency1: Currency,
  open: boolean,
  onClose: () => void
}

const RemoveLiquidityModal: React.FC<RemoveLiquidityModalProps> = ({ currency0, currency1, open, onClose }) => {
  const classes = useStyles();
  const [ amount, setAmount ] = useState('');
  const [ removePercent, setRemovePercent ] = useState(0);
  return (
    <CustomModal open={open} onClose={onClose}>
      <Box paddingX={3} paddingY={4}>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <ArrowLeft color='#696c80' />
          <Typography variant='subtitle2' style={{ color: '#c7cad9' }}>Remove Liquidity</Typography>
          <CloseIcon />
        </Box>
        <Box mt={3} bgcolor='#12131a' border='1px solid rgba(105, 108, 128, 0.12)' borderRadius='10px' padding='16px'>
          <Box display='flex' alignItems='center' justifyContent='space-between'>
            <Typography variant='body2'>{ currency0.symbol } / { currency1.symbol } LP</Typography>
            <Typography variant='body2'>Balance: </Typography>
          </Box>
          <Box mt={2}>
            <input placeholder='0' className={classes.input} value={amount} onChange={(evt: any) => setAmount(evt.target.value)} />
          </Box>
          <Box mt={1} display='flex'>
            <ColoredSlider
              min={1}
              max={100}
              step={1}
              value={removePercent}
              onChange={(event: any, value) => {
                setRemovePercent(value as number);
              }}
            />
          </Box>
        </Box>
        <Box display='flex' my={3} justifyContent='center'>
          <ArrowDown color='#696c80' />
        </Box>
        <Box padding='16px' bgcolor='#252833' borderRadius='10px'>
        </Box>
      </Box>
    </CustomModal>
  )
};

export default RemoveLiquidityModal;