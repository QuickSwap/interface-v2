import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Frown } from 'react-feather';
import { useActiveWeb3React } from 'hooks';
import Loader from '../Loader';
import { Deposit } from '../../models/interfaces';
import { FarmingType } from '../../models/enums';
import { Link, useLocation } from 'react-router-dom';
import './index.scss';
import FarmCard from './FarmCard';
import { Box, Divider } from '@material-ui/core';
import { useV3StakeData } from 'state/farms/hooks';
import { useFarmingSubgraph } from 'hooks/useIncentiveSubgraph';
import { useTranslation } from 'react-i18next';
import { GammaPair, GammaPairs, GlobalConst } from 'constants/index';
import SortColumns from 'components/SortColumns';
import { useQuery } from 'react-query';
import { getTokenFromAddress } from 'utils';
import { useSelectedTokenList } from 'state/lists/hooks';
import { Token } from '@uniswap/sdk';
import GammaFarmCard from './GammaFarmCard';
import { GAMMA_MASTERCHEF_ADDRESSES } from 'constants/v3/addresses';

export function FarmingMyFarms() {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();

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
    const _positions = shallowPositions.filter((v) => v.onFarmingCenter);
    return _positions.length > 0 ? _positions : [];
  }, [shallowPositions]);

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

  const { v3FarmSortBy } = GlobalConst.utils;

  const [sortByQuick, setSortByQuick] = useState(v3FarmSortBy.pool);

  const [sortDescQuick, setSortDescQuick] = useState(false);

  const [sortByGamma, setSortByGamma] = useState(v3FarmSortBy.pool);

  const [sortDescGamma, setSortDescGamma] = useState(false);

  const sortColumnsQuickSwap = [
    {
      text: t('pool'),
      index: v3FarmSortBy.pool,
      width: 0.5,
      justify: 'flex-start',
    },
    {
      text: t('poolAPR'),
      index: v3FarmSortBy.poolAPR,
      width: 0.15,
      justify: 'flex-start',
    },
    {
      text: t('farmAPR'),
      index: v3FarmSortBy.farmAPR,
      width: 0.15,
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
      width: 0.15,
      justify: 'flex-start',
    },
    {
      text: t('rewards'),
      index: v3FarmSortBy.rewards,
      width: 0.25,
      justify: 'flex-start',
    },
    {
      text: t('poolAPR'),
      index: v3FarmSortBy.poolAPR,
      width: 0.15,
      justify: 'flex-start',
    },
    {
      text: t('farmAPR'),
      index: v3FarmSortBy.farmAPR,
      width: 0.15,
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

  const fetchStakedData = async () => {
    if (!account) return;
    try {
      const data = await fetch(
        `https://gammawire.net/quickswap/polygon/userRewards2/${account}`,
      );
      const gammaData = await data.json();
      return gammaData ? gammaData.stakes : undefined;
    } catch (e) {
      console.log(e);
      return;
    }
  };

  const { isLoading: gammaStakesLoading, data: stakedData } = useQuery(
    'fetchStakedData',
    fetchStakedData,
    {
      refetchInterval: 30000,
    },
  );

  const fetchGammaData = async () => {
    try {
      const data = await fetch(
        `https://gammawire.net/quickswap/polygon/hypervisors/allData`,
      );
      const gammaData = await data.json();
      return gammaData;
    } catch (e) {
      console.log(e);
      return;
    }
  };

  const fetchGammaRewards = async () => {
    try {
      const data = await fetch(
        `https://gammawire.net/quickswap/polygon/allRewards2`,
      );
      const gammaData = await data.json();
      return gammaData;
    } catch (e) {
      console.log(e);
      return;
    }
  };

  const fetchGammaPositions = async () => {
    if (!account) return;
    try {
      const data = await fetch(
        `https://gammawire.net/quickswap/polygon/user/${account}`,
      );
      const positions = await data.json();
      return positions[account.toLowerCase()];
    } catch (e) {
      console.log(e);
      return;
    }
  };

  const { isLoading: positionsLoading, data: gammaPositions } = useQuery(
    'fetchGammaPositions',
    fetchGammaPositions,
    {
      refetchInterval: 30000,
    },
  );

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
  const tokenMap = useSelectedTokenList();
  const myGammaFarms = ([] as GammaPair[])
    .concat(...Object.values(GammaPairs))
    .filter((item) => {
      return (
        item.ableToFarm &&
        stakedData &&
        stakedData.filter(
          (data: any) =>
            data.hypervisor.toLowerCase() === item.address.toLowerCase(),
        ).length > 0
      );
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
        return 1;
      } else if (sortByGamma === v3FarmSortBy.poolAPR) {
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
        return poolAPR0 > poolAPR1
          ? sortMultiplierGamma
          : -1 * sortMultiplierGamma;
      } else if (sortByGamma === v3FarmSortBy.farmAPR) {
        const farmAPR0 =
          gammaReward0 && gammaReward0['apr'] ? Number(gammaReward0['apr']) : 0;
        const farmAPR1 =
          gammaReward1 && gammaReward1['apr'] ? Number(gammaReward1['apr']) : 0;
        return farmAPR0 > farmAPR1
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
              <Box px={3.5}>
                <Box width='85%'>
                  <SortColumns
                    sortColumns={sortByDesktopItemsQuick}
                    selectedSort={sortByQuick}
                    sortDesc={sortDescQuick}
                  />
                </Box>
              </Box>
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
        {gammaFarmsLoading ||
        positionsLoading ||
        gammaRewardsLoading ||
        gammaStakesLoading ? (
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
            <Box px={1.5}>
              <Box width='90%'>
                <SortColumns
                  sortColumns={sortByDesktopItemsGamma}
                  selectedSort={sortByGamma}
                  sortDesc={sortDescGamma}
                />
              </Box>
            </Box>
            <Box pb={2}>
              {myGammaFarms.map((farm) => (
                <Box mt={2} key={farm.address}>
                  <GammaFarmCard
                    token0={farm.token0}
                    token1={farm.token1}
                    pairData={farm}
                    positionData={
                      gammaPositions
                        ? gammaPositions[farm.address.toLowerCase()]
                        : undefined
                    }
                    data={
                      gammaData
                        ? gammaData[farm.address.toLowerCase()]
                        : undefined
                    }
                    rewardData={
                      gammaRewards &&
                      gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[chainId]] &&
                      gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[chainId]]['pools']
                        ? gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[chainId]][
                            'pools'
                          ][farm.address.toLowerCase()]
                        : undefined
                    }
                    stakedData={stakedData.filter(
                      (data: any) =>
                        data.hypervisor.toLowerCase() ===
                        farm.address.toLowerCase(),
                    )}
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
}
