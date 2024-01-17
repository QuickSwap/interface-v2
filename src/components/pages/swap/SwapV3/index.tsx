import {
  Currency,
  CurrencyAmount,
  NativeCurrency,
  Token,
  TradeType,
} from '@uniswap/sdk-core';
import ExchangeIcon from 'svgs/ExchangeIcon.svg';
import CurrencyLogo from 'components/CurrencyLogo';
import CurrencyInputPanel from 'components/v3/CurrencyInputPanel';
import { AdvancedSwapDetails } from 'components/v3/swap/AdvancedSwapDetails';
import ConfirmSwapModal from 'components/v3/swap/ConfirmSwapModal';
import SwapCallbackError from 'components/v3/swap/SwapCallbackError';
import SwapHeader from 'components/v3/swap/SwapHeader';
import TradePrice from 'components/v3/swap/TradePrice';
import TokenWarningModal from 'components/v3/TokenWarningModal';
import { useActiveWeb3React, useGetConnection, useMasaAnalytics } from 'hooks';
import useENSAddress from 'hooks/useENSAddress';
import {
  ApprovalState,
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
import { Trade as V3Trade } from 'lib/trade';
import { WrappedCurrency } from 'models/types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, CheckCircle, HelpCircle, Info } from 'react-feather';
import { event } from 'nextjs-google-analytics';
import { useRouter } from 'next/router';
import { useWalletModalToggle } from 'state/application/hooks';
import { Field } from 'state/swap/v3/actions';
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from 'state/swap/v3/hooks';
import { useExpertModeManager, useSelectedWallet } from 'state/user/hooks';
import { getTradeVersion } from 'utils/v3/getTradeVersion';
import { halfAmountSpend, maxAmountSpend } from 'utils/v3/maxAmountSpend';
import { warningSeverity } from 'utils/v3/prices';

import { Box, Button, CircularProgress } from '@mui/material';
import { ChainId, ETHER, WETH } from '@uniswap/sdk';
import { AddressInput, CustomTooltip } from 'components';
import {
  SWAP_ROUTER_ADDRESSES,
  UNI_SWAP_ROUTER,
  WMATIC_EXTENDED,
} from 'constants/v3/addresses';
import useSwapRedirects from 'hooks/useSwapRedirect';
import { useTranslation } from 'next-i18next';
import { CHAIN_INFO } from 'constants/v3/chains';
import styles from 'styles/components/Swap.module.scss';
import { useTransactionFinalizer } from 'state/transactions/hooks';
import { getConfig } from 'config/index';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';
import { useV3TradeTypeAnalyticsCallback } from 'components/Swap/LiquidityHub';

const SwapV3Page: React.FC = () => {
  const { t } = useTranslation();
  const { account, chainId } = useActiveWeb3React();
  const router = useRouter();
  const chainIdToUse = chainId ?? ChainId.MATIC;
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
      return !(token.address in defaultTokens);
    });

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
    router.push('/swap?swapIndex=2');
  }, [router]);

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
      [dependentField]: showWrap
        ? parsedAmounts[independentField]?.toExact() ?? ''
        : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
    };
  }, [dependentField, independentField, parsedAmounts, showWrap, typedValue]);

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
      } catch (err) {
        const error = err as any;
        // try to approve if gatherPermitSignature failed for any reason other than the user rejecting it
        if (error?.code !== 4001) {
          await approveCallback();
        }
      }
    } else {
      await approveCallback();
      event('Approve', {
        category: 'Swap',
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
  const { selectedWallet } = useSelectedWallet();
  const getConnection = useGetConnection();
  const { price: fromTokenUSDPrice } = useUSDCPriceFromAddress(
    currencies[Field.INPUT]?.wrapped.address ?? '',
  );
  const onV3TradeAnalytics = useV3TradeTypeAnalyticsCallback(
    currencies,
    allowedSlippage,
  );

  const isUni = trade?.swaps[0]?.route?.pools[0]?.isUni;

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
        event(
          recipient === null
            ? 'Swap w/o Send'
            : (recipientAddress ?? recipient) === account
            ? 'Swap w/o Send + recipient'
            : 'Swap w/ Send',
          {
            category: 'Swap',
            label: [
              trade?.inputAmount?.currency?.symbol,
              trade?.outputAmount?.currency?.symbol,
              getTradeVersion(trade),
              'MH',
              account,
            ].join('/'),
          },
        );
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
          if (
            account &&
            currencies[Field.INPUT] &&
            selectedWallet &&
            chainId === ChainId.MATIC
          ) {
            const connection = getConnection(selectedWallet);
            fireEvent('trade', {
              user_address: account,
              network: config['networkName'],
              contract_address: isUni
                ? UNI_SWAP_ROUTER[chainId]
                : SWAP_ROUTER_ADDRESSES[chainId],
              asset_amount: formattedAmounts[Field.INPUT],
              asset_ticker: currencies[Field.INPUT].symbol ?? '',
              additionalEventData: {
                wallet: connection.name,
                asset_usd_amount: (
                  Number(formattedAmounts[Field.INPUT]) * fromTokenUSDPrice
                ).toString(),
              },
            });
          }
        } catch (err) {
          const error = err as any;
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
    swapCallback,
    account,
    currencies,
    selectedWallet,
    chainId,
    tradeToConfirm,
    showConfirm,
    getConnection,
    fireEvent,
    config,
    formattedAmounts,
    fromTokenUSDPrice,
    finalizedTransaction,
    recipient,
    recipientAddress,
    trade,
    isUni,
    onV3TradeAnalytics,
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
    (approvalState === ApprovalState.NOT_APPROVED ||
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

  const { redirectWithCurrency, redirectWithSwitch } = useSwapRedirects();

  const handleInputSelect = useCallback(
    (inputCurrency: any) => {
      setApprovalSubmitted(false); // reset 2 step UI for approvals
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
        redirectWithCurrency(inputCurrency, true, false);
      }
    },
    [redirectWithCurrency, currencies, redirectWithSwitch],
  );

  const parsedCurrency0Id = (router.query.currency0 ??
    router.query.inputCurrency) as string;
  const chainInfo = CHAIN_INFO[chainIdToUse];

  const parsedCurrency0 = useCurrency(
    parsedCurrency0Id === 'ETH'
      ? chainInfo.nativeCurrencySymbol
      : parsedCurrency0Id,
  );
  const parsedCurrency1Id = (router.query.currency1 ??
    router.query.outputCurrency) as string;
  useEffect(() => {
    if (!chainId) return;
    if (parsedCurrency0) {
      onCurrencySelection(Field.INPUT, parsedCurrency0);
    } else if (parsedCurrency0 === undefined && !parsedCurrency1Id) {
      const nativeCurrency = {
        ...ETHER[chainId],
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
    event('Max', {
      category: 'Swap',
      action: 'Max',
    });
  }, [maxInputAmount, onUserInput]);

  const handleHalfInput = useCallback(() => {
    if (!halfInputAmount) {
      return;
    }

    event('Half', {
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
        redirectWithCurrency(outputCurrency, false, false);
      }
    },
    [redirectWithCurrency, currencies, redirectWithSwitch],
  );

  const parsedCurrency1 = useCurrency(
    parsedCurrency1Id === 'ETH'
      ? chainInfo.nativeCurrencySymbol
      : parsedCurrency1Id,
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

        <Box className={styles.exchangeSwap}>
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
        {!showWrap && isExpertMode ? (
          <Box className={styles.recipientInput} mb={1.5}>
            <Box className={styles.recipientInputHeader}>
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
            <CustomTooltip
              onOpen={() => {
                event('Transaction Details Tooltip Open', {
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

        <Box className={styles.swapButtonWrapper}>
          {!account ? (
            <Button fullWidth onClick={toggleWalletModal}>
              {t('connectWallet')}
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
                  <Box className='flex justify-between items-center' gap='5px'>
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
                    {approvalState === ApprovalState.PENDING ? (
                      <CircularProgress size='16px' />
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
