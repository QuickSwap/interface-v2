import {
  CurrencyAmount,
  JSBI,
  Token,
  TokenAmount,
  Pair,
  ChainId,
} from '@uniswap/sdk';
import dayjs from 'dayjs';
import { useMemo, useEffect, useState } from 'react';
import { usePairs } from 'data/Reserves';
import { GlobalConst, GlobalValue } from 'constants/index';
import {
  STAKING_REWARDS_INTERFACE,
  STAKING_DUAL_REWARDS_INTERFACE,
} from 'constants/abis/staking-rewards';
import { useActiveWeb3React } from 'hooks';
import {
  CallState,
  NEVER_RELOAD,
  useMultipleContractSingleData,
  useSingleCallResult,
} from 'state/multicall/hooks';
import { tryParseAmount } from 'state/swap/hooks';
import Web3 from 'web3';
import {
  useLairContract,
  useNewLairContract,
  useNewQUICKContract,
  useQUICKContract,
} from 'hooks/useContract';
import {
  useUSDCPrices,
  useUSDCPricesFromAddresses,
  useUSDCPricesToken,
} from 'utils/useUSDCPrice';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { useTotalSupplys } from 'data/TotalSupply';
import {
  getDaysCurrentYear,
  getFarmLPToken,
  getOneYearFee,
  getSyrupLPToken,
  initTokenAmountFromCallResult,
  getCallStateResult,
} from 'utils';

import {
  SyrupInfo,
  LairInfo,
  StakingInfo,
  DualStakingInfo,
  StakingBasic,
  DualStakingBasic,
} from 'types/index';
import { useDefaultFarmList } from 'state/farms/hooks';
import { useDefaultDualFarmList } from 'state/dualfarms/hooks';
import { useDefaultSyrupList } from 'state/syrups/hooks';
import { Contract } from '@ethersproject/contracts';
import {
  DLDQUICK,
  DLQUICK,
  EMPTY,
  LAIR_ADDRESS,
  NEW_LAIR_ADDRESS,
  NEW_QUICK,
  OLD_DQUICK,
  OLD_QUICK,
} from 'constants/v3/addresses';
import { getConfig } from '../../config/index';
import { useDefaultCNTFarmList } from 'state/cnt/hooks';
import { useQuery } from '@tanstack/react-query';

const web3 = new Web3('https://polygon-rpc.com/');

export const STAKING_GENESIS = 1620842940;

export const REWARDS_DURATION_DAYS = 7;

let pairs: any = undefined;

let oneDayVol: any = undefined;

export function useTotalRewardsDistributed(
  chainId: ChainId,
): number | undefined {
  const allSyrupRewardsInfo = Object.values(useDefaultSyrupList()[chainId]);
  const dualStakingRewardsInfo = Object.values(
    useDefaultDualFarmList()[chainId],
  ).filter((x) => !x.ended);
  const stakingRewardsInfo = Object.values(
    useDefaultFarmList()[chainId],
  ).filter((x) => !x.ended);
  const currentTimestamp = dayjs().unix();

  const syrupRewardsInfo = allSyrupRewardsInfo.filter(
    (x) => x.ending > currentTimestamp && !x.ended,
  );

  const tokenAddresses = syrupRewardsInfo
    .map((item) => item.token.address)
    .concat(dualStakingRewardsInfo.map((item) => item.rewardTokenA.address))
    .concat(dualStakingRewardsInfo.map((item) => item.rewardTokenB.address))
    .concat(stakingRewardsInfo.map((item) => item.rewardToken.address))
    .filter(
      (address, index, self) =>
        address &&
        self.findIndex(
          (item) =>
            item && address && item.toLowerCase() === address.toLowerCase(),
        ) === index,
    );
  const { prices: usdTokenPrices } = useUSDCPricesFromAddresses(tokenAddresses);
  const syrupRewardsUSD = usdTokenPrices
    ? syrupRewardsInfo.reduce((total, item, index) => {
        const usdPriceToken = usdTokenPrices.find(
          (price) =>
            price.address.toLowerCase() === item.token.address.toLowerCase(),
        );
        return total + (usdPriceToken ? usdPriceToken.price : 0) * item.rate;
      }, 0)
    : undefined;

  const dualStakingRewardsUSD = usdTokenPrices
    ? dualStakingRewardsInfo.reduce((total, item) => {
        const rewardTokenAPrice = usdTokenPrices.find(
          (price) =>
            price.address.toLowerCase() ===
            item.rewardTokenA.address.toLowerCase(),
        );
        const rewardTokenBPrice = usdTokenPrices.find(
          (price) =>
            price.address.toLowerCase() ===
            item.rewardTokenB.address.toLowerCase(),
        );
        return (
          total +
          item.rateA * (rewardTokenAPrice ? rewardTokenAPrice.price : 0) +
          item.rateB * (rewardTokenBPrice ? rewardTokenBPrice.price : 0)
        );
      }, 0)
    : undefined;

  const stakingRewardsUSD = usdTokenPrices
    ? stakingRewardsInfo.reduce((total, item, index) => {
        const rewardTokenPrice = usdTokenPrices.find(
          (price) =>
            price.address.toLowerCase() ===
            item.rewardToken.address.toLowerCase(),
        );
        return (
          total + item.rate * (rewardTokenPrice ? rewardTokenPrice.price : 0)
        );
      }, 0)
    : undefined;

  return syrupRewardsUSD && dualStakingRewardsUSD && stakingRewardsUSD
    ? syrupRewardsUSD + dualStakingRewardsUSD + stakingRewardsUSD
    : 0;
}

export function useUSDRewardsandFees(
  isLPFarm: boolean,
  bulkPairData: any,
  chainId: ChainId,
): { rewardsUSD: number; stakingFees: number | null } {
  const activeFarms = Object.values(useDefaultFarmList()[chainId]).filter(
    (x) => !x.ended,
  );
  const activeDualFarms = Object.values(
    useDefaultDualFarmList()[chainId],
  ).filter((x) => !x.ended);
  const stakingRewardsInfo = isLPFarm ? activeFarms : [];
  const dualStakingRewardsInfo = !isLPFarm ? activeDualFarms : [];
  const rewardsInfos = isLPFarm ? stakingRewardsInfo : dualStakingRewardsInfo;
  const rewardsAddresses = useMemo(
    () => rewardsInfos.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [rewardsInfos],
  );
  const stakingRewardTokens = stakingRewardsInfo.map(
    (item) => item.rewardToken,
  );
  const stakingRewardTokenPrices = useUSDCPricesToken(
    stakingRewardTokens,
    chainId,
  );
  const dualStakingRewardTokenAPrices = useUSDCPricesToken(
    dualStakingRewardsInfo.map((item) => item.rewardTokenA),
    chainId,
  );
  const dualStakingRewardTokenBPrices = useUSDCPricesToken(
    dualStakingRewardsInfo.map((item) => item.rewardTokenB),
    chainId,
  );
  const rewardPairs = useMemo(() => rewardsInfos.map(({ pair }) => pair), [
    rewardsInfos,
  ]);
  const totalSupplies = useMultipleContractSingleData(
    rewardsAddresses,
    isLPFarm ? STAKING_REWARDS_INTERFACE : STAKING_DUAL_REWARDS_INTERFACE,
    'totalSupply',
  );
  let rewardsUSD: number | null = null;
  if (isLPFarm) {
    rewardsUSD = stakingRewardsInfo.reduce(
      (total, item, index) =>
        total + item.rate * stakingRewardTokenPrices[index],
      0,
    );
  } else {
    rewardsUSD = dualStakingRewardsInfo.reduce(
      (total, item, index) =>
        total +
        item.rateA * dualStakingRewardTokenAPrices[index] +
        item.rateB * dualStakingRewardTokenBPrices[index],
      0,
    );
  }
  const stakingFees = bulkPairData
    ? rewardPairs.reduce((total, pair, index) => {
        const oneYearFeeAPY = Number(bulkPairData[pair]?.oneDayVolumeUSD ?? 0);
        const totalSupplyState = totalSupplies[index];
        if (oneYearFeeAPY) {
          const totalSupply = web3.utils.toWei(
            pairs[pair]?.totalSupply,
            'ether',
          );
          const ratio =
            Number(totalSupplyState.result?.[0].toString()) /
            Number(totalSupply);
          const oneDayFee =
            oneYearFeeAPY * GlobalConst.utils.FEEPERCENT * ratio;
          return total + oneDayFee;
        } else {
          return total;
        }
      }, 0)
    : null;

  return { rewardsUSD, stakingFees };
}

export function useFilteredSyrupInfo(
  chainId: ChainId,
  tokenToFilterBy?: Token | null,
  startIndex?: number,
  endIndex?: number,
  filter?: { search: string; isStaked: boolean },
): SyrupInfo[] {
  const { account } = useActiveWeb3React();
  const currentTimestamp = dayjs().unix();
  const allSyrups = useDefaultSyrupList()[chainId];
  const info = useMemo(
    () =>
      Object.values(allSyrups)
        .sort((a, b) =>
          a.stakingInfo.sponsored ? 1 : b.stakingInfo.sponsored ? -1 : 1,
        )
        .filter(
          (syrupInfo) =>
            syrupInfo.ending > currentTimestamp &&
            !syrupInfo.ended &&
            (tokenToFilterBy === undefined || tokenToFilterBy === null
              ? getSearchFiltered(syrupInfo, filter ? filter.search : '')
              : tokenToFilterBy.equals(syrupInfo.token)),
        )
        .slice(startIndex, endIndex),
    [
      tokenToFilterBy,
      startIndex,
      endIndex,
      filter,
      currentTimestamp,
      allSyrups,
    ],
  );

  const rewardsAddresses = useMemo(
    () => info.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [info],
  );

  const accountArg = useMemo(() => [account ?? undefined], [account]);

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'balanceOf',
    accountArg,
  );
  const earnedAmounts = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'earned',
    accountArg,
  );
  const totalSupplies = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'totalSupply',
  );

  const { prices: usdTokenPrices } = useUSDCPricesFromAddresses(
    info.map((item) => item.token.address),
  );

  const { prices: stakingTokenPrices } = useUSDCPricesFromAddresses(
    info.map((item) => item.stakingToken.address),
  );

  return useMemo(() => {
    if (!chainId) return [];

    return rewardsAddresses.reduce<SyrupInfo[]>(
      (memo, rewardsAddress, index) => {
        // these two are dependent on account
        const balanceState = balances[index];
        const earnedAmountState = earnedAmounts[index];

        // these get fetched regardless of account
        const totalSupplyState = totalSupplies[index];
        const syrupInfo = info[index];
        const stakingTokenPrice = stakingTokenPrices?.find(
          (item) =>
            item.address.toLowerCase() ===
            syrupInfo.stakingToken.address.toLowerCase(),
        );

        if (
          // these may be undefined if not logged in
          !balanceState?.loading &&
          !earnedAmountState?.loading &&
          // always need these
          totalSupplyState &&
          !totalSupplyState.loading
        ) {
          // get the LP token
          const token = syrupInfo.token;
          const usdPriceToken = usdTokenPrices?.find(
            (item) =>
              item.address.toLowerCase() ===
              syrupInfo.token.address.toLowerCase(),
          );
          const priceOfRewardTokenInUSD = usdPriceToken
            ? usdPriceToken.price
            : 0;

          const rewards = syrupInfo.rate * (priceOfRewardTokenInUSD ?? 0);

          // check for account, if no account set to 0
          const rate = web3.utils.toWei(syrupInfo.rate.toString());
          const syrupToken = getSyrupLPToken(syrupInfo);
          const stakedAmount = initTokenAmountFromCallResult(
            syrupToken,
            balanceState,
          );
          const totalStakedAmount = initTokenAmountFromCallResult(
            syrupToken,
            totalSupplyState,
          );
          const totalRewardRate = new TokenAmount(token, JSBI.BigInt(rate));
          //const pair = info[index].pair.toLowerCase();
          //const fees = (pairData && pairData[pair] ? pairData[pair].oneDayVolumeUSD * 0.0025: 0);

          const getHypotheticalRewardRate = (
            stakedAmount?: TokenAmount,
            totalStakedAmount?: TokenAmount,
          ): TokenAmount | undefined => {
            if (!stakedAmount || !totalStakedAmount) return;
            return new TokenAmount(
              token,
              JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
                ? JSBI.divide(
                    JSBI.multiply(totalRewardRate.raw, stakedAmount.raw),
                    totalStakedAmount.raw,
                  )
                : JSBI.BigInt(0),
            );
          };

          const individualRewardRate = getHypotheticalRewardRate(
            stakedAmount,
            totalStakedAmount,
          );

          const periodFinishMs = syrupInfo.ending;

          memo.push({
            stakingRewardAddress: rewardsAddress,
            token: syrupInfo.token,
            ended: syrupInfo.ended,
            name: syrupInfo.name,
            lp: syrupInfo.lp,
            periodFinish: periodFinishMs,
            earnedAmount: initTokenAmountFromCallResult(
              token,
              earnedAmountState,
            ),
            rewardRate: individualRewardRate,
            totalRewardRate: totalRewardRate,
            stakedAmount: stakedAmount,
            totalStakedAmount: totalStakedAmount,
            getHypotheticalRewardRate,
            baseToken: syrupInfo.baseToken,
            rate: syrupInfo.rate,
            rewardTokenPriceinUSD: priceOfRewardTokenInUSD,
            rewards,
            stakingToken: syrupInfo.stakingToken,
            valueOfTotalStakedAmountInUSDC: totalStakedAmount
              ? Number(totalStakedAmount.toExact()) *
                (stakingTokenPrice ? stakingTokenPrice.price : 0)
              : undefined,
            sponsored: syrupInfo.stakingInfo.sponsored,
            sponsorLink: syrupInfo.stakingInfo.link,
          });
        }
        return memo;
      },
      [],
    );
  }, [
    chainId,
    rewardsAddresses,
    balances,
    earnedAmounts,
    totalSupplies,
    info,
    stakingTokenPrices,
    usdTokenPrices,
  ]).filter((syrupInfo) =>
    filter && filter.isStaked
      ? syrupInfo.stakedAmount && syrupInfo.stakedAmount.greaterThan('0')
      : true,
  );
}

export function useOldSyrupInfo(
  chainId: ChainId,
  tokenToFilterBy?: Token | null,
  startIndex?: number,
  endIndex?: number,
  filter?: { search: string; isStaked: boolean },
): SyrupInfo[] {
  const { account } = useActiveWeb3React();
  const currentTimestamp = dayjs().unix();
  const allOldSyrupInfos = useDefaultSyrupList()[chainId];

  const info = useMemo(() => {
    return Object.values(allOldSyrupInfos)
      .filter((x) => x.ending <= currentTimestamp || x.ended)
      .slice(startIndex, endIndex)
      .filter((syrupInfo) =>
        tokenToFilterBy === undefined || tokenToFilterBy === null
          ? getSearchFiltered(syrupInfo, filter ? filter.search : '')
          : tokenToFilterBy.equals(syrupInfo.token),
      );
  }, [
    tokenToFilterBy,
    startIndex,
    endIndex,
    filter,
    currentTimestamp,
    allOldSyrupInfos,
  ]);

  const rewardsAddresses = useMemo(
    () => info.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [info],
  );

  const accountArg = useMemo(() => [account ?? undefined], [account]);

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'balanceOf',
    accountArg,
  );
  const earnedAmounts = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'earned',
    accountArg,
  );
  const totalSupplies = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'totalSupply',
  );

  const stakingTokenPairs = usePairs(
    info.map((item) => [
      unwrappedToken(item.token),
      unwrappedToken(item.baseToken),
    ]),
  );

  const usdBaseTokenPrices = useUSDCPrices(
    info.map((item) => unwrappedToken(item.baseToken)),
  );

  const stakingTokenPrices = useUSDCPricesToken(
    info.map((item) => item.stakingToken),
    chainId,
  );

  return useMemo(() => {
    if (!chainId) return [];

    return rewardsAddresses.reduce<SyrupInfo[]>(
      (memo, rewardsAddress, index) => {
        // these two are dependent on account
        const balanceState = balances[index];
        const earnedAmountState = earnedAmounts[index];

        // these get fetched regardless of account
        const totalSupplyState = totalSupplies[index];
        const syrupInfo = info[index];
        const stakingTokenPrice = stakingTokenPrices[index];

        if (
          // these may be undefined if not logged in
          !balanceState?.loading &&
          !earnedAmountState?.loading &&
          // always need these
          totalSupplyState &&
          !totalSupplyState.loading
        ) {
          // get the LP token
          const token = syrupInfo.token;

          // check for account, if no account set to 0
          const rate = web3.utils.toWei(syrupInfo.rate.toString());
          const stakedAmount = initTokenAmountFromCallResult(
            getSyrupLPToken(syrupInfo),
            balanceState,
          );
          const totalStakedAmount = initTokenAmountFromCallResult(
            getSyrupLPToken(syrupInfo),
            totalSupplyState,
          );
          const totalRewardRate = new TokenAmount(token, JSBI.BigInt(rate));
          //const pair = info[index].pair.toLowerCase();
          //const fees = (pairData && pairData[pair] ? pairData[pair].oneDayVolumeUSD * 0.0025: 0);

          const getHypotheticalRewardRate = (
            stakedAmount?: TokenAmount,
            totalStakedAmount?: TokenAmount,
          ): TokenAmount | undefined => {
            if (!stakedAmount || !totalStakedAmount) return;
            return new TokenAmount(
              token,
              JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
                ? JSBI.divide(
                    JSBI.multiply(totalRewardRate.raw, stakedAmount.raw),
                    totalStakedAmount.raw,
                  )
                : JSBI.BigInt(0),
            );
          };

          const individualRewardRate = getHypotheticalRewardRate(
            stakedAmount,
            totalStakedAmount,
          );

          const periodFinishMs = syrupInfo.ending;

          const [, stakingTokenPair] = stakingTokenPairs[index];
          const tokenPairPrice = stakingTokenPair?.priceOf(token);
          const usdPriceBaseToken = usdBaseTokenPrices[index];
          const priceOfRewardTokenInUSD =
            Number(tokenPairPrice?.toSignificant()) *
            Number(usdPriceBaseToken?.toSignificant());

          memo.push({
            stakingRewardAddress: rewardsAddress,
            token: syrupInfo.token,
            ended: true,
            name: syrupInfo.name,
            lp: syrupInfo.lp,
            periodFinish: periodFinishMs,
            earnedAmount: initTokenAmountFromCallResult(
              token,
              earnedAmountState,
            ),
            rewardRate: individualRewardRate,
            totalRewardRate: totalRewardRate,
            stakedAmount: stakedAmount,
            totalStakedAmount: totalStakedAmount,
            getHypotheticalRewardRate,
            baseToken: syrupInfo.baseToken,
            rate: 0,
            rewardTokenPriceinUSD: priceOfRewardTokenInUSD,
            stakingToken: syrupInfo.stakingToken,
            valueOfTotalStakedAmountInUSDC: totalStakedAmount
              ? Number(totalStakedAmount.toExact()) * stakingTokenPrice
              : undefined,
            sponsored: syrupInfo.stakingInfo.sponsored,
            sponsorLink: syrupInfo.stakingInfo.link,
          });
        }
        return memo;
      },
      [],
    );
  }, [
    balances,
    chainId,
    earnedAmounts,
    info,
    rewardsAddresses,
    totalSupplies,
    stakingTokenPairs,
    usdBaseTokenPrices,
    stakingTokenPrices,
  ]).filter((syrupInfo) =>
    filter && filter.isStaked
      ? syrupInfo.stakedAmount && syrupInfo.stakedAmount.greaterThan('0')
      : true,
  );
}

export const getBulkPairData = async (
  chainId: ChainId,
  pairListStr: string,
) => {
  const res = await fetch(
    `${process.env.REACT_APP_LEADERBOARD_APP_URL}/utils/bulk-pair-data?chainId=${chainId}&addresses=${pairListStr}`,
  );
  if (!res.ok) {
    return;
  }
  const data = await res.json();
  if (data && data.data) {
    const items = data.data.map((item: any) => item.pairData);
    const objects = convertArrayToObject(items, 'id');
    if (Object.keys(objects).length > 0) {
      pairs = objects;
      return objects;
    }
    return objects;
  }
  return;
};

const getOneDayVolume = async (version: string, chainId: ChainId) => {
  const res = await fetch(
    `${process.env.REACT_APP_LEADERBOARD_APP_URL}/utils/oneDayVolume?chainId=${chainId}`,
  );
  if (!res.ok) {
    return;
  }

  const data = await res.json();
  if (!data || !data.data) return;

  const oneDayVolume = version === 'v2' ? data.data.v2 : data.data.v3;
  oneDayVol = oneDayVolume;

  return oneDayVolume;
};

const convertArrayToObject = (array: any, key: any) => {
  const initialValue = {};
  return array.reduce((obj: any, item: any) => {
    return {
      ...obj,
      [item[key]]: item,
    };
  }, initialValue);
};

function getSearchFiltered(info: any, search: string) {
  const searchLowered = search.toLowerCase();
  if (info.tokens) {
    const infoToken0 = info.tokens[0];
    const infoToken1 = info.tokens[1];
    return (
      (infoToken0.symbol ?? '').toLowerCase().indexOf(searchLowered) > -1 ||
      (infoToken0.name ?? '').toLowerCase().indexOf(searchLowered) > -1 ||
      (infoToken0.address ?? '').toLowerCase().indexOf(searchLowered) > -1 ||
      (infoToken1.symbol ?? '').toLowerCase().indexOf(searchLowered) > -1 ||
      (infoToken1.name ?? '').toLowerCase().indexOf(searchLowered) > -1 ||
      (infoToken1.address ?? '').toLowerCase().indexOf(searchLowered) > -1
    );
  } else if (info.token) {
    return (
      (info.token.symbol ?? '').toLowerCase().indexOf(searchLowered) > -1 ||
      (info.token.name ?? '').toLowerCase().indexOf(searchLowered) > -1 ||
      (info.token.address ?? '').toLowerCase().indexOf(searchLowered) > -1
    );
  } else {
    return false;
  }
}

export function getStakingFees(
  stakingInfo: StakingBasic | DualStakingBasic,
  balanceState?: CallState,
  totalSupplyState?: CallState,
) {
  let oneYearFeeAPY = 0;
  let oneDayFee = 0;
  let accountFee = 0;
  if (pairs !== undefined) {
    oneYearFeeAPY = pairs[stakingInfo.pair]?.oneDayVolumeUSD;
    const balanceResult = getCallStateResult(balanceState);
    const totalSupplyResult = getCallStateResult(totalSupplyState);

    if (oneYearFeeAPY && balanceResult && totalSupplyResult) {
      const totalSupply = web3.utils.toWei(
        pairs[stakingInfo.pair]?.totalSupply,
        'ether',
      );
      const ratio = Number(totalSupplyResult) / Number(totalSupply);
      const myRatio = Number(balanceResult) / Number(totalSupplyResult);
      oneDayFee = oneYearFeeAPY * GlobalConst.utils.FEEPERCENT * ratio;
      accountFee = oneDayFee * myRatio;
      oneYearFeeAPY = getOneYearFee(
        oneYearFeeAPY,
        pairs[stakingInfo.pair]?.reserveUSD,
      );
    }
  }
  return { oneYearFeeAPY, oneDayFee, accountFee };
}

const getHypotheticalRewardRate = (
  token: Token,
  stakedAmount?: TokenAmount,
  totalStakedAmount?: TokenAmount,
  totalRewardRate?: TokenAmount,
): TokenAmount | undefined => {
  if (!stakedAmount || !totalStakedAmount || !totalRewardRate) return;
  return new TokenAmount(
    token,
    JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
      ? JSBI.divide(
          JSBI.multiply(totalRewardRate.raw, stakedAmount.raw),
          totalStakedAmount.raw,
        )
      : JSBI.BigInt(0),
  );
};

export function useCNTStakingInfo(
  chainId: ChainId,
  pairToFilterBy?: Pair | null,
  startIndex?: number,
  endIndex?: number,
  filter?: { search: string; isStaked: boolean; isEndedFarm: boolean },
): Array<DualStakingInfo | StakingInfo> {
  const { account } = useActiveWeb3React();
  const activeFarms = useDefaultCNTFarmList(chainId)[chainId];

  const info = useMemo(
    () =>
      Object.values(activeFarms)
        .filter((x) => (filter?.isEndedFarm ? x.ended : !x.ended))
        .sort((a, b) =>
          a.stakingInfo.sponsored ? 1 : b.stakingInfo.sponsored ? -1 : 1,
        )
        .filter((stakingRewardInfo) =>
          pairToFilterBy === undefined || pairToFilterBy === null
            ? getSearchFiltered(stakingRewardInfo, filter ? filter.search : '')
            : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
              pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1]),
        )
        .slice(startIndex, endIndex),
    [pairToFilterBy, startIndex, endIndex, filter, activeFarms],
  );

  const rewardsAddresses = useMemo(
    () => info.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [info],
  );

  const accountArg = useMemo(() => [account ?? undefined], [account]);

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'balanceOf',
    accountArg,
  );

  const earnedAmounts = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'earned',
    accountArg,
  );
  const totalSupplies = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'totalSupply',
  );

  const rewardRates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'rewardRate',
    undefined,
    NEVER_RELOAD,
  );

  const baseTokens = info.map((item) => {
    const unwrappedCurrency = unwrappedToken(item.baseToken);
    const empty = EMPTY[chainId];
    return unwrappedCurrency === empty ? item.tokens[0] : item.baseToken;
  });

  const rewardTokens = info.map((item) => item.rewardToken);

  const usdPrices = useUSDCPrices(baseTokens);
  const usdPricesRewardTokens = useUSDCPricesToken(rewardTokens, chainId);
  const totalSupplys = useTotalSupplys(
    info.map((item) => {
      const lp = item.lp;
      const dummyPair = new Pair(
        new TokenAmount(item.tokens[0], '0'),
        new TokenAmount(item.tokens[1], '0'),
      );
      return lp && lp !== ''
        ? new Token(137, lp, 18, 'SLP', 'Staked LP')
        : dummyPair.liquidityToken;
    }),
  );
  const stakingPairs = usePairs(info.map((item) => item.tokens));

  return useMemo(() => {
    if (!chainId) return [];

    return rewardsAddresses.reduce<StakingInfo[]>(
      (memo, rewardsAddress, index) => {
        // these two are dependent on account
        const balanceState = balances[index];
        const earnedAmountState = earnedAmounts[index];

        // these get fetched regardless of account
        const totalSupplyState = totalSupplies[index];
        const rewardRateState = rewardRates[index];
        const stakingInfo = info[index];
        const rewardTokenPrice = usdPricesRewardTokens[index];

        if (
          // these may be undefined if not logged in
          !balanceState?.loading &&
          !earnedAmountState?.loading &&
          // always need these
          totalSupplyState &&
          !totalSupplyState.loading &&
          rewardRateState &&
          !rewardRateState.loading
        ) {
          const rate = web3.utils.toWei(stakingInfo.rate.toString());
          const lpFarmToken = getFarmLPToken(stakingInfo);
          const stakedAmount = initTokenAmountFromCallResult(
            lpFarmToken,
            balanceState,
          );
          const totalStakedAmount = initTokenAmountFromCallResult(
            lpFarmToken,
            totalSupplyState,
          );

          // Previously Uni was used all over the place (which was an abstract to get the quick token)
          // These rates are just used for informational purposes and the token should should not be used anywhere
          // instead we will supply a dummy token, until this can be refactored properly.
          const dummyToken = NEW_QUICK[chainId];
          const totalRewardRate = new TokenAmount(
            dummyToken,
            JSBI.BigInt(rate),
          );
          const totalRewardRate01 = initTokenAmountFromCallResult(
            dummyToken,
            rewardRateState,
          );

          const individualRewardRate = getHypotheticalRewardRate(
            dummyToken,
            stakedAmount,
            totalStakedAmount,
            totalRewardRate01,
          );

          const { oneYearFeeAPY, oneDayFee, accountFee } = getStakingFees(
            stakingInfo,
            balanceState,
            totalSupplyState,
          );

          let valueOfTotalStakedAmountInBaseToken: TokenAmount | undefined;

          const [, stakingTokenPair] = stakingPairs[index];
          const totalSupply = totalSupplys[index];
          const usdPrice = usdPrices[index];

          if (
            totalSupply &&
            stakingTokenPair &&
            baseTokens[index] &&
            totalStakedAmount
          ) {
            // take the total amount of LP tokens staked, multiply by ETH value of all LP tokens, divide by all LP tokens
            valueOfTotalStakedAmountInBaseToken = new TokenAmount(
              baseTokens[index],
              JSBI.divide(
                JSBI.multiply(
                  JSBI.multiply(
                    totalStakedAmount.raw,
                    stakingTokenPair.reserveOf(baseTokens[index]).raw,
                  ),
                  JSBI.BigInt(2), // this is b/c the value of LP shares are ~double the value of the WETH they entitle owner to
                ),
                totalSupply.raw,
              ),
            );
          }

          const valueOfTotalStakedAmountInUSDC =
            valueOfTotalStakedAmountInBaseToken &&
            usdPrice?.quote(valueOfTotalStakedAmountInBaseToken);

          const tvl = valueOfTotalStakedAmountInUSDC
            ? valueOfTotalStakedAmountInUSDC.toExact()
            : valueOfTotalStakedAmountInBaseToken?.toExact();

          const perMonthReturnInRewards =
            (Number(stakingInfo.rate) *
              rewardTokenPrice *
              (getDaysCurrentYear() / 12)) /
            Number(valueOfTotalStakedAmountInUSDC?.toExact());

          memo.push({
            stakingRewardAddress: rewardsAddress,
            tokens: stakingInfo.tokens,
            ended: stakingInfo.ended,
            name: stakingInfo.name,
            lp: stakingInfo.lp,
            rewardToken: stakingInfo.rewardToken,
            rewardTokenPrice,
            earnedAmount: initTokenAmountFromCallResult(
              dummyToken,
              earnedAmountState,
            ),
            rewardRate: individualRewardRate,
            totalRewardRate: totalRewardRate,
            stakedAmount: stakedAmount,
            totalStakedAmount: totalStakedAmount,
            baseToken: stakingInfo.baseToken,
            pair: stakingInfo.pair,
            rate: stakingInfo.rate,
            oneYearFeeAPY: oneYearFeeAPY,
            oneDayFee,
            accountFee,
            tvl,
            perMonthReturnInRewards,
            valueOfTotalStakedAmountInBaseToken,
            usdPrice,
            stakingTokenPair,
            totalSupply,
            sponsored: stakingInfo.stakingInfo.sponsored,
            sponsorLink: stakingInfo.stakingInfo.link,
          });
        }
        return memo;
      },
      [],
    );
  }, [
    balances,
    chainId,
    earnedAmounts,
    info,
    rewardsAddresses,
    totalSupplies,
    rewardRates,
    usdPricesRewardTokens,
    baseTokens,
    totalSupplys,
    usdPrices,
    stakingPairs,
  ]).filter((stakingInfo) =>
    filter && filter.isStaked
      ? stakingInfo.stakedAmount && stakingInfo.stakedAmount.greaterThan('0')
      : true,
  );
}

// gets the dual rewards staking info from the network for the active chain id
export function useDualStakingInfo(
  chainId: ChainId,
  pairToFilterBy?: Pair | null,
  startIndex?: number,
  endIndex?: number,
  filter?: { search: string; isStaked: boolean; isEndedFarm: boolean },
): DualStakingInfo[] {
  const { account } = useActiveWeb3React();
  const dualStakingRewardsInfo = useDefaultDualFarmList();

  const info = useMemo(
    () =>
      Object.values(dualStakingRewardsInfo[chainId])
        .filter((x) => (filter?.isEndedFarm ? x.ended : !x.ended))
        .sort((a, b) =>
          a.stakingInfo.sponsored ? 1 : b.stakingInfo.sponsored ? -1 : 1,
        )
        .filter((stakingRewardInfo) =>
          pairToFilterBy === undefined || pairToFilterBy === null
            ? getSearchFiltered(stakingRewardInfo, filter ? filter.search : '')
            : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
              pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1]),
        )
        .slice(startIndex, endIndex),
    [
      chainId,
      pairToFilterBy,
      startIndex,
      endIndex,
      filter,
      dualStakingRewardsInfo,
    ],
  );

  const rewardsAddresses = useMemo(
    () => info.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [info],
  );

  const accountArg = useMemo(() => [account ?? undefined], [account]);

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_DUAL_REWARDS_INTERFACE,
    'balanceOf',
    accountArg,
  );
  const earnedAAmounts = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_DUAL_REWARDS_INTERFACE,
    'earnedA',
    accountArg,
  );
  const earnedBAmounts = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_DUAL_REWARDS_INTERFACE,
    'earnedB',
    accountArg,
  );
  const totalSupplies = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_DUAL_REWARDS_INTERFACE,
    'totalSupply',
  );
  const rewardRatesA = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_DUAL_REWARDS_INTERFACE,
    'rewardRateA',
    undefined,
    NEVER_RELOAD,
  );

  const rewardRatesB = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_DUAL_REWARDS_INTERFACE,
    'rewardRateB',
    undefined,
    NEVER_RELOAD,
  );

  const baseTokens = info.map((item) => {
    const unwrappedCurrency = unwrappedToken(item.baseToken);
    const empty = unwrappedToken(EMPTY[chainId]);
    return unwrappedCurrency === empty ? item.tokens[0] : item.baseToken;
  });

  const usdPrices = useUSDCPrices(baseTokens);
  const totalSupplys = useTotalSupplys(
    info.map((item) => getFarmLPToken(item)),
  );
  const stakingPairs = usePairs(info.map((item) => item.tokens));
  const rewardTokenAPrices = useUSDCPricesToken(
    info.map((item) => item.rewardTokenA),
    chainId,
  );
  const rewardTokenBPrices = useUSDCPricesToken(
    info.map((item) => item.rewardTokenB),
    chainId,
  );

  return useMemo(() => {
    if (!chainId) return [];

    return rewardsAddresses.reduce<DualStakingInfo[]>(
      (memo, rewardsAddress, index) => {
        // these two are dependent on account
        const balanceState = balances[index];
        const earnedAAmountState = earnedAAmounts[index];
        const earnedBAmountState = earnedBAmounts[index];

        // these get fetched regardless of account
        const totalSupplyState = totalSupplies[index];
        const rewardRateAState = rewardRatesA[index];
        const rewardRateBState = rewardRatesB[index];
        const stakingInfo = info[index];
        const rewardTokenAPrice = rewardTokenAPrices[index];
        const rewardTokenBPrice = rewardTokenBPrices[index];

        if (
          // these may be undefined if not logged in
          !balanceState?.loading &&
          !earnedAAmountState?.loading &&
          !earnedBAmountState?.loading &&
          // always need these
          totalSupplyState &&
          !totalSupplyState.loading &&
          rewardRateAState &&
          !rewardRateAState.loading &&
          rewardRateBState
        ) {
          const rateA = web3.utils.toWei(stakingInfo.rateA.toString());
          const rateB = web3.utils.toWei(stakingInfo.rateB.toString());
          const lpFarmToken = getFarmLPToken(stakingInfo);
          const stakedAmount = initTokenAmountFromCallResult(
            lpFarmToken,
            balanceState,
          );
          const totalStakedAmount = initTokenAmountFromCallResult(
            lpFarmToken,
            totalSupplyState,
          );

          // Previously Uni was used all over the place (which was an abstract to get the quick token)
          // These rates are just used for informational purposes and the token should should not be used anywhere
          // instead we will supply a dummy token, until this can be refactored properly.
          const dummyToken = NEW_QUICK[chainId];
          const totalRewardRateA = new TokenAmount(
            dummyToken,
            JSBI.BigInt(stakingInfo.ended ? 0 : rateA),
          );
          const totalRewardRateB = new TokenAmount(
            dummyToken,
            JSBI.BigInt(stakingInfo.ended ? 0 : rateB),
          );
          //const pair = info[index].pair.toLowerCase();
          //const fees = (pairData && pairData[pair] ? pairData[pair].oneDayVolumeUSD * 0.0025: 0);
          const totalRewardRateA01 = initTokenAmountFromCallResult(
            dummyToken,
            rewardRateAState,
          );
          const totalRewardRateB01 = initTokenAmountFromCallResult(
            dummyToken,
            rewardRateBState,
          );

          const individualRewardRateA = getHypotheticalRewardRate(
            stakingInfo.rewardTokenA,
            stakedAmount,
            totalStakedAmount,
            totalRewardRateA01,
          );
          const individualRewardRateB = getHypotheticalRewardRate(
            stakingInfo.rewardTokenB,
            stakedAmount,
            totalStakedAmount,
            totalRewardRateB01,
          );

          const { oneDayFee, accountFee } = getStakingFees(
            stakingInfo,
            balanceState,
            totalSupplyState,
          );

          let valueOfTotalStakedAmountInBaseToken: TokenAmount | undefined;

          const [, stakingTokenPair] = stakingPairs[index];
          const totalSupply = totalSupplys[index];
          const usdPrice = usdPrices[index];

          if (
            totalSupply &&
            stakingTokenPair &&
            baseTokens[index] &&
            totalStakedAmount
          ) {
            // take the total amount of LP tokens staked, multiply by ETH value of all LP tokens, divide by all LP tokens
            valueOfTotalStakedAmountInBaseToken = new TokenAmount(
              baseTokens[index],
              JSBI.divide(
                JSBI.multiply(
                  JSBI.multiply(
                    totalStakedAmount.raw,
                    stakingTokenPair.reserveOf(baseTokens[index]).raw,
                  ),
                  JSBI.BigInt(2), // this is b/c the value of LP shares are ~double the value of the WETH they entitle owner to
                ),
                totalSupply.raw,
              ),
            );
          }

          const valueOfTotalStakedAmountInUSDC =
            valueOfTotalStakedAmountInBaseToken &&
            usdPrice?.quote(valueOfTotalStakedAmountInBaseToken);

          const tvl = valueOfTotalStakedAmountInUSDC
            ? valueOfTotalStakedAmountInUSDC.toExact()
            : valueOfTotalStakedAmountInBaseToken?.toExact();

          const perMonthReturnInRewards =
            ((stakingInfo.rateA * rewardTokenAPrice +
              stakingInfo.rateB * rewardTokenBPrice) *
              (getDaysCurrentYear() / 12)) /
            Number(valueOfTotalStakedAmountInUSDC?.toExact());

          memo.push({
            stakingRewardAddress: rewardsAddress,
            tokens: stakingInfo.tokens,
            ended: stakingInfo.ended,
            name: stakingInfo.name,
            lp: stakingInfo.lp,
            earnedAmountA: initTokenAmountFromCallResult(
              stakingInfo.rewardTokenA,
              earnedAAmountState,
            ),
            earnedAmountB: initTokenAmountFromCallResult(
              stakingInfo.rewardTokenB,
              earnedBAmountState,
            ),
            rewardRateA: individualRewardRateA,
            rewardRateB: individualRewardRateB,
            totalRewardRateA: totalRewardRateA,
            totalRewardRateB: totalRewardRateB,
            stakedAmount: stakedAmount,
            totalStakedAmount: totalStakedAmount,
            baseToken: stakingInfo.baseToken,
            pair: stakingInfo.pair,
            rateA: stakingInfo.rateA,
            rateB: stakingInfo.rateB,
            rewardTokenA: stakingInfo.rewardTokenA,
            rewardTokenB: stakingInfo.rewardTokenB,
            rewardTokenBBase: stakingInfo.rewardTokenBBase,
            rewardTokenAPrice: stakingInfo.ended ? 0 : rewardTokenAPrice,
            rewardTokenBPrice: stakingInfo.ended ? 0 : rewardTokenBPrice,
            tvl,
            perMonthReturnInRewards: stakingInfo.ended
              ? undefined
              : perMonthReturnInRewards,
            totalSupply: stakingInfo.ended ? undefined : totalSupply,
            usdPrice,
            stakingTokenPair,
            oneDayFee: stakingInfo.ended ? 0 : oneDayFee,
            accountFee: stakingInfo.ended ? 0 : accountFee,
            sponsored: stakingInfo.stakingInfo.sponsored,
            sponsorLink: stakingInfo.stakingInfo.link,
          });
        }
        return memo;
      },
      [],
    );
  }, [
    balances,
    chainId,
    earnedAAmounts,
    earnedBAmounts,
    info,
    rewardsAddresses,
    totalSupplies,
    rewardRatesA,
    rewardRatesB,
    baseTokens,
    totalSupplys,
    usdPrices,
    stakingPairs,
    rewardTokenAPrices,
    rewardTokenBPrices,
  ]).filter((stakingInfo) =>
    filter && filter.isStaked
      ? stakingInfo.stakedAmount && stakingInfo.stakedAmount.greaterThan('0')
      : true,
  );
}

export function useOldLairInfo(): LairInfo | undefined {
  const lairContract = useLairContract();
  const quickContract = useQUICKContract();
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const lairAddress = LAIR_ADDRESS[chainIdToUse];
  const quickToken = OLD_QUICK[chainIdToUse];
  const dQuickToken = OLD_DQUICK[chainIdToUse];

  return useLairInfo(
    lairContract,
    quickContract,
    lairAddress,
    quickToken,
    dQuickToken,
  );
}

export function useNewLairInfo(): LairInfo | undefined {
  const lairContract = useNewLairContract();
  const quickContract = useNewQUICKContract();
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  const lairAddress = NEW_LAIR_ADDRESS[chainIdToUse];
  const quickToken = DLQUICK[chainIdToUse];
  const dQuickToken = DLDQUICK[chainIdToUse];

  return useLairInfo(
    lairContract,
    quickContract,
    lairAddress,
    quickToken,
    dQuickToken,
  );
}

function useLairInfo(
  lairContract: Contract | null,
  quickContract: Contract | null,
  lairAddress: string,
  quickToken: Token,
  dQuickToken: Token,
) {
  const { account, chainId } = useActiveWeb3React();
  let accountArg = useMemo(() => [account ?? undefined], [account]);
  const inputs = ['1000000000000000000'];
  const _dQuickTotalSupply = useSingleCallResult(
    lairContract,
    'totalSupply',
    [],
  );

  const quickBalance = useSingleCallResult(
    lairContract,
    'QUICKBalance',
    accountArg,
  );
  const dQuickBalance = useSingleCallResult(
    lairContract,
    'balanceOf',
    accountArg,
  );
  const dQuickToQuick = useSingleCallResult(
    lairContract,
    'dQUICKForQUICK',
    inputs,
  );
  const quickToDQuick = useSingleCallResult(
    lairContract,
    'QUICKForDQUICK',
    inputs,
  );

  accountArg = [lairAddress ?? undefined];

  const lairsQuickBalance = useSingleCallResult(
    quickContract,
    'balanceOf',
    accountArg,
  );

  const getOneDayVol = async () => {
    const config = getConfig(chainId);
    let v2OneDayVol = 0,
      v3OneDayVol = 0;
    if (config['v2']) {
      v2OneDayVol = await getOneDayVolume('v2', chainId);
    }
    if (config['v3']) {
      v3OneDayVol = await getOneDayVolume('v3', chainId);
    }
    return v2OneDayVol + v3OneDayVol;
  };

  const { data: oneDayVolume } = useQuery({
    queryKey: ['getOneDayVolume', chainId],
    queryFn: getOneDayVol,
    refetchInterval: 300000,
  });

  return useMemo(() => {
    if (!quickToken || !dQuickToQuick) {
      return;
    }

    return {
      loading: lairsQuickBalance.loading,
      lairAddress: lairAddress,
      dQUICKtoQUICK: new TokenAmount(
        quickToken,
        JSBI.BigInt(dQuickToQuick?.result?.[0] ?? 0),
      ),
      QUICKtodQUICK: new TokenAmount(
        dQuickToken,
        JSBI.BigInt(quickToDQuick?.result?.[0] ?? 0),
      ),
      dQUICKBalance: new TokenAmount(
        dQuickToken,
        JSBI.BigInt(dQuickBalance?.result?.[0] ?? 0),
      ),
      QUICKBalance: new TokenAmount(
        quickToken,
        JSBI.BigInt(quickBalance?.result?.[0] ?? 0),
      ),
      totalQuickBalance: new TokenAmount(
        quickToken,
        JSBI.BigInt(lairsQuickBalance?.result?.[0] ?? 0),
      ),
      dQuickTotalSupply: new TokenAmount(
        dQuickToken,
        JSBI.BigInt(_dQuickTotalSupply?.result?.[0] ?? 0),
      ),
      oneDayVol: oneDayVolume ?? 0,
    };
  }, [
    lairAddress,
    quickBalance,
    dQuickBalance,
    _dQuickTotalSupply,
    lairsQuickBalance,
    dQuickToQuick,
    quickToDQuick,
    dQuickToken,
    quickToken,
    oneDayVolume,
  ]);
}

// gets the staking info from the network for the active chain id
export function useStakingInfo(
  chainId: ChainId,
  pairToFilterBy?: Pair | null,
  startIndex?: number,
  endIndex?: number,
  filter?: { search: string; isStaked: boolean },
): StakingInfo[] {
  const { account } = useActiveWeb3React();
  const activeFarms = useDefaultFarmList()[chainId];
  const info = useMemo(
    () =>
      Object.values(activeFarms)
        .filter((x) => !x.ended)
        .sort((a, b) =>
          a.stakingInfo.sponsored ? 1 : b.stakingInfo.sponsored ? -1 : 1,
        )
        .filter((stakingRewardInfo) =>
          pairToFilterBy === undefined || pairToFilterBy === null
            ? getSearchFiltered(stakingRewardInfo, filter ? filter.search : '')
            : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
              pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1]),
        )
        .slice(startIndex, endIndex),
    [pairToFilterBy, startIndex, endIndex, filter, activeFarms],
  );

  const rewardsAddresses = useMemo(
    () => info.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [info],
  );

  const accountArg = useMemo(() => [account ?? undefined], [account]);

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'balanceOf',
    accountArg,
  );
  const earnedAmounts = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'earned',
    accountArg,
  );
  const totalSupplies = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'totalSupply',
  );
  const rewardRates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'rewardRate',
    undefined,
    NEVER_RELOAD,
  );

  const baseTokens = info.map((item) => {
    const unwrappedCurrency = unwrappedToken(item.baseToken);
    const empty = EMPTY[chainId];
    return unwrappedCurrency === empty ? item.tokens[0] : item.baseToken;
  });
  const rewardTokens = info.map((item) => item.rewardToken);

  const usdPrices = useUSDCPrices(baseTokens);
  const usdPricesRewardTokens = useUSDCPricesToken(rewardTokens, chainId);
  const totalSupplys = useTotalSupplys(
    info.map((item) => {
      const lp = item.lp;
      const dummyPair = new Pair(
        new TokenAmount(item.tokens[0], '0'),
        new TokenAmount(item.tokens[1], '0'),
      );
      return lp && lp !== ''
        ? new Token(137, lp, 18, 'SLP', 'Staked LP')
        : dummyPair.liquidityToken;
    }),
  );
  const stakingPairs = usePairs(info.map((item) => item.tokens));

  return useMemo(() => {
    if (!chainId) return [];

    return rewardsAddresses.reduce<StakingInfo[]>(
      (memo, rewardsAddress, index) => {
        // these two are dependent on account
        const balanceState = balances[index];
        const earnedAmountState = earnedAmounts[index];

        // these get fetched regardless of account
        const totalSupplyState = totalSupplies[index];
        const rewardRateState = rewardRates[index];
        const stakingInfo = info[index];
        const rewardTokenPrice = usdPricesRewardTokens[index];

        if (
          // these may be undefined if not logged in
          !balanceState?.loading &&
          !earnedAmountState?.loading &&
          // always need these
          totalSupplyState &&
          !totalSupplyState.loading &&
          rewardRateState &&
          !rewardRateState.loading
        ) {
          const rate = web3.utils.toWei(stakingInfo.rate.toString());
          const lpFarmToken = getFarmLPToken(stakingInfo);
          const stakedAmount = initTokenAmountFromCallResult(
            lpFarmToken,
            balanceState,
          );
          const totalStakedAmount = initTokenAmountFromCallResult(
            lpFarmToken,
            totalSupplyState,
          );

          // Previously Uni was used all over the place (which was an abstract to get the quick token)
          // These rates are just used for informational purposes and the token should should not be used anywhere
          // instead we will supply a dummy token, until this can be refactored properly.
          const dummyToken = NEW_QUICK[chainId];
          const totalRewardRate = new TokenAmount(
            dummyToken,
            JSBI.BigInt(rate),
          );
          const totalRewardRate01 = initTokenAmountFromCallResult(
            dummyToken,
            rewardRateState,
          );

          const individualRewardRate = getHypotheticalRewardRate(
            dummyToken,
            stakedAmount,
            totalStakedAmount,
            totalRewardRate01,
          );

          const { oneYearFeeAPY, oneDayFee, accountFee } = getStakingFees(
            stakingInfo,
            balanceState,
            totalSupplyState,
          );

          let valueOfTotalStakedAmountInBaseToken: TokenAmount | undefined;

          const [, stakingTokenPair] = stakingPairs[index];
          const totalSupply = totalSupplys[index];
          const usdPrice = usdPrices[index];

          if (
            totalSupply &&
            stakingTokenPair &&
            baseTokens[index] &&
            totalStakedAmount
          ) {
            // take the total amount of LP tokens staked, multiply by ETH value of all LP tokens, divide by all LP tokens
            valueOfTotalStakedAmountInBaseToken = new TokenAmount(
              baseTokens[index],
              JSBI.divide(
                JSBI.multiply(
                  JSBI.multiply(
                    totalStakedAmount.raw,
                    stakingTokenPair.reserveOf(baseTokens[index]).raw,
                  ),
                  JSBI.BigInt(2), // this is b/c the value of LP shares are ~double the value of the WETH they entitle owner to
                ),
                totalSupply.raw,
              ),
            );
          }

          const valueOfTotalStakedAmountInUSDC =
            valueOfTotalStakedAmountInBaseToken &&
            usdPrice?.quote(valueOfTotalStakedAmountInBaseToken);

          const tvl = valueOfTotalStakedAmountInUSDC
            ? valueOfTotalStakedAmountInUSDC.toExact()
            : valueOfTotalStakedAmountInBaseToken?.toExact();

          const perMonthReturnInRewards =
            (Number(stakingInfo.rate) *
              rewardTokenPrice *
              (getDaysCurrentYear() / 12)) /
            Number(valueOfTotalStakedAmountInUSDC?.toExact());

          memo.push({
            stakingRewardAddress: rewardsAddress,
            tokens: stakingInfo.tokens,
            ended: stakingInfo.ended,
            name: stakingInfo.name,
            lp: stakingInfo.lp,
            rewardToken: stakingInfo.rewardToken,
            rewardTokenPrice,
            earnedAmount: initTokenAmountFromCallResult(
              dummyToken,
              earnedAmountState,
            ),
            rewardRate: individualRewardRate,
            totalRewardRate: totalRewardRate,
            stakedAmount: stakedAmount,
            totalStakedAmount: totalStakedAmount,
            baseToken: stakingInfo.baseToken,
            pair: stakingInfo.pair,
            rate: stakingInfo.rate,
            oneYearFeeAPY: oneYearFeeAPY,
            oneDayFee,
            accountFee,
            tvl,
            perMonthReturnInRewards,
            valueOfTotalStakedAmountInBaseToken,
            usdPrice,
            stakingTokenPair,
            totalSupply,
            sponsored: stakingInfo.stakingInfo.sponsored,
            sponsorLink: stakingInfo.stakingInfo.link,
          });
        }
        return memo;
      },
      [],
    );
  }, [
    balances,
    chainId,
    earnedAmounts,
    info,
    rewardsAddresses,
    totalSupplies,
    rewardRates,
    usdPricesRewardTokens,
    baseTokens,
    totalSupplys,
    usdPrices,
    stakingPairs,
  ]).filter((stakingInfo) =>
    filter && filter.isStaked
      ? stakingInfo.stakedAmount && stakingInfo.stakedAmount.greaterThan('0')
      : true,
  );
}

export function useOldStakingInfo(
  chainId: ChainId,
  pairToFilterBy?: Pair | null,
  startIndex?: number,
  endIndex?: number,
  filter?: { search: string; isStaked: boolean },
): StakingInfo[] {
  const { account } = useActiveWeb3React();
  const oldFarms = useDefaultFarmList()[chainId];
  const info = useMemo(
    () =>
      Object.values(oldFarms)
        .filter((x) => x.ended)
        .sort((a, b) =>
          a.stakingInfo.sponsored ? 1 : b.stakingInfo.sponsored ? -1 : 1,
        )
        .filter((stakingRewardInfo) =>
          pairToFilterBy === undefined || pairToFilterBy === null
            ? getSearchFiltered(stakingRewardInfo, filter ? filter.search : '')
            : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
              pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1]),
        )
        .slice(startIndex, endIndex),
    [pairToFilterBy, startIndex, endIndex, filter, oldFarms],
  );

  const rewardsAddresses = useMemo(
    () => info.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [info],
  );

  const accountArg = useMemo(() => [account ?? undefined], [account]);

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'balanceOf',
    accountArg,
  );
  const earnedAmounts = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'earned',
    accountArg,
  );
  const totalSupplies = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'totalSupply',
  );

  const stakingPairs = usePairs(info.map((item) => item.tokens));

  return useMemo(() => {
    if (!chainId) return [];

    return rewardsAddresses.reduce<StakingInfo[]>(
      (memo, rewardsAddress, index) => {
        // these two are dependent on account
        const balanceState = balances[index];
        const earnedAmountState = earnedAmounts[index];

        // these get fetched regardless of account
        const totalSupplyState = totalSupplies[index];

        const stakingInfo = info[index];

        if (
          // these may be undefined if not logged in
          !balanceState?.loading &&
          !earnedAmountState?.loading &&
          // always need these
          totalSupplyState &&
          !totalSupplyState.loading
        ) {
          const lpFarmToken = getFarmLPToken(stakingInfo);
          const stakedAmount = initTokenAmountFromCallResult(
            lpFarmToken,
            balanceState,
          );
          const totalStakedAmount = initTokenAmountFromCallResult(
            lpFarmToken,
            totalSupplyState,
          );

          // Previously Uni was used all over the place (which was an abstract to get the quick token)
          // These rates are just used for informational purposes and the token should should not be used anywhere
          // instead we will supply a dummy token, until this can be refactored properly.
          const dummyToken = NEW_QUICK[chainId];
          const totalRewardRate = new TokenAmount(dummyToken, JSBI.BigInt(0));

          const individualRewardRate = getHypotheticalRewardRate(
            dummyToken,
            stakedAmount,
            totalStakedAmount,
            totalRewardRate,
          );

          const [, stakingTokenPair] = stakingPairs[index];

          memo.push({
            stakingRewardAddress: rewardsAddress,
            tokens: stakingInfo.tokens,
            ended: stakingInfo.ended,
            name: stakingInfo.name,
            lp: stakingInfo.lp,
            rewardToken: stakingInfo.rewardToken,
            rewardTokenPrice: 0,
            earnedAmount: initTokenAmountFromCallResult(
              dummyToken,
              earnedAmountState,
            ),
            rewardRate: individualRewardRate,
            totalRewardRate: totalRewardRate,
            stakedAmount: stakedAmount,
            totalStakedAmount: totalStakedAmount,
            baseToken: stakingInfo.baseToken,
            pair: stakingInfo.pair,
            rate: stakingInfo.rate,
            oneYearFeeAPY: 0,
            oneDayFee: 0,
            accountFee: 0,
            stakingTokenPair,
            sponsored: stakingInfo.stakingInfo.sponsored,
            sponsorLink: stakingInfo.stakingInfo.link,
          });
        }
        return memo;
      },
      [],
    );
  }, [
    balances,
    chainId,
    earnedAmounts,
    info,
    rewardsAddresses,
    totalSupplies,
    stakingPairs,
  ]).filter((stakingInfo) =>
    filter && filter.isStaked
      ? stakingInfo.stakedAmount && stakingInfo.stakedAmount.greaterThan('0')
      : true,
  );
}

export function useDQUICKtoQUICK(isNew?: boolean, noFetch?: boolean) {
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;

  const lair = useLairContract(chainIdToUse);
  const newLair = useNewLairContract();

  const inputs = ['1000000000000000000'];
  const dQuickToQuickState = useSingleCallResult(
    noFetch ? null : isNew ? newLair : lair,
    'dQUICKForQUICK',
    inputs,
  );
  if (dQuickToQuickState.loading || dQuickToQuickState.error) return 0;

  const quickToken = isNew ? NEW_QUICK[chainIdToUse] : OLD_QUICK[chainIdToUse];

  return !noFetch && quickToken
    ? Number(
        new TokenAmount(
          quickToken,
          JSBI.BigInt(dQuickToQuickState?.result?.[0] ?? 0),
        ).toExact(),
      )
    : 0;
}

export function useDerivedSyrupInfo(
  typedValue: string,
  stakingToken: Token | undefined,
  userLiquidityUnstaked: TokenAmount | undefined,
): {
  parsedAmount?: CurrencyAmount;
  error?: string;
} {
  const { account, chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const parsedInput: CurrencyAmount | undefined = tryParseAmount(
    chainIdToUse,
    typedValue,
    stakingToken,
  );

  const parsedAmount =
    parsedInput &&
    userLiquidityUnstaked &&
    JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityUnstaked.raw)
      ? parsedInput
      : undefined;

  let error: string | undefined;
  if (!account) {
    error = 'Connect Wallet';
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount';
  }

  return {
    parsedAmount,
    error,
  };
}

// based on typed value
export function useDerivedStakeInfo(
  typedValue: string,
  stakingToken: Token | undefined,
  userLiquidityUnstaked: TokenAmount | undefined,
): {
  parsedAmount?: CurrencyAmount;
  error?: string;
} {
  const { account, chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const parsedInput: CurrencyAmount | undefined = tryParseAmount(
    chainIdToUse,
    typedValue,
    stakingToken,
  );

  const parsedAmount =
    parsedInput &&
    userLiquidityUnstaked &&
    JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityUnstaked.raw)
      ? parsedInput
      : undefined;

  let error: string | undefined;
  if (!account) {
    error = 'Connect Wallet';
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount';
  }

  return {
    parsedAmount,
    error,
  };
}

export function useDerivedLairInfo(
  typedValue: string,
  stakingToken: Token,
  userLiquidityUnstaked: TokenAmount | undefined,
): {
  parsedAmount?: CurrencyAmount;
  error?: string;
} {
  const { account, chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const parsedInput: CurrencyAmount | undefined = tryParseAmount(
    chainIdToUse,
    typedValue,
    stakingToken,
  );

  const parsedAmount =
    parsedInput &&
    userLiquidityUnstaked &&
    JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityUnstaked.raw)
      ? parsedInput
      : undefined;

  let error: string | undefined;
  if (!account) {
    error = 'Connect Wallet';
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount';
  }

  return {
    parsedAmount,
    error,
  };
}

// based on typed value
export function useDerivedUnstakeInfo(
  typedValue: string,
  stakingAmount: TokenAmount,
): {
  parsedAmount?: CurrencyAmount;
  error?: string;
} {
  const { account, chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const parsedInput: CurrencyAmount | undefined = tryParseAmount(
    chainIdToUse,
    typedValue,
    stakingAmount.token,
  );

  const parsedAmount =
    parsedInput && JSBI.lessThanOrEqual(parsedInput.raw, stakingAmount.raw)
      ? parsedInput
      : undefined;

  let error: string | undefined;
  if (!account) {
    error = 'Connect Wallet';
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount';
  }

  return {
    parsedAmount,
    error,
  };
}

// based on typed value
export function useDerivedUnstakeLairInfo(
  typedValue: string,
  stakingAmount: TokenAmount,
): {
  parsedAmount?: CurrencyAmount;
  error?: string;
} {
  const { account, chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(
    chainIdToUse,
    typedValue,
    stakingAmount.token,
  );

  const parsedAmount =
    parsedInput && JSBI.lessThanOrEqual(parsedInput.raw, stakingAmount.raw)
      ? parsedInput
      : undefined;

  let error: string | undefined;
  if (!account) {
    error = 'Connect Wallet';
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount';
  }

  return {
    parsedAmount,
    error,
  };
}
