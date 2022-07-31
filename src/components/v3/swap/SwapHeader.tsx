import SettingsTab from '../Settings';
import { Percent } from '@uniswap/sdk-core';

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
        <span className={'mr-05 b fs-125'}>{'Swap'}</span>
        {dynamicFee && (
          <span className={'bg-p pv-025 ph-05 br-8'}>
            {`Fee is ${dynamicFee / 10000}%`}
          </span>
        )}
      </div>
      <SettingsTab placeholderSlippage={allowedSlippage} />
    </div>
  );
}
