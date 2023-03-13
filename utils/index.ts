import { getAddress } from '@ethersproject/address';
import BN from 'bn.js';
import { ApolloClient } from 'apollo-client';
import { Contract } from '@ethersproject/contracts';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import {
  blockClient,
  clientV2,
  txClient,
  clientV3,
  farmingClient,
} from 'apollo/client';
import {
  GET_BLOCK,
  GLOBAL_DATA,
  GLOBAL_CHART,
  GET_BLOCKS,
  TOKENS_CURRENT,
  TOKENS_DYNAMIC,
  TOKEN_CHART,
  TOKEN_DATA1,
  TOKEN_DATA2,
  PAIR_CHART,
  PAIR_DATA,
  PAIRS_BULK1,
  PAIRS_HISTORICAL_BULK,
  PRICES_BY_BLOCK,
  PAIRS_CURRENT,
  ALL_PAIRS,
  ALL_TOKENS,
  TOKEN_INFO,
  TOKEN_INFO_OLD,
  FILTERED_TRANSACTIONS,
  SWAP_TRANSACTIONS,
  HOURLY_PAIR_RATES,
  GLOBAL_ALLDATA,
  ETH_PRICE,
  PAIR_ID,
  IS_PAIR_EXISTS,
  IS_TOKEN_EXISTS,
} from 'apollo/queries';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import {
  CurrencyAmount,
  ChainId,
  Percent,
  JSBI,
  Currency,
  ETHER,
  Token,
  TokenAmount,
  Pair,
} from '@uniswap/sdk';
import {
  CurrencyAmount as CurrencyAmountV3,
  Currency as CurrencyV3,
} from '@uniswap/sdk-core';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { formatUnits } from 'ethers/lib/utils';
import { AddressZero } from '@ethersproject/constants';
import { GlobalConst, GlobalValue, SUPPORTED_WALLETS } from 'constants/index';
import { TokenAddressMap } from 'state/lists/hooks';
import {
  DualStakingInfo,
  LairInfo,
  StakingInfo,
  SyrupBasic,
  SyrupInfo,
} from 'types';
import { unwrappedToken } from './wrappedCurrency';
import { useUSDCPriceToken } from './useUSDCPrice';
import { CallState } from 'state/multicall/hooks';
import { DualStakingBasic, StakingBasic } from 'types';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { injected } from 'connectors';
import Web3 from 'web3';
import {
  FETCH_ETERNAL_FARM_FROM_POOL,
  FETCH_POOL_FROM_TOKENS,
} from './graphql-queries';
import { useEffect, useState } from 'react';
import { useEthPrice } from 'state/application/hooks';
import { formatTokenSymbol, getGlobalDataV3 } from './v3-graph';
import { TFunction } from 'react-i18next';
import { TOKENS_FROM_ADDRESSES_V3 } from 'apollo/queries-v3';
import { GAMMA_MASTERCHEF_ADDRESSES } from 'constants/v3/addresses';

dayjs.extend(utc);
dayjs.extend(weekOfYear);

export { default as addMaticToMetamask } from './addMaticToMetamask';

interface BasicData {
  token0?: {
    id: string;
    name: string;
    symbol: string;
  };
  token1?: {
    id: string;
    name: string;
    symbol: string;
  };
}

const TOKEN_OVERRIDES: {
  [address: string]: { name: string; symbol: string };
} = {
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': {
    name: 'Ether (Wrapped)',
    symbol: 'ETH',
  },
  '0x1416946162b1c2c871a73b07e932d2fb6c932069': {
    name: 'Energi',
    symbol: 'NRGE',
  },
};

export async function getBlockFromTimestamp(timestamp: number): Promise<any> {
  const result = await blockClient.query({
    query: GET_BLOCK,
    variables: {
      timestampFrom: timestamp,
      timestampTo: timestamp + 600,
    },
    fetchPolicy: 'network-only',
  });
  return result?.data?.blocks?.[0]?.number;
}

export function formatCompact(
  unformatted: number | string | BigNumber | BigNumberish | undefined | null,
  decimals = 18,
  maximumFractionDigits: number | undefined = 3,
  maxPrecision: number | undefined = 4,
): string {
  const formatter = Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits,
  });

  if (!unformatted) return '0';

  if (unformatted === Infinity) return '∞';

  let formatted: string | number = Number(unformatted);

  if (unformatted instanceof BigNumber) {
    formatted = Number(formatUnits(unformatted.toString(), decimals));
  }

  return formatter.format(Number(formatted.toPrecision(maxPrecision)));
}

export const getPercentChange = (valueNow: number, value24HoursAgo: number) => {
  const adjustedPercentChange =
    ((valueNow - value24HoursAgo) / value24HoursAgo) * 100;
  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return 0;
  }
  return adjustedPercentChange;
};

export async function splitQuery(
  query: any,
  localClient: ApolloClient<any>,
  vars: any[],
  list: any[],
  skipCount = 100,
): Promise<any> {
  let fetchedData = {};
  let allFound = false;
  let skip = 0;

  while (!allFound) {
    let end = list.length;
    if (skip + skipCount < list.length) {
      end = skip + skipCount;
    }
    const sliced = list.slice(skip, end);
    const result = await localClient.query({
      query: query(...vars, sliced),
      fetchPolicy: 'network-only',
    });
    fetchedData = {
      ...fetchedData,
      ...result.data,
    };
    if (
      Object.keys(result.data).length < skipCount ||
      skip + skipCount > list.length
    ) {
      allFound = true;
    } else {
      skip += skipCount;
    }
  }

  return fetchedData;
}

export async function getBlocksFromTimestamps(
  timestamps: number[],
  skipCount = 500,
): Promise<
  {
    timestamp: string;
    number: any;
  }[]
> {
  if (timestamps?.length === 0) {
    return [];
  }

  const fetchedData: any = await splitQuery(
    GET_BLOCKS,
    blockClient,
    [],
    timestamps,
    skipCount,
  );

  const blocks = [];
  if (fetchedData) {
    for (const t in fetchedData) {
      if (fetchedData[t].length > 0) {
        blocks.push({
          timestamp: t.split('t')[1],
          number: fetchedData[t][0]['number'],
        });
      }
    }
  }
  return blocks;
}

export const get2DayPercentChange = (
  valueNow: number,
  value24HoursAgo: number,
  value48HoursAgo: number,
) => {
  // get volume info for both 24 hour periods
  const currentChange = valueNow - value24HoursAgo;
  const previousChange = value24HoursAgo - value48HoursAgo;

  const adjustedPercentChange =
    ((currentChange - previousChange) / previousChange) * 100;

  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return [currentChange, 0];
  }
  return [currentChange, adjustedPercentChange];
};

export const getEthPrice: () => Promise<number[]> = async () => {
  const utcCurrentTime = dayjs();

  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
  let ethPrice = 0;
  let ethPriceOneDay = 0;
  let priceChangeETH = 0;

  try {
    const oneDayBlock = await getBlockFromTimestamp(utcOneDayBack);
    const result = await clientV2.query({
      query: ETH_PRICE(),
      fetchPolicy: 'network-only',
    });
    const resultOneDay = await clientV2.query({
      query: ETH_PRICE(oneDayBlock),
      fetchPolicy: 'network-only',
    });
    const currentPrice = Number(result?.data?.bundles[0]?.ethPrice ?? 0);
    const oneDayBackPrice = Number(
      resultOneDay?.data?.bundles[0]?.ethPrice ?? 0,
    );

    priceChangeETH = getPercentChange(currentPrice, oneDayBackPrice);
    ethPrice = currentPrice;
    ethPriceOneDay = oneDayBackPrice;
  } catch (e) {
    console.log(e);
  }

  return [ethPrice, ethPriceOneDay, priceChangeETH];
};

export const getTokenInfoSwapDetails = async (
  ethPrice: number,
  ethPriceOld: number,
  maticPrice: number,
  maticPriceOld: number,
  address: string,
) => {
  const utcCurrentTime = dayjs();
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
  const [oneDayBlock] = await getBlocksFromTimestamps([utcOneDayBack]);

  try {
    const currentDataV2 = await clientV2.query({
      query: TOKEN_INFO(address.toLowerCase()),
      fetchPolicy: 'network-only',
    });

    const oneDayDataV2 = await clientV2.query({
      query: TOKEN_INFO_OLD(oneDayBlock.number, address.toLowerCase()),
      fetchPolicy: 'network-only',
    });

    const currentDataV3 = await clientV3.query({
      query: TOKENS_FROM_ADDRESSES_V3(undefined, [address.toLowerCase()]),
      fetchPolicy: 'network-only',
    });

    const oneDayDataV3 = await clientV3.query({
      query: TOKENS_FROM_ADDRESSES_V3(oneDayBlock.number, [
        address.toLowerCase(),
      ]),
      fetchPolicy: 'network-only',
    });

    const currentV2 =
      currentDataV2 &&
      currentDataV2.data &&
      currentDataV2.data.tokens &&
      currentDataV2.data.tokens.length > 0
        ? currentDataV2.data.tokens[0]
        : undefined;

    const oneDayV2 =
      oneDayDataV2 &&
      oneDayDataV2.data &&
      oneDayDataV2.data.tokens &&
      oneDayDataV2.data.tokens.length > 0
        ? oneDayDataV2.data.tokens[0]
        : undefined;

    const currentV3 =
      currentDataV3 &&
      currentDataV3.data &&
      currentDataV3.data.tokens &&
      currentDataV3.data.tokens.length > 0
        ? currentDataV3.data.tokens[0]
        : undefined;

    const oneDayV3 =
      oneDayDataV3 &&
      oneDayDataV3.data &&
      oneDayDataV3.data.tokens &&
      oneDayDataV3.data.tokens.length > 0
        ? oneDayDataV3.data.tokens[0]
        : undefined;

    const manageUntrackedVolume = currentV3
      ? +currentV3.volumeUSD <= 1
        ? 'untrackedVolumeUSD'
        : 'volumeUSD'
      : '';
    const manageUntrackedTVL = currentV3
      ? +currentV3.totalValueLockedUSD <= 1
        ? 'totalValueLockedUSDUntracked'
        : 'totalValueLockedUSD'
      : '';

    const oneDayVolumeUSD =
      Number(
        currentV3 && currentV3[manageUntrackedVolume]
          ? currentV3[manageUntrackedVolume]
          : 0,
      ) +
      Number(
        currentV2 && currentV2.tradeVolumeUSD ? currentV2.tradeVolumeUSD : 0,
      ) -
      Number(
        oneDayV3 && oneDayV3[manageUntrackedVolume]
          ? oneDayV3[manageUntrackedVolume]
          : 0,
      ) -
      Number(oneDayV2 && oneDayV2.tradeVolumeUSD ? oneDayV2.tradeVolumeUSD : 0);

    const totalLiquidityUSD =
      (currentV3 ? Number(currentV3[manageUntrackedTVL]) : 0) +
      (currentV2
        ? (currentV2.totalLiquidity ?? 0) *
          ethPrice *
          (currentV2.derivedETH ?? 0)
        : 0);

    const priceUSDV3 = currentV3
      ? parseFloat(currentV3.derivedMatic) * maticPrice
      : 0;
    const priceUSDOneDayV3 = oneDayV3
      ? parseFloat(oneDayV3.derivedMatic) * maticPriceOld
      : 0;
    const priceUSDV2 =
      currentV2 && currentV2.derivedETH ? currentV2.derivedETH * ethPrice : 0;
    const priceUSDOneDayV2 =
      oneDayV2 && oneDayV2.derivedETH ? oneDayV2.derivedETH * ethPriceOld : 0;
    const priceUSD = priceUSDV2 ?? priceUSDV3;
    const priceUSDOneDay = priceUSDOneDayV2 ?? priceUSDOneDayV3;

    const priceChangeUSD =
      priceUSD && priceUSDOneDay
        ? getPercentChange(
            Number(priceUSD.toString()),
            Number(priceUSDOneDay.toString()),
          )
        : 0;

    return {
      totalLiquidityUSD,
      oneDayVolumeUSD,
      priceUSD,
      priceChangeUSD,
    };
  } catch (e) {
    console.log(e);
    return;
  }
};

export const getTokenInfo = async (
  ethPrice: number,
  ethPriceOld: number,
  address: string,
) => {
  const utcCurrentTime = dayjs();
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
  const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix();
  const utcOneWeekBack = utcCurrentTime.subtract(7, 'day').unix();
  const utcTwoWeekBack = utcCurrentTime.subtract(14, 'day').unix();
  const oneDayBlock = await getBlockFromTimestamp(utcOneDayBack);
  const twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack);
  const oneWeekBlock = await getBlockFromTimestamp(utcOneWeekBack);
  const twoWeekBlock = await getBlockFromTimestamp(utcTwoWeekBack);

  try {
    const current = await clientV2.query({
      query: TOKEN_INFO(address),
      fetchPolicy: 'network-only',
    });

    const oneDayResult = await clientV2.query({
      query: TOKEN_INFO_OLD(oneDayBlock, address),
      fetchPolicy: 'network-only',
    });

    const twoDayResult = await clientV2.query({
      query: TOKEN_INFO_OLD(twoDayBlock, address),
      fetchPolicy: 'network-only',
    });

    const oneWeekResult = await clientV2.query({
      query: TOKEN_INFO_OLD(oneWeekBlock, address),
      fetchPolicy: 'network-only',
    });

    const twoWeekResult = await clientV2.query({
      query: TOKEN_INFO_OLD(twoWeekBlock, address),
      fetchPolicy: 'network-only',
    });

    const currentData =
      current &&
      current.data &&
      current.data.tokens &&
      current.data.tokens.length > 0
        ? current.data.tokens
        : undefined;

    const oneDayData =
      oneDayResult &&
      oneDayResult.data &&
      oneDayResult.data.tokens &&
      oneDayResult.data.tokens.length > 0
        ? oneDayResult.data.tokens.reduce((obj: any, cur: any) => {
            return { ...obj, [cur.id]: cur };
          }, {})
        : undefined;

    const twoDayData =
      oneDayResult &&
      twoDayResult.data &&
      twoDayResult.data.tokens &&
      twoDayResult.data.tokens.length > 0
        ? twoDayResult.data.tokens.reduce((obj: any, cur: any) => {
            return { ...obj, [cur.id]: cur };
          }, {})
        : undefined;

    const oneWeekData =
      oneWeekResult &&
      oneWeekResult.data &&
      oneWeekResult.data.tokens &&
      oneWeekResult.data.tokens.length > 0
        ? oneWeekResult.data.tokens.reduce((obj: any, cur: any) => {
            return { ...obj, [cur.id]: cur };
          }, {})
        : undefined;

    const twoWeekData =
      twoWeekResult &&
      twoWeekResult.data &&
      twoWeekResult.data.tokens &&
      twoWeekResult.data.tokens.length > 0
        ? twoWeekResult.data.tokens.reduce((obj: any, cur: any) => {
            return { ...obj, [cur.id]: cur };
          }, {})
        : undefined;

    const bulkResults = await Promise.all(
      currentData &&
        oneDayData &&
        twoDayData &&
        currentData.map(async (token: any) => {
          const data = token;

          let oneDayHistory = oneDayData?.[token.id];
          let twoDayHistory = twoDayData?.[token.id];
          let oneWeekHistory = oneWeekData?.[token.id];
          let twoWeekHistory = twoWeekData?.[token.id];

          // this is because old history data returns exact same data as current data when the old data does not exist
          if (
            Number(oneDayHistory?.totalLiquidity ?? 0) ===
              Number(data?.totalLiquidity ?? 0) &&
            Number(oneDayHistory?.tradeVolume ?? 0) ===
              Number(data?.tradeVolume ?? 0) &&
            Number(oneDayHistory?.derivedETH ?? 0) ===
              Number(data?.derivedETH ?? 0)
          ) {
            oneDayHistory = null;
          }

          if (
            Number(twoDayHistory?.totalLiquidity ?? 0) ===
              Number(data?.totalLiquidity ?? 0) &&
            Number(twoDayHistory?.tradeVolume ?? 0) ===
              Number(data?.tradeVolume ?? 0) &&
            Number(twoDayHistory?.derivedETH ?? 0) ===
              Number(data?.derivedETH ?? 0)
          ) {
            twoDayHistory = null;
          }

          if (
            Number(oneWeekHistory?.totalLiquidity ?? 0) ===
              Number(data?.totalLiquidity ?? 0) &&
            Number(oneWeekHistory?.tradeVolume ?? 0) ===
              Number(data?.tradeVolume ?? 0) &&
            Number(oneWeekHistory?.derivedETH ?? 0) ===
              Number(data?.derivedETH ?? 0)
          ) {
            oneWeekHistory = null;
          }

          if (
            Number(twoWeekHistory?.totalLiquidity ?? 0) ===
              Number(data?.totalLiquidity ?? 0) &&
            Number(twoWeekHistory?.tradeVolume ?? 0) ===
              Number(data?.tradeVolume ?? 0) &&
            Number(twoWeekHistory?.derivedETH ?? 0) ===
              Number(data?.derivedETH ?? 0)
          ) {
            twoWeekHistory = null;
          }

          // calculate percentage changes and daily changes
          const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
            data.tradeVolumeUSD,
            oneDayHistory?.tradeVolumeUSD ?? 0,
            twoDayHistory?.tradeVolumeUSD ?? 0,
          );

          const [oneWeekVolumeUSD] = get2DayPercentChange(
            data.tradeVolumeUSD,
            oneWeekHistory?.tradeVolumeUSD ?? 0,
            twoWeekHistory?.tradeVolumeUSD ?? 0,
          );

          const currentLiquidityUSD =
            data?.totalLiquidity * ethPrice * data?.derivedETH;
          const oldLiquidityUSD =
            (oneDayHistory?.totalLiquidity ?? 0) *
            ethPriceOld *
            (oneDayHistory?.derivedETH ?? 0);

          // percent changes
          const priceChangeUSD = getPercentChange(
            data?.derivedETH * ethPrice,
            oneDayHistory?.derivedETH
              ? oneDayHistory?.derivedETH * ethPriceOld
              : 0,
          );

          // set data
          data.priceUSD = data?.derivedETH * ethPrice;
          data.totalLiquidityUSD = currentLiquidityUSD;
          data.oneDayVolumeUSD = oneDayVolumeUSD;
          data.oneWeekVolumeUSD = oneWeekVolumeUSD;
          data.volumeChangeUSD = volumeChangeUSD;
          data.priceChangeUSD = priceChangeUSD;
          data.liquidityChangeUSD = getPercentChange(
            currentLiquidityUSD ?? 0,
            oldLiquidityUSD ?? 0,
          );
          data.symbol = formatTokenSymbol(data.id, data.symbol);

          // new tokens
          if (!oneDayHistory && data) {
            data.oneDayVolumeUSD = data.tradeVolumeUSD;
            data.oneDayVolumeETH = data.tradeVolume * data.derivedETH;
          }

          // update name data for
          updateNameData({
            token0: data,
          });

          // HOTFIX for Aave
          if (data.id === '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9') {
            const aaveData = await clientV2.query({
              query: PAIR_DATA('0xdfc14d2af169b0d36c4eff567ada9b2e0cae044f'),
              fetchPolicy: 'network-only',
            });
            const result = aaveData.data.pairs[0];
            data.totalLiquidityUSD = Number(result.reserveUSD) / 2;
            data.liquidityChangeUSD = 0;
            data.priceChangeUSD = 0;
          }
          return data;
        }),
    );
    return bulkResults;
  } catch (e) {
    console.log(e);
  }
};

export const getTopTokens = async (
  ethPrice: number,
  ethPriceOld: number,
  count = 500,
) => {
  const utcCurrentTime = dayjs();
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
  const oneDayBlock = await getBlockFromTimestamp(utcOneDayBack);

  try {
    const current = await clientV2.query({
      query: TOKENS_CURRENT(count),
      fetchPolicy: 'network-only',
    });

    const oneDayResult = await clientV2.query({
      query: TOKENS_DYNAMIC(oneDayBlock, count),
      fetchPolicy: 'network-only',
    });

    const oneDayData = oneDayResult?.data?.tokens.reduce(
      (obj: any, cur: any) => {
        return { ...obj, [cur.id]: cur };
      },
      {},
    );

    const bulkResults = await Promise.all(
      current &&
        oneDayData &&
        current?.data?.tokens?.map(async (token: any) => {
          const data = token;

          // let liquidityDataThisToken = liquidityData?.[token.id]
          let oneDayHistory = oneDayData?.[token.id];

          // this is because old history data returns exact same data as current data when the old data does not exist
          if (
            Number(oneDayHistory?.totalLiquidity ?? 0) ===
              Number(data?.totalLiquidity ?? 0) &&
            Number(oneDayHistory?.tradeVolume ?? 0) ===
              Number(data?.tradeVolume ?? 0) &&
            Number(oneDayHistory?.derivedETH ?? 0) ===
              Number(data?.derivedETH ?? 0)
          ) {
            oneDayHistory = null;
          }

          const oneDayVolumeUSD =
            (data?.tradeVolumeUSD ?? 0) - (oneDayHistory?.tradeVolumeUSD ?? 0);

          const currentLiquidityUSD =
            data?.totalLiquidity * ethPrice * data?.derivedETH;
          const oldLiquidityUSD =
            (oneDayHistory?.totalLiquidity ?? 0) *
            ethPriceOld *
            (oneDayHistory?.derivedETH ?? 0);

          // percent changes
          const priceChangeUSD = getPercentChange(
            data?.derivedETH * ethPrice,
            oneDayHistory?.derivedETH
              ? oneDayHistory?.derivedETH * ethPriceOld
              : 0,
          );

          // set data
          data.priceUSD = data?.derivedETH * ethPrice;
          data.totalLiquidityUSD = currentLiquidityUSD;
          data.oneDayVolumeUSD = oneDayVolumeUSD;
          data.priceChangeUSD = priceChangeUSD;
          data.liquidityChangeUSD = getPercentChange(
            currentLiquidityUSD ?? 0,
            oldLiquidityUSD ?? 0,
          );
          data.symbol = formatTokenSymbol(data.id, data.symbol);

          // new tokens
          if (!oneDayHistory && data) {
            data.oneDayVolumeUSD = data.tradeVolumeUSD;
            data.oneDayVolumeETH = data.tradeVolume * data.derivedETH;
          }

          // update name data for
          updateNameData({
            token0: data,
          });

          // HOTFIX for Aave
          if (data.id === '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9') {
            const aaveData = await clientV2.query({
              query: PAIR_DATA('0xdfc14d2af169b0d36c4eff567ada9b2e0cae044f'),
              fetchPolicy: 'network-only',
            });
            const result = aaveData.data.pairs[0];
            data.totalLiquidityUSD = Number(result.reserveUSD) / 2;
            data.liquidityChangeUSD = 0;
            data.priceChangeUSD = 0;
          }
          return data;
        }),
    );
    return bulkResults;
  } catch (e) {
    console.log(e);
  }
};

export const getTimestampsForChanges: () => number[] = () => {
  const utcCurrentTime = dayjs();
  //utcCurrentTime = utcCurrentTime.subtract(0.3,  'day');
  const t1 = utcCurrentTime
    .subtract(1, 'day')
    .startOf('minute')
    .unix();
  const t2 = utcCurrentTime
    .subtract(2, 'day')
    .startOf('minute')
    .unix();
  const tWeek = utcCurrentTime
    .subtract(1, 'week')
    .startOf('minute')
    .unix();
  return [t1, t2, tWeek];
};

export const getTokenPairs = async (
  tokenAddress: string,
  tokenAddress1: string,
) => {
  try {
    // fetch all current and historical data
    const result = await clientV2.query({
      query: TOKEN_DATA1(tokenAddress, tokenAddress1),
      fetchPolicy: 'network-only',
    });
    return result.data?.['pairs0']
      .concat(result.data?.['pairs1'])
      .concat(result.data?.['pairs2'])
      .concat(result.data?.['pairs3'])
      .concat(result.data?.['pairs4']);
  } catch (e) {
    console.log(e);
  }
};

export const getTokenPairs2 = async (tokenAddress: string) => {
  try {
    // fetch all current and historical data
    const result = await clientV2.query({
      query: TOKEN_DATA2(tokenAddress),
      fetchPolicy: 'network-only',
    });
    return result.data?.['pairs0'].concat(result.data?.['pairs1']);
  } catch (e) {
    console.log(e);
    return;
  }
};

export const getTopPairs = async (count: number) => {
  try {
    // fetch all current and historical data
    const result = await clientV2.query({
      query: PAIRS_CURRENT(count),
      fetchPolicy: 'network-only',
    });
    return result.data?.['pairs'];
  } catch (e) {
    console.log(e);
    return;
  }
};

export const getTopPairsV2 = async (count: number) => {
  try {
    const utcCurrentTime = dayjs();

    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
    const utcOneWeekBack = utcCurrentTime.subtract(1, 'week').unix();

    const [oneDayBlock, oneWeekBlock] = await getBlocksFromTimestamps([
      utcOneDayBack,
      utcOneWeekBack,
    ]);

    const topPairIds = await clientV2.query({
      query: PAIRS_CURRENT(count),
      fetchPolicy: 'network-only',
    });
    const pairsAddresses = topPairIds.data.pairs.map((el: any) => el.id);

    const pairsResult = await clientV2.query({
      query: PAIRS_BULK1,
      variables: {
        allPairs: pairsAddresses,
      },
      fetchPolicy: 'network-only',
    });
    const pairsCurrent =
      pairsResult &&
      pairsResult.data &&
      pairsResult.data.pairs &&
      pairsResult.data.pairs.length > 0
        ? pairsResult.data.pairs
        : [];

    const [oneDayResult, oneWeekResult] = await Promise.all(
      [oneDayBlock, oneWeekBlock].map(async (block) => {
        const result = await clientV2.query({
          query: PAIRS_HISTORICAL_BULK(block.number, pairsAddresses),
          fetchPolicy: 'network-only',
        });
        return result;
      }),
    );

    const pairsOneDay =
      oneDayResult &&
      oneDayResult.data &&
      oneDayResult.data.pairs &&
      oneDayResult.data.pairs.length > 0
        ? oneDayResult.data.pairs
        : [];

    const pairsOneWeek =
      oneWeekResult &&
      oneWeekResult.data &&
      oneWeekResult.data.pairs &&
      oneWeekResult.data.pairs.length > 0
        ? oneWeekResult.data.pairs
        : [];

    const pairsCurrentData = pairsCurrent.reduce((obj: any, cur: any) => {
      return { ...obj, [cur.id]: cur };
    }, {});
    const pairsOneDayData = pairsOneDay.reduce((obj: any, cur: any) => {
      return { ...obj, [cur.id]: cur };
    }, {});
    const pairsOneWeekData = pairsOneWeek.reduce((obj: any, cur: any) => {
      return { ...obj, [cur.id]: cur };
    }, {});

    const formatted = pairsAddresses.map((address: string) => {
      const current = pairsCurrentData[address];
      const oneDay = pairsOneDayData[address];
      const oneWeek = pairsOneWeekData[address];

      const currentVolume =
        current && current.volumeUSD ? Number(current.volumeUSD) : 0;

      const oneDayVolume =
        oneDay && oneDay.volumeUSD ? Number(oneDay.volumeUSD) : 0;

      const weekVolume =
        oneWeek && oneWeek.volumeUSD ? Number(oneWeek.volumeUSD) : 0;

      const oneDayVolumeUSD = currentVolume - oneDayVolume;

      const oneWeekVolumeUSD = currentVolume - weekVolume;

      const currentTVL = current
        ? current.trackedReserveUSD
          ? Number(current.trackedReserveUSD)
          : current.reserveUSD
          ? Number(current.reserveUSD)
          : 0
        : 0;

      const oneDayTVL = oneDay
        ? oneDay.trackedReserveUSD
          ? Number(oneDay.trackedReserveUSD)
          : oneDay.reserveUSD
          ? Number(oneDay.reserveUSD)
          : 0
        : 0;

      const tvlUSD = currentTVL;
      const tvlUSDChange = getPercentChange(tvlUSD, oneDayTVL);

      return current
        ? {
            isV3: false,
            token0: current.token0,
            token1: current.token1,
            fee: oneDayVolumeUSD * GlobalConst.utils.FEEPERCENT,
            id: address,
            oneDayVolumeUSD,
            oneWeekVolumeUSD,
            trackedReserveUSD: tvlUSD,
            tvlUSDChange,
            totalValueLockedUSD: tvlUSD,
          }
        : undefined;
    });

    return formatted;
  } catch (e) {
    console.log(e);
    return;
  }
};

export function getSecondsOneDay() {
  return 60 * 60 * 24;
}

export const getIntervalTokenData = async (
  tokenAddress: string,
  startTime: number,
  interval = 3600,
  latestBlock: number | undefined,
) => {
  const utcEndTime = dayjs.utc();
  let time = startTime;

  // create an array of hour start times until we reach current hour
  // buffer by half hour to catch case where graph isnt synced to latest block
  const timestamps = [];
  while (time < utcEndTime.unix()) {
    timestamps.push(time);
    time += interval;
  }

  // backout if invalid timestamp format
  if (timestamps.length === 0) {
    return [];
  }

  // once you have all the timestamps, get the blocks for each timestamp in a bulk query
  let blocks;
  try {
    blocks = await getBlocksFromTimestamps(timestamps, 100);

    // catch failing case
    if (!blocks || blocks.length === 0) {
      return [];
    }

    if (latestBlock) {
      blocks = blocks.filter((b) => {
        return Number(b.number) <= latestBlock;
      });
    }

    const result: any = await splitQuery(
      PRICES_BY_BLOCK,
      clientV2,
      [tokenAddress],
      blocks,
      50,
    );

    // format token ETH price results
    const values: any[] = [];
    for (const row in result) {
      const timestamp = row.split('t')[1];
      const derivedETH = Number(result[row]?.derivedETH ?? 0);
      if (timestamp) {
        values.push({
          timestamp,
          derivedETH,
        });
      }
    }

    // go through eth usd prices and assign to original values array
    let index = 0;
    for (const brow in result) {
      const timestamp = brow.split('b')[1];
      if (timestamp) {
        values[index].priceUSD =
          result[brow].ethPrice * values[index].derivedETH;
        index += 1;
      }
    }

    const formattedHistory = [];

    // for each hour, construct the open and close price
    for (let i = 0; i < values.length - 1; i++) {
      formattedHistory.push({
        timestamp: values[i].timestamp,
        open: Number(values[i].priceUSD),
        close: Number(values[i + 1].priceUSD),
      });
    }

    return formattedHistory;
  } catch (e) {
    console.log(e);
    console.log('error fetching blocks');
    return [];
  }
};

export const getPairTransactions = async (pairAddress: string) => {
  try {
    const result = await txClient.query({
      query: FILTERED_TRANSACTIONS,
      variables: {
        allPairs: [pairAddress],
      },
      fetchPolicy: 'no-cache',
    });
    return {
      mints: result.data.mints,
      burns: result.data.burns,
      swaps: result.data.swaps,
    };
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getPairAddress = async (
  token0Address: string,
  token1Address: string,
) => {
  const pairData = await clientV2.query({
    query: PAIR_ID(token0Address, token1Address),
  });
  const pairs =
    pairData && pairData.data
      ? pairData.data.pairs0.concat(pairData.data.pairs1)
      : undefined;
  if (!pairs || pairs.length === 0) return;
  const pairId = pairs[0].id;
  const tokenReversed = pairData.data.pairs1.length > 0;
  return { pairId, tokenReversed };
};

export const isV2PairExists = async (pairAddress: string) => {
  try {
    const pair = await clientV2.query({
      query: IS_PAIR_EXISTS(pairAddress.toLowerCase()),
    });

    if (pair.errors) {
      return false;
    }
    return pair.data.pair;
  } catch {
    return false;
  }
};

export const isV2TokenExists = async (tokenAddress: string) => {
  try {
    const token = await clientV2.query({
      query: IS_TOKEN_EXISTS(tokenAddress.toLowerCase()),
    });

    if (token.errors) {
      return false;
    }
    return token.data.token;
  } catch {
    return false;
  }
};

export const getSwapTransactions = async (
  pairId: string,
  startTime?: number,
) => {
  const oneDayAgo = dayjs
    .utc()
    .subtract(1, 'day')
    .unix();
  const sTimestamp = startTime ?? oneDayAgo;
  try {
    const result = await txClient.query({
      query: SWAP_TRANSACTIONS,
      variables: {
        allPairs: [pairId],
        lastTime: sTimestamp,
      },
      fetchPolicy: 'network-only',
    });
    const swaps: any[] = result.data.swaps;

    return swaps;
  } catch (e) {
    return;
  }
};

export const getTokenChartData = async (
  tokenAddress: string,
  startTime: number,
) => {
  let data: any[] = [];
  const utcEndTime = dayjs.utc();
  try {
    let allFound = false;
    let skip = 0;
    while (!allFound) {
      const result = await clientV2.query({
        query: TOKEN_CHART,
        variables: {
          startTime: startTime,
          tokenAddr: tokenAddress,
          skip,
        },
        fetchPolicy: 'network-only',
      });
      if (result.data.tokenDayDatas.length < 1000) {
        allFound = true;
      }
      skip += 1000;
      data = data.concat(result.data.tokenDayDatas);
    }

    const dayIndexSet = new Set();
    const dayIndexArray: any[] = [];
    const oneDay = getSecondsOneDay();
    data.forEach((dayData, i) => {
      // add the day index to the set of days
      dayIndexSet.add((data[i].date / oneDay).toFixed(0));
      dayIndexArray.push(data[i]);
      dayData.dailyVolumeUSD = Number(dayData.dailyVolumeUSD);
    });

    // fill in empty days
    let timestamp = data[0] && data[0].date ? data[0].date : startTime;
    let latestLiquidityUSD = data[0] && data[0].totalLiquidityUSD;
    let latestPriceUSD = data[0] && data[0].priceUSD;
    //let latestPairDatas = data[0] && data[0].mostLiquidPairs
    let index = 1;
    while (timestamp < utcEndTime.startOf('minute').unix() - oneDay) {
      const nextDay = timestamp + oneDay;
      const currentDayIndex = (nextDay / oneDay).toFixed(0);
      if (!dayIndexSet.has(currentDayIndex)) {
        data.push({
          date: nextDay,
          dayString: nextDay,
          dailyVolumeUSD: 0,
          priceUSD: latestPriceUSD,
          totalLiquidityUSD: latestLiquidityUSD,
          //mostLiquidPairs: latestPairDatas,
        });
      } else {
        latestLiquidityUSD = dayIndexArray[index].totalLiquidityUSD;
        latestPriceUSD = dayIndexArray[index].priceUSD;
        //latestPairDatas = dayIndexArray[index].mostLiquidPairs
        index = index + 1;
      }
      timestamp = nextDay;
    }
    data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1));
  } catch (e) {
    console.log(e);
  }
  return data;
};

export const getPairChartData = async (
  pairAddress: string,
  startTime: number,
) => {
  let data: any[] = [];
  const utcEndTime = dayjs.utc();
  try {
    let allFound = false;
    let skip = 0;
    while (!allFound) {
      const result = await clientV2.query({
        query: PAIR_CHART,
        variables: {
          startTime: startTime,
          pairAddress: pairAddress,
          skip,
        },
        fetchPolicy: 'cache-first',
      });
      skip += 1000;
      data = data.concat(result.data.pairDayDatas);
      if (result.data.pairDayDatas.length < 1000) {
        allFound = true;
      }
    }

    const dayIndexSet = new Set();
    const dayIndexArray: any[] = [];
    const oneDay = 24 * 60 * 60;
    data.forEach((dayData, i) => {
      // add the day index to the set of days
      dayIndexSet.add((data[i].date / oneDay).toFixed(0));
      dayIndexArray.push(data[i]);
      dayData.dailyVolumeUSD = Number(dayData.dailyVolumeUSD);
      dayData.reserveUSD = Number(dayData.reserveUSD);
    });

    if (data[0]) {
      // fill in empty days
      let timestamp = data[0].date ? data[0].date : startTime;
      let latestLiquidityUSD = data[0].reserveUSD;
      let index = 1;
      while (timestamp < utcEndTime.unix() - oneDay) {
        const nextDay = timestamp + oneDay;
        const currentDayIndex = (nextDay / oneDay).toFixed(0);
        if (!dayIndexSet.has(currentDayIndex)) {
          data.push({
            date: nextDay,
            dayString: nextDay,
            dailyVolumeUSD: 0,
            reserveUSD: latestLiquidityUSD,
          });
        } else {
          latestLiquidityUSD = dayIndexArray[index].reserveUSD;
          index = index + 1;
        }
        timestamp = nextDay;
      }
    }

    data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1));
  } catch (e) {
    console.log(e);
  }

  return data;
};

export const getRateData = async (
  pairAddress: string,
  latestBlock: number,
  interval: number,
  startTime: number,
  pairTokenReversed: boolean,
) => {
  try {
    const utcEndTime = dayjs.utc();
    let time = startTime;

    // create an array of hour start times until we reach current hour
    const timestamps = [];
    while (time <= utcEndTime.unix()) {
      timestamps.push(time);
      time += interval;
    }

    // backout if invalid timestamp format
    if (timestamps.length === 0) {
      return [];
    }

    // once you have all the timestamps, get the blocks for each timestamp in a bulk query
    let blocks;

    blocks = await getBlocksFromTimestamps(timestamps, 100);

    // catch failing case
    if (!blocks || blocks?.length === 0) {
      return [];
    }

    if (latestBlock) {
      blocks = blocks.filter((b) => {
        return Number(b.number) <= latestBlock;
      });
    }

    const result = await splitQuery(
      HOURLY_PAIR_RATES,
      clientV2,
      [pairAddress],
      blocks,
      100,
    );

    // format token ETH price results
    const values = [];
    for (const row in result) {
      const timestamp = row.split('t')[1];
      if (timestamp) {
        values.push({
          timestamp,
          rate: pairTokenReversed
            ? Number(result[row]?.token0Price)
            : Number(result[row]?.token1Price),
        });
      }
    }
    return values;
  } catch (e) {
    console.log(e);
    return [];
  }
};

export const getBulkPairData: (
  pairList: any,
  ethPrice: any,
) => Promise<any[] | undefined> = async (pairList: any, ethPrice: any) => {
  const [t1, t2, tWeek] = getTimestampsForChanges();
  const a = await getBlocksFromTimestamps([t1, t2, tWeek]);
  const [{ number: b1 }, { number: b2 }, { number: bWeek }] = a;
  try {
    const current = await clientV2.query({
      query: PAIRS_BULK1,
      variables: {
        allPairs: pairList,
      },
      fetchPolicy: 'network-only',
    });

    const [oneDayResult, twoDayResult, oneWeekResult] = await Promise.all(
      [b1, b2, bWeek].map(async (block) => {
        const result = await clientV2.query({
          query: PAIRS_HISTORICAL_BULK(block, pairList),
          fetchPolicy: 'network-only',
        });
        return result;
      }),
    );

    const oneDayData = oneDayResult?.data?.pairs.reduce(
      (obj: any, cur: any) => {
        return { ...obj, [cur.id]: cur };
      },
      {},
    );

    const twoDayData = twoDayResult?.data?.pairs.reduce(
      (obj: any, cur: any) => {
        return { ...obj, [cur.id]: cur };
      },
      {},
    );

    const oneWeekData = oneWeekResult?.data?.pairs.reduce(
      (obj: any, cur: any) => {
        return { ...obj, [cur.id]: cur };
      },
      {},
    );

    const pairData = await Promise.all(
      current &&
        current.data.pairs.map(async (pair: any) => {
          let data = pair;
          let oneDayHistory = oneDayData?.[pair.id];
          if (!oneDayHistory) {
            const newData = await clientV2.query({
              query: PAIR_DATA(pair.id, b1),
              fetchPolicy: 'network-only',
            });
            oneDayHistory = newData.data.pairs[0];
          }
          let twoDayHistory = twoDayData?.[pair.id];
          if (!twoDayHistory) {
            const newData = await clientV2.query({
              query: PAIR_DATA(pair.id, b2),
              fetchPolicy: 'network-only',
            });
            twoDayHistory = newData.data.pairs[0];
          }
          let oneWeekHistory = oneWeekData?.[pair.id];
          if (!oneWeekHistory) {
            const newData = await clientV2.query({
              query: PAIR_DATA(pair.id, bWeek),
              fetchPolicy: 'network-only',
            });
            oneWeekHistory = newData.data.pairs[0];
          }

          // this is because old history data returns exact same data as current data when the old data does not exist
          if (
            Number(oneDayHistory?.reserveUSD ?? 0) ===
              Number(data?.reserveUSD ?? 0) &&
            Number(oneDayHistory?.volumeUSD ?? 0) ===
              Number(data?.volumeUSD ?? 0) &&
            Number(oneDayHistory?.totalSupply ?? 0) ===
              Number(data?.totalSupply ?? 0)
          ) {
            oneDayHistory = null;
          }

          if (
            Number(twoDayHistory?.reserveUSD ?? 0) ===
              Number(data?.reserveUSD ?? 0) &&
            Number(twoDayHistory?.volumeUSD ?? 0) ===
              Number(data?.volumeUSD ?? 0) &&
            Number(twoDayHistory?.totalSupply ?? 0) ===
              Number(data?.totalSupply ?? 0)
          ) {
            twoDayHistory = null;
          }
          if (
            Number(oneWeekHistory?.reserveUSD ?? 0) ===
              Number(data?.reserveUSD ?? 0) &&
            Number(oneWeekHistory?.volumeUSD ?? 0) ===
              Number(data?.volumeUSD ?? 0) &&
            Number(oneWeekHistory?.totalSupply ?? 0) ===
              Number(data?.totalSupply ?? 0)
          ) {
            oneWeekHistory = null;
          }

          data = parseData(
            data,
            oneDayHistory,
            twoDayHistory,
            oneWeekHistory,
            ethPrice,
            b1,
          );
          return data;
        }),
    );
    return pairData;
  } catch (e) {
    console.log(e);
  }
};

const parseData = (
  data: any,
  oneDayData: any,
  twoDayData: any,
  oneWeekData: any,
  ethPrice: any,
  oneDayBlock: any,
) => {
  const volumeKey =
    data && data.volumeUSD && Number(data.volumeUSD) > 0
      ? 'volumeUSD'
      : 'untrackedVolumeUSD';
  // get volume changes
  const currentVolume = data && data[volumeKey] ? Number(data[volumeKey]) : 0;
  const oneDayVolume =
    oneDayData && oneDayData[volumeKey] ? Number(oneDayData[volumeKey]) : 0;
  const twoDayVolume =
    twoDayData && twoDayData[volumeKey] ? Number(twoDayData[volumeKey]) : 0;
  const oneWeekVolume =
    oneWeekData && oneWeekData[volumeKey] ? Number(oneWeekData[volumeKey]) : 0;
  const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
    currentVolume,
    oneDayVolume,
    twoDayVolume,
  );
  const [oneDayVolumeUntracked, volumeChangeUntracked] = get2DayPercentChange(
    data?.untrackedVolumeUSD,
    oneDayData?.untrackedVolumeUSD ? Number(oneDayData?.untrackedVolumeUSD) : 0,
    twoDayData?.untrackedVolumeUSD ? twoDayData?.untrackedVolumeUSD : 0,
  );

  const oneWeekVolumeUSD = currentVolume - oneWeekVolume;

  const oneWeekVolumeUntracked = Number(
    oneWeekData
      ? data?.untrackedVolumeUSD - oneWeekData?.untrackedVolumeUSD
      : data.untrackedVolumeUSD,
  );

  // set volume properties
  data.oneDayVolumeUSD = oneDayVolumeUSD;
  data.oneWeekVolumeUSD = oneWeekVolumeUSD;
  data.volumeChangeUSD = volumeChangeUSD;
  data.oneDayVolumeUntracked = oneDayVolumeUntracked;
  data.oneWeekVolumeUntracked = oneWeekVolumeUntracked;
  data.volumeChangeUntracked = volumeChangeUntracked;
  data.token0 = {
    ...data.token0,
    symbol: formatTokenSymbol(data.token0.id, data.token0.symbol),
  };
  data.token1 = {
    ...data.token1,
    symbol: formatTokenSymbol(data.token1.id, data.token1.symbol),
  };

  // set liquidity properties
  data.trackedReserveUSD = data.trackedReserveETH * ethPrice;
  data.liquidityChangeUSD = getPercentChange(
    data.reserveUSD,
    oneDayData?.reserveUSD,
  );

  // format if pair hasnt existed for a day or a week
  if (!oneDayData && data && data.createdAtBlockNumber > oneDayBlock) {
    data.oneDayVolumeUSD =
      Number(data.volumeUSD ?? 0) ?? Number(data.untrackedVolumeUSD ?? 0);
  }
  if (!oneDayData && data) {
    data.oneDayVolumeUSD =
      Number(data.volumeUSD ?? 0) ?? Number(data.untrackedVolumeUSD ?? 0);
  }
  if (!oneWeekData && data) {
    data.oneWeekVolumeUSD =
      Number(data.volumeUSD ?? 0) ?? Number(data.untrackedVolumeUSD ?? 0);
  }

  // format incorrect names
  updateNameData(data);

  return data;
};

export function updateNameData(data: BasicData): BasicData | undefined {
  if (
    data?.token0?.id &&
    Object.keys(TOKEN_OVERRIDES).includes(data.token0.id)
  ) {
    data.token0.name = TOKEN_OVERRIDES[data.token0.id].name;
    data.token0.symbol = TOKEN_OVERRIDES[data.token0.id].symbol;
  }

  if (
    data?.token1?.id &&
    Object.keys(TOKEN_OVERRIDES).includes(data.token1.id)
  ) {
    data.token1.name = TOKEN_OVERRIDES[data.token1.id].name;
    data.token1.symbol = TOKEN_OVERRIDES[data.token1.id].symbol;
  }

  return data;
}

export async function getGlobalData(
  ethPrice: number,
  oldEthPrice: number,
): Promise<any> {
  // data for each day , historic data used for % changes
  let data: any = {};
  let oneDayData: any = {};
  let twoDayData: any = {};

  try {
    // get timestamps for the days
    const utcCurrentTime = dayjs();
    //utcCurrentTime = utcCurrentTime.subtract(0.3, 'day');

    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
    const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix();
    const utcOneWeekBack = utcCurrentTime.subtract(1, 'week').unix();
    const utcTwoWeeksBack = utcCurrentTime.subtract(2, 'week').unix();

    // get the blocks needed for time travel queries
    const [
      oneDayBlock,
      twoDayBlock,
      oneWeekBlock,
      twoWeekBlock,
    ] = await getBlocksFromTimestamps([
      utcOneDayBack,
      utcTwoDaysBack,
      utcOneWeekBack,
      utcTwoWeeksBack,
    ]);

    // fetch the global data
    const result = await clientV2.query({
      query: GLOBAL_DATA(),
      fetchPolicy: 'network-only',
    });
    data = result.data.uniswapFactories[0];

    const queryReq = [
      { index: 'result', block: null },
      { index: 'oneDayData', block: oneDayBlock?.number },
      { index: 'twoDayData', block: twoDayBlock?.number },
      { index: 'oneWeekData', block: oneWeekBlock?.number },
      { index: 'twoWeekData', block: twoWeekBlock?.number },
    ];
    const allData = await clientV2.query({
      query: GLOBAL_ALLDATA(queryReq),
      fetchPolicy: 'network-only',
    });
    data = allData.data['result'][0];
    oneDayData = allData.data['oneDayData'][0];
    twoDayData = allData.data['twoDayData'][0];
    const oneWeekData = allData.data['oneWeekData'][0];
    const twoWeekData = allData.data['twoWeekData'][0];

    if (data && oneDayData && twoDayData && twoWeekData) {
      const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
        data.totalVolumeUSD,
        oneDayData.totalVolumeUSD ? oneDayData.totalVolumeUSD : 0,
        twoDayData.totalVolumeUSD ? twoDayData.totalVolumeUSD : 0,
      );

      const [oneWeekVolume, weeklyVolumeChange] = get2DayPercentChange(
        data.totalVolumeUSD,
        oneWeekData.totalVolumeUSD,
        twoWeekData.totalVolumeUSD,
      );

      const [oneDayTxns, txnChange] = get2DayPercentChange(
        data.txCount,
        oneDayData.txCount ? oneDayData.txCount : 0,
        twoDayData.txCount ? twoDayData.txCount : 0,
      );

      // format the total liquidity in USD
      const liquidityChangeUSD = getPercentChange(
        data.totalLiquidityETH * ethPrice,
        oneDayData.totalLiquidityETH * oldEthPrice,
      );
      return {
        ...data,
        totalLiquidityUSD: data.totalLiquidityETH * ethPrice,
        oneDayVolumeUSD,
        oneWeekVolume,
        weeklyVolumeChange,
        volumeChangeUSD,
        liquidityChangeUSD,
        oneDayTxns,
        txnChange,
      };
    }
  } catch (e) {
    console.log(e);
  }

  return data;
}

export async function getAllPairsOnUniswap() {
  try {
    let allFound = false;
    let pairs: any[] = [];
    let skipCount = 0;
    while (!allFound) {
      const result = await clientV2.query({
        query: ALL_PAIRS,
        variables: {
          skip: skipCount,
        },
        fetchPolicy: 'network-only',
      });
      skipCount = skipCount + 10;
      pairs = pairs.concat(result?.data?.pairs);
      if (result?.data?.pairs.length < 10 || pairs.length > 10) {
        allFound = true;
      }
    }
    return pairs;
  } catch (e) {
    console.log(e);
  }
}

export async function getAllTokensOnUniswap() {
  try {
    let allFound = false;
    let skipCount = 0;
    let tokens: any[] = [];
    while (!allFound) {
      const result = await clientV2.query({
        query: ALL_TOKENS,
        variables: {
          skip: skipCount,
        },
        fetchPolicy: 'network-only',
      });
      tokens = tokens.concat(result?.data?.tokens);
      if (result?.data?.tokens?.length < 10 || tokens.length > 10) {
        allFound = true;
      }
      skipCount = skipCount += 10;
    }
    return tokens;
  } catch (e) {
    console.log(e);
  }
}

export const getChartData = async (oldestDateToFetch: number) => {
  let data: any[] = [];
  const weeklyData: any[] = [];
  const utcEndTime = dayjs.utc();
  let skip = 0;
  let allFound = false;

  try {
    while (!allFound) {
      const result = await clientV2.query({
        query: GLOBAL_CHART,
        variables: {
          startTime: oldestDateToFetch,
          skip,
        },
        fetchPolicy: 'network-only',
      });
      skip += 1000;
      data = data.concat(
        result.data.uniswapDayDatas.map((item: any) => {
          return { ...item, dailyVolumeUSD: Number(item.dailyVolumeUSD) };
        }),
      );
      if (result.data.uniswapDayDatas.length < 1000) {
        allFound = true;
      }
    }

    if (data) {
      const dayIndexSet = new Set();
      const dayIndexArray: any[] = [];
      const oneDay = 24 * 60 * 60;

      // for each day, parse the daily volume and format for chart array
      data.forEach((dayData, i) => {
        // add the day index to the set of days
        dayIndexSet.add((data[i].date / oneDay).toFixed(0));
        dayIndexArray.push(data[i]);
      });

      // fill in empty days ( there will be no day datas if no trades made that day )
      let timestamp = data[0].date ? data[0].date : oldestDateToFetch;
      let latestLiquidityUSD = data[0].totalLiquidityUSD;
      let latestDayDats = data[0].mostLiquidTokens;
      let index = 1;
      while (timestamp < utcEndTime.unix() - oneDay) {
        const nextDay = timestamp + oneDay;
        const currentDayIndex = (nextDay / oneDay).toFixed(0);
        if (!dayIndexSet.has(currentDayIndex)) {
          data.push({
            date: nextDay,
            dailyVolumeUSD: 0,
            totalLiquidityUSD: latestLiquidityUSD,
            mostLiquidTokens: latestDayDats,
          });
        } else {
          latestLiquidityUSD = dayIndexArray[index].totalLiquidityUSD;
          latestDayDats = dayIndexArray[index].mostLiquidTokens;
          index = index + 1;
        }
        timestamp = nextDay;
      }
    }

    // format weekly data for weekly sized chunks
    data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1));
    let startIndexWeekly = -1;
    let currentWeek = -1;
    data.forEach((entry, i) => {
      const week = dayjs.utc(dayjs.unix(data[i].date)).week();
      if (week !== currentWeek) {
        currentWeek = week;
        startIndexWeekly++;
      }
      weeklyData[startIndexWeekly] = weeklyData[startIndexWeekly] || {};
      weeklyData[startIndexWeekly].date = data[i].date;
      weeklyData[startIndexWeekly].weeklyVolumeUSD =
        (weeklyData[startIndexWeekly].weeklyVolumeUSD ?? 0) +
        data[i].dailyVolumeUSD;
    });
  } catch (e) {
    console.log(e);
  }
  return [data, weeklyData];
};

export function isAddress(value: string | null | undefined): string | false {
  try {
    return getAddress(value || '');
  } catch {
    return false;
  }
}

/**
 * Given the price impact, get user confirmation.
 *
 * @param priceImpactWithoutFee price impact of the trade without the fee.
 */
export function confirmPriceImpactWithoutFee(
  priceImpactWithoutFee: Percent,
  translation: TFunction,
): boolean {
  if (
    !priceImpactWithoutFee.lessThan(
      GlobalValue.percents.PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN,
    )
  ) {
    return (
      window.prompt(
        translation('typeConfirmSwapPriceImpact', {
          priceImpact: GlobalValue.percents.PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN.toFixed(
            0,
          ),
        }),
      ) === 'confirm'
    );
  } else if (
    !priceImpactWithoutFee.lessThan(
      GlobalValue.percents.ALLOWED_PRICE_IMPACT_HIGH,
    )
  ) {
    return window.confirm(
      translation('confirmSwapPriceImpact', {
        priceImpact: GlobalValue.percents.ALLOWED_PRICE_IMPACT_HIGH.toFixed(0),
      }),
    );
  }
  return true;
}

export function currencyId(currency: Currency): string {
  if (currency === ETHER) return 'ETH';
  if (currency instanceof Token) return currency.address;
  throw new Error('invalid currency');
}

export function calculateSlippageAmount(
  value: CurrencyAmount,
  slippage: number,
): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`);
  }
  return [
    JSBI.divide(
      JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)),
      JSBI.BigInt(10000),
    ),
    JSBI.divide(
      JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)),
      JSBI.BigInt(10000),
    ),
  ];
}

export function calculateSlippageAmountV3(
  value: CurrencyAmountV3<CurrencyV3>,
  slippage: number,
): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`);
  }
  return [
    JSBI.divide(
      JSBI.multiply(
        JSBI.BigInt(value.toExact()),
        JSBI.BigInt(10000 - slippage),
      ),
      JSBI.BigInt(10000),
    ),
    JSBI.divide(
      JSBI.multiply(
        JSBI.BigInt(value.toExact()),
        JSBI.BigInt(10000 + slippage),
      ),
      JSBI.BigInt(10000),
    ),
  ];
}

export function maxAmountSpend(
  currencyAmount?: CurrencyAmount,
): CurrencyAmount | undefined {
  if (!currencyAmount) return undefined;
  if (currencyAmount.currency === ETHER) {
    if (JSBI.greaterThan(currencyAmount.raw, GlobalConst.utils.MIN_ETH)) {
      return CurrencyAmount.ether(
        JSBI.subtract(currencyAmount.raw, GlobalConst.utils.MIN_ETH),
      );
    } else {
      return CurrencyAmount.ether(JSBI.BigInt(0));
    }
  }
  return currencyAmount;
}

export function isTokenOnList(
  defaultTokens: TokenAddressMap,
  currency?: Currency,
): boolean {
  if (currency === ETHER) return true;
  return Boolean(
    currency instanceof Token &&
      defaultTokens[currency.chainId]?.[currency.address],
  );
}

export function isTokensOnList(
  defaultTokens: TokenAddressMap,
  currencies: (Currency | undefined)[],
): boolean[] {
  return currencies.map((currency) => {
    if (currency === ETHER) return true;
    return Boolean(
      currency instanceof Token &&
        defaultTokens[currency.chainId]?.[currency.address],
    );
  });
}

export enum ExplorerDataType {
  TRANSACTION = 'transaction',
  TOKEN = 'token',
  ADDRESS = 'address',
  BLOCK = 'block',
}

export function getEtherscanLink(
  chainId: ChainId,
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block' | ExplorerDataType,
): string {
  const prefix =
    'https://' + (chainId === 80001 ? 'mumbai.' : '') + 'polygonscan.com';

  switch (type) {
    case 'transaction':
    case ExplorerDataType.TRANSACTION: {
      return `${prefix}/tx/${data}`;
    }
    case 'token':
    case ExplorerDataType.TOKEN: {
      return `${prefix}/token/${data}`;
    }
    case 'block':
    case ExplorerDataType.BLOCK: {
      return `${prefix}/block/${data}`;
    }
    case 'address':
    case ExplorerDataType.ADDRESS:
    default: {
      return `${prefix}/address/${data}`;
    }
  }
}

export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000));
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address);
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`;
}

export const shortenTx = (tx: string) => {
  if (tx.length) {
    const txLength = tx.length;
    const first = tx.slice(0, 6);
    const last = tx.slice(txLength - 4, txLength);
    return `${first}...${last}`;
  }
  return '';
};

export function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider, 'any');
  library.pollingInterval = 15000;
  return library;
}

export function isZero(hexNumberString: string): boolean {
  return /^0x0*$/.test(hexNumberString);
}

export function getSigner(
  library: Web3Provider,
  account: string,
): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked();
}

export function getProviderOrSigner(
  library: Web3Provider,
  account?: string,
): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library;
}

export function getContract(
  address: string,
  ABI: any,
  library: Web3Provider,
  account?: string,
): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }

  return new Contract(
    address,
    ABI,
    getProviderOrSigner(library, account) as any,
  );
}

export function calculateGasMargin(value: BigNumber): BigNumber {
  return value
    .mul(BigNumber.from(10000).add(BigNumber.from(1000)))
    .div(BigNumber.from(10000));
}

export function calculateGasMarginBonus(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(2));
}

export function calculateGasMarginV3(
  chainId: number,
  value: BigNumber,
  swap?: boolean,
): BigNumber {
  if (swap) {
    return value.mul(BigNumber.from(10000 + 2000)).div(BigNumber.from(10000));
  }

  return value.mul(BigNumber.from(10000 + 2000)).div(BigNumber.from(10000));
}

export function formatDateFromTimeStamp(
  timestamp: number,
  format: string,
  addedDay = 0,
) {
  return dayjs
    .unix(timestamp)
    .add(addedDay, 'day')
    .utc()
    .format(format);
}

export function getFormattedPrice(price: number) {
  if (price < 0.001 && price > 0) {
    return '<0.001';
  } else if (price > -0.001 && price < 0) {
    return '>-0.001';
  } else {
    const beforeSign = price > 0 ? '+' : '';
    return beforeSign + price.toLocaleString('us');
  }
}

// set different bg and text colors for price percent badge according to price.
export function getPriceClass(price: number, transparent = false) {
  if (price > 0) {
    return transparent ? 'text-success' : 'bg-successLight text-success';
  } else if (price === 0) {
    return transparent ? 'text-hint' : 'bg-gray1 text-hint';
  } else {
    return transparent ? 'text-error' : 'bg-errorLight text-error';
  }
}

export function getDaysCurrentYear() {
  const year = Number(dayjs().format('YYYY'));
  return (year % 4 === 0 && year % 100 > 0) || year % 400 == 0 ? 366 : 365;
}

export function getOneYearFee(dayVolume: number, reserveUSD: number) {
  if (!dayVolume || !reserveUSD) {
    return 0;
  }

  return (
    (dayVolume * GlobalConst.utils.FEEPERCENT * getDaysCurrentYear()) /
    reserveUSD
  );
}

export function getAPYWithFee(rewards: number, fee: number) {
  return fee > 0 ? ((1 + ((rewards + fee / 12) * 12) / 12) ** 12 - 1) * 100 : 0;
}

export function formatAPY(apy: number) {
  if (apy > 100000000) {
    return '>100000000';
  } else {
    return apy.toLocaleString('us');
  }
}

export function formatNumber(
  unformatted: number | string | undefined,
  showDigits = 2,
) {
  // get fraction digits for small number
  if (!unformatted) return 0;
  const absNumber = Math.abs(Number(unformatted));
  if (absNumber > 0) {
    const digits = Math.ceil(Math.log10(1 / absNumber));
    if (digits < 3) {
      return Number(unformatted).toLocaleString('us');
    } else {
      return Number(unformatted).toFixed(digits + showDigits);
    }
  } else {
    return 0;
  }
}

export function getTokenFromAddress(
  tokenAddress: string,
  chainId: ChainId,
  tokenMap: TokenAddressMap,
  tokens: Token[],
) {
  const tokenIndex = Object.keys(tokenMap[chainId]).findIndex(
    (address) => address.toLowerCase() === tokenAddress.toLowerCase(),
  );
  if (tokenIndex === -1) {
    const token = tokens.find(
      (item) => item.address.toLowerCase() === tokenAddress.toLowerCase(),
    );
    if (!token) {
      const commonToken = Object.values(GlobalValue.tokens.COMMON).find(
        (token) => token.address.toLowerCase() === tokenAddress.toLowerCase(),
      );
      if (!commonToken) {
        return GlobalValue.tokens.COMMON.EMPTY;
      }
      return commonToken;
    }
    return token;
  }

  return Object.values(tokenMap[chainId])[tokenIndex];
}

export function getChartDates(chartData: any[] | null, durationIndex: number) {
  if (chartData) {
    const dates: string[] = [];
    chartData.forEach((value: any, ind: number) => {
      const month = formatDateFromTimeStamp(Number(value.date), 'MMM');
      const monthLastDate =
        ind > 0
          ? formatDateFromTimeStamp(Number(chartData[ind - 1].date), 'MMM')
          : '';
      if (monthLastDate !== month) {
        dates.push(month);
      }
      if (
        durationIndex === GlobalConst.analyticChart.ONE_MONTH_CHART ||
        durationIndex === GlobalConst.analyticChart.THREE_MONTH_CHART
      ) {
        const dateStr = formatDateFromTimeStamp(Number(value.date), 'D');
        if (
          Number(dateStr) %
            (durationIndex === GlobalConst.analyticChart.ONE_MONTH_CHART
              ? 3
              : 7) ===
          0
        ) {
          //Select dates(one date per 3 days for 1 month chart and 7 days for 3 month chart) for x axis values of volume chart on week mode
          dates.push(dateStr);
        }
      }
    });
    return dates;
  } else {
    return [];
  }
}

export function getChartStartTime(durationIndex: number) {
  const utcEndTime = dayjs.utc();
  const months =
    durationIndex === GlobalConst.analyticChart.SIX_MONTH_CHART
      ? 6
      : durationIndex === GlobalConst.analyticChart.THREE_MONTH_CHART
      ? 3
      : 1;
  const startTime =
    utcEndTime
      .subtract(
        months,
        durationIndex === GlobalConst.analyticChart.ONE_YEAR_CHART
          ? 'year'
          : 'month',
      )
      .endOf('day')
      .unix() - 1;
  return startTime;
}

export function getLimitedData(data: any[], count: number) {
  const dataCount = data.length;
  const newArray: any[] = [];
  data.forEach((value, index) => {
    if (dataCount <= count) {
      newArray.push(value);
    } else {
      if (
        index ===
        dataCount - Math.floor((dataCount / count) * (count - newArray.length))
      ) {
        newArray.push(value);
      }
    }
  });
  return newArray;
}

export function getYAXISValuesAnalytics(chartData: any) {
  if (!chartData) return;
  // multiply 0.99 to the min value of chart values and 1.01 to the max value in order to show all data in graph. Without this, the scale of the graph is set strictly and some values may be hidden.
  const minValue = Math.min(...chartData) * 0.99;
  const maxValue = Math.max(...chartData) * 1.01;
  const step = (maxValue - minValue) / 8;
  const values = [];
  for (let i = 0; i < 9; i++) {
    values.push(maxValue - i * step);
  }
  return values;
}

export function getTokenAPRSyrup(syrup: SyrupInfo) {
  return syrup.valueOfTotalStakedAmountInUSDC &&
    syrup.valueOfTotalStakedAmountInUSDC > 0
    ? ((syrup.rewards ?? 0) / syrup.valueOfTotalStakedAmountInUSDC) *
        getDaysCurrentYear() *
        100
    : 0;
}

export function useLairDQUICKAPY(isNew: boolean, lair?: LairInfo) {
  const daysCurrentYear = getDaysCurrentYear();
  const quickToken = isNew
    ? GlobalValue.tokens.COMMON.NEW_QUICK
    : GlobalValue.tokens.COMMON.OLD_QUICK;
  const quickPrice = useUSDCPriceToken(quickToken);
  const [feesPercent, setFeesPercent] = useState(0);
  const { ethPrice } = useEthPrice();

  useEffect(() => {
    (async () => {
      let feePercent = 0;
      if (ethPrice.price && ethPrice.oneDayPrice) {
        const v3Data = await getGlobalDataV3();
        const v2data = await getGlobalData(
          ethPrice.price,
          ethPrice.oneDayPrice,
        );
        if (v2data && v3Data) {
          feePercent +=
            Number(v3Data.feesUSD ?? 0) / 7.5 +
            (Number(v2data.oneDayVolumeUSD) * GlobalConst.utils.FEEPERCENT) /
              14.7;
        } else if (v3Data) {
          feePercent += Number(v3Data.feesUSD ?? 0) / 7.5;
        }
        setFeesPercent(feePercent);
      }
    })();
  }, [ethPrice.oneDayPrice, ethPrice.price]);

  if (!lair) return '';

  const dQUICKAPR =
    (feesPercent * daysCurrentYear) /
    (Number(lair.totalQuickBalance.toExact()) * quickPrice);
  if (!dQUICKAPR) return '';
  const temp = Math.pow(1 + dQUICKAPR / daysCurrentYear, daysCurrentYear) - 1;
  if (temp > 100) {
    return '> 10000';
  } else {
    return Number(temp * 100).toLocaleString('us');
  }
}

export function returnFullWidthMobile(isMobile: boolean) {
  return isMobile ? 1 : 'unset';
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function getWalletKeys(
  connector: AbstractConnector | undefined,
): string[] {
  const { ethereum } = window as any;
  const isMetaMask = !!(
    ethereum &&
    !ethereum.isBitKeep &&
    !ethereum.isBraveWallet &&
    ethereum.isMetaMask
  );
  const isBitkeep = !!(ethereum && ethereum.isBitKeep);
  const isBlockWallet = !!(ethereum && ethereum.isBlockWallet);
  const isCypherDWallet = !!(ethereum && ethereum.isCypherD);
  const isBraveWallet = !!(ethereum && ethereum.isBraveWallet);
  return Object.keys(SUPPORTED_WALLETS).filter(
    (k) =>
      SUPPORTED_WALLETS[k].connector === connector &&
      (connector !== injected ||
        (isCypherDWallet && k == 'CYPHERD') ||
        (isBlockWallet && k === 'BLOCKWALLET') ||
        (isBitkeep && k === 'BITKEEP') ||
        (isMetaMask && k === 'METAMASK') ||
        (isBraveWallet && k === 'BRAVEWALLET')),
  );
}

export function getTokenAddress(token: Token | undefined) {
  if (!token) return;
  if (token.symbol?.toLowerCase() === 'wmatic') return 'ETH';
  return token.address;
}

export function getRewardRate(rate?: TokenAmount, rewardToken?: Token) {
  if (!rate || !rewardToken) return;
  return `${rate.toFixed(2, { groupSeparator: ',' }).replace(/[.,]00$/, '')} ${
    rewardToken.symbol
  }  / day`;
}

export function getStakedAmountStakingInfo(
  stakingInfo?: StakingInfo | DualStakingInfo,
  userLiquidityUnstaked?: TokenAmount,
) {
  if (!stakingInfo) return;
  const stakingTokenPair = stakingInfo.stakingTokenPair;
  const baseTokenCurrency = unwrappedToken(stakingInfo.baseToken);
  const empty = unwrappedToken(GlobalValue.tokens.COMMON.EMPTY);
  const token0 = stakingInfo.tokens[0];
  const baseToken =
    baseTokenCurrency === empty ? token0 : stakingInfo.baseToken;
  if (
    !stakingInfo.totalSupply ||
    !stakingTokenPair ||
    !stakingInfo.totalStakedAmount ||
    !stakingInfo.stakedAmount
  )
    return;
  // take the total amount of LP tokens staked, multiply by ETH value of all LP tokens, divide by all LP tokens
  const valueOfTotalStakedAmountInBaseToken = new TokenAmount(
    baseToken,
    JSBI.divide(
      JSBI.multiply(
        JSBI.multiply(
          stakingInfo.totalStakedAmount.raw,
          stakingTokenPair.reserveOf(baseToken).raw,
        ),
        JSBI.BigInt(2), // this is b/c the value of LP shares are ~double the value of the WETH they entitle owner to
      ),
      stakingInfo.totalSupply.raw,
    ),
  );

  const valueOfMyStakedAmountInBaseToken = new TokenAmount(
    baseToken,
    JSBI.divide(
      JSBI.multiply(
        JSBI.multiply(
          stakingInfo.stakedAmount.raw,
          stakingTokenPair.reserveOf(baseToken).raw,
        ),
        JSBI.BigInt(2), // this is b/c the value of LP shares are ~double the value of the WETH they entitle owner to
      ),
      stakingInfo.totalSupply.raw,
    ),
  );

  // get the USD value of staked WETH
  const USDPrice = stakingInfo.usdPrice;
  const valueOfTotalStakedAmountInUSDC = USDPrice?.quote(
    valueOfTotalStakedAmountInBaseToken,
  );

  const valueOfMyStakedAmountInUSDC = USDPrice?.quote(
    valueOfMyStakedAmountInBaseToken,
  );

  const stakedAmounts = {
    totalStakedBase: valueOfTotalStakedAmountInBaseToken,
    totalStakedUSD: valueOfTotalStakedAmountInUSDC,
    myStakedBase: valueOfMyStakedAmountInBaseToken,
    myStakedUSD: valueOfMyStakedAmountInUSDC,
    unStakedBase: undefined,
    unStakedUSD: undefined,
  };

  if (!userLiquidityUnstaked) return stakedAmounts;

  const valueOfUnstakedAmountInBaseToken = new TokenAmount(
    baseToken,
    JSBI.divide(
      JSBI.multiply(
        JSBI.multiply(
          userLiquidityUnstaked.raw,
          stakingTokenPair.reserveOf(baseToken).raw,
        ),
        JSBI.BigInt(2),
      ),
      stakingInfo.totalSupply.raw,
    ),
  );

  const valueOfUnstakedAmountInUSDC = USDPrice?.quote(
    valueOfUnstakedAmountInBaseToken,
  );
  return {
    ...stakedAmounts,
    unStakedBase: valueOfUnstakedAmountInBaseToken,
    unStakedUSD: valueOfUnstakedAmountInUSDC,
  };
}

export function formatTokenAmount(
  amount?: TokenAmount | CurrencyAmount,
  digits = 3,
) {
  if (!amount) return '-';
  const amountStr = amount.toExact();
  if (Math.abs(Number(amountStr)) > 1) {
    return Number(amountStr).toLocaleString('us');
  }
  return amount.toSignificant(digits);
}

export function formatMulDivTokenAmount(
  amount?: TokenAmount,
  otherAmount?: number | string,
  operator = 'mul',
  digits = 3,
) {
  if (!amount || otherAmount === undefined) return '-';
  if (otherAmount === 0) return 0;

  const exactAmount = Number(amount.toExact());

  let resultAmount;
  if (operator === 'mul') resultAmount = exactAmount * Number(otherAmount);
  else resultAmount = exactAmount / Number(otherAmount);

  if (Math.abs(resultAmount) > 1) return resultAmount.toLocaleString('us');

  if (operator === 'mul')
    return amount.multiply(otherAmount.toString()).toSignificant(digits);
  return amount.divide(otherAmount.toString()).toSignificant(digits);
}

export function getTVLStaking(
  valueOfTotalStakedAmountInUSDC?: CurrencyAmount,
  valueOfTotalStakedAmountInBaseToken?: TokenAmount,
) {
  if (!valueOfTotalStakedAmountInUSDC) {
    return `${formatTokenAmount(valueOfTotalStakedAmountInBaseToken)} ETH`;
  }
  return `$${formatTokenAmount(valueOfTotalStakedAmountInUSDC)}`;
}

export function getUSDString(usdValue?: CurrencyAmount) {
  if (!usdValue) return '$0';
  const value = Number(usdValue.toExact());
  if (value > 0 && value < 0.001) return '< $0.001';
  return `$${value.toLocaleString('us')}`;
}

export function getEarnedUSDSyrup(syrup?: SyrupInfo) {
  if (!syrup || !syrup.earnedAmount || !syrup.rewardTokenPriceinUSD) return '-';
  const earnedUSD =
    Number(syrup.earnedAmount.toExact()) * Number(syrup.rewardTokenPriceinUSD);
  if (earnedUSD > 0 && earnedUSD < 0.001) return '< $0.001';
  return `$${earnedUSD.toLocaleString('us')}`;
}

export function getEarnedUSDLPFarm(stakingInfo: StakingInfo | undefined) {
  if (!stakingInfo || !stakingInfo.earnedAmount) return;
  const earnedUSD =
    Number(stakingInfo.earnedAmount.toExact()) * stakingInfo.rewardTokenPrice;
  if (earnedUSD < 0.001 && earnedUSD > 0) {
    return '< $0.001';
  }
  return `$${earnedUSD.toLocaleString('us')}`;
}

export function getEarnedUSDDualFarm(stakingInfo: DualStakingInfo | undefined) {
  if (!stakingInfo || !stakingInfo.earnedAmountA || !stakingInfo.earnedAmountB)
    return;
  const earnedUSD =
    Number(stakingInfo.earnedAmountA.toExact()) *
      stakingInfo.rewardTokenAPrice +
    Number(stakingInfo.earnedAmountB.toExact()) *
      Number(stakingInfo.rewardTokenBPrice);
  if (earnedUSD < 0.001 && earnedUSD > 0) {
    return '< $0.001';
  }
  return `$${earnedUSD.toLocaleString('us')}`;
}

export function isSupportedNetwork(ethereum: any) {
  return Number(ethereum.chainId) === 137;
}

export function getPageItemsToLoad(index: number, countsPerPage: number) {
  return index === 0 ? countsPerPage : countsPerPage * index;
}

export function getExactTokenAmount(amount?: TokenAmount | CurrencyAmount) {
  if (!amount) return 0;
  return Number(amount.toExact());
}

// this is useful when the value has more digits than token decimals
export function getValueTokenDecimals(value: string, token?: Token | Currency) {
  if (!token) return '0';
  const valueDigits = value.split('.');
  const valueDigitStr = valueDigits.length > 1 ? valueDigits[1] : '';
  const valueDigitCount = valueDigitStr.length;
  if (valueDigitCount > token.decimals) {
    return value.substring(
      0,
      value.length - (valueDigitCount - token.decimals),
    );
  }
  return value;
}

export function getPartialTokenAmount(
  percent: number,
  amount?: TokenAmount | CurrencyAmount,
) {
  if (!amount) return '0';
  if (percent === 100) return amount.toExact();
  const partialAmount = (Number(amount.toExact()) * percent) / 100;
  return getValueTokenDecimals(partialAmount.toString(), amount.currency);
}

export function getResultFromCallState(callState: CallState) {
  if (!callState || !callState.result || !callState.result[0]) {
    return;
  }

  return callState.result[0];
}

export function initTokenAmountFromCallResult(
  token: Token,
  callState?: CallState,
) {
  if (!callState || !callState.result || !callState.result[0]) return;
  return new TokenAmount(token, JSBI.BigInt(callState.result[0]));
}

export function getFarmLPToken(
  info: StakingInfo | DualStakingInfo | StakingBasic | DualStakingBasic,
) {
  const lp = info.lp;
  const dummyPair = new Pair(
    new TokenAmount(info.tokens[0], '0'),
    new TokenAmount(info.tokens[1], '0'),
  );
  if (lp && lp !== '') return new Token(137, lp, 18, 'SLP', 'Staked LP');
  return dummyPair.liquidityToken;
}

export function getSyrupLPToken(info: SyrupBasic | SyrupInfo) {
  const lp = info.lp;
  if (lp && lp !== '') return new Token(137, lp, 18, 'SLP', 'Staked LP');
  return info.stakingToken;
}

export function getCallStateResult(callState?: CallState) {
  if (callState && callState.result) return callState.result[0];
  return;
}

export const convertBNToNumber = (value: BN, decimals: BN) => {
  return Number(
    formatUnits(BigNumber.from(value.toString()), Number(decimals)),
  );
};

export const convertNumbertoBN = (
  value: number,
  decimals: number,
  web3: Web3,
) => {
  const valueWithoutDecimal = Math.floor(value);
  const decimalNumber = value - valueWithoutDecimal;

  return web3.utils
    .toBN(valueWithoutDecimal)
    .mul(web3.utils.toBN(10 ** decimals))
    .add(
      web3.utils.toBN(Math.floor(decimalNumber * 10 ** decimals).toString()),
    );
};

export const getEternalFarmFromTokens = async (
  token0: string,
  token1: string,
) => {
  try {
    const result = await clientV3.query({
      query: FETCH_POOL_FROM_TOKENS(),
      variables: { token0, token1 },
      fetchPolicy: 'network-only',
    });
    const poolID =
      result &&
      result.data &&
      result.data.pools0 &&
      result.data.pools0.length > 0
        ? result.data.pools0[0].id
        : result &&
          result.data &&
          result.data.pools1 &&
          result.data.pools1.length > 0
        ? result.data.pools1[0].id
        : undefined;
    if (!poolID) return;
    const eternalFarmResult = await farmingClient.query({
      query: FETCH_ETERNAL_FARM_FROM_POOL([poolID]),
      fetchPolicy: 'network-only',
    });
    const eternalFarm =
      eternalFarmResult &&
      eternalFarmResult.data &&
      eternalFarmResult.data.eternalFarmings &&
      eternalFarmResult.data.eternalFarmings.length > 0
        ? eternalFarmResult.data.eternalFarmings[0]
        : undefined;

    return eternalFarm;
  } catch (e) {
    return;
  }
};

export const getGammaData = async () => {
  try {
    const data = await fetch(
      `${process.env.REACT_APP_GAMMA_API_ENDPOINT}/quickswap/polygon/hypervisors/allData`,
    );
    const gammaData = await data.json();
    return gammaData;
  } catch {
    try {
      const data = await fetch(
        `${process.env.REACT_APP_GAMMA_API_ENDPOINT_BACKUP}/quickswap/polygon/hypervisors/allData`,
      );
      const gammaData = await data.json();
      return gammaData;
    } catch (e) {
      console.log(e);
      return;
    }
  }
};

export const getGammaPositions = async (account?: string) => {
  if (!account) return;
  try {
    const data = await fetch(
      `${process.env.REACT_APP_GAMMA_API_ENDPOINT}/quickswap/polygon/user/${account}`,
    );
    const positions = await data.json();
    return positions[account.toLowerCase()];
  } catch {
    try {
      const data = await fetch(
        `${process.env.REACT_APP_GAMMA_API_ENDPOINT_BACKUP}/quickswap/polygon/user/${account}`,
      );
      const positions = await data.json();
      return positions[account.toLowerCase()];
    } catch (e) {
      console.log(e);
      return;
    }
  }
};

export const getGammaRewards = async (chainId?: ChainId) => {
  if (!chainId) return;
  const masterChefAddress = GAMMA_MASTERCHEF_ADDRESSES[chainId];
  try {
    const data = await fetch(
      `${process.env.REACT_APP_GAMMA_API_ENDPOINT}/quickswap/polygon/allRewards2`,
    );
    const gammaData = await data.json();
    return gammaData && gammaData[masterChefAddress]
      ? gammaData[masterChefAddress]['pools']
      : undefined;
  } catch {
    try {
      const data = await fetch(
        `${process.env.REACT_APP_GAMMA_API_ENDPOINT_BACKUP}/quickswap/polygon/allRewards2`,
      );
      const gammaData = await data.json();
      return gammaData && gammaData[masterChefAddress]
        ? gammaData[masterChefAddress]['pools']
        : undefined;
    } catch (e) {
      console.log(e);
      return;
    }
  }
};
