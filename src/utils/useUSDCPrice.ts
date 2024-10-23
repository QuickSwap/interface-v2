import {
  ChainId,
  Currency,
  currencyEquals,
  Price,
  WETH,
  Token,
  Trade,
  ETHER,
} from '@uniswap/sdk';
import { useMemo } from 'react';
import { PairState, usePairs, usePair } from 'data/Reserves';
import { useActiveWeb3React } from 'hooks';
import { unwrappedToken, wrappedCurrency } from './wrappedCurrency';
import { useDQUICKtoQUICK } from 'state/stake/hooks';
import { useAllCommonPairs } from 'hooks/Trades';
import { tryParseAmount } from 'state/swap/hooks';
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
import { getConfig } from 'config/index';
import { useQuery } from '@tanstack/react-query';

dayjs.extend(utc);
dayjs.extend(weekOfYear);

export default function useUSDCPrice(currency?: Currency): Price | undefined {
  const { chainId } = useActiveWeb3React();
  const token = useMemo(() => wrappedCurrency(currency, chainId), [
    currency,
    chainId,
  ]);
  const { data: priceUsd } = useFetchEthereumPrice(token?.address);

  const amountOut = chainId
    ? tryParseAmount(chainId, '1', USDC[chainId])
    : undefined;

  const allowedPairs = useAllCommonPairs(currency, USDC[chainId]);

  return useMemo(() => {
    if (chainId && chainId === ChainId.ETHEREUM) {
      const amount = tryParseAmount(
        chainId,
        priceUsd?.price.toString(),
        currency,
      );

      const usdcAmount = tryParseAmount(chainId, '1', USDC[chainId]);

      if (!currency || !amount || !usdcAmount) return;

      return new Price(USDC[chainId], currency, usdcAmount.raw, amount.raw);
    }

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
  }, [currency, allowedPairs, amountOut, chainId, priceUsd]);
}

const fetchEthereumPrice = async (address: string) => {
  const tokenAddressWithChainId = `ethereum:${address}`;
  const url = `https://coins.llama.fi/prices/current/${tokenAddressWithChainId}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return {
        address,
        price: 0,
      };
    }
    const data = await response.json();
    const coin = data.coins[tokenAddressWithChainId];
    return {
      address,
      price: coin.price || 0,
    };
  } catch (error) {
    console.error(`Failed to fetch price for ${address}:`, error);
    return {
      address,
      price: 0,
    };
  }
};

const useFetchEthereumPrice = (address?: string) => {
  const { chainId } = useActiveWeb3React();

  return useQuery({
    queryKey: ['useFetchEthereumPrice', address, chainId],
    queryFn: () => fetchEthereumPrice(address!),
    enabled: !!address && chainId === ChainId.ETHEREUM,
  });
};

const getUSDPricesFromAddresses = async (
  chainId: ChainId,
  addressStr?: string,
  onlyV3?: boolean,
) => {
  if (!addressStr) return [];
  let pricesV3: any[] = [],
    pricesV2: any[] = [];
  const config = getConfig(chainId);
  const v2 = config['v2'] && !onlyV3;
  const addresses = addressStr.split('_');

  if (chainId === ChainId.ETHEREUM) {
    return await Promise.all(
      addresses.map(async (address) => fetchEthereumPrice(address)),
    );
  }

  for (const ind of Array.from(
    { length: Math.ceil(addresses.length / 150) },
    (_, i) => i,
  )) {
    const res = await fetch(
      `${
        process.env.REACT_APP_LEADERBOARD_APP_URL
      }/utils/token-prices/v3?chainId=${chainId}&addresses=${addresses
        .slice(ind * 150, (ind + 1) * 150)
        .join('_')}`,
    );
    if (res.ok) {
      const data = await res.json();
      pricesV3 = pricesV3.concat(data?.data ?? []);
    }
  }

  if (v2) {
    const addressesNotInV3 = addresses.filter((address) => {
      const priceV3 = pricesV3.find(
        (item: any) => item && item.id.toLowerCase() === address.toLowerCase(),
      );
      return !priceV3 || !priceV3.price;
    });
    for (const ind of Array.from(
      { length: Math.ceil(addressesNotInV3.length / 150) },
      (_, i) => i,
    )) {
      const v2Res = await fetch(
        `${
          process.env.REACT_APP_LEADERBOARD_APP_URL
        }/utils/token-prices/v2?chainId=${chainId}&addresses=${addressesNotInV3
          .slice(ind * 150, (ind + 1) * 150)
          .join('_')}`,
      );
      if (v2Res.ok) {
        const data = await v2Res.json();
        pricesV2 = pricesV2.concat(data?.data ?? []);
      }
    }
  }

  const prices = addresses.map((address) => {
    const priceV3 = pricesV3.find(
      (item: any) => item && item.id.toLowerCase() === address.toLowerCase(),
    );
    if (priceV3 && priceV3.price) {
      return {
        address,
        price: priceV3.price,
      };
    } else {
      const priceV2 = pricesV2.find(
        (item: any) => item && item.id.toLowerCase() === address.toLowerCase(),
      );
      if (priceV2 && priceV2.price) {
        return {
          address,
          price: priceV2.price,
        };
      }
      return { address, price: 0 };
    }
  });
  return prices;
};

export function useUSDCPricesFromAddresses(
  addressArray: string[],
  onlyV3?: boolean,
) {
  const { chainId } = useActiveWeb3React();

  const oldDQUICK = OLD_DQUICK[chainId];
  const newDQUICK = NEW_DQUICK[chainId];
  const oldQUICK = OLD_QUICK[chainId];
  const newQUICK = NEW_QUICK[chainId];
  const hasOlddQuick = !!addressArray.find(
    (address) =>
      oldDQUICK && address.toLowerCase() === oldDQUICK.address.toLowerCase(),
  );
  const hasNewdQuick = !!addressArray.find(
    (address) =>
      newDQUICK && address.toLowerCase() === newDQUICK.address.toLowerCase(),
  );

  const dQuickToQuick = useDQUICKtoQUICK(
    false,
    hasOlddQuick ? undefined : true,
  );

  const newdQuickTonewQuick = useDQUICKtoQUICK(
    true,
    hasNewdQuick ? undefined : true,
  );

  const addressesWithoutDQuick = addressArray.filter(
    (address) =>
      (!oldDQUICK ||
        address.toLowerCase() !== oldDQUICK.address.toLowerCase()) &&
      (!newDQUICK || address.toLowerCase() !== newDQUICK.address.toLowerCase()),
  );
  const containsOldQUICK = !!addressArray.find(
    (address) =>
      oldQUICK && address.toLowerCase() === oldQUICK.address.toLowerCase(),
  );
  const containsNewQUICK = !!addressArray.find(
    (address) =>
      newQUICK && address.toLowerCase() === newQUICK.address.toLowerCase(),
  );
  const addresses = addressesWithoutDQuick
    .concat(
      hasOlddQuick && !containsOldQUICK && oldQUICK ? [oldQUICK.address] : [],
    )
    .concat(
      hasNewdQuick && !containsNewQUICK && newQUICK ? [newQUICK.address] : [],
    );

  const addressStr = addresses.join('_');

  const { isLoading, data: pricesWithoutDUICK } = useQuery({
    queryKey: ['usd-price-tokens', chainId, addressStr, onlyV3],
    queryFn: async () => {
      try {
        const prices = await getUSDPricesFromAddresses(
          chainId,
          addressStr,
          onlyV3,
        );
        return prices;
      } catch {
        return null;
      }
    },
    refetchInterval: 300000,
  });

  const oldDQUICKPrice = oldDQUICK
    ? {
        address: oldDQUICK.address,
        price:
          (pricesWithoutDUICK?.find(
            (item) =>
              oldQUICK &&
              item.address.toLowerCase() === oldQUICK.address.toLowerCase(),
          )?.price ?? 0) * dQuickToQuick,
      }
    : undefined;

  const newDQUICKPrice = newDQUICK
    ? {
        address: newDQUICK.address,
        price:
          (pricesWithoutDUICK?.find(
            (item) =>
              newQUICK &&
              item.address.toLowerCase() === newQUICK.address.toLowerCase(),
          )?.price ?? 0) * newdQuickTonewQuick,
      }
    : undefined;

  return {
    loading: isLoading,
    prices: (pricesWithoutDUICK ?? [])
      .concat(oldDQUICKPrice ? [oldDQUICKPrice] : [])
      .concat(newDQUICKPrice ? [newDQUICKPrice] : []),
  };
}

export function useUSDCPriceFromAddress(address?: string, onlyV3?: boolean) {
  const { chainId } = useActiveWeb3React();
  const oldDQUICK = OLD_DQUICK[chainId];
  const newDQUICK = NEW_DQUICK[chainId];
  const oldQUICK = OLD_QUICK[chainId];
  const newQUICK = NEW_QUICK[chainId];
  const isOldDQUICK =
    address &&
    oldDQUICK &&
    address.toLowerCase() === oldDQUICK.address.toLowerCase();
  const isNewdQuick =
    address &&
    newDQUICK &&
    address.toLowerCase() === newDQUICK.address.toLowerCase();

  const dQuickToQuick = useDQUICKtoQUICK(false, isOldDQUICK ? undefined : true);

  const newdQuickTonewQuick = useDQUICKtoQUICK(
    true,
    isNewdQuick ? undefined : true,
  );

  const tokenAddress = isOldDQUICK
    ? oldQUICK?.address
    : isNewdQuick
    ? newQUICK?.address
    : address;

  const { isLoading, data: tokenPrice } = useQuery({
    queryKey: ['usd-price-token', tokenAddress, onlyV3, chainId],
    queryFn: async () => {
      try {
        const prices = await getUSDPricesFromAddresses(
          chainId,
          tokenAddress,
          onlyV3,
        );
        if (prices.length > 0) {
          return Number(prices[0]?.price ?? 0);
        }
        return 0;
      } catch {
        return 0;
      }
    },
    refetchInterval: 300000,
  });

  const price = isOldDQUICK
    ? dQuickToQuick * (tokenPrice ?? 0)
    : isNewdQuick
    ? newdQuickTonewQuick * (tokenPrice ?? 0)
    : tokenPrice;

  return {
    loading: isLoading,
    price: price ?? 0,
  };
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
  const newdQuickTonewQuick = useDQUICKtoQUICK(true);
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
      return newdQuickTonewQuick * newQuickPrice * 1000;
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
