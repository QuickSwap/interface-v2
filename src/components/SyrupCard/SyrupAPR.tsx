import React from 'react';
import { SyrupInfo } from 'types';
import { CurrencyLogo } from 'components';
import { getTokenAPRSyrup } from 'utils';
import { useTranslation } from 'react-i18next';
import { GlobalValue } from 'constants/index';

const SyrupAPR: React.FC<{ syrup: SyrupInfo; dQUICKAPY: string }> = ({
  syrup,
  dQUICKAPY,
}) => {
  const { t } = useTranslation();

  const isDQUICKStakingToken = syrup.stakingToken.equals(
    GlobalValue.tokens.COMMON.OLD_DQUICK,
  );

  return (
    <>
      <small className='text-success'>
        {getTokenAPRSyrup(syrup).toLocaleString('us')}%
      </small>
      {isDQUICKStakingToken && (
        <div className='syrupAPR border-gray2'>
          <CurrencyLogo
            currency={GlobalValue.tokens.COMMON.OLD_QUICK}
            size='12px'
          />
          <span style={{ marginLeft: 4 }}>
            {dQUICKAPY}% <span className='text-hint'>{t('apy')}</span>
          </span>
        </div>
      )}
    </>
  );
};

export default SyrupAPR;
