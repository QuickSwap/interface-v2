import React, { useState, useMemo } from 'react';
import { Box, Typography, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useWalletModalToggle } from 'state/application/hooks';
import { CurrencyInput } from 'components';
import { useActiveWeb3React } from 'hooks';
import { addMaticToMetamask } from 'utils';
import { ReactComponent as SwapIcon2 } from 'assets/images/SwapIcon2.svg';
import { ReactComponent as SwapChangeIcon } from 'assets/images/SwapChangeIcon.svg';
import { Currency } from '@uniswap/sdk';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  exchangeSwap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    background: palette.background.default,
    border: `2px solid ${palette.primary.dark}`,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '-20px auto',
    zIndex: 2,
    position: 'relative'
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
  const { account } = useActiveWeb3React();
  const { ethereum } = (window as any);
  const [ currency, setCurrency ] = useState(null);
  const [ otherCurrency, setOtherCurrency ] = useState(null);
  const isnotMatic = ethereum && ethereum.isMetaMask && Number(ethereum.chainId) !== 137;
  const [swapInputFrom, setSwapInputFrom] = useState('');
  const [swapInputTo, setSwapInputTo] = useState('');
  const swapButtonText = useMemo(() => {
    if (account) {
      if (swapInputFrom === '' && swapInputTo === '') {
        return 'Enter Amount';
      } else {
        return 'Swap';
      }
    } else {
      return 'Connect Wallet';
    }
  }, [swapInputTo, swapInputFrom, account]);

  const swapButtonDisabled = useMemo(() => account && swapButtonText !== 'Swap', [account, swapButtonText]);
  const toggleWalletModal = useWalletModalToggle();

  const connectWallet = () => {
    if (isnotMatic) {
      addMaticToMetamask();
    } else {
      toggleWalletModal();
    }
  }

  const handleCurrencySelect = (currency: Currency) => {
    console.log('bbb', currency);
  }

  const handleOtherCurrencySelect = (currency: Currency) => {

  }

  const onSwap = () => {

  }

  return (
    <Box>
      <CurrencyInput currency={currency} otherCurrency={otherCurrency} handleCurrencySelect={handleCurrencySelect} amount={swapInputFrom} setAmount={setSwapInputFrom} />
      <Box className={classes.exchangeSwap}>
        <SwapChangeIcon />
      </Box>
      <CurrencyInput currency={otherCurrency} otherCurrency={currency} handleCurrencySelect={handleOtherCurrencySelect} amount={swapInputTo} setAmount={setSwapInputTo} />
      <Box className={classes.swapPrice}>
        <Typography>Price:</Typography>
        <Typography>1 MATIC = 0.002 QUICK <SwapIcon2 /></Typography>
      </Box>
      <Button color='primary' disabled={swapButtonDisabled as boolean} className={classes.swapButton} onClick={account ? onSwap : connectWallet}>
        <Typography>{ swapButtonText }</Typography>
      </Button>
    </Box>
  )
}

export default Swap;