import {
  ChainId,
  Currency,
  currencyEquals,
  JSBI,
  Price,
  WETH,
} from '@uniswap/sdk';
import { useMemo } from 'react';
import { GlobalConst } from 'constants/index';
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
        wrapped?.equals(GlobalConst.tokens.QUICK) ? undefined : wrapped,
        chainId === ChainId.MATIC ? GlobalConst.tokens.QUICK : undefined,
      ],
      [
        wrapped?.equals(GlobalConst.tokens.USDC) ? undefined : wrapped,
        chainId === ChainId.MATIC ? GlobalConst.tokens.USDC : undefined,
      ],
      [
        wrapped?.equals(GlobalConst.tokens.USDT) ? undefined : wrapped,
        chainId === ChainId.MATIC ? GlobalConst.tokens.USDT : undefined,
      ],
      [
        wrapped?.equals(GlobalConst.tokens.DAI) ? undefined : wrapped,
        chainId === ChainId.MATIC ? GlobalConst.tokens.DAI : undefined,
      ],
      [
        chainId ? WETH[chainId] : undefined,
        chainId === ChainId.MATIC ? GlobalConst.tokens.USDC : undefined,
      ],
      [
        chainId ? GlobalConst.tokens.QUICK : undefined,
        chainId === ChainId.MATIC ? GlobalConst.tokens.USDC : undefined,
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
        return new Price(
          currency,
          GlobalConst.tokens.USDC,
          price.denominator,
          price.numerator,
        );
      } else {
        return undefined;
      }
    }
    // handle usdc
    if (wrapped.equals(GlobalConst.tokens.USDC)) {
      return new Price(
        GlobalConst.tokens.USDC,
        GlobalConst.tokens.USDC,
        '1',
        '1',
      );
    }
    if (wrapped.equals(GlobalConst.tokens.USDT)) {
      return new Price(
        GlobalConst.tokens.USDT,
        GlobalConst.tokens.USDT,
        '1',
        '1',
      );
    }
    if (wrapped.equals(GlobalConst.tokens.DAI)) {
      return new Price(
        GlobalConst.tokens.DAI,
        GlobalConst.tokens.DAI,
        '1',
        '1',
      );
    }
    if (wrapped.equals(GlobalConst.tokens.FRAX)) {
      return new Price(
        GlobalConst.tokens.FRAX,
        GlobalConst.tokens.FRAX,
        '1',
        '1',
      );
    }
    if (wrapped.equals(GlobalConst.tokens.MI)) {
      return new Price(GlobalConst.tokens.MI, GlobalConst.tokens.MI, '1', '1');
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
      usdcPair
        .reserveOf(GlobalConst.tokens.USDC)
        .greaterThan(ethPairETHUSDCValue)
    ) {
      const price = usdcPair.priceOf(wrapped);
      return new Price(
        currency,
        GlobalConst.tokens.USDC,
        price.denominator,
        price.numerator,
      );
    }
    if (
      usdtPairState === PairState.EXISTS &&
      usdtPair &&
      usdtPair
        .reserveOf(GlobalConst.tokens.USDT)
        .greaterThan(ethPairETHUSDCValue)
    ) {
      const price = usdtPair.priceOf(wrapped);
      return new Price(
        currency,
        GlobalConst.tokens.USDT,
        price.denominator,
        price.numerator,
      );
    }
    if (
      daiPairState === PairState.EXISTS &&
      daiPair &&
      daiPair.reserveOf(GlobalConst.tokens.DAI).greaterThan(ethPairETHUSDCValue)
    ) {
      const price = daiPair.priceOf(wrapped);
      return new Price(
        currency,
        GlobalConst.tokens.DAI,
        price.denominator,
        price.numerator,
      );
    }
    if (
      ethPairState === PairState.EXISTS &&
      ethPair &&
      usdcEthPairState === PairState.EXISTS &&
      usdcEthPair
    ) {
      if (
        usdcEthPair.reserveOf(GlobalConst.tokens.USDC).greaterThan('0') &&
        ethPair.reserveOf(WETH[chainId]).greaterThan('1')
      ) {
        const ethUsdcPrice = usdcEthPair.priceOf(GlobalConst.tokens.USDC);
        const currencyEthPrice = ethPair.priceOf(WETH[chainId]);
        const usdcPrice = ethUsdcPrice.multiply(currencyEthPrice).invert();
        return new Price(
          currency,
          GlobalConst.tokens.USDC,
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
        usdcQuickPair.reserveOf(GlobalConst.tokens.USDC).greaterThan('0') &&
        quickPair.reserveOf(GlobalConst.tokens.QUICK).greaterThan('5')
      ) {
        const quickUsdcPrice = usdcQuickPair.priceOf(GlobalConst.tokens.USDC);
        const currencyQuickPrice = quickPair.priceOf(GlobalConst.tokens.QUICK);
        const usdcPrice = quickUsdcPrice.multiply(currencyQuickPrice).invert();
        return new Price(
          currency,
          GlobalConst.tokens.USDC,
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
      wrapped?.equals(GlobalConst.tokens.QUICK) ? undefined : wrapped,
      chainId === ChainId.MATIC ? GlobalConst.tokens.QUICK : undefined,
    ]);
    tokenPairs.push([
      wrapped?.equals(GlobalConst.tokens.USDC) ? undefined : wrapped,
      chainId === ChainId.MATIC ? GlobalConst.tokens.USDC : undefined,
    ]);
    tokenPairs.push([
      wrapped?.equals(GlobalConst.tokens.USDT) ? undefined : wrapped,
      chainId === ChainId.MATIC ? GlobalConst.tokens.USDT : undefined,
    ]);
    tokenPairs.push([
      wrapped?.equals(GlobalConst.tokens.DAI) ? undefined : wrapped,
      chainId === ChainId.MATIC ? GlobalConst.tokens.DAI : undefined,
    ]);
    tokenPairs.push([
      chainId ? WETH[chainId] : undefined,
      chainId === ChainId.MATIC ? GlobalConst.tokens.USDC : undefined,
    ]);
    tokenPairs.push([
      chainId ? GlobalConst.tokens.QUICK : undefined,
      chainId === ChainId.MATIC ? GlobalConst.tokens.USDC : undefined,
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
        return new Price(
          currency,
          GlobalConst.tokens.USDC,
          price.denominator,
          price.numerator,
        );
      } else {
        return undefined;
      }
    }
    // handle usdc
    if (wrapped.equals(GlobalConst.tokens.USDC)) {
      return new Price(
        GlobalConst.tokens.USDC,
        GlobalConst.tokens.USDC,
        '1',
        '1',
      );
    }
    if (wrapped.equals(GlobalConst.tokens.USDT)) {
      return new Price(
        GlobalConst.tokens.USDT,
        GlobalConst.tokens.USDT,
        '1',
        '1',
      );
    }
    if (wrapped.equals(GlobalConst.tokens.DAI)) {
      return new Price(
        GlobalConst.tokens.DAI,
        GlobalConst.tokens.DAI,
        '1',
        '1',
      );
    }
    if (wrapped.equals(GlobalConst.tokens.FRAX)) {
      return new Price(
        GlobalConst.tokens.FRAX,
        GlobalConst.tokens.FRAX,
        '1',
        '1',
      );
    }
    if (wrapped.equals(GlobalConst.tokens.MI)) {
      return new Price(GlobalConst.tokens.MI, GlobalConst.tokens.MI, '1', '1');
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
      usdcPair
        .reserveOf(GlobalConst.tokens.USDC)
        .greaterThan(ethPairETHUSDCValue)
    ) {
      const price = usdcPair.priceOf(wrapped);
      return new Price(
        currency,
        GlobalConst.tokens.USDC,
        price.denominator,
        price.numerator,
      );
    }
    if (
      usdtPairState === PairState.EXISTS &&
      usdtPair &&
      usdtPair
        .reserveOf(GlobalConst.tokens.USDT)
        .greaterThan(ethPairETHUSDCValue)
    ) {
      const price = usdtPair.priceOf(wrapped);
      return new Price(
        currency,
        GlobalConst.tokens.USDT,
        price.denominator,
        price.numerator,
      );
    }
    if (
      daiPairState === PairState.EXISTS &&
      daiPair &&
      daiPair.reserveOf(GlobalConst.tokens.DAI).greaterThan(ethPairETHUSDCValue)
    ) {
      const price = daiPair.priceOf(wrapped);
      return new Price(
        currency,
        GlobalConst.tokens.DAI,
        price.denominator,
        price.numerator,
      );
    }
    if (
      ethPairState === PairState.EXISTS &&
      ethPair &&
      usdcEthPairState === PairState.EXISTS &&
      usdcEthPair
    ) {
      if (
        usdcEthPair.reserveOf(GlobalConst.tokens.USDC).greaterThan('0') &&
        ethPair.reserveOf(WETH[chainId]).greaterThan('1')
      ) {
        const ethUsdcPrice = usdcEthPair.priceOf(GlobalConst.tokens.USDC);
        const currencyEthPrice = ethPair.priceOf(WETH[chainId]);
        const usdcPrice = ethUsdcPrice.multiply(currencyEthPrice).invert();
        return new Price(
          currency,
          GlobalConst.tokens.USDC,
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
        usdcQuickPair.reserveOf(GlobalConst.tokens.USDC).greaterThan('0') &&
        quickPair.reserveOf(GlobalConst.tokens.QUICK).greaterThan('5')
      ) {
        const quickUsdcPrice = usdcQuickPair.priceOf(GlobalConst.tokens.USDC);
        const currencyQuickPrice = quickPair.priceOf(GlobalConst.tokens.QUICK);
        const usdcPrice = quickUsdcPrice.multiply(currencyQuickPrice).invert();
        return new Price(
          currency,
          GlobalConst.tokens.USDC,
          usdcPrice.denominator,
          usdcPrice.numerator,
        );
      }
    }
    return undefined;
  });
}
