import { ChainId } from '@uniswap/sdk';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { DualFarmListInfo, DualStakingRaw, DualStakingBasic } from 'types';
import { Token } from '@uniswap/sdk';
import { returnTokenFromKey } from 'utils';

export class WrappedDualFarmInfo implements DualStakingBasic {
  public readonly stakingInfo: DualStakingRaw;
  public readonly chainId: ChainId;
  public readonly stakingRewardAddress: string;
  public readonly pair: string;
  public readonly tokens: [Token, Token];
  public readonly ended: boolean;
  public readonly lp: string;
  public readonly name: string;
  public readonly baseToken: Token;
  public readonly rewardTokenA: Token;
  public readonly rewardTokenB: Token;
  public readonly rewardTokenBBase: Token;
  public readonly rateA: number;
  public readonly rateB: number;

  constructor(stakingInfo: DualStakingRaw) {
    this.stakingInfo = stakingInfo;
    //TODO: Support Multichain
    this.chainId = ChainId.MATIC;
    this.stakingRewardAddress = stakingInfo.stakingRewardAddress;
    this.ended = stakingInfo.ended;
    this.pair = stakingInfo.pair;
    this.lp = stakingInfo.lp;
    this.name = stakingInfo.name;
    this.rateA = stakingInfo.rateA;
    this.rateB = stakingInfo.rateB;
    //TODO: we should be resolving the following property from the lists state using the address field instead of the key
    this.baseToken = returnTokenFromKey(stakingInfo.baseToken);
    this.tokens = [
      returnTokenFromKey(stakingInfo.tokens[0]),
      returnTokenFromKey(stakingInfo.tokens[1]),
    ];

    this.rewardTokenA = returnTokenFromKey(stakingInfo.rewardTokenA);
    this.rewardTokenB = returnTokenFromKey(stakingInfo.rewardTokenB);
    this.rewardTokenBBase = returnTokenFromKey(stakingInfo.rewardTokenBBase);
  }
}

export type DualFarmInfoAddressMap = Readonly<
  {
    [chainId in ChainId]: Readonly<{
      [stakingInfoAddress: string]: WrappedDualFarmInfo;
    }>;
  }
>;

/**
 * An empty result, useful as a default.
 */
const EMPTY_LIST: DualFarmInfoAddressMap = {
  [ChainId.MUMBAI]: {},
  [ChainId.MATIC]: {},
};

const dualFarmCache: WeakMap<DualFarmListInfo, DualFarmInfoAddressMap> | null =
  typeof WeakMap !== 'undefined'
    ? new WeakMap<DualFarmListInfo, DualFarmInfoAddressMap>()
    : null;

export function listToDualFarmMap(
  list: DualFarmListInfo,
): DualFarmInfoAddressMap {
  const result = dualFarmCache?.get(list);
  if (result) return result;

  const map = list.active.concat(list.closed).reduce<DualFarmInfoAddressMap>(
    (stakingInfoMap, stakingInfo) => {
      const wrappedStakingInfo = new WrappedDualFarmInfo(stakingInfo);
      if (
        stakingInfoMap[wrappedStakingInfo.chainId][
          wrappedStakingInfo.stakingRewardAddress
        ] !== undefined
      )
        throw Error('Duplicate dual farms.');
      return {
        ...stakingInfoMap,
        [wrappedStakingInfo.chainId]: {
          ...stakingInfoMap[wrappedStakingInfo.chainId],
          [wrappedStakingInfo.stakingRewardAddress]: wrappedStakingInfo,
        },
      };
    },
    { ...EMPTY_LIST },
  );
  dualFarmCache?.set(list, map);
  return map;
}

export function useDualFarmList(
  url: string | undefined,
): DualFarmInfoAddressMap {
  const dualFarms = useSelector<AppState, AppState['dualFarms']['byUrl']>(
    (state) => state.dualFarms.byUrl,
  );
  return useMemo(() => {
    if (!url) return EMPTY_LIST;
    const current = dualFarms[url]?.current;
    if (!current) return EMPTY_LIST;
    try {
      return listToDualFarmMap(current);
    } catch (error) {
      console.error('Could not show token list due to error', error);
      return EMPTY_LIST;
    }
  }, [dualFarms, url]);
}

export function useDefaultDualFarmList(): DualFarmInfoAddressMap {
  return useDualFarmList(process.env.REACT_APP_DUAL_STAKING_LIST_DEFAULT_URL);
}

export function useDualFarmInfo(): {
  [chainId in ChainId]: DualStakingBasic[];
} {
  return {
    [ChainId.MATIC]: Object.values(useDefaultDualFarmList()[ChainId.MATIC]),
    [ChainId.MUMBAI]: [],
  };
}

// returns all downloaded current lists
export function useAllFarms(): DualFarmListInfo[] {
  const dualFarms = useSelector<AppState, AppState['dualFarms']['byUrl']>(
    (state) => state.dualFarms.byUrl,
  );

  return useMemo(
    () =>
      Object.keys(dualFarms)
        .map((url) => dualFarms[url].current)
        .filter((l): l is DualFarmListInfo => Boolean(l)),
    [dualFarms],
  );
}
