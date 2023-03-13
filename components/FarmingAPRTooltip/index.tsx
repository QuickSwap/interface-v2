import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { formatNumber } from 'utils';
import 'components/styles/FarmingAPRToolTip.scss';
import Popover from 'components/v3/Popover';

interface FarmingAPRTooltipProps {
  qsAPR: number;
  gammaAPRs: { title: string; apr: number }[];
  children: any;
}

const FarmingAPRTooltip: React.FC<FarmingAPRTooltipProps> = ({
  qsAPR,
  gammaAPRs,
  children,
}) => {
  const [show, setShow] = useState(false);
  return (
    <Popover
      show={show}
      placement='top'
      color='#12131a'
      borderRadius='10px'
      content={
        <Box className='farmingAPRTooltipWrapper'>
          <Box
            className='flex justify-between'
            margin={gammaAPRs.length > 0 ? '10px 0 0' : '10px 0'}
          >
            <small className='text-secondary'>QuickSwap APR</small>
            <small>{formatNumber(qsAPR)}%</small>
          </Box>
          {gammaAPRs.map((apr, ind) => (
            <Box key={ind} className='flex justify-between' my='10px'>
              <small className='text-secondary'>Gamma {apr.title} APR</small>
              <small>{formatNumber(apr.apr)}%</small>
            </Box>
          ))}
        </Box>
      }
    >
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
    </Popover>
  );
};

export default FarmingAPRTooltip;
