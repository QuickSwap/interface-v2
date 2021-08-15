import React, { useState, useMemo } from 'react';
import { Box, Typography, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { useWalletModalToggle } from 'state/application/hooks';
import { CurrencySearchModal } from 'components';
import { useActiveWeb3React } from 'hooks';
import { addMaticToMetamask } from 'utils';
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
  const { account } = useActiveWeb3React();
  const [ modalOpen, setModalOpen ] = useState(false);
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

  const handleCurrencySelect = () => {

  }

  const onSwap = () => {

  }

  return (
    <Box>
      <Box className={classes.swapBox}>
        <Typography>You Pay:</Typography>
        <Box>
          <Button className={classes.currencyButton} onClick={() => { setModalOpen(true) }}>
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
      <Button color='primary' disabled={swapButtonDisabled as boolean} className={classes.swapButton} onClick={account ? onSwap : connectWallet}>
        <Typography>{ swapButtonText }</Typography>
      </Button>
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

export default Swap;