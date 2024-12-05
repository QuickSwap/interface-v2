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
import { Box, Button, CircularProgress, Typography } from '@material-ui/core';
import { AML_SCORE_THRESHOLD } from 'config/index';
import SpinnerImage from 'assets/images/spinner.svg';

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
import { Field } from 'state/swap/actions';
import { useHistory, useLocation } from 'react-router-dom';
import {
  CurrencyInput,
  ConfirmSwapModal,
  AddressInput,
  Eggs,
  CustomModal,
} from 'components';
import {
  useActiveWeb3React,
  useConnectWallet,
  useIsProMode,
  useMasaAnalytics,
} from 'hooks';
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
  halfAmountSpend,
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
  paraswapTaxSell,
  paraswapTaxBuy,
  RouterTypes,
  SmartRouter,
  DRAGON_EGGS_SHOW,
} from 'constants/index';
import { useQuery } from '@tanstack/react-query';
import { useAllTokens, useCurrency } from 'hooks/Tokens';
import TokenWarningModal from 'components/v3/TokenWarningModal';
import useParsedQueryString from 'hooks/useParsedQueryString';
import useSwapRedirects from 'hooks/useSwapRedirect';
import callWallchainAPI from 'utils/wallchainService';
import ParaswapABI from 'constants/abis/ParaSwap_ABI.json';
import { ONE } from 'v3lib/utils';
import { NATIVE_CONVERTER, SWAP_ROUTER_ADDRESS } from 'constants/v3/addresses';
import { getConfig } from 'config/index';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import useNativeConvertCallback, {
  ConvertType,
} from 'hooks/useNativeConvertCallback';
import { useApproveCallback } from 'hooks/useApproveCallback';
import { SLIPPAGE_AUTO } from 'state/user/reducer';
import arrowDown from 'assets/images/icons/arrow-down.png';
import chart from 'assets/images/icons/chart.svg';
import SignUp from './SignUp';
import { useWalletInfo } from '@web3modal/ethers5/react';
import { useAppDispatch } from 'state';
import { updateUserBalance } from 'state/balance/actions';
import {
  useIsLhPureAggregationMode,
  useLiquidityHubQuote,
  useGetBetterPrice,
} from './orbs/LiquidityHub/hooks';
import { LiquidityHubSwapConfirmation } from './orbs/LiquidityHub/LiquidityHubSwapConfirmation';
import { PoweredByOrbs } from '@orbs-network/swap-ui';
import {
  LiquidityHubSwapDetails,
  SwapPrice,
} from './orbs/LiquidityHub/Components';
import { styled } from '@material-ui/styles';

const SwapBestTrade: React.FC<{
  currencyBgClass?: string;
}> = ({ currencyBgClass }) => {
  const history = useHistory();
  const loadedUrlParams = useDefaultsFromURLSearch();
  const isProMode = useIsProMode();
  const isSupportedNetwork = useIsSupportedNetwork();
  const { walletInfo } = useWalletInfo();
  const [liquidityHubDisabled, setLiquidityHubDisabled] = useState(false);
  const [swappingLiquidityHub, setSwappingLiquidityHub] = useState(false);
  const [showLiquidityHubConfirm, setShowLiquidityHubConfirm] = useState(false);

  // token warning stuff
  // const [loadedInputCurrency, loadedOutputCurrency] = [
  //   useCurrency(loadedUrlParams?.inputCurrencyId),
  //   useCurrency(loadedUrlParams?.outputCurrencyId),
  // ];
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(
    false,
  );
  const [bonusRouteLoading, setBonusRouteLoading] = useState(false);
  const [bonusRouteFound, setBonusRouteFound] = useState(false);

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
    history.push('/swap');
  }, [history]);

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens();
  // const importTokensNotInDefault =
  //   urlLoadedTokens &&
  //   urlLoadedTokens.filter((token: Token) => {
  //     return !Boolean(token.address in defaultTokens);
  //   });

  const { t } = useTranslation();
  const { account, chainId, library } = useActiveWeb3React();
  const { independentField, typedValue, recipient } = useSwapState();
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  const isLhPureAggregationMode = useIsLhPureAggregationMode();

  const {
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
    autoSlippage,
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

  const dispatch = useAppDispatch();
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
  let [allowedSlippage] = useUserSlippageTolerance();
  allowedSlippage =
    allowedSlippage === SLIPPAGE_AUTO ? autoSlippage : allowedSlippage;
  const { isLoading: isAmlScoreLoading, score: amlScore } = useAmlScore();

  const pct = basisPointsToPercent(allowedSlippage);
  const [approving, setApproving] = useState(false);
  const [nativeConvertApproving, setNativeConvertApproving] = useState(false);

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

  const {
    convertType,
    execute: onConvert,
    inputError: convertInputError,
  } = useNativeConvertCallback(
    inputCurrencyV3?.isToken ? inputCurrencyV3 : undefined,
    outputCurrencyV3?.isToken ? outputCurrencyV3 : undefined,
    typedValue,
  );

  const showNativeConvert = convertType !== ConvertType.NOT_APPLICABLE;

  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);
  const [nativeApprovalSubmitted, setNativeApprovalSubmitted] = useState<
    boolean
  >(false);
  const [mainPrice, setMainPrice] = useState(true);

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
      setNativeApprovalSubmitted(false);
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
        if (!Boolean(inputCurrency.address in defaultTokens)) {
          setDismissTokenWarning(false);
        }
        redirectWithCurrency(inputCurrency, true);
      }
    },
    [
      chainIdToUse,
      defaultTokens,
      parsedCurrency1Id,
      redirectWithCurrency,
      redirectWithSwitch,
      swapType,
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
        setSwapType(swapType === SwapSide.BUY ? SwapSide.SELL : SwapSide.BUY);
      } else {
        if (!Boolean(outputCurrency.address in defaultTokens)) {
          setDismissTokenWarning(false);
        }
        redirectWithCurrency(outputCurrency, false);
      }
    },
    [
      chainIdToUse,
      parsedCurrency0Id,
      redirectWithSwitch,
      swapType,
      redirectWithCurrency,
      defaultTokens,
    ],
  );

  const parsedCurrency0 = useCurrency(parsedCurrency0Id);
  const parsedCurrency1 = useCurrency(parsedCurrency1Id);
  const parsedCurrency0Fetched = !!parsedCurrency0;
  const parsedCurrency1Fetched = !!parsedCurrency1;

  useEffect(() => {
    if (parsedCurrency0 === undefined && !parsedCurrency1Id) {
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
          includeDEXS: 'quickswap,quickswapv3,quickswapv3.1,quickperps',
          maxImpact: maxImpactAllowed,
          partner: 'quickswapv3',
          //@ts-ignore
          srcTokenTransferFee: paraswapTaxSell[srcToken.toLowerCase()],
          destTokenTransferFee: paraswapTaxBuy[destToken.toLowerCase()],
        },
      });

      return { error: undefined, rate };
    } catch (err) {
      return { error: err.message, rate: undefined };
    }
  };

  const {
    isLoading: loadingOptimalRate,
    data: optimalRateData,
    refetch: reFetchOptimalRate,
  } = useQuery({
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
    refetchInterval: 5000,
  });

  const optimalRate = useMemo(() => {
    if (!optimalRateData) return;
    return optimalRateData.rate;
  }, [optimalRateData]);

  const optimalRateError = useMemo(() => {
    if (!optimalRateData) return;
    return optimalRateData.error;
  }, [optimalRateData]);

  const {
    data: liquidityHubQuote,
    isLoading: liquidityHubQuoteLoading,
    error: liquidityHubQuoteError,
    refetch: fetchLiquidityHubQuote,
    getLatestQuote,
  } = useLiquidityHubQuote({
    allowedSlippage,
    inAmount: parsedAmount?.raw.toString(),
    inCurrency: currencies[Field.INPUT],
    outCurrency: currencies[Field.OUTPUT],
    dexOutAmount: optimalRate?.destAmount,
    disabled: swappingLiquidityHub
      ? true
      : isLhPureAggregationMode
      ? false
      : !showLiquidityHubConfirm,
  });

  const isLiquidityHubOnly = isLhPureAggregationMode && !liquidityHubQuoteError;

  const tradeSrcAmount = isLiquidityHubOnly
    ? liquidityHubQuote?.inAmount
    : optimalRate?.srcAmount;

  const tradeDestAmount = isLiquidityHubOnly
    ? liquidityHubQuote?.outAmount
    : optimalRate?.destAmount;

  const loadingTrade = isLiquidityHubOnly
    ? liquidityHubQuoteLoading
    : loadingOptimalRate;

  const isValid = isLiquidityHubOnly
    ? !!liquidityHubQuote
    : !optimalRateError && !!optimalRate;

  const parsedAmounts = useMemo(() => {
    const parsedAmountInput =
      inputCurrencyV3 && parsedAmount
        ? CurrencyAmount.fromRawAmount(inputCurrencyV3, parsedAmount.raw)
        : undefined;
    const parsedAmountOutput =
      outputCurrencyV3 && parsedAmount
        ? CurrencyAmount.fromRawAmount(outputCurrencyV3, parsedAmount.raw)
        : undefined;

    return showWrap || showNativeConvert
      ? {
          [Field.INPUT]: parsedAmountInput,
          [Field.OUTPUT]: parsedAmountOutput,
        }
      : {
          [Field.INPUT]:
            independentField === Field.INPUT
              ? parsedAmountInput
              : tradeSrcAmount && inputCurrencyV3
              ? CurrencyAmount.fromRawAmount(
                  inputCurrencyV3,
                  JSBI.BigInt(tradeSrcAmount),
                )
              : undefined,
          [Field.OUTPUT]:
            independentField === Field.OUTPUT
              ? parsedAmountOutput
              : tradeDestAmount && outputCurrencyV3
              ? CurrencyAmount.fromRawAmount(
                  outputCurrencyV3,
                  JSBI.BigInt(tradeDestAmount),
                )
              : undefined,
        };
  }, [
    inputCurrencyV3,
    parsedAmount,
    outputCurrencyV3,
    showWrap,
    showNativeConvert,
    independentField,
    tradeSrcAmount,
    tradeDestAmount,
  ]);

  const maxAmountInputV2 = maxAmountSpend(
    chainIdToUse,
    currencyBalances[Field.INPUT],
  );
  const halfAmountInputV2 = halfAmountSpend(
    chainIdToUse,
    currencyBalances[Field.INPUT],
  );
  const formattedAmounts = useMemo(() => {
    return {
      [independentField]: typedValue,
      [dependentField]:
        showWrap || showNativeConvert
          ? parsedAmounts[independentField]?.toExact() ?? ''
          : parsedAmounts[dependentField]?.toExact() ?? '',
    };
  }, [
    independentField,
    typedValue,
    dependentField,
    showWrap,
    showNativeConvert,
    parsedAmounts,
  ]);

  const maxAmountInput =
    maxAmountInputV2 && inputCurrencyV3
      ? CurrencyAmount.fromRawAmount(inputCurrencyV3, maxAmountInputV2.raw)
      : undefined;

  const halfAmountInput =
    halfAmountInputV2 && inputCurrencyV3
      ? CurrencyAmount.fromRawAmount(inputCurrencyV3, halfAmountInputV2.raw)
      : undefined;

  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact());
    setSwapType(SwapSide.SELL);
  }, [maxAmountInput, onUserInput]);

  const handleHalfInput = useCallback(() => {
    if (!halfAmountInput) {
      return;
    }

    onUserInput(Field.INPUT, halfAmountInput.toExact());
    setSwapType(SwapSide.SELL);
  }, [halfAmountInput, onUserInput]);

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

  const [
    nativeConvertApproval,
    nativeConvertApproveCallback,
  ] = useApproveCallback(parsedAmount, NATIVE_CONVERTER[chainId]);

  const showApproveFlow =
    !swapInputError &&
    !showWrap &&
    (showNativeConvert
      ? nativeConvertApproval === ApprovalState.NOT_APPROVED ||
        nativeConvertApproval === ApprovalState.PENDING ||
        (nativeApprovalSubmitted &&
          nativeConvertApproval === ApprovalState.APPROVED)
      : approval === ApprovalState.NOT_APPROVED ||
        approval === ApprovalState.PENDING ||
        (approvalSubmitted && approval === ApprovalState.APPROVED));

  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true);
    } else if (approval === ApprovalState.APPROVED) {
      setApprovalSubmitted(false);
    }
  }, [approval]);

  useEffect(() => {
    if (nativeConvertApproval === ApprovalState.PENDING) {
      setNativeApprovalSubmitted(true);
    }
  }, [nativeConvertApproval]);

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] &&
      currencies[Field.OUTPUT] &&
      parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0)),
  );

  const {
    callback: paraswapCallback,
    error: _paraswapCallbackError,
  } = useParaswapCallback(
    allowedSlippage,
    optimalRate,
    recipient,
    inputCurrency,
    outputCurrency,
  );

  const paraswapCallbackError = isLiquidityHubOnly
    ? undefined
    : _paraswapCallbackError;

  const noRoute = isLiquidityHubOnly
    ? !liquidityHubQuote
    : !optimalRate || optimalRate.bestRoute.length < 0;

  const swapInputAmountWithSlippage =
    isLiquidityHubOnly && inputCurrencyV3 && srcAmount
      ? CurrencyAmount.fromRawAmount(inputCurrencyV3, srcAmount)
      : optimalRate && inputCurrencyV3
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
      } else if (showNativeConvert) {
        if (convertInputError) return convertInputError;
        return convertType === ConvertType.CONVERT
          ? t('convert')
          : convertType === ConvertType.CONVERTING
          ? t('converting', { symbol: ETHER[chainId].symbol })
          : '';
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
      } else if (loadingTrade) {
        return t('loading');
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
    showNativeConvert,
    showWrap,
    loadingTrade,
    optimalRateError,
    swapInputError,
    noRoute,
    userHasSpecifiedInputOutput,
    swapInputAmountWithSlippage,
    swapInputBalance,
    bonusRouteLoading,
    convertInputError,
    convertType,
    chainId,
    wrapInputError,
    wrapType,
    maxImpactAllowed,
  ]);

  const maxImpactReached = isLiquidityHubOnly
    ? false
    : optimalRate?.maxImpactReached;

  const swapButtonDisabled = useMemo(() => {
    const isSwapError =
      (inputCurrencyV3 &&
        inputCurrencyV3.isToken &&
        approval === ApprovalState.UNKNOWN) ||
      !isValid ||
      (maxImpactReached && !isExpertMode) ||
      !!paraswapCallbackError ||
      (tradeSrcAmount &&
        !parsedAmounts[Field.INPUT]?.equalTo(JSBI.BigInt(tradeSrcAmount))) ||
      (tradeDestAmount &&
        !parsedAmounts[Field.OUTPUT]?.equalTo(JSBI.BigInt(tradeDestAmount))) ||
      (swapInputAmountWithSlippage &&
        swapInputBalance &&
        swapInputAmountWithSlippage.greaterThan(swapInputBalance));

    if (account) {
      if (!isSupportedNetwork) return false;
      else if (showNativeConvert) {
        return (
          Boolean(convertInputError) || convertType === ConvertType.CONVERTING
        );
      } else if (showWrap) {
        return (
          Boolean(wrapInputError) ||
          wrapType === WrapType.WRAPPING ||
          wrapType === WrapType.UNWRAPPING
        );
      } else if (noRoute && userHasSpecifiedInputOutput) {
        return true;
      } else if (showApproveFlow) {
        return !isValid || (maxImpactReached && !isExpertMode) || isSwapError;
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
    isExpertMode,
    paraswapCallbackError,
    parsedAmounts,
    swapInputAmountWithSlippage,
    swapInputBalance,
    account,
    isSupportedNetwork,
    showNativeConvert,
    showWrap,
    noRoute,
    userHasSpecifiedInputOutput,
    showApproveFlow,
    convertInputError,
    convertType,
    wrapInputError,
    wrapType,
    tradeSrcAmount,
    tradeDestAmount,
    maxImpactReached,
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

  const { fireEvent } = useMasaAnalytics();
  const config = getConfig(chainId);
  const fromTokenWrapped = wrappedCurrency(currencies[Field.INPUT], chainId);
  const { price: fromTokenUSDPrice } = useUSDCPriceFromAddress(
    fromTokenWrapped?.address ?? '',
  );

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
            label: [inputCurrency?.symbol, outputCurrency?.symbol].join('/'),
          });
          if (
            account &&
            optimalRate &&
            fromTokenWrapped &&
            walletInfo &&
            chainId === ChainId.MATIC
          ) {
            fireEvent('trade', {
              user_address: account,
              network: config['networkName'],
              contract_address: optimalRate.contractAddress,
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
    paraswapCallback,
    tradeToConfirm,
    showConfirm,
    finalizedTransaction,
    dispatch,
    recipient,
    recipientAddress,
    account,
    inputCurrency?.symbol,
    outputCurrency?.symbol,
    optimalRate,
    fromTokenWrapped,
    walletInfo,
    chainId,
    fireEvent,
    config,
    formattedAmounts,
    fromTokenUSDPrice,
  ]);

  const onParaswap = useCallback(() => {
    if (amlScore > AML_SCORE_THRESHOLD) {
      history.push('/forbidden');
      return;
    }
    if (showNativeConvert && onConvert) {
      onConvert();
    } else if (showWrap && onWrap) {
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
  }, [
    amlScore,
    showNativeConvert,
    onConvert,
    showWrap,
    onWrap,
    isExpertMode,
    history,
    handleParaswap,
  ]);
  const { seekingBetterPrice, getBetterPrice } = useGetBetterPrice(
    fetchLiquidityHubQuote,
  );

  const onPureAggregationSubmit = useCallback(() => {
    if (isLiquidityHubOnly) {
      setShowLiquidityHubConfirm(true);
    } else {
      onParaswap();
    }
  }, [onParaswap, isLiquidityHubOnly]);

  const onSubmitSwap = useCallback(async () => {
    if (isLhPureAggregationMode) {
      onPureAggregationSubmit();
      return;
    }

    const betterPriceFound = await getBetterPrice({
      dexOutAmount: optimalRate?.destAmount,
      allowedSlippage,
      skip:
        liquidityHubDisabled ||
        wrapType === WrapType.WRAP ||
        wrapType === WrapType.UNWRAP,
    });

    if (betterPriceFound) {
      setShowLiquidityHubConfirm(true);
    } else {
      onParaswap();
    }
  }, [
    onParaswap,
    optimalRate,
    allowedSlippage,
    liquidityHubDisabled,
    getBetterPrice,
    isLhPureAggregationMode,
    onPureAggregationSubmit,
    wrapType,
  ]);

  const paraRate = optimalRate
    ? (Number(optimalRate.destAmount) * 10 ** optimalRate.srcDecimals) /
      (Number(optimalRate.srcAmount) * 10 ** optimalRate.destDecimals)
    : undefined;

  const swapDisabledForTx = useMemo(() => {
    if (account) {
      if (showNativeConvert) {
        return Boolean(convertInputError);
      } else if (showWrap) {
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
    showNativeConvert,
    showWrap,
    noRoute,
    userHasSpecifiedInputOutput,
    convertInputError,
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
  // useEffect(() => {
  //   if (
  //     approval === ApprovalState.NOT_APPROVED ||
  //     approval === ApprovalState.UNKNOWN
  //   ) {
  //     setApprovalSubmitted(false);
  //   }
  // }, [approval]);

  useEffect(() => {
    if (
      nativeConvertApproval === ApprovalState.NOT_APPROVED ||
      nativeConvertApproval === ApprovalState.UNKNOWN
    ) {
      setNativeApprovalSubmitted(false);
    }
  }, [nativeConvertApproval]);

  const optimalRateNotExisting = !optimalRate;
  useEffect(() => {
    if (!optimalRateNotExisting) {
      reFetchOptimalRate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optimalRateNotExisting]);

  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const onLiquidityHubSwapFailed = useCallback(() => {
    if (!isLhPureAggregationMode) {
      setLiquidityHubDisabled(true);
    }
  }, [isLhPureAggregationMode]);

  const handleLiquidityHubConfirmDismiss = useCallback(() => {
    setShowLiquidityHubConfirm(false);
  }, []);

  const onApprove = useCallback(async () => {
    if (showNativeConvert) {
      setNativeConvertApproving(true);
      try {
        await nativeConvertApproveCallback();
        setNativeConvertApproving(false);
      } catch (err) {
        setNativeConvertApproving(false);
      }
    } else {
      setApproving(true);
      try {
        await approveCallback();
        setApproving(false);
      } catch (err) {
        setApproving(false);
      }
    }
  }, [approveCallback, nativeConvertApproveCallback, showNativeConvert]);

  const approveButtonDisabled = showNativeConvert
    ? nativeConvertApproving ||
      nativeConvertApproval !== ApprovalState.NOT_APPROVED ||
      nativeApprovalSubmitted
    : approving || approval !== ApprovalState.NOT_APPROVED || bonusRouteLoading;

  const onConfirmTx = useCallback(() => {
    if (showApproveFlow) {
      onApprove();
    } else {
      handleParaswap();
    }
  }, [handleParaswap, onApprove, showApproveFlow]);

  return (
    <Box>
      <TokenWarningModal
        isOpen={selectedTokensNotInDefault.length > 0 && !dismissTokenWarning}
        tokens={selectedTokensNotInDefault}
        onConfirm={handleConfirmTokenWarning}
        onDismiss={handleDismissTokenWarning}
      />
      <LiquidityHubSwapConfirmation
        inAmount={parsedAmount?.raw.toString()}
        inCurrency={inputCurrency}
        outCurrency={outputCurrency}
        isOpen={showLiquidityHubConfirm}
        onDismiss={handleLiquidityHubConfirmDismiss}
        quote={liquidityHubQuote}
        getLatestQuote={getLatestQuote}
        onSwapFailed={onLiquidityHubSwapFailed}
        optimalRate={optimalRate}
        allowedSlippage={allowedSlippage}
        onLiquidityHubSwapInProgress={setSwappingLiquidityHub}
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
          onConfirm={onConfirmTx}
          swapErrorMessage={swapErrorMessage}
          onDismiss={handleConfirmDismiss}
          swapButtonText={
            showApproveFlow
              ? t(approving ? 'approveTokenPending' : 'approveToken', {
                  symbol: inputCurrency?.symbol,
                })
              : undefined
          }
          swapButtonDisabled={showApproveFlow ? approveButtonDisabled : false}
        />
      )}
      <CurrencyInput
        title={`${t('Pay')}:`}
        id='swap-currency-input'
        classNames='from_input'
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
        {/* <ExchangeIcon
          onClick={() => {
            setSwapType(
              swapType === SwapSide.BUY ? SwapSide.SELL : SwapSide.BUY,
            );
            redirectWithSwitch();
          }}
        /> */}
        <Box
          onClick={() => {
            setSwapType(
              swapType === SwapSide.BUY ? SwapSide.SELL : SwapSide.BUY,
            );
            redirectWithSwitch();
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            border: '2px solid #191b2e',
            bgcolor: '#232734',
          }}
        >
          {/* <AddLiquidityIcon /> */}
          <img src={arrowDown} alt='arrow down' width='12px' height='12px' />
        </Box>
      </Box>
      <SeekingBetterPriceModal isOpen={seekingBetterPrice} />
      <CurrencyInput
        title={`${t('Receive')}:`}
        id='swap-currency-output'
        classNames='to_input'
        currency={currencies[Field.OUTPUT]}
        showPrice={Boolean(optimalRate)}
        showMaxButton={false}
        otherCurrency={currencies[Field.INPUT]}
        handleCurrencySelect={handleOtherCurrencySelect}
        amount={formattedAmounts[Field.OUTPUT]}
        setAmount={handleTypeOutput}
        color={isProMode ? 'white' : 'secondary'}
        bgClass={isProMode ? 'swap-bg-highlight' : currencyBgClass}
        disabled={isLhPureAggregationMode}
      />
      {!showNativeConvert && !showWrap && isExpertMode && (
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
      <Box className='swapButtonWrapper'>
        <Box width={'100%'}>
          <Button
            fullWidth
            disabled={
              seekingBetterPrice ||
              ((isAmlScoreLoading ||
                (showNativeConvert
                  ? false
                  : bonusRouteLoading || optimalRateError) ||
                swapButtonDisabled) as boolean)
            }
            onClick={
              account && isSupportedNetwork ? onSubmitSwap : connectWallet
            }
          >
            {swapButtonText}
          </Button>
        </Box>
      </Box>
      {isLiquidityHubOnly ? (
        <SwapPrice quote={liquidityHubQuote} />
      ) : (
        paraRate && (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gridGap: '4px',
              marginTop: '16px',
            }}
          >
            <img src={chart} alt='chart' />
            <Typography
              style={{
                fontSize: '13px',
                color: '#fff',
                fontWeight: 500,
                marginBottom: '-2px',
              }}
            >
              <Box className='swapPrice'>
                <small>
                  1{' '}
                  {
                    (mainPrice
                      ? currencies[Field.INPUT]
                      : currencies[Field.OUTPUT]
                    )?.symbol
                  }{' '}
                  = {(mainPrice ? paraRate : 1 / paraRate).toLocaleString('us')}{' '}
                  {
                    (mainPrice
                      ? currencies[Field.OUTPUT]
                      : currencies[Field.INPUT]
                    )?.symbol
                  }{' '}
                  <PriceExchangeIcon
                    onClick={() => {
                      setMainPrice(!mainPrice);
                    }}
                  />
                </small>
              </Box>
            </Typography>
          </Box>
        )
      )}
      {isLiquidityHubOnly ? (
        <LiquidityHubSwapDetails
          quote={liquidityHubQuote}
          allowedSlippage={allowedSlippage}
        />
      ) : (
        <BestTradeAdvancedSwapDetails
          optimalRate={optimalRate}
          inputCurrency={inputCurrency}
          outputCurrency={outputCurrency}
        />
      )}
      {/* <Box className='subtext-color infoWrapper'>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <img src={inforIcon} alt='information' /> {t('slipPage')}
          </Box>
          <Box>
            1%
            <img src={settingIcon} alt='Setting' />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <img src={inforIcon} alt='information' /> {t('minimumReceived')}
          </Box>
          <Box>5463.44 MATIC</Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <img src={inforIcon} alt='information' /> {t('priceImpact')}
          </Box>
          <Box>0.3%</Box>
        </Box>
      </Box> */}
      <SignUp
        onSubcribe={() => {
          console.log('sub');
        }}
      />
      {DRAGON_EGGS_SHOW && <Eggs type={2}></Eggs>}

      {isLiquidityHubOnly && <PoweredByOrbs />}
    </Box>
  );
};

export default SwapBestTrade;

const SeekingBetterPriceModal = ({ isOpen }: { isOpen: boolean }) => {
  const { t } = useTranslation();
  return (
    <StyledSeekingBetterPriceModal open={isOpen} modalWrapper='txModalWrapper'>
      <Box padding={4}>
        <Box className='txModalHeader'>
          <h5>{t('seekingBetterPrice')}</h5>
        </Box>
        <Box className={`txModalContent`}>
          <Box className='flex justify-center spinner'>
            <img
              src={SpinnerImage}
              alt='Spinner'
              style={{ width: 50, height: 50 }}
            />
          </Box>
        </Box>
      </Box>
    </StyledSeekingBetterPriceModal>
  );
};

const StyledSeekingBetterPriceModal = styled(CustomModal)({
  '& .customModalBackdrop': {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});
