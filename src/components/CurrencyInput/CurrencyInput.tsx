import React, { useState } from 'react';
import { Currency } from '@uniswap/sdk'
import { Box, Typography, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { CurrencySearchModal, CurrencyLogo } from 'components';
import { useActiveWeb3React } from 'hooks';
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
      alignItems: 'center',
      '& .inputWrapper': {
        flex: 1,
        position: 'relative',
        paddingLeft: 8
      },
      '& .maxWrapper': {
        paddingLeft: 8,
        '& button': {
          borderRadius: 16
        }
      },
      '& input': {
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        outline: 'none',
        textAlign: 'right',
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        width: '100%',
        '&::placeholder': {
          color: 'white'
        }
      }
    },
    [breakpoints.down('xs')]: {
      padding: 12
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
    '& img': {
      borderRadius: 16,
      marginRight: 4,
    },
    '& p': {
      fontFamily: "'Inter', sans-serif",
      fontSize: 16,
      fontWeight: 'bold'
    }
  },
}));

interface CurrencyInputProps {
  title?: string,
  handleCurrencySelect: (currency: Currency) => void
  currency: Currency | undefined
  otherCurrency?: Currency | undefined
  amount: string
  setAmount: (value: string) => void
  onMax?: () => void
  showMaxButton?: boolean
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({ handleCurrencySelect, currency, otherCurrency, amount, setAmount, onMax, showMaxButton, title }) => {
  const classes = useStyles();
  const [modalOpen, setModalOpen] = useState(false);
  const { account } = useActiveWeb3React();

  return (
    <Box className={classes.swapBox}>
      <Typography>{ title || 'You Pay:' }</Typography>
      <Box>
        <Button className={classes.currencyButton} onClick={() => { setModalOpen(true) }}>
          {
            currency ?
              <>
              <CurrencyLogo currency={currency} size={'28px'} />
              <Typography>{ currency?.symbol }</Typography>
              </>
              :
              <Typography>Select a token</Typography>
          }
          <KeyboardArrowDownIcon />
        </Button>
        <Box className='inputWrapper'>
          <input value={amount} placeholder='0.00' onChange={(e) => setAmount(e.target.value)} />
        </Box>
        {account && currency && showMaxButton && (
          <Box className='maxWrapper'>
            <Button onClick={onMax}>MAX</Button>
          </Box>
        )}
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