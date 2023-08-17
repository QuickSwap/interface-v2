import { ChainId } from '@uniswap/sdk';
import { getConfig } from 'config';
import { formatUnits } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { getContract, getTokenFromAddress } from 'utils';
import { useUSDCPricesFromAddresses } from 'utils/useUSDCPrice';
import VIRTUAL_POOL_ABI from 'abis/virtual-pool.json';
import { useActiveWeb3React } from 'hooks';
import { useSelectedTokenList } from 'state/lists/hooks';

export function useV3DistributedRewards(chainId?: ChainId) {
  const { provider } = useActiveWeb3React();
  const config = getConfig(chainId);
  const farmEnabled = config['farm']['available'];
  const [eternalFarms, setEternalFarms] = useState<any[] | undefined>(
    undefined,
  );
  const tokenMap = useSelectedTokenList();

  useEffect(() => {
    if (farmEnabled && chainId && provider) {
      (async () => {
        const res = await fetch(
          `${process.env.REACT_APP_LEADERBOARD_APP_URL}/farming/eternal-farms?chainId=${chainId}`,
        );
        if (!res.ok) {
          setEternalFarms([]);
        }
        const data = await res.json();
        const eternalFarmings =
          data && data.data && data.data.farms ? data.data.farms : [];
        const _eternalFarmings: any[] = [];

        for (const farming of eternalFarmings) {
          try {
            const virtualPoolContract = getContract(
              farming.virtualPool,
              VIRTUAL_POOL_ABI,
              provider,
            );
            const reward = await virtualPoolContract.rewardReserve0();
            const bonusReward = await virtualPoolContract.rewardReserve1();

            if (Number(reward) > 0 && Number(bonusReward) > 0) {
              _eternalFarmings.push(farming);
            }

            _eternalFarmings.push(farming);
          } catch (e) {
            console.log(e);
          }
        }
        setEternalFarms(_eternalFarmings);
      })();
    }
  }, [farmEnabled, chainId, provider]);

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

  const rewardTokenPrices = useUSDCPricesFromAddresses(allRewardTokenAddresses);

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
