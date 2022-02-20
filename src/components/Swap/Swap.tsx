import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Currency, CurrencyAmount, JSBI, Token, Trade } from '@uniswap/sdk';
import ReactGA from 'react-ga';
import { ArrowDown } from 'react-feather';
import { Box, Typography, Button, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useWalletModalToggle } from 'state/application/hooks';
import {
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from 'state/swap/hooks';
import {
  useExpertModeManager,
  useUserSlippageTolerance,
} from 'state/user/hooks';
import { Field } from 'state/swap/actions';
import { useAllTokens } from 'hooks/Tokens';
import {
  CurrencyInput,
  ConfirmSwapModal,
  AdvancedSwapDetails,
  AddressInput,
} from 'components';
import { useActiveWeb3React } from 'hooks';
import {
  ApprovalState,
  useApproveCallbackFromTrade,
} from 'hooks/useApproveCallback';
import { useSwapCallback } from 'hooks/useSwapCallback';
import { useTransactionFinalizer } from 'state/transactions/hooks';
import useENSAddress from 'hooks/useENSAddress';
import useWrapCallback, { WrapType } from 'hooks/useWrapCallback';
import useToggledVersion, { Version } from 'hooks/useToggledVersion';
import {
  addMaticToMetamask,
  isSupportedNetwork,
  confirmPriceImpactWithoutFee,
  halfAmountSpend,
  maxAmountSpend,
} from 'utils';
import { computeTradePriceBreakdown, warningSeverity } from 'utils/prices';
import { ReactComponent as PriceExchangeIcon } from 'assets/images/PriceExchangeIcon.svg';
import { ReactComponent as ExchangeIcon } from 'assets/images/ExchangeIcon.svg';

const useStyles = makeStyles(({ palette }) => ({
  exchangeSwap: {
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '16px auto',
    zIndex: 2,
    position: 'relative',
  },
  swapPrice: {
    display: 'flex',
    justifyContent: 'space-between',
    background: 'rgb(43, 45, 59, 0.2)',
    padding: '8px 24px',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    '& p': {
      display: 'flex',
      alignItems: 'center',
      color: '#b6b9cc',
      '& svg': {
        marginLeft: 8,
        width: 16,
        height: 16,
        cursor: 'pointer',
      },
    },
  },
  swapButtonWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%',
    '& button': {
      borderRadius: '10px',
      height: 56,
      fontSize: 18,
      fontWeight: 600,
      width: (props: any) => (props.showApproveFlow ? '48%' : '100%'),
      backgroundImage: `linear-gradient(to bottom, ${palette.primary.main}, #004ce6)`,
      '&.Mui-disabled': {
        backgroundImage: `linear-gradient(to bottom, ${palette.secondary.dark}, #1d212c)`,
        color: palette.text.secondary,
        opacity: 0.5,
      },
      '& .content': {
        display: 'flex',
        alignItems: 'center',
        '& > div': {
          color: 'white',
          marginLeft: 6,
        },
      },
    },
  },
  recipientInput: {
    width: '100%',
    '& .header': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 12px',
      '& button': {
        background: 'transparent',
      },
    },
  },
}));

const Swap: React.FC<{
  currency0?: Currency;
  currency1?: Currency;
  currencyBg?: string;
}> = ({ currency0, currency1, currencyBg }) => {
  const { account } = useActiveWeb3React();
  const { independentField, typedValue, recipient } = useSwapState();
  const {
    v1Trade,
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = useDerivedSwapInfo();
  const toggledVersion = useToggledVersion();
  const finalizedTransaction = useTransactionFinalizer();
  const [isExpertMode] = useExpertModeManager();
  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue,
  );
  const allTokens = useAllTokens();

  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;
  const tradesByVersion = {
    [Version.v1]: v1Trade,
    [Version.v2]: v2Trade,
  };
  const trade = showWrap ? undefined : tradesByVersion[toggledVersion];
  const {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
  } = useSwapActionHandlers();
  const { address: recipientAddress } = useENSAddress(recipient);
  const [allowedSlippage] = useUserSlippageTolerance();
  const [approving, setApproving] = useState(false);
  const [approval, approveCallback] = useApproveCallbackFromTrade(
    trade,
    allowedSlippage,
  );
  const dependentField: Field =
    independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;
  const parsedAmounts = useMemo(() => {
    return showWrap
      ? {
          [Field.INPUT]: parsedAmount,
          [Field.OUTPUT]: parsedAmount,
        }
      : {
          [Field.INPUT]:
            independentField === Field.INPUT
              ? parsedAmount
              : trade?.inputAmount,
          [Field.OUTPUT]:
            independentField === Field.OUTPUT
              ? parsedAmount
              : trade?.outputAmount,
        };
  }, [parsedAmount, independentField, trade, showWrap]);
  const formattedAmounts = useMemo(() => {
    return {
      [independentField]: typedValue,
      [dependentField]: showWrap
        ? parsedAmounts[independentField]?.toExact() ?? ''
        : parsedAmounts[dependentField]?.toExact() ?? '',
    };
  }, [independentField, typedValue, dependentField, showWrap, parsedAmounts]);
  const route = trade?.route;
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] &&
      currencies[Field.OUTPUT] &&
      parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0)),
  );
  const noRoute = !route;

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade);
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);
  const { ethereum } = window as any;
  const [mainPrice, setMainPrice] = useState(true);
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee);
  const isValid = !swapInputError;

  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode);

  const classes = useStyles({ showApproveFlow });

  const toggleWalletModal = useWalletModalToggle();

  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true);
    }
  }, [approval, approvalSubmitted]);

  const connectWallet = () => {
    if (ethereum && !isSupportedNetwork(ethereum)) {
      addMaticToMetamask();
    } else {
      toggleWalletModal();
    }
  };

  const handleCurrencySelect = useCallback(
    (inputCurrency) => {
      setApprovalSubmitted(false); // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency);
    },
    [onCurrencySelection],
  );

  const handleOtherCurrencySelect = useCallback(
    (outputCurrency) => onCurrencySelection(Field.OUTPUT, outputCurrency),
    [onCurrencySelection],
  );

  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    recipient,
  );

  const swapButtonText = useMemo(() => {
    if (account) {
      if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
        return 'Select a token';
      } else if (
        formattedAmounts[Field.INPUT] === '' &&
        formattedAmounts[Field.OUTPUT] === ''
      ) {
        return 'Enter Amount';
      } else if (showWrap) {
        return wrapType === WrapType.WRAP
          ? 'Wrap'
          : wrapType === WrapType.UNWRAP
          ? 'UnWrap'
          : '';
      } else if (noRoute && userHasSpecifiedInputOutput) {
        return 'Insufficient liquidity for this trade.';
      } else {
        return swapInputError ?? 'Swap';
      }
    } else {
      return ethereum && !isSupportedNetwork(ethereum)
        ? 'Switch to Polygon'
        : 'Connect Wallet';
    }
  }, [
    formattedAmounts,
    currencies,
    account,
    ethereum,
    noRoute,
    userHasSpecifiedInputOutput,
    showWrap,
    wrapType,
    swapInputError,
  ]);

  const swapButtonDisabled = useMemo(() => {
    if (account) {
      if (showWrap) {
        return Boolean(wrapInputError);
      } else if (noRoute && userHasSpecifiedInputOutput) {
        return true;
      } else if (showApproveFlow) {
        return (
          !isValid ||
          approval !== ApprovalState.APPROVED ||
          (priceImpactSeverity > 3 && !isExpertMode)
        );
      } else {
        return (
          !isValid ||
          (priceImpactSeverity > 3 && !isExpertMode) ||
          !!swapCallbackError
        );
      }
    } else {
      return false;
    }
  }, [
    account,
    showWrap,
    wrapInputError,
    noRoute,
    userHasSpecifiedInputOutput,
    showApproveFlow,
    approval,
    priceImpactSeverity,
    isValid,
    swapCallbackError,
    isExpertMode,
  ]);

  const [
    {
      showConfirm,
      txPending,
      tradeToConfirm,
      swapErrorMessage,
      attemptingTxn,
      txHash,
    },
    setSwapState,
  ] = useState<{
    showConfirm: boolean;
    txPending?: boolean;
    tradeToConfirm: Trade | undefined;
    attemptingTxn: boolean;
    swapErrorMessage: string | undefined;
    txHash: string | undefined;
  }>({
    showConfirm: false,
    txPending: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  });

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value);
    },
    [onUserInput],
  );
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value);
    },
    [onUserInput],
  );

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(
    currencyBalances[Field.INPUT],
  );

  const halfAmountInput: CurrencyAmount | undefined = halfAmountSpend(
    currencyBalances[Field.INPUT],
  );

  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact());
  }, [maxAmountInput, onUserInput]);

  const handleHalfInput = useCallback(() => {
    halfAmountInput && onUserInput(Field.INPUT, halfAmountInput.toExact());
  }, [halfAmountInput, onUserInput]);

  const atMaxAmountInput = Boolean(
    maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput),
  );

  const onSwap = () => {
    if (showWrap && onWrap) {
      onWrap();
    } else if (isExpertMode) {
      handleSwap();
    } else {
      setSwapState({
        tradeToConfirm: trade,
        attemptingTxn: false,
        swapErrorMessage: undefined,
        showConfirm: true,
        txHash: undefined,
      });
    }
  };

  useEffect(() => {
    onCurrencySelection(Field.INPUT, Token.ETHER);
  }, [onCurrencySelection, allTokens]);

  useEffect(() => {
    if (currency0) {
      onCurrencySelection(Field.INPUT, currency0);
    }
    if (currency1) {
      onCurrencySelection(Field.OUTPUT, currency1);
    }
  }, [onCurrencySelection, currency0, currency1]);

  const handleAcceptChanges = useCallback(() => {
    setSwapState({
      tradeToConfirm: trade,
      swapErrorMessage,
      txHash,
      attemptingTxn,
      showConfirm,
    });
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash]);

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({
      showConfirm: false,
      tradeToConfirm,
      attemptingTxn,
      swapErrorMessage,
      txHash,
    });
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '');
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash]);

  const handleSwap = useCallback(() => {
    if (
      priceImpactWithoutFee &&
      !confirmPriceImpactWithoutFee(priceImpactWithoutFee)
    ) {
      return;
    }
    if (!swapCallback) {
      return;
    }
    setSwapState({
      attemptingTxn: true,
      tradeToConfirm,
      showConfirm,
      swapErrorMessage: undefined,
      txHash: undefined,
    });
    swapCallback()
      .then(async ({ response, summary }) => {
        setSwapState({
          attemptingTxn: false,
          txPending: true,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: undefined,
          txHash: response.hash,
        });

        try {
          const receipt = await response.wait();
          finalizedTransaction(receipt, {
            summary,
          });
          setSwapState({
            attemptingTxn: false,
            txPending: false,
            tradeToConfirm,
            showConfirm,
            swapErrorMessage: undefined,
            txHash: response.hash,
          });
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
              trade?.outputAmount?.currency?.symbol,
            ].join('/'),
          });
        } catch (error) {
          setSwapState({
            attemptingTxn: false,
            tradeToConfirm,
            showConfirm,
            swapErrorMessage: (error as any).message,
            txHash: undefined,
          });
        }
      })
      .catch((error) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        });
      });
  }, [
    tradeToConfirm,
    account,
    priceImpactWithoutFee,
    recipient,
    recipientAddress,
    showConfirm,
    swapCallback,
    finalizedTransaction,
    trade,
  ]);

  return (
    <Box>
      {showConfirm && (
        <ConfirmSwapModal
          isOpen={showConfirm}
          trade={trade}
          originalTrade={tradeToConfirm}
          onAcceptChanges={handleAcceptChanges}
          attemptingTxn={attemptingTxn}
          txPending={txPending}
          txHash={txHash}
          recipient={recipient}
          allowedSlippage={allowedSlippage}
          onConfirm={handleSwap}
          swapErrorMessage={swapErrorMessage}
          onDismiss={handleConfirmDismiss}
        />
      )}
      <CurrencyInput
        title='From:'
        id='swap-currency-input'
        currency={currencies[Field.INPUT]}
        onHalf={handleHalfInput}
        onMax={handleMaxInput}
        showHalfButton={true}
        showMaxButton={!atMaxAmountInput}
        otherCurrency={currencies[Field.OUTPUT]}
        handleCurrencySelect={handleCurrencySelect}
        amount={formattedAmounts[Field.INPUT]}
        setAmount={handleTypeInput}
        bgColor={currencyBg}
      />
      <Box className={classes.exchangeSwap}>
        <ExchangeIcon onClick={onSwitchTokens} />
      </Box>
      <CurrencyInput
        title='To (estimate):'
        id='swap-currency-output'
        currency={currencies[Field.OUTPUT]}
        showPrice={Boolean(trade && trade.executionPrice)}
        showMaxButton={false}
        otherCurrency={currencies[Field.INPUT]}
        handleCurrencySelect={handleOtherCurrencySelect}
        amount={formattedAmounts[Field.OUTPUT]}
        setAmount={handleTypeOutput}
        bgColor={currencyBg}
      />
      {trade && trade.executionPrice && (
        <Box className={classes.swapPrice}>
          <Typography variant='body2'>Price:</Typography>
          <Typography variant='body2'>
            1{' '}
            {
              (mainPrice ? currencies[Field.INPUT] : currencies[Field.OUTPUT])
                ?.symbol
            }{' '}
            ={' '}
            {(mainPrice
              ? trade.executionPrice
              : trade.executionPrice.invert()
            ).toSignificant(6)}{' '}
            {
              (mainPrice ? currencies[Field.OUTPUT] : currencies[Field.INPUT])
                ?.symbol
            }{' '}
            <PriceExchangeIcon
              onClick={() => {
                setMainPrice(!mainPrice);
              }}
            />
          </Typography>
        </Box>
      )}
      {!showWrap && isExpertMode && (
        <Box className={classes.recipientInput}>
          <Box className='header'>
            {recipient !== null ? (
              <ArrowDown size='16' color='white' />
            ) : (
              <Box />
            )}
            <Button
              onClick={() => onChangeRecipient(recipient !== null ? null : '')}
            >
              {recipient !== null ? '- Remove send' : '+ Add a send (optional)'}
            </Button>
          </Box>
          {recipient !== null && (
            <AddressInput
              label='Recipient'
              placeholder='Wallet Address or ENS name'
              value={recipient}
              onChange={onChangeRecipient}
            />
          )}
        </Box>
      )}
      <AdvancedSwapDetails trade={trade} />
      <Box className={classes.swapButtonWrapper}>
        {showApproveFlow && (
          <Button
            color='primary'
            disabled={
              approving ||
              approval !== ApprovalState.NOT_APPROVED ||
              approvalSubmitted
            }
            onClick={async () => {
              setApproving(true);
              try {
                await approveCallback();
                setApproving(false);
              } catch (err) {
                setApproving(false);
              }
            }}
          >
            {approval === ApprovalState.PENDING ? (
              <Box className='content'>
                Approving <CircularProgress size={16} />
              </Box>
            ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
              'Approved'
            ) : (
              'Approve ' + currencies[Field.INPUT]?.symbol
            )}
          </Button>
        )}
        <Button
          disabled={swapButtonDisabled as boolean}
          onClick={account ? onSwap : connectWallet}
        >
          {swapButtonText}
        </Button>
      </Box>
    </Box>
  );
};

export default Swap;
