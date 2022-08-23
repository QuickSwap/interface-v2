import React from 'react';
import { Box } from '@material-ui/core';
import { SyrupInfo } from 'types';
import { CurrencyLogo } from 'components';
import { getTokenAPRSyrup } from 'utils';
import { useTranslation } from 'react-i18next';
import { GlobalTokens } from 'constants/index';
import { useActiveWeb3React } from 'hooks';

const SyrupAPR: React.FC<{ syrup: SyrupInfo; dQUICKAPY: string }> = ({
  syrup,
  dQUICKAPY,
}) => {
  const { chainId } = useActiveWeb3React();
  const { t } = useTranslation();

  const isDQUICKStakingToken = chainId
    ? syrup.stakingToken.equals(GlobalTokens[chainId]['OLD_DQUICK'])
    : false;

  return (
    <>
      <small className='text-success'>
        {getTokenAPRSyrup(syrup).toLocaleString()}%
      </small>
      {isDQUICKStakingToken && chainId && (
        <Box className='syrupAPR border-gray2'>
          <CurrencyLogo
            currency={GlobalTokens[chainId]['OLD_QUICK']}
            size='12px'
          />
          <span style={{ marginLeft: 4 }}>
            {dQUICKAPY}% <span className='text-hint'>{t('apy')}</span>
          </span>
        </Box>
      )}
    </>
  );
};

export default SyrupAPR;
