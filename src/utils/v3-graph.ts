import { clientV3, farmingClient } from 'apollo/client';
import {
  ALL_PAIRS_V3,
  ALL_TOKENS_V3,
  FETCH_ETERNAL_FARM_FROM_POOL_V3,
  FETCH_TICKS,
  GLOBAL_CHART_V3,
  GLOBAL_DATA_V3,
  GLOBAL_TRANSACTIONS_V3,
  IS_PAIR_EXISTS_V3,
  IS_TOKEN_EXISTS_V3,
  MATIC_PRICE_V3,
  PAIRS_FROM_ADDRESSES_V3,
  PAIR_CHART_V3,
  PAIR_FEE_CHART_V3,
  PAIR_TRANSACTIONS_v3,
  PRICES_BY_BLOCK_V3,
  TOKENS_FROM_ADDRESSES_V3,
  TOKEN_CHART_V3,
  TOP_POOLS_V3,
  TOP_POOLS_V3_TOKEN,
  TOP_POOLS_V3_TOKENS,
  TOP_TOKENS_V3,
} from 'apollo/queries-v3';
import {
  get2DayPercentChange,
  getBlockFromTimestamp,
  getBlocksFromTimestamps,
  getPercentChange,
  getSecondsOneDay,
  splitQuery,
} from 'utils';
import dayjs from 'dayjs';
import { fetchEternalFarmAPR, fetchPoolsAPR } from './api';
import { Token } from '@uniswap/sdk-core';
import { TickMath, tickToPrice } from '@uniswap/v3-sdk';
import { JSBI } from '@uniswap/sdk';
import keyBy from 'lodash.keyby';
import { TxnType } from 'constants/index';

//Global

export async function getGlobalDataV3(): Promise<any> {
  let data: any = {};

  try {
    const utcCurrentTime = dayjs();

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

    const dataCurrent = await clientV3.query({
      query: GLOBAL_DATA_V3(),
      fetchPolicy: 'network-only',
    });

    const dataOneDay = await clientV3.query({
      query: GLOBAL_DATA_V3(oneDayBlock.number),
      fetchPolicy: 'network-only',
    });

    const dataTwoDay = await clientV3.query({
      query: GLOBAL_DATA_V3(twoDayBlock.number),
      fetchPolicy: 'network-only',
    });

    const dataOneWeek = await clientV3.query({
      query: GLOBAL_DATA_V3(oneWeekBlock.number),
      fetchPolicy: 'network-only',
    });

    const dataTwoWeek = await clientV3.query({
      query: GLOBAL_DATA_V3(twoWeekBlock.number),
      fetchPolicy: 'network-only',
    });

    const [
      statsCurrent,
      statsOneDay,
      statsTwoDay,
      statsOneWeek,
      statsTwoWeek,
    ] = [
      dataCurrent &&
      dataCurrent.data &&
      dataCurrent.data.factories &&
      dataCurrent.data.factories.length > 0
        ? dataCurrent.data.factories[0]
        : undefined,
      dataOneDay &&
      dataOneDay.data &&
      dataOneDay.data.factories &&
      dataOneDay.data.factories.length > 0
        ? dataOneDay.data.factories[0]
        : undefined,
      dataTwoDay &&
      dataTwoDay.data &&
      dataTwoDay.data.factories &&
      dataTwoDay.data.factories.length > 0
        ? dataTwoDay.data.factories[0]
        : undefined,
      dataOneWeek &&
      dataOneWeek.data &&
      dataOneWeek.data.factories &&
      dataOneWeek.data.factories.length > 0
        ? dataOneWeek.data.factories[0]
        : undefined,
      dataTwoWeek &&
      dataTwoWeek.data &&
      dataTwoWeek.data.factories &&
      dataTwoWeek.data.factories.length > 0
        ? dataTwoWeek.data.factories[0]
        : undefined,
    ];

    const currentVolumeUSD = statsCurrent
      ? Number(statsCurrent.totalVolumeUSD)
      : 0;
    const oneDayBeforeVolumeUSD = statsOneDay
      ? Number(statsOneDay.totalVolumeUSD)
      : 0;
    const twoDayBeforeVolumeUSD = statsTwoDay
      ? Number(statsTwoDay.totalVolumeUSD)
      : 0;
    const oneWeekBeforeVolumeUSD = statsOneWeek
      ? Number(statsOneWeek.totalVolumeUSD)
      : 0;
    const twoWeekBeforeVolumeUSD = statsTwoWeek
      ? Number(statsTwoWeek.totalVolumeUSD)
      : 0;

    const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
      currentVolumeUSD,
      oneDayBeforeVolumeUSD,
      twoDayBeforeVolumeUSD,
    );

    const [oneWeekVolume, weeklyVolumeChange] = get2DayPercentChange(
      currentVolumeUSD,
      oneWeekBeforeVolumeUSD,
      twoWeekBeforeVolumeUSD,
    );

    const liquidityChangeUSD = getPercentChange(
      statsCurrent ? statsCurrent.totalValueLockedUSD : 0,
      statsOneDay ? statsOneDay.totalValueLockedUSD : 0,
    );

    const currentFeesUSD = statsCurrent ? Number(statsCurrent.totalFeesUSD) : 0;
    const oneDayFeesUSD = statsOneDay ? Number(statsOneDay.totalFeesUSD) : 0;
    const twoDayFeesUSD = statsTwoDay ? Number(statsTwoDay.totalFeesUSD) : 0;

    const [feesUSD, feesUSDChange] = get2DayPercentChange(
      currentFeesUSD,
      oneDayFeesUSD,
      twoDayFeesUSD,
    );

    const currentTxns = statsCurrent ? Number(statsCurrent.txCount) : 0;
    const oneDayTxns = statsOneDay ? Number(statsOneDay.txCount) : 0;
    const txCount = currentTxns - oneDayTxns;

    data = {
      totalLiquidityUSD: Number(statsCurrent.totalValueLockedUSD),
      liquidityChangeUSD,
      oneDayVolumeUSD,
      volumeChangeUSD,
      feesUSD,
      feesUSDChange,
      oneWeekVolume,
      weeklyVolumeChange,
      txCount,
      poolCount: statsCurrent ? statsCurrent.poolCount : 0,
    };
  } catch (e) {
    console.log(e);
  }

  return data;
}

export const getMaticPrice: () => Promise<number[]> = async () => {
  const utcCurrentTime = dayjs();

  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
  let maticPrice = 0;
  let maticPriceOneDay = 0;
  let priceChangeMatic = 0;

  try {
    const oneDayBlock = await getBlockFromTimestamp(utcOneDayBack);
    const result = await clientV3.query({
      query: MATIC_PRICE_V3(),
      fetchPolicy: 'network-only',
    });
    const resultOneDay = await clientV3.query({
      query: MATIC_PRICE_V3(oneDayBlock),
      fetchPolicy: 'network-only',
    });
    const currentPrice = Number(result?.data?.bundles[0]?.maticPriceUSD ?? 0);
    const oneDayBackPrice = Number(
      resultOneDay?.data?.bundles[0]?.maticPriceUSD ?? 0,
    );

    priceChangeMatic = getPercentChange(currentPrice, oneDayBackPrice);
    maticPrice = currentPrice;
    maticPriceOneDay = oneDayBackPrice;
  } catch (e) {
    console.log(e);
  }

  return [maticPrice, maticPriceOneDay, priceChangeMatic];
};

export const getChartDataV3 = async (oldestDateToFetch: number) => {
  let data: any[] = [];
  const weeklyData: any[] = [];
  const utcEndTime = dayjs.utc();
  let skip = 0;
  let allFound = false;

  try {
    while (!allFound) {
      const result = await clientV3.query({
        query: GLOBAL_CHART_V3,
        variables: {
          startTime: oldestDateToFetch,
          skip,
        },
        fetchPolicy: 'network-only',
      });
      skip += 1000;
      data = data.concat(
        result.data.algebraDayDatas.map((item: any) => {
          return { ...item, dailyVolumeUSD: Number(item.volumeUSD) };
        }),
      );
      if (result.data.algebraDayDatas.length < 1000) {
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
        dayData.totalLiquidityUSD = Number(dayData.tvlUSD);
      });

      // fill in empty days ( there will be no day datas if no trades made that day )
      let timestamp = data[0].date ? data[0].date : oldestDateToFetch;
      let latestLiquidityUSD = data[0].tvlUSD;
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
          latestLiquidityUSD = dayIndexArray[index].tvlUSD;
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
        Number(data[i].dailyVolumeUSD);
    });
  } catch (e) {
    console.log(e);
  }
  return [data, weeklyData];
};

//Tokens

export async function getTopTokensV3(
  maticPrice: number,
  maticPrice24H: number,
  count = 500,
): Promise<any> {
  try {
    const utcCurrentTime = dayjs();

    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
    const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix();

    const [oneDayBlock, twoDayBlock] = await getBlocksFromTimestamps([
      utcOneDayBack,
      utcTwoDaysBack,
    ]);

    const topTokensIds = await clientV3.query({
      query: TOP_TOKENS_V3(count),
      fetchPolicy: 'network-only',
    });

    const tokenAddresses: string[] = topTokensIds.data.tokens.map(
      (el: any) => el.id,
    );

    const tokensCurrent = await fetchTokensByTime(undefined, tokenAddresses);

    const tokens24 = await fetchTokensByTime(
      oneDayBlock.number,
      tokenAddresses,
    );
    const tokens48 = await fetchTokensByTime(
      twoDayBlock.number,
      tokenAddresses,
    );

    const parsedTokens = parseTokensData(tokensCurrent);
    const parsedTokens24 = parseTokensData(tokens24);
    const parsedTokens48 = parseTokensData(tokens48);

    const formatted = tokenAddresses.map((address: string) => {
      const current = parsedTokens[address];
      const oneDay = parsedTokens24[address];
      const twoDay = parsedTokens48[address];

      const manageUntrackedVolume = current
        ? +current.volumeUSD <= 1
          ? 'untrackedVolumeUSD'
          : 'volumeUSD'
        : '';
      const manageUntrackedTVL = current
        ? +current.totalValueLockedUSD <= 1
          ? 'totalValueLockedUSDUntracked'
          : 'totalValueLockedUSD'
        : '';

      const [oneDayVolumeUSD, volumeUSDChange] =
        current && oneDay && twoDay
          ? get2DayPercentChange(
              current[manageUntrackedVolume],
              oneDay[manageUntrackedVolume],
              twoDay[manageUntrackedVolume],
            )
          : current
          ? [parseFloat(current[manageUntrackedVolume]), 0]
          : [0, 0];

      const tvlUSD = current ? parseFloat(current[manageUntrackedTVL]) : 0;
      const tvlUSDChange = getPercentChange(
        current ? current[manageUntrackedTVL] : undefined,
        oneDay ? oneDay[manageUntrackedTVL] : undefined,
      );
      const tvlToken = current ? parseFloat(current[manageUntrackedTVL]) : 0;
      const priceUSD = current
        ? parseFloat(current.derivedMatic) * maticPrice
        : 0;
      const priceUSDOneDay = oneDay
        ? parseFloat(oneDay.derivedMatic) * maticPrice24H
        : 0;

      const priceChangeUSD =
        priceUSD && priceUSDOneDay
          ? getPercentChange(
              Number(priceUSD.toString()),
              Number(priceUSDOneDay.toString()),
            )
          : 0;

      const txCount =
        current && oneDay
          ? parseFloat(current.txCount) - parseFloat(oneDay.txCount)
          : current
          ? parseFloat(current.txCount)
          : 0;
      const feesUSD =
        current && oneDay
          ? parseFloat(current.feesUSD) - parseFloat(oneDay.feesUSD)
          : current
          ? parseFloat(current.feesUSD)
          : 0;

      return {
        exists: !!current,
        id: address,
        name: current ? formatTokenName(address, current.name) : '',
        symbol: current ? formatTokenSymbol(address, current.symbol) : '',
        decimals: current ? current.decimals : 18,
        oneDayVolumeUSD,
        volumeUSDChange,
        txCount,
        totalLiquidityUSD: tvlUSD,
        liquidityChangeUSD: tvlUSDChange,
        feesUSD,
        tvlToken,
        priceUSD,
        priceChangeUSD,
      };
    });

    return formatted;
  } catch (err) {
    console.error(err);
  }
}

export async function getTokenInfoV3(
  maticPrice: number,
  maticPrice24H: number,
  address: string,
): Promise<any> {
  try {
    const utcCurrentTime = dayjs();

    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
    const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix();
    const utcOneWeekBack = utcCurrentTime.subtract(7, 'day').unix();

    const [
      oneDayBlock,
      twoDayBlock,
      oneWeekBlock,
    ] = await getBlocksFromTimestamps([
      utcOneDayBack,
      utcTwoDaysBack,
      utcOneWeekBack,
    ]);

    const tokensCurrent = await fetchTokensByTime(undefined, [address]);
    const tokens24 = await fetchTokensByTime(oneDayBlock.number, [address]);
    const tokens48 = await fetchTokensByTime(twoDayBlock.number, [address]);

    const parsedTokens = parseTokensData(tokensCurrent);
    const parsedTokens24 = parseTokensData(tokens24);
    const parsedTokens48 = parseTokensData(tokens48);

    const current = parsedTokens[address];
    const oneDay = parsedTokens24[address];
    const twoDay = parsedTokens48[address];

    const manageUntrackedVolume = current
      ? +current.volumeUSD <= 1
        ? 'untrackedVolumeUSD'
        : 'volumeUSD'
      : '';
    const manageUntrackedTVL = current
      ? +current.totalValueLockedUSD <= 1
        ? 'totalValueLockedUSDUntracked'
        : 'totalValueLockedUSD'
      : '';

    const [oneDayVolumeUSD, volumeChangeUSD] =
      current && oneDay && twoDay
        ? get2DayPercentChange(
            current[manageUntrackedVolume],
            oneDay[manageUntrackedVolume],
            twoDay[manageUntrackedVolume],
          )
        : current
        ? [parseFloat(current[manageUntrackedVolume]), 0]
        : [0, 0];

    const tvlUSD = current ? parseFloat(current[manageUntrackedTVL]) : 0;
    const tvlUSDChange = getPercentChange(
      current ? current[manageUntrackedTVL] : undefined,
      oneDay ? oneDay[manageUntrackedTVL] : undefined,
    );

    const tvlToken = current ? parseFloat(current[manageUntrackedTVL]) : 0;
    const priceUSD = current
      ? parseFloat(current.derivedMatic) * maticPrice
      : 0;
    const priceUSDOneDay = oneDay
      ? parseFloat(oneDay.derivedMatic) * maticPrice24H
      : 0;

    const priceChangeUSD =
      priceUSD && priceUSDOneDay
        ? getPercentChange(
            Number(priceUSD.toString()),
            Number(priceUSDOneDay.toString()),
          )
        : 0;

    const txCount =
      current && oneDay
        ? parseFloat(current.txCount) - parseFloat(oneDay.txCount)
        : current
        ? parseFloat(current.txCount)
        : 0;

    const feesUSD =
      current && oneDay
        ? parseFloat(current.feesUSD) - parseFloat(oneDay.feesUSD)
        : current
        ? parseFloat(current.feesUSD)
        : 0;

    return current
      ? {
          id: address,
          name: current ? formatTokenName(address, current.name) : '',
          symbol: current ? formatTokenSymbol(address, current.symbol) : '',
          decimals: current ? current.decimals : 18,
          oneDayVolumeUSD,
          volumeChangeUSD,
          txCount,
          tvlUSD,
          tvlUSDChange,
          feesUSD,
          tvlToken,
          priceUSD,
          priceChangeUSD,
          liquidityChangeUSD: tvlUSDChange,
          totalLiquidityUSD: tvlUSD,
        }
      : undefined;
  } catch (err) {
    console.error(err);
  }
}

export async function getAllTokensV3() {
  try {
    let allFound = false;
    let skipCount = 0;
    let tokens: any[] = [];
    while (!allFound) {
      const result = await clientV3.query({
        query: ALL_TOKENS_V3,
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

export const getTokenChartDataV3 = async (
  tokenAddress: string,
  startTime: number,
) => {
  let data: any[] = [];
  const utcEndTime = dayjs.utc();
  try {
    let allFound = false;
    let skip = 0;
    while (!allFound) {
      const result = await clientV3.query({
        query: TOKEN_CHART_V3,
        variables: {
          startTime: startTime,
          tokenAddr: tokenAddress.toLowerCase(),
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
      dayData.dailyVolumeUSD = Number(dayData.volumeUSD);
      dayData.totalLiquidityUSD = Number(dayData.totalValueLockedUSD);
    });

    // fill in empty days
    let timestamp = data[0] && data[0].date ? data[0].date : startTime;
    let latestLiquidityUSD = data[0] && data[0].totalValueLockedUSD;
    let latestPriceUSD = data[0] && data[0].priceUSD;
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
        });
      } else {
        latestLiquidityUSD = dayIndexArray[index].totalValueLockedUSD;
        latestPriceUSD = dayIndexArray[index].priceUSD;
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

export async function isV3TokenExists(tokenAddress: string) {
  try {
    const token = await clientV3.query({
      query: IS_TOKEN_EXISTS_V3(tokenAddress.toLowerCase()),
    });

    if (token.errors) {
      return false;
    }
    return token.data.token;
  } catch {
    return false;
  }
}

//Pairs

export async function getTopPairsV3(count = 500) {
  try {
    const utcCurrentTime = dayjs();

    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
    const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix();
    const utcOneWeekBack = utcCurrentTime.subtract(1, 'week').unix();

    const [
      oneDayBlock,
      twoDayBlock,
      oneWeekBlock,
    ] = await getBlocksFromTimestamps([
      utcOneDayBack,
      utcTwoDaysBack,
      utcOneWeekBack,
    ]);

    const topPairsIds = await clientV3.query({
      query: TOP_POOLS_V3(count),
      fetchPolicy: 'network-only',
    });

    const pairsAddresses = topPairsIds.data.pools.map((el: any) => el.id);

    const pairsCurrent = await fetchPairsByTime(undefined, pairsAddresses);
    const pairs24 = await fetchPairsByTime(oneDayBlock.number, pairsAddresses);
    const pairs48 = await fetchPairsByTime(twoDayBlock.number, pairsAddresses);
    const pairsWeek = await fetchPairsByTime(
      oneWeekBlock.number,
      pairsAddresses,
    );

    const parsedPairs = parsePairsData(pairsCurrent);
    const parsedPairs24 = parsePairsData(pairs24);
    const parsedPairs48 = parsePairsData(pairs48);
    const parsedPairsWeek = parsePairsData(pairsWeek);

    const formatted = pairsAddresses.map((address: string) => {
      const current = parsedPairs[address];
      const oneDay = parsedPairs24[address];
      const twoDay = parsedPairs48[address];
      const week = parsedPairsWeek[address];

      if (!current) return;

      const manageUntrackedVolume =
        +current.volumeUSD <= 1 ? 'untrackedVolumeUSD' : 'volumeUSD';

      const manageUntrackedTVL =
        +current.totalValueLockedUSD <= 1
          ? 'totalValueLockedUSDUntracked'
          : 'totalValueLockedUSD';

      const [oneDayVolumeUSD, oneDayVolumeChangeUSD] =
        oneDay && twoDay
          ? get2DayPercentChange(
              current[manageUntrackedVolume],
              oneDay[manageUntrackedVolume],
              twoDay[manageUntrackedVolume],
            )
          : oneDay
          ? [
              parseFloat(current[manageUntrackedVolume]) -
                parseFloat(oneDay[manageUntrackedVolume]),
              0,
            ]
          : [parseFloat(current[manageUntrackedVolume]), 0];

      const oneWeekVolumeUSD = week
        ? parseFloat(current[manageUntrackedVolume]) -
          parseFloat(week[manageUntrackedVolume])
        : parseFloat(current[manageUntrackedVolume]);

      const tvlUSD = parseFloat(current[manageUntrackedTVL]);
      const tvlUSDChange = getPercentChange(
        current[manageUntrackedTVL],
        oneDay ? oneDay[manageUntrackedTVL] : undefined,
      );

      return {
        token0: current.token0,
        token1: current.token1,
        fee: current.fee,
        id: address,
        oneDayVolumeUSD,
        oneDayVolumeChangeUSD,
        oneWeekVolumeUSD,
        trackedReserveUSD: tvlUSD,
        tvlUSDChange,
        totalValueLockedUSD: current[manageUntrackedTVL],
      };
    });

    return formatted;
  } catch (err) {
    console.error(err);
  }
}

export async function getTopPairsV3ByToken(tokenAddress: string) {
  try {
    const utcCurrentTime = dayjs();

    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
    const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix();
    const utcOneWeekBack = utcCurrentTime.subtract(1, 'week').unix();

    const [
      oneDayBlock,
      twoDayBlock,
      oneWeekBlock,
    ] = await getBlocksFromTimestamps([
      utcOneDayBack,
      utcTwoDaysBack,
      utcOneWeekBack,
    ]);

    const topPairsIds = await clientV3.query({
      query: TOP_POOLS_V3_TOKEN(tokenAddress),
      fetchPolicy: 'network-only',
    });

    const pairsAddresses = topPairsIds.data.pools0
      .concat(topPairsIds.data.pools1)
      .map((el: any) => el.id);

    const pairsCurrent = await fetchPairsByTime(undefined, pairsAddresses);
    const pairs24 = await fetchPairsByTime(oneDayBlock.number, pairsAddresses);
    const pairs48 = await fetchPairsByTime(twoDayBlock.number, pairsAddresses);
    const pairsWeek = await fetchPairsByTime(
      oneWeekBlock.number,
      pairsAddresses,
    );

    const parsedPairs = parsePairsData(pairsCurrent);
    const parsedPairs24 = parsePairsData(pairs24);
    const parsedPairs48 = parsePairsData(pairs48);
    const parsedPairsWeek = parsePairsData(pairsWeek);

    const formatted = pairsAddresses.map((address: string) => {
      const current = parsedPairs[address];
      const oneDay = parsedPairs24[address];
      const twoDay = parsedPairs48[address];
      const week = parsedPairsWeek[address];

      if (!current) return;

      const manageUntrackedVolume =
        +current.volumeUSD <= 1 ? 'untrackedVolumeUSD' : 'volumeUSD';

      const manageUntrackedTVL =
        +current.totalValueLockedUSD <= 1
          ? 'totalValueLockedUSDUntracked'
          : 'totalValueLockedUSD';

      const [oneDayVolumeUSD, oneDayVolumeChangeUSD] =
        oneDay && twoDay
          ? get2DayPercentChange(
              current[manageUntrackedVolume],
              oneDay[manageUntrackedVolume],
              twoDay[manageUntrackedVolume],
            )
          : oneDay
          ? [
              parseFloat(current[manageUntrackedVolume]) -
                parseFloat(oneDay[manageUntrackedVolume]),
              0,
            ]
          : [parseFloat(current[manageUntrackedVolume]), 0];

      const oneWeekVolumeUSD = week
        ? parseFloat(current[manageUntrackedVolume]) -
          parseFloat(week[manageUntrackedVolume])
        : parseFloat(current[manageUntrackedVolume]);

      const tvlUSD = parseFloat(current[manageUntrackedTVL]);
      const tvlUSDChange = getPercentChange(
        current[manageUntrackedTVL],
        oneDay ? oneDay[manageUntrackedTVL] : undefined,
      );

      return {
        token0: current.token0,
        token1: current.token1,
        fee: current.fee,
        id: address,
        oneDayVolumeUSD,
        oneDayVolumeChangeUSD,
        oneWeekVolumeUSD,
        trackedReserveUSD: tvlUSD,
        tvlUSDChange,
        totalValueLockedUSD: current[manageUntrackedTVL],
      };
    });

    return formatted;
  } catch (err) {
    console.error(err);
  }
}

export async function getTopPairsV3ByTokens(
  tokenAddress: string,
  tokenAddress1: string,
) {
  try {
    const utcCurrentTime = dayjs();

    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
    const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix();
    const utcOneWeekBack = utcCurrentTime.subtract(1, 'week').unix();

    const [
      oneDayBlock,
      twoDayBlock,
      oneWeekBlock,
    ] = await getBlocksFromTimestamps([
      utcOneDayBack,
      utcTwoDaysBack,
      utcOneWeekBack,
    ]);

    const topPairsIds = await clientV3.query({
      query: TOP_POOLS_V3_TOKENS(tokenAddress, tokenAddress1),
      fetchPolicy: 'network-only',
    });

    const pairsAddresses = topPairsIds.data.pools0
      .concat(topPairsIds.data.pools1)
      .concat(topPairsIds.data.pools2)
      .concat(topPairsIds.data.pools3)
      .concat(topPairsIds.data.pools4)
      .map((el: any) => el.id);

    const pairsCurrent = await fetchPairsByTime(undefined, pairsAddresses);
    const pairs24 = await fetchPairsByTime(oneDayBlock.number, pairsAddresses);
    const pairs48 = await fetchPairsByTime(twoDayBlock.number, pairsAddresses);
    const pairsWeek = await fetchPairsByTime(
      oneWeekBlock.number,
      pairsAddresses,
    );

    const parsedPairs = parsePairsData(pairsCurrent);
    const parsedPairs24 = parsePairsData(pairs24);
    const parsedPairs48 = parsePairsData(pairs48);
    const parsedPairsWeek = parsePairsData(pairsWeek);

    const formatted = pairsAddresses.map((address: string) => {
      const current = parsedPairs[address];
      const oneDay = parsedPairs24[address];
      const twoDay = parsedPairs48[address];
      const week = parsedPairsWeek[address];

      if (!current) return;

      const manageUntrackedVolume =
        +current.volumeUSD <= 1 ? 'untrackedVolumeUSD' : 'volumeUSD';

      const manageUntrackedTVL =
        +current.totalValueLockedUSD <= 1
          ? 'totalValueLockedUSDUntracked'
          : 'totalValueLockedUSD';

      const [oneDayVolumeUSD, oneDayVolumeChangeUSD] =
        oneDay && twoDay
          ? get2DayPercentChange(
              current[manageUntrackedVolume],
              oneDay[manageUntrackedVolume],
              twoDay[manageUntrackedVolume],
            )
          : oneDay
          ? [
              parseFloat(current[manageUntrackedVolume]) -
                parseFloat(oneDay[manageUntrackedVolume]),
              0,
            ]
          : [parseFloat(current[manageUntrackedVolume]), 0];

      const oneWeekVolumeUSD = week
        ? parseFloat(current[manageUntrackedVolume]) -
          parseFloat(week[manageUntrackedVolume])
        : parseFloat(current[manageUntrackedVolume]);

      const tvlUSD = parseFloat(current[manageUntrackedTVL]);
      const tvlUSDChange = getPercentChange(
        current[manageUntrackedTVL],
        oneDay ? oneDay[manageUntrackedTVL] : undefined,
      );

      return {
        token0: current.token0,
        token1: current.token1,
        fee: current.fee,
        id: address,
        oneDayVolumeUSD,
        oneDayVolumeChangeUSD,
        oneWeekVolumeUSD,
        trackedReserveUSD: tvlUSD,
        tvlUSDChange,
        totalValueLockedUSD: current[manageUntrackedTVL],
      };
    });

    return formatted;
  } catch (err) {
    console.error(err);
  }
}

export async function getPairsAPR(pairAddresses: string[]) {
  const aprs: any = await fetchPoolsAPR();
  const farmAprs: any = await fetchEternalFarmAPR();
  const farmsFromPairAddresses = await fetchEternalFarmingsAPRByPool(
    pairAddresses,
  );
  const _farmingAprs: {
    [type: string]: number;
  } = farmsFromPairAddresses.reduce(
    (acc: any, el: any) => ({
      ...acc,
      [el.pool]: farmAprs[el.id],
    }),
    {},
  );

  return pairAddresses.map((address) => {
    const aprPercent = aprs[address] ? aprs[address].toFixed(2) : null;
    const farmingApr = _farmingAprs[address]
      ? Number(_farmingAprs[address].toFixed(2))
      : null;
    return {
      apr: aprPercent,
      farmingApr: farmingApr && farmingApr > 0 ? farmingApr : null,
    };
  });
}

export async function getPairInfoV3(address: string) {
  try {
    const utcCurrentTime = dayjs();

    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
    const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix();
    const utcOneWeekBack = utcCurrentTime.subtract(1, 'week').unix();

    const [
      oneDayBlock,
      twoDayBlock,
      oneWeekBlock,
    ] = await getBlocksFromTimestamps([
      utcOneDayBack,
      utcTwoDaysBack,
      utcOneWeekBack,
    ]);

    const pairsCurrent = await fetchPairsByTime(undefined, [address]);
    const pairs24 = await fetchPairsByTime(oneDayBlock.number, [address]);
    const pairs48 = await fetchPairsByTime(twoDayBlock.number, [address]);
    const pairsWeek = await fetchPairsByTime(oneWeekBlock.number, [address]);

    const parsedPairs = parsePairsData(pairsCurrent);
    const parsedPairs24 = parsePairsData(pairs24);
    const parsedPairs48 = parsePairsData(pairs48);
    const parsedPairsWeek = parsePairsData(pairsWeek);

    const aprs: any = await fetchPoolsAPR();
    const farmingAprs: any = await fetchEternalFarmAPR();

    const current = parsedPairs[address];
    const oneDay = parsedPairs24[address];
    const twoDay = parsedPairs48[address];
    const week = parsedPairsWeek[address];

    const manageUntrackedVolume = current
      ? +current.volumeUSD <= 1
        ? 'untrackedVolumeUSD'
        : 'volumeUSD'
      : '';
    const manageUntrackedTVL = current
      ? +current.totalValueLockedUSD <= 1
        ? 'totalValueLockedUSDUntracked'
        : 'totalValueLockedUSD'
      : '';

    const [oneDayVolumeUSD, oneDayVolumeChangeUSD] =
      current && oneDay && twoDay
        ? get2DayPercentChange(
            current[manageUntrackedVolume],
            oneDay[manageUntrackedVolume],
            twoDay[manageUntrackedVolume],
          )
        : current && oneDay
        ? [
            parseFloat(current[manageUntrackedVolume]) -
              parseFloat(oneDay[manageUntrackedVolume]),
            0,
          ]
        : current
        ? [parseFloat(current[manageUntrackedVolume]), 0]
        : [0, 0];

    const oneWeekVolumeUSD =
      current && week
        ? parseFloat(current[manageUntrackedVolume]) -
          parseFloat(week[manageUntrackedVolume])
        : current
        ? parseFloat(current[manageUntrackedVolume])
        : 0;

    const tvlUSD = current ? parseFloat(current[manageUntrackedTVL]) : 0;
    const tvlUSDChange = getPercentChange(
      current ? current[manageUntrackedTVL] : undefined,
      oneDay ? oneDay[manageUntrackedTVL] : undefined,
    );

    const feesUSD = current ? parseFloat(current.feesUSD) : 0;
    const feesUSDOneDay =
      current && oneDay
        ? Number(current.feesUSD ?? 0) - Number(oneDay.feesUSD ?? 0)
        : 0;
    const feesUSDChange = getPercentChange(
      current ? current.feesUSD : undefined,
      oneDay ? oneDay.feesUSD : undefined,
    );

    const poolFeeChange = getPercentChange(
      current ? current.fee : undefined,
      oneDay ? oneDay.fee : undefined,
    );

    const token0PriceChange = getPercentChange(
      current ? current.token0Price : undefined,
      oneDay ? oneDay.token0Price : undefined,
    );

    const token1PriceChange = getPercentChange(
      current ? current.token1Price : undefined,
      oneDay ? oneDay.token1Price : undefined,
    );

    const aprPercent = aprs[address] ? aprs[address].toFixed(2) : 0;
    const farmingApr = farmingAprs[address]
      ? farmingAprs[address].toFixed(2)
      : 0;

    return [
      current
        ? {
            token0: {
              ...current.token0,
              symbol:
                current.token0.symbol.toLowerCase() === 'mimatic'
                  ? 'MAI'
                  : current.token0.symbol,
            },
            token1: {
              ...current.token1,
              symbol:
                current.token1.symbol.toLowerCase() === 'mimatic'
                  ? 'MAI'
                  : current.token1.symbol,
            },
            fee: current.fee,
            id: address,
            oneDayVolumeUSD,
            oneDayVolumeChangeUSD,
            oneWeekVolumeUSD,
            trackedReserveUSD: tvlUSD,
            tvlUSDChange,
            reserve0: current.totalValueLockedToken0,
            reserve1: current.totalValueLockedToken1,
            totalValueLockedUSD: current[manageUntrackedTVL],
            apr: aprPercent,
            farmingApr: farmingApr,
            volumeChangeUSD: oneDayVolumeChangeUSD,
            liquidityChangeUSD: tvlUSDChange,
            feesUSD,
            feesUSDOneDay,
            feesUSDChange,
            poolFeeChange,
            token0Price: Number(current.token0Price).toFixed(3),
            token0PriceChange,
            token1Price: Number(current.token1Price).toFixed(3),
            token1PriceChange,
          }
        : undefined,
    ];
  } catch (err) {
    console.error(err);
  }
}

export async function getAllPairsV3() {
  try {
    let allFound = false;
    let pairs: any[] = [];
    let skipCount = 0;
    while (!allFound) {
      const result = await clientV3.query({
        query: ALL_PAIRS_V3,
        variables: {
          skip: skipCount,
        },
        fetchPolicy: 'network-only',
      });
      skipCount = skipCount + 10;
      pairs = pairs.concat(result?.data?.pools);
      if (result?.data?.pools.length < 10 || pairs.length > 10) {
        allFound = true;
      }
    }
    return pairs;
  } catch (e) {
    console.log(e);
  }
}

export const getPairChartDataV3 = async (
  pairAddress: string,
  startTime: number,
) => {
  let data: any[] = [];
  const utcEndTime = dayjs.utc();
  let allFound = false;
  let skip = 0;
  try {
    while (!allFound) {
      const result = await clientV3.query({
        query: PAIR_CHART_V3,
        variables: {
          startTime: startTime,
          pairAddress: pairAddress,
          skip,
        },
        fetchPolicy: 'cache-first',
      });
      skip += 1000;
      data = data.concat(result.data.poolDayDatas);
      if (result.data.poolDayDatas.length < 1000) {
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
      dayData.dailyVolumeUSD = Number(dayData.volumeUSD);
      dayData.reserveUSD = Number(dayData.tvlUSD);
      dayData.token0Price = dayData.token0Price;
      dayData.token1Price = dayData.token1Price;
    });

    if (data[0]) {
      // fill in empty days
      let timestamp = data[0].date ? data[0].date : startTime;
      let latestLiquidityUSD = data[0].tvlUSD;
      let latestToken0Price = data[0].token0Price;
      let latestToken1Price = data[0].token1Price;
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
            token0Price: latestToken0Price,
            token1Price: latestToken1Price,
          });
        } else {
          latestLiquidityUSD = dayIndexArray[index].tvlUSD;
          latestToken0Price = dayIndexArray[index].token0Price;
          latestToken1Price = dayIndexArray[index].token1Price;
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

export async function getPairChartFees(address: string, startTime: number) {
  let data: any[] = [];
  const utcEndTime = dayjs.utc();
  let allFound = false;
  let skip = 0;
  try {
    while (!allFound) {
      const result = await clientV3.query({
        query: PAIR_FEE_CHART_V3,
        fetchPolicy: 'network-only',
        variables: { address, startTime, skip },
      });
      skip += 1000;
      data = data.concat(result.data.feeHourDatas);
      if (result.data.feeHourDatas.length < 1000) {
        allFound = true;
      }
    }

    const dayIndexSet = new Set();
    const dayIndexArray: any[] = [];
    const oneDay = 24 * 60 * 60;

    data.reverse().forEach((dayData, i) => {
      // add the day index to the set of days
      dayIndexSet.add((Number(data[i].timestamp) / oneDay).toFixed(0));
      dayIndexArray.push(data[i]);
      dayData.fee = Number(dayData.fee) / Number(dayData.changesCount);
      dayData.dayString = Number(dayData.timestamp);
      dayData.date = Number(dayData.timestamp);
    });

    if (data[0]) {
      // fill in empty days
      let timestamp = data[0].timestamp ? Number(data[0].timestamp) : startTime;
      let latestFee = data[0].fee;
      let index = 1;

      while (timestamp < utcEndTime.unix() - oneDay) {
        const nextDay = timestamp + oneDay;
        const currentDayIndex = (nextDay / oneDay).toFixed(0);
        if (!dayIndexSet.has(currentDayIndex)) {
          data.push({
            timestamp: nextDay,
            dayString: nextDay,
            fee: latestFee,
            date: nextDay,
          });
        } else {
          latestFee = dayIndexArray[index].fee;
          index = index + 1;
        }
        timestamp = nextDay;
      }
    }

    data = data.sort((a, b) =>
      parseInt(a.timestamp) > parseInt(b.timestamp) ? 1 : -1,
    );
  } catch (e) {
    console.log(e);
  }

  return data;
}

export async function getLiquidityChart(address: string) {
  const numSurroundingTicks = 300;
  const PRICE_FIXED_DIGITS = 8;

  const pool = await clientV3.query({
    query: PAIRS_FROM_ADDRESSES_V3(undefined, [address]),
  });

  const {
    tick: poolCurrentTick,
    liquidity,
    token0: { id: token0Address, decimals: token0Decimals },
    token1: { id: token1Address, decimals: token1Decimals },
  } = pool.data.pools[0];

  const poolCurrentTickIdx = parseInt(poolCurrentTick);
  const tickSpacing = 60;

  const activeTickIdx =
    Math.floor(poolCurrentTickIdx / tickSpacing) * tickSpacing;

  const tickIdxLowerBound = activeTickIdx - numSurroundingTicks * tickSpacing;
  const tickIdxUpperBound = activeTickIdx + numSurroundingTicks * tickSpacing;

  async function fetchInitializedTicks(
    poolAddress: string,
    tickIdxLowerBound: number,
    tickIdxUpperBound: number,
  ) {
    let surroundingTicks: any = [];
    let surroundingTicksResult: any = [];

    let skip = 0;
    do {
      const ticks = await clientV3.query({
        query: FETCH_TICKS(),
        fetchPolicy: 'cache-first',
        variables: {
          poolAddress,
          tickIdxLowerBound,
          tickIdxUpperBound,
          skip,
        },
      });

      surroundingTicks = ticks.data.ticks;
      surroundingTicksResult = surroundingTicksResult.concat(surroundingTicks);
      skip += 1000;
    } while (surroundingTicks.length > 0);

    return { ticks: surroundingTicksResult, loading: false, error: false };
  }

  const initializedTicksResult = await fetchInitializedTicks(
    address,
    tickIdxLowerBound,
    tickIdxUpperBound,
  );
  if (initializedTicksResult.error || initializedTicksResult.loading) {
    return {
      error: initializedTicksResult.error,
      loading: initializedTicksResult.loading,
    };
  }

  const { ticks: initializedTicks } = initializedTicksResult;

  const tickIdxToInitializedTick = keyBy(initializedTicks, 'tickIdx');

  const token0 = new Token(137, token0Address, parseInt(token0Decimals));
  const token1 = new Token(137, token1Address, parseInt(token1Decimals));

  let activeTickIdxForPrice = activeTickIdx;
  if (activeTickIdxForPrice < TickMath.MIN_TICK) {
    activeTickIdxForPrice = TickMath.MIN_TICK;
  }
  if (activeTickIdxForPrice > TickMath.MAX_TICK) {
    activeTickIdxForPrice = TickMath.MAX_TICK;
  }

  const activeTickProcessed = {
    liquidityActive: JSBI.BigInt(liquidity),
    tickIdx: activeTickIdx,
    liquidityNet: JSBI.BigInt(0),
    price0: tickToPrice(token0, token1, activeTickIdxForPrice).toFixed(
      PRICE_FIXED_DIGITS,
    ),
    price1: tickToPrice(token1, token0, activeTickIdxForPrice).toFixed(
      PRICE_FIXED_DIGITS,
    ),
    liquidityGross: JSBI.BigInt(0),
  };

  const activeTick = tickIdxToInitializedTick[activeTickIdx];
  if (activeTick) {
    activeTickProcessed.liquidityGross = JSBI.BigInt(activeTick.liquidityGross);
    activeTickProcessed.liquidityNet = JSBI.BigInt(activeTick.liquidityNet);
  }

  enum Direction {
    ASC,
    DESC,
  }

  // Computes the numSurroundingTicks above or below the active tick.
  const computeSurroundingTicks = (
    activeTickProcessed: any,
    tickSpacing: number,
    numSurroundingTicks: number,
    direction: Direction,
  ) => {
    let previousTickProcessed = {
      ...activeTickProcessed,
    };

    // Iterate outwards (either up or down depending on 'Direction') from the active tick,
    // building active liquidity for every tick.
    let processedTicks = [];
    for (let i = 0; i < numSurroundingTicks; i++) {
      const currentTickIdx =
        direction == Direction.ASC
          ? previousTickProcessed.tickIdx + tickSpacing
          : previousTickProcessed.tickIdx - tickSpacing;

      if (
        currentTickIdx < TickMath.MIN_TICK ||
        currentTickIdx > TickMath.MAX_TICK
      ) {
        break;
      }

      const currentTickProcessed: any = {
        liquidityActive: previousTickProcessed.liquidityActive,
        tickIdx: currentTickIdx,
        liquidityNet: JSBI.BigInt(0),
        price0: tickToPrice(token0, token1, currentTickIdx).toFixed(
          PRICE_FIXED_DIGITS,
        ),
        price1: tickToPrice(token1, token0, currentTickIdx).toFixed(
          PRICE_FIXED_DIGITS,
        ),
        liquidityGross: JSBI.BigInt(0),
      };

      const currentInitializedTick =
        tickIdxToInitializedTick[currentTickIdx.toString()];
      if (currentInitializedTick) {
        currentTickProcessed.liquidityGross = JSBI.BigInt(
          currentInitializedTick.liquidityGross,
        );
        currentTickProcessed.liquidityNet = JSBI.BigInt(
          currentInitializedTick.liquidityNet,
        );
      }

      if (direction == Direction.ASC && currentInitializedTick) {
        currentTickProcessed.liquidityActive = JSBI.add(
          previousTickProcessed.liquidityActive,
          JSBI.BigInt(currentInitializedTick.liquidityNet),
        );
      } else if (
        direction == Direction.DESC &&
        JSBI.notEqual(previousTickProcessed.liquidityNet, JSBI.BigInt(0))
      ) {
        currentTickProcessed.liquidityActive = JSBI.subtract(
          previousTickProcessed.liquidityActive,
          previousTickProcessed.liquidityNet,
        );
      }

      processedTicks.push(currentTickProcessed);
      previousTickProcessed = currentTickProcessed;
    }

    if (direction == Direction.DESC) {
      processedTicks = processedTicks.reverse();
    }

    return processedTicks;
  };

  const subsequentTicks = computeSurroundingTicks(
    activeTickProcessed,
    tickSpacing,
    numSurroundingTicks,
    Direction.ASC,
  );

  const previousTicks = computeSurroundingTicks(
    activeTickProcessed,
    tickSpacing,
    numSurroundingTicks,
    Direction.DESC,
  );

  const ticksProcessed = previousTicks
    .concat(activeTickProcessed)
    .concat(subsequentTicks);

  return {
    ticksProcessed,
    tickSpacing,
    activeTickIdx,
    token0,
    token1,
  };
  // setTicksResult({
  //     ticksProcessed,
  //     tickSpacing,
  //     activeTickIdx,
  //     token0,
  //     token1
  // })
}

export async function getPairTransactionsV3(address: string): Promise<any> {
  const data = await clientV3.query({
    query: PAIR_TRANSACTIONS_v3,
    variables: {
      address: address,
    },
    fetchPolicy: 'cache-first',
  });

  const mints = data.data.mints.map((m: any) => {
    return {
      type: TxnType.ADD,
      transaction: {
        ...m.transaction,
        timestamp: m.timestamp,
      },
      sender: m.origin,
      pair: {
        token0: {
          symbol: formatTokenSymbol(m.pool.token0.id, m.pool.token0.symbol),
          id: m.pool.token0.id,
        },
        token1: {
          symbol: formatTokenSymbol(m.pool.token1.id, m.pool.token1.symbol),
          id: m.pool.token1.id,
        },
      },
      amountUSD: parseFloat(m.amountUSD),
      amount0: parseFloat(m.amount0),
      amount1: parseFloat(m.amount1),
    };
  });
  const burns = data.data.burns.map((m: any) => {
    return {
      type: TxnType.REMOVE,
      transaction: {
        ...m.transaction,
        timestamp: m.timestamp,
      },
      sender: m.owner,
      pair: {
        token0: {
          symbol: formatTokenSymbol(m.pool.token0.id, m.pool.token0.symbol),
          id: m.pool.token0.id,
        },
        token1: {
          symbol: formatTokenSymbol(m.pool.token1.id, m.pool.token1.symbol),
          id: m.pool.token1.id,
        },
      },
      amountUSD: parseFloat(m.amountUSD),
      amount0: parseFloat(m.amount0),
      amount1: parseFloat(m.amount1),
    };
  });

  const swaps = data.data.swaps.map((m: any) => {
    return {
      type: TxnType.SWAP,
      transaction: {
        ...m.transaction,
        timestamp: m.timestamp,
      },
      sender: m.origin,
      pair: {
        token0: {
          symbol: formatTokenSymbol(m.pool.token0.id, m.pool.token0.symbol),
          id: m.pool.token0.id,
        },
        token1: {
          symbol: formatTokenSymbol(m.pool.token1.id, m.pool.token1.symbol),
          id: m.pool.token1.id,
        },
      },
      amountUSD: parseFloat(m.amountUSD),
      amount0: parseFloat(m.amount0),
      amount1: parseFloat(m.amount1),
    };
  });

  return {
    mints,
    burns,
    swaps,
  };
}

export async function getTokenTransactionsV3(address: string): Promise<any> {
  try {
    const data = await clientV3.query({
      query: GLOBAL_TRANSACTIONS_V3,
      variables: {
        address: address,
      },
      fetchPolicy: 'cache-first',
    });

    const mints0 = data.data.mintsAs0.map((m: any) => {
      return {
        type: TxnType.ADD,
        transaction: {
          ...m.transaction,
          timestamp: m.timestamp,
        },
        timestamp: m.timestamp,
        sender: m.origin,
        pair: {
          token0: {
            symbol: formatTokenSymbol(m.pool.token0.id, m.pool.token0.symbol),
            id: m.pool.token0.id,
          },
          token1: {
            symbol: formatTokenSymbol(m.pool.token1.id, m.pool.token1.symbol),
            id: m.pool.token1.id,
          },
        },
        amountUSD: parseFloat(m.amountUSD),
        amount0: parseFloat(m.amount0),
        amount1: parseFloat(m.amount1),
      };
    });
    const mints1 = data.data.mintsAs1.map((m: any) => {
      return {
        type: TxnType.ADD,
        transaction: {
          ...m.transaction,
          timestamp: m.timestamp,
        },
        timestamp: m.timestamp,
        sender: m.origin,
        pair: {
          token0: {
            symbol: formatTokenSymbol(m.pool.token0.id, m.pool.token0.symbol),
            id: m.pool.token0.id,
          },
          token1: {
            symbol: formatTokenSymbol(m.pool.token1.id, m.pool.token1.symbol),
            id: m.pool.token1.id,
          },
        },
        amountUSD: parseFloat(m.amountUSD),
        amount0: parseFloat(m.amount0),
        amount1: parseFloat(m.amount1),
      };
    });

    const burns0 = data.data.burnsAs0.map((m: any) => {
      return {
        type: TxnType.REMOVE,
        transaction: {
          ...m.transaction,
          timestamp: m.timestamp,
        },
        timestamp: m.timestamp,
        sender: m.owner,
        pair: {
          token0: {
            symbol: formatTokenSymbol(m.pool.token0.id, m.pool.token0.symbol),
            id: m.pool.token0.id,
          },
          token1: {
            symbol: formatTokenSymbol(m.pool.token1.id, m.pool.token1.symbol),
            id: m.pool.token1.id,
          },
        },
        amountUSD: parseFloat(m.amountUSD),
        amount0: parseFloat(m.amount0),
        amount1: parseFloat(m.amount1),
      };
    });
    const burns1 = data.data.burnsAs1.map((m: any) => {
      return {
        type: TxnType.REMOVE,
        transaction: {
          ...m.transaction,
          timestamp: m.timestamp,
        },
        timestamp: m.timestamp,
        sender: m.owner,
        pair: {
          token0: {
            symbol: formatTokenSymbol(m.pool.token0.id, m.pool.token0.symbol),
            id: m.pool.token0.id,
          },
          token1: {
            symbol: formatTokenSymbol(m.pool.token1.id, m.pool.token1.symbol),
            id: m.pool.token1.id,
          },
        },
        amountUSD: parseFloat(m.amountUSD),
        amount0: parseFloat(m.amount0),
        amount1: parseFloat(m.amount1),
      };
    });

    const swaps0 = data.data.swapsAs0.map((m: any) => {
      return {
        type: TxnType.SWAP,
        transaction: {
          ...m.transaction,
          timestamp: m.timestamp,
        },
        timestamp: m.timestamp,
        sender: m.origin,
        pair: {
          token0: {
            symbol: formatTokenSymbol(m.pool.token0.id, m.pool.token0.symbol),
            id: m.pool.token0.id,
          },
          token1: {
            symbol: formatTokenSymbol(m.pool.token1.id, m.pool.token1.symbol),
            id: m.pool.token1.id,
          },
        },
        amountUSD: parseFloat(m.amountUSD),
        amount0: parseFloat(m.amount0),
        amount1: parseFloat(m.amount1),
      };
    });

    const swaps1 = data.data.swapsAs1.map((m: any) => {
      return {
        type: TxnType.SWAP,
        transaction: {
          ...m.transaction,
          timestamp: m.timestamp,
        },
        timestamp: m.timestamp,
        sender: m.origin,
        pair: {
          token0: {
            symbol: formatTokenSymbol(m.pool.token0.id, m.pool.token0.symbol),
            id: m.pool.token0.id,
          },
          token1: {
            symbol: formatTokenSymbol(m.pool.token1.id, m.pool.token1.symbol),
            id: m.pool.token1.id,
          },
        },
        amountUSD: parseFloat(m.amountUSD),
        amount0: parseFloat(m.amount0),
        amount1: parseFloat(m.amount1),
      };
    });

    return {
      mints: [...mints0, ...mints1],
      burns: [...burns0, ...burns1],
      swaps: [...swaps0, ...swaps1],
    };
  } catch {
    return;
  }
}

export async function isV3PairExists(pairAddress: string) {
  try {
    const pair = await clientV3.query({
      query: IS_PAIR_EXISTS_V3(pairAddress.toLowerCase()),
    });

    if (pair.errors) {
      return false;
    }
    return pair.data.pool;
  } catch {
    return false;
  }
}

//Farming

export async function fetchEternalFarmingsAPRByPool(
  poolAddresses: string[],
): Promise<any> {
  try {
    const eternalFarmings = await farmingClient.query({
      query: FETCH_ETERNAL_FARM_FROM_POOL_V3(poolAddresses),
      fetchPolicy: 'network-only',
    });

    return eternalFarmings.data.eternalFarmings;
  } catch (err) {
    throw new Error('Eternal fetch error ' + err);
  }
}

//Token Helpers

async function fetchTokensByTime(
  blockNumber: number | undefined,
  tokenAddresses: string[],
): Promise<any> {
  try {
    const tokens = await clientV3.query({
      query: TOKENS_FROM_ADDRESSES_V3(blockNumber, tokenAddresses),
      fetchPolicy: 'network-only',
    });

    return tokens.data.tokens;
  } catch (err) {
    console.error('Tokens fetching by time ' + err);
  }
}

function parseTokensData(tokenData: any) {
  return tokenData
    ? tokenData.reduce((acc: { [address: string]: any }, tokenData: any) => {
        acc[tokenData.id] = tokenData;
        return acc;
      }, {})
    : {};
}

const WETH_ADDRESSES = ['0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'];

export function formatTokenSymbol(address: string, symbol: string) {
  if (WETH_ADDRESSES.includes(address)) {
    return 'MATIC';
  } else if (symbol.toLowerCase() === 'mimatic') {
    return 'MAI';
  }
  return symbol;
}

export function formatTokenName(address: string, name: string) {
  if (WETH_ADDRESSES.includes(address)) {
    return 'Matic';
  }
  return name;
}

//Pair helpers

async function fetchPairsByTime(
  blockNumber: number | undefined,
  tokenAddresses: string[],
): Promise<any> {
  try {
    const pairs = await clientV3.query({
      query: PAIRS_FROM_ADDRESSES_V3(blockNumber, tokenAddresses),
      fetchPolicy: 'network-only',
    });

    return pairs.data.pools;
  } catch (err) {
    console.error('Pairs by time fetching ' + err);
  }
}

function parsePairsData(tokenData: any) {
  return tokenData
    ? tokenData.reduce((accum: { [address: string]: any }, poolData: any) => {
        accum[poolData.id] = poolData;
        return accum;
      }, {})
    : {};
}

export const getIntervalTokenDataV3 = async (
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
      PRICES_BY_BLOCK_V3,
      clientV3,
      [tokenAddress],
      blocks,
      50,
    );

    // format token ETH price results
    const values: any[] = [];
    for (const row in result) {
      const timestamp = row.split('t')[1];
      const derivedMatic = Number(result[row]?.derivedMatic ?? 0);
      if (timestamp) {
        values.push({
          timestamp,
          derivedMatic,
        });
      }
    }

    // go through eth usd prices and assign to original values array
    let index = 0;
    for (const brow in result) {
      const timestamp = brow.split('b')[1];
      if (timestamp) {
        values[index].priceUSD =
          result[brow].maticPriceUSD * values[index].derivedMatic;
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
