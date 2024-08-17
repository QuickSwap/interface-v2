import {
  Currency,
  CurrencyAmount,
  NativeCurrency,
  Token,
  TradeType,
} from '@uniswap/sdk-core';
import { AML_SCORE_THRESHOLD } from 'config/index';
import { ReactComponent as ExchangeIcon } from 'assets/images/ExchangeIcon.svg';
import CurrencyLogo from 'components/CurrencyLogo';
import Loader from 'components/Loader';
import CurrencyInputPanel from 'components/v3/CurrencyInputPanel';
import { AdvancedSwapDetails } from 'components/v3/swap/AdvancedSwapDetails';
import ConfirmSwapModal from 'components/v3/swap/ConfirmSwapModal';
import SwapCallbackError from 'components/v3/swap/SwapCallbackError';
import SwapHeader from 'components/v3/swap/SwapHeader';
import TradePrice from 'components/v3/swap/TradePrice';
import TokenWarningModal from 'components/v3/TokenWarningModal';
import { useActiveWeb3React, useMasaAnalytics } from 'hooks';
import useENSAddress from 'hooks/useENSAddress';
import {
  ApprovalState,
  useApproveCallback,
  useApproveCallbackFromTrade,
} from 'hooks/useV3ApproveCallback';
import useWrapCallback, { WrapType } from 'hooks/useV3WrapCallback';
import { useAllTokens, useCurrency } from 'hooks/v3/Tokens';
import { V3TradeState } from 'hooks/v3/useBestV3Trade';
import {
  useERC20PermitFromTrade,
  UseERC20PermitState,
} from 'hooks/v3/useERC20Permit';
import { useSwapCallback } from 'hooks/v3/useSwapCallback';
import useToggledVersion, { Version } from 'hooks/v3/useToggledVersion';
import { useUSDCValue } from 'hooks/v3/useUSDCPrice';
import JSBI from 'jsbi';
import { Trade as V3Trade } from 'lib/src/trade';
import { WrappedCurrency } from 'models/types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, CheckCircle, HelpCircle, Info } from 'react-feather';
import ReactGA from 'react-ga';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import { Field } from 'state/swap/v3/actions';
import {
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from 'state/swap/v3/hooks';
import { useExpertModeManager, useAmlScore } from 'state/user/hooks';
import { getTradeVersion } from 'utils/v3/getTradeVersion';
import { halfAmountSpend, maxAmountSpend } from 'utils/v3/maxAmountSpend';
import { warningSeverity } from 'utils/v3/prices';

import { Box, Button } from '@material-ui/core';
import { ChainId, ETHER, WETH } from '@uniswap/sdk';
import { AddressInput, CustomTooltip } from 'components';
import {
  NATIVE_CONVERTER,
  SWAP_ROUTER_ADDRESSES,
  UNI_SWAP_ROUTER,
  WMATIC_EXTENDED,
} from 'constants/v3/addresses';
import useParsedQueryString from 'hooks/useParsedQueryString';
import useSwapRedirects from 'hooks/useSwapRedirect';
import { CHAIN_INFO } from 'constants/v3/chains';
import { useTranslation } from 'react-i18next';
import { useTransactionFinalizer } from 'state/transactions/hooks';
import { getConfig } from 'config/index';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';
import { useV3TradeTypeAnalyticsCallback } from 'components/Swap/LiquidityHub';
import useNativeConvertCallback, {
  ConvertType,
} from 'hooks/useNativeConvertCallback';
import { useWalletInfo, useWeb3Modal } from '@web3modal/ethers5/react';
import { useAppDispatch } from 'state';
import { updateUserBalance } from 'state/balance/actions';

const SwapV3Page: React.FC = () => {
  const { t } = useTranslation();
  const { account, chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const history = useHistory();

  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(
    false,
  );

  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true);
  }, []);

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens();

  // toggle wallet when disconnected
  const { open } = useWeb3Modal();

  // for expert mode
  const [isExpertMode] = useExpertModeManager();

  // user aml score
  const { isLoading: isAmlScoreLoading, score: amlScore } = useAmlScore();

  // get version from the url
  const toggledVersion = useToggledVersion();

  // swap state
  const { independentField, typedValue, recipient } = useSwapState();
  const {
    v3TradeState: { state: v3TradeState },
    toggledTrade: trade,
    allowedSlippage,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = useDerivedSwapInfo();

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue,
  );

  const {
    convertType,
    execute: onConvert,
    inputError: convertInputError,
  } = useNativeConvertCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue,
  );

  const showNativeConvert = convertType !== ConvertType.NOT_APPLICABLE;
  const dispatch = useAppDispatch();
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;
  const { address: recipientAddress } = useENSAddress(recipient);

  const parsedAmounts = useMemo(
    () =>
      showWrap || showNativeConvert
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
          },
    [
      independentField,
      parsedAmount,
      showNativeConvert,
      showWrap,
      trade?.inputAmount,
      trade?.outputAmount,
    ],
  );

  const fiatValueInput = useUSDCValue(parsedAmounts[Field.INPUT]);
  const fiatValueOutput = useUSDCValue(parsedAmounts[Field.OUTPUT]);

  const {
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
  } = useSwapActionHandlers();
  const isValid = !swapInputError;
  const dependentField: Field =
    independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value);
    },
    [onUserInput],
  );
  const handleTypeOutput = useCallback(
    (value: string) => {
      console.log('USER OUTPUT SAMEEP');
      onUserInput(Field.OUTPUT, value);
    },
    [onUserInput],
  );

  // reset if they close warning without tokens in params
  const handleDismissTokenWarning = useCallback(() => {
    setDismissTokenWarning(true);
    history.push('/swap?swapIndex=2');
  }, [history]);

  // modal and loading
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
    tradeToConfirm: V3Trade<Currency, Currency, TradeType> | undefined;
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

  const formattedAmounts = useMemo(() => {
    return {
      [independentField]: typedValue,
      [dependentField]:
        showWrap || showNativeConvert
          ? parsedAmounts[independentField]?.toExact() ?? ''
          : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
    };
  }, [
    dependentField,
    independentField,
    parsedAmounts,
    showNativeConvert,
    showWrap,
    typedValue,
  ]);

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] &&
      currencies[Field.OUTPUT] &&
      parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0)),
  );

  const routeNotFound = !trade?.route;
  const isLoadingRoute =
    toggledVersion === Version.v3 && V3TradeState.LOADING === v3TradeState;

  const dynamicFee = useMemo(() => {
    const _trade = trade as any;
    if (!_trade) return;
    return _trade.swaps[0]?.route?.pools[0].fee;
  }, [trade]);

  // check whether the user has approved the router on the input token
  const [approvalState, approveCallback] = useApproveCallbackFromTrade(
    trade,
    allowedSlippage,
  );
  const [
    nativeConvertApproval,
    nativeConvertApproveCallback,
  ] = useApproveCallback(parsedAmount, NATIVE_CONVERTER[chainId]);

  const {
    state: signatureState,
    signatureData,
    gatherPermitSignature,
  } = useERC20PermitFromTrade(trade, allowedSlippage);

  const handleApprove = useCallback(async () => {
    if (
      signatureState === UseERC20PermitState.NOT_SIGNED &&
      gatherPermitSignature
    ) {
      try {
        await gatherPermitSignature();
      } catch (error) {
        // try to approve if gatherPermitSignature failed for any reason other than the user rejecting it
        if (error?.code !== 4001) {
          await approveCallback();
        }
      }
    } else {
      await approveCallback();
      ReactGA.event({
        category: 'Swap',
        action: 'Approve',
        label: [trade?.inputAmount.currency.symbol, toggledVersion].join('/'),
      });
    }
  }, [
    approveCallback,
    gatherPermitSignature,
    signatureState,
    toggledVersion,
    trade?.inputAmount.currency.symbol,
  ]);

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);
  const [nativeApprovalSubmitted, setNativeApprovalSubmitted] = useState<
    boolean
  >(false);

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approvalState === ApprovalState.PENDING) {
      setApprovalSubmitted(true);
    } else if (approvalState === ApprovalState.APPROVED) {
      setApprovalSubmitted(false);
    }
  }, [approvalState, approvalSubmitted]);

  useEffect(() => {
    if (nativeConvertApproval === ApprovalState.PENDING) {
      setNativeApprovalSubmitted(true);
    }
  }, [nativeConvertApproval, nativeApprovalSubmitted]);

  const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(
    currencyBalances[Field.INPUT],
  );
  const halfInputAmount: CurrencyAmount<Currency> | undefined = halfAmountSpend(
    currencyBalances[Field.INPUT],
  );
  const showMaxButton = Boolean(
    maxInputAmount?.greaterThan(0) &&
      !parsedAmounts[Field.INPUT]?.equalTo(maxInputAmount),
  );

  // the callback to execute the swap

  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    recipient,
    signatureData,
  );

  const singleHopOnly = false;

  const finalizedTransaction = useTransactionFinalizer();

  const { fireEvent } = useMasaAnalytics();
  const config = getConfig(chainId);
  const { price: fromTokenUSDPrice } = useUSDCPriceFromAddress(
    currencies[Field.INPUT]?.wrapped.address ?? '',
  );
  const onV3TradeAnalytics = useV3TradeTypeAnalyticsCallback(
    currencies,
    allowedSlippage,
  );

  const isUni = trade?.swaps[0]?.route?.pools[0]?.isUni;

  const { walletInfo } = useWalletInfo();

  const handleSwap = useCallback(() => {
    onV3TradeAnalytics(formattedAmounts);
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
              getTradeVersion(trade),
              'MH',
              account,
            ].join('/'),
          });
          if (
            account &&
            currencies[Field.INPUT] &&
            walletInfo &&
            chainId === ChainId.MATIC
          ) {
            fireEvent('trade', {
              user_address: account,
              network: config['networkName'],
              contract_address: isUni
                ? UNI_SWAP_ROUTER[chainId]
                : SWAP_ROUTER_ADDRESSES[chainId],
              asset_amount: formattedAmounts[Field.INPUT],
              asset_ticker: currencies[Field.INPUT].symbol ?? '',
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
    onV3TradeAnalytics,
    formattedAmounts,
    swapCallback,
    tradeToConfirm,
    showConfirm,
    finalizedTransaction,
    dispatch,
    recipient,
    recipientAddress,
    account,
    trade,
    currencies,
    walletInfo,
    chainId,
    fireEvent,
    config,
    isUni,
    fromTokenUSDPrice,
  ]);

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false);

  // warnings on the greater of fiat value price impact and execution price impact
  const priceImpactSeverity = useMemo(() => {
    const executionPriceImpact = trade?.priceImpact;
    return warningSeverity(executionPriceImpact);
  }, [trade]);

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    !showWrap &&
    (showNativeConvert
      ? nativeConvertApproval === ApprovalState.NOT_APPROVED ||
        nativeConvertApproval === ApprovalState.PENDING ||
        (nativeApprovalSubmitted &&
          nativeConvertApproval === ApprovalState.APPROVED)
      : approvalState === ApprovalState.NOT_APPROVED ||
        approvalState === ApprovalState.PENDING ||
        (approvalSubmitted && approvalState === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode);

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({
      showConfirm: false,
      txPending: false,
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

  const handleAcceptChanges = useCallback(() => {
    setSwapState({
      tradeToConfirm: trade,
      swapErrorMessage,
      txHash,
      attemptingTxn,
      showConfirm,
    });
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash]);

  const parsedQs = useParsedQueryString();
  const { redirectWithCurrency, redirectWithSwitch } = useSwapRedirects();

  const handleInputSelect = useCallback(
    (inputCurrency: any) => {
      setApprovalSubmitted(false); // reset 2 step UI for approvals
      setNativeApprovalSubmitted(false);
      if (
        (inputCurrency &&
          inputCurrency.isNative &&
          currencies[Field.OUTPUT] &&
          currencies[Field.OUTPUT]?.isNative) ||
        (inputCurrency &&
          inputCurrency.address &&
          currencies[Field.OUTPUT] &&
          !currencies[Field.OUTPUT]?.isNative &&
          currencies[Field.OUTPUT]?.wrapped &&
          currencies[Field.OUTPUT]?.wrapped.address &&
          inputCurrency.address.toLowerCase() ===
            currencies[Field.OUTPUT]?.wrapped.address.toLowerCase())
      ) {
        redirectWithSwitch();
      } else {
        if (!Boolean(inputCurrency.address in defaultTokens)) {
          setDismissTokenWarning(false);
        }
        redirectWithCurrency(inputCurrency, true, false);
      }
    },
    [redirectWithCurrency, currencies, redirectWithSwitch, defaultTokens],
  );

  const chainInfo = CHAIN_INFO[chainIdToUse];

  const parsedCurrency0Id = (parsedQs.currency0 ??
    parsedQs.inputCurrency) as string;
  const parsedCurrency1Id = (parsedQs.currency1 ??
    parsedQs.outputCurrency) as string;

  const handleMaxInput = useCallback(() => {
    maxInputAmount && onUserInput(Field.INPUT, maxInputAmount.toExact());
    ReactGA.event({
      category: 'Swap',
      action: 'Max',
    });
  }, [maxInputAmount, onUserInput]);

  const handleHalfInput = useCallback(() => {
    if (!halfInputAmount) {
      return;
    }

    ReactGA.event({
      category: 'Swap',
      action: 'Half',
    });

    onUserInput(Field.INPUT, halfInputAmount.toExact());
  }, [halfInputAmount, onUserInput]);

  const handleOutputSelect = useCallback(
    (outputCurrency: any) => {
      if (
        (outputCurrency &&
          outputCurrency.isNative &&
          currencies[Field.INPUT] &&
          currencies[Field.INPUT]?.isNative) ||
        (outputCurrency &&
          outputCurrency.address &&
          currencies[Field.INPUT] &&
          !currencies[Field.INPUT].isNative &&
          currencies[Field.INPUT]?.wrapped &&
          currencies[Field.INPUT]?.wrapped.address &&
          outputCurrency.address.toLowerCase() ===
            currencies[Field.INPUT]?.wrapped.address.toLowerCase())
      ) {
        redirectWithSwitch();
      } else {
        if (!Boolean(outputCurrency.address in defaultTokens)) {
          setDismissTokenWarning(false);
        }
        redirectWithCurrency(outputCurrency, false, false);
      }
    },
    [redirectWithCurrency, currencies, redirectWithSwitch, defaultTokens],
  );

  const parsedCurrency0 = useCurrency(
    parsedCurrency0Id === 'ETH'
      ? chainInfo.nativeCurrencySymbol
      : parsedCurrency0Id,
  );
  const parsedCurrency1 = useCurrency(
    parsedCurrency1Id === 'ETH'
      ? chainInfo.nativeCurrencySymbol
      : parsedCurrency1Id,
  );

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

  const parsedCurrency0Fetched = !!parsedCurrency0;
  const parsedCurrency1Fetched = !!parsedCurrency1;

  useEffect(() => {
    if (!parsedCurrency0Id && !parsedCurrency1Id) {
      const nativeCurrency = {
        ...ETHER[chainId],
        isNative: true,
        isToken: false,
        wrapped: WMATIC_EXTENDED[chainId],
      } as NativeCurrency;
      redirectWithCurrency(nativeCurrency, true, false);
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

  //TODO
  const priceImpactTooHigh = priceImpactSeverity > 3 && !isExpertMode;

  return (
    <>
      <Helmet>
        {/* //TODO */}
        <meta
          name={'description'}
          content={`Quickswap is one of the first concentrated liquidity DEX on Polygon: best rates for traders and liquidity providers on the Polygon Network, with built-in farming and adaptive fees.`}
        />
        <meta
          name={'keywords'}
          content={`best dex, quickswap exchange, quickswap crypto, quickswap finance, quickswap dex, defi, polygon dex, exchange on polygon, matic exchange`}
        />
      </Helmet>
      <TokenWarningModal
        isOpen={selectedTokensNotInDefault.length > 0 && !dismissTokenWarning}
        tokens={selectedTokensNotInDefault}
        onConfirm={handleConfirmTokenWarning}
        onDismiss={handleDismissTokenWarning}
      />
      <Box className='swap'>
        <SwapHeader allowedSlippage={allowedSlippage} dynamicFee={dynamicFee} />

        <ConfirmSwapModal
          isOpen={showConfirm}
          trade={trade}
          originalTrade={tradeToConfirm}
          onAcceptChanges={handleAcceptChanges}
          attemptingTxn={attemptingTxn}
          txHash={txHash}
          txPending={txPending}
          recipient={recipient}
          allowedSlippage={allowedSlippage}
          onConfirm={handleSwap}
          swapErrorMessage={swapErrorMessage}
          onDismiss={handleConfirmDismiss}
        />

        <Box mt={1.5} mb={1}>
          <CurrencyInputPanel
            label={
              independentField === Field.OUTPUT && !showWrap
                ? t('fromAtMost')
                : t('from')
            }
            value={formattedAmounts[Field.INPUT]}
            showMaxButton={showMaxButton}
            showHalfButton={true}
            currency={currencies[Field.INPUT] as WrappedCurrency}
            onUserInput={handleTypeInput}
            onMax={handleMaxInput}
            onHalf={handleHalfInput}
            fiatValue={fiatValueInput ?? undefined}
            onCurrencySelect={handleInputSelect}
            otherCurrency={currencies[Field.OUTPUT]}
            showCommonBases={true}
            id='swap-currency-input'
            locked={false}
            hideCurrency={false}
            hideInput={false}
            showBalance={true}
            disabled={false}
            shallow={false}
            swap
          />
        </Box>

        <Box className='exchangeSwap'>
          <ExchangeIcon
            onClick={() => {
              setApprovalSubmitted(false); // reset 2 step UI for approvals
              setNativeApprovalSubmitted(false);
              redirectWithSwitch();
            }}
          />
        </Box>
        <Box mt={1} mb={1.5}>
          <CurrencyInputPanel
            value={formattedAmounts[Field.OUTPUT]}
            onUserInput={handleTypeOutput}
            label={
              independentField === Field.INPUT && !showWrap
                ? t('toAtLeast')
                : t('to')
            }
            showMaxButton={false}
            showHalfButton={false}
            hideBalance={false}
            fiatValue={fiatValueOutput ?? undefined}
            priceImpact={trade?.priceImpact}
            currency={currencies[Field.OUTPUT] as WrappedCurrency}
            onCurrencySelect={handleOutputSelect}
            otherCurrency={currencies[Field.INPUT]}
            showCommonBases={true}
            id='swap-currency-output'
            locked={false}
            hideCurrency={false}
            hideInput={false}
            showBalance={true}
            disabled={false}
            shallow={false}
            swap
          />
        </Box>
        {!showWrap && !showNativeConvert && isExpertMode ? (
          <Box className='recipientInput' mb={1.5}>
            <Box className='recipientInputHeader'>
              {recipient !== null ? (
                <ArrowDown size='16' color='white' />
              ) : (
                <Box />
              )}
              <Button
                onClick={() =>
                  onChangeRecipient(recipient !== null ? null : '')
                }
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
        ) : null}

        {!showWrap && !showNativeConvert && trade && (
          <div className='flex items-center'>
            <TradePrice
              price={trade.executionPrice}
              showInverted={showInverted}
              setShowInverted={setShowInverted}
            />
            <CustomTooltip
              onOpen={() => {
                ReactGA.event({
                  category: 'Swap',
                  action: 'Transaction Details Tooltip Open',
                });
              }}
              title={
                <AdvancedSwapDetails
                  trade={trade}
                  allowedSlippage={allowedSlippage}
                />
              }
            >
              <Box padding='0.25rem' className='flex'>
                <Info size={'1rem'} stroke='white' />
              </Box>
            </CustomTooltip>
          </div>
        )}

        <Box className='swapButtonWrapper'>
          {!account ? (
            <Button fullWidth onClick={() => open()}>
              {t('connectWallet')}
            </Button>
          ) : showNativeConvert ? (
            <Button
              fullWidth
              disabled={
                Boolean(convertInputError) ||
                convertType === ConvertType.CONVERTING
              }
              onClick={onConvert}
            >
              {convertInputError ??
                (convertType === ConvertType.CONVERT
                  ? t('convert')
                  : convertType === ConvertType.CONVERTING
                  ? t('converting')
                  : null)}
            </Button>
          ) : showWrap ? (
            <Button
              fullWidth
              disabled={
                Boolean(wrapInputError) ||
                wrapType === WrapType.WRAPPING ||
                wrapType === WrapType.UNWRAPPING
              }
              onClick={onWrap}
            >
              {wrapInputError ??
                (wrapType === WrapType.WRAP
                  ? t('wrapMATIC', { symbol: ETHER[chainId].symbol })
                  : wrapType === WrapType.UNWRAP
                  ? t('unwrapMATIC', { symbol: WETH[chainId].symbol })
                  : wrapType === WrapType.WRAPPING
                  ? t('wrappingMATIC', { symbol: ETHER[chainId].symbol })
                  : wrapType === WrapType.UNWRAPPING
                  ? t('unwrappingMATIC', { symbol: WETH[chainId].symbol })
                  : null)}
            </Button>
          ) : routeNotFound && userHasSpecifiedInputOutput ? (
            <Button
              fullWidth
              disabled={routeNotFound && userHasSpecifiedInputOutput}
            >
              {isLoadingRoute ? (
                <p className='loadingDots'>{t('loading')}</p>
              ) : singleHopOnly ? (
                `${t('insufficientLiquidityMultiHop')}.`
              ) : (
                t('insufficientLiquidityTrade')
              )}
            </Button>
          ) : showApproveFlow ? (
            <>
              <Box width='48%'>
                <Button
                  fullWidth
                  onClick={handleApprove}
                  disabled={
                    approvalState !== ApprovalState.NOT_APPROVED ||
                    approvalSubmitted ||
                    signatureState === UseERC20PermitState.SIGNED
                  }
                >
                  <Box
                    className='flex justify-between items-center'
                    gridGap={5}
                  >
                    <CurrencyLogo
                      currency={currencies[Field.INPUT] as WrappedCurrency}
                      size={'24px'}
                    />
                    <span
                      style={{
                        color: 'white',
                        flex: 1,
                      }}
                    >
                      {/* we need to shorten this string on mobile */}
                      {approvalState === ApprovalState.APPROVED ||
                      signatureState === UseERC20PermitState.SIGNED
                        ? `${t('youcannowtrade')} ${
                            currencies[Field.INPUT]?.symbol
                          }`
                        : `${t('allowQuickswapTouse')} ${
                            currencies[Field.INPUT]?.symbol
                          }`}
                    </span>
                    {approvalSubmitted &&
                    approvalState !== ApprovalState.APPROVED ? (
                      <Loader stroke='white' />
                    ) : (approvalSubmitted &&
                        approvalState === ApprovalState.APPROVED) ||
                      signatureState === UseERC20PermitState.SIGNED ? (
                      <CheckCircle size='20' className='text-success' />
                    ) : (
                      <CustomTooltip
                        title={t('mustgiveContractsPermission', {
                          symbol: currencies[Field.INPUT]?.symbol,
                        })}
                      >
                        <HelpCircle size='20' color={'white'} />
                      </CustomTooltip>
                    )}
                  </Box>
                </Button>
              </Box>
              <Box width='48%'>
                <Button
                  fullWidth
                  onClick={() => {
                    if (isExpertMode) {
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
                  }}
                  id='swap-button'
                  disabled={
                    !isValid ||
                    (approvalState !== ApprovalState.APPROVED &&
                      signatureState !== UseERC20PermitState.SIGNED) ||
                    priceImpactTooHigh
                  }
                >
                  {priceImpactTooHigh
                    ? t('highPriceImpact')
                    : priceImpactSeverity > 2
                    ? t('swapAnyway')
                    : t('swap')}
                </Button>
              </Box>
            </>
          ) : (
            <Button
              fullWidth
              onClick={() => {
                if (amlScore > AML_SCORE_THRESHOLD) {
                  history.push('/forbidden');
                  return;
                }
                if (isExpertMode) {
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
              }}
              id='swap-button'
              disabled={
                isAmlScoreLoading ||
                !isValid ||
                priceImpactTooHigh ||
                !!swapCallbackError ||
                showApproveFlow
              }
            >
              {swapInputError
                ? swapInputError
                : priceImpactTooHigh
                ? t('highPriceImpact')
                : priceImpactSeverity > 2
                ? t('swapAnyway')
                : t('swap')}
            </Button>
          )}
        </Box>
        {isExpertMode && swapErrorMessage ? (
          <Box mt={2}>
            <SwapCallbackError error={swapErrorMessage} />
          </Box>
        ) : null}
      </Box>
    </>
  );
};

export default SwapV3Page;
