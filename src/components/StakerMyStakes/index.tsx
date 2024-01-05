import React, { useMemo, useState } from 'react';
import { Frown } from 'react-feather';
import { useActiveWeb3React } from 'hooks';
import Loader from '../Loader';
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
import {
  useEternalFarmAprs,
  useEternalFarmPoolAPRs,
  useFarmRewards,
  useTransferredPositions,
} from 'hooks/useIncentiveSubgraph';
import { useTranslation } from 'react-i18next';
import { GlobalConst } from 'constants/index';
import SortColumns from 'components/SortColumns';
import { getAllGammaPairs } from 'utils';
import { ChainId, Token } from '@uniswap/sdk';
import GammaFarmCard from './GammaFarmCard';
import UnipilotFarmCard from './UnipilotFarmCard';
import { useUSDCPricesFromAddresses } from 'utils/useUSDCPrice';
import { formatReward } from 'utils/formatReward';
import { useMultipleContractMultipleData } from 'state/multicall/v3/hooks';
import { useMasterChefContracts } from 'hooks/useContract';
import { formatUnits } from 'ethers/lib/utils';
import { useFarmingHandlers } from 'hooks/useStakerHandlers';
import CurrencyLogo from 'components/CurrencyLogo';
import {
  useUnipilotFarmData,
  useUnipilotFilteredFarms,
  useUnipilotUserFarms,
} from 'hooks/v3/useUnipilotFarms';
import { FarmingType } from 'models/enums';
import { getConfig } from 'config/index';
import {
  useSteerFilteredFarms,
  useSteerStakedPools,
  useSteerStakingPools,
} from 'hooks/v3/useSteerData';
import SteerFarmCard from './SteerFarmCard';
import { useGammaFarmsFiltered } from 'hooks/v3/useV3Farms';

export const FarmingMyFarms: React.FC<{
  search: string;
  chainId: ChainId;
}> = ({ search }) => {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const config = getConfig(chainId);
  const qsFarmAvailable = config['farm']['quickswap'];

  const { v3FarmSortBy } = GlobalConst.utils;
  const [sortByQuick, setSortByQuick] = useState(v3FarmSortBy.pool);
  const [sortDescQuick, setSortDescQuick] = useState(false);
  const sortMultiplierQuick = sortDescQuick ? -1 : 1;

  const allGammaPairsToFarm = getAllGammaPairs(chainId);

  const allGammaFarms = allGammaPairsToFarm;
  const { eternalOnlyCollectRewardHandler } = useFarmingHandlers();

  const { data: rewardsResult } = useFarmRewards();
  const {
    data: transferredPositions,
    isLoading: transferredPositionsLoading,
  } = useTransferredPositions();
  const {
    data: eternalFarmPoolAprs,
    isLoading: eternalFarmPoolAprsLoading,
  } = useEternalFarmPoolAPRs();

  const {
    data: eternalFarmAprs,
    isLoading: eternalFarmAprsLoading,
  } = useEternalFarmAprs();

  const { v3Stake } = useV3StakeData();
  const { selectedTokenId, txType, txError, txConfirmed, selectedFarmingType } =
    v3Stake ?? {};

  const shallowPositions = useMemo(() => {
    if (!transferredPositions) return [];
    if (txConfirmed && selectedTokenId) {
      if (txType === 'withdraw') {
        return transferredPositions.map((el) => {
          if (el.id === selectedTokenId) {
            el.onFarmingCenter = false;
          }
          return el;
        });
      } else if (txType === 'claimRewards') {
        return transferredPositions.map((el) => {
          if (el.id === selectedTokenId) {
            if (selectedFarmingType === FarmingType.LIMIT) {
              el.limitFarming = null;
            } else {
              el.eternalFarming = null;
            }
          }
          return el;
        });
      } else if (txType === 'getRewards') {
        return transferredPositions.map((el) => {
          if (el.id === selectedTokenId) {
            if (selectedFarmingType === FarmingType.LIMIT) {
              el.limitFarming = null;
            } else {
              el.eternalFarming = null;
            }
          }
          return el;
        });
      }
    }
    return transferredPositions;
  }, [
    selectedFarmingType,
    selectedTokenId,
    transferredPositions,
    txConfirmed,
    txType,
  ]);

  const shallowRewards = useMemo(() => {
    if (!rewardsResult) return [];
    const rewards = rewardsResult.filter((reward) => reward.trueAmount);
    return rewards;
  }, [rewardsResult]);

  const { hash } = useLocation();

  const rewardTokenAddresses = useMemo(() => {
    if (!shallowPositions || !shallowPositions.length) return [];
    return shallowPositions.reduce<string[]>((memo, farm) => {
      const rewardTokenAddress = memo.find(
        (item) =>
          farm &&
          farm.eternalRewardToken &&
          farm.eternalRewardToken.address &&
          farm.eternalRewardToken.address.toLowerCase() === item,
      );
      const bonusRewardTokenAddress = memo.find(
        (item) =>
          farm &&
          farm.eternalBonusRewardToken &&
          farm.eternalBonusRewardToken.address &&
          farm.eternalBonusRewardToken.address.toLowerCase() === item,
      );
      if (
        !rewardTokenAddress &&
        farm &&
        farm.eternalRewardToken &&
        farm.eternalRewardToken.address
      ) {
        memo.push(farm.eternalRewardToken.address.toLowerCase());
      }
      if (
        !bonusRewardTokenAddress &&
        farm.eternalBonusRewardToken &&
        farm.eternalBonusRewardToken.address &&
        farm.eternalBonusRewardToken.address
      ) {
        memo.push(farm.eternalBonusRewardToken.address.toLowerCase());
      }
      return memo;
    }, []);
  }, [shallowPositions]);

  const { prices: rewardTokenPrices } = useUSDCPricesFromAddresses(
    rewardTokenAddresses,
  );

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
          farm &&
          farm.pool &&
          farm.pool.token0 &&
          (farm.pool.token0.id ?? farm.pool.token0.address)
            ? farm.pool.token0.id ?? farm.pool.token0.address
            : '';
        const farmToken1Id =
          farm &&
          farm.pool &&
          farm.pool.token1 &&
          (farm.pool.token1.id ?? farm.pool.token1.address)
            ? farm.pool.token1.id ?? farm.pool.token1.address
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
              farm1.eternalRewardToken.address &&
              item.address.toLowerCase() ===
                farm1.eternalRewardToken.address.toLowerCase(),
          );
          const farm1BonusRewardTokenPrice = rewardTokenPrices?.find(
            (item) =>
              farm1 &&
              farm1.eternalBonusRewardToken &&
              farm1.eternalBonusRewardToken.address &&
              item.address.toLowerCase() ===
                farm1.eternalBonusRewardToken.address.toLowerCase(),
          );
          const farm2RewardTokenPrice = rewardTokenPrices?.find(
            (item) =>
              farm2 &&
              farm2.eternalRewardToken &&
              farm2.eternalRewardToken.address &&
              item.address.toLowerCase() ===
                farm2.eternalRewardToken.address.toLowerCase(),
          );
          const farm2BonusRewardTokenPrice = rewardTokenPrices?.find(
            (item) =>
              farm2 &&
              farm2.eternalBonusRewardToken &&
              farm2.eternalBonusRewardToken.address &&
              item.address.toLowerCase() ===
                farm2.eternalBonusRewardToken.address.toLowerCase(),
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

  const [sortByGamma, setSortByGamma] = useState(v3FarmSortBy.pool);

  const [sortDescGamma, setSortDescGamma] = useState(false);

  const [sortByUnipilot, setSortByUnipilot] = useState(v3FarmSortBy.pool);

  const [sortDescUnipilot, setSortDescUnipilot] = useState(false);

  const [sortBySteer, setSortBySteer] = useState(v3FarmSortBy.pool);

  const [sortDescSteer, setSortDescSteer] = useState(false);

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

  const sortColumnsUnipilot = [
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

  const sortColumnsSteer = [
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

  const sortByDesktopItemsUnipilot = sortColumnsUnipilot.map((item) => {
    return {
      ...item,
      onClick: () => {
        if (sortByUnipilot === item.index) {
          setSortDescUnipilot(!sortDescUnipilot);
        } else {
          setSortByUnipilot(item.index);
          setSortDescUnipilot(false);
        }
      },
    };
  });

  const sortByDesktopItemsSteer = sortColumnsSteer.map((item) => {
    return {
      ...item,
      onClick: () => {
        if (sortBySteer === item.index) {
          setSortDescSteer(!sortBySteer);
        } else {
          setSortBySteer(item.index);
          setSortDescSteer(false);
        }
      },
    };
  });

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

  const stakedGammaFarms = allGammaPairsToFarm
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
    });

  const {
    loading: loadingGammaFarms,
    data: myGammaFarms,
  } = useGammaFarmsFiltered(
    stakedGammaFarms,
    chainId,
    search,
    undefined,
    sortByGamma,
    sortDescGamma,
  );

  const {
    data: myUnipilotFarmsData,
    loading: myUnipilotFarmsLoading,
  } = useUnipilotUserFarms(chainId, account);
  const myUnipilotFarms = myUnipilotFarmsData ?? [];

  const {
    loading: unipilotFarmDataLoading,
    data: unipilotFarmData,
  } = useUnipilotFarmData(
    myUnipilotFarms.map((farm: any) => farm.id),
    chainId,
  );

  const filteredUnipilotFarms = useUnipilotFilteredFarms(
    myUnipilotFarms,
    unipilotFarmData,
    undefined,
    search,
    sortByUnipilot,
    sortDescUnipilot,
  );

  const { data: steerFarmsArray } = useSteerStakingPools(chainId);
  const steerFarms = useMemo(() => {
    if (!steerFarmsArray) return [];
    return steerFarmsArray;
  }, [steerFarmsArray]);

  const {
    loading: mySteerFarmsLoading,
    data: mySteerFarms,
  } = useSteerStakedPools(chainId, account);

  const filteredSteerFarms = useSteerFilteredFarms(
    mySteerFarms ?? [],
    chainId,
    search,
    undefined,
    sortBySteer,
    sortDescSteer,
  );

  return (
    <Box mt={2}>
      {qsFarmAvailable && (
        <>
          <Divider />
          {shallowRewards.length ? (
            <Box px={2} my={2}>
              <h6>Unclaimed Rewards</h6>
              <Box my={2} className='flex'>
                {shallowRewards.map((reward, index) =>
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
        </>
      )}
      {qsFarmAvailable && (
        <>
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
                    {farmedNFTs.map((el: any, i) => {
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
        </>
      )}

      {allGammaFarms.length > 0 && (
        <Box my={2}>
          <Divider />
          <Box px={2} mt={2}>
            <h6>Gamma {t('farms')}</h6>
          </Box>
          {loadingGammaFarms ? (
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
                {myGammaFarms.map((farm: any) => {
                  return (
                    <Box mt={2} key={farm.address}>
                      <GammaFarmCard
                        token0={farm.token0}
                        token1={farm.token1}
                        data={farm}
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

      {myUnipilotFarms && myUnipilotFarms.length > 0 && (
        <Box my={2}>
          <Divider />
          <Box px={2} mt={2}>
            <h6>Unipilot {t('farms')}</h6>
          </Box>
          {myUnipilotFarmsLoading || unipilotFarmDataLoading ? (
            <Box py={5} className='flex justify-center'>
              <Loader stroke={'white'} size={'1.5rem'} />
            </Box>
          ) : chainId ? (
            <Box padding='24px'>
              {!isMobile && (
                <Box px={1.5}>
                  <Box width='90%'>
                    <SortColumns
                      sortColumns={sortByDesktopItemsUnipilot}
                      selectedSort={sortByUnipilot}
                      sortDesc={sortDescUnipilot}
                    />
                  </Box>
                </Box>
              )}
              <Box pb={2}>
                {filteredUnipilotFarms.map((farm: any) => {
                  return (
                    <Box mt={2} key={farm.address}>
                      <UnipilotFarmCard data={farm} />
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
      {steerFarms.length > 0 && (
        <Box my={2}>
          <Divider />
          <Box px={2} mt={2}>
            <h6>Steer {t('farms')}</h6>
          </Box>
          {mySteerFarmsLoading ? (
            <Box py={5} className='flex justify-center'>
              <Loader stroke={'white'} size={'1.5rem'} />
            </Box>
          ) : chainId && filteredSteerFarms.length > 0 ? (
            <Box padding='24px'>
              {!isMobile && (
                <Box px={1.5}>
                  <Box width='90%'>
                    <SortColumns
                      sortColumns={sortByDesktopItemsSteer}
                      selectedSort={sortBySteer}
                      sortDesc={sortDescSteer}
                    />
                  </Box>
                </Box>
              )}
              <Box pb={2}>
                {filteredSteerFarms.map((farm: any) => {
                  return (
                    <Box mt={2} key={farm.address}>
                      <SteerFarmCard data={farm} />
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ) : (
            <Box
              className='flex items-center justify-center'
              width='100%'
              height={100}
            >
              <p>{t('noSteerFarms')}</p>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
