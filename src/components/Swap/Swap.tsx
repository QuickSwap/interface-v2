import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  CurrencyAmount,
  JSBI,
  Trade,
  Token,
  ETHER,
  currencyEquals,
} from '@uniswap/sdk';
import ReactGA from 'react-ga';
import { ArrowDown } from 'react-feather';
import { Box, Button, CircularProgress } from '@material-ui/core';
import { useIsProMode, useWalletModalToggle } from 'state/application/hooks';
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from 'state/swap/hooks';
import {
  useExpertModeManager,
  useUserSlippageTolerance,
} from 'state/user/hooks';
import { Field, SwapDelay } from 'state/swap/actions';
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
  maxAmountSpend,
} from 'utils';
import { computeTradePriceBreakdown, warningSeverity } from 'utils/prices';
import { ReactComponent as PriceExchangeIcon } from 'assets/images/PriceExchangeIcon.svg';
import { ReactComponent as ExchangeIcon } from 'assets/images/ExchangeIcon.svg';
import 'components/styles/Swap.scss';
import { useTranslation } from 'react-i18next';
import TokenWarningModal from 'components/v3/TokenWarningModal';
import { useHistory } from 'react-router-dom';
import { useAllTokens, useCurrency } from 'hooks/Tokens';
import useParsedQueryString from 'hooks/useParsedQueryString';
import useSwapRedirects from 'hooks/useSwapRedirect';

const Swap: React.FC<{
  currencyBgClass?: string;
}> = ({ currencyBgClass }) => {
  const loadedUrlParams = useDefaultsFromURLSearch();
  const history = useHistory();
  const { isProMode, updateIsProMode } = useIsProMode();

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ];
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(
    false,
  );
  const urlLoadedTokens: Token[] = useMemo(
    () =>
      [loadedInputCurrency, loadedOutputCurrency]?.filter(
        (c): c is Token => c instanceof Token,
      ) ?? [],
    [loadedInputCurrency, loadedOutputCurrency],
  );
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true);
  }, []);

  // reset if they close warning without tokens in params
  const handleDismissTokenWarning = useCallback(() => {
    setDismissTokenWarning(true);
    history.push('/swap?swapIndex=1');
  }, [history]);

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens();
  const importTokensNotInDefault =
    urlLoadedTokens &&
    urlLoadedTokens.filter((token: Token) => {
      return !Boolean(token.address in defaultTokens);
    });

  const { t } = useTranslation();
  const { account } = useActiveWeb3React();
  const { independentField, typedValue, recipient, swapDelay } = useSwapState();
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

  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;
  const tradesByVersion = {
    [Version.v1]: v1Trade,
    [Version.v2]: v2Trade,
  };
  const trade = showWrap ? undefined : tradesByVersion[toggledVersion];
  const {
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

  const parsedQs = useParsedQueryString();
  const { redirectWithCurrency, redirectWithSwitch } = useSwapRedirects();
  const parsedCurrency0Id = (parsedQs.currency0 ??
    parsedQs.inputCurrency) as string;
  const parsedCurrency1Id = (parsedQs.currency1 ??
    parsedQs.outputCurrency) as string;

  const handleCurrencySelect = useCallback(
    (inputCurrency) => {
      setApprovalSubmitted(false); // reset 2 step UI for approvals
      const isSwichRedirect = currencyEquals(inputCurrency, ETHER)
        ? parsedCurrency1Id === 'ETH'
        : parsedCurrency1Id &&
          inputCurrency &&
          inputCurrency.address &&
          inputCurrency.address.toLowerCase() ===
            parsedCurrency1Id.toLowerCase();
      if (isSwichRedirect) {
        redirectWithSwitch();
      } else {
        redirectWithCurrency(inputCurrency, true);
      }
    },
    [parsedCurrency1Id, redirectWithCurrency, redirectWithSwitch],
  );

  const parsedCurrency0 = useCurrency(parsedCurrency0Id);
  useEffect(() => {
    if (parsedCurrency0) {
      onCurrencySelection(Field.INPUT, parsedCurrency0);
    } else if (
      history.location.pathname !== '/' &&
      parsedCurrency0 === undefined &&
      !parsedCurrency1Id
    ) {
      redirectWithCurrency(ETHER, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedCurrency0, parsedCurrency1Id]);

  const handleOtherCurrencySelect = useCallback(
    (outputCurrency) => {
      const isSwichRedirect = currencyEquals(outputCurrency, ETHER)
        ? parsedCurrency0Id === 'ETH'
        : parsedCurrency0Id &&
          outputCurrency &&
          outputCurrency.address &&
          outputCurrency.address.toLowerCase() ===
            parsedCurrency0Id.toLowerCase();
      if (isSwichRedirect) {
        redirectWithSwitch();
      } else {
        redirectWithCurrency(outputCurrency, false);
      }
    },
    [parsedCurrency0Id, redirectWithCurrency, redirectWithSwitch],
  );

  const parsedCurrency1 = useCurrency(parsedCurrency1Id);
  useEffect(() => {
    if (parsedCurrency1) {
      onCurrencySelection(Field.OUTPUT, parsedCurrency1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedCurrency1Id]);

  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    recipient,
  );

  const swapButtonText = useMemo(() => {
    if (account) {
      if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
        return t('selectToken');
      } else if (
        formattedAmounts[Field.INPUT] === '' &&
        formattedAmounts[Field.OUTPUT] === ''
      ) {
        return t('enterAmount');
      } else if (showWrap) {
        return wrapType === WrapType.WRAP
          ? t('wrap')
          : wrapType === WrapType.UNWRAP
          ? t('unWrap')
          : '';
      } else if (noRoute && userHasSpecifiedInputOutput) {
        return t('insufficientLiquidityTrade');
      } else {
        return swapInputError ?? t('swap');
      }
    } else {
      return ethereum && !isSupportedNetwork(ethereum)
        ? t('switchPolygon')
        : t('connectWallet');
    }
  }, [
    t,
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
    const inputCurrency = currencies[Field.INPUT];
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
          (inputCurrency &&
            currencyEquals(inputCurrency, ETHER) &&
            approval === ApprovalState.UNKNOWN) ||
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
    currencies,
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

  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact());
  }, [maxAmountInput, onUserInput]);

  const handleHalfInput = useCallback(() => {
    if (!maxAmountInput) {
      return;
    }

    const halvedAmount = maxAmountInput.divide('2');

    onUserInput(
      Field.INPUT,
      halvedAmount.toFixed(maxAmountInput.currency.decimals),
    );
  }, [maxAmountInput, onUserInput]);

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
      !confirmPriceImpactWithoutFee(priceImpactWithoutFee, t)
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
    t,
  ]);

  const fetchingBestRoute =
    swapDelay === SwapDelay.USER_INPUT ||
    swapDelay === SwapDelay.FETCHING_SWAP ||
    swapDelay === SwapDelay.FETCHING_BONUS;

  return (
    <Box>
      <TokenWarningModal
        isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
        tokens={importTokensNotInDefault}
        onConfirm={handleConfirmTokenWarning}
        onDismiss={handleDismissTokenWarning}
      />
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
        title={`${t('from')}:`}
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
        color={isProMode ? 'white' : 'secondary'}
        bgClass={isProMode ? 'swap-bg-highlight' : currencyBgClass}
      />
      <Box className='exchangeSwap'>
        <ExchangeIcon onClick={redirectWithSwitch} />
      </Box>
      <CurrencyInput
        title={`${t('toEstimate')}:`}
        id='swap-currency-output'
        currency={currencies[Field.OUTPUT]}
        showPrice={Boolean(trade && trade.executionPrice)}
        showMaxButton={false}
        otherCurrency={currencies[Field.INPUT]}
        handleCurrencySelect={handleOtherCurrencySelect}
        amount={formattedAmounts[Field.OUTPUT]}
        setAmount={handleTypeOutput}
        color={isProMode ? 'white' : 'secondary'}
        bgClass={isProMode ? 'swap-bg-highlight' : currencyBgClass}
      />
      {trade && trade.executionPrice && (
        <Box className='swapPrice'>
          <small>{t('price')}:</small>
          <small>
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
          </small>
        </Box>
      )}
      {!showWrap && isExpertMode && (
        <Box className='recipientInput'>
          <Box className='recipientInputHeader'>
            {recipient !== null ? (
              <ArrowDown size='16' color='white' />
            ) : (
              <Box />
            )}
            <Button
              onClick={() => onChangeRecipient(recipient !== null ? null : '')}
            >
              {recipient !== null
                ? `- ${t('removeSend')}`
                : `+ ${t('addSendOptional')}`}
            </Button>
          </Box>
          {recipient !== null && (
            <AddressInput
              label={t('recipient')}
              placeholder={t('walletOrENS')}
              value={recipient}
              onChange={onChangeRecipient}
            />
          )}
        </Box>
      )}
      {fetchingBestRoute ? (
        <Box mt={2} className='flex justify-center'>
          <p>{t('fetchingBestRoute')}...</p>
        </Box>
      ) : (
        <AdvancedSwapDetails trade={trade} />
      )}
      <Box className='swapButtonWrapper'>
        {showApproveFlow && (
          <Box width='48%'>
            <Button
              fullWidth
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
                  {t('approving')} <CircularProgress size={16} />
                </Box>
              ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                t('approved')
              ) : (
                `${t('approve')} ${currencies[Field.INPUT]?.symbol}`
              )}
            </Button>
          </Box>
        )}
        <Box width={showApproveFlow ? '48%' : '100%'}>
          <Button
            fullWidth
            disabled={swapButtonDisabled as boolean}
            onClick={account ? onSwap : connectWallet}
          >
            {swapButtonText}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Swap;
