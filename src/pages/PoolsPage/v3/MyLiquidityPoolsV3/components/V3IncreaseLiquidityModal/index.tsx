import React from 'react';
import { PositionPool } from 'models/interfaces';
import { useTranslation } from 'react-i18next';
import { CustomModal } from 'components';
import { Box } from '@material-ui/core';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import IncreaseLiquidityV3 from 'components/v3/IncreaseLiquidityV3';

interface V3IncreaseLiquidityModalProps {
  open: boolean;
  onClose: () => void;
  positionDetails: PositionPool;
}

export default function V3IncreaseLiquidityModal({
  positionDetails,
  open,
  onClose,
}: V3IncreaseLiquidityModalProps) {
  const { t } = useTranslation();

  return (
    <CustomModal open={open} onClose={onClose}>
      <Box padding={3}>
        <Box className='flex justify-between'>
          <p className='weight-600'>{t('increaseLiquidity')}</p>
          <CloseIcon className='cursor-pointer' onClick={onClose} />
        </Box>
        <Box mt={3}>
          <IncreaseLiquidityV3 positionDetails={positionDetails} />
        </Box>
      </Box>
    </CustomModal>
  );
}
