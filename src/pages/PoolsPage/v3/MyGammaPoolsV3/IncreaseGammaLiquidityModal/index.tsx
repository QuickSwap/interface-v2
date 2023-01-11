import React from 'react';
import { CustomModal } from 'components';
import { Box } from '@material-ui/core';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import { useTranslation } from 'react-i18next';

interface IncreaseGammaLiquidityModalProps {
  open: boolean;
  onClose: () => void;
  position: any;
}

export default function IncreaseGammaLiquidityModal({
  position,
  open,
  onClose,
}: IncreaseGammaLiquidityModalProps) {
  const { t } = useTranslation();

  return (
    <CustomModal open={open} onClose={onClose}>
      <Box padding={3}>
        <Box className='flex justify-between'>
          <p className='weight-600'>{t('addLiquidity')}</p>
          <CloseIcon className='cursor-pointer' onClick={onClose} />
        </Box>
      </Box>
    </CustomModal>
  );
}
