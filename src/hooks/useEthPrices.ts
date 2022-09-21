import { useBlocksFromTimestamps } from './blocks';
import { useDeltaTimestamps } from '../utils/queries';
import { useEffect, useMemo, useState } from 'react';
import gql from 'graphql-tag';
import { ApolloClient } from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { useClients } from './subgraph/useClients';
import { useActiveWeb3React } from 'hooks';
import { ChainId } from '@uniswap/sdk';

export interface EthPrices {
  current: number;
  oneDay: number;
  twoDay: number;
  week: number;
}

export const ETH_PRICES = gql`
  query prices($block24: Int!, $block48: Int!, $blockWeek: Int!) {
    current: bundles(first: 1, subgraphError: allow) {
      maticPriceUSD
    }
    oneDay: bundles(
      first: 1
      block: { number: $block24 }
      subgraphError: allow
    ) {
      maticPriceUSD
    }
    twoDay: bundles(
      first: 1
      block: { number: $block48 }
      subgraphError: allow
    ) {
      maticPriceUSD
    }
    oneWeek: bundles(
      first: 1
      block: { number: $blockWeek }
      subgraphError: allow
    ) {
      maticPriceUSD
    }
  }
`;

interface PricesResponse {
  current: {
    maticPriceUSD: string;
  }[];
  oneDay: {
    maticPriceUSD: string;
  }[];
  twoDay: {
    maticPriceUSD: string;
  }[];
  oneWeek: {
    maticPriceUSD: string;
  }[];
  error: string | undefined;
}

async function fetchEthPrices(
  blocks: [number, number, number],
  client: ApolloClient<NormalizedCacheObject>,
): Promise<{ data: EthPrices | undefined; error: boolean }> {
  try {
    const { data, errors } = await client.query<PricesResponse>({
      query: ETH_PRICES,
      variables: {
        block24: blocks[0],
        block48: blocks[1],
        blockWeek: blocks[2] ?? 1,
      },
    });

    if (errors) {
      return {
        error: true,
        data: undefined,
      };
    } else if (data) {
      return {
        data: {
          current: parseFloat(data.current[0].maticPriceUSD ?? 0),
          oneDay: parseFloat(data.oneDay[0]?.maticPriceUSD ?? 0),
          twoDay: parseFloat(data.twoDay[0]?.maticPriceUSD ?? 0),
          week: parseFloat(data.oneWeek[0]?.maticPriceUSD ?? 0),
        },
        error: false,
      };
    } else {
      return {
        data: undefined,
        error: true,
      };
    }
  } catch (e) {
    console.log(e);
    return {
      data: undefined,
      error: true,
    };
  }
}

/**
 * returns eth prices at current, 24h, 48h, and 1w intervals
 */
export function useEthPrices(): EthPrices | undefined {
  const [prices, setPrices] = useState<{
    [network: string]: EthPrices | undefined;
  }>();
  const [error, setError] = useState(false);
  const { v3Client } = useClients();

  const [t24, t48, tWeek] = useDeltaTimestamps();
  const { blocks, error: blockError } = useBlocksFromTimestamps([
    t24,
    t48,
    tWeek,
  ]);

  // index on active network
  const { chainId } = useActiveWeb3React();
  const indexedPrices = prices?.[chainId ?? ChainId.MATIC];

  const formattedBlocks = useMemo(() => {
    if (blocks) {
      return blocks
        .reverse()
        .sort((a, b) => +b.timestamp - +a.timestamp)
        .map((b) => parseFloat(b.number));
    }
    return undefined;
  }, [blocks]);

  useEffect(() => {
    async function fetch() {
      const { data, error } = await fetchEthPrices(
        formattedBlocks as [number, number, number],
        v3Client,
      );
      if (error || blockError) {
        setError(true);
      } else if (data) {
        setPrices({
          [chainId ?? ChainId.MATIC]: data,
        });
      }
    }

    if (!indexedPrices && !error && formattedBlocks) {
      fetch();
    }
  }, [
    error,
    prices,
    formattedBlocks,
    blockError,
    v3Client,
    indexedPrices,
    chainId,
  ]);

  return prices?.[chainId ?? ChainId.MATIC];
}
