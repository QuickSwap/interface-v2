export interface ContestLeaderBoard {
  rank: number | string;
  origin: string;
  amountUSD: number;
  txCount: number;
  lensHandle?: string | undefined;
}

export interface TokenData {
  id: string;
  symbol: string;
}

export interface SwapDataV3 {
  id: string;
  timestamp: string;
  origin: string;
  token0: TokenData;
  token1: TokenData;
  amountUSD: string;
  amount0: string;
  amount1: string;
  sender: string;
}
