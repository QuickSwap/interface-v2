import { getAddress } from '@ethersproject/address';
import { ApolloClient } from 'apollo-client';
import { Contract } from '@ethersproject/contracts';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { blockClient, clientV2, clientV3, farmingClient } from 'apollo/client';
import {
  GET_BLOCK,
  GET_BLOCKS,
  SWAP_TRANSACTIONS,
  PAIR_ID,
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
import { GlobalConst, GlobalValue, SUPPORTED_CHAINIDS } from 'constants/index';
import { TokenAddressMap } from 'state/lists/hooks';
import { TokenAddressMap as TokenAddressMapV3 } from 'state/lists/v3/hooks';
import {
  DualStakingInfo,
  LairInfo,
  StakingInfo,
  SyrupBasic,
  SyrupInfo,
} from 'types';
import { unwrappedToken } from './wrappedCurrency';
import { useUSDCPriceFromAddress } from './useUSDCPrice';
import { CallState } from 'state/multicall/hooks';
import { DualStakingBasic, StakingBasic } from 'types';
import { Connection, getConnections } from 'connectors';
import { useActiveWeb3React } from 'hooks';
import { DLQUICK, OLD_QUICK } from 'constants/v3/addresses';
import { getConfig } from 'config';
import {
  FETCH_ETERNAL_FARM_FROM_POOL,
  FETCH_POOL_FROM_TOKENS,
} from './graphql-queries';
import { useEffect, useState } from 'react';
import { useEthPrice } from 'state/application/hooks';
import { formatTokenSymbol } from './v3-graph';
import { TFunction } from 'react-i18next';
import { PAIR_ID_V3, SWAP_TRANSACTIONS_v3 } from 'apollo/queries-v3';
import { Connector } from '@web3-react/types';

dayjs.extend(utc);
dayjs.extend(weekOfYear);

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

export async function getBlockFromTimestamp(
  timestamp: number,
  chainId: ChainId,
): Promise<any> {
  const client = blockClient[chainId];
  if (!client) return;
  const result = await client.query({
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
    const queryStr = query(...vars, sliced);
    const result = await localClient.query({
      query: queryStr,
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
  chainId: ChainId,
): Promise<
  {
    timestamp: string;
    number: any;
  }[]
> {
  const client = blockClient[chainId];
  if (timestamps?.length === 0 || !client) {
    return [];
  }

  const fetchedData: any = await splitQuery(
    GET_BLOCKS,
    client,
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
          number: Number(fetchedData[t][0]['number']),
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

export const getEthPrice: (chainId: ChainId) => Promise<number[]> = async (
  chainId: ChainId,
) => {
  let ethPrice = 0;
  let ethPriceOneDay = 0;
  let priceChangeETH = 0;

  const res = await fetch(
    `${process.env.REACT_APP_LEADERBOARD_APP_URL}/utils/eth-price?chainId=${chainId}`,
  );
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      errorText || res.statusText || `Failed to get global data v2`,
    );
  }
  const data = await res.json();
  if (data && data.data) {
    ethPrice = data.data.ethPrice;
    ethPriceOneDay = data.data.ethPriceOneDay;
    priceChangeETH = data.data.priceChangeETH;
  }

  return [ethPrice, ethPriceOneDay, priceChangeETH];
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

export function getSecondsOneDay() {
  return 60 * 60 * 24;
}

export const getPairAddress = async (
  token0Address: string,
  token1Address: string,
  chainId: ChainId,
) => {
  const client = clientV2[chainId];
  if (!client) return;
  const pairData = await client.query({
    query: PAIR_ID(token0Address.toLowerCase(), token1Address.toLowerCase()),
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

export const getPairAddressV3 = async (
  token0Address: string,
  token1Address: string,
  chainId: ChainId,
) => {
  const client = clientV3[chainId];
  if (!client) return;
  const pairData = await client.query({
    query: PAIR_ID_V3(token0Address.toLowerCase(), token1Address.toLowerCase()),
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

export const getSwapTransactions = async (
  chainId: ChainId,
  pairId: string,
  startTime?: number,
) => {
  const oneDayAgo = dayjs
    .utc()
    .subtract(1, 'day')
    .unix();
  const sTimestamp = startTime ?? oneDayAgo;
  const client = clientV2[chainId];
  if (!client) return;
  try {
    const result = await client.query({
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

export const getSwapTransactionsV3 = async (
  chainId: ChainId,
  pairId: string,
  startTime?: number,
) => {
  const oneDayAgo = dayjs
    .utc()
    .subtract(1, 'day')
    .unix();
  const sTimestamp = startTime ?? oneDayAgo;
  const client = clientV3[chainId];
  if (!client) return;
  try {
    const result = await client.query({
      query: SWAP_TRANSACTIONS_v3,
      variables: {
        address: pairId,
        lastTime: sTimestamp,
      },
      fetchPolicy: 'network-only',
    });
    const swaps: any[] = result.data.swaps.map((swap: any) => {
      return {
        transaction: { id: swap.transaction.id, timestamp: swap.timestamp },
        pair: swap.pool,
        to: swap.recipient,
        amount0In: swap.amount0,
        amount0Out: Number(swap.amount0) * -1,
        amount1In: swap.amount1,
        amount1Out: Number(swap.amount1) * -1,
        amountUSD: swap.amountUSD,
      };
    });

    return swaps;
  } catch (e) {
    console.log('error: ', e);
    return;
  }
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

export function currencyId(currency: Currency, chainId: ChainId): string {
  if (currency === ETHER[chainId]) return 'ETH';
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
        JSBI.BigInt(value.numerator.toString()),
        JSBI.BigInt(10000 - slippage),
      ),
      JSBI.BigInt(10000),
    ),
    JSBI.divide(
      JSBI.multiply(
        JSBI.BigInt(value.numerator.toString()),
        JSBI.BigInt(10000 + slippage),
      ),
      JSBI.BigInt(10000),
    ),
  ];
}

export function maxAmountSpend(
  chainId: ChainId,
  currencyAmount?: CurrencyAmount,
): CurrencyAmount | undefined {
  if (!currencyAmount) return undefined;
  if (currencyAmount.currency === ETHER[chainId]) {
    if (JSBI.greaterThan(currencyAmount.raw, GlobalConst.utils.MIN_ETH)) {
      return CurrencyAmount.ether(
        JSBI.subtract(currencyAmount.raw, GlobalConst.utils.MIN_ETH),
        chainId,
      );
    } else {
      return CurrencyAmount.ether(JSBI.BigInt(0), chainId);
    }
  }
  return currencyAmount;
}

export function isTokensOnList(
  defaultTokens: TokenAddressMap,
  currencies: (Currency | undefined)[],
  chainId: ChainId,
): boolean[] {
  return currencies.map((currency) => {
    if (currency === ETHER[chainId] || (currency as CurrencyV3).isNative)
      return true;
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
  const config = getConfig(chainId);
  const prefix = config.blockExplorer;

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

export function getFormattedPercent(percent: number) {
  if (percent < 0.001 && percent > 0) {
    return '<+0.001%';
  } else if (percent > -0.001 && percent < 0) {
    return '>-0.001%';
  } else if (percent > 10000) {
    return '>+10000%';
  } else if (percent < -10000) {
    return '<-10000%';
  } else {
    const beforeSign = percent > 0 ? '+' : '';
    return beforeSign + percent.toLocaleString('us') + '%';
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

export function getV3TokenFromAddress(
  tokenAddress: string,
  chainId: ChainId,
  tokenMap: TokenAddressMapV3,
) {
  const tokenIndex = Object.keys(tokenMap[chainId]).findIndex(
    (address) => address.toLowerCase() === tokenAddress.toLowerCase(),
  );
  if (tokenIndex === -1) {
    return undefined;
  }

  const token = Object.values(tokenMap[chainId])[tokenIndex];
  return token;
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

export const getGlobalData = async (chainId: ChainId, version: string) => {
  try {
    const res = await fetch(
      `${process.env.REACT_APP_LEADERBOARD_APP_URL}/analytics/global-data/${version}?chainId=${chainId}`,
    );
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        errorText || res.statusText || `Failed to get global data`,
      );
    }
    const data = await res.json();
    if (!data) return;
    return data.data;
  } catch (e) {
    console.log('Failed to fetch global data', e);
    return;
  }
};

export function useLairDQUICKAPY(isNew: boolean, lair?: LairInfo) {
  const daysCurrentYear = getDaysCurrentYear();
  const { chainId } = useActiveWeb3React();
  let chainIdToUse = chainId ? chainId : ChainId.MATIC;
  const config = getConfig(chainIdToUse);
  const newLair = config['lair']['newLair'];
  const oldLair = config['lair']['oldLair'];
  const v2 = config['v2'];
  const v3 = config['v3'];

  chainIdToUse = isNew
    ? newLair
      ? chainIdToUse
      : ChainId.MATIC
    : oldLair
    ? chainIdToUse
    : ChainId.MATIC;
  const quickToken = isNew ? DLQUICK[chainIdToUse] : OLD_QUICK[chainIdToUse];
  const quickPrice = useUSDCPriceFromAddress(quickToken.address);
  const [feesPercent, setFeesPercent] = useState(0);
  const { ethPrice } = useEthPrice();

  useEffect(() => {
    if (!chainId) return;
    (async () => {
      let feePercent = 0;
      if (v3) {
        const v3Data = await getGlobalData(chainId, 'v3');
        if (v3Data) {
          feePercent += Number(v3Data.feesUSD ?? 0) / 7.5;
        }
        if (!v2) {
          setFeesPercent(feePercent);
        }
      }
      if (
        v2 &&
        ethPrice.price !== undefined &&
        ethPrice.oneDayPrice !== undefined
      ) {
        const v2data = await getGlobalData(chainId, 'v2');
        if (v2data) {
          feePercent +=
            (Number(v2data.oneDayVolumeUSD) * GlobalConst.utils.FEEPERCENT) /
            14.7;
        }
        if (v3) {
          setFeesPercent(feePercent);
        }
      }
    })();
  }, [ethPrice.oneDayPrice, ethPrice.price, chainId, v2, v3]);

  if (!lair || !quickPrice) return '';

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

export function getWalletKeys(connector: Connector): Connection[] {
  const { ethereum } = window as any;
  const connections = getConnections();

  return connections.filter((option) => option.connector === connector);
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
    return valueOfTotalStakedAmountInBaseToken
      ? formatTokenAmount(valueOfTotalStakedAmountInBaseToken) + ' ETH'
      : '-';
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

export function useIsSupportedNetwork() {
  const { currentChainId, chainId } = useActiveWeb3React();
  if (currentChainId) return !!SUPPORTED_CHAINIDS.includes(currentChainId);
  if (!chainId) return true;
  return !!SUPPORTED_CHAINIDS.includes(chainId);
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

export const getEternalFarmFromTokens = async (
  token0: string,
  token1: string,
  chainId: ChainId,
) => {
  const v3Client = clientV3[chainId];
  if (!v3Client) return;
  try {
    const result = await v3Client.query({
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
    const clientFarming = farmingClient[chainId];
    if (!clientFarming) return;
    const eternalFarmResult = await clientFarming.query({
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

const gammaChainName = (chainId?: ChainId) => {
  switch (chainId) {
    case ChainId.ZKEVM:
      return 'polygon-zkevm';
    default:
      return 'polygon';
  }
};

export const getGammaData = async (chainId?: ChainId) => {
  try {
    const data = await fetch(
      `${process.env.REACT_APP_GAMMA_API_ENDPOINT}/quickswap/${gammaChainName(
        chainId,
      )}/hypervisors/allData`,
    );
    const gammaData = await data.json();
    return gammaData;
  } catch {
    try {
      const data = await fetch(
        `${
          process.env.REACT_APP_GAMMA_API_ENDPOINT_BACKUP
        }/quickswap/${gammaChainName(chainId)}/hypervisors/allData`,
      );
      const gammaData = await data.json();
      return gammaData;
    } catch (e) {
      console.log(e);
      return;
    }
  }
};

export const getGammaPositions = async (
  account?: string,
  chainId?: ChainId,
) => {
  if (!account) return;
  try {
    const data = await fetch(
      `${process.env.REACT_APP_GAMMA_API_ENDPOINT}/quickswap/${gammaChainName(
        chainId,
      )}/user/${account}`,
    );
    const positions = await data.json();
    return positions[account.toLowerCase()];
  } catch {
    try {
      const data = await fetch(
        `${
          process.env.REACT_APP_GAMMA_API_ENDPOINT_BACKUP
        }/quickswap/${gammaChainName(chainId)}/user/${account}`,
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
  try {
    const data = await fetch(
      `${process.env.REACT_APP_GAMMA_API_ENDPOINT}/quickswap/${gammaChainName(
        chainId,
      )}/allRewards2`,
    );
    const gammaData = await data.json();
    return gammaData;
  } catch {
    try {
      const data = await fetch(
        `${
          process.env.REACT_APP_GAMMA_API_ENDPOINT_BACKUP
        }/quickswap/${gammaChainName(chainId)}/allRewards2`,
      );
      const gammaData = await data.json();
      return gammaData;
    } catch (e) {
      console.log(e);
      return;
    }
  }
};
