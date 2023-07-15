import React, { useCallback, useMemo } from 'react';
import JSBI from 'jsbi';
import {
  Currency,
  CurrencyAmount,
  Price,
  Rounding,
  Token,
} from '@uniswap/sdk-core';
import { useActiveWeb3React } from 'hooks';
import { AppState } from '../../index';
import {
  Bound,
  Field,
  setFullRange,
  typeInput,
  typeLeftRangeInput,
  typeRightRangeInput,
  typeStartPriceInput,
  updateLiquidityRangeType,
  updatePresetRange,
} from './actions';
import { tryParseTick } from './utils';
import { PoolState, usePool } from 'hooks/v3/usePools';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { Pool } from 'v3lib/entities/pool';
import { Position } from 'v3lib/entities';
import { encodeSqrtRatioX96, TickMath, nearestUsableTick } from 'v3lib/utils';
import {
  priceToClosestTick,
  tickToPrice,
} from 'v3lib/utils/priceTickConversions';
import { getTickToPrice } from 'v3lib/utils/getTickToPrice';
import { BIG_INT_ZERO } from 'constants/v3/misc';
import { FeeAmount } from 'v3lib/utils';
import { useCurrencyBalances } from 'state/wallet/v3/hooks';
import { useCurrencyBalance } from 'state/wallet/hooks';
import { tryParseAmount } from 'state/swap/v3/hooks';
import { IPresetArgs } from 'pages/PoolsPage/v3/SupplyLiquidityV3/components/PresetRanges';
import { GlobalConst } from 'constants/index';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useContract, useGammaUNIProxyContract } from 'hooks/useContract';
import { useSingleCallResult } from 'state/multicall/hooks';
import { ETHER, WETH } from '@uniswap/sdk';
import { maxAmountSpend } from 'utils';
import { GammaPairs } from 'constants/index';
import GammaClearingABI from 'constants/abis/gamma-clearing.json';

export interface IDerivedMintInfo {
  pool?: Pool | null;
  poolState: PoolState;
  ticks: { [bound in Bound]?: number | undefined };
  price?: Price<Token, Token>;
  pricesAtTicks: {
    [bound in Bound]?: Price<Token, Token> | undefined;
  };
  currencies: { [field in Field]?: Currency };
  currencyBalances: { [field in Field]?: CurrencyAmount<Currency> };
  dependentField: Field;
  parsedAmounts: { [field in Field]?: CurrencyAmount<Currency> };
  position: Position | undefined;
  noLiquidity?: boolean;
  errorMessage?: string;
  token0ErrorMessage?: string;
  token1ErrorMessage?: string;
  errorCode?: number;
  invalidPool: boolean;
  outOfRange: boolean;
  invalidRange: boolean;
  depositADisabled: boolean;
  depositBDisabled: boolean;
  invertPrice: boolean;
  ticksAtLimit: { [bound in Bound]?: boolean | undefined };
  dynamicFee: number;
  lowerPrice: any;
  upperPrice: any;
  liquidityRangeType: string | undefined;
  presetRange: IPresetArgs | undefined;
}

export function useV3MintState(): AppState['mintV3'] {
  return useAppSelector((state) => state.mintV3);
}

export function useV3MintActionHandlers(
  noLiquidity: boolean | undefined,
): {
  onFieldAInput: (typedValue: string) => void;
  onFieldBInput: (typedValue: string) => void;
  onLeftRangeInput: (typedValue: string) => void;
  onRightRangeInput: (typedValue: string) => void;
  onStartPriceInput: (typedValue: string) => void;
  onChangeLiquidityRangeType: (value: string) => void;
  onChangePresetRange: (value: IPresetArgs) => void;
} {
  const dispatch = useAppDispatch();

  const onFieldAInput = useCallback(
    (typedValue: string) => {
      dispatch(
        typeInput({
          field: Field.CURRENCY_A,
          typedValue,
          noLiquidity: noLiquidity === true,
        }),
      );
    },
    [dispatch, noLiquidity],
  );

  const onFieldBInput = useCallback(
    (typedValue: string) => {
      dispatch(
        typeInput({
          field: Field.CURRENCY_B,
          typedValue,
          noLiquidity: noLiquidity === true,
        }),
      );
    },
    [dispatch, noLiquidity],
  );

  const onLeftRangeInput = useCallback(
    (typedValue: string) => {
      dispatch(typeLeftRangeInput({ typedValue }));
    },
    [dispatch],
  );

  const onRightRangeInput = useCallback(
    (typedValue: string) => {
      dispatch(typeRightRangeInput({ typedValue }));
    },
    [dispatch],
  );

  const onStartPriceInput = useCallback(
    (typedValue: string) => {
      dispatch(typeStartPriceInput({ typedValue }));
    },
    [dispatch],
  );

  const onChangeLiquidityRangeType = useCallback(
    (value: string) => {
      dispatch(updateLiquidityRangeType({ liquidityRangeType: value }));
    },
    [dispatch],
  );

  const onChangePresetRange = useCallback(
    (value: IPresetArgs) => {
      dispatch(updatePresetRange({ presetRange: value }));
    },
    [dispatch],
  );

  return {
    onFieldAInput,
    onFieldBInput,
    onLeftRangeInput,
    onRightRangeInput,
    onStartPriceInput,
    onChangeLiquidityRangeType,
    onChangePresetRange,
  };
}

export function useV3DerivedMintInfo(
  currencyA?: Currency,
  currencyB?: Currency,
  feeAmount?: FeeAmount,
  baseCurrency?: Currency,
  // override for existing position
  existingPosition?: Position,
): {
  pool?: Pool | null;
  poolState: PoolState;
  ticks: { [bound in Bound]?: number | undefined };
  price?: Price<Token, Token>;
  pricesAtTicks: {
    [bound in Bound]?: Price<Token, Token> | undefined;
  };
  currencies: { [field in Field]?: Currency };
  currencyBalances: { [field in Field]?: CurrencyAmount<Currency> };
  dependentField: Field;
  parsedAmounts: { [field in Field]?: CurrencyAmount<Currency> };
  position: Position | undefined;
  noLiquidity?: boolean;
  errorMessage?: string;
  token0ErrorMessage?: string;
  token1ErrorMessage?: string;
  errorCode?: number;
  invalidPool: boolean;
  outOfRange: boolean;
  invalidRange: boolean;
  depositADisabled: boolean;
  depositBDisabled: boolean;
  invertPrice: boolean;
  ticksAtLimit: { [bound in Bound]?: boolean | undefined };
  dynamicFee: number;
  lowerPrice: any;
  upperPrice: any;
  liquidityRangeType: string | undefined;
  presetRange: IPresetArgs | undefined;
} {
  const { chainId, account } = useActiveWeb3React();

  const {
    independentField,
    typedValue,
    leftRangeTypedValue,
    rightRangeTypedValue,
    startPriceTypedValue,
    liquidityRangeType,
    presetRange,
  } = useV3MintState();

  const dependentField =
    independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A;

  // currencies
  const currencies: { [field in Field]?: Currency } = useMemo(
    () => ({
      [Field.CURRENCY_A]: currencyA,
      [Field.CURRENCY_B]: currencyB,
    }),
    [currencyA, currencyB],
  );

  // formatted with tokens
  const [tokenA, tokenB, baseToken] = useMemo(
    () => [currencyA?.wrapped, currencyB?.wrapped, baseCurrency?.wrapped],
    [currencyA, currencyB, baseCurrency],
  );

  const [token0, token1] = useMemo(
    () =>
      tokenA && tokenB
        ? tokenA.sortsBefore(tokenB)
          ? [tokenA, tokenB]
          : [tokenB, tokenA]
        : [undefined, undefined],
    [tokenA, tokenB],
  );

  const ethBalance = useCurrencyBalance(
    account ?? undefined,
    chainId ? ETHER[chainId] : undefined,
  );
  const wethBalance = useCurrencyBalance(
    account ?? undefined,
    chainId ? WETH[chainId] : undefined,
  );
  const maxSpendETH = chainId ? maxAmountSpend(chainId, ethBalance) : undefined;
  // balances
  const balances = useCurrencyBalances(account ?? undefined, [
    currencies[Field.CURRENCY_A],
    currencies[Field.CURRENCY_B],
  ]);

  const currencyBalances: { [field in Field]?: CurrencyAmount<Currency> } = {
    [Field.CURRENCY_A]:
      liquidityRangeType === GlobalConst.v3LiquidityRangeType.GAMMA_RANGE &&
      currencyA &&
      chainId &&
      currencyA.wrapped.address.toLowerCase() ===
        WETH[chainId].address.toLowerCase()
        ? CurrencyAmount.fromRawAmount(
            currencyA,
            JSBI.ADD(
              JSBI.BigInt(wethBalance ? wethBalance.numerator.toString() : '0'),
              JSBI.BigInt(maxSpendETH ? maxSpendETH.numerator.toString() : '0'),
            ),
          )
        : balances[0],
    [Field.CURRENCY_B]:
      liquidityRangeType === GlobalConst.v3LiquidityRangeType.GAMMA_RANGE &&
      currencyB &&
      chainId &&
      currencyB.wrapped.address.toLowerCase() ===
        WETH[chainId].address.toLowerCase()
        ? CurrencyAmount.fromRawAmount(
            currencyB,
            JSBI.ADD(
              JSBI.BigInt(wethBalance ? wethBalance.numerator.toString() : '0'),
              JSBI.BigInt(maxSpendETH ? maxSpendETH.numerator.toString() : '0'),
            ),
          )
        : balances[1],
  };

  // pool
  //TODO
  const [poolState, pool] = usePool(
    currencies[Field.CURRENCY_A],
    currencies[Field.CURRENCY_B],
  );
  const noLiquidity = poolState === PoolState.NOT_EXISTS;

  const dynamicFee = pool ? pool.fee : 100;

  // note to parse inputs in reverse
  const invertPrice = Boolean(baseToken && token0 && !baseToken.equals(token0));

  // always returns the price with 0 as base token
  const price: Price<Token, Token> | undefined = useMemo(() => {
    // if no liquidity use typed value
    if (noLiquidity) {
      const parsedQuoteAmount = tryParseAmount(
        startPriceTypedValue,
        invertPrice ? token0 : token1,
      );
      if (parsedQuoteAmount && token0 && token1) {
        const baseAmount = tryParseAmount('1', invertPrice ? token1 : token0);
        const price =
          baseAmount && parsedQuoteAmount
            ? new Price(
                baseAmount.currency,
                parsedQuoteAmount.currency,
                baseAmount.quotient,
                parsedQuoteAmount.quotient,
              )
            : undefined;
        return (invertPrice ? price?.invert() : price) ?? undefined;
      }
      return undefined;
    } else {
      // get the amount of quote currency
      return pool && token0 ? pool.priceOf(token0) : undefined;
    }
  }, [noLiquidity, startPriceTypedValue, invertPrice, token1, token0, pool]);

  // check for invalid price input (converts to invalid ratio)
  const invalidPrice = useMemo(() => {
    const sqrtRatioX96 = price
      ? encodeSqrtRatioX96(price.numerator, price.denominator)
      : undefined;
    const invalid =
      price &&
      sqrtRatioX96 &&
      !(
        JSBI.greaterThanOrEqual(sqrtRatioX96, TickMath.MIN_SQRT_RATIO) &&
        JSBI.lessThan(sqrtRatioX96, TickMath.MAX_SQRT_RATIO)
      );
    return invalid;
  }, [price]);

  // used for ratio calculation when pool not initialized
  const mockPool = useMemo(() => {
    if (tokenA && tokenB && feeAmount && price && !invalidPrice) {
      const currentTick = priceToClosestTick(price);
      const currentSqrt = TickMath.getSqrtRatioAtTick(currentTick);
      return new Pool(
        tokenA,
        tokenB,
        feeAmount,
        currentSqrt,
        JSBI.BigInt(0),
        currentTick,
        [],
      );
    } else {
      return undefined;
    }
  }, [feeAmount, invalidPrice, price, tokenA, tokenB]);

  // if pool exists use it, if not use the mock pool
  const poolForPosition: Pool | undefined = pool ?? mockPool;

  // lower and upper limits in the tick space for `feeAmount`
  const tickSpaceLimits: {
    [bound in Bound]: number | undefined;
  } = useMemo(
    () => ({
      [Bound.LOWER]: feeAmount
        ? nearestUsableTick(TickMath.MIN_TICK, 60)
        : undefined,
      [Bound.UPPER]: feeAmount
        ? nearestUsableTick(TickMath.MAX_TICK, 60)
        : undefined,
    }),
    [feeAmount],
  );

  // parse typed range values and determine closest ticks
  // lower should always be a smaller tick
  const ticks: {
    [key: string]: number | undefined;
  } = useMemo(() => {
    return {
      [Bound.LOWER]:
        typeof existingPosition?.tickLower === 'number'
          ? existingPosition.tickLower
          : (invertPrice && typeof rightRangeTypedValue === 'boolean') ||
            (!invertPrice && typeof leftRangeTypedValue === 'boolean')
          ? tickSpaceLimits[Bound.LOWER]
          : invertPrice
          ? tryParseTick(
              token1,
              token0,
              feeAmount,
              rightRangeTypedValue.toString(),
            )
          : tryParseTick(
              token0,
              token1,
              feeAmount,
              leftRangeTypedValue.toString(),
            ),
      [Bound.UPPER]:
        typeof existingPosition?.tickUpper === 'number'
          ? existingPosition.tickUpper
          : (!invertPrice && typeof rightRangeTypedValue === 'boolean') ||
            (invertPrice && typeof leftRangeTypedValue === 'boolean')
          ? tickSpaceLimits[Bound.UPPER]
          : invertPrice
          ? tryParseTick(
              token1,
              token0,
              feeAmount,
              leftRangeTypedValue.toString(),
            )
          : tryParseTick(
              token0,
              token1,
              feeAmount,
              rightRangeTypedValue.toString(),
            ),
    };
  }, [
    existingPosition,
    feeAmount,
    invertPrice,
    leftRangeTypedValue,
    rightRangeTypedValue,
    token0,
    token1,
    tickSpaceLimits,
  ]);

  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks || {};

  // specifies whether the lower and upper ticks is at the exteme bounds
  const ticksAtLimit = useMemo(
    () => ({
      [Bound.LOWER]: feeAmount && tickLower === tickSpaceLimits.LOWER,
      [Bound.UPPER]: feeAmount && tickUpper === tickSpaceLimits.UPPER,
    }),
    [tickSpaceLimits, tickLower, tickUpper, feeAmount],
  );

  // mark invalid range
  const invalidRange = Boolean(
    typeof tickLower === 'number' &&
      typeof tickUpper === 'number' &&
      tickLower >= tickUpper,
  );

  // always returns the price with 0 as base token
  const pricesAtTicks = useMemo(() => {
    return {
      [Bound.LOWER]: getTickToPrice(token0, token1, ticks[Bound.LOWER]),
      [Bound.UPPER]: getTickToPrice(token0, token1, ticks[Bound.UPPER]),
    };
  }, [token0, token1, ticks]);
  const {
    [Bound.LOWER]: lowerPrice,
    [Bound.UPPER]: upperPrice,
  } = pricesAtTicks;

  // liquidity range warning
  const outOfRange = Boolean(
    !invalidRange &&
      price &&
      lowerPrice &&
      upperPrice &&
      (price.lessThan(lowerPrice) || price.greaterThan(upperPrice)),
  );

  const independentCurrency = currencies[independentField];

  const independentAmount:
    | CurrencyAmount<Currency>
    | undefined = tryParseAmount(
    typedValue,
    liquidityRangeType === GlobalConst.v3LiquidityRangeType.GAMMA_RANGE &&
      independentCurrency &&
      independentCurrency.isNative
      ? independentCurrency.wrapped
      : independentCurrency,
  );

  const gammaPairKeyReverted =
    currencyA && currencyB
      ? currencyB.wrapped.address.toLowerCase() +
        '-' +
        currencyA.wrapped.address.toLowerCase()
      : '';
  const gammaPairReverted = !!(
    chainId && GammaPairs[chainId][gammaPairKeyReverted]
  );
  const gammaPairs =
    currencyA && currencyB
      ? GammaPairs[chainId][
          currencyA.wrapped.address.toLowerCase() +
            '-' +
            currencyB.wrapped.address.toLowerCase()
        ] ??
        GammaPairs[chainId][
          currencyB.wrapped.address.toLowerCase() +
            '-' +
            currencyA.wrapped.address.toLowerCase()
        ]
      : undefined;

  const gammaPairAddress =
    gammaPairs && gammaPairs.length > 0 ? gammaPairs[0].address : undefined;
  const gammaUNIPROXYContract = useGammaUNIProxyContract(gammaPairAddress);
  const depositAmountsData = useSingleCallResult(
    presetRange && presetRange.address ? gammaUNIPROXYContract : undefined,
    'getDepositAmount',
    [
      presetRange?.address,
      independentCurrency?.wrapped.address,
      independentAmount?.numerator.toString(),
    ],
  );

  const depositCapData1 = useSingleCallResult(
    presetRange &&
      presetRange.address &&
      gammaUNIPROXYContract &&
      gammaUNIPROXYContract.address.toLowerCase() !==
        '0xa42d55074869491d60ac05490376b74cf19b00e6'
      ? gammaUNIPROXYContract
      : undefined,
    'positions',
    presetRange && presetRange.address ? [presetRange.address] : [],
  );

  const clearanceResult = useSingleCallResult(
    presetRange &&
      presetRange.address &&
      gammaUNIPROXYContract &&
      gammaUNIPROXYContract.address.toLowerCase() ===
        '0xa42d55074869491d60ac05490376b74cf19b00e6'
      ? gammaUNIPROXYContract
      : undefined,
    'clearance',
  );

  const clearanceAddress =
    !clearanceResult.loading &&
    clearanceResult.result &&
    clearanceResult.result.length > 0
      ? clearanceResult.result[0]
      : undefined;

  const clearanceContract = useContract(clearanceAddress, GammaClearingABI);

  const depositCapData2 = useSingleCallResult(
    presetRange &&
      presetRange.address &&
      gammaUNIPROXYContract &&
      gammaUNIPROXYContract.address.toLowerCase() ===
        '0xa42d55074869491d60ac05490376b74cf19b00e6'
      ? clearanceContract
      : undefined,
    'positions',
    presetRange && presetRange.address ? [presetRange.address] : [],
  );

  const depositCapData = gammaUNIPROXYContract
    ? gammaUNIPROXYContract.address.toLowerCase() ===
      '0xa42d55074869491d60ac05490376b74cf19b00e6'
      ? depositCapData2
      : depositCapData1
    : undefined;

  const depositCap = useMemo(() => {
    if (
      depositCapData &&
      !depositCapData.loading &&
      depositCapData.result &&
      depositCapData.result.length > 0 &&
      currencyA &&
      currencyB
    ) {
      const depositOverride = depositCapData.result['depositOverride'];
      if (!depositOverride) return;
      return {
        deposit0Max: Number(
          formatUnits(
            depositCapData.result['deposit0Max'] ?? 0,
            (gammaPairReverted ? currencyB : currencyA).wrapped.decimals,
          ),
        ),
        deposit1Max: Number(
          formatUnits(
            depositCapData.result['deposit1Max'] ?? 0,
            (gammaPairReverted ? currencyA : currencyB).wrapped.decimals,
          ),
        ),
      };
    }
    return;
  }, [currencyA, currencyB, depositCapData, gammaPairReverted]);

  const depositAmount = useMemo(() => {
    const dependentCurrency =
      independentField === Field.CURRENCY_A ? currencyB : currencyA;
    if (
      !depositAmountsData.loading &&
      depositAmountsData.result &&
      depositAmountsData.result.length > 1 &&
      dependentCurrency
    ) {
      return {
        amountMin: Number(
          formatUnits(
            depositAmountsData.result[0],
            dependentCurrency.wrapped.decimals,
          ),
        ),
        amountMax: Number(
          formatUnits(
            depositAmountsData.result[1],
            dependentCurrency.wrapped.decimals,
          ),
        ),
      };
    }
    return;
  }, [currencyA, currencyB, depositAmountsData, independentField]);

  const dependentAmount: CurrencyAmount<Currency> | undefined = useMemo(() => {
    const dependentCurrency =
      dependentField === Field.CURRENCY_B ? currencyB : currencyA;
    if (liquidityRangeType === GlobalConst.v3LiquidityRangeType.GAMMA_RANGE) {
      if (
        !independentAmount ||
        !presetRange ||
        !presetRange.address ||
        !depositAmount ||
        !dependentCurrency
      )
        return;
      const dependentDeposit = parseUnits(
        ((depositAmount.amountMin + depositAmount.amountMax) / 2).toFixed(
          dependentCurrency.wrapped.decimals,
        ),
        dependentCurrency.wrapped.decimals,
      );
      return CurrencyAmount.fromRawAmount(
        dependentCurrency.isNative
          ? dependentCurrency.wrapped
          : dependentCurrency,
        JSBI.BigInt(dependentDeposit),
      );
    }
    // we wrap the currencies just to get the price in terms of the other token
    const wrappedIndependentAmount = independentAmount?.wrapped;
    if (
      independentAmount &&
      wrappedIndependentAmount &&
      typeof tickLower === 'number' &&
      typeof tickUpper === 'number' &&
      poolForPosition
    ) {
      // if price is out of range or invalid range - return 0 (single deposit will be independent)
      if (outOfRange || invalidRange) {
        return undefined;
      }

      const position:
        | Position
        | undefined = wrappedIndependentAmount.currency.equals(
        poolForPosition.token0,
      )
        ? Position.fromAmount0({
            pool: poolForPosition,
            tickLower,
            tickUpper,
            amount0: independentAmount.quotient,
            useFullPrecision: true, // we want full precision for the theoretical position
          })
        : Position.fromAmount1({
            pool: poolForPosition,
            tickLower,
            tickUpper,
            amount1: independentAmount.quotient,
          });

      const dependentTokenAmount = wrappedIndependentAmount.currency.equals(
        poolForPosition.token0,
      )
        ? position.amount1
        : position.amount0;
      return (
        dependentCurrency &&
        CurrencyAmount.fromRawAmount(
          dependentCurrency,
          dependentTokenAmount.quotient,
        )
      );
    }

    return undefined;
  }, [
    liquidityRangeType,
    independentAmount,
    dependentField,
    currencyB,
    currencyA,
    tickLower,
    tickUpper,
    poolForPosition,
    presetRange,
    depositAmount,
    outOfRange,
    invalidRange,
  ]);

  const parsedAmounts: {
    [field in Field]: CurrencyAmount<Currency> | undefined;
  } = useMemo(() => {
    return {
      [Field.CURRENCY_A]:
        independentField === Field.CURRENCY_A
          ? independentAmount
          : dependentAmount,
      [Field.CURRENCY_B]:
        independentField === Field.CURRENCY_A
          ? dependentAmount
          : independentAmount,
    };
  }, [dependentAmount, independentAmount, independentField]);

  // single deposit only if price is out of range
  const deposit0Disabled = Boolean(
    typeof tickUpper === 'number' &&
      poolForPosition &&
      poolForPosition.tickCurrent >= tickUpper,
  );
  const deposit1Disabled = Boolean(
    typeof tickLower === 'number' &&
      poolForPosition &&
      poolForPosition.tickCurrent <= tickLower,
  );

  // sorted for token order
  const depositADisabled =
    liquidityRangeType === GlobalConst.v3LiquidityRangeType.MANUAL_RANGE &&
    (invalidRange ||
      Boolean(
        (deposit0Disabled &&
          poolForPosition &&
          tokenA &&
          poolForPosition.token0.equals(tokenA)) ||
          (deposit1Disabled &&
            poolForPosition &&
            tokenA &&
            poolForPosition.token1.equals(tokenA)),
      ));
  const depositBDisabled =
    liquidityRangeType === GlobalConst.v3LiquidityRangeType.MANUAL_RANGE &&
    (invalidRange ||
      Boolean(
        (deposit0Disabled &&
          poolForPosition &&
          tokenB &&
          poolForPosition.token0.equals(tokenB)) ||
          (deposit1Disabled &&
            poolForPosition &&
            tokenB &&
            poolForPosition.token1.equals(tokenB)),
      ));

  // create position entity based on users selection
  const position: Position | undefined = useMemo(() => {
    if (
      !poolForPosition ||
      !tokenA ||
      !tokenB ||
      typeof tickLower !== 'number' ||
      typeof tickUpper !== 'number' ||
      invalidRange
    ) {
      return undefined;
    }

    // mark as 0 if disabled because out of range
    const amount0 = !deposit0Disabled
      ? parsedAmounts?.[
          tokenA.equals(poolForPosition.token0)
            ? Field.CURRENCY_A
            : Field.CURRENCY_B
        ]?.quotient
      : BIG_INT_ZERO;
    const amount1 = !deposit1Disabled
      ? parsedAmounts?.[
          tokenA.equals(poolForPosition.token0)
            ? Field.CURRENCY_B
            : Field.CURRENCY_A
        ]?.quotient
      : BIG_INT_ZERO;

    if (amount0 !== undefined && amount1 !== undefined) {
      return Position.fromAmounts({
        pool: poolForPosition,
        tickLower,
        tickUpper,
        amount0,
        amount1,
        useFullPrecision: true, // we want full precision for the theoretical position
      });
    } else {
      return undefined;
    }
  }, [
    parsedAmounts,
    poolForPosition,
    tokenA,
    tokenB,
    deposit0Disabled,
    deposit1Disabled,
    invalidRange,
    tickLower,
    tickUpper,
  ]);

  let errorMessage: string | undefined;
  let token0ErrorMessage: string | undefined;
  let token1ErrorMessage: string | undefined;
  let errorCode: number | undefined;

  if (!account) {
    errorMessage = `Connect Wallet`;
    errorCode = errorCode ?? 0;
  }

  if (poolState === PoolState.INVALID) {
    errorMessage = errorMessage ?? `Invalid pair`;
    errorCode = errorCode ?? 1;
  }

  if (invalidPrice) {
    errorMessage = errorMessage ?? `Invalid price input`;
    errorCode = errorCode ?? 2;
  }

  if (
    (!parsedAmounts[Field.CURRENCY_A] && !depositADisabled) ||
    (!parsedAmounts[Field.CURRENCY_B] && !depositBDisabled)
  ) {
    errorMessage = errorMessage ?? `Enter an amount`;
    errorCode = errorCode ?? 3;
  }

  const {
    [Field.CURRENCY_A]: currencyAAmount,
    [Field.CURRENCY_B]: currencyBAmount,
  } = parsedAmounts;

  if (
    currencyAAmount &&
    currencyBalances?.[Field.CURRENCY_A]?.lessThan(currencyAAmount)
  ) {
    const msg = `Insufficient ${
      currencies[Field.CURRENCY_A]?.wrapped.symbol
    } balance`;
    errorMessage = msg;
    token0ErrorMessage = msg;
    errorCode = errorCode ?? 4;
  }

  if (
    currencyBAmount &&
    currencyBalances?.[Field.CURRENCY_B]?.lessThan(currencyBAmount)
  ) {
    const msg = `Insufficient ${
      currencies[Field.CURRENCY_B]?.wrapped.symbol
    } balance`;
    errorMessage = msg;
    token1ErrorMessage = msg;
    errorCode = errorCode ?? 5;
  }

  if (
    depositCap &&
    Number(currencyAAmount?.toExact() ?? 0) >
      (gammaPairReverted ? depositCap.deposit1Max : depositCap.deposit0Max)
  ) {
    const msg = `${
      currencies[Field.CURRENCY_A]?.wrapped.symbol
    } deposit cap of ${(gammaPairReverted
      ? depositCap.deposit1Max
      : depositCap.deposit0Max
    ).toLocaleString(
      'us',
    )} reached. Please deposit less than this amount.  Multiple deposits are allowed.`;
    errorMessage = msg;
    token0ErrorMessage = msg;
    errorCode = errorCode ?? 6;
  }

  if (
    depositCap &&
    Number(currencyBAmount?.toExact() ?? 0) >
      (gammaPairReverted ? depositCap.deposit0Max : depositCap.deposit1Max)
  ) {
    const msg = `${
      currencies[Field.CURRENCY_B]?.wrapped.symbol
    } deposit cap of ${(gammaPairReverted
      ? depositCap.deposit0Max
      : depositCap.deposit1Max
    ).toLocaleString(
      'us',
    )} reached. Please deposit less than this amount.  Multiple deposits are allowed.`;
    errorMessage = msg;
    token1ErrorMessage = msg;
    errorCode = errorCode ?? 7;
  }

  const invalidPool = poolState === PoolState.INVALID;

  return {
    dependentField,
    currencies,
    pool,
    poolState,
    currencyBalances,
    parsedAmounts,
    ticks,
    price,
    pricesAtTicks,
    position,
    noLiquidity,
    errorMessage,
    token0ErrorMessage,
    token1ErrorMessage,
    errorCode,
    invalidPool,
    invalidRange,
    outOfRange,
    depositADisabled,
    depositBDisabled,
    invertPrice,
    ticksAtLimit,
    dynamicFee,
    lowerPrice,
    upperPrice,
    liquidityRangeType,
    presetRange,
  };
}

export function useRangeHopCallbacks(
  baseCurrency: Currency | undefined,
  quoteCurrency: Currency | undefined,
  feeAmount: FeeAmount | undefined,
  tickLower: number | undefined,
  tickUpper: number | undefined,
  pool?: Pool | undefined | null,
) {
  const dispatch = useAppDispatch();

  const baseToken = useMemo(() => baseCurrency?.wrapped, [baseCurrency]);
  const quoteToken = useMemo(() => quoteCurrency?.wrapped, [quoteCurrency]);

  const getDecrementLower = useCallback(
    (rate = 1) => {
      if (
        baseToken &&
        quoteToken &&
        typeof tickLower === 'number' &&
        feeAmount
      ) {
        const newPrice = tickToPrice(
          baseToken,
          quoteToken,
          tickLower - 60 * rate,
        );
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
      }
      // use pool current tick as starting tick if we have pool but no tick input

      if (
        !(typeof tickLower === 'number') &&
        baseToken &&
        quoteToken &&
        feeAmount &&
        pool
      ) {
        const newPrice = tickToPrice(
          baseToken,
          quoteToken,
          pool.tickCurrent - 60 * rate,
        );
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
      }
      return '';
    },
    [baseToken, quoteToken, tickLower, feeAmount, pool],
  );

  const getIncrementLower = useCallback(
    (rate = 1) => {
      if (
        baseToken &&
        quoteToken &&
        typeof tickLower === 'number' &&
        feeAmount
      ) {
        const newPrice = tickToPrice(
          baseToken,
          quoteToken,
          tickLower + 60 * rate,
        );
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
      }
      // use pool current tick as starting tick if we have pool but no tick input
      if (
        !(typeof tickLower === 'number') &&
        baseToken &&
        quoteToken &&
        feeAmount &&
        pool
      ) {
        const newPrice = tickToPrice(
          baseToken,
          quoteToken,
          pool.tickCurrent + 60 * rate,
        );
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
      }
      return '';
    },
    [baseToken, quoteToken, tickLower, feeAmount, pool],
  );

  const getDecrementUpper = useCallback(
    (rate = 1) => {
      if (
        baseToken &&
        quoteToken &&
        typeof tickUpper === 'number' &&
        feeAmount
      ) {
        const newPrice = tickToPrice(
          baseToken,
          quoteToken,
          tickUpper - 60 * rate,
        );
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
      }
      // use pool current tick as starting tick if we have pool but no tick input
      if (
        !(typeof tickUpper === 'number') &&
        baseToken &&
        quoteToken &&
        feeAmount &&
        pool
      ) {
        const newPrice = tickToPrice(
          baseToken,
          quoteToken,
          pool.tickCurrent - 60 * rate,
        );
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
      }
      return '';
    },
    [baseToken, quoteToken, tickUpper, feeAmount, pool],
  );

  const getIncrementUpper = useCallback(
    (rate = 1) => {
      if (
        baseToken &&
        quoteToken &&
        typeof tickUpper === 'number' &&
        feeAmount
      ) {
        const newPrice = tickToPrice(
          baseToken,
          quoteToken,
          tickUpper + 60 * rate,
        );
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
      }
      // use pool current tick as starting tick if we have pool but no tick input
      if (
        !(typeof tickUpper === 'number') &&
        baseToken &&
        quoteToken &&
        feeAmount &&
        pool
      ) {
        const newPrice = tickToPrice(
          baseToken,
          quoteToken,
          pool.tickCurrent + 60 * rate,
        );
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
      }
      return '';
    },
    [baseToken, quoteToken, tickUpper, feeAmount, pool],
  );

  const getSetRange = useCallback(
    (numTicks: number) => {
      if (baseToken && quoteToken && feeAmount && pool) {
        // calculate range around current price given `numTicks`
        const newPriceLower = tickToPrice(
          baseToken,
          quoteToken,
          Math.max(TickMath.MIN_TICK, pool.tickCurrent - numTicks),
        );
        const newPriceUpper = tickToPrice(
          baseToken,
          quoteToken,
          Math.min(TickMath.MAX_TICK, pool.tickCurrent + numTicks),
        );

        return [
          newPriceLower.toSignificant(5, undefined, Rounding.ROUND_UP),
          newPriceUpper.toSignificant(5, undefined, Rounding.ROUND_UP),
        ];
      }
      return ['', ''];
    },
    [baseToken, quoteToken, feeAmount, pool],
  );

  const getSetFullRange = useCallback(() => {
    dispatch(setFullRange());
  }, [dispatch]);

  return {
    getDecrementLower,
    getIncrementLower,
    getDecrementUpper,
    getIncrementUpper,
    getSetRange,
    getSetFullRange,
  };
}

export function useActivePreset(): AppState['mintV3']['preset'] {
  const preset = useAppSelector((state: AppState) => state.mintV3.preset);
  return useMemo(() => preset, [preset]);
}

export function useAddLiquidityTxHash(): AppState['mintV3']['txHash'] {
  const txHash = useAppSelector((state: AppState) => state.mintV3.txHash);
  return useMemo(() => txHash, [txHash]);
}

export function useShowNewestPosition(): AppState['mintV3']['showNewestPosition'] {
  const newestPosition = useAppSelector(
    (state: AppState) => state.mintV3.showNewestPosition,
  );
  return useMemo(() => newestPosition, [newestPosition]);
}

export function useInitialUSDPrices(): AppState['mintV3']['initialUSDPrices'] {
  const initialUSDPrices = useAppSelector(
    (state: AppState) => state.mintV3.initialUSDPrices,
  );
  return useMemo(() => initialUSDPrices, [initialUSDPrices]);
}

export function useInitialTokenPrice(): AppState['mintV3']['initialTokenPrice'] {
  const initialTokenPrice = useAppSelector(
    (state: AppState) => state.mintV3.initialTokenPrice,
  );
  return useMemo(() => initialTokenPrice, [initialTokenPrice]);
}

export function useCurrentStep(): AppState['mintV3']['currentStep'] {
  const currentStep = useAppSelector(
    (state: AppState) => state.mintV3.currentStep,
  );
  return useMemo(() => currentStep, [currentStep]);
}
