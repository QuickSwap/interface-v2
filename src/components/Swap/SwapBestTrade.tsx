import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  JSBI,
  Trade,
  Token,
  currencyEquals,
  ETHER,
  Fraction,
  ChainId,
  WETH,
} from '@uniswap/sdk';
import { Currency, CurrencyAmount, NativeCurrency } from '@uniswap/sdk-core';
import ReactGA from 'react-ga';
import { ArrowDown } from 'react-feather';
import { Box, Button, CircularProgress } from '@material-ui/core';
import {
  useNetworkSelectionModalToggle,
  useWalletModalToggle,
} from 'state/application/hooks';
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
import { Field } from 'state/swap/actions';
import { useHistory } from 'react-router-dom';
import { CurrencyInput, ConfirmSwapModal, AddressInput } from 'components';
import { useActiveWeb3React, useIsProMode } from 'hooks';
import {
  ApprovalState,
  useApproveCallbackFromBestTrade,
} from 'hooks/useApproveCallback';
import { useTransactionFinalizer } from 'state/transactions/hooks';
import useENSAddress from 'hooks/useENSAddress';
import useWrapCallback, { WrapType } from 'hooks/useWrapCallback';
import {
  useIsSupportedNetwork,
  maxAmountSpend,
  basisPointsToPercent,
  getContract,
} from 'utils';
import { ReactComponent as PriceExchangeIcon } from 'assets/images/PriceExchangeIcon.svg';
import { ReactComponent as ExchangeIcon } from 'assets/images/ExchangeIcon.svg';
import 'components/styles/Swap.scss';
import { useTranslation } from 'react-i18next';
import { useParaswapCallback } from 'hooks/useParaswapCallback';
import { getBestTradeCurrencyAddress, useParaswap } from 'hooks/useParaswap';
import { SwapSide } from '@paraswap/sdk';
import { BestTradeAdvancedSwapDetails } from './BestTradeAdvancedSwapDetails';
import {
  GlobalValue,
  paraswapTax,
  RouterTypes,
  SmartRouter,
} from 'constants/index';
import { useQuery } from '@tanstack/react-query';
import { useAllTokens, useCurrency } from 'hooks/Tokens';
import TokenWarningModal from 'components/v3/TokenWarningModal';
import useParsedQueryString from 'hooks/useParsedQueryString';
import useSwapRedirects from 'hooks/useSwapRedirect';
import callWallchainAPI from 'utils/wallchainService';
import ParaswapABI from 'constants/abis/ParaSwap_ABI.json';
import { ONE } from 'v3lib/utils';
import { SWAP_ROUTER_ADDRESS } from 'constants/v3/addresses';
import { useLiquidityHubAnalyticsListeners } from './LiquidityHub';

const SwapBestTrade: React.FC<{
  currencyBgClass?: string;
}> = ({ currencyBgClass }) => {
  const history = useHistory();
  const loadedUrlParams = useDefaultsFromURLSearch();
  const isProMode = useIsProMode();
  const isSupportedNetwork = useIsSupportedNetwork();

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ];
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(
    false,
  );
  const [bonusRouteLoading, setBonusRouteLoading] = useState(false);
  const [bonusRouteFound, setBonusRouteFound] = useState(false);

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
    history.push('/swap');
  }, [history]);

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens();
  const importTokensNotInDefault =
    urlLoadedTokens &&
    urlLoadedTokens.filter((token: Token) => {
      return !Boolean(token.address in defaultTokens);
    });

  const { t } = useTranslation();
  const { account, chainId, library } = useActiveWeb3React();
  const { independentField, typedValue, recipient } = useSwapState();
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  const {
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = useDerivedSwapInfo();
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
  const [swapType, setSwapType] = useState<SwapSide>(SwapSide.SELL);

  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;

  const {
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
    onBestRoute,
    onSetSwapDelay,
  } = useSwapActionHandlers();
  const { address: recipientAddress } = useENSAddress(recipient);
  const [allowedSlippage] = useUserSlippageTolerance();
  const pct = basisPointsToPercent(allowedSlippage);
  const [approving, setApproving] = useState(false);

  const dependentField: Field =
    independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;
  const inputCurrency = currencies[Field.INPUT];
  const outputCurrency = currencies[Field.OUTPUT];

  const inputCurrencyV3 = useMemo(() => {
    if (!inputCurrency || !chainId) return;
    if (currencyEquals(inputCurrency, ETHER[chainId])) {
      return {
        ...ETHER[chainId],
        isNative: true,
        isToken: false,
      } as NativeCurrency;
    }
    return { ...inputCurrency, isNative: false, isToken: true } as Currency;
  }, [chainId, inputCurrency]);

  const outputCurrencyV3 = useMemo(() => {
    if (!outputCurrency || !chainId) return;
    if (currencyEquals(outputCurrency, ETHER[chainId]))
      return {
        ...ETHER[chainId],
        isNative: true,
        isToken: false,
      } as NativeCurrency;
    return { ...outputCurrency, isNative: false, isToken: true } as Currency;
  }, [chainId, outputCurrency]);

  const [optimalRateError, setOptimalRateError] = useState('');
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);
  const [mainPrice, setMainPrice] = useState(true);
  const isValid = !swapInputError && !optimalRateError;

  //TODO: move to utils
  const connectWallet = () => {
    if (!isSupportedNetwork) {
      toggleNetworkSelectionModal();
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
      const isSwichRedirect = currencyEquals(inputCurrency, ETHER[chainIdToUse])
        ? parsedCurrency1Id === 'ETH'
        : parsedCurrency1Id &&
          inputCurrency &&
          inputCurrency.address &&
          inputCurrency.address.toLowerCase() ===
            parsedCurrency1Id.toLowerCase();
      if (isSwichRedirect) {
        redirectWithSwitch();
        setSwapType(swapType === SwapSide.BUY ? SwapSide.SELL : SwapSide.BUY);
      } else {
        redirectWithCurrency(inputCurrency, true);
      }
    },
    [
      chainIdToUse,
      parsedCurrency1Id,
      redirectWithSwitch,
      swapType,
      redirectWithCurrency,
    ],
  );

  const parsedCurrency0 = useCurrency(parsedCurrency0Id);
  useEffect(() => {
    if (parsedCurrency0) {
      onCurrencySelection(Field.INPUT, parsedCurrency0);
    } else if (parsedCurrency0 === undefined && !parsedCurrency1Id) {
      redirectWithCurrency(ETHER[chainIdToUse], true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedCurrency0, parsedCurrency1Id, chainIdToUse]);

  const handleOtherCurrencySelect = useCallback(
    (outputCurrency) => {
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
        setSwapType(swapType === SwapSide.BUY ? SwapSide.SELL : SwapSide.BUY);
      } else {
        redirectWithCurrency(outputCurrency, false);
      }
    },
    [
      chainIdToUse,
      parsedCurrency0Id,
      redirectWithSwitch,
      swapType,
      redirectWithCurrency,
    ],
  );

  const parsedCurrency1 = useCurrency(parsedCurrency1Id);
  useEffect(() => {
    if (parsedCurrency1) {
      onCurrencySelection(Field.OUTPUT, parsedCurrency1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedCurrency1Id]);

  const paraswap = useParaswap();

  const srcToken = inputCurrency
    ? getBestTradeCurrencyAddress(inputCurrency, chainIdToUse)
    : undefined;
  const destToken = outputCurrency
    ? getBestTradeCurrencyAddress(outputCurrency, chainIdToUse)
    : undefined;

  const srcDecimals = inputCurrency?.decimals;
  const destDecimals = outputCurrency?.decimals;
  const tradeDecimals = swapType === SwapSide.SELL ? srcDecimals : destDecimals;

  const srcAmount =
    parsedAmount && tradeDecimals
      ? parsedAmount.multiply(JSBI.BigInt(10 ** tradeDecimals)).toFixed(0)
      : undefined;

  const maxImpactAllowed = isExpertMode
    ? 100
    : Number(
        GlobalValue.percents.BLOCKED_PRICE_IMPACT_NON_EXPERT.multiply(
          '100',
        ).toFixed(4),
      );

  const fetchOptimalRate = async () => {
    if (
      !srcToken ||
      !destToken ||
      !srcAmount ||
      !account ||
      !chainId ||
      !library
    ) {
      return null;
    }
    try {
      const rate = await paraswap.getRate({
        srcToken,
        destToken,
        srcDecimals,
        destDecimals,
        amount: srcAmount,
        side: swapType,
        options: {
          includeDEXS: 'quickswap,quickswapv3,quickswapv3.1',
          maxImpact: maxImpactAllowed,
          partner: 'quickswapv3',
          //@ts-ignore
          srcTokenTransferFee: paraswapTax[srcToken.toLowerCase()],
          destTokenTransferFee: paraswapTax[destToken.toLowerCase()],
        },
      });

      setOptimalRateError('');
      return rate;
    } catch (err) {
      setOptimalRateError(err.message);
      return null;
    }
  };

  const { data: optimalRate, refetch: reFetchOptimalRate } = useQuery({
    queryKey: [
      'fetchOptimalRate',
      srcToken,
      destToken,
      srcAmount,
      swapType,
      account,
      chainId,
      maxImpactAllowed,
    ],
    queryFn: fetchOptimalRate,
  });

  const parsedAmounts = useMemo(() => {
    const parsedAmountInput =
      inputCurrencyV3 && parsedAmount
        ? CurrencyAmount.fromRawAmount(inputCurrencyV3, parsedAmount.raw)
        : undefined;
    const parsedAmountOutput =
      outputCurrencyV3 && parsedAmount
        ? CurrencyAmount.fromRawAmount(outputCurrencyV3, parsedAmount.raw)
        : undefined;

    return showWrap
      ? {
          [Field.INPUT]: parsedAmountInput,
          [Field.OUTPUT]: parsedAmountOutput,
        }
      : {
          [Field.INPUT]:
            independentField === Field.INPUT
              ? parsedAmountInput
              : optimalRate && inputCurrencyV3
              ? CurrencyAmount.fromRawAmount(
                  inputCurrencyV3,
                  JSBI.BigInt(optimalRate.srcAmount),
                )
              : undefined,
          [Field.OUTPUT]:
            independentField === Field.OUTPUT
              ? parsedAmountOutput
              : optimalRate && outputCurrencyV3
              ? CurrencyAmount.fromRawAmount(
                  outputCurrencyV3,
                  JSBI.BigInt(optimalRate.destAmount),
                )
              : undefined,
        };
  }, [
    parsedAmount,
    independentField,
    showWrap,
    optimalRate,
    inputCurrencyV3,
    outputCurrencyV3,
  ]);

  const maxAmountInputV2 = maxAmountSpend(
    chainIdToUse,
    currencyBalances[Field.INPUT],
  );
  const formattedAmounts = useMemo(() => {
    return {
      [independentField]: typedValue,
      [dependentField]: showWrap
        ? parsedAmounts[independentField]?.toExact() ?? ''
        : parsedAmounts[dependentField]?.toExact() ?? '',
    };
  }, [independentField, typedValue, dependentField, showWrap, parsedAmounts]);

  const maxAmountInput =
    maxAmountInputV2 && inputCurrencyV3
      ? CurrencyAmount.fromRawAmount(inputCurrencyV3, maxAmountInputV2.raw)
      : undefined;

  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact());
    setSwapType(SwapSide.SELL);
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
    setSwapType(SwapSide.SELL);
  }, [maxAmountInput, onUserInput]);

  const atMaxAmountInput = Boolean(
    maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput),
  );

  const [approval, approveCallback] = useApproveCallbackFromBestTrade(
    pct,
    inputCurrencyV3,
    optimalRate,
    bonusRouteFound,
    atMaxAmountInput,
  );

  const showApproveFlow =
    !swapInputError &&
    !showWrap &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED));

  const toggleWalletModal = useWalletModalToggle();
  const toggleNetworkSelectionModal = useNetworkSelectionModalToggle();

  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true);
    }
  }, [approval, approvalSubmitted]);

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] &&
      currencies[Field.OUTPUT] &&
      parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0)),
  );

  const {
    callback: paraswapCallback,
    error: paraswapCallbackError,
  } = useParaswapCallback(
    optimalRate,
    recipient,
    inputCurrency,
    outputCurrency,
  );

  const noRoute = !optimalRate || optimalRate.bestRoute.length < 0;
  const swapInputAmountWithSlippage =
    optimalRate && inputCurrencyV3
      ? CurrencyAmount.fromRawAmount(
          inputCurrencyV3,
          (optimalRate.side === SwapSide.BUY
            ? new Fraction(ONE).add(pct)
            : new Fraction(ONE)
          ).multiply(optimalRate.srcAmount).quotient,
        )
      : undefined;

  const swapInputBalanceCurrency = currencyBalances[Field.INPUT];

  const swapInputBalance =
    swapInputBalanceCurrency && inputCurrencyV3
      ? CurrencyAmount.fromRawAmount(
          inputCurrencyV3,
          swapInputBalanceCurrency.raw.toString(),
        )
      : undefined;

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
      } else if (
        optimalRateError === 'ESTIMATED_LOSS_GREATER_THAN_MAX_IMPACT'
      ) {
        return t('priceImpactReached', { maxImpact: maxImpactAllowed });
      } else if (optimalRateError) {
        return optimalRateError.includes('<!DOCTYPE')
          ? t('bestTradeBanned')
          : optimalRateError;
      } else if (swapInputError) {
        return swapInputError;
      } else if (noRoute && userHasSpecifiedInputOutput) {
        return t('insufficientLiquidityTrade');
      } else if (
        swapInputAmountWithSlippage &&
        swapInputBalance &&
        swapInputAmountWithSlippage.greaterThan(swapInputBalance)
      ) {
        return t('insufficientBalance', {
          symbol: currencies[Field.INPUT]?.symbol,
        });
      } else if (bonusRouteLoading) {
        return t('fetchingBestRoute');
      } else {
        return t('swap');
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
    optimalRateError,
    swapInputError,
    noRoute,
    userHasSpecifiedInputOutput,
    swapInputAmountWithSlippage,
    swapInputBalance,
    bonusRouteLoading,
    wrapInputError,
    wrapType,
    chainId,
    maxImpactAllowed,
  ]);

  const swapButtonDisabled = useMemo(() => {
    const isSwapError =
      (inputCurrencyV3 &&
        inputCurrencyV3.isToken &&
        approval === ApprovalState.UNKNOWN) ||
      !isValid ||
      (optimalRate && optimalRate.maxImpactReached && !isExpertMode) ||
      !!paraswapCallbackError ||
      (optimalRate &&
        !parsedAmounts[Field.INPUT]?.equalTo(
          JSBI.BigInt(optimalRate.srcAmount),
        )) ||
      (optimalRate &&
        !parsedAmounts[Field.OUTPUT]?.equalTo(
          JSBI.BigInt(optimalRate.destAmount),
        )) ||
      (swapInputAmountWithSlippage &&
        swapInputBalance &&
        swapInputAmountWithSlippage.greaterThan(swapInputBalance));
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
          (optimalRate && optimalRate.maxImpactReached && !isExpertMode) ||
          isSwapError
        );
      } else {
        return isSwapError;
      }
    } else {
      return false;
    }
  }, [
    inputCurrencyV3,
    approval,
    isValid,
    optimalRate,
    isExpertMode,
    paraswapCallbackError,
    parsedAmounts,
    swapInputAmountWithSlippage,
    swapInputBalance,
    account,
    isSupportedNetwork,
    showWrap,
    noRoute,
    userHasSpecifiedInputOutput,
    showApproveFlow,
    wrapInputError,
    wrapType,
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

  useLiquidityHubAnalyticsListeners(
    showConfirm,
    attemptingTxn,
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    formattedAmounts[Field.INPUT],
  );

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value);
      setSwapType(SwapSide.SELL);
    },
    [onUserInput],
  );
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value);
      setSwapType(SwapSide.BUY);
    },
    [onUserInput],
  );

  const onParaswap = () => {
    if (showWrap && onWrap) {
      onWrap();
    } else if (isExpertMode) {
      handleParaswap();
    } else {
      setSwapState({
        tradeToConfirm: undefined,
        attemptingTxn: false,
        swapErrorMessage: undefined,
        showConfirm: true,
        txHash: undefined,
      });
    }
  };

  const handleAcceptChanges = useCallback(() => {
    setSwapState({
      tradeToConfirm: undefined,
      swapErrorMessage,
      txHash,
      attemptingTxn,
      showConfirm,
    });
  }, [attemptingTxn, showConfirm, swapErrorMessage, txHash]);

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

  const handleParaswap = useCallback(() => {
    if (!paraswapCallback) {
      return;
    }

    setSwapState({
      attemptingTxn: true,
      tradeToConfirm,
      showConfirm,
      swapErrorMessage: undefined,
      txHash: undefined,
    });
    paraswapCallback()
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
            label: [inputCurrency?.symbol, outputCurrency?.symbol].join('/'),
          });
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
    paraswapCallback,
    tradeToConfirm,
    showConfirm,
    finalizedTransaction,
    recipient,
    recipientAddress,
    account,
    inputCurrency?.symbol,
    outputCurrency?.symbol,
  ]);

  const paraRate = optimalRate
    ? (Number(optimalRate.destAmount) * 10 ** optimalRate.srcDecimals) /
      (Number(optimalRate.srcAmount) * 10 ** optimalRate.destDecimals)
    : undefined;

  const swapDisabledForTx = useMemo(() => {
    if (account) {
      if (showWrap) {
        return Boolean(wrapInputError);
      } else if (noRoute && userHasSpecifiedInputOutput) {
        return true;
      } else {
        return (
          !isValid ||
          (optimalRate && optimalRate.maxImpactReached && !isExpertMode) ||
          !!paraswapCallbackError ||
          (optimalRate &&
            !parsedAmounts[Field.INPUT]?.equalTo(
              JSBI.BigInt(optimalRate.srcAmount),
            )) ||
          (optimalRate &&
            !parsedAmounts[Field.OUTPUT]?.equalTo(
              JSBI.BigInt(optimalRate.destAmount),
            )) ||
          (swapInputAmountWithSlippage &&
            swapInputBalance &&
            swapInputAmountWithSlippage.greaterThan(swapInputBalance))
        );
      }
    } else {
      return false;
    }
  }, [
    account,
    showWrap,
    noRoute,
    userHasSpecifiedInputOutput,
    wrapInputError,
    isValid,
    optimalRate,
    isExpertMode,
    paraswapCallbackError,
    parsedAmounts,
    swapInputAmountWithSlippage,
    swapInputBalance,
  ]);
  const swapIsReady = Boolean(!swapDisabledForTx && !optimalRateError);
  const inputCurrencySymbol = inputCurrency?.symbol;
  const inputCurrencyAny = inputCurrency as any;
  const inputCurrencyAddress =
    inputCurrencyAny && inputCurrencyAny.address
      ? inputCurrencyAny.address.toLowerCase()
      : undefined;
  const outputCurrencySymbol = outputCurrency?.symbol;
  const outputCurrencyAny = outputCurrency as any;
  const outputCurrencyAddress =
    outputCurrencyAny && outputCurrencyAny.address
      ? outputCurrencyAny.address.toLowerCase()
      : undefined;

  useEffect(() => {
    const bonusSwapRouterAddress = chainId
      ? SWAP_ROUTER_ADDRESS[chainId]
      : undefined;
    (async () => {
      if (
        swapIsReady &&
        inputCurrency &&
        !currencyEquals(inputCurrency, ETHER[chainIdToUse]) &&
        optimalRate &&
        account &&
        library &&
        chainId &&
        approval === ApprovalState.APPROVED &&
        bonusSwapRouterAddress
      ) {
        setBonusRouteFound(false);
        setBonusRouteLoading(true);
        try {
          const txParams = await paraswap.buildTx({
            srcToken: optimalRate.srcToken,
            destToken: optimalRate.destToken,
            srcAmount: optimalRate.srcAmount,
            destAmount: optimalRate.destAmount,
            priceRoute: optimalRate,
            userAddress: account,
            partner: 'quickswapv3',
          });

          if (txParams.data) {
            const paraswapContract = getContract(
              optimalRate.contractAddress,
              ParaswapABI,
              library,
              account,
            );
            const response = await callWallchainAPI(
              optimalRate.contractMethod,
              txParams.data,
              txParams.value,
              chainId,
              account,
              paraswapContract,
              SmartRouter.PARASWAP,
              RouterTypes.SMART,
              onBestRoute,
              onSetSwapDelay,
              50,
            );
            setBonusRouteFound(response ? response.pathFound : false);
          } else {
            setBonusRouteFound(false);
          }
          setBonusRouteLoading(false);
        } catch (e) {
          setBonusRouteFound(false);
          setBonusRouteLoading(false);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    swapIsReady,
    inputCurrencySymbol,
    inputCurrencyAddress,
    outputCurrencySymbol,
    outputCurrencyAddress,
    typedValue,
    approval, //Added to trigger bonus route search when approval changes
  ]);
  //Reset approvalSubmitted when approval changes, it's needed when user hadn't nor paraswap neither wallchain approvals
  useEffect(() => {
    if (
      bonusRouteFound &&
      (approval === ApprovalState.NOT_APPROVED ||
        approval === ApprovalState.UNKNOWN)
    ) {
      setApprovalSubmitted(false);
    }
  }, [approval, bonusRouteFound]);

  useEffect(() => {
    fetchOptimalRate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typedValue, independentField, inputCurrency, outputCurrency]);

  useEffect(() => {
    if (!optimalRate) {
      reFetchOptimalRate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optimalRate]);

  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000);
      setCurrentTime(_currentTime);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    reFetchOptimalRate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

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
          optimalRate={optimalRate}
          inputCurrency={inputCurrency}
          outputCurrency={outputCurrency}
          originalTrade={tradeToConfirm}
          onAcceptChanges={handleAcceptChanges}
          attemptingTxn={attemptingTxn}
          txPending={txPending}
          txHash={txHash}
          recipient={recipient}
          allowedSlippage={allowedSlippage}
          onConfirm={handleParaswap}
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
        <ExchangeIcon
          onClick={() => {
            setSwapType(
              swapType === SwapSide.BUY ? SwapSide.SELL : SwapSide.BUY,
            );
            redirectWithSwitch();
          }}
        />
      </Box>
      <CurrencyInput
        title={`${t('toEstimate')}:`}
        id='swap-currency-output'
        currency={currencies[Field.OUTPUT]}
        showPrice={Boolean(optimalRate)}
        showMaxButton={false}
        otherCurrency={currencies[Field.INPUT]}
        handleCurrencySelect={handleOtherCurrencySelect}
        amount={formattedAmounts[Field.OUTPUT]}
        setAmount={handleTypeOutput}
        color={isProMode ? 'white' : 'secondary'}
        bgClass={isProMode ? 'swap-bg-highlight' : currencyBgClass}
      />
      {paraRate && (
        <Box className='swapPrice'>
          <small>{t('price')}:</small>
          <small>
            1{' '}
            {
              (mainPrice ? currencies[Field.INPUT] : currencies[Field.OUTPUT])
                ?.symbol
            }{' '}
            = {(mainPrice ? paraRate : 1 / paraRate).toLocaleString('us')}{' '}
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
      <BestTradeAdvancedSwapDetails
        optimalRate={optimalRate}
        inputCurrency={inputCurrency}
        outputCurrency={outputCurrency}
      />
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
            disabled={
              (bonusRouteLoading ||
                optimalRateError ||
                swapButtonDisabled) as boolean
            }
            onClick={account && isSupportedNetwork ? onParaswap : connectWallet}
          >
            {swapButtonText}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SwapBestTrade;
