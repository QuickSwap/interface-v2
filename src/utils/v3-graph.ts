import { clientV3 } from 'apollo/client';
import {
  ALL_PAIRS_V3,
  ALL_TOKENS_V3,
  GLOBAL_CHART_V3,
  GLOBAL_DATA_V3,
  PAIRS_FROM_ADDRESSES_V3,
  TOKENS_FROM_ADDRESSES_V3,
  TOKEN_CHART_V3,
  TOP_POOLS_V3,
  TOP_TOKENS_V3,
} from 'apollo/queries-v3';
import {
  get2DayPercentChange,
  getBlocksFromTimestamps,
  getPercentChange,
  getSecondsOneDay,
} from 'utils';
import dayjs from 'dayjs';
import { fetchEternalFarmAPR, fetchPoolsAPR } from './aprApi';

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

    const dataOneWeek = await clientV3.query({
      query: GLOBAL_DATA_V3(oneWeekBlock.number),
      fetchPolicy: 'network-only',
    });

    const dataTwoWeek = await clientV3.query({
      query: GLOBAL_DATA_V3(twoWeekBlock.number),
      fetchPolicy: 'network-only',
    });

    const [statsCurrent, statsOneDay, statsOneWeek, statsTwoWeek] = [
      dataCurrent.data.factories[0],
      dataOneDay.data.factories[0],
      dataOneWeek.data.factories[0],
      dataTwoWeek.data.factories[0],
    ];

    const volumeUSD =
      statsCurrent && statsOneDay
        ? parseFloat(statsCurrent.totalVolumeUSD) -
          parseFloat(statsOneDay.totalVolumeUSD)
        : parseFloat(statsCurrent.totalVolumeUSD);

    const volumeUSDChange = getPercentChange(
      statsCurrent ? statsCurrent.totalVolumeUSD : undefined,
      statsOneDay ? statsOneDay.totalVolumeUSD : undefined,
    );

    const [oneWeekVolume, weeklyVolumeChange] = get2DayPercentChange(
      statsCurrent.totalVolumeUSD,
      statsOneWeek.totalVolumeUSD,
      statsTwoWeek.totalVolumeUSD,
    );

    const liquidityChangeUSD = getPercentChange(
      statsCurrent ? statsCurrent.totalValueLockedUSD : undefined,
      statsOneDay ? statsOneDay.totalValueLockedUSD : undefined,
    );

    const feesUSD =
      statsCurrent && statsOneDay
        ? parseFloat(statsCurrent.totalFeesUSD) -
          parseFloat(statsOneDay.totalFeesUSD)
        : parseFloat(statsCurrent.totalFeesUSD);

    const feesUSDChange = getPercentChange(
      statsCurrent ? statsCurrent.totalFeesUSD : undefined,
      statsOneDay ? statsOneDay.totalFeesUSD : undefined,
    );

    data = {
      totalLiquidityUSD: statsCurrent.totalValueLockedUSD,
      liquidityChangeUSD,
      volumeUSD,
      volumeUSDChange,
      feesUSD,
      feesUSDChange,
      oneWeekVolume,
      weeklyVolumeChange,
    };
  } catch (e) {
    console.log(e);
  }

  return data;
}

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
        (weeklyData[startIndexWeekly].weeklyVolumeUSD ?? 0) + data[i].volumeUSD;
    });
  } catch (e) {
    console.log(e);
  }
  return [data, weeklyData];
};

//Tokens

export async function getTopTokensV3(
  ethPrice: number,
  ethPrice24H: number,
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

      const manageUntrackedVolume =
        +current.volumeUSD <= 1 ? 'untrackedVolumeUSD' : 'volumeUSD';
      const manageUntrackedTVL =
        +current.totalValueLockedUSD <= 1
          ? 'totalValueLockedUSDUntracked'
          : 'totalValueLockedUSD';

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
        ? parseFloat(current.derivedMatic) * ethPrice
        : 0;
      const priceUSDOneDay = oneDay
        ? parseFloat(oneDay.derivedMatic) * ethPrice24H
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
        tvlUSD,
        feesUSD,
        tvlUSDChange,
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
  ethPrice: number,
  ethPrice24H: number,
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

    const manageUntrackedVolume =
      +current.volumeUSD <= 1 ? 'untrackedVolumeUSD' : 'volumeUSD';
    const manageUntrackedTVL =
      +current.totalValueLockedUSD <= 1
        ? 'totalValueLockedUSDUntracked'
        : 'totalValueLockedUSD';

    const [oneDayVolumeUSD, oneDayVolumeChangeUSD] =
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
    const priceUSD = current ? parseFloat(current.derivedMatic) * ethPrice : 0;
    const priceUSDOneDay = oneDay
      ? parseFloat(oneDay.derivedMatic) * ethPrice24H
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
      oneDayVolumeChangeUSD,
      txCount,
      tvlUSD,
      tvlUSDChange,
      feesUSD,
      tvlToken,
      priceUSD,
      priceChangeUSD,
    };
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

    console.log('Dat', data);
    data.forEach((dayData, i) => {
      // add the day index to the set of days
      dayIndexSet.add((data[i].date / oneDay).toFixed(0));
      dayIndexArray.push(data[i]);
      dayData.dailyVolumeUSD = Number(dayData.volumeUSD);
    });

    // fill in empty days
    let timestamp = data[0] && data[0].date ? data[0].date : startTime;
    let latestLiquidityUSD = data[0] && data[0].totalValueLockedUSD;
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
        latestLiquidityUSD = dayIndexArray[index].totalValueLockedUSD;
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

    const aprs: any = await fetchPoolsAPR();
    const farmingAprs: any = await fetchEternalFarmAPR();

    // const farmingAprs = await fetchEternalFarmingsAPRByPool(poolsAddresses)
    // const _farmingAprs: { [type: string]: number } = farmingAprs.reduce((acc, el) => (
    //     {
    //         ...acc,
    //         [el.pool]: farmAprs[el.id]
    //     }
    // ), {})

    // const limitFarms: { [key: string]: number } = await fetchLimitFarmAPR()

    // const filteredFarms: { [key: string]: number } = Object.entries(limitFarms).filter((el) => el[1] >= 0).reduce((acc, el) => ({
    //     ...acc,
    //     [el[0]]: el[1]
    // }), {})

    // const limitAprs = await fetchLimitFarmingsAPRByPool(poolsAddresses)
    // const _limitAprs: { [type: string]: number } = limitAprs.reduce((acc, el) => ({
    //     ...acc,
    //     [el.pool]: filteredFarms[el.id]
    // }), {})

    const formatted = pairsAddresses.map((address: string) => {
      const current = parsedPairs[address];
      const oneDay = parsedPairs24[address];
      const twoDay = parsedPairs48[address];
      const week = parsedPairsWeek[address];

      const manageUntrackedVolume =
        +current.volumeUSD <= 1 ? 'untrackedVolumeUSD' : 'volumeUSD';
      const manageUntrackedTVL =
        +current.totalValueLockedUSD <= 1
          ? 'totalValueLockedUSDUntracked'
          : 'totalValueLockedUSD';

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
      const aprPercent = aprs[address] ? aprs[address].toFixed(2) : 0;
      const farmingApr = farmingAprs[address]
        ? farmingAprs[address].toFixed(2)
        : 0;

      return {
        token0: current.token0,
        token1: current.token1,
        fee: current.fee,
        exists: !!current,
        id: address,
        oneDayVolumeUSD,
        oneDayVolumeChangeUSD,
        oneWeekVolumeUSD,
        trackedReserveUSD: tvlUSD,
        tvlUSDChange,
        totalValueLockedUSD: current[manageUntrackedTVL],
        apr: aprPercent,
        farmingApr: farmingApr,
        // apr: aprPercent,
        // aprType
      };
    });

    return formatted;
  } catch (err) {
    console.error(err);
  }
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

    const manageUntrackedVolume =
      +current.volumeUSD <= 1 ? 'untrackedVolumeUSD' : 'volumeUSD';
    const manageUntrackedTVL =
      +current.totalValueLockedUSD <= 1
        ? 'totalValueLockedUSDUntracked'
        : 'totalValueLockedUSD';

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
    const aprPercent = aprs[address] ? aprs[address].toFixed(2) : 0;
    const farmingApr = farmingAprs[address]
      ? farmingAprs[address].toFixed(2)
      : 0;

    return [
      {
        token0: current.token0,
        token1: current.token1,
        fee: current.fee,
        exists: !!current,
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
      },
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
