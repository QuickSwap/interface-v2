import { Currency, TradeType } from '@uniswap/sdk-core';
import { Trade as V2Trade } from '@uniswap/sdk';
import { Version } from 'hooks/v3/useToggledVersion';
import { Trade as V3Trade } from 'lib/src/trade';

export function getTradeVersion(
  trade?: V2Trade | V3Trade<Currency, Currency, TradeType>,
): Version | undefined {
  if (!trade) return undefined;
  if (trade instanceof V2Trade) return Version.v2;
  return Version.v3;
}
