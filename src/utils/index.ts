import { getAddress } from "@ethersproject/address";
import { Contract } from "@ethersproject/contracts";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { blockClient, client } from "apollo/client";
import {
  GET_BLOCK,
  GLOBAL_DATA,
  GET_BLOCKS,
  ETH_PRICE,
  TOKENS_CURRENT,
  TOKENS_DYNAMIC,
  TOKEN_DATA,
  TOKEN_DATA1,
  PAIR_DATA,
  PAIRS_BULK1,
  PAIRS_HISTORICAL_BULK,
  PRICES_BY_BLOCK,
} from "apollo/queries";
import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers";
import { abi as IUniswapV2Router02ABI } from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";
import {
  CurrencyAmount,
  ChainId,
  Percent,
  JSBI,
  Currency,
  ETHER,
  Token,
} from "@uniswap/sdk";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { formatUnits } from "ethers/lib/utils";
import { AddressZero } from "@ethersproject/constants";
import { TokenAddressMap } from "state/lists/hooks";
import {
  ALLOWED_PRICE_IMPACT_HIGH,
  PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN,
  ROUTER_ADDRESS,
  MIN_ETH,
} from "constants/index";
dayjs.extend(utc);
dayjs.extend(weekOfYear);

export { default as addMaticToMetamask } from "./addMaticToMetamask";

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

const TOKEN_OVERRIDES: { [address: string]: { name: string; symbol: string } } =
  {
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": {
      name: "Ether (Wrapped)",
      symbol: "ETH",
    },
    "0x1416946162b1c2c871a73b07e932d2fb6c932069": {
      name: "Energi",
      symbol: "NRGE",
    },
  };

export async function getBlockFromTimestamp(timestamp: number) {
  let result = await blockClient.query({
    query: GET_BLOCK,
    variables: {
      timestampFrom: timestamp,
      timestampTo: timestamp + 600,
    },
    fetchPolicy: "cache-first",
  });
  return result?.data?.blocks?.[0]?.number;
}

export function formatCompact(
  unformatted: number | string | BigNumber | BigNumberish | undefined | null,
  decimals = 18,
  maximumFractionDigits: number | undefined = 3,
  maxPrecision: number | undefined = 4
) {
  const formatter = Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits,
  });

  if (!unformatted) return "0";

  if (unformatted === Infinity) return "∞";

  let formatted: string | number = Number(unformatted);

  if (unformatted instanceof BigNumber) {
    formatted = Number(formatUnits(unformatted.toString(), decimals));
  }

  return formatter.format(Number(formatted.toPrecision(maxPrecision)));
}

export const getPercentChange = (valueNow: any, value24HoursAgo: any) => {
  const adjustedPercentChange =
    ((Number(valueNow) - Number(value24HoursAgo)) / Number(value24HoursAgo)) *
    100;
  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return 0;
  }
  return adjustedPercentChange;
};

export async function splitQuery(
  query: any,
  localClient: any,
  vars: any,
  list: any,
  skipCount = 100
) {
  let fetchedData = {};
  let allFound = false;
  let skip = 0;

  while (!allFound) {
    let end = list.length;
    if (skip + skipCount < list.length) {
      end = skip + skipCount;
    }
    let sliced = list.slice(skip, end);
    let result = await localClient.query({
      query: query(...vars, sliced),
      fetchPolicy: "cache-first",
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
  skipCount = 500
) {
  if (timestamps?.length === 0) {
    return [];
  }

  let fetchedData: any = await splitQuery(
    GET_BLOCKS,
    blockClient,
    [],
    timestamps,
    skipCount
  );

  let blocks = [];
  if (fetchedData) {
    for (var t in fetchedData) {
      if (fetchedData[t].length > 0) {
        blocks.push({
          timestamp: t.split("t")[1],
          number: fetchedData[t][0]["number"],
        });
      }
    }
  }
  return blocks;
}

export const get2DayPercentChange = (
  valueNow: any,
  value24HoursAgo: any,
  value48HoursAgo: any
) => {
  // get volume info for both 24 hour periods
  let currentChange = Number(valueNow) - Number(value24HoursAgo);
  let previousChange = Number(value24HoursAgo) - Number(value48HoursAgo);

  const adjustedPercentChange =
    (Number(currentChange - previousChange) / Number(previousChange)) * 100;

  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return [currentChange, 0];
  }
  return [currentChange, adjustedPercentChange];
};

export const getEthPrice = async () => {
  var utcCurrentTime = dayjs();
  //utcCurrentTime = utcCurrentTime.subtract(0.3, 'day');

  const utcOneDayBack = utcCurrentTime
    .subtract(1, "day")
    .startOf("minute")
    .unix();
  let ethPrice = 0;
  let ethPriceOneDay = 0;
  let priceChangeETH = 0;

  try {
    let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack);
    let result = await client.query({
      query: ETH_PRICE(),
      fetchPolicy: "cache-first",
    });
    let resultOneDay = await client.query({
      query: ETH_PRICE(oneDayBlock),
      fetchPolicy: "cache-first",
    });
    const currentPrice = result?.data?.bundles[0]?.ethPrice;
    const oneDayBackPrice = resultOneDay?.data?.bundles[0]?.ethPrice;
    priceChangeETH = getPercentChange(currentPrice, oneDayBackPrice);
    ethPrice = currentPrice;
    ethPriceOneDay = oneDayBackPrice;
  } catch (e) {
    console.log(e);
  }

  return [ethPrice, ethPriceOneDay, priceChangeETH];
};

export const getTopTokens = async (
  ethPrice: any,
  ethPriceOld: any,
  count: number = 500
) => {
  const utcCurrentTime = dayjs();
  const utcOneDayBack = utcCurrentTime.subtract(1, "day").unix();
  const utcTwoDaysBack = utcCurrentTime.subtract(2, "day").unix();
  let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack);
  let twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack);

  try {
    let current = await client.query({
      query: TOKENS_CURRENT(count),
      fetchPolicy: "cache-first",
    });

    let oneDayResult = await client.query({
      query: TOKENS_DYNAMIC(oneDayBlock, count),
      fetchPolicy: "cache-first",
    });

    let twoDayResult = await client.query({
      query: TOKENS_DYNAMIC(twoDayBlock, count),
      fetchPolicy: "cache-first",
    });

    let oneDayData = oneDayResult?.data?.tokens.reduce(
      (obj: any, cur: any, i: any) => {
        return { ...obj, [cur.id]: cur };
      },
      {}
    );

    let twoDayData = twoDayResult?.data?.tokens.reduce(
      (obj: any, cur: any, i: any) => {
        return { ...obj, [cur.id]: cur };
      },
      {}
    );

    let bulkResults = await Promise.all(
      current &&
        oneDayData &&
        twoDayData &&
        current?.data?.tokens.map(async (token: any) => {
          let data = token;

          // let liquidityDataThisToken = liquidityData?.[token.id]
          let oneDayHistory = oneDayData?.[token.id];
          let twoDayHistory = twoDayData?.[token.id];

          // catch the case where token wasnt in top list in previous days
          if (!oneDayHistory) {
            let oneDayResult = await client.query({
              query: TOKEN_DATA(token.id, oneDayBlock),
              fetchPolicy: "cache-first",
            });
            oneDayHistory = oneDayResult.data.tokens[0];
          }
          if (!twoDayHistory) {
            let twoDayResult = await client.query({
              query: TOKEN_DATA(token.id, twoDayBlock),
              fetchPolicy: "cache-first",
            });
            twoDayHistory = twoDayResult.data.tokens[0];
          }

          // calculate percentage changes and daily changes
          const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
            data.tradeVolumeUSD,
            oneDayHistory?.tradeVolumeUSD ?? 0,
            twoDayHistory?.tradeVolumeUSD ?? 0
          );

          const currentLiquidityUSD =
            data?.totalLiquidity * ethPrice * data?.derivedETH;
          const oldLiquidityUSD =
            oneDayHistory?.totalLiquidity *
            ethPriceOld *
            oneDayHistory?.derivedETH;

          // percent changes
          const priceChangeUSD = getPercentChange(
            data?.derivedETH * ethPrice,
            oneDayHistory?.derivedETH
              ? oneDayHistory?.derivedETH * ethPriceOld
              : 0
          );

          // set data
          data.priceUSD = data?.derivedETH * ethPrice;
          data.totalLiquidityUSD = currentLiquidityUSD;
          data.oneDayVolumeUSD = oneDayVolumeUSD;
          data.volumeChangeUSD = volumeChangeUSD;
          data.priceChangeUSD = priceChangeUSD;
          data.liquidityChangeUSD = getPercentChange(
            currentLiquidityUSD ?? 0,
            oldLiquidityUSD ?? 0
          );

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
          if (data.id === "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9") {
            const aaveData = await client.query({
              query: PAIR_DATA("0xdfc14d2af169b0d36c4eff567ada9b2e0cae044f"),
              fetchPolicy: "cache-first",
            });
            const result = aaveData.data.pairs[0];
            data.totalLiquidityUSD = parseFloat(result.reserveUSD) / 2;
            data.liquidityChangeUSD = 0;
            data.priceChangeUSD = 0;
          }
          return data;
        })
    );
    return bulkResults;
  } catch (e) {
    console.log(e);
  }
};

export const getTimestampsForChanges = () => {
  var utcCurrentTime = dayjs();
  //utcCurrentTime = utcCurrentTime.subtract(0.3,  'day');
  const t1 = utcCurrentTime.subtract(1, "day").startOf("minute").unix();
  const t2 = utcCurrentTime.subtract(2, "day").startOf("minute").unix();
  const tWeek = utcCurrentTime.subtract(1, "week").startOf("minute").unix();
  return [t1, t2, tWeek];
};

export const getTokenPairs = async (
  tokenAddress: string,
  tokenAddress1: string
) => {
  try {
    // fetch all current and historical data
    let result = await client.query({
      query: TOKEN_DATA1(tokenAddress, tokenAddress1),
      fetchPolicy: "cache-first",
    });
    return result.data?.["pairs0"]
      .concat(result.data?.["pairs1"])
      .concat(result.data?.["pairs2"])
      .concat(result.data?.["pairs3"])
      .concat(result.data?.["pairs4"]);
  } catch (e) {
    console.log(e);
  }
};

export const getIntervalTokenData = async (
  tokenAddress: string,
  startTime: number,
  interval = 3600,
  latestBlock: any
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
        return parseFloat(b.number) <= parseFloat(latestBlock);
      });
    }

    let result: any = await splitQuery(
      PRICES_BY_BLOCK,
      client,
      [tokenAddress],
      blocks,
      50
    );

    // format token ETH price results
    let values: any[] = [];
    for (var row in result) {
      let timestamp = row.split("t")[1];
      let derivedETH = parseFloat(result[row]?.derivedETH);
      if (timestamp) {
        values.push({
          timestamp,
          derivedETH,
        });
      }
    }

    // go through eth usd prices and assign to original values array
    let index = 0;
    for (var brow in result) {
      let timestamp = brow.split("b")[1];
      if (timestamp) {
        values[index].priceUSD =
          result[brow].ethPrice * values[index].derivedETH;
        index += 1;
      }
    }

    let formattedHistory = [];

    // for each hour, construct the open and close price
    for (let i = 0; i < values.length - 1; i++) {
      formattedHistory.push({
        timestamp: values[i].timestamp,
        open: parseFloat(values[i].priceUSD),
        close: parseFloat(values[i + 1].priceUSD),
      });
    }

    return formattedHistory;
  } catch (e) {
    console.log(e);
    console.log("error fetching blocks");
    return [];
  }
};

export const getBulkPairData = async (pairList: any, ethPrice: any) => {
  const [t1, t2, tWeek] = getTimestampsForChanges();
  let a = await getBlocksFromTimestamps([t1, t2, tWeek]);
  let [{ number: b1 }, { number: b2 }, { number: bWeek }] = a;
  try {
    let current = await client.query({
      query: PAIRS_BULK1,
      variables: {
        allPairs: pairList,
      },
      fetchPolicy: "cache-first",
    });

    let [oneDayResult, twoDayResult, oneWeekResult] = await Promise.all(
      [b1, b2, bWeek].map(async (block) => {
        let result = client.query({
          query: PAIRS_HISTORICAL_BULK(block, pairList),
          fetchPolicy: "cache-first",
        });
        return result;
      })
    );

    let oneDayData = oneDayResult?.data?.pairs.reduce((obj: any, cur: any) => {
      return { ...obj, [cur.id]: cur };
    }, {});

    let twoDayData = twoDayResult?.data?.pairs.reduce((obj: any, cur: any) => {
      return { ...obj, [cur.id]: cur };
    }, {});

    let oneWeekData = oneWeekResult?.data?.pairs.reduce(
      (obj: any, cur: any) => {
        return { ...obj, [cur.id]: cur };
      },
      {}
    );

    let pairData = await Promise.all(
      current &&
        current.data.pairs.map(async (pair: any) => {
          let data = pair;
          let oneDayHistory = oneDayData?.[pair.id];
          if (!oneDayHistory) {
            let newData = await client.query({
              query: PAIR_DATA(pair.id, b1),
              fetchPolicy: "cache-first",
            });
            oneDayHistory = newData.data.pairs[0];
          }
          let twoDayHistory = twoDayData?.[pair.id];
          if (!twoDayHistory) {
            let newData = await client.query({
              query: PAIR_DATA(pair.id, b2),
              fetchPolicy: "cache-first",
            });
            twoDayHistory = newData.data.pairs[0];
          }
          let oneWeekHistory = oneWeekData?.[pair.id];
          if (!oneWeekHistory) {
            let newData = await client.query({
              query: PAIR_DATA(pair.id, bWeek),
              fetchPolicy: "cache-first",
            });
            oneWeekHistory = newData.data.pairs[0];
          }
          data = parseData(
            data,
            oneDayHistory,
            twoDayHistory,
            oneWeekHistory,
            ethPrice,
            b1
          );
          return data;
        })
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
  oneDayBlock: any
) => {
  // get volume changes
  const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
    data?.volumeUSD,
    oneDayData?.volumeUSD ? oneDayData.volumeUSD : 0,
    twoDayData?.volumeUSD ? twoDayData.volumeUSD : 0
  );
  const [oneDayVolumeUntracked, volumeChangeUntracked] = get2DayPercentChange(
    data?.untrackedVolumeUSD,
    oneDayData?.untrackedVolumeUSD
      ? parseFloat(oneDayData?.untrackedVolumeUSD)
      : 0,
    twoDayData?.untrackedVolumeUSD ? twoDayData?.untrackedVolumeUSD : 0
  );

  const oneWeekVolumeUSD = parseFloat(
    oneWeekData ? data?.volumeUSD - oneWeekData?.volumeUSD : data.volumeUSD
  );

  const oneWeekVolumeUntracked = parseFloat(
    oneWeekData
      ? data?.untrackedVolumeUSD - oneWeekData?.untrackedVolumeUSD
      : data.untrackedVolumeUSD
  );

  // set volume properties
  data.oneDayVolumeUSD = oneDayVolumeUSD;
  data.oneWeekVolumeUSD = oneWeekVolumeUSD;
  data.volumeChangeUSD = volumeChangeUSD;
  data.oneDayVolumeUntracked = oneDayVolumeUntracked;
  data.oneWeekVolumeUntracked = oneWeekVolumeUntracked;
  data.volumeChangeUntracked = volumeChangeUntracked;

  // set liquidity properties
  data.trackedReserveUSD = data.trackedReserveETH * ethPrice;
  data.liquidityChangeUSD = getPercentChange(
    data.reserveUSD,
    oneDayData?.reserveUSD
  );

  // format if pair hasnt existed for a day or a week
  if (!oneDayData && data && data.createdAtBlockNumber > oneDayBlock) {
    data.oneDayVolumeUSD = parseFloat(data.volumeUSD);
  }
  if (!oneDayData && data) {
    data.oneDayVolumeUSD = parseFloat(data.volumeUSD);
  }
  if (!oneWeekData && data) {
    data.oneWeekVolumeUSD = parseFloat(data.volumeUSD);
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

export async function getGlobalData(ethPrice: any, oldEthPrice: any) {
  // data for each day , historic data used for % changes
  let data: any = {};
  let oneDayData: any = {};
  let twoDayData: any = {};

  try {
    // get timestamps for the days
    var utcCurrentTime = dayjs();
    //utcCurrentTime = utcCurrentTime.subtract(0.3, 'day');

    const utcOneDayBack = utcCurrentTime.subtract(1, "day").unix();
    const utcTwoDaysBack = utcCurrentTime.subtract(2, "day").unix();
    const utcOneWeekBack = utcCurrentTime.subtract(1, "week").unix();
    const utcTwoWeeksBack = utcCurrentTime.subtract(2, "week").unix();

    // get the blocks needed for time travel queries
    let [oneDayBlock, twoDayBlock, oneWeekBlock, twoWeekBlock] =
      await getBlocksFromTimestamps([
        utcOneDayBack,
        utcTwoDaysBack,
        utcOneWeekBack,
        utcTwoWeeksBack,
      ]);

    // fetch the global data
    let result = await client.query({
      query: GLOBAL_DATA(),
      fetchPolicy: "cache-first",
    });
    data = result.data.uniswapFactories[0];

    // fetch the historical data
    let oneDayResult = await client.query({
      query: GLOBAL_DATA(oneDayBlock?.number),
      fetchPolicy: "cache-first",
    });
    oneDayData = oneDayResult.data.uniswapFactories[0];

    let twoDayResult = await client.query({
      query: GLOBAL_DATA(twoDayBlock?.number),
      fetchPolicy: "cache-first",
    });
    twoDayData = twoDayResult.data.uniswapFactories[0];

    let oneWeekResult = await client.query({
      query: GLOBAL_DATA(oneWeekBlock?.number),
      fetchPolicy: "cache-first",
    });
    const oneWeekData = oneWeekResult.data.uniswapFactories[0];

    let twoWeekResult = await client.query({
      query: GLOBAL_DATA(twoWeekBlock?.number),
      fetchPolicy: "cache-first",
    });
    const twoWeekData = twoWeekResult.data.uniswapFactories[0];

    if (data && oneDayData && twoDayData && twoWeekData) {
      let [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
        data.totalVolumeUSD,
        oneDayData.totalVolumeUSD ? oneDayData.totalVolumeUSD : 0,
        twoDayData.totalVolumeUSD ? twoDayData.totalVolumeUSD : 0
      );

      const [oneWeekVolume, weeklyVolumeChange] = get2DayPercentChange(
        data.totalVolumeUSD,
        oneWeekData.totalVolumeUSD,
        twoWeekData.totalVolumeUSD
      );

      const [oneDayTxns, txnChange] = get2DayPercentChange(
        data.txCount,
        oneDayData.txCount ? oneDayData.txCount : 0,
        twoDayData.txCount ? twoDayData.txCount : 0
      );

      // format the total liquidity in USD
      data.totalLiquidityUSD = data.totalLiquidityETH * ethPrice;
      const liquidityChangeUSD = getPercentChange(
        data.totalLiquidityETH * ethPrice,
        oneDayData.totalLiquidityETH * oldEthPrice
      );

      // add relevant fields with the calculated amounts
      data.oneDayVolumeUSD = oneDayVolumeUSD;
      data.oneWeekVolume = oneWeekVolume;
      data.weeklyVolumeChange = weeklyVolumeChange;
      data.volumeChangeUSD = volumeChangeUSD;
      data.liquidityChangeUSD = liquidityChangeUSD;
      data.oneDayTxns = oneDayTxns;
      data.txnChange = txnChange;
    }
  } catch (e) {
    console.log(e);
  }

  return data;
}

export function isAddress(value: any): string | false {
  try {
    return getAddress(value);
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
  priceImpactWithoutFee: Percent
): boolean {
  if (!priceImpactWithoutFee.lessThan(PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN)) {
    return (
      window.prompt(
        `This swap has a price impact of at least ${PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN.toFixed(
          0
        )}%. Please type the word "confirm" to continue with this swap.`
      ) === "confirm"
    );
  } else if (!priceImpactWithoutFee.lessThan(ALLOWED_PRICE_IMPACT_HIGH)) {
    return window.confirm(
      `This swap has a price impact of at least ${ALLOWED_PRICE_IMPACT_HIGH.toFixed(
        0
      )}%. Please confirm that you would like to continue with this swap.`
    );
  }
  return true;
}

export function currencyId(currency: Currency): string {
  if (currency === ETHER) return "ETH";
  if (currency instanceof Token) return currency.address;
  throw new Error("invalid currency");
}

export function calculateSlippageAmount(
  value: CurrencyAmount,
  slippage: number
): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`);
  }
  return [
    JSBI.divide(
      JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)),
      JSBI.BigInt(10000)
    ),
    JSBI.divide(
      JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)),
      JSBI.BigInt(10000)
    ),
  ];
}

export function maxAmountSpend(
  currencyAmount?: CurrencyAmount
): CurrencyAmount | undefined {
  if (!currencyAmount) return undefined;
  if (currencyAmount.currency === ETHER) {
    if (JSBI.greaterThan(currencyAmount.raw, MIN_ETH)) {
      return CurrencyAmount.ether(JSBI.subtract(currencyAmount.raw, MIN_ETH));
    } else {
      return CurrencyAmount.ether(JSBI.BigInt(0));
    }
  }
  return currencyAmount;
}

export function getRouterContract(
  _: number,
  library: Web3Provider,
  account?: string
): Contract {
  return getContract(ROUTER_ADDRESS, IUniswapV2Router02ABI, library, account);
}

export function isTokenOnList(
  defaultTokens: TokenAddressMap,
  currency?: Currency
): boolean {
  if (currency === ETHER) return true;
  return Boolean(
    currency instanceof Token &&
      defaultTokens[currency.chainId]?.[currency.address]
  );
}

export function getEtherscanLink(
  chainId: ChainId,
  data: string,
  type: "transaction" | "token" | "address" | "block"
): string {
  const prefix =
    "https://" + (chainId === 80001 ? "polygonscan.com" : "polygonscan.com");

  switch (type) {
    case "transaction": {
      return `${prefix}/tx/${data}`;
    }
    case "token": {
      return `${prefix}/token/${data}`;
    }
    case "block": {
      return `${prefix}/block/${data}`;
    }
    case "address":
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

export function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider, "any");
  library.pollingInterval = 15000;
  return library;
}

export function isZero(hexNumberString: string) {
  return /^0x0*$/.test(hexNumberString);
}

export function getSigner(
  library: Web3Provider,
  account: string
): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked();
}

export function getProviderOrSigner(
  library: Web3Provider,
  account?: string
): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library;
}

export function getContract(
  address: string,
  ABI: any,
  library: Web3Provider,
  account?: string
): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }

  return new Contract(
    address,
    ABI,
    getProviderOrSigner(library, account) as any
  );
}

export function calculateGasMargin(value: BigNumber): BigNumber {
  return value
    .mul(BigNumber.from(10000).add(BigNumber.from(1000)))
    .div(BigNumber.from(10000));
}
