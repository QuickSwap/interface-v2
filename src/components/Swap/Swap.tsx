import React, { useState } from 'react';
import { Box, Typography, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { ReactComponent as QuickIcon } from 'assets/images/quickIcon.svg';
import { ReactComponent as SwapIcon2 } from 'assets/images/SwapIcon2.svg';
import { ReactComponent as SwapChangeIcon } from 'assets/images/SwapChangeIcon.svg';
import { ReactComponent as PolygonSwapIcon } from 'assets/images/Currency/PolygonSwap.svg';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  swapBox: {
    padding: 24,
    borderRadius: 20,
    border: `1px solid ${palette.primary.dark}`,
    zIndex: 1,
    position: 'relative',
    textAlign: 'left',
    '& > p': {
      fontSize: 14,
      marginBottom: 16,
    },
    '& > div': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      '& input': {
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        outline: 'none',
        textAlign: 'right',
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        width: 150,
        '&::placeholder': {
          color: 'white'
        }
      }
    }
  },
  exchangeSwap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    background: palette.background.default,
    border: `2px solid ${palette.primary.dark}`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '-20px auto',
    zIndex: 2,
    position: 'relative'
  },
  currencyButton: {
    height: 40,
    minWidth: 121,
    display: 'flex',
    alignItems: 'center',
    padding: '0 6px',
    borderRadius: 20,
    background: palette.primary.dark,
    '& svg:first-child': {
      width: 28,
      height: 28,
      marginRight: 8
    },
    '& p': {
      fontFamily: "'Mulish', sans-serif",
      fontSize: 16,
      fontWeight: 'bold'
    }
  },
  swapPrice: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '20px 8px',
    '& p': {
      fontSize: 16,
      display: 'flex',
      alignItems: 'center',
      '& svg': {
        marginLeft: 8,
        width: 16,
        height: 16
      }
    }
  },
  swapButton: {
    width: '100%',
    height: 56,
    '& p': {
      fontSize: 16
    }
  }
}));

const Swap: React.FC = () => {
  const classes = useStyles();
  const [swapInputFrom, setSwapInputFrom] = useState('');
  const [swapInputTo, setSwapInputTo] = useState('');
  return (
    <Box>
      <Box className={classes.swapBox}>
        <Typography>You Pay:</Typography>
        <Box>
          <Button className={classes.currencyButton}>
            <PolygonSwapIcon />
            <Typography>MATIC</Typography>
            <KeyboardArrowDownIcon />
          </Button>
          <input value={swapInputFrom} placeholder='0.00' onChange={(e) => setSwapInputFrom(e.target.value)} />
        </Box>
      </Box>
      <Box className={classes.exchangeSwap}>
        <SwapChangeIcon />
      </Box>
      <Box className={classes.swapBox}>
        <Typography>You Pay:</Typography>
        <Box>
          <Button className={classes.currencyButton}>
            <QuickIcon />
            <Typography>QUICK</Typography>
            <KeyboardArrowDownIcon />
          </Button>
          <input value={swapInputTo} placeholder='0.00' onChange={(e) => setSwapInputTo(e.target.value)} />
        </Box>
      </Box>
      <Box className={classes.swapPrice}>
        <Typography>Price:</Typography>
        <Typography>1 MATIC = 0.002 QUICK <SwapIcon2 /></Typography>
      </Box>
      <Button color='primary' className={classes.swapButton}>
        <Typography>Connect Wallet</Typography>
      </Button>
    </Box>
  )
}

export default Swap;