import React, { useEffect, useMemo } from 'react';
import Web3 from 'web3';
import BN from 'bignumber.js';
import {
  useLiquidityHubManager,
  useUserSlippageTolerance,
} from 'state/user/hooks';
import { useActiveWeb3React } from 'hooks';
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
} from '@defi.org/web3-candies';
import { useTranslation } from 'react-i18next';
import {
  useLiquidityHubActionHandlers,
  useLiquidityHubState,
} from 'state/swap/liquidity-hub/hooks';
import { useTokenContract } from 'hooks/useContract';
import { getConfig } from 'config';
import ToggleSwitch from 'components/ToggleSwitch';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';
const API_ENDPOINT = 'https://hub.orbs.network';
const WEBSITE = 'https://www.orbs.com';

const REQUEST_FILTERED_ERROR = 'requestFiltered';

export const useLiquidityHubCallback = (
  srcToken?: string,
  destToken?: string,
) => {
  const [liquidityHubDisabled] = useLiquidityHubManager();
  const { account, library } = useActiveWeb3React();
  const liquidityHubState = useLiquidityHubState();
  const { onSetLiquidityHubState } = useLiquidityHubActionHandlers();
  const queryParam = useQueryParam();
  const approve = useApprove(srcToken);
  const isApproved = useApproved(srcToken);
  const swap = useSwap();
  const sign = useSign();
  const firstQuote = useFirstQuote();
  const secondQuote = useSecondQuote();
  const isSupported = useIsLiquidityHubSupported();
  const dstTokenUsdValue = useUSDCPriceFromAddress(destToken || '');

  return async (
    srcAmount?: string,
    minDestAmount?: string,
    dstDecimals?: number,
  ) => {
    if (!isSupported) {
      return undefined;
    }
    if (liquidityHubDisabled) {
      liquidityHubAnalytics.onDisabled();
    }
    if (
      !minDestAmount ||
      !destToken ||
      !srcAmount ||
      !srcToken ||
      liquidityHubDisabled ||
      !library ||
      !account ||
      queryParam === LiquidityHubControl.SKIP ||
      (liquidityHubState.isFailed && queryParam !== LiquidityHubControl.FORCE)
    ) {
      return undefined;
    }

    liquidityHubAnalytics.onInitTrade(
      minDestAmount,
      dstTokenUsdValue,
      dstDecimals,
    );

    onSetLiquidityHubState({
      isLoading: true,
    });

    const quoteArgs: QuoteArgs = {
      outToken: destToken,
      inAmount: srcAmount,
      inToken: srcToken,
      minDestAmount,
    };

    try {
      const approved = await isApproved(srcAmount);

      if (!approved) {
        await firstQuote(quoteArgs);
        await approve();
      } else {
        liquidityHubAnalytics.onUserAlreadyApproved();
      }

      const quoteResult = await secondQuote(quoteArgs);
      const signature = await sign(quoteResult.permitData);

      const response = await swap({
        srcToken,
        destToken,
        srcAmount,
        minDestAmount,
        signature,
        quoteResult,
      });

      return response;
    } catch (error) {
      if (error.message !== REQUEST_FILTERED_ERROR) {
        onSetLiquidityHubState({ isFailed: true });
      }
      return undefined;
    } finally {
      liquidityHubAnalytics.clearState();
      onSetLiquidityHubState({
        isLoading: false,
        isWon: false,
        outAmount: '',
      });
    }
  };
};

const useApproved = (srcToken?: string) => {
  const tokenContract = useTokenContract(srcToken);
  const { account } = useActiveWeb3React();

  return async (srcAmount: string) => {
    try {
      const allowance = await tokenContract?.allowance(account, permit2Address);
      return BN(allowance?.toString() || '0').gte(BN(srcAmount));
    } catch (error) {
      return false;
    }
  };
};

const useApprove = (srcToken?: string) => {
  const tokenContract = useTokenContract(srcToken);
  const { onSetLiquidityHubState } = useLiquidityHubActionHandlers();

  return async () => {
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
      onSetLiquidityHubState({
        isFailed: true,
      });
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
      onSetLiquidityHubState({
        isFailed: true,
      });
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
      const message = error.toString();
      liquidityHubAnalytics.onSwapFailed(message, count());
      throw new Error(message);
    }
  };
};

const useFirstQuote = () => {
  const quoteCallback = useQuote();

  return async (args: QuoteArgs) => {
    try {
      const quoteResponse = await quoteCallback(args);
      return quoteResponse;
    } catch (error) {
      throw new Error(error.message);
    } finally {
      liquidityHubAnalytics.incrementQuoteIndex();
    }
  };
};

const useSecondQuote = () => {
  const quoteCallback = useQuote();
  const { onSetLiquidityHubState } = useLiquidityHubActionHandlers();

  return async (args: QuoteArgs) => {
    try {
      const quoteResponse = await quoteCallback(args);
      onSetLiquidityHubState({
        isWon: true,
        isLoading: false,
        outAmount: quoteResponse.outAmount,
      });
      liquidityHubAnalytics.onClobTrade();
      liquidityHubAnalytics.onUserAlreadyApproved();
      return quoteResponse;
    } catch (error) {
      throw new Error(error.message);
    }
  };
};

const useQuote = () => {
  const { account } = useActiveWeb3React();
  const [userSlippageTolerance] = useUserSlippageTolerance();
  const queryParam = useQueryParam();

  return async (args: QuoteArgs) => {
    let quoteResponse: any;
    const count = counter();
    try {
      liquidityHubAnalytics.onQuoteRequest();
      const response = await fetch(`${API_ENDPOINT}/quote?chainId=137`, {
        method: 'POST',
        body: JSON.stringify({
          inToken: args.inToken,
          outToken: args.outToken,
          inAmount: args.inAmount,
          outAmount: args.minDestAmount,
          user: account,
          slippage: userSlippageTolerance / 1000,
          qs: encodeURIComponent(window.location.hash),
          sessionId: liquidityHubAnalytics.data.sessionId,
        }),
      });
      quoteResponse = await response.json();

      if (!quoteResponse) {
        throw new Error('Missing result from quote');
      }

      if (quoteResponse.error) {
        throw new Error(quoteResponse.error);
      }

      if (quoteResponse.message) {
        throw new Error(quoteResponse.message);
      }

      if (!liquidityHubAnalytics.data.sessionId) {
        liquidityHubAnalytics.setSessionId(quoteResponse.sessionId);
      }
      if (
        queryParam !== LiquidityHubControl.FORCE &&
        BN(quoteResponse.outAmount || '0').isLessThan(
          BN(args.minDestAmount || '0'),
        )
      ) {
        throw new Error('Dex trade is better than Clob trade');
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

  return query.get('liquidity-hub')?.toLowerCase();
};

const initialData: Partial<LiquidityHubAnalyticsData> = {
  _id: crypto.randomUUID(),
  partner: 'QuickSwap',
  chainId: 137,
  isClobDisabled: false,
  dexSwapSuccess: false,
  dexSwapTxHash: '',
  sessionId: undefined,
  walletAddress: '',
  dexAmountOut: '',
  isClobTrade: false,
  srcTokenAddress: '',
  srcTokenSymbol: '',
  dstTokenAddress: '',
  dstTokenSymbol: '',
  srcAmount: '',
  quoteIndex: 1,

  approvalState: '',
  approvalError: '',
  approvalMillis: null,

  signatureState: '',
  signatureMillis: null,
  signature: '',
  signatureError: '',

  swapState: '',
  swapMillis: null,
  txHash: '',
  swapError: '',

  swapClicked: false,
  swapConfirmed: false,

  isAlreadyApproved: false,
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

  private updateAndSend(values = {} as Partial<LiquidityHubAnalyticsData>) {
    this.data = { ...this.data, ...values };

    try {
      fetch('https://bi.orbs.network/putes/clob-ui-1', {
        method: 'POST',
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

  onClobTrade() {
    this.updateAndSend({ isClobTrade: true });
  }

  onQuoteFailed(error: string, time: number, quoteResponse?: QuoteResponse) {
    this.updateAndSend({
      [`quote-${this.data.quoteIndex}-error`]: error,
      [`quote-${this.data.quoteIndex}-state`]: 'failed',
    });

    this.onQuoteData(quoteResponse, time);
  }

  onQuoteData(quoteResponse?: QuoteResponse, time?: number) {
    const diff = new BN(quoteResponse?.outAmount || '0')
      .dividedBy(new BN(this.data.dexAmountOut || '0'))
      .minus(1)
      .multipliedBy(100)
      .toFixed(2);

    this.updateAndSend({
      [`quote-${this.data.quoteIndex}-amount-out`]: quoteResponse?.outAmount,
      [`quote-${this.data.quoteIndex}-permit-data`]: quoteResponse?.permitData,
      [`quote-${this.data.quoteIndex}-serialized-order`]: quoteResponse?.serializedOrder,
      [`quote-${this.data.quoteIndex}-quote-call-data`]: quoteResponse?.callData,
      [`quote-${this.data.quoteIndex}-quote-millis`]: time,
      [`quote-${this.data.quoteIndex}-clob-dex-price-diff-percent`]: diff,
    });
  }

  onUserAlreadyApproved() {
    this.updateAndSend({ isAlreadyApproved: true });
  }

  onApprovalRequest() {
    this.updateAndSend({ approvalState: 'pending' });
  }

  onDexSwapSuccess(dexSwapTxHash: string) {
    this.updateAndSend({ dexSwapSuccess: true, dexSwapTxHash });
  }

  onApprovalSuccess(time: number) {
    this.updateAndSend({ approvalMillis: time, approvalState: 'success' });
  }

  onApprovalFailed(error: string, time: number) {
    this.updateAndSend({
      approvalError: error,
      approvalState: 'failed',
      approvalMillis: time,
    });
  }

  onSignatureRequest() {
    this.updateAndSend({ signatureState: 'pending' });
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
    });
  }

  onSwapRequest() {
    this.updateAndSend({ swapState: 'pending' });
  }

  onSwapSuccess(txHash: string, time: number) {
    this.updateAndSend({ txHash, swapMillis: time, swapState: 'success' });
  }

  onSwapFailed(error: string, time: number) {
    this.updateAndSend({
      swapError: error,
      swapState: 'failed',
      swapMillis: time,
    });
  }

  onSwapClicked() {
    this.updateAndSend({ swapClicked: true });
  }

  onSwapConfirmed() {
    this.updateAndSend({ swapConfirmed: true });
  }

  setSessionId(id: string) {
    this.data.sessionId = id;
  }

  onWalletConnected(walletAddress?: string) {
    this.updateAndSend({ walletAddress: walletAddress || '' });
  }

  onSrcToken(address: string, symbol: string) {
    this.updateAndSend({
      srcTokenAddress: address || 'native',
      srcTokenSymbol: symbol,
    });
  }

  onDstToken(address: string, symbol: string) {
    this.updateAndSend({
      dstTokenAddress: address || 'native',
      dstTokenSymbol: symbol,
    });
  }

  onDisabled() {
    this.updateAndSend({ isClobDisabled: true });
  }

  onSrcAmount(srcAmount: string) {
    this.updateAndSend({ srcAmount });
  }

  onInitTrade(
    dexAmountOut: string,
    srcTokenUsdValue: number,
    dstDecimals?: number,
  ) {
    const dexAmountOutBN = new BN(dexAmountOut);
    const dstAmountOutUsd = dexAmountOutBN
      .multipliedBy(srcTokenUsdValue || 0)

      .dividedBy(new BN(10).pow(new BN(dstDecimals || 0)))
      .toFixed(2);

    this.updateAndSend({ dexAmountOut, dstAmountOutUsd });
  }

  clearState() {
    const walletAddress = this.data.walletAddress;
    this.data = {
      ...initialData,
      walletAddress,
    };
  }
}
export const liquidityHubAnalytics = new LiquidityHubAnalytics();

export const useLiquidityHubAnalyticsListeners = (
  srcToken?: any,
  dstToken?: any,
  srcAmount?: string,
  showConfirm?: boolean,
  attemptingTxn?: boolean,
) => {
  const { account } = useActiveWeb3React();

  useEffect(() => {
    if (showConfirm) {
      liquidityHubAnalytics.onSwapClicked();
    }
  }, [showConfirm]);

  useEffect(() => {
    if (attemptingTxn) {
      liquidityHubAnalytics.onSwapConfirmed();
    }
  }, [attemptingTxn]);

  useEffect(() => {
    if (srcAmount) {
      liquidityHubAnalytics.onSrcAmount(srcAmount);
    }
  }, [srcAmount]);

  useEffect(() => {
    if (account) {
      liquidityHubAnalytics.onWalletConnected(account);
    }
  }, [account]);

  useEffect(() => {
    if (srcToken?.symbol) {
      liquidityHubAnalytics.onSrcToken(srcToken?.address, srcToken?.symbol);
    }
  }, [srcToken?.address, srcToken?.symbol]);

  useEffect(() => {
    if (dstToken?.symbol) {
      liquidityHubAnalytics.onDstToken(dstToken?.address, dstToken?.symbol);
    }
  }, [dstToken?.address, dstToken?.symbol]);
};

export const useConfirmationPendingContent = (pendingText?: string) => {
  const { t } = useTranslation();
  const liquidityHubState = useLiquidityHubState();
  return useMemo(() => {
    if (liquidityHubState?.waitingForApproval) {
      return {
        title: t('optimizedRouteAvailable'),
        pending: pendingText,
        confirm: t('awaitingApproval'),
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

type actionState = 'pending' | 'success' | 'failed' | '';

interface LiquidityHubAnalyticsData {
  _id: string;
  partner: string;
  chainId: number;
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

  swapClicked: boolean;
  swapConfirmed: boolean;

  isClobDisabled: boolean;
  dexSwapSuccess: boolean;
  dexSwapTxHash: string;

  isAlreadyApproved: boolean;
  dstAmountOutUsd: string;
}

interface QuoteResponse {
  outAmount: string;
  permitData: any;
  serializedOrder: string;
  callData: string;
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
