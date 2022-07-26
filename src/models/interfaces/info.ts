import {
  FeeSubgraph,
  LastPoolSubgraph,
  TokenSubgraph,
} from './responseSubgraph';
import JSBI from 'jsbi';
import { Token } from '@uniswap/sdk-core';
import { FarmingType } from 'models/enums';

export interface FormattedPool {
  address: string;
  apr: number;
  farmingApr: number;
  aprType: FarmingType;
  exists: boolean;
  fee: string;
  token0: TokenSubgraph;
  token1: TokenSubgraph;
  totalValueLockedUSD: string;
  tvlUSD: number;
  tvlUSDChange: number;
  volumeUSD: number;
  volumeUSDChange: number;
  volumeUSDWeek: number;
  volumeUSDMonth: number;
}

export interface FormattedToken {
  address: string;
  exists: boolean;
  feesUSD: number;
  name: string;
  priceUSD: number;
  priceUSDChange: number;
  priceUSDChangeWeek: number;
  symbol: string;
  tvlToken: number;
  tvlUSD: number;
  tvlUSDChange: number;
  txCount: number;
  volumeUSD: number;
  volumeUSDChange: number;
  volumeUSDWeek: number;
}

export interface FormattedFee {
  data: FeeSubgraph[];
  previousData: FeeSubgraph[];
}

export interface FormattedChartPool {
  data: LastPoolSubgraph[];
  previousData: LastPoolSubgraph[];
}

export interface FormattedTotalStats {
  tvlUSD: number;
  volumeUSD: number;
}

export interface Liquidity {
  liquidityGross: string;
  liquidityNet: string;
  price0: string;
  price1: string;
  tickIdx: string;
}

export interface ActiveTick {
  liquidityActive: JSBI;
  tickIdx: number;
  liquidityNet: JSBI;
  price0: string;
  price1: string;
  liquidityGross: JSBI;
}

export interface TokenTick {
  address: string;
  chainId: number;
  decimals: number;
  isNative: boolean;
  isToken: boolean;
  name: string | undefined;
  symbol: string | undefined;
}

export interface FormattedTick {
  activeTickIdx: number;
  tickSpacing: number;
  token0: Token;
  token1: Token;
  ticksProcessed: ActiveTick[];
}

export interface FormattedFeeChart {
  timestamp: Date;
  value: number;
}

export interface LiquidityChartData {
  activeTickIdx: number;
  tickSpacing: number;
  ticksProcessed: FormattedProcessedData[];
  token0: TokenSubgraph;
  token1: TokenSubgraph;
}

export interface ProcessedData {
  activeLiquidity: number;
  index: number;
  isCurrent: boolean;
  price0: number;
  price1: number;
  token0: string;
  token1: string;
  tvlToken0: number;
  tvlToken1: number;
}

export interface FormattedProcessedData extends ProcessedData {
  tickIdx: number;
}

export interface FeeChart {
  data: FormattedFeeChart[] | undefined[];
  previousData: FormattedFeeChart[] | undefined[];
}

export interface FarmingPositions {
  id: string;
}

interface TickPriceRange {
  price0: string;
  price1: string;
}

interface TokenPriceRange {
  decimals: string;
}

interface TransactionPriceRange {
  timestamp: string;
}

export interface PositionPriceRange {
  closed: string;
  liquidity: string;
  id: string;
  owner: string;
  tickLower: TickPriceRange;
  tickUpper: TickPriceRange;
  token0: TokenPriceRange;
  token1: TokenPriceRange;
  transaction: TransactionPriceRange;
  timestamps: string[];
}

export interface PriceRangeClosed {
  [key: string]: {
    position: PositionPriceRange;
    timestamp: string;
  }[];
}

export interface PriceRangeChart {
  [key: string]: {
    token0Range: number[];
    token1Range: number[];
    startTime: string;
    endTime?: string;
    timestamps: string[];
  };
}
