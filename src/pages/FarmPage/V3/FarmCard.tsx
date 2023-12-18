import React from 'react';
import { Box, Button } from '@material-ui/core';
import { Token } from '@uniswap/sdk';
import { V3Farm } from './Farms';
import { DoubleCurrencyLogo } from 'components';
import { formatNumber } from 'utils';
import APRHover from 'assets/images/aprHover.png';
import { useTranslation } from 'react-i18next';
import { FarmAPRTooltip } from './FarmAPRTooltip';

interface Props {
  farm: {
    token0: Token;
    token1: Token;
    farms: V3Farm[];
    tvl: number;
    rewardsUSD: number;
    apr: number;
  };
}

export const V3FarmCard: React.FC<Props> = ({ farm }) => {
  const { t } = useTranslation();
  const rewards = farm.farms.reduce(
    (
      memo: {
        amount: number;
        token: { address: string; symbol: string; decimals: number };
      }[],
      farmItem,
    ) => {
      for (const reward of farmItem.rewards) {
        const existingIndex = memo.findIndex(
          (item) =>
            item.token.address.toLowerCase() ===
            reward.token.address.toLowerCase(),
        );
        if (existingIndex === -1) {
          memo.push(reward);
        } else {
          memo = [
            ...memo.slice(0, existingIndex),
            {
              ...memo[existingIndex],
              amount: memo[existingIndex].amount + reward.amount,
            },
            ...memo.slice(existingIndex + 1),
          ];
        }
      }
      return memo;
    },
    [],
  );
  return (
    <Box width='100%' borderRadius={16} className='bg-secondary1'>
      <Box padding={2} className='flex items-center'>
        <Box width='90%' className='flex items-center'>
          <Box width='30%' className='flex items-center' gridGap={12}>
            <DoubleCurrencyLogo
              currency0={farm.token0}
              currency1={farm.token1}
              size={24}
            />
            <p>
              {farm.token0.symbol}/{farm.token1.symbol}
            </p>
          </Box>
          <Box width='20%' className='flex'>
            <p>${formatNumber(farm.tvl)}</p>
          </Box>
          <Box width='20%'>
            <small>{t('upTo')}</small>
            <Box className='flex'>
              <FarmAPRTooltip farms={farm.farms}>
                <Box className='farmCardAPR' gridGap={4}>
                  <p>{formatNumber(farm.apr)}%</p>
                  <img src={APRHover} width={16} />
                </Box>
              </FarmAPRTooltip>
            </Box>
          </Box>
          <Box width='30%'>
            {rewards.map((reward) => (
              <p className='small' key={reward.token.address}>
                {formatNumber(reward.amount)} {reward.token.symbol}{' '}
                <small className='text-secondary'>{t('daily')}</small>
              </p>
            ))}
          </Box>
        </Box>
        <Box width='10%'>
          <Button className='farmCardButton'>{t('view')}</Button>
        </Box>
      </Box>
    </Box>
  );
};

export default V3FarmCard;
