import React, { useCallback, useMemo, useState } from 'react';
import { usePool } from 'hooks/v3/usePools';
import { useToken } from 'hooks/v3/Tokens';
import { unwrappedToken } from 'utils/unwrappedToken';
import Badge from 'components/v3/Badge';
import CurrencyLogo from 'components/CurrencyLogo';
import { formatCurrencyAmount } from 'utils/v3/formatCurrencyAmount';
import { useV3PositionFees } from 'hooks/v3/useV3PositionFees';
import { Currency, CurrencyAmount, Fraction, Token } from '@uniswap/sdk-core';
import { useActiveWeb3React } from 'hooks';
import { useV3NFTPositionManagerContract } from 'hooks/useContract';
import {
  useIsTransactionPending,
  useTransactionAdder,
} from 'state/transactions/hooks';
import { TransactionResponse } from '@ethersproject/providers';
import { getPriceOrderingFromPositionForUI } from '../PositionListItem';
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
import {
  ConfirmationModalContent,
  CustomTooltip,
  ToggleSwitch,
  TransactionConfirmationModal,
  TransactionErrorContent,
} from 'components';
import { useTranslation } from 'react-i18next';

interface PositionListItemProps {
  positionDetails: PositionPool;
  ownsNFT: boolean;
}

export default function PositionListItemDetails({
  positionDetails,
  ownsNFT,
}: PositionListItemProps) {
  const { t } = useTranslation();
  const { chainId, account, library } = useActiveWeb3React();

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
  }, [positionDetails, prevPositionDetails]);

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
  }, [pool, poolState, prevPool, prevPoolState]);

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

  const [collectConfirm, showCollectConfirm] = useState(false);
  const [collecting, setCollecting] = useState<boolean>(false);
  const [collectMigrationHash, setCollectMigrationHash] = useState<
    string | undefined
  >(undefined);
  const isCollectPending = useIsTransactionPending(collectMigrationHash);
  const [collectErrorMessage, setCollectErrorMessage] = useState('');

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
  }, [fiatValueOfFees, prevFiatValueOfFees]);

  const fiatValueOfLiquidity:
    | CurrencyAmount<Token>
    | undefined = useMemo(() => {
    if (!price0 || !price1 || !position) return;
    const amount0 = price0.quote(position.amount0);
    const amount1 = price1.quote(position.amount1);
    return amount0.add(amount1);
  }, [price0, price1, position]);

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
              summary: t('collectFees', {
                symbol1: feeValue0.currency.symbol,
                symbol2: feeValue1.currency.symbol,
              }),
            });
          });
      })
      .catch((error) => {
        setCollecting(false);
        setCollectErrorMessage(t('errorInTx'));
        console.error(error);
      });
  }, [
    chainId,
    feeValue0,
    feeValue1,
    positionManager,
    account,
    tokenId,
    library,
    _onFarming,
    gasPrice,
    addTransaction,
    t,
  ]);

  // NOTE: this may cause poor ux as people might try to claim rewards
  // for others NFT's however the smart contract will fail since they don't have the rights to claim
  //Default to true to allow people to claim reward in farming

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

  const showCollectAsWeth = Boolean(
    (ownsNFT || _onFarming) &&
      (feeValue0?.greaterThan(0) || feeValue1?.greaterThan(0)) &&
      currency0 &&
      currency1 &&
      (currency0.isNative || currency1.isNative) &&
      !collectMigrationHash,
  );

  function modalHeader() {
    return (
      <>
        <Box mt={3} mb={2}>
          <Box className='flex justify-between'>
            <Box className='flex items-center'>
              <CurrencyLogo currency={feeValueUpper?.currency} size={'24px'} />
              <p className='ml-05'>{feeValueUpper?.currency?.symbol}</p>
            </Box>
            <p>
              {feeValueUpper ? formatCurrencyAmount(feeValueUpper, 4) : '-'}
            </p>
          </Box>
          <Box mt={2} className='flex justify-between'>
            <Box className='flex items-center'>
              <CurrencyLogo currency={feeValueLower?.currency} size={'24px'} />
              <p className='ml-05'>{feeValueLower?.currency?.symbol}</p>
            </Box>
            <p>
              {feeValueLower ? formatCurrencyAmount(feeValueLower, 4) : '-'}
            </p>
          </Box>
        </Box>
        <Box mb={2} textAlign='center'>
          <p>{t('collectingFeesWillWithdraw')}.</p>
        </Box>
        <Box className='flex justify-center'>
          <Button
            fullWidth
            style={{ maxWidth: 300 }}
            size='large'
            onClick={collect}
          >
            {t('collect')}
          </Button>
        </Box>
      </>
    );
  }

  const dismissCollectConfirm = () => {
    showCollectConfirm(false);
    setCollectErrorMessage('');
    setCollectMigrationHash(undefined);
  };

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
      {collectConfirm && (
        <TransactionConfirmationModal
          isOpen={collectConfirm}
          onDismiss={dismissCollectConfirm}
          attemptingTxn={collecting}
          txPending={isCollectPending}
          hash={collectMigrationHash}
          content={() =>
            collectErrorMessage ? (
              <TransactionErrorContent
                onDismiss={dismissCollectConfirm}
                message={collectErrorMessage}
              />
            ) : (
              <ConfirmationModalContent
                title={t('collectFees1')}
                onDismiss={dismissCollectConfirm}
                content={modalHeader}
              />
            )
          }
          pendingText=''
          modalContent={
            isCollectPending
              ? t('submittedTxCollectFees')
              : t('successCollectedFees')
          }
        />
      )}
      <Box className='v3-pool-liquidity-item-details'>
        <Box className='flex items-center justify-between'>
          <Box>
            <p className='small weight-600'>{t('liquidity')}</p>
            <Box mt='5px'>
              <p className='small weight-600'>
                ${formatCurrencyAmount(fiatValueOfLiquidity, 4)}
              </p>
            </Box>
          </Box>
          {ownsNFT && (
            <Box className='flex'>
              <Button onClick={() => setOpenIncreaseLiquidityModal(true)}>
                {t('add')}
              </Button>
              <Box ml={1}>
                {_onFarming || _liquidity.eq(0) ? (
                  <CustomTooltip
                    title={
                      _onFarming
                        ? t('mustRemoveFromFarmRemoveLiquidity')
                        : t('noLiquidityPosition')
                    }
                  >
                    <div className='button bg-primary'>
                      <span>{t('remove')}</span>
                    </div>
                  </CustomTooltip>
                ) : (
                  <Button onClick={() => setOpenRemoveLiquidityModal(true)}>
                    {t('remove')}
                  </Button>
                )}
              </Box>
            </Box>
          )}
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
            <p className='small weight-600'>{t('unclaimedFees')}</p>
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
                onClick={() => showCollectConfirm(true)}
              >
                {!!collectMigrationHash && !isCollectPending
                  ? t('claimed')
                  : isCollectPending || collecting
                  ? t('claiming')
                  : t('claim')}
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
        {showCollectAsWeth && (
          <Box mt={2} className='flex items-center'>
            <Box mr={1}>
              <p>{t('collectAsWmatic')}</p>
            </Box>
            <ToggleSwitch
              toggled={receiveWETH}
              onToggle={() => setReceiveWETH((receiveWETH) => !receiveWETH)}
            />
          </Box>
        )}
        <Box mt={3} className='flex items-center justify-between'>
          <small>{t('selectedRange')}</small>
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
              <p>{t('minPrice')}</p>
              <h6>{formatTickPrice(priceLower, tickAtLimit, Bound.LOWER)}</h6>
              <p>
                {currencyQuote?.symbol} {t('per')} {currencyBase?.symbol}
              </p>
              {inRange && (
                <p>
                  {t('positionWill100PercentatthisPrice', {
                    symbol: currencyBase?.symbol,
                  })}
                  .
                </p>
              )}
            </Box>
          )}
          {priceUpper && (
            <Box
              width={priceLower ? '49%' : '100%'}
              className='v3-pool-item-details-panel v3-pool-item-details-info'
            >
              <p>{t('maxPrice')}</p>
              <h6>{formatTickPrice(priceUpper, tickAtLimit, Bound.LOWER)}</h6>
              <p>
                {currencyQuote?.symbol} {t('per')} {currencyBase?.symbol}
              </p>
              {inRange && (
                <p>
                  {t('positionWill100PercentatthisPrice', {
                    symbol: currencyQuote?.symbol,
                  })}
                  .
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
            <p>{t('currentPrice')}</p>
            <h6>
              {(inverted ? _pool.token1Price : _pool.token0Price).toSignificant(
                6,
              )}
            </h6>
            <p>
              {currencyQuote?.symbol} {t('per')} {currencyBase?.symbol}
            </p>
          </Box>
        )}
      </Box>
    </>
  );
}
