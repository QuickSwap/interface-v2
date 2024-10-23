import { getAddress } from '@ethersproject/address';
import { Contract, ContractReceipt } from '@ethersproject/contracts';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import {
  JsonRpcSigner,
  Web3Provider,
  JsonRpcProvider,
} from '@ethersproject/providers';
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
  NativeCurrency,
} from '@uniswap/sdk-core';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { AddressZero } from '@ethersproject/constants';
import {
  GammaPair,
  GammaPairs,
  GlobalConst,
  GlobalValue,
  MIN_NATIVE_CURRENCY_FOR_GAS,
  SUPPORTED_CHAINIDS,
  DefiedgeStrategies,
} from 'constants/index';
import { TokenAddressMap } from 'state/lists/hooks';
import { TokenAddressMap as TokenAddressMapV3 } from 'state/lists/v3/hooks';
import {
  DualStakingInfo,
  LairInfo,
  StakingInfo,
  SyrupBasic,
  SyrupInfo,
  DualStakingBasic,
  StakingBasic,
} from 'types/index';
import { unwrappedToken } from './wrappedCurrency';
import { useUSDCPriceFromAddress } from './useUSDCPrice';
import { CallState } from 'state/multicall/hooks';
import { useActiveWeb3React } from 'hooks';
import {
  DLQUICK,
  EMPTY,
  NATIVE_TOKEN_ADDRESS,
  OLD_QUICK,
  bondDexFactories,
  defaultBondDexFactories,
} from 'constants/v3/addresses';
import { getConfig } from 'config/index';
import { useMemo } from 'react';
import { TFunction } from 'react-i18next';
import { useAnalyticsGlobalData } from 'hooks/useFetchAnalyticsData';
import { SteerVault } from 'hooks/v3/useSteerData';
import { LiquidityDex, Protocols } from '@ape.swap/apeswap-lists';
import { DEX } from '@soulsolidity/soulzap-v1';
import { WrappedTokenInfo } from 'state/lists/v3/wrappedTokenInfo';
import { FeeAmount } from 'v3lib/utils';
import { BondToken } from 'types/bond';
import { ZERO_ADDRESS } from 'constants/v3/misc';

dayjs.extend(utc);
dayjs.extend(weekOfYear);

export function toNativeCurrency(chainId: ChainId | undefined) {
  if (!chainId) return;
  return {
    ...ETHER[chainId],
    isNative: true,
    isToken: false,
  } as NativeCurrency;
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

export const getEthPrice: (chainId: ChainId) => Promise<number[]> = async (
  chainId: ChainId,
) => {
  let ethPrice = 0;
  let ethPriceOneDay = 0;
  let priceChangeETH = 0;

  const res = await fetch(
    `${process.env.REACT_APP_LEADERBOARD_APP_URL}/utils/eth-price?chainId=${chainId}`,
  );
  if (res.ok) {
    const data = await res.json();
    if (data && data.data) {
      ethPrice = data.data.ethPrice;
      ethPriceOneDay = data.data.ethPriceOneDay;
      priceChangeETH = data.data.priceChangeETH;
    }
  }

  return [ethPrice, ethPriceOneDay, priceChangeETH];
};

export function getSecondsOneDay() {
  return 60 * 60 * 24;
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
    if (
      JSBI.greaterThan(currencyAmount.raw, MIN_NATIVE_CURRENCY_FOR_GAS[chainId])
    ) {
      return CurrencyAmount.ether(
        JSBI.subtract(currencyAmount.raw, MIN_NATIVE_CURRENCY_FOR_GAS[chainId]),
        chainId,
      );
    } else {
      return CurrencyAmount.ether(JSBI.BigInt(0), chainId);
    }
  }
  return currencyAmount;
}

export function halfAmountSpend(
  chainId: ChainId,
  currencyAmount?: CurrencyAmount,
): CurrencyAmount | undefined {
  if (!currencyAmount) return undefined;
  const halfAmount = JSBI.divide(currencyAmount.raw, JSBI.BigInt(2));

  if (currencyAmount.currency === ETHER[chainId]) {
    if (JSBI.greaterThan(halfAmount, MIN_NATIVE_CURRENCY_FOR_GAS[chainId])) {
      return CurrencyAmount.ether(halfAmount, chainId);
    } else {
      return CurrencyAmount.ether(JSBI.BigInt(0), chainId);
    }
  }
  return new TokenAmount(currencyAmount.currency as Token, halfAmount);
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
  library: Web3Provider | JsonRpcProvider,
  account: string,
): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked();
}

export function getProviderOrSigner(
  library: Web3Provider | JsonRpcProvider,
  account?: string,
): Web3Provider | JsonRpcProvider | JsonRpcSigner {
  return account ? getSigner(library, account) : library;
}

export function getContract(
  address: string,
  ABI: any,
  library: Web3Provider | JsonRpcProvider,
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
    .mul(BigNumber.from(10000).add(BigNumber.from(5000)))
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

  return value.mul(BigNumber.from(10000 + 5000)).div(BigNumber.from(10000));
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
  tokenAddress: string | undefined,
  chainId: ChainId | undefined,
  tokenMap: TokenAddressMap,
  tokens: Token[],
) {
  if (!tokenAddress || !chainId) return;
  const tokenIndex = Object.keys(tokenMap[chainId]).findIndex(
    (address) => address.toLowerCase() === tokenAddress.toLowerCase(),
  );
  if (tokenIndex === -1) {
    const token = tokens.find(
      (item) => item.address.toLowerCase() === tokenAddress.toLowerCase(),
    );
    if (!token) {
      const commonToken = (GlobalValue.tokens as any).COMMON[chainId].find(
        (token: any) =>
          token.address.toLowerCase() === tokenAddress.toLowerCase(),
      );
      if (!commonToken) {
        return;
      }
      return commonToken;
    }
    return token;
  }

  return Object.values(tokenMap[chainId])[tokenIndex];
}

export function getV3TokenFromAddress(
  tokenAddress: string | undefined,
  chainId: ChainId,
  tokenMap: TokenAddressMapV3,
) {
  if (!tokenAddress) return;
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

export function getQuickBurnChartDates(
  chartData: any[] | null,
  durationIndex: number,
) {
  if (chartData) {
    const now = dayjs().unix();
    if (durationIndex === GlobalConst.quickBurnChart.ONE_DAY_CHART) {
      //hourly
      const hours: string[] = [];
      chartData.forEach((value: any, ind: number) => {
        const hour = formatDateFromTimeStamp(
          value.timestamp,
          ind === 1 || ind === chartData.length - 1 ? 'M/D HH' : 'HH',
        );
        hours.push(hour);
      });
      return hours;
    } else if (durationIndex === GlobalConst.quickBurnChart.ONE_WEEK_CHART) {
      const dates: string[] = [];
      chartData.forEach((value: any, ind: number) => {
        const dateStr = formatDateFromTimeStamp(
          Number(value.timestamp),
          ind % 3 === 0 ? 'M/D H:00' : 'H:00',
        );
        dates.push(dateStr);
      });
      return dates;
    } else if (durationIndex === GlobalConst.quickBurnChart.ONE_MONTH_CHART) {
      const dates: string[] = [];
      chartData.forEach((value: any, ind: number) => {
        const dateStr = formatDateFromTimeStamp(Number(value.timestamp), 'M/D');
        dates.push(dateStr);
      });
      return dates;
    } else {
      const dates: string[] = [];
      chartData.forEach((value: any, ind: number) => {
        const dateStr = formatDateFromTimeStamp(
          Number(value.timestamp),
          'YYYY M/D',
        );
        dates.push(dateStr);
      });
      return dates;
    }
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
export function appendedZeroChartData(data: any[], durationIndex) {
  let newArray: number[][] = [];
  const now = dayjs().unix();
  let sum = 0;
  data.map((value) => {
    sum += Number(value.amount);
    newArray.push([Number(value.timestamp * 1000), sum]);
  });

  if (durationIndex === GlobalConst.quickBurnChart.ONE_DAY_CHART) {
    const minTimestamp = now - 86400;
    if (newArray.length === 0) {
      newArray.push([minTimestamp * 1000, 0]);
      newArray.push([now * 1000, 0]);
    } else {
      newArray.unshift([minTimestamp * 1000, 0]);
      newArray.push([now * 1000, newArray[newArray.length - 1][1]]);
    }
  } else if (durationIndex === GlobalConst.quickBurnChart.ONE_WEEK_CHART) {
    const minTimestamp = now - 86400 * 7;
    if (newArray.length === 0) {
      newArray.push([minTimestamp * 1000, 0]);
      newArray.push([now * 1000, 0]);
    } else {
      newArray.unshift([minTimestamp * 1000, 0]);
      newArray.push([now * 1000, newArray[newArray.length - 1][1]]);
    }
  } else if (durationIndex === GlobalConst.quickBurnChart.ONE_MONTH_CHART) {
    const minTimestamp = now - 86400 * 30;
    if (newArray.length === 0) {
      newArray.push([minTimestamp * 1000, 0]);
      newArray.push([now * 1000, 0]);
    } else {
      newArray.unshift([minTimestamp * 1000, 0]);
      newArray.push([now * 1000, newArray[newArray.length - 1][1]]);
    }
  } else {
    newArray.push([now * 1000, newArray[newArray.length - 1][1]]);
  }
  newArray = newArray.sort((a, b) => a[0] - b[0]);
  return newArray;
}

export function getYAXISValuesAnalytics(chartData: any) {
  if (!chartData) return;
  // multiply 0.99 to the min value of chart values and 1.01 to the max value in order to show all data in graph. Without this, the scale of the graph is set strictly and some values may be hidden.
  const minValue = Math.min(...chartData) * 0.99;
  const maxValue = Math.max(...chartData) * 1.01;
  const step = (maxValue - minValue) / 8;
  const values: number[] = [];
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
  const { price: quickPrice } = useUSDCPriceFromAddress(
    quickToken?.address ?? '',
  );

  const { data: v3Data } = useAnalyticsGlobalData('v3', chainId);
  const { data: v2Data } = useAnalyticsGlobalData('v2', chainId);
  const feesPercent = useMemo(() => {
    let feePercent = 0;
    if (v3 && v3Data) {
      feePercent += Number(v3Data.feesUSD ?? 0) / 7.5;
    }
    if (v2 && v2Data) {
      feePercent +=
        (Number(v2Data.oneDayVolumeUSD) * GlobalConst.utils.FEEPERCENT) / 14.7;
    }
    return feePercent;
  }, [v2, v2Data, v3, v3Data]);

  if (!lair) return '';
  const lairQuickBalance = Number(lair.totalQuickBalance.toExact());
  if (!lairQuickBalance || !quickPrice) return '';

  const dQUICKAPR =
    (feesPercent * daysCurrentYear) / (lairQuickBalance * quickPrice);

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

export function getTokenAddress(token: Token | undefined) {
  if (!token) return;
  if (token.symbol?.toLowerCase() === 'wpol') return 'ETH';
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
  const empty = unwrappedToken(EMPTY[stakingInfo.baseToken.chainId]);
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
  try {
    const res = await fetch(
      `${process.env.REACT_APP_LEADERBOARD_APP_URL}/farming/eternal-farm-tokens?chainId=${chainId}&token0=${token0}&token1=${token1}`,
    );
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        errorText || res.statusText || `Failed to fetch eternal farms`,
      );
    }
    const data = await res.json();
    const eternalFarm =
      data && data.data && data.data.eternalFarm
        ? data.data.eternalFarm
        : undefined;

    return eternalFarm;
  } catch (e) {
    return;
  }
};

export const getUnipilotPositions = async (
  account?: string,
  chainId?: ChainId,
) => {
  if (!account || !chainId) return null;
  try {
    const res = await fetch(
      `${process.env.REACT_APP_LEADERBOARD_APP_URL}/unipilot/user-positions/${account}?chainId=${chainId}`,
    );
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        errorText || res.statusText || `Failed to get A51 Finance positions`,
      );
    }
    const data = await res.json();
    return data && data.data && data.data.positions
      ? data.data.positions
      : null;
  } catch {
    return null;
  }
};

export const getUnipilotFarms = async (chainId?: ChainId) => {
  if (!chainId) return [];
  try {
    const res = await fetch(
      `${process.env.REACT_APP_LEADERBOARD_APP_URL}/unipilot/farming-vaults?chainId=${chainId}`,
    );
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        errorText || res.statusText || `Failed to get A51 Finance farms`,
      );
    }
    const data = await res.json();
    return data && data.data && data.data.farms ? data.data.farms : [];
  } catch (err) {
    return [];
  }
};

export const getUnipilotFarmData = async (
  vaultAddresses?: string[],
  chainId?: ChainId,
) => {
  if (!chainId || !vaultAddresses) return null;
  try {
    const res = await fetch(
      `${
        process.env.REACT_APP_UNIPILOT_API_URL
      }/api/unipilot/aprs?vaultAddresses=${vaultAddresses?.join(
        ',',
      )}&chainId=${chainId}`,
    );
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        errorText || res.statusText || `Failed to get A51 Finance farms`,
      );
    }
    const data = await res.json();
    return data && data.doc ? data.doc : null;
  } catch {
    return null;
  }
};

export const getUnipilotUserFarms = async (
  chainId?: ChainId,
  account?: string,
) => {
  if (!chainId || !account) return [];
  try {
    const res = await fetch(
      `${
        process.env.REACT_APP_LEADERBOARD_APP_URL
      }/unipilot/farming-user-vaults/${account.toLowerCase()}?chainId=${chainId}`,
    );
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        errorText || res.statusText || `Failed to get A51 Finance user farms`,
      );
    }
    const data = await res.json();
    return data && data.data && data.data.vaults ? data.data.vaults : [];
  } catch (err) {
    return [];
  }
};

export const getAllGammaPairs = (chainId?: ChainId) => {
  const config = getConfig(chainId);
  const gammaAvailable = config['gamma']['available'];
  if (gammaAvailable && chainId) {
    const gammaPairs = GammaPairs[chainId];
    return gammaPairs
      ? ([] as GammaPair[]).concat(...Object.values(gammaPairs))
      : [];
  }
  return [];
};

export const getGammaPairsForTokens = (
  chainId?: ChainId,
  address0?: string,
  address1?: string,
  feeAmount?: FeeAmount,
) => {
  const config = getConfig(chainId);
  const gammaAvailable = config['gamma']['available'];
  if (gammaAvailable && chainId && address0 && address1) {
    const gammaPairs = GammaPairs[chainId];
    if (!gammaPairs) return;
    const pairs =
      gammaPairs[
        address0.toLowerCase() +
          '-' +
          address1.toLowerCase() +
          `${feeAmount ? `-${feeAmount}` : ''}`
      ];
    const reversedPairs =
      gammaPairs[
        address1.toLowerCase() +
          '-' +
          address0.toLowerCase() +
          `${feeAmount ? `-${feeAmount}` : ''}`
      ];
    if (pairs) {
      return { reversed: false, pairs };
    } else if (reversedPairs) {
      return { reversed: true, pairs: reversedPairs };
    }
    return;
  }
  return;
};

export const getAllDefiedgeStrategies = (chainId?: ChainId) => {
  const config = getConfig(chainId);
  const defiedgeAvailable = config['defiedge']['available'];
  if (defiedgeAvailable && chainId) {
    return DefiedgeStrategies[chainId] ?? [];
  }
  return [];
};

export enum LiquidityProtocol {
  Both = 1,
  V2 = 2,
  V3 = 3,
  Algebra = 4,
  Gamma = 5,
  Steer = 6,
  Solidly = 7,
  XFAI = 8,
}

export function getPriceGetterCallData(
  tokens: BondToken[],
  chainId: ChainId,
  lpTokens: boolean,
) {
  return Object.values(tokens).map((token) => {
    const liquidityDex = token.liquidityDex?.[chainId];
    let dexFactory;
    let protocol = 2;
    let factoryV2 = defaultBondDexFactories?.[chainId]?.[2] ?? ZERO_ADDRESS;
    let factoryV3 = defaultBondDexFactories?.[chainId]?.[3] ?? ZERO_ADDRESS;
    let factoryAlgebra =
      defaultBondDexFactories?.[chainId]?.[4] ?? ZERO_ADDRESS;
    let factorySolidly =
      defaultBondDexFactories?.[chainId]?.[7] ?? ZERO_ADDRESS;
    if (liquidityDex) {
      dexFactory = bondDexFactories[chainId]?.[liquidityDex as LiquidityDex];
      protocol = dexFactory?.protocol ?? Protocols.V2;
      switch (protocol) {
        case Protocols.V2:
          factoryV2 = dexFactory?.factory ?? factoryV2;
          break;
        case Protocols.V3:
          factoryV3 = dexFactory?.factory ?? factoryV3;
          break;
        case Protocols.Algebra:
          factoryAlgebra = dexFactory?.factory ?? factoryAlgebra;
          break;
        case Protocols.Solidly:
          factorySolidly = dexFactory?.factory ?? factorySolidly;
          break;
      }
    }

    const errMsg = `No default dex factory found for retrieving price. For Protocol: ${protocol}.`;
    switch (protocol as Protocols) {
      case Protocols.Both:
        if (factoryV2 === ZERO_ADDRESS || factoryV3 === ZERO_ADDRESS) {
          throw new Error(errMsg);
        }
        break;
      case Protocols.V2:
        if (factoryV2 === ZERO_ADDRESS) {
          throw new Error(errMsg);
        }
        break;
      case Protocols.V3:
        if (factoryV3 === ZERO_ADDRESS) {
          throw new Error(errMsg);
        }
        break;
    }
    if (lpTokens && protocol == Protocols.Algebra) {
      protocol = Protocols.Gamma;
    }
    if (lpTokens && protocol == Protocols.V3) {
      protocol = Protocols.Steer;
    }
    return [
      token.address[chainId],
      protocol,
      factoryV2,
      factoryV3,
      factoryAlgebra,
      factorySolidly,
    ];
  });
}

export function getFixedValue(value: string, decimals?: number) {
  if (!value) return '0';
  const splitedValueArray = value.split('.');
  let valueStr = value;
  if (splitedValueArray.length > 1) {
    const decimalStr = splitedValueArray[1].substring(0, decimals ?? 18);
    valueStr = `${splitedValueArray[0]}.${decimalStr}`;
  }
  return valueStr;
}

export const convertToTokenValue = (
  numberString: string,
  decimals: number,
): BigNumber => {
  const num = Number(numberString);
  if (isNaN(num)) {
    console.error('Error: numberString to parse is not a number');
    return parseUnits('0', decimals);
  }

  const tokenValue = parseUnits(
    getFixedValue(numberString, decimals),
    decimals,
  );
  return tokenValue;
};

export const calculatePositionWidth = (
  currentTick: number,
  upperTick: number,
  lowerTick: number,
): number => {
  const currentPrice = Math.pow(1.0001, Number(currentTick));
  const upperPrice = Math.pow(1.0001, Number(upperTick));
  const lowerPrice = Math.pow(1.0001, Number(lowerTick));

  // Calculate upper and lower bounds width in percentage
  const upperBoundWidthPercent =
    ((upperPrice - currentPrice) / currentPrice) * 100;
  const lowerBoundWidthPercent =
    ((currentPrice - lowerPrice) / currentPrice) * 100;

  // Calculate average width of the position
  const positionWidthPercent =
    (upperBoundWidthPercent + lowerBoundWidthPercent) / 2;

  return Math.abs(positionWidthPercent);
};

export const percentageToMultiplier = (percentage: number): number => {
  const multiplier = 1 + percentage / 100;
  return multiplier;
};

export const getSteerRatio = (tokenType: number, steerVault: SteerVault) => {
  let steerRatio;
  const steerVaultToken0BalanceNum = Number(
    formatUnits(steerVault.token0Balance ?? '0', steerVault.token0?.decimals),
  );
  const steerVaultToken1BalanceNum = Number(
    formatUnits(steerVault.token1Balance ?? '0', steerVault.token1?.decimals),
  );
  if (steerVaultToken0BalanceNum === 0 && steerVaultToken1BalanceNum === 0) {
    const price = BigNumber.from(steerVault?.sqrtPriceX96 ?? '0')
      .pow(2)
      .mul(BigNumber.from('10').pow(18))
      .div(BigNumber.from('2').pow(192));
    const nativeTokenRatio = price.div(BigNumber.from('10').pow(18));
    if (tokenType === 0 && nativeTokenRatio.gt(BigNumber.from('0'))) {
      steerRatio = Number(
        formatUnits(
          BigNumber.from('10')
            .pow(18)
            .div(nativeTokenRatio),
        ),
      );
    } else {
      steerRatio = Number(formatUnits(nativeTokenRatio));
    }
  } else {
    if (tokenType === 1) {
      if (steerVaultToken0BalanceNum > 0) {
        steerRatio = steerVaultToken1BalanceNum / steerVaultToken0BalanceNum;
      } else {
        steerRatio = steerVaultToken1BalanceNum;
      }
    } else {
      if (steerVaultToken1BalanceNum > 0) {
        steerRatio = steerVaultToken0BalanceNum / steerVaultToken1BalanceNum;
      } else {
        steerRatio = steerVaultToken0BalanceNum;
      }
    }
  }
  return steerRatio;
};

export const getSteerDexName = (chainId?: ChainId) => {
  if (chainId === ChainId.MATIC) return 'quickswap';
  if (chainId === ChainId.LAYERX) return 'quickswapalgebra';
  return 'quickswapv3';
};

export const searchForBillId = (
  resp: ContractReceipt,
  billNftAddress: string,
  setBondId?: (id: string) => void,
) => {
  const { logs } = resp;
  const findBillNftLog = logs.find(
    (log: any) => log.address.toLowerCase() === billNftAddress.toLowerCase(),
  );
  if (findBillNftLog) {
    const getBillNftIndex =
      findBillNftLog.topics[findBillNftLog.topics.length - 1];
    const convertHexId = parseInt(getBillNftIndex, 16);
    if (setBondId) {
      setBondId(convertHexId.toString());
    }
  }
};

export const getLiquidityDEX = (liquidityDEX?: LiquidityDex) => {
  if (liquidityDEX === LiquidityDex.QuickswapV2) return DEX.QUICKSWAP;
  if (liquidityDEX === LiquidityDex.ApeSwapV2) return DEX.APEBOND;
};

export const getCurrencyInfo = ({
  currencyA,
  currencyB,
  pair,
}: {
  currencyA: WrappedTokenInfo | null;
  currencyB?: WrappedTokenInfo | null;
  pair?: Pair | null;
}): { address: string; decimals: number; chainId: ChainId } => {
  if (currencyB) {
    const {
      liquidityToken: { address, decimals, chainId } = {
        address: '',
        decimals: 18,
        chainId: ChainId.MATIC,
      },
    } = pair || {};
    return { address, decimals, chainId };
  } else if (currencyA?.isNative) {
    return {
      address: NATIVE_TOKEN_ADDRESS,
      decimals: currencyA.decimals,
      chainId: currencyA.chainId,
    };
  }
  const {
    tokenInfo: { address, decimals, chainId } = {
      address: '',
      decimals: 18,
      chainId: 0,
    },
  } = currencyA || {};
  return {
    address: address ? address : (currencyA?.address as string),
    decimals,
    chainId: !!chainId ? chainId : (currencyA?.chainId as ChainId),
  };
};

export function getPerpsSymbol(symbol: string) {
  return symbol.replace('PERP_', '').replace('_', '/');
}

export const getDexScreenerChainName = (
  chainId: ChainId,
): string | undefined => {
  const chainsName: { [chainId in ChainId]?: string } = {
    [ChainId.MATIC]: 'polygon',
  };
  return chainsName[chainId];
};
