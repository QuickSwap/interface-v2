import { BigNumber } from 'ethers';

export interface PositionPool {
  fee: undefined | string;
  feeGrowthInside0LastX128: BigNumber;
  feeGrowthInside1LastX128: BigNumber;
  liquidity: BigNumber;
  nonce: BigNumber;
  operator: string;
  tickLower: number;
  tickUpper: number;
  token0: string;
  token1: string;
  tokenId: BigNumber;
  tokensOwed0: BigNumber;
  tokensOwed1: BigNumber;
  onFarming?: boolean;
  oldFarming?: boolean;
}
