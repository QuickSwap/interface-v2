import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  CurrencyAmount,
  JSBI,
  Trade,
  Token,
  ChainId,
  ETHER,
  currencyEquals,
  WETH,
} from '@uniswap/sdk';
import ReactGA from 'react-ga';
import { ArrowDown } from 'react-feather';
import { Box, Button, CircularProgress } from '@material-ui/core';
import { AML_SCORE_THRESHOLD } from 'config/index';
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from 'state/swap/hooks';
import {
  useExpertModeManager,
  useUserSlippageTolerance,
  useAmlScore,
} from 'state/user/hooks';
import { Field, SwapDelay } from 'state/swap/actions';
import {
  CurrencyInput,
  ConfirmSwapModal,
  AdvancedSwapDetails,
  AddressInput,
} from 'components';
import {
  useIsProMode,
  useActiveWeb3React,
  useMasaAnalytics,
  useConnectWallet,
} from 'hooks';
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
  useIsSupportedNetwork,
  confirmPriceImpactWithoutFee,
  maxAmountSpend,
  halfAmountSpend,
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
import { GlobalValue } from 'constants/index';
import { getConfig } from 'config/index';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';
import { V2_ROUTER_ADDRESS } from 'constants/v3/addresses';
import { useV2TradeTypeAnalyticsCallback } from './LiquidityHub';
import { SLIPPAGE_AUTO } from 'state/user/reducer';
import { useWalletInfo } from '@web3modal/ethers5/react';
import { useAppDispatch } from 'state';
import { updateUserBalance } from 'state/balance/actions';

const Swap: React.FC<{
  currencyBgClass?: string;
}> = ({ currencyBgClass }) => {
  const loadedUrlParams = useDefaultsFromURLSearch();
  const history = useHistory();
  const isProMode = useIsProMode();
  const isSupportedNetwork = useIsSupportedNetwork();

  // token warning stuff
  // const [loadedInputCurrency, loadedOutputCurrency] = [
  //   useCurrency(loadedUrlParams?.inputCurrencyId),
  //   useCurrency(loadedUrlParams?.outputCurrencyId),
  // ];
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(
    false,
  );
  // const urlLoadedTokens: Token[] = useMemo(
  //   () =>
  //     [loadedInputCurrency, loadedOutputCurrency]?.filter(
  //       (c): c is Token => c instanceof Token,
  //     ) ?? [],
  //   [loadedInputCurrency, loadedOutputCurrency],
  // );
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
  // const importTokensNotInDefault =
  //   urlLoadedTokens &&
  //   urlLoadedTokens.filter((token: Token) => {
  //     return !Boolean(token.address in defaultTokens);
  //   });

  const { t } = useTranslation();
  const { account, chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  const { independentField, typedValue, recipient, swapDelay } = useSwapState();
  const {
    v1Trade,
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
    autoSlippage,
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
  const dispatch = useAppDispatch();
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
  let [allowedSlippage] = useUserSlippageTolerance();
  allowedSlippage =
    allowedSlippage === SLIPPAGE_AUTO ? autoSlippage : allowedSlippage;
  const { isLoading: isAmlScoreLoading, score: amlScore } = useAmlScore();

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
  const [mainPrice, setMainPrice] = useState(true);
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee);
  const isValid = !swapInputError;

  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode);

  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true);
    } else if (approval === ApprovalState.APPROVED) {
      setApprovalSubmitted(false);
    }
  }, [approval, approvalSubmitted]);

  const { connectWallet } = useConnectWallet(isSupportedNetwork);
  const parsedQs = useParsedQueryString();
  const { redirectWithCurrency, redirectWithSwitch } = useSwapRedirects();
  const parsedCurrency0Id = (parsedQs.currency0 ??
    parsedQs.inputCurrency) as string;
  const parsedCurrency1Id = (parsedQs.currency1 ??
    parsedQs.outputCurrency) as string;

  const handleCurrencySelect = useCallback(
    (inputCurrency: any) => {
      setApprovalSubmitted(false); // reset 2 step UI for approvals
      const isSwichRedirect = currencyEquals(inputCurrency, ETHER[chainIdToUse])
        ? parsedCurrency1Id === 'ETH'
        : parsedCurrency1Id &&
          inputCurrency &&
          inputCurrency.address &&
          inputCurrency.address.toLowerCase() ===
            parsedCurrency1Id.toLowerCase();
      if (isSwichRedirect) {
        redirectWithSwitch();
      } else {
        if (!Boolean(inputCurrency.address in defaultTokens)) {
          setDismissTokenWarning(false);
        }
        redirectWithCurrency(inputCurrency, true);
      }
    },
    [
      parsedCurrency1Id,
      redirectWithCurrency,
      redirectWithSwitch,
      chainIdToUse,
      defaultTokens,
    ],
  );

  const handleOtherCurrencySelect = useCallback(
    (outputCurrency: any) => {
      const isSwichRedirect = currencyEquals(
        outputCurrency,
        ETHER[chainIdToUse],
      )
        ? parsedCurrency0Id === 'ETH'
        : parsedCurrency0Id &&
          outputCurrency &&
          outputCurrency.address &&
          outputCurrency.address.toLowerCase() ===
            parsedCurrency0Id.toLowerCase();
      if (isSwichRedirect) {
        redirectWithSwitch();
      } else {
        if (!Boolean(outputCurrency.address in defaultTokens)) {
          setDismissTokenWarning(false);
        }
        redirectWithCurrency(outputCurrency, false);
      }
    },
    [
      parsedCurrency0Id,
      redirectWithCurrency,
      redirectWithSwitch,
      chainIdToUse,
      defaultTokens,
    ],
  );

  const parsedCurrency0 = useCurrency(parsedCurrency0Id);
  const parsedCurrency1 = useCurrency(parsedCurrency1Id);
  const parsedCurrency0Fetched = !!parsedCurrency0;
  const parsedCurrency1Fetched = !!parsedCurrency1;
  useEffect(() => {
    if (
      history.location.pathname !== '/' &&
      !parsedCurrency0Id &&
      !parsedCurrency1Id
    ) {
      redirectWithCurrency(ETHER[chainIdToUse], true);
    } else {
      if (parsedCurrency0) {
        onCurrencySelection(Field.INPUT, parsedCurrency0);
      }
      if (parsedCurrency1) {
        onCurrencySelection(Field.OUTPUT, parsedCurrency1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    parsedCurrency0Id,
    parsedCurrency1Id,
    parsedCurrency0Fetched,
    parsedCurrency1Fetched,
  ]);

  const selectedTokens: Token[] = useMemo(
    () =>
      [parsedCurrency0, parsedCurrency1]?.filter(
        (c): c is Token => c instanceof Token,
      ) ?? [],
    [parsedCurrency0, parsedCurrency1],
  );
  const selectedTokensNotInDefault =
    selectedTokens &&
    selectedTokens.filter((token: Token) => {
      return !Boolean(token.address in defaultTokens);
    });

  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    recipient,
  );

  const swapButtonText = useMemo(() => {
    if (account) {
      if (!isSupportedNetwork) return t('switchNetwork');
      if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
        return t('selectToken');
      } else if (
        formattedAmounts[Field.INPUT] === '' &&
        formattedAmounts[Field.OUTPUT] === ''
      ) {
        return t('enterAmount');
      } else if (showWrap) {
        if (wrapInputError) return wrapInputError;
        return wrapType === WrapType.WRAP
          ? t('wrapMATIC', { symbol: ETHER[chainId].symbol })
          : wrapType === WrapType.UNWRAP
          ? t('unwrapMATIC', { symbol: WETH[chainId].symbol })
          : wrapType === WrapType.WRAPPING
          ? t('wrappingMATIC', { symbol: ETHER[chainId].symbol })
          : wrapType === WrapType.UNWRAPPING
          ? t('unwrappingMATIC', { symbol: WETH[chainId].symbol })
          : '';
      } else if (noRoute && userHasSpecifiedInputOutput) {
        return t('insufficientLiquidityTrade');
      } else if (priceImpactSeverity > 3 && !isExpertMode) {
        return t('priceImpactReachedV2', {
          maxImpact: Number(
            GlobalValue.percents.ALLOWED_PRICE_IMPACT_HIGH.multiply(
              '100',
            ).toFixed(4),
          ),
        });
      } else {
        return swapInputError ?? swapCallbackError ?? t('swap');
      }
    } else {
      return t('connectWallet');
    }
  }, [
    account,
    isSupportedNetwork,
    t,
    currencies,
    formattedAmounts,
    showWrap,
    noRoute,
    userHasSpecifiedInputOutput,
    priceImpactSeverity,
    isExpertMode,
    wrapInputError,
    wrapType,
    chainId,
    swapInputError,
    swapCallbackError,
  ]);

  const swapButtonDisabled = useMemo(() => {
    const inputCurrency = currencies[Field.INPUT];
    if (account) {
      if (!isSupportedNetwork) return false;
      if (showWrap) {
        return (
          Boolean(wrapInputError) ||
          wrapType === WrapType.WRAPPING ||
          wrapType === WrapType.UNWRAPPING
        );
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
            chainId &&
            currencyEquals(inputCurrency, ETHER[chainId]) &&
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
    currencies,
    account,
    isSupportedNetwork,
    showWrap,
    noRoute,
    userHasSpecifiedInputOutput,
    showApproveFlow,
    wrapInputError,
    wrapType,
    isValid,
    approval,
    priceImpactSeverity,
    isExpertMode,
    chainId,
    swapCallbackError,
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
    chainIdToUse,
    currencyBalances[Field.INPUT],
  );

  const halfAmountInput: CurrencyAmount | undefined = halfAmountSpend(
    chainIdToUse,
    currencyBalances[Field.INPUT],
  );

  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact());
  }, [maxAmountInput, onUserInput]);

  const handleHalfInput = useCallback(() => {
    if (!halfAmountInput) {
      return;
    }

    onUserInput(Field.INPUT, halfAmountInput.toExact());
  }, [halfAmountInput, onUserInput]);

  const atMaxAmountInput = Boolean(
    maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput),
  );

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

  const { fireEvent } = useMasaAnalytics();
  const config = getConfig(chainId);
  const fromTokenWrapped = wrappedCurrency(currencies[Field.INPUT], chainId);
  const { price: fromTokenUSDPrice } = useUSDCPriceFromAddress(
    fromTokenWrapped?.address ?? '',
  );

  const onV2TradeAnalytics = useV2TradeTypeAnalyticsCallback(
    currencies,
    allowedSlippage,
  );

  const { walletInfo } = useWalletInfo();

  const handleSwap = useCallback(() => {
    onV2TradeAnalytics(trade);
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
          dispatch(updateUserBalance());
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
          if (
            account &&
            fromTokenWrapped &&
            walletInfo &&
            chainId === ChainId.MATIC
          ) {
            fireEvent('trade', {
              user_address: account,
              network: config['networkName'],
              contract_address: V2_ROUTER_ADDRESS[chainId],
              asset_amount: formattedAmounts[Field.INPUT],
              asset_ticker: fromTokenWrapped.symbol ?? '',
              additionalEventData: {
                wallet: walletInfo.name,
                asset_usd_amount: (
                  Number(formattedAmounts[Field.INPUT]) * fromTokenUSDPrice
                ).toString(),
              },
            });
          }
        } catch (error) {
          setSwapState({
            attemptingTxn: false,
            tradeToConfirm,
            showConfirm,
            swapErrorMessage: error?.message,
            txHash: undefined,
          });
        }
      })
      .catch((error) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error?.message,
          txHash: undefined,
        });
      });
  }, [
    onV2TradeAnalytics,
    trade,
    priceImpactWithoutFee,
    t,
    swapCallback,
    tradeToConfirm,
    showConfirm,
    finalizedTransaction,
    dispatch,
    recipient,
    recipientAddress,
    account,
    fromTokenWrapped,
    walletInfo,
    chainId,
    fireEvent,
    config,
    formattedAmounts,
    fromTokenUSDPrice,
  ]);

  const onSwap = useCallback(() => {
    if (amlScore > AML_SCORE_THRESHOLD) {
      history.push('/forbidden');
      return;
    }
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
  }, [amlScore, showWrap, onWrap, isExpertMode, history, handleSwap, trade]);

  const fetchingBestRoute =
    swapDelay === SwapDelay.USER_INPUT ||
    swapDelay === SwapDelay.FETCHING_SWAP ||
    swapDelay === SwapDelay.FETCHING_BONUS;

  return (
    <Box>
      <TokenWarningModal
        isOpen={selectedTokensNotInDefault.length > 0 && !dismissTokenWarning}
        tokens={selectedTokensNotInDefault}
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
      {!showWrap && fetchingBestRoute ? (
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
              {approvalSubmitted && approval !== ApprovalState.APPROVED ? (
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
            disabled={
              isAmlScoreLoading ||
              showApproveFlow ||
              (swapButtonDisabled as boolean)
            }
            onClick={account && isSupportedNetwork ? onSwap : connectWallet}
          >
            {swapButtonText}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Swap;
