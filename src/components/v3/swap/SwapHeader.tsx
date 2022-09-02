import React from 'react';
import { Percent } from '@uniswap/sdk-core';
import { StyledLabel } from '../Common/styledElements';

interface SwapHeaderProps {
  allowedSlippage: Percent;
  dynamicFee: number | null;
}

export default function SwapHeader({
  allowedSlippage,
  dynamicFee = null,
}: SwapHeaderProps) {
  return (
    <div className={'flex-s-between w-100 mb-1'}>
      <div className={'flex-s-between w-100'}>
        <StyledLabel fontSize='16px' color='#c7cad9'>
          {'Swap'}
        </StyledLabel>
        {dynamicFee && (
          <StyledLabel fontSize='12px' color='#b4b9cc' className={' br-8'}>
            {`Fee is ${dynamicFee / 10000}%`}
          </StyledLabel>
        )}
      </div>
    </div>
  );
}
