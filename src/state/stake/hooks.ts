import {
  CurrencyAmount,
  JSBI,
  Token,
  TokenAmount,
  Price,
  Pair,
} from '@uniswap/sdk';
import { useMemo, useEffect /** , useState */ } from 'react';
import { usePair, usePairs } from 'data/Reserves';

import { client, healthClient } from 'apollo/client';
import {
  GLOBAL_DATA,
  PAIRS_BULK,
  PAIRS_HISTORICAL_BULK,
  SUBGRAPH_HEALTH,
} from 'apollo/queries';
import { GlobalConst, GlobalValue } from 'constants/index';
import {
  STAKING_REWARDS_INTERFACE,
  STAKING_DUAL_REWARDS_INTERFACE,
} from 'constants/abis/staking-rewards';
import { useActiveWeb3React } from 'hooks';
import {
  NEVER_RELOAD,
  useMultipleContractSingleData,
  useSingleCallResult,
  useSingleContractMultipleData,
} from 'state/multicall/hooks';
import { tryParseAmount } from 'state/swap/hooks';
import Web3 from 'web3';
import { useLairContract, useQUICKContract } from 'hooks/useContract';
import useUSDCPrice, { useUSDCPrices } from 'utils/useUSDCPrice';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { useTotalSupplys } from 'data/TotalSupply';
import {
  getOneYearFee,
  getPriceToQUICKSyrup,
  returnDualStakingInfo,
  returnStakingInfo,
  returnSyrupInfo,
  returnTokenFromKey,
} from 'utils';

const web3 = new Web3('https://polygon-rpc.com/');

export const STAKING_GENESIS = 1620842940;

export const REWARDS_DURATION_DAYS = 7;

let pairs: any = undefined;

let oneDayVol: any = undefined;

export interface LairInfo {
  lairAddress: string;

  dQUICKtoQUICK: TokenAmount;

  QUICKtodQUICK: TokenAmount;

  dQUICKBalance: TokenAmount;

  QUICKBalance: TokenAmount;

  totalQuickBalance: TokenAmount;

  quickPrice: number;

  dQuickTotalSupply: TokenAmount;

  oneDayVol: number;
}

export interface CommonStakingInfo {
  // the address of the reward contract
  stakingRewardAddress: string;
  // the tokens involved in this pair
  tokens: [Token, Token];
  // the amount of token currently staked, or undefined if no account
  stakedAmount: TokenAmount;
  // the total amount of token staked in the contract
  totalStakedAmount: TokenAmount;
  // when the period ends
  periodFinish: Date | undefined;

  ended: boolean;

  name: string;

  lp: string;

  baseToken: Token;

  pair: string;

  quickPrice: number;

  oneYearFeeAPY?: number;

  oneDayFee?: number;

  accountFee?: number;
  tvl?: string;
  perMonthReturnInRewards?: number;

  totalSupply?: TokenAmount;
  usdPrice?: Price;
  stakingTokenPair?: Pair | null;
  // calculates a hypothetical amount of token distributed to the active account per second.
  getHypotheticalRewardRate: (
    stakedAmount: TokenAmount,
    totalStakedAmount: TokenAmount,
    totalRewardRate: TokenAmount,
  ) => TokenAmount;
}

export interface StakingInfo extends CommonStakingInfo {
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount: TokenAmount;
  // the amount of token distributed per second to all LPs, constant
  totalRewardRate: TokenAmount;
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  rewardRate: TokenAmount;

  rate: number;

  dQuickToQuick: number;
  valueOfTotalStakedAmountInBaseToken?: TokenAmount;
}

export interface DualStakingInfo extends CommonStakingInfo {
  rewardTokenA: Token;
  rewardTokenB: Token;
  rewardTokenBBase: Token;
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmountA: TokenAmount;
  earnedAmountB: TokenAmount;
  // the amount of token distributed per second to all LPs, constant
  totalRewardRateA: TokenAmount;
  totalRewardRateB: TokenAmount;
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  rewardRateA: TokenAmount;
  rewardRateB: TokenAmount;

  maticPrice: number;

  rateA: number;
  rateB: number;
  rewardTokenBPrice?: number;
}

export interface SyrupInfo {
  // the address of the reward contract
  stakingRewardAddress: string;
  // the token involved in this staking
  token: Token;
  // the amount of token currently staked, or undefined if no account
  stakedAmount: TokenAmount;
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount: TokenAmount;
  // the total amount of token staked in the contract
  totalStakedAmount: TokenAmount;
  // the amount of token distributed per second to all stakers, constant
  totalRewardRate: TokenAmount;
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  rewardRate: TokenAmount;
  // when the period ends
  periodFinish: number;

  ended: boolean;

  name: string;

  lp: string;

  baseToken: Token;

  quickPrice: number;

  rate: number;

  dQUICKtoQUICK: TokenAmount;

  dQuickTotalSupply: TokenAmount;

  oneDayVol: number;

  valueOfTotalStakedAmountInUSDC?: number;

  rewards?: number;
  rewardTokenPriceinUSD?: number;

  stakingToken: Token;

  // calculates a hypothetical amount of token distributed to the active account per second.
  getHypotheticalRewardRate: (
    stakedAmount: TokenAmount,
    totalStakedAmount: TokenAmount,
    totalRewardRate: TokenAmount,
  ) => TokenAmount;
}

export function useTotalRewardsDistributed() {
  const { chainId } = useActiveWeb3React();
  const [, quickUsdcPair] = usePair(
    returnTokenFromKey('QUICK'),
    returnTokenFromKey('USDC'),
  );
  const [, maticUsdcPair] = usePair(
    GlobalValue.tokens.MATIC,
    returnTokenFromKey('USDC'),
  );
  const quickPrice = Number(
    quickUsdcPair?.priceOf(returnTokenFromKey('QUICK'))?.toSignificant(6),
  );
  const maticPrice = Number(
    maticUsdcPair?.priceOf(GlobalValue.tokens.MATIC)?.toSignificant(6),
  );
  const syrupRewardsInfo = chainId ? returnSyrupInfo()[chainId] ?? [] : [];
  const dualStakingRewardsInfo = chainId
    ? returnDualStakingInfo()[chainId] ?? []
    : [];
  const stakingRewardsInfo = chainId ? returnStakingInfo()[chainId] ?? [] : [];

  const syrupTokenPairs = usePairs(
    syrupRewardsInfo.map((item) => [
      unwrappedToken(item.token),
      unwrappedToken(item.baseToken),
    ]),
  );
  const syrupUSDBaseTokenPrices = useUSDCPrices(
    syrupRewardsInfo.map((item) => unwrappedToken(item.baseToken)),
  );
  const syrupRewardsUSD = syrupRewardsInfo.reduce((total, item, index) => {
    const [, syrupTokenPair] = syrupTokenPairs[index];
    const tokenPairPrice = syrupTokenPair?.priceOf(item.token);
    const usdPriceBaseToken = syrupUSDBaseTokenPrices[index];
    const priceOfRewardTokenInUSD =
      Number(tokenPairPrice?.toSignificant()) *
      Number(usdPriceBaseToken?.toSignificant());
    return total + priceOfRewardTokenInUSD * item.rate;
  }, 0);

  const dualStakingTokenPairs = usePairs(
    dualStakingRewardsInfo.map((item) => [
      item.rewardTokenB,
      item.rewardTokenBBase,
    ]),
  );
  const dualStakingRewardsUSD = dualStakingRewardsInfo.reduce(
    (total, item, index) => {
      const [, rewardTokenBPair] = dualStakingTokenPairs[index];
      const rewardTokenBPriceInBaseToken = Number(
        rewardTokenBPair?.priceOf(item.rewardTokenB)?.toSignificant(6),
      );

      let rewardTokenBPrice = 0;
      if (item.rewardTokenBBase.equals(returnTokenFromKey('USDC'))) {
        rewardTokenBPrice = rewardTokenBPriceInBaseToken;
      } else if (item.rewardTokenBBase.equals(returnTokenFromKey('QUICK'))) {
        rewardTokenBPrice = rewardTokenBPriceInBaseToken * quickPrice;
      } else {
        rewardTokenBPrice = rewardTokenBPriceInBaseToken * maticPrice;
      }

      return total + item.rateA * quickPrice + item.rateB * rewardTokenBPrice;
    },
    0,
  );

  const stakingRewardsUSD = stakingRewardsInfo.reduce(
    (total, item) => total + item.rate * quickPrice,
    0,
  );

  return syrupRewardsUSD + dualStakingRewardsUSD + stakingRewardsUSD;
}

export function useUSDRewardsandFees(isLPFarm: boolean, bulkPairData: any) {
  const { chainId } = useActiveWeb3React();
  const [, quickUsdcPair] = usePair(
    returnTokenFromKey('QUICK'),
    returnTokenFromKey('USDC'),
  );
  const [, maticUsdcPair] = usePair(
    GlobalValue.tokens.MATIC,
    returnTokenFromKey('USDC'),
  );
  const quickPrice = Number(
    quickUsdcPair?.priceOf(returnTokenFromKey('QUICK'))?.toSignificant(6),
  );
  const maticPrice = Number(
    maticUsdcPair?.priceOf(GlobalValue.tokens.MATIC)?.toSignificant(6),
  );
  const dualStakingRewardsInfo =
    chainId && !isLPFarm ? returnDualStakingInfo()[chainId] ?? [] : [];
  const stakingRewardsInfo =
    chainId && isLPFarm ? returnStakingInfo()[chainId] ?? [] : [];
  const rewardsInfos = isLPFarm ? stakingRewardsInfo : dualStakingRewardsInfo;
  const rewardsAddresses = useMemo(
    () => rewardsInfos.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [rewardsInfos],
  );
  const rewardPairs = useMemo(() => rewardsInfos.map(({ pair }) => pair), [
    rewardsInfos,
  ]);
  const totalSupplies = useMultipleContractSingleData(
    rewardsAddresses,
    isLPFarm ? STAKING_REWARDS_INTERFACE : STAKING_DUAL_REWARDS_INTERFACE,
    'totalSupply',
  );
  const dualStakingTokenPairs = usePairs(
    dualStakingRewardsInfo.map((item) => [
      item.rewardTokenB,
      item.rewardTokenBBase,
    ]),
  );
  let rewardsUSD: number | null = null;
  if (isLPFarm) {
    rewardsUSD = stakingRewardsInfo.reduce(
      (total, item) => total + item.rate * quickPrice,
      0,
    );
  } else {
    rewardsUSD = dualStakingRewardsInfo.reduce((total, item, index) => {
      const [, rewardTokenBPair] = dualStakingTokenPairs[index];
      const rewardTokenBPriceInBaseToken = Number(
        rewardTokenBPair?.priceOf(item.rewardTokenB)?.toSignificant(6),
      );

      let rewardTokenBPrice = 0;
      if (item.rewardTokenBBase.equals(returnTokenFromKey('USDC'))) {
        rewardTokenBPrice = rewardTokenBPriceInBaseToken;
      } else if (item.rewardTokenBBase.equals(returnTokenFromKey('QUICK'))) {
        rewardTokenBPrice = rewardTokenBPriceInBaseToken * quickPrice;
      } else {
        rewardTokenBPrice = rewardTokenBPriceInBaseToken * maticPrice;
      }

      return total + item.rateA * quickPrice + item.rateB * rewardTokenBPrice;
    }, 0);
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

export function useSyrupInfo(
  tokenToFilterBy?: Token | null,
  startIndex?: number,
  endIndex?: number,
  filter?: { search: string; isStaked: boolean },
): SyrupInfo[] {
  const { chainId, account } = useActiveWeb3React();
  //const [quickPrice,setQuickPrice] = useState(0);
  const [, quickUsdcPair] = usePair(
    returnTokenFromKey('QUICK'),
    returnTokenFromKey('USDC'),
  );
  const quickPrice = Number(
    quickUsdcPair?.priceOf(returnTokenFromKey('QUICK'))?.toSignificant(6),
  );
  const info = useMemo(
    () =>
      chainId
        ? returnSyrupInfo()
            [chainId]?.slice(startIndex, endIndex)
            .filter((stakingRewardInfo) =>
              tokenToFilterBy === undefined || tokenToFilterBy === null
                ? getSearchFiltered(
                    stakingRewardInfo,
                    filter ? filter.search : '',
                  )
                : tokenToFilterBy.equals(stakingRewardInfo.token) &&
                  tokenToFilterBy.equals(stakingRewardInfo.token),
            ) ?? []
        : [],
    [chainId, tokenToFilterBy, startIndex, endIndex, filter],
  );

  const uni = chainId ? GlobalValue.tokens.UNI[chainId] : undefined;

  const rewardsAddresses = useMemo(
    () => info.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [info],
  );

  const accountArg = useMemo(() => [account ?? undefined], [account]);
  const lair = useLairContract();

  const inputs = ['1000000000000000000'];
  const USDPrice = useUSDCPrice(returnTokenFromKey('QUICK'));

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
  const dQuickToQuick = useSingleCallResult(lair, 'dQUICKForQUICK', inputs);
  const _dQuickTotalSupply = useSingleCallResult(lair, 'totalSupply', []);

  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD,
  );
  const rewardRates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'rewardRate',
    undefined,
    NEVER_RELOAD,
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

  useEffect(() => {
    getOneDayVolume().then((data) => {
      console.log(data);
    });
  }, []);

  return useMemo(() => {
    if (!chainId || !uni) return [];

    return rewardsAddresses.reduce<SyrupInfo[]>(
      (memo, rewardsAddress, index) => {
        // these two are dependent on account
        const balanceState = balances[index];
        const earnedAmountState = earnedAmounts[index];

        // these get fetched regardless of account
        const totalSupplyState = totalSupplies[index];
        const rewardRateState = rewardRates[index];
        const periodFinishState = periodFinishes[index];
        const syrupInfo = info[index];

        if (
          // these may be undefined if not logged in
          !dQuickToQuick?.loading &&
          !balanceState?.loading &&
          !earnedAmountState?.loading &&
          // always need these
          totalSupplyState &&
          !totalSupplyState.loading &&
          rewardRateState &&
          !rewardRateState.loading &&
          periodFinishState &&
          !periodFinishState.loading
        ) {
          if (
            dQuickToQuick?.error ||
            balanceState?.error ||
            earnedAmountState?.error ||
            totalSupplyState.error ||
            rewardRateState.error ||
            periodFinishState.error
          ) {
            console.error('Failed to load syrup rewards info');
            return memo;
          }
          // get the LP token
          const token = syrupInfo.token;
          const [, stakingTokenPair] = stakingTokenPairs[index];
          const tokenPairPrice = stakingTokenPair?.priceOf(token);
          const usdPriceBaseToken = usdBaseTokenPrices[index];
          const priceOfRewardTokenInUSD =
            Number(tokenPairPrice?.toSignificant()) *
            Number(usdPriceBaseToken?.toSignificant());

          const rewards =
            Number(syrupInfo.rate) *
            (priceOfRewardTokenInUSD ? priceOfRewardTokenInUSD : 0);

          // check for account, if no account set to 0
          const lp = syrupInfo.lp;
          const rate = web3.utils.toWei(syrupInfo.rate.toString());
          const stakedAmount = new TokenAmount(
            lp && lp !== ''
              ? new Token(137, lp, 18, 'SLP', 'Staked LP')
              : syrupInfo.stakingToken,
            JSBI.BigInt(balanceState?.result?.[0] ?? 0),
          );
          const totalStakedAmount = new TokenAmount(
            lp && lp !== ''
              ? new Token(137, lp, 18, 'SLP', 'Staked LP')
              : syrupInfo.stakingToken,
            JSBI.BigInt(totalSupplyState.result?.[0]),
          );
          const totalRewardRate = new TokenAmount(token, JSBI.BigInt(rate));
          //const pair = info[index].pair.toLowerCase();
          //const fees = (pairData && pairData[pair] ? pairData[pair].oneDayVolumeUSD * 0.0025: 0);
          const totalRewardRate01 = new TokenAmount(
            token,
            JSBI.BigInt(rewardRateState.result?.[0]),
          );
          const getHypotheticalRewardRate = (
            stakedAmount: TokenAmount,
            totalStakedAmount: TokenAmount,
            totalRewardRate: TokenAmount,
          ): TokenAmount => {
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
            totalRewardRate01,
          );

          const periodFinishMs = syrupInfo.ending;
          const dQUICKtoQUICK = new TokenAmount(
            returnTokenFromKey('QUICK'),
            JSBI.BigInt(dQuickToQuick?.result?.[0] ?? 0),
          );

          const syrup: SyrupInfo = {
            stakingRewardAddress: rewardsAddress,
            token: syrupInfo.token,
            ended: syrupInfo.ended,
            name: syrupInfo.name,
            lp: syrupInfo.lp,
            periodFinish: periodFinishMs,
            earnedAmount: new TokenAmount(
              token,
              JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0),
            ),
            rewardRate: individualRewardRate,
            totalRewardRate: totalRewardRate,
            stakedAmount: stakedAmount,
            totalStakedAmount: totalStakedAmount,
            getHypotheticalRewardRate,
            baseToken: syrupInfo.baseToken,
            quickPrice: quickPrice,
            rate: syrupInfo.rate,
            dQUICKtoQUICK: dQUICKtoQUICK,
            dQuickTotalSupply: new TokenAmount(
              returnTokenFromKey('DQUICK'),
              JSBI.BigInt(_dQuickTotalSupply?.result?.[0] ?? 0),
            ),
            oneDayVol: oneDayVol,
            rewardTokenPriceinUSD: priceOfRewardTokenInUSD,
            rewards,
            stakingToken: syrupInfo.stakingToken,
          };

          const valueOfTotalStakedAmountInUSDC =
            Number(totalStakedAmount.toSignificant(6)) *
            getPriceToQUICKSyrup(syrup) *
            Number(USDPrice?.toSignificant(6));

          memo.push({
            ...syrup,
            valueOfTotalStakedAmountInUSDC,
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
    periodFinishes,
    rewardsAddresses,
    totalSupplies,
    uni,
    dQuickToQuick,
    USDPrice,
    _dQuickTotalSupply,
    quickPrice,
    rewardRates,
    stakingTokenPairs,
    usdBaseTokenPrices,
  ]).filter((syrupInfo) =>
    filter && filter.isStaked ? syrupInfo.stakedAmount.greaterThan('0') : true,
  );
}

export function useOldSyrupInfo(
  tokenToFilterBy?: Token | null,
  startIndex?: number,
  endIndex?: number,
  filter?: { search: string; isStaked: boolean },
): SyrupInfo[] {
  const { chainId, account } = useActiveWeb3React();
  //const [quickPrice,setQuickPrice] = useState(0);
  const [, quickUsdcPair] = usePair(
    returnTokenFromKey('QUICK'),
    returnTokenFromKey('USDC'),
  );
  const quickPrice = Number(
    quickUsdcPair?.priceOf(returnTokenFromKey('QUICK'))?.toSignificant(6),
  );
  const info = useMemo(
    () =>
      chainId
        ? returnSyrupInfo(true)
            [chainId]?.slice(startIndex, endIndex)
            ?.filter((stakingRewardInfo) =>
              tokenToFilterBy === undefined || tokenToFilterBy === null
                ? getSearchFiltered(
                    stakingRewardInfo,
                    filter ? filter.search : '',
                  )
                : tokenToFilterBy.equals(stakingRewardInfo.token) &&
                  tokenToFilterBy.equals(stakingRewardInfo.token),
            ) ?? []
        : [],
    [chainId, tokenToFilterBy, startIndex, endIndex, filter],
  );

  const uni = chainId ? GlobalValue.tokens.UNI[chainId] : undefined;

  const rewardsAddresses = useMemo(
    () => info.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [info],
  );

  const accountArg = useMemo(() => [account ?? undefined], [account]);

  const USDPrice = useUSDCPrice(returnTokenFromKey('QUICK'));

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

  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD,
  );
  const rewardRates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'rewardRate',
    undefined,
    NEVER_RELOAD,
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

  return useMemo(() => {
    if (!chainId || !uni) return [];

    return rewardsAddresses.reduce<SyrupInfo[]>(
      (memo, rewardsAddress, index) => {
        // these two are dependent on account
        const balanceState = balances[index];
        const earnedAmountState = earnedAmounts[index];

        // these get fetched regardless of account
        const totalSupplyState = totalSupplies[index];
        const rewardRateState = rewardRates[index];
        const periodFinishState = periodFinishes[index];
        const syrupInfo = info[index];

        if (
          // these may be undefined if not logged in
          !balanceState?.loading &&
          !earnedAmountState?.loading &&
          // always need these
          totalSupplyState &&
          !totalSupplyState.loading &&
          rewardRateState &&
          !rewardRateState.loading &&
          periodFinishState &&
          !periodFinishState.loading
        ) {
          if (
            balanceState?.error ||
            earnedAmountState?.error ||
            totalSupplyState.error ||
            rewardRateState.error ||
            periodFinishState.error
          ) {
            console.error('Failed to load syrup rewards info');
            return memo;
          }
          // get the LP token
          const token = syrupInfo.token;

          // check for account, if no account set to 0
          const lp = syrupInfo.lp;
          const rate = web3.utils.toWei(syrupInfo.rate.toString());
          const stakedAmount = new TokenAmount(
            lp && lp !== ''
              ? new Token(137, lp, 18, 'SLP', 'Staked LP')
              : syrupInfo.stakingToken,
            JSBI.BigInt(balanceState?.result?.[0] ?? 0),
          );
          const totalStakedAmount = new TokenAmount(
            lp && lp !== ''
              ? new Token(137, lp, 18, 'SLP', 'Staked LP')
              : syrupInfo.stakingToken,
            JSBI.BigInt(totalSupplyState.result?.[0]),
          );
          const totalRewardRate = new TokenAmount(token, JSBI.BigInt(rate));
          //const pair = info[index].pair.toLowerCase();
          //const fees = (pairData && pairData[pair] ? pairData[pair].oneDayVolumeUSD * 0.0025: 0);
          const totalRewardRate01 = new TokenAmount(
            token,
            JSBI.BigInt(rewardRateState.result?.[0]),
          );
          const getHypotheticalRewardRate = (
            stakedAmount: TokenAmount,
            totalStakedAmount: TokenAmount,
            totalRewardRate: TokenAmount,
          ): TokenAmount => {
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
            totalRewardRate01,
          );

          const periodFinishMs = syrupInfo.ending;
          const dQUICKtoQUICK = new TokenAmount(
            returnTokenFromKey('QUICK'),
            JSBI.BigInt(0),
          );

          const [, stakingTokenPair] = stakingTokenPairs[index];
          const tokenPairPrice = stakingTokenPair?.priceOf(token);
          const usdPriceBaseToken = usdBaseTokenPrices[index];
          const priceOfRewardTokenInUSD =
            Number(tokenPairPrice?.toSignificant()) *
            Number(usdPriceBaseToken?.toSignificant());

          const syrup: SyrupInfo = {
            stakingRewardAddress: rewardsAddress,
            token: syrupInfo.token,
            ended: syrupInfo.ended,
            name: syrupInfo.name,
            lp: syrupInfo.lp,
            periodFinish: periodFinishMs,
            earnedAmount: new TokenAmount(
              token,
              JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0),
            ),
            rewardRate: individualRewardRate,
            totalRewardRate: totalRewardRate,
            stakedAmount: stakedAmount,
            totalStakedAmount: totalStakedAmount,
            getHypotheticalRewardRate,
            baseToken: syrupInfo.baseToken,
            quickPrice: quickPrice,
            rate: 0,
            dQUICKtoQUICK: dQUICKtoQUICK,
            dQuickTotalSupply: new TokenAmount(
              returnTokenFromKey('DQUICK'),
              JSBI.BigInt(0),
            ),
            oneDayVol: 0,
            rewardTokenPriceinUSD: priceOfRewardTokenInUSD,
            stakingToken: syrupInfo.stakingToken,
          };

          const valueOfTotalStakedAmountInUSDC =
            Number(totalStakedAmount.toSignificant(6)) *
            getPriceToQUICKSyrup(syrup) *
            Number(USDPrice?.toSignificant(6));

          memo.push({ ...syrup, valueOfTotalStakedAmountInUSDC });
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
    periodFinishes,
    rewardsAddresses,
    totalSupplies,
    uni,
    USDPrice,
    quickPrice,
    rewardRates,
    stakingTokenPairs,
    usdBaseTokenPrices,
  ]).filter((syrupInfo) =>
    filter && filter.isStaked ? syrupInfo.stakedAmount.greaterThan('0') : true,
  );
}

export const getBulkPairData = async (pairList: any) => {
  // if (pairs !== undefined) {
  //   return;
  // }
  const currentBlock = await web3.eth.getBlockNumber();
  const oneDayOldBlock = currentBlock - 44000;

  try {
    const current = await client.query({
      query: PAIRS_BULK(pairList),
      fetchPolicy: 'network-only',
    });

    const [oneDayResult] = await Promise.all(
      [oneDayOldBlock].map(async (block) => {
        const cResult = await client.query({
          query: PAIRS_HISTORICAL_BULK(block, pairList),
          fetchPolicy: 'network-only',
        });
        return cResult;
      }),
    );

    const oneDayData = oneDayResult?.data?.pairs.reduce(
      (obj: any, cur: any, i: any) => {
        return { ...obj, [cur.id]: cur };
      },
      {},
    );

    const pairData = await Promise.all(
      current &&
        current.data.pairs.map(async (pair: any) => {
          let data = pair;
          const oneDayHistory = oneDayData?.[pair.id];

          data = parseData(data, oneDayHistory);
          return data;
        }),
    );

    const object = convertArrayToObject(pairData, 'id');
    if (Object.keys(object).length > 0) {
      pairs = object;
      return object;
    }
    return object;
  } catch (e) {
    console.log(e);
    return;
  }
};

const getOneDayVolume = async () => {
  let data: any = {};
  let oneDayData: any = {};

  const healthInfo = await healthClient.query({
    query: SUBGRAPH_HEALTH,
  });
  const current = Number(
    healthInfo.data.indexingStatusForCurrentVersion.chains[0].latestBlock
      .number,
  );
  const oneDayOldBlock = current - 45000;

  const result = await client.query({
    query: GLOBAL_DATA(current),
    fetchPolicy: 'network-only',
  });
  data = result.data.uniswapFactories[0];

  // fetch the historical data
  const oneDayResult = await client.query({
    query: GLOBAL_DATA(oneDayOldBlock),
    fetchPolicy: 'network-only',
  });
  oneDayData = oneDayResult.data.uniswapFactories[0];

  let oneDayVolumeUSD: any = 0;

  if (data && oneDayData) {
    oneDayVolumeUSD = get2DayPercentChange(
      data.totalVolumeUSD,
      oneDayData.totalVolumeUSD ? oneDayData.totalVolumeUSD : 0,
    );
    oneDayVol = oneDayVolumeUSD;
  }

  return oneDayVolumeUSD;
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

export const get2DayPercentChange = (valueNow: any, value24HoursAgo: any) => {
  // get volume info for both 24 hour periods
  return Number(valueNow) - Number(value24HoursAgo);
};

function parseData(data: any, oneDayData: any) {
  // get volume changes
  const oneDayVolumeUSD = get2DayPercentChange(
    data?.volumeUSD,
    oneDayData?.volumeUSD ? oneDayData.volumeUSD : 0,
  );
  return {
    id: data.id,
    token0: data.token0,
    token1: data.token1,
    oneDayVolumeUSD,
    reserveUSD: data.reserveUSD,
    totalSupply: data.totalSupply,
  };
}

function getSearchFiltered(info: any, search: string) {
  if (info.tokens) {
    const infoToken0 = info.tokens[0];
    const infoToken1 = info.tokens[1];
    return (
      (infoToken0.symbol ?? '').toLowerCase().indexOf(search.toLowerCase()) >
        -1 ||
      (infoToken0.name ?? '').toLowerCase().indexOf(search.toLowerCase()) >
        -1 ||
      (infoToken0.address ?? '').toLowerCase().indexOf(search.toLowerCase()) >
        -1 ||
      (infoToken1.symbol ?? '').toLowerCase().indexOf(search.toLowerCase()) >
        -1 ||
      (infoToken1.name ?? '').toLowerCase().indexOf(search.toLowerCase()) >
        -1 ||
      (infoToken1.address ?? '').toLowerCase().indexOf(search.toLowerCase()) >
        -1
    );
  } else if (info.token) {
    return (
      (info.token.symbol ?? '').toLowerCase().indexOf(search.toLowerCase()) >
        -1 ||
      (info.token.name ?? '').toLowerCase().indexOf(search.toLowerCase()) >
        -1 ||
      (info.token.address ?? '').toLowerCase().indexOf(search.toLowerCase()) >
        -1
    );
  } else {
    return false;
  }
}

// gets the dual rewards staking info from the network for the active chain id
export function useDualStakingInfo(
  pairToFilterBy?: Pair | null,
  startIndex?: number,
  endIndex?: number,
  filter?: { search: string; isStaked: boolean },
): DualStakingInfo[] {
  const { chainId, account } = useActiveWeb3React();
  //const [quickPrice,setQuickPrice] = useState(0);
  const [, quickUsdcPair] = usePair(
    returnTokenFromKey('QUICK'),
    returnTokenFromKey('USDC'),
  );
  const [, maticUsdcPair] = usePair(
    GlobalValue.tokens.MATIC,
    returnTokenFromKey('USDC'),
  );

  const quickPrice = Number(
    quickUsdcPair?.priceOf(returnTokenFromKey('QUICK'))?.toSignificant(6),
  );
  const maticPrice = Number(
    maticUsdcPair?.priceOf(GlobalValue.tokens.MATIC)?.toSignificant(6),
  );

  const info = useMemo(
    () =>
      chainId
        ? returnDualStakingInfo()
            [chainId]?.slice(startIndex, endIndex)
            ?.filter((stakingRewardInfo) =>
              pairToFilterBy === undefined || pairToFilterBy === null
                ? getSearchFiltered(
                    stakingRewardInfo,
                    filter ? filter.search : '',
                  )
                : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
                  pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1]),
            ) ?? []
        : [],
    [chainId, pairToFilterBy, startIndex, endIndex, filter],
  );

  const uni = chainId ? GlobalValue.tokens.UNI[chainId] : undefined;

  const rewardsAddresses = useMemo(
    () => info.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [info],
  );
  // const pairAddresses = useMemo(() => info.map(({ pair }) => pair), [info]);

  // useEffect(() => {
  //   getDualBulkPairData(pairAddresses);
  // }, [pairAddresses]);

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

  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_DUAL_REWARDS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD,
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
    const empty = unwrappedToken(returnTokenFromKey('EMPTY'));
    return unwrappedCurrency === empty ? item.tokens[0] : item.baseToken;
  });

  const tokenPairs = usePairs(
    info.map((item) => [item.rewardTokenB, item.rewardTokenBBase]),
  );

  const usdPrices = useUSDCPrices(baseTokens);
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
    if (!chainId || !uni) return [];

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
        const periodFinishState = periodFinishes[index];
        const stakingInfo = info[index];

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
          rewardRateBState &&
          !rewardRateBState.loading &&
          periodFinishState &&
          !periodFinishState.loading
        ) {
          if (
            balanceState?.error ||
            earnedAAmountState?.error ||
            earnedBAmountState?.error ||
            totalSupplyState.error ||
            rewardRateAState.error ||
            rewardRateBState.error ||
            periodFinishState.error
          ) {
            console.error('Failed to load staking rewards info');
            return memo;
          }
          // get the LP token
          const tokens = stakingInfo.tokens;
          const dummyPair = new Pair(
            new TokenAmount(tokens[0], '0'),
            new TokenAmount(tokens[1], '0'),
          );

          // check for account, if no account set to 0
          const lp = stakingInfo.lp;
          const rateA = web3.utils.toWei(stakingInfo.rateA.toString());
          const rateB = web3.utils.toWei(stakingInfo.rateB.toString());
          const stakedAmount = new TokenAmount(
            lp && lp !== ''
              ? new Token(137, lp, 18, 'SLP', 'Staked LP')
              : dummyPair.liquidityToken,
            JSBI.BigInt(balanceState?.result?.[0] ?? 0),
          );
          const totalStakedAmount = new TokenAmount(
            lp && lp !== ''
              ? new Token(137, lp, 18, 'SLP', 'Staked LP')
              : dummyPair.liquidityToken,
            JSBI.BigInt(totalSupplyState.result?.[0]),
          );
          const totalRewardRateA = new TokenAmount(uni, JSBI.BigInt(rateA));
          const totalRewardRateB = new TokenAmount(uni, JSBI.BigInt(rateB));
          //const pair = info[index].pair.toLowerCase();
          //const fees = (pairData && pairData[pair] ? pairData[pair].oneDayVolumeUSD * 0.0025: 0);
          const totalRewardRateA01 = new TokenAmount(
            uni,
            JSBI.BigInt(rewardRateAState.result?.[0]),
          );
          const totalRewardRateB01 = new TokenAmount(
            uni,
            JSBI.BigInt(rewardRateBState.result?.[0]),
          );

          const getHypotheticalRewardRate = (
            stakedAmount: TokenAmount,
            totalStakedAmount: TokenAmount,
            totalRewardRate: TokenAmount,
          ): TokenAmount => {
            return new TokenAmount(
              uni,
              JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
                ? JSBI.divide(
                    JSBI.multiply(totalRewardRate.raw, stakedAmount.raw),
                    totalStakedAmount.raw,
                  )
                : JSBI.BigInt(0),
            );
          };

          const individualRewardRateA = getHypotheticalRewardRate(
            stakedAmount,
            totalStakedAmount,
            totalRewardRateA01,
          );
          const individualRewardRateB = getHypotheticalRewardRate(
            stakedAmount,
            totalStakedAmount,
            totalRewardRateB01,
          );

          const periodFinishMs = periodFinishState.result?.[0]
            ?.mul(1000)
            ?.toNumber();

          let valueOfTotalStakedAmountInBaseToken: TokenAmount | undefined;

          const [, stakingTokenPair] = stakingPairs[index];
          const totalSupply = totalSupplys[index];
          const usdPrice = usdPrices[index];

          if (totalSupply && stakingTokenPair && baseTokens[index]) {
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
            ? valueOfTotalStakedAmountInUSDC.toSignificant()
            : valueOfTotalStakedAmountInBaseToken?.toSignificant();

          const [, rewardTokenBPair] = tokenPairs[index];

          const rewardTokenBPriceInBaseToken = Number(
            rewardTokenBPair
              ?.priceOf(stakingInfo.rewardTokenB)
              ?.toSignificant(6),
          );

          let rewardTokenBPrice = 0;

          if (stakingInfo.rewardTokenBBase.equals(returnTokenFromKey('USDC'))) {
            rewardTokenBPrice = rewardTokenBPriceInBaseToken;
          } else if (
            stakingInfo.rewardTokenBBase.equals(returnTokenFromKey('QUICK'))
          ) {
            rewardTokenBPrice = rewardTokenBPriceInBaseToken * quickPrice;
          } else {
            rewardTokenBPrice = rewardTokenBPriceInBaseToken * maticPrice;
          }

          const perMonthReturnInRewards =
            ((stakingInfo.rateA * quickPrice +
              stakingInfo.rateB * rewardTokenBPrice) *
              30) /
            Number(valueOfTotalStakedAmountInUSDC?.toSignificant(6));

          memo.push({
            stakingRewardAddress: rewardsAddress,
            tokens: stakingInfo.tokens,
            ended: stakingInfo.ended,
            name: stakingInfo.name,
            lp: stakingInfo.lp,
            periodFinish:
              periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
            earnedAmountA: new TokenAmount(
              uni,
              JSBI.BigInt(earnedAAmountState?.result?.[0] ?? 0),
            ),
            earnedAmountB: new TokenAmount(
              uni,
              JSBI.BigInt(earnedBAmountState?.result?.[0] ?? 0),
            ),
            rewardRateA: individualRewardRateA,
            rewardRateB: individualRewardRateB,
            totalRewardRateA: totalRewardRateA,
            totalRewardRateB: totalRewardRateB,
            stakedAmount: stakedAmount,
            totalStakedAmount: totalStakedAmount,
            getHypotheticalRewardRate,
            baseToken: stakingInfo.baseToken,
            pair: stakingInfo.pair,
            quickPrice: quickPrice,
            maticPrice: maticPrice,
            rateA: stakingInfo.rateA,
            rateB: stakingInfo.rateB,
            rewardTokenA: stakingInfo.rewardTokenA,
            rewardTokenB: stakingInfo.rewardTokenB,
            rewardTokenBBase: stakingInfo.rewardTokenBBase,
            rewardTokenBPrice,
            tvl,
            perMonthReturnInRewards,
            totalSupply,
            usdPrice,
            stakingTokenPair,
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
    periodFinishes,
    rewardsAddresses,
    totalSupplies,
    uni,
    quickPrice,
    maticPrice,
    rewardRatesA,
    rewardRatesB,
    baseTokens,
    totalSupplys,
    usdPrices,
    stakingPairs,
    tokenPairs,
  ]).filter((stakingInfo) =>
    filter && filter.isStaked
      ? stakingInfo.stakedAmount.greaterThan('0')
      : true,
  );
}

export function useLairInfo(): LairInfo {
  const { account } = useActiveWeb3React();

  let accountArg = useMemo(() => [account ?? undefined], [account]);

  const inputs = ['1000000000000000000'];

  const lair = useLairContract();
  const quick = useQUICKContract();
  const [, quickUsdcPair] = usePair(
    returnTokenFromKey('QUICK'),
    returnTokenFromKey('USDC'),
  );
  const quickPrice = quickUsdcPair
    ? Number(
        quickUsdcPair.priceOf(returnTokenFromKey('QUICK')).toSignificant(6),
      )
    : 0;

  const dQuickToQuick = useSingleCallResult(lair, 'dQUICKForQUICK', inputs);
  const quickToDQuick = useSingleCallResult(lair, 'QUICKForDQUICK', inputs);

  const _dQuickTotalSupply = useSingleCallResult(lair, 'totalSupply', []);

  const quickBalance = useSingleCallResult(lair, 'QUICKBalance', accountArg);
  const dQuickBalance = useSingleCallResult(lair, 'balanceOf', accountArg);

  accountArg = [GlobalConst.addresses.LAIR_ADDRESS ?? undefined];

  const lairsQuickBalance = useSingleCallResult(quick, 'balanceOf', accountArg);

  useEffect(() => {
    getOneDayVolume().then((data) => {
      console.log(data);
    });
  }, []);

  return useMemo(() => {
    return {
      lairAddress: GlobalConst.addresses.LAIR_ADDRESS,
      dQUICKtoQUICK: new TokenAmount(
        returnTokenFromKey('QUICK'),
        JSBI.BigInt(dQuickToQuick?.result?.[0] ?? 0),
      ),
      QUICKtodQUICK: new TokenAmount(
        returnTokenFromKey('DQUICK'),
        JSBI.BigInt(quickToDQuick?.result?.[0] ?? 0),
      ),
      dQUICKBalance: new TokenAmount(
        returnTokenFromKey('DQUICK'),
        JSBI.BigInt(dQuickBalance?.result?.[0] ?? 0),
      ),
      QUICKBalance: new TokenAmount(
        returnTokenFromKey('QUICK'),
        JSBI.BigInt(quickBalance?.result?.[0] ?? 0),
      ),
      totalQuickBalance: new TokenAmount(
        returnTokenFromKey('QUICK'),
        JSBI.BigInt(lairsQuickBalance?.result?.[0] ?? 0),
      ),
      quickPrice,
      dQuickTotalSupply: new TokenAmount(
        returnTokenFromKey('DQUICK'),
        JSBI.BigInt(_dQuickTotalSupply?.result?.[0] ?? 0),
      ),
      oneDayVol: oneDayVol,
    };
  }, [
    dQuickToQuick,
    quickToDQuick,
    quickBalance,
    dQuickBalance,
    _dQuickTotalSupply,
    quickPrice,
    lairsQuickBalance,
  ]);
}

// gets the staking info from the network for the active chain id
export function useStakingInfo(
  pairToFilterBy?: Pair | null,
  startIndex?: number,
  endIndex?: number,
  filter?: { search: string; isStaked: boolean },
): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React();
  //const [quickPrice,setQuickPrice] = useState(0);
  const [, quickUsdcPair] = usePair(
    returnTokenFromKey('QUICK'),
    returnTokenFromKey('USDC'),
  );
  const quickPrice = Number(
    quickUsdcPair?.priceOf(returnTokenFromKey('QUICK'))?.toSignificant(6),
  );
  const info = useMemo(
    () =>
      chainId
        ? returnStakingInfo()
            [chainId]?.slice(startIndex, endIndex)
            ?.filter((stakingRewardInfo) =>
              pairToFilterBy === undefined || pairToFilterBy === null
                ? getSearchFiltered(
                    stakingRewardInfo,
                    filter ? filter.search : '',
                  )
                : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
                  pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1]),
            ) ?? []
        : [],
    [chainId, pairToFilterBy, startIndex, endIndex, filter],
  );

  const uni = chainId ? GlobalValue.tokens.UNI[chainId] : undefined;

  const rewardsAddresses = useMemo(
    () => info.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [info],
  );
  // const pairAddresses = useMemo(() => info.map(({ pair }) => pair), [info]);

  // useEffect(() => {
  //   getBulkPairData(allPairAddress);
  // }, [allPairAddress]);

  const lair = useLairContract();
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
  const inputs = ['1000000000000000000'];
  const dQuickToQuickState = useSingleCallResult(
    lair,
    'dQUICKForQUICK',
    inputs,
  );

  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD,
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
    const empty = unwrappedToken(returnTokenFromKey('EMPTY'));
    return unwrappedCurrency === empty ? item.tokens[0] : item.baseToken;
  });

  const usdPrices = useUSDCPrices(baseTokens);
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
    if (!chainId || !uni) return [];

    return rewardsAddresses.reduce<StakingInfo[]>(
      (memo, rewardsAddress, index) => {
        // these two are dependent on account
        const balanceState = balances[index];
        const earnedAmountState = earnedAmounts[index];

        // these get fetched regardless of account
        const totalSupplyState = totalSupplies[index];
        const rewardRateState = rewardRates[index];
        const periodFinishState = periodFinishes[index];
        const stakingInfo = info[index];

        if (
          // these may be undefined if not logged in
          !dQuickToQuickState?.loading &&
          !balanceState?.loading &&
          !earnedAmountState?.loading &&
          // always need these
          totalSupplyState &&
          !totalSupplyState.loading &&
          rewardRateState &&
          !rewardRateState.loading &&
          periodFinishState &&
          !periodFinishState.loading
        ) {
          if (
            dQuickToQuickState?.error ||
            balanceState?.error ||
            earnedAmountState?.error ||
            totalSupplyState.error ||
            rewardRateState.error ||
            periodFinishState.error
          ) {
            console.error('Failed to load staking rewards info');
            return memo;
          }
          // get the LP token
          const tokens = stakingInfo.tokens;
          const dummyPair = new Pair(
            new TokenAmount(tokens[0], '0'),
            new TokenAmount(tokens[1], '0'),
          );

          // check for account, if no account set to 0
          const lp = stakingInfo.lp;
          const rate = web3.utils.toWei(stakingInfo.rate.toString());
          const stakedAmount = new TokenAmount(
            lp && lp !== ''
              ? new Token(137, lp, 18, 'SLP', 'Staked LP')
              : dummyPair.liquidityToken,
            JSBI.BigInt(balanceState?.result?.[0] ?? 0),
          );
          const totalStakedAmount = new TokenAmount(
            lp && lp !== ''
              ? new Token(137, lp, 18, 'SLP', 'Staked LP')
              : dummyPair.liquidityToken,
            JSBI.BigInt(totalSupplyState.result?.[0]),
          );
          const totalRewardRate = new TokenAmount(uni, JSBI.BigInt(rate));
          //const pair = info[index].pair.toLowerCase();
          //const fees = (pairData && pairData[pair] ? pairData[pair].oneDayVolumeUSD * 0.0025: 0);
          const totalRewardRate01 = new TokenAmount(
            uni,
            JSBI.BigInt(rewardRateState.result?.[0]),
          );
          const getHypotheticalRewardRate = (
            stakedAmount: TokenAmount,
            totalStakedAmount: TokenAmount,
            totalRewardRate: TokenAmount,
          ): TokenAmount => {
            return new TokenAmount(
              uni,
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
            totalRewardRate01,
          );

          const periodFinishMs = periodFinishState.result?.[0]
            ?.mul(1000)
            ?.toNumber();
          let oneYearFeeAPY = 0;
          let oneDayFee = 0;
          let accountFee = 0;
          let dQuickToQuick: any = dQuickToQuickState?.result?.[0] ?? 0;

          dQuickToQuick = web3.utils.fromWei(dQuickToQuick.toString(), 'ether');
          if (pairs !== undefined) {
            oneYearFeeAPY = pairs[stakingInfo.pair]?.oneDayVolumeUSD;

            if (oneYearFeeAPY) {
              const totalSupply = web3.utils.toWei(
                pairs[stakingInfo.pair]?.totalSupply,
                'ether',
              );
              const ratio =
                Number(totalSupplyState.result?.[0].toString()) /
                Number(totalSupply);
              const myRatio =
                Number(balanceState?.result?.[0].toString()) /
                Number(totalSupplyState.result?.[0].toString());
              oneDayFee = oneYearFeeAPY * GlobalConst.utils.FEEPERCENT * ratio;
              accountFee = oneDayFee * myRatio;
              oneYearFeeAPY = getOneYearFee(
                oneYearFeeAPY,
                pairs[stakingInfo.pair]?.reserveUSD,
              );
              //console.log(info[index].pair, oneYearFeeAPY);
            }
          }

          let valueOfTotalStakedAmountInBaseToken: TokenAmount | undefined;

          const [, stakingTokenPair] = stakingPairs[index];
          const totalSupply = totalSupplys[index];
          const usdPrice = usdPrices[index];

          if (totalSupply && stakingTokenPair && baseTokens[index]) {
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
            ? valueOfTotalStakedAmountInUSDC.toSignificant()
            : valueOfTotalStakedAmountInBaseToken?.toSignificant();

          const perMonthReturnInRewards =
            (Number(dQuickToQuick) * Number(quickPrice) * 30) /
            Number(valueOfTotalStakedAmountInUSDC?.toSignificant(6));

          memo.push({
            stakingRewardAddress: rewardsAddress,
            tokens: stakingInfo.tokens,
            ended: stakingInfo.ended,
            name: stakingInfo.name,
            lp: stakingInfo.lp,
            periodFinish:
              periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
            earnedAmount: new TokenAmount(
              uni,
              JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0),
            ),
            rewardRate: individualRewardRate,
            totalRewardRate: totalRewardRate,
            stakedAmount: stakedAmount,
            totalStakedAmount: totalStakedAmount,
            getHypotheticalRewardRate,
            baseToken: stakingInfo.baseToken,
            pair: stakingInfo.pair,
            quickPrice: quickPrice,
            rate: stakingInfo.rate,
            oneYearFeeAPY: oneYearFeeAPY,
            oneDayFee,
            accountFee,
            dQuickToQuick: dQuickToQuick,
            tvl,
            perMonthReturnInRewards,
            valueOfTotalStakedAmountInBaseToken,
            usdPrice,
            stakingTokenPair,
            totalSupply,
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
    periodFinishes,
    rewardsAddresses,
    totalSupplies,
    uni,
    quickPrice,
    rewardRates,
    dQuickToQuickState,
    baseTokens,
    totalSupplys,
    usdPrices,
    stakingPairs,
  ]).filter((stakingInfo) =>
    filter && filter.isStaked
      ? stakingInfo.stakedAmount.greaterThan('0')
      : true,
  );
}

export function useOldStakingInfo(
  pairToFilterBy?: Pair | null,
  startIndex?: number,
  endIndex?: number,
  filter?: { search: string; isStaked: boolean },
): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React();

  const info = useMemo(
    () =>
      chainId
        ? returnStakingInfo('old')
            [chainId]?.slice(startIndex, endIndex)
            ?.filter((stakingRewardInfo) =>
              pairToFilterBy === undefined || pairToFilterBy === null
                ? getSearchFiltered(
                    stakingRewardInfo,
                    filter ? filter.search : '',
                  )
                : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
                  pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1]),
            ) ?? []
        : [],
    [chainId, pairToFilterBy, startIndex, endIndex, filter],
  );

  const uni = chainId ? GlobalValue.tokens.UNI[chainId] : undefined;

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

  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD,
  );

  const stakingPairs = usePairs(info.map((item) => item.tokens));

  return useMemo(() => {
    if (!chainId || !uni) return [];

    return rewardsAddresses.reduce<StakingInfo[]>(
      (memo, rewardsAddress, index) => {
        // these two are dependent on account
        const balanceState = balances[index];
        const earnedAmountState = earnedAmounts[index];

        // these get fetched regardless of account
        const totalSupplyState = totalSupplies[index];

        const periodFinishState = periodFinishes[index];
        const stakingInfo = info[index];

        if (
          // these may be undefined if not logged in
          !balanceState?.loading &&
          !earnedAmountState?.loading &&
          // always need these
          totalSupplyState &&
          !totalSupplyState.loading &&
          periodFinishState &&
          !periodFinishState.loading
        ) {
          if (
            balanceState?.error ||
            earnedAmountState?.error ||
            totalSupplyState.error ||
            periodFinishState.error
          ) {
            console.error('Failed to load staking rewards info');
            return memo;
          }

          // get the LP token
          const tokens = stakingInfo.tokens;
          const dummyPair = new Pair(
            new TokenAmount(tokens[0], '0'),
            new TokenAmount(tokens[1], '0'),
          );

          // check for account, if no account set to 0
          const lp = stakingInfo.lp;

          const stakedAmount = new TokenAmount(
            lp && lp !== ''
              ? new Token(137, lp, 18, 'SLP', 'Staked LP')
              : dummyPair.liquidityToken,
            JSBI.BigInt(balanceState?.result?.[0] ?? 0),
          );
          const totalStakedAmount = new TokenAmount(
            lp && lp !== ''
              ? new Token(137, lp, 18, 'SLP', 'Staked LP')
              : dummyPair.liquidityToken,
            JSBI.BigInt(totalSupplyState.result?.[0]),
          );
          const totalRewardRate = new TokenAmount(uni, JSBI.BigInt(0));

          const getHypotheticalRewardRate = (
            stakedAmount: TokenAmount,
            totalStakedAmount: TokenAmount,
            totalRewardRate: TokenAmount,
          ): TokenAmount => {
            return new TokenAmount(
              uni,
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
            totalRewardRate,
          );

          const periodFinishMs = periodFinishState.result?.[0]
            ?.mul(1000)
            ?.toNumber();

          const [, stakingTokenPair] = stakingPairs[index];

          memo.push({
            stakingRewardAddress: rewardsAddress,
            tokens: stakingInfo.tokens,
            ended: stakingInfo.ended,
            name: stakingInfo.name,
            lp: stakingInfo.lp,
            periodFinish:
              periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
            earnedAmount: new TokenAmount(
              uni,
              JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0),
            ),
            rewardRate: individualRewardRate,
            totalRewardRate: totalRewardRate,
            stakedAmount: stakedAmount,
            totalStakedAmount: totalStakedAmount,
            baseToken: stakingInfo.baseToken,
            getHypotheticalRewardRate,
            pair: stakingInfo.pair,
            quickPrice: 0,
            rate: stakingInfo.rate,
            oneYearFeeAPY: 0,
            oneDayFee: 0,
            accountFee: 0,
            dQuickToQuick: 0,
            stakingTokenPair,
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
    periodFinishes,
    rewardsAddresses,
    totalSupplies,
    uni,
    stakingPairs,
  ]).filter((stakingInfo) =>
    filter && filter.isStaked
      ? stakingInfo.stakedAmount.greaterThan('0')
      : true,
  );
}

export function useTotalUniEarned(): TokenAmount | undefined {
  const { chainId } = useActiveWeb3React();
  const uni = chainId ? GlobalValue.tokens.UNI[chainId] : undefined;
  const newStakingInfos = useStakingInfo();
  const oldStakingInfos = useOldStakingInfo();
  const stakingInfos = newStakingInfos.concat(oldStakingInfos);

  return useMemo(() => {
    if (!uni) return undefined;
    return (
      stakingInfos?.reduce(
        (accumulator, stakingInfo) => accumulator.add(stakingInfo.earnedAmount),
        new TokenAmount(uni, '0'),
      ) ?? new TokenAmount(uni, '0')
    );
  }, [stakingInfos, uni]);
}

export function useDerivedSyrupInfo(
  typedValue: string,
  stakingToken: Token,
  userLiquidityUnstaked: TokenAmount | undefined,
): {
  parsedAmount?: CurrencyAmount;
  error?: string;
} {
  const { account } = useActiveWeb3React();

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(
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
  const { account } = useActiveWeb3React();

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(
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
  const { account } = useActiveWeb3React();

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(
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
  const { account } = useActiveWeb3React();

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(
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
  const { account } = useActiveWeb3React();

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(
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
