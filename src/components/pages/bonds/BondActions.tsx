import React from 'react';
import { PurchasePath } from 'types/bond';
import LPPath from './Paths/LPPath';
import ApeZapPath from './Paths/ApeZapPath';
import SoulZapPath from './Paths/SoulZapPath';
import { useActiveWeb3React } from 'hooks';
import { Button } from '@mui/material';
import { useTranslation } from 'next-i18next';
import {
  useNetworkSelectionModalToggle,
  useWalletModalToggle,
} from 'state/application/hooks';
import { useIsSupportedNetwork } from 'utils';

export interface BondActionsProps {
  bond: any;
  purchasePath: PurchasePath;
  onBillId: ((billId: string) => void) | undefined;
  inputTokenAddress: string;
  onTransactionSubmitted?: (value: boolean) => void;
}

const BondActions: React.FC<BondActionsProps> = ({
  bond,
  purchasePath,
  onBillId,
  inputTokenAddress,
  onTransactionSubmitted,
}) => {
  const { account } = useActiveWeb3React();
  const { t } = useTranslation();
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

  const getBillActionButton = () => {
    switch (true) {
      case !account:
        return <Button onClick={connectWallet}>{t('connectWallet')}</Button>;
      case purchasePath === PurchasePath.LpPurchase:
        return (
          <LPPath
            purchasePath={purchasePath}
            bond={bond}
            inputTokenAddress={inputTokenAddress}
            onBillId={onBillId}
            onTransactionSubmitted={onTransactionSubmitted}
          />
        );
      case purchasePath === PurchasePath.ApeZap:
        return (
          <ApeZapPath
            purchasePath={purchasePath}
            bond={bond}
            inputTokenAddress={inputTokenAddress}
            onBillId={onBillId}
            onTransactionSubmitted={onTransactionSubmitted}
          />
        );
      case purchasePath === PurchasePath.SoulZap:
        return (
          <SoulZapPath
            purchasePath={purchasePath}
            bond={bond}
            inputTokenAddress={inputTokenAddress}
            onBillId={onBillId}
            onTransactionSubmitted={onTransactionSubmitted}
          />
        );
      default:
        return <></>;
    }
  };

  return getBillActionButton();
};

export default BondActions;
