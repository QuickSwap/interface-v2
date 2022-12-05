import { ChainId, Token } from '@uniswap/sdk';
import { GlobalValue } from 'constants/index';
import { useTokens } from 'hooks/Tokens';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { TokenAddressMap, useSelectedTokenList } from 'state/lists/hooks';
import { CNTFarmListInfo, StakingBasic, StakingRaw } from 'types';
import { getTokenFromAddress } from 'utils';

export class WrappedCNTStakingInfo implements StakingBasic {
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

  constructor(
    stakingInfo: StakingRaw,
    tokenAddressMap: TokenAddressMap,
    farmTokens: Token[],
    chainId: ChainId,
  ) {
    this.stakingInfo = stakingInfo;
    //TODO: Support Multichain
    this.chainId = chainId;
    this.stakingRewardAddress = stakingInfo.stakingRewardAddress;
    this.rate = stakingInfo.rate;
    this.ended = stakingInfo.ended;
    this.pair = stakingInfo.pair;
    this.lp = stakingInfo.lp;
    this.name = stakingInfo.name;

    this.baseToken = getTokenFromAddress(
      stakingInfo.baseToken,
      chainId,
      tokenAddressMap,
      farmTokens,
    );
    this.tokens = [
      getTokenFromAddress(
        stakingInfo.tokens[0],
        chainId,
        tokenAddressMap,
        farmTokens,
      ),
      getTokenFromAddress(
        stakingInfo.tokens[1],
        chainId,
        tokenAddressMap,
        farmTokens,
      ),
    ];

    this.rewardToken = stakingInfo.rewardToken
      ? getTokenFromAddress(
          stakingInfo.rewardToken,
          chainId,
          tokenAddressMap,
          farmTokens,
        )
      : GlobalValue.tokens.COMMON.OLD_DQUICK;
  }
}

export type CNTFarmInfoAddressMap = Readonly<
  {
    [chainId in ChainId]: Readonly<{
      [stakingInfoAddress: string]: WrappedCNTStakingInfo;
    }>;
  }
>;

/**
 * An empty result, useful as a default.
 */
const EMPTY_LIST: CNTFarmInfoAddressMap = {
  [ChainId.MUMBAI]: {},
  [ChainId.MATIC]: {},
};

const farmCache: WeakMap<CNTFarmListInfo, CNTFarmInfoAddressMap> | null =
  typeof WeakMap !== 'undefined'
    ? new WeakMap<CNTFarmListInfo, CNTFarmInfoAddressMap>()
    : null;

export function listToCNTFarmMap(
  list: CNTFarmListInfo,
  tokenAddressMap: TokenAddressMap,
  farmTokens: Token[],
  chainId: ChainId,
): CNTFarmInfoAddressMap {
  const result = farmCache?.get(list);
  if (result) return result;

  const map = list.active.concat(list.closed).reduce<CNTFarmInfoAddressMap>(
    (stakingInfoMap, stakingInfo) => {
      const wrappedStakingInfo: WrappedCNTStakingInfo = new WrappedCNTStakingInfo(
        stakingInfo,
        tokenAddressMap,
        farmTokens,
        chainId,
      );
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

export function useCNTFarmList(
  url: string | undefined,
  chainId: ChainId,
): CNTFarmInfoAddressMap {
  const cntFarms = useSelector<AppState, AppState['cntFarms']['byUrl']>(
    (state) => state.cntFarms.byUrl,
  );

  const tokenMap = useSelectedTokenList();
  const current = url ? cntFarms[url]?.current : null;
  const farmTokenAddresses =
    current && tokenMap
      ? current.active
          .concat(current.closed)
          .map((item) => [
            item.baseToken,
            item.tokens[0],
            item.tokens[1],
            item.rewardToken,
          ])
          .flat()
          .filter((item) => !!item)
          .filter((address) => !tokenMap[ChainId.MATIC][address])
          .filter(
            (address) =>
              !Object.values(GlobalValue.tokens.COMMON).find(
                (token) =>
                  token.address.toLowerCase() === address.toLowerCase(),
              ),
          )
          .filter(
            (addr, ind, self) =>
              self.findIndex(
                (address) => address.toLowerCase() === addr.toLowerCase(),
              ) === ind,
          )
      : [];

  const farmTokens = useTokens(farmTokenAddresses);
  return useMemo(() => {
    if (
      !current ||
      !tokenMap ||
      farmTokens?.length !== farmTokenAddresses.length
    )
      return EMPTY_LIST;
    try {
      return listToCNTFarmMap(current, tokenMap, farmTokens ?? [], chainId);
    } catch (error) {
      console.error('Could not show token list due to error', error);
      return EMPTY_LIST;
    }
  }, [current, farmTokens, farmTokenAddresses.length, tokenMap, chainId]);
}

export function useDefaultCNTFarmList(chainId: ChainId): CNTFarmInfoAddressMap {
  return useCNTFarmList(
    process.env.REACT_APP_CNT_STAKING_LIST_DEFAULT_URL,
    chainId,
  );
}

// returns all downloaded current lists
export function useAllFarms(): CNTFarmListInfo[] {
  const cntFarms = useSelector<AppState, AppState['cntFarms']['byUrl']>(
    (state) => state.cntFarms.byUrl,
  );

  return useMemo(
    () =>
      Object.keys(cntFarms)
        .map((url) => cntFarms[url].current)
        .filter((l): l is CNTFarmListInfo => Boolean(l)),
    [cntFarms],
  );
}
