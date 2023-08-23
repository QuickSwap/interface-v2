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
import { Box } from '@material-ui/core';
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
const API_ENDPOINT = 'https://hub.orbs.network';
const WEBSITE = 'https://www.orbs.com';

export const useLiquidityHubCallback = (
  srcToken?: string,
  destToken?: string,
) => {
  const [liquidityHubDisabled] = useLiquidityHubManager();
  const { account, library } = useActiveWeb3React();
  const liquidityHubState = useLiquidityHubState();
  const {
    onSetLiquidityHubState,
    onResetLiquidityHubState,
  } = useLiquidityHubActionHandlers();
  const [userSlippageTolerance] = useUserSlippageTolerance();
  const location = useLocation();
  const queryParam = useQueryParam();
  const approve = useApprove(srcToken);
  const swap = useSwap();
  const sign = useSign();
  return async (srcAmount?: string, minDestAmount?: string) => {
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
    onSetLiquidityHubState({
      isLoading: true,
      isWon: false,
      isFailed: false,
      outAmount: undefined,
    });

    const quoteArgs = {
      destToken,
      srcAmount,
      srcToken,
      minDestAmount,
      account,
      force: queryParam === LiquidityHubControl.FORCE,
      slippage: userSlippageTolerance / 100,
      qs: encodeURIComponent(location.search),
    };

    try {
      const res = await quote(quoteArgs);
      onSetLiquidityHubState({
        isWon: true,
        isLoading: false,
        outAmount: res.outAmount,
      });
    } catch (error) {
      onResetLiquidityHubState();
      return undefined;
    }

    try {
      await approve(srcAmount);
      const quoteResult = await quote(quoteArgs);

      onSetLiquidityHubState({
        outAmount: quoteResult.outAmount,
      });
      const signature = await sign(quoteResult.permitData);

      const txResponse = await swap({
        account,
        srcToken,
        destToken,
        srcAmount,
        minDestAmount,
        signature,
        quoteResult,
      });

      return txResponse;
    } catch (error) {
      onResetLiquidityHubState();
      onSetLiquidityHubState({
        isFailed: true,
      });
      return undefined;
    } finally {
      onSetLiquidityHubState({
        isLoading: false,
      });
    }
  };
};

const useApprove = (srcToken?: string) => {
  const tokenContract = useTokenContract(srcToken);
  const { account } = useActiveWeb3React();
  const { onSetLiquidityHubState } = useLiquidityHubActionHandlers();
  return async (srcAmount: string) => {
    try {
      const allowance = await tokenContract?.allowance(account, permit2Address);
      if (BN(allowance.toString()).gte(BN(srcAmount))) {
        liquidityHubAnalytics.onTokenApproved();
        return;
      }
      onSetLiquidityHubState({ waitingForApproval: true });
      liquidityHubAnalytics.onApproveRequest();
      const response = await tokenContract?.approve(
        permit2Address,
        maxUint256,
        {
          gasLimit: 100_000,
        },
      );
      liquidityHubAnalytics.onTokenApproved();

      return response.wait();
    } catch (error) {
      liquidityHubAnalytics.onApproveFailed(error.message);
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
    try {
      onSetLiquidityHubState({ waitingForSignature: true });
      liquidityHubAnalytics.onSignatureRequest();
      if (!hasWeb3Instance()) {
        setWeb3Instance(new Web3(library!.provider as any));
      }
      process.env.DEBUG = 'web3-candies';

      const signature = await signEIP712(account!, permitData);
      liquidityHubAnalytics.onSignatureSuccess(signature);
      return signature;
    } catch (error) {
      liquidityHubAnalytics.onSignatureFailed(error.message);
      throw new Error(error.message);
    } finally {
      onSetLiquidityHubState({ waitingForSignature: false });
    }
  };
};

const useSwap = () => {
  const { library } = useActiveWeb3React();
  return async (args: {
    account: string;
    srcToken: string;
    destToken: string;
    srcAmount: string;
    minDestAmount: string;
    signature: string;
    quoteResult: any;
  }) => {
    try {
      const count = counter();
      liquidityHubAnalytics.onSwapRequest();
      const txHashResponse = await fetch(`${API_ENDPOINT}/swapx?chainId=137`, {
        method: 'POST',
        body: JSON.stringify({
          inToken: args.srcToken,
          outToken: args.destToken,
          inAmount: args.srcAmount,
          outAmount: args.minDestAmount,
          user: args.account,
          signature: args.signature,
          ...args.quoteResult,
        }),
      });
      const swap = await txHashResponse.json();
      if (!swap || !swap.txHash) {
        throw new Error('Missing txHash');
      }

      liquidityHubAnalytics.onSwapSuccess(swap.txHash, count());
      return waitForTx(swap.txHash, library);
    } catch (error) {
      liquidityHubAnalytics.onSwapFailed(error.message);
      throw new Error(error.message);
    }
  };
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

const quote = async ({
  destToken,
  srcAmount,
  srcToken,
  minDestAmount,
  account,
  force,
  slippage,
}: {
  minDestAmount: string;
  srcAmount: string;
  srcToken: string;
  destToken: string;
  account: string;
  force: boolean;
  slippage: number;
}) => {
  try {
    liquidityHubAnalytics.onQuoteRequest(minDestAmount);
    const count = counter();
    const response = await fetch(`${API_ENDPOINT}/quote?chainId=137`, {
      method: 'POST',
      body: JSON.stringify({
        inToken: srcToken,
        outToken: destToken,
        inAmount: srcAmount,
        outAmount: minDestAmount,
        user: account,
        slippage,
      }),
    });
    const result = await response.json();

    if (!result) {
      throw new Error('Missing result');
    }

    liquidityHubAnalytics.onQuoteSuccess(
      result.outAmount,
      result.serializedOrder,
      result.callData,
      result.permitData,
      count(),
    );

    if (!force && BN(result.outAmount).isLessThan(BN(minDestAmount))) {
      liquidityHubAnalytics.onClobLowAmountOut();
      throw new Error('Dex trade is better than LiquidityHub trade');
    }

    return {
      outAmount: result.outAmount,
      permitData: result.permitData,
      serializedOrder: result.serializedOrder,
      callData: result.callData,
    };
  } catch (error) {
    liquidityHubAnalytics.onQuoteFailed(error.message);
    throw new Error(error.message);
  }
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

enum LiquidityHubControl {
  FORCE = '1',
  SKIP = '2',
}

export const useQueryParam = () => {
  const location = useLocation();

  const query = useMemo(() => new URLSearchParams(location.search), [
    location.search,
  ]);

  return query.get('liquidity-hub')?.toLowerCase();
};

export const LiquidityHubTxSettings = () => {
  const { t } = useTranslation();
  return (
    <StyledLiquidityHubTxSettings>
      <p>{t('disableLiquidityHub')}</p>
      <p className='bottom-text'>
        <img src={OrbsLogo} />
        <a target='_blank' rel='noreferrer' href={`${WEBSITE}/liquidity-hub`}>
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

interface State {
  state: string;
  time: number;
}
interface LiquidityHubAnalyticsData {
  _id: string;
  state: State;
  walletAddress?: string;
  srcTokenAddress: string;
  srcTokenSymbol: string;
  dstTokenAddress: string;
  dstTokenSymbol: string;
  srcAmount: string;
  dstAmountOut: string;
  clobOutAmount: string;
  approvalAmount: string;
  approvalSpender: string;
  approveFailedError: string;
  clobAmountOut: string;
  dexAmountOut: string;
  isClobTrade: boolean;
  quoteFailedError: string;
  quoteRequestDurationMillis: number;
  swapTxHash: string;
  swapFailedError: string;
  signature: string;
  serializedOrder: string;
  callData: string;
  permitData: string;
  signatureFailedError: string;
  swapRequestDurationMillis: number;
}

const counter = () => {
  const now = Date.now();

  return () => {
    return Date.now() - now;
  };
};

class LiquidityHubAnalytics {
  history: State[] = [];
  initialTimestamp = Date.now();
  data = { _id: crypto.randomUUID() } as LiquidityHubAnalyticsData;

  private update({
    newState,
    values = {},
  }: {
    newState: string;
    values?: Partial<LiquidityHubAnalyticsData>;
  }) {
    if (this.data.state) {
      this.history.push(this.data.state);
    }

    this.data.state = {
      state: newState,
      time: Date.now() - this.initialTimestamp,
    };
    this.data = { ...this.data, ...values };

    fetch('https://bi.orbs.network/putes/clob-ui', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...this.data, history: this.history }),
    }).catch();
  }

  onWalletConnected(walletAddress?: string) {
    this.update({
      newState: 'walletConnected',
      values: { walletAddress },
    });
  }

  onSrcToken(srcTokenAddress: string, srcTokenSymbol: string) {
    this.update({
      newState: 'srcToken',
      values: { srcTokenAddress, srcTokenSymbol },
    });
  }

  onDstToken(dstTokenAddress: string, dstTokenSymbol: string) {
    this.update({
      newState: 'dstToken',
      values: { dstTokenAddress, dstTokenSymbol },
    });
  }

  onDisabled() {
    this.update({
      newState: 'clobDisabled',
    });
  }

  onSrcAmount(srcAmount: string) {
    this.update({
      newState: 'srcAmount',
      values: { srcAmount },
    });
  }

  onPageLoaded() {
    this.update({
      newState: 'swapPageLoaded',
    });
  }

  onApproveRequest() {
    this.update({
      newState: 'approveRequest',
      values: {
        approveFailedError: '',
      },
    });
  }

  onTokenApproved() {
    this.update({
      newState: 'approved',
    });
  }

  onApproveFailed(approveFailedError: string) {
    this.update({
      newState: 'approveFailed',
      values: { approveFailedError },
    });
  }

  onSwapClick() {
    this.update({
      newState: 'swapClick',
    });
  }

  onConfirmSwapClick() {
    this.update({
      newState: 'swapConfirmClick',
    });
  }

  onQuoteRequest(dexAmountOut: string) {
    this.update({
      newState: 'quoteRequest',
      values: {
        dexAmountOut,
        quoteFailedError: '',
      },
    });
  }

  onQuoteSuccess(
    clobAmountOut: string,
    serializedOrder: string,
    callData: string,
    permitData: any,
    quoteRequestDurationMillis: number,
  ) {
    this.update({
      newState: 'quoteSuccess',
      values: {
        clobAmountOut,
        quoteRequestDurationMillis,
        isClobTrade: BN(this.data.dexAmountOut).isLessThan(BN(clobAmountOut)),
        serializedOrder,
        callData,
        permitData,
      },
    });
  }
  onQuoteFailed(quoteFailedError: string) {
    this.update({
      newState: 'quoteFailed',
      values: {
        quoteFailedError,
      },
    });
  }

  onClobLowAmountOut() {
    this.update({
      newState: 'clobLowAmountOut',
    });
  }

  onSignatureRequest() {
    this.update({
      newState: 'signatureRequest',
    });
  }
  onSignatureSuccess(signature: string) {
    this.update({
      newState: 'signatureSuccess',
      values: { signature },
    });
  }

  onSignatureFailed(signatureFailedError: string) {
    this.update({
      newState: 'signatureFailed',
      values: { signatureFailedError },
    });
  }

  onSwapRequest() {
    this.update({
      newState: 'swapRequest',
      values: { swapFailedError: '' },
    });
  }

  onSwapSuccess(swapTxHash: string, swapRequestDurationMillis: number) {
    this.update({
      newState: 'swapSuccess',
      values: { swapTxHash, swapRequestDurationMillis },
    });
  }

  onSwapFailed(swapFailedError: string) {
    this.update({
      newState: 'swapFailed',
      values: { swapFailedError },
    });
  }
}
export const liquidityHubAnalytics = new LiquidityHubAnalytics();

export const useLiquidityHubAnalyticsListeners = (
  showConfirm: boolean,
  attemptingTxn: boolean,
  srcToken?: any,
  dstToken?: any,
  srcAmount?: string,
) => {
  const { account } = useActiveWeb3React();

  useEffect(() => {
    if (srcAmount) {
      liquidityHubAnalytics.onSrcAmount(srcAmount);
    }
  }, [srcAmount]);

  useEffect(() => {
    if (showConfirm) {
      liquidityHubAnalytics.onSwapClick();
    }
  }, [showConfirm]);

  useEffect(() => {
    if (attemptingTxn) {
      liquidityHubAnalytics.onSwapRequest();
    }
  }, [attemptingTxn]);

  useEffect(() => {
    liquidityHubAnalytics.onWalletConnected(account);
  }, [account]);

  useEffect(() => {
    liquidityHubAnalytics.onPageLoaded();
  }, []);

  useEffect(() => {
    liquidityHubAnalytics.onSrcToken(srcToken?.address, srcToken?.symbol);
  }, [srcToken?.address, srcToken?.symbol]);

  useEffect(() => {
    liquidityHubAnalytics.onDstToken(dstToken?.address, dstToken?.symbol);
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
