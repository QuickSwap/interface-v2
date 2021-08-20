import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { CurrencyAmount, JSBI, Token, Trade } from '@uniswap/sdk'
import ReactGA from 'react-ga'
import { Box, Typography, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useWalletModalToggle } from 'state/application/hooks';
import { useDerivedSwapInfo, useSwapActionHandlers, useSwapState } from 'state/swap/hooks';
import { useExpertModeManager, useUserSlippageTolerance } from 'state/user/hooks'
import { Field } from 'state/swap/actions';
import { CurrencyInput } from 'components';
import { useActiveWeb3React } from 'hooks';
import { ApprovalState, useApproveCallbackFromTrade } from 'hooks/useApproveCallback'
import { useSwapCallback } from 'hooks/useSwapCallback'
import useENSAddress from 'hooks/useENSAddress'
import useWrapCallback, { WrapType } from 'hooks/useWrapCallback' 
import useToggledVersion, { Version } from 'hooks/useToggledVersion';
import { addMaticToMetamask, confirmPriceImpactWithoutFee } from 'utils';
import { computeTradePriceBreakdown } from 'utils/prices'
import { ReactComponent as SwapIcon2 } from 'assets/images/SwapIcon2.svg';
import { ReactComponent as SwapChangeIcon } from 'assets/images/SwapChangeIcon.svg';

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
        height: 16,
        cursor: 'pointer'
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
  const { independentField, typedValue, recipient } = useSwapState()
  const {
    v1Trade,
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError
  } = useDerivedSwapInfo();
  const toggledVersion = useToggledVersion()
  const [isExpertMode] = useExpertModeManager()
  const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue
  )
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const tradesByVersion = {
    [Version.v1]: v1Trade,
    [Version.v2]: v2Trade
  };
  const trade = showWrap ? undefined : tradesByVersion[toggledVersion]
  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
  const { address: recipientAddress } = useENSAddress(recipient)
  const [allowedSlippage] = useUserSlippageTolerance()
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage)
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);
  const isnotMatic = ethereum && ethereum.isMetaMask && Number(ethereum.chainId) !== 137;
  const [swapInputFrom, setSwapInputFrom] = useState('');
  const [swapInputTo, setSwapInputTo] = useState('');
  const [mainPrice, setMainPrice] = useState(true);
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

  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  const connectWallet = () => {
    if (isnotMatic) {
      addMaticToMetamask();
    } else {
      toggleWalletModal();
    }
  }

  const handleCurrencySelect = useCallback(
    inputCurrency => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  const handleOtherCurrencySelect = useCallback(outputCurrency => onCurrencySelection(Field.OUTPUT, outputCurrency), [
    onCurrencySelection
  ])

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(trade, allowedSlippage, recipient)

  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm: Trade | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined
  })

  const onSwap = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return
    }
    if (!swapCallback) {
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
    swapCallback()
      .then(hash => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: hash })

        ReactGA.event({
          category: 'Swap',
          action:
            recipient === null
              ? 'Swap w/o Send'
              : (recipientAddress ?? recipient) === account
              ? 'Swap w/o Send + recipient'
              : 'Swap w/ Send',
          label: [
            trade?.inputAmount?.currency?.symbol,
            trade?.outputAmount?.currency?.symbol
          ].join('/')
        })
      })
      .catch(error => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined
        })
      })
  }, [tradeToConfirm, account, priceImpactWithoutFee, recipient, recipientAddress, showConfirm, swapCallback, trade])

  return (
    <Box>
      <CurrencyInput currency={currencies[Field.INPUT]} otherCurrency={currencies[Field.OUTPUT]} handleCurrencySelect={handleCurrencySelect} amount={swapInputFrom} setAmount={setSwapInputFrom} />
      <Box className={classes.exchangeSwap} onClick={onSwitchTokens}>
        <SwapChangeIcon />
      </Box>
      <CurrencyInput currency={currencies[Field.OUTPUT]} otherCurrency={currencies[Field.INPUT]} handleCurrencySelect={handleOtherCurrencySelect} amount={swapInputTo} setAmount={setSwapInputTo} />
      <Box className={classes.swapPrice}>
        <Typography>Price:</Typography>
        <Typography>1 { (mainPrice ? currencies[Field.INPUT] : currencies[Field.OUTPUT])?.symbol } = 0.002 { (mainPrice ? currencies[Field.OUTPUT] : currencies[Field.INPUT])?.symbol } <SwapIcon2 onClick={() => { setMainPrice(!mainPrice) }} /></Typography>
      </Box>
      <Button color='primary' disabled={swapButtonDisabled as boolean} className={classes.swapButton} onClick={account ? onSwap : connectWallet}>
        <Typography>{ swapButtonText }</Typography>
      </Button>
    </Box>
  )
}

export default Swap;