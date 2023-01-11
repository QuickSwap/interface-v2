import React from 'react';
import { CustomModal } from 'components';
import { Box, Button } from '@material-ui/core';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import { useTranslation } from 'react-i18next';

interface WithdrawGammaLiquidityModalProps {
  open: boolean;
  onClose: () => void;
  position: any;
}

export default function WithdrawGammaLiquidityModal({
  position,
  open,
  onClose,
}: WithdrawGammaLiquidityModalProps) {
  const { t } = useTranslation();
  console.log('bbb', position);

  return (
    <CustomModal open={open} onClose={onClose}>
      <Box padding={3}>
        <Box className='flex justify-between'>
          <p className='weight-600'>{t('removeLiquidity')}</p>
          <CloseIcon className='cursor-pointer' onClick={onClose} />
        </Box>
        {/* <Box mt={3} className='flex justify-between'>
          <p>
            {t('pooled')} {liquidityValue0?.currency?.symbol}
          </p>
          <Box className='flex items-center'>
            <p>{liquidityValue0?.toSignificant()}</p>
            <Box className='flex' ml={1}>
              <CurrencyLogo
                size='24px'
                currency={liquidityValue0?.currency as WrappedCurrency}
              />
            </Box>
          </Box>
        </Box>
        <Box mt={2} className='flex justify-between'>
          <p>
            {t('pooled')} {liquidityValue1?.currency?.symbol}
          </p>
          <Box className='flex items-center'>
            <p>{liquidityValue1?.toSignificant()}</p>
            <Box className='flex' ml={1}>
              <CurrencyLogo
                size='24px'
                currency={liquidityValue1?.currency as WrappedCurrency}
              />
            </Box>
          </Box>
        </Box> */}
        <Box mt={2}>
          <Button>{t('confirm')}</Button>
        </Box>
      </Box>
    </CustomModal>
  );
}
