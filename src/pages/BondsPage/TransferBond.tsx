import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useTransferBond from '~/hooks/bond/useTransferBond';
import { Box, Button } from '@material-ui/core';
import { useActiveWeb3React } from '~/hooks';

interface TransferProps {
  billNftAddress: string;
  billId: string;
  toAddress: string;
  disabled?: boolean;
}

const Transfer: React.FC<TransferProps> = ({
  billNftAddress,
  billId,
  toAddress,
  disabled,
}) => {
  const { onTransfer } = useTransferBond(billNftAddress, billId, toAddress);
  const { chainId, account } = useActiveWeb3React();
  const [pendingTrx, setPendingTrx] = useState(false);
  const { t } = useTranslation();

  const handleTransfer = async () => {
    if (!chainId || !account) return;
    setPendingTrx(true);
    await onTransfer().catch((e: any) => {
      console.error(e);
      setPendingTrx(false);
    });
    setPendingTrx(false);
  };
  return (
    <Box className='bondModalButtonsWrapper'>
      <Button
        onClick={handleTransfer}
        endIcon={pendingTrx}
        disabled={pendingTrx || disabled}
      >
        {t('confirm')}
      </Button>
    </Box>
  );
};

export default React.memo(Transfer);
