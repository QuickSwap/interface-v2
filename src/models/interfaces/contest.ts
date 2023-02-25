export interface ContestLeaderBoard {
  rank: number;
  origin: string;
  amountUSD: number;
  txCount: number;
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
