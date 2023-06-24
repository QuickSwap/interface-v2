import { ChainId } from '@uniswap/sdk';
import { getConfig } from 'config';
import { formatUnits } from 'ethers/lib/utils';
import { useFarmingSubgraph } from 'hooks/useIncentiveSubgraph';
import { useEffect } from 'react';
import { useUSDCPricesFromAddresses } from 'utils/useUSDCPrice';

export function useV3DistributedRewards(chainId?: ChainId) {
  const config = getConfig(chainId);
  const farmEnabled = config['farm']['available'];
  const {
    fetchEternalFarms: { fetchEternalFarmsFn, eternalFarms },
  } = useFarmingSubgraph() || {};
  useEffect(() => {
    if (farmEnabled && chainId) {
      fetchEternalFarmsFn(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmEnabled, chainId]);
  const allRewardTokenAddresses = eternalFarms
    ? eternalFarms
        .filter((farm) => farm.rewardToken && farm.rewardToken.id)
        .map(({ rewardToken }) => rewardToken.id)
        .concat(
          eternalFarms
            .filter((farm) => farm.bonusRewardToken && farm.bonusRewardToken.id)
            .map(({ bonusRewardToken }) => bonusRewardToken.id),
        )
    : [];

  const rewardTokenPrices = useUSDCPricesFromAddresses(allRewardTokenAddresses);

  const totalRewardsUSD =
    eternalFarms && rewardTokenPrices
      ? eternalFarms.reduce((total, farm) => {
          const farmRewardRate =
            Number(
              formatUnits(farm.rewardRate, Number(farm.rewardToken.decimals)),
            ) *
            3600 *
            24;
          const farmBonusRewardRate =
            Number(
              formatUnits(
                farm.bonusRewardRate,
                Number(farm.bonusRewardToken.decimals),
              ),
            ) *
            3600 *
            24;
          const rewardTokenPrice =
            rewardTokenPrices.find(
              (item) =>
                item.address.toLowerCase() ===
                farm.rewardToken.id.toLowerCase(),
            )?.price ?? 0;

          const bonusRewardTokenPrice =
            rewardTokenPrices.find(
              (item) =>
                item.address.toLowerCase() ===
                farm.bonusRewardToken.id.toLowerCase(),
            )?.price ?? 0;

          const totalUSD =
            total +
            farmRewardRate * rewardTokenPrice +
            farmBonusRewardRate * bonusRewardTokenPrice;
          return totalUSD;
        }, 0)
      : undefined;

  return farmEnabled ? totalRewardsUSD : undefined;
}
