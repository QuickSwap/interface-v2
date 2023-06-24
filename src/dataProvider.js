
import { useState, useEffect } from "react";
import { ApolloClient, InMemoryCache, gql, HttpLink } from "@apollo/client";
import { getProvider } from "./Helpers";

const subgraphUrl = process.env.REACT_APP_QPX_CORE_SUBGRAPH;


export function useGraph(querySource) {
    const query = gql(querySource);

    const client = new ApolloClient({
        link: new HttpLink({ uri: subgraphUrl, fetch }),
        cache: new InMemoryCache(),
    });
    const [data, setData] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
    }, [querySource, setLoading]);

    useEffect(() => {
        client
            .query({ query })
            .then((res) => {
                setData(res.data);
                setLoading(false);
            })
            .catch((ex) => {
                console.warn("Subgraph request failed error: %s subgraphUrl: %s", ex.message, subgraphUrl);
                setError(ex);
                setLoading(false);
            });
    }, [querySource, setData, setError, setLoading]);

    return [data, loading, error];
}

export function useLastBlock(chainName = "polygon_zkevm") {
    const [data, setData] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        getProvider()
            .getBlock()
            .then(setData)
            .catch(setError)
            .finally(() => setLoading(false));
    }, []);

    return [data, loading, error];
}

export function useLastSubgraphBlock(chainName = "polygon_zkevm") {
    const [data, loading, error] = useGraph(
        `{
      _meta {
        block {
          number
        }
      } 
    }`,
        {
            chainName,
            subgraphUrl,
        }
    );
    const [block, setBlock] = useState(null);

    useEffect(() => {
        if (!data) {
            return;
        }

        getProvider().getBlock(data._meta.block.number).then((block) => {
            setBlock(block);
        });
    }, [data, setBlock]);

    return [block, loading, error];
}