import React, { useEffect, useMemo, useState } from 'react';
import { Frown } from 'react-feather';
import { useActiveWeb3React } from 'hooks';
import Loader from '../Loader';
import { Deposit, FormattedRewardInterface } from '../../models/interfaces';
import { FarmingType } from '../../models/enums';
import { useLocation } from 'react-router-dom';
import './index.scss';
import FarmCard from './FarmCard';
import {
  Box,
  Button,
  Divider,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import { useV3StakeData } from 'state/farms/hooks';
import { useFarmingSubgraph } from 'hooks/useIncentiveSubgraph';
import { useTranslation } from 'react-i18next';
import { GammaPair, GammaPairs, GlobalConst } from 'constants/index';
import SortColumns from 'components/SortColumns';
import { useQuery } from 'react-query';
import { getGammaData, getGammaRewards, getTokenFromAddress } from 'utils';
import { useSelectedTokenList } from 'state/lists/hooks';
import { ChainId, Token } from '@uniswap/sdk';
import GammaFarmCard from './GammaFarmCard';
import { GAMMA_MASTERCHEF_ADDRESSES } from 'constants/v3/addresses';
import { useUSDCPricesFromAddresses } from 'utils/useUSDCPrice';
import { formatReward } from 'utils/formatReward';
import {
  useMultipleContractMultipleData,
  useSingleCallResult,
} from 'state/multicall/v3/hooks';
import {
  useGammaHypervisorContract,
  useMasterChefContract,
  useMasterChefContracts,
} from 'hooks/useContract';
import { formatUnits } from 'ethers/lib/utils';
import { useFarmingHandlers } from 'hooks/useStakerHandlers';
import CurrencyLogo from 'components/CurrencyLogo';
import QIGammaMasterChef from 'constants/abis/gamma-masterchef1.json';

export const FarmingMyFarms: React.FC<{
  search: string;
  chainId: ChainId;
}> = ({ search }) => {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();
  const tokenMap = useSelectedTokenList();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  const { v3FarmSortBy } = GlobalConst.utils;
  const [sortByQuick, setSortByQuick] = useState(v3FarmSortBy.pool);
  const [sortDescQuick, setSortDescQuick] = useState(false);
  const sortMultiplierQuick = sortDescQuick ? -1 : 1;

  const allGammaFarms = useMemo(() => {
    return chainId
      ? ([] as GammaPair[])
          .concat(...Object.values(GammaPairs[chainId]))
          .filter((item) => item.ableToFarm)
      : [];
  }, [chainId]);
  const { eternalOnlyCollectRewardHandler } = useFarmingHandlers();

  const {
    fetchRewards: { rewardsResult, fetchRewardsFn, rewardsLoading },
    fetchTransferredPositions: {
      fetchTransferredPositionsFn,
      transferredPositions,
      transferredPositionsLoading,
    },
    fetchEternalFarmPoolAprs: {
      fetchEternalFarmPoolAprsFn,
      eternalFarmPoolAprs,
      eternalFarmPoolAprsLoading,
    },
    fetchEternalFarmAprs: {
      fetchEternalFarmAprsFn,
      eternalFarmAprs,
      eternalFarmAprsLoading,
    },
  } = useFarmingSubgraph() || {};
  const { v3Stake } = useV3StakeData();
  const {
    selectedTokenId,
    txType,
    txHash,
    txError,
    txConfirmed,
    selectedFarmingType,
  } = v3Stake ?? {};

  const [shallowPositions, setShallowPositions] = useState<Deposit[] | null>(
    null,
  );

  const [shallowRewards, setShallowRewards] = useState<
    FormattedRewardInterface[] | null
  >();

  const { hash } = useLocation();

  const rewardTokenAddresses = useMemo(() => {
    if (!shallowPositions || !shallowPositions.length) return [];
    return shallowPositions.reduce<string[]>((memo, farm) => {
      const rewardTokenAddress = memo.find(
        (item) =>
          farm &&
          farm.eternalRewardToken &&
          farm.eternalRewardToken.id &&
          farm.eternalRewardToken.id.toLowerCase() === item,
      );
      const bonusRewardTokenAddress = memo.find(
        (item) =>
          farm &&
          farm.eternalBonusRewardToken &&
          farm.eternalBonusRewardToken.id &&
          farm.eternalBonusRewardToken.id.toLowerCase() === item,
      );
      if (
        !rewardTokenAddress &&
        farm &&
        farm.eternalRewardToken &&
        farm.eternalRewardToken.id
      ) {
        memo.push(farm.eternalRewardToken.id.toLowerCase());
      }
      if (
        !bonusRewardTokenAddress &&
        farm.eternalBonusRewardToken &&
        farm.eternalBonusRewardToken.id &&
        farm.eternalBonusRewardToken.id
      ) {
        memo.push(farm.eternalBonusRewardToken.id.toLowerCase());
      }
      return memo;
    }, []);
  }, [shallowPositions]);

  const rewardTokenPrices = useUSDCPricesFromAddresses(rewardTokenAddresses);

  const farmedNFTs = useMemo(() => {
    if (!shallowPositions) return;
    const _positions = shallowPositions
      .filter((farm) => {
        const farmToken0Name =
          farm && farm.pool && farm.pool.token0 && farm.pool.token0.name
            ? farm.pool.token0.name
            : '';
        const farmToken1Name =
          farm && farm.pool && farm.pool.token1 && farm.pool.token1.name
            ? farm.pool.token1.name
            : '';
        const farmToken0Symbol =
          farm && farm.pool && farm.pool.token0 && farm.pool.token0.symbol
            ? farm.pool.token0.symbol
            : '';
        const farmToken1Symbol =
          farm && farm.pool && farm.pool.token1 && farm.pool.token1.symbol
            ? farm.pool.token1.symbol
            : '';
        const farmToken0Id =
          farm && farm.pool && farm.pool.token0 && farm.pool.token0.id
            ? farm.pool.token0.id
            : '';
        const farmToken1Id =
          farm && farm.pool && farm.pool.token1 && farm.pool.token1.id
            ? farm.pool.token1.id
            : '';
        return (
          farm.onFarmingCenter &&
          (farmToken0Name.toLowerCase().includes(search) ||
            farmToken1Name.toLowerCase().includes(search) ||
            farmToken0Symbol.toLowerCase().includes(search) ||
            farmToken1Symbol.toLowerCase().includes(search) ||
            farmToken0Id.toLowerCase().includes(search) ||
            farmToken1Id.toLowerCase().includes(search))
        );
      })
      .sort((farm1, farm2) => {
        const farm1TokenStr =
          farm1.pool.token0.symbol + '/' + farm1.pool.token1.symbol;
        const farm2TokenStr =
          farm2.pool.token0.symbol + '/' + farm2.pool.token1.symbol;
        if (sortByQuick === v3FarmSortBy.apr) {
          const farm1FarmAPR =
            eternalFarmAprs && farm1 && farm1.farmId
              ? Number(eternalFarmAprs[farm1.farmId])
              : 0;
          const farm2FarmAPR =
            eternalFarmAprs && farm2 && farm2.farmId
              ? Number(eternalFarmAprs[farm2.farmId])
              : 0;
          const farm1PoolAPR =
            eternalFarmPoolAprs && farm1 && farm1.pool && farm1.pool.id
              ? Number(eternalFarmPoolAprs[farm1.pool.id])
              : 0;
          const farm2PoolAPR =
            eternalFarmPoolAprs && farm2 && farm2.pool && farm2.pool.id
              ? Number(eternalFarmPoolAprs[farm2.pool.id])
              : 0;
          return farm1FarmAPR + farm1PoolAPR > farm2FarmAPR + farm2PoolAPR
            ? sortMultiplierQuick
            : -1 * sortMultiplierQuick;
        } else if (sortByQuick === v3FarmSortBy.rewards) {
          const farm1RewardTokenPrice = rewardTokenPrices?.find(
            (item) =>
              farm1 &&
              farm1.eternalRewardToken &&
              farm1.eternalRewardToken.id &&
              item.address.toLowerCase() ===
                farm1.eternalRewardToken.id.toLowerCase(),
          );
          const farm1BonusRewardTokenPrice = rewardTokenPrices?.find(
            (item) =>
              farm1 &&
              farm1.eternalBonusRewardToken &&
              farm1.eternalBonusRewardToken.id &&
              item.address.toLowerCase() ===
                farm1.eternalBonusRewardToken.id.toLowerCase(),
          );
          const farm2RewardTokenPrice = rewardTokenPrices?.find(
            (item) =>
              farm2 &&
              farm2.eternalRewardToken &&
              farm2.eternalRewardToken.id &&
              item.address.toLowerCase() ===
                farm2.eternalRewardToken.id.toLowerCase(),
          );
          const farm2BonusRewardTokenPrice = rewardTokenPrices?.find(
            (item) =>
              farm2 &&
              farm2.eternalBonusRewardToken &&
              farm2.eternalBonusRewardToken.id &&
              item.address.toLowerCase() ===
                farm2.eternalBonusRewardToken.id.toLowerCase(),
          );

          const farm1Reward =
            farm1 &&
            farm1.eternalEarned &&
            farm1.eternalRewardToken &&
            farm1.eternalRewardToken.decimals &&
            farm1RewardTokenPrice
              ? Number(farm1.eternalEarned) * farm1RewardTokenPrice.price
              : 0;
          const farm1BonusReward =
            farm1 &&
            farm1.eternalBonusEarned &&
            farm1.eternalBonusRewardToken &&
            farm1.eternalBonusRewardToken.decimals &&
            farm1BonusRewardTokenPrice
              ? Number(farm1.eternalBonusEarned) *
                farm1BonusRewardTokenPrice.price
              : 0;
          const farm2Reward =
            farm2 &&
            farm2.eternalEarned &&
            farm2.eternalRewardToken &&
            farm2.eternalRewardToken.decimals &&
            farm2RewardTokenPrice
              ? Number(farm2.eternalEarned) * farm2RewardTokenPrice.price
              : 0;
          const farm2BonusReward =
            farm2 &&
            farm2.eternalBonusEarned &&
            farm2.eternalBonusRewardToken &&
            farm2.eternalBonusRewardToken.decimals &&
            farm2BonusRewardTokenPrice
              ? Number(farm2.eternalBonusEarned) *
                farm2BonusRewardTokenPrice.price
              : 0;
          return farm1Reward + farm1BonusReward > farm2Reward + farm2BonusReward
            ? sortMultiplierQuick
            : -1 * sortMultiplierQuick;
        }
        return farm1TokenStr > farm2TokenStr
          ? sortMultiplierQuick
          : -1 * sortMultiplierQuick;
      });

    return _positions.length > 0 ? _positions : [];
  }, [
    eternalFarmAprs,
    eternalFarmPoolAprs,
    rewardTokenPrices,
    search,
    shallowPositions,
    sortByQuick,
    sortMultiplierQuick,
    v3FarmSortBy.apr,
    v3FarmSortBy.rewards,
  ]);

  useEffect(() => {
    fetchTransferredPositionsFn();
    fetchEternalFarmPoolAprsFn();
    fetchEternalFarmAprsFn();
    fetchRewardsFn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  useEffect(() => {
    if (txType === 'farm' && txConfirmed) {
      fetchTransferredPositionsFn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txType, txConfirmed]);

  useEffect(() => {
    setShallowPositions(transferredPositions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transferredPositions?.length]);

  useEffect(() => {
    setShallowRewards(rewardsResult.filter((reward) => reward.trueAmount));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rewardsResult?.length]);

  useEffect(() => {
    if (!shallowPositions) return;
    if (txHash && txConfirmed && selectedTokenId) {
      if (txType === 'eternalCollectReward') {
        setShallowPositions(
          shallowPositions.map((el) => {
            if (el.id === selectedTokenId) {
              el.eternalEarned = 0;
              el.eternalBonusEarned = 0;
            }
            return el;
          }),
        );
      } else if (txType === 'withdraw') {
        setShallowPositions(
          shallowPositions.map((el) => {
            if (el.id === selectedTokenId) {
              el.onFarmingCenter = false;
            }
            return el;
          }),
        );
      } else if (txType === 'claimRewards') {
        setShallowPositions(
          shallowPositions.map((el) => {
            if (el.id === selectedTokenId) {
              if (selectedFarmingType === FarmingType.LIMIT) {
                el.limitFarming = null;
              } else {
                el.eternalFarming = null;
              }
            }
            return el;
          }),
        );
      } else if (txType === 'getRewards') {
        setShallowPositions(
          shallowPositions.map((el) => {
            if (el.id === selectedTokenId) {
              if (selectedFarmingType === FarmingType.LIMIT) {
                el.limitFarming = null;
              } else {
                el.eternalFarming = null;
              }
            }
            return el;
          }),
        );
      } else if (txType === 'eternalOnlyCollectReward') {
        if (!shallowRewards) return;

        setShallowRewards(
          shallowRewards.filter((reward) => reward.id !== selectedTokenId),
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txHash, txConfirmed, selectedTokenId, selectedFarmingType, txType]);

  const [sortByGamma, setSortByGamma] = useState(v3FarmSortBy.pool);

  const [sortDescGamma, setSortDescGamma] = useState(false);

  const sortColumnsQuickSwap = [
    {
      text: t('pool'),
      index: v3FarmSortBy.pool,
      width: 0.6,
      justify: 'flex-start',
    },
    {
      text: t('apr'),
      index: v3FarmSortBy.apr,
      width: 0.2,
      justify: 'flex-start',
    },
    {
      text: t('earnedRewards'),
      index: v3FarmSortBy.rewards,
      width: 0.2,
      justify: 'flex-start',
    },
  ];

  const sortColumnsGamma = [
    {
      text: t('pool'),
      index: v3FarmSortBy.pool,
      width: 0.3,
      justify: 'flex-start',
    },
    {
      text: t('tvl'),
      index: v3FarmSortBy.tvl,
      width: 0.2,
      justify: 'flex-start',
    },
    {
      text: t('rewards'),
      index: v3FarmSortBy.rewards,
      width: 0.3,
      justify: 'flex-start',
    },
    {
      text: t('apr'),
      index: v3FarmSortBy.apr,
      width: 0.2,
      justify: 'flex-start',
    },
  ];

  const sortByDesktopItemsQuick = sortColumnsQuickSwap.map((item) => {
    return {
      ...item,
      onClick: () => {
        if (sortByQuick === item.index) {
          setSortDescQuick(!sortDescQuick);
        } else {
          setSortByQuick(item.index);
          setSortDescQuick(false);
        }
      },
    };
  });

  const sortByDesktopItemsGamma = sortColumnsGamma.map((item) => {
    return {
      ...item,
      onClick: () => {
        if (sortByGamma === item.index) {
          setSortDescGamma(!sortDescGamma);
        } else {
          setSortByGamma(item.index);
          setSortDescGamma(false);
        }
      },
    };
  });

  const fetchGammaRewards = async () => {
    const gammaRewards = await getGammaRewards(chainId);
    return gammaRewards;
  };

  const fetchGammaData = async () => {
    const gammaData = await getGammaData(chainId);
    return gammaData;
  };

  const { isLoading: gammaFarmsLoading, data: gammaData } = useQuery(
    'fetchGammaData',
    fetchGammaData,
    {
      refetchInterval: 30000,
    },
  );

  const { isLoading: gammaRewardsLoading, data: gammaRewards } = useQuery(
    'fetchGammaRewards',
    fetchGammaRewards,
    {
      refetchInterval: 30000,
    },
  );

  const sortMultiplierGamma = sortDescGamma ? -1 : 1;

  const qiTokenAddress = '0x580a84c73811e1839f75d86d75d88cca0c241ff4';
  const qiGammaFarm = '0x25B186eEd64ca5FDD1bc33fc4CFfd6d34069BAec';
  const qimasterChefContract = useMasterChefContract(
    2,
    undefined,
    QIGammaMasterChef,
  );
  const qiHypeContract = useGammaHypervisorContract(qiGammaFarm);

  const qiPoolData = useSingleCallResult(qimasterChefContract, 'poolInfo', [2]);
  const qiGammaStakedAmountData = useSingleCallResult(
    qiHypeContract,
    'balanceOf',
    [qimasterChefContract?.address],
  );
  const qiGammaStakedAmount =
    !qiGammaStakedAmountData.loading &&
    qiGammaStakedAmountData.result &&
    qiGammaStakedAmountData.result.length > 0
      ? Number(formatUnits(qiGammaStakedAmountData.result[0], 18))
      : 0;
  const qiGammaData =
    gammaData && gammaData[qiGammaFarm.toLowerCase()]
      ? gammaData[qiGammaFarm.toLowerCase()]
      : undefined;
  const qiLPTokenUSD =
    qiGammaData &&
    qiGammaData.totalSupply &&
    Number(qiGammaData.totalSupply) > 0
      ? (Number(qiGammaData.tvlUSD) / Number(qiGammaData.totalSupply)) *
        10 ** 18
      : 0;
  const qiGammaStakedAmountUSD = qiGammaStakedAmount * qiLPTokenUSD;

  const qiAllocPointBN =
    !qiPoolData.loading && qiPoolData.result && qiPoolData.result.length > 0
      ? qiPoolData.result.allocPoint
      : undefined;

  const qiRewardPerSecondData = useSingleCallResult(
    qimasterChefContract,
    'rewardPerSecond',
    [],
  );

  const qiRewardPerSecondBN =
    !qiRewardPerSecondData.loading &&
    qiRewardPerSecondData.result &&
    qiRewardPerSecondData.result.length > 0
      ? qiRewardPerSecondData.result[0]
      : undefined;

  const qiTotalAllocPointData = useSingleCallResult(
    qimasterChefContract,
    'totalAllocPoint',
    [],
  );

  const qiTotalAllocPointBN =
    !qiTotalAllocPointData.loading &&
    qiTotalAllocPointData.result &&
    qiTotalAllocPointData.result.length > 0
      ? qiTotalAllocPointData.result[0]
      : undefined;

  const qiRewardPerSecond =
    qiAllocPointBN && qiRewardPerSecondBN && qiTotalAllocPointBN
      ? ((Number(qiAllocPointBN) / Number(qiTotalAllocPointBN)) *
          Number(qiRewardPerSecondBN)) /
        10 ** 18
      : undefined;

  const gammaRewardTokenAddresses = GAMMA_MASTERCHEF_ADDRESSES.reduce<string[]>(
    (memo, masterChef) => {
      const gammaReward =
        gammaRewards &&
        chainId &&
        masterChef[chainId] &&
        gammaRewards[masterChef[chainId].toLowerCase()]
          ? gammaRewards[masterChef[chainId].toLowerCase()]['pools']
          : undefined;
      if (gammaReward) {
        const gammaRewardArr: any[] = Object.values(gammaReward);
        for (const item of gammaRewardArr) {
          if (item && item['rewarders']) {
            const rewarders: any[] = Object.values(item['rewarders']);
            for (const rewarder of rewarders) {
              if (
                rewarder &&
                rewarder['rewardPerSecond'] &&
                Number(rewarder['rewardPerSecond']) > 0 &&
                rewarder.rewardToken &&
                !memo.includes(rewarder.rewardToken)
              ) {
                memo.push(rewarder.rewardToken);
              }
            }
          }
        }
      }
      return memo;
    },
    [],
  );

  const gammaRewardTokenAddressesWithQI = useMemo(() => {
    const containsQI = !!gammaRewardTokenAddresses.find(
      (address) => address.toLowerCase() === qiTokenAddress.toLowerCase(),
    );
    if (containsQI) {
      return gammaRewardTokenAddresses;
    }
    return gammaRewardTokenAddresses.concat([qiTokenAddress]);
  }, [gammaRewardTokenAddresses]);

  const gammaRewardsWithUSDPrice = useUSDCPricesFromAddresses(
    gammaRewardTokenAddressesWithQI,
  );

  const qiPrice = gammaRewardsWithUSDPrice?.find(
    (item) => item.address.toLowerCase() === qiTokenAddress.toLowerCase(),
  )?.price;

  const qiAPR =
    qiRewardPerSecond && qiPrice && qiGammaStakedAmountUSD
      ? (qiRewardPerSecond * qiPrice * 3600 * 24 * 365) / qiGammaStakedAmountUSD
      : undefined;

  if (gammaRewards && GAMMA_MASTERCHEF_ADDRESSES[2][chainId] && qiAPR) {
    const qiRewardsData = {
      apr: qiAPR,
      stakedAmount: qiGammaStakedAmount,
      stakedAmountUSD: qiGammaStakedAmountUSD,
      rewarders: {
        rewarder: {
          rewardToken: qiTokenAddress,
          rewardTokenDecimals: 18,
          rewardTokenSymbol: 'QI',
          rewardPerSecond: qiRewardPerSecond,
          apr: qiAPR,
          allocPoint: qiAllocPointBN.toString(),
        },
      },
    };
    gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[2][chainId]] = { pools: {} };
    gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[2][chainId]]['pools'][
      qiGammaFarm.toLowerCase()
    ] = qiRewardsData;
  }

  const allGammaPairsToFarm = chainId
    ? ([] as GammaPair[]).concat(...Object.values(GammaPairs[chainId]))
    : [];

  const masterChefContracts = useMasterChefContracts();

  const stakedAmountData = useMultipleContractMultipleData(
    account ? masterChefContracts : [],
    'userInfo',
    account
      ? masterChefContracts.map((_, ind) =>
          allGammaPairsToFarm
            .filter((pair) => (pair.masterChefIndex ?? 0) === ind)
            .map((pair) => [pair.pid, account]),
        )
      : [],
  );

  const stakedAmounts = stakedAmountData.map((callStates, ind) => {
    const gammaPairsFiltered = allGammaPairsToFarm.filter(
      (pair) => (pair.masterChefIndex ?? 0) === ind,
    );
    return callStates.map((callData, index) => {
      const amount =
        !callData.loading && callData.result && callData.result.length > 0
          ? formatUnits(callData.result[0], 18)
          : '0';
      const gPair =
        gammaPairsFiltered.length > index
          ? gammaPairsFiltered[index]
          : undefined;
      return {
        amount,
        pid: gPair?.pid,
        masterChefIndex: ind,
      };
    });
  });

  const myGammaFarms = allGammaPairsToFarm
    .map((item) => {
      const masterChefIndex = item.masterChefIndex ?? 0;
      const sItem =
        stakedAmounts && stakedAmounts.length > masterChefIndex
          ? stakedAmounts[masterChefIndex].find(
              (sAmount) => sAmount.pid === item.pid,
            )
          : undefined;
      return { ...item, stakedAmount: sItem ? Number(sItem.amount) : 0 };
    })
    .filter((item) => {
      return Number(item.stakedAmount) > 0;
    })
    .map((item) => {
      if (chainId) {
        const token0Data = getTokenFromAddress(
          item.token0Address,
          chainId,
          tokenMap,
          [],
        );
        const token1Data = getTokenFromAddress(
          item.token1Address,
          chainId,
          tokenMap,
          [],
        );
        const token0 = new Token(
          chainId,
          token0Data.address,
          token0Data.decimals,
          token0Data.symbol,
          token0Data.name,
        );
        const token1 = new Token(
          chainId,
          token1Data.address,
          token1Data.decimals,
          token1Data.symbol,
          token1Data.name,
        );
        return { ...item, token0, token1 };
      }
      return { ...item, token0: null, token1: null };
    })
    .sort((farm0, farm1) => {
      const gammaData0 = gammaData
        ? gammaData[farm0.address.toLowerCase()]
        : undefined;
      const gammaData1 = gammaData
        ? gammaData[farm1.address.toLowerCase()]
        : undefined;
      const farm0MasterChefAddress =
        chainId &&
        GAMMA_MASTERCHEF_ADDRESSES[farm0.masterChefIndex ?? 0][chainId]
          ? GAMMA_MASTERCHEF_ADDRESSES[farm0.masterChefIndex ?? 0][
              chainId
            ].toLowerCase()
          : undefined;
      const farm1MasterChefAddress =
        chainId &&
        GAMMA_MASTERCHEF_ADDRESSES[farm1.masterChefIndex ?? 0][chainId]
          ? GAMMA_MASTERCHEF_ADDRESSES[farm1.masterChefIndex ?? 0][
              chainId
            ].toLowerCase()
          : undefined;
      const gammaReward0 =
        gammaRewards &&
        farm0MasterChefAddress &&
        gammaRewards[farm0MasterChefAddress] &&
        gammaRewards[farm0MasterChefAddress]['pools']
          ? gammaRewards[farm0MasterChefAddress]['pools'][
              farm0.address.toLowerCase()
            ]
          : undefined;
      const gammaReward1 =
        gammaRewards &&
        farm1MasterChefAddress &&
        gammaRewards[farm1MasterChefAddress] &&
        gammaRewards[farm1MasterChefAddress]['pools']
          ? gammaRewards[farm1MasterChefAddress]['pools'][
              farm1.address.toLowerCase()
            ]
          : undefined;

      if (sortByGamma === v3FarmSortBy.pool) {
        const farm0Title =
          (farm0.token0?.symbol ?? '') +
          (farm0.token1?.symbol ?? '') +
          farm0.title;
        const farm1Title =
          (farm1.token0?.symbol ?? '') +
          (farm1.token1?.symbol ?? '') +
          farm1.title;
        return farm0Title > farm1Title
          ? sortMultiplierGamma
          : -1 * sortMultiplierGamma;
      } else if (sortByGamma === v3FarmSortBy.tvl) {
        const tvl0 =
          gammaReward0 && gammaReward0['stakedAmountUSD']
            ? Number(gammaReward0['stakedAmountUSD'])
            : 0;
        const tvl1 =
          gammaReward1 && gammaReward1['stakedAmountUSD']
            ? Number(gammaReward1['stakedAmountUSD'])
            : 0;
        return tvl0 > tvl1 ? sortMultiplierGamma : -1 * sortMultiplierGamma;
      } else if (sortByGamma === v3FarmSortBy.rewards) {
        const farm0RewardUSD =
          gammaReward0 && gammaReward0['rewarders']
            ? Object.values(gammaReward0['rewarders']).reduce(
                (total: number, rewarder: any) => {
                  const rewardUSD = gammaRewardsWithUSDPrice?.find(
                    (item) =>
                      item.address.toLowerCase() ===
                      rewarder.rewardToken.toLowerCase(),
                  );
                  return (
                    total + (rewardUSD?.price ?? 0) * rewarder.rewardPerSecond
                  );
                },
                0,
              )
            : 0;
        const farm1RewardUSD =
          gammaReward1 && gammaReward1['rewarders']
            ? Object.values(gammaReward1['rewarders']).reduce(
                (total: number, rewarder: any) => {
                  const rewardUSD = gammaRewardsWithUSDPrice?.find(
                    (item) =>
                      item.address.toLowerCase() ===
                      rewarder.rewardToken.toLowerCase(),
                  );
                  return (
                    total + (rewardUSD?.price ?? 0) * rewarder.rewardPerSecond
                  );
                },
                0,
              )
            : 0;
        return farm0RewardUSD > farm1RewardUSD
          ? sortMultiplierGamma
          : -1 * sortMultiplierGamma;
      } else if (sortByGamma === v3FarmSortBy.apr) {
        const poolAPR0 =
          gammaData0 &&
          gammaData0['returns'] &&
          gammaData0['returns']['allTime'] &&
          gammaData0['returns']['allTime']['feeApr']
            ? Number(gammaData0['returns']['allTime']['feeApr'])
            : 0;
        const poolAPR1 =
          gammaData1 &&
          gammaData1['returns'] &&
          gammaData1['returns']['allTime'] &&
          gammaData1['returns']['allTime']['feeApr']
            ? Number(gammaData1['returns']['allTime']['feeApr'])
            : 0;
        const farmAPR0 =
          gammaReward0 && gammaReward0['apr'] ? Number(gammaReward0['apr']) : 0;
        const farmAPR1 =
          gammaReward1 && gammaReward1['apr'] ? Number(gammaReward1['apr']) : 0;
        return poolAPR0 + farmAPR0 > poolAPR1 + farmAPR1
          ? sortMultiplierGamma
          : -1 * sortMultiplierGamma;
      }
      return 1;
    });

  return (
    <Box mt={2}>
      <Divider />
      {shallowRewards?.length ? (
        <Box px={2} my={2}>
          <h6>Unclaimed Rewards</h6>
          <Box my={2} className='flex'>
            {shallowRewards?.map((reward, index) =>
              reward.trueAmount ? (
                <Box key={index} className='flex items-center' mr={2}>
                  <CurrencyLogo
                    size='28px'
                    currency={
                      new Token(
                        chainId ?? ChainId.MATIC,
                        reward.rewardAddress,
                        18,
                        reward.symbol,
                      )
                    }
                  />
                  <Box mx={2}>
                    <Box>{reward.name}</Box>
                    <Box>{formatReward(reward.amount)}</Box>
                  </Box>
                  <Button
                    disabled={
                      selectedTokenId === reward.id &&
                      txType === 'eternalOnlyCollectReward' &&
                      !txConfirmed &&
                      !txError
                    }
                    onClick={() => {
                      eternalOnlyCollectRewardHandler(reward);
                    }}
                  >
                    {selectedTokenId === reward.id &&
                    txType === 'eternalOnlyCollectReward' &&
                    !txConfirmed &&
                    !txError ? (
                      <>
                        <Loader size={'1rem'} stroke={'var(--white)'} />
                        <Box ml='5px'>
                          <small>{t('claiming')}</small>
                        </Box>
                      </>
                    ) : (
                      <>
                        <small>{t('claim')}</small>
                      </>
                    )}
                  </Button>
                </Box>
              ) : null,
            )}
          </Box>
          <Divider />
        </Box>
      ) : null}
      <Box px={2} my={2}>
        <h6>QuickSwap {t('farms')}</h6>
      </Box>
      {transferredPositionsLoading ||
      eternalFarmPoolAprsLoading ||
      eternalFarmAprsLoading ||
      !shallowPositions ? (
        <Box py={5} className='flex justify-center'>
          <Loader stroke={'white'} size={'1.5rem'} />
        </Box>
      ) : shallowPositions && shallowPositions.length === 0 ? (
        <Box py={5} className='flex flex-col items-center'>
          <Frown size={35} stroke={'white'} />
          <Box mb={3} mt={1}>
            {t('nofarms')}
          </Box>
        </Box>
      ) : shallowPositions && shallowPositions.length !== 0 ? (
        <Box padding='24px'>
          {farmedNFTs && farmedNFTs.length > 0 && chainId && (
            <Box pb={2}>
              {!isMobile && (
                <Box px={3.5}>
                  <Box width='85%'>
                    <SortColumns
                      sortColumns={sortByDesktopItemsQuick}
                      selectedSort={sortByQuick}
                      sortDesc={sortDescQuick}
                    />
                  </Box>
                </Box>
              )}
              <Box mt={2}>
                {farmedNFTs.map((el, i) => {
                  return (
                    <div
                      className={'v3-my-farms-position-card'}
                      key={i}
                      data-navigatedto={hash == `#${el.id}`}
                    >
                      <FarmCard
                        chainId={chainId}
                        el={el}
                        poolApr={
                          eternalFarmPoolAprs
                            ? eternalFarmPoolAprs[el.pool.id]
                            : undefined
                        }
                        farmApr={
                          eternalFarmAprs
                            ? eternalFarmAprs[el.farmId]
                            : undefined
                        }
                      />
                    </div>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>
      ) : null}

      {allGammaFarms.length > 0 && (
        <Box my={2}>
          <Divider />
          <Box px={2} mt={2}>
            <h6>Gamma {t('farms')}</h6>
          </Box>
          {gammaFarmsLoading || gammaRewardsLoading ? (
            <Box py={5} className='flex justify-center'>
              <Loader stroke={'white'} size={'1.5rem'} />
            </Box>
          ) : myGammaFarms.length === 0 ? (
            <Box py={5} className='flex flex-col items-center'>
              <Frown size={35} stroke={'white'} />
              <Box mb={3} mt={1}>
                {t('nofarms')}
              </Box>
            </Box>
          ) : chainId ? (
            <Box padding='24px'>
              {!isMobile && (
                <Box px={1.5}>
                  <Box width='90%'>
                    <SortColumns
                      sortColumns={sortByDesktopItemsGamma}
                      selectedSort={sortByGamma}
                      sortDesc={sortDescGamma}
                    />
                  </Box>
                </Box>
              )}
              <Box pb={2}>
                {myGammaFarms.map((farm) => {
                  const gmMasterChef = GAMMA_MASTERCHEF_ADDRESSES[
                    farm.masterChefIndex ?? 0
                  ][chainId]
                    ? GAMMA_MASTERCHEF_ADDRESSES[farm.masterChefIndex ?? 0][
                        chainId
                      ].toLowerCase()
                    : undefined;
                  return (
                    <Box mt={2} key={farm.address}>
                      <GammaFarmCard
                        token0={farm.token0}
                        token1={farm.token1}
                        pairData={farm}
                        data={
                          gammaData
                            ? gammaData[farm.address.toLowerCase()]
                            : undefined
                        }
                        rewardData={
                          gammaRewards &&
                          gmMasterChef &&
                          gammaRewards[gmMasterChef] &&
                          gammaRewards[gmMasterChef]['pools']
                            ? gammaRewards[gmMasterChef]['pools'][
                                farm.address.toLowerCase()
                              ]
                            : undefined
                        }
                      />
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ) : (
            <></>
          )}
        </Box>
      )}
    </Box>
  );
};
