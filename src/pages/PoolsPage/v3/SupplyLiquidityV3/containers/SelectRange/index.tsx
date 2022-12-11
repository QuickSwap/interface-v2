import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { IPresetArgs, PresetRanges } from '../../components/PresetRanges';
import { RangeSelector } from '../../components/RangeSelector';
import { Currency } from '@uniswap/sdk-core';
import './index.scss';
import { Bound, updateSelectedPreset } from 'state/mint/v3/actions';
import {
  IDerivedMintInfo,
  useRangeHopCallbacks,
  useV3MintActionHandlers,
  useV3MintState,
  useInitialUSDPrices,
} from 'state/mint/v3/hooks';
import useUSDCPrice, { useUSDCValue } from 'hooks/v3/useUSDCPrice';
import { useAppDispatch } from 'state/hooks';
import { useActivePreset } from 'state/mint/v3/hooks';
import { tryParseAmount } from 'state/swap/v3/hooks';
import { Presets } from 'state/mint/v3/reducer';
import { PriceFormats } from 'components/v3/PriceFomatToggler';
import LiquidityChartRangeInput from 'components/v3/LiquidityChartRangeInput';
import { GlobalData, GlobalValue } from 'constants/index';
import { toToken } from 'constants/v3/routing';
import { Box } from '@material-ui/core';
import { ReportProblemOutlined } from '@material-ui/icons';
import { getEternalFarmFromTokens } from 'utils';

interface IRangeSelector {
  currencyA: Currency | null | undefined;
  currencyB: Currency | null | undefined;
  mintInfo: IDerivedMintInfo;
  priceFormat: PriceFormats;
}

export function SelectRange({
  currencyA,
  currencyB,
  mintInfo,
  priceFormat,
}: IRangeSelector) {
  const [fullRangeWarningShown, setFullRangeWarningShown] = useState(true);
  const { startPriceTypedValue } = useV3MintState();

  const dispatch = useAppDispatch();
  const activePreset = useActivePreset();

  //TODO - create one main isUSD
  const isUSD = useMemo(() => {
    return priceFormat === PriceFormats.USD;
  }, [priceFormat]);

  const isStablecoinPair = useMemo(() => {
    if (!currencyA || !currencyB) return false;

    const stablecoins = GlobalData.stableCoins.map((token) => token.address);

    return (
      stablecoins.includes(currencyA.wrapped.address) &&
      stablecoins.includes(currencyB.wrapped.address)
    );
  }, [currencyA, currencyB]);

  // get value and prices at ticks
  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = useMemo(() => {
    return mintInfo.ticks;
  }, [mintInfo]);

  const {
    [Bound.LOWER]: priceLower,
    [Bound.UPPER]: priceUpper,
  } = useMemo(() => {
    return mintInfo.pricesAtTicks;
  }, [mintInfo]);

  const {
    getDecrementLower,
    getIncrementLower,
    getDecrementUpper,
    getIncrementUpper,
    getSetFullRange,
  } = useRangeHopCallbacks(
    currencyA ?? undefined,
    currencyB ?? undefined,
    mintInfo.dynamicFee,
    tickLower,
    tickUpper,
    mintInfo.pool,
  );

  const { onLeftRangeInput, onRightRangeInput } = useV3MintActionHandlers(
    mintInfo.noLiquidity,
  );

  const tokenA = (currencyA ?? undefined)?.wrapped;
  const tokenB = (currencyB ?? undefined)?.wrapped;

  const isSorted = useMemo(() => {
    return tokenA && tokenB && tokenA.sortsBefore(tokenB);
  }, [tokenA, tokenB]);

  const leftPrice = useMemo(() => {
    return isSorted ? priceLower : priceUpper?.invert();
  }, [isSorted, priceLower, priceUpper]);

  const rightPrice = useMemo(() => {
    return isSorted ? priceUpper : priceLower?.invert();
  }, [isSorted, priceUpper, priceLower]);

  const price = useMemo(() => {
    if (!mintInfo.price) return;

    return mintInfo.invertPrice
      ? mintInfo.price.invert().toSignificant(5)
      : mintInfo.price.toSignificant(5);
  }, [mintInfo]);

  const leftPricePercent =
    leftPrice && price
      ? ((Number(leftPrice.toSignificant(5)) - Number(price)) / Number(price)) *
        100
      : 0;
  const rightPricePercent =
    rightPrice && price
      ? ((Number(rightPrice.toSignificant(5)) - Number(price)) /
          Number(price)) *
        100
      : 0;

  const currencyAID = currencyA?.wrapped.address.toLowerCase();
  const currencyBID = currencyB?.wrapped.address.toLowerCase();

  const [minRangeLength, setMinRangeLength] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    setMinRangeLength(undefined);
    if (!currencyAID || !currencyBID) return;
    (async () => {
      const eternalFarm = await getEternalFarmFromTokens(
        currencyAID,
        currencyBID,
      );
      const minRangeLength = eternalFarm
        ? Number(eternalFarm.minRangeLength) / 100
        : undefined;
      setMinRangeLength(minRangeLength);
    })();
  }, [currencyAID, currencyBID]);

  const currentPriceInUSD = useUSDCValue(
    tryParseAmount(Number(price).toFixed(5), currencyB ?? undefined),
    true,
  );

  const isBeforePrice = useMemo(() => {
    if (!price || !leftPrice || !rightPrice) return false;

    return mintInfo.outOfRange && price > rightPrice.toSignificant(5);
  }, [price, leftPrice, rightPrice, mintInfo]);

  const isAfterPrice = useMemo(() => {
    if (!price || !leftPrice || !rightPrice) return false;

    return mintInfo.outOfRange && price < leftPrice.toSignificant(5);
  }, [price, leftPrice, rightPrice, mintInfo]);

  const handlePresetRangeSelection = useCallback(
    (preset: IPresetArgs | null) => {
      if (!price) return;

      dispatch(updateSelectedPreset({ preset: preset ? preset.type : null }));

      if (preset && preset.type === Presets.FULL) {
        setFullRangeWarningShown(true);
        getSetFullRange();
      } else {
        setFullRangeWarningShown(false);
        onLeftRangeInput(preset ? String(+price * preset.min) : '');
        onRightRangeInput(preset ? String(+price * preset.max) : '');
      }
    },
    [dispatch, getSetFullRange, onLeftRangeInput, onRightRangeInput, price],
  );

  const initialUSDPrices = useInitialUSDPrices();

  const currentPriceInUSDA = useUSDCValue(
    tryParseAmount(
      mintInfo.price
        ? mintInfo.invertPrice
          ? Number(mintInfo.price.invert().toSignificant(5)).toFixed(5)
          : Number(mintInfo.price.toSignificant(5)).toFixed(5)
        : undefined,
      currencyB ?? undefined,
    ),
    true,
  );

  const currentPriceInUSDB = useUSDCValue(
    tryParseAmount(
      mintInfo.price
        ? mintInfo.invertPrice
          ? Number(mintInfo.price.invert().toSignificant(5)).toFixed(5)
          : Number(mintInfo.price.toSignificant(5)).toFixed(5)
        : undefined,
      currencyA ?? undefined,
    ),
    true,
  );

  const currentPrice = useMemo(() => {
    if (!mintInfo.price) return;

    const isInitialInUSD = Boolean(
      initialUSDPrices.CURRENCY_A && initialUSDPrices.CURRENCY_B,
    );

    let _price;

    if (!isUSD) {
      _price =
        isUSD && currentPriceInUSDA
          ? parseFloat(currentPriceInUSDA?.toSignificant(5))
          : mintInfo.invertPrice
          ? parseFloat(mintInfo.price.invert().toSignificant(5))
          : parseFloat(mintInfo.price.toSignificant(5));
    } else {
      if (isInitialInUSD) {
        _price = parseFloat(initialUSDPrices.CURRENCY_A);
      } else if (currentPriceInUSDA) {
        _price = parseFloat(currentPriceInUSDA.toSignificant(5));
      } else if (currentPriceInUSDB) {
        _price = parseFloat(currentPriceInUSDB.toSignificant(5));
      }
    }

    if (Number(_price) <= 0.0001) {
      return `< ${
        isUSD && (currentPriceInUSDA || isInitialInUSD) ? '$ ' : ''
      }0.0001`;
    } else {
      return `${
        isUSD && (currentPriceInUSDA || isInitialInUSD) ? '$ ' : ''
      }${_price}`;
    }
  }, [
    mintInfo.price,
    mintInfo.invertPrice,
    initialUSDPrices.CURRENCY_A,
    initialUSDPrices.CURRENCY_B,
    isUSD,
    currentPriceInUSDA,
    currentPriceInUSDB,
  ]);

  return (
    <Box>
      <small className='weight-600'>Select a range</small>
      <Box my={1}>
        <PresetRanges
          mintInfo={mintInfo}
          baseCurrency={currencyA}
          quoteCurrency={currencyB}
          isStablecoinPair={isStablecoinPair}
          activePreset={activePreset}
          handlePresetRangeSelection={handlePresetRangeSelection}
          priceLower={leftPrice?.toSignificant(5)}
          priceUpper={rightPrice?.toSignificant(5)}
          price={price}
        />
      </Box>
      {mintInfo.price && (
        <Box textAlign='center'>
          <span>
            {!!mintInfo.noLiquidity ? `Initial Price:` : `Current Price:`}{' '}
            {currentPrice ?? ''}{' '}
            <span className='text-secondary'>
              {currentPrice
                ? `${currencyB?.symbol} per ${currencyA?.symbol}`
                : 'Loading...'}
            </span>
          </span>
        </Box>
      )}
      <Box my={2}>
        <RangeSelector
          priceLower={priceLower}
          priceUpper={priceUpper}
          getDecrementLower={getDecrementLower}
          getIncrementLower={getIncrementLower}
          getDecrementUpper={getDecrementUpper}
          getIncrementUpper={getIncrementUpper}
          onLeftRangeInput={onLeftRangeInput}
          onRightRangeInput={onRightRangeInput}
          currencyA={currencyA}
          currencyB={currencyB}
          mintInfo={mintInfo}
          disabled={!startPriceTypedValue && !mintInfo.price}
          isBeforePrice={isBeforePrice}
          isAfterPrice={isAfterPrice}
          priceFormat={priceFormat}
        />
      </Box>
      {activePreset === Presets.FULL && fullRangeWarningShown && (
        <Box className='pool-range-chart-warning border-yellow5'>
          <Box width={1} className='flex items-center'>
            <Box className='pool-range-chart-warning-icon'>
              <ReportProblemOutlined />
            </Box>
            <small>Efficiency Comparison</small>
          </Box>
          <Box width={1} mt={1} mb={1.5}>
            <span>
              Full range positions may earn less fees than concentrated
              positions. Learn more{' '}
              <a
                href='https://quickswap.exchange'
                target='_blank'
                rel='noreferrer'
              >
                here
              </a>
              .
            </span>
          </Box>
          <button onClick={() => setFullRangeWarningShown(false)}>
            I understand
          </button>
        </Box>
      )}
      {leftPrice &&
        rightPrice &&
        minRangeLength !== undefined &&
        rightPricePercent - leftPricePercent < minRangeLength && (
          <Box className='pool-range-chart-warning'>
            <Box className='pool-range-chart-warning-icon'>
              <ReportProblemOutlined />
            </Box>
            <span>
              Warning: The minimum price range to earn farming rewards for this
              liquidity position is {minRangeLength}%
            </span>
          </Box>
        )}
      {mintInfo.outOfRange && (
        <Box className='pool-range-chart-warning'>
          <Box className='pool-range-chart-warning-icon'>
            <ReportProblemOutlined />
          </Box>
          <span>
            Warning: The price range for this liquidity position is not eligible
            for farming rewards. To become eligible for rewards, please increase
            your range
          </span>
        </Box>
      )}
      {mintInfo.invalidRange && (
        <Box className='pool-range-chart-warning'>
          <Box className='pool-range-chart-warning-icon'>
            <ReportProblemOutlined />
          </Box>
          <span>Invalid Range</span>
        </Box>
      )}
      <Box className='pool-range-chart-wrapper'>
        <LiquidityChartRangeInput
          currencyA={currencyA ?? undefined}
          currencyB={currencyB ?? undefined}
          feeAmount={mintInfo.dynamicFee}
          ticksAtLimit={mintInfo.ticksAtLimit}
          price={
            priceFormat === PriceFormats.USD
              ? currentPriceInUSD
                ? parseFloat(currentPriceInUSD.toSignificant(5))
                : undefined
              : price
              ? parseFloat(price)
              : undefined
          }
          priceLower={priceLower}
          priceUpper={priceUpper}
          onLeftRangeInput={onLeftRangeInput}
          onRightRangeInput={onRightRangeInput}
          interactive={false}
          priceFormat={priceFormat}
        />
      </Box>
    </Box>
  );
}
