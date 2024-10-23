import {
  CurrencyAmount,
  JSBI,
  Token,
  TokenAmount,
  ChainId,
} from '@uniswap/sdk';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { usePairs } from 'data/Reserves';
import { STAKING_REWARDS_INTERFACE } from 'constants/abis/staking-rewards';
import { useActiveWeb3React } from 'hooks';
import {
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
import {
  getOneYearFee,
  getSyrupLPToken,
  initTokenAmountFromCallResult,
  getCallStateResult,
} from 'utils';

import {
  SyrupInfo,
  LairInfo,
  StakingBasic,
  DualStakingBasic,
} from 'types/index';
import { useDefaultSyrupList } from 'state/syrups/hooks';
import { Contract } from '@ethersproject/contracts';
import {
  DLDQUICK,
  DLQUICK,
  LAIR_ADDRESS,
  NEW_LAIR_ADDRESS,
  NEW_QUICK,
  OLD_DQUICK,
  OLD_QUICK,
} from 'constants/v3/addresses';
import { getConfig } from '../../config/index';
import { useQuery } from '@tanstack/react-query';

const web3 = new Web3('https://polygon-rpc.com/');

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

  return oneDayVolume;
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

export function useNewLairInfo(ignore?: boolean): LairInfo | undefined {
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
    ignore,
  );
}

function useLairInfo(
  lairContract: Contract | null,
  quickContract: Contract | null,
  lairAddress: string,
  quickToken: Token,
  dQuickToken: Token,
  ignore?: boolean,
) {
  const { account, chainId } = useActiveWeb3React();
  let accountArg = useMemo(() => [account ?? undefined], [account]);
  const inputs = ['1000000000000000000'];
  // use this options object
  const _dQuickTotalSupply = useSingleCallResult(
    lairContract,
    'totalSupply',
    [],
    undefined,
    ignore,
  );

  const quickBalance = useSingleCallResult(
    lairContract,
    'QUICKBalance',
    accountArg,
    undefined,
    ignore,
  );
  const dQuickBalance = useSingleCallResult(
    lairContract,
    'balanceOf',
    accountArg,
    undefined,
    ignore,
  );
  const dQuickToQuick = useSingleCallResult(
    lairContract,
    'dQUICKForQUICK',
    inputs,
    undefined,
    ignore,
  );
  const quickToDQuick = useSingleCallResult(
    lairContract,
    'QUICKForDQUICK',
    inputs,
    undefined,
    ignore,
  );

  accountArg = [(lairAddress as any) ?? undefined];

  const lairsQuickBalance = useSingleCallResult(
    quickContract,
    'balanceOf',
    accountArg,
    undefined,
    ignore,
  );

  const quickTotalSupply = useSingleCallResult(
    quickContract,
    'totalSupply',
    [],
    undefined,
    ignore,
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
    if (!quickToken || !dQuickToQuick || ignore) {
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
      quickTotalSupply: new TokenAmount(
        quickToken,
        JSBI.BigInt(quickTotalSupply?.result?.[0] ?? 0),
      ),
      oneDayVol: oneDayVolume ?? 0,
    };
  }, [
    quickToken,
    dQuickToQuick,
    ignore,
    lairsQuickBalance.loading,
    lairsQuickBalance?.result,
    lairAddress,
    dQuickToken,
    quickToDQuick?.result,
    dQuickBalance?.result,
    quickBalance?.result,
    _dQuickTotalSupply?.result,
    quickTotalSupply?.result,
    oneDayVolume,
  ]);
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
