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
  updateFeeTier,
} from './actions';
import { tryParseTick } from './utils';
import { PoolState, usePool } from 'hooks/v3/usePools';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { Pool } from 'v3lib/entities/pool';
import { Position } from 'v3lib/entities';
import {
  encodeSqrtRatioX96,
  TickMath,
  nearestUsableTick,
  TICK_SPACINGS,
} from 'v3lib/utils';
import {
  priceToClosestTick,
  tickToPrice,
} from 'v3lib/utils/priceTickConversions';
import { getTickToPrice } from 'v3lib/utils/getTickToPrice';
import { BIG_INT_ZERO } from 'constants/v3/misc';
import { FeeAmount } from 'v3lib/utils';
import { useCurrencyBalances } from 'state/wallet/v3/hooks';
import { useCurrencyBalance, useTokenBalance } from 'state/wallet/hooks';
import { tryParseAmount } from 'state/swap/v3/hooks';
import { IPresetArgs } from 'pages/PoolsPage/v3/SupplyLiquidityV3/components/PresetRanges';
import { GlobalConst, UnipilotVaults } from 'constants/index';
import { Interface, formatUnits, parseUnits } from 'ethers/lib/utils';
import {
  useContract,
  useGammaUNIProxyContract,
  useUniPilotVaultContract,
} from 'hooks/useContract';
import { useSingleCallResult } from 'state/multicall/hooks';
import {
  getAllDefiedgeStrategies,
  getGammaPairsForTokens,
  maxAmountSpend,
  getSteerRatio,
  getFixedValue,
} from 'utils';
import { ChainId, ETHER, WETH } from '@uniswap/sdk';
import GammaClearingABI from 'constants/abis/gamma-clearing.json';
import { useMultipleContractSingleData } from 'state/multicall/v3/hooks';
import UNIPILOT_VAULT_ABI from 'constants/abis/unipilot-vault.json';
import DEFIEDGE_STRATEGY_ABI from 'constants/abis/defiedge-strategy.json';
import { getConfig } from 'config/index';
import { IFeeTier } from 'pages/PoolsPage/v3/SupplyLiquidityV3/containers/SelectFeeTier';
import { useSteerVaults } from 'hooks/v3/useSteerData';
import { useQuery } from '@tanstack/react-query';

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
  feeAmount: FeeAmount | undefined;
  lowerPrice: any;
  upperPrice: any;
  liquidityRangeType: string | undefined;
  presetRange: IPresetArgs | undefined;
  feeTier: IFeeTier | undefined;
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
  onChangeFeeTier: (value: IFeeTier) => void;
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

  const onChangeFeeTier = useCallback(
    (value: IFeeTier) => {
      dispatch(updateFeeTier({ feeTier: value }));
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
    onChangeFeeTier,
  };
}

export function useV3DerivedMintInfo(
  currencyA?: Currency,
  currencyB?: Currency,
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
  feeAmount: FeeAmount | undefined;
  lowerPrice: any;
  upperPrice: any;
  liquidityRangeType: string | undefined;
  presetRange: IPresetArgs | undefined;
  feeTier: IFeeTier | undefined;
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
    feeTier,
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
      (liquidityRangeType === GlobalConst.v3LiquidityRangeType.GAMMA_RANGE ||
        liquidityRangeType === GlobalConst.v3LiquidityRangeType.STEER_RANGE) &&
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
        : balances.length > 0
        ? balances[0]
        : undefined,
    [Field.CURRENCY_B]:
      (liquidityRangeType === GlobalConst.v3LiquidityRangeType.GAMMA_RANGE ||
        liquidityRangeType === GlobalConst.v3LiquidityRangeType.STEER_RANGE) &&
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
        : balances.length > 1
        ? balances[1]
        : undefined,
  };

  const feeAmount = useMemo(() => {
    const algebraChains = [
      ChainId.MATIC,
      ChainId.DOGECHAIN,
      ChainId.ZKEVM,
      ChainId.LAYERX,
    ];
    if (existingPosition && existingPosition.pool.isUni)
      return existingPosition.pool.fee;
    if (!feeTier) {
      if (!algebraChains.includes(chainId)) return FeeAmount.LOWEST;
      return;
    }
    switch (feeTier.id) {
      case 'uni-0.01':
        return FeeAmount.LOWEST;
      case 'uni-0.05':
        return FeeAmount.LOW;
      case 'uni-0.3':
        return FeeAmount.MEDIUM;
      case 'uni-1':
        return FeeAmount.HIGH;
      default:
        return;
    }
  }, [existingPosition, feeTier, chainId]);

  // pool
  //TODO
  const [poolState, pool] = usePool(
    currencies[Field.CURRENCY_A],
    currencies[Field.CURRENCY_B],
    feeAmount,
    !!feeAmount,
  );
  const noLiquidity = poolState === PoolState.NOT_EXISTS;

  const dynamicFee = pool && pool.fee ? pool.fee : 100;

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
    if (tokenA && tokenB && price && !invalidPrice) {
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
        !!feeAmount,
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
      [Bound.LOWER]: nearestUsableTick(
        TickMath.MIN_TICK,
        feeAmount ? TICK_SPACINGS[feeAmount] : 60,
      ),
      [Bound.UPPER]: nearestUsableTick(
        TickMath.MAX_TICK,
        feeAmount ? TICK_SPACINGS[feeAmount] : 60,
      ),
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
      [Bound.LOWER]: tickLower === tickSpaceLimits.LOWER,
      [Bound.UPPER]: tickUpper === tickSpaceLimits.UPPER,
    }),
    [tickSpaceLimits, tickLower, tickUpper],
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
    (liquidityRangeType === GlobalConst.v3LiquidityRangeType.GAMMA_RANGE ||
      liquidityRangeType === GlobalConst.v3LiquidityRangeType.STEER_RANGE) &&
      independentCurrency &&
      independentCurrency.isNative
      ? independentCurrency.wrapped
      : independentCurrency,
  );

  const gammaPairData =
    liquidityRangeType === GlobalConst.v3LiquidityRangeType.GAMMA_RANGE
      ? getGammaPairsForTokens(
          chainId,
          currencyA?.wrapped.address,
          currencyB?.wrapped.address,
          feeAmount,
        )
      : undefined;
  const gammaPairReverted = gammaPairData?.reversed;
  const gammaPair = gammaPairData
    ? gammaPairData.pairs.find(
        (item) =>
          presetRange &&
          presetRange.address &&
          item.address.toLowerCase() === presetRange.address.toLowerCase(),
      )
    : undefined;

  const gammaUNIPROXYContract = useGammaUNIProxyContract(presetRange?.address);
  const depositAmountsData = useSingleCallResult(
    presetRange && presetRange.address && !gammaPair?.withdrawOnly
      ? gammaUNIPROXYContract
      : undefined,
    'getDepositAmount',
    [
      presetRange?.address,
      independentCurrency?.wrapped.address,
      independentAmount?.numerator.toString(),
    ],
  );

  const clearanceResult = useSingleCallResult(
    presetRange && presetRange.address && !gammaPair?.withdrawOnly
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

  const depositCapData = useSingleCallResult(
    clearanceContract,
    'positions',
    presetRange && presetRange.address ? [presetRange.address] : [],
  );

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

  const isUniPilot =
    liquidityRangeType === GlobalConst.v3LiquidityRangeType.UNIPILOT_RANGE;

  const vaultToken0Address =
    presetRange && presetRange.tokenStr
      ? presetRange.tokenStr.split('-')[0]
      : undefined;
  const vaultToken0 =
    currencyA && vaultToken0Address
      ? currencyA.wrapped.address.toLowerCase() ===
        vaultToken0Address.toLowerCase()
        ? currencyA.wrapped
        : currencyB?.wrapped
      : undefined;
  const vaultToken1Address =
    presetRange && presetRange.tokenStr
      ? presetRange.tokenStr.split('-')[1]
      : undefined;
  const vaultToken1 =
    currencyA && vaultToken1Address
      ? currencyA.wrapped.address.toLowerCase() ===
        vaultToken1Address.toLowerCase()
        ? currencyA.wrapped
        : currencyB?.wrapped
      : undefined;
  const unipilotToken0VaultBalance = useTokenBalance(
    presetRange?.address,
    isUniPilot ? vaultToken0 : undefined,
  );
  const unipilotToken1VaultBalance = useTokenBalance(
    presetRange?.address,
    isUniPilot ? vaultToken1 : undefined,
  );
  const uniPilotVaultContract = useUniPilotVaultContract(presetRange?.address);
  const uniPilotVaultPositionResult = useSingleCallResult(
    isUniPilot && presetRange && presetRange.address && uniPilotVaultContract
      ? uniPilotVaultContract
      : undefined,
    'getPositionDetails',
  );
  const uniPilotVaultReserve = useMemo(() => {
    if (
      !uniPilotVaultPositionResult.loading &&
      uniPilotVaultPositionResult.result &&
      uniPilotVaultPositionResult.result.length > 1
    ) {
      return {
        token0: JSBI.add(
          JSBI.BigInt(uniPilotVaultPositionResult.result[0]),
          unipilotToken0VaultBalance?.numerator ?? JSBI.BigInt(0),
        ),
        token1: JSBI.add(
          JSBI.BigInt(uniPilotVaultPositionResult.result[1]),
          unipilotToken1VaultBalance?.numerator ?? JSBI.BigInt(0),
        ),
      };
    }
    return;
  }, [
    uniPilotVaultPositionResult,
    unipilotToken0VaultBalance,
    unipilotToken1VaultBalance,
  ]);

  const { defiedgeStrategies } = useGetDefiedgeStrategies();
  const defiedgeStrategy = defiedgeStrategies.find(
    (item) =>
      presetRange &&
      presetRange.address &&
      item.id.toLowerCase() === presetRange.address.toLowerCase(),
  );

  const { data: steerVaults } = useSteerVaults(chainId);
  const steerVault = steerVaults.find(
    (item) =>
      presetRange &&
      presetRange.address &&
      item.address.toLowerCase() === presetRange.address.toLowerCase(),
  );

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

    if (
      liquidityRangeType === GlobalConst.v3LiquidityRangeType.UNIPILOT_RANGE
    ) {
      if (
        !independentAmount ||
        !presetRange ||
        !presetRange.address ||
        !dependentCurrency
      )
        return;
      const independentReserve =
        dependentField === Field.CURRENCY_B
          ? currencyB &&
            vaultToken0 &&
            currencyB.wrapped.address.toLowerCase() ===
              vaultToken0.address.toLowerCase()
            ? uniPilotVaultReserve?.token1
            : uniPilotVaultReserve?.token0
          : currencyA &&
            vaultToken0 &&
            currencyA.wrapped.address.toLowerCase() ===
              vaultToken0.address.toLowerCase()
          ? uniPilotVaultReserve?.token1
          : uniPilotVaultReserve?.token0;
      const dependentReserve =
        dependentField === Field.CURRENCY_B
          ? currencyB &&
            vaultToken0 &&
            currencyB.wrapped.address.toLowerCase() ===
              vaultToken0.address.toLowerCase()
            ? uniPilotVaultReserve?.token0
            : uniPilotVaultReserve?.token1
          : currencyA &&
            vaultToken0 &&
            currencyA.wrapped.address.toLowerCase() ===
              vaultToken0.address.toLowerCase()
          ? uniPilotVaultReserve?.token0
          : uniPilotVaultReserve?.token1;
      if (
        !independentReserve ||
        !dependentReserve ||
        JSBI.equal(independentReserve, JSBI.BigInt(0))
      )
        return;

      const dependentDeposit = JSBI.divide(
        JSBI.multiply(dependentReserve, independentAmount.numerator),
        independentReserve,
      );

      return CurrencyAmount.fromRawAmount(dependentCurrency, dependentDeposit);
    }

    if (
      liquidityRangeType === GlobalConst.v3LiquidityRangeType.DEFIEDGE_RANGE
    ) {
      if (!independentAmount || !dependentCurrency || !defiedgeStrategy) return;

      const tokenType =
        defiedgeStrategy.token0 &&
        dependentCurrency.wrapped.address.toLowerCase() ===
          defiedgeStrategy.token0.toLowerCase()
          ? 0
          : 1;

      let dependentDeposit;

      if (tokenType === 0) {
        dependentDeposit =
          (1 / defiedgeStrategy.ratio) * Number(independentAmount.toExact());
      } else {
        dependentDeposit =
          defiedgeStrategy.ratio * Number(independentAmount.toExact());
      }

      return CurrencyAmount.fromRawAmount(
        dependentCurrency.isNative
          ? dependentCurrency.wrapped
          : dependentCurrency,
        JSBI.BigInt(
          parseUnits(
            getFixedValue(
              dependentDeposit.toString(),
              dependentCurrency.decimals,
            ),
            dependentCurrency.decimals,
          ),
        ),
      );
    }

    if (liquidityRangeType === GlobalConst.v3LiquidityRangeType.STEER_RANGE) {
      if (!independentAmount || !dependentCurrency || !steerVault) return;
      const tokenType =
        steerVault.token0 &&
        dependentCurrency.wrapped.address.toLowerCase() ===
          steerVault.token0.address.toLowerCase()
          ? 0
          : 1;
      const steerRatio = getSteerRatio(tokenType, steerVault);
      const dependentDeposit = steerRatio * Number(independentAmount.toExact());
      return CurrencyAmount.fromRawAmount(
        dependentCurrency.isNative
          ? dependentCurrency.wrapped
          : dependentCurrency,
        JSBI.BigInt(
          parseUnits(
            getFixedValue(
              dependentDeposit.toString(),
              dependentCurrency.decimals,
            ),
            dependentCurrency.decimals,
          ),
        ),
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
    dependentField,
    currencyB,
    currencyA,
    liquidityRangeType,
    independentAmount,
    tickLower,
    tickUpper,
    poolForPosition,
    presetRange,
    depositAmount,
    vaultToken0,
    uniPilotVaultReserve?.token1,
    uniPilotVaultReserve?.token0,
    defiedgeStrategy,
    steerVault,
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
    (liquidityRangeType === GlobalConst.v3LiquidityRangeType.MANUAL_RANGE ||
      liquidityRangeType === GlobalConst.v3LiquidityRangeType.DEFIEDGE_RANGE) &&
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
    (liquidityRangeType === GlobalConst.v3LiquidityRangeType.MANUAL_RANGE ||
      liquidityRangeType === GlobalConst.v3LiquidityRangeType.DEFIEDGE_RANGE) &&
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
    const msg = `Insufficient ${currencies[Field.CURRENCY_A]?.symbol} balance`;
    errorMessage = msg;
    token0ErrorMessage = msg;
    errorCode = errorCode ?? 4;
  }

  if (
    currencyBAmount &&
    currencyBalances?.[Field.CURRENCY_B]?.lessThan(currencyBAmount)
  ) {
    const msg = `Insufficient ${currencies[Field.CURRENCY_B]?.symbol} balance`;
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
      currencies[Field.CURRENCY_A]?.symbol
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
      currencies[Field.CURRENCY_B]?.symbol
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
    feeAmount,
    lowerPrice,
    upperPrice,
    liquidityRangeType,
    presetRange,
    feeTier,
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
  const tickSpacing = feeAmount ? TICK_SPACINGS[feeAmount] : 60;

  const getDecrementLower = useCallback(
    (rate = 1) => {
      if (baseToken && quoteToken && typeof tickLower === 'number') {
        const newPrice = tickToPrice(
          baseToken,
          quoteToken,
          tickLower - tickSpacing * rate,
        );
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
      }
      // use pool current tick as starting tick if we have pool but no tick input

      if (!(typeof tickLower === 'number') && baseToken && quoteToken && pool) {
        const newPrice = tickToPrice(
          baseToken,
          quoteToken,
          pool.tickCurrent - tickSpacing * rate,
        );
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
      }
      return '';
    },
    [baseToken, quoteToken, tickLower, tickSpacing, pool],
  );

  const getIncrementLower = useCallback(
    (rate = 1) => {
      if (baseToken && quoteToken && typeof tickLower === 'number') {
        const newPrice = tickToPrice(
          baseToken,
          quoteToken,
          tickLower + tickSpacing * rate,
        );
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
      }
      // use pool current tick as starting tick if we have pool but no tick input
      if (!(typeof tickLower === 'number') && baseToken && quoteToken && pool) {
        const newPrice = tickToPrice(
          baseToken,
          quoteToken,
          pool.tickCurrent + tickSpacing * rate,
        );
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
      }
      return '';
    },
    [baseToken, quoteToken, tickLower, tickSpacing, pool],
  );

  const getDecrementUpper = useCallback(
    (rate = 1) => {
      if (baseToken && quoteToken && typeof tickUpper === 'number') {
        const newPrice = tickToPrice(
          baseToken,
          quoteToken,
          tickUpper - tickSpacing * rate,
        );
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
      }
      // use pool current tick as starting tick if we have pool but no tick input
      if (!(typeof tickUpper === 'number') && baseToken && quoteToken && pool) {
        const newPrice = tickToPrice(
          baseToken,
          quoteToken,
          pool.tickCurrent - tickSpacing * rate,
        );
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
      }
      return '';
    },
    [baseToken, quoteToken, tickUpper, tickSpacing, pool],
  );

  const getIncrementUpper = useCallback(
    (rate = 1) => {
      if (baseToken && quoteToken && typeof tickUpper === 'number') {
        const newPrice = tickToPrice(
          baseToken,
          quoteToken,
          tickUpper + tickSpacing * rate,
        );
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
      }
      // use pool current tick as starting tick if we have pool but no tick input
      if (!(typeof tickUpper === 'number') && baseToken && quoteToken && pool) {
        const newPrice = tickToPrice(
          baseToken,
          quoteToken,
          pool.tickCurrent + tickSpacing * rate,
        );
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
      }
      return '';
    },
    [baseToken, quoteToken, tickUpper, tickSpacing, pool],
  );

  const getSetRange = useCallback(
    (numTicks: number) => {
      if (baseToken && quoteToken && pool) {
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
    [baseToken, quoteToken, pool],
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

export function useGetUnipilotVaults() {
  const { chainId } = useActiveWeb3React();
  const config = getConfig(chainId);
  const unipilotAvailable = config['unipilot']['available'];
  const vaultIds = unipilotAvailable ? UnipilotVaults[chainId] ?? [] : [];
  const vaultInfoResults = useMultipleContractSingleData(
    vaultIds,
    new Interface(UNIPILOT_VAULT_ABI),
    'getVaultInfo',
  );
  const vaultSymbolResults = useMultipleContractSingleData(
    vaultIds,
    new Interface(UNIPILOT_VAULT_ABI),
    'symbol',
  );
  const vaultTicksResults = useMultipleContractSingleData(
    vaultIds,
    new Interface(UNIPILOT_VAULT_ABI),
    'ticksData',
  );
  return vaultIds.map((id, index) => {
    const vaultInfoCallData = vaultInfoResults[index];
    const vaultSymbolCallData = vaultSymbolResults[index];
    const vaultTickCallData = vaultTicksResults[index];
    const vaultInfoResult =
      !vaultInfoCallData.loading &&
      vaultInfoCallData.result &&
      vaultInfoCallData.result.length > 0
        ? vaultInfoCallData.result
        : undefined;
    const vaultSymbolResult =
      !vaultSymbolCallData.loading &&
      vaultSymbolCallData.result &&
      vaultSymbolCallData.result.length > 0
        ? vaultSymbolCallData.result
        : undefined;
    const vaultTicksResult =
      !vaultTickCallData.loading &&
      vaultTickCallData.result &&
      vaultTickCallData.result.length > 0
        ? vaultTickCallData.result
        : undefined;
    return {
      id,
      symbol: vaultSymbolResult ? vaultSymbolResult[0] : undefined,
      token0: vaultInfoResult ? vaultInfoResult[0] : undefined,
      token1: vaultInfoResult ? vaultInfoResult[1] : undefined,
      fee: vaultInfoResult ? vaultInfoResult[2] : undefined,
      poolAddress: vaultInfoResult ? vaultInfoResult[3] : undefined,
      baseTickLower: vaultTicksResult ? vaultTicksResult[0] : undefined,
      baseTickUpper: vaultTicksResult ? vaultTicksResult[1] : undefined,
      rangeTickLower: vaultTicksResult ? vaultTicksResult[2] : undefined,
      rangeTickUpper: vaultTicksResult ? vaultTicksResult[3] : undefined,
    };
  });
}

export const useDefiEdgeStrategiesAPR = (strategies: string[]) => {
  const defiedgeAPIURL = process.env.REACT_APP_DEFIEDGE_API_URL;
  const fetchDefiedgeStrategiesWithApr = async () => {
    if (!defiedgeAPIURL) return [];

    try {
      const res = await fetch(
        `${defiedgeAPIURL}/polygon/details?strategies=${strategies.join()}`,
      );
      const data = await res.json();
      if (data && data.length > 0) {
        return data;
      }
      return [];
    } catch {
      return [];
    }
  };

  return useQuery({
    queryKey: ['fetchDefiedgeStrategiesWithApr', strategies.join()],
    queryFn: fetchDefiedgeStrategiesWithApr,
  });
};

export function useGetDefiedgeStrategies() {
  const { chainId } = useActiveWeb3React();
  const strategies = getAllDefiedgeStrategies(chainId);
  const strategyIds = strategies.map((s) => s.id);
  const defiedgeAPIURL = process.env.REACT_APP_DEFIEDGE_API_URL;

  const strategyTickResult = useMultipleContractSingleData(
    strategyIds,
    new Interface(DEFIEDGE_STRATEGY_ABI),
    'ticks',
    [0],
  );

  const fetchLiquidityRatio = useCallback(
    async (strategy: string) => {
      if (!defiedgeAPIURL) return 0;

      const res = await fetch(
        `${defiedgeAPIURL}/polygon/${strategy.toLowerCase()}/deposit/ratio`,
      );
      const data = await res.json();
      return data?.ratio ?? 0;
    },
    [defiedgeAPIURL],
  );

  const fetchStrategiesLiquidityRatio = useCallback(async () => {
    try {
      const responses = await Promise.all(
        strategies.map((s) => fetchLiquidityRatio(s.id)),
      );
      return responses;
    } catch (error) {
      console.error('Error fetching liquidity ratios:', error);
      return null;
    }
  }, [fetchLiquidityRatio, strategies]);

  const {
    isLoading,
    data: defiedgeStrategiesWithApr,
  } = useDefiEdgeStrategiesAPR(strategyIds);

  const { data: liquidityRatios } = useQuery({
    queryKey: ['fetchStrategiesLiquidityRatio', strategies],
    queryFn: fetchStrategiesLiquidityRatio,
  });

  const defiedgeStrategies = strategies.map((strategy, index) => {
    const strategyTickCallData = strategyTickResult[index];

    const strategyTicksResult =
      !strategyTickCallData.loading &&
      strategyTickCallData.result &&
      strategyTickCallData.result.length > 0
        ? strategyTickCallData.result
        : undefined;

    const tickLower = strategyTicksResult ? strategyTicksResult[0] : undefined;
    const tickUpper = strategyTicksResult ? strategyTicksResult[1] : undefined;

    const strategyItem = defiedgeStrategiesWithApr?.find(
      (e: any) =>
        e.strategy.address.toLowerCase() === strategy.id.toLowerCase(),
    );

    return {
      id: strategy.id,
      token0: strategy.token0,
      token1: strategy.token1,
      pool: strategy.pool,
      tickLower,
      tickUpper,
      onHold: !tickLower && !tickUpper,
      apr: strategyItem?.strategy?.fees_apr,
      ratio: liquidityRatios && liquidityRatios[index],
    };
  });

  return { isLoading, defiedgeStrategies };
}
