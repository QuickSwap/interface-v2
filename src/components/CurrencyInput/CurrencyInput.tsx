import React, { useState } from 'react';
import { Currency } from '@uniswap/sdk'
import { Box, Typography, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { CurrencySearchModal } from 'components';
import { ReactComponent as PolygonSwapIcon } from 'assets/images/Currency/PolygonSwap.svg';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';

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
}));

interface CurrencyInputProps {
  handleCurrencySelect: (currency: Currency) => void
  currency: Currency | null
  otherCurrency: Currency | null
  amount: string
  setAmount: (value: string) => void
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({ handleCurrencySelect, currency, otherCurrency, amount, setAmount }) => {
  const classes = useStyles();
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <Box className={classes.swapBox}>
      <Typography>You Pay:</Typography>
      <Box>
        <Button className={classes.currencyButton} onClick={() => { setModalOpen(true) }}>
          <PolygonSwapIcon />
          <Typography>MATIC</Typography>
          <KeyboardArrowDownIcon />
        </Button>
        <input value={amount} placeholder='0.00' onChange={(e) => setAmount(e.target.value)} />
      </Box>
      <CurrencySearchModal
        isOpen={modalOpen}
        onDismiss={() => { setModalOpen(false) }}
        onCurrencySelect={handleCurrencySelect}
        selectedCurrency={currency}
        otherSelectedCurrency={otherCurrency}
      />
    </Box>
  )
}

export default CurrencyInput;