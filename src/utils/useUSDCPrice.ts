import {
  ChainId,
  Currency,
  currencyEquals,
  Price,
  WETH,
  Token,
  Trade,
} from '@uniswap/sdk';
import { useEffect, useMemo, useState } from 'react';
import { PairState, usePairs, usePair } from 'data/Reserves';
import { useActiveWeb3React } from 'hooks';
import { unwrappedToken, wrappedCurrency } from './wrappedCurrency';
import { useDQUICKtoQUICK } from 'state/stake/hooks';
import { GlobalValue } from 'constants/index';
import { useAllCommonPairs } from 'hooks/Trades';
import { tryParseAmount } from 'state/swap/hooks';
import { useEthPrice, useMaticPrice } from 'state/application/hooks';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { clientV2, clientV3 } from 'apollo/client';
import { TOKEN_PRICES_V2 } from 'apollo/queries';
import { TOKENPRICES_FROM_ADDRESSES_V3 } from 'apollo/queries-v3';

dayjs.extend(utc);
dayjs.extend(weekOfYear);

export default function useUSDCPrice(currency?: Currency): Price | undefined {
  const { chainId } = useActiveWeb3React();

  const amountOut = chainId
    ? tryParseAmount('1', GlobalValue.tokens.COMMON.USDC)
    : undefined;

  const allowedPairs = useAllCommonPairs(
    currency,
    GlobalValue.tokens.COMMON.USDC,
  );

  return useMemo(() => {
    if (!currency || !amountOut || !allowedPairs.length) {
      return undefined;
    }

    const trade =
      Trade.bestTradeExactOut(allowedPairs, currency, amountOut, {
        maxHops: 3,
        maxNumResults: 1,
      })[0] ?? null;

    if (!trade) return;

    const { numerator, denominator } = trade.route.midPrice;

    return new Price(
      currency,
      GlobalValue.tokens.COMMON.USDC,
      denominator,
      numerator,
    );
  }, [currency, allowedPairs, amountOut]);
}

export function useUSDCPricesFromAddresses(addresses: string[]) {
  const { ethPrice } = useEthPrice();
  const { maticPrice } = useMaticPrice();
  const [prices, setPrices] = useState<
    { address: string; price: number }[] | undefined
  >();

  useEffect(() => {
    (async () => {
      if (ethPrice.price && maticPrice.price) {
        const pricesDataV2 = await clientV2.query({
          query: TOKEN_PRICES_V2(addresses),
          fetchPolicy: 'network-only',
        });

        const pricesV2 =
          pricesDataV2.data &&
          pricesDataV2.data.tokens &&
          pricesDataV2.data.tokens.length > 0
            ? pricesDataV2.data.tokens
            : [];

        const addressesNotInV2 = addresses.filter((address) => {
          const priceV2 = pricesV2.find(
            (item: any) => item.id.toLowerCase() === address.toLowerCase(),
          );
          return !priceV2 || !priceV2.derivedETH || !Number(priceV2.derivedETH);
        });

        const pricesDataV3 = await clientV3.query({
          query: TOKENPRICES_FROM_ADDRESSES_V3(
            addressesNotInV2.map((address) => address.toLowerCase()),
          ),
          fetchPolicy: 'network-only',
        });

        const pricesV3 =
          pricesDataV3.data &&
          pricesDataV3.data.tokens &&
          pricesDataV3.data.tokens.length > 0
            ? pricesDataV3.data.tokens
            : [];

        const prices = addresses.map((address) => {
          const priceV2 = pricesV2.find(
            (item: any) => item.id.toLowerCase() === address.toLowerCase(),
          );
          if (priceV2 && priceV2.derivedETH && Number(priceV2.derivedETH)) {
            return {
              address,
              price: (ethPrice.price ?? 0) * Number(priceV2.derivedETH),
            };
          } else {
            const priceV3 = pricesV3.find(
              (item: any) => item.id.toLowerCase() === address.toLowerCase(),
            );
            if (
              priceV3 &&
              priceV3.derivedMatic &&
              Number(priceV3.derivedMatic)
            ) {
              return {
                address,
                price: (maticPrice.price ?? 0) * Number(priceV3.derivedMatic),
              };
            }
            return { address, price: 0 };
          }
        });
        setPrices(prices);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ethPrice.price, maticPrice.price]);

  return prices;
}

//TODO: the majority of these functions share alot of common logic,
//There also seems to be bugs, sometimes the CXETH Pair returns CXEth, sometimes ETH
//Investigate more fully
export function useUSDCPrices(currencies: Currency[]): (Price | undefined)[] {
  const { chainId } = useActiveWeb3React();
  const oldQuickToken = GlobalValue.tokens.COMMON.OLD_QUICK;
  const usdcToken = GlobalValue.tokens.COMMON.USDC;
  const usdtToken = GlobalValue.tokens.COMMON.USDT;
  const daiToken = GlobalValue.tokens.COMMON.DAI;
  const cxETHToken = GlobalValue.tokens.COMMON.CXETH;
  const ETHToken = GlobalValue.tokens.COMMON.CXETH;
  const wrappedCurrencies = currencies.map((currency) => {
    let wrapped = wrappedCurrency(currency, chainId);
    if (wrapped?.equals(cxETHToken)) {
      wrapped = wrappedCurrency(ETHToken, chainId);
    }
    return wrapped;
  });
  const tokenPairs: [Currency | undefined, Currency | undefined][] = [];
  wrappedCurrencies.forEach((wrapped, ind) => {
    tokenPairs.push([
      chainId && wrapped && currencyEquals(WETH[chainId], wrapped)
        ? undefined
        : currencies[ind],
      chainId ? WETH[chainId] : undefined,
    ]);
    tokenPairs.push([
      wrapped?.equals(oldQuickToken) ? undefined : wrapped,
      chainId === ChainId.MATIC ? oldQuickToken : undefined,
    ]);
    tokenPairs.push([
      wrapped?.equals(usdcToken) ? undefined : wrapped,
      chainId === ChainId.MATIC ? usdcToken : undefined,
    ]);
    tokenPairs.push([
      wrapped?.equals(usdtToken) ? undefined : wrapped,
      chainId === ChainId.MATIC ? usdtToken : undefined,
    ]);
    tokenPairs.push([
      wrapped?.equals(daiToken) ? undefined : wrapped,
      chainId === ChainId.MATIC ? daiToken : undefined,
    ]);
    tokenPairs.push([
      chainId ? WETH[chainId] : undefined,
      chainId === ChainId.MATIC ? usdcToken : undefined,
    ]);
    tokenPairs.push([
      chainId ? oldQuickToken : undefined,
      chainId === ChainId.MATIC ? usdcToken : undefined,
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
    const internalWrapped = wrappedCurrency(currency, chainId);
    if (!wrapped || !chainId) {
      return undefined;
    }
    if (wrapped.equals(WETH[chainId])) {
      if (usdcPair) {
        const price = usdcPair.priceOf(WETH[chainId]);
        return new Price(
          currency,
          usdcToken,
          price.denominator,
          price.numerator,
        );
      } else {
        return undefined;
      }
    }
    // handle usdc
    if (wrapped.equals(usdcToken)) {
      return new Price(usdcToken, usdcToken, '1', '1');
    }

    // all other tokens
    // first try the usdc pair
    if (usdcPairState === PairState.EXISTS && usdcPair) {
      const price = usdcPair.priceOf(wrapped);
      if (internalWrapped?.equals(cxETHToken)) {
        return new Price(
          cxETHToken,
          usdcToken,
          price.denominator,
          price.numerator,
        );
      }
      return new Price(currency, usdcToken, price.denominator, price.numerator);
    }
    if (usdtPairState === PairState.EXISTS && usdtPair) {
      const price = usdtPair.priceOf(wrapped);
      return new Price(currency, usdtToken, price.denominator, price.numerator);
    }
    if (daiPairState === PairState.EXISTS && daiPair) {
      const price = daiPair.priceOf(wrapped);
      return new Price(currency, daiToken, price.denominator, price.numerator);
    }
    if (
      ethPairState === PairState.EXISTS &&
      ethPair &&
      usdcEthPairState === PairState.EXISTS &&
      usdcEthPair
    ) {
      if (
        usdcEthPair.reserveOf(usdcToken).greaterThan('0') &&
        ethPair.reserveOf(WETH[chainId]).greaterThan('1')
      ) {
        const ethUsdcPrice = usdcEthPair.priceOf(usdcToken);
        const currencyEthPrice = ethPair.priceOf(WETH[chainId]);
        const usdcPrice = ethUsdcPrice.multiply(currencyEthPrice).invert();
        return new Price(
          currency,
          usdcToken,
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
        usdcQuickPair.reserveOf(usdcToken).greaterThan('0') &&
        quickPair.reserveOf(oldQuickToken).greaterThan('5')
      ) {
        const quickUsdcPrice = usdcQuickPair.priceOf(usdcToken);
        const currencyQuickPrice = quickPair.priceOf(oldQuickToken);
        const usdcPrice = quickUsdcPrice.multiply(currencyQuickPrice).invert();
        return new Price(
          currency,
          usdcToken,
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
  const oldQuickToken = GlobalValue.tokens.COMMON.OLD_QUICK;
  const oldDQuickToken = GlobalValue.tokens.COMMON.OLD_DQUICK;
  const newQuickToken = GlobalValue.tokens.COMMON.NEW_QUICK;
  const newDQuickToken = GlobalValue.tokens.COMMON.NEW_DQUICK;
  const usdcToken = GlobalValue.tokens.COMMON.USDC;
  const [, quickUsdcPair] = usePair(oldQuickToken, usdcToken);
  const [, newQuickUsdcPair] = usePair(newQuickToken, usdcToken);
  const quickPrice = Number(
    quickUsdcPair?.priceOf(oldQuickToken)?.toSignificant(6) ?? 0,
  );
  const newQuickPrice = Number(
    newQuickUsdcPair?.priceOf(newQuickToken)?.toSignificant(6) ?? 0,
  );
  const filteredTokens = tokens
    .filter((item, pos, self) => {
      return self.findIndex((token) => token.equals(item)) == pos;
    })
    .filter(
      (token) =>
        !token.equals(oldQuickToken) &&
        !token.equals(newQuickToken) &&
        !token.equals(oldDQuickToken) &&
        !token.equals(newDQuickToken),
    );
  const currencies = filteredTokens.map((token) => unwrappedToken(token));
  const usdPrices = useUSDCPrices(currencies);
  const usdPricesWithToken = filteredTokens.map((token, index) => {
    return { token, price: Number(usdPrices[index]?.toSignificant(6) ?? 0) };
  });
  return tokens.map((token) => {
    if (token.equals(oldDQuickToken)) {
      return dQUICKtoQUICK * quickPrice;
    } else if (token.equals(oldQuickToken)) {
      return quickPrice;
    } else if (token.equals(newDQuickToken)) {
      return dQUICKtoQUICK * newQuickPrice;
    } else if (token.equals(newQuickToken)) {
      return newQuickPrice;
    } else {
      const priceObj = usdPricesWithToken.find((item) =>
        item.token.equals(token),
      );
      return priceObj?.price ?? 0;
    }
  });
}
export function useUSDCPriceToken(token: Token) {
  return useUSDCPricesToken([token])[0];
}
