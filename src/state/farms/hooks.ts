import { ChainId } from '@uniswap/sdk';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { FarmListInfo, StakingRaw, StakingBasic } from 'types';
import { Token } from '@uniswap/sdk';
import { returnTokenFromKey } from 'utils';

export class WrappedStakingInfo implements StakingBasic {
  public readonly stakingInfo: StakingRaw;
  public readonly chainId: ChainId;
  public readonly stakingRewardAddress: string;
  public readonly pair: string;
  public readonly rate: number;
  public readonly tokens: [Token, Token];
  public readonly ended: boolean;
  public readonly lp: string;
  public readonly name: string;
  public readonly baseToken: Token;
  public readonly rewardToken: Token;

  constructor(stakingInfo: StakingRaw) {
    this.stakingInfo = stakingInfo;
    //TODO: Support Multichain
    this.chainId = ChainId.MATIC;
    this.stakingRewardAddress = stakingInfo.stakingRewardAddress;
    this.rate = stakingInfo.rate;
    this.ended = stakingInfo.ended;
    this.pair = stakingInfo.pair;
    this.lp = stakingInfo.lp;
    this.name = stakingInfo.name;
    //TODO: we should be resolving the following property from the lists state using the address field instead of the key
    this.baseToken = returnTokenFromKey(stakingInfo.baseToken);
    this.tokens = [
      returnTokenFromKey(stakingInfo.tokens[0]),
      returnTokenFromKey(stakingInfo.tokens[1]),
    ];
    this.rewardToken = returnTokenFromKey(stakingInfo.rewardToken ?? 'DQUICK');
  }
}

export type StakingInfoAddressMap = Readonly<
  {
    [chainId in ChainId]: Readonly<{
      [stakingInfoAddress: string]: WrappedStakingInfo;
    }>;
  }
>;

/**
 * An empty result, useful as a default.
 */
const EMPTY_LIST: StakingInfoAddressMap = {
  [ChainId.MUMBAI]: {},
  [ChainId.MATIC]: {},
};

const farmCache: WeakMap<FarmListInfo, StakingInfoAddressMap> | null =
  typeof WeakMap !== 'undefined'
    ? new WeakMap<FarmListInfo, StakingInfoAddressMap>()
    : null;

export function listToFarmMap(list: FarmListInfo): StakingInfoAddressMap {
  const result = farmCache?.get(list);
  if (result) return result;

  const map = list.active.concat(list.closed).reduce<StakingInfoAddressMap>(
    (stakingInfoMap, stakingInfo) => {
      const wrappedStakingInfo = new WrappedStakingInfo(stakingInfo);
      if (
        stakingInfoMap[wrappedStakingInfo.chainId][
          wrappedStakingInfo.stakingRewardAddress
        ] !== undefined
      )
        throw Error('Duplicate farms.');
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
  farmCache?.set(list, map);
  return map;
}

export function useFarmList(url: string | undefined): StakingInfoAddressMap {
  const farms = useSelector<AppState, AppState['farms']['byUrl']>(
    (state) => state.farms.byUrl,
  );
  return useMemo(() => {
    if (!url) return EMPTY_LIST;
    const current = farms[url]?.current;
    if (!current) return EMPTY_LIST;
    try {
      return listToFarmMap(current);
    } catch (error) {
      console.error('Could not show token list due to error', error);
      return EMPTY_LIST;
    }
  }, [farms, url]);
}

export function useDefaultFarmList(): StakingInfoAddressMap {
  return useFarmList(process.env.REACT_APP_STAKING_LIST_DEFAULT_URL);
}

export function useFarmInfo(): {
  [chainId in ChainId]: StakingBasic[];
} {
  return {
    [ChainId.MATIC]: Object.values(useDefaultFarmList()[ChainId.MATIC]),
    [ChainId.MUMBAI]: [],
  };
}

// returns all downloaded current lists
export function useAllFarms(): FarmListInfo[] {
  const farms = useSelector<AppState, AppState['farms']['byUrl']>(
    (state) => state.farms.byUrl,
  );

  return useMemo(
    () =>
      Object.keys(farms)
        .map((url) => farms[url].current)
        .filter((l): l is FarmListInfo => Boolean(l)),
    [farms],
  );
}
