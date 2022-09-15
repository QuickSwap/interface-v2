import React from 'react';
import { CurrencyAmount, Percent, Token } from '@uniswap/sdk-core';
import { useEffect, useMemo } from 'react';
import { Redirect, RouteComponentProps } from 'react-router';
import { useAppDispatch } from 'state/hooks';
import { resetMintState } from 'state/mint/v3/actions';
import { useToken } from 'hooks/v3/Tokens';
import { usePairContract } from 'hooks/useContract';
import { useActiveWeb3React } from 'hooks';
import { NEVER_RELOAD, useSingleCallResult } from 'state/multicall/v3/hooks';
import { useTokenBalance } from 'state/wallet/v3/hooks';
import { TYPE } from 'theme/index';
import { isAddress } from 'utils';
import usePrevious from 'hooks/usePrevious';
import { EmptyState } from './EmptyState';
import { V2PairMigration } from './V2PairMigration';
import { useTotalSupply } from 'hooks/v3/useTotalSupply';
import { AutoColumn } from 'components/v3/Column';
import Card from 'components/v3/Card/Card';

const DEFAULT_MIGRATE_SLIPPAGE_TOLERANCE = new Percent(75, 10_000);

export default function MigrateV2Pair({
  match: {
    params: { address },
  },
}: RouteComponentProps<{ address: string }>) {
  // reset mint state on component mount, and as a cleanup (on unmount)
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(resetMintState());
    return () => {
      dispatch(resetMintState());
    };
  }, [dispatch]);

  const { chainId, account } = useActiveWeb3React();

  // get pair contract
  const validatedAddress = isAddress(address);
  const pair = usePairContract(validatedAddress ? validatedAddress : undefined);
  const prevPair = usePrevious(pair);
  const _pair = useMemo(() => {
    if (!pair && prevPair) {
      return prevPair;
    }
    return pair;
  }, [pair]);

  // get token addresses from pair contract
  const token0AddressCallState = useSingleCallResult(
    pair,
    'token0',
    undefined,
    NEVER_RELOAD,
  );
  const token0Address = token0AddressCallState?.result?.[0];
  const token1Address = useSingleCallResult(
    pair,
    'token1',
    undefined,
    NEVER_RELOAD,
  )?.result?.[0];

  // get tokens
  const token0 = useToken(token0Address);
  const prevToken0 = usePrevious(token0);
  const _token0 = useMemo(() => {
    if (!token0 && prevToken0) {
      return prevToken0;
    }
    return token0;
  }, [token0]);

  const token1 = useToken(token1Address);
  const prevToken1 = usePrevious(token1);
  const _token1 = useMemo(() => {
    if (!token1 && prevToken1) {
      return prevToken1;
    }
    return token1;
  }, [token1]);

  // get liquidity token balance
  const liquidityToken: Token | undefined = useMemo(
    () =>
      chainId && validatedAddress
        ? new Token(chainId, validatedAddress, 18)
        : undefined,
    [chainId, validatedAddress],
  );

  // get data required for V2 pair migration
  const pairBalance = useTokenBalance(account ?? undefined, liquidityToken);
  const prevPairBalance = usePrevious(pairBalance);
  const _pairBalance = useMemo(() => {
    if (!pairBalance && prevPairBalance) {
      return prevPairBalance;
    }

    return pairBalance;
  }, [pairBalance]);

  const totalSupply = useTotalSupply(liquidityToken);
  const prevTotalSupply = usePrevious(totalSupply);
  const _totalSupply = useMemo(() => {
    if (!totalSupply && prevTotalSupply) {
      return prevTotalSupply;
    }
    return totalSupply;
  }, [totalSupply]);

  const [reserve0Raw, reserve1Raw] =
    useSingleCallResult(pair, 'getReserves')?.result ?? [];
  const reserve0 = useMemo(
    () =>
      token0 && reserve0Raw
        ? CurrencyAmount.fromRawAmount(token0, reserve0Raw)
        : undefined,
    [token0, reserve0Raw],
  );
  const prevReserve0 = usePrevious(reserve0);
  const _reserve0 = useMemo(() => {
    if (!reserve0 && prevReserve0) {
      return prevReserve0;
    }

    return reserve0;
  }, [reserve0]);

  const reserve1 = useMemo(
    () =>
      token1 && reserve1Raw
        ? CurrencyAmount.fromRawAmount(token1, reserve1Raw)
        : undefined,
    [token1, reserve1Raw],
  );
  const prevReserve1 = usePrevious(reserve1);
  const _reserve1 = useMemo(() => {
    if (!reserve1 && prevReserve1) {
      return prevReserve1;
    }

    return reserve1;
  }, [reserve1]);

  // redirect for invalid url params
  if (
    !validatedAddress ||
    !pair ||
    (pair &&
      token0AddressCallState?.valid &&
      !token0AddressCallState?.loading &&
      !token0AddressCallState?.error &&
      !token0Address)
  ) {
    console.error('Invalid pair address');
    return <Redirect to='/migrate' />;
  }

  return (
    <Card classes={'p-2 br-24 w-100 maw-765 mh-a'}>
      <AutoColumn gap='16px'>
        <div className={'flex-s-between mb-1'}>
          <div />
          <TYPE.mediumHeader>Migrate Liquidity</TYPE.mediumHeader>
          {/* <SettingsTab placeholderSlippage={DEFAULT_MIGRATE_SLIPPAGE_TOLERANCE} /> */}
        </div>

        {!account ? (
          <TYPE.largeHeader>You must connect an account.</TYPE.largeHeader>
        ) : _pairBalance &&
          _totalSupply &&
          _reserve0 &&
          _reserve1 &&
          _token0 &&
          _token1 ? (
          <V2PairMigration
            pair={_pair}
            pairBalance={_pairBalance}
            totalSupply={_totalSupply}
            reserve0={_reserve0}
            reserve1={_reserve1}
            token0={_token0}
            token1={_token1}
          />
        ) : (
          <EmptyState message={`Loading`} />
        )}
      </AutoColumn>
    </Card>
  );
}
