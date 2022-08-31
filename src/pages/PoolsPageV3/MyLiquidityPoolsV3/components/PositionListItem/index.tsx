import React, { useEffect, useMemo, useState } from 'react';
import { usePool } from 'hooks/v3/usePools';
import { useToken } from 'hooks/v3/Tokens';
import { Price, Token, Percent } from '@uniswap/sdk-core';
import Loader from 'components/Loader';
import { unwrappedToken } from 'utils/unwrappedToken';
import { Bound, setShowNewestPosition } from 'state/mint/v3/actions';
import { ArrowRight } from 'react-feather';
import usePrevious from 'hooks/usePrevious';
import { PositionPool } from 'models/interfaces';
import { NavLink } from 'react-router-dom';
import RangeBadge from 'components/v3/Badge/RangeBadge';
import { useAppDispatch } from 'state/hooks';
import './index.scss';
import useIsTickAtLimit from 'hooks/v3/useIsTickAtLimit';
import { formatTickPrice } from 'utils/v3/formatTickPrice';
import DoubleCurrencyLogo from 'components/DoubleCurrencyLogo';
import { Position } from 'v3lib/entities/position';
import { WMATIC_EXTENDED } from 'constants/v3/addresses';
import { GlobalValue } from 'constants/index';
import { toToken } from 'constants/v3/routing';
import { Box } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import Badge from 'components/v3/Badge';
import PositionListItemDetails from '../PositionListItemDetails';

interface PositionListItemProps {
  positionDetails: PositionPool;
  newestPosition?: number | undefined;
  highlightNewest?: boolean;
}

export function getPriceOrderingFromPositionForUI(
  position?: Position,
): {
  priceLower?: Price<Token, Token>;
  priceUpper?: Price<Token, Token>;
  quote?: Token;
  base?: Token;
} {
  if (!position) {
    return {};
  }

  const token0 = position.amount0.currency;
  const token1 = position.amount1.currency;

  const USDC = toToken(GlobalValue.tokens.COMMON.USDC);
  const USDT = toToken(GlobalValue.tokens.COMMON.USDT);

  // if token0 is a dollar-stable asset, set it as the quote token
  // const stables = [USDC_BINANCE, USDC_KOVAN]
  const stables = [USDC, USDT];
  if (stables.some((stable) => stable.equals(token0))) {
    return {
      priceLower: position.token0PriceUpper.invert(),
      priceUpper: position.token0PriceLower.invert(),
      quote: token0,
      base: token1,
    };
  }

  // if token1 is an ETH-/BTC-stable asset, set it as the base token
  //TODO
  // const bases = [...Object.values(WMATIC_EXTENDED), WBTC]
  const bases = [...Object.values(WMATIC_EXTENDED)];
  if (bases.some((base) => base.equals(token1))) {
    return {
      priceLower: position.token0PriceUpper.invert(),
      priceUpper: position.token0PriceLower.invert(),
      quote: token0,
      base: token1,
    };
  }

  // if both prices are below 1, invert
  if (position.token0PriceUpper.lessThan(1)) {
    return {
      priceLower: position.token0PriceUpper.invert(),
      priceUpper: position.token0PriceLower.invert(),
      quote: token0,
      base: token1,
    };
  }

  // otherwise, just return the default
  return {
    priceLower: position.token0PriceLower,
    priceUpper: position.token0PriceUpper,
    quote: token1,
    base: token0,
  };
}

export default function PositionListItem({
  positionDetails,
  newestPosition,
  highlightNewest,
}: PositionListItemProps) {
  const dispatch = useAppDispatch();
  const [expanded, setExpanded] = useState(false);

  const prevPositionDetails = usePrevious({ ...positionDetails });
  const {
    token0: _token0Address,
    token1: _token1Address,
    liquidity: _liquidity,
    tickLower: _tickLower,
    tickUpper: _tickUpper,
    onFarming: _onFarming,
    oldFarming: _oldFarming,
  } = useMemo(() => {
    if (
      !positionDetails &&
      prevPositionDetails &&
      prevPositionDetails.liquidity
    ) {
      return { ...prevPositionDetails };
    }
    return { ...positionDetails };
  }, [positionDetails]);

  const token0 = useToken(_token0Address);
  const token1 = useToken(_token1Address);

  const currency0 = token0 ? unwrappedToken(token0) : undefined;
  const currency1 = token1 ? unwrappedToken(token1) : undefined;

  // construct Position from details returned
  const [, pool] = usePool(currency0 ?? undefined, currency1 ?? undefined);
  const prevPool = usePrevious(pool);
  const _pool = useMemo(() => {
    if (!pool && prevPool) {
      return prevPool;
    }
    return pool;
  }, [pool]);

  const position = useMemo(() => {
    if (_pool) {
      return new Position({
        pool: _pool,
        liquidity: _liquidity.toString(),
        tickLower: _tickLower,
        tickUpper: _tickUpper,
      });
    }
    return undefined;
  }, [_liquidity, _pool, _tickLower, _tickUpper]);

  const tickAtLimit = useIsTickAtLimit(_tickLower, _tickUpper);

  // prices
  const {
    priceLower,
    priceUpper,
    quote,
    base,
  } = getPriceOrderingFromPositionForUI(position);
  const currencyQuote = quote && unwrappedToken(quote);
  const currencyBase = base && unwrappedToken(base);

  // check if price is within range
  const outOfRange: boolean = _pool
    ? _pool.tickCurrent < _tickLower || _pool.tickCurrent >= _tickUpper
    : false;

  const positionSummaryLink = `/pool/${positionDetails.tokenId}${
    _onFarming ? '?onFarming=true' : _oldFarming ? '?oldFarming=true' : ''
  }`;

  const farmingLink = `/farming/farms#${positionDetails.tokenId}`;

  const isNewest = newestPosition
    ? newestPosition === +positionDetails.tokenId
    : undefined;

  const removed = _liquidity?.eq(0);

  useEffect(() => {
    if (newestPosition && highlightNewest) {
      dispatch(setShowNewestPosition({ showNewestPosition: false }));
      document.querySelector('#newest')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <Box className='v3-pool-liquidity-item'>
      <Box className='flex items-center'>
        <Box className='flex' mr={1}>
          <DoubleCurrencyLogo
            currency0={currencyBase}
            currency1={currencyQuote}
            size={24}
          />
        </Box>
        <p>
          {currencyQuote?.symbol}-{currencyBase?.symbol}
        </p>
        {_onFarming ? (
          <NavLink
            className={'flex-s-between btn primary fs-085 p-025 br-8'}
            to={farmingLink}
          >
            <span>Farming</span>
            <ArrowRight
              size={14}
              color={'white'}
              style={{ marginLeft: '5px' }}
            />
          </NavLink>
        ) : _oldFarming ? (
          <span
            className={'flex-s-between btn primary fs-085 p-025 br-8'}
            style={{ background: '#46210a', borderColor: '#861f1f' }}
          >
            <span>On Old Farming Center</span>
          </span>
        ) : (
          <div />
        )}
        <Box ml={1}>
          <RangeBadge removed={removed} inRange={!outOfRange} />
        </Box>
        <Box ml={1}>
          <Badge
            text={`${new Percent(
              positionDetails.fee || 100,
              1_000_000,
            ).toSignificant()}
                        %`}
          ></Badge>
        </Box>
      </Box>

      {!expanded && (
        <Box width={1} mt={1}>
          {priceLower && priceUpper ? (
            <span className='text-secondary'>
              Min{' '}
              {`${formatTickPrice(priceLower, tickAtLimit, Bound.LOWER)} ${
                currencyQuote?.symbol
              } per ${currencyBase?.symbol}`}
              {' <'}-{'> '}Max{' '}
              {`${formatTickPrice(priceUpper, tickAtLimit, Bound.UPPER)} ${
                currencyQuote?.symbol
              } per ${currencyBase?.symbol}`}
            </span>
          ) : (
            <Box width={1} className='flex justify-center'>
              <Loader size={'1rem'} stroke={'var(--white)'} />
            </Box>
          )}
        </Box>
      )}

      <Box
        className='v3-pool-liquidity-item-expand'
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ExpandLess /> : <ExpandMore />}
      </Box>

      {expanded && (
        <Box mt={3}>
          <PositionListItemDetails positionDetails={positionDetails} />
        </Box>
      )}
    </Box>
  );
}
