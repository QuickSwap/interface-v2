import React from 'react';
import { Box, Button, useMediaQuery, useTheme } from '@mui/material';
import { DoubleCurrencyLogo } from 'components';
import { formatNumber, getTokenFromAddress } from 'utils';
import { useTranslation } from 'next-i18next';
import { MerklFarmAPRTooltip } from './MerklFarmAPRTooltip';
import { useRouter } from 'next/router';
import { useSelectedTokenList } from 'state/lists/hooks';
import { useActiveWeb3React } from 'hooks';
import dayjs from 'dayjs';
import styles from 'styles/pages/Farm.module.scss';

interface Props {
  farm: any;
}

export const MerklFarmCard: React.FC<Props> = ({ farm }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { chainId } = useActiveWeb3React();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));
  const currentTime = dayjs().unix();

  const rewards = (farm.distributionData ?? [])
    .filter(
      (item: any) =>
        item.isLive &&
        (item?.endTimestamp ?? 0) >= currentTime &&
        (item?.startTimestamp ?? 0) <= currentTime,
    )
    .map((item: any) => {
      const rewardDuration =
        (item?.endTimestamp ?? 0) - (item?.startTimestamp ?? 0);
      const dailyAmount =
        rewardDuration > 0
          ? ((item?.amount ?? 0) / rewardDuration) * 3600 * 24
          : 0;
      return { ...item, dailyAmount };
    })
    .reduce((memo: any[], item: any) => {
      const existingItemIndex = memo.findIndex(
        (rewardItem) =>
          rewardItem.rewardToken.toLowerCase() ===
          item.rewardToken.toLowerCase(),
      );
      if (existingItemIndex > -1) {
        const existingItem = memo[existingItemIndex];
        memo = [
          ...memo.slice(0, existingItemIndex),
          {
            ...existingItem,
            dailyAmount:
              (existingItem?.dailyAmount ?? 0) + (item?.dailyAmount ?? 0),
          },
          ...memo.slice(existingItemIndex + 1),
        ];
      } else {
        memo.push(item);
      }
      return memo;
    }, []);

  const currencyParamsArray = Object.keys(router.query)
    .map((key, index) => [key, Object.values(router.query)[index]])
    .filter((item) => item[0] !== 'version');

  const redirectWithPool = (pool: string) => {
    const currentPath = router.asPath;
    let redirectPath;
    if (router.query && router.query.pool) {
      redirectPath = currentPath.replace(
        `pool=${router.query.pool}`,
        `pool=${pool}`,
      );
    } else {
      redirectPath = `${currentPath}${
        currencyParamsArray.length === 0 ? '?' : '&'
      }pool=${pool}`;
    }
    router.push(redirectPath);

    window.scrollTo(0, 0);
  };

  const tokenMap = useSelectedTokenList();
  const token0 = getTokenFromAddress(farm.token0, chainId, tokenMap, []);
  const token1 = getTokenFromAddress(farm.token1, chainId, tokenMap, []);

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
              currency0={token0}
              currency1={token1}
              size={24}
            />
            <p>
              {token0?.symbol}/{token1?.symbol}
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
                <MerklFarmAPRTooltip
                  farms={farm.alm}
                  token0={farm.token0}
                  token1={farm.token1}
                >
                  <Box className={styles.farmCardAPR} gap='4px'>
                    <p>{formatNumber(farm.apr)}%</p>
                    <img src='/assets/images/aprHover.png' width={16} />
                  </Box>
                </MerklFarmAPRTooltip>
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
              {rewards.map((reward: any) => (
                <p key={(farm?.pool ?? '') + (reward?.rewardToken ?? '')}>
                  {formatNumber(reward.dailyAmount)} {reward.symbolRewardToken}{' '}
                  <small className='text-secondary'>{t('daily')}</small>
                </p>
              ))}
            </Box>
          </Box>
        </Box>
        <Box width={isMobile ? '100%' : '10%'} mt={rewards.length > 0 ? 0 : 2}>
          <Button
            className={styles.farmCardButton}
            disabled={!farm.pool}
            onClick={() => {
              if (farm.pool) {
                redirectWithPool(farm.pool);
              }
            }}
          >
            {t('view')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default MerklFarmCard;
