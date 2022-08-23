import { api } from './slice';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigDecimal: any;
  BigInt: any;
  Bytes: any;
};

export type AlgebraDayData = {
  __typename?: 'AlgebraDayData';
  date: Scalars['Int'];
  feesUSD: Scalars['BigDecimal'];
  id: Scalars['ID'];
  tvlUSD: Scalars['BigDecimal'];
  txCount: Scalars['BigInt'];
  volumeMatic: Scalars['BigDecimal'];
  volumeUSD: Scalars['BigDecimal'];
  volumeUSDUntracked: Scalars['BigDecimal'];
};

export type AlgebraDayData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  date?: Maybe<Scalars['Int']>;
  date_gt?: Maybe<Scalars['Int']>;
  date_gte?: Maybe<Scalars['Int']>;
  date_in?: Maybe<Array<Scalars['Int']>>;
  date_lt?: Maybe<Scalars['Int']>;
  date_lte?: Maybe<Scalars['Int']>;
  date_not?: Maybe<Scalars['Int']>;
  date_not_in?: Maybe<Array<Scalars['Int']>>;
  feesUSD?: Maybe<Scalars['BigDecimal']>;
  feesUSD_gt?: Maybe<Scalars['BigDecimal']>;
  feesUSD_gte?: Maybe<Scalars['BigDecimal']>;
  feesUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  feesUSD_lt?: Maybe<Scalars['BigDecimal']>;
  feesUSD_lte?: Maybe<Scalars['BigDecimal']>;
  feesUSD_not?: Maybe<Scalars['BigDecimal']>;
  feesUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  tvlUSD?: Maybe<Scalars['BigDecimal']>;
  tvlUSD_gt?: Maybe<Scalars['BigDecimal']>;
  tvlUSD_gte?: Maybe<Scalars['BigDecimal']>;
  tvlUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  tvlUSD_lt?: Maybe<Scalars['BigDecimal']>;
  tvlUSD_lte?: Maybe<Scalars['BigDecimal']>;
  tvlUSD_not?: Maybe<Scalars['BigDecimal']>;
  tvlUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  txCount?: Maybe<Scalars['BigInt']>;
  txCount_gt?: Maybe<Scalars['BigInt']>;
  txCount_gte?: Maybe<Scalars['BigInt']>;
  txCount_in?: Maybe<Array<Scalars['BigInt']>>;
  txCount_lt?: Maybe<Scalars['BigInt']>;
  txCount_lte?: Maybe<Scalars['BigInt']>;
  txCount_not?: Maybe<Scalars['BigInt']>;
  txCount_not_in?: Maybe<Array<Scalars['BigInt']>>;
  volumeMatic?: Maybe<Scalars['BigDecimal']>;
  volumeMatic_gt?: Maybe<Scalars['BigDecimal']>;
  volumeMatic_gte?: Maybe<Scalars['BigDecimal']>;
  volumeMatic_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeMatic_lt?: Maybe<Scalars['BigDecimal']>;
  volumeMatic_lte?: Maybe<Scalars['BigDecimal']>;
  volumeMatic_not?: Maybe<Scalars['BigDecimal']>;
  volumeMatic_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeUSD?: Maybe<Scalars['BigDecimal']>;
  volumeUSDUntracked?: Maybe<Scalars['BigDecimal']>;
  volumeUSDUntracked_gt?: Maybe<Scalars['BigDecimal']>;
  volumeUSDUntracked_gte?: Maybe<Scalars['BigDecimal']>;
  volumeUSDUntracked_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeUSDUntracked_lt?: Maybe<Scalars['BigDecimal']>;
  volumeUSDUntracked_lte?: Maybe<Scalars['BigDecimal']>;
  volumeUSDUntracked_not?: Maybe<Scalars['BigDecimal']>;
  volumeUSDUntracked_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeUSD_gt?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_gte?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeUSD_lt?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_lte?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_not?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
};

export enum AlgebraDayData_OrderBy {
  Date = 'date',
  FeesUsd = 'feesUSD',
  Id = 'id',
  TvlUsd = 'tvlUSD',
  TxCount = 'txCount',
  VolumeMatic = 'volumeMatic',
  VolumeUsd = 'volumeUSD',
  VolumeUsdUntracked = 'volumeUSDUntracked',
}

export type Block = {
  __typename?: 'Block';
  author?: Maybe<Scalars['String']>;
  difficulty?: Maybe<Scalars['BigInt']>;
  gasLimit?: Maybe<Scalars['BigInt']>;
  gasUsed?: Maybe<Scalars['BigInt']>;
  id: Scalars['ID'];
  number: Scalars['BigInt'];
  parentHash?: Maybe<Scalars['String']>;
  receiptsRoot?: Maybe<Scalars['String']>;
  size?: Maybe<Scalars['BigInt']>;
  stateRoot?: Maybe<Scalars['String']>;
  timestamp: Scalars['BigInt'];
  totalDifficulty?: Maybe<Scalars['BigInt']>;
  transactionsRoot?: Maybe<Scalars['String']>;
  unclesHash?: Maybe<Scalars['String']>;
};

export type BlockChangedFilter = {
  number_gte: Scalars['Int'];
};

export type Block_Filter = {
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  author?: Maybe<Scalars['String']>;
  author_contains?: Maybe<Scalars['String']>;
  author_contains_nocase?: Maybe<Scalars['String']>;
  author_ends_with?: Maybe<Scalars['String']>;
  author_ends_with_nocase?: Maybe<Scalars['String']>;
  author_gt?: Maybe<Scalars['String']>;
  author_gte?: Maybe<Scalars['String']>;
  author_in?: Maybe<Array<Scalars['String']>>;
  author_lt?: Maybe<Scalars['String']>;
  author_lte?: Maybe<Scalars['String']>;
  author_not?: Maybe<Scalars['String']>;
  author_not_contains?: Maybe<Scalars['String']>;
  author_not_contains_nocase?: Maybe<Scalars['String']>;
  author_not_ends_with?: Maybe<Scalars['String']>;
  author_not_ends_with_nocase?: Maybe<Scalars['String']>;
  author_not_in?: Maybe<Array<Scalars['String']>>;
  author_not_starts_with?: Maybe<Scalars['String']>;
  author_not_starts_with_nocase?: Maybe<Scalars['String']>;
  author_starts_with?: Maybe<Scalars['String']>;
  author_starts_with_nocase?: Maybe<Scalars['String']>;
  difficulty?: Maybe<Scalars['BigInt']>;
  difficulty_gt?: Maybe<Scalars['BigInt']>;
  difficulty_gte?: Maybe<Scalars['BigInt']>;
  difficulty_in?: Maybe<Array<Scalars['BigInt']>>;
  difficulty_lt?: Maybe<Scalars['BigInt']>;
  difficulty_lte?: Maybe<Scalars['BigInt']>;
  difficulty_not?: Maybe<Scalars['BigInt']>;
  difficulty_not_in?: Maybe<Array<Scalars['BigInt']>>;
  gasLimit?: Maybe<Scalars['BigInt']>;
  gasLimit_gt?: Maybe<Scalars['BigInt']>;
  gasLimit_gte?: Maybe<Scalars['BigInt']>;
  gasLimit_in?: Maybe<Array<Scalars['BigInt']>>;
  gasLimit_lt?: Maybe<Scalars['BigInt']>;
  gasLimit_lte?: Maybe<Scalars['BigInt']>;
  gasLimit_not?: Maybe<Scalars['BigInt']>;
  gasLimit_not_in?: Maybe<Array<Scalars['BigInt']>>;
  gasUsed?: Maybe<Scalars['BigInt']>;
  gasUsed_gt?: Maybe<Scalars['BigInt']>;
  gasUsed_gte?: Maybe<Scalars['BigInt']>;
  gasUsed_in?: Maybe<Array<Scalars['BigInt']>>;
  gasUsed_lt?: Maybe<Scalars['BigInt']>;
  gasUsed_lte?: Maybe<Scalars['BigInt']>;
  gasUsed_not?: Maybe<Scalars['BigInt']>;
  gasUsed_not_in?: Maybe<Array<Scalars['BigInt']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  number?: Maybe<Scalars['BigInt']>;
  number_gt?: Maybe<Scalars['BigInt']>;
  number_gte?: Maybe<Scalars['BigInt']>;
  number_in?: Maybe<Array<Scalars['BigInt']>>;
  number_lt?: Maybe<Scalars['BigInt']>;
  number_lte?: Maybe<Scalars['BigInt']>;
  number_not?: Maybe<Scalars['BigInt']>;
  number_not_in?: Maybe<Array<Scalars['BigInt']>>;
  parentHash?: Maybe<Scalars['String']>;
  parentHash_contains?: Maybe<Scalars['String']>;
  parentHash_contains_nocase?: Maybe<Scalars['String']>;
  parentHash_ends_with?: Maybe<Scalars['String']>;
  parentHash_ends_with_nocase?: Maybe<Scalars['String']>;
  parentHash_gt?: Maybe<Scalars['String']>;
  parentHash_gte?: Maybe<Scalars['String']>;
  parentHash_in?: Maybe<Array<Scalars['String']>>;
  parentHash_lt?: Maybe<Scalars['String']>;
  parentHash_lte?: Maybe<Scalars['String']>;
  parentHash_not?: Maybe<Scalars['String']>;
  parentHash_not_contains?: Maybe<Scalars['String']>;
  parentHash_not_contains_nocase?: Maybe<Scalars['String']>;
  parentHash_not_ends_with?: Maybe<Scalars['String']>;
  parentHash_not_ends_with_nocase?: Maybe<Scalars['String']>;
  parentHash_not_in?: Maybe<Array<Scalars['String']>>;
  parentHash_not_starts_with?: Maybe<Scalars['String']>;
  parentHash_not_starts_with_nocase?: Maybe<Scalars['String']>;
  parentHash_starts_with?: Maybe<Scalars['String']>;
  parentHash_starts_with_nocase?: Maybe<Scalars['String']>;
  receiptsRoot?: Maybe<Scalars['String']>;
  receiptsRoot_contains?: Maybe<Scalars['String']>;
  receiptsRoot_contains_nocase?: Maybe<Scalars['String']>;
  receiptsRoot_ends_with?: Maybe<Scalars['String']>;
  receiptsRoot_ends_with_nocase?: Maybe<Scalars['String']>;
  receiptsRoot_gt?: Maybe<Scalars['String']>;
  receiptsRoot_gte?: Maybe<Scalars['String']>;
  receiptsRoot_in?: Maybe<Array<Scalars['String']>>;
  receiptsRoot_lt?: Maybe<Scalars['String']>;
  receiptsRoot_lte?: Maybe<Scalars['String']>;
  receiptsRoot_not?: Maybe<Scalars['String']>;
  receiptsRoot_not_contains?: Maybe<Scalars['String']>;
  receiptsRoot_not_contains_nocase?: Maybe<Scalars['String']>;
  receiptsRoot_not_ends_with?: Maybe<Scalars['String']>;
  receiptsRoot_not_ends_with_nocase?: Maybe<Scalars['String']>;
  receiptsRoot_not_in?: Maybe<Array<Scalars['String']>>;
  receiptsRoot_not_starts_with?: Maybe<Scalars['String']>;
  receiptsRoot_not_starts_with_nocase?: Maybe<Scalars['String']>;
  receiptsRoot_starts_with?: Maybe<Scalars['String']>;
  receiptsRoot_starts_with_nocase?: Maybe<Scalars['String']>;
  size?: Maybe<Scalars['BigInt']>;
  size_gt?: Maybe<Scalars['BigInt']>;
  size_gte?: Maybe<Scalars['BigInt']>;
  size_in?: Maybe<Array<Scalars['BigInt']>>;
  size_lt?: Maybe<Scalars['BigInt']>;
  size_lte?: Maybe<Scalars['BigInt']>;
  size_not?: Maybe<Scalars['BigInt']>;
  size_not_in?: Maybe<Array<Scalars['BigInt']>>;
  stateRoot?: Maybe<Scalars['String']>;
  stateRoot_contains?: Maybe<Scalars['String']>;
  stateRoot_contains_nocase?: Maybe<Scalars['String']>;
  stateRoot_ends_with?: Maybe<Scalars['String']>;
  stateRoot_ends_with_nocase?: Maybe<Scalars['String']>;
  stateRoot_gt?: Maybe<Scalars['String']>;
  stateRoot_gte?: Maybe<Scalars['String']>;
  stateRoot_in?: Maybe<Array<Scalars['String']>>;
  stateRoot_lt?: Maybe<Scalars['String']>;
  stateRoot_lte?: Maybe<Scalars['String']>;
  stateRoot_not?: Maybe<Scalars['String']>;
  stateRoot_not_contains?: Maybe<Scalars['String']>;
  stateRoot_not_contains_nocase?: Maybe<Scalars['String']>;
  stateRoot_not_ends_with?: Maybe<Scalars['String']>;
  stateRoot_not_ends_with_nocase?: Maybe<Scalars['String']>;
  stateRoot_not_in?: Maybe<Array<Scalars['String']>>;
  stateRoot_not_starts_with?: Maybe<Scalars['String']>;
  stateRoot_not_starts_with_nocase?: Maybe<Scalars['String']>;
  stateRoot_starts_with?: Maybe<Scalars['String']>;
  stateRoot_starts_with_nocase?: Maybe<Scalars['String']>;
  timestamp?: Maybe<Scalars['BigInt']>;
  timestamp_gt?: Maybe<Scalars['BigInt']>;
  timestamp_gte?: Maybe<Scalars['BigInt']>;
  timestamp_in?: Maybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: Maybe<Scalars['BigInt']>;
  timestamp_lte?: Maybe<Scalars['BigInt']>;
  timestamp_not?: Maybe<Scalars['BigInt']>;
  timestamp_not_in?: Maybe<Array<Scalars['BigInt']>>;
  totalDifficulty?: Maybe<Scalars['BigInt']>;
  totalDifficulty_gt?: Maybe<Scalars['BigInt']>;
  totalDifficulty_gte?: Maybe<Scalars['BigInt']>;
  totalDifficulty_in?: Maybe<Array<Scalars['BigInt']>>;
  totalDifficulty_lt?: Maybe<Scalars['BigInt']>;
  totalDifficulty_lte?: Maybe<Scalars['BigInt']>;
  totalDifficulty_not?: Maybe<Scalars['BigInt']>;
  totalDifficulty_not_in?: Maybe<Array<Scalars['BigInt']>>;
  transactionsRoot?: Maybe<Scalars['String']>;
  transactionsRoot_contains?: Maybe<Scalars['String']>;
  transactionsRoot_contains_nocase?: Maybe<Scalars['String']>;
  transactionsRoot_ends_with?: Maybe<Scalars['String']>;
  transactionsRoot_ends_with_nocase?: Maybe<Scalars['String']>;
  transactionsRoot_gt?: Maybe<Scalars['String']>;
  transactionsRoot_gte?: Maybe<Scalars['String']>;
  transactionsRoot_in?: Maybe<Array<Scalars['String']>>;
  transactionsRoot_lt?: Maybe<Scalars['String']>;
  transactionsRoot_lte?: Maybe<Scalars['String']>;
  transactionsRoot_not?: Maybe<Scalars['String']>;
  transactionsRoot_not_contains?: Maybe<Scalars['String']>;
  transactionsRoot_not_contains_nocase?: Maybe<Scalars['String']>;
  transactionsRoot_not_ends_with?: Maybe<Scalars['String']>;
  transactionsRoot_not_ends_with_nocase?: Maybe<Scalars['String']>;
  transactionsRoot_not_in?: Maybe<Array<Scalars['String']>>;
  transactionsRoot_not_starts_with?: Maybe<Scalars['String']>;
  transactionsRoot_not_starts_with_nocase?: Maybe<Scalars['String']>;
  transactionsRoot_starts_with?: Maybe<Scalars['String']>;
  transactionsRoot_starts_with_nocase?: Maybe<Scalars['String']>;
  unclesHash?: Maybe<Scalars['String']>;
  unclesHash_contains?: Maybe<Scalars['String']>;
  unclesHash_contains_nocase?: Maybe<Scalars['String']>;
  unclesHash_ends_with?: Maybe<Scalars['String']>;
  unclesHash_ends_with_nocase?: Maybe<Scalars['String']>;
  unclesHash_gt?: Maybe<Scalars['String']>;
  unclesHash_gte?: Maybe<Scalars['String']>;
  unclesHash_in?: Maybe<Array<Scalars['String']>>;
  unclesHash_lt?: Maybe<Scalars['String']>;
  unclesHash_lte?: Maybe<Scalars['String']>;
  unclesHash_not?: Maybe<Scalars['String']>;
  unclesHash_not_contains?: Maybe<Scalars['String']>;
  unclesHash_not_contains_nocase?: Maybe<Scalars['String']>;
  unclesHash_not_ends_with?: Maybe<Scalars['String']>;
  unclesHash_not_ends_with_nocase?: Maybe<Scalars['String']>;
  unclesHash_not_in?: Maybe<Array<Scalars['String']>>;
  unclesHash_not_starts_with?: Maybe<Scalars['String']>;
  unclesHash_not_starts_with_nocase?: Maybe<Scalars['String']>;
  unclesHash_starts_with?: Maybe<Scalars['String']>;
  unclesHash_starts_with_nocase?: Maybe<Scalars['String']>;
};

export type Block_Height = {
  hash?: Maybe<Scalars['Bytes']>;
  number?: Maybe<Scalars['Int']>;
  number_gte?: Maybe<Scalars['Int']>;
};

export enum Block_OrderBy {
  Author = 'author',
  Difficulty = 'difficulty',
  GasLimit = 'gasLimit',
  GasUsed = 'gasUsed',
  Id = 'id',
  Number = 'number',
  ParentHash = 'parentHash',
  ReceiptsRoot = 'receiptsRoot',
  Size = 'size',
  StateRoot = 'stateRoot',
  Timestamp = 'timestamp',
  TotalDifficulty = 'totalDifficulty',
  TransactionsRoot = 'transactionsRoot',
  UnclesHash = 'unclesHash',
}

export type Bundle = {
  __typename?: 'Bundle';
  id: Scalars['ID'];
  maticPriceUSD: Scalars['BigDecimal'];
};

export type Bundle_Filter = {
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  maticPriceUSD?: Maybe<Scalars['BigDecimal']>;
  maticPriceUSD_gt?: Maybe<Scalars['BigDecimal']>;
  maticPriceUSD_gte?: Maybe<Scalars['BigDecimal']>;
  maticPriceUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  maticPriceUSD_lt?: Maybe<Scalars['BigDecimal']>;
  maticPriceUSD_lte?: Maybe<Scalars['BigDecimal']>;
  maticPriceUSD_not?: Maybe<Scalars['BigDecimal']>;
  maticPriceUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
};

export enum Bundle_OrderBy {
  Id = 'id',
  MaticPriceUsd = 'maticPriceUSD',
}

export type Burn = {
  __typename?: 'Burn';
  amount: Scalars['BigInt'];
  amount0: Scalars['BigDecimal'];
  amount1: Scalars['BigDecimal'];
  amountUSD?: Maybe<Scalars['BigDecimal']>;
  id: Scalars['ID'];
  logIndex?: Maybe<Scalars['BigInt']>;
  origin: Scalars['Bytes'];
  owner?: Maybe<Scalars['Bytes']>;
  pool: Pool;
  tickLower: Scalars['BigInt'];
  tickUpper: Scalars['BigInt'];
  timestamp: Scalars['BigInt'];
  token0: Token;
  token1: Token;
  transaction: Transaction;
};

export type Burn_Filter = {
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  amount?: Maybe<Scalars['BigInt']>;
  amount0?: Maybe<Scalars['BigDecimal']>;
  amount0_gt?: Maybe<Scalars['BigDecimal']>;
  amount0_gte?: Maybe<Scalars['BigDecimal']>;
  amount0_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amount0_lt?: Maybe<Scalars['BigDecimal']>;
  amount0_lte?: Maybe<Scalars['BigDecimal']>;
  amount0_not?: Maybe<Scalars['BigDecimal']>;
  amount0_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amount1?: Maybe<Scalars['BigDecimal']>;
  amount1_gt?: Maybe<Scalars['BigDecimal']>;
  amount1_gte?: Maybe<Scalars['BigDecimal']>;
  amount1_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amount1_lt?: Maybe<Scalars['BigDecimal']>;
  amount1_lte?: Maybe<Scalars['BigDecimal']>;
  amount1_not?: Maybe<Scalars['BigDecimal']>;
  amount1_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amountUSD?: Maybe<Scalars['BigDecimal']>;
  amountUSD_gt?: Maybe<Scalars['BigDecimal']>;
  amountUSD_gte?: Maybe<Scalars['BigDecimal']>;
  amountUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amountUSD_lt?: Maybe<Scalars['BigDecimal']>;
  amountUSD_lte?: Maybe<Scalars['BigDecimal']>;
  amountUSD_not?: Maybe<Scalars['BigDecimal']>;
  amountUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amount_gt?: Maybe<Scalars['BigInt']>;
  amount_gte?: Maybe<Scalars['BigInt']>;
  amount_in?: Maybe<Array<Scalars['BigInt']>>;
  amount_lt?: Maybe<Scalars['BigInt']>;
  amount_lte?: Maybe<Scalars['BigInt']>;
  amount_not?: Maybe<Scalars['BigInt']>;
  amount_not_in?: Maybe<Array<Scalars['BigInt']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  logIndex?: Maybe<Scalars['BigInt']>;
  logIndex_gt?: Maybe<Scalars['BigInt']>;
  logIndex_gte?: Maybe<Scalars['BigInt']>;
  logIndex_in?: Maybe<Array<Scalars['BigInt']>>;
  logIndex_lt?: Maybe<Scalars['BigInt']>;
  logIndex_lte?: Maybe<Scalars['BigInt']>;
  logIndex_not?: Maybe<Scalars['BigInt']>;
  logIndex_not_in?: Maybe<Array<Scalars['BigInt']>>;
  origin?: Maybe<Scalars['Bytes']>;
  origin_contains?: Maybe<Scalars['Bytes']>;
  origin_in?: Maybe<Array<Scalars['Bytes']>>;
  origin_not?: Maybe<Scalars['Bytes']>;
  origin_not_contains?: Maybe<Scalars['Bytes']>;
  origin_not_in?: Maybe<Array<Scalars['Bytes']>>;
  owner?: Maybe<Scalars['Bytes']>;
  owner_contains?: Maybe<Scalars['Bytes']>;
  owner_in?: Maybe<Array<Scalars['Bytes']>>;
  owner_not?: Maybe<Scalars['Bytes']>;
  owner_not_contains?: Maybe<Scalars['Bytes']>;
  owner_not_in?: Maybe<Array<Scalars['Bytes']>>;
  pool?: Maybe<Scalars['String']>;
  pool_?: Maybe<Pool_Filter>;
  pool_contains?: Maybe<Scalars['String']>;
  pool_contains_nocase?: Maybe<Scalars['String']>;
  pool_ends_with?: Maybe<Scalars['String']>;
  pool_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_gt?: Maybe<Scalars['String']>;
  pool_gte?: Maybe<Scalars['String']>;
  pool_in?: Maybe<Array<Scalars['String']>>;
  pool_lt?: Maybe<Scalars['String']>;
  pool_lte?: Maybe<Scalars['String']>;
  pool_not?: Maybe<Scalars['String']>;
  pool_not_contains?: Maybe<Scalars['String']>;
  pool_not_contains_nocase?: Maybe<Scalars['String']>;
  pool_not_ends_with?: Maybe<Scalars['String']>;
  pool_not_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_not_in?: Maybe<Array<Scalars['String']>>;
  pool_not_starts_with?: Maybe<Scalars['String']>;
  pool_not_starts_with_nocase?: Maybe<Scalars['String']>;
  pool_starts_with?: Maybe<Scalars['String']>;
  pool_starts_with_nocase?: Maybe<Scalars['String']>;
  tickLower?: Maybe<Scalars['BigInt']>;
  tickLower_gt?: Maybe<Scalars['BigInt']>;
  tickLower_gte?: Maybe<Scalars['BigInt']>;
  tickLower_in?: Maybe<Array<Scalars['BigInt']>>;
  tickLower_lt?: Maybe<Scalars['BigInt']>;
  tickLower_lte?: Maybe<Scalars['BigInt']>;
  tickLower_not?: Maybe<Scalars['BigInt']>;
  tickLower_not_in?: Maybe<Array<Scalars['BigInt']>>;
  tickUpper?: Maybe<Scalars['BigInt']>;
  tickUpper_gt?: Maybe<Scalars['BigInt']>;
  tickUpper_gte?: Maybe<Scalars['BigInt']>;
  tickUpper_in?: Maybe<Array<Scalars['BigInt']>>;
  tickUpper_lt?: Maybe<Scalars['BigInt']>;
  tickUpper_lte?: Maybe<Scalars['BigInt']>;
  tickUpper_not?: Maybe<Scalars['BigInt']>;
  tickUpper_not_in?: Maybe<Array<Scalars['BigInt']>>;
  timestamp?: Maybe<Scalars['BigInt']>;
  timestamp_gt?: Maybe<Scalars['BigInt']>;
  timestamp_gte?: Maybe<Scalars['BigInt']>;
  timestamp_in?: Maybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: Maybe<Scalars['BigInt']>;
  timestamp_lte?: Maybe<Scalars['BigInt']>;
  timestamp_not?: Maybe<Scalars['BigInt']>;
  timestamp_not_in?: Maybe<Array<Scalars['BigInt']>>;
  token0?: Maybe<Scalars['String']>;
  token0_?: Maybe<Token_Filter>;
  token0_contains?: Maybe<Scalars['String']>;
  token0_contains_nocase?: Maybe<Scalars['String']>;
  token0_ends_with?: Maybe<Scalars['String']>;
  token0_ends_with_nocase?: Maybe<Scalars['String']>;
  token0_gt?: Maybe<Scalars['String']>;
  token0_gte?: Maybe<Scalars['String']>;
  token0_in?: Maybe<Array<Scalars['String']>>;
  token0_lt?: Maybe<Scalars['String']>;
  token0_lte?: Maybe<Scalars['String']>;
  token0_not?: Maybe<Scalars['String']>;
  token0_not_contains?: Maybe<Scalars['String']>;
  token0_not_contains_nocase?: Maybe<Scalars['String']>;
  token0_not_ends_with?: Maybe<Scalars['String']>;
  token0_not_ends_with_nocase?: Maybe<Scalars['String']>;
  token0_not_in?: Maybe<Array<Scalars['String']>>;
  token0_not_starts_with?: Maybe<Scalars['String']>;
  token0_not_starts_with_nocase?: Maybe<Scalars['String']>;
  token0_starts_with?: Maybe<Scalars['String']>;
  token0_starts_with_nocase?: Maybe<Scalars['String']>;
  token1?: Maybe<Scalars['String']>;
  token1_?: Maybe<Token_Filter>;
  token1_contains?: Maybe<Scalars['String']>;
  token1_contains_nocase?: Maybe<Scalars['String']>;
  token1_ends_with?: Maybe<Scalars['String']>;
  token1_ends_with_nocase?: Maybe<Scalars['String']>;
  token1_gt?: Maybe<Scalars['String']>;
  token1_gte?: Maybe<Scalars['String']>;
  token1_in?: Maybe<Array<Scalars['String']>>;
  token1_lt?: Maybe<Scalars['String']>;
  token1_lte?: Maybe<Scalars['String']>;
  token1_not?: Maybe<Scalars['String']>;
  token1_not_contains?: Maybe<Scalars['String']>;
  token1_not_contains_nocase?: Maybe<Scalars['String']>;
  token1_not_ends_with?: Maybe<Scalars['String']>;
  token1_not_ends_with_nocase?: Maybe<Scalars['String']>;
  token1_not_in?: Maybe<Array<Scalars['String']>>;
  token1_not_starts_with?: Maybe<Scalars['String']>;
  token1_not_starts_with_nocase?: Maybe<Scalars['String']>;
  token1_starts_with?: Maybe<Scalars['String']>;
  token1_starts_with_nocase?: Maybe<Scalars['String']>;
  transaction?: Maybe<Scalars['String']>;
  transaction_?: Maybe<Transaction_Filter>;
  transaction_contains?: Maybe<Scalars['String']>;
  transaction_contains_nocase?: Maybe<Scalars['String']>;
  transaction_ends_with?: Maybe<Scalars['String']>;
  transaction_ends_with_nocase?: Maybe<Scalars['String']>;
  transaction_gt?: Maybe<Scalars['String']>;
  transaction_gte?: Maybe<Scalars['String']>;
  transaction_in?: Maybe<Array<Scalars['String']>>;
  transaction_lt?: Maybe<Scalars['String']>;
  transaction_lte?: Maybe<Scalars['String']>;
  transaction_not?: Maybe<Scalars['String']>;
  transaction_not_contains?: Maybe<Scalars['String']>;
  transaction_not_contains_nocase?: Maybe<Scalars['String']>;
  transaction_not_ends_with?: Maybe<Scalars['String']>;
  transaction_not_ends_with_nocase?: Maybe<Scalars['String']>;
  transaction_not_in?: Maybe<Array<Scalars['String']>>;
  transaction_not_starts_with?: Maybe<Scalars['String']>;
  transaction_not_starts_with_nocase?: Maybe<Scalars['String']>;
  transaction_starts_with?: Maybe<Scalars['String']>;
  transaction_starts_with_nocase?: Maybe<Scalars['String']>;
};

export enum Burn_OrderBy {
  Amount = 'amount',
  Amount0 = 'amount0',
  Amount1 = 'amount1',
  AmountUsd = 'amountUSD',
  Id = 'id',
  LogIndex = 'logIndex',
  Origin = 'origin',
  Owner = 'owner',
  Pool = 'pool',
  TickLower = 'tickLower',
  TickUpper = 'tickUpper',
  Timestamp = 'timestamp',
  Token0 = 'token0',
  Token1 = 'token1',
  Transaction = 'transaction',
}

export type Collect = {
  __typename?: 'Collect';
  amount0: Scalars['BigDecimal'];
  amount1: Scalars['BigDecimal'];
  amountUSD?: Maybe<Scalars['BigDecimal']>;
  id: Scalars['ID'];
  logIndex?: Maybe<Scalars['BigInt']>;
  owner?: Maybe<Scalars['Bytes']>;
  pool: Pool;
  tickLower: Scalars['BigInt'];
  tickUpper: Scalars['BigInt'];
  timestamp: Scalars['BigInt'];
  transaction: Transaction;
};

export type Collect_Filter = {
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  amount0?: Maybe<Scalars['BigDecimal']>;
  amount0_gt?: Maybe<Scalars['BigDecimal']>;
  amount0_gte?: Maybe<Scalars['BigDecimal']>;
  amount0_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amount0_lt?: Maybe<Scalars['BigDecimal']>;
  amount0_lte?: Maybe<Scalars['BigDecimal']>;
  amount0_not?: Maybe<Scalars['BigDecimal']>;
  amount0_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amount1?: Maybe<Scalars['BigDecimal']>;
  amount1_gt?: Maybe<Scalars['BigDecimal']>;
  amount1_gte?: Maybe<Scalars['BigDecimal']>;
  amount1_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amount1_lt?: Maybe<Scalars['BigDecimal']>;
  amount1_lte?: Maybe<Scalars['BigDecimal']>;
  amount1_not?: Maybe<Scalars['BigDecimal']>;
  amount1_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amountUSD?: Maybe<Scalars['BigDecimal']>;
  amountUSD_gt?: Maybe<Scalars['BigDecimal']>;
  amountUSD_gte?: Maybe<Scalars['BigDecimal']>;
  amountUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amountUSD_lt?: Maybe<Scalars['BigDecimal']>;
  amountUSD_lte?: Maybe<Scalars['BigDecimal']>;
  amountUSD_not?: Maybe<Scalars['BigDecimal']>;
  amountUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  logIndex?: Maybe<Scalars['BigInt']>;
  logIndex_gt?: Maybe<Scalars['BigInt']>;
  logIndex_gte?: Maybe<Scalars['BigInt']>;
  logIndex_in?: Maybe<Array<Scalars['BigInt']>>;
  logIndex_lt?: Maybe<Scalars['BigInt']>;
  logIndex_lte?: Maybe<Scalars['BigInt']>;
  logIndex_not?: Maybe<Scalars['BigInt']>;
  logIndex_not_in?: Maybe<Array<Scalars['BigInt']>>;
  owner?: Maybe<Scalars['Bytes']>;
  owner_contains?: Maybe<Scalars['Bytes']>;
  owner_in?: Maybe<Array<Scalars['Bytes']>>;
  owner_not?: Maybe<Scalars['Bytes']>;
  owner_not_contains?: Maybe<Scalars['Bytes']>;
  owner_not_in?: Maybe<Array<Scalars['Bytes']>>;
  pool?: Maybe<Scalars['String']>;
  pool_?: Maybe<Pool_Filter>;
  pool_contains?: Maybe<Scalars['String']>;
  pool_contains_nocase?: Maybe<Scalars['String']>;
  pool_ends_with?: Maybe<Scalars['String']>;
  pool_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_gt?: Maybe<Scalars['String']>;
  pool_gte?: Maybe<Scalars['String']>;
  pool_in?: Maybe<Array<Scalars['String']>>;
  pool_lt?: Maybe<Scalars['String']>;
  pool_lte?: Maybe<Scalars['String']>;
  pool_not?: Maybe<Scalars['String']>;
  pool_not_contains?: Maybe<Scalars['String']>;
  pool_not_contains_nocase?: Maybe<Scalars['String']>;
  pool_not_ends_with?: Maybe<Scalars['String']>;
  pool_not_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_not_in?: Maybe<Array<Scalars['String']>>;
  pool_not_starts_with?: Maybe<Scalars['String']>;
  pool_not_starts_with_nocase?: Maybe<Scalars['String']>;
  pool_starts_with?: Maybe<Scalars['String']>;
  pool_starts_with_nocase?: Maybe<Scalars['String']>;
  tickLower?: Maybe<Scalars['BigInt']>;
  tickLower_gt?: Maybe<Scalars['BigInt']>;
  tickLower_gte?: Maybe<Scalars['BigInt']>;
  tickLower_in?: Maybe<Array<Scalars['BigInt']>>;
  tickLower_lt?: Maybe<Scalars['BigInt']>;
  tickLower_lte?: Maybe<Scalars['BigInt']>;
  tickLower_not?: Maybe<Scalars['BigInt']>;
  tickLower_not_in?: Maybe<Array<Scalars['BigInt']>>;
  tickUpper?: Maybe<Scalars['BigInt']>;
  tickUpper_gt?: Maybe<Scalars['BigInt']>;
  tickUpper_gte?: Maybe<Scalars['BigInt']>;
  tickUpper_in?: Maybe<Array<Scalars['BigInt']>>;
  tickUpper_lt?: Maybe<Scalars['BigInt']>;
  tickUpper_lte?: Maybe<Scalars['BigInt']>;
  tickUpper_not?: Maybe<Scalars['BigInt']>;
  tickUpper_not_in?: Maybe<Array<Scalars['BigInt']>>;
  timestamp?: Maybe<Scalars['BigInt']>;
  timestamp_gt?: Maybe<Scalars['BigInt']>;
  timestamp_gte?: Maybe<Scalars['BigInt']>;
  timestamp_in?: Maybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: Maybe<Scalars['BigInt']>;
  timestamp_lte?: Maybe<Scalars['BigInt']>;
  timestamp_not?: Maybe<Scalars['BigInt']>;
  timestamp_not_in?: Maybe<Array<Scalars['BigInt']>>;
  transaction?: Maybe<Scalars['String']>;
  transaction_?: Maybe<Transaction_Filter>;
  transaction_contains?: Maybe<Scalars['String']>;
  transaction_contains_nocase?: Maybe<Scalars['String']>;
  transaction_ends_with?: Maybe<Scalars['String']>;
  transaction_ends_with_nocase?: Maybe<Scalars['String']>;
  transaction_gt?: Maybe<Scalars['String']>;
  transaction_gte?: Maybe<Scalars['String']>;
  transaction_in?: Maybe<Array<Scalars['String']>>;
  transaction_lt?: Maybe<Scalars['String']>;
  transaction_lte?: Maybe<Scalars['String']>;
  transaction_not?: Maybe<Scalars['String']>;
  transaction_not_contains?: Maybe<Scalars['String']>;
  transaction_not_contains_nocase?: Maybe<Scalars['String']>;
  transaction_not_ends_with?: Maybe<Scalars['String']>;
  transaction_not_ends_with_nocase?: Maybe<Scalars['String']>;
  transaction_not_in?: Maybe<Array<Scalars['String']>>;
  transaction_not_starts_with?: Maybe<Scalars['String']>;
  transaction_not_starts_with_nocase?: Maybe<Scalars['String']>;
  transaction_starts_with?: Maybe<Scalars['String']>;
  transaction_starts_with_nocase?: Maybe<Scalars['String']>;
};

export enum Collect_OrderBy {
  Amount0 = 'amount0',
  Amount1 = 'amount1',
  AmountUsd = 'amountUSD',
  Id = 'id',
  LogIndex = 'logIndex',
  Owner = 'owner',
  Pool = 'pool',
  TickLower = 'tickLower',
  TickUpper = 'tickUpper',
  Timestamp = 'timestamp',
  Transaction = 'transaction',
}

export type Deposit = {
  __typename?: 'Deposit';
  L2tokenId: Scalars['BigInt'];
  enteredInEternalFarming?: Maybe<Scalars['BigInt']>;
  eternalFarming?: Maybe<Scalars['Bytes']>;
  id: Scalars['ID'];
  limitFarming?: Maybe<Scalars['Bytes']>;
  liquidity: Scalars['BigInt'];
  onFarmingCenter: Scalars['Boolean'];
  owner: Scalars['Bytes'];
  pool: Scalars['Bytes'];
  rangeLength: Scalars['BigInt'];
  tierEternal: Scalars['BigInt'];
  tierLimit: Scalars['BigInt'];
  tokensLockedEternal: Scalars['BigInt'];
  tokensLockedLimit: Scalars['BigInt'];
};

export type Deposit_Filter = {
  L2tokenId?: Maybe<Scalars['BigInt']>;
  L2tokenId_gt?: Maybe<Scalars['BigInt']>;
  L2tokenId_gte?: Maybe<Scalars['BigInt']>;
  L2tokenId_in?: Maybe<Array<Scalars['BigInt']>>;
  L2tokenId_lt?: Maybe<Scalars['BigInt']>;
  L2tokenId_lte?: Maybe<Scalars['BigInt']>;
  L2tokenId_not?: Maybe<Scalars['BigInt']>;
  L2tokenId_not_in?: Maybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  enteredInEternalFarming?: Maybe<Scalars['BigInt']>;
  enteredInEternalFarming_gt?: Maybe<Scalars['BigInt']>;
  enteredInEternalFarming_gte?: Maybe<Scalars['BigInt']>;
  enteredInEternalFarming_in?: Maybe<Array<Scalars['BigInt']>>;
  enteredInEternalFarming_lt?: Maybe<Scalars['BigInt']>;
  enteredInEternalFarming_lte?: Maybe<Scalars['BigInt']>;
  enteredInEternalFarming_not?: Maybe<Scalars['BigInt']>;
  enteredInEternalFarming_not_in?: Maybe<Array<Scalars['BigInt']>>;
  eternalFarming?: Maybe<Scalars['Bytes']>;
  eternalFarming_contains?: Maybe<Scalars['Bytes']>;
  eternalFarming_in?: Maybe<Array<Scalars['Bytes']>>;
  eternalFarming_not?: Maybe<Scalars['Bytes']>;
  eternalFarming_not_contains?: Maybe<Scalars['Bytes']>;
  eternalFarming_not_in?: Maybe<Array<Scalars['Bytes']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  limitFarming?: Maybe<Scalars['Bytes']>;
  limitFarming_contains?: Maybe<Scalars['Bytes']>;
  limitFarming_in?: Maybe<Array<Scalars['Bytes']>>;
  limitFarming_not?: Maybe<Scalars['Bytes']>;
  limitFarming_not_contains?: Maybe<Scalars['Bytes']>;
  limitFarming_not_in?: Maybe<Array<Scalars['Bytes']>>;
  liquidity?: Maybe<Scalars['BigInt']>;
  liquidity_gt?: Maybe<Scalars['BigInt']>;
  liquidity_gte?: Maybe<Scalars['BigInt']>;
  liquidity_in?: Maybe<Array<Scalars['BigInt']>>;
  liquidity_lt?: Maybe<Scalars['BigInt']>;
  liquidity_lte?: Maybe<Scalars['BigInt']>;
  liquidity_not?: Maybe<Scalars['BigInt']>;
  liquidity_not_in?: Maybe<Array<Scalars['BigInt']>>;
  onFarmingCenter?: Maybe<Scalars['Boolean']>;
  onFarmingCenter_in?: Maybe<Array<Scalars['Boolean']>>;
  onFarmingCenter_not?: Maybe<Scalars['Boolean']>;
  onFarmingCenter_not_in?: Maybe<Array<Scalars['Boolean']>>;
  owner?: Maybe<Scalars['Bytes']>;
  owner_contains?: Maybe<Scalars['Bytes']>;
  owner_in?: Maybe<Array<Scalars['Bytes']>>;
  owner_not?: Maybe<Scalars['Bytes']>;
  owner_not_contains?: Maybe<Scalars['Bytes']>;
  owner_not_in?: Maybe<Array<Scalars['Bytes']>>;
  pool?: Maybe<Scalars['Bytes']>;
  pool_contains?: Maybe<Scalars['Bytes']>;
  pool_in?: Maybe<Array<Scalars['Bytes']>>;
  pool_not?: Maybe<Scalars['Bytes']>;
  pool_not_contains?: Maybe<Scalars['Bytes']>;
  pool_not_in?: Maybe<Array<Scalars['Bytes']>>;
  rangeLength?: Maybe<Scalars['BigInt']>;
  rangeLength_gt?: Maybe<Scalars['BigInt']>;
  rangeLength_gte?: Maybe<Scalars['BigInt']>;
  rangeLength_in?: Maybe<Array<Scalars['BigInt']>>;
  rangeLength_lt?: Maybe<Scalars['BigInt']>;
  rangeLength_lte?: Maybe<Scalars['BigInt']>;
  rangeLength_not?: Maybe<Scalars['BigInt']>;
  rangeLength_not_in?: Maybe<Array<Scalars['BigInt']>>;
  tierEternal?: Maybe<Scalars['BigInt']>;
  tierEternal_gt?: Maybe<Scalars['BigInt']>;
  tierEternal_gte?: Maybe<Scalars['BigInt']>;
  tierEternal_in?: Maybe<Array<Scalars['BigInt']>>;
  tierEternal_lt?: Maybe<Scalars['BigInt']>;
  tierEternal_lte?: Maybe<Scalars['BigInt']>;
  tierEternal_not?: Maybe<Scalars['BigInt']>;
  tierEternal_not_in?: Maybe<Array<Scalars['BigInt']>>;
  tierLimit?: Maybe<Scalars['BigInt']>;
  tierLimit_gt?: Maybe<Scalars['BigInt']>;
  tierLimit_gte?: Maybe<Scalars['BigInt']>;
  tierLimit_in?: Maybe<Array<Scalars['BigInt']>>;
  tierLimit_lt?: Maybe<Scalars['BigInt']>;
  tierLimit_lte?: Maybe<Scalars['BigInt']>;
  tierLimit_not?: Maybe<Scalars['BigInt']>;
  tierLimit_not_in?: Maybe<Array<Scalars['BigInt']>>;
  tokensLockedEternal?: Maybe<Scalars['BigInt']>;
  tokensLockedEternal_gt?: Maybe<Scalars['BigInt']>;
  tokensLockedEternal_gte?: Maybe<Scalars['BigInt']>;
  tokensLockedEternal_in?: Maybe<Array<Scalars['BigInt']>>;
  tokensLockedEternal_lt?: Maybe<Scalars['BigInt']>;
  tokensLockedEternal_lte?: Maybe<Scalars['BigInt']>;
  tokensLockedEternal_not?: Maybe<Scalars['BigInt']>;
  tokensLockedEternal_not_in?: Maybe<Array<Scalars['BigInt']>>;
  tokensLockedLimit?: Maybe<Scalars['BigInt']>;
  tokensLockedLimit_gt?: Maybe<Scalars['BigInt']>;
  tokensLockedLimit_gte?: Maybe<Scalars['BigInt']>;
  tokensLockedLimit_in?: Maybe<Array<Scalars['BigInt']>>;
  tokensLockedLimit_lt?: Maybe<Scalars['BigInt']>;
  tokensLockedLimit_lte?: Maybe<Scalars['BigInt']>;
  tokensLockedLimit_not?: Maybe<Scalars['BigInt']>;
  tokensLockedLimit_not_in?: Maybe<Array<Scalars['BigInt']>>;
};

export enum Deposit_OrderBy {
  L2tokenId = 'L2tokenId',
  EnteredInEternalFarming = 'enteredInEternalFarming',
  EternalFarming = 'eternalFarming',
  Id = 'id',
  LimitFarming = 'limitFarming',
  Liquidity = 'liquidity',
  OnFarmingCenter = 'onFarmingCenter',
  Owner = 'owner',
  Pool = 'pool',
  RangeLength = 'rangeLength',
  TierEternal = 'tierEternal',
  TierLimit = 'tierLimit',
  TokensLockedEternal = 'tokensLockedEternal',
  TokensLockedLimit = 'tokensLockedLimit',
}

export type EternalFarming = {
  __typename?: 'EternalFarming';
  bonusReward: Scalars['BigInt'];
  bonusRewardRate: Scalars['BigInt'];
  bonusRewardToken: Scalars['Bytes'];
  endTime: Scalars['BigInt'];
  id: Scalars['ID'];
  isDetached?: Maybe<Scalars['Boolean']>;
  minRangeLength: Scalars['BigInt'];
  multiplierToken: Scalars['Bytes'];
  pool: Scalars['Bytes'];
  reward: Scalars['BigInt'];
  rewardRate: Scalars['BigInt'];
  rewardToken: Scalars['Bytes'];
  startTime: Scalars['BigInt'];
  tier1Multiplier: Scalars['BigInt'];
  tier2Multiplier: Scalars['BigInt'];
  tier3Multiplier: Scalars['BigInt'];
  tokenAmountForTier1: Scalars['BigInt'];
  tokenAmountForTier2: Scalars['BigInt'];
  tokenAmountForTier3: Scalars['BigInt'];
  virtualPool: Scalars['Bytes'];
};

export type EternalFarming_Filter = {
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  bonusReward?: Maybe<Scalars['BigInt']>;
  bonusRewardRate?: Maybe<Scalars['BigInt']>;
  bonusRewardRate_gt?: Maybe<Scalars['BigInt']>;
  bonusRewardRate_gte?: Maybe<Scalars['BigInt']>;
  bonusRewardRate_in?: Maybe<Array<Scalars['BigInt']>>;
  bonusRewardRate_lt?: Maybe<Scalars['BigInt']>;
  bonusRewardRate_lte?: Maybe<Scalars['BigInt']>;
  bonusRewardRate_not?: Maybe<Scalars['BigInt']>;
  bonusRewardRate_not_in?: Maybe<Array<Scalars['BigInt']>>;
  bonusRewardToken?: Maybe<Scalars['Bytes']>;
  bonusRewardToken_contains?: Maybe<Scalars['Bytes']>;
  bonusRewardToken_in?: Maybe<Array<Scalars['Bytes']>>;
  bonusRewardToken_not?: Maybe<Scalars['Bytes']>;
  bonusRewardToken_not_contains?: Maybe<Scalars['Bytes']>;
  bonusRewardToken_not_in?: Maybe<Array<Scalars['Bytes']>>;
  bonusReward_gt?: Maybe<Scalars['BigInt']>;
  bonusReward_gte?: Maybe<Scalars['BigInt']>;
  bonusReward_in?: Maybe<Array<Scalars['BigInt']>>;
  bonusReward_lt?: Maybe<Scalars['BigInt']>;
  bonusReward_lte?: Maybe<Scalars['BigInt']>;
  bonusReward_not?: Maybe<Scalars['BigInt']>;
  bonusReward_not_in?: Maybe<Array<Scalars['BigInt']>>;
  endTime?: Maybe<Scalars['BigInt']>;
  endTime_gt?: Maybe<Scalars['BigInt']>;
  endTime_gte?: Maybe<Scalars['BigInt']>;
  endTime_in?: Maybe<Array<Scalars['BigInt']>>;
  endTime_lt?: Maybe<Scalars['BigInt']>;
  endTime_lte?: Maybe<Scalars['BigInt']>;
  endTime_not?: Maybe<Scalars['BigInt']>;
  endTime_not_in?: Maybe<Array<Scalars['BigInt']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  isDetached?: Maybe<Scalars['Boolean']>;
  isDetached_in?: Maybe<Array<Scalars['Boolean']>>;
  isDetached_not?: Maybe<Scalars['Boolean']>;
  isDetached_not_in?: Maybe<Array<Scalars['Boolean']>>;
  minRangeLength?: Maybe<Scalars['BigInt']>;
  minRangeLength_gt?: Maybe<Scalars['BigInt']>;
  minRangeLength_gte?: Maybe<Scalars['BigInt']>;
  minRangeLength_in?: Maybe<Array<Scalars['BigInt']>>;
  minRangeLength_lt?: Maybe<Scalars['BigInt']>;
  minRangeLength_lte?: Maybe<Scalars['BigInt']>;
  minRangeLength_not?: Maybe<Scalars['BigInt']>;
  minRangeLength_not_in?: Maybe<Array<Scalars['BigInt']>>;
  multiplierToken?: Maybe<Scalars['Bytes']>;
  multiplierToken_contains?: Maybe<Scalars['Bytes']>;
  multiplierToken_in?: Maybe<Array<Scalars['Bytes']>>;
  multiplierToken_not?: Maybe<Scalars['Bytes']>;
  multiplierToken_not_contains?: Maybe<Scalars['Bytes']>;
  multiplierToken_not_in?: Maybe<Array<Scalars['Bytes']>>;
  pool?: Maybe<Scalars['Bytes']>;
  pool_contains?: Maybe<Scalars['Bytes']>;
  pool_in?: Maybe<Array<Scalars['Bytes']>>;
  pool_not?: Maybe<Scalars['Bytes']>;
  pool_not_contains?: Maybe<Scalars['Bytes']>;
  pool_not_in?: Maybe<Array<Scalars['Bytes']>>;
  reward?: Maybe<Scalars['BigInt']>;
  rewardRate?: Maybe<Scalars['BigInt']>;
  rewardRate_gt?: Maybe<Scalars['BigInt']>;
  rewardRate_gte?: Maybe<Scalars['BigInt']>;
  rewardRate_in?: Maybe<Array<Scalars['BigInt']>>;
  rewardRate_lt?: Maybe<Scalars['BigInt']>;
  rewardRate_lte?: Maybe<Scalars['BigInt']>;
  rewardRate_not?: Maybe<Scalars['BigInt']>;
  rewardRate_not_in?: Maybe<Array<Scalars['BigInt']>>;
  rewardToken?: Maybe<Scalars['Bytes']>;
  rewardToken_contains?: Maybe<Scalars['Bytes']>;
  rewardToken_in?: Maybe<Array<Scalars['Bytes']>>;
  rewardToken_not?: Maybe<Scalars['Bytes']>;
  rewardToken_not_contains?: Maybe<Scalars['Bytes']>;
  rewardToken_not_in?: Maybe<Array<Scalars['Bytes']>>;
  reward_gt?: Maybe<Scalars['BigInt']>;
  reward_gte?: Maybe<Scalars['BigInt']>;
  reward_in?: Maybe<Array<Scalars['BigInt']>>;
  reward_lt?: Maybe<Scalars['BigInt']>;
  reward_lte?: Maybe<Scalars['BigInt']>;
  reward_not?: Maybe<Scalars['BigInt']>;
  reward_not_in?: Maybe<Array<Scalars['BigInt']>>;
  startTime?: Maybe<Scalars['BigInt']>;
  startTime_gt?: Maybe<Scalars['BigInt']>;
  startTime_gte?: Maybe<Scalars['BigInt']>;
  startTime_in?: Maybe<Array<Scalars['BigInt']>>;
  startTime_lt?: Maybe<Scalars['BigInt']>;
  startTime_lte?: Maybe<Scalars['BigInt']>;
  startTime_not?: Maybe<Scalars['BigInt']>;
  startTime_not_in?: Maybe<Array<Scalars['BigInt']>>;
  tier1Multiplier?: Maybe<Scalars['BigInt']>;
  tier1Multiplier_gt?: Maybe<Scalars['BigInt']>;
  tier1Multiplier_gte?: Maybe<Scalars['BigInt']>;
  tier1Multiplier_in?: Maybe<Array<Scalars['BigInt']>>;
  tier1Multiplier_lt?: Maybe<Scalars['BigInt']>;
  tier1Multiplier_lte?: Maybe<Scalars['BigInt']>;
  tier1Multiplier_not?: Maybe<Scalars['BigInt']>;
  tier1Multiplier_not_in?: Maybe<Array<Scalars['BigInt']>>;
  tier2Multiplier?: Maybe<Scalars['BigInt']>;
  tier2Multiplier_gt?: Maybe<Scalars['BigInt']>;
  tier2Multiplier_gte?: Maybe<Scalars['BigInt']>;
  tier2Multiplier_in?: Maybe<Array<Scalars['BigInt']>>;
  tier2Multiplier_lt?: Maybe<Scalars['BigInt']>;
  tier2Multiplier_lte?: Maybe<Scalars['BigInt']>;
  tier2Multiplier_not?: Maybe<Scalars['BigInt']>;
  tier2Multiplier_not_in?: Maybe<Array<Scalars['BigInt']>>;
  tier3Multiplier?: Maybe<Scalars['BigInt']>;
  tier3Multiplier_gt?: Maybe<Scalars['BigInt']>;
  tier3Multiplier_gte?: Maybe<Scalars['BigInt']>;
  tier3Multiplier_in?: Maybe<Array<Scalars['BigInt']>>;
  tier3Multiplier_lt?: Maybe<Scalars['BigInt']>;
  tier3Multiplier_lte?: Maybe<Scalars['BigInt']>;
  tier3Multiplier_not?: Maybe<Scalars['BigInt']>;
  tier3Multiplier_not_in?: Maybe<Array<Scalars['BigInt']>>;
  tokenAmountForTier1?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier1_gt?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier1_gte?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier1_in?: Maybe<Array<Scalars['BigInt']>>;
  tokenAmountForTier1_lt?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier1_lte?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier1_not?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier1_not_in?: Maybe<Array<Scalars['BigInt']>>;
  tokenAmountForTier2?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier2_gt?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier2_gte?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier2_in?: Maybe<Array<Scalars['BigInt']>>;
  tokenAmountForTier2_lt?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier2_lte?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier2_not?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier2_not_in?: Maybe<Array<Scalars['BigInt']>>;
  tokenAmountForTier3?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier3_gt?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier3_gte?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier3_in?: Maybe<Array<Scalars['BigInt']>>;
  tokenAmountForTier3_lt?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier3_lte?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier3_not?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier3_not_in?: Maybe<Array<Scalars['BigInt']>>;
  virtualPool?: Maybe<Scalars['Bytes']>;
  virtualPool_contains?: Maybe<Scalars['Bytes']>;
  virtualPool_in?: Maybe<Array<Scalars['Bytes']>>;
  virtualPool_not?: Maybe<Scalars['Bytes']>;
  virtualPool_not_contains?: Maybe<Scalars['Bytes']>;
  virtualPool_not_in?: Maybe<Array<Scalars['Bytes']>>;
};

export enum EternalFarming_OrderBy {
  BonusReward = 'bonusReward',
  BonusRewardRate = 'bonusRewardRate',
  BonusRewardToken = 'bonusRewardToken',
  EndTime = 'endTime',
  Id = 'id',
  IsDetached = 'isDetached',
  MinRangeLength = 'minRangeLength',
  MultiplierToken = 'multiplierToken',
  Pool = 'pool',
  Reward = 'reward',
  RewardRate = 'rewardRate',
  RewardToken = 'rewardToken',
  StartTime = 'startTime',
  Tier1Multiplier = 'tier1Multiplier',
  Tier2Multiplier = 'tier2Multiplier',
  Tier3Multiplier = 'tier3Multiplier',
  TokenAmountForTier1 = 'tokenAmountForTier1',
  TokenAmountForTier2 = 'tokenAmountForTier2',
  TokenAmountForTier3 = 'tokenAmountForTier3',
  VirtualPool = 'virtualPool',
}

export type Factory = {
  __typename?: 'Factory';
  ALGBbalance: Scalars['BigInt'];
  ALGBfromVault: Scalars['BigInt'];
  currentStakedAmount: Scalars['BigInt'];
  earnedForAllTime: Scalars['BigInt'];
  id: Scalars['ID'];
  owner: Scalars['ID'];
  poolCount: Scalars['BigInt'];
  totalFeesMatic: Scalars['BigDecimal'];
  totalFeesUSD: Scalars['BigDecimal'];
  totalValueLockedMatic: Scalars['BigDecimal'];
  totalValueLockedMaticUntracked: Scalars['BigDecimal'];
  totalValueLockedUSD: Scalars['BigDecimal'];
  totalValueLockedUSDUntracked: Scalars['BigDecimal'];
  totalVolumeMatic: Scalars['BigDecimal'];
  totalVolumeUSD: Scalars['BigDecimal'];
  txCount: Scalars['BigInt'];
  untrackedVolumeUSD: Scalars['BigDecimal'];
  xALGBminted: Scalars['BigInt'];
  xALGBtotalSupply: Scalars['BigInt'];
};

export type Factory_Filter = {
  ALGBbalance?: Maybe<Scalars['BigInt']>;
  ALGBbalance_gt?: Maybe<Scalars['BigInt']>;
  ALGBbalance_gte?: Maybe<Scalars['BigInt']>;
  ALGBbalance_in?: Maybe<Array<Scalars['BigInt']>>;
  ALGBbalance_lt?: Maybe<Scalars['BigInt']>;
  ALGBbalance_lte?: Maybe<Scalars['BigInt']>;
  ALGBbalance_not?: Maybe<Scalars['BigInt']>;
  ALGBbalance_not_in?: Maybe<Array<Scalars['BigInt']>>;
  ALGBfromVault?: Maybe<Scalars['BigInt']>;
  ALGBfromVault_gt?: Maybe<Scalars['BigInt']>;
  ALGBfromVault_gte?: Maybe<Scalars['BigInt']>;
  ALGBfromVault_in?: Maybe<Array<Scalars['BigInt']>>;
  ALGBfromVault_lt?: Maybe<Scalars['BigInt']>;
  ALGBfromVault_lte?: Maybe<Scalars['BigInt']>;
  ALGBfromVault_not?: Maybe<Scalars['BigInt']>;
  ALGBfromVault_not_in?: Maybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  currentStakedAmount?: Maybe<Scalars['BigInt']>;
  currentStakedAmount_gt?: Maybe<Scalars['BigInt']>;
  currentStakedAmount_gte?: Maybe<Scalars['BigInt']>;
  currentStakedAmount_in?: Maybe<Array<Scalars['BigInt']>>;
  currentStakedAmount_lt?: Maybe<Scalars['BigInt']>;
  currentStakedAmount_lte?: Maybe<Scalars['BigInt']>;
  currentStakedAmount_not?: Maybe<Scalars['BigInt']>;
  currentStakedAmount_not_in?: Maybe<Array<Scalars['BigInt']>>;
  earnedForAllTime?: Maybe<Scalars['BigInt']>;
  earnedForAllTime_gt?: Maybe<Scalars['BigInt']>;
  earnedForAllTime_gte?: Maybe<Scalars['BigInt']>;
  earnedForAllTime_in?: Maybe<Array<Scalars['BigInt']>>;
  earnedForAllTime_lt?: Maybe<Scalars['BigInt']>;
  earnedForAllTime_lte?: Maybe<Scalars['BigInt']>;
  earnedForAllTime_not?: Maybe<Scalars['BigInt']>;
  earnedForAllTime_not_in?: Maybe<Array<Scalars['BigInt']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  owner?: Maybe<Scalars['ID']>;
  owner_gt?: Maybe<Scalars['ID']>;
  owner_gte?: Maybe<Scalars['ID']>;
  owner_in?: Maybe<Array<Scalars['ID']>>;
  owner_lt?: Maybe<Scalars['ID']>;
  owner_lte?: Maybe<Scalars['ID']>;
  owner_not?: Maybe<Scalars['ID']>;
  owner_not_in?: Maybe<Array<Scalars['ID']>>;
  poolCount?: Maybe<Scalars['BigInt']>;
  poolCount_gt?: Maybe<Scalars['BigInt']>;
  poolCount_gte?: Maybe<Scalars['BigInt']>;
  poolCount_in?: Maybe<Array<Scalars['BigInt']>>;
  poolCount_lt?: Maybe<Scalars['BigInt']>;
  poolCount_lte?: Maybe<Scalars['BigInt']>;
  poolCount_not?: Maybe<Scalars['BigInt']>;
  poolCount_not_in?: Maybe<Array<Scalars['BigInt']>>;
  totalFeesMatic?: Maybe<Scalars['BigDecimal']>;
  totalFeesMatic_gt?: Maybe<Scalars['BigDecimal']>;
  totalFeesMatic_gte?: Maybe<Scalars['BigDecimal']>;
  totalFeesMatic_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalFeesMatic_lt?: Maybe<Scalars['BigDecimal']>;
  totalFeesMatic_lte?: Maybe<Scalars['BigDecimal']>;
  totalFeesMatic_not?: Maybe<Scalars['BigDecimal']>;
  totalFeesMatic_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalFeesUSD?: Maybe<Scalars['BigDecimal']>;
  totalFeesUSD_gt?: Maybe<Scalars['BigDecimal']>;
  totalFeesUSD_gte?: Maybe<Scalars['BigDecimal']>;
  totalFeesUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalFeesUSD_lt?: Maybe<Scalars['BigDecimal']>;
  totalFeesUSD_lte?: Maybe<Scalars['BigDecimal']>;
  totalFeesUSD_not?: Maybe<Scalars['BigDecimal']>;
  totalFeesUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedMatic?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedMaticUntracked?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedMaticUntracked_gt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedMaticUntracked_gte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedMaticUntracked_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedMaticUntracked_lt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedMaticUntracked_lte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedMaticUntracked_not?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedMaticUntracked_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedMatic_gt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedMatic_gte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedMatic_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedMatic_lt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedMatic_lte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedMatic_not?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedMatic_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedUSD?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSDUntracked?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSDUntracked_gt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSDUntracked_gte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSDUntracked_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedUSDUntracked_lt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSDUntracked_lte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSDUntracked_not?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSDUntracked_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedUSD_gt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_gte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedUSD_lt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_lte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_not?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalVolumeMatic?: Maybe<Scalars['BigDecimal']>;
  totalVolumeMatic_gt?: Maybe<Scalars['BigDecimal']>;
  totalVolumeMatic_gte?: Maybe<Scalars['BigDecimal']>;
  totalVolumeMatic_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalVolumeMatic_lt?: Maybe<Scalars['BigDecimal']>;
  totalVolumeMatic_lte?: Maybe<Scalars['BigDecimal']>;
  totalVolumeMatic_not?: Maybe<Scalars['BigDecimal']>;
  totalVolumeMatic_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalVolumeUSD?: Maybe<Scalars['BigDecimal']>;
  totalVolumeUSD_gt?: Maybe<Scalars['BigDecimal']>;
  totalVolumeUSD_gte?: Maybe<Scalars['BigDecimal']>;
  totalVolumeUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalVolumeUSD_lt?: Maybe<Scalars['BigDecimal']>;
  totalVolumeUSD_lte?: Maybe<Scalars['BigDecimal']>;
  totalVolumeUSD_not?: Maybe<Scalars['BigDecimal']>;
  totalVolumeUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  txCount?: Maybe<Scalars['BigInt']>;
  txCount_gt?: Maybe<Scalars['BigInt']>;
  txCount_gte?: Maybe<Scalars['BigInt']>;
  txCount_in?: Maybe<Array<Scalars['BigInt']>>;
  txCount_lt?: Maybe<Scalars['BigInt']>;
  txCount_lte?: Maybe<Scalars['BigInt']>;
  txCount_not?: Maybe<Scalars['BigInt']>;
  txCount_not_in?: Maybe<Array<Scalars['BigInt']>>;
  untrackedVolumeUSD?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_gt?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_gte?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  untrackedVolumeUSD_lt?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_lte?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_not?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  xALGBminted?: Maybe<Scalars['BigInt']>;
  xALGBminted_gt?: Maybe<Scalars['BigInt']>;
  xALGBminted_gte?: Maybe<Scalars['BigInt']>;
  xALGBminted_in?: Maybe<Array<Scalars['BigInt']>>;
  xALGBminted_lt?: Maybe<Scalars['BigInt']>;
  xALGBminted_lte?: Maybe<Scalars['BigInt']>;
  xALGBminted_not?: Maybe<Scalars['BigInt']>;
  xALGBminted_not_in?: Maybe<Array<Scalars['BigInt']>>;
  xALGBtotalSupply?: Maybe<Scalars['BigInt']>;
  xALGBtotalSupply_gt?: Maybe<Scalars['BigInt']>;
  xALGBtotalSupply_gte?: Maybe<Scalars['BigInt']>;
  xALGBtotalSupply_in?: Maybe<Array<Scalars['BigInt']>>;
  xALGBtotalSupply_lt?: Maybe<Scalars['BigInt']>;
  xALGBtotalSupply_lte?: Maybe<Scalars['BigInt']>;
  xALGBtotalSupply_not?: Maybe<Scalars['BigInt']>;
  xALGBtotalSupply_not_in?: Maybe<Array<Scalars['BigInt']>>;
};

export enum Factory_OrderBy {
  AlgBbalance = 'ALGBbalance',
  AlgBfromVault = 'ALGBfromVault',
  CurrentStakedAmount = 'currentStakedAmount',
  EarnedForAllTime = 'earnedForAllTime',
  Id = 'id',
  Owner = 'owner',
  PoolCount = 'poolCount',
  TotalFeesMatic = 'totalFeesMatic',
  TotalFeesUsd = 'totalFeesUSD',
  TotalValueLockedMatic = 'totalValueLockedMatic',
  TotalValueLockedMaticUntracked = 'totalValueLockedMaticUntracked',
  TotalValueLockedUsd = 'totalValueLockedUSD',
  TotalValueLockedUsdUntracked = 'totalValueLockedUSDUntracked',
  TotalVolumeMatic = 'totalVolumeMatic',
  TotalVolumeUsd = 'totalVolumeUSD',
  TxCount = 'txCount',
  UntrackedVolumeUsd = 'untrackedVolumeUSD',
  XAlgBminted = 'xALGBminted',
  XAlgBtotalSupply = 'xALGBtotalSupply',
}

export type FeeHourData = {
  __typename?: 'FeeHourData';
  changesCount: Scalars['BigInt'];
  endFee: Scalars['BigInt'];
  fee: Scalars['BigInt'];
  id: Scalars['ID'];
  maxFee: Scalars['BigInt'];
  minFee: Scalars['BigInt'];
  pool: Scalars['String'];
  startFee: Scalars['BigInt'];
  timestamp: Scalars['BigInt'];
};

export type FeeHourData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  changesCount?: Maybe<Scalars['BigInt']>;
  changesCount_gt?: Maybe<Scalars['BigInt']>;
  changesCount_gte?: Maybe<Scalars['BigInt']>;
  changesCount_in?: Maybe<Array<Scalars['BigInt']>>;
  changesCount_lt?: Maybe<Scalars['BigInt']>;
  changesCount_lte?: Maybe<Scalars['BigInt']>;
  changesCount_not?: Maybe<Scalars['BigInt']>;
  changesCount_not_in?: Maybe<Array<Scalars['BigInt']>>;
  endFee?: Maybe<Scalars['BigInt']>;
  endFee_gt?: Maybe<Scalars['BigInt']>;
  endFee_gte?: Maybe<Scalars['BigInt']>;
  endFee_in?: Maybe<Array<Scalars['BigInt']>>;
  endFee_lt?: Maybe<Scalars['BigInt']>;
  endFee_lte?: Maybe<Scalars['BigInt']>;
  endFee_not?: Maybe<Scalars['BigInt']>;
  endFee_not_in?: Maybe<Array<Scalars['BigInt']>>;
  fee?: Maybe<Scalars['BigInt']>;
  fee_gt?: Maybe<Scalars['BigInt']>;
  fee_gte?: Maybe<Scalars['BigInt']>;
  fee_in?: Maybe<Array<Scalars['BigInt']>>;
  fee_lt?: Maybe<Scalars['BigInt']>;
  fee_lte?: Maybe<Scalars['BigInt']>;
  fee_not?: Maybe<Scalars['BigInt']>;
  fee_not_in?: Maybe<Array<Scalars['BigInt']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  maxFee?: Maybe<Scalars['BigInt']>;
  maxFee_gt?: Maybe<Scalars['BigInt']>;
  maxFee_gte?: Maybe<Scalars['BigInt']>;
  maxFee_in?: Maybe<Array<Scalars['BigInt']>>;
  maxFee_lt?: Maybe<Scalars['BigInt']>;
  maxFee_lte?: Maybe<Scalars['BigInt']>;
  maxFee_not?: Maybe<Scalars['BigInt']>;
  maxFee_not_in?: Maybe<Array<Scalars['BigInt']>>;
  minFee?: Maybe<Scalars['BigInt']>;
  minFee_gt?: Maybe<Scalars['BigInt']>;
  minFee_gte?: Maybe<Scalars['BigInt']>;
  minFee_in?: Maybe<Array<Scalars['BigInt']>>;
  minFee_lt?: Maybe<Scalars['BigInt']>;
  minFee_lte?: Maybe<Scalars['BigInt']>;
  minFee_not?: Maybe<Scalars['BigInt']>;
  minFee_not_in?: Maybe<Array<Scalars['BigInt']>>;
  pool?: Maybe<Scalars['String']>;
  pool_contains?: Maybe<Scalars['String']>;
  pool_contains_nocase?: Maybe<Scalars['String']>;
  pool_ends_with?: Maybe<Scalars['String']>;
  pool_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_gt?: Maybe<Scalars['String']>;
  pool_gte?: Maybe<Scalars['String']>;
  pool_in?: Maybe<Array<Scalars['String']>>;
  pool_lt?: Maybe<Scalars['String']>;
  pool_lte?: Maybe<Scalars['String']>;
  pool_not?: Maybe<Scalars['String']>;
  pool_not_contains?: Maybe<Scalars['String']>;
  pool_not_contains_nocase?: Maybe<Scalars['String']>;
  pool_not_ends_with?: Maybe<Scalars['String']>;
  pool_not_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_not_in?: Maybe<Array<Scalars['String']>>;
  pool_not_starts_with?: Maybe<Scalars['String']>;
  pool_not_starts_with_nocase?: Maybe<Scalars['String']>;
  pool_starts_with?: Maybe<Scalars['String']>;
  pool_starts_with_nocase?: Maybe<Scalars['String']>;
  startFee?: Maybe<Scalars['BigInt']>;
  startFee_gt?: Maybe<Scalars['BigInt']>;
  startFee_gte?: Maybe<Scalars['BigInt']>;
  startFee_in?: Maybe<Array<Scalars['BigInt']>>;
  startFee_lt?: Maybe<Scalars['BigInt']>;
  startFee_lte?: Maybe<Scalars['BigInt']>;
  startFee_not?: Maybe<Scalars['BigInt']>;
  startFee_not_in?: Maybe<Array<Scalars['BigInt']>>;
  timestamp?: Maybe<Scalars['BigInt']>;
  timestamp_gt?: Maybe<Scalars['BigInt']>;
  timestamp_gte?: Maybe<Scalars['BigInt']>;
  timestamp_in?: Maybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: Maybe<Scalars['BigInt']>;
  timestamp_lte?: Maybe<Scalars['BigInt']>;
  timestamp_not?: Maybe<Scalars['BigInt']>;
  timestamp_not_in?: Maybe<Array<Scalars['BigInt']>>;
};

export enum FeeHourData_OrderBy {
  ChangesCount = 'changesCount',
  EndFee = 'endFee',
  Fee = 'fee',
  Id = 'id',
  MaxFee = 'maxFee',
  MinFee = 'minFee',
  Pool = 'pool',
  StartFee = 'startFee',
  Timestamp = 'timestamp',
}

export type Flash = {
  __typename?: 'Flash';
  amount0: Scalars['BigDecimal'];
  amount0Paid: Scalars['BigDecimal'];
  amount1: Scalars['BigDecimal'];
  amount1Paid: Scalars['BigDecimal'];
  amountUSD: Scalars['BigDecimal'];
  id: Scalars['ID'];
  logIndex?: Maybe<Scalars['BigInt']>;
  pool: Pool;
  recipient: Scalars['Bytes'];
  sender: Scalars['Bytes'];
  timestamp: Scalars['BigInt'];
  transaction: Transaction;
};

export type Flash_Filter = {
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  amount0?: Maybe<Scalars['BigDecimal']>;
  amount0Paid?: Maybe<Scalars['BigDecimal']>;
  amount0Paid_gt?: Maybe<Scalars['BigDecimal']>;
  amount0Paid_gte?: Maybe<Scalars['BigDecimal']>;
  amount0Paid_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amount0Paid_lt?: Maybe<Scalars['BigDecimal']>;
  amount0Paid_lte?: Maybe<Scalars['BigDecimal']>;
  amount0Paid_not?: Maybe<Scalars['BigDecimal']>;
  amount0Paid_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amount0_gt?: Maybe<Scalars['BigDecimal']>;
  amount0_gte?: Maybe<Scalars['BigDecimal']>;
  amount0_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amount0_lt?: Maybe<Scalars['BigDecimal']>;
  amount0_lte?: Maybe<Scalars['BigDecimal']>;
  amount0_not?: Maybe<Scalars['BigDecimal']>;
  amount0_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amount1?: Maybe<Scalars['BigDecimal']>;
  amount1Paid?: Maybe<Scalars['BigDecimal']>;
  amount1Paid_gt?: Maybe<Scalars['BigDecimal']>;
  amount1Paid_gte?: Maybe<Scalars['BigDecimal']>;
  amount1Paid_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amount1Paid_lt?: Maybe<Scalars['BigDecimal']>;
  amount1Paid_lte?: Maybe<Scalars['BigDecimal']>;
  amount1Paid_not?: Maybe<Scalars['BigDecimal']>;
  amount1Paid_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amount1_gt?: Maybe<Scalars['BigDecimal']>;
  amount1_gte?: Maybe<Scalars['BigDecimal']>;
  amount1_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amount1_lt?: Maybe<Scalars['BigDecimal']>;
  amount1_lte?: Maybe<Scalars['BigDecimal']>;
  amount1_not?: Maybe<Scalars['BigDecimal']>;
  amount1_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amountUSD?: Maybe<Scalars['BigDecimal']>;
  amountUSD_gt?: Maybe<Scalars['BigDecimal']>;
  amountUSD_gte?: Maybe<Scalars['BigDecimal']>;
  amountUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amountUSD_lt?: Maybe<Scalars['BigDecimal']>;
  amountUSD_lte?: Maybe<Scalars['BigDecimal']>;
  amountUSD_not?: Maybe<Scalars['BigDecimal']>;
  amountUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  logIndex?: Maybe<Scalars['BigInt']>;
  logIndex_gt?: Maybe<Scalars['BigInt']>;
  logIndex_gte?: Maybe<Scalars['BigInt']>;
  logIndex_in?: Maybe<Array<Scalars['BigInt']>>;
  logIndex_lt?: Maybe<Scalars['BigInt']>;
  logIndex_lte?: Maybe<Scalars['BigInt']>;
  logIndex_not?: Maybe<Scalars['BigInt']>;
  logIndex_not_in?: Maybe<Array<Scalars['BigInt']>>;
  pool?: Maybe<Scalars['String']>;
  pool_?: Maybe<Pool_Filter>;
  pool_contains?: Maybe<Scalars['String']>;
  pool_contains_nocase?: Maybe<Scalars['String']>;
  pool_ends_with?: Maybe<Scalars['String']>;
  pool_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_gt?: Maybe<Scalars['String']>;
  pool_gte?: Maybe<Scalars['String']>;
  pool_in?: Maybe<Array<Scalars['String']>>;
  pool_lt?: Maybe<Scalars['String']>;
  pool_lte?: Maybe<Scalars['String']>;
  pool_not?: Maybe<Scalars['String']>;
  pool_not_contains?: Maybe<Scalars['String']>;
  pool_not_contains_nocase?: Maybe<Scalars['String']>;
  pool_not_ends_with?: Maybe<Scalars['String']>;
  pool_not_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_not_in?: Maybe<Array<Scalars['String']>>;
  pool_not_starts_with?: Maybe<Scalars['String']>;
  pool_not_starts_with_nocase?: Maybe<Scalars['String']>;
  pool_starts_with?: Maybe<Scalars['String']>;
  pool_starts_with_nocase?: Maybe<Scalars['String']>;
  recipient?: Maybe<Scalars['Bytes']>;
  recipient_contains?: Maybe<Scalars['Bytes']>;
  recipient_in?: Maybe<Array<Scalars['Bytes']>>;
  recipient_not?: Maybe<Scalars['Bytes']>;
  recipient_not_contains?: Maybe<Scalars['Bytes']>;
  recipient_not_in?: Maybe<Array<Scalars['Bytes']>>;
  sender?: Maybe<Scalars['Bytes']>;
  sender_contains?: Maybe<Scalars['Bytes']>;
  sender_in?: Maybe<Array<Scalars['Bytes']>>;
  sender_not?: Maybe<Scalars['Bytes']>;
  sender_not_contains?: Maybe<Scalars['Bytes']>;
  sender_not_in?: Maybe<Array<Scalars['Bytes']>>;
  timestamp?: Maybe<Scalars['BigInt']>;
  timestamp_gt?: Maybe<Scalars['BigInt']>;
  timestamp_gte?: Maybe<Scalars['BigInt']>;
  timestamp_in?: Maybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: Maybe<Scalars['BigInt']>;
  timestamp_lte?: Maybe<Scalars['BigInt']>;
  timestamp_not?: Maybe<Scalars['BigInt']>;
  timestamp_not_in?: Maybe<Array<Scalars['BigInt']>>;
  transaction?: Maybe<Scalars['String']>;
  transaction_?: Maybe<Transaction_Filter>;
  transaction_contains?: Maybe<Scalars['String']>;
  transaction_contains_nocase?: Maybe<Scalars['String']>;
  transaction_ends_with?: Maybe<Scalars['String']>;
  transaction_ends_with_nocase?: Maybe<Scalars['String']>;
  transaction_gt?: Maybe<Scalars['String']>;
  transaction_gte?: Maybe<Scalars['String']>;
  transaction_in?: Maybe<Array<Scalars['String']>>;
  transaction_lt?: Maybe<Scalars['String']>;
  transaction_lte?: Maybe<Scalars['String']>;
  transaction_not?: Maybe<Scalars['String']>;
  transaction_not_contains?: Maybe<Scalars['String']>;
  transaction_not_contains_nocase?: Maybe<Scalars['String']>;
  transaction_not_ends_with?: Maybe<Scalars['String']>;
  transaction_not_ends_with_nocase?: Maybe<Scalars['String']>;
  transaction_not_in?: Maybe<Array<Scalars['String']>>;
  transaction_not_starts_with?: Maybe<Scalars['String']>;
  transaction_not_starts_with_nocase?: Maybe<Scalars['String']>;
  transaction_starts_with?: Maybe<Scalars['String']>;
  transaction_starts_with_nocase?: Maybe<Scalars['String']>;
};

export enum Flash_OrderBy {
  Amount0 = 'amount0',
  Amount0Paid = 'amount0Paid',
  Amount1 = 'amount1',
  Amount1Paid = 'amount1Paid',
  AmountUsd = 'amountUSD',
  Id = 'id',
  LogIndex = 'logIndex',
  Pool = 'pool',
  Recipient = 'recipient',
  Sender = 'sender',
  Timestamp = 'timestamp',
  Transaction = 'transaction',
}

export type History = {
  __typename?: 'History';
  ALGBbalance: Scalars['BigInt'];
  ALGBfromVault: Scalars['BigInt'];
  currentStakedAmount: Scalars['BigInt'];
  date: Scalars['BigInt'];
  id: Scalars['ID'];
  xALGBburned: Scalars['BigInt'];
  xALGBminted: Scalars['BigInt'];
  xALGBtotalSupply: Scalars['BigInt'];
};

export type History_Filter = {
  ALGBbalance?: Maybe<Scalars['BigInt']>;
  ALGBbalance_gt?: Maybe<Scalars['BigInt']>;
  ALGBbalance_gte?: Maybe<Scalars['BigInt']>;
  ALGBbalance_in?: Maybe<Array<Scalars['BigInt']>>;
  ALGBbalance_lt?: Maybe<Scalars['BigInt']>;
  ALGBbalance_lte?: Maybe<Scalars['BigInt']>;
  ALGBbalance_not?: Maybe<Scalars['BigInt']>;
  ALGBbalance_not_in?: Maybe<Array<Scalars['BigInt']>>;
  ALGBfromVault?: Maybe<Scalars['BigInt']>;
  ALGBfromVault_gt?: Maybe<Scalars['BigInt']>;
  ALGBfromVault_gte?: Maybe<Scalars['BigInt']>;
  ALGBfromVault_in?: Maybe<Array<Scalars['BigInt']>>;
  ALGBfromVault_lt?: Maybe<Scalars['BigInt']>;
  ALGBfromVault_lte?: Maybe<Scalars['BigInt']>;
  ALGBfromVault_not?: Maybe<Scalars['BigInt']>;
  ALGBfromVault_not_in?: Maybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  currentStakedAmount?: Maybe<Scalars['BigInt']>;
  currentStakedAmount_gt?: Maybe<Scalars['BigInt']>;
  currentStakedAmount_gte?: Maybe<Scalars['BigInt']>;
  currentStakedAmount_in?: Maybe<Array<Scalars['BigInt']>>;
  currentStakedAmount_lt?: Maybe<Scalars['BigInt']>;
  currentStakedAmount_lte?: Maybe<Scalars['BigInt']>;
  currentStakedAmount_not?: Maybe<Scalars['BigInt']>;
  currentStakedAmount_not_in?: Maybe<Array<Scalars['BigInt']>>;
  date?: Maybe<Scalars['BigInt']>;
  date_gt?: Maybe<Scalars['BigInt']>;
  date_gte?: Maybe<Scalars['BigInt']>;
  date_in?: Maybe<Array<Scalars['BigInt']>>;
  date_lt?: Maybe<Scalars['BigInt']>;
  date_lte?: Maybe<Scalars['BigInt']>;
  date_not?: Maybe<Scalars['BigInt']>;
  date_not_in?: Maybe<Array<Scalars['BigInt']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  xALGBburned?: Maybe<Scalars['BigInt']>;
  xALGBburned_gt?: Maybe<Scalars['BigInt']>;
  xALGBburned_gte?: Maybe<Scalars['BigInt']>;
  xALGBburned_in?: Maybe<Array<Scalars['BigInt']>>;
  xALGBburned_lt?: Maybe<Scalars['BigInt']>;
  xALGBburned_lte?: Maybe<Scalars['BigInt']>;
  xALGBburned_not?: Maybe<Scalars['BigInt']>;
  xALGBburned_not_in?: Maybe<Array<Scalars['BigInt']>>;
  xALGBminted?: Maybe<Scalars['BigInt']>;
  xALGBminted_gt?: Maybe<Scalars['BigInt']>;
  xALGBminted_gte?: Maybe<Scalars['BigInt']>;
  xALGBminted_in?: Maybe<Array<Scalars['BigInt']>>;
  xALGBminted_lt?: Maybe<Scalars['BigInt']>;
  xALGBminted_lte?: Maybe<Scalars['BigInt']>;
  xALGBminted_not?: Maybe<Scalars['BigInt']>;
  xALGBminted_not_in?: Maybe<Array<Scalars['BigInt']>>;
  xALGBtotalSupply?: Maybe<Scalars['BigInt']>;
  xALGBtotalSupply_gt?: Maybe<Scalars['BigInt']>;
  xALGBtotalSupply_gte?: Maybe<Scalars['BigInt']>;
  xALGBtotalSupply_in?: Maybe<Array<Scalars['BigInt']>>;
  xALGBtotalSupply_lt?: Maybe<Scalars['BigInt']>;
  xALGBtotalSupply_lte?: Maybe<Scalars['BigInt']>;
  xALGBtotalSupply_not?: Maybe<Scalars['BigInt']>;
  xALGBtotalSupply_not_in?: Maybe<Array<Scalars['BigInt']>>;
};

export enum History_OrderBy {
  AlgBbalance = 'ALGBbalance',
  AlgBfromVault = 'ALGBfromVault',
  CurrentStakedAmount = 'currentStakedAmount',
  Date = 'date',
  Id = 'id',
  XAlgBburned = 'xALGBburned',
  XAlgBminted = 'xALGBminted',
  XAlgBtotalSupply = 'xALGBtotalSupply',
}

export type LimitFarming = {
  __typename?: 'LimitFarming';
  bonusReward: Scalars['BigInt'];
  bonusRewardToken: Scalars['Bytes'];
  createdAtTimestamp: Scalars['BigInt'];
  endTime: Scalars['BigInt'];
  enterStartTime: Scalars['BigInt'];
  id: Scalars['ID'];
  isDetached?: Maybe<Scalars['Boolean']>;
  minRangeLength: Scalars['BigInt'];
  multiplierToken: Scalars['Bytes'];
  pool: Scalars['Bytes'];
  reward: Scalars['BigInt'];
  rewardToken: Scalars['Bytes'];
  startTime: Scalars['BigInt'];
  tier1Multiplier: Scalars['BigInt'];
  tier2Multiplier: Scalars['BigInt'];
  tier3Multiplier: Scalars['BigInt'];
  tokenAmountForTier1: Scalars['BigInt'];
  tokenAmountForTier2: Scalars['BigInt'];
  tokenAmountForTier3: Scalars['BigInt'];
};

export type LimitFarming_Filter = {
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  bonusReward?: Maybe<Scalars['BigInt']>;
  bonusRewardToken?: Maybe<Scalars['Bytes']>;
  bonusRewardToken_contains?: Maybe<Scalars['Bytes']>;
  bonusRewardToken_in?: Maybe<Array<Scalars['Bytes']>>;
  bonusRewardToken_not?: Maybe<Scalars['Bytes']>;
  bonusRewardToken_not_contains?: Maybe<Scalars['Bytes']>;
  bonusRewardToken_not_in?: Maybe<Array<Scalars['Bytes']>>;
  bonusReward_gt?: Maybe<Scalars['BigInt']>;
  bonusReward_gte?: Maybe<Scalars['BigInt']>;
  bonusReward_in?: Maybe<Array<Scalars['BigInt']>>;
  bonusReward_lt?: Maybe<Scalars['BigInt']>;
  bonusReward_lte?: Maybe<Scalars['BigInt']>;
  bonusReward_not?: Maybe<Scalars['BigInt']>;
  bonusReward_not_in?: Maybe<Array<Scalars['BigInt']>>;
  createdAtTimestamp?: Maybe<Scalars['BigInt']>;
  createdAtTimestamp_gt?: Maybe<Scalars['BigInt']>;
  createdAtTimestamp_gte?: Maybe<Scalars['BigInt']>;
  createdAtTimestamp_in?: Maybe<Array<Scalars['BigInt']>>;
  createdAtTimestamp_lt?: Maybe<Scalars['BigInt']>;
  createdAtTimestamp_lte?: Maybe<Scalars['BigInt']>;
  createdAtTimestamp_not?: Maybe<Scalars['BigInt']>;
  createdAtTimestamp_not_in?: Maybe<Array<Scalars['BigInt']>>;
  endTime?: Maybe<Scalars['BigInt']>;
  endTime_gt?: Maybe<Scalars['BigInt']>;
  endTime_gte?: Maybe<Scalars['BigInt']>;
  endTime_in?: Maybe<Array<Scalars['BigInt']>>;
  endTime_lt?: Maybe<Scalars['BigInt']>;
  endTime_lte?: Maybe<Scalars['BigInt']>;
  endTime_not?: Maybe<Scalars['BigInt']>;
  endTime_not_in?: Maybe<Array<Scalars['BigInt']>>;
  enterStartTime?: Maybe<Scalars['BigInt']>;
  enterStartTime_gt?: Maybe<Scalars['BigInt']>;
  enterStartTime_gte?: Maybe<Scalars['BigInt']>;
  enterStartTime_in?: Maybe<Array<Scalars['BigInt']>>;
  enterStartTime_lt?: Maybe<Scalars['BigInt']>;
  enterStartTime_lte?: Maybe<Scalars['BigInt']>;
  enterStartTime_not?: Maybe<Scalars['BigInt']>;
  enterStartTime_not_in?: Maybe<Array<Scalars['BigInt']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  isDetached?: Maybe<Scalars['Boolean']>;
  isDetached_in?: Maybe<Array<Scalars['Boolean']>>;
  isDetached_not?: Maybe<Scalars['Boolean']>;
  isDetached_not_in?: Maybe<Array<Scalars['Boolean']>>;
  minRangeLength?: Maybe<Scalars['BigInt']>;
  minRangeLength_gt?: Maybe<Scalars['BigInt']>;
  minRangeLength_gte?: Maybe<Scalars['BigInt']>;
  minRangeLength_in?: Maybe<Array<Scalars['BigInt']>>;
  minRangeLength_lt?: Maybe<Scalars['BigInt']>;
  minRangeLength_lte?: Maybe<Scalars['BigInt']>;
  minRangeLength_not?: Maybe<Scalars['BigInt']>;
  minRangeLength_not_in?: Maybe<Array<Scalars['BigInt']>>;
  multiplierToken?: Maybe<Scalars['Bytes']>;
  multiplierToken_contains?: Maybe<Scalars['Bytes']>;
  multiplierToken_in?: Maybe<Array<Scalars['Bytes']>>;
  multiplierToken_not?: Maybe<Scalars['Bytes']>;
  multiplierToken_not_contains?: Maybe<Scalars['Bytes']>;
  multiplierToken_not_in?: Maybe<Array<Scalars['Bytes']>>;
  pool?: Maybe<Scalars['Bytes']>;
  pool_contains?: Maybe<Scalars['Bytes']>;
  pool_in?: Maybe<Array<Scalars['Bytes']>>;
  pool_not?: Maybe<Scalars['Bytes']>;
  pool_not_contains?: Maybe<Scalars['Bytes']>;
  pool_not_in?: Maybe<Array<Scalars['Bytes']>>;
  reward?: Maybe<Scalars['BigInt']>;
  rewardToken?: Maybe<Scalars['Bytes']>;
  rewardToken_contains?: Maybe<Scalars['Bytes']>;
  rewardToken_in?: Maybe<Array<Scalars['Bytes']>>;
  rewardToken_not?: Maybe<Scalars['Bytes']>;
  rewardToken_not_contains?: Maybe<Scalars['Bytes']>;
  rewardToken_not_in?: Maybe<Array<Scalars['Bytes']>>;
  reward_gt?: Maybe<Scalars['BigInt']>;
  reward_gte?: Maybe<Scalars['BigInt']>;
  reward_in?: Maybe<Array<Scalars['BigInt']>>;
  reward_lt?: Maybe<Scalars['BigInt']>;
  reward_lte?: Maybe<Scalars['BigInt']>;
  reward_not?: Maybe<Scalars['BigInt']>;
  reward_not_in?: Maybe<Array<Scalars['BigInt']>>;
  startTime?: Maybe<Scalars['BigInt']>;
  startTime_gt?: Maybe<Scalars['BigInt']>;
  startTime_gte?: Maybe<Scalars['BigInt']>;
  startTime_in?: Maybe<Array<Scalars['BigInt']>>;
  startTime_lt?: Maybe<Scalars['BigInt']>;
  startTime_lte?: Maybe<Scalars['BigInt']>;
  startTime_not?: Maybe<Scalars['BigInt']>;
  startTime_not_in?: Maybe<Array<Scalars['BigInt']>>;
  tier1Multiplier?: Maybe<Scalars['BigInt']>;
  tier1Multiplier_gt?: Maybe<Scalars['BigInt']>;
  tier1Multiplier_gte?: Maybe<Scalars['BigInt']>;
  tier1Multiplier_in?: Maybe<Array<Scalars['BigInt']>>;
  tier1Multiplier_lt?: Maybe<Scalars['BigInt']>;
  tier1Multiplier_lte?: Maybe<Scalars['BigInt']>;
  tier1Multiplier_not?: Maybe<Scalars['BigInt']>;
  tier1Multiplier_not_in?: Maybe<Array<Scalars['BigInt']>>;
  tier2Multiplier?: Maybe<Scalars['BigInt']>;
  tier2Multiplier_gt?: Maybe<Scalars['BigInt']>;
  tier2Multiplier_gte?: Maybe<Scalars['BigInt']>;
  tier2Multiplier_in?: Maybe<Array<Scalars['BigInt']>>;
  tier2Multiplier_lt?: Maybe<Scalars['BigInt']>;
  tier2Multiplier_lte?: Maybe<Scalars['BigInt']>;
  tier2Multiplier_not?: Maybe<Scalars['BigInt']>;
  tier2Multiplier_not_in?: Maybe<Array<Scalars['BigInt']>>;
  tier3Multiplier?: Maybe<Scalars['BigInt']>;
  tier3Multiplier_gt?: Maybe<Scalars['BigInt']>;
  tier3Multiplier_gte?: Maybe<Scalars['BigInt']>;
  tier3Multiplier_in?: Maybe<Array<Scalars['BigInt']>>;
  tier3Multiplier_lt?: Maybe<Scalars['BigInt']>;
  tier3Multiplier_lte?: Maybe<Scalars['BigInt']>;
  tier3Multiplier_not?: Maybe<Scalars['BigInt']>;
  tier3Multiplier_not_in?: Maybe<Array<Scalars['BigInt']>>;
  tokenAmountForTier1?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier1_gt?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier1_gte?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier1_in?: Maybe<Array<Scalars['BigInt']>>;
  tokenAmountForTier1_lt?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier1_lte?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier1_not?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier1_not_in?: Maybe<Array<Scalars['BigInt']>>;
  tokenAmountForTier2?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier2_gt?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier2_gte?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier2_in?: Maybe<Array<Scalars['BigInt']>>;
  tokenAmountForTier2_lt?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier2_lte?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier2_not?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier2_not_in?: Maybe<Array<Scalars['BigInt']>>;
  tokenAmountForTier3?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier3_gt?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier3_gte?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier3_in?: Maybe<Array<Scalars['BigInt']>>;
  tokenAmountForTier3_lt?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier3_lte?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier3_not?: Maybe<Scalars['BigInt']>;
  tokenAmountForTier3_not_in?: Maybe<Array<Scalars['BigInt']>>;
};

export enum LimitFarming_OrderBy {
  BonusReward = 'bonusReward',
  BonusRewardToken = 'bonusRewardToken',
  CreatedAtTimestamp = 'createdAtTimestamp',
  EndTime = 'endTime',
  EnterStartTime = 'enterStartTime',
  Id = 'id',
  IsDetached = 'isDetached',
  MinRangeLength = 'minRangeLength',
  MultiplierToken = 'multiplierToken',
  Pool = 'pool',
  Reward = 'reward',
  RewardToken = 'rewardToken',
  StartTime = 'startTime',
  Tier1Multiplier = 'tier1Multiplier',
  Tier2Multiplier = 'tier2Multiplier',
  Tier3Multiplier = 'tier3Multiplier',
  TokenAmountForTier1 = 'tokenAmountForTier1',
  TokenAmountForTier2 = 'tokenAmountForTier2',
  TokenAmountForTier3 = 'tokenAmountForTier3',
}

export type Mint = {
  __typename?: 'Mint';
  amount: Scalars['BigInt'];
  amount0: Scalars['BigDecimal'];
  amount1: Scalars['BigDecimal'];
  amountUSD?: Maybe<Scalars['BigDecimal']>;
  id: Scalars['ID'];
  logIndex?: Maybe<Scalars['BigInt']>;
  origin: Scalars['Bytes'];
  owner: Scalars['Bytes'];
  pool: Pool;
  sender?: Maybe<Scalars['Bytes']>;
  tickLower: Scalars['BigInt'];
  tickUpper: Scalars['BigInt'];
  timestamp: Scalars['BigInt'];
  token0: Token;
  token1: Token;
  transaction: Transaction;
};

export type Mint_Filter = {
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  amount?: Maybe<Scalars['BigInt']>;
  amount0?: Maybe<Scalars['BigDecimal']>;
  amount0_gt?: Maybe<Scalars['BigDecimal']>;
  amount0_gte?: Maybe<Scalars['BigDecimal']>;
  amount0_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amount0_lt?: Maybe<Scalars['BigDecimal']>;
  amount0_lte?: Maybe<Scalars['BigDecimal']>;
  amount0_not?: Maybe<Scalars['BigDecimal']>;
  amount0_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amount1?: Maybe<Scalars['BigDecimal']>;
  amount1_gt?: Maybe<Scalars['BigDecimal']>;
  amount1_gte?: Maybe<Scalars['BigDecimal']>;
  amount1_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amount1_lt?: Maybe<Scalars['BigDecimal']>;
  amount1_lte?: Maybe<Scalars['BigDecimal']>;
  amount1_not?: Maybe<Scalars['BigDecimal']>;
  amount1_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amountUSD?: Maybe<Scalars['BigDecimal']>;
  amountUSD_gt?: Maybe<Scalars['BigDecimal']>;
  amountUSD_gte?: Maybe<Scalars['BigDecimal']>;
  amountUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amountUSD_lt?: Maybe<Scalars['BigDecimal']>;
  amountUSD_lte?: Maybe<Scalars['BigDecimal']>;
  amountUSD_not?: Maybe<Scalars['BigDecimal']>;
  amountUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amount_gt?: Maybe<Scalars['BigInt']>;
  amount_gte?: Maybe<Scalars['BigInt']>;
  amount_in?: Maybe<Array<Scalars['BigInt']>>;
  amount_lt?: Maybe<Scalars['BigInt']>;
  amount_lte?: Maybe<Scalars['BigInt']>;
  amount_not?: Maybe<Scalars['BigInt']>;
  amount_not_in?: Maybe<Array<Scalars['BigInt']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  logIndex?: Maybe<Scalars['BigInt']>;
  logIndex_gt?: Maybe<Scalars['BigInt']>;
  logIndex_gte?: Maybe<Scalars['BigInt']>;
  logIndex_in?: Maybe<Array<Scalars['BigInt']>>;
  logIndex_lt?: Maybe<Scalars['BigInt']>;
  logIndex_lte?: Maybe<Scalars['BigInt']>;
  logIndex_not?: Maybe<Scalars['BigInt']>;
  logIndex_not_in?: Maybe<Array<Scalars['BigInt']>>;
  origin?: Maybe<Scalars['Bytes']>;
  origin_contains?: Maybe<Scalars['Bytes']>;
  origin_in?: Maybe<Array<Scalars['Bytes']>>;
  origin_not?: Maybe<Scalars['Bytes']>;
  origin_not_contains?: Maybe<Scalars['Bytes']>;
  origin_not_in?: Maybe<Array<Scalars['Bytes']>>;
  owner?: Maybe<Scalars['Bytes']>;
  owner_contains?: Maybe<Scalars['Bytes']>;
  owner_in?: Maybe<Array<Scalars['Bytes']>>;
  owner_not?: Maybe<Scalars['Bytes']>;
  owner_not_contains?: Maybe<Scalars['Bytes']>;
  owner_not_in?: Maybe<Array<Scalars['Bytes']>>;
  pool?: Maybe<Scalars['String']>;
  pool_?: Maybe<Pool_Filter>;
  pool_contains?: Maybe<Scalars['String']>;
  pool_contains_nocase?: Maybe<Scalars['String']>;
  pool_ends_with?: Maybe<Scalars['String']>;
  pool_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_gt?: Maybe<Scalars['String']>;
  pool_gte?: Maybe<Scalars['String']>;
  pool_in?: Maybe<Array<Scalars['String']>>;
  pool_lt?: Maybe<Scalars['String']>;
  pool_lte?: Maybe<Scalars['String']>;
  pool_not?: Maybe<Scalars['String']>;
  pool_not_contains?: Maybe<Scalars['String']>;
  pool_not_contains_nocase?: Maybe<Scalars['String']>;
  pool_not_ends_with?: Maybe<Scalars['String']>;
  pool_not_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_not_in?: Maybe<Array<Scalars['String']>>;
  pool_not_starts_with?: Maybe<Scalars['String']>;
  pool_not_starts_with_nocase?: Maybe<Scalars['String']>;
  pool_starts_with?: Maybe<Scalars['String']>;
  pool_starts_with_nocase?: Maybe<Scalars['String']>;
  sender?: Maybe<Scalars['Bytes']>;
  sender_contains?: Maybe<Scalars['Bytes']>;
  sender_in?: Maybe<Array<Scalars['Bytes']>>;
  sender_not?: Maybe<Scalars['Bytes']>;
  sender_not_contains?: Maybe<Scalars['Bytes']>;
  sender_not_in?: Maybe<Array<Scalars['Bytes']>>;
  tickLower?: Maybe<Scalars['BigInt']>;
  tickLower_gt?: Maybe<Scalars['BigInt']>;
  tickLower_gte?: Maybe<Scalars['BigInt']>;
  tickLower_in?: Maybe<Array<Scalars['BigInt']>>;
  tickLower_lt?: Maybe<Scalars['BigInt']>;
  tickLower_lte?: Maybe<Scalars['BigInt']>;
  tickLower_not?: Maybe<Scalars['BigInt']>;
  tickLower_not_in?: Maybe<Array<Scalars['BigInt']>>;
  tickUpper?: Maybe<Scalars['BigInt']>;
  tickUpper_gt?: Maybe<Scalars['BigInt']>;
  tickUpper_gte?: Maybe<Scalars['BigInt']>;
  tickUpper_in?: Maybe<Array<Scalars['BigInt']>>;
  tickUpper_lt?: Maybe<Scalars['BigInt']>;
  tickUpper_lte?: Maybe<Scalars['BigInt']>;
  tickUpper_not?: Maybe<Scalars['BigInt']>;
  tickUpper_not_in?: Maybe<Array<Scalars['BigInt']>>;
  timestamp?: Maybe<Scalars['BigInt']>;
  timestamp_gt?: Maybe<Scalars['BigInt']>;
  timestamp_gte?: Maybe<Scalars['BigInt']>;
  timestamp_in?: Maybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: Maybe<Scalars['BigInt']>;
  timestamp_lte?: Maybe<Scalars['BigInt']>;
  timestamp_not?: Maybe<Scalars['BigInt']>;
  timestamp_not_in?: Maybe<Array<Scalars['BigInt']>>;
  token0?: Maybe<Scalars['String']>;
  token0_?: Maybe<Token_Filter>;
  token0_contains?: Maybe<Scalars['String']>;
  token0_contains_nocase?: Maybe<Scalars['String']>;
  token0_ends_with?: Maybe<Scalars['String']>;
  token0_ends_with_nocase?: Maybe<Scalars['String']>;
  token0_gt?: Maybe<Scalars['String']>;
  token0_gte?: Maybe<Scalars['String']>;
  token0_in?: Maybe<Array<Scalars['String']>>;
  token0_lt?: Maybe<Scalars['String']>;
  token0_lte?: Maybe<Scalars['String']>;
  token0_not?: Maybe<Scalars['String']>;
  token0_not_contains?: Maybe<Scalars['String']>;
  token0_not_contains_nocase?: Maybe<Scalars['String']>;
  token0_not_ends_with?: Maybe<Scalars['String']>;
  token0_not_ends_with_nocase?: Maybe<Scalars['String']>;
  token0_not_in?: Maybe<Array<Scalars['String']>>;
  token0_not_starts_with?: Maybe<Scalars['String']>;
  token0_not_starts_with_nocase?: Maybe<Scalars['String']>;
  token0_starts_with?: Maybe<Scalars['String']>;
  token0_starts_with_nocase?: Maybe<Scalars['String']>;
  token1?: Maybe<Scalars['String']>;
  token1_?: Maybe<Token_Filter>;
  token1_contains?: Maybe<Scalars['String']>;
  token1_contains_nocase?: Maybe<Scalars['String']>;
  token1_ends_with?: Maybe<Scalars['String']>;
  token1_ends_with_nocase?: Maybe<Scalars['String']>;
  token1_gt?: Maybe<Scalars['String']>;
  token1_gte?: Maybe<Scalars['String']>;
  token1_in?: Maybe<Array<Scalars['String']>>;
  token1_lt?: Maybe<Scalars['String']>;
  token1_lte?: Maybe<Scalars['String']>;
  token1_not?: Maybe<Scalars['String']>;
  token1_not_contains?: Maybe<Scalars['String']>;
  token1_not_contains_nocase?: Maybe<Scalars['String']>;
  token1_not_ends_with?: Maybe<Scalars['String']>;
  token1_not_ends_with_nocase?: Maybe<Scalars['String']>;
  token1_not_in?: Maybe<Array<Scalars['String']>>;
  token1_not_starts_with?: Maybe<Scalars['String']>;
  token1_not_starts_with_nocase?: Maybe<Scalars['String']>;
  token1_starts_with?: Maybe<Scalars['String']>;
  token1_starts_with_nocase?: Maybe<Scalars['String']>;
  transaction?: Maybe<Scalars['String']>;
  transaction_?: Maybe<Transaction_Filter>;
  transaction_contains?: Maybe<Scalars['String']>;
  transaction_contains_nocase?: Maybe<Scalars['String']>;
  transaction_ends_with?: Maybe<Scalars['String']>;
  transaction_ends_with_nocase?: Maybe<Scalars['String']>;
  transaction_gt?: Maybe<Scalars['String']>;
  transaction_gte?: Maybe<Scalars['String']>;
  transaction_in?: Maybe<Array<Scalars['String']>>;
  transaction_lt?: Maybe<Scalars['String']>;
  transaction_lte?: Maybe<Scalars['String']>;
  transaction_not?: Maybe<Scalars['String']>;
  transaction_not_contains?: Maybe<Scalars['String']>;
  transaction_not_contains_nocase?: Maybe<Scalars['String']>;
  transaction_not_ends_with?: Maybe<Scalars['String']>;
  transaction_not_ends_with_nocase?: Maybe<Scalars['String']>;
  transaction_not_in?: Maybe<Array<Scalars['String']>>;
  transaction_not_starts_with?: Maybe<Scalars['String']>;
  transaction_not_starts_with_nocase?: Maybe<Scalars['String']>;
  transaction_starts_with?: Maybe<Scalars['String']>;
  transaction_starts_with_nocase?: Maybe<Scalars['String']>;
};

export enum Mint_OrderBy {
  Amount = 'amount',
  Amount0 = 'amount0',
  Amount1 = 'amount1',
  AmountUsd = 'amountUSD',
  Id = 'id',
  LogIndex = 'logIndex',
  Origin = 'origin',
  Owner = 'owner',
  Pool = 'pool',
  Sender = 'sender',
  TickLower = 'tickLower',
  TickUpper = 'tickUpper',
  Timestamp = 'timestamp',
  Token0 = 'token0',
  Token1 = 'token1',
  Transaction = 'transaction',
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export type Pool = {
  __typename?: 'Pool';
  burns: Array<Burn>;
  collectedFeesToken0: Scalars['BigDecimal'];
  collectedFeesToken1: Scalars['BigDecimal'];
  collectedFeesUSD: Scalars['BigDecimal'];
  collects: Array<Collect>;
  communityFee0: Scalars['BigInt'];
  communityFee1: Scalars['BigInt'];
  createdAtBlockNumber: Scalars['BigInt'];
  createdAtTimestamp: Scalars['BigInt'];
  fee: Scalars['BigInt'];
  feeGrowthGlobal0X128: Scalars['BigInt'];
  feeGrowthGlobal1X128: Scalars['BigInt'];
  feesToken0: Scalars['BigDecimal'];
  feesToken1: Scalars['BigDecimal'];
  feesUSD: Scalars['BigDecimal'];
  id: Scalars['ID'];
  liquidity: Scalars['BigInt'];
  liquidityProviderCount: Scalars['BigInt'];
  mints: Array<Mint>;
  observationIndex: Scalars['BigInt'];
  poolDayData: Array<PoolDayData>;
  poolHourData: Array<PoolHourData>;
  sqrtPrice: Scalars['BigInt'];
  swaps: Array<Swap>;
  tick: Scalars['BigInt'];
  ticks: Array<Tick>;
  token0: Token;
  token0Price: Scalars['BigDecimal'];
  token1: Token;
  token1Price: Scalars['BigDecimal'];
  totalValueLockedMatic: Scalars['BigDecimal'];
  totalValueLockedToken0: Scalars['BigDecimal'];
  totalValueLockedToken1: Scalars['BigDecimal'];
  totalValueLockedUSD: Scalars['BigDecimal'];
  totalValueLockedUSDUntracked: Scalars['BigDecimal'];
  txCount: Scalars['BigInt'];
  untrackedFeesUSD: Scalars['BigDecimal'];
  untrackedVolumeUSD: Scalars['BigDecimal'];
  volumeToken0: Scalars['BigDecimal'];
  volumeToken1: Scalars['BigDecimal'];
  volumeUSD: Scalars['BigDecimal'];
};

export type PoolBurnsArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Burn_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  where?: Maybe<Burn_Filter>;
};

export type PoolCollectsArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Collect_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  where?: Maybe<Collect_Filter>;
};

export type PoolMintsArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Mint_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  where?: Maybe<Mint_Filter>;
};

export type PoolPoolDayDataArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<PoolDayData_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  where?: Maybe<PoolDayData_Filter>;
};

export type PoolPoolHourDataArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<PoolHourData_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  where?: Maybe<PoolHourData_Filter>;
};

export type PoolSwapsArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Swap_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  where?: Maybe<Swap_Filter>;
};

export type PoolTicksArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Tick_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  where?: Maybe<Tick_Filter>;
};

export type PoolDayData = {
  __typename?: 'PoolDayData';
  close: Scalars['BigDecimal'];
  date: Scalars['Int'];
  feeGrowthGlobal0X128: Scalars['BigInt'];
  feeGrowthGlobal1X128: Scalars['BigInt'];
  feesToken0: Scalars['BigDecimal'];
  feesToken1: Scalars['BigDecimal'];
  feesUSD: Scalars['BigDecimal'];
  high: Scalars['BigDecimal'];
  id: Scalars['ID'];
  liquidity: Scalars['BigInt'];
  low: Scalars['BigDecimal'];
  open: Scalars['BigDecimal'];
  pool: Pool;
  sqrtPrice: Scalars['BigInt'];
  tick?: Maybe<Scalars['BigInt']>;
  token0Price: Scalars['BigDecimal'];
  token1Price: Scalars['BigDecimal'];
  tvlUSD: Scalars['BigDecimal'];
  txCount: Scalars['BigInt'];
  untrackedVolumeUSD: Scalars['BigDecimal'];
  volumeToken0: Scalars['BigDecimal'];
  volumeToken1: Scalars['BigDecimal'];
  volumeUSD: Scalars['BigDecimal'];
};

export type PoolDayData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  close?: Maybe<Scalars['BigDecimal']>;
  close_gt?: Maybe<Scalars['BigDecimal']>;
  close_gte?: Maybe<Scalars['BigDecimal']>;
  close_in?: Maybe<Array<Scalars['BigDecimal']>>;
  close_lt?: Maybe<Scalars['BigDecimal']>;
  close_lte?: Maybe<Scalars['BigDecimal']>;
  close_not?: Maybe<Scalars['BigDecimal']>;
  close_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  date?: Maybe<Scalars['Int']>;
  date_gt?: Maybe<Scalars['Int']>;
  date_gte?: Maybe<Scalars['Int']>;
  date_in?: Maybe<Array<Scalars['Int']>>;
  date_lt?: Maybe<Scalars['Int']>;
  date_lte?: Maybe<Scalars['Int']>;
  date_not?: Maybe<Scalars['Int']>;
  date_not_in?: Maybe<Array<Scalars['Int']>>;
  feeGrowthGlobal0X128?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal0X128_gt?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal0X128_gte?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal0X128_in?: Maybe<Array<Scalars['BigInt']>>;
  feeGrowthGlobal0X128_lt?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal0X128_lte?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal0X128_not?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal0X128_not_in?: Maybe<Array<Scalars['BigInt']>>;
  feeGrowthGlobal1X128?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal1X128_gt?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal1X128_gte?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal1X128_in?: Maybe<Array<Scalars['BigInt']>>;
  feeGrowthGlobal1X128_lt?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal1X128_lte?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal1X128_not?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal1X128_not_in?: Maybe<Array<Scalars['BigInt']>>;
  feesToken0?: Maybe<Scalars['BigDecimal']>;
  feesToken0_gt?: Maybe<Scalars['BigDecimal']>;
  feesToken0_gte?: Maybe<Scalars['BigDecimal']>;
  feesToken0_in?: Maybe<Array<Scalars['BigDecimal']>>;
  feesToken0_lt?: Maybe<Scalars['BigDecimal']>;
  feesToken0_lte?: Maybe<Scalars['BigDecimal']>;
  feesToken0_not?: Maybe<Scalars['BigDecimal']>;
  feesToken0_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  feesToken1?: Maybe<Scalars['BigDecimal']>;
  feesToken1_gt?: Maybe<Scalars['BigDecimal']>;
  feesToken1_gte?: Maybe<Scalars['BigDecimal']>;
  feesToken1_in?: Maybe<Array<Scalars['BigDecimal']>>;
  feesToken1_lt?: Maybe<Scalars['BigDecimal']>;
  feesToken1_lte?: Maybe<Scalars['BigDecimal']>;
  feesToken1_not?: Maybe<Scalars['BigDecimal']>;
  feesToken1_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  feesUSD?: Maybe<Scalars['BigDecimal']>;
  feesUSD_gt?: Maybe<Scalars['BigDecimal']>;
  feesUSD_gte?: Maybe<Scalars['BigDecimal']>;
  feesUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  feesUSD_lt?: Maybe<Scalars['BigDecimal']>;
  feesUSD_lte?: Maybe<Scalars['BigDecimal']>;
  feesUSD_not?: Maybe<Scalars['BigDecimal']>;
  feesUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  high?: Maybe<Scalars['BigDecimal']>;
  high_gt?: Maybe<Scalars['BigDecimal']>;
  high_gte?: Maybe<Scalars['BigDecimal']>;
  high_in?: Maybe<Array<Scalars['BigDecimal']>>;
  high_lt?: Maybe<Scalars['BigDecimal']>;
  high_lte?: Maybe<Scalars['BigDecimal']>;
  high_not?: Maybe<Scalars['BigDecimal']>;
  high_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  liquidity?: Maybe<Scalars['BigInt']>;
  liquidity_gt?: Maybe<Scalars['BigInt']>;
  liquidity_gte?: Maybe<Scalars['BigInt']>;
  liquidity_in?: Maybe<Array<Scalars['BigInt']>>;
  liquidity_lt?: Maybe<Scalars['BigInt']>;
  liquidity_lte?: Maybe<Scalars['BigInt']>;
  liquidity_not?: Maybe<Scalars['BigInt']>;
  liquidity_not_in?: Maybe<Array<Scalars['BigInt']>>;
  low?: Maybe<Scalars['BigDecimal']>;
  low_gt?: Maybe<Scalars['BigDecimal']>;
  low_gte?: Maybe<Scalars['BigDecimal']>;
  low_in?: Maybe<Array<Scalars['BigDecimal']>>;
  low_lt?: Maybe<Scalars['BigDecimal']>;
  low_lte?: Maybe<Scalars['BigDecimal']>;
  low_not?: Maybe<Scalars['BigDecimal']>;
  low_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  open?: Maybe<Scalars['BigDecimal']>;
  open_gt?: Maybe<Scalars['BigDecimal']>;
  open_gte?: Maybe<Scalars['BigDecimal']>;
  open_in?: Maybe<Array<Scalars['BigDecimal']>>;
  open_lt?: Maybe<Scalars['BigDecimal']>;
  open_lte?: Maybe<Scalars['BigDecimal']>;
  open_not?: Maybe<Scalars['BigDecimal']>;
  open_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  pool?: Maybe<Scalars['String']>;
  pool_?: Maybe<Pool_Filter>;
  pool_contains?: Maybe<Scalars['String']>;
  pool_contains_nocase?: Maybe<Scalars['String']>;
  pool_ends_with?: Maybe<Scalars['String']>;
  pool_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_gt?: Maybe<Scalars['String']>;
  pool_gte?: Maybe<Scalars['String']>;
  pool_in?: Maybe<Array<Scalars['String']>>;
  pool_lt?: Maybe<Scalars['String']>;
  pool_lte?: Maybe<Scalars['String']>;
  pool_not?: Maybe<Scalars['String']>;
  pool_not_contains?: Maybe<Scalars['String']>;
  pool_not_contains_nocase?: Maybe<Scalars['String']>;
  pool_not_ends_with?: Maybe<Scalars['String']>;
  pool_not_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_not_in?: Maybe<Array<Scalars['String']>>;
  pool_not_starts_with?: Maybe<Scalars['String']>;
  pool_not_starts_with_nocase?: Maybe<Scalars['String']>;
  pool_starts_with?: Maybe<Scalars['String']>;
  pool_starts_with_nocase?: Maybe<Scalars['String']>;
  sqrtPrice?: Maybe<Scalars['BigInt']>;
  sqrtPrice_gt?: Maybe<Scalars['BigInt']>;
  sqrtPrice_gte?: Maybe<Scalars['BigInt']>;
  sqrtPrice_in?: Maybe<Array<Scalars['BigInt']>>;
  sqrtPrice_lt?: Maybe<Scalars['BigInt']>;
  sqrtPrice_lte?: Maybe<Scalars['BigInt']>;
  sqrtPrice_not?: Maybe<Scalars['BigInt']>;
  sqrtPrice_not_in?: Maybe<Array<Scalars['BigInt']>>;
  tick?: Maybe<Scalars['BigInt']>;
  tick_gt?: Maybe<Scalars['BigInt']>;
  tick_gte?: Maybe<Scalars['BigInt']>;
  tick_in?: Maybe<Array<Scalars['BigInt']>>;
  tick_lt?: Maybe<Scalars['BigInt']>;
  tick_lte?: Maybe<Scalars['BigInt']>;
  tick_not?: Maybe<Scalars['BigInt']>;
  tick_not_in?: Maybe<Array<Scalars['BigInt']>>;
  token0Price?: Maybe<Scalars['BigDecimal']>;
  token0Price_gt?: Maybe<Scalars['BigDecimal']>;
  token0Price_gte?: Maybe<Scalars['BigDecimal']>;
  token0Price_in?: Maybe<Array<Scalars['BigDecimal']>>;
  token0Price_lt?: Maybe<Scalars['BigDecimal']>;
  token0Price_lte?: Maybe<Scalars['BigDecimal']>;
  token0Price_not?: Maybe<Scalars['BigDecimal']>;
  token0Price_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  token1Price?: Maybe<Scalars['BigDecimal']>;
  token1Price_gt?: Maybe<Scalars['BigDecimal']>;
  token1Price_gte?: Maybe<Scalars['BigDecimal']>;
  token1Price_in?: Maybe<Array<Scalars['BigDecimal']>>;
  token1Price_lt?: Maybe<Scalars['BigDecimal']>;
  token1Price_lte?: Maybe<Scalars['BigDecimal']>;
  token1Price_not?: Maybe<Scalars['BigDecimal']>;
  token1Price_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  tvlUSD?: Maybe<Scalars['BigDecimal']>;
  tvlUSD_gt?: Maybe<Scalars['BigDecimal']>;
  tvlUSD_gte?: Maybe<Scalars['BigDecimal']>;
  tvlUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  tvlUSD_lt?: Maybe<Scalars['BigDecimal']>;
  tvlUSD_lte?: Maybe<Scalars['BigDecimal']>;
  tvlUSD_not?: Maybe<Scalars['BigDecimal']>;
  tvlUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  txCount?: Maybe<Scalars['BigInt']>;
  txCount_gt?: Maybe<Scalars['BigInt']>;
  txCount_gte?: Maybe<Scalars['BigInt']>;
  txCount_in?: Maybe<Array<Scalars['BigInt']>>;
  txCount_lt?: Maybe<Scalars['BigInt']>;
  txCount_lte?: Maybe<Scalars['BigInt']>;
  txCount_not?: Maybe<Scalars['BigInt']>;
  txCount_not_in?: Maybe<Array<Scalars['BigInt']>>;
  untrackedVolumeUSD?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_gt?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_gte?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  untrackedVolumeUSD_lt?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_lte?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_not?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeToken0?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_gt?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_gte?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeToken0_lt?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_lte?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_not?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeToken1?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_gt?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_gte?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeToken1_lt?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_lte?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_not?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeUSD?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_gt?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_gte?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeUSD_lt?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_lte?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_not?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
};

export enum PoolDayData_OrderBy {
  Close = 'close',
  Date = 'date',
  FeeGrowthGlobal0X128 = 'feeGrowthGlobal0X128',
  FeeGrowthGlobal1X128 = 'feeGrowthGlobal1X128',
  FeesToken0 = 'feesToken0',
  FeesToken1 = 'feesToken1',
  FeesUsd = 'feesUSD',
  High = 'high',
  Id = 'id',
  Liquidity = 'liquidity',
  Low = 'low',
  Open = 'open',
  Pool = 'pool',
  SqrtPrice = 'sqrtPrice',
  Tick = 'tick',
  Token0Price = 'token0Price',
  Token1Price = 'token1Price',
  TvlUsd = 'tvlUSD',
  TxCount = 'txCount',
  UntrackedVolumeUsd = 'untrackedVolumeUSD',
  VolumeToken0 = 'volumeToken0',
  VolumeToken1 = 'volumeToken1',
  VolumeUsd = 'volumeUSD',
}

export type PoolFeeData = {
  __typename?: 'PoolFeeData';
  fee: Scalars['BigInt'];
  id: Scalars['ID'];
  pool?: Maybe<Scalars['String']>;
  timestamp: Scalars['BigInt'];
};

export type PoolFeeData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  fee?: Maybe<Scalars['BigInt']>;
  fee_gt?: Maybe<Scalars['BigInt']>;
  fee_gte?: Maybe<Scalars['BigInt']>;
  fee_in?: Maybe<Array<Scalars['BigInt']>>;
  fee_lt?: Maybe<Scalars['BigInt']>;
  fee_lte?: Maybe<Scalars['BigInt']>;
  fee_not?: Maybe<Scalars['BigInt']>;
  fee_not_in?: Maybe<Array<Scalars['BigInt']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  pool?: Maybe<Scalars['String']>;
  pool_contains?: Maybe<Scalars['String']>;
  pool_contains_nocase?: Maybe<Scalars['String']>;
  pool_ends_with?: Maybe<Scalars['String']>;
  pool_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_gt?: Maybe<Scalars['String']>;
  pool_gte?: Maybe<Scalars['String']>;
  pool_in?: Maybe<Array<Scalars['String']>>;
  pool_lt?: Maybe<Scalars['String']>;
  pool_lte?: Maybe<Scalars['String']>;
  pool_not?: Maybe<Scalars['String']>;
  pool_not_contains?: Maybe<Scalars['String']>;
  pool_not_contains_nocase?: Maybe<Scalars['String']>;
  pool_not_ends_with?: Maybe<Scalars['String']>;
  pool_not_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_not_in?: Maybe<Array<Scalars['String']>>;
  pool_not_starts_with?: Maybe<Scalars['String']>;
  pool_not_starts_with_nocase?: Maybe<Scalars['String']>;
  pool_starts_with?: Maybe<Scalars['String']>;
  pool_starts_with_nocase?: Maybe<Scalars['String']>;
  timestamp?: Maybe<Scalars['BigInt']>;
  timestamp_gt?: Maybe<Scalars['BigInt']>;
  timestamp_gte?: Maybe<Scalars['BigInt']>;
  timestamp_in?: Maybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: Maybe<Scalars['BigInt']>;
  timestamp_lte?: Maybe<Scalars['BigInt']>;
  timestamp_not?: Maybe<Scalars['BigInt']>;
  timestamp_not_in?: Maybe<Array<Scalars['BigInt']>>;
};

export enum PoolFeeData_OrderBy {
  Fee = 'fee',
  Id = 'id',
  Pool = 'pool',
  Timestamp = 'timestamp',
}

export type PoolHourData = {
  __typename?: 'PoolHourData';
  close: Scalars['BigDecimal'];
  feeGrowthGlobal0X128: Scalars['BigInt'];
  feeGrowthGlobal1X128: Scalars['BigInt'];
  feesUSD: Scalars['BigDecimal'];
  high: Scalars['BigDecimal'];
  id: Scalars['ID'];
  liquidity: Scalars['BigInt'];
  low: Scalars['BigDecimal'];
  open: Scalars['BigDecimal'];
  periodStartUnix: Scalars['Int'];
  pool: Pool;
  sqrtPrice: Scalars['BigInt'];
  tick?: Maybe<Scalars['BigInt']>;
  token0Price: Scalars['BigDecimal'];
  token1Price: Scalars['BigDecimal'];
  tvlUSD: Scalars['BigDecimal'];
  txCount: Scalars['BigInt'];
  untrackedVolumeUSD: Scalars['BigDecimal'];
  volumeToken0: Scalars['BigDecimal'];
  volumeToken1: Scalars['BigDecimal'];
  volumeUSD: Scalars['BigDecimal'];
};

export type PoolHourData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  close?: Maybe<Scalars['BigDecimal']>;
  close_gt?: Maybe<Scalars['BigDecimal']>;
  close_gte?: Maybe<Scalars['BigDecimal']>;
  close_in?: Maybe<Array<Scalars['BigDecimal']>>;
  close_lt?: Maybe<Scalars['BigDecimal']>;
  close_lte?: Maybe<Scalars['BigDecimal']>;
  close_not?: Maybe<Scalars['BigDecimal']>;
  close_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  feeGrowthGlobal0X128?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal0X128_gt?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal0X128_gte?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal0X128_in?: Maybe<Array<Scalars['BigInt']>>;
  feeGrowthGlobal0X128_lt?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal0X128_lte?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal0X128_not?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal0X128_not_in?: Maybe<Array<Scalars['BigInt']>>;
  feeGrowthGlobal1X128?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal1X128_gt?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal1X128_gte?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal1X128_in?: Maybe<Array<Scalars['BigInt']>>;
  feeGrowthGlobal1X128_lt?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal1X128_lte?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal1X128_not?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal1X128_not_in?: Maybe<Array<Scalars['BigInt']>>;
  feesUSD?: Maybe<Scalars['BigDecimal']>;
  feesUSD_gt?: Maybe<Scalars['BigDecimal']>;
  feesUSD_gte?: Maybe<Scalars['BigDecimal']>;
  feesUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  feesUSD_lt?: Maybe<Scalars['BigDecimal']>;
  feesUSD_lte?: Maybe<Scalars['BigDecimal']>;
  feesUSD_not?: Maybe<Scalars['BigDecimal']>;
  feesUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  high?: Maybe<Scalars['BigDecimal']>;
  high_gt?: Maybe<Scalars['BigDecimal']>;
  high_gte?: Maybe<Scalars['BigDecimal']>;
  high_in?: Maybe<Array<Scalars['BigDecimal']>>;
  high_lt?: Maybe<Scalars['BigDecimal']>;
  high_lte?: Maybe<Scalars['BigDecimal']>;
  high_not?: Maybe<Scalars['BigDecimal']>;
  high_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  liquidity?: Maybe<Scalars['BigInt']>;
  liquidity_gt?: Maybe<Scalars['BigInt']>;
  liquidity_gte?: Maybe<Scalars['BigInt']>;
  liquidity_in?: Maybe<Array<Scalars['BigInt']>>;
  liquidity_lt?: Maybe<Scalars['BigInt']>;
  liquidity_lte?: Maybe<Scalars['BigInt']>;
  liquidity_not?: Maybe<Scalars['BigInt']>;
  liquidity_not_in?: Maybe<Array<Scalars['BigInt']>>;
  low?: Maybe<Scalars['BigDecimal']>;
  low_gt?: Maybe<Scalars['BigDecimal']>;
  low_gte?: Maybe<Scalars['BigDecimal']>;
  low_in?: Maybe<Array<Scalars['BigDecimal']>>;
  low_lt?: Maybe<Scalars['BigDecimal']>;
  low_lte?: Maybe<Scalars['BigDecimal']>;
  low_not?: Maybe<Scalars['BigDecimal']>;
  low_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  open?: Maybe<Scalars['BigDecimal']>;
  open_gt?: Maybe<Scalars['BigDecimal']>;
  open_gte?: Maybe<Scalars['BigDecimal']>;
  open_in?: Maybe<Array<Scalars['BigDecimal']>>;
  open_lt?: Maybe<Scalars['BigDecimal']>;
  open_lte?: Maybe<Scalars['BigDecimal']>;
  open_not?: Maybe<Scalars['BigDecimal']>;
  open_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  periodStartUnix?: Maybe<Scalars['Int']>;
  periodStartUnix_gt?: Maybe<Scalars['Int']>;
  periodStartUnix_gte?: Maybe<Scalars['Int']>;
  periodStartUnix_in?: Maybe<Array<Scalars['Int']>>;
  periodStartUnix_lt?: Maybe<Scalars['Int']>;
  periodStartUnix_lte?: Maybe<Scalars['Int']>;
  periodStartUnix_not?: Maybe<Scalars['Int']>;
  periodStartUnix_not_in?: Maybe<Array<Scalars['Int']>>;
  pool?: Maybe<Scalars['String']>;
  pool_?: Maybe<Pool_Filter>;
  pool_contains?: Maybe<Scalars['String']>;
  pool_contains_nocase?: Maybe<Scalars['String']>;
  pool_ends_with?: Maybe<Scalars['String']>;
  pool_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_gt?: Maybe<Scalars['String']>;
  pool_gte?: Maybe<Scalars['String']>;
  pool_in?: Maybe<Array<Scalars['String']>>;
  pool_lt?: Maybe<Scalars['String']>;
  pool_lte?: Maybe<Scalars['String']>;
  pool_not?: Maybe<Scalars['String']>;
  pool_not_contains?: Maybe<Scalars['String']>;
  pool_not_contains_nocase?: Maybe<Scalars['String']>;
  pool_not_ends_with?: Maybe<Scalars['String']>;
  pool_not_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_not_in?: Maybe<Array<Scalars['String']>>;
  pool_not_starts_with?: Maybe<Scalars['String']>;
  pool_not_starts_with_nocase?: Maybe<Scalars['String']>;
  pool_starts_with?: Maybe<Scalars['String']>;
  pool_starts_with_nocase?: Maybe<Scalars['String']>;
  sqrtPrice?: Maybe<Scalars['BigInt']>;
  sqrtPrice_gt?: Maybe<Scalars['BigInt']>;
  sqrtPrice_gte?: Maybe<Scalars['BigInt']>;
  sqrtPrice_in?: Maybe<Array<Scalars['BigInt']>>;
  sqrtPrice_lt?: Maybe<Scalars['BigInt']>;
  sqrtPrice_lte?: Maybe<Scalars['BigInt']>;
  sqrtPrice_not?: Maybe<Scalars['BigInt']>;
  sqrtPrice_not_in?: Maybe<Array<Scalars['BigInt']>>;
  tick?: Maybe<Scalars['BigInt']>;
  tick_gt?: Maybe<Scalars['BigInt']>;
  tick_gte?: Maybe<Scalars['BigInt']>;
  tick_in?: Maybe<Array<Scalars['BigInt']>>;
  tick_lt?: Maybe<Scalars['BigInt']>;
  tick_lte?: Maybe<Scalars['BigInt']>;
  tick_not?: Maybe<Scalars['BigInt']>;
  tick_not_in?: Maybe<Array<Scalars['BigInt']>>;
  token0Price?: Maybe<Scalars['BigDecimal']>;
  token0Price_gt?: Maybe<Scalars['BigDecimal']>;
  token0Price_gte?: Maybe<Scalars['BigDecimal']>;
  token0Price_in?: Maybe<Array<Scalars['BigDecimal']>>;
  token0Price_lt?: Maybe<Scalars['BigDecimal']>;
  token0Price_lte?: Maybe<Scalars['BigDecimal']>;
  token0Price_not?: Maybe<Scalars['BigDecimal']>;
  token0Price_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  token1Price?: Maybe<Scalars['BigDecimal']>;
  token1Price_gt?: Maybe<Scalars['BigDecimal']>;
  token1Price_gte?: Maybe<Scalars['BigDecimal']>;
  token1Price_in?: Maybe<Array<Scalars['BigDecimal']>>;
  token1Price_lt?: Maybe<Scalars['BigDecimal']>;
  token1Price_lte?: Maybe<Scalars['BigDecimal']>;
  token1Price_not?: Maybe<Scalars['BigDecimal']>;
  token1Price_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  tvlUSD?: Maybe<Scalars['BigDecimal']>;
  tvlUSD_gt?: Maybe<Scalars['BigDecimal']>;
  tvlUSD_gte?: Maybe<Scalars['BigDecimal']>;
  tvlUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  tvlUSD_lt?: Maybe<Scalars['BigDecimal']>;
  tvlUSD_lte?: Maybe<Scalars['BigDecimal']>;
  tvlUSD_not?: Maybe<Scalars['BigDecimal']>;
  tvlUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  txCount?: Maybe<Scalars['BigInt']>;
  txCount_gt?: Maybe<Scalars['BigInt']>;
  txCount_gte?: Maybe<Scalars['BigInt']>;
  txCount_in?: Maybe<Array<Scalars['BigInt']>>;
  txCount_lt?: Maybe<Scalars['BigInt']>;
  txCount_lte?: Maybe<Scalars['BigInt']>;
  txCount_not?: Maybe<Scalars['BigInt']>;
  txCount_not_in?: Maybe<Array<Scalars['BigInt']>>;
  untrackedVolumeUSD?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_gt?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_gte?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  untrackedVolumeUSD_lt?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_lte?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_not?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeToken0?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_gt?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_gte?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeToken0_lt?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_lte?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_not?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeToken1?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_gt?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_gte?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeToken1_lt?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_lte?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_not?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeUSD?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_gt?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_gte?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeUSD_lt?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_lte?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_not?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
};

export enum PoolHourData_OrderBy {
  Close = 'close',
  FeeGrowthGlobal0X128 = 'feeGrowthGlobal0X128',
  FeeGrowthGlobal1X128 = 'feeGrowthGlobal1X128',
  FeesUsd = 'feesUSD',
  High = 'high',
  Id = 'id',
  Liquidity = 'liquidity',
  Low = 'low',
  Open = 'open',
  PeriodStartUnix = 'periodStartUnix',
  Pool = 'pool',
  SqrtPrice = 'sqrtPrice',
  Tick = 'tick',
  Token0Price = 'token0Price',
  Token1Price = 'token1Price',
  TvlUsd = 'tvlUSD',
  TxCount = 'txCount',
  UntrackedVolumeUsd = 'untrackedVolumeUSD',
  VolumeToken0 = 'volumeToken0',
  VolumeToken1 = 'volumeToken1',
  VolumeUsd = 'volumeUSD',
}

export type Pool_Filter = {
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  burns_?: Maybe<Burn_Filter>;
  collectedFeesToken0?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken0_gt?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken0_gte?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken0_in?: Maybe<Array<Scalars['BigDecimal']>>;
  collectedFeesToken0_lt?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken0_lte?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken0_not?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken0_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  collectedFeesToken1?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken1_gt?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken1_gte?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken1_in?: Maybe<Array<Scalars['BigDecimal']>>;
  collectedFeesToken1_lt?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken1_lte?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken1_not?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken1_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  collectedFeesUSD?: Maybe<Scalars['BigDecimal']>;
  collectedFeesUSD_gt?: Maybe<Scalars['BigDecimal']>;
  collectedFeesUSD_gte?: Maybe<Scalars['BigDecimal']>;
  collectedFeesUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  collectedFeesUSD_lt?: Maybe<Scalars['BigDecimal']>;
  collectedFeesUSD_lte?: Maybe<Scalars['BigDecimal']>;
  collectedFeesUSD_not?: Maybe<Scalars['BigDecimal']>;
  collectedFeesUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  collects_?: Maybe<Collect_Filter>;
  communityFee0?: Maybe<Scalars['BigInt']>;
  communityFee0_gt?: Maybe<Scalars['BigInt']>;
  communityFee0_gte?: Maybe<Scalars['BigInt']>;
  communityFee0_in?: Maybe<Array<Scalars['BigInt']>>;
  communityFee0_lt?: Maybe<Scalars['BigInt']>;
  communityFee0_lte?: Maybe<Scalars['BigInt']>;
  communityFee0_not?: Maybe<Scalars['BigInt']>;
  communityFee0_not_in?: Maybe<Array<Scalars['BigInt']>>;
  communityFee1?: Maybe<Scalars['BigInt']>;
  communityFee1_gt?: Maybe<Scalars['BigInt']>;
  communityFee1_gte?: Maybe<Scalars['BigInt']>;
  communityFee1_in?: Maybe<Array<Scalars['BigInt']>>;
  communityFee1_lt?: Maybe<Scalars['BigInt']>;
  communityFee1_lte?: Maybe<Scalars['BigInt']>;
  communityFee1_not?: Maybe<Scalars['BigInt']>;
  communityFee1_not_in?: Maybe<Array<Scalars['BigInt']>>;
  createdAtBlockNumber?: Maybe<Scalars['BigInt']>;
  createdAtBlockNumber_gt?: Maybe<Scalars['BigInt']>;
  createdAtBlockNumber_gte?: Maybe<Scalars['BigInt']>;
  createdAtBlockNumber_in?: Maybe<Array<Scalars['BigInt']>>;
  createdAtBlockNumber_lt?: Maybe<Scalars['BigInt']>;
  createdAtBlockNumber_lte?: Maybe<Scalars['BigInt']>;
  createdAtBlockNumber_not?: Maybe<Scalars['BigInt']>;
  createdAtBlockNumber_not_in?: Maybe<Array<Scalars['BigInt']>>;
  createdAtTimestamp?: Maybe<Scalars['BigInt']>;
  createdAtTimestamp_gt?: Maybe<Scalars['BigInt']>;
  createdAtTimestamp_gte?: Maybe<Scalars['BigInt']>;
  createdAtTimestamp_in?: Maybe<Array<Scalars['BigInt']>>;
  createdAtTimestamp_lt?: Maybe<Scalars['BigInt']>;
  createdAtTimestamp_lte?: Maybe<Scalars['BigInt']>;
  createdAtTimestamp_not?: Maybe<Scalars['BigInt']>;
  createdAtTimestamp_not_in?: Maybe<Array<Scalars['BigInt']>>;
  fee?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal0X128?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal0X128_gt?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal0X128_gte?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal0X128_in?: Maybe<Array<Scalars['BigInt']>>;
  feeGrowthGlobal0X128_lt?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal0X128_lte?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal0X128_not?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal0X128_not_in?: Maybe<Array<Scalars['BigInt']>>;
  feeGrowthGlobal1X128?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal1X128_gt?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal1X128_gte?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal1X128_in?: Maybe<Array<Scalars['BigInt']>>;
  feeGrowthGlobal1X128_lt?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal1X128_lte?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal1X128_not?: Maybe<Scalars['BigInt']>;
  feeGrowthGlobal1X128_not_in?: Maybe<Array<Scalars['BigInt']>>;
  fee_gt?: Maybe<Scalars['BigInt']>;
  fee_gte?: Maybe<Scalars['BigInt']>;
  fee_in?: Maybe<Array<Scalars['BigInt']>>;
  fee_lt?: Maybe<Scalars['BigInt']>;
  fee_lte?: Maybe<Scalars['BigInt']>;
  fee_not?: Maybe<Scalars['BigInt']>;
  fee_not_in?: Maybe<Array<Scalars['BigInt']>>;
  feesToken0?: Maybe<Scalars['BigDecimal']>;
  feesToken0_gt?: Maybe<Scalars['BigDecimal']>;
  feesToken0_gte?: Maybe<Scalars['BigDecimal']>;
  feesToken0_in?: Maybe<Array<Scalars['BigDecimal']>>;
  feesToken0_lt?: Maybe<Scalars['BigDecimal']>;
  feesToken0_lte?: Maybe<Scalars['BigDecimal']>;
  feesToken0_not?: Maybe<Scalars['BigDecimal']>;
  feesToken0_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  feesToken1?: Maybe<Scalars['BigDecimal']>;
  feesToken1_gt?: Maybe<Scalars['BigDecimal']>;
  feesToken1_gte?: Maybe<Scalars['BigDecimal']>;
  feesToken1_in?: Maybe<Array<Scalars['BigDecimal']>>;
  feesToken1_lt?: Maybe<Scalars['BigDecimal']>;
  feesToken1_lte?: Maybe<Scalars['BigDecimal']>;
  feesToken1_not?: Maybe<Scalars['BigDecimal']>;
  feesToken1_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  feesUSD?: Maybe<Scalars['BigDecimal']>;
  feesUSD_gt?: Maybe<Scalars['BigDecimal']>;
  feesUSD_gte?: Maybe<Scalars['BigDecimal']>;
  feesUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  feesUSD_lt?: Maybe<Scalars['BigDecimal']>;
  feesUSD_lte?: Maybe<Scalars['BigDecimal']>;
  feesUSD_not?: Maybe<Scalars['BigDecimal']>;
  feesUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  liquidity?: Maybe<Scalars['BigInt']>;
  liquidityProviderCount?: Maybe<Scalars['BigInt']>;
  liquidityProviderCount_gt?: Maybe<Scalars['BigInt']>;
  liquidityProviderCount_gte?: Maybe<Scalars['BigInt']>;
  liquidityProviderCount_in?: Maybe<Array<Scalars['BigInt']>>;
  liquidityProviderCount_lt?: Maybe<Scalars['BigInt']>;
  liquidityProviderCount_lte?: Maybe<Scalars['BigInt']>;
  liquidityProviderCount_not?: Maybe<Scalars['BigInt']>;
  liquidityProviderCount_not_in?: Maybe<Array<Scalars['BigInt']>>;
  liquidity_gt?: Maybe<Scalars['BigInt']>;
  liquidity_gte?: Maybe<Scalars['BigInt']>;
  liquidity_in?: Maybe<Array<Scalars['BigInt']>>;
  liquidity_lt?: Maybe<Scalars['BigInt']>;
  liquidity_lte?: Maybe<Scalars['BigInt']>;
  liquidity_not?: Maybe<Scalars['BigInt']>;
  liquidity_not_in?: Maybe<Array<Scalars['BigInt']>>;
  mints_?: Maybe<Mint_Filter>;
  observationIndex?: Maybe<Scalars['BigInt']>;
  observationIndex_gt?: Maybe<Scalars['BigInt']>;
  observationIndex_gte?: Maybe<Scalars['BigInt']>;
  observationIndex_in?: Maybe<Array<Scalars['BigInt']>>;
  observationIndex_lt?: Maybe<Scalars['BigInt']>;
  observationIndex_lte?: Maybe<Scalars['BigInt']>;
  observationIndex_not?: Maybe<Scalars['BigInt']>;
  observationIndex_not_in?: Maybe<Array<Scalars['BigInt']>>;
  poolDayData_?: Maybe<PoolDayData_Filter>;
  poolHourData_?: Maybe<PoolHourData_Filter>;
  sqrtPrice?: Maybe<Scalars['BigInt']>;
  sqrtPrice_gt?: Maybe<Scalars['BigInt']>;
  sqrtPrice_gte?: Maybe<Scalars['BigInt']>;
  sqrtPrice_in?: Maybe<Array<Scalars['BigInt']>>;
  sqrtPrice_lt?: Maybe<Scalars['BigInt']>;
  sqrtPrice_lte?: Maybe<Scalars['BigInt']>;
  sqrtPrice_not?: Maybe<Scalars['BigInt']>;
  sqrtPrice_not_in?: Maybe<Array<Scalars['BigInt']>>;
  swaps_?: Maybe<Swap_Filter>;
  tick?: Maybe<Scalars['BigInt']>;
  tick_gt?: Maybe<Scalars['BigInt']>;
  tick_gte?: Maybe<Scalars['BigInt']>;
  tick_in?: Maybe<Array<Scalars['BigInt']>>;
  tick_lt?: Maybe<Scalars['BigInt']>;
  tick_lte?: Maybe<Scalars['BigInt']>;
  tick_not?: Maybe<Scalars['BigInt']>;
  tick_not_in?: Maybe<Array<Scalars['BigInt']>>;
  ticks_?: Maybe<Tick_Filter>;
  token0?: Maybe<Scalars['String']>;
  token0Price?: Maybe<Scalars['BigDecimal']>;
  token0Price_gt?: Maybe<Scalars['BigDecimal']>;
  token0Price_gte?: Maybe<Scalars['BigDecimal']>;
  token0Price_in?: Maybe<Array<Scalars['BigDecimal']>>;
  token0Price_lt?: Maybe<Scalars['BigDecimal']>;
  token0Price_lte?: Maybe<Scalars['BigDecimal']>;
  token0Price_not?: Maybe<Scalars['BigDecimal']>;
  token0Price_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  token0_?: Maybe<Token_Filter>;
  token0_contains?: Maybe<Scalars['String']>;
  token0_contains_nocase?: Maybe<Scalars['String']>;
  token0_ends_with?: Maybe<Scalars['String']>;
  token0_ends_with_nocase?: Maybe<Scalars['String']>;
  token0_gt?: Maybe<Scalars['String']>;
  token0_gte?: Maybe<Scalars['String']>;
  token0_in?: Maybe<Array<Scalars['String']>>;
  token0_lt?: Maybe<Scalars['String']>;
  token0_lte?: Maybe<Scalars['String']>;
  token0_not?: Maybe<Scalars['String']>;
  token0_not_contains?: Maybe<Scalars['String']>;
  token0_not_contains_nocase?: Maybe<Scalars['String']>;
  token0_not_ends_with?: Maybe<Scalars['String']>;
  token0_not_ends_with_nocase?: Maybe<Scalars['String']>;
  token0_not_in?: Maybe<Array<Scalars['String']>>;
  token0_not_starts_with?: Maybe<Scalars['String']>;
  token0_not_starts_with_nocase?: Maybe<Scalars['String']>;
  token0_starts_with?: Maybe<Scalars['String']>;
  token0_starts_with_nocase?: Maybe<Scalars['String']>;
  token1?: Maybe<Scalars['String']>;
  token1Price?: Maybe<Scalars['BigDecimal']>;
  token1Price_gt?: Maybe<Scalars['BigDecimal']>;
  token1Price_gte?: Maybe<Scalars['BigDecimal']>;
  token1Price_in?: Maybe<Array<Scalars['BigDecimal']>>;
  token1Price_lt?: Maybe<Scalars['BigDecimal']>;
  token1Price_lte?: Maybe<Scalars['BigDecimal']>;
  token1Price_not?: Maybe<Scalars['BigDecimal']>;
  token1Price_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  token1_?: Maybe<Token_Filter>;
  token1_contains?: Maybe<Scalars['String']>;
  token1_contains_nocase?: Maybe<Scalars['String']>;
  token1_ends_with?: Maybe<Scalars['String']>;
  token1_ends_with_nocase?: Maybe<Scalars['String']>;
  token1_gt?: Maybe<Scalars['String']>;
  token1_gte?: Maybe<Scalars['String']>;
  token1_in?: Maybe<Array<Scalars['String']>>;
  token1_lt?: Maybe<Scalars['String']>;
  token1_lte?: Maybe<Scalars['String']>;
  token1_not?: Maybe<Scalars['String']>;
  token1_not_contains?: Maybe<Scalars['String']>;
  token1_not_contains_nocase?: Maybe<Scalars['String']>;
  token1_not_ends_with?: Maybe<Scalars['String']>;
  token1_not_ends_with_nocase?: Maybe<Scalars['String']>;
  token1_not_in?: Maybe<Array<Scalars['String']>>;
  token1_not_starts_with?: Maybe<Scalars['String']>;
  token1_not_starts_with_nocase?: Maybe<Scalars['String']>;
  token1_starts_with?: Maybe<Scalars['String']>;
  token1_starts_with_nocase?: Maybe<Scalars['String']>;
  totalValueLockedMatic?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedMatic_gt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedMatic_gte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedMatic_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedMatic_lt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedMatic_lte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedMatic_not?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedMatic_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedToken0?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedToken0_gt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedToken0_gte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedToken0_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedToken0_lt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedToken0_lte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedToken0_not?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedToken0_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedToken1?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedToken1_gt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedToken1_gte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedToken1_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedToken1_lt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedToken1_lte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedToken1_not?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedToken1_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedUSD?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSDUntracked?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSDUntracked_gt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSDUntracked_gte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSDUntracked_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedUSDUntracked_lt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSDUntracked_lte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSDUntracked_not?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSDUntracked_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedUSD_gt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_gte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedUSD_lt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_lte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_not?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  txCount?: Maybe<Scalars['BigInt']>;
  txCount_gt?: Maybe<Scalars['BigInt']>;
  txCount_gte?: Maybe<Scalars['BigInt']>;
  txCount_in?: Maybe<Array<Scalars['BigInt']>>;
  txCount_lt?: Maybe<Scalars['BigInt']>;
  txCount_lte?: Maybe<Scalars['BigInt']>;
  txCount_not?: Maybe<Scalars['BigInt']>;
  txCount_not_in?: Maybe<Array<Scalars['BigInt']>>;
  untrackedFeesUSD?: Maybe<Scalars['BigDecimal']>;
  untrackedFeesUSD_gt?: Maybe<Scalars['BigDecimal']>;
  untrackedFeesUSD_gte?: Maybe<Scalars['BigDecimal']>;
  untrackedFeesUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  untrackedFeesUSD_lt?: Maybe<Scalars['BigDecimal']>;
  untrackedFeesUSD_lte?: Maybe<Scalars['BigDecimal']>;
  untrackedFeesUSD_not?: Maybe<Scalars['BigDecimal']>;
  untrackedFeesUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  untrackedVolumeUSD?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_gt?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_gte?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  untrackedVolumeUSD_lt?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_lte?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_not?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeToken0?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_gt?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_gte?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeToken0_lt?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_lte?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_not?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeToken1?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_gt?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_gte?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeToken1_lt?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_lte?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_not?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeUSD?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_gt?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_gte?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeUSD_lt?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_lte?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_not?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
};

export enum Pool_OrderBy {
  Burns = 'burns',
  CollectedFeesToken0 = 'collectedFeesToken0',
  CollectedFeesToken1 = 'collectedFeesToken1',
  CollectedFeesUsd = 'collectedFeesUSD',
  Collects = 'collects',
  CommunityFee0 = 'communityFee0',
  CommunityFee1 = 'communityFee1',
  CreatedAtBlockNumber = 'createdAtBlockNumber',
  CreatedAtTimestamp = 'createdAtTimestamp',
  Fee = 'fee',
  FeeGrowthGlobal0X128 = 'feeGrowthGlobal0X128',
  FeeGrowthGlobal1X128 = 'feeGrowthGlobal1X128',
  FeesToken0 = 'feesToken0',
  FeesToken1 = 'feesToken1',
  FeesUsd = 'feesUSD',
  Id = 'id',
  Liquidity = 'liquidity',
  LiquidityProviderCount = 'liquidityProviderCount',
  Mints = 'mints',
  ObservationIndex = 'observationIndex',
  PoolDayData = 'poolDayData',
  PoolHourData = 'poolHourData',
  SqrtPrice = 'sqrtPrice',
  Swaps = 'swaps',
  Tick = 'tick',
  Ticks = 'ticks',
  Token0 = 'token0',
  Token0Price = 'token0Price',
  Token1 = 'token1',
  Token1Price = 'token1Price',
  TotalValueLockedMatic = 'totalValueLockedMatic',
  TotalValueLockedToken0 = 'totalValueLockedToken0',
  TotalValueLockedToken1 = 'totalValueLockedToken1',
  TotalValueLockedUsd = 'totalValueLockedUSD',
  TotalValueLockedUsdUntracked = 'totalValueLockedUSDUntracked',
  TxCount = 'txCount',
  UntrackedFeesUsd = 'untrackedFeesUSD',
  UntrackedVolumeUsd = 'untrackedVolumeUSD',
  VolumeToken0 = 'volumeToken0',
  VolumeToken1 = 'volumeToken1',
  VolumeUsd = 'volumeUSD',
}

export type Position = {
  __typename?: 'Position';
  collectedFeesToken0: Scalars['BigDecimal'];
  collectedFeesToken1: Scalars['BigDecimal'];
  collectedToken0: Scalars['BigDecimal'];
  collectedToken1: Scalars['BigDecimal'];
  depositedToken0: Scalars['BigDecimal'];
  depositedToken1: Scalars['BigDecimal'];
  feeGrowthInside0LastX128: Scalars['BigInt'];
  feeGrowthInside1LastX128: Scalars['BigInt'];
  id: Scalars['ID'];
  liquidity: Scalars['BigInt'];
  owner: Scalars['Bytes'];
  pool: Pool;
  tickLower: Tick;
  tickUpper: Tick;
  token0: Token;
  token0Tvl?: Maybe<Scalars['BigDecimal']>;
  token1: Token;
  token1Tvl?: Maybe<Scalars['BigDecimal']>;
  transaction: Transaction;
  withdrawnToken0: Scalars['BigDecimal'];
  withdrawnToken1: Scalars['BigDecimal'];
};

export type PositionSnapshot = {
  __typename?: 'PositionSnapshot';
  blockNumber: Scalars['BigInt'];
  collectedFeesToken0: Scalars['BigDecimal'];
  collectedFeesToken1: Scalars['BigDecimal'];
  depositedToken0: Scalars['BigDecimal'];
  depositedToken1: Scalars['BigDecimal'];
  feeGrowthInside0LastX128: Scalars['BigInt'];
  feeGrowthInside1LastX128: Scalars['BigInt'];
  id: Scalars['ID'];
  liquidity: Scalars['BigInt'];
  owner: Scalars['Bytes'];
  pool: Pool;
  position: Position;
  timestamp: Scalars['BigInt'];
  transaction: Transaction;
  withdrawnToken0: Scalars['BigDecimal'];
  withdrawnToken1: Scalars['BigDecimal'];
};

export type PositionSnapshot_Filter = {
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  blockNumber?: Maybe<Scalars['BigInt']>;
  blockNumber_gt?: Maybe<Scalars['BigInt']>;
  blockNumber_gte?: Maybe<Scalars['BigInt']>;
  blockNumber_in?: Maybe<Array<Scalars['BigInt']>>;
  blockNumber_lt?: Maybe<Scalars['BigInt']>;
  blockNumber_lte?: Maybe<Scalars['BigInt']>;
  blockNumber_not?: Maybe<Scalars['BigInt']>;
  blockNumber_not_in?: Maybe<Array<Scalars['BigInt']>>;
  collectedFeesToken0?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken0_gt?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken0_gte?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken0_in?: Maybe<Array<Scalars['BigDecimal']>>;
  collectedFeesToken0_lt?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken0_lte?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken0_not?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken0_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  collectedFeesToken1?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken1_gt?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken1_gte?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken1_in?: Maybe<Array<Scalars['BigDecimal']>>;
  collectedFeesToken1_lt?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken1_lte?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken1_not?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken1_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  depositedToken0?: Maybe<Scalars['BigDecimal']>;
  depositedToken0_gt?: Maybe<Scalars['BigDecimal']>;
  depositedToken0_gte?: Maybe<Scalars['BigDecimal']>;
  depositedToken0_in?: Maybe<Array<Scalars['BigDecimal']>>;
  depositedToken0_lt?: Maybe<Scalars['BigDecimal']>;
  depositedToken0_lte?: Maybe<Scalars['BigDecimal']>;
  depositedToken0_not?: Maybe<Scalars['BigDecimal']>;
  depositedToken0_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  depositedToken1?: Maybe<Scalars['BigDecimal']>;
  depositedToken1_gt?: Maybe<Scalars['BigDecimal']>;
  depositedToken1_gte?: Maybe<Scalars['BigDecimal']>;
  depositedToken1_in?: Maybe<Array<Scalars['BigDecimal']>>;
  depositedToken1_lt?: Maybe<Scalars['BigDecimal']>;
  depositedToken1_lte?: Maybe<Scalars['BigDecimal']>;
  depositedToken1_not?: Maybe<Scalars['BigDecimal']>;
  depositedToken1_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  feeGrowthInside0LastX128?: Maybe<Scalars['BigInt']>;
  feeGrowthInside0LastX128_gt?: Maybe<Scalars['BigInt']>;
  feeGrowthInside0LastX128_gte?: Maybe<Scalars['BigInt']>;
  feeGrowthInside0LastX128_in?: Maybe<Array<Scalars['BigInt']>>;
  feeGrowthInside0LastX128_lt?: Maybe<Scalars['BigInt']>;
  feeGrowthInside0LastX128_lte?: Maybe<Scalars['BigInt']>;
  feeGrowthInside0LastX128_not?: Maybe<Scalars['BigInt']>;
  feeGrowthInside0LastX128_not_in?: Maybe<Array<Scalars['BigInt']>>;
  feeGrowthInside1LastX128?: Maybe<Scalars['BigInt']>;
  feeGrowthInside1LastX128_gt?: Maybe<Scalars['BigInt']>;
  feeGrowthInside1LastX128_gte?: Maybe<Scalars['BigInt']>;
  feeGrowthInside1LastX128_in?: Maybe<Array<Scalars['BigInt']>>;
  feeGrowthInside1LastX128_lt?: Maybe<Scalars['BigInt']>;
  feeGrowthInside1LastX128_lte?: Maybe<Scalars['BigInt']>;
  feeGrowthInside1LastX128_not?: Maybe<Scalars['BigInt']>;
  feeGrowthInside1LastX128_not_in?: Maybe<Array<Scalars['BigInt']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  liquidity?: Maybe<Scalars['BigInt']>;
  liquidity_gt?: Maybe<Scalars['BigInt']>;
  liquidity_gte?: Maybe<Scalars['BigInt']>;
  liquidity_in?: Maybe<Array<Scalars['BigInt']>>;
  liquidity_lt?: Maybe<Scalars['BigInt']>;
  liquidity_lte?: Maybe<Scalars['BigInt']>;
  liquidity_not?: Maybe<Scalars['BigInt']>;
  liquidity_not_in?: Maybe<Array<Scalars['BigInt']>>;
  owner?: Maybe<Scalars['Bytes']>;
  owner_contains?: Maybe<Scalars['Bytes']>;
  owner_in?: Maybe<Array<Scalars['Bytes']>>;
  owner_not?: Maybe<Scalars['Bytes']>;
  owner_not_contains?: Maybe<Scalars['Bytes']>;
  owner_not_in?: Maybe<Array<Scalars['Bytes']>>;
  pool?: Maybe<Scalars['String']>;
  pool_?: Maybe<Pool_Filter>;
  pool_contains?: Maybe<Scalars['String']>;
  pool_contains_nocase?: Maybe<Scalars['String']>;
  pool_ends_with?: Maybe<Scalars['String']>;
  pool_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_gt?: Maybe<Scalars['String']>;
  pool_gte?: Maybe<Scalars['String']>;
  pool_in?: Maybe<Array<Scalars['String']>>;
  pool_lt?: Maybe<Scalars['String']>;
  pool_lte?: Maybe<Scalars['String']>;
  pool_not?: Maybe<Scalars['String']>;
  pool_not_contains?: Maybe<Scalars['String']>;
  pool_not_contains_nocase?: Maybe<Scalars['String']>;
  pool_not_ends_with?: Maybe<Scalars['String']>;
  pool_not_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_not_in?: Maybe<Array<Scalars['String']>>;
  pool_not_starts_with?: Maybe<Scalars['String']>;
  pool_not_starts_with_nocase?: Maybe<Scalars['String']>;
  pool_starts_with?: Maybe<Scalars['String']>;
  pool_starts_with_nocase?: Maybe<Scalars['String']>;
  position?: Maybe<Scalars['String']>;
  position_?: Maybe<Position_Filter>;
  position_contains?: Maybe<Scalars['String']>;
  position_contains_nocase?: Maybe<Scalars['String']>;
  position_ends_with?: Maybe<Scalars['String']>;
  position_ends_with_nocase?: Maybe<Scalars['String']>;
  position_gt?: Maybe<Scalars['String']>;
  position_gte?: Maybe<Scalars['String']>;
  position_in?: Maybe<Array<Scalars['String']>>;
  position_lt?: Maybe<Scalars['String']>;
  position_lte?: Maybe<Scalars['String']>;
  position_not?: Maybe<Scalars['String']>;
  position_not_contains?: Maybe<Scalars['String']>;
  position_not_contains_nocase?: Maybe<Scalars['String']>;
  position_not_ends_with?: Maybe<Scalars['String']>;
  position_not_ends_with_nocase?: Maybe<Scalars['String']>;
  position_not_in?: Maybe<Array<Scalars['String']>>;
  position_not_starts_with?: Maybe<Scalars['String']>;
  position_not_starts_with_nocase?: Maybe<Scalars['String']>;
  position_starts_with?: Maybe<Scalars['String']>;
  position_starts_with_nocase?: Maybe<Scalars['String']>;
  timestamp?: Maybe<Scalars['BigInt']>;
  timestamp_gt?: Maybe<Scalars['BigInt']>;
  timestamp_gte?: Maybe<Scalars['BigInt']>;
  timestamp_in?: Maybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: Maybe<Scalars['BigInt']>;
  timestamp_lte?: Maybe<Scalars['BigInt']>;
  timestamp_not?: Maybe<Scalars['BigInt']>;
  timestamp_not_in?: Maybe<Array<Scalars['BigInt']>>;
  transaction?: Maybe<Scalars['String']>;
  transaction_?: Maybe<Transaction_Filter>;
  transaction_contains?: Maybe<Scalars['String']>;
  transaction_contains_nocase?: Maybe<Scalars['String']>;
  transaction_ends_with?: Maybe<Scalars['String']>;
  transaction_ends_with_nocase?: Maybe<Scalars['String']>;
  transaction_gt?: Maybe<Scalars['String']>;
  transaction_gte?: Maybe<Scalars['String']>;
  transaction_in?: Maybe<Array<Scalars['String']>>;
  transaction_lt?: Maybe<Scalars['String']>;
  transaction_lte?: Maybe<Scalars['String']>;
  transaction_not?: Maybe<Scalars['String']>;
  transaction_not_contains?: Maybe<Scalars['String']>;
  transaction_not_contains_nocase?: Maybe<Scalars['String']>;
  transaction_not_ends_with?: Maybe<Scalars['String']>;
  transaction_not_ends_with_nocase?: Maybe<Scalars['String']>;
  transaction_not_in?: Maybe<Array<Scalars['String']>>;
  transaction_not_starts_with?: Maybe<Scalars['String']>;
  transaction_not_starts_with_nocase?: Maybe<Scalars['String']>;
  transaction_starts_with?: Maybe<Scalars['String']>;
  transaction_starts_with_nocase?: Maybe<Scalars['String']>;
  withdrawnToken0?: Maybe<Scalars['BigDecimal']>;
  withdrawnToken0_gt?: Maybe<Scalars['BigDecimal']>;
  withdrawnToken0_gte?: Maybe<Scalars['BigDecimal']>;
  withdrawnToken0_in?: Maybe<Array<Scalars['BigDecimal']>>;
  withdrawnToken0_lt?: Maybe<Scalars['BigDecimal']>;
  withdrawnToken0_lte?: Maybe<Scalars['BigDecimal']>;
  withdrawnToken0_not?: Maybe<Scalars['BigDecimal']>;
  withdrawnToken0_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  withdrawnToken1?: Maybe<Scalars['BigDecimal']>;
  withdrawnToken1_gt?: Maybe<Scalars['BigDecimal']>;
  withdrawnToken1_gte?: Maybe<Scalars['BigDecimal']>;
  withdrawnToken1_in?: Maybe<Array<Scalars['BigDecimal']>>;
  withdrawnToken1_lt?: Maybe<Scalars['BigDecimal']>;
  withdrawnToken1_lte?: Maybe<Scalars['BigDecimal']>;
  withdrawnToken1_not?: Maybe<Scalars['BigDecimal']>;
  withdrawnToken1_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
};

export enum PositionSnapshot_OrderBy {
  BlockNumber = 'blockNumber',
  CollectedFeesToken0 = 'collectedFeesToken0',
  CollectedFeesToken1 = 'collectedFeesToken1',
  DepositedToken0 = 'depositedToken0',
  DepositedToken1 = 'depositedToken1',
  FeeGrowthInside0LastX128 = 'feeGrowthInside0LastX128',
  FeeGrowthInside1LastX128 = 'feeGrowthInside1LastX128',
  Id = 'id',
  Liquidity = 'liquidity',
  Owner = 'owner',
  Pool = 'pool',
  Position = 'position',
  Timestamp = 'timestamp',
  Transaction = 'transaction',
  WithdrawnToken0 = 'withdrawnToken0',
  WithdrawnToken1 = 'withdrawnToken1',
}

export type Position_Filter = {
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  collectedFeesToken0?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken0_gt?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken0_gte?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken0_in?: Maybe<Array<Scalars['BigDecimal']>>;
  collectedFeesToken0_lt?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken0_lte?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken0_not?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken0_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  collectedFeesToken1?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken1_gt?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken1_gte?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken1_in?: Maybe<Array<Scalars['BigDecimal']>>;
  collectedFeesToken1_lt?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken1_lte?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken1_not?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken1_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  collectedToken0?: Maybe<Scalars['BigDecimal']>;
  collectedToken0_gt?: Maybe<Scalars['BigDecimal']>;
  collectedToken0_gte?: Maybe<Scalars['BigDecimal']>;
  collectedToken0_in?: Maybe<Array<Scalars['BigDecimal']>>;
  collectedToken0_lt?: Maybe<Scalars['BigDecimal']>;
  collectedToken0_lte?: Maybe<Scalars['BigDecimal']>;
  collectedToken0_not?: Maybe<Scalars['BigDecimal']>;
  collectedToken0_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  collectedToken1?: Maybe<Scalars['BigDecimal']>;
  collectedToken1_gt?: Maybe<Scalars['BigDecimal']>;
  collectedToken1_gte?: Maybe<Scalars['BigDecimal']>;
  collectedToken1_in?: Maybe<Array<Scalars['BigDecimal']>>;
  collectedToken1_lt?: Maybe<Scalars['BigDecimal']>;
  collectedToken1_lte?: Maybe<Scalars['BigDecimal']>;
  collectedToken1_not?: Maybe<Scalars['BigDecimal']>;
  collectedToken1_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  depositedToken0?: Maybe<Scalars['BigDecimal']>;
  depositedToken0_gt?: Maybe<Scalars['BigDecimal']>;
  depositedToken0_gte?: Maybe<Scalars['BigDecimal']>;
  depositedToken0_in?: Maybe<Array<Scalars['BigDecimal']>>;
  depositedToken0_lt?: Maybe<Scalars['BigDecimal']>;
  depositedToken0_lte?: Maybe<Scalars['BigDecimal']>;
  depositedToken0_not?: Maybe<Scalars['BigDecimal']>;
  depositedToken0_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  depositedToken1?: Maybe<Scalars['BigDecimal']>;
  depositedToken1_gt?: Maybe<Scalars['BigDecimal']>;
  depositedToken1_gte?: Maybe<Scalars['BigDecimal']>;
  depositedToken1_in?: Maybe<Array<Scalars['BigDecimal']>>;
  depositedToken1_lt?: Maybe<Scalars['BigDecimal']>;
  depositedToken1_lte?: Maybe<Scalars['BigDecimal']>;
  depositedToken1_not?: Maybe<Scalars['BigDecimal']>;
  depositedToken1_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  feeGrowthInside0LastX128?: Maybe<Scalars['BigInt']>;
  feeGrowthInside0LastX128_gt?: Maybe<Scalars['BigInt']>;
  feeGrowthInside0LastX128_gte?: Maybe<Scalars['BigInt']>;
  feeGrowthInside0LastX128_in?: Maybe<Array<Scalars['BigInt']>>;
  feeGrowthInside0LastX128_lt?: Maybe<Scalars['BigInt']>;
  feeGrowthInside0LastX128_lte?: Maybe<Scalars['BigInt']>;
  feeGrowthInside0LastX128_not?: Maybe<Scalars['BigInt']>;
  feeGrowthInside0LastX128_not_in?: Maybe<Array<Scalars['BigInt']>>;
  feeGrowthInside1LastX128?: Maybe<Scalars['BigInt']>;
  feeGrowthInside1LastX128_gt?: Maybe<Scalars['BigInt']>;
  feeGrowthInside1LastX128_gte?: Maybe<Scalars['BigInt']>;
  feeGrowthInside1LastX128_in?: Maybe<Array<Scalars['BigInt']>>;
  feeGrowthInside1LastX128_lt?: Maybe<Scalars['BigInt']>;
  feeGrowthInside1LastX128_lte?: Maybe<Scalars['BigInt']>;
  feeGrowthInside1LastX128_not?: Maybe<Scalars['BigInt']>;
  feeGrowthInside1LastX128_not_in?: Maybe<Array<Scalars['BigInt']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  liquidity?: Maybe<Scalars['BigInt']>;
  liquidity_gt?: Maybe<Scalars['BigInt']>;
  liquidity_gte?: Maybe<Scalars['BigInt']>;
  liquidity_in?: Maybe<Array<Scalars['BigInt']>>;
  liquidity_lt?: Maybe<Scalars['BigInt']>;
  liquidity_lte?: Maybe<Scalars['BigInt']>;
  liquidity_not?: Maybe<Scalars['BigInt']>;
  liquidity_not_in?: Maybe<Array<Scalars['BigInt']>>;
  owner?: Maybe<Scalars['Bytes']>;
  owner_contains?: Maybe<Scalars['Bytes']>;
  owner_in?: Maybe<Array<Scalars['Bytes']>>;
  owner_not?: Maybe<Scalars['Bytes']>;
  owner_not_contains?: Maybe<Scalars['Bytes']>;
  owner_not_in?: Maybe<Array<Scalars['Bytes']>>;
  pool?: Maybe<Scalars['String']>;
  pool_?: Maybe<Pool_Filter>;
  pool_contains?: Maybe<Scalars['String']>;
  pool_contains_nocase?: Maybe<Scalars['String']>;
  pool_ends_with?: Maybe<Scalars['String']>;
  pool_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_gt?: Maybe<Scalars['String']>;
  pool_gte?: Maybe<Scalars['String']>;
  pool_in?: Maybe<Array<Scalars['String']>>;
  pool_lt?: Maybe<Scalars['String']>;
  pool_lte?: Maybe<Scalars['String']>;
  pool_not?: Maybe<Scalars['String']>;
  pool_not_contains?: Maybe<Scalars['String']>;
  pool_not_contains_nocase?: Maybe<Scalars['String']>;
  pool_not_ends_with?: Maybe<Scalars['String']>;
  pool_not_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_not_in?: Maybe<Array<Scalars['String']>>;
  pool_not_starts_with?: Maybe<Scalars['String']>;
  pool_not_starts_with_nocase?: Maybe<Scalars['String']>;
  pool_starts_with?: Maybe<Scalars['String']>;
  pool_starts_with_nocase?: Maybe<Scalars['String']>;
  tickLower?: Maybe<Scalars['String']>;
  tickLower_?: Maybe<Tick_Filter>;
  tickLower_contains?: Maybe<Scalars['String']>;
  tickLower_contains_nocase?: Maybe<Scalars['String']>;
  tickLower_ends_with?: Maybe<Scalars['String']>;
  tickLower_ends_with_nocase?: Maybe<Scalars['String']>;
  tickLower_gt?: Maybe<Scalars['String']>;
  tickLower_gte?: Maybe<Scalars['String']>;
  tickLower_in?: Maybe<Array<Scalars['String']>>;
  tickLower_lt?: Maybe<Scalars['String']>;
  tickLower_lte?: Maybe<Scalars['String']>;
  tickLower_not?: Maybe<Scalars['String']>;
  tickLower_not_contains?: Maybe<Scalars['String']>;
  tickLower_not_contains_nocase?: Maybe<Scalars['String']>;
  tickLower_not_ends_with?: Maybe<Scalars['String']>;
  tickLower_not_ends_with_nocase?: Maybe<Scalars['String']>;
  tickLower_not_in?: Maybe<Array<Scalars['String']>>;
  tickLower_not_starts_with?: Maybe<Scalars['String']>;
  tickLower_not_starts_with_nocase?: Maybe<Scalars['String']>;
  tickLower_starts_with?: Maybe<Scalars['String']>;
  tickLower_starts_with_nocase?: Maybe<Scalars['String']>;
  tickUpper?: Maybe<Scalars['String']>;
  tickUpper_?: Maybe<Tick_Filter>;
  tickUpper_contains?: Maybe<Scalars['String']>;
  tickUpper_contains_nocase?: Maybe<Scalars['String']>;
  tickUpper_ends_with?: Maybe<Scalars['String']>;
  tickUpper_ends_with_nocase?: Maybe<Scalars['String']>;
  tickUpper_gt?: Maybe<Scalars['String']>;
  tickUpper_gte?: Maybe<Scalars['String']>;
  tickUpper_in?: Maybe<Array<Scalars['String']>>;
  tickUpper_lt?: Maybe<Scalars['String']>;
  tickUpper_lte?: Maybe<Scalars['String']>;
  tickUpper_not?: Maybe<Scalars['String']>;
  tickUpper_not_contains?: Maybe<Scalars['String']>;
  tickUpper_not_contains_nocase?: Maybe<Scalars['String']>;
  tickUpper_not_ends_with?: Maybe<Scalars['String']>;
  tickUpper_not_ends_with_nocase?: Maybe<Scalars['String']>;
  tickUpper_not_in?: Maybe<Array<Scalars['String']>>;
  tickUpper_not_starts_with?: Maybe<Scalars['String']>;
  tickUpper_not_starts_with_nocase?: Maybe<Scalars['String']>;
  tickUpper_starts_with?: Maybe<Scalars['String']>;
  tickUpper_starts_with_nocase?: Maybe<Scalars['String']>;
  token0?: Maybe<Scalars['String']>;
  token0Tvl?: Maybe<Scalars['BigDecimal']>;
  token0Tvl_gt?: Maybe<Scalars['BigDecimal']>;
  token0Tvl_gte?: Maybe<Scalars['BigDecimal']>;
  token0Tvl_in?: Maybe<Array<Scalars['BigDecimal']>>;
  token0Tvl_lt?: Maybe<Scalars['BigDecimal']>;
  token0Tvl_lte?: Maybe<Scalars['BigDecimal']>;
  token0Tvl_not?: Maybe<Scalars['BigDecimal']>;
  token0Tvl_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  token0_?: Maybe<Token_Filter>;
  token0_contains?: Maybe<Scalars['String']>;
  token0_contains_nocase?: Maybe<Scalars['String']>;
  token0_ends_with?: Maybe<Scalars['String']>;
  token0_ends_with_nocase?: Maybe<Scalars['String']>;
  token0_gt?: Maybe<Scalars['String']>;
  token0_gte?: Maybe<Scalars['String']>;
  token0_in?: Maybe<Array<Scalars['String']>>;
  token0_lt?: Maybe<Scalars['String']>;
  token0_lte?: Maybe<Scalars['String']>;
  token0_not?: Maybe<Scalars['String']>;
  token0_not_contains?: Maybe<Scalars['String']>;
  token0_not_contains_nocase?: Maybe<Scalars['String']>;
  token0_not_ends_with?: Maybe<Scalars['String']>;
  token0_not_ends_with_nocase?: Maybe<Scalars['String']>;
  token0_not_in?: Maybe<Array<Scalars['String']>>;
  token0_not_starts_with?: Maybe<Scalars['String']>;
  token0_not_starts_with_nocase?: Maybe<Scalars['String']>;
  token0_starts_with?: Maybe<Scalars['String']>;
  token0_starts_with_nocase?: Maybe<Scalars['String']>;
  token1?: Maybe<Scalars['String']>;
  token1Tvl?: Maybe<Scalars['BigDecimal']>;
  token1Tvl_gt?: Maybe<Scalars['BigDecimal']>;
  token1Tvl_gte?: Maybe<Scalars['BigDecimal']>;
  token1Tvl_in?: Maybe<Array<Scalars['BigDecimal']>>;
  token1Tvl_lt?: Maybe<Scalars['BigDecimal']>;
  token1Tvl_lte?: Maybe<Scalars['BigDecimal']>;
  token1Tvl_not?: Maybe<Scalars['BigDecimal']>;
  token1Tvl_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  token1_?: Maybe<Token_Filter>;
  token1_contains?: Maybe<Scalars['String']>;
  token1_contains_nocase?: Maybe<Scalars['String']>;
  token1_ends_with?: Maybe<Scalars['String']>;
  token1_ends_with_nocase?: Maybe<Scalars['String']>;
  token1_gt?: Maybe<Scalars['String']>;
  token1_gte?: Maybe<Scalars['String']>;
  token1_in?: Maybe<Array<Scalars['String']>>;
  token1_lt?: Maybe<Scalars['String']>;
  token1_lte?: Maybe<Scalars['String']>;
  token1_not?: Maybe<Scalars['String']>;
  token1_not_contains?: Maybe<Scalars['String']>;
  token1_not_contains_nocase?: Maybe<Scalars['String']>;
  token1_not_ends_with?: Maybe<Scalars['String']>;
  token1_not_ends_with_nocase?: Maybe<Scalars['String']>;
  token1_not_in?: Maybe<Array<Scalars['String']>>;
  token1_not_starts_with?: Maybe<Scalars['String']>;
  token1_not_starts_with_nocase?: Maybe<Scalars['String']>;
  token1_starts_with?: Maybe<Scalars['String']>;
  token1_starts_with_nocase?: Maybe<Scalars['String']>;
  transaction?: Maybe<Scalars['String']>;
  transaction_?: Maybe<Transaction_Filter>;
  transaction_contains?: Maybe<Scalars['String']>;
  transaction_contains_nocase?: Maybe<Scalars['String']>;
  transaction_ends_with?: Maybe<Scalars['String']>;
  transaction_ends_with_nocase?: Maybe<Scalars['String']>;
  transaction_gt?: Maybe<Scalars['String']>;
  transaction_gte?: Maybe<Scalars['String']>;
  transaction_in?: Maybe<Array<Scalars['String']>>;
  transaction_lt?: Maybe<Scalars['String']>;
  transaction_lte?: Maybe<Scalars['String']>;
  transaction_not?: Maybe<Scalars['String']>;
  transaction_not_contains?: Maybe<Scalars['String']>;
  transaction_not_contains_nocase?: Maybe<Scalars['String']>;
  transaction_not_ends_with?: Maybe<Scalars['String']>;
  transaction_not_ends_with_nocase?: Maybe<Scalars['String']>;
  transaction_not_in?: Maybe<Array<Scalars['String']>>;
  transaction_not_starts_with?: Maybe<Scalars['String']>;
  transaction_not_starts_with_nocase?: Maybe<Scalars['String']>;
  transaction_starts_with?: Maybe<Scalars['String']>;
  transaction_starts_with_nocase?: Maybe<Scalars['String']>;
  withdrawnToken0?: Maybe<Scalars['BigDecimal']>;
  withdrawnToken0_gt?: Maybe<Scalars['BigDecimal']>;
  withdrawnToken0_gte?: Maybe<Scalars['BigDecimal']>;
  withdrawnToken0_in?: Maybe<Array<Scalars['BigDecimal']>>;
  withdrawnToken0_lt?: Maybe<Scalars['BigDecimal']>;
  withdrawnToken0_lte?: Maybe<Scalars['BigDecimal']>;
  withdrawnToken0_not?: Maybe<Scalars['BigDecimal']>;
  withdrawnToken0_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  withdrawnToken1?: Maybe<Scalars['BigDecimal']>;
  withdrawnToken1_gt?: Maybe<Scalars['BigDecimal']>;
  withdrawnToken1_gte?: Maybe<Scalars['BigDecimal']>;
  withdrawnToken1_in?: Maybe<Array<Scalars['BigDecimal']>>;
  withdrawnToken1_lt?: Maybe<Scalars['BigDecimal']>;
  withdrawnToken1_lte?: Maybe<Scalars['BigDecimal']>;
  withdrawnToken1_not?: Maybe<Scalars['BigDecimal']>;
  withdrawnToken1_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
};

export enum Position_OrderBy {
  CollectedFeesToken0 = 'collectedFeesToken0',
  CollectedFeesToken1 = 'collectedFeesToken1',
  CollectedToken0 = 'collectedToken0',
  CollectedToken1 = 'collectedToken1',
  DepositedToken0 = 'depositedToken0',
  DepositedToken1 = 'depositedToken1',
  FeeGrowthInside0LastX128 = 'feeGrowthInside0LastX128',
  FeeGrowthInside1LastX128 = 'feeGrowthInside1LastX128',
  Id = 'id',
  Liquidity = 'liquidity',
  Owner = 'owner',
  Pool = 'pool',
  TickLower = 'tickLower',
  TickUpper = 'tickUpper',
  Token0 = 'token0',
  Token0Tvl = 'token0Tvl',
  Token1 = 'token1',
  Token1Tvl = 'token1Tvl',
  Transaction = 'transaction',
  WithdrawnToken0 = 'withdrawnToken0',
  WithdrawnToken1 = 'withdrawnToken1',
}

export type Query = {
  __typename?: 'Query';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  algebraDayData?: Maybe<AlgebraDayData>;
  algebraDayDatas: Array<AlgebraDayData>;
  block?: Maybe<Block>;
  blocks: Array<Block>;
  bundle?: Maybe<Bundle>;
  bundles: Array<Bundle>;
  burn?: Maybe<Burn>;
  burns: Array<Burn>;
  collect?: Maybe<Collect>;
  collects: Array<Collect>;
  deposit?: Maybe<Deposit>;
  deposits: Array<Deposit>;
  eternalFarming?: Maybe<EternalFarming>;
  eternalFarmings: Array<EternalFarming>;
  factories: Array<Factory>;
  factory?: Maybe<Factory>;
  feeHourData?: Maybe<FeeHourData>;
  feeHourDatas: Array<FeeHourData>;
  flash?: Maybe<Flash>;
  flashes: Array<Flash>;
  histories: Array<History>;
  history?: Maybe<History>;
  limitFarming?: Maybe<LimitFarming>;
  limitFarmings: Array<LimitFarming>;
  mint?: Maybe<Mint>;
  mints: Array<Mint>;
  pool?: Maybe<Pool>;
  poolDayData?: Maybe<PoolDayData>;
  poolDayDatas: Array<PoolDayData>;
  poolFeeData?: Maybe<PoolFeeData>;
  poolFeeDatas: Array<PoolFeeData>;
  poolHourData?: Maybe<PoolHourData>;
  poolHourDatas: Array<PoolHourData>;
  pools: Array<Pool>;
  position?: Maybe<Position>;
  positionSnapshot?: Maybe<PositionSnapshot>;
  positionSnapshots: Array<PositionSnapshot>;
  positions: Array<Position>;
  reward?: Maybe<Reward>;
  rewards: Array<Reward>;
  stake?: Maybe<Stake>;
  stakeTx?: Maybe<StakeTx>;
  stakeTxes: Array<StakeTx>;
  stakes: Array<Stake>;
  swap?: Maybe<Swap>;
  swaps: Array<Swap>;
  tick?: Maybe<Tick>;
  tickDayData?: Maybe<TickDayData>;
  tickDayDatas: Array<TickDayData>;
  tickHourData?: Maybe<TickHourData>;
  tickHourDatas: Array<TickHourData>;
  ticks: Array<Tick>;
  token?: Maybe<Token>;
  tokenDayData?: Maybe<TokenDayData>;
  tokenDayDatas: Array<TokenDayData>;
  tokenHourData?: Maybe<TokenHourData>;
  tokenHourDatas: Array<TokenHourData>;
  tokens: Array<Token>;
  transaction?: Maybe<Transaction>;
  transactions: Array<Transaction>;
};

export type Query_MetaArgs = {
  block?: Maybe<Block_Height>;
};

export type QueryAlgebraDayDataArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryAlgebraDayDatasArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<AlgebraDayData_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<AlgebraDayData_Filter>;
};

export type QueryBlockArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryBlocksArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Block_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Block_Filter>;
};

export type QueryBundleArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryBundlesArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Bundle_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Bundle_Filter>;
};

export type QueryBurnArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryBurnsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Burn_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Burn_Filter>;
};

export type QueryCollectArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryCollectsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Collect_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Collect_Filter>;
};

export type QueryDepositArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryDepositsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Deposit_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Deposit_Filter>;
};

export type QueryEternalFarmingArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryEternalFarmingsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<EternalFarming_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<EternalFarming_Filter>;
};

export type QueryFactoriesArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Factory_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Factory_Filter>;
};

export type QueryFactoryArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryFeeHourDataArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryFeeHourDatasArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<FeeHourData_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<FeeHourData_Filter>;
};

export type QueryFlashArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryFlashesArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Flash_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Flash_Filter>;
};

export type QueryHistoriesArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<History_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<History_Filter>;
};

export type QueryHistoryArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryLimitFarmingArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryLimitFarmingsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<LimitFarming_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<LimitFarming_Filter>;
};

export type QueryMintArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryMintsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Mint_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Mint_Filter>;
};

export type QueryPoolArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryPoolDayDataArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryPoolDayDatasArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<PoolDayData_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<PoolDayData_Filter>;
};

export type QueryPoolFeeDataArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryPoolFeeDatasArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<PoolFeeData_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<PoolFeeData_Filter>;
};

export type QueryPoolHourDataArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryPoolHourDatasArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<PoolHourData_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<PoolHourData_Filter>;
};

export type QueryPoolsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Pool_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Pool_Filter>;
};

export type QueryPositionArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryPositionSnapshotArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryPositionSnapshotsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<PositionSnapshot_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<PositionSnapshot_Filter>;
};

export type QueryPositionsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Position_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Position_Filter>;
};

export type QueryRewardArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryRewardsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Reward_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Reward_Filter>;
};

export type QueryStakeArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryStakeTxArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryStakeTxesArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<StakeTx_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<StakeTx_Filter>;
};

export type QueryStakesArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Stake_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Stake_Filter>;
};

export type QuerySwapArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QuerySwapsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Swap_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Swap_Filter>;
};

export type QueryTickArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryTickDayDataArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryTickDayDatasArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<TickDayData_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<TickDayData_Filter>;
};

export type QueryTickHourDataArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryTickHourDatasArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<TickHourData_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<TickHourData_Filter>;
};

export type QueryTicksArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Tick_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Tick_Filter>;
};

export type QueryTokenArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryTokenDayDataArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryTokenDayDatasArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<TokenDayData_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<TokenDayData_Filter>;
};

export type QueryTokenHourDataArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryTokenHourDatasArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<TokenHourData_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<TokenHourData_Filter>;
};

export type QueryTokensArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Token_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Token_Filter>;
};

export type QueryTransactionArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryTransactionsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Transaction_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Transaction_Filter>;
};

export type Reward = {
  __typename?: 'Reward';
  amount: Scalars['BigInt'];
  id: Scalars['ID'];
  owner: Scalars['Bytes'];
  rewardAddress: Scalars['Bytes'];
};

export type Reward_Filter = {
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  amount?: Maybe<Scalars['BigInt']>;
  amount_gt?: Maybe<Scalars['BigInt']>;
  amount_gte?: Maybe<Scalars['BigInt']>;
  amount_in?: Maybe<Array<Scalars['BigInt']>>;
  amount_lt?: Maybe<Scalars['BigInt']>;
  amount_lte?: Maybe<Scalars['BigInt']>;
  amount_not?: Maybe<Scalars['BigInt']>;
  amount_not_in?: Maybe<Array<Scalars['BigInt']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  owner?: Maybe<Scalars['Bytes']>;
  owner_contains?: Maybe<Scalars['Bytes']>;
  owner_in?: Maybe<Array<Scalars['Bytes']>>;
  owner_not?: Maybe<Scalars['Bytes']>;
  owner_not_contains?: Maybe<Scalars['Bytes']>;
  owner_not_in?: Maybe<Array<Scalars['Bytes']>>;
  rewardAddress?: Maybe<Scalars['Bytes']>;
  rewardAddress_contains?: Maybe<Scalars['Bytes']>;
  rewardAddress_in?: Maybe<Array<Scalars['Bytes']>>;
  rewardAddress_not?: Maybe<Scalars['Bytes']>;
  rewardAddress_not_contains?: Maybe<Scalars['Bytes']>;
  rewardAddress_not_in?: Maybe<Array<Scalars['Bytes']>>;
};

export enum Reward_OrderBy {
  Amount = 'amount',
  Id = 'id',
  Owner = 'owner',
  RewardAddress = 'rewardAddress',
}

export type Stake = {
  __typename?: 'Stake';
  id: Scalars['ID'];
  stakedALGBAmount: Scalars['BigInt'];
  xALGBAmount: Scalars['BigInt'];
};

export type StakeTx = {
  __typename?: 'StakeTx';
  id: Scalars['ID'];
  owner?: Maybe<Scalars['String']>;
  stakedALGBAmount: Scalars['BigInt'];
  timestamp: Scalars['Int'];
  xALGBAmount: Scalars['BigInt'];
};

export type StakeTx_Filter = {
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  owner?: Maybe<Scalars['String']>;
  owner_contains?: Maybe<Scalars['String']>;
  owner_contains_nocase?: Maybe<Scalars['String']>;
  owner_ends_with?: Maybe<Scalars['String']>;
  owner_ends_with_nocase?: Maybe<Scalars['String']>;
  owner_gt?: Maybe<Scalars['String']>;
  owner_gte?: Maybe<Scalars['String']>;
  owner_in?: Maybe<Array<Scalars['String']>>;
  owner_lt?: Maybe<Scalars['String']>;
  owner_lte?: Maybe<Scalars['String']>;
  owner_not?: Maybe<Scalars['String']>;
  owner_not_contains?: Maybe<Scalars['String']>;
  owner_not_contains_nocase?: Maybe<Scalars['String']>;
  owner_not_ends_with?: Maybe<Scalars['String']>;
  owner_not_ends_with_nocase?: Maybe<Scalars['String']>;
  owner_not_in?: Maybe<Array<Scalars['String']>>;
  owner_not_starts_with?: Maybe<Scalars['String']>;
  owner_not_starts_with_nocase?: Maybe<Scalars['String']>;
  owner_starts_with?: Maybe<Scalars['String']>;
  owner_starts_with_nocase?: Maybe<Scalars['String']>;
  stakedALGBAmount?: Maybe<Scalars['BigInt']>;
  stakedALGBAmount_gt?: Maybe<Scalars['BigInt']>;
  stakedALGBAmount_gte?: Maybe<Scalars['BigInt']>;
  stakedALGBAmount_in?: Maybe<Array<Scalars['BigInt']>>;
  stakedALGBAmount_lt?: Maybe<Scalars['BigInt']>;
  stakedALGBAmount_lte?: Maybe<Scalars['BigInt']>;
  stakedALGBAmount_not?: Maybe<Scalars['BigInt']>;
  stakedALGBAmount_not_in?: Maybe<Array<Scalars['BigInt']>>;
  timestamp?: Maybe<Scalars['Int']>;
  timestamp_gt?: Maybe<Scalars['Int']>;
  timestamp_gte?: Maybe<Scalars['Int']>;
  timestamp_in?: Maybe<Array<Scalars['Int']>>;
  timestamp_lt?: Maybe<Scalars['Int']>;
  timestamp_lte?: Maybe<Scalars['Int']>;
  timestamp_not?: Maybe<Scalars['Int']>;
  timestamp_not_in?: Maybe<Array<Scalars['Int']>>;
  xALGBAmount?: Maybe<Scalars['BigInt']>;
  xALGBAmount_gt?: Maybe<Scalars['BigInt']>;
  xALGBAmount_gte?: Maybe<Scalars['BigInt']>;
  xALGBAmount_in?: Maybe<Array<Scalars['BigInt']>>;
  xALGBAmount_lt?: Maybe<Scalars['BigInt']>;
  xALGBAmount_lte?: Maybe<Scalars['BigInt']>;
  xALGBAmount_not?: Maybe<Scalars['BigInt']>;
  xALGBAmount_not_in?: Maybe<Array<Scalars['BigInt']>>;
};

export enum StakeTx_OrderBy {
  Id = 'id',
  Owner = 'owner',
  StakedAlgbAmount = 'stakedALGBAmount',
  Timestamp = 'timestamp',
  XAlgbAmount = 'xALGBAmount',
}

export type Stake_Filter = {
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  stakedALGBAmount?: Maybe<Scalars['BigInt']>;
  stakedALGBAmount_gt?: Maybe<Scalars['BigInt']>;
  stakedALGBAmount_gte?: Maybe<Scalars['BigInt']>;
  stakedALGBAmount_in?: Maybe<Array<Scalars['BigInt']>>;
  stakedALGBAmount_lt?: Maybe<Scalars['BigInt']>;
  stakedALGBAmount_lte?: Maybe<Scalars['BigInt']>;
  stakedALGBAmount_not?: Maybe<Scalars['BigInt']>;
  stakedALGBAmount_not_in?: Maybe<Array<Scalars['BigInt']>>;
  xALGBAmount?: Maybe<Scalars['BigInt']>;
  xALGBAmount_gt?: Maybe<Scalars['BigInt']>;
  xALGBAmount_gte?: Maybe<Scalars['BigInt']>;
  xALGBAmount_in?: Maybe<Array<Scalars['BigInt']>>;
  xALGBAmount_lt?: Maybe<Scalars['BigInt']>;
  xALGBAmount_lte?: Maybe<Scalars['BigInt']>;
  xALGBAmount_not?: Maybe<Scalars['BigInt']>;
  xALGBAmount_not_in?: Maybe<Array<Scalars['BigInt']>>;
};

export enum Stake_OrderBy {
  Id = 'id',
  StakedAlgbAmount = 'stakedALGBAmount',
  XAlgbAmount = 'xALGBAmount',
}

export type Subscription = {
  __typename?: 'Subscription';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  algebraDayData?: Maybe<AlgebraDayData>;
  algebraDayDatas: Array<AlgebraDayData>;
  block?: Maybe<Block>;
  blocks: Array<Block>;
  bundle?: Maybe<Bundle>;
  bundles: Array<Bundle>;
  burn?: Maybe<Burn>;
  burns: Array<Burn>;
  collect?: Maybe<Collect>;
  collects: Array<Collect>;
  deposit?: Maybe<Deposit>;
  deposits: Array<Deposit>;
  eternalFarming?: Maybe<EternalFarming>;
  eternalFarmings: Array<EternalFarming>;
  factories: Array<Factory>;
  factory?: Maybe<Factory>;
  feeHourData?: Maybe<FeeHourData>;
  feeHourDatas: Array<FeeHourData>;
  flash?: Maybe<Flash>;
  flashes: Array<Flash>;
  histories: Array<History>;
  history?: Maybe<History>;
  limitFarming?: Maybe<LimitFarming>;
  limitFarmings: Array<LimitFarming>;
  mint?: Maybe<Mint>;
  mints: Array<Mint>;
  pool?: Maybe<Pool>;
  poolDayData?: Maybe<PoolDayData>;
  poolDayDatas: Array<PoolDayData>;
  poolFeeData?: Maybe<PoolFeeData>;
  poolFeeDatas: Array<PoolFeeData>;
  poolHourData?: Maybe<PoolHourData>;
  poolHourDatas: Array<PoolHourData>;
  pools: Array<Pool>;
  position?: Maybe<Position>;
  positionSnapshot?: Maybe<PositionSnapshot>;
  positionSnapshots: Array<PositionSnapshot>;
  positions: Array<Position>;
  reward?: Maybe<Reward>;
  rewards: Array<Reward>;
  stake?: Maybe<Stake>;
  stakeTx?: Maybe<StakeTx>;
  stakeTxes: Array<StakeTx>;
  stakes: Array<Stake>;
  swap?: Maybe<Swap>;
  swaps: Array<Swap>;
  tick?: Maybe<Tick>;
  tickDayData?: Maybe<TickDayData>;
  tickDayDatas: Array<TickDayData>;
  tickHourData?: Maybe<TickHourData>;
  tickHourDatas: Array<TickHourData>;
  ticks: Array<Tick>;
  token?: Maybe<Token>;
  tokenDayData?: Maybe<TokenDayData>;
  tokenDayDatas: Array<TokenDayData>;
  tokenHourData?: Maybe<TokenHourData>;
  tokenHourDatas: Array<TokenHourData>;
  tokens: Array<Token>;
  transaction?: Maybe<Transaction>;
  transactions: Array<Transaction>;
};

export type Subscription_MetaArgs = {
  block?: Maybe<Block_Height>;
};

export type SubscriptionAlgebraDayDataArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionAlgebraDayDatasArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<AlgebraDayData_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<AlgebraDayData_Filter>;
};

export type SubscriptionBlockArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionBlocksArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Block_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Block_Filter>;
};

export type SubscriptionBundleArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionBundlesArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Bundle_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Bundle_Filter>;
};

export type SubscriptionBurnArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionBurnsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Burn_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Burn_Filter>;
};

export type SubscriptionCollectArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionCollectsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Collect_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Collect_Filter>;
};

export type SubscriptionDepositArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionDepositsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Deposit_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Deposit_Filter>;
};

export type SubscriptionEternalFarmingArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionEternalFarmingsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<EternalFarming_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<EternalFarming_Filter>;
};

export type SubscriptionFactoriesArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Factory_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Factory_Filter>;
};

export type SubscriptionFactoryArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionFeeHourDataArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionFeeHourDatasArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<FeeHourData_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<FeeHourData_Filter>;
};

export type SubscriptionFlashArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionFlashesArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Flash_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Flash_Filter>;
};

export type SubscriptionHistoriesArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<History_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<History_Filter>;
};

export type SubscriptionHistoryArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionLimitFarmingArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionLimitFarmingsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<LimitFarming_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<LimitFarming_Filter>;
};

export type SubscriptionMintArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionMintsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Mint_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Mint_Filter>;
};

export type SubscriptionPoolArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionPoolDayDataArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionPoolDayDatasArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<PoolDayData_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<PoolDayData_Filter>;
};

export type SubscriptionPoolFeeDataArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionPoolFeeDatasArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<PoolFeeData_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<PoolFeeData_Filter>;
};

export type SubscriptionPoolHourDataArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionPoolHourDatasArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<PoolHourData_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<PoolHourData_Filter>;
};

export type SubscriptionPoolsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Pool_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Pool_Filter>;
};

export type SubscriptionPositionArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionPositionSnapshotArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionPositionSnapshotsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<PositionSnapshot_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<PositionSnapshot_Filter>;
};

export type SubscriptionPositionsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Position_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Position_Filter>;
};

export type SubscriptionRewardArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionRewardsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Reward_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Reward_Filter>;
};

export type SubscriptionStakeArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionStakeTxArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionStakeTxesArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<StakeTx_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<StakeTx_Filter>;
};

export type SubscriptionStakesArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Stake_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Stake_Filter>;
};

export type SubscriptionSwapArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionSwapsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Swap_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Swap_Filter>;
};

export type SubscriptionTickArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionTickDayDataArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionTickDayDatasArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<TickDayData_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<TickDayData_Filter>;
};

export type SubscriptionTickHourDataArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionTickHourDatasArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<TickHourData_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<TickHourData_Filter>;
};

export type SubscriptionTicksArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Tick_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Tick_Filter>;
};

export type SubscriptionTokenArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionTokenDayDataArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionTokenDayDatasArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<TokenDayData_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<TokenDayData_Filter>;
};

export type SubscriptionTokenHourDataArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionTokenHourDatasArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<TokenHourData_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<TokenHourData_Filter>;
};

export type SubscriptionTokensArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Token_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Token_Filter>;
};

export type SubscriptionTransactionArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionTransactionsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Transaction_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Transaction_Filter>;
};

export type Swap = {
  __typename?: 'Swap';
  amount0: Scalars['BigDecimal'];
  amount1: Scalars['BigDecimal'];
  amountUSD: Scalars['BigDecimal'];
  id: Scalars['ID'];
  liquidity: Scalars['BigInt'];
  logIndex?: Maybe<Scalars['BigInt']>;
  origin: Scalars['Bytes'];
  pool: Pool;
  price: Scalars['BigInt'];
  recipient: Scalars['Bytes'];
  sender: Scalars['Bytes'];
  tick: Scalars['BigInt'];
  timestamp: Scalars['BigInt'];
  token0: Token;
  token1: Token;
  transaction: Transaction;
};

export type Swap_Filter = {
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  amount0?: Maybe<Scalars['BigDecimal']>;
  amount0_gt?: Maybe<Scalars['BigDecimal']>;
  amount0_gte?: Maybe<Scalars['BigDecimal']>;
  amount0_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amount0_lt?: Maybe<Scalars['BigDecimal']>;
  amount0_lte?: Maybe<Scalars['BigDecimal']>;
  amount0_not?: Maybe<Scalars['BigDecimal']>;
  amount0_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amount1?: Maybe<Scalars['BigDecimal']>;
  amount1_gt?: Maybe<Scalars['BigDecimal']>;
  amount1_gte?: Maybe<Scalars['BigDecimal']>;
  amount1_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amount1_lt?: Maybe<Scalars['BigDecimal']>;
  amount1_lte?: Maybe<Scalars['BigDecimal']>;
  amount1_not?: Maybe<Scalars['BigDecimal']>;
  amount1_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amountUSD?: Maybe<Scalars['BigDecimal']>;
  amountUSD_gt?: Maybe<Scalars['BigDecimal']>;
  amountUSD_gte?: Maybe<Scalars['BigDecimal']>;
  amountUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  amountUSD_lt?: Maybe<Scalars['BigDecimal']>;
  amountUSD_lte?: Maybe<Scalars['BigDecimal']>;
  amountUSD_not?: Maybe<Scalars['BigDecimal']>;
  amountUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  liquidity?: Maybe<Scalars['BigInt']>;
  liquidity_gt?: Maybe<Scalars['BigInt']>;
  liquidity_gte?: Maybe<Scalars['BigInt']>;
  liquidity_in?: Maybe<Array<Scalars['BigInt']>>;
  liquidity_lt?: Maybe<Scalars['BigInt']>;
  liquidity_lte?: Maybe<Scalars['BigInt']>;
  liquidity_not?: Maybe<Scalars['BigInt']>;
  liquidity_not_in?: Maybe<Array<Scalars['BigInt']>>;
  logIndex?: Maybe<Scalars['BigInt']>;
  logIndex_gt?: Maybe<Scalars['BigInt']>;
  logIndex_gte?: Maybe<Scalars['BigInt']>;
  logIndex_in?: Maybe<Array<Scalars['BigInt']>>;
  logIndex_lt?: Maybe<Scalars['BigInt']>;
  logIndex_lte?: Maybe<Scalars['BigInt']>;
  logIndex_not?: Maybe<Scalars['BigInt']>;
  logIndex_not_in?: Maybe<Array<Scalars['BigInt']>>;
  origin?: Maybe<Scalars['Bytes']>;
  origin_contains?: Maybe<Scalars['Bytes']>;
  origin_in?: Maybe<Array<Scalars['Bytes']>>;
  origin_not?: Maybe<Scalars['Bytes']>;
  origin_not_contains?: Maybe<Scalars['Bytes']>;
  origin_not_in?: Maybe<Array<Scalars['Bytes']>>;
  pool?: Maybe<Scalars['String']>;
  pool_?: Maybe<Pool_Filter>;
  pool_contains?: Maybe<Scalars['String']>;
  pool_contains_nocase?: Maybe<Scalars['String']>;
  pool_ends_with?: Maybe<Scalars['String']>;
  pool_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_gt?: Maybe<Scalars['String']>;
  pool_gte?: Maybe<Scalars['String']>;
  pool_in?: Maybe<Array<Scalars['String']>>;
  pool_lt?: Maybe<Scalars['String']>;
  pool_lte?: Maybe<Scalars['String']>;
  pool_not?: Maybe<Scalars['String']>;
  pool_not_contains?: Maybe<Scalars['String']>;
  pool_not_contains_nocase?: Maybe<Scalars['String']>;
  pool_not_ends_with?: Maybe<Scalars['String']>;
  pool_not_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_not_in?: Maybe<Array<Scalars['String']>>;
  pool_not_starts_with?: Maybe<Scalars['String']>;
  pool_not_starts_with_nocase?: Maybe<Scalars['String']>;
  pool_starts_with?: Maybe<Scalars['String']>;
  pool_starts_with_nocase?: Maybe<Scalars['String']>;
  price?: Maybe<Scalars['BigInt']>;
  price_gt?: Maybe<Scalars['BigInt']>;
  price_gte?: Maybe<Scalars['BigInt']>;
  price_in?: Maybe<Array<Scalars['BigInt']>>;
  price_lt?: Maybe<Scalars['BigInt']>;
  price_lte?: Maybe<Scalars['BigInt']>;
  price_not?: Maybe<Scalars['BigInt']>;
  price_not_in?: Maybe<Array<Scalars['BigInt']>>;
  recipient?: Maybe<Scalars['Bytes']>;
  recipient_contains?: Maybe<Scalars['Bytes']>;
  recipient_in?: Maybe<Array<Scalars['Bytes']>>;
  recipient_not?: Maybe<Scalars['Bytes']>;
  recipient_not_contains?: Maybe<Scalars['Bytes']>;
  recipient_not_in?: Maybe<Array<Scalars['Bytes']>>;
  sender?: Maybe<Scalars['Bytes']>;
  sender_contains?: Maybe<Scalars['Bytes']>;
  sender_in?: Maybe<Array<Scalars['Bytes']>>;
  sender_not?: Maybe<Scalars['Bytes']>;
  sender_not_contains?: Maybe<Scalars['Bytes']>;
  sender_not_in?: Maybe<Array<Scalars['Bytes']>>;
  tick?: Maybe<Scalars['BigInt']>;
  tick_gt?: Maybe<Scalars['BigInt']>;
  tick_gte?: Maybe<Scalars['BigInt']>;
  tick_in?: Maybe<Array<Scalars['BigInt']>>;
  tick_lt?: Maybe<Scalars['BigInt']>;
  tick_lte?: Maybe<Scalars['BigInt']>;
  tick_not?: Maybe<Scalars['BigInt']>;
  tick_not_in?: Maybe<Array<Scalars['BigInt']>>;
  timestamp?: Maybe<Scalars['BigInt']>;
  timestamp_gt?: Maybe<Scalars['BigInt']>;
  timestamp_gte?: Maybe<Scalars['BigInt']>;
  timestamp_in?: Maybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: Maybe<Scalars['BigInt']>;
  timestamp_lte?: Maybe<Scalars['BigInt']>;
  timestamp_not?: Maybe<Scalars['BigInt']>;
  timestamp_not_in?: Maybe<Array<Scalars['BigInt']>>;
  token0?: Maybe<Scalars['String']>;
  token0_?: Maybe<Token_Filter>;
  token0_contains?: Maybe<Scalars['String']>;
  token0_contains_nocase?: Maybe<Scalars['String']>;
  token0_ends_with?: Maybe<Scalars['String']>;
  token0_ends_with_nocase?: Maybe<Scalars['String']>;
  token0_gt?: Maybe<Scalars['String']>;
  token0_gte?: Maybe<Scalars['String']>;
  token0_in?: Maybe<Array<Scalars['String']>>;
  token0_lt?: Maybe<Scalars['String']>;
  token0_lte?: Maybe<Scalars['String']>;
  token0_not?: Maybe<Scalars['String']>;
  token0_not_contains?: Maybe<Scalars['String']>;
  token0_not_contains_nocase?: Maybe<Scalars['String']>;
  token0_not_ends_with?: Maybe<Scalars['String']>;
  token0_not_ends_with_nocase?: Maybe<Scalars['String']>;
  token0_not_in?: Maybe<Array<Scalars['String']>>;
  token0_not_starts_with?: Maybe<Scalars['String']>;
  token0_not_starts_with_nocase?: Maybe<Scalars['String']>;
  token0_starts_with?: Maybe<Scalars['String']>;
  token0_starts_with_nocase?: Maybe<Scalars['String']>;
  token1?: Maybe<Scalars['String']>;
  token1_?: Maybe<Token_Filter>;
  token1_contains?: Maybe<Scalars['String']>;
  token1_contains_nocase?: Maybe<Scalars['String']>;
  token1_ends_with?: Maybe<Scalars['String']>;
  token1_ends_with_nocase?: Maybe<Scalars['String']>;
  token1_gt?: Maybe<Scalars['String']>;
  token1_gte?: Maybe<Scalars['String']>;
  token1_in?: Maybe<Array<Scalars['String']>>;
  token1_lt?: Maybe<Scalars['String']>;
  token1_lte?: Maybe<Scalars['String']>;
  token1_not?: Maybe<Scalars['String']>;
  token1_not_contains?: Maybe<Scalars['String']>;
  token1_not_contains_nocase?: Maybe<Scalars['String']>;
  token1_not_ends_with?: Maybe<Scalars['String']>;
  token1_not_ends_with_nocase?: Maybe<Scalars['String']>;
  token1_not_in?: Maybe<Array<Scalars['String']>>;
  token1_not_starts_with?: Maybe<Scalars['String']>;
  token1_not_starts_with_nocase?: Maybe<Scalars['String']>;
  token1_starts_with?: Maybe<Scalars['String']>;
  token1_starts_with_nocase?: Maybe<Scalars['String']>;
  transaction?: Maybe<Scalars['String']>;
  transaction_?: Maybe<Transaction_Filter>;
  transaction_contains?: Maybe<Scalars['String']>;
  transaction_contains_nocase?: Maybe<Scalars['String']>;
  transaction_ends_with?: Maybe<Scalars['String']>;
  transaction_ends_with_nocase?: Maybe<Scalars['String']>;
  transaction_gt?: Maybe<Scalars['String']>;
  transaction_gte?: Maybe<Scalars['String']>;
  transaction_in?: Maybe<Array<Scalars['String']>>;
  transaction_lt?: Maybe<Scalars['String']>;
  transaction_lte?: Maybe<Scalars['String']>;
  transaction_not?: Maybe<Scalars['String']>;
  transaction_not_contains?: Maybe<Scalars['String']>;
  transaction_not_contains_nocase?: Maybe<Scalars['String']>;
  transaction_not_ends_with?: Maybe<Scalars['String']>;
  transaction_not_ends_with_nocase?: Maybe<Scalars['String']>;
  transaction_not_in?: Maybe<Array<Scalars['String']>>;
  transaction_not_starts_with?: Maybe<Scalars['String']>;
  transaction_not_starts_with_nocase?: Maybe<Scalars['String']>;
  transaction_starts_with?: Maybe<Scalars['String']>;
  transaction_starts_with_nocase?: Maybe<Scalars['String']>;
};

export enum Swap_OrderBy {
  Amount0 = 'amount0',
  Amount1 = 'amount1',
  AmountUsd = 'amountUSD',
  Id = 'id',
  Liquidity = 'liquidity',
  LogIndex = 'logIndex',
  Origin = 'origin',
  Pool = 'pool',
  Price = 'price',
  Recipient = 'recipient',
  Sender = 'sender',
  Tick = 'tick',
  Timestamp = 'timestamp',
  Token0 = 'token0',
  Token1 = 'token1',
  Transaction = 'transaction',
}

export type Tick = {
  __typename?: 'Tick';
  collectedFeesToken0: Scalars['BigDecimal'];
  collectedFeesToken1: Scalars['BigDecimal'];
  collectedFeesUSD: Scalars['BigDecimal'];
  createdAtBlockNumber: Scalars['BigInt'];
  createdAtTimestamp: Scalars['BigInt'];
  feeGrowthOutside0X128: Scalars['BigInt'];
  feeGrowthOutside1X128: Scalars['BigInt'];
  feesUSD: Scalars['BigDecimal'];
  id: Scalars['ID'];
  liquidityGross: Scalars['BigInt'];
  liquidityNet: Scalars['BigInt'];
  liquidityProviderCount: Scalars['BigInt'];
  pool: Pool;
  poolAddress?: Maybe<Scalars['String']>;
  price0: Scalars['BigDecimal'];
  price1: Scalars['BigDecimal'];
  tickIdx: Scalars['BigInt'];
  untrackedVolumeUSD: Scalars['BigDecimal'];
  volumeToken0: Scalars['BigDecimal'];
  volumeToken1: Scalars['BigDecimal'];
  volumeUSD: Scalars['BigDecimal'];
};

export type TickDayData = {
  __typename?: 'TickDayData';
  date: Scalars['Int'];
  feeGrowthOutside0X128: Scalars['BigInt'];
  feeGrowthOutside1X128: Scalars['BigInt'];
  feesUSD: Scalars['BigDecimal'];
  id: Scalars['ID'];
  liquidityGross: Scalars['BigInt'];
  liquidityNet: Scalars['BigInt'];
  pool: Pool;
  tick: Tick;
  volumeToken0: Scalars['BigDecimal'];
  volumeToken1: Scalars['BigDecimal'];
  volumeUSD: Scalars['BigDecimal'];
};

export type TickDayData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  date?: Maybe<Scalars['Int']>;
  date_gt?: Maybe<Scalars['Int']>;
  date_gte?: Maybe<Scalars['Int']>;
  date_in?: Maybe<Array<Scalars['Int']>>;
  date_lt?: Maybe<Scalars['Int']>;
  date_lte?: Maybe<Scalars['Int']>;
  date_not?: Maybe<Scalars['Int']>;
  date_not_in?: Maybe<Array<Scalars['Int']>>;
  feeGrowthOutside0X128?: Maybe<Scalars['BigInt']>;
  feeGrowthOutside0X128_gt?: Maybe<Scalars['BigInt']>;
  feeGrowthOutside0X128_gte?: Maybe<Scalars['BigInt']>;
  feeGrowthOutside0X128_in?: Maybe<Array<Scalars['BigInt']>>;
  feeGrowthOutside0X128_lt?: Maybe<Scalars['BigInt']>;
  feeGrowthOutside0X128_lte?: Maybe<Scalars['BigInt']>;
  feeGrowthOutside0X128_not?: Maybe<Scalars['BigInt']>;
  feeGrowthOutside0X128_not_in?: Maybe<Array<Scalars['BigInt']>>;
  feeGrowthOutside1X128?: Maybe<Scalars['BigInt']>;
  feeGrowthOutside1X128_gt?: Maybe<Scalars['BigInt']>;
  feeGrowthOutside1X128_gte?: Maybe<Scalars['BigInt']>;
  feeGrowthOutside1X128_in?: Maybe<Array<Scalars['BigInt']>>;
  feeGrowthOutside1X128_lt?: Maybe<Scalars['BigInt']>;
  feeGrowthOutside1X128_lte?: Maybe<Scalars['BigInt']>;
  feeGrowthOutside1X128_not?: Maybe<Scalars['BigInt']>;
  feeGrowthOutside1X128_not_in?: Maybe<Array<Scalars['BigInt']>>;
  feesUSD?: Maybe<Scalars['BigDecimal']>;
  feesUSD_gt?: Maybe<Scalars['BigDecimal']>;
  feesUSD_gte?: Maybe<Scalars['BigDecimal']>;
  feesUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  feesUSD_lt?: Maybe<Scalars['BigDecimal']>;
  feesUSD_lte?: Maybe<Scalars['BigDecimal']>;
  feesUSD_not?: Maybe<Scalars['BigDecimal']>;
  feesUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  liquidityGross?: Maybe<Scalars['BigInt']>;
  liquidityGross_gt?: Maybe<Scalars['BigInt']>;
  liquidityGross_gte?: Maybe<Scalars['BigInt']>;
  liquidityGross_in?: Maybe<Array<Scalars['BigInt']>>;
  liquidityGross_lt?: Maybe<Scalars['BigInt']>;
  liquidityGross_lte?: Maybe<Scalars['BigInt']>;
  liquidityGross_not?: Maybe<Scalars['BigInt']>;
  liquidityGross_not_in?: Maybe<Array<Scalars['BigInt']>>;
  liquidityNet?: Maybe<Scalars['BigInt']>;
  liquidityNet_gt?: Maybe<Scalars['BigInt']>;
  liquidityNet_gte?: Maybe<Scalars['BigInt']>;
  liquidityNet_in?: Maybe<Array<Scalars['BigInt']>>;
  liquidityNet_lt?: Maybe<Scalars['BigInt']>;
  liquidityNet_lte?: Maybe<Scalars['BigInt']>;
  liquidityNet_not?: Maybe<Scalars['BigInt']>;
  liquidityNet_not_in?: Maybe<Array<Scalars['BigInt']>>;
  pool?: Maybe<Scalars['String']>;
  pool_?: Maybe<Pool_Filter>;
  pool_contains?: Maybe<Scalars['String']>;
  pool_contains_nocase?: Maybe<Scalars['String']>;
  pool_ends_with?: Maybe<Scalars['String']>;
  pool_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_gt?: Maybe<Scalars['String']>;
  pool_gte?: Maybe<Scalars['String']>;
  pool_in?: Maybe<Array<Scalars['String']>>;
  pool_lt?: Maybe<Scalars['String']>;
  pool_lte?: Maybe<Scalars['String']>;
  pool_not?: Maybe<Scalars['String']>;
  pool_not_contains?: Maybe<Scalars['String']>;
  pool_not_contains_nocase?: Maybe<Scalars['String']>;
  pool_not_ends_with?: Maybe<Scalars['String']>;
  pool_not_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_not_in?: Maybe<Array<Scalars['String']>>;
  pool_not_starts_with?: Maybe<Scalars['String']>;
  pool_not_starts_with_nocase?: Maybe<Scalars['String']>;
  pool_starts_with?: Maybe<Scalars['String']>;
  pool_starts_with_nocase?: Maybe<Scalars['String']>;
  tick?: Maybe<Scalars['String']>;
  tick_?: Maybe<Tick_Filter>;
  tick_contains?: Maybe<Scalars['String']>;
  tick_contains_nocase?: Maybe<Scalars['String']>;
  tick_ends_with?: Maybe<Scalars['String']>;
  tick_ends_with_nocase?: Maybe<Scalars['String']>;
  tick_gt?: Maybe<Scalars['String']>;
  tick_gte?: Maybe<Scalars['String']>;
  tick_in?: Maybe<Array<Scalars['String']>>;
  tick_lt?: Maybe<Scalars['String']>;
  tick_lte?: Maybe<Scalars['String']>;
  tick_not?: Maybe<Scalars['String']>;
  tick_not_contains?: Maybe<Scalars['String']>;
  tick_not_contains_nocase?: Maybe<Scalars['String']>;
  tick_not_ends_with?: Maybe<Scalars['String']>;
  tick_not_ends_with_nocase?: Maybe<Scalars['String']>;
  tick_not_in?: Maybe<Array<Scalars['String']>>;
  tick_not_starts_with?: Maybe<Scalars['String']>;
  tick_not_starts_with_nocase?: Maybe<Scalars['String']>;
  tick_starts_with?: Maybe<Scalars['String']>;
  tick_starts_with_nocase?: Maybe<Scalars['String']>;
  volumeToken0?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_gt?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_gte?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeToken0_lt?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_lte?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_not?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeToken1?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_gt?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_gte?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeToken1_lt?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_lte?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_not?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeUSD?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_gt?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_gte?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeUSD_lt?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_lte?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_not?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
};

export enum TickDayData_OrderBy {
  Date = 'date',
  FeeGrowthOutside0X128 = 'feeGrowthOutside0X128',
  FeeGrowthOutside1X128 = 'feeGrowthOutside1X128',
  FeesUsd = 'feesUSD',
  Id = 'id',
  LiquidityGross = 'liquidityGross',
  LiquidityNet = 'liquidityNet',
  Pool = 'pool',
  Tick = 'tick',
  VolumeToken0 = 'volumeToken0',
  VolumeToken1 = 'volumeToken1',
  VolumeUsd = 'volumeUSD',
}

export type TickHourData = {
  __typename?: 'TickHourData';
  feesUSD: Scalars['BigDecimal'];
  id: Scalars['ID'];
  liquidityGross: Scalars['BigInt'];
  liquidityNet: Scalars['BigInt'];
  periodStartUnix: Scalars['Int'];
  pool: Pool;
  tick: Tick;
  volumeToken0: Scalars['BigDecimal'];
  volumeToken1: Scalars['BigDecimal'];
  volumeUSD: Scalars['BigDecimal'];
};

export type TickHourData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  feesUSD?: Maybe<Scalars['BigDecimal']>;
  feesUSD_gt?: Maybe<Scalars['BigDecimal']>;
  feesUSD_gte?: Maybe<Scalars['BigDecimal']>;
  feesUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  feesUSD_lt?: Maybe<Scalars['BigDecimal']>;
  feesUSD_lte?: Maybe<Scalars['BigDecimal']>;
  feesUSD_not?: Maybe<Scalars['BigDecimal']>;
  feesUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  liquidityGross?: Maybe<Scalars['BigInt']>;
  liquidityGross_gt?: Maybe<Scalars['BigInt']>;
  liquidityGross_gte?: Maybe<Scalars['BigInt']>;
  liquidityGross_in?: Maybe<Array<Scalars['BigInt']>>;
  liquidityGross_lt?: Maybe<Scalars['BigInt']>;
  liquidityGross_lte?: Maybe<Scalars['BigInt']>;
  liquidityGross_not?: Maybe<Scalars['BigInt']>;
  liquidityGross_not_in?: Maybe<Array<Scalars['BigInt']>>;
  liquidityNet?: Maybe<Scalars['BigInt']>;
  liquidityNet_gt?: Maybe<Scalars['BigInt']>;
  liquidityNet_gte?: Maybe<Scalars['BigInt']>;
  liquidityNet_in?: Maybe<Array<Scalars['BigInt']>>;
  liquidityNet_lt?: Maybe<Scalars['BigInt']>;
  liquidityNet_lte?: Maybe<Scalars['BigInt']>;
  liquidityNet_not?: Maybe<Scalars['BigInt']>;
  liquidityNet_not_in?: Maybe<Array<Scalars['BigInt']>>;
  periodStartUnix?: Maybe<Scalars['Int']>;
  periodStartUnix_gt?: Maybe<Scalars['Int']>;
  periodStartUnix_gte?: Maybe<Scalars['Int']>;
  periodStartUnix_in?: Maybe<Array<Scalars['Int']>>;
  periodStartUnix_lt?: Maybe<Scalars['Int']>;
  periodStartUnix_lte?: Maybe<Scalars['Int']>;
  periodStartUnix_not?: Maybe<Scalars['Int']>;
  periodStartUnix_not_in?: Maybe<Array<Scalars['Int']>>;
  pool?: Maybe<Scalars['String']>;
  pool_?: Maybe<Pool_Filter>;
  pool_contains?: Maybe<Scalars['String']>;
  pool_contains_nocase?: Maybe<Scalars['String']>;
  pool_ends_with?: Maybe<Scalars['String']>;
  pool_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_gt?: Maybe<Scalars['String']>;
  pool_gte?: Maybe<Scalars['String']>;
  pool_in?: Maybe<Array<Scalars['String']>>;
  pool_lt?: Maybe<Scalars['String']>;
  pool_lte?: Maybe<Scalars['String']>;
  pool_not?: Maybe<Scalars['String']>;
  pool_not_contains?: Maybe<Scalars['String']>;
  pool_not_contains_nocase?: Maybe<Scalars['String']>;
  pool_not_ends_with?: Maybe<Scalars['String']>;
  pool_not_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_not_in?: Maybe<Array<Scalars['String']>>;
  pool_not_starts_with?: Maybe<Scalars['String']>;
  pool_not_starts_with_nocase?: Maybe<Scalars['String']>;
  pool_starts_with?: Maybe<Scalars['String']>;
  pool_starts_with_nocase?: Maybe<Scalars['String']>;
  tick?: Maybe<Scalars['String']>;
  tick_?: Maybe<Tick_Filter>;
  tick_contains?: Maybe<Scalars['String']>;
  tick_contains_nocase?: Maybe<Scalars['String']>;
  tick_ends_with?: Maybe<Scalars['String']>;
  tick_ends_with_nocase?: Maybe<Scalars['String']>;
  tick_gt?: Maybe<Scalars['String']>;
  tick_gte?: Maybe<Scalars['String']>;
  tick_in?: Maybe<Array<Scalars['String']>>;
  tick_lt?: Maybe<Scalars['String']>;
  tick_lte?: Maybe<Scalars['String']>;
  tick_not?: Maybe<Scalars['String']>;
  tick_not_contains?: Maybe<Scalars['String']>;
  tick_not_contains_nocase?: Maybe<Scalars['String']>;
  tick_not_ends_with?: Maybe<Scalars['String']>;
  tick_not_ends_with_nocase?: Maybe<Scalars['String']>;
  tick_not_in?: Maybe<Array<Scalars['String']>>;
  tick_not_starts_with?: Maybe<Scalars['String']>;
  tick_not_starts_with_nocase?: Maybe<Scalars['String']>;
  tick_starts_with?: Maybe<Scalars['String']>;
  tick_starts_with_nocase?: Maybe<Scalars['String']>;
  volumeToken0?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_gt?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_gte?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeToken0_lt?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_lte?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_not?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeToken1?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_gt?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_gte?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeToken1_lt?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_lte?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_not?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeUSD?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_gt?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_gte?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeUSD_lt?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_lte?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_not?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
};

export enum TickHourData_OrderBy {
  FeesUsd = 'feesUSD',
  Id = 'id',
  LiquidityGross = 'liquidityGross',
  LiquidityNet = 'liquidityNet',
  PeriodStartUnix = 'periodStartUnix',
  Pool = 'pool',
  Tick = 'tick',
  VolumeToken0 = 'volumeToken0',
  VolumeToken1 = 'volumeToken1',
  VolumeUsd = 'volumeUSD',
}

export type Tick_Filter = {
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  collectedFeesToken0?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken0_gt?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken0_gte?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken0_in?: Maybe<Array<Scalars['BigDecimal']>>;
  collectedFeesToken0_lt?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken0_lte?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken0_not?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken0_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  collectedFeesToken1?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken1_gt?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken1_gte?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken1_in?: Maybe<Array<Scalars['BigDecimal']>>;
  collectedFeesToken1_lt?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken1_lte?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken1_not?: Maybe<Scalars['BigDecimal']>;
  collectedFeesToken1_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  collectedFeesUSD?: Maybe<Scalars['BigDecimal']>;
  collectedFeesUSD_gt?: Maybe<Scalars['BigDecimal']>;
  collectedFeesUSD_gte?: Maybe<Scalars['BigDecimal']>;
  collectedFeesUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  collectedFeesUSD_lt?: Maybe<Scalars['BigDecimal']>;
  collectedFeesUSD_lte?: Maybe<Scalars['BigDecimal']>;
  collectedFeesUSD_not?: Maybe<Scalars['BigDecimal']>;
  collectedFeesUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  createdAtBlockNumber?: Maybe<Scalars['BigInt']>;
  createdAtBlockNumber_gt?: Maybe<Scalars['BigInt']>;
  createdAtBlockNumber_gte?: Maybe<Scalars['BigInt']>;
  createdAtBlockNumber_in?: Maybe<Array<Scalars['BigInt']>>;
  createdAtBlockNumber_lt?: Maybe<Scalars['BigInt']>;
  createdAtBlockNumber_lte?: Maybe<Scalars['BigInt']>;
  createdAtBlockNumber_not?: Maybe<Scalars['BigInt']>;
  createdAtBlockNumber_not_in?: Maybe<Array<Scalars['BigInt']>>;
  createdAtTimestamp?: Maybe<Scalars['BigInt']>;
  createdAtTimestamp_gt?: Maybe<Scalars['BigInt']>;
  createdAtTimestamp_gte?: Maybe<Scalars['BigInt']>;
  createdAtTimestamp_in?: Maybe<Array<Scalars['BigInt']>>;
  createdAtTimestamp_lt?: Maybe<Scalars['BigInt']>;
  createdAtTimestamp_lte?: Maybe<Scalars['BigInt']>;
  createdAtTimestamp_not?: Maybe<Scalars['BigInt']>;
  createdAtTimestamp_not_in?: Maybe<Array<Scalars['BigInt']>>;
  feeGrowthOutside0X128?: Maybe<Scalars['BigInt']>;
  feeGrowthOutside0X128_gt?: Maybe<Scalars['BigInt']>;
  feeGrowthOutside0X128_gte?: Maybe<Scalars['BigInt']>;
  feeGrowthOutside0X128_in?: Maybe<Array<Scalars['BigInt']>>;
  feeGrowthOutside0X128_lt?: Maybe<Scalars['BigInt']>;
  feeGrowthOutside0X128_lte?: Maybe<Scalars['BigInt']>;
  feeGrowthOutside0X128_not?: Maybe<Scalars['BigInt']>;
  feeGrowthOutside0X128_not_in?: Maybe<Array<Scalars['BigInt']>>;
  feeGrowthOutside1X128?: Maybe<Scalars['BigInt']>;
  feeGrowthOutside1X128_gt?: Maybe<Scalars['BigInt']>;
  feeGrowthOutside1X128_gte?: Maybe<Scalars['BigInt']>;
  feeGrowthOutside1X128_in?: Maybe<Array<Scalars['BigInt']>>;
  feeGrowthOutside1X128_lt?: Maybe<Scalars['BigInt']>;
  feeGrowthOutside1X128_lte?: Maybe<Scalars['BigInt']>;
  feeGrowthOutside1X128_not?: Maybe<Scalars['BigInt']>;
  feeGrowthOutside1X128_not_in?: Maybe<Array<Scalars['BigInt']>>;
  feesUSD?: Maybe<Scalars['BigDecimal']>;
  feesUSD_gt?: Maybe<Scalars['BigDecimal']>;
  feesUSD_gte?: Maybe<Scalars['BigDecimal']>;
  feesUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  feesUSD_lt?: Maybe<Scalars['BigDecimal']>;
  feesUSD_lte?: Maybe<Scalars['BigDecimal']>;
  feesUSD_not?: Maybe<Scalars['BigDecimal']>;
  feesUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  liquidityGross?: Maybe<Scalars['BigInt']>;
  liquidityGross_gt?: Maybe<Scalars['BigInt']>;
  liquidityGross_gte?: Maybe<Scalars['BigInt']>;
  liquidityGross_in?: Maybe<Array<Scalars['BigInt']>>;
  liquidityGross_lt?: Maybe<Scalars['BigInt']>;
  liquidityGross_lte?: Maybe<Scalars['BigInt']>;
  liquidityGross_not?: Maybe<Scalars['BigInt']>;
  liquidityGross_not_in?: Maybe<Array<Scalars['BigInt']>>;
  liquidityNet?: Maybe<Scalars['BigInt']>;
  liquidityNet_gt?: Maybe<Scalars['BigInt']>;
  liquidityNet_gte?: Maybe<Scalars['BigInt']>;
  liquidityNet_in?: Maybe<Array<Scalars['BigInt']>>;
  liquidityNet_lt?: Maybe<Scalars['BigInt']>;
  liquidityNet_lte?: Maybe<Scalars['BigInt']>;
  liquidityNet_not?: Maybe<Scalars['BigInt']>;
  liquidityNet_not_in?: Maybe<Array<Scalars['BigInt']>>;
  liquidityProviderCount?: Maybe<Scalars['BigInt']>;
  liquidityProviderCount_gt?: Maybe<Scalars['BigInt']>;
  liquidityProviderCount_gte?: Maybe<Scalars['BigInt']>;
  liquidityProviderCount_in?: Maybe<Array<Scalars['BigInt']>>;
  liquidityProviderCount_lt?: Maybe<Scalars['BigInt']>;
  liquidityProviderCount_lte?: Maybe<Scalars['BigInt']>;
  liquidityProviderCount_not?: Maybe<Scalars['BigInt']>;
  liquidityProviderCount_not_in?: Maybe<Array<Scalars['BigInt']>>;
  pool?: Maybe<Scalars['String']>;
  poolAddress?: Maybe<Scalars['String']>;
  poolAddress_contains?: Maybe<Scalars['String']>;
  poolAddress_contains_nocase?: Maybe<Scalars['String']>;
  poolAddress_ends_with?: Maybe<Scalars['String']>;
  poolAddress_ends_with_nocase?: Maybe<Scalars['String']>;
  poolAddress_gt?: Maybe<Scalars['String']>;
  poolAddress_gte?: Maybe<Scalars['String']>;
  poolAddress_in?: Maybe<Array<Scalars['String']>>;
  poolAddress_lt?: Maybe<Scalars['String']>;
  poolAddress_lte?: Maybe<Scalars['String']>;
  poolAddress_not?: Maybe<Scalars['String']>;
  poolAddress_not_contains?: Maybe<Scalars['String']>;
  poolAddress_not_contains_nocase?: Maybe<Scalars['String']>;
  poolAddress_not_ends_with?: Maybe<Scalars['String']>;
  poolAddress_not_ends_with_nocase?: Maybe<Scalars['String']>;
  poolAddress_not_in?: Maybe<Array<Scalars['String']>>;
  poolAddress_not_starts_with?: Maybe<Scalars['String']>;
  poolAddress_not_starts_with_nocase?: Maybe<Scalars['String']>;
  poolAddress_starts_with?: Maybe<Scalars['String']>;
  poolAddress_starts_with_nocase?: Maybe<Scalars['String']>;
  pool_?: Maybe<Pool_Filter>;
  pool_contains?: Maybe<Scalars['String']>;
  pool_contains_nocase?: Maybe<Scalars['String']>;
  pool_ends_with?: Maybe<Scalars['String']>;
  pool_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_gt?: Maybe<Scalars['String']>;
  pool_gte?: Maybe<Scalars['String']>;
  pool_in?: Maybe<Array<Scalars['String']>>;
  pool_lt?: Maybe<Scalars['String']>;
  pool_lte?: Maybe<Scalars['String']>;
  pool_not?: Maybe<Scalars['String']>;
  pool_not_contains?: Maybe<Scalars['String']>;
  pool_not_contains_nocase?: Maybe<Scalars['String']>;
  pool_not_ends_with?: Maybe<Scalars['String']>;
  pool_not_ends_with_nocase?: Maybe<Scalars['String']>;
  pool_not_in?: Maybe<Array<Scalars['String']>>;
  pool_not_starts_with?: Maybe<Scalars['String']>;
  pool_not_starts_with_nocase?: Maybe<Scalars['String']>;
  pool_starts_with?: Maybe<Scalars['String']>;
  pool_starts_with_nocase?: Maybe<Scalars['String']>;
  price0?: Maybe<Scalars['BigDecimal']>;
  price0_gt?: Maybe<Scalars['BigDecimal']>;
  price0_gte?: Maybe<Scalars['BigDecimal']>;
  price0_in?: Maybe<Array<Scalars['BigDecimal']>>;
  price0_lt?: Maybe<Scalars['BigDecimal']>;
  price0_lte?: Maybe<Scalars['BigDecimal']>;
  price0_not?: Maybe<Scalars['BigDecimal']>;
  price0_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  price1?: Maybe<Scalars['BigDecimal']>;
  price1_gt?: Maybe<Scalars['BigDecimal']>;
  price1_gte?: Maybe<Scalars['BigDecimal']>;
  price1_in?: Maybe<Array<Scalars['BigDecimal']>>;
  price1_lt?: Maybe<Scalars['BigDecimal']>;
  price1_lte?: Maybe<Scalars['BigDecimal']>;
  price1_not?: Maybe<Scalars['BigDecimal']>;
  price1_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  tickIdx?: Maybe<Scalars['BigInt']>;
  tickIdx_gt?: Maybe<Scalars['BigInt']>;
  tickIdx_gte?: Maybe<Scalars['BigInt']>;
  tickIdx_in?: Maybe<Array<Scalars['BigInt']>>;
  tickIdx_lt?: Maybe<Scalars['BigInt']>;
  tickIdx_lte?: Maybe<Scalars['BigInt']>;
  tickIdx_not?: Maybe<Scalars['BigInt']>;
  tickIdx_not_in?: Maybe<Array<Scalars['BigInt']>>;
  untrackedVolumeUSD?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_gt?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_gte?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  untrackedVolumeUSD_lt?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_lte?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_not?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeToken0?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_gt?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_gte?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeToken0_lt?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_lte?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_not?: Maybe<Scalars['BigDecimal']>;
  volumeToken0_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeToken1?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_gt?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_gte?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeToken1_lt?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_lte?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_not?: Maybe<Scalars['BigDecimal']>;
  volumeToken1_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeUSD?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_gt?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_gte?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeUSD_lt?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_lte?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_not?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
};

export enum Tick_OrderBy {
  CollectedFeesToken0 = 'collectedFeesToken0',
  CollectedFeesToken1 = 'collectedFeesToken1',
  CollectedFeesUsd = 'collectedFeesUSD',
  CreatedAtBlockNumber = 'createdAtBlockNumber',
  CreatedAtTimestamp = 'createdAtTimestamp',
  FeeGrowthOutside0X128 = 'feeGrowthOutside0X128',
  FeeGrowthOutside1X128 = 'feeGrowthOutside1X128',
  FeesUsd = 'feesUSD',
  Id = 'id',
  LiquidityGross = 'liquidityGross',
  LiquidityNet = 'liquidityNet',
  LiquidityProviderCount = 'liquidityProviderCount',
  Pool = 'pool',
  PoolAddress = 'poolAddress',
  Price0 = 'price0',
  Price1 = 'price1',
  TickIdx = 'tickIdx',
  UntrackedVolumeUsd = 'untrackedVolumeUSD',
  VolumeToken0 = 'volumeToken0',
  VolumeToken1 = 'volumeToken1',
  VolumeUsd = 'volumeUSD',
}

export type Token = {
  __typename?: 'Token';
  decimals: Scalars['BigInt'];
  derivedMatic: Scalars['BigDecimal'];
  feesUSD: Scalars['BigDecimal'];
  id: Scalars['ID'];
  name: Scalars['String'];
  poolCount: Scalars['BigInt'];
  symbol: Scalars['String'];
  tokenDayData: Array<TokenDayData>;
  totalSupply: Scalars['BigInt'];
  totalValueLocked: Scalars['BigDecimal'];
  totalValueLockedUSD: Scalars['BigDecimal'];
  totalValueLockedUSDUntracked: Scalars['BigDecimal'];
  txCount: Scalars['BigInt'];
  untrackedVolumeUSD: Scalars['BigDecimal'];
  volume: Scalars['BigDecimal'];
  volumeUSD: Scalars['BigDecimal'];
  whitelistPools: Array<Pool>;
};

export type TokenTokenDayDataArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<TokenDayData_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  where?: Maybe<TokenDayData_Filter>;
};

export type TokenWhitelistPoolsArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Pool_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  where?: Maybe<Pool_Filter>;
};

export type TokenDayData = {
  __typename?: 'TokenDayData';
  close: Scalars['BigDecimal'];
  date: Scalars['Int'];
  feesUSD: Scalars['BigDecimal'];
  high: Scalars['BigDecimal'];
  id: Scalars['ID'];
  low: Scalars['BigDecimal'];
  open: Scalars['BigDecimal'];
  priceUSD: Scalars['BigDecimal'];
  token: Token;
  totalValueLocked: Scalars['BigDecimal'];
  totalValueLockedUSD: Scalars['BigDecimal'];
  untrackedVolumeUSD: Scalars['BigDecimal'];
  volume: Scalars['BigDecimal'];
  volumeUSD: Scalars['BigDecimal'];
};

export type TokenDayData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  close?: Maybe<Scalars['BigDecimal']>;
  close_gt?: Maybe<Scalars['BigDecimal']>;
  close_gte?: Maybe<Scalars['BigDecimal']>;
  close_in?: Maybe<Array<Scalars['BigDecimal']>>;
  close_lt?: Maybe<Scalars['BigDecimal']>;
  close_lte?: Maybe<Scalars['BigDecimal']>;
  close_not?: Maybe<Scalars['BigDecimal']>;
  close_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  date?: Maybe<Scalars['Int']>;
  date_gt?: Maybe<Scalars['Int']>;
  date_gte?: Maybe<Scalars['Int']>;
  date_in?: Maybe<Array<Scalars['Int']>>;
  date_lt?: Maybe<Scalars['Int']>;
  date_lte?: Maybe<Scalars['Int']>;
  date_not?: Maybe<Scalars['Int']>;
  date_not_in?: Maybe<Array<Scalars['Int']>>;
  feesUSD?: Maybe<Scalars['BigDecimal']>;
  feesUSD_gt?: Maybe<Scalars['BigDecimal']>;
  feesUSD_gte?: Maybe<Scalars['BigDecimal']>;
  feesUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  feesUSD_lt?: Maybe<Scalars['BigDecimal']>;
  feesUSD_lte?: Maybe<Scalars['BigDecimal']>;
  feesUSD_not?: Maybe<Scalars['BigDecimal']>;
  feesUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  high?: Maybe<Scalars['BigDecimal']>;
  high_gt?: Maybe<Scalars['BigDecimal']>;
  high_gte?: Maybe<Scalars['BigDecimal']>;
  high_in?: Maybe<Array<Scalars['BigDecimal']>>;
  high_lt?: Maybe<Scalars['BigDecimal']>;
  high_lte?: Maybe<Scalars['BigDecimal']>;
  high_not?: Maybe<Scalars['BigDecimal']>;
  high_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  low?: Maybe<Scalars['BigDecimal']>;
  low_gt?: Maybe<Scalars['BigDecimal']>;
  low_gte?: Maybe<Scalars['BigDecimal']>;
  low_in?: Maybe<Array<Scalars['BigDecimal']>>;
  low_lt?: Maybe<Scalars['BigDecimal']>;
  low_lte?: Maybe<Scalars['BigDecimal']>;
  low_not?: Maybe<Scalars['BigDecimal']>;
  low_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  open?: Maybe<Scalars['BigDecimal']>;
  open_gt?: Maybe<Scalars['BigDecimal']>;
  open_gte?: Maybe<Scalars['BigDecimal']>;
  open_in?: Maybe<Array<Scalars['BigDecimal']>>;
  open_lt?: Maybe<Scalars['BigDecimal']>;
  open_lte?: Maybe<Scalars['BigDecimal']>;
  open_not?: Maybe<Scalars['BigDecimal']>;
  open_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  priceUSD?: Maybe<Scalars['BigDecimal']>;
  priceUSD_gt?: Maybe<Scalars['BigDecimal']>;
  priceUSD_gte?: Maybe<Scalars['BigDecimal']>;
  priceUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  priceUSD_lt?: Maybe<Scalars['BigDecimal']>;
  priceUSD_lte?: Maybe<Scalars['BigDecimal']>;
  priceUSD_not?: Maybe<Scalars['BigDecimal']>;
  priceUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  token?: Maybe<Scalars['String']>;
  token_?: Maybe<Token_Filter>;
  token_contains?: Maybe<Scalars['String']>;
  token_contains_nocase?: Maybe<Scalars['String']>;
  token_ends_with?: Maybe<Scalars['String']>;
  token_ends_with_nocase?: Maybe<Scalars['String']>;
  token_gt?: Maybe<Scalars['String']>;
  token_gte?: Maybe<Scalars['String']>;
  token_in?: Maybe<Array<Scalars['String']>>;
  token_lt?: Maybe<Scalars['String']>;
  token_lte?: Maybe<Scalars['String']>;
  token_not?: Maybe<Scalars['String']>;
  token_not_contains?: Maybe<Scalars['String']>;
  token_not_contains_nocase?: Maybe<Scalars['String']>;
  token_not_ends_with?: Maybe<Scalars['String']>;
  token_not_ends_with_nocase?: Maybe<Scalars['String']>;
  token_not_in?: Maybe<Array<Scalars['String']>>;
  token_not_starts_with?: Maybe<Scalars['String']>;
  token_not_starts_with_nocase?: Maybe<Scalars['String']>;
  token_starts_with?: Maybe<Scalars['String']>;
  token_starts_with_nocase?: Maybe<Scalars['String']>;
  totalValueLocked?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_gt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_gte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedUSD_lt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_lte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_not?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLocked_gt?: Maybe<Scalars['BigDecimal']>;
  totalValueLocked_gte?: Maybe<Scalars['BigDecimal']>;
  totalValueLocked_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLocked_lt?: Maybe<Scalars['BigDecimal']>;
  totalValueLocked_lte?: Maybe<Scalars['BigDecimal']>;
  totalValueLocked_not?: Maybe<Scalars['BigDecimal']>;
  totalValueLocked_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  untrackedVolumeUSD?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_gt?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_gte?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  untrackedVolumeUSD_lt?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_lte?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_not?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volume?: Maybe<Scalars['BigDecimal']>;
  volumeUSD?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_gt?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_gte?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeUSD_lt?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_lte?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_not?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volume_gt?: Maybe<Scalars['BigDecimal']>;
  volume_gte?: Maybe<Scalars['BigDecimal']>;
  volume_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volume_lt?: Maybe<Scalars['BigDecimal']>;
  volume_lte?: Maybe<Scalars['BigDecimal']>;
  volume_not?: Maybe<Scalars['BigDecimal']>;
  volume_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
};

export enum TokenDayData_OrderBy {
  Close = 'close',
  Date = 'date',
  FeesUsd = 'feesUSD',
  High = 'high',
  Id = 'id',
  Low = 'low',
  Open = 'open',
  PriceUsd = 'priceUSD',
  Token = 'token',
  TotalValueLocked = 'totalValueLocked',
  TotalValueLockedUsd = 'totalValueLockedUSD',
  UntrackedVolumeUsd = 'untrackedVolumeUSD',
  Volume = 'volume',
  VolumeUsd = 'volumeUSD',
}

export type TokenHourData = {
  __typename?: 'TokenHourData';
  close: Scalars['BigDecimal'];
  feesUSD: Scalars['BigDecimal'];
  high: Scalars['BigDecimal'];
  id: Scalars['ID'];
  low: Scalars['BigDecimal'];
  open: Scalars['BigDecimal'];
  periodStartUnix: Scalars['Int'];
  priceUSD: Scalars['BigDecimal'];
  token: Token;
  totalValueLocked: Scalars['BigDecimal'];
  totalValueLockedUSD: Scalars['BigDecimal'];
  untrackedVolumeUSD: Scalars['BigDecimal'];
  volume: Scalars['BigDecimal'];
  volumeUSD: Scalars['BigDecimal'];
};

export type TokenHourData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  close?: Maybe<Scalars['BigDecimal']>;
  close_gt?: Maybe<Scalars['BigDecimal']>;
  close_gte?: Maybe<Scalars['BigDecimal']>;
  close_in?: Maybe<Array<Scalars['BigDecimal']>>;
  close_lt?: Maybe<Scalars['BigDecimal']>;
  close_lte?: Maybe<Scalars['BigDecimal']>;
  close_not?: Maybe<Scalars['BigDecimal']>;
  close_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  feesUSD?: Maybe<Scalars['BigDecimal']>;
  feesUSD_gt?: Maybe<Scalars['BigDecimal']>;
  feesUSD_gte?: Maybe<Scalars['BigDecimal']>;
  feesUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  feesUSD_lt?: Maybe<Scalars['BigDecimal']>;
  feesUSD_lte?: Maybe<Scalars['BigDecimal']>;
  feesUSD_not?: Maybe<Scalars['BigDecimal']>;
  feesUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  high?: Maybe<Scalars['BigDecimal']>;
  high_gt?: Maybe<Scalars['BigDecimal']>;
  high_gte?: Maybe<Scalars['BigDecimal']>;
  high_in?: Maybe<Array<Scalars['BigDecimal']>>;
  high_lt?: Maybe<Scalars['BigDecimal']>;
  high_lte?: Maybe<Scalars['BigDecimal']>;
  high_not?: Maybe<Scalars['BigDecimal']>;
  high_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  low?: Maybe<Scalars['BigDecimal']>;
  low_gt?: Maybe<Scalars['BigDecimal']>;
  low_gte?: Maybe<Scalars['BigDecimal']>;
  low_in?: Maybe<Array<Scalars['BigDecimal']>>;
  low_lt?: Maybe<Scalars['BigDecimal']>;
  low_lte?: Maybe<Scalars['BigDecimal']>;
  low_not?: Maybe<Scalars['BigDecimal']>;
  low_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  open?: Maybe<Scalars['BigDecimal']>;
  open_gt?: Maybe<Scalars['BigDecimal']>;
  open_gte?: Maybe<Scalars['BigDecimal']>;
  open_in?: Maybe<Array<Scalars['BigDecimal']>>;
  open_lt?: Maybe<Scalars['BigDecimal']>;
  open_lte?: Maybe<Scalars['BigDecimal']>;
  open_not?: Maybe<Scalars['BigDecimal']>;
  open_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  periodStartUnix?: Maybe<Scalars['Int']>;
  periodStartUnix_gt?: Maybe<Scalars['Int']>;
  periodStartUnix_gte?: Maybe<Scalars['Int']>;
  periodStartUnix_in?: Maybe<Array<Scalars['Int']>>;
  periodStartUnix_lt?: Maybe<Scalars['Int']>;
  periodStartUnix_lte?: Maybe<Scalars['Int']>;
  periodStartUnix_not?: Maybe<Scalars['Int']>;
  periodStartUnix_not_in?: Maybe<Array<Scalars['Int']>>;
  priceUSD?: Maybe<Scalars['BigDecimal']>;
  priceUSD_gt?: Maybe<Scalars['BigDecimal']>;
  priceUSD_gte?: Maybe<Scalars['BigDecimal']>;
  priceUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  priceUSD_lt?: Maybe<Scalars['BigDecimal']>;
  priceUSD_lte?: Maybe<Scalars['BigDecimal']>;
  priceUSD_not?: Maybe<Scalars['BigDecimal']>;
  priceUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  token?: Maybe<Scalars['String']>;
  token_?: Maybe<Token_Filter>;
  token_contains?: Maybe<Scalars['String']>;
  token_contains_nocase?: Maybe<Scalars['String']>;
  token_ends_with?: Maybe<Scalars['String']>;
  token_ends_with_nocase?: Maybe<Scalars['String']>;
  token_gt?: Maybe<Scalars['String']>;
  token_gte?: Maybe<Scalars['String']>;
  token_in?: Maybe<Array<Scalars['String']>>;
  token_lt?: Maybe<Scalars['String']>;
  token_lte?: Maybe<Scalars['String']>;
  token_not?: Maybe<Scalars['String']>;
  token_not_contains?: Maybe<Scalars['String']>;
  token_not_contains_nocase?: Maybe<Scalars['String']>;
  token_not_ends_with?: Maybe<Scalars['String']>;
  token_not_ends_with_nocase?: Maybe<Scalars['String']>;
  token_not_in?: Maybe<Array<Scalars['String']>>;
  token_not_starts_with?: Maybe<Scalars['String']>;
  token_not_starts_with_nocase?: Maybe<Scalars['String']>;
  token_starts_with?: Maybe<Scalars['String']>;
  token_starts_with_nocase?: Maybe<Scalars['String']>;
  totalValueLocked?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_gt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_gte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedUSD_lt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_lte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_not?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLocked_gt?: Maybe<Scalars['BigDecimal']>;
  totalValueLocked_gte?: Maybe<Scalars['BigDecimal']>;
  totalValueLocked_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLocked_lt?: Maybe<Scalars['BigDecimal']>;
  totalValueLocked_lte?: Maybe<Scalars['BigDecimal']>;
  totalValueLocked_not?: Maybe<Scalars['BigDecimal']>;
  totalValueLocked_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  untrackedVolumeUSD?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_gt?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_gte?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  untrackedVolumeUSD_lt?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_lte?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_not?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volume?: Maybe<Scalars['BigDecimal']>;
  volumeUSD?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_gt?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_gte?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeUSD_lt?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_lte?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_not?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volume_gt?: Maybe<Scalars['BigDecimal']>;
  volume_gte?: Maybe<Scalars['BigDecimal']>;
  volume_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volume_lt?: Maybe<Scalars['BigDecimal']>;
  volume_lte?: Maybe<Scalars['BigDecimal']>;
  volume_not?: Maybe<Scalars['BigDecimal']>;
  volume_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
};

export enum TokenHourData_OrderBy {
  Close = 'close',
  FeesUsd = 'feesUSD',
  High = 'high',
  Id = 'id',
  Low = 'low',
  Open = 'open',
  PeriodStartUnix = 'periodStartUnix',
  PriceUsd = 'priceUSD',
  Token = 'token',
  TotalValueLocked = 'totalValueLocked',
  TotalValueLockedUsd = 'totalValueLockedUSD',
  UntrackedVolumeUsd = 'untrackedVolumeUSD',
  Volume = 'volume',
  VolumeUsd = 'volumeUSD',
}

export type Token_Filter = {
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  decimals?: Maybe<Scalars['BigInt']>;
  decimals_gt?: Maybe<Scalars['BigInt']>;
  decimals_gte?: Maybe<Scalars['BigInt']>;
  decimals_in?: Maybe<Array<Scalars['BigInt']>>;
  decimals_lt?: Maybe<Scalars['BigInt']>;
  decimals_lte?: Maybe<Scalars['BigInt']>;
  decimals_not?: Maybe<Scalars['BigInt']>;
  decimals_not_in?: Maybe<Array<Scalars['BigInt']>>;
  derivedMatic?: Maybe<Scalars['BigDecimal']>;
  derivedMatic_gt?: Maybe<Scalars['BigDecimal']>;
  derivedMatic_gte?: Maybe<Scalars['BigDecimal']>;
  derivedMatic_in?: Maybe<Array<Scalars['BigDecimal']>>;
  derivedMatic_lt?: Maybe<Scalars['BigDecimal']>;
  derivedMatic_lte?: Maybe<Scalars['BigDecimal']>;
  derivedMatic_not?: Maybe<Scalars['BigDecimal']>;
  derivedMatic_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  feesUSD?: Maybe<Scalars['BigDecimal']>;
  feesUSD_gt?: Maybe<Scalars['BigDecimal']>;
  feesUSD_gte?: Maybe<Scalars['BigDecimal']>;
  feesUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  feesUSD_lt?: Maybe<Scalars['BigDecimal']>;
  feesUSD_lte?: Maybe<Scalars['BigDecimal']>;
  feesUSD_not?: Maybe<Scalars['BigDecimal']>;
  feesUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  name?: Maybe<Scalars['String']>;
  name_contains?: Maybe<Scalars['String']>;
  name_contains_nocase?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_ends_with_nocase?: Maybe<Scalars['String']>;
  name_gt?: Maybe<Scalars['String']>;
  name_gte?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Scalars['String']>>;
  name_lt?: Maybe<Scalars['String']>;
  name_lte?: Maybe<Scalars['String']>;
  name_not?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_not_contains_nocase?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  name_not_ends_with_nocase?: Maybe<Scalars['String']>;
  name_not_in?: Maybe<Array<Scalars['String']>>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_not_starts_with_nocase?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  name_starts_with_nocase?: Maybe<Scalars['String']>;
  poolCount?: Maybe<Scalars['BigInt']>;
  poolCount_gt?: Maybe<Scalars['BigInt']>;
  poolCount_gte?: Maybe<Scalars['BigInt']>;
  poolCount_in?: Maybe<Array<Scalars['BigInt']>>;
  poolCount_lt?: Maybe<Scalars['BigInt']>;
  poolCount_lte?: Maybe<Scalars['BigInt']>;
  poolCount_not?: Maybe<Scalars['BigInt']>;
  poolCount_not_in?: Maybe<Array<Scalars['BigInt']>>;
  symbol?: Maybe<Scalars['String']>;
  symbol_contains?: Maybe<Scalars['String']>;
  symbol_contains_nocase?: Maybe<Scalars['String']>;
  symbol_ends_with?: Maybe<Scalars['String']>;
  symbol_ends_with_nocase?: Maybe<Scalars['String']>;
  symbol_gt?: Maybe<Scalars['String']>;
  symbol_gte?: Maybe<Scalars['String']>;
  symbol_in?: Maybe<Array<Scalars['String']>>;
  symbol_lt?: Maybe<Scalars['String']>;
  symbol_lte?: Maybe<Scalars['String']>;
  symbol_not?: Maybe<Scalars['String']>;
  symbol_not_contains?: Maybe<Scalars['String']>;
  symbol_not_contains_nocase?: Maybe<Scalars['String']>;
  symbol_not_ends_with?: Maybe<Scalars['String']>;
  symbol_not_ends_with_nocase?: Maybe<Scalars['String']>;
  symbol_not_in?: Maybe<Array<Scalars['String']>>;
  symbol_not_starts_with?: Maybe<Scalars['String']>;
  symbol_not_starts_with_nocase?: Maybe<Scalars['String']>;
  symbol_starts_with?: Maybe<Scalars['String']>;
  symbol_starts_with_nocase?: Maybe<Scalars['String']>;
  tokenDayData_?: Maybe<TokenDayData_Filter>;
  totalSupply?: Maybe<Scalars['BigInt']>;
  totalSupply_gt?: Maybe<Scalars['BigInt']>;
  totalSupply_gte?: Maybe<Scalars['BigInt']>;
  totalSupply_in?: Maybe<Array<Scalars['BigInt']>>;
  totalSupply_lt?: Maybe<Scalars['BigInt']>;
  totalSupply_lte?: Maybe<Scalars['BigInt']>;
  totalSupply_not?: Maybe<Scalars['BigInt']>;
  totalSupply_not_in?: Maybe<Array<Scalars['BigInt']>>;
  totalValueLocked?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSDUntracked?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSDUntracked_gt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSDUntracked_gte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSDUntracked_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedUSDUntracked_lt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSDUntracked_lte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSDUntracked_not?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSDUntracked_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedUSD_gt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_gte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLockedUSD_lt?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_lte?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_not?: Maybe<Scalars['BigDecimal']>;
  totalValueLockedUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLocked_gt?: Maybe<Scalars['BigDecimal']>;
  totalValueLocked_gte?: Maybe<Scalars['BigDecimal']>;
  totalValueLocked_in?: Maybe<Array<Scalars['BigDecimal']>>;
  totalValueLocked_lt?: Maybe<Scalars['BigDecimal']>;
  totalValueLocked_lte?: Maybe<Scalars['BigDecimal']>;
  totalValueLocked_not?: Maybe<Scalars['BigDecimal']>;
  totalValueLocked_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  txCount?: Maybe<Scalars['BigInt']>;
  txCount_gt?: Maybe<Scalars['BigInt']>;
  txCount_gte?: Maybe<Scalars['BigInt']>;
  txCount_in?: Maybe<Array<Scalars['BigInt']>>;
  txCount_lt?: Maybe<Scalars['BigInt']>;
  txCount_lte?: Maybe<Scalars['BigInt']>;
  txCount_not?: Maybe<Scalars['BigInt']>;
  txCount_not_in?: Maybe<Array<Scalars['BigInt']>>;
  untrackedVolumeUSD?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_gt?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_gte?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  untrackedVolumeUSD_lt?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_lte?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_not?: Maybe<Scalars['BigDecimal']>;
  untrackedVolumeUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volume?: Maybe<Scalars['BigDecimal']>;
  volumeUSD?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_gt?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_gte?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volumeUSD_lt?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_lte?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_not?: Maybe<Scalars['BigDecimal']>;
  volumeUSD_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volume_gt?: Maybe<Scalars['BigDecimal']>;
  volume_gte?: Maybe<Scalars['BigDecimal']>;
  volume_in?: Maybe<Array<Scalars['BigDecimal']>>;
  volume_lt?: Maybe<Scalars['BigDecimal']>;
  volume_lte?: Maybe<Scalars['BigDecimal']>;
  volume_not?: Maybe<Scalars['BigDecimal']>;
  volume_not_in?: Maybe<Array<Scalars['BigDecimal']>>;
  whitelistPools?: Maybe<Array<Scalars['String']>>;
  whitelistPools_?: Maybe<Pool_Filter>;
  whitelistPools_contains?: Maybe<Array<Scalars['String']>>;
  whitelistPools_contains_nocase?: Maybe<Array<Scalars['String']>>;
  whitelistPools_not?: Maybe<Array<Scalars['String']>>;
  whitelistPools_not_contains?: Maybe<Array<Scalars['String']>>;
  whitelistPools_not_contains_nocase?: Maybe<Array<Scalars['String']>>;
};

export enum Token_OrderBy {
  Decimals = 'decimals',
  DerivedMatic = 'derivedMatic',
  FeesUsd = 'feesUSD',
  Id = 'id',
  Name = 'name',
  PoolCount = 'poolCount',
  Symbol = 'symbol',
  TokenDayData = 'tokenDayData',
  TotalSupply = 'totalSupply',
  TotalValueLocked = 'totalValueLocked',
  TotalValueLockedUsd = 'totalValueLockedUSD',
  TotalValueLockedUsdUntracked = 'totalValueLockedUSDUntracked',
  TxCount = 'txCount',
  UntrackedVolumeUsd = 'untrackedVolumeUSD',
  Volume = 'volume',
  VolumeUsd = 'volumeUSD',
  WhitelistPools = 'whitelistPools',
}

export type Transaction = {
  __typename?: 'Transaction';
  blockNumber: Scalars['BigInt'];
  burns: Array<Burn>;
  collects: Array<Collect>;
  flashed: Array<Flash>;
  gasLimit: Scalars['BigInt'];
  gasPrice: Scalars['BigInt'];
  id: Scalars['ID'];
  mints: Array<Mint>;
  swaps: Array<Swap>;
  timestamp: Scalars['BigInt'];
};

export type TransactionBurnsArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Burn_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  where?: Maybe<Burn_Filter>;
};

export type TransactionCollectsArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Collect_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  where?: Maybe<Collect_Filter>;
};

export type TransactionFlashedArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Flash_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  where?: Maybe<Flash_Filter>;
};

export type TransactionMintsArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Mint_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  where?: Maybe<Mint_Filter>;
};

export type TransactionSwapsArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Swap_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  where?: Maybe<Swap_Filter>;
};

export type Transaction_Filter = {
  /** Filter for the block changed event. */
  _change_block?: Maybe<BlockChangedFilter>;
  blockNumber?: Maybe<Scalars['BigInt']>;
  blockNumber_gt?: Maybe<Scalars['BigInt']>;
  blockNumber_gte?: Maybe<Scalars['BigInt']>;
  blockNumber_in?: Maybe<Array<Scalars['BigInt']>>;
  blockNumber_lt?: Maybe<Scalars['BigInt']>;
  blockNumber_lte?: Maybe<Scalars['BigInt']>;
  blockNumber_not?: Maybe<Scalars['BigInt']>;
  blockNumber_not_in?: Maybe<Array<Scalars['BigInt']>>;
  burns_?: Maybe<Burn_Filter>;
  collects_?: Maybe<Collect_Filter>;
  flashed_?: Maybe<Flash_Filter>;
  gasLimit?: Maybe<Scalars['BigInt']>;
  gasLimit_gt?: Maybe<Scalars['BigInt']>;
  gasLimit_gte?: Maybe<Scalars['BigInt']>;
  gasLimit_in?: Maybe<Array<Scalars['BigInt']>>;
  gasLimit_lt?: Maybe<Scalars['BigInt']>;
  gasLimit_lte?: Maybe<Scalars['BigInt']>;
  gasLimit_not?: Maybe<Scalars['BigInt']>;
  gasLimit_not_in?: Maybe<Array<Scalars['BigInt']>>;
  gasPrice?: Maybe<Scalars['BigInt']>;
  gasPrice_gt?: Maybe<Scalars['BigInt']>;
  gasPrice_gte?: Maybe<Scalars['BigInt']>;
  gasPrice_in?: Maybe<Array<Scalars['BigInt']>>;
  gasPrice_lt?: Maybe<Scalars['BigInt']>;
  gasPrice_lte?: Maybe<Scalars['BigInt']>;
  gasPrice_not?: Maybe<Scalars['BigInt']>;
  gasPrice_not_in?: Maybe<Array<Scalars['BigInt']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  mints_?: Maybe<Mint_Filter>;
  swaps_?: Maybe<Swap_Filter>;
  timestamp?: Maybe<Scalars['BigInt']>;
  timestamp_gt?: Maybe<Scalars['BigInt']>;
  timestamp_gte?: Maybe<Scalars['BigInt']>;
  timestamp_in?: Maybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: Maybe<Scalars['BigInt']>;
  timestamp_lte?: Maybe<Scalars['BigInt']>;
  timestamp_not?: Maybe<Scalars['BigInt']>;
  timestamp_not_in?: Maybe<Array<Scalars['BigInt']>>;
};

export enum Transaction_OrderBy {
  BlockNumber = 'blockNumber',
  Burns = 'burns',
  Collects = 'collects',
  Flashed = 'flashed',
  GasLimit = 'gasLimit',
  GasPrice = 'gasPrice',
  Id = 'id',
  Mints = 'mints',
  Swaps = 'swaps',
  Timestamp = 'timestamp',
}

export type _Block_ = {
  __typename?: '_Block_';
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']>;
  /** The block number */
  number: Scalars['Int'];
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  __typename?: '_Meta_';
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean'];
};

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  Allow = 'allow',
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  Deny = 'deny',
}

export type PricesQueryVariables = Exact<{
  block24: Scalars['Int'];
  block48: Scalars['Int'];
  blockWeek: Scalars['Int'];
}>;

export type PricesQuery = { __typename?: 'Query' } & {
  current: Array<{ __typename?: 'Bundle' } & Pick<Bundle, 'maticPriceUSD'>>;
  oneDay: Array<{ __typename?: 'Bundle' } & Pick<Bundle, 'maticPriceUSD'>>;
  twoDay: Array<{ __typename?: 'Bundle' } & Pick<Bundle, 'maticPriceUSD'>>;
  oneWeek: Array<{ __typename?: 'Bundle' } & Pick<Bundle, 'maticPriceUSD'>>;
};

export type AllV3TicksQueryVariables = Exact<{
  poolAddress: Scalars['String'];
  skip: Scalars['Int'];
}>;

export type AllV3TicksQuery = { __typename?: 'Query' } & {
  ticks: Array<
    { __typename?: 'Tick' } & Pick<
      Tick,
      'tickIdx' | 'liquidityNet' | 'price0' | 'price1'
    >
  >;
};

export type FeeTierDistributionQueryVariables = Exact<{
  token0: Scalars['String'];
  token1: Scalars['String'];
}>;

export type FeeTierDistributionQuery = { __typename?: 'Query' } & {
  _meta?: Maybe<
    { __typename?: '_Meta_' } & {
      block: { __typename?: '_Block_' } & Pick<_Block_, 'number'>;
    }
  >;
  asToken0: Array<
    { __typename?: 'Pool' } & Pick<
      Pool,
      'fee' | 'totalValueLockedToken0' | 'totalValueLockedToken1'
    >
  >;
  asToken1: Array<
    { __typename?: 'Pool' } & Pick<
      Pool,
      'fee' | 'totalValueLockedToken0' | 'totalValueLockedToken1'
    >
  >;
};

export type LimitFarmQueryVariables = Exact<{
  time?: Maybe<Scalars['BigInt']>;
}>;

export type LimitFarmQuery = { __typename?: 'Query' } & {
  limitFarmings: Array<
    { __typename?: 'LimitFarming' } & Pick<
      LimitFarming,
      'startTime' | 'endTime'
    >
  >;
};

export type EternalFarmQueryVariables = Exact<{ [key: string]: never }>;

export type EternalFarmQuery = { __typename?: 'Query' } & {
  eternalFarmings: Array<
    { __typename?: 'EternalFarming' } & Pick<
      EternalFarming,
      'startTime' | 'endTime'
    >
  >;
};

export type FetchRewardsQueryVariables = Exact<{
  account?: Maybe<Scalars['Bytes']>;
}>;

export type FetchRewardsQuery = { __typename?: 'Query' } & {
  rewards: Array<
    { __typename?: 'Reward' } & Pick<
      Reward,
      'id' | 'rewardAddress' | 'amount' | 'owner'
    >
  >;
};

export type FetchTokenQueryVariables = Exact<{
  tokenId?: Maybe<Scalars['ID']>;
}>;

export type FetchTokenQuery = { __typename?: 'Query' } & {
  tokens: Array<
    { __typename?: 'Token' } & Pick<
      Token,
      'id' | 'symbol' | 'name' | 'decimals'
    >
  >;
};

export type FetchLimitQueryVariables = Exact<{
  limitFarmingId?: Maybe<Scalars['ID']>;
}>;

export type FetchLimitQuery = { __typename?: 'Query' } & {
  limitFarmings: Array<
    { __typename?: 'LimitFarming' } & Pick<
      LimitFarming,
      | 'id'
      | 'rewardToken'
      | 'bonusRewardToken'
      | 'pool'
      | 'startTime'
      | 'endTime'
      | 'reward'
      | 'bonusReward'
      | 'multiplierToken'
      | 'createdAtTimestamp'
      | 'tier1Multiplier'
      | 'tier2Multiplier'
      | 'tier3Multiplier'
      | 'tokenAmountForTier1'
      | 'tokenAmountForTier2'
      | 'tokenAmountForTier3'
      | 'enterStartTime'
      | 'isDetached'
      | 'minRangeLength'
    >
  >;
};

export type FetchEternalFarmQueryVariables = Exact<{
  farmId?: Maybe<Scalars['ID']>;
}>;

export type FetchEternalFarmQuery = { __typename?: 'Query' } & {
  eternalFarmings: Array<
    { __typename?: 'EternalFarming' } & Pick<
      EternalFarming,
      | 'id'
      | 'rewardToken'
      | 'bonusRewardToken'
      | 'pool'
      | 'startTime'
      | 'endTime'
      | 'reward'
      | 'bonusReward'
      | 'rewardRate'
      | 'bonusRewardRate'
      | 'isDetached'
      | 'tier1Multiplier'
      | 'tier2Multiplier'
      | 'tier3Multiplier'
      | 'tokenAmountForTier1'
      | 'tokenAmountForTier2'
      | 'tokenAmountForTier3'
      | 'multiplierToken'
      | 'minRangeLength'
    >
  >;
};

export type FetchPoolQueryVariables = Exact<{
  poolId?: Maybe<Scalars['ID']>;
}>;

export type FetchPoolQuery = { __typename?: 'Query' } & {
  pools: Array<
    { __typename?: 'Pool' } & Pick<
      Pool,
      | 'id'
      | 'fee'
      | 'sqrtPrice'
      | 'liquidity'
      | 'tick'
      | 'feesUSD'
      | 'untrackedFeesUSD'
    > & {
        token0: { __typename?: 'Token' } & Pick<
          Token,
          'id' | 'decimals' | 'symbol'
        >;
        token1: { __typename?: 'Token' } & Pick<
          Token,
          'id' | 'decimals' | 'symbol'
        >;
      }
  >;
};

export type FeeHourDataQueryVariables = Exact<{
  pool?: Maybe<Scalars['String']>;
  startTimestamp?: Maybe<Scalars['BigInt']>;
  endTimestamp?: Maybe<Scalars['BigInt']>;
}>;

export type FeeHourDataQuery = { __typename?: 'Query' } & {
  feeHourDatas: Array<
    { __typename?: 'FeeHourData' } & Pick<
      FeeHourData,
      | 'id'
      | 'pool'
      | 'fee'
      | 'changesCount'
      | 'timestamp'
      | 'minFee'
      | 'maxFee'
      | 'startFee'
      | 'endFee'
    >
  >;
};

export type LastFeeHourDataQueryVariables = Exact<{
  pool?: Maybe<Scalars['String']>;
}>;

export type LastFeeHourDataQuery = { __typename?: 'Query' } & {
  feeHourDatas: Array<
    { __typename?: 'FeeHourData' } & Pick<
      FeeHourData,
      | 'id'
      | 'pool'
      | 'fee'
      | 'changesCount'
      | 'timestamp'
      | 'minFee'
      | 'maxFee'
      | 'startFee'
      | 'endFee'
    >
  >;
};

export type LastNotEmptyHourDataQueryVariables = Exact<{
  pool?: Maybe<Scalars['String']>;
  timestamp?: Maybe<Scalars['BigInt']>;
}>;

export type LastNotEmptyHourDataQuery = { __typename?: 'Query' } & {
  feeHourDatas: Array<
    { __typename?: 'FeeHourData' } & Pick<
      FeeHourData,
      | 'id'
      | 'pool'
      | 'fee'
      | 'changesCount'
      | 'timestamp'
      | 'minFee'
      | 'maxFee'
      | 'startFee'
      | 'endFee'
    >
  >;
};

export type LastNotEmptyPoolHourDataQueryVariables = Exact<{
  pool?: Maybe<Scalars['String']>;
  timestamp?: Maybe<Scalars['Int']>;
}>;

export type LastNotEmptyPoolHourDataQuery = { __typename?: 'Query' } & {
  poolHourDatas: Array<
    { __typename?: 'PoolHourData' } & Pick<
      PoolHourData,
      | 'periodStartUnix'
      | 'volumeUSD'
      | 'tvlUSD'
      | 'feesUSD'
      | 'untrackedVolumeUSD'
      | 'token1Price'
      | 'token0Price'
    >
  >;
};

export type LastPoolHourDataQueryVariables = Exact<{
  pool?: Maybe<Scalars['String']>;
}>;

export type LastPoolHourDataQuery = { __typename?: 'Query' } & {
  poolHourDatas: Array<
    { __typename?: 'PoolHourData' } & Pick<
      PoolHourData,
      | 'periodStartUnix'
      | 'volumeUSD'
      | 'tvlUSD'
      | 'feesUSD'
      | 'untrackedVolumeUSD'
    >
  >;
};

export type PoolHourDataQueryVariables = Exact<{
  pool?: Maybe<Scalars['String']>;
  startTimestamp?: Maybe<Scalars['Int']>;
  endTimestamp?: Maybe<Scalars['Int']>;
}>;

export type PoolHourDataQuery = { __typename?: 'Query' } & {
  poolHourDatas: Array<
    { __typename?: 'PoolHourData' } & Pick<
      PoolHourData,
      | 'periodStartUnix'
      | 'volumeUSD'
      | 'tvlUSD'
      | 'feesUSD'
      | 'untrackedVolumeUSD'
      | 'token0Price'
      | 'token1Price'
    >
  >;
};

export type LastEventQueryVariables = Exact<{ [key: string]: never }>;

export type LastEventQuery = { __typename?: 'Query' } & {
  limitFarmings: Array<
    { __typename?: 'LimitFarming' } & Pick<
      LimitFarming,
      'createdAtTimestamp' | 'id' | 'startTime' | 'endTime'
    >
  >;
};

export type FutureEventsQueryVariables = Exact<{
  timestamp?: Maybe<Scalars['BigInt']>;
}>;

export type FutureEventsQuery = { __typename?: 'Query' } & {
  limitFarmings: Array<
    { __typename?: 'LimitFarming' } & Pick<
      LimitFarming,
      | 'id'
      | 'createdAtTimestamp'
      | 'rewardToken'
      | 'bonusReward'
      | 'bonusRewardToken'
      | 'pool'
      | 'startTime'
      | 'endTime'
      | 'reward'
      | 'tier1Multiplier'
      | 'tier2Multiplier'
      | 'tier3Multiplier'
      | 'tokenAmountForTier1'
      | 'tokenAmountForTier2'
      | 'tokenAmountForTier3'
      | 'multiplierToken'
      | 'enterStartTime'
      | 'isDetached'
      | 'minRangeLength'
    >
  >;
};

export type CurrentEventsQueryVariables = Exact<{
  startTime?: Maybe<Scalars['BigInt']>;
  endTime?: Maybe<Scalars['BigInt']>;
}>;

export type CurrentEventsQuery = { __typename?: 'Query' } & {
  limitFarmings: Array<
    { __typename?: 'LimitFarming' } & Pick<
      LimitFarming,
      | 'id'
      | 'rewardToken'
      | 'bonusReward'
      | 'bonusRewardToken'
      | 'pool'
      | 'startTime'
      | 'endTime'
      | 'reward'
      | 'tier1Multiplier'
      | 'tier2Multiplier'
      | 'tier3Multiplier'
      | 'tokenAmountForTier1'
      | 'tokenAmountForTier2'
      | 'tokenAmountForTier3'
      | 'enterStartTime'
      | 'multiplierToken'
      | 'isDetached'
      | 'minRangeLength'
    >
  >;
};

export type FrozenStakedQueryVariables = Exact<{
  account?: Maybe<Scalars['String']>;
  timestamp?: Maybe<Scalars['Int']>;
}>;

export type FrozenStakedQuery = { __typename?: 'Query' } & {
  stakeTxes: Array<
    { __typename?: 'StakeTx' } & Pick<
      StakeTx,
      'timestamp' | 'stakedALGBAmount' | 'xALGBAmount'
    >
  >;
};

export type TransferedPositionsQueryVariables = Exact<{
  account?: Maybe<Scalars['Bytes']>;
}>;

export type TransferedPositionsQuery = { __typename?: 'Query' } & {
  deposits: Array<
    { __typename?: 'Deposit' } & Pick<
      Deposit,
      | 'id'
      | 'owner'
      | 'pool'
      | 'L2tokenId'
      | 'limitFarming'
      | 'eternalFarming'
      | 'onFarmingCenter'
      | 'rangeLength'
    >
  >;
};

export type HasTransferedPositionsQueryVariables = Exact<{
  account?: Maybe<Scalars['Bytes']>;
}>;

export type HasTransferedPositionsQuery = { __typename?: 'Query' } & {
  deposits: Array<{ __typename?: 'Deposit' } & Pick<Deposit, 'id'>>;
};

export type PositionsOnEternalFarmingQueryVariables = Exact<{
  account?: Maybe<Scalars['Bytes']>;
}>;

export type PositionsOnEternalFarmingQuery = { __typename?: 'Query' } & {
  deposits: Array<
    { __typename?: 'Deposit' } & Pick<
      Deposit,
      | 'id'
      | 'owner'
      | 'pool'
      | 'L2tokenId'
      | 'eternalFarming'
      | 'onFarmingCenter'
      | 'enteredInEternalFarming'
    >
  >;
};

export type TransferedPositionsForPoolQueryVariables = Exact<{
  account?: Maybe<Scalars['Bytes']>;
  pool?: Maybe<Scalars['Bytes']>;
  minRangeLength?: Maybe<Scalars['BigInt']>;
}>;

export type TransferedPositionsForPoolQuery = { __typename?: 'Query' } & {
  deposits: Array<
    { __typename?: 'Deposit' } & Pick<
      Deposit,
      | 'id'
      | 'owner'
      | 'pool'
      | 'L2tokenId'
      | 'limitFarming'
      | 'eternalFarming'
      | 'onFarmingCenter'
      | 'enteredInEternalFarming'
      | 'tokensLockedLimit'
      | 'tokensLockedEternal'
      | 'tierLimit'
      | 'tierEternal'
    >
  >;
};

export type PositionsOnFarmingQueryVariables = Exact<{
  account?: Maybe<Scalars['Bytes']>;
  pool?: Maybe<Scalars['Bytes']>;
}>;

export type PositionsOnFarmingQuery = { __typename?: 'Query' } & {
  deposits: Array<{ __typename?: 'Deposit' } & Pick<Deposit, 'id'>>;
};

export type InfiniteFarmsQueryVariables = Exact<{ [key: string]: never }>;

export type InfiniteFarmsQuery = { __typename?: 'Query' } & {
  eternalFarmings: Array<
    { __typename?: 'EternalFarming' } & Pick<
      EternalFarming,
      | 'id'
      | 'rewardToken'
      | 'bonusRewardToken'
      | 'pool'
      | 'startTime'
      | 'endTime'
      | 'reward'
      | 'bonusReward'
      | 'rewardRate'
      | 'bonusRewardRate'
      | 'tokenAmountForTier1'
      | 'tokenAmountForTier2'
      | 'tokenAmountForTier3'
      | 'tier1Multiplier'
      | 'tier2Multiplier'
      | 'tier3Multiplier'
      | 'multiplierToken'
      | 'minRangeLength'
    >
  >;
};

export type TopPoolsQueryVariables = Exact<{ [key: string]: never }>;

export type TopPoolsQuery = { __typename?: 'Query' } & {
  pools: Array<{ __typename?: 'Pool' } & Pick<Pool, 'id'>>;
};

export type TopTokensQueryVariables = Exact<{ [key: string]: never }>;

export type TopTokensQuery = { __typename?: 'Query' } & {
  tokens: Array<{ __typename?: 'Token' } & Pick<Token, 'id'>>;
};

export type StakeHistoryQueryVariables = Exact<{
  id?: Maybe<Scalars['ID']>;
}>;

export type StakeHistoryQuery = { __typename?: 'Query' } & {
  factories: Array<
    { __typename?: 'Factory' } & Pick<
      Factory,
      | 'currentStakedAmount'
      | 'earnedForAllTime'
      | 'ALGBbalance'
      | 'xALGBtotalSupply'
    >
  >;
  stakes: Array<
    { __typename?: 'Stake' } & Pick<Stake, 'stakedALGBAmount' | 'xALGBAmount'>
  >;
};

export type StakeQueryVariables = Exact<{ [key: string]: never }>;

export type StakeQuery = { __typename?: 'Query' } & {
  histories: Array<
    { __typename?: 'History' } & Pick<
      History,
      | 'date'
      | 'currentStakedAmount'
      | 'ALGBbalance'
      | 'xALGBminted'
      | 'xALGBburned'
      | 'xALGBtotalSupply'
      | 'ALGBfromVault'
    >
  >;
};

export type SurroundingTicksQueryVariables = Exact<{
  poolAddress: Scalars['String'];
  tickIdxLowerBound: Scalars['BigInt'];
  tickIdxUpperBound: Scalars['BigInt'];
  skip: Scalars['Int'];
}>;

export type SurroundingTicksQuery = { __typename?: 'Query' } & {
  ticks: Array<
    { __typename?: 'Tick' } & Pick<
      Tick,
      'tickIdx' | 'liquidityGross' | 'liquidityNet' | 'price0' | 'price1'
    >
  >;
};

export type PopularPoolsQueryVariables = Exact<{ [key: string]: never }>;

export type PopularPoolsQuery = { __typename?: 'Query' } & {
  pools: Array<
    { __typename?: 'Pool' } & {
      token0: { __typename?: 'Token' } & Pick<Token, 'id'>;
      token1: { __typename?: 'Token' } & Pick<Token, 'id'>;
    }
  >;
};

export const PricesDocument = `
    query prices($block24: Int!, $block48: Int!, $blockWeek: Int!) {
  current: bundles(first: 1, subgraphError: allow) {
    maticPriceUSD
  }
  oneDay: bundles(first: 1, block: {number: $block24}, subgraphError: allow) {
    maticPriceUSD
  }
  twoDay: bundles(first: 1, block: {number: $block48}, subgraphError: allow) {
    maticPriceUSD
  }
  oneWeek: bundles(first: 1, block: {number: $blockWeek}, subgraphError: allow) {
    maticPriceUSD
  }
}
    `;
export const AllV3TicksDocument = `
    query allV3Ticks($poolAddress: String!, $skip: Int!) {
  ticks(
    first: 1000
    skip: $skip
    where: {poolAddress: $poolAddress}
    orderBy: tickIdx
  ) {
    tickIdx
    liquidityNet
    price0
    price1
  }
}
    `;
export const FeeTierDistributionDocument = `
    query feeTierDistribution($token0: String!, $token1: String!) {
  _meta {
    block {
      number
    }
  }
  asToken0: pools(
    orderBy: totalValueLockedToken0
    orderDirection: desc
    where: {token0: $token0, token1: $token1}
  ) {
    fee
    totalValueLockedToken0
    totalValueLockedToken1
  }
  asToken1: pools(
    orderBy: totalValueLockedToken0
    orderDirection: desc
    where: {token0: $token1, token1: $token0}
  ) {
    fee
    totalValueLockedToken0
    totalValueLockedToken1
  }
}
    `;
export const LimitFarmDocument = `
    query limitFarm($time: BigInt) {
  limitFarmings(
    orderBy: createdAtTimestamp
    orderDirection: desc
    first: 1
    where: {startTime_gt: $time, isDetached: false}
  ) {
    startTime
    endTime
  }
}
    `;
export const EternalFarmDocument = `
    query eternalFarm {
  eternalFarmings(where: {isDetached: false}, first: 1) {
    startTime
    endTime
  }
}
    `;
export const FetchRewardsDocument = `
    query fetchRewards($account: Bytes) {
  rewards(orderBy: amount, orderDirection: desc, where: {owner: $account}) {
    id
    rewardAddress
    amount
    owner
  }
}
    `;
export const FetchTokenDocument = `
    query fetchToken($tokenId: ID) {
  tokens(where: {id: $tokenId}) {
    id
    symbol
    name
    decimals
  }
}
    `;
export const FetchLimitDocument = `
    query fetchLimit($limitFarmingId: ID) {
  limitFarmings(where: {id: $limitFarmingId}) {
    id
    rewardToken
    bonusRewardToken
    pool
    startTime
    endTime
    reward
    bonusReward
    multiplierToken
    createdAtTimestamp
    tier1Multiplier
    tier2Multiplier
    tier3Multiplier
    tokenAmountForTier1
    tokenAmountForTier2
    tokenAmountForTier3
    enterStartTime
    isDetached
    minRangeLength
  }
}
    `;
export const FetchEternalFarmDocument = `
    query fetchEternalFarm($farmId: ID) {
  eternalFarmings(where: {id: $farmId}) {
    id
    rewardToken
    bonusRewardToken
    pool
    startTime
    endTime
    reward
    bonusReward
    rewardRate
    bonusRewardRate
    isDetached
    tier1Multiplier
    tier2Multiplier
    tier3Multiplier
    tokenAmountForTier1
    tokenAmountForTier2
    tokenAmountForTier3
    multiplierToken
    minRangeLength
  }
}
    `;
export const FetchPoolDocument = `
    query fetchPool($poolId: ID) {
  pools(where: {id: $poolId}) {
    id
    fee
    token0 {
      id
      decimals
      symbol
    }
    token1 {
      id
      decimals
      symbol
    }
    sqrtPrice
    liquidity
    tick
    feesUSD
    untrackedFeesUSD
  }
}
    `;
export const FeeHourDataDocument = `
    query feeHourData($pool: String, $startTimestamp: BigInt, $endTimestamp: BigInt) {
  feeHourDatas(
    first: 1000
    where: {pool: $pool, timestamp_gte: $startTimestamp, timestamp_lte: $endTimestamp}
  ) {
    id
    pool
    fee
    changesCount
    timestamp
    minFee
    maxFee
    startFee
    endFee
  }
}
    `;
export const LastFeeHourDataDocument = `
    query lastFeeHourData($pool: String) {
  feeHourDatas(
    first: 1
    orderBy: timestamp
    orderDirection: desc
    where: {pool: $pool}
  ) {
    id
    pool
    fee
    changesCount
    timestamp
    minFee
    maxFee
    startFee
    endFee
  }
}
    `;
export const LastNotEmptyHourDataDocument = `
    query lastNotEmptyHourData($pool: String, $timestamp: BigInt) {
  feeHourDatas(
    first: 1
    orderBy: timestamp
    orderDirection: desc
    where: {pool: $pool, timestamp_lt: $timestamp}
  ) {
    id
    pool
    fee
    changesCount
    timestamp
    minFee
    maxFee
    startFee
    endFee
  }
}
    `;
export const LastNotEmptyPoolHourDataDocument = `
    query lastNotEmptyPoolHourData($pool: String, $timestamp: Int) {
  poolHourDatas(
    first: 1
    orderBy: periodStartUnix
    orderDirection: desc
    where: {pool: $pool, periodStartUnix_lt: $timestamp}
  ) {
    periodStartUnix
    volumeUSD
    tvlUSD
    feesUSD
    untrackedVolumeUSD
    token1Price
    token0Price
  }
}
    `;
export const LastPoolHourDataDocument = `
    query lastPoolHourData($pool: String) {
  poolHourDatas(
    first: 1
    where: {pool: $pool}
    orderBy: periodStartUnix
    orderDirection: desc
  ) {
    periodStartUnix
    volumeUSD
    tvlUSD
    feesUSD
    untrackedVolumeUSD
  }
}
    `;
export const PoolHourDataDocument = `
    query poolHourData($pool: String, $startTimestamp: Int, $endTimestamp: Int) {
  poolHourDatas(
    first: 1000
    where: {pool: $pool, periodStartUnix_gte: $startTimestamp, periodStartUnix_lte: $endTimestamp}
    orderBy: periodStartUnix
    orderDirection: asc
    subgraphError: allow
  ) {
    periodStartUnix
    volumeUSD
    tvlUSD
    feesUSD
    untrackedVolumeUSD
    token0Price
    token1Price
  }
}
    `;
export const LastEventDocument = `
    query lastEvent {
  limitFarmings(
    first: 1
    orderDirection: desc
    orderBy: createdAtTimestamp
    where: {isDetached: false}
  ) {
    createdAtTimestamp
    id
    startTime
    endTime
  }
}
    `;
export const FutureEventsDocument = `
    query futureEvents($timestamp: BigInt) {
  limitFarmings(
    orderBy: startTime
    orderDirection: asc
    where: {startTime_gt: $timestamp, isDetached: false}
  ) {
    id
    createdAtTimestamp
    rewardToken
    bonusReward
    bonusRewardToken
    pool
    startTime
    endTime
    reward
    tier1Multiplier
    tier2Multiplier
    tier3Multiplier
    tokenAmountForTier1
    tokenAmountForTier2
    tokenAmountForTier3
    multiplierToken
    enterStartTime
    isDetached
    minRangeLength
  }
}
    `;
export const CurrentEventsDocument = `
    query currentEvents($startTime: BigInt, $endTime: BigInt) {
  limitFarmings(
    orderBy: endTime
    orderDirection: desc
    where: {startTime_lte: $startTime, endTime_gt: $endTime, isDetached: false}
  ) {
    id
    rewardToken
    bonusReward
    bonusRewardToken
    pool
    startTime
    endTime
    reward
    tier1Multiplier
    tier2Multiplier
    tier3Multiplier
    tokenAmountForTier1
    tokenAmountForTier2
    tokenAmountForTier3
    enterStartTime
    multiplierToken
    isDetached
    minRangeLength
  }
}
    `;
export const FrozenStakedDocument = `
    query frozenStaked($account: String, $timestamp: Int) {
  stakeTxes(
    where: {owner: $account, timestamp_gte: $timestamp}
    orderBy: timestamp
    orderDirection: asc
  ) {
    timestamp
    stakedALGBAmount
    xALGBAmount
  }
}
    `;
export const TransferedPositionsDocument = `
    query transferedPositions($account: Bytes) {
  deposits(
    orderBy: id
    orderDirection: desc
    where: {owner: $account, onFarmingCenter: true}
  ) {
    id
    owner
    pool
    L2tokenId
    limitFarming
    eternalFarming
    onFarmingCenter
    rangeLength
  }
}
    `;
export const HasTransferedPositionsDocument = `
    query hasTransferedPositions($account: Bytes) {
  deposits(first: 1, where: {owner: $account, onFarmingCenter: true}) {
    id
  }
}
    `;
export const PositionsOnEternalFarmingDocument = `
    query positionsOnEternalFarming($account: Bytes) {
  deposits(
    orderBy: id
    orderDirection: desc
    where: {owner: $account, onFarmingCenter: true, eternalFarming_not: null}
  ) {
    id
    owner
    pool
    L2tokenId
    eternalFarming
    onFarmingCenter
    enteredInEternalFarming
  }
}
    `;
export const TransferedPositionsForPoolDocument = `
    query transferedPositionsForPool($account: Bytes, $pool: Bytes, $minRangeLength: BigInt) {
  deposits(
    orderBy: id
    orderDirection: desc
    where: {owner: $account, pool: $pool, liquidity_not: "0", rangeLength_gte: $minRangeLength}
  ) {
    id
    owner
    pool
    L2tokenId
    limitFarming
    eternalFarming
    onFarmingCenter
    enteredInEternalFarming
    tokensLockedLimit
    tokensLockedEternal
    tierLimit
    tierEternal
  }
}
    `;
export const PositionsOnFarmingDocument = `
    query positionsOnFarming($account: Bytes, $pool: Bytes) {
  deposits(
    orderBy: id
    orderDirection: desc
    where: {owner: $account, pool: $pool, onFarmingCenter: true}
  ) {
    id
  }
}
    `;
export const InfiniteFarmsDocument = `
    query infiniteFarms {
  eternalFarmings(where: {isDetached: false}) {
    id
    rewardToken
    bonusRewardToken
    pool
    startTime
    endTime
    reward
    bonusReward
    rewardRate
    bonusRewardRate
    tokenAmountForTier1
    tokenAmountForTier2
    tokenAmountForTier3
    tier1Multiplier
    tier2Multiplier
    tier3Multiplier
    multiplierToken
    minRangeLength
  }
}
    `;
export const TopPoolsDocument = `
    query topPools {
  pools(
    first: 50
    orderBy: totalValueLockedUSD
    orderDirection: desc
    subgraphError: allow
  ) {
    id
  }
}
    `;
export const TopTokensDocument = `
    query topTokens {
  tokens(
    first: 50
    orderBy: totalValueLockedUSD
    orderDirection: desc
    subgraphError: allow
  ) {
    id
  }
}
    `;
export const StakeHistoryDocument = `
    query stakeHistory($id: ID) {
  factories {
    currentStakedAmount
    earnedForAllTime
    ALGBbalance
    xALGBtotalSupply
  }
  stakes(where: {id: $id}) {
    stakedALGBAmount
    xALGBAmount
  }
}
    `;
export const StakeDocument = `
    query stake {
  histories(first: 1000, where: {date_gte: 1642626000}) {
    date
    currentStakedAmount
    ALGBbalance
    xALGBminted
    xALGBburned
    xALGBtotalSupply
    ALGBfromVault
  }
}
    `;
export const SurroundingTicksDocument = `
    query surroundingTicks($poolAddress: String!, $tickIdxLowerBound: BigInt!, $tickIdxUpperBound: BigInt!, $skip: Int!) {
  ticks(
    subgraphError: allow
    first: 1000
    skip: $skip
    where: {poolAddress: $poolAddress, tickIdx_lte: $tickIdxUpperBound, tickIdx_gte: $tickIdxLowerBound}
  ) {
    tickIdx
    liquidityGross
    liquidityNet
    price0
    price1
  }
}
    `;
export const PopularPoolsDocument = `
    query popularPools {
  pools(orderBy: totalValueLockedUSD, orderDirection: desc, first: 6) {
    token0 {
      id
    }
    token1 {
      id
    }
  }
}
    `;

const injectedRtkApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    prices: build.query<PricesQuery, PricesQueryVariables>({
      query: (variables) => ({ document: PricesDocument, variables }),
    }),
    allV3Ticks: build.query<AllV3TicksQuery, AllV3TicksQueryVariables>({
      query: (variables) => ({ document: AllV3TicksDocument, variables }),
    }),
    feeTierDistribution: build.query<
      FeeTierDistributionQuery,
      FeeTierDistributionQueryVariables
    >({
      query: (variables) => ({
        document: FeeTierDistributionDocument,
        variables,
      }),
    }),
    limitFarm: build.query<LimitFarmQuery, LimitFarmQueryVariables | void>({
      query: (variables) => ({ document: LimitFarmDocument, variables }),
    }),
    eternalFarm: build.query<
      EternalFarmQuery,
      EternalFarmQueryVariables | void
    >({
      query: (variables) => ({ document: EternalFarmDocument, variables }),
    }),
    fetchRewards: build.query<
      FetchRewardsQuery,
      FetchRewardsQueryVariables | void
    >({
      query: (variables) => ({ document: FetchRewardsDocument, variables }),
    }),
    fetchToken: build.query<FetchTokenQuery, FetchTokenQueryVariables | void>({
      query: (variables) => ({ document: FetchTokenDocument, variables }),
    }),
    fetchLimit: build.query<FetchLimitQuery, FetchLimitQueryVariables | void>({
      query: (variables) => ({ document: FetchLimitDocument, variables }),
    }),
    fetchEternalFarm: build.query<
      FetchEternalFarmQuery,
      FetchEternalFarmQueryVariables | void
    >({
      query: (variables) => ({ document: FetchEternalFarmDocument, variables }),
    }),
    fetchPool: build.query<FetchPoolQuery, FetchPoolQueryVariables | void>({
      query: (variables) => ({ document: FetchPoolDocument, variables }),
    }),
    feeHourData: build.query<
      FeeHourDataQuery,
      FeeHourDataQueryVariables | void
    >({
      query: (variables) => ({ document: FeeHourDataDocument, variables }),
    }),
    lastFeeHourData: build.query<
      LastFeeHourDataQuery,
      LastFeeHourDataQueryVariables | void
    >({
      query: (variables) => ({ document: LastFeeHourDataDocument, variables }),
    }),
    lastNotEmptyHourData: build.query<
      LastNotEmptyHourDataQuery,
      LastNotEmptyHourDataQueryVariables | void
    >({
      query: (variables) => ({
        document: LastNotEmptyHourDataDocument,
        variables,
      }),
    }),
    lastNotEmptyPoolHourData: build.query<
      LastNotEmptyPoolHourDataQuery,
      LastNotEmptyPoolHourDataQueryVariables | void
    >({
      query: (variables) => ({
        document: LastNotEmptyPoolHourDataDocument,
        variables,
      }),
    }),
    lastPoolHourData: build.query<
      LastPoolHourDataQuery,
      LastPoolHourDataQueryVariables | void
    >({
      query: (variables) => ({ document: LastPoolHourDataDocument, variables }),
    }),
    poolHourData: build.query<
      PoolHourDataQuery,
      PoolHourDataQueryVariables | void
    >({
      query: (variables) => ({ document: PoolHourDataDocument, variables }),
    }),
    lastEvent: build.query<LastEventQuery, LastEventQueryVariables | void>({
      query: (variables) => ({ document: LastEventDocument, variables }),
    }),
    futureEvents: build.query<
      FutureEventsQuery,
      FutureEventsQueryVariables | void
    >({
      query: (variables) => ({ document: FutureEventsDocument, variables }),
    }),
    currentEvents: build.query<
      CurrentEventsQuery,
      CurrentEventsQueryVariables | void
    >({
      query: (variables) => ({ document: CurrentEventsDocument, variables }),
    }),
    frozenStaked: build.query<
      FrozenStakedQuery,
      FrozenStakedQueryVariables | void
    >({
      query: (variables) => ({ document: FrozenStakedDocument, variables }),
    }),
    transferedPositions: build.query<
      TransferedPositionsQuery,
      TransferedPositionsQueryVariables | void
    >({
      query: (variables) => ({
        document: TransferedPositionsDocument,
        variables,
      }),
    }),
    hasTransferedPositions: build.query<
      HasTransferedPositionsQuery,
      HasTransferedPositionsQueryVariables | void
    >({
      query: (variables) => ({
        document: HasTransferedPositionsDocument,
        variables,
      }),
    }),
    positionsOnEternalFarming: build.query<
      PositionsOnEternalFarmingQuery,
      PositionsOnEternalFarmingQueryVariables | void
    >({
      query: (variables) => ({
        document: PositionsOnEternalFarmingDocument,
        variables,
      }),
    }),
    transferedPositionsForPool: build.query<
      TransferedPositionsForPoolQuery,
      TransferedPositionsForPoolQueryVariables | void
    >({
      query: (variables) => ({
        document: TransferedPositionsForPoolDocument,
        variables,
      }),
    }),
    positionsOnFarming: build.query<
      PositionsOnFarmingQuery,
      PositionsOnFarmingQueryVariables | void
    >({
      query: (variables) => ({
        document: PositionsOnFarmingDocument,
        variables,
      }),
    }),
    infiniteFarms: build.query<
      InfiniteFarmsQuery,
      InfiniteFarmsQueryVariables | void
    >({
      query: (variables) => ({ document: InfiniteFarmsDocument, variables }),
    }),
    topPools: build.query<TopPoolsQuery, TopPoolsQueryVariables | void>({
      query: (variables) => ({ document: TopPoolsDocument, variables }),
    }),
    topTokens: build.query<TopTokensQuery, TopTokensQueryVariables | void>({
      query: (variables) => ({ document: TopTokensDocument, variables }),
    }),
    stakeHistory: build.query<
      StakeHistoryQuery,
      StakeHistoryQueryVariables | void
    >({
      query: (variables) => ({ document: StakeHistoryDocument, variables }),
    }),
    stake: build.query<StakeQuery, StakeQueryVariables | void>({
      query: (variables) => ({ document: StakeDocument, variables }),
    }),
    surroundingTicks: build.query<
      SurroundingTicksQuery,
      SurroundingTicksQueryVariables
    >({
      query: (variables) => ({ document: SurroundingTicksDocument, variables }),
    }),
    popularPools: build.query<
      PopularPoolsQuery,
      PopularPoolsQueryVariables | void
    >({
      query: (variables) => ({ document: PopularPoolsDocument, variables }),
    }),
  }),
});

export { injectedRtkApi as api };
export const {
  usePricesQuery,
  useLazyPricesQuery,
  useAllV3TicksQuery,
  useLazyAllV3TicksQuery,
  useFeeTierDistributionQuery,
  useLazyFeeTierDistributionQuery,
  useLimitFarmQuery,
  useLazyLimitFarmQuery,
  useEternalFarmQuery,
  useLazyEternalFarmQuery,
  useFetchRewardsQuery,
  useLazyFetchRewardsQuery,
  useFetchTokenQuery,
  useLazyFetchTokenQuery,
  useFetchLimitQuery,
  useLazyFetchLimitQuery,
  useFetchEternalFarmQuery,
  useLazyFetchEternalFarmQuery,
  useFetchPoolQuery,
  useLazyFetchPoolQuery,
  useFeeHourDataQuery,
  useLazyFeeHourDataQuery,
  useLastFeeHourDataQuery,
  useLazyLastFeeHourDataQuery,
  useLastNotEmptyHourDataQuery,
  useLazyLastNotEmptyHourDataQuery,
  useLastNotEmptyPoolHourDataQuery,
  useLazyLastNotEmptyPoolHourDataQuery,
  useLastPoolHourDataQuery,
  useLazyLastPoolHourDataQuery,
  usePoolHourDataQuery,
  useLazyPoolHourDataQuery,
  useLastEventQuery,
  useLazyLastEventQuery,
  useFutureEventsQuery,
  useLazyFutureEventsQuery,
  useCurrentEventsQuery,
  useLazyCurrentEventsQuery,
  useFrozenStakedQuery,
  useLazyFrozenStakedQuery,
  useTransferedPositionsQuery,
  useLazyTransferedPositionsQuery,
  useHasTransferedPositionsQuery,
  useLazyHasTransferedPositionsQuery,
  usePositionsOnEternalFarmingQuery,
  useLazyPositionsOnEternalFarmingQuery,
  useTransferedPositionsForPoolQuery,
  useLazyTransferedPositionsForPoolQuery,
  usePositionsOnFarmingQuery,
  useLazyPositionsOnFarmingQuery,
  useInfiniteFarmsQuery,
  useLazyInfiniteFarmsQuery,
  useTopPoolsQuery,
  useLazyTopPoolsQuery,
  useTopTokensQuery,
  useLazyTopTokensQuery,
  useStakeHistoryQuery,
  useLazyStakeHistoryQuery,
  useStakeQuery,
  useLazyStakeQuery,
  useSurroundingTicksQuery,
  useLazySurroundingTicksQuery,
  usePopularPoolsQuery,
  useLazyPopularPoolsQuery,
} = injectedRtkApi;
