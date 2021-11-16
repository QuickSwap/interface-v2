import {
  ChainId,
  Currency,
  currencyEquals,
  JSBI,
  Price,
  WETH,
} from '@uniswap/sdk';
import { useMemo } from 'react';
import { USDC, USDT, DAI, FRAX, QUICK } from 'constants/index';
import { PairState, usePairs } from 'data/Reserves';
import { useActiveWeb3React } from 'hooks';
import { wrappedCurrency } from './wrappedCurrency';

/**
 * Returns the price in USDC of the input currency
 * @param currency currency to compute the USDC price of
 */
export default function useUSDCPrice(currency?: Currency): Price | undefined {
  const { chainId } = useActiveWeb3React();
  const wrapped = wrappedCurrency(currency, chainId);
  const tokenPairs: [Currency | undefined, Currency | undefined][] = useMemo(
    () => [
      [
        chainId && wrapped && currencyEquals(WETH[chainId], wrapped)
          ? undefined
          : currency,
        chainId ? WETH[chainId] : undefined,
      ],
      [
        wrapped?.equals(QUICK) ? undefined : wrapped,
        chainId === ChainId.MATIC ? QUICK : undefined,
      ],
      [
        wrapped?.equals(USDC) ? undefined : wrapped,
        chainId === ChainId.MATIC ? USDC : undefined,
      ],
      [
        wrapped?.equals(USDT) ? undefined : wrapped,
        chainId === ChainId.MATIC ? USDT : undefined,
      ],
      [
        wrapped?.equals(DAI) ? undefined : wrapped,
        chainId === ChainId.MATIC ? DAI : undefined,
      ],
      [
        chainId ? WETH[chainId] : undefined,
        chainId === ChainId.MATIC ? USDC : undefined,
      ],
      [
        chainId ? QUICK : undefined,
        chainId === ChainId.MATIC ? USDC : undefined,
      ],
    ],
    [chainId, currency, wrapped],
  );
  const [
    [ethPairState, ethPair],
    [quickPairState, quickPair],
    [usdcPairState, usdcPair],
    [usdtPairState, usdtPair],
    [daiPairState, daiPair],
    [usdcEthPairState, usdcEthPair],
    [usdcQuickPairState, usdcQuickPair],
  ] = usePairs(tokenPairs);

  return useMemo(() => {
    if (!currency || !wrapped || !chainId) {
      return undefined;
    }
    // handle weth/eth
    if (wrapped.equals(WETH[chainId])) {
      if (usdcPair) {
        const price = usdcPair.priceOf(WETH[chainId]);
        return new Price(currency, USDC, price.denominator, price.numerator);
      } else {
        return undefined;
      }
    }
    // handle usdc
    if (wrapped.equals(USDC)) {
      return new Price(USDC, USDC, '1', '1');
    }
    if (wrapped.equals(USDT)) {
      return new Price(USDT, USDT, '1', '1');
    }
    if (wrapped.equals(DAI)) {
      return new Price(DAI, DAI, '1', '1');
    }
    if (wrapped.equals(FRAX)) {
      return new Price(FRAX, FRAX, '1', '1');
    }

    const ethPairETHAmount = ethPair?.reserveOf(WETH[chainId]);
    const ethPairETHUSDCValue: JSBI =
      ethPairETHAmount && usdcEthPair
        ? usdcEthPair.priceOf(WETH[chainId]).quote(ethPairETHAmount).raw
        : JSBI.BigInt(0);

    // all other tokens
    // first try the usdc pair
    if (
      usdcPairState === PairState.EXISTS &&
      usdcPair &&
      usdcPair.reserveOf(USDC).greaterThan(ethPairETHUSDCValue)
    ) {
      const price = usdcPair.priceOf(wrapped);
      return new Price(currency, USDC, price.denominator, price.numerator);
    }
    if (
      usdtPairState === PairState.EXISTS &&
      usdtPair &&
      usdtPair.reserveOf(USDT).greaterThan(ethPairETHUSDCValue)
    ) {
      const price = usdtPair.priceOf(wrapped);
      return new Price(currency, USDT, price.denominator, price.numerator);
    }
    if (
      daiPairState === PairState.EXISTS &&
      daiPair &&
      daiPair.reserveOf(DAI).greaterThan(ethPairETHUSDCValue)
    ) {
      const price = daiPair.priceOf(wrapped);
      return new Price(currency, DAI, price.denominator, price.numerator);
    }
    if (
      ethPairState === PairState.EXISTS &&
      ethPair &&
      usdcEthPairState === PairState.EXISTS &&
      usdcEthPair
    ) {
      if (
        usdcEthPair.reserveOf(USDC).greaterThan('0') &&
        ethPair.reserveOf(WETH[chainId]).greaterThan('1')
      ) {
        const ethUsdcPrice = usdcEthPair.priceOf(USDC);
        const currencyEthPrice = ethPair.priceOf(WETH[chainId]);
        const usdcPrice = ethUsdcPrice.multiply(currencyEthPrice).invert();
        return new Price(
          currency,
          USDC,
          usdcPrice.denominator,
          usdcPrice.numerator,
        );
      }
    }
    if (
      quickPairState === PairState.EXISTS &&
      quickPair &&
      usdcQuickPairState === PairState.EXISTS &&
      usdcQuickPair
    ) {
      if (
        usdcQuickPair.reserveOf(USDC).greaterThan('0') &&
        quickPair.reserveOf(QUICK).greaterThan('5')
      ) {
        const quickUsdcPrice = usdcQuickPair.priceOf(USDC);
        const currencyQuickPrice = quickPair.priceOf(QUICK);
        const usdcPrice = quickUsdcPrice.multiply(currencyQuickPrice).invert();
        return new Price(
          currency,
          USDC,
          usdcPrice.denominator,
          usdcPrice.numerator,
        );
      }
    }
    return undefined;
  }, [
    chainId,
    currency,
    ethPair,
    ethPairState,
    usdcEthPair,
    usdcEthPairState,
    usdcPair,
    usdcPairState,
    wrapped,
    daiPair,
    daiPairState,
    quickPair,
    quickPairState,
    usdcQuickPair,
    usdcQuickPairState,
    usdtPair,
    usdtPairState,
  ]);
}

export function useUSDCPrices(currencies: Currency[]): (Price | undefined)[] {
  const { chainId } = useActiveWeb3React();
  const wrappedCurrencies = currencies.map((currency) =>
    wrappedCurrency(currency, chainId),
  );
  const tokenPairs: [Currency | undefined, Currency | undefined][] = [];
  wrappedCurrencies.forEach((wrapped, ind) => {
    tokenPairs.push([
      chainId && wrapped && currencyEquals(WETH[chainId], wrapped)
        ? undefined
        : currencies[ind],
      chainId ? WETH[chainId] : undefined,
    ]);
    tokenPairs.push([
      wrapped?.equals(QUICK) ? undefined : wrapped,
      chainId === ChainId.MATIC ? QUICK : undefined,
    ]);
    tokenPairs.push([
      wrapped?.equals(USDC) ? undefined : wrapped,
      chainId === ChainId.MATIC ? USDC : undefined,
    ]);
    tokenPairs.push([
      wrapped?.equals(USDT) ? undefined : wrapped,
      chainId === ChainId.MATIC ? USDT : undefined,
    ]);
    tokenPairs.push([
      wrapped?.equals(DAI) ? undefined : wrapped,
      chainId === ChainId.MATIC ? DAI : undefined,
    ]);
    tokenPairs.push([
      chainId ? WETH[chainId] : undefined,
      chainId === ChainId.MATIC ? USDC : undefined,
    ]);
    tokenPairs.push([
      chainId ? QUICK : undefined,
      chainId === ChainId.MATIC ? USDC : undefined,
    ]);
  });
  const pairs = usePairs(tokenPairs);
  const remainPairs = currencies.map((_, index) => {
    return pairs.slice(7 * index, 7 * (index + 1));
  });

  return currencies.map((currency, index) => {
    const [
      [ethPairState, ethPair],
      [quickPairState, quickPair],
      [usdcPairState, usdcPair],
      [usdtPairState, usdtPair],
      [daiPairState, daiPair],
      [usdcEthPairState, usdcEthPair],
      [usdcQuickPairState, usdcQuickPair],
    ] = remainPairs[index];
    const wrapped = wrappedCurrencies[index];
    if (!wrapped || !chainId) {
      return undefined;
    }
    if (wrapped.equals(WETH[chainId])) {
      if (usdcPair) {
        const price = usdcPair.priceOf(WETH[chainId]);
        return new Price(currency, USDC, price.denominator, price.numerator);
      } else {
        return undefined;
      }
    }
    // handle usdc
    if (wrapped.equals(USDC)) {
      return new Price(USDC, USDC, '1', '1');
    }
    if (wrapped.equals(USDT)) {
      return new Price(USDT, USDT, '1', '1');
    }
    if (wrapped.equals(DAI)) {
      return new Price(DAI, DAI, '1', '1');
    }
    if (wrapped.equals(FRAX)) {
      return new Price(FRAX, FRAX, '1', '1');
    }

    const ethPairETHAmount = ethPair?.reserveOf(WETH[chainId]);
    const ethPairETHUSDCValue: JSBI =
      ethPairETHAmount && usdcEthPair
        ? usdcEthPair.priceOf(WETH[chainId]).quote(ethPairETHAmount).raw
        : JSBI.BigInt(0);

    // all other tokens
    // first try the usdc pair
    if (
      usdcPairState === PairState.EXISTS &&
      usdcPair &&
      usdcPair.reserveOf(USDC).greaterThan(ethPairETHUSDCValue)
    ) {
      const price = usdcPair.priceOf(wrapped);
      return new Price(currency, USDC, price.denominator, price.numerator);
    }
    if (
      usdtPairState === PairState.EXISTS &&
      usdtPair &&
      usdtPair.reserveOf(USDT).greaterThan(ethPairETHUSDCValue)
    ) {
      const price = usdtPair.priceOf(wrapped);
      return new Price(currency, USDT, price.denominator, price.numerator);
    }
    if (
      daiPairState === PairState.EXISTS &&
      daiPair &&
      daiPair.reserveOf(DAI).greaterThan(ethPairETHUSDCValue)
    ) {
      const price = daiPair.priceOf(wrapped);
      return new Price(currency, DAI, price.denominator, price.numerator);
    }
    if (
      ethPairState === PairState.EXISTS &&
      ethPair &&
      usdcEthPairState === PairState.EXISTS &&
      usdcEthPair
    ) {
      if (
        usdcEthPair.reserveOf(USDC).greaterThan('0') &&
        ethPair.reserveOf(WETH[chainId]).greaterThan('1')
      ) {
        const ethUsdcPrice = usdcEthPair.priceOf(USDC);
        const currencyEthPrice = ethPair.priceOf(WETH[chainId]);
        const usdcPrice = ethUsdcPrice.multiply(currencyEthPrice).invert();
        return new Price(
          currency,
          USDC,
          usdcPrice.denominator,
          usdcPrice.numerator,
        );
      }
    }
    if (
      quickPairState === PairState.EXISTS &&
      quickPair &&
      usdcQuickPairState === PairState.EXISTS &&
      usdcQuickPair
    ) {
      if (
        usdcQuickPair.reserveOf(USDC).greaterThan('0') &&
        quickPair.reserveOf(QUICK).greaterThan('5')
      ) {
        const quickUsdcPrice = usdcQuickPair.priceOf(USDC);
        const currencyQuickPrice = quickPair.priceOf(QUICK);
        const usdcPrice = quickUsdcPrice.multiply(currencyQuickPrice).invert();
        return new Price(
          currency,
          USDC,
          usdcPrice.denominator,
          usdcPrice.numerator,
        );
      }
    }
    return undefined;
  });
}
