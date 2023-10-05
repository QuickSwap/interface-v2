import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useClaimBond from 'hooks/bond/useClaimBond';
import { useWeb3React } from '@web3-react/core';
import { Button } from '@material-ui/core';

export interface ClaimProps {
  billAddress: string;
  pendingRewards: string;
  billIds: string[];
  mt?: string[];
  earnToken: string;
  hasDarkBg?: boolean;
}

const Claim: React.FC<ClaimProps> = ({
  billAddress,
  billIds,
  pendingRewards,
  mt,
  earnToken,
  hasDarkBg,
}) => {
  const { onClaimBill } = useClaimBond(billAddress, billIds, earnToken);
  const { chainId, account } = useWeb3React();
  const [pendingTrx, setPendingTrx] = useState(false);
  const { t } = useTranslation();

  const handleClaim = async () => {
    if (!chainId || !account) return;
    setPendingTrx(true);
    await onClaimBill().catch((e: any) => {
      console.error(e);
      setPendingTrx(false);
    });
    setPendingTrx(false);
  };
  return (
    <Button
      onClick={handleClaim}
      disabled={pendingTrx || parseFloat(pendingRewards) === 0}
    >
      {t('claim')}
    </Button>
  );
};

export default React.memo(Claim);
