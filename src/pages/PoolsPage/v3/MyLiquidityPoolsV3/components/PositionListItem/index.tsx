import React, { useEffect, useMemo, useState } from 'react';
import { PoolState, usePool } from 'hooks/v3/usePools';
import { useToken } from 'hooks/v3/Tokens';
import { Price, Token, Percent } from '@uniswap/sdk-core';
import Loader from 'components/Loader';
import { unwrappedToken } from 'utils/unwrappedToken';
import { Bound, setShowNewestPosition } from 'state/mint/v3/actions';
import { ArrowRight } from 'react-feather';
import usePrevious from 'hooks/usePrevious';
import { PositionPool } from 'models/interfaces';
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
import { useHistory } from 'react-router-dom';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import Badge from 'components/v3/Badge';
import PositionListItemDetails from '../PositionListItemDetails';
import { useTranslation } from 'react-i18next';

interface PositionListItemProps {
  positionDetails: PositionPool;
  newestPosition?: number | undefined;
  highlightNewest?: boolean;
  hideExpand?: boolean;
  ownsNFT?: boolean;
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
  hideExpand = false,
  ownsNFT = true,
}: PositionListItemProps) {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const [expanded, setExpanded] = useState(hideExpand);

  const prevPositionDetails = usePrevious({ ...positionDetails });
  const {
    token0: _token0Address,
    token1: _token1Address,
    liquidity: _liquidity,
    tickLower: _tickLower,
    tickUpper: _tickUpper,
    onFarming: _onFarming,
  } = useMemo(() => {
    if (
      !positionDetails &&
      prevPositionDetails &&
      prevPositionDetails.liquidity
    ) {
      return { ...prevPositionDetails };
    }
    return { ...positionDetails };
  }, [positionDetails, prevPositionDetails]);

  const token0 = useToken(_token0Address);
  const token1 = useToken(_token1Address);

  const currency0 = token0 ? unwrappedToken(token0) : undefined;
  const currency1 = token1 ? unwrappedToken(token1) : undefined;

  // construct Position from details returned
  const [poolState, pool] = usePool(
    currency0 ?? undefined,
    currency1 ?? undefined,
  );
  const [prevPoolState, prevPool] = usePrevious([poolState, pool]) || [];
  const [_poolState, _pool] = useMemo(() => {
    if (!pool && prevPool && prevPoolState) {
      return [prevPoolState, prevPool];
    }
    return [poolState, pool];
  }, [pool, poolState, prevPool, prevPoolState]);

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

  const farmingLink = `/farm/v3?tab=my-farms`;

  const isNewest = newestPosition
    ? newestPosition === +positionDetails.tokenId
    : undefined;

  const removed = _liquidity?.eq(0);

  useEffect(() => {
    if (newestPosition && highlightNewest) {
      dispatch(setShowNewestPosition({ showNewestPosition: false }));
      document.querySelector('#newest')?.scrollIntoView({ behavior: 'smooth' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box className='v3-pool-liquidity-item'>
      <Box
        width={
          _poolState !== PoolState.LOADING && !hideExpand
            ? 'calc(100% - 32px)'
            : '100%'
        }
        className='flex items-center'
      >
        <Box className='v3-tokenId-wrapper'>
          <p>{t('nftID')}:</p>
          <span>{positionDetails.tokenId.toString()}</span>
        </Box>
        <Box flex={1}>
          <Box className='flex items-center flex-wrap' my={-0.5}>
            <Box className='flex items-center' mr={1} my={0.5}>
              <Box className='flex' mr={1}>
                <DoubleCurrencyLogo
                  currency0={currencyQuote}
                  currency1={currencyBase}
                  size={24}
                />
              </Box>
              <p>
                {currencyQuote?.symbol}-{currencyBase?.symbol}
              </p>
            </Box>
            {_onFarming && (
              <Box
                className='flex items-center bg-primary cursor-pointer'
                padding='0 5px'
                height='24px'
                borderRadius='8px'
                mr={1}
                my={0.5}
                onClick={() => history.push(farmingLink)}
                color='white'
              >
                <p className='span'>{t('farming')}</p>
                <Box className='flex' ml='3px'>
                  <ArrowRight size={12} />
                </Box>
              </Box>
            )}
            <Box mr={1} my={0.5}>
              <RangeBadge removed={removed} inRange={!outOfRange} />
            </Box>
            <Box my={0.5}>
              <Badge
                text={`${new Percent(
                  pool?.fee || 100,
                  1_000_000,
                ).toSignificant()}
                        %`}
              ></Badge>
            </Box>
          </Box>

          {!expanded && (
            <Box width={1} mt={1}>
              {_poolState === PoolState.LOADING && (
                <Box width={1} className='flex justify-center'>
                  <Loader size={'1rem'} stroke={'var(--white)'} />
                </Box>
              )}
              {_poolState !== PoolState.LOADING && priceLower && priceUpper && (
                <span className='text-secondary'>
                  {t('min1')}{' '}
                  {`${formatTickPrice(priceLower, tickAtLimit, Bound.LOWER)} ${
                    currencyQuote?.symbol
                  } ${t('per')} ${currencyBase?.symbol}`}
                  {' <'}-{'> '}
                  {t('max1')}{' '}
                  {`${formatTickPrice(priceUpper, tickAtLimit, Bound.UPPER)} ${
                    currencyQuote?.symbol
                  } ${t('per')} ${currencyBase?.symbol}`}
                </span>
              )}
            </Box>
          )}
          {_poolState !== PoolState.LOADING && !hideExpand && (
            <Box
              className='v3-pool-liquidity-item-expand'
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </Box>
          )}
        </Box>
      </Box>

      {expanded && (
        <Box mt={3}>
          <PositionListItemDetails
            positionDetails={positionDetails}
            ownsNFT={ownsNFT}
          />
        </Box>
      )}
    </Box>
  );
}
