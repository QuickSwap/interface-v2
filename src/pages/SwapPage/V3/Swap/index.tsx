import {
  Currency,
  CurrencyAmount,
  NativeCurrency,
  Token,
  TradeType,
} from '@uniswap/sdk-core';
import { ReactComponent as ExchangeIcon } from 'assets/images/ExchangeIcon.svg';
import CurrencyLogo from 'components/CurrencyLogo';
import Loader from 'components/Loader';
import CurrencyInputPanel from 'components/v3/CurrencyInputPanel';
import { AdvancedSwapDetails } from 'components/v3/swap/AdvancedSwapDetails';
import confirmPriceImpactWithoutFee from 'components/v3/swap/confirmPriceImpactWithoutFee';
import ConfirmSwapModal from 'components/v3/swap/ConfirmSwapModal';
import SwapCallbackError from 'components/v3/swap/SwapCallbackError';
import SwapHeader from 'components/v3/swap/SwapHeader';
import TradePrice from 'components/v3/swap/TradePrice';
import TokenWarningModal from 'components/v3/TokenWarningModal';
import {
  MouseoverTooltip,
  MouseoverTooltipContent,
} from 'components/v3/Tooltip';
import { useActiveWeb3React } from 'hooks';
import useENSAddress from 'hooks/useENSAddress';
import {
  ApprovalState,
  useApproveCallbackFromTrade,
} from 'hooks/useV3ApproveCallback';
import useWrapCallback, { WrapType } from 'hooks/useWrapCallback';
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
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ArrowDown, CheckCircle, HelpCircle, Info } from 'react-feather';
import ReactGA from 'react-ga';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import { useIsProMode, useWalletModalToggle } from 'state/application/hooks';
import { Field } from 'state/swap/v3/actions';
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from 'state/swap/v3/hooks';
import { useExpertModeManager } from 'state/user/hooks';
import { ThemeContext } from 'styled-components/macro';
import { computeFiatValuePriceImpact } from 'utils/v3/computeFiatValuePriceImpact';
import { getTradeVersion } from 'utils/v3/getTradeVersion';
import { maxAmountSpend } from 'utils/v3/maxAmountSpend';
import { warningSeverity } from 'utils/v3/prices';

import { Box, Button } from '@material-ui/core';
import { ETHER } from '@uniswap/sdk';
import { AddressInput } from 'components';
import { WMATIC_EXTENDED } from 'constants/v3/addresses';
import useParsedQueryString from 'hooks/useParsedQueryString';
import useSwapRedirects from 'hooks/useSwapRedirect';
import { useTranslation } from 'react-i18next';

const SwapV3Page: React.FC = () => {
  const { t } = useTranslation();
  const { account, chainId } = useActiveWeb3React();
  const history = useHistory();
  const { isProMode, updateIsProMode } = useIsProMode();
  const loadedUrlParams = useDefaultsFromURLSearch();
  const inputCurrencyId = loadedUrlParams?.inputCurrencyId;
  const outputCurrencyId = loadedUrlParams?.outputCurrencyId;
  const paramInputCurrency = useCurrency(inputCurrencyId);
  const paramOutputCurrency = useCurrency(outputCurrencyId);
  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    paramInputCurrency,
    paramOutputCurrency,
  ];

  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(
    false,
  );
  const urlLoadedTokens: Token[] = useMemo(
    () =>
      [loadedInputCurrency, loadedOutputCurrency]?.filter(
        (c): c is Token => c?.isToken ?? false,
      ) ?? [],
    [loadedInputCurrency, loadedOutputCurrency],
  );
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true);
  }, []);

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens();
  const importTokensNotInDefault =
    urlLoadedTokens &&
    urlLoadedTokens.filter((token: Token) => {
      return !Boolean(token.address in defaultTokens);
    });

  const theme = useContext(ThemeContext);

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle();

  // for expert mode
  const [isExpertMode] = useExpertModeManager();

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

  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;
  const { address: recipientAddress } = useENSAddress(recipient);

  const parsedAmounts = useMemo(
    () =>
      showWrap
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
    [independentField, parsedAmount, showWrap, trade],
  );

  const fiatValueInput = useUSDCValue(parsedAmounts[Field.INPUT]);
  const fiatValueOutput = useUSDCValue(parsedAmounts[Field.OUTPUT]);
  const priceImpact = computeFiatValuePriceImpact(
    fiatValueInput,
    fiatValueOutput,
  );

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
    { showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash },
    setSwapState,
  ] = useState<{
    showConfirm: boolean;
    tradeToConfirm: V3Trade<Currency, Currency, TradeType> | undefined;
    attemptingTxn: boolean;
    swapErrorMessage: string | undefined;
    txHash: string | undefined;
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  });

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  };

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

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approvalState === ApprovalState.PENDING) {
      setApprovalSubmitted(true);
    }
  }, [approvalState, approvalSubmitted]);

  const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(
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

  const handleSwap = useCallback(() => {
    if (!swapCallback) {
      return;
    }
    if (priceImpact && !confirmPriceImpactWithoutFee(priceImpact, t)) {
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
      .then((hash) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: undefined,
          txHash: hash,
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
    swapCallback,
    priceImpact,
    tradeToConfirm,
    showConfirm,
    recipient,
    recipientAddress,
    account,
    trade,
    t,
  ]);

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false);

  // warnings on the greater of fiat value price impact and execution price impact
  const priceImpactSeverity = useMemo(() => {
    const executionPriceImpact = trade?.priceImpact;
    return warningSeverity(
      executionPriceImpact && priceImpact
        ? executionPriceImpact.greaterThan(priceImpact)
          ? executionPriceImpact
          : priceImpact
        : executionPriceImpact ?? priceImpact,
    );
  }, [priceImpact, trade]);

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approvalState === ApprovalState.NOT_APPROVED ||
      approvalState === ApprovalState.PENDING ||
      (approvalSubmitted && approvalState === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode);

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
    (inputCurrency) => {
      setApprovalSubmitted(false); // reset 2 step UI for approvals
      if (
        (inputCurrency &&
          inputCurrency.isNative &&
          currencies[Field.OUTPUT] &&
          currencies[Field.OUTPUT]?.isNative) ||
        (inputCurrency &&
          inputCurrency.address &&
          currencies[Field.OUTPUT] &&
          currencies[Field.OUTPUT]?.wrapped &&
          currencies[Field.OUTPUT]?.wrapped.address &&
          inputCurrency.address.toLowerCase() ===
            currencies[Field.OUTPUT]?.wrapped.address.toLowerCase())
      ) {
        redirectWithSwitch();
      } else {
        redirectWithCurrency(inputCurrency, true, false);
      }
    },
    [redirectWithCurrency, currencies, redirectWithSwitch],
  );

  const parsedCurrency0Id = (parsedQs.currency0 ??
    parsedQs.inputCurrency) as string;
  const parsedCurrency0 = useCurrency(
    parsedCurrency0Id === 'ETH' ? 'MATIC' : parsedCurrency0Id,
  );
  const parsedCurrency1Id = (parsedQs.currency1 ??
    parsedQs.outputCurrency) as string;
  useEffect(() => {
    if (!chainId) return;
    if (parsedCurrency0) {
      onCurrencySelection(Field.INPUT, parsedCurrency0);
    } else if (parsedCurrency0 === undefined && !parsedCurrency1Id) {
      const nativeCurrency = {
        ...ETHER,
        isNative: true,
        isToken: false,
        wrapped: WMATIC_EXTENDED[chainId],
      } as NativeCurrency;
      redirectWithCurrency(nativeCurrency, true, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedCurrency0, parsedCurrency1Id]);

  const handleMaxInput = useCallback(() => {
    maxInputAmount && onUserInput(Field.INPUT, maxInputAmount.toExact());
    ReactGA.event({
      category: 'Swap',
      action: 'Max',
    });
  }, [maxInputAmount, onUserInput]);

  const handleHalfInput = useCallback(() => {
    if (!maxInputAmount) {
      return;
    }

    ReactGA.event({
      category: 'Swap',
      action: 'Half',
    });

    const halvedAmount = maxInputAmount.divide('2');

    onUserInput(
      Field.INPUT,
      halvedAmount.toFixed(maxInputAmount.currency.decimals),
    );
  }, [maxInputAmount, onUserInput]);

  const handleOutputSelect = useCallback(
    (outputCurrency) => {
      if (
        (outputCurrency &&
          outputCurrency.isNative &&
          currencies[Field.INPUT] &&
          currencies[Field.INPUT]?.isNative) ||
        (outputCurrency &&
          outputCurrency.address &&
          currencies[Field.INPUT] &&
          currencies[Field.INPUT]?.wrapped &&
          currencies[Field.INPUT]?.wrapped.address &&
          outputCurrency.address.toLowerCase() ===
            currencies[Field.INPUT]?.wrapped.address.toLowerCase())
      ) {
        redirectWithSwitch();
      } else {
        redirectWithCurrency(outputCurrency, false, false);
      }
    },
    [redirectWithCurrency, currencies, redirectWithSwitch],
  );

  const parsedCurrency1 = useCurrency(
    parsedCurrency1Id === 'ETH' ? 'MATIC' : parsedCurrency1Id,
  );
  useEffect(() => {
    if (parsedCurrency1) {
      onCurrencySelection(Field.OUTPUT, parsedCurrency1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedCurrency1Id]);

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
        isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
        tokens={importTokensNotInDefault}
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
            priceImpact={priceImpact}
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
        {!showWrap && isExpertMode ? (
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

        {!showWrap && trade && (
          <div className='flex items-center'>
            <TradePrice
              price={trade.executionPrice}
              showInverted={showInverted}
              setShowInverted={setShowInverted}
            />
            <MouseoverTooltipContent
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              onOpen={() => {
                ReactGA.event({
                  category: 'Swap',
                  action: 'Transaction Details Tooltip Open',
                });
              }}
              content={
                <AdvancedSwapDetails
                  trade={trade}
                  allowedSlippage={allowedSlippage}
                />
              }
            >
              <Info size={'1rem'} stroke='white' />
            </MouseoverTooltipContent>
          </div>
        )}

        <Box className='swapButtonWrapper'>
          {!account ? (
            <Button fullWidth onClick={toggleWalletModal}>
              {t('connectWallet')}
            </Button>
          ) : showWrap ? (
            <Button
              fullWidth
              disabled={Boolean(wrapInputError)}
              onClick={onWrap}
            >
              {wrapInputError ??
                (wrapType === WrapType.WRAP
                  ? t('wrap')
                  : wrapType === WrapType.UNWRAP
                  ? t('unWrap')
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
                  <Box className='flex justify-between'>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: theme.winterMainButton,
                        color: 'white',
                      }}
                    >
                      <CurrencyLogo
                        currency={currencies[Field.INPUT] as WrappedCurrency}
                        size={'24px'}
                        style={{ marginRight: '8px', flexShrink: 0 }}
                      />
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
                    {approvalState === ApprovalState.PENDING ? (
                      <Loader stroke='white' style={{ marginLeft: '5px' }} />
                    ) : (approvalSubmitted &&
                        approvalState === ApprovalState.APPROVED) ||
                      signatureState === UseERC20PermitState.SIGNED ? (
                      <CheckCircle
                        size='20'
                        style={{ marginLeft: '5px' }}
                        color={theme.green1}
                      />
                    ) : (
                      <MouseoverTooltip
                        text={t('mustgiveContractsPermission', {
                          symbol: currencies[Field.INPUT]?.symbol,
                        })}
                      >
                        <HelpCircle
                          size='20'
                          color={'white'}
                          style={{ marginLeft: '8px' }}
                        />
                      </MouseoverTooltip>
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
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        //@ts-ignore
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
                if (isExpertMode) {
                  handleSwap();
                } else {
                  setSwapState({
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    //@ts-ignore
                    tradeToConfirm: trade,
                    attemptingTxn: false,
                    swapErrorMessage: undefined,
                    showConfirm: true,
                    txHash: undefined,
                  });
                }
              }}
              id='swap-button'
              disabled={!isValid || priceImpactTooHigh || !!swapCallbackError}
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
