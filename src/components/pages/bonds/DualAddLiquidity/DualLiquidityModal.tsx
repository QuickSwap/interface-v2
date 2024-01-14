import React, { useCallback, useState } from 'react';
import RegularLiquidity from './RegularLiquidity';
import ZapLiquidity from './ZapLiquidity';
import ZapSwitch from './components/ZapSwitch';
import { useTranslation } from 'next-i18next';
import { TransactionSubmittedContent } from 'components/TransactionConfirmationModal/TransactionConfirmationModal';
import { Box } from '@mui/material';
import { ZapType } from 'constants/index';
import { CustomModal } from 'components';
import { Pair } from '@uniswap/sdk';

interface DualLiquidityModalProps {
  open: boolean;
  onDismiss?: () => void;
  poolAddress?: string;
  pid?: string;
  zapIntoProductType?: ZapType;
  zapable?: boolean;
}

const DualLiquidityModal: React.FC<DualLiquidityModalProps> = ({
  open,
  onDismiss = () => null,
  poolAddress,
  pid,
  zapIntoProductType,
  zapable,
}) => {
  const { t } = useTranslation();
  const [goZap, setGoZap] = useState(true);
  const [{ txHash, pairOut }, setTxHash]: any = useState({
    txHash: '',
    pairOut: null,
  });

  const handleConfirmedTx = useCallback((hash: string, pair?: Pair) => {
    setTxHash({ txHash: hash, pairOut: pair });
  }, []);

  const handleZapSwitch = useCallback(() => {
    setGoZap(!goZap);
  }, [goZap]);

  return (
    <CustomModal open={open} onClose={onDismiss}>
      {txHash ? (
        <>
          {/* <TransactionSubmittedContent
            hash={txHash}
            onDismiss={onDismiss}
            LpToAdd={pairOut ?? undefined}
          /> */}
        </>
      ) : (
        <Box>
          <ZapSwitch goZap={goZap} handleZapSwitch={handleZapSwitch} />
          {goZap ? (
            <ZapLiquidity
              handleConfirmedTx={handleConfirmedTx}
              poolAddress={poolAddress ?? ''}
              pid={pid ?? ''}
              zapIntoProductType={zapIntoProductType ?? ZapType.ZAP}
              zapable={zapable ?? false}
            />
          ) : (
            <RegularLiquidity handleConfirmedTx={handleConfirmedTx} />
          )}
        </Box>
      )}
    </CustomModal>
  );
};

export default React.memo(DualLiquidityModal);
