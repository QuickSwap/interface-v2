import React, { useCallback, useMemo, useState } from 'react';
import { PoolState, usePool } from 'hooks/v3/usePools';
import { useToken } from 'hooks/v3/Tokens';
import { useDerivedPositionInfo } from 'hooks/v3/useDerivedPositionInfo';
import { useV3PositionFromTokenId } from 'hooks/v3/useV3Positions';
import {
  NavLink,
  RouteComponentProps,
  useLocation,
  useParams,
} from 'react-router-dom';
import { unwrappedToken } from 'utils/unwrappedToken';
import Badge from 'components/v3/Badge';
import CurrencyLogo from 'components/CurrencyLogo';
import { formatCurrencyAmount } from 'utils/v3/formatCurrencyAmount';
import { useV3PositionFees } from 'hooks/v3/useV3PositionFees';
import { BigNumber } from '@ethersproject/bignumber';
import {
  Currency,
  CurrencyAmount,
  Fraction,
  Percent,
  Token,
} from '@uniswap/sdk-core';
import { useActiveWeb3React } from 'hooks';
import { useV3NFTPositionManagerContract } from 'hooks/useContract';
import {
  useIsTransactionPending,
  useTransactionAdder,
} from 'state/transactions/hooks';
import { TransactionResponse } from '@ethersproject/providers';
import { getPriceOrderingFromPositionForUI } from '../PositionListItem';
import { useSingleCallResult } from 'state/multicall/v3/hooks';
import useUSDCPrice from 'hooks/v3/useUSDCPrice';
import { Bound } from 'state/mint/v3/actions';
import useIsTickAtLimit from 'hooks/v3/useIsTickAtLimit';
import { formatTickPrice } from 'utils/v3/formatTickPrice';
import usePrevious from 'hooks/usePrevious';
import ReactGA from 'react-ga';
import { useAppSelector } from 'state/hooks';
import {
  FARMING_CENTER,
  NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
} from 'constants/v3/addresses';
import { NonfungiblePositionManager } from 'v3lib/nonfungiblePositionManager';
import { Position } from 'v3lib/entities';
import { calculateGasMarginV3 } from 'utils';
import { getRatio } from 'utils/v3/getRatio';
import { useInverter } from 'hooks/v3/useInverter';
import { PositionPool } from 'models/interfaces';
import { Box, Button } from '@material-ui/core';
import './index.scss';
import RateToggle from 'components/v3/RateToggle';
import V3IncreaseLiquidityModal from '../V3IncreaseLiquidityModal';
import V3RemoveLiquidityModal from '../V3RemoveLiquidityModal';

interface PositionListItemProps {
  positionDetails: PositionPool;
}

export default function PositionListItemDetails({
  positionDetails,
}: PositionListItemProps) {
  const { chainId, account, library } = useActiveWeb3React();
  const { position: existingPosition } = useDerivedPositionInfo(
    positionDetails,
  );
  const [openRemoveLiquidityModal, setOpenRemoveLiquidityModal] = useState(
    false,
  );
  const [openIncreaseLiquidityModal, setOpenIncreaseLiquidityModal] = useState(
    false,
  );

  const gasPrice = useAppSelector((state) => {
    if (!state.application.gasPrice.fetched) return 36;
    return state.application.gasPrice.override
      ? 36
      : state.application.gasPrice.fetched;
  });

  const { tokenId } = positionDetails || {};

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
  }, [positionDetails]);

  const removed = _liquidity?.eq(0);

  const token0 = useToken(_token0Address);
  const token1 = useToken(_token1Address);

  const currency0 = token0 ? unwrappedToken(token0) : undefined;
  const currency1 = token1 ? unwrappedToken(token1) : undefined;

  // flag for receiving WETH
  const [receiveWETH, setReceiveWETH] = useState(false);

  // construct Position from details returned
  const [poolState, pool] = usePool(token0 ?? undefined, token1 ?? undefined);
  const [prevPoolState, prevPool] = usePrevious([poolState, pool]) || [];
  const [_poolState, _pool] = useMemo(() => {
    if (!pool && prevPool && prevPoolState) {
      return [prevPoolState, prevPool];
    }
    return [poolState, pool];
  }, [pool, poolState]);

  const position = useMemo(() => {
    if (
      _pool &&
      _liquidity &&
      typeof _tickLower === 'number' &&
      typeof _tickUpper === 'number'
    ) {
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

  const pricesFromPosition = getPriceOrderingFromPositionForUI(position);
  const [manuallyInverted, setManuallyInverted] = useState(false);

  // handle manual inversion
  const { priceLower, priceUpper, base } = useInverter({
    priceLower: pricesFromPosition.priceLower,
    priceUpper: pricesFromPosition.priceUpper,
    quote: pricesFromPosition.quote,
    base: pricesFromPosition.base,
    invert: manuallyInverted,
  });

  const inverted = token1 ? base?.equals(token1) : undefined;
  const currencyQuote = inverted ? currency0 : currency1;
  const currencyBase = inverted ? currency1 : currency0;

  const ratio = useMemo(() => {
    return priceLower && _pool && priceUpper
      ? getRatio(
          inverted ? priceUpper.invert() : priceLower,
          _pool.token0Price,
          inverted ? priceLower.invert() : priceUpper,
        )
      : undefined;
  }, [inverted, _pool, priceLower, priceUpper]);

  // fees
  const [feeValue0, feeValue1] = useV3PositionFees(
    _pool ?? undefined,
    positionDetails?.tokenId,
    receiveWETH,
  );

  const [collecting, setCollecting] = useState<boolean>(false);
  const [collectMigrationHash, setCollectMigrationHash] = useState<
    string | null
  >(null);
  const isCollectPending = useIsTransactionPending(
    collectMigrationHash ?? undefined,
  );
  const [showConfirm, setShowConfirm] = useState(false);

  // usdc prices always in terms of tokens
  const price0 = useUSDCPrice(token0 ?? undefined);
  const price1 = useUSDCPrice(token1 ?? undefined);

  const fiatValueOfFees: CurrencyAmount<Currency> | null = useMemo(() => {
    if (!price0 || !price1 || !feeValue0 || !feeValue1) return null;

    // we wrap because it doesn't matter, the quote returns a USDC amount
    const feeValue0Wrapped = feeValue0?.wrapped;
    const feeValue1Wrapped = feeValue1?.wrapped;

    if (!feeValue0Wrapped || !feeValue1Wrapped) return null;

    const amount0 = price0.quote(feeValue0Wrapped);
    const amount1 = price1.quote(feeValue1Wrapped);
    return amount0.add(amount1);
  }, [price0, price1, feeValue0, feeValue1]);

  const prevFiatValueOfFees = usePrevious(fiatValueOfFees);
  const _fiatValueOfFees = useMemo(() => {
    if (!fiatValueOfFees && prevFiatValueOfFees) {
      return prevFiatValueOfFees;
    }
    return fiatValueOfFees;
  }, [fiatValueOfFees]);

  const fiatValueOfLiquidity: CurrencyAmount<Token> | null = useMemo(() => {
    if (!price0 || !price1 || !position) return null;
    const amount0 = price0.quote(position.amount0);
    const amount1 = price1.quote(position.amount1);
    return amount0.add(amount1);
  }, [price0, price1, position]);

  const prevFiatValueOfLiquidity = usePrevious(fiatValueOfLiquidity);
  const _fiatValueOfLiquidity = useMemo(() => {
    if (!fiatValueOfLiquidity && prevFiatValueOfLiquidity) {
      return prevFiatValueOfLiquidity;
    }
    return fiatValueOfLiquidity;
  }, [fiatValueOfLiquidity]);

  const addTransaction = useTransactionAdder();
  const positionManager = useV3NFTPositionManagerContract();
  const collect = useCallback(() => {
    if (
      !chainId ||
      !feeValue0 ||
      !feeValue1 ||
      !positionManager ||
      !account ||
      !tokenId ||
      !library
    )
      return;

    setCollecting(true);

    const collectAddress = _onFarming
      ? FARMING_CENTER[chainId]
      : NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId];

    const {
      calldata,
      value,
    } = NonfungiblePositionManager.collectCallParameters({
      tokenId: tokenId.toString(),
      expectedCurrencyOwed0: feeValue0,
      expectedCurrencyOwed1: feeValue1,
      recipient: account,
    });

    const txn = {
      to: collectAddress,
      data: calldata,
      value: value,
    };

    library
      .getSigner()
      .estimateGas(txn)
      .then((estimate) => {
        const newTxn = {
          ...txn,
          gasLimit: calculateGasMarginV3(chainId, estimate),
          gasPrice: gasPrice * 1000000000,
        };

        return library
          .getSigner()
          .sendTransaction(newTxn)
          .then((response: TransactionResponse) => {
            setCollectMigrationHash(response.hash);
            setCollecting(false);

            ReactGA.event({
              category: 'Liquidity',
              action: 'CollectV3',
              label: [
                feeValue0.currency.symbol,
                feeValue1.currency.symbol,
              ].join('/'),
            });

            addTransaction(response, {
              summary: `Collect ${feeValue0.currency.symbol}/${feeValue1.currency.symbol} fees`,
            });
          });
      })
      .catch((error) => {
        setCollecting(false);
        console.error(error);
      });
  }, [
    chainId,
    feeValue0,
    feeValue1,
    positionManager,
    account,
    tokenId,
    addTransaction,
    library,
  ]);

  const owner = useSingleCallResult(
    !!tokenId ? positionManager : null,
    'ownerOf',
    [tokenId],
  ).result?.[0];
  const ownsNFT = owner === account || positionDetails?.operator === account;

  const feeValueUpper = inverted ? feeValue0 : feeValue1;
  const feeValueLower = inverted ? feeValue1 : feeValue0;

  // check if price is within range
  const below =
    _pool && typeof _tickLower === 'number'
      ? _pool.tickCurrent < _tickLower
      : undefined;
  const above =
    _pool && typeof _tickUpper === 'number'
      ? _pool.tickCurrent >= _tickUpper
      : undefined;
  const inRange: boolean =
    typeof below === 'boolean' && typeof above === 'boolean'
      ? !below && !above
      : false;

  return (
    <>
      {openIncreaseLiquidityModal && (
        <V3IncreaseLiquidityModal
          open={openIncreaseLiquidityModal}
          onClose={() => setOpenIncreaseLiquidityModal(false)}
          positionDetails={positionDetails}
        />
      )}
      {openRemoveLiquidityModal && (
        <V3RemoveLiquidityModal
          open={openRemoveLiquidityModal}
          onClose={() => setOpenRemoveLiquidityModal(false)}
          position={positionDetails}
        />
      )}
      <Box className='v3-pool-liquidity-item-details'>
        <Box className='flex items-center justify-between'>
          <Box>
            <p className='small weight-600'>Liquidity</p>
            <Box mt='5px'>
              <p className='small weight-600'>
                $
                {_fiatValueOfLiquidity?.greaterThan(new Fraction(1, 100))
                  ? _fiatValueOfLiquidity.toFixed(2, {
                      groupSeparator: ',',
                    })
                  : '-'}
              </p>
            </Box>
          </Box>
          <Box className='flex'>
            <Button onClick={() => setOpenIncreaseLiquidityModal(true)}>
              Add
            </Button>
            <Box ml={1}>
              <Button onClick={() => setOpenRemoveLiquidityModal(true)}>
                Remove
              </Button>
            </Box>
          </Box>
        </Box>
        <Box mt={2} className='v3-pool-item-details-panel'>
          <Box pt='4px' className='flex justify-between items-center'>
            <Box className='flex items-center'>
              <CurrencyLogo currency={currencyQuote} size='24px' />
              <Box ml={1}>
                <p>{currencyQuote?.symbol}</p>
              </Box>
            </Box>
            <Box className='flex items-center'>
              <Box mr={1}>
                <p>
                  {inverted
                    ? formatCurrencyAmount(position?.amount0, 4)
                    : formatCurrencyAmount(position?.amount1, 4)}
                </p>
              </Box>
              {typeof ratio === 'number' && !removed && (
                <Badge text={`${inverted ? ratio : 100 - ratio}%`}></Badge>
              )}
            </Box>
          </Box>
          <Box mt='16px' pb='4px' className='flex justify-between items-center'>
            <Box className='flex items-center'>
              <CurrencyLogo currency={currencyBase} size='24px' />
              <Box ml={1}>
                <p>{currencyBase?.symbol}</p>
              </Box>
            </Box>
            <Box className='flex items-center'>
              <Box mr={1}>
                <p>
                  {inverted
                    ? formatCurrencyAmount(position?.amount1, 4)
                    : formatCurrencyAmount(position?.amount0, 4)}
                </p>
              </Box>
              {typeof ratio === 'number' && !removed && (
                <Badge text={`${inverted ? 100 - ratio : ratio}%`}></Badge>
              )}
            </Box>
          </Box>
        </Box>
        <Box mt={3} className='flex items-center justify-between'>
          <Box>
            <p className='small weight-600'>Unclaimed Fees</p>
            <Box mt='5px'>
              <p className='small weight-600'>
                $
                {_fiatValueOfFees?.greaterThan(new Fraction(1, 100))
                  ? +_fiatValueOfFees.toFixed(2, { groupSeparator: ',' }) < 0.01
                    ? '<0.01'
                    : _fiatValueOfFees?.toFixed(2, {
                        groupSeparator: ',',
                      })
                  : '-'}
              </p>
            </Box>
          </Box>
          {ownsNFT &&
            (feeValue0?.greaterThan(0) ||
              feeValue1?.greaterThan(0) ||
              !!collectMigrationHash) && (
              <Button
                disabled={collecting || !!collectMigrationHash}
                onClick={collect}
              >
                {!!collectMigrationHash && !isCollectPending
                  ? 'Claimed'
                  : isCollectPending || collecting
                  ? 'Claiming'
                  : 'Claim'}
              </Button>
            )}
        </Box>
        <Box mt={2} className='v3-pool-item-details-panel'>
          <Box pt='4px' className='flex justify-between items-center'>
            <Box className='flex items-center'>
              <CurrencyLogo currency={feeValueUpper?.currency} size='24px' />
              <Box ml={1}>
                <p>{feeValueUpper?.currency?.symbol}</p>
              </Box>
            </Box>
            <p>
              {feeValueUpper ? formatCurrencyAmount(feeValueUpper, 4) : '-'}
            </p>
          </Box>
          <Box mt='16px' pb='4px' className='flex justify-between items-center'>
            <Box className='flex items-center'>
              <CurrencyLogo currency={feeValueLower?.currency} size='24px' />
              <Box ml={1}>
                <p>{feeValueLower?.currency?.symbol}</p>
              </Box>
            </Box>
            <p>
              {feeValueLower ? formatCurrencyAmount(feeValueLower, 4) : '-'}
            </p>
          </Box>
        </Box>
        <Box mt={3} className='flex items-center justify-between'>
          <small>Selected Range</small>
          {currencyBase && currencyQuote && (
            <RateToggle
              currencyA={currencyBase}
              currencyB={currencyQuote}
              handleRateToggle={() => setManuallyInverted(!manuallyInverted)}
            />
          )}
        </Box>
        <Box mt={2} className='flex justify-between'>
          {priceLower && (
            <Box
              width={priceUpper ? '49%' : '100%'}
              className='v3-pool-item-details-panel v3-pool-item-details-info'
            >
              <p>Min price</p>
              <h6>{formatTickPrice(priceLower, tickAtLimit, Bound.LOWER)}</h6>
              <p>
                {currencyQuote?.symbol} per {currencyBase?.symbol}
              </p>
              {inRange && (
                <p>
                  Your position will be 100% {currencyBase?.symbol} at this
                  price.
                </p>
              )}
            </Box>
          )}
          {priceUpper && (
            <Box
              width={priceLower ? '49%' : '100%'}
              className='v3-pool-item-details-panel v3-pool-item-details-info'
            >
              <p>Max price</p>
              <h6>{formatTickPrice(priceUpper, tickAtLimit, Bound.LOWER)}</h6>
              <p>
                {currencyQuote?.symbol} per {currencyBase?.symbol}
              </p>
              {inRange && (
                <p>
                  Your position will be 100% {currencyQuote?.symbol} at this
                  price.
                </p>
              )}
            </Box>
          )}
        </Box>
        {_pool && (
          <Box
            mt={2}
            className='v3-pool-item-details-panel v3-pool-item-details-info'
          >
            <p>Current price</p>
            <h6>
              {(inverted ? _pool.token1Price : _pool.token0Price).toSignificant(
                6,
              )}
            </h6>
            <p>
              {currencyQuote?.symbol} per {currencyBase?.symbol}
            </p>
          </Box>
        )}
      </Box>
    </>
  );
}
