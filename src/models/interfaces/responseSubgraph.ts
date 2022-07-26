export interface PoolSubgraph {
  fee: string;
  feesUSD: string;
  id: string;
  liquidity: string;
  sqrtPrice: string;
  tick: string;
  token0: TokenSubgraph;
  token0Price: string;
  token1: TokenSubgraph;
  token1Price: string;
  totalValueLockedToken0: string;
  totalValueLockedToken1: string;
  totalValueLockedUSD: string;
  txCount: string;
  volumeUSD: string;
  untrackedVolumeUSD: string;
  totalValueLockedUSDUntracked: string;
}

export interface PoolAddressSubgraph {
  id: string;
}

export interface PoolChartSubgraph {
  id: string;
  fee: string;
  token0: TokenSubgraph;
  token1: TokenSubgraph;
  sqrtPrice: string;
  liquidity: string;
  tick: string;
  feesUSD: string;
  untrackedFeesUSD: string;
}

export interface SubgraphResponse<T> {
  [key: string]: T;
}

export interface SubgraphResponseStaking<A, B> {
  factories: A;
  stakes: B;
}

export interface TokenInSubgraph {
  derivedMatic: string;
  feesUSD: string;
  id: string;
  name: string;
  symbol: string;
  totalValueLocked: string;
  totalValueLockedUSD: string;
  txCount: string;
  volume: string;
  volumeUSD: string;
  untrackedVolumeUSD: string;
  totalValueLockedUSDUntracked: string;
}

export interface TokenAddressSubgraph {
  id: string;
}

export interface TokenSubgraph {
  decimals: string;
  derivedMatic: string;
  id: string;
  name: string;
  symbol: string;
  address: string;
}

export interface FeeSubgraph {
  id: string;
  pool: string;
  fee: string;
  changesCount: string;
  timestamp: string;
  minFee: string;
  maxFee: string;
  startFee: string;
  endFee: string;
}

export interface LastPoolSubgraph {
  feesUSD: string;
  periodStartUnix: number;
  tvlUSD: string;
  volumeUSD: string;
}

export interface PoolHourData extends LastPoolSubgraph {
  untrackedVolumeUSD: string;
  token0Price: string;
  token1Price: string;
}

export interface FactorySubgraph {
  ALGBbalance: string;
  currentStakedAmount: string;
  earnedForAllTime: string;
  xALGBtotalSupply: string;
}

export interface StakeSubgraph {
  stakedALGBAmount: string;
  xALGBAmount: string;
}

export interface HistoryStakingSubgraph {
  ALGBbalance: string;
  ALGBfromVault: string;
  currentStakedAmount: string;
  date: string;
  xALGBburned: string;
  xALGBminted: string;
  xALGBtotalSupply: string;
}

export interface TotalStatSubgraph {
  totalVolumeUSD: string;
  totalValueLockedUSD: string;
}

export interface SmallPoolSubgraph {
  fee: string;
  feesUSD: string;
  id: string;
  liquidity: string;
  sqrtPrice: string;
  tick: string;
  token0: TokenSubgraph;
  token1: TokenSubgraph;
}

export interface EternalFarmingByPool {
  bonusReward: string;
  bonusRewardRate: string;
  bonusRewardToken: string;
  endTime: string;
  id: string;
  isDetached: boolean;
  pool: string;
  reward: string;
  rewardRate: string;
  rewardToken: string;
  startTime: string;
}

export interface LimitFarmingByPool {
  id: string;
  createdAtTimestamp: string;
  rewardToken: string;
  bonusReward: string;
  bonusRewardToken: string;
  pool: string;
  startTime: string;
  endTime: string;
  reward: string;
}
