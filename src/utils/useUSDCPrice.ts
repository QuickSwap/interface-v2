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
import {
  DAI,
  NEW_DQUICK,
  NEW_QUICK,
  OLD_DQUICK,
  OLD_QUICK,
  USDC,
  USDT,
} from 'constants/v3/addresses';
import { getConfig } from 'config';

dayjs.extend(utc);
dayjs.extend(weekOfYear);

export default function useUSDCPrice(currency?: Currency): Price | undefined {
  const { chainId } = useActiveWeb3React();

  const amountOut = chainId
    ? tryParseAmount(chainId, '1', USDC[chainId])
    : undefined;

  const allowedPairs = useAllCommonPairs(currency, USDC[chainId]);

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

    return new Price(currency, USDC[chainId], denominator, numerator);
  }, [currency, allowedPairs, amountOut, chainId]);
}

export function useUSDCPricesFromAddresses(
  addressArray: string[],
  onlyV3?: boolean,
) {
  const { chainId } = useActiveWeb3React();
  const config = getConfig(chainId);
  const [prices, setPrices] = useState<
    { address: string; price: number }[] | undefined
  >();
  const v2 = config['v2'] && !onlyV3;
  const addressStr = addressArray.join('_');

  useEffect(() => {
    if (!chainId) return;
    (async () => {
      const addresses = addressStr.split('_');

      let pricesV2: any[] = [];

      if (v2) {
        const res = await fetch(
          `${process.env.REACT_APP_LEADERBOARD_APP_URL}/utils/token-prices/v2?chainId=${chainId}&addresses=${addressStr}`,
        );
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            errorText || res.statusText || `Failed to get v2 token price`,
          );
        }
        const data = await res.json();

        pricesV2 = data && data.data && data.data.length > 0 ? data.data : [];
      }

      const addressesNotInV2 = addresses.filter((address) => {
        const priceV2 = pricesV2.find(
          (item: any) =>
            item && item.id.toLowerCase() === address.toLowerCase(),
        );
        return !priceV2 || !priceV2.price;
      });

      const res = await fetch(
        `${
          process.env.REACT_APP_LEADERBOARD_APP_URL
        }/utils/token-prices/v3?chainId=${chainId}&addresses=${addressesNotInV2.join(
          '_',
        )}`,
      );
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          errorText || res.statusText || `Failed to get v3 token price`,
        );
      }
      const data = await res.json();

      const pricesV3 =
        data && data.data && data.data.length > 0 ? data.data : [];

      const prices = addresses.map((address) => {
        const priceV2 = pricesV2.find(
          (item: any) =>
            item && item.id.toLowerCase() === address.toLowerCase(),
        );
        if (priceV2 && priceV2.price) {
          return {
            address,
            price: priceV2.price,
          };
        } else {
          const priceV3 = pricesV3.find(
            (item: any) =>
              item && item.id.toLowerCase() === address.toLowerCase(),
          );
          if (priceV3 && priceV3.price) {
            return {
              address,
              price: priceV3.price,
            };
          }
          return { address, price: 0 };
        }
      });
      setPrices(prices);
    })();
  }, [v2, chainId, addressStr]);

  return prices;
}

export function useUSDCPriceFromAddress(address: string, onlyV3?: boolean) {
  const usdPrices = useUSDCPricesFromAddresses([address], onlyV3);
  if (usdPrices) {
    return usdPrices[0].price;
  }
  return;
}

export function useUSDCPrices(currencies: Currency[]): (Price | undefined)[] {
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;

  const oldQuickToken = OLD_QUICK[chainIdToUse];
  const usdcToken = USDC[chainIdToUse];
  const usdtToken = USDT[chainIdToUse];
  const daiToken = DAI[chainIdToUse];
  const wrappedCurrencies = currencies.map((currency) => {
    const wrapped = wrappedCurrency(currency, chainId);
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

export function useUSDCPricesToken(tokens: Token[], chainId?: ChainId) {
  const dQUICKtoQUICK = useDQUICKtoQUICK();
  const oldQuickToken = chainId ? OLD_QUICK[chainId] : undefined;
  const oldDQuickToken = chainId ? OLD_DQUICK[chainId] : undefined;
  const newQuickToken = chainId ? NEW_QUICK[chainId] : undefined;
  const newDQuickToken = chainId ? NEW_DQUICK[chainId] : undefined;
  const usdcToken = chainId ? USDC[chainId] : undefined;
  const [, quickUsdcPair] = usePair(oldQuickToken, usdcToken);
  const [, newQuickUsdcPair] = usePair(newQuickToken, usdcToken);
  const quickPrice = oldQuickToken
    ? Number(quickUsdcPair?.priceOf(oldQuickToken)?.toSignificant(6) ?? 0)
    : 0;
  const newQuickPrice = newQuickToken
    ? Number(newQuickUsdcPair?.priceOf(newQuickToken)?.toSignificant(6) ?? 0)
    : 0;
  const filteredTokens = tokens
    .filter((item, pos, self) => {
      return (
        self.findIndex((token) => token && item && token.equals(item)) == pos
      );
    })
    .filter(
      (token) =>
        oldQuickToken &&
        newQuickToken &&
        oldDQuickToken &&
        newDQuickToken &&
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
    if (token && oldDQuickToken && token.equals(oldDQuickToken)) {
      return dQUICKtoQUICK * quickPrice;
    } else if (token && oldQuickToken && token.equals(oldQuickToken)) {
      return quickPrice;
    } else if (token && newDQuickToken && token.equals(newDQuickToken)) {
      return dQUICKtoQUICK * newQuickPrice * 1000;
    } else if (token && newQuickToken && token.equals(newQuickToken)) {
      return newQuickPrice;
    } else {
      const priceObj = usdPricesWithToken.find(
        (item) => item.token && token && item.token.equals(token),
      );
      return priceObj?.price ?? 0;
    }
  });
}
export function useUSDCPriceToken(token: Token, chainId: ChainId) {
  return useUSDCPricesToken([token], chainId)[0];
}
