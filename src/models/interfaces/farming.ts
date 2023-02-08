import { BigNumber } from '@ethersproject/bignumber';
import {
  PoolChartSubgraph,
  PoolSubgraph,
  TokenSubgraph,
} from './responseSubgraph';

interface DefaultFarmingEvent {
  id: string;
  bonusReward: string;
  startTime: string;
  endTime: string;
  reward: string;
}

export interface Position {
  id: string;
  owner: string;
  pool: string | PoolSubgraph;
  L2tokenId: string;
  limitFarming: string | null;
  eternalFarming: string | null;
  onFarmingCenter: boolean;
  enteredInEternalFarming: string;
}

export interface EternalFarming {
  id: string;
  rewardToken: string;
  bonusRewardToken: string;
  pool: string;
  startTime: string;
  endTime: string;
  reward: string;
  bonusReward: string;
  rewardRate: string;
  bonusRewardRate: string;
  tokenAmountForTier1: string;
  tokenAmountForTier2: string;
  tokenAmountForTier3: string;
  tier1Multiplier: string;
  tier2Multiplier: string;
  tier3Multiplier: string;
  multiplierToken: string;
}

export interface DetachedEternalFarming extends EternalFarming {
  isDetached: boolean;
}

export interface TickFarming {
  tickLower: number;
  tickUpper: number;
  token0: string;
  token1: string;
  liquidity: BigNumber;
  rewardToken?: TokenSubgraph;
  bonusRewardToken?: TokenSubgraph;
  pool?: PoolSubgraph;
  startTime?: string;
  endTime?: string;
}

export interface FormattedEternalFarming {
  tvl: number | undefined;
  bonusReward: string;
  bonusRewardRate: string;
  bonusRewardToken: TokenSubgraph;
  endTime: string;
  id: string;
  pool: PoolChartSubgraph;
  reward: string;
  rewardRate: string;
  rewardToken: TokenSubgraph;
  startTime: string;
  tokenAmountForTier1: string;
  tokenAmountForTier2: string;
  tokenAmountForTier3: string;
  tier1Multiplier: string;
  tier2Multiplier: string;
  tier3Multiplier: string;
  multiplierToken: TokenSubgraph;
  isDetached: boolean;
}

export interface FarmingEvent extends DefaultFarmingEvent {
  pool: PoolSubgraph;
  bonusRewardToken: TokenSubgraph;
  rewardToken: TokenSubgraph;
  tier1Multiplier: string;
  tier2Multiplier: string;
  tier3Multiplier: string;
  tokenAmountForTier1: string;
  tokenAmountForTier2: string;
  tokenAmountForTier3: string;
}

export interface FarmingEventString extends DefaultFarmingEvent {
  pool: string;
  bonusRewardToken: string;
  rewardToken: string;
  createdAtTimestamp: string;
}

export interface FutureFarmingEvent extends FarmingEventString {
  createdAtTimestamp: string;
  multiplierToken: string;
  tokenAmountForTier1: string;
  tokenAmountForTier2: string;
  tokenAmountForTier3: string;
  tier1Multiplier: string;
  tier2Multiplier: string;
  tier3Multiplier: string;
}

export interface Deposit {
  L2tokenId: string;
  enteredInEternalFarming: string;
  eternalBonusEarned: string | number;
  eternalBonusRewardToken: TokenSubgraph;
  eternalEarned: string | number;
  eternalEndTime: string;
  eternalFarming: string | null;
  eternalRewardToken: TokenSubgraph;
  eternalStartTime: string;
  id: string;
  farmId: string;
  limitFarming: null | string;
  limitRewardToken: TokenSubgraph;
  limitEarned: string | number;
  limitBonusEarned: string | number;
  limitBonusRewardToken: TokenSubgraph;
  limitStartTime: number;
  started: boolean;
  limitEndTime: number;
  createdAtTimestamp: number;
  limitReward: string;
  ended: boolean;
  limitAvailable: boolean;
  eternalAvailable: boolean;
  liquidity: BigNumber;
  onFarmingCenter: boolean;
  owner: string;
  pool: PoolChartSubgraph;
  tickLower: number;
  tickUpper: number;
  token0: string;
  token1: string;
  l2TokenId: string | null;
  tokensLockedEternal: string;
  tokensLockedLimit: string;
  tierEternal: string;
  tierLimit: string;
  multiplierToken: TokenSubgraph;
  oldFarming?: boolean;
}

export interface DefaultFarming {
  hash: string | null;
  id: string | null;
}

export interface DefaultNFT {
  id: string;
  onFarmingCenter: boolean;
}

export interface ApprovedNFT {
  id: string;
  approved: boolean;
}

export interface DefaultFarmingWithError extends DefaultFarming {
  error?: unknown;
}

export interface GetRewardsHashInterface {
  hash: string | null;
  id: string | null;
  farmingType: number | null;
}

export interface GetRewardsHashInterfaceWithError
  extends GetRewardsHashInterface {
  error?: unknown;
}

export interface EternalCollectRewardHandlerInterface {
  pool: PoolChartSubgraph;
  eternalRewardToken: TokenSubgraph;
  eternalBonusRewardToken: TokenSubgraph;
  eternalStartTime: string;
  eternalEndTime: string;
}

export interface GetRewardsHandlerInterface
  extends EternalCollectRewardHandlerInterface {
  limitRewardToken: TokenSubgraph;
  limitBonusRewardToken: TokenSubgraph;
  limitStartTime: string;
  limitEndTime: string;
}

export interface RewardInterface {
  id: string | null;
  state: string | null;
  farmingType: number | null;
}

export interface UnfarmingInterface {
  id: string | null;
  state: string | null;
}

export interface FormattedRewardInterface {
  amount: number;
  id: string;
  name: string;
  owner: string;
  rewardAddress: string;
  symbol: string;
  trueAmount: string;
}

export interface Aprs {
  [type: string]: number;
}

export interface Reward {
  amount: string;
  id: string;
  name: string;
  owner: string;
  rewardAddress: string;
  symbol: string;
  trueAmount: string;
}

export interface NTFInterface {
  onFarmingCenter?: boolean;
  id?: string | undefined;
}
