import React from 'react';
import { Box, Button, useMediaQuery, useTheme } from '@mui/material';
import { DoubleCurrencyLogo } from 'components';
import { formatNumber } from 'utils';
import { useTranslation } from 'next-i18next';
import { V3FarmAPRTooltip } from './V3FarmAPRTooltip';
import { useRouter } from 'next/router';
import { V3FarmPair } from './AllV3Farms';
import styles from 'styles/pages/Farm.module.scss';

interface Props {
  farm: V3FarmPair;
}

export const V3FarmCard: React.FC<Props> = ({ farm }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));

  const rewards = farm.farms.reduce(
    (
      memo: {
        token: { address: string; decimals: number; symbol: string };
        amount: number;
      }[],
      item,
    ) => {
      for (const reward of item.rewards) {
        const existingItemIndex = memo.findIndex(
          (item) =>
            item.token.address.toLowerCase() ===
            reward.token.address.toLowerCase(),
        );
        if (existingItemIndex > -1) {
          const existingItem = memo[existingItemIndex];
          memo = [
            ...memo.slice(0, existingItemIndex),
            {
              ...existingItem,
              amount: (existingItem?.amount ?? 0) + (reward?.amount ?? 0),
            },
            ...memo.slice(existingItemIndex + 1),
          ];
        } else {
          memo.push(reward);
        }
      }
      return memo;
    },
    [],
  );

  const currencyParamsArray = Object.keys(router.query)
    .map((key, index) => [key, Object.values(router.query)[index]])
    .filter((item) => item[0] !== 'version');

  const redirectWithCurrencies = (farm: V3FarmPair) => {
    const currentPath = router.asPath;
    let redirectPath;
    if (router.query && router.query.token0) {
      if (router.query.token1) {
        redirectPath = currentPath
          .replace(
            `token0=${router.query.token0}`,
            `token0=${farm.token0.address}`,
          )
          .replace(
            `token1=${router.query.token1}`,
            `token1=${farm.token1.address}`,
          );
      } else {
        redirectPath = `${currentPath.replace(
          `token0=${router.query.token0}`,
          `token0=${farm.token0.address}`,
        )}&token1=${farm.token1.address}`;
      }
    } else {
      if (router.query && router.query.token1) {
        redirectPath = `${currentPath.replace(
          `token1=${router.query.token1}`,
          `token1=${farm.token1.address}`,
        )}&token0=${farm.token0.address}`;
      } else {
        redirectPath = `${currentPath}${
          currencyParamsArray.length === 0 ? '?' : '&'
        }token0=${farm.token0.address}&token1=${farm.token1.address}`;
      }
    }
    router.push(redirectPath);

    window.scrollTo(0, 0);
  };

  return (
    <Box width='100%' borderRadius='16px' className='bg-secondary1'>
      <Box padding={2} className='flex items-center flex-wrap'>
        <Box
          width={isMobile ? '100%' : '90%'}
          className='flex items-center flex-wrap'
        >
          <Box
            width={isMobile ? '80%' : '30%'}
            className='flex items-center'
            gap='12px'
          >
            <DoubleCurrencyLogo
              currency0={farm.token0}
              currency1={farm.token1}
              size={24}
            />
            <p>
              {farm.token0?.symbol}/{farm.token1?.symbol}
            </p>
          </Box>
          <Box
            my={2}
            width={isMobile ? '100%' : '20%'}
            className='flex items-center justify-between'
          >
            {isMobile && <p>{t('tvl')}</p>}
            <p>${formatNumber(farm.tvl)}</p>
          </Box>
          <Box
            width={isMobile ? '100%' : '20%'}
            className='flex items-center justify-between'
          >
            {isMobile && <p>{t('apr')}</p>}
            <Box className={isMobile ? 'flex flex-col items-end' : ''}>
              <small>{t('upTo')}</small>
              <Box className='flex'>
                <V3FarmAPRTooltip farm={farm}>
                  <Box className={styles.farmCardAPR} gap='4px'>
                    <p>{formatNumber(farm.apr)}%</p>
                    <img src='/assets/images/aprHover.png' width={16} />
                  </Box>
                </V3FarmAPRTooltip>
              </Box>
            </Box>
          </Box>
          <Box
            width={isMobile ? '100%' : '30%'}
            my={rewards.length > 0 ? 2 : 0}
            className={isMobile ? 'flex items-center justify-between' : ''}
          >
            {isMobile && rewards.length > 0 && <p>{t('rewards')}</p>}
            <Box className={isMobile ? 'flex flex-col items-end' : ''}>
              {rewards.map((reward) => (
                <p key={reward.token.address}>
                  {formatNumber(reward.amount)} {reward.token.symbol}{' '}
                  <small className='text-secondary'>{t('daily')}</small>
                </p>
              ))}
            </Box>
          </Box>
        </Box>
        <Box width={isMobile ? '100%' : '10%'} mt={rewards.length > 0 ? 0 : 2}>
          <Button
            className={styles.farmCardButton}
            disabled={!farm?.token0?.address || !farm?.token1?.address}
            onClick={() => {
              redirectWithCurrencies(farm);
            }}
          >
            {t('view')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default V3FarmCard;
