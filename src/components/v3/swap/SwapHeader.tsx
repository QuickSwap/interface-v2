import React from 'react';
import { Percent } from '@uniswap/sdk-core';
import { StyledLabel } from '../Common/styledElements';
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
        <StyledLabel fontSize='16px' color='#c7cad9'>
          {t('swap')}
        </StyledLabel>
        {dynamicFee && (
          <StyledLabel fontSize='12px' color='#b4b9cc' className={' br-8'}>
            {t('feeIs', { fee: dynamicFee / 10000 })}
          </StyledLabel>
        )}
      </div>
    </div>
  );
}
