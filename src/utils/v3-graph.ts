import { clientV2, clientV3, farmingClient } from 'apollo/client';
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
  getChartData,
  getPercentChange,
  getSecondsOneDay,
  getTokenChartData,
  getTokenPairs2,
  splitQuery,
} from 'utils';
import dayjs from 'dayjs';
import { fetchEternalFarmAPR, fetchPoolsAPR } from './api';
import { Token } from '@uniswap/sdk-core';
import { TickMath, tickToPrice } from '@uniswap/v3-sdk';
import { JSBI } from '@uniswap/sdk';
import keyBy from 'lodash.keyby';
import { GlobalConst, TxnType } from 'constants/index';
import {
  FILTERED_TRANSACTIONS,
  GLOBAL_ALLDATA,
  PAIRS_BULK1,
  PAIRS_CURRENT,
  PAIRS_HISTORICAL_BULK,
  TOKENS_FROM_ADDRESSES_V2,
  TOKEN_DATA2,
  TOKEN_INFO,
  TOKEN_INFO_OLD,
} from 'apollo/queries';

//Global

export async function getGlobalDataTotal(
  ethPrice: number,
  oldEthPrice: number,
): Promise<any> {
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

    const v3DataCurrent = await clientV3.query({
      query: GLOBAL_DATA_V3(),
      fetchPolicy: 'network-only',
    });

    const v3DataOneDay = await clientV3.query({
      query: GLOBAL_DATA_V3(oneDayBlock.number),
      fetchPolicy: 'network-only',
    });

    const v3DataTwoDay = await clientV3.query({
      query: GLOBAL_DATA_V3(twoDayBlock.number),
      fetchPolicy: 'network-only',
    });

    const v3DataOneWeek = await clientV3.query({
      query: GLOBAL_DATA_V3(oneWeekBlock.number),
      fetchPolicy: 'network-only',
    });

    const v3DataTwoWeek = await clientV3.query({
      query: GLOBAL_DATA_V3(twoWeekBlock.number),
      fetchPolicy: 'network-only',
    });

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

    const v2DataCurrent = allData.data['result'][0];
    const v2DataOneDay = allData.data['oneDayData'][0];
    const v2DataTwoDay = allData.data['twoDayData'][0];
    const v2OneWeekData = allData.data['oneWeekData'][0];
    const v2TwoWeekData = allData.data['twoWeekData'][0];

    const [
      v3StatsCurrent,
      v3StatsOneDay,
      v3StatsTwoDay,
      v3StatsOneWeek,
      v3StatsTwoWeek,
    ] = [
      v3DataCurrent &&
      v3DataCurrent.data &&
      v3DataCurrent.data.factories &&
      v3DataCurrent.data.factories.length > 0
        ? v3DataCurrent.data.factories[0]
        : undefined,
      v3DataOneDay &&
      v3DataOneDay.data &&
      v3DataOneDay.data.factories &&
      v3DataOneDay.data.factories.length > 0
        ? v3DataOneDay.data.factories[0]
        : undefined,
      v3DataTwoDay &&
      v3DataTwoDay.data &&
      v3DataTwoDay.data.factories &&
      v3DataTwoDay.data.factories.length > 0
        ? v3DataTwoDay.data.factories[0]
        : undefined,
      v3DataOneWeek &&
      v3DataOneWeek.data &&
      v3DataOneWeek.data.factories &&
      v3DataOneWeek.data.factories.length > 0
        ? v3DataOneWeek.data.factories[0]
        : undefined,
      v3DataTwoWeek &&
      v3DataTwoWeek.data &&
      v3DataTwoWeek.data.factories &&
      v3DataTwoWeek.data.factories.length > 0
        ? v3DataTwoWeek.data.factories[0]
        : undefined,
    ];

    const currentVolumeUSD =
      (v3StatsCurrent ? Number(v3StatsCurrent.totalVolumeUSD) : 0) +
      Number(v2DataCurrent.totalVolumeUSD);
    const oneDayBeforeVolumeUSD =
      (v3StatsOneDay ? Number(v3StatsOneDay.totalVolumeUSD) : 0) +
      Number(v2DataOneDay.totalVolumeUSD);
    const twoDayBeforeVolumeUSD =
      (v3StatsTwoDay ? Number(v3StatsTwoDay.totalVolumeUSD) : 0) +
      Number(v2DataTwoDay.totalVolumeUSD);
    const oneWeekBeforeVolumeUSD =
      (v3StatsOneWeek ? Number(v3StatsOneWeek.totalVolumeUSD) : 0) +
      Number(v2OneWeekData.totalVolumeUSD);
    const twoWeekBeforeVolumeUSD =
      (v3StatsTwoWeek ? Number(v3StatsTwoWeek.totalVolumeUSD) : 0) +
      Number(v2TwoWeekData.totalVolumeUSD);

    const currentTotalLiquidity =
      (v3StatsCurrent ? Number(v3StatsCurrent.totalValueLockedUSD) : 0) +
      v2DataCurrent.totalLiquidityETH * ethPrice;

    const oneDayTotalLiquidity =
      (v3StatsOneDay ? Number(v3StatsOneDay.totalValueLockedUSD) : 0) +
      v2DataOneDay.totalLiquidityETH * oldEthPrice;

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
      currentTotalLiquidity,
      oneDayTotalLiquidity,
    );

    const currentFeesUSD =
      (v3StatsCurrent ? Number(v3StatsCurrent.totalFeesUSD) : 0) +
      Number(v2DataCurrent.totalVolumeUSD) * GlobalConst.utils.FEEPERCENT;
    const oneDayFeesUSD =
      (v3StatsOneDay ? Number(v3StatsOneDay.totalFeesUSD) : 0) +
      Number(v2DataOneDay.totalVolumeUSD) * GlobalConst.utils.FEEPERCENT;
    const twoDayFeesUSD =
      (v3StatsTwoDay ? Number(v3StatsTwoDay.totalFeesUSD) : 0) +
      Number(v2DataTwoDay.totalVolumeUSD) * GlobalConst.utils.FEEPERCENT;

    const [feesUSD, feesUSDChange] = get2DayPercentChange(
      currentFeesUSD,
      oneDayFeesUSD,
      twoDayFeesUSD,
    );

    const currentTxns =
      (v3StatsCurrent ? Number(v3StatsCurrent.txCount) : 0) +
      v2DataCurrent.txCount;
    const oneDayTxns =
      (v3StatsOneDay ? Number(v3StatsOneDay.txCount) : 0) +
      v2DataOneDay.txCount;
    const txCount = currentTxns - oneDayTxns;

    data = {
      totalLiquidityUSD: currentTotalLiquidity,
      liquidityChangeUSD,
      oneDayVolumeUSD,
      volumeChangeUSD,
      feesUSD,
      feesUSDChange,
      oneWeekVolume,
      weeklyVolumeChange,
      txCount,
      poolCount:
        (v3StatsCurrent ? v3StatsCurrent.poolCount : 0) +
        v2DataCurrent.pairCount,
    };
  } catch (e) {
    console.log(e);
  }

  return data;
}

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

export const getChartDataTotal = async (oldestDateToFetch: number) => {
  const [v3DailyData, v3WeeklyData] = await getChartDataV3(oldestDateToFetch);
  const [v2DailyData, v2WeeklyData] = await getChartData(oldestDateToFetch);
  const dailyData = v3DailyData.map((item) => {
    const v2Item = v2DailyData.find((v2Item) => v2Item.date === item.date);
    return {
      ...item,
      dailyVolumeUSD:
        (item && item.dailyVolumeUSD ? Number(item.dailyVolumeUSD) : 0) +
        (v2Item && v2Item.dailyVolumeUSD ? Number(v2Item.dailyVolumeUSD) : 0),
      feesUSD:
        (item && item.feesUSD ? Number(item.feesUSD) : 0) +
        (v2Item && v2Item.dailyVolumeUSD
          ? Number(v2Item.dailyVolumeUSD) * GlobalConst.utils.FEEPERCENT
          : 0),
      totalLiquidityUSD:
        (item && item.totalLiquidityUSD ? Number(item.totalLiquidityUSD) : 0) +
        (v2Item && v2Item.totalLiquidityUSD
          ? Number(v2Item.totalLiquidityUSD)
          : 0),
    };
  });
  const weeklydata = v3WeeklyData.map((item) => {
    const v2Item = v2WeeklyData.find((v2Item) => v2Item.date === item.date);
    return {
      ...item,
      weeklyVolumeUSD:
        (item && item.weeklyVolumeUSD ? Number(item.weeklyVolumeUSD) : 0) +
        (v2Item && v2Item.weeklyVolumeUSD ? Number(v2Item.weeklyVolumeUSD) : 0),
    };
  });
  return [dailyData, weeklydata];
};

//Tokens

export async function getTopTokensTotal(
  ethPrice: number,
  ethPrice24H: number,
  maticPrice: number,
  maticPrice24H: number,
  count = 500,
): Promise<any> {
  try {
    const utcCurrentTime = dayjs();

    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
    const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix();

    const [oneDayBlock] = await getBlocksFromTimestamps([
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

    const v2TokensCurrent = await fetchTokensByTimeV2(
      undefined,
      tokenAddresses,
    );

    const v2Tokens24 = await fetchTokensByTimeV2(
      oneDayBlock.number,
      tokenAddresses,
    );

    const parsedTokens = parseTokensData(tokensCurrent);
    const parsedTokens24 = parseTokensData(tokens24);

    const parsedTokensV2 = parseTokensData(v2TokensCurrent);
    const parsedTokens24V2 = parseTokensData(v2Tokens24);

    const formatted = tokenAddresses.map((address: string) => {
      const current = parsedTokens[address];
      const oneDay = parsedTokens24[address];
      const v2Current = parsedTokensV2[address];
      const v2OneDay = parsedTokens24V2[address];

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

      const oneDayVolumeUSD =
        Number(
          current && current[manageUntrackedVolume]
            ? current[manageUntrackedVolume]
            : 0,
        ) +
        Number(
          v2Current && v2Current.tradeVolumeUSD ? v2Current.tradeVolumeUSD : 0,
        ) -
        Number(
          oneDay && oneDay[manageUntrackedVolume]
            ? oneDay[manageUntrackedVolume]
            : 0,
        ) -
        Number(
          v2OneDay && v2OneDay.tradeVolumeUSD ? v2OneDay.tradeVolumeUSD : 0,
        );

      const tvlUSD =
        (current ? parseFloat(current[manageUntrackedTVL]) : 0) +
        (v2Current
          ? (v2Current.totalLiquidity ?? 0) *
            ethPrice *
            (v2Current.derivedETH ?? 0)
          : 0);
      const tvlUSDOneDay =
        (oneDay ? parseFloat(oneDay[manageUntrackedTVL]) : 0) +
        (v2OneDay
          ? (v2OneDay.totalLiquidity ?? 0) *
            ethPrice24H *
            (v2OneDay.derivedETH ?? 0)
          : 0);
      const tvlUSDChange = getPercentChange(tvlUSD, tvlUSDOneDay);
      const priceUSDV3 = current
        ? parseFloat(current.derivedMatic) * maticPrice
        : 0;
      const priceUSDOneDayV3 = oneDay
        ? parseFloat(oneDay.derivedMatic) * maticPrice24H
        : 0;
      const priceUSDV2 =
        v2Current && v2Current.derivedETH ? v2Current.derivedETH * ethPrice : 0;
      const priceUSDOneDayV2 =
        v2OneDay && v2OneDay.derivedETH ? v2OneDay.derivedETH * ethPrice24H : 0;
      const priceUSD = priceUSDV2 > 0 ? priceUSDV2 : priceUSDV3;
      const priceUSDOneDay =
        priceUSDOneDayV2 > 0 ? priceUSDOneDayV2 : priceUSDOneDayV3;

      const priceChangeUSD =
        priceUSD > 0 && priceUSDOneDay > 0
          ? getPercentChange(
              Number(priceUSD.toString()),
              Number(priceUSDOneDay.toString()),
            )
          : 0;

      return {
        id: address,
        name: formatTokenName(
          address,
          current && current.name
            ? current.name
            : v2Current && v2Current.name
            ? v2Current.name
            : '',
        ),
        symbol: formatTokenSymbol(
          address,
          current && current.symbol
            ? current.symbol
            : v2Current && v2Current.symbol
            ? v2Current.symbol
            : '',
        ),
        decimals:
          current && current.decimals
            ? current.decimals
            : v2Current && v2Current.decimals
            ? v2Current.decimals
            : 18,
        oneDayVolumeUSD,
        totalLiquidityUSD: tvlUSD,
        liquidityChangeUSD: tvlUSDChange,
        priceUSD,
        priceChangeUSD,
      };
    });

    return formatted;
  } catch (err) {
    console.error(err);
  }
}

export async function getTopTokensV3(
  maticPrice: number,
  maticPrice24H: number,
  count = 500,
): Promise<any> {
  try {
    const utcCurrentTime = dayjs();

    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();

    const [oneDayBlock] = await getBlocksFromTimestamps([utcOneDayBack]);

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

    const parsedTokens = parseTokensData(tokensCurrent);
    const parsedTokens24 = parseTokensData(tokens24);

    const formatted = tokenAddresses.map((address: string) => {
      const current = parsedTokens[address];
      const oneDay = parsedTokens24[address];

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

      const currentVolume =
        current && current[manageUntrackedVolume]
          ? Number(current[manageUntrackedVolume])
          : 0;

      const oneDayVolume =
        oneDay && oneDay[manageUntrackedVolume]
          ? Number(oneDay[manageUntrackedVolume])
          : 0;

      const oneDayVolumeUSD = currentVolume - oneDayVolume;

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
    const utcTwoWeekBack = utcCurrentTime.subtract(14, 'day').unix();

    const [
      oneDayBlock,
      twoDayBlock,
      oneWeekBlock,
      twoWeekBlock,
    ] = await getBlocksFromTimestamps([
      utcOneDayBack,
      utcTwoDaysBack,
      utcOneWeekBack,
      utcTwoWeekBack,
    ]);

    const tokensCurrent = await fetchTokensByTime(undefined, [address]);
    const tokens24 = await fetchTokensByTime(oneDayBlock.number, [address]);
    const tokens48 = await fetchTokensByTime(twoDayBlock.number, [address]);
    const tokensOneWeek = await fetchTokensByTime(oneWeekBlock.number, [
      address,
    ]);
    const tokensTwoWeek = await fetchTokensByTime(twoWeekBlock.number, [
      address,
    ]);

    const parsedTokens = parseTokensData(tokensCurrent);
    const parsedTokens24 = parseTokensData(tokens24);
    const parsedTokens48 = parseTokensData(tokens48);
    const parsedTokensOneWeek = parseTokensData(tokensOneWeek);
    const parsedTokensTwoWeek = parseTokensData(tokensTwoWeek);

    const current = parsedTokens[address];
    const oneDay = parsedTokens24[address];
    const twoDay = parsedTokens48[address];
    const oneWeek = parsedTokensOneWeek[address];
    const twoWeek = parsedTokensTwoWeek[address];

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

    const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
      current && current[manageUntrackedVolume]
        ? Number(current[manageUntrackedVolume])
        : 0,
      oneDay && oneDay[manageUntrackedVolume]
        ? Number(oneDay[manageUntrackedVolume])
        : 0,
      twoDay && twoDay[manageUntrackedVolume]
        ? Number(twoDay[manageUntrackedVolume])
        : 0,
    );

    const [oneWeekVolumeUSD] = get2DayPercentChange(
      current && current[manageUntrackedVolume]
        ? Number(current[manageUntrackedVolume])
        : 0,
      oneWeek && oneWeek[manageUntrackedVolume]
        ? Number(oneWeek[manageUntrackedVolume])
        : 0,
      twoWeek && twoWeek[manageUntrackedVolume]
        ? Number(twoWeek[manageUntrackedVolume])
        : 0,
    );

    const tvlUSD = current ? parseFloat(current[manageUntrackedTVL]) : 0;
    const tvlUSDChange = getPercentChange(
      current && current[manageUntrackedTVL]
        ? Number(current[manageUntrackedTVL])
        : 0,
      oneDay && oneDay[manageUntrackedTVL]
        ? Number(oneDay[manageUntrackedTVL])
        : 0,
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
          oneWeekVolumeUSD,
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

export async function getTokenInfoTotal(
  maticPrice: number,
  maticPrice24H: number,
  ethPrice: number,
  ethPriceOld: number,
  address: string,
): Promise<any> {
  try {
    const utcCurrentTime = dayjs();

    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
    const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix();
    const utcOneWeekBack = utcCurrentTime.subtract(7, 'day').unix();
    const utcTwoWeekBack = utcCurrentTime.subtract(14, 'day').unix();

    const [
      oneDayBlock,
      twoDayBlock,
      oneWeekBlock,
      twoWeekBlock,
    ] = await getBlocksFromTimestamps([
      utcOneDayBack,
      utcTwoDaysBack,
      utcOneWeekBack,
      utcTwoWeekBack,
    ]);

    const tokensCurrent = await fetchTokensByTime(undefined, [address]);
    const tokens24 = await fetchTokensByTime(oneDayBlock.number, [address]);
    const tokens48 = await fetchTokensByTime(twoDayBlock.number, [address]);
    const tokensOneWeek = await fetchTokensByTime(oneWeekBlock.number, [
      address,
    ]);
    const tokensTwoWeek = await fetchTokensByTime(twoWeekBlock.number, [
      address,
    ]);

    const currentV2 = await clientV2.query({
      query: TOKEN_INFO(address),
      fetchPolicy: 'network-only',
    });

    const oneDayResultV2 = await clientV2.query({
      query: TOKEN_INFO_OLD(oneDayBlock.number, address),
      fetchPolicy: 'network-only',
    });

    const twoDayResultV2 = await clientV2.query({
      query: TOKEN_INFO_OLD(twoDayBlock.number, address),
      fetchPolicy: 'network-only',
    });

    const oneWeekResultV2 = await clientV2.query({
      query: TOKEN_INFO_OLD(oneWeekBlock.number, address),
      fetchPolicy: 'network-only',
    });

    const twoWeekResultV2 = await clientV2.query({
      query: TOKEN_INFO_OLD(twoWeekBlock.number, address),
      fetchPolicy: 'network-only',
    });

    const parsedTokens = parseTokensData(tokensCurrent);
    const parsedTokens24 = parseTokensData(tokens24);
    const parsedTokens48 = parseTokensData(tokens48);
    const parsedTokensOneWeek = parseTokensData(tokensOneWeek);
    const parsedTokensTwoWeek = parseTokensData(tokensTwoWeek);

    const current = parsedTokens[address];
    const oneDay = parsedTokens24[address];
    const twoDay = parsedTokens48[address];
    const oneWeek = parsedTokensOneWeek[address];
    const twoWeek = parsedTokensTwoWeek[address];

    const currentDataV2 =
      currentV2 &&
      currentV2.data &&
      currentV2.data.tokens &&
      currentV2.data.tokens.length > 0
        ? currentV2.data.tokens[0]
        : undefined;

    let oneDayDataV2 =
      oneDayResultV2 &&
      oneDayResultV2.data &&
      oneDayResultV2.data.tokens &&
      oneDayResultV2.data.tokens.length > 0
        ? oneDayResultV2.data.tokens[0]
        : undefined;

    let twoDayDataV2 =
      twoDayResultV2 &&
      twoDayResultV2.data &&
      twoDayResultV2.data.tokens &&
      twoDayResultV2.data.tokens.length > 0
        ? twoDayResultV2.data.tokens[0]
        : undefined;

    let oneWeekDataV2 =
      oneWeekResultV2 &&
      oneWeekResultV2.data &&
      oneWeekResultV2.data.tokens &&
      oneWeekResultV2.data.tokens.length > 0
        ? oneWeekResultV2.data.tokens[0]
        : undefined;

    let twoWeekDataV2 =
      twoWeekResultV2 &&
      twoWeekResultV2.data &&
      twoWeekResultV2.data.tokens &&
      twoWeekResultV2.data.tokens.length > 0
        ? twoWeekResultV2.data.tokens[0]
        : undefined;

    if (
      Number(oneDayDataV2?.totalLiquidity ?? 0) ===
        Number(currentDataV2?.totalLiquidity ?? 0) &&
      Number(oneDayDataV2?.tradeVolume ?? 0) ===
        Number(currentDataV2?.tradeVolume ?? 0) &&
      Number(oneDayDataV2?.derivedETH ?? 0) ===
        Number(currentDataV2?.derivedETH ?? 0)
    ) {
      oneDayDataV2 = null;
    }

    if (
      Number(twoDayDataV2?.totalLiquidity ?? 0) ===
        Number(currentDataV2?.totalLiquidity ?? 0) &&
      Number(twoDayDataV2?.tradeVolume ?? 0) ===
        Number(currentDataV2?.tradeVolume ?? 0) &&
      Number(twoDayDataV2?.derivedETH ?? 0) ===
        Number(currentDataV2?.derivedETH ?? 0)
    ) {
      twoDayDataV2 = null;
    }

    if (
      Number(oneWeekDataV2?.totalLiquidity ?? 0) ===
        Number(currentDataV2?.totalLiquidity ?? 0) &&
      Number(oneWeekDataV2?.tradeVolume ?? 0) ===
        Number(currentDataV2?.tradeVolume ?? 0) &&
      Number(oneWeekDataV2?.derivedETH ?? 0) ===
        Number(currentDataV2?.derivedETH ?? 0)
    ) {
      oneWeekDataV2 = null;
    }

    if (
      Number(twoWeekDataV2?.totalLiquidity ?? 0) ===
        Number(currentDataV2?.totalLiquidity ?? 0) &&
      Number(twoWeekDataV2?.tradeVolume ?? 0) ===
        Number(currentDataV2?.tradeVolume ?? 0) &&
      Number(twoWeekDataV2?.derivedETH ?? 0) ===
        Number(currentDataV2?.derivedETH ?? 0)
    ) {
      twoWeekDataV2 = null;
    }

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

    const currentVolumeV3 =
      current && current[manageUntrackedVolume]
        ? Number(current[manageUntrackedVolume])
        : 0;

    const oneDayVolumeV3 =
      oneDay && oneDay[manageUntrackedVolume]
        ? Number(oneDay[manageUntrackedVolume])
        : 0;

    const twoDayVolumeV3 =
      twoDay && twoDay[manageUntrackedVolume]
        ? Number(twoDay[manageUntrackedVolume])
        : 0;

    const oneWeekVolumeV3 =
      oneWeek && oneWeek[manageUntrackedVolume]
        ? Number(oneWeek[manageUntrackedVolume])
        : 0;

    const twoWeekVolumeV3 =
      twoWeek && twoWeek[manageUntrackedVolume]
        ? Number(twoWeek[manageUntrackedVolume])
        : 0;

    const currentVolumeV2 =
      currentDataV2 && currentDataV2.tradeVolumeUSD
        ? Number(currentDataV2.tradeVolumeUSD)
        : 0;

    const oneDayVolumeV2 =
      oneDayDataV2 && oneDayDataV2.tradeVolumeUSD
        ? Number(oneDayDataV2.tradeVolumeUSD)
        : 0;

    const twoDayVolumeV2 =
      twoDayDataV2 && twoDayDataV2.tradeVolumeUSD
        ? Number(twoDayDataV2.tradeVolumeUSD)
        : 0;

    const oneWeekVolumeV2 =
      oneWeekDataV2 && oneWeekDataV2.tradeVolumeUSD
        ? Number(oneWeekDataV2.tradeVolumeUSD)
        : 0;

    const twoWeekVolumeV2 =
      twoWeekDataV2 && twoWeekDataV2.tradeVolumeUSD
        ? Number(twoWeekDataV2.tradeVolumeUSD)
        : 0;

    const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
      currentVolumeV3 + currentVolumeV2,
      oneDayVolumeV3 + oneDayVolumeV2,
      twoDayVolumeV3 + twoDayVolumeV2,
    );

    const [oneWeekVolumeUSD] = get2DayPercentChange(
      currentVolumeV3 + currentVolumeV2,
      oneWeekVolumeV3 + oneWeekVolumeV2,
      twoWeekVolumeV3 + twoWeekVolumeV2,
    );

    const currentTVL =
      current && current[manageUntrackedTVL]
        ? Number(current[manageUntrackedTVL])
        : 0;

    const oneDayTVL =
      oneDay && oneDay[manageUntrackedTVL]
        ? Number(oneDay[manageUntrackedTVL])
        : 0;

    const currentTVLV2 = currentDataV2
      ? Number(currentDataV2.totalLiquidity ?? 0) *
        ethPrice *
        Number(currentDataV2.derivedETH ?? 0)
      : 0;

    const oneDayTVLV2 = oneDayDataV2
      ? Number(oneDayDataV2.totalLiquidity ?? 0) *
        ethPriceOld *
        Number(oneDayDataV2.derivedETH ?? 0)
      : 0;

    const tvlUSD = currentTVL + currentTVLV2;
    const tvlUSDChange = getPercentChange(
      currentTVL + currentTVLV2,
      oneDayTVL + oneDayTVLV2,
    );

    const tvlToken = currentTVL + currentTVLV2;

    const priceUSDV3 =
      current && current.derivedMatic
        ? Number(current.derivedMatic) * maticPrice
        : 0;
    const priceUSDOneDayV3 =
      oneDay && oneDay.derivedMatic
        ? Number(oneDay.derivedMatic) * maticPrice24H
        : 0;

    const priceUSDV2 =
      currentDataV2 && currentDataV2.derivedETH
        ? Number(currentDataV2.derivedETH) * ethPrice
        : 0;
    const priceUSDOneDayV2 =
      oneDayDataV2 && oneDayDataV2.derivedETH
        ? Number(oneDayDataV2.derivedETH) * ethPriceOld
        : 0;

    const priceUSD = priceUSDV2 > 0 ? priceUSDV2 : priceUSDV3;
    const priceUSDOneDay =
      priceUSDOneDayV2 > 0 ? priceUSDOneDayV2 : priceUSDOneDayV3;

    const priceChangeUSD = getPercentChange(priceUSD, priceUSDOneDay);

    const feesCurrentV3 =
      current && current.feesUSD ? Number(current.feesUSD) : 0;
    const feesOneDayV3 = oneDay && oneDay.feesUSD ? Number(oneDay.feesUSD) : 0;
    const feesCurrentV2 = currentVolumeV2 * GlobalConst.utils.FEEPERCENT;
    const feesOneDayV2 = oneDayVolumeV2 * GlobalConst.utils.FEEPERCENT;

    const feesUSD = feesCurrentV3 + feesCurrentV2 - feesOneDayV3 - feesOneDayV2;

    const tokenCurrent = current ?? currentV2;

    return tokenCurrent
      ? {
          id: address,
          name: tokenCurrent ? formatTokenName(address, tokenCurrent.name) : '',
          symbol: tokenCurrent
            ? formatTokenSymbol(address, tokenCurrent.symbol)
            : '',
          decimals: tokenCurrent ? tokenCurrent.decimals : 18,
          oneDayVolumeUSD,
          volumeChangeUSD,
          oneWeekVolumeUSD,
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

export const getTokenChartDataTotal = async (
  tokenAddress: string,
  startTime: number,
) => {
  const v3Data = await getTokenChartDataV3(tokenAddress, startTime);
  const v2Data = await getTokenChartData(tokenAddress, startTime);
  const totalData = v3Data.map((item) => {
    const v2Item = v2Data.find((v2Item) => v2Item.date === item.date);
    return {
      ...item,
      dailyVolumeUSD:
        (item && item.dailyVolumeUSD ? Number(item.dailyVolumeUSD) : 0) +
        (v2Item && v2Item.dailyVolumeUSD ? Number(v2Item.dailyVolumeUSD) : 0),
      priceUSD:
        item && item.priceUSD
          ? Number(item.priceUSD)
          : v2Item && v2Item.priceUSD
          ? Number(v2Item.priceUSD)
          : 0,
      totalLiquidityUSD:
        (item && item.totalLiquidityUSD ? Number(item.totalLiquidityUSD) : 0) +
        (v2Item && v2Item.totalLiquidityUSD
          ? Number(v2Item.totalLiquidityUSD)
          : 0),
    };
  });
  return totalData;
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
    const utcOneWeekBack = utcCurrentTime.subtract(1, 'week').unix();

    const [oneDayBlock, oneWeekBlock] = await getBlocksFromTimestamps([
      utcOneDayBack,
      utcOneWeekBack,
    ]);

    const topPairsIds = await clientV3.query({
      query: TOP_POOLS_V3(count),
      fetchPolicy: 'network-only',
    });

    const pairsAddresses = topPairsIds.data.pools.map((el: any) => el.id);

    const pairsCurrent = await fetchPairsByTime(undefined, pairsAddresses);
    const pairs24 = await fetchPairsByTime(oneDayBlock.number, pairsAddresses);
    const pairsWeek = await fetchPairsByTime(
      oneWeekBlock.number,
      pairsAddresses,
    );

    const parsedPairs = parsePairsData(pairsCurrent);
    const parsedPairs24 = parsePairsData(pairs24);
    const parsedPairsWeek = parsePairsData(pairsWeek);

    const formatted = pairsAddresses.map((address: string) => {
      const current = parsedPairs[address];
      const oneDay = parsedPairs24[address];
      const week = parsedPairsWeek[address];

      if (!current) return;

      const manageUntrackedVolume =
        +current.volumeUSD <= 1 ? 'untrackedVolumeUSD' : 'volumeUSD';

      const manageUntrackedTVL =
        +current.totalValueLockedUSD <= 1
          ? 'totalValueLockedUSDUntracked'
          : 'totalValueLockedUSD';

      const currentVolume =
        current && current[manageUntrackedVolume]
          ? Number(current[manageUntrackedVolume])
          : 0;

      const oneDayVolume =
        oneDay && oneDay[manageUntrackedVolume]
          ? Number(oneDay[manageUntrackedVolume])
          : 0;

      const oneWeekVolume =
        week && week[manageUntrackedVolume]
          ? Number(week[manageUntrackedVolume])
          : 0;

      const oneDayVolumeUSD = currentVolume - oneDayVolume;

      const oneWeekVolumeUSD = currentVolume - oneWeekVolume;

      const tvlUSD = parseFloat(current[manageUntrackedTVL]);
      const tvlUSDChange = getPercentChange(
        current[manageUntrackedTVL],
        oneDay ? oneDay[manageUntrackedTVL] : undefined,
      );

      return {
        isV3: true,
        token0: current.token0,
        token1: current.token1,
        fee: current.fee,
        id: address,
        oneDayVolumeUSD,
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

export async function getTopPairsTotal(count = 500) {
  try {
    const utcCurrentTime = dayjs();

    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
    const utcOneWeekBack = utcCurrentTime.subtract(1, 'week').unix();

    const [oneDayBlock, oneWeekBlock] = await getBlocksFromTimestamps([
      utcOneDayBack,
      utcOneWeekBack,
    ]);

    const topPairsIds = await clientV3.query({
      query: TOP_POOLS_V3(count),
      fetchPolicy: 'network-only',
    });

    const topPairIdsV2 = await clientV2.query({
      query: PAIRS_CURRENT(count),
      fetchPolicy: 'network-only',
    });

    const pairsAddresses = topPairsIds.data.pools.map((el: any) => el.id);
    const v2PairsAddresses = topPairIdsV2.data.pairs.map((el: any) => el.id);

    const pairsCurrent = await fetchPairsByTime(undefined, pairsAddresses);
    const pairs24 = await fetchPairsByTime(oneDayBlock.number, pairsAddresses);
    const pairsWeek = await fetchPairsByTime(
      oneWeekBlock.number,
      pairsAddresses,
    );

    const v2PairsResult = await clientV2.query({
      query: PAIRS_BULK1,
      variables: {
        allPairs: v2PairsAddresses,
      },
      fetchPolicy: 'network-only',
    });
    const v2PairsCurrent =
      v2PairsResult &&
      v2PairsResult.data &&
      v2PairsResult.data.pairs &&
      v2PairsResult.data.pairs.length > 0
        ? v2PairsResult.data.pairs
        : [];

    const [v2OneDayResult, v2OneWeekResult] = await Promise.all(
      [oneDayBlock, oneWeekBlock].map(async (block) => {
        const result = await clientV2.query({
          query: PAIRS_HISTORICAL_BULK(block.number, v2PairsAddresses),
          fetchPolicy: 'network-only',
        });
        return result;
      }),
    );

    const v2PairsOneDay =
      v2OneDayResult &&
      v2OneDayResult.data &&
      v2OneDayResult.data.pairs &&
      v2OneDayResult.data.pairs.length > 0
        ? v2OneDayResult.data.pairs
        : [];

    const v2PairsOneWeek =
      v2OneWeekResult &&
      v2OneWeekResult.data &&
      v2OneWeekResult.data.pairs &&
      v2OneWeekResult.data.pairs.length > 0
        ? v2OneWeekResult.data.pairs
        : [];

    const parsedPairs = parsePairsData(pairsCurrent);
    const parsedPairs24 = parsePairsData(pairs24);
    const parsedPairsWeek = parsePairsData(pairsWeek);

    const parsedPairsV2 = parsePairsData(v2PairsCurrent);
    const parsedPairs24V2 = parsePairsData(v2PairsOneDay);
    const parsedPairsWeekV2 = parsePairsData(v2PairsOneWeek);

    const formattedV3 = pairsAddresses.map((address: string) => {
      const current = parsedPairs[address];
      const oneDay = parsedPairs24[address];
      const week = parsedPairsWeek[address];

      const manageUntrackedVolume =
        current && current.volumeUSD && Number(current.volumeUSD) <= 1
          ? 'untrackedVolumeUSD'
          : 'volumeUSD';

      const manageUntrackedTVL =
        current &&
        current.totalValueLockedUSD &&
        Number(current.totalValueLockedUSD) <= 1
          ? 'totalValueLockedUSDUntracked'
          : 'totalValueLockedUSD';

      const v3CurrentVolumeUSD =
        current && current[manageUntrackedVolume]
          ? Number(current[manageUntrackedVolume])
          : 0;

      const v3OneDayVolumeUSD =
        oneDay && oneDay[manageUntrackedVolume]
          ? Number(oneDay[manageUntrackedVolume])
          : 0;

      const v3WeekVolumeUSD =
        week && week[manageUntrackedVolume]
          ? Number(week[manageUntrackedVolume])
          : 0;

      const oneDayVolumeUSD = v3CurrentVolumeUSD - v3OneDayVolumeUSD;

      const oneWeekVolumeUSD = v3CurrentVolumeUSD - v3WeekVolumeUSD;

      const v3CurrentTVL =
        current && current[manageUntrackedTVL]
          ? Number(current[manageUntrackedTVL])
          : 0;

      const v3OneDayTVL =
        oneDay && oneDay[manageUntrackedTVL]
          ? Number(oneDay[manageUntrackedTVL])
          : 0;

      const tvlUSD = v3CurrentTVL;
      const tvlUSDChange = getPercentChange(tvlUSD, v3OneDayTVL);

      return current
        ? {
            isV3: true,
            token0: current.token0,
            token1: current.token1,
            fee: current.fee,
            id: address,
            oneDayVolumeUSD,
            oneWeekVolumeUSD,
            trackedReserveUSD: tvlUSD,
            tvlUSDChange,
            totalValueLockedUSD: tvlUSD,
          }
        : undefined;
    });

    const formattedV2 = v2PairsAddresses.map((address: string) => {
      const v2Current = parsedPairsV2[address];
      const v2OneDay = parsedPairs24V2[address];
      const v2OneWeek = parsedPairsWeekV2[address];

      const v2CurrentVolumeUSD =
        v2Current && v2Current.volumeUSD ? Number(v2Current.volumeUSD) : 0;

      const v2OneDayVolumeUSD =
        v2OneDay && v2OneDay.volumeUSD ? Number(v2OneDay.volumeUSD) : 0;

      const v2WeekVolumeUSD =
        v2OneWeek && v2OneWeek.volumeUSD ? Number(v2OneWeek.volumeUSD) : 0;

      const oneDayVolumeUSD = v2CurrentVolumeUSD - v2OneDayVolumeUSD;

      const oneWeekVolumeUSD = v2CurrentVolumeUSD - v2WeekVolumeUSD;

      const v2CurrentTVL = v2Current
        ? v2Current.trackedReserveUSD
          ? Number(v2Current.trackedReserveUSD)
          : v2Current.reserveUSD
          ? Number(v2Current.reserveUSD)
          : 0
        : 0;

      const v2OneDayTVL = v2OneDay
        ? v2OneDay.trackedReserveUSD
          ? Number(v2OneDay.trackedReserveUSD)
          : v2OneDay.reserveUSD
          ? Number(v2OneDay.reserveUSD)
          : 0
        : 0;

      const tvlUSD = v2CurrentTVL;
      const tvlUSDChange = getPercentChange(tvlUSD, v2OneDayTVL);

      return v2Current
        ? {
            isV3: false,
            token0: v2Current.token0,
            token1: v2Current.token1,
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

    return formattedV3.concat(formattedV2).filter((item: any) => !!item);
  } catch (err) {
    console.error(err);
  }
}

export async function getTopPairsV3ByToken(tokenAddress: string) {
  try {
    const utcCurrentTime = dayjs();

    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
    const utcOneWeekBack = utcCurrentTime.subtract(1, 'week').unix();

    const [oneDayBlock, oneWeekBlock] = await getBlocksFromTimestamps([
      utcOneDayBack,
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
    const pairsWeek = await fetchPairsByTime(
      oneWeekBlock.number,
      pairsAddresses,
    );

    const parsedPairs = parsePairsData(pairsCurrent);
    const parsedPairs24 = parsePairsData(pairs24);
    const parsedPairsWeek = parsePairsData(pairsWeek);

    const formatted = pairsAddresses.map((address: string) => {
      const current = parsedPairs[address];
      const oneDay = parsedPairs24[address];
      const week = parsedPairsWeek[address];

      if (!current) return;

      const manageUntrackedVolume =
        +current.volumeUSD <= 1 ? 'untrackedVolumeUSD' : 'volumeUSD';

      const manageUntrackedTVL =
        +current.totalValueLockedUSD <= 1
          ? 'totalValueLockedUSDUntracked'
          : 'totalValueLockedUSD';

      const currentVolume =
        current && current[manageUntrackedVolume]
          ? Number(current[manageUntrackedVolume])
          : 0;
      const oneDayVolume =
        oneDay && oneDay[manageUntrackedVolume]
          ? Number(oneDay[manageUntrackedVolume])
          : 0;
      const oneDayVolumeUSD = currentVolume - oneDayVolume;

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
        isV3: true,
        token0: current.token0,
        token1: current.token1,
        fee: current.fee,
        id: address,
        oneDayVolumeUSD,
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

export async function getTopPairsTotalByToken(tokenAddress: string) {
  try {
    const utcCurrentTime = dayjs();

    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
    const utcOneWeekBack = utcCurrentTime.subtract(1, 'week').unix();

    const [oneDayBlock, oneWeekBlock] = await getBlocksFromTimestamps([
      utcOneDayBack,
      utcOneWeekBack,
    ]);

    const topPairsIds = await clientV3.query({
      query: TOP_POOLS_V3_TOKEN(tokenAddress),
      fetchPolicy: 'network-only',
    });

    const topPairIdsV2 = await clientV2.query({
      query: TOKEN_DATA2(tokenAddress),
      fetchPolicy: 'network-only',
    });

    const pairsAddresses = topPairsIds.data.pools0
      .concat(topPairsIds.data.pools1)
      .map((el: any) => el.id);
    const v2PairsAddresses = topPairIdsV2.data.pairs0
      .concat(topPairIdsV2.data.pairs1)
      .map((el: any) => el.id);

    const pairsCurrent = await fetchPairsByTime(undefined, pairsAddresses);
    const pairs24 = await fetchPairsByTime(oneDayBlock.number, pairsAddresses);
    const pairsWeek = await fetchPairsByTime(
      oneWeekBlock.number,
      pairsAddresses,
    );

    const v2PairsResult = await clientV2.query({
      query: PAIRS_BULK1,
      variables: {
        allPairs: v2PairsAddresses,
      },
      fetchPolicy: 'network-only',
    });
    const v2PairsCurrent =
      v2PairsResult &&
      v2PairsResult.data &&
      v2PairsResult.data.pairs &&
      v2PairsResult.data.pairs.length > 0
        ? v2PairsResult.data.pairs
        : [];

    const [v2OneDayResult, v2OneWeekResult] = await Promise.all(
      [oneDayBlock, oneWeekBlock].map(async (block) => {
        const result = await clientV2.query({
          query: PAIRS_HISTORICAL_BULK(block.number, v2PairsAddresses),
          fetchPolicy: 'network-only',
        });
        return result;
      }),
    );

    const v2PairsOneDay =
      v2OneDayResult &&
      v2OneDayResult.data &&
      v2OneDayResult.data.pairs &&
      v2OneDayResult.data.pairs.length > 0
        ? v2OneDayResult.data.pairs
        : [];

    const v2PairsOneWeek =
      v2OneWeekResult &&
      v2OneWeekResult.data &&
      v2OneWeekResult.data.pairs &&
      v2OneWeekResult.data.pairs.length > 0
        ? v2OneWeekResult.data.pairs
        : [];

    const parsedPairs = parsePairsData(pairsCurrent);
    const parsedPairs24 = parsePairsData(pairs24);
    const parsedPairsWeek = parsePairsData(pairsWeek);

    const parsedPairsV2 = parsePairsData(v2PairsCurrent);
    const parsedPairs24V2 = parsePairsData(v2PairsOneDay);
    const parsedPairsWeekV2 = parsePairsData(v2PairsOneWeek);

    const formattedV3 = pairsAddresses.map((address: string) => {
      const current = parsedPairs[address];
      const oneDay = parsedPairs24[address];
      const week = parsedPairsWeek[address];

      const manageUntrackedVolume =
        current && current.volumeUSD && Number(current.volumeUSD) <= 1
          ? 'untrackedVolumeUSD'
          : 'volumeUSD';

      const manageUntrackedTVL =
        current &&
        current.totalValueLockedUSD &&
        Number(current.totalValueLockedUSD) <= 1
          ? 'totalValueLockedUSDUntracked'
          : 'totalValueLockedUSD';

      const v3CurrentVolumeUSD =
        current && current[manageUntrackedVolume]
          ? Number(current[manageUntrackedVolume])
          : 0;

      const v3OneDayVolumeUSD =
        oneDay && oneDay[manageUntrackedVolume]
          ? Number(oneDay[manageUntrackedVolume])
          : 0;

      const v3WeekVolumeUSD =
        week && week[manageUntrackedVolume]
          ? Number(week[manageUntrackedVolume])
          : 0;

      const oneDayVolumeUSD = v3CurrentVolumeUSD - v3OneDayVolumeUSD;

      const oneWeekVolumeUSD = v3CurrentVolumeUSD - v3WeekVolumeUSD;

      const v3CurrentTVL =
        current && current[manageUntrackedTVL]
          ? Number(current[manageUntrackedTVL])
          : 0;

      const v3OneDayTVL =
        oneDay && oneDay[manageUntrackedTVL]
          ? Number(oneDay[manageUntrackedTVL])
          : 0;

      const tvlUSD = v3CurrentTVL;
      const tvlUSDChange = getPercentChange(tvlUSD, v3OneDayTVL);

      return current
        ? {
            isV3: true,
            token0: current.token0,
            token1: current.token1,
            fee: current.fee,
            id: address,
            oneDayVolumeUSD,
            oneWeekVolumeUSD,
            trackedReserveUSD: tvlUSD,
            tvlUSDChange,
            totalValueLockedUSD: tvlUSD,
          }
        : undefined;
    });

    const formattedV2 = v2PairsAddresses.map((address: string) => {
      const v2Current = parsedPairsV2[address];
      const v2OneDay = parsedPairs24V2[address];
      const v2OneWeek = parsedPairsWeekV2[address];

      const v2CurrentVolumeUSD =
        v2Current && v2Current.volumeUSD ? Number(v2Current.volumeUSD) : 0;

      const v2OneDayVolumeUSD =
        v2OneDay && v2OneDay.volumeUSD ? Number(v2OneDay.volumeUSD) : 0;

      const v2WeekVolumeUSD =
        v2OneWeek && v2OneWeek.volumeUSD ? Number(v2OneWeek.volumeUSD) : 0;

      const oneDayVolumeUSD = v2CurrentVolumeUSD - v2OneDayVolumeUSD;

      const oneWeekVolumeUSD = v2CurrentVolumeUSD - v2WeekVolumeUSD;

      const v2CurrentTVL = v2Current
        ? v2Current.trackedReserveUSD
          ? Number(v2Current.trackedReserveUSD)
          : v2Current.reserveUSD
          ? Number(v2Current.reserveUSD)
          : 0
        : 0;

      const v2OneDayTVL = v2OneDay
        ? v2OneDay.trackedReserveUSD
          ? Number(v2OneDay.trackedReserveUSD)
          : v2OneDay.reserveUSD
          ? Number(v2OneDay.reserveUSD)
          : 0
        : 0;

      const tvlUSD = v2CurrentTVL;
      const tvlUSDChange = getPercentChange(tvlUSD, v2OneDayTVL);

      return v2Current
        ? {
            isV3: false,
            token0: v2Current.token0,
            token1: v2Current.token1,
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

    return formattedV3.concat(formattedV2).filter((item: any) => !!item);
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
              symbol: formatTokenSymbol(
                current.token0.id,
                current.token0.symbol,
              ),
            },
            token1: {
              ...current.token1,
              symbol: formatTokenSymbol(
                current.token1.id,
                current.token1.symbol,
              ),
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

export async function getTokenTransactionsTotal(address: string): Promise<any> {
  try {
    const data = await clientV3.query({
      query: GLOBAL_TRANSACTIONS_V3,
      variables: {
        address: address,
      },
      fetchPolicy: 'network-only',
    });

    const v2tokenPairs = await getTokenPairs2(address);
    const formattedPairs = v2tokenPairs
      ? v2tokenPairs.map((pair: any) => {
          return pair.id;
        })
      : [];

    const dataV2 = await clientV2.query({
      query: FILTERED_TRANSACTIONS,
      variables: {
        allPairs: formattedPairs,
      },
      fetchPolicy: 'network-only',
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

    const mintsV2 = dataV2.data.mints.map((m: any) => {
      return {
        ...m,
        isV2: true,
      };
    });

    const swapsV2 = dataV2.data.swaps.map((m: any) => {
      return {
        ...m,
        isV2: true,
      };
    });

    const burnsV2 = dataV2.data.burns.map((m: any) => {
      return {
        ...m,
        isV2: true,
      };
    });

    return {
      mints: [...mints0, ...mints1, ...mintsV2],
      burns: [...burns0, ...burns1, ...burnsV2],
      swaps: [...swaps0, ...swaps1, ...swapsV2],
    };
  } catch (e) {
    console.log('err', e);
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

async function fetchTokensByTimeV2(
  blockNumber: number | undefined,
  tokenAddresses: string[],
): Promise<any> {
  try {
    const tokens = await clientV2.query({
      query: TOKENS_FROM_ADDRESSES_V2(blockNumber, tokenAddresses),
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
  } else if (symbol.toLowerCase() === 'amaticc') {
    return 'ankrMATIC';
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

function parsePairsData(pairData: any) {
  return pairData
    ? pairData.reduce((accum: { [address: string]: any }, poolData: any) => {
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
