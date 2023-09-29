import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useApproveBond from 'hooks/bond/useApproveBond';
import {
  ApprovalState,
  useApproveCallbackFromZap,
} from 'hooks/useV3ApproveCallback';
import { QuoteResult } from 'wido';
import useGetWidoTokenAllowance from 'state/zap/providers/wido/useGetWidoTokenAllowance';
import { ZapVersion } from '@ape.swap/apeswap-lists';
import { MergedZap } from 'state/zap/actions';
import { useActiveWeb3React } from 'hooks';
import { ChainId } from '@uniswap/sdk';
import { Button } from '@material-ui/core';
import { V3TradeState } from 'hooks/v3/useBestV3Trade';
import {
  useNetworkSelectionModalToggle,
  useWalletModalToggle,
} from 'state/application/hooks';
import { useIsSupportedNetwork } from 'utils';
import { parseUnits } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';

export interface BondActionsProps {
  bond: any;
  zap: MergedZap;
  zapRouteState: V3TradeState;
  handleBuy: () => void;
  bondValue: number;
  value: string;
  purchaseLimit: string;
  balance: string;
  pendingTrx: boolean;
  errorMessage: string | null;
  isWidoSupported: boolean;
  widoQuote: QuoteResult | undefined | null;
  zapVersion: ZapVersion;
  inputTokenAddress: string;
  inputTokenDecimals: number;
  toTokenAddress: string;
  inputTokenChainId: ChainId;
  isInputCurrencyPrincipal: boolean;
}

const BondActions: React.FC<BondActionsProps> = ({
  bond,
  zap,
  handleBuy,
  bondValue,
  zapRouteState,
  value,
  purchaseLimit,
  balance,
  pendingTrx,
  errorMessage,
  isWidoSupported,
  widoQuote,
  zapVersion,
  inputTokenAddress,
  inputTokenDecimals,
  toTokenAddress,
  inputTokenChainId,
  isInputCurrencyPrincipal,
}) => {
  const toggleWalletModal = useWalletModalToggle();
  const toggleNetworkSelectionModal = useNetworkSelectionModalToggle();
  const isSupportedNetwork = useIsSupportedNetwork();

  const connectWallet = () => {
    if (!isSupportedNetwork) {
      toggleNetworkSelectionModal();
    } else {
      toggleWalletModal();
    }
  };

  const { lpToken, contractAddress } = bond;
  const [approval, approveCallback] = useApproveCallbackFromZap(zap);
  const { chainId, account } = useActiveWeb3React();

  const showApproveZapFlow =
    approval === ApprovalState.NOT_APPROVED ||
    approval === ApprovalState.PENDING;

  const {
    requiresApproval: requiresApprovalWido,
    approveWidoSpender,
    isApproveWidoSpenderLoading,
  } = useGetWidoTokenAllowance({
    inputTokenAddress,
    inputTokenDecimals,
    toTokenAddress,
    zapVersion,
    fromChainId: inputTokenChainId,
    toChainId: chainId,
  });

  const { onApprove } = useApproveBond(
    lpToken?.address?.[chainId] ?? '',
    contractAddress[chainId] ?? '',
  );

  const lpTokenDecimals = Number(bond?.lpToken?.decimals?.[chainId] ?? 18);
  const parsedValue = parseUnits(
    Number(value).toFixed(lpTokenDecimals),
    lpTokenDecimals,
  );
  const showApproveLP = BigNumber.from(bond?.userData?.allowance).lt(
    parsedValue,
  );
  const [pendingApprove, setPendingApprove] = useState(false);
  const { t } = useTranslation();

  const handleLPApprove = async () => {
    setPendingApprove(true);
    await onApprove().finally(() => {
      setPendingApprove(false);
    });
  };

  const getBillActionButton = () => {
    switch (true) {
      case !account:
        return <Button onClick={connectWallet}>{t('connectWallet')}</Button>;
      case isWidoSupported &&
        requiresApprovalWido &&
        zapVersion === ZapVersion.Wido:
        return (
          <Button
            onClick={() => approveWidoSpender()}
            disabled={isApproveWidoSpenderLoading}
            fullWidth
          >
            {isApproveWidoSpenderLoading ? t('Enabling') : t('Enable')}
          </Button>
        );
      case !isInputCurrencyPrincipal &&
        showApproveZapFlow &&
        zapVersion === ZapVersion.ZapV1:
        return (
          <Button
            onClick={approveCallback}
            disabled={approval !== ApprovalState.NOT_APPROVED}
            fullWidth
          >
            {approval === ApprovalState.PENDING
              ? `${t('Enabling')} ${zap?.currencyIn?.currency?.symbol}`
              : `${t('Enable')} ${zap?.currencyIn?.currency?.symbol}`}
          </Button>
        );
      case isInputCurrencyPrincipal &&
        showApproveLP &&
        zapVersion === ZapVersion.ZapV1:
        return (
          <Button onClick={handleLPApprove} disabled={pendingApprove} fullWidth>
            {t('Enable')}
          </Button>
        );
      default:
        return (
          <Button
            onClick={handleBuy}
            fullWidth
            disabled={
              bondValue < 0.01 ||
              bondValue > Number(purchaseLimit) ||
              Number(balance) < Number(value) ||
              pendingApprove ||
              pendingTrx ||
              !!errorMessage ||
              zapRouteState === V3TradeState.LOADING ||
              (!widoQuote && isWidoSupported)
            }
          >
            {errorMessage && !pendingTrx ? errorMessage : t('Buy')}
          </Button>
        );
    }
  };

  return getBillActionButton();
};

export default BondActions;
