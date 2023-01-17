import React from 'react';
import { CustomModal } from 'components';
import { Box } from 'theme/components';
import { PositionPool } from 'models/interfaces';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import { useTranslation } from 'react-i18next';
import RemoveLiquidityV3 from 'components/v3/RemoveLiquidityV3';

interface V3RemoveLiquidityModalProps {
  open: boolean;
  onClose: () => void;
  position: PositionPool;
}

export default function V3RemoveLiquidityModal({
  position,
  open,
  onClose,
}: V3RemoveLiquidityModalProps) {
  const { t } = useTranslation();

  return (
    <CustomModal open={open} onClose={onClose}>
      <Box padding='24px'>
        <Box className='flex justify-between'>
          <p className='weight-600'>{t('removeLiquidity')}</p>
          <CloseIcon className='cursor-pointer' onClick={onClose} />
        </Box>
        <Box margin='24px 0 0'>
          <RemoveLiquidityV3 position={position} />
        </Box>
      </Box>
    </CustomModal>
  );
}
