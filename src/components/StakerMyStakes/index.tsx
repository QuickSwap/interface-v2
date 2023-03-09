import React, { useEffect, useMemo, useState } from 'react';
import { Frown } from 'react-feather';
import { useActiveWeb3React } from 'hooks';
import Loader from '../Loader';
import { Deposit } from '../../models/interfaces';
import { FarmingType } from '../../models/enums';
import { useLocation } from 'react-router-dom';
import './index.scss';
import FarmCard from './FarmCard';
import { Box, Divider, useMediaQuery, useTheme } from '@material-ui/core';
import { useV3StakeData } from 'state/farms/hooks';
import { useFarmingSubgraph } from 'hooks/useIncentiveSubgraph';
import { useTranslation } from 'react-i18next';
import { GammaPair, GammaPairs, GlobalConst } from 'constants/index';
import SortColumns from 'components/SortColumns';
import { useQuery } from 'react-query';
import { getGammaData, getGammaRewards, getTokenFromAddress } from 'utils';
import { useSelectedTokenList } from 'state/lists/hooks';
import { Token } from '@uniswap/sdk';
import GammaFarmCard from './GammaFarmCard';
import { GAMMA_MASTERCHEF_ADDRESSES } from 'constants/v3/addresses';
import { useUSDCPricesToken } from 'utils/useUSDCPrice';
import { useSingleContractMultipleData } from 'state/multicall/v3/hooks';
import { useMasterChefContract } from 'hooks/useContract';
import { formatUnits } from 'ethers/lib/utils';

export const FarmingMyFarms: React.FC<{
  search: string;
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

  const {
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
  const { selectedTokenId, txType, txHash, txConfirmed, selectedFarmingType } =
    v3Stake ?? {};

  const [shallowPositions, setShallowPositions] = useState<Deposit[] | null>(
    null,
  );

  const { hash } = useLocation();

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
          const farm1Reward =
            farm1 &&
            farm1.eternalEarned &&
            farm1.eternalRewardToken &&
            farm1.eternalRewardToken.decimals &&
            farm1.eternalRewardToken.derivedMatic
              ? Number(farm1.eternalEarned) *
                Number(farm1.eternalRewardToken.derivedMatic)
              : 0;
          const farm1BonusReward =
            farm1 &&
            farm1.eternalBonusEarned &&
            farm1.eternalBonusRewardToken &&
            farm1.eternalBonusRewardToken.decimals &&
            farm1.eternalBonusRewardToken.derivedMatic
              ? Number(farm1.eternalBonusEarned) *
                Number(farm1.eternalBonusRewardToken.derivedMatic)
              : 0;
          const farm2Reward =
            farm2 &&
            farm2.eternalEarned &&
            farm2.eternalRewardToken &&
            farm2.eternalRewardToken.decimals &&
            farm2.eternalRewardToken.derivedMatic
              ? Number(farm2.eternalEarned) *
                Number(farm2.eternalRewardToken.derivedMatic)
              : 0;
          const farm2BonusReward =
            farm2 &&
            farm2.eternalBonusEarned &&
            farm2.eternalBonusRewardToken &&
            farm2.eternalBonusRewardToken.decimals &&
            farm2.eternalBonusRewardToken.derivedMatic
              ? Number(farm2.eternalBonusEarned) *
                Number(farm2.eternalBonusRewardToken.derivedMatic)
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
    search,
    shallowPositions,
    sortByQuick,
    sortMultiplierQuick,
    v3FarmSortBy,
  ]);

  useEffect(() => {
    fetchTransferredPositionsFn(true);
    fetchEternalFarmPoolAprsFn();
    fetchEternalFarmAprsFn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  useEffect(() => {
    if (txType === 'farm' && txConfirmed) {
      fetchTransferredPositionsFn(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txType, txConfirmed]);

  useEffect(() => {
    setShallowPositions(transferredPositions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transferredPositions?.length]);

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

  const { isLoading: gammaFarmsLoading, data: gammaData } = useQuery(
    'fetchGammaData',
    getGammaData,
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

  const gammaRewardTokens =
    gammaRewards && chainId
      ? ([] as string[])
          .concat(
            ...Object.values(gammaRewards).map((item: any) =>
              item && item['rewarders']
                ? Object.values(item['rewarders'])
                    .filter(
                      (rewarder: any) =>
                        rewarder && Number(rewarder['rewardPerSecond']) > 0,
                    )
                    .map((rewarder: any) => rewarder.rewardToken)
                : [],
            ),
          )
          .filter(
            (value, index, self) =>
              index ===
              self.findIndex((t) => t.toLowerCase() === value.toLowerCase()),
          )
          .map((tokenAddress) => {
            const tokenData = getTokenFromAddress(
              tokenAddress,
              chainId,
              tokenMap,
              [],
            );
            return new Token(
              chainId,
              tokenData.address,
              tokenData.decimals,
              tokenData.symbol,
              tokenData.name,
            );
          })
      : [];

  const rewardUSDPrices = useUSDCPricesToken(gammaRewardTokens);
  const gammaRewardsWithUSDPrice = gammaRewardTokens.map((token, ind) => {
    return { price: rewardUSDPrices[ind], tokenAddress: token.address };
  });

  const allGammaPairsToFarm = ([] as GammaPair[])
    .concat(...Object.values(GammaPairs))
    .filter((item) => item.ableToFarm);

  const masterChefContract = useMasterChefContract();

  const stakedAmountData = useSingleContractMultipleData(
    masterChefContract,
    'userInfo',
    account ? allGammaPairsToFarm.map((pair) => [pair.pid, account]) : [],
  );

  const stakedAmounts = stakedAmountData.map((callData) => {
    return !callData.loading && callData.result && callData.result.length > 0
      ? formatUnits(callData.result[0], 18)
      : '0';
  });

  const myGammaFarms = allGammaPairsToFarm
    .map((item, index) => {
      return { ...item, stakedAmount: stakedAmounts[index] };
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
      const gammaReward0 =
        gammaRewards &&
        chainId &&
        gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[chainId]] &&
        gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[chainId]]['pools']
          ? gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[chainId]]['pools'][
              farm0.address.toLowerCase()
            ]
          : undefined;
      const gammaReward1 =
        gammaRewards &&
        chainId &&
        gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[chainId]] &&
        gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[chainId]]['pools']
          ? gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[chainId]]['pools'][
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
          gammaData0 && gammaData0['tvlUSD'] ? Number(gammaData0['tvlUSD']) : 0;
        const tvl1 =
          gammaData1 && gammaData1['tvlUSD'] ? Number(gammaData1['tvlUSD']) : 0;
        return tvl0 > tvl1 ? sortMultiplierGamma : -1 * sortMultiplierGamma;
      } else if (sortByGamma === v3FarmSortBy.rewards) {
        const farm0RewardUSD =
          gammaReward0 && gammaReward0['rewarders']
            ? Object.values(gammaReward0['rewarders']).reduce(
                (total: number, rewarder: any) => {
                  const rewardUSD = gammaRewardsWithUSDPrice.find(
                    (item) =>
                      item.tokenAddress.toLowerCase() ===
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
                  const rewardUSD = gammaRewardsWithUSDPrice.find(
                    (item) =>
                      item.tokenAddress.toLowerCase() ===
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
          {farmedNFTs && farmedNFTs.length > 0 && (
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
              {myGammaFarms.map((farm) => (
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
                      gammaRewards
                        ? gammaRewards[farm.address.toLowerCase()]
                        : undefined
                    }
                  />
                </Box>
              ))}
            </Box>
          </Box>
        ) : (
          <></>
        )}
      </Box>
    </Box>
  );
};
