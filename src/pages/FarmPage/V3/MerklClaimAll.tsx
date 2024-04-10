import React, { useMemo } from 'react';
import { Box, Button } from '@material-ui/core';
import ClaimAllBg from 'assets/images/claimAllBg.png';
import { useTranslation } from 'react-i18next';
import { useGetMerklFarms } from 'hooks/v3/useV3Farms';
import { useUSDCPricesFromAddresses } from 'utils/useUSDCPrice';
import { formatNumber, getTokenFromAddress } from 'utils';
import { useClaimMerklRewards } from 'hooks/useClaimMerklRewards';
import { Skeleton } from '@material-ui/lab';
import { CurrencyLogo, CustomTooltip } from 'components';
import { useSelectedTokenList } from 'state/lists/hooks';
import { useActiveWeb3React } from 'hooks';

export const MerklClaimAll: React.FC = () => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const { isLoading: loadingFarms, data: merklFarms } = useGetMerklFarms();
  const tokenMap = useSelectedTokenList();

  const rewards = useMemo(() => {
    if (!merklFarms) return [];
    return merklFarms.reduce((memo: any[], farm: any) => {
      const farmRewards = Object.keys(farm.rewardsPerToken).map((address) => {
        const rewardData = farm.rewardsPerToken[address];
        const token = getTokenFromAddress(address, chainId, tokenMap, []);
        return { ...rewardData, address, token };
      });
      farmRewards.forEach((reward) => {
        if (reward.unclaimed > 0) {
          const existingItemIndex = memo.findIndex(
            (item) =>
              item.address.toLowerCase() === reward.address.toLowerCase(),
          );
          if (existingItemIndex > -1) {
            const existingItem = memo[existingItemIndex];
            memo = [
              ...memo.slice(0, existingItemIndex),
              {
                ...existingItem,
                unclaimed:
                  (existingItem?.unclaimed ?? 0) + (reward?.unclaimed ?? 0),
              },
              ...memo.slice(existingItemIndex + 1),
            ];
          } else {
            memo.push(reward);
          }
        }
      });
      return memo;
    }, []);
  }, [chainId, merklFarms, tokenMap]);

  const {
    loading: loadingRewardTokenPrices,
    prices: rewardTokenPrices,
  } = useUSDCPricesFromAddresses(rewards.map((reward: any) => reward.address));

  const rewardsUSD = rewards.reduce((total: number, reward: any) => {
    const rewardTokenPrice =
      rewardTokenPrices?.find(
        (item) => item.address.toLowerCase() === reward.address.toLowerCase(),
      )?.price ?? 0;
    return total + rewardTokenPrice * reward.unclaimed;
  }, 0);

  const { claiming, claimReward } = useClaimMerklRewards();

  return (
    <Box className='claimAllBox'>
      <img src={ClaimAllBg} width='100%' />
      <Box className='flex flex-col' gridGap={8}>
        <p>{t('myrewards')}</p>
        {loadingRewardTokenPrices || loadingFarms ? (
          <Skeleton variant='rect' width={100} height={27} />
        ) : rewards.length > 0 ? (
          <CustomTooltip
            placement='bottom-start'
            title={
              <Box className='flex flex-col' gridGap={8}>
                {rewards.map((reward) => (
                  <Box
                    className='flex justify-between'
                    width={200}
                    key={reward.address}
                  >
                    <Box className='flex items-center' gridGap={8}>
                      <CurrencyLogo size='16px' currency={reward.token} />
                      <small>{reward.symbol}</small>
                    </Box>
                    <small>{formatNumber(reward.unclaimed)}</small>
                  </Box>
                ))}
              </Box>
            }
          >
            <h6>${formatNumber(rewardsUSD)}</h6>
          </CustomTooltip>
        ) : (
          <h6>${formatNumber(rewardsUSD)}</h6>
        )}
      </Box>
      <Button disabled={claiming} onClick={claimReward}>
        {claiming ? t('claiming') : t('claimAll')}
      </Button>
    </Box>
  );
};
