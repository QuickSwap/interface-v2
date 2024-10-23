import { useQuery } from '@tanstack/react-query';
import { ChainId, Token as TokenV2 } from '@uniswap/sdk';
import { getConfig } from 'config/index';
import {
  useSteerPeripheryContract,
  useSteerVaultContract,
  useSteerVaultRegistryContract,
} from 'hooks/useContract';
import { useMemo } from 'react';
import {
  useMultipleContractSingleData,
  useSingleCallResult,
  useSingleContractMultipleData,
} from 'state/multicall/v3/hooks';
import { Interface, formatUnits } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';
import { useSelectedTokenList } from 'state/lists/hooks';
import {
  calculatePositionWidth,
  getSteerDexName,
  getTokenFromAddress,
  percentageToMultiplier,
} from 'utils';
import { toV3Token } from 'constants/v3/addresses';
import { Token } from '@uniswap/sdk-core';
import { GlobalConst, GlobalData } from 'constants/index';
import { useUSDCPricesFromAddresses } from 'utils/useUSDCPrice';
import STEER_STAKING_ABI from 'constants/abis/steer-staking.json';
import PoolABI from 'constants/abis/v3/pool.json';
import UniV3PoolABI from 'constants/abis/v3/univ3Pool.json';
import { ERC20_ABI } from 'constants/abis/erc20';
import SteerVaultABI from 'constants/abis/steer-vault.json';
import { Presets } from 'state/mint/v3/reducer';
import { useActiveWeb3React } from 'hooks';

export interface SteerVault {
  address: string;
  state?: number;
  strategyName?: string;
  vaultType?: string;
  token0?: Token;
  token1?: Token;
  vaultName?: string;
  vaultSymbol?: string;
  vaultDecimals: number;
  feeTier?: BigNumber;
  totalLPTokensIssued?: BigNumber;
  token0Balance?: BigNumber;
  token1Balance?: BigNumber;
  vaultCreator: string;
  lowerTick?: number;
  upperTick?: number;
  poolAddress?: string;
  sqrtPriceX96?: BigNumber;
  tick?: BigNumber;
  totalBalance?: number;
  token0BalanceWallet?: number;
  token1BalanceWallet?: number;
  apr?: number;
}

export const useSteerVaults = (chainId: ChainId) => {
  const config = getConfig(chainId);
  const steerAvailable = config['steer']['available'];
  const tokenMap = useSelectedTokenList();
  const fetchSteerPools = async () => {
    const steerAPIURL = process.env.REACT_APP_STEER_API_URL;
    if (!steerAvailable || !chainId || !steerAPIURL) return [];
    const res = await fetch(
      `${steerAPIURL}/getSmartPools?chainId=${chainId}&dexName=${getSteerDexName(
        chainId,
      )}`,
    );
    let aprData;
    try {
      const aprRes = await fetch(
        `${steerAPIURL}/getAprs?chainId=${chainId}&dexName=${getSteerDexName(
          chainId,
        )}`,
      );
      aprData = await aprRes.json();
    } catch {}
    const data = await res.json();
    const vaultAPRs = aprData?.vaults ?? [];
    if (data && data.pools) {
      const allVaults: any[][] = Object.values(data.pools);
      const poolAddresses = Object.keys(data.pools);
      const vaults: any[] = [];
      for (const poolVaults of allVaults) {
        for (const vault of poolVaults) {
          const existingVault = vaults.find(
            (vaultItem) => vaultItem.address === vault.vaultAddress,
          );
          if (!existingVault) {
            const poolAddress = poolAddresses.find(
              (address) =>
                data.pools[address] &&
                data.pools[address].find(
                  (item: any) => item.vaultAddress === vault.vaultAddress,
                ),
            );
            vaults.push({
              address: vault.vaultAddress,
              poolAddress,
              strategyName: vault.strategyName,
              apr: vaultAPRs.find(
                (item: any) =>
                  item.vaultAddress.toLowerCase() ===
                  vault.vaultAddress.toLowerCase(),
              )?.apr?.apr,
            });
          }
        }
      }
      return vaults;
    }
    return [];
  };

  const { isLoading, data: vaults } = useQuery({
    queryKey: ['fetchSteerPools', chainId],
    queryFn: fetchSteerPools,
    refetchInterval: 300000,
  });

  const poolAddresses = useMemo(() => {
    if (!vaults) return [];
    return vaults
      .map((vault) => vault.poolAddress)
      .filter((item, ind, self) => self.indexOf(item) === ind);
  }, [vaults]);
  const poolInterface = new Interface(PoolABI);
  const uniV3PoolInterface = new Interface(UniV3PoolABI);
  const slot0Calls = useMultipleContractSingleData(
    poolAddresses,
    chainId === ChainId.MATIC || chainId === ChainId.LAYERX
      ? poolInterface
      : uniV3PoolInterface,
    chainId === ChainId.MATIC || chainId === ChainId.LAYERX
      ? 'globalState'
      : 'slot0',
    [],
  );
  const slot0Items = slot0Calls.map((call, ind) => {
    const result =
      !call.loading && call.result && call.result.length > 0
        ? call.result
        : undefined;
    const sqrtPriceX96 = result && result.length > 0 ? result[0] : undefined;
    const tick = result && result.length > 1 ? result[1] : undefined;
    return { poolAddress: poolAddresses[ind], sqrtPriceX96, tick };
  });

  const peripheryContract = useSteerPeripheryContract();
  const vaultRegistryContract = useSteerVaultRegistryContract();
  const vaultAddresses = useMemo(() => {
    if (!vaults) return [];
    return vaults.map((vault) => vault.address);
  }, [vaults]);

  const vaultPositionCalls = useMultipleContractSingleData(
    vaultAddresses,
    new Interface(SteerVaultABI),
    'getPositions',
    [],
  );
  const vaultPositions = vaultPositionCalls.map((call, ind) => {
    const vaultPositionData =
      !call.loading && call.result ? call.result : undefined;
    const lowerTicks =
      vaultPositionData && vaultPositionData.length > 0
        ? vaultPositionData[0]
        : undefined;
    const upperTicks =
      vaultPositionData && vaultPositionData.length > 1
        ? vaultPositionData[1]
        : undefined;
    return { vaultAddress: vaultAddresses[ind], lowerTicks, upperTicks };
  });

  const vaultRegistryDetailCalls = useSingleContractMultipleData(
    vaultRegistryContract,
    'getVaultDetails',
    vaultAddresses.map((address) => [address]),
  );

  const vaultDetailCalls = useSingleContractMultipleData(
    peripheryContract,
    chainId === ChainId.MATIC || chainId === ChainId.LAYERX
      ? 'algebraVaultDetailsByAddress'
      : 'vaultDetailsByAddress',
    vaultAddresses.map((address) => [address]),
  );

  const vaultDetails: SteerVault[] = vaultDetailCalls.map((call, index) => {
    const vaultAddress = vaultAddresses[index];
    const vaultRegistryDetailCall = vaultRegistryDetailCalls[index];
    const vaultRegistryData =
      !vaultRegistryDetailCall.loading &&
      vaultRegistryDetailCall.result &&
      vaultRegistryDetailCall.result.length > 0
        ? vaultRegistryDetailCall.result[0]
        : undefined;
    const vaultData =
      !call.loading && call.result && call.result.length > 0
        ? call.result[0]
        : undefined;
    const vaultType =
      vaultData && vaultData.length > 0 ? vaultData[0] : undefined;
    const token0Address =
      vaultData && vaultData.length > 1 ? vaultData[1] : undefined;
    const token1Address =
      vaultData && vaultData.length > 2 ? vaultData[2] : undefined;
    const vaultName =
      vaultData && vaultData.length > 3 ? vaultData[3] : undefined;
    const vaultSymbol =
      vaultData && vaultData.length > 4 ? vaultData[4] : undefined;
    const vaultDecimals =
      vaultData && vaultData.length > 5 && vaultData[5]
        ? Number(vaultData[5])
        : 18;
    const token0Name =
      vaultData && vaultData.length > 6 ? vaultData[6] : undefined;
    const token1Name =
      vaultData && vaultData.length > 7 ? vaultData[7] : undefined;
    const token0Symbol =
      vaultData && vaultData.length > 8 ? vaultData[8] : undefined;
    const token1Symbol =
      vaultData && vaultData.length > 9 ? vaultData[9] : undefined;
    const token0Decimals =
      vaultData && vaultData.length > 10 && vaultData[10]
        ? Number(vaultData[10])
        : undefined;
    const token1Decimals =
      vaultData && vaultData.length > 11 && vaultData[11]
        ? Number(vaultData[11])
        : undefined;
    const token0V2 =
      token0Address && token0Decimals
        ? getTokenFromAddress(token0Address, chainId, tokenMap, [
            new TokenV2(
              chainId,
              token0Address,
              token0Decimals,
              token0Symbol,
              token0Name,
            ),
          ])
        : undefined;
    const token1V2 =
      token1Address && token1Decimals
        ? getTokenFromAddress(token1Address, chainId, tokenMap, [
            new TokenV2(
              chainId,
              token1Address,
              token1Decimals,
              token1Symbol,
              token1Name,
            ),
          ])
        : undefined;
    const token0 = token0V2 ? toV3Token(token0V2) : undefined;
    const token1 = token1V2 ? toV3Token(token1V2) : undefined;
    const feeTier =
      chainId === ChainId.MATIC || chainId === ChainId.LAYERX
        ? undefined
        : vaultData && vaultData.length > 12
        ? vaultData[12]
        : undefined;
    const totalLPIndex = chainId === ChainId.MANTA ? 13 : 12;
    const totalLPTokensIssued =
      vaultData && vaultData.length > totalLPIndex
        ? vaultData[totalLPIndex]
        : undefined;
    const token0BalanceIndex = chainId === ChainId.MANTA ? 14 : 13;
    const token0Balance =
      vaultData && vaultData.length > token0BalanceIndex
        ? vaultData[token0BalanceIndex]
        : undefined;
    const token1BalanceIndex = chainId === ChainId.MANTA ? 15 : 14;
    const token1Balance =
      vaultData && vaultData.length > token1BalanceIndex
        ? vaultData[token1BalanceIndex]
        : undefined;
    const vaultCreatorIndex = chainId === ChainId.MANTA ? 16 : 15;
    const vaultCreator =
      vaultData && vaultData.length > vaultCreatorIndex
        ? vaultData[vaultCreatorIndex]
        : undefined;

    const vaultItem = vaults?.find((item) => item.address === vaultAddress);
    const slot0 = slot0Items.find(
      (item) => vaultItem && item.poolAddress === vaultItem.poolAddress,
    );

    const vaultPosition = vaultPositions[index];

    return {
      ...slot0,
      address: vaultAddress,
      state:
        vaultRegistryData && vaultRegistryData.length > 0
          ? Number(vaultRegistryData[0])
          : undefined,
      strategyName: vaultItem?.strategyName,
      apr: vaultItem?.apr,
      vaultType,
      token0,
      token1,
      vaultName,
      vaultSymbol,
      vaultDecimals,
      token0Name,
      token0Symbol,
      token0Decimals,
      token1Name,
      token1Symbol,
      token1Decimals,
      feeTier,
      totalLPTokensIssued,
      token0Balance,
      token1Balance,
      vaultCreator,
      lowerTick:
        vaultPosition &&
        vaultPosition.lowerTicks &&
        vaultPosition.lowerTicks.length > 0
          ? Math.min(
              ...vaultPosition.lowerTicks.map((tick: any) => Number(tick)),
            )
          : undefined,
      upperTick:
        vaultPosition &&
        vaultPosition.upperTicks &&
        vaultPosition.upperTicks.length > 0
          ? Math.max(
              ...vaultPosition.upperTicks.map((tick: any) => Number(tick)),
            )
          : undefined,
    };
  });

  return { loading: isLoading, data: vaultDetails };
};

export const useSteerStakingPools = (chainId: ChainId, farmStatus?: string) => {
  const config = getConfig(chainId);
  const steerAvailable = config['steer']['available'];
  const fetchSteerStakingPools = async () => {
    const apiURL = process.env.REACT_APP_STEER_STAKING_POOLS_URL;
    if (!steerAvailable || !chainId || !apiURL) return [];
    const res = await fetch(apiURL);
    const data = await res.json();
    if (data && data.pools) {
      return data.pools.filter((pool: any) => {
        const isActive = Date.now() < Number(pool.periodFinish) * 1000;
        return (
          pool.chainId === chainId &&
          pool.protocol === 'QuickSwapV3' &&
          (farmStatus ? isActive === (farmStatus === 'active') : true)
        );
      });
    }
    return;
  };

  const { isLoading, data } = useQuery({
    queryKey: ['fetchSteerStakingPools', chainId, farmStatus],
    queryFn: fetchSteerStakingPools,
    refetchInterval: 300000,
  });

  return { loading: isLoading, data };
};

export const useSteerStakedPools = (chainId: ChainId, account?: string) => {
  const { loading, data } = useSteerStakingPools(chainId);
  const steerStakingPools = data ?? [];
  const farmAddresses = steerStakingPools.map((pool: any) => pool.stakingPool);
  const stakedAmountCalls = useMultipleContractSingleData(
    account ? farmAddresses : [],
    new Interface(STEER_STAKING_ABI),
    'balanceOf',
    [account],
  );
  const stakedAmounts = stakedAmountCalls.map((call) =>
    !call.loading && call.result && call.result.length > 0
      ? Number(formatUnits(call.result[0]))
      : 0,
  );
  return {
    loading,
    data: steerStakingPools
      .map((farm: any, ind: number) => {
        return { ...farm, stakedAmount: stakedAmounts[ind] };
      })
      .filter((farm: any) => farm.stakedAmount > 0),
  };
};

export function useSteerFilteredFarms(
  steerFarms: any[],
  chainId: ChainId,
  searchVal?: string,
  farmFilter?: string,
  sortBy?: string,
  sortDesc?: boolean,
) {
  const { v3FarmSortBy, v3FarmFilter } = GlobalConst.utils;
  const sortMultiplier = sortDesc ? -1 : 1;
  const tokenMap = useSelectedTokenList();
  const { loading: loadingSteerVaults, data: steerVaults } = useSteerVaults(
    chainId,
  );

  const farmAddresses = steerFarms.map((farm) => farm.stakingPool);
  const farmTotalSupplyCalls = useMultipleContractSingleData(
    farmAddresses,
    new Interface(STEER_STAKING_ABI),
    'totalSupply',
  );
  const farmTotalSupplys = farmTotalSupplyCalls.map((call) =>
    !call.loading && call.result && call.result.length > 0
      ? call.result[0]
      : undefined,
  );

  const vaultAddresses = steerFarms.map((farm) => farm.staking.address);
  const vaultTotalSupplyCalls = useMultipleContractSingleData(
    vaultAddresses,
    new Interface(ERC20_ABI),
    'totalSupply',
  );
  const vaultTotalSupplys = vaultTotalSupplyCalls.map((call) =>
    !call.loading && call.result && call.result.length > 0
      ? call.result[0]
      : undefined,
  );

  const farmTokenAddresses = steerFarms.reduce((memo: string[], farm: any) => {
    if (farm.rewardTokenA && !memo.includes(farm.rewardTokenA.toLowerCase())) {
      memo.push(farm.rewardTokenA.toLowerCase());
    }
    if (farm.rewardTokenB && !memo.includes(farm.rewardTokenB.toLowerCase())) {
      memo.push(farm.rewardTokenB.toLowerCase());
    }
    if (
      farm.vaultTokens &&
      farm.vaultTokens.token0 &&
      farm.vaultTokens.token0.address &&
      !memo.includes(farm.vaultTokens.token0.address.toLowerCase())
    ) {
      memo.push(farm.vaultTokens.token0.address.toLowerCase());
    }
    if (
      farm.vaultTokens &&
      farm.vaultTokens.token1 &&
      farm.vaultTokens.token1.address &&
      !memo.includes(farm.vaultTokens.token1.address.toLowerCase())
    ) {
      memo.push(farm.vaultTokens.token1.address.toLowerCase());
    }
    return memo;
  }, []);

  const {
    loading: loadingUSDPrice,
    prices: tokenUSDPrices,
  } = useUSDCPricesFromAddresses(farmTokenAddresses);

  const filteredFarms = steerFarms
    .map((farm, ind) => {
      const farmTotalSupplyNum = Number(
        formatUnits(farmTotalSupplys[ind] ?? '0'),
      );
      const vaultTotalSupplyNum = Number(
        formatUnits(vaultTotalSupplys[ind] ?? '0'),
      );
      const farmStakingAddress = farm?.staking?.address ?? '';
      const vaultInfo = steerVaults.find(
        (vault) =>
          vault.address.toLowerCase() === farmStakingAddress.toLowerCase(),
      );
      const steerToken0VaultBalance = Number(
        formatUnits(
          vaultInfo?.token0Balance ?? '0',
          vaultInfo?.token0?.decimals,
        ),
      );
      const steerToken1VaultBalance = Number(
        formatUnits(
          vaultInfo?.token1Balance ?? '0',
          vaultInfo?.token1?.decimals,
        ),
      );
      const farmToken0Amount =
        vaultTotalSupplyNum > 0
          ? (farmTotalSupplyNum * steerToken0VaultBalance) / vaultTotalSupplyNum
          : 0;
      const farmToken1Amount =
        vaultTotalSupplyNum > 0
          ? (farmTotalSupplyNum * steerToken1VaultBalance) / vaultTotalSupplyNum
          : 0;
      const vaultToken0Address = vaultInfo?.token0?.address ?? '';
      const token0PriceObj = tokenUSDPrices?.find(
        ({ address }) =>
          address.toLowerCase() === vaultToken0Address.toLowerCase(),
      );
      const token0Price = Number(token0PriceObj?.price ?? 0);
      const vaultToken1Address = vaultInfo?.token1?.address ?? '';
      const token1PriceObj = tokenUSDPrices?.find(
        ({ address }) =>
          address.toLowerCase() === vaultToken1Address.toLowerCase(),
      );
      const token1Price = Number(token1PriceObj?.price ?? 0);
      const tvl =
        farmToken0Amount * token0Price + farmToken1Amount * token1Price;

      const farmRewardTokenAUSD = tokenUSDPrices?.find(
        (item) =>
          item.address.toLowerCase() ===
          (farm?.rewardTokenA ?? '').toLowerCase(),
      );
      const farmRewardTokenBUSD = tokenUSDPrices?.find(
        (item) =>
          item.address.toLowerCase() ===
          (farm?.rewardTokenB ?? '').toLowerCase(),
      );
      const farmRewardUSD =
        (farm.dailyEmissionRewardA ?? 0) * (farmRewardTokenAUSD?.price ?? 0) +
        (farm.dailyEmissionRewardB ?? 0) * (farmRewardTokenBUSD?.price ?? 0);

      const totalRewardsUSD =
        (farmRewardUSD * Number(farm.rewardsDuration)) / 86400;
      const farmAPR =
        tvl > 0 ? (farmRewardUSD * 365 * 100) / tvl : totalRewardsUSD;

      const token0Address = farm?.vaultTokens?.token0?.address;
      const token1Address = farm?.vaultTokens?.token1?.address;
      const token0 =
        getTokenFromAddress(token0Address, chainId, tokenMap, []) ??
        vaultInfo?.token0;
      const token1 =
        getTokenFromAddress(token1Address, chainId, tokenMap, []) ??
        vaultInfo?.token1;

      const rewards: any[] = [];
      if (farm?.rewardTokenADetail) {
        rewards.push({
          amount: farm?.dailyEmissionRewardA ?? 0,
          token: farm?.rewardTokenADetail,
        });
      }
      if (farm?.rewardTokenBDetail) {
        rewards.push({
          amount: farm?.dailyEmissionRewardB ?? 0,
          token: farm?.rewardTokenBDetail,
        });
      }

      const minTick = Number(vaultInfo?.lowerTick ?? 0);
      const maxTick = Number(vaultInfo?.upperTick ?? 0);
      const currentTick = Number(vaultInfo?.tick ?? 0);
      const positionWidthPercent = calculatePositionWidth(
        currentTick,
        minTick,
        maxTick,
      );
      const pairType =
        vaultInfo &&
        vaultInfo.strategyName &&
        vaultInfo.strategyName.toLowerCase().includes('stable')
          ? Presets.STEER_STABLE
          : percentageToMultiplier(positionWidthPercent) > 1.2
          ? Presets.STEER_WIDE
          : Presets.STEER_NARROW;
      const pairTypeTitle =
        pairType === Presets.STEER_STABLE
          ? 'Stable'
          : pairType === Presets.STEER_WIDE
          ? 'Wide'
          : 'Narrow';

      return {
        ...farm,
        token0,
        token1,
        tvl,
        rewardUSD: farmRewardUSD,
        rewards,
        farmAPR,
        poolAPR: vaultInfo?.apr ?? 0,
        type: 'Steer',
        title: pairTypeTitle,
        loading: loadingUSDPrice || loadingSteerVaults,
        fee: Number(vaultInfo?.feeTier ?? 0),
      };
    })
    .filter((item: any) => {
      const search = searchVal ?? '';
      const searchCondition =
        (item.token0 &&
          item.token0.symbol &&
          item.token0.symbol.toLowerCase().includes(search.toLowerCase())) ||
        (item.token0 &&
          item.token0.address.toLowerCase().includes(search.toLowerCase())) ||
        (item.token1 &&
          item.token1.symbol &&
          item.token1.symbol.toLowerCase().includes(search.toLowerCase())) ||
        (item.token1 &&
          item.token1.address.toLowerCase().includes(search.toLowerCase())) ||
        item.staking.name.toLowerCase().includes(search.toLowerCase());

      const blueChipCondition =
        !!GlobalData.blueChips[chainId].find(
          (token) =>
            item.token0 &&
            token.address.toLowerCase() === item.token0.address.toLowerCase(),
        ) &&
        !!GlobalData.blueChips[chainId].find(
          (token) =>
            item.token1 &&
            token.address.toLowerCase() === item.token1.address.toLowerCase(),
        );
      const stableCoinCondition =
        !!GlobalData.stableCoins[chainId].find(
          (token) =>
            item.token0 &&
            token.address.toLowerCase() === item.token0.address.toLowerCase(),
        ) &&
        !!GlobalData.stableCoins[chainId].find(
          (token) =>
            item.token1 &&
            token.address.toLowerCase() === item.token1.address.toLowerCase(),
        );

      const stablePair0 = GlobalData.stablePairs[chainId].find(
        (tokens) =>
          !!tokens.find(
            (token) =>
              item.token0 &&
              token.address.toLowerCase() === item.token0.address.toLowerCase(),
          ),
      );
      const stablePair1 = GlobalData.stablePairs[chainId].find(
        (tokens) =>
          !!tokens.find(
            (token) =>
              item.token1 &&
              token.address.toLowerCase() === item.token1.address.toLowerCase(),
          ),
      );
      const stableLPCondition =
        item.token0 &&
        item.token1 &&
        ((stablePair0 &&
          stablePair0.find(
            (token) =>
              token.address.toLowerCase() === item.token1.address.toLowerCase(),
          )) ||
          (stablePair1 &&
            stablePair1.find(
              (token) =>
                token.address.toLowerCase() ===
                item.token0.address.toLowerCase(),
            )));

      return (
        searchCondition &&
        (farmFilter === v3FarmFilter.blueChip
          ? blueChipCondition
          : farmFilter === v3FarmFilter.stableCoin
          ? stableCoinCondition
          : farmFilter === v3FarmFilter.stableLP
          ? stableLPCondition
          : farmFilter === v3FarmFilter.otherLP
          ? !blueChipCondition && !stableCoinCondition && !stableLPCondition
          : true)
      );
    })
    .sort((farm0: any, farm1: any) => {
      if (sortBy === v3FarmSortBy.pool) {
        const farm0Title =
          (farm0.token0?.symbol ?? '') +
          (farm0.token1?.symbol ?? '') +
          farm0.title;
        const farm1Title =
          (farm1.token0?.symbol ?? '') +
          (farm1.token1?.symbol ?? '') +
          farm1.title;
        return farm0Title > farm1Title ? sortMultiplier : -1 * sortMultiplier;
      } else if (sortBy === v3FarmSortBy.tvl) {
        return farm0.tvl > farm1.tvl ? sortMultiplier : -1 * sortMultiplier;
      } else if (sortBy === v3FarmSortBy.rewards) {
        return farm0.rewardUSD > farm1.rewardUSD
          ? sortMultiplier
          : -1 * sortMultiplier;
      } else if (sortBy === v3FarmSortBy.apr) {
        return farm0.farmAPR + farm0.poolAPR > farm1.farmAPR + farm1.poolAPR
          ? sortMultiplier
          : -1 * sortMultiplier;
      }
      return 1;
    });

  return filteredFarms;
}

export function useSteerPosition(vaultAddress?: string) {
  const { chainId, account } = useActiveWeb3React();
  const { loading: loadingVaults, data: steerVaults } = useSteerVaults(chainId);
  const steerVaultContract = useSteerVaultContract(vaultAddress);
  const vaultTotalSupplyRes = useSingleCallResult(
    steerVaultContract,
    'totalSupply',
  );
  const vaultBalanceRes = useSingleCallResult(steerVaultContract, 'balanceOf', [
    account,
  ]);
  const vaultTotalSupply =
    !vaultTotalSupplyRes.loading && vaultTotalSupplyRes.result
      ? vaultTotalSupplyRes.result[0]
      : '0';
  const vaultBalance =
    !vaultBalanceRes.loading && vaultBalanceRes.result
      ? vaultBalanceRes.result[0]
      : '0';
  if (!vaultAddress) return { loading: false };
  const vault = steerVaults.find(
    (item) => item.address.toLowerCase() === vaultAddress.toLowerCase(),
  );
  if (!vault) return { loading: false };
  const vaultTotalSupplyNum = Number(formatUnits(vaultTotalSupply));
  const vaultBalanceNum = Number(formatUnits(vaultBalance));
  const steerToken0VaultBalance = vault?.token0Balance
    ? Number(formatUnits(vault.token0Balance, vault.token0?.decimals))
    : 0;
  const steerToken1VaultBalance = vault?.token1Balance
    ? Number(formatUnits(vault.token1Balance, vault.token1?.decimals))
    : 0;
  const token0Balance =
    (vaultBalanceNum * steerToken0VaultBalance) / vaultTotalSupplyNum;
  const token1Balance =
    (vaultBalanceNum * steerToken1VaultBalance) / vaultTotalSupplyNum;

  return {
    loading:
      loadingVaults || vaultTotalSupplyRes.loading || vaultBalanceRes.loading,
    data: {
      ...vault,
      totalBalance: vaultBalanceNum,
      token0BalanceWallet: token0Balance,
      token1BalanceWallet: token1Balance,
    },
  };
}
