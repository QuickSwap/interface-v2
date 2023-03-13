import React from 'react';
import { Percent } from '@uniswap/sdk-core';
import { useTranslation } from 'react-i18next';
import { Box } from '@material-ui/core';

interface SwapHeaderProps {
  allowedSlippage: Percent;
  dynamicFee: number | null;
}

export default function SwapHeader({
  allowedSlippage,
  dynamicFee = null,
}: SwapHeaderProps) {
  const { t } = useTranslation();
  return (
    <Box width='100%' mb={1} className='flex justify-between'>
      <p>{t('swap')}</p>
      {dynamicFee && (
        <p className='caption'>{t('feeIs', { fee: dynamicFee / 10000 })}</p>
      )}
    </Box>
  );
}
