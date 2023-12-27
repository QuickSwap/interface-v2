import React, { useCallback, useMemo } from 'react';
import Web3 from 'web3';
import BN from 'bignumber.js';
import {
  useExpertModeManager,
  useLiquidityHubManager,
  useUserSlippageTolerance,
} from 'state/user/hooks';
import { useActiveWeb3React, useIsProMode } from 'hooks';
import { useLocation } from 'react-router-dom';
import { styled } from '@material-ui/styles';
import { Box, Divider } from '@material-ui/core';
import OrbsLogo from 'assets/images/orbs-logo.svg';
import {
  setWeb3Instance,
  signEIP712,
  maxUint256,
  permit2Address,
  hasWeb3Instance,
  zeroAddress,
} from '@defi.org/web3-candies';
import { useTranslation } from 'react-i18next';
import {
  useLiquidityHubActionHandlers,
  useLiquidityHubState,
} from 'state/swap/liquidity-hub/hooks';
import { useTokenContract, useWETHContract } from 'hooks/useContract';
import { getConfig } from 'config/index';
import ToggleSwitch from 'components/ToggleSwitch';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';
import { ChainId, ETHER, Trade, WETH, Currency } from '@uniswap/sdk';
import { Contract } from 'ethers';
import { useSwapActionHandlers } from 'state/swap/hooks';
import { Field } from 'state/swap/actions';
import { Currency as CoreCurrency, Percent } from '@uniswap/sdk-core';
import { ZERO_ADDRESS } from 'constants/v3/misc';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import { parseUnits } from 'ethers/lib/utils';
import { getFixedValue } from 'utils';
const ANALYTICS_VERSION = 0.2;
const API_ENDPOINT = 'https://hub.orbs.network';
const WEBSITE = 'https://www.orbs.com';
const BI_ENDPOINT = `https://bi.orbs.network/putes/liquidity-hub-ui-${ANALYTICS_VERSION}`;
const DEX_PRICE_BETTER_ERROR = 'Dex trade is better than Clob trade';
const PARTNER = 'QuickSwap';

export const useLiquidityHubCallback = (
  inTokenAddress?: string,
  outTokenAddress?: string,
  inTokenCurrency?: Currency,
  outTokenCurrency?: Currency,
) => {
  const [liquidityHubDisabled] = useLiquidityHubManager();
  const { account, library, chainId } = useActiveWeb3React();
  const liquidityHubState = useLiquidityHubState();
  const { onSetLiquidityHubState } = useLiquidityHubActionHandlers();
  const { lhControl } = useQueryParam();
  const approve = useApprove();
  const wethContract = useWETHContract();
  const inTokenContract = useTokenContract(inTokenAddress);
  const isApproved = useApproved();
  const swap = useSwap();
  const sign = useSign();
  const quote = useQuote();
  const wrap = useWrap();
  const isSupported = useIsLiquidityHubSupported();

  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  const nativeCurrency = ETHER[chainIdToUse];

  const isNativeIn = nativeCurrency.symbol === inTokenCurrency?.symbol;
  const isNativeOut = nativeCurrency.symbol === outTokenCurrency?.symbol;

  const { price: outTokenUSD } = useUSDCPriceFromAddress(
    isNativeOut ? WETH[chainId].address : outTokenAddress || '',
  );

  const isProMode = useIsProMode();
  const [expertMode] = useExpertModeManager();
  const [userSlippageTolerance] = useUserSlippageTolerance();

  return async (srcAmount?: string, minDestAmount?: string) => {
    liquidityHubAnalytics.clearState();
    const dstTokenUsdValue = new BN(minDestAmount || '0')
      .multipliedBy(outTokenUSD || 0)
      .dividedBy(new BN(10).pow(new BN(outTokenCurrency?.decimals || 0)))
      .toNumber();
    const isForce = lhControl === LiquidityHubControl.FORCE;

    liquidityHubAnalytics.onBestTrade({
      dexAmountOut: minDestAmount,
      dstTokenUsdValue,
      srcTokenAddress: inTokenAddress,
      srcTokenSymbol: inTokenCurrency?.symbol,
      dstTokenAddress: outTokenAddress,
      dstTokenSymbol: outTokenCurrency?.symbol,
      srcAmount,
      slippage: userSlippageTolerance / 100,
      walletAddress: account,
    });

    if (isProMode) {
      liquidityHubAnalytics.onIsProMode();
    }
    if (expertMode) {
      liquidityHubAnalytics.onExpertMode();
    }
    if (isForce) {
      liquidityHubAnalytics.onForceClob();
    }

    try {
      if (liquidityHubState.isFailed) {
        if (!isForce) {
          throw new Error('previous failure');
        }
      }
      if (lhControl === LiquidityHubControl.SKIP) {
        throw new Error('query param');
      }
      if (!isSupported) {
        throw new Error('clob not supported');
      }
      if (liquidityHubDisabled) {
        throw new Error('clob disabled');
      }
      if (!minDestAmount) {
        throw new Error('minDestAmount is not defined');
      }
      if (!inTokenAddress) {
        throw new Error('inTokenAddress is not defined');
      }
      if (!outTokenAddress) {
        throw new Error('outTokenAddress is not defined');
      }
      if (!library) {
        throw new Error('library is not defined');
      }
      if (!account) {
        throw new Error('account is not defined');
      }
      if (!srcAmount) {
        throw new Error('srcAmount is not defined');
      }
    } catch (error) {
      liquidityHubAnalytics.onNotClobTrade(error.message);
      return;
    }

    onSetLiquidityHubState({
      isLoading: true,
    });

    const quoteArgs: QuoteArgs = {
      outToken: outTokenAddress,
      inAmount: srcAmount,
      inToken: isNativeIn ? zeroAddress : inTokenAddress,
      minDestAmount,
    };
    let wrapped = false;
    const nativeInStartFlow = async () => {
      await quote(quoteArgs);
      wrapped = await wrap(srcAmount);

      const approved = await isApproved(srcAmount, wethContract);
      if (!approved) {
        liquidityHubAnalytics.onApprovedBeforeTheTrade(false);
        await approve(wethContract);
      } else {
        liquidityHubAnalytics.onApprovedBeforeTheTrade(true);
      }
    };

    const regularStartFlow = async () => {
      const approved = await isApproved(srcAmount, inTokenContract);
      if (!approved) {
        liquidityHubAnalytics.onApprovedBeforeTheTrade(false);
        await quote(quoteArgs);
        await approve(inTokenContract);
      } else {
        liquidityHubAnalytics.onApprovedBeforeTheTrade(true);
      }
    };

    try {
      if (isNativeIn) {
        await nativeInStartFlow();
      } else {
        await regularStartFlow();
      }

      const quoteResult = await quote(quoteArgs);
      onSetLiquidityHubState({
        isWon: true,
        isLoading: false,
        outAmount: quoteResult.outAmount,
      });
      const signature = await sign(quoteResult.permitData);

      const response = await swap({
        srcToken: inTokenAddress,
        destToken: outTokenAddress,
        srcAmount,
        minDestAmount,
        signature,
        quoteResult,
      });
      liquidityHubAnalytics.onClobSuccess(response);
      return response;
    } catch (error) {
      liquidityHubAnalytics.onClobFailure();
      onSetLiquidityHubState({ isFailed: true });
      if (wrapped) {
        throw new Error(
          'Transaction reverted, Please try again. Note! Your MATIC has been wrapped and are now wMATIC',
        );
      }
      return undefined;
    } finally {
      onSetLiquidityHubState({
        isLoading: false,
        isWon: false,
        outAmount: '',
      });
    }
  };
};

const useWrap = () => {
  const wethContract = useWETHContract();
  const { onSetLiquidityHubState } = useLiquidityHubActionHandlers();
  const { onCurrencySelection } = useSwapActionHandlers();
  const { chainId } = useActiveWeb3React();

  return async (inAmount: string) => {
    const chainIdToUse = chainId ? chainId : ChainId.MATIC;

    const count = counter();
    onSetLiquidityHubState({ waitingForWrap: true });
    liquidityHubAnalytics.onWrapRequest();
    try {
      const txReceipt = await wethContract?.deposit({
        value: `0x${new BN(inAmount).toString(16)}`,
      });
      onCurrencySelection(Field.INPUT, WETH[chainIdToUse]);
      const res = await txReceipt.wait();
      liquidityHubAnalytics.onWrapSuccess(res.transactionHash, count());
      return true;
    } catch (error) {
      liquidityHubAnalytics.onWrapFailed(error.message, count());
      throw new Error(error.message);
    } finally {
      onSetLiquidityHubState({ waitingForWrap: false });
    }
  };
};

const useApproved = () => {
  const { account } = useActiveWeb3React();

  return async (srcAmount: string, tokenContract: Contract | null) => {
    try {
      const allowance = await tokenContract?.allowance(account, permit2Address);
      return BN(allowance?.toString() || '0').gte(BN(srcAmount));
    } catch (error) {
      return false;
    }
  };
};

const useApprove = () => {
  const { onSetLiquidityHubState } = useLiquidityHubActionHandlers();

  return async (tokenContract?: Contract | null) => {
    const count = counter();
    try {
      onSetLiquidityHubState({ waitingForApproval: true });
      liquidityHubAnalytics.onApprovalRequest();
      const response = await tokenContract?.approve(
        permit2Address,
        maxUint256,
        {
          gasLimit: 100_000,
        },
      );

      const res = await response.wait();
      liquidityHubAnalytics.onApprovalSuccess(count());
      return res;
    } catch (error) {
      liquidityHubAnalytics.onApprovalFailed(error.message, count());
      throw new Error(error.message);
    } finally {
      onSetLiquidityHubState({ waitingForApproval: false });
    }
  };
};

const useSign = () => {
  const { account, library } = useActiveWeb3React();
  const { onSetLiquidityHubState } = useLiquidityHubActionHandlers();
  return async (permitData: any) => {
    const count = counter();

    try {
      if (!account || !library) {
        throw new Error('No account or library');
      }
      onSetLiquidityHubState({ waitingForSignature: true });
      liquidityHubAnalytics.onSignatureRequest();
      if (!hasWeb3Instance()) {
        setWeb3Instance(new Web3(library.provider as any));
      }
      process.env.DEBUG = 'web3-candies';
      const signature = await signEIP712(account, permitData);
      liquidityHubAnalytics.onSignatureSuccess(signature, count());
      return signature;
    } catch (error) {
      liquidityHubAnalytics.onSignatureFailed(error.message, count());
      throw new Error(error.message);
    } finally {
      onSetLiquidityHubState({ waitingForSignature: false });
    }
  };
};

const useSwap = () => {
  const { library, account } = useActiveWeb3React();
  return async (args: {
    srcToken: string;
    destToken: string;
    srcAmount: string;
    minDestAmount: string;
    signature: string;
    quoteResult: QuoteResponse;
  }) => {
    const count = counter();
    try {
      liquidityHubAnalytics.onSwapRequest();
      const txHashResponse = await fetch(`${API_ENDPOINT}/swapx?chainId=137`, {
        method: 'POST',
        body: JSON.stringify({
          inToken: args.srcToken,
          outToken: args.destToken,
          inAmount: args.srcAmount,
          user: account,
          signature: args.signature,
          ...args.quoteResult,
        }),
      });
      const swap = await txHashResponse.json();
      if (!swap) {
        throw new Error('Missing swap response');
      }

      if (swap.error || (swap.message && !swap.txHash)) {
        throw new Error(swap);
      }

      if (!swap.txHash) {
        throw new Error('Missing txHash');
      }
      const tx = await waitForTx(swap.txHash, library);
      liquidityHubAnalytics.onSwapSuccess(swap.txHash, count());
      return tx;
    } catch (error) {
      const message = JSON.stringify(error);
      liquidityHubAnalytics.onSwapFailed(message, count());
      throw new Error(message);
    }
  };
};

const useQuote = () => {
  const { account } = useActiveWeb3React();
  const [userSlippageTolerance] = useUserSlippageTolerance();
  const { lhControl } = useQueryParam();

  return async (args: QuoteArgs) => {
    let quoteResponse: any;
    const count = counter();
    liquidityHubAnalytics.incrementQuoteIndex();
    liquidityHubAnalytics.onQuoteRequest();
    try {
      const response = await fetch(`${API_ENDPOINT}/quote?chainId=137`, {
        method: 'POST',
        body: JSON.stringify({
          inToken: args.inToken,
          outToken: args.outToken,
          inAmount: args.inAmount,
          outAmount: args.minDestAmount,
          user: account,
          slippage: userSlippageTolerance / 100,
          qs: encodeURIComponent(window.location.hash),
          sessionId: liquidityHubAnalytics.data.sessionId,
        }),
      });
      quoteResponse = await response.json();

      if (!quoteResponse) {
        throw new Error('Missing result from quote');
      }
      liquidityHubAnalytics.setSessionId(quoteResponse.sessionId);
      if (quoteResponse.error) {
        throw new Error(quoteResponse.error);
      }

      if (quoteResponse.message) {
        throw new Error(quoteResponse.message);
      }
      const isForce = lhControl === LiquidityHubControl.FORCE;
      if (
        !isForce &&
        BN(quoteResponse.outAmount || '0').isLessThan(
          BN(args.minDestAmount || '0'),
        )
      ) {
        throw new Error(DEX_PRICE_BETTER_ERROR);
      }
      liquidityHubAnalytics.onQuoteSuccess(quoteResponse, count());
      return quoteResponse as QuoteResponse;
    } catch (error) {
      liquidityHubAnalytics.onQuoteFailed(
        error.message,
        count(),
        quoteResponse,
      );

      throw new Error(error.message);
    }
  };
};

//utils

const useIsLiquidityHubSupported = () => {
  const { chainId } = useActiveWeb3React();

  return useMemo(() => getConfig(chainId)?.swap?.liquidityHub, [chainId]);
};

export const useIsLiquidityHubEnabled = () => {
  const isSupported = useIsLiquidityHubSupported();
  const [liquidityHubDisabled] = useLiquidityHubManager();

  return isSupported && !liquidityHubDisabled;
};

async function waitForTx(txHash: string, library: any) {
  for (let i = 0; i < 30; ++i) {
    // due to swap being fetch and not web3

    await delay(3_000); // to avoid potential rate limiting from public rpc
    try {
      const tx = await library.getTransaction(txHash);
      if (tx && tx instanceof Object && tx.blockNumber) {
        return tx;
      }
    } catch (error) {}
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const useQueryParam = () => {
  const location = useLocation();

  const query = useMemo(() => new URLSearchParams(location.search), [
    location.search,
  ]);

  return {
    lhControl: query.get('liquidity-hub')?.toLowerCase(),
  };
};

enum TradeType {
  V2 = 'V2',
  V3 = 'V3',
  BEST_TRADE = 'BEST_TRADE',
  TWAP = 'TWAP',
  LIMIT = 'LIMIT',
}

type InitTradeArgs = {
  srcTokenAddress?: string;
  dstTokenAddress?: string;
  srcTokenSymbol?: string;
  dstTokenSymbol?: string;
  walletAddress?: string;
  slippage?: number;
  srcAmount?: string;
  dexAmountOut?: string;
  dstTokenUsdValue?: number;
};

const initialData: Partial<LiquidityHubAnalyticsData> = {
  _id: crypto.randomUUID(),
  partner: PARTNER,
  chainId: 137,
  isClobTrade: false,
  isNotClobTradeReason: 'null',
  firstFailureSessionId: 'null',
  clobDexPriceDiffPercent: 'null',
  quoteIndex: 0,
  'quote-1-state': 'null',
  approvalState: 'null',
  'quote-2-state': 'null',
  signatureState: 'null',
  swapState: 'null',
  wrapState: 'null',
  onChainClobSwapState: 'null',
  onChainDexSwapState: 'null',
  dexSwapState: 'null',
  dexSwapError: 'null',
  dexSwapTxHash: 'null',
  userWasApprovedBeforeTheTrade: 'null',
  isForceClob: false,
  isDexTrade: false,
  version: ANALYTICS_VERSION,
};

const counter = () => {
  const now = Date.now();

  return () => {
    return Date.now() - now;
  };
};

class LiquidityHubAnalytics {
  initialTimestamp = Date.now();
  data = initialData;
  firstFailureSessionId = '';
  abortController = new AbortController();

  private updateAndSend(values = {} as Partial<LiquidityHubAnalyticsData>) {
    try {
      this.abortController.abort();
      this.abortController = new AbortController();
      this.data = { ...this.data, ...values };
      fetch(BI_ENDPOINT, {
        method: 'POST',
        signal: this.abortController.signal,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.data),
      });
    } catch (error) {}
  }

  incrementQuoteIndex() {
    this.updateAndSend({
      quoteIndex: !this.data.quoteIndex ? 1 : this.data.quoteIndex + 1,
    });
  }

  onQuoteRequest() {
    this.updateAndSend({ [`quote-${this.data.quoteIndex}-state`]: 'pending' });
  }

  onQuoteSuccess(quoteResponse: QuoteResponse, time: number) {
    this.updateAndSend({ [`quote-${this.data.quoteIndex}-state`]: 'success' });
    this.onQuoteData(quoteResponse, time);
  }

  onBestTrade(values: InitTradeArgs) {
    this.updateAndSend({ tradeType: TradeType.BEST_TRADE, ...values });
  }
  onTwapTrade(values: InitTradeArgs) {
    this.updateAndSend({ tradeType: TradeType.TWAP, ...values });
  }

  onLimitTrade(values: InitTradeArgs) {
    this.updateAndSend({ tradeType: TradeType.LIMIT, ...values });
  }

  onV2Trade(values: InitTradeArgs) {
    this.updateAndSend({ tradeType: TradeType.V2, ...values });
  }

  onV3Trade(values: InitTradeArgs) {
    this.updateAndSend({ tradeType: TradeType.V3, ...values });
  }

  onQuoteFailed(error: string, time: number, quoteResponse?: QuoteResponse) {
    if (error == DEX_PRICE_BETTER_ERROR) {
      this.updateAndSend({
        isNotClobTradeReason: DEX_PRICE_BETTER_ERROR,
        [`quote-${this.data.quoteIndex}-state`]: 'success',
      });
    } else {
      this.updateAndSend({
        [`quote-${this.data.quoteIndex}-error`]: error,
        [`quote-${this.data.quoteIndex}-state`]: 'failed',
        isNotClobTradeReason: `quote-${this.data.quoteIndex}-failed`,
      });
    }

    this.onQuoteData(quoteResponse, time);
  }

  onQuoteData(quoteResponse?: QuoteResponse, time?: number) {
    const getDiff = () => {
      if (!quoteResponse?.outAmount || !this.data.dexAmountOut) {
        return '';
      }
      return new BN(quoteResponse?.outAmount)
        .dividedBy(new BN(this.data.dexAmountOut))
        .minus(1)
        .multipliedBy(100)
        .toFixed(2);
    };

    this.updateAndSend({
      [`quote-${this.data.quoteIndex}-amount-out`]: quoteResponse?.outAmount,
      [`quote-${this.data.quoteIndex}-serialized-order`]: quoteResponse?.serializedOrder,
      [`quote-${this.data.quoteIndex}-quote-millis`]: time,
      clobDexPriceDiffPercent: getDiff(),
    });
  }

  onApprovedBeforeTheTrade(userWasApprovedBeforeTheTrade: boolean) {
    this.updateAndSend({ userWasApprovedBeforeTheTrade });
  }

  onApprovalRequest() {
    this.updateAndSend({ approvalState: 'pending' });
  }

  onDexSwapRequest() {
    this.updateAndSend({ dexSwapState: 'pending', isDexTrade: true });
  }

  onDexSwapSuccess(response: any) {
    this.updateAndSend({
      dexSwapState: 'success',
      dexSwapTxHash: response.hash,
    });

    this.pollTransaction({
      response,
      onSucess: () => {
        this.updateAndSend({ onChainDexSwapState: 'success' });
      },
      onFailed: () => {
        this.updateAndSend({ onChainDexSwapState: 'failed' });
      },
    });
  }
  onDexSwapFailed(dexSwapError: string) {
    this.updateAndSend({ dexSwapState: 'failed', dexSwapError });
  }

  onApprovalSuccess(time: number) {
    this.updateAndSend({ approvalMillis: time, approvalState: 'success' });
  }

  onApprovalFailed(error: string, time: number) {
    this.updateAndSend({
      approvalError: error,
      approvalState: 'failed',
      approvalMillis: time,
      isNotClobTradeReason: 'approval failed',
    });
  }

  onSignatureRequest() {
    this.updateAndSend({ signatureState: 'pending' });
  }

  onWrapRequest() {
    this.updateAndSend({ wrapState: 'pending' });
  }

  onWrapSuccess(txHash: string, time: number) {
    this.updateAndSend({
      wrapTxHash: txHash,
      wrapMillis: time,
      wrapState: 'success',
    });
  }

  onWrapFailed(error: string, time: number) {
    this.updateAndSend({
      wrapError: error,
      wrapState: 'failed',
      wrapMillis: time,
      isNotClobTradeReason: 'wrap failed',
    });
  }

  onSignatureSuccess(signature: string, time: number) {
    this.updateAndSend({
      signature,
      signatureMillis: time,
      signatureState: 'success',
    });
  }

  onSignatureFailed(error: string, time: number) {
    this.updateAndSend({
      signatureError: error,
      signatureState: 'failed',
      signatureMillis: time,
      isNotClobTradeReason: 'signature failed',
    });
  }

  onSwapRequest() {
    this.updateAndSend({ swapState: 'pending' });
  }

  onSwapSuccess(txHash: string, time: number) {
    this.updateAndSend({
      txHash,
      swapMillis: time,
      swapState: 'success',
      isClobTrade: true,
      onChainClobSwapState: 'pending',
    });
  }

  onSwapFailed(error: string, time: number) {
    this.updateAndSend({
      swapError: error,
      swapState: 'failed',
      swapMillis: time,
      isNotClobTradeReason: 'swap failed',
    });
  }

  setSessionId(id: string) {
    this.data.sessionId = id;
  }

  onForceClob() {
    this.updateAndSend({ isForceClob: true });
  }

  onIsProMode() {
    this.updateAndSend({ isProMode: true });
  }

  onExpertMode() {
    this.updateAndSend({ expertMode: true });
  }

  clearState() {
    this.data = {
      ...initialData,
      _id: crypto.randomUUID(),
      firstFailureSessionId: this.firstFailureSessionId,
    };
  }

  async pollTransaction({
    response,
    onSucess,
    onFailed,
  }: {
    response: any;
    onSucess: () => void;
    onFailed: () => void;
  }) {
    try {
      const receipt = await response.wait();
      if (receipt.status === 1) {
        onSucess();
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      onFailed();
    }
  }

  async onClobSuccess(response: any) {
    this.pollTransaction({
      response,
      onSucess: () => {
        this.updateAndSend({ onChainClobSwapState: 'success' });
      },
      onFailed: () => {
        {
          this.updateAndSend({
            onChainClobSwapState: 'failed',
            isNotClobTradeReason: 'onchain swap error',
          });
        }
      },
    });
  }

  onNotClobTrade(message: string) {
    this.updateAndSend({ isNotClobTradeReason: message });
  }

  onClobFailure() {
    this.firstFailureSessionId =
      this.firstFailureSessionId || this.data.sessionId || '';
  }
}

export const liquidityHubAnalytics = new LiquidityHubAnalytics();

export const useConfirmationPendingContent = (pendingText?: string) => {
  const { t } = useTranslation();
  const liquidityHubState = useLiquidityHubState();
  return useMemo(() => {
    if (liquidityHubState?.waitingForApproval) {
      return {
        title: t('seekingBestPrice'),
        confirm: t('awaitingApproval'),
      };
    }
    if (liquidityHubState?.waitingForWrap) {
      return {
        title: t('seekingBestPrice'),
        confirm: t('awaitingWrap'),
      };
    }
    if (liquidityHubState?.isLoading) {
      return {
        title: t('seekingBestPrice'),
      };
    }
    if (liquidityHubState?.isWon) {
      return {
        title: t('optimizedRouteAvailable'),
        pending: pendingText,
        confirm:
          liquidityHubState.waitingForSignature &&
          t('signToPerformGaslessSwap'),
      };
    }
    return {
      title: t('waitingConfirm'),
      pending: pendingText,
      confirm: t('confirmTxinWallet'),
    };
  }, [
    liquidityHubState?.isLoading,
    liquidityHubState?.isWon,
    pendingText,
    t,
    liquidityHubState?.waitingForApproval,
    liquidityHubState.waitingForSignature,
    liquidityHubState?.waitingForWrap,
  ]);
};

// components

export const LiquidityHubTxSettings = () => {
  const [
    liquidityHubDisabled,
    toggleLiquidityHubDisabled,
  ] = useLiquidityHubManager();
  const { t } = useTranslation();

  const isSupported = useIsLiquidityHubSupported();
  if (!isSupported) return null;

  return (
    <>
      <Box my={2.5} className='flex items-center justify-between'>
        <StyledLiquidityHubTxSettings>
          <p>{t('disableLiquidityHub')}</p>
          <p className='bottom-text'>
            <img src={OrbsLogo} />
            <a
              target='_blank'
              rel='noreferrer'
              href={`${WEBSITE}/liquidity-hub`}
            >
              {t('liquidityHub')}
            </a>
            , {t('poweredBy').toLowerCase()}{' '}
            <a href={WEBSITE} target='_blank' rel='noreferrer'>
              Orbs
            </a>
            , {t('aboutLiquidityHub')}{' '}
            <a
              className='more-info'
              href={`${WEBSITE}/liquidity-hub`}
              target='_blank'
              rel='noreferrer'
            >
              {t('forMoreInfo')}
            </a>
          </p>
        </StyledLiquidityHubTxSettings>
        <ToggleSwitch
          toggled={liquidityHubDisabled}
          onToggle={toggleLiquidityHubDisabled}
        />
      </Box>
      <Divider />
    </>
  );
};

export const LiquidityHubConfirmationModalContent = ({
  txPending,
}: {
  txPending?: boolean;
}) => {
  const { t } = useTranslation();
  const liquidityHubState = useLiquidityHubState();

  if (!liquidityHubState?.isWon || txPending) {
    return null;
  }
  return (
    <StyledLiquidityHubTrade>
      <span>{t('using')}</span>{' '}
      <a href='orbs.com/liquidity-hub' target='_blank' rel='noreferrer'>
        {t('liquidityHub')}
      </a>{' '}
      {t('by')}{' '}
      <a href={WEBSITE} target='_blank' rel='noreferrer'>
        Orbs
        <img src={OrbsLogo} />
      </a>
    </StyledLiquidityHubTrade>
  );
};

// styles
const StyledLiquidityHubTrade = styled('p')({
  '& a': {
    textDecoration: 'none',
    display: 'inline-flex',
    gap: 5,
    fontWeight: 600,
    color: 'white',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  '& span': {
    textTransform: 'capitalize',
    fontSize: 'inherit',
  },
  '& img': {
    width: 22,
    height: 22,
    objectFit: 'contain',
  },
});

const StyledLiquidityHubTxSettings = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  '& .bottom-text': {
    maxWidth: 500,
    fontSize: 14,
    lineHeight: '23px',
    '& img': {
      width: 22,
      height: 22,
      marginRight: 8,
      position: 'relative',
      top: 6,
    },
    '& a': {
      textDecoration: 'none',
      fontWeight: 600,
      color: '#6381e9',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    '& .more-info': {
      color: 'inherit',
      fontWeight: 400,
      textDecoration: 'underline',
    },
  },
});

// types

type actionState = 'pending' | 'success' | 'failed' | 'null' | '';

interface LiquidityHubAnalyticsData {
  _id: string;
  partner: string;
  chainId: number;
  isForceClob: boolean;
  firstFailureSessionId?: string;
  sessionId?: string;
  walletAddress: string;
  dexAmountOut: string;
  isClobTrade: boolean;
  srcTokenAddress: string;
  srcTokenSymbol: string;
  dstTokenAddress: string;
  dstTokenSymbol: string;
  srcAmount: string;
  quoteIndex: number;
  slippage: number;
  'quote-1-state': actionState;
  'quote-2-state': string;
  clobDexPriceDiffPercent: string;

  approvalState: actionState;
  approvalError: string;
  approvalMillis: number | null;

  signatureState: actionState;
  signatureMillis: number | null;
  signature: string;
  signatureError: string;

  swapState: actionState;
  txHash: string;
  swapMillis: number | null;
  swapError: string;

  wrapState: actionState;
  wrapMillis: number | null;
  wrapError: string;
  wrapTxHash: string;

  dexSwapState: actionState;
  dexSwapError: string;
  dexSwapTxHash: string;

  userWasApprovedBeforeTheTrade?: boolean | string;
  dstAmountOutUsd: number;
  isProMode: boolean;
  expertMode: boolean;
  tradeType?: TradeType | null;
  isNotClobTradeReason: string;
  onChainClobSwapState: actionState;
  version: number;
  isDexTrade: boolean;
  onChainDexSwapState: actionState;
}

interface QuoteResponse {
  outAmount: string;
  permitData: any;
  serializedOrder: string;
  callData: string;
  rawData: any;
}

type QuoteArgs = {
  minDestAmount: string;
  inAmount: string;
  inToken: string;
  outToken: string;
};

enum LiquidityHubControl {
  FORCE = '1',
  SKIP = '2',
}

const handleV3Token = (currency: CoreCurrency | undefined, value?: string) => {
  if (!currency) {
    return {
      symbol: '',
      address: '',
      value: '',
    };
  }

  return {
    symbol: currency.isNative ? 'MATIC' : currency.wrapped.symbol,
    address: currency.isNative ? ZERO_ADDRESS : currency.wrapped.address,
    decimals: currency.decimals,
    value: parseUnits(
      getFixedValue(value || '0', currency.decimals),
      currency.decimals,
    ).toString(),
  };
};

export const useV3TradeTypeAnalyticsCallback = (
  currencies: {
    INPUT?: CoreCurrency | undefined;
    OUTPUT?: CoreCurrency | undefined;
  },
  allowedSlippage: Percent,
) => {
  const { account } = useActiveWeb3React();
  const outTokenUSD = useUSDCPriceFromAddress(
    currencies[Field.OUTPUT]?.wrapped.address || '',
  ).price;

  const srcTokenCurrency = currencies[Field.INPUT];
  const dstTokenCurrency = currencies[Field.OUTPUT];

  return useCallback(
    (formattedAmounts: { [x: string]: any; [x: number]: any }) => {
      try {
        const srcToken = handleV3Token(
          srcTokenCurrency,
          formattedAmounts[Field.INPUT],
        );

        const dstToken = handleV3Token(
          dstTokenCurrency,
          formattedAmounts[Field.OUTPUT],
        );
        liquidityHubAnalytics.onV3Trade({
          srcTokenAddress: srcToken.address,
          dstTokenAddress: dstToken.address,
          dstTokenSymbol: dstToken.symbol,
          srcTokenSymbol: srcToken.symbol,
          srcAmount: srcToken.value,
          dexAmountOut: dstToken.value,
          dstTokenUsdValue:
            outTokenUSD * Number(formattedAmounts[Field.OUTPUT]),
          walletAddress: account || '',
          slippage: Number(allowedSlippage.toFixed()),
        });
      } catch (error) {}
    },
    [srcTokenCurrency, dstTokenCurrency, outTokenUSD, account, allowedSlippage],
  );
};

export const useV2TradeTypeAnalyticsCallback = (
  currencies: {
    INPUT?: Currency | undefined;
    OUTPUT?: Currency | undefined;
  },
  allowedSlippage: number,
) => {
  const { account, chainId } = useActiveWeb3React();

  const srcTokenCurrency = currencies[Field.INPUT];
  const dstTokenCurrency = currencies[Field.OUTPUT];
  const inToken = wrappedCurrency(srcTokenCurrency, chainId);
  const outToken = wrappedCurrency(dstTokenCurrency, chainId);
  const outTokenUSD = useUSDCPriceFromAddress(outToken?.address).price;

  return useCallback(
    (trade?: Trade) => {
      try {
        liquidityHubAnalytics.onV2Trade({
          srcTokenAddress: inToken?.address,
          dstTokenAddress: outToken?.address,
          srcTokenSymbol: inToken?.symbol,
          dstTokenSymbol: outToken?.symbol,
          srcAmount: trade?.inputAmount.raw.toString(),
          dexAmountOut: trade?.outputAmount.raw.toString(),
          dstTokenUsdValue: outTokenUSD * Number(trade?.outputAmount.toExact()),
          walletAddress: account || '',
          slippage: allowedSlippage / 100,
        });
      } catch (error) {}
    },
    [account, inToken, outToken, outTokenUSD, allowedSlippage],
  );
};
