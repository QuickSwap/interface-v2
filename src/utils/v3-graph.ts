import { clientV3 } from 'apollo/client';
import {
  ALL_PAIRS_V3,
  ALL_TOKENS_V3,
  GLOBAL_DATA_V3,
  PAIRS_FROM_ADDRESSES_V3,
  TOKENS_FROM_ADDRESSES_V3,
  TOP_POOLS_V3,
  TOP_TOKENS_V3,
} from 'apollo/queries-v3';
import {
  get2DayPercentChange,
  getBlocksFromTimestamps,
  getPercentChange,
} from 'utils';
import dayjs from 'dayjs';
import { fetchEternalFarmAPR, fetchPoolsAPR } from './aprApi';

export async function getGlobalDataV3(): Promise<any> {
  let data: any = {};

  try {
    const utcCurrentTime = dayjs();

    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();

    const [oneDayBlock] = await getBlocksFromTimestamps([utcOneDayBack]);

    const dataCurrent = await clientV3.query({
      query: GLOBAL_DATA_V3(),
      fetchPolicy: 'network-only',
    });

    const data24H = await clientV3.query({
      query: GLOBAL_DATA_V3(oneDayBlock.number),
      fetchPolicy: 'network-only',
    });

    const [statsCurrent, stats24H] = [
      dataCurrent.data.factories[0],
      data24H.data.factories[0],
    ];

    const volumeUSD =
      statsCurrent && stats24H
        ? parseFloat(statsCurrent.totalVolumeUSD) -
          parseFloat(stats24H.totalVolumeUSD)
        : parseFloat(statsCurrent.totalVolumeUSD);

    const volumeUSDChange = getPercentChange(
      statsCurrent ? statsCurrent.totalVolumeUSD : undefined,
      stats24H ? stats24H.totalVolumeUSD : undefined,
    );

    const tvlUSDChange = getPercentChange(
      statsCurrent ? statsCurrent.totalValueLockedUSD : undefined,
      stats24H ? stats24H.totalValueLockedUSD : undefined,
    );

    const feesUSD =
      statsCurrent && stats24H
        ? parseFloat(statsCurrent.totalFeesUSD) -
          parseFloat(stats24H.totalFeesUSD)
        : parseFloat(statsCurrent.totalFeesUSD);

    const feesUSDChange = getPercentChange(
      statsCurrent ? statsCurrent.totalFeesUSD : undefined,
      stats24H ? stats24H.totalFeesUSD : undefined,
    );

    data = {
      tvlUSD: statsCurrent.totalValueLockedUSD,
      tvlUSDChange,
      volumeUSD,
      volumeUSDChange,
      feesUSD,
      feesUSDChange,
    };
  } catch (e) {
    console.log(e);
  }

  return data;
}

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
