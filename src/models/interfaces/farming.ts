import { BigNumber } from '@ethersproject/bignumber'
import { PoolChartSubgraph, PoolSubgraph, TokenSubgraph } from './responseSubgraph'

interface DefaultFarmingEvent {
    id: string
    bonusReward: string
    startTime: string
    endTime: string
    reward: string
}

export interface Position {
    id: string
    owner: string
    pool: string | PoolSubgraph
    L2tokenId: string
    incentive: string | null
    eternalFarming: string | null
    onFarmingCenter: boolean
    enteredInEternalFarming: string
}

export interface EternalFarming {
    id: string
    rewardToken: string
    bonusRewardToken: string
    pool: string
    startTime: string
    endTime: string
    reward: string
    bonusReward: string
    rewardRate: string
    bonusRewardRate: string
}

export interface DetachedEternalFarming extends EternalFarming {
    isDetached: boolean
}

export interface TickFarming {
    tickLower: number
    tickUpper: number
    token0: string
    token1: string
    liquidity: BigNumber
    rewardToken?: TokenSubgraph
    bonusRewardToken?: TokenSubgraph
    pool?: PoolSubgraph
    startTime?: string
    endTime?: string
}

export interface FormattedEternalFarming {
    apr: number
    bonusReward: string
    bonusRewardRate: string
    bonusRewardToken: TokenSubgraph
    endTime: string
    id: string
    pool: PoolChartSubgraph
    reward: string
    rewardRate: string
    rewardToken: TokenSubgraph
    startTime: string
}

export interface FarmingEvent extends DefaultFarmingEvent {
    pool: PoolSubgraph
    bonusRewardToken: TokenSubgraph
    rewardToken: TokenSubgraph
    level1multiplier: string
    level2multiplier: string
    level3multiplier: string
    algbAmountForLevel1: string
    algbAmountForLevel2: string
    algbAmountForLevel3: string
}

export interface FarmingEventString extends DefaultFarmingEvent {
    pool: string
    bonusRewardToken: string
    rewardToken: string
    createdAtTimestamp: string
}

export interface FutureFarmingEvent extends FarmingEventString {
    createdAtTimestamp: string
    multiplierToken: string
    algbAmountForLevel1: string
    algbAmountForLevel2: string
    algbAmountForLevel3: string
    level1multiplier: string
    level2multiplier: string
    level3multiplier: string
}

export interface Deposit {
    L2tokenId: string
    enteredInEternalFarming: string
    eternalBonusEarned: string | number
    eternalBonusRewardToken: TokenSubgraph
    eternalEarned: string | number
    eternalEndTime: string
    eternalFarming: string | null
    eternalRewardToken: TokenSubgraph
    eternalStartTime: string
    id: string
    incentive: null | string
    incentiveRewardToken: TokenSubgraph
    incentiveEarned: string | number
    incentiveBonusEarned: string | number
    incentiveBonusRewardToken: TokenSubgraph
    incentiveStartTime: number
    started: boolean
    incentiveEndTime: number
    createdAtTimestamp: number
    incentiveReward: string
    ended: boolean
    finiteAvailable: boolean
    eternalAvailable: boolean
    liquidity: BigNumber
    onFarmingCenter: boolean
    owner: string
    pool: PoolChartSubgraph
    tickLower: number
    tickUpper: number
    token0: string
    token1: string
    l2TokenId: string | null
    algbLocked: string
    level: string
    lockedToken: any
    oldFarming?: boolean
}

export interface StakeDefault {
    rewardToken: string
    bonusRewardToken: string
    pool: string
    startTime: string
    endTime: string
}

export interface DefaultFarming {
    hash: string | null
    id: string | null
}

export interface DefaultNFT {
    id: string
    onFarmingCenter: boolean
}

export interface ApprovedNFT {
    id: string
    approved: boolean
}

export interface DefaultFarmingWithError extends DefaultFarming {
    error?: unknown
}

export interface GetRewardsHashInterface {
    hash: string | null
    id: string | null
    farmingType: number | null
}

export interface GetRewardsHashInterfaceWithError extends GetRewardsHashInterface {
    error?: unknown
}

export interface EternalCollectRewardHandlerInterface {
    pool: PoolChartSubgraph
    eternalRewardToken: TokenSubgraph
    eternalBonusRewardToken: TokenSubgraph
    eternalStartTime: string
    eternalEndTime: string
}

export interface GetRewardsHandlerInterface extends EternalCollectRewardHandlerInterface {
    incentiveRewardToken: TokenSubgraph
    incentiveBonusRewardToken: TokenSubgraph
    incentiveStartTime: string
    incentiveEndTime: string
}

export interface RewardInterface {
    id: string | null
    state: string | null
    farmingType: number | null
}

export interface UnstakingInterface {
    id: string | null
    state: string | null
}

export interface FormattedRewardInterface {
    amount: number
    id: string
    name: string
    owner: string
    rewardAddress: string
    symbol: string
    trueAmount: string
}

export interface Aprs {
    [type: string]: number
}

export interface Reward {
    amount: string
    id: string
    name: string
    owner: string
    rewardAddress: string
    symbol: string
    trueAmount: string
}

export interface NTFInterface {
    onFarmingCenter?: boolean
    id?: string | undefined
}
