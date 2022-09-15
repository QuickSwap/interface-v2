import React, { useContext, useMemo } from 'react';
import { Token } from '@uniswap/sdk-core';
import MigrateV2PositionCard from 'components/v3/PositionCard/V2';
import {
  PairState,
  useV2Pairs,
  useTrackedTokenPairs,
} from 'hooks/v3/useV2Pairs';
import { Text } from 'rebass';
import { ThemeContext } from 'styled-components/macro';
import { useActiveWeb3React } from 'hooks';
import { useTokenBalancesWithLoadingIndicator } from 'state/wallet/v3/hooks';
import { StyledInternalLink, TYPE } from 'theme/index';
import { Helmet } from 'react-helmet';
import { EmptyState } from './EmptyState';
import { AutoColumn } from 'components/v3/Column';
import Card from 'components/v3/Card/Card';
import { Dots } from 'components/v3/swap/styled';
import { V2Exchanges, V2_FACTORY_ADDRESSES } from 'constants/v3/addresses';
import { useIsNetworkFailed } from 'hooks/v3/useIsNetworkFailed';
import { usePreviousNonEmptyArray } from 'hooks/usePrevious';
import { toV2LiquidityToken } from 'utils/v3/computePairAddress';

export default function MigrateV2() {
  const theme = useContext(ThemeContext);
  const { account, chainId } = useActiveWeb3React();

  const networkFailed = useIsNetworkFailed();

  const v2FactoryAddress = chainId ? V2_FACTORY_ADDRESSES[chainId] : undefined;

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs();

  // calculate v2 + sushi pair contract addresses for all token pairs
  const tokenPairsWithLiquidityTokens = useMemo(() => {
    return trackedTokenPairs.map((tokens) => {
      // sushi liquidity token or null
      const sushiLiquidityToken =
        chainId === 137
          ? toV2LiquidityToken({ tokens, exchange: V2Exchanges.SushiSwap })
          : null;

      return {
        v2liquidityToken: v2FactoryAddress
          ? toV2LiquidityToken({ tokens, exchange: V2Exchanges.Quickswap })
          : undefined,
        sushiLiquidityToken,
        tokens,
      };
    });
  }, [trackedTokenPairs, chainId, v2FactoryAddress]);

  //  get pair liquidity token addresses for balance-fetching purposes
  const allLiquidityTokens = useMemo(() => {
    const v2 = tokenPairsWithLiquidityTokens.map(
      ({ v2liquidityToken }) => v2liquidityToken,
    );
    const sushi = tokenPairsWithLiquidityTokens
      .map(({ sushiLiquidityToken }) => sushiLiquidityToken)
      .filter((token): token is Token => !!token);

    return [...v2, ...sushi];
  }, [tokenPairsWithLiquidityTokens]);

  // fetch pair balances
  const [
    pairBalances,
    fetchingPairBalances,
  ] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    allLiquidityTokens,
  );

  // filter for v2 liquidity tokens that the user has a balance in
  const tokenPairsWithV2Balance = useMemo(() => {
    if (fetchingPairBalances) return [];

    return tokenPairsWithLiquidityTokens
      .filter(
        ({ v2liquidityToken }) =>
          v2liquidityToken &&
          pairBalances[v2liquidityToken.address]?.greaterThan(0),
      )
      .map(
        (tokenPairsWithLiquidityTokens) => tokenPairsWithLiquidityTokens.tokens,
      );
  }, [fetchingPairBalances, tokenPairsWithLiquidityTokens, pairBalances]);

  // filter for v2 liquidity tokens that the user has a balance in
  const tokenPairsWithSushiBalance = useMemo(() => {
    if (fetchingPairBalances) return [];

    return tokenPairsWithLiquidityTokens
      .filter(
        ({ sushiLiquidityToken }) =>
          !!sushiLiquidityToken &&
          pairBalances[sushiLiquidityToken.address]?.greaterThan(0),
      )
      .map(
        (tokenPairsWithLiquidityTokens) => tokenPairsWithLiquidityTokens.tokens,
      );
  }, [fetchingPairBalances, tokenPairsWithLiquidityTokens, pairBalances]);

  const v2Pairs = useV2Pairs(tokenPairsWithV2Balance);
  const previousv2Pairs = usePreviousNonEmptyArray(v2Pairs);
  const _v2Pairs = useMemo(() => {
    if (v2Pairs.length === 0 && previousv2Pairs) {
      return previousv2Pairs;
    }

    return v2Pairs;
  }, [v2Pairs]);

  const v2SushiPairs = useV2Pairs(
    tokenPairsWithSushiBalance,
    V2Exchanges.SushiSwap,
  );
  const previousv2SushiPairs = usePreviousNonEmptyArray(v2SushiPairs);
  const _v2SushiPairs = useMemo(() => {
    if (v2SushiPairs.length === 0 && previousv2SushiPairs) {
      return previousv2SushiPairs;
    }

    return v2SushiPairs;
  }, [v2SushiPairs]);

  const v2IsLoading =
    fetchingPairBalances ||
    v2Pairs.some(([pairState]) => pairState === PairState.LOADING) ||
    v2SushiPairs.some(([pairState]) => pairState === PairState.LOADING);

  return (
    <>
      <Helmet>
        <title>{`Quickswap — Migrate Liquidity`}</title>
      </Helmet>
      <Card classes={'p-2 br-24 w-100 maw-765 mh-a mxs_p-1'}>
        <AutoColumn gap='16px'>
          <h3 className={'fs-125'}>Migrate Liquidity</h3>
          <span>
            Click Migrate to transfer your liquidity from SushiSwap or QuickSwap
            to Algebra.
          </span>

          {!account ? (
            <Card isDark={false} classes={'p-1 br-12'}>
              <div className={'ta-c w-100 b'}>
                Connect wallet to view your liquidity.
              </div>
            </Card>
          ) : v2IsLoading && !networkFailed ? (
            <Card isDark={false} classes={'p-1 br-12 f f-ac f-jc'}>
              <Dots>Loading</Dots>
            </Card>
          ) : _v2Pairs.filter(([, pair]) => !!pair).length > 0 ||
            _v2SushiPairs.filter(([, pair]) => !!pair).length > 0 ? (
            <>
              {_v2Pairs.filter(([, pair]) => !!pair).length > 0 && (
                <>
                  {_v2Pairs
                    .filter(([, pair]) => !!pair)
                    .map(([, pair], index) => (
                      <MigrateV2PositionCard key={index} pair={pair} />
                    ))}
                </>
              )}
              {_v2SushiPairs.filter(([, pair]) => !!pair).length > 0 && (
                <>
                  {_v2SushiPairs
                    .filter(([, pair]) => !!pair)
                    .map(([, pair], index) => (
                      <MigrateV2PositionCard
                        key={index}
                        sushi={true}
                        pair={pair}
                      />
                    ))}
                </>
              )}
            </>
          ) : (
            <EmptyState message={`No liquidity found.`} />
          )}
          <AutoColumn justify={'center'} gap='md'>
            <Text
              textAlign='center'
              fontSize={14}
              style={{ padding: '.5rem 0 .5rem 0' }}
            >
              Don’t see one of your pools?
              <StyledInternalLink id='import-pool-link' to={'/pool/find'}>
                Find it.
              </StyledInternalLink>
            </Text>
          </AutoColumn>
        </AutoColumn>
      </Card>
    </>
  );
}
