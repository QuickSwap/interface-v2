import { ChainId, Token } from '@uniswap/sdk';
import { formatUnits } from 'ethers/lib/utils';
import { useFarmingSubgraph } from 'hooks/useIncentiveSubgraph';
import { useEffect } from 'react';
import { useUSDCPricesToken } from 'utils/useUSDCPrice';

export function useV3DistributedRewards(chainId: ChainId) {
  const {
    fetchEternalFarms: { fetchEternalFarmsFn, eternalFarms },
  } = useFarmingSubgraph() || {};
  useEffect(() => {
    fetchEternalFarmsFn(true);
  }, []);
  const rewardTokens = eternalFarms
    ? eternalFarms.map(
        ({ rewardToken }) =>
          new Token(
            chainId,
            rewardToken.id,
            Number(rewardToken.decimals),
            rewardToken.symbol,
          ),
      )
    : [];
  const rewardTokenPrices = useUSDCPricesToken(rewardTokens, chainId);
  const bonusRewardTokens = eternalFarms
    ? eternalFarms.map(
        ({ bonusRewardToken }) =>
          new Token(
            chainId,
            bonusRewardToken.id,
            Number(bonusRewardToken.decimals),
            bonusRewardToken.symbol,
          ),
      )
    : [];
  const bonusRewardTokenPrices = useUSDCPricesToken(bonusRewardTokens, chainId);
  const totalRewardsUSD = eternalFarms
    ? eternalFarms.reduce((total, farm, ind) => {
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
        const totalUSD =
          total +
          farmRewardRate * rewardTokenPrices[ind] +
          farmBonusRewardRate * bonusRewardTokenPrices[ind];
        return totalUSD;
      }, 0)
    : undefined;

  return totalRewardsUSD;
}
