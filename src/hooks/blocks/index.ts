import { ApolloClient } from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { useEffect, useMemo, useState } from 'react';
import { GET_BLOCKS } from '../../utils/graphql-queries';
import { useClients } from '../subgraph/useClients';
import { useActiveWeb3React } from 'hooks';
import { ChainId } from '@uniswap/sdk';
import { splitQuery } from 'utils';

export function useBlocksFromTimestamps(
  timestamps: number[],
  blockClientOverride?: ApolloClient<NormalizedCacheObject>,
): {
  blocks:
    | {
        timestamp: string;
        number: any;
      }[]
    | undefined;
  error: boolean;
} {
  const { chainId } = useActiveWeb3React();
  const [blocks, setBlocks] = useState<any>();
  const [error, setError] = useState(false);

  const { blockClient } = useClients();
  const activeBlockClient = blockClientOverride ?? blockClient;

  // derive blocks based on active network
  const networkBlocks = blocks?.[chainId ?? ChainId.MATIC];

  useEffect(() => {
    async function fetchData() {
      const results = await splitQuery(
        GET_BLOCKS,
        activeBlockClient,
        [],
        timestamps,
      );
      if (results) {
        setBlocks({ ...(blocks ?? {}), [chainId ?? ChainId.MATIC]: results });
      } else {
        setError(true);
      }
    }

    if (!networkBlocks && !error) {
      fetchData();
    }
  });

  const blocksFormatted = useMemo(() => {
    if (blocks?.[chainId ?? ChainId.MATIC]) {
      const networkBlocks = blocks?.[chainId ?? ChainId.MATIC];
      const formatted: any[] = [];
      for (const t in networkBlocks) {
        if (networkBlocks[t].length > 0) {
          formatted.push({
            timestamp: t.split('t')[1],
            number: networkBlocks[t][0]['number'],
          });
        }
      }
      return formatted;
    }
    return undefined;
  }, [chainId, blocks]);

  return {
    blocks: blocksFormatted,
    error,
  };
}

export async function getBlocksFromTimestamps(
  timestamps: number[],
  blockClient: ApolloClient<NormalizedCacheObject>,
  skipCount = 500,
) {
  if (timestamps?.length === 0) {
    return [];
  }
  const fetchedData: any = await splitQuery(
    GET_BLOCKS,
    blockClient,
    [],
    timestamps,
    skipCount,
  );

  const blocks: any[] = [];
  if (fetchedData) {
    for (const t in fetchedData) {
      if (fetchedData[t].length > 0) {
        blocks.push({
          timestamp: t.split('t')[1],
          number: fetchedData[t][0]['number'],
        });
      }
    }
  }
  return blocks;
}
