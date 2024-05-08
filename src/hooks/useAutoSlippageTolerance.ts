import { JSBI, Trade as V2Trade, WETH } from '@uniswap/sdk';
import { Currency, Percent, TradeType } from '@uniswap/sdk-core';
import { useActiveWeb3React } from 'hooks';
import { Trade as V3Trade } from 'lib/src/trade';
import { useMemo } from 'react';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';
import useGasPrice from './useGasPrice';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import { formatUnits } from 'ethers/lib/utils';
import { OptimalRate } from '@paraswap/sdk';
import { Percent as V2Percent } from '@uniswap/sdk';

const DEFAULT_AUTO_SLIPPAGE = new Percent(5, 1000);
const MIN_AUTO_SLIPPAGE_TOLERANCE = DEFAULT_AUTO_SLIPPAGE;
const MAX_AUTO_SLIPPAGE_TOLERANCE = new Percent(5, 100);

const DEFAULT_AUTO_SLIPPAGE_V2 = new V2Percent('5', '1000');
const MIN_AUTO_SLIPPAGE_TOLERANCE_V2 = DEFAULT_AUTO_SLIPPAGE_V2;
const MAX_AUTO_SLIPPAGE_TOLERANCE_V2 = new V2Percent('5', '100');

// Base costs regardless of how many hops in the route
const V3_SWAP_BASE_GAS_ESTIMATE = 100_000;
const V2_SWAP_BASE_GAS_ESTIMATE = 135_000;

// Extra cost per hop in the route
const V3_SWAP_HOP_GAS_ESTIMATE = 70_000;
const V2_SWAP_HOP_GAS_ESTIMATE = 50_000;

function guesstimateGas(
  trade: V2Trade | V3Trade<Currency, Currency, TradeType> | null | undefined,
): number | undefined {
  if (trade) {
    let gas = 0;
    if (trade instanceof V3Trade) {
      for (const { route } of trade.swaps) {
        gas +=
          V3_SWAP_BASE_GAS_ESTIMATE +
          route.pools.length * V3_SWAP_HOP_GAS_ESTIMATE;
      }
    } else {
      gas +=
        V2_SWAP_BASE_GAS_ESTIMATE +
        trade.route.pairs.length * V2_SWAP_HOP_GAS_ESTIMATE;
    }
    return gas;
  }

  return undefined;
}

export function useAutoSlippageTolerance(
  trade?: V2Trade | V3Trade<Currency, Currency, TradeType> | null,
): Percent {
  const { chainId } = useActiveWeb3React();
  const outputToken =
    trade instanceof V2Trade
      ? wrappedCurrency(trade?.outputAmount.currency, chainId)
      : trade?.outputAmount.currency.wrapped;
  const outputTokenUSDPrice = useUSDCPriceFromAddress(outputToken?.address);
  const outputUSD =
    Number(trade?.outputAmount.toExact()) * outputTokenUSDPrice.price;

  const nativeGasPrice = useGasPrice();
  const gasEstimate = guesstimateGas(trade);
  const nativeGasCost =
    nativeGasPrice && gasEstimate
      ? JSBI.multiply(nativeGasPrice, JSBI.BigInt(gasEstimate))
      : undefined;
  const nativeUSDPrice = useUSDCPriceFromAddress(WETH[chainId].address);
  const gasCostUSD = nativeGasCost
    ? Number(formatUnits(nativeGasCost.toString(), WETH[chainId].decimals)) *
      nativeUSDPrice.price
    : undefined;

  return useMemo(() => {
    if (!trade) return DEFAULT_AUTO_SLIPPAGE;

    if (outputUSD && gasCostUSD) {
      const result = new Percent(
        ((gasCostUSD / outputUSD) * 10000).toFixed(0),
        10000,
      );
      if (result.greaterThan(MAX_AUTO_SLIPPAGE_TOLERANCE)) {
        return MAX_AUTO_SLIPPAGE_TOLERANCE;
      }

      if (result.lessThan(MIN_AUTO_SLIPPAGE_TOLERANCE)) {
        return MIN_AUTO_SLIPPAGE_TOLERANCE;
      }

      return result;
    }

    return DEFAULT_AUTO_SLIPPAGE;
  }, [trade, outputUSD, gasCostUSD]);
}

export function useAutoSlippageToleranceBestTrade(
  trade?: OptimalRate,
): V2Percent {
  return useMemo(() => {
    if (!trade) return DEFAULT_AUTO_SLIPPAGE_V2;

    if (trade && Number(trade.destUSD) > 0) {
      const result = new V2Percent(
        ((Number(trade.gasCostUSD) / Number(trade.destUSD)) * 10000).toFixed(0),
        JSBI.BigInt(10000),
      );
      if (result.greaterThan(MAX_AUTO_SLIPPAGE_TOLERANCE_V2)) {
        return MAX_AUTO_SLIPPAGE_TOLERANCE_V2;
      }

      if (result.lessThan(MIN_AUTO_SLIPPAGE_TOLERANCE_V2)) {
        return MIN_AUTO_SLIPPAGE_TOLERANCE_V2;
      }

      return result;
    }

    return DEFAULT_AUTO_SLIPPAGE_V2;
  }, [trade]);
}
