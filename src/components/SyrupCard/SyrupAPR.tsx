import React from 'react';
import { Box } from '@material-ui/core';
import { SyrupInfo } from 'types';
import { CurrencyLogo } from 'components';
import { returnTokenFromKey, getTokenAPRSyrup } from 'utils';

const SyrupAPR: React.FC<{ syrup: SyrupInfo; dQUICKAPY: string }> = ({
  syrup,
  dQUICKAPY,
}) => {
  const isDQUICKStakingToken = syrup.stakingToken.equals(
    returnTokenFromKey('DQUICK'),
  );

  return (
    <>
      <small className='text-success'>
        {getTokenAPRSyrup(syrup).toLocaleString()}%
      </small>
      {isDQUICKStakingToken && (
        <Box display='flex'>
          <Box
            borderRadius='4px'
            className='border-gray2'
            padding='4px'
            marginTop='4px'
            display='flex'
            alignItems='center'
          >
            <CurrencyLogo currency={returnTokenFromKey('QUICK')} size='12px' />
            <caption style={{ marginLeft: 4 }}>
              {dQUICKAPY}% <span className='text-hint'>APY</span>
            </caption>
          </Box>
        </Box>
      )}
    </>
  );
};

export default SyrupAPR;
