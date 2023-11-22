import { ChainId } from '@uniswap/sdk';
import { getConfig } from 'config/index';
import { formatUnits } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { getTokenFromAddress } from 'utils';
import { useUSDCPricesFromAddresses } from 'utils/useUSDCPrice';
import { useActiveWeb3React } from 'hooks';
import { useSelectedTokenList } from 'state/lists/hooks';
import { useQuery } from '@tanstack/react-query';

export function useV3DistributedRewards(chainId?: ChainId) {
  const { provider } = useActiveWeb3React();
  const config = getConfig(chainId);
  const farmEnabled = config['farm']['available'];
  const tokenMap = useSelectedTokenList();

  const fetchEternalFarmsForV3Rewards = async () => {
    if (!provider || !farmEnabled) return null;
    const res = await fetch(
      `${process.env.REACT_APP_LEADERBOARD_APP_URL}/farming/eternal-farms?chainId=${chainId}`,
    );
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    const eternalFarmings =
      data && data.data && data.data.farms ? data.data.farms : [];
    const _eternalFarmings: any[] = [];

    for (const farming of eternalFarmings) {
      try {
        if (Number(farming.reward) > 0 && Number(farming.bonusReward) > 0) {
          _eternalFarmings.push(farming);
        }

        _eternalFarmings.push(farming);
      } catch (e) {
        console.log(e);
      }
    }
    return _eternalFarmings;
  };

  const { data: eternalFarms, refetch } = useQuery({
    queryKey: ['fetchEternalFarmsV3Rewards', chainId, !!provider, farmEnabled],
    queryFn: fetchEternalFarmsForV3Rewards,
  });

  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000);
      setCurrentTime(_currentTime);
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  const allRewardTokenAddresses = eternalFarms
    ? eternalFarms
        .map(({ rewardToken }) => rewardToken)
        .concat(eternalFarms.map(({ bonusRewardToken }) => bonusRewardToken))
        .filter(
          (value, index, self) =>
            index ===
            self.findIndex(
              (item) => item.toLowerCase() === value.toLowerCase(),
            ),
        )
    : [];

  const { prices: rewardTokenPrices } = useUSDCPricesFromAddresses(
    allRewardTokenAddresses,
  );

  const totalRewardsUSD =
    eternalFarms && rewardTokenPrices
      ? eternalFarms.reduce((total, farm) => {
          const farmRewardToken =
            farm && farm.rewardToken && chainId
              ? getTokenFromAddress(farm.rewardToken, chainId, tokenMap, [])
              : undefined;
          const farmBonusRewardToken =
            farm && farm.bonusRewardToken && chainId
              ? getTokenFromAddress(
                  farm.bonusRewardToken,
                  chainId,
                  tokenMap,
                  [],
                )
              : undefined;
          const farmRewardRate =
            Number(
              formatUnits(
                farm.rewardRate,
                farmRewardToken ? Number(farmRewardToken.decimals) : 18,
              ),
            ) *
            3600 *
            24;
          const farmBonusRewardRate =
            Number(
              formatUnits(
                farm.bonusRewardRate,
                farmBonusRewardToken
                  ? Number(farmBonusRewardToken.decimals)
                  : 18,
              ),
            ) *
            3600 *
            24;
          const rewardTokenPrice =
            rewardTokenPrices.find(
              (item) =>
                farm &&
                farm.rewardToken &&
                item.address.toLowerCase() === farm.rewardToken.toLowerCase(),
            )?.price ?? 0;

          const bonusRewardTokenPrice =
            rewardTokenPrices.find(
              (item) =>
                farm &&
                farm.bonusRewardToken &&
                item.address.toLowerCase() ===
                  farm.bonusRewardToken.toLowerCase(),
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
