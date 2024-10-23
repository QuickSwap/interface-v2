import { ChainId } from '@uniswap/sdk';
import { Currency } from '@uniswap/sdk-core';
import {
  LiquidityDex,
  BillVersion,
  BillArtCollection,
  IchiSupportedDex,
} from '@ape.swap/apeswap-lists';

export interface BondToken {
  symbol: string;
  address: Partial<Record<ChainId, string>>;
  active: boolean;
  decimals?: Partial<Record<ChainId, number | null>>;
  dontFetch?: boolean;
  lpToken?: boolean;
  price?: number;
  liquidityDex?: Partial<Record<ChainId, LiquidityDex>>;
  getLpUrl?: Partial<Record<ChainId, string>>;
  ichiUnderlyingDex?: IchiSupportedDex;
}

export interface BondConfig {
  index: number;
  chainId: ChainId;
  contractAddress: Partial<Record<ChainId, string>>;
  billVersion: BillVersion;
  billType: string;
  lpToken: BondToken;
  earnToken: BondToken;
  billNnftAddress: Partial<Record<ChainId, string>>;
  inactive?: boolean;
  projectLink?: string;
  twitter?: string;
  initTime?: Partial<Record<ChainId, number>>;
  initPrice?: Partial<Record<ChainId, number>>;
  audit?: string;
  soldOut?: boolean;
  billArt?: {
    collection: BillArtCollection;
  };
  showcaseToken?: BondToken;
  bondPartner?: string;
  bannerURL?: string;
  shortDescription?: string;
  fullDescription?: string;
  tags?: string[];
  apeswapNote?: string;
  featuredURLS?: string[];
  partnersURLS?: string[];
  vestingTerm?: number;
  multiplier?: number;
  onlyPartner?: boolean;
}

export interface UserBondNft {
  image: string;
  tokenId: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
}

export interface UserBond {
  address: string;
  bond: Bond;
  id: string;
  vesting?: string;
  payout?: string;
  totalPayout?: string;
  truePricePaid?: string;
  lastBlockTimestamp?: string;
  pendingRewards?: string;
  billNftAddress?: string;
  nftData?: UserBondNft;
  loading?: boolean;
}

export interface Bond extends BondConfig {
  loading?: boolean;
  price?: string;
  priceUsd?: number;
  vestingTime?: string;
  discount?: number;
  currentDebt?: string;
  currentFee?: string;
  debtDecay?: string;
  debtRatio?: string;
  totalDebt?: string;
  totalPayoutGiven?: string;
  totalPrincipleBilled?: string;
  controlVariable?: string;
  minimumPrice?: string;
  maxPayout?: string;
  maxDebt?: string;
  lpPriceUsd?: number;
  earnTokenPrice?: number;
  userData?: {
    allowance?: string;
    stakingTokenBalance?: string;
    bills?: UserBond[];
  };
  userOwnedBillsData?: UserBond[];
  userOwnedBillsNftData?: UserBondNft[];
  maxTotalPayOut?: string;
  lpPrice?: number;
  maxPayoutTokens?: string;
}

export interface DualCurrencySelector {
  currencyA: Currency;
  currencyB: Currency | undefined;
}

export enum PurchasePath {
  Loading,
  LpPurchase,
  ApeZap,
  SoulZap,
  SoulZapApi,
}
