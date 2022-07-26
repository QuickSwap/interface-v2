import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { V3_TICKS } from 'apollo/queries';
import { useClients } from 'hooks/subgraph/useClients';
import { useEffect, useState } from 'react';
import { AllV3TicksQuery } from './generated';

async function fetchAllV3Ticks(
  variables: {
    poolInfo: { poolAddress: string | undefined; skip: number };
    interval: number;
  },
  client: ApolloClient<NormalizedCacheObject>,
): Promise<{ data: any | undefined; error: boolean }> {
  try {
    if (!variables.poolInfo.poolAddress) {
      return {
        error: true,
        data: undefined,
      };
    }

    console.log('fetching v3 ticks ', variables);
    const { data, errors } = await client.query<AllV3TicksQuery>({
      query: V3_TICKS(variables.poolInfo.poolAddress, variables.poolInfo.skip),
      // variables: variables,
    });

    if (errors) {
      return {
        error: true,
        data: undefined,
      };
    } else if (data) {
      return {
        data: data,
        error: false,
      };
    } else {
      return {
        data: undefined,
        error: true,
      };
    }
  } catch (e) {
    console.log('fetchAllV3Ticks error ', e);
    return {
      data: undefined,
      error: true,
    };
  }
}

export const useAllV3TicksQuery = (
  poolInfo: { poolAddress: string | undefined; skip: number },
  interval: { pollingInterval: number },
): any => {
  const { v3PoolClient } = useClients();
  const [fetchedData, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const { data, error } = await fetchAllV3Ticks(
        { poolInfo: poolInfo, interval: interval.pollingInterval },
        v3PoolClient,
      );
      setLoading(false);

      setData(data);
    }

    if (v3PoolClient || poolInfo?.poolAddress) {
      fetch();
    }
  }, [poolInfo]);

  return {
    isLoading: loading,
    isError: !error ? false : true,
    error: error,
    isUninitialized: false,
    data: fetchedData,
  };
};
