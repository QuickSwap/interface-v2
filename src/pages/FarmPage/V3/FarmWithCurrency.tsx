import React from 'react';
import { Box } from '@material-ui/core';
import { V3Farm } from './Farms';
import { DoubleCurrencyLogo } from 'components';
import { formatNumber } from 'utils';
import APRHover from 'assets/images/aprHover.png';
import { useTranslation } from 'react-i18next';
import TotalAPRTooltip from 'components/TotalAPRToolTip';

interface Props {
  farm: V3Farm;
}

export const V3FarmWithCurrency: React.FC<Props> = ({ farm }) => {
  const { t } = useTranslation();

  return (
    <Box
      width='100%'
      padding={2}
      borderRadius={16}
      className='flex bg-secondary1'
    >
      <Box className='flex items-center' width='35%' gridGap={8}>
        <DoubleCurrencyLogo
          size={24}
          currency0={farm.token0}
          currency1={farm.token1}
        />
        <Box>
          <Box className='flex items-center' gridGap={5}>
            <small>
              {farm.token0?.symbol}/{farm.token1?.symbol}
            </small>
            {farm.title && (
              <Box
                className={`farmAPRTitleWrapper ${
                  farm.title.toLowerCase() === 'narrow'
                    ? 'bg-purple8'
                    : farm.title.toLowerCase() === 'wide'
                    ? 'bg-blue12'
                    : farm.title.toLowerCase() === 'stable'
                    ? 'bg-green4'
                    : 'bg-gray32'
                }`}
              >
                <span className='text-bgColor'>{farm.title}</span>
              </Box>
            )}
            <Box className='farmAPRTitleWrapper bg-textSecondary'>
              <span className='text-gray32'>{farm.type.toUpperCase()}</span>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box width='15%'>
        <p className='small text-secondary'>{t('tvl')}</p>
        <p className='small'>${formatNumber(farm.tvl)}</p>
      </Box>
      <Box width='15%'>
        <p className='small text-secondary'>{t('totalAPR')}</p>
        <Box className='flex items-center' gridGap={4}>
          <p className='small text-success'>
            {formatNumber(farm.poolAPR + farm.farmAPR)}%
          </p>
          <TotalAPRTooltip
            farmAPR={farm.farmAPR ?? 0}
            poolAPR={farm.poolAPR ?? 0}
          >
            <img src={APRHover} alt='farm APR' height={16} />
          </TotalAPRTooltip>
        </Box>
      </Box>
      <Box width='15%'>
        <p className='small text-secondary'>{t('rewards')}</p>
        {farm.rewards.map((reward) => (
          <p key={reward.token.address}>
            {formatNumber(reward.amount)} {reward.token.symbol}{' '}
            <small className='text-secondary'>{t('daily')}</small>
          </p>
        ))}
      </Box>
    </Box>
  );
};

export default V3FarmWithCurrency;
