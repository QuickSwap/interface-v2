import React from 'react';
import { Box } from '@material-ui/core';
import { SyrupInfo } from 'types';
import { CurrencyLogo } from 'components';
import { returnTokenFromKey, getTokenAPRSyrup } from 'utils';
import { useTranslation } from 'react-i18next';

const SyrupAPR: React.FC<{ syrup: SyrupInfo; dQUICKAPY: string }> = ({
  syrup,
  dQUICKAPY,
}) => {
  const { t } = useTranslation();
  const isDQUICKStakingToken = syrup.stakingToken.equals(
    returnTokenFromKey('DQUICK'),
  );

  return (
    <>
      <small className='text-success'>
        {getTokenAPRSyrup(syrup).toLocaleString()}%
      </small>
      {isDQUICKStakingToken && (
        <Box className='syrupAPR border-gray2'>
          <CurrencyLogo currency={returnTokenFromKey('QUICK')} size='12px' />
          <span style={{ marginLeft: 4 }}>
            {dQUICKAPY}% <span className='text-hint'>{t('apy')}</span>
          </span>
        </Box>
      )}
    </>
  );
};

export default SyrupAPR;
