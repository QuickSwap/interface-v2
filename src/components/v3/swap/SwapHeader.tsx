import React from 'react';
import { Percent } from '@uniswap/sdk-core';
import { useTranslation } from 'react-i18next';

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
    <div className={'flex-s-between w-100 mb-1'}>
      <div className={'flex-s-between w-100'}>
        <p>{t('swap')}</p>
        {dynamicFee && (
          <p className='caption'>{t('feeIs', { fee: dynamicFee / 10000 })}</p>
        )}
      </div>
    </div>
  );
}
