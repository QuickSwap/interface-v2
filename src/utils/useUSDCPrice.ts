import {
  ChainId,
  Currency,
  currencyEquals,
  JSBI,
  Price,
  WETH,
  Token,
} from '@uniswap/sdk';
import { useMemo } from 'react';
import { PairState, usePairs, usePair } from 'data/Reserves';
import { useActiveWeb3React } from 'hooks';
import { unwrappedToken, wrappedCurrency } from './wrappedCurrency';
import { returnTokenFromKey } from 'utils';
import { useDQUICKtoQUICK } from 'state/stake/hooks';

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
          : wrapped,
        chainId ? WETH[chainId] : undefined,
      ],
      [
        wrapped?.equals(returnTokenFromKey('QUICK')) ? undefined : wrapped,
        chainId === ChainId.MATIC ? returnTokenFromKey('QUICK') : undefined,
      ],
      [
        wrapped?.equals(returnTokenFromKey('USDC')) ? undefined : wrapped,
        chainId === ChainId.MATIC ? returnTokenFromKey('USDC') : undefined,
      ],
      [
        wrapped?.equals(returnTokenFromKey('USDT')) ? undefined : wrapped,
        chainId === ChainId.MATIC ? returnTokenFromKey('USDT') : undefined,
      ],
      [
        wrapped?.equals(returnTokenFromKey('DAI')) ? undefined : wrapped,
        chainId === ChainId.MATIC ? returnTokenFromKey('DAI') : undefined,
      ],
      [
        chainId ? WETH[chainId] : undefined,
        chainId === ChainId.MATIC ? returnTokenFromKey('USDC') : undefined,
      ],
      [
        chainId === ChainId.MATIC ? returnTokenFromKey('QUICK') : undefined,
        chainId === ChainId.MATIC ? returnTokenFromKey('USDC') : undefined,
      ],
    ],
    [chainId, wrapped],
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
          returnTokenFromKey('USDC'),
          price.denominator,
          price.numerator,
        );
      } else {
        return undefined;
      }
    }
    // handle usdc
    if (wrapped.equals(returnTokenFromKey('USDC'))) {
      return new Price(
        returnTokenFromKey('USDC'),
        returnTokenFromKey('USDC'),
        '1',
        '1',
      );
    }
    if (wrapped.equals(returnTokenFromKey('USDT'))) {
      return new Price(
        returnTokenFromKey('USDT'),
        returnTokenFromKey('USDT'),
        '1',
        '1',
      );
    }
    if (wrapped.equals(returnTokenFromKey('DAI'))) {
      return new Price(
        returnTokenFromKey('DAI'),
        returnTokenFromKey('DAI'),
        '1',
        '1',
      );
    }
    if (wrapped.equals(returnTokenFromKey('FRAX'))) {
      return new Price(
        returnTokenFromKey('FRAX'),
        returnTokenFromKey('FRAX'),
        '1',
        '1',
      );
    }
    if (wrapped.equals(returnTokenFromKey('MI'))) {
      return new Price(
        returnTokenFromKey('MI'),
        returnTokenFromKey('MI'),
        '1',
        '1',
      );
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
        .reserveOf(returnTokenFromKey('USDC'))
        .greaterThan(ethPairETHUSDCValue)
    ) {
      const price = usdcPair.priceOf(wrapped);
      return new Price(
        currency,
        returnTokenFromKey('USDC'),
        price.denominator,
        price.numerator,
      );
    }
    if (
      usdtPairState === PairState.EXISTS &&
      usdtPair &&
      usdtPair
        .reserveOf(returnTokenFromKey('USDT'))
        .greaterThan(ethPairETHUSDCValue)
    ) {
      const price = usdtPair.priceOf(wrapped);
      return new Price(
        currency,
        returnTokenFromKey('USDT'),
        price.denominator,
        price.numerator,
      );
    }
    if (
      daiPairState === PairState.EXISTS &&
      daiPair &&
      daiPair
        .reserveOf(returnTokenFromKey('DAI'))
        .greaterThan(ethPairETHUSDCValue)
    ) {
      const price = daiPair.priceOf(wrapped);
      return new Price(
        currency,
        returnTokenFromKey('DAI'),
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
        usdcEthPair.reserveOf(returnTokenFromKey('USDC')).greaterThan('0') &&
        ethPair.reserveOf(WETH[chainId]).greaterThan('1')
      ) {
        const ethUsdcPrice = usdcEthPair.priceOf(returnTokenFromKey('USDC'));
        const currencyEthPrice = ethPair.priceOf(WETH[chainId]);
        const usdcPrice = ethUsdcPrice.multiply(currencyEthPrice).invert();
        return new Price(
          currency,
          returnTokenFromKey('USDC'),
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
        usdcQuickPair.reserveOf(returnTokenFromKey('USDC')).greaterThan('0') &&
        quickPair.reserveOf(returnTokenFromKey('QUICK')).greaterThan('5')
      ) {
        const quickUsdcPrice = usdcQuickPair.priceOf(
          returnTokenFromKey('USDC'),
        );
        const currencyQuickPrice = quickPair.priceOf(
          returnTokenFromKey('QUICK'),
        );
        const usdcPrice = quickUsdcPrice.multiply(currencyQuickPrice).invert();
        return new Price(
          currency,
          returnTokenFromKey('USDC'),
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
      wrapped?.equals(returnTokenFromKey('QUICK')) ? undefined : wrapped,
      chainId === ChainId.MATIC ? returnTokenFromKey('QUICK') : undefined,
    ]);
    tokenPairs.push([
      wrapped?.equals(returnTokenFromKey('USDC')) ? undefined : wrapped,
      chainId === ChainId.MATIC ? returnTokenFromKey('USDC') : undefined,
    ]);
    tokenPairs.push([
      wrapped?.equals(returnTokenFromKey('USDT')) ? undefined : wrapped,
      chainId === ChainId.MATIC ? returnTokenFromKey('USDT') : undefined,
    ]);
    tokenPairs.push([
      wrapped?.equals(returnTokenFromKey('DAI')) ? undefined : wrapped,
      chainId === ChainId.MATIC ? returnTokenFromKey('DAI') : undefined,
    ]);
    tokenPairs.push([
      chainId ? WETH[chainId] : undefined,
      chainId === ChainId.MATIC ? returnTokenFromKey('USDC') : undefined,
    ]);
    tokenPairs.push([
      chainId ? returnTokenFromKey('QUICK') : undefined,
      chainId === ChainId.MATIC ? returnTokenFromKey('USDC') : undefined,
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
          returnTokenFromKey('USDC'),
          price.denominator,
          price.numerator,
        );
      } else {
        return undefined;
      }
    }
    // handle usdc
    if (wrapped.equals(returnTokenFromKey('USDC'))) {
      return new Price(
        returnTokenFromKey('USDC'),
        returnTokenFromKey('USDC'),
        '1',
        '1',
      );
    }
    if (wrapped.equals(returnTokenFromKey('USDT'))) {
      return new Price(
        returnTokenFromKey('USDT'),
        returnTokenFromKey('USDT'),
        '1',
        '1',
      );
    }
    if (wrapped.equals(returnTokenFromKey('DAI'))) {
      return new Price(
        returnTokenFromKey('DAI'),
        returnTokenFromKey('DAI'),
        '1',
        '1',
      );
    }
    if (wrapped.equals(returnTokenFromKey('FRAX'))) {
      return new Price(
        returnTokenFromKey('FRAX'),
        returnTokenFromKey('FRAX'),
        '1',
        '1',
      );
    }
    if (wrapped.equals(returnTokenFromKey('MI'))) {
      return new Price(
        returnTokenFromKey('MI'),
        returnTokenFromKey('MI'),
        '1',
        '1',
      );
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
        .reserveOf(returnTokenFromKey('USDC'))
        .greaterThan(ethPairETHUSDCValue)
    ) {
      const price = usdcPair.priceOf(wrapped);
      return new Price(
        currency,
        returnTokenFromKey('USDC'),
        price.denominator,
        price.numerator,
      );
    }
    if (
      usdtPairState === PairState.EXISTS &&
      usdtPair &&
      usdtPair
        .reserveOf(returnTokenFromKey('USDT'))
        .greaterThan(ethPairETHUSDCValue)
    ) {
      const price = usdtPair.priceOf(wrapped);
      return new Price(
        currency,
        returnTokenFromKey('USDT'),
        price.denominator,
        price.numerator,
      );
    }
    if (
      daiPairState === PairState.EXISTS &&
      daiPair &&
      daiPair
        .reserveOf(returnTokenFromKey('DAI'))
        .greaterThan(ethPairETHUSDCValue)
    ) {
      const price = daiPair.priceOf(wrapped);
      return new Price(
        currency,
        returnTokenFromKey('DAI'),
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
        usdcEthPair.reserveOf(returnTokenFromKey('USDC')).greaterThan('0') &&
        ethPair.reserveOf(WETH[chainId]).greaterThan('1')
      ) {
        const ethUsdcPrice = usdcEthPair.priceOf(returnTokenFromKey('USDC'));
        const currencyEthPrice = ethPair.priceOf(WETH[chainId]);
        const usdcPrice = ethUsdcPrice.multiply(currencyEthPrice).invert();
        return new Price(
          currency,
          returnTokenFromKey('USDC'),
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
        usdcQuickPair.reserveOf(returnTokenFromKey('USDC')).greaterThan('0') &&
        quickPair.reserveOf(returnTokenFromKey('QUICK')).greaterThan('5')
      ) {
        const quickUsdcPrice = usdcQuickPair.priceOf(
          returnTokenFromKey('USDC'),
        );
        const currencyQuickPrice = quickPair.priceOf(
          returnTokenFromKey('QUICK'),
        );
        const usdcPrice = quickUsdcPrice.multiply(currencyQuickPrice).invert();
        return new Price(
          currency,
          returnTokenFromKey('USDC'),
          usdcPrice.denominator,
          usdcPrice.numerator,
        );
      }
    }
    return undefined;
  });
}

export function useUSDCPricesToken(tokens: Token[]) {
  const dQUICKtoQUICK = useDQUICKtoQUICK();
  const [, quickUsdcPair] = usePair(
    returnTokenFromKey('QUICK'),
    returnTokenFromKey('USDC'),
  );
  const quickPrice = Number(
    quickUsdcPair?.priceOf(returnTokenFromKey('QUICK'))?.toSignificant(6) ?? 0,
  );
  const currencies = tokens.map((token) => unwrappedToken(token));
  const usdPrices = useUSDCPrices(currencies);
  return tokens.map((token, index) => {
    if (token.equals(returnTokenFromKey('DQUICK'))) {
      return dQUICKtoQUICK * quickPrice;
    } else if (token.equals(returnTokenFromKey('QUICK'))) {
      return quickPrice;
    } else {
      return Number(usdPrices[index]?.toSignificant(6) ?? 0);
    }
  });
}

export function useUSDCPriceToken(token: Token) {
  return useUSDCPricesToken([token])[0];
}
