import { useMemo } from "react";
import { gql } from "@apollo/client";
import useSWR from "swr";
import { ethers } from "ethers";

import { USD_DECIMALS, CHART_PERIODS, formatAmount, DEFAULT_CHAIN_ID } from "../Helpers";
import { chainlinkClient } from "./common";
import { getTokenBySymbol } from "../data/Tokens";

const BigNumber = ethers.BigNumber;

const timezoneOffset = -new Date().getTimezoneOffset() * 60;

function fillGaps(prices, periodSeconds) {
  if (prices.length < 2) {
    return prices;
  }

  const newPrices = [prices[0]];
  let prevTime = prices[0].time;
  for (let i = 1; i < prices.length; i++) {
    const { time, open } = prices[i];
    if (prevTime) {
      let j = (time - prevTime) / periodSeconds - 1;
      while (j > 0) {
        newPrices.push({
          time: time - j * periodSeconds,
          open,
          close: open,
          high: open * 1.0003,
          low: open * 0.9996,
        });
        j--;
      }
    }

    prevTime = time;
    newPrices.push(prices[i]);
  }

  return newPrices;
}


function getCandlePricesFromGraph(tokenSymbol, period) {
  if (["ETH"].includes(tokenSymbol)) {
    tokenSymbol = "W"+tokenSymbol;
  }

  const token = getTokenBySymbol(DEFAULT_CHAIN_ID, tokenSymbol);
  const nowTs = parseInt(Date.now() / 1000)
  const timeThreshold = nowTs - 24 * 60 * 60;
  const PER_CHUNK = 1000;
  const CHUNKS_TOTAL = 3;
  const requests = [];
  for (let i = 0; i < CHUNKS_TOTAL; i++) {
    const query = gql(`{
      fastPrices(
        first: ${PER_CHUNK},
        skip: ${i * PER_CHUNK},
        orderBy: timestamp,
        orderDirection: desc,
        where: {token: "${token.address.toLowerCase()}" period: "any", timestamp_gte: ${timeThreshold}, timestamp_lte: ${nowTs} }
      ) {
        timestamp,
        value
      }
    }`);
    requests.push(chainlinkClient.query({ query }));
  }

  return Promise.all(requests)
  .then((chunks) => {
    let prices = [];
    chunks.forEach((chunk) => {
      chunk.data.fastPrices.forEach((item) => {

        const price = {
          time: item.timestamp + timezoneOffset, 
          value: Number(item.value) / 1e30
        }

        prices.push(price)
      });
    });
    prices.sort((itemA, itemB) => itemA.time - itemB.time);
    return prices;
  })
  .catch((err) => {
    console.error(err);
  });

}

export function useChartPrices(chainId, symbol, isStable, period, currentAveragePrice) {
  const swrKey = !isStable && symbol ? ["getChartCandles", chainId, symbol, period] : null;
  let { data: prices, mutate: updatePrices } = useSWR(swrKey, {
    fetcher: async (...args) => {
      // try {
      //   return await getChartPricesFromStats(chainId, symbol, period);
      // } catch (ex) {
      //   console.warn(ex);
      //   console.warn("Switching to graph chainlink data");
        try {
          return await getCandlePricesFromGraph(symbol, period);
        } catch (ex2) {
          console.warn("getCandlePricesFromGraph failed");
          console.warn(ex2);
          return [];
        }
      // }
    },
    dedupingInterval: 60000,
    focusThrottleInterval: 60000 * 10,
  });

  const currentAveragePriceString = currentAveragePrice && currentAveragePrice.toString();
  const retPrices = useMemo(() => {
    if (isStable) {
      return getStablePriceData(period);
    }

    if (!prices) {
      return [];
    }

    let _prices = [...prices];
    if (currentAveragePriceString && prices.length) {
      _prices = appendCurrentAveragePrice(_prices, BigNumber.from(currentAveragePriceString), period,symbol);
    }

    return fillGaps(_prices, CHART_PERIODS[period]);
  }, [prices, isStable, currentAveragePriceString, period]);

  return [retPrices, updatePrices];
}

function appendCurrentAveragePrice(prices, currentAveragePrice, period,symbol) {
  const token = getTokenBySymbol(DEFAULT_CHAIN_ID, symbol);
  const periodSeconds = CHART_PERIODS[period];
  const currentCandleTime = Math.floor(Date.now() / 1000 / periodSeconds) * periodSeconds + timezoneOffset;
  const last = prices[prices.length - 1];
  const averagePriceValue = parseFloat(formatAmount(currentAveragePrice, USD_DECIMALS, token.displayDecimals));
  if (currentCandleTime === last.time) {
    last.close = averagePriceValue;
    last.high = Math.max(last.high, averagePriceValue);
    last.low = Math.max(last.low, averagePriceValue);
    return prices;
  } else {
    const newCandle = {
      time: currentCandleTime,
      open: last.close,
      close: averagePriceValue,
      high: averagePriceValue,
      low: averagePriceValue,
    };
    return [...prices, newCandle];
  }
}

function getStablePriceData(period) {
  const periodSeconds = CHART_PERIODS[period];
  const now = Math.floor(Date.now() / 1000 / periodSeconds) * periodSeconds;
  let priceData = [];
  for (let i = 100; i > 0; i--) {
    priceData.push({
      time: now - i * periodSeconds,
      open: 1,
      close: 1,
      high: 1,
      low: 1,
    });
  }
  return priceData;
}
