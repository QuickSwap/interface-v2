import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { CurrencyAmount, JSBI, Token, Trade } from '@uniswap/sdk'
import ReactGA from 'react-ga'
import { Box, Typography, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useWalletModalToggle } from 'state/application/hooks';
import { useDerivedSwapInfo, useSwapActionHandlers, useSwapState } from 'state/swap/hooks';
import { useExpertModeManager, useUserSlippageTolerance } from 'state/user/hooks'
import { Field } from 'state/swap/actions';
import { useAllTokens } from 'hooks/Tokens';
import { CurrencyInput, ConfirmSwapModal } from 'components';
import { useActiveWeb3React } from 'hooks';
import { ApprovalState, useApproveCallbackFromTrade } from 'hooks/useApproveCallback'
import { useSwapCallback } from 'hooks/useSwapCallback'
import useENSAddress from 'hooks/useENSAddress'
import useWrapCallback, { WrapType } from 'hooks/useWrapCallback' 
import useToggledVersion, { Version } from 'hooks/useToggledVersion';
import { addMaticToMetamask, confirmPriceImpactWithoutFee, maxAmountSpend } from 'utils';
import { computeTradePriceBreakdown, warningSeverity } from 'utils/prices'
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
    margin: '20px 8px 0',
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
    marginTop: 20,
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
  const toggledVersion = useToggledVersion();
  const [isExpertMode] = useExpertModeManager();
  const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue
  );
  const allTokens = useAllTokens();

  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;
  const tradesByVersion = {
    [Version.v1]: v1Trade,
    [Version.v2]: v2Trade
  };
  const trade = showWrap ? undefined : tradesByVersion[toggledVersion];
  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers();
  const { address: recipientAddress } = useENSAddress(recipient);
  const [allowedSlippage] = useUserSlippageTolerance();
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage);
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;
  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount
      };
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? ''
  };
  const route = trade?.route;
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  );
  const noRoute = !route;

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);
  const isnotMatic = ethereum && ethereum.isMetaMask && Number(ethereum.chainId) !== 137;
  const [mainPrice, setMainPrice] = useState(true);
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)
  const isValid = !swapInputError

  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode);

  const swapButtonText = useMemo(() => {
    if (account) {
      if (formattedAmounts[Field.INPUT] === '' && formattedAmounts[Field.OUTPUT] === '') {
        return 'Enter Amount';
      } else if (showWrap) {
        return wrapType === WrapType.WRAP ? 'Wrap' : 'UnWrap';
      } else if (noRoute && userHasSpecifiedInputOutput) {
        return 'Insufficient liquidity for this trade.';
      } else if (showApproveFlow) {
        return 'Approve';
      } else {
        return 'Swap';
      }
    } else {
      return isnotMatic ? 'Switch to Matic' : 'Connect Wallet';
    }
  }, [formattedAmounts, account]);

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

  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(trade, allowedSlippage, recipient)

  const swapButtonDisabled = useMemo(() => {
    if (account) {
      if (showWrap) {
        return Boolean(wrapInputError);
      } else if (noRoute && userHasSpecifiedInputOutput) {
        return true;
      } else if (showApproveFlow) {
        return approval !== ApprovalState.NOT_APPROVED || approvalSubmitted;
      } else {
        return !isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError;
      }
    } else {
      return false;
    }
  }, [account, swapButtonText]);

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

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])

  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  const onSwap = () => {
    if (isExpertMode) {
      handleSwap();
    } else {
      setSwapState({
        tradeToConfirm: trade,
        attemptingTxn: false,
        swapErrorMessage: undefined,
        showConfirm: true,
        txHash: undefined
      })  
    }
  }

  useEffect(() => {
    onCurrencySelection(Field.INPUT, Token.ETHER);
    const quickToken = Object.values(allTokens).find((val) => val.symbol === 'QUICK');
    if (quickToken) {
      onCurrencySelection(Field.OUTPUT, quickToken);
    }
  }, [onCurrencySelection, allTokens]);

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash]);

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash]);

  const handleSwap = useCallback(() => {
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
      <ConfirmSwapModal
        isOpen={showConfirm}
        trade={trade}
        originalTrade={tradeToConfirm}
        onAcceptChanges={handleAcceptChanges}
        attemptingTxn={attemptingTxn}
        txHash={txHash}
        recipient={recipient}
        allowedSlippage={allowedSlippage}
        onConfirm={handleSwap}
        swapErrorMessage={swapErrorMessage}
        onDismiss={handleConfirmDismiss}
      />
      <CurrencyInput currency={currencies[Field.INPUT]} onMax={handleMaxInput} showMaxButton={!atMaxAmountInput} otherCurrency={currencies[Field.OUTPUT]} handleCurrencySelect={handleCurrencySelect} amount={formattedAmounts[Field.INPUT]} setAmount={handleTypeInput} />
      <Box className={classes.exchangeSwap} onClick={onSwitchTokens}>
        <SwapChangeIcon />
      </Box>
      <CurrencyInput currency={currencies[Field.OUTPUT]} showMaxButton={false} otherCurrency={currencies[Field.INPUT]} handleCurrencySelect={handleOtherCurrencySelect} amount={formattedAmounts[Field.OUTPUT]} setAmount={handleTypeOutput} />
      {
        trade && trade.executionPrice &&
          <Box className={classes.swapPrice}>
            <Typography>Price:</Typography>
            <Typography>1 { (mainPrice ? currencies[Field.INPUT] : currencies[Field.OUTPUT])?.symbol } = { (mainPrice ? trade.executionPrice : trade.executionPrice.invert()).toSignificant(6) } { (mainPrice ? currencies[Field.OUTPUT] : currencies[Field.INPUT])?.symbol } <SwapIcon2 onClick={() => { setMainPrice(!mainPrice) }} /></Typography>
          </Box>
      }
      <Button color='primary' disabled={swapButtonDisabled as boolean} className={classes.swapButton} onClick={account ? onSwap : connectWallet}>
        <Typography>{ swapButtonText }</Typography>
      </Button>
    </Box>
  )
}

export default Swap;