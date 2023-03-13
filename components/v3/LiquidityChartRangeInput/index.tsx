import React, { useCallback, useMemo } from 'react';
import { Currency, Price, Token } from '@uniswap/sdk-core';
import { Bound } from 'state/mint/v3/actions';
import { FeeAmount } from 'v3lib/utils';
import { PriceFormats } from '../PriceFomatToggler';
import { useDensityChartData } from './hooks';
import { useInitialTokenPrice, useInitialUSDPrices } from 'state/mint/v3/hooks';
import useUSDCPrice, { useUSDCValue } from 'hooks/v3/useUSDCPrice';
import { ZoomLevels } from './types';
import { Box } from '@material-ui/core';
import { tryParseAmount } from 'state/swap/v3/hooks';
import { format } from 'd3';
import { Chart } from './Chart';
import { useTranslation } from 'react-i18next';

const ZOOM_LEVEL: ZoomLevels = {
  initialMin: 0.5,
  initialMax: 2,
  min: 0.01,
  max: 20,
};

interface LiquidityChartRangeInputProps {
  currencyA: Currency | undefined;
  currencyB: Currency | undefined;
  feeAmount?: FeeAmount;
  ticksAtLimit: { [bound in Bound]?: boolean | undefined };
  price: number | undefined;
  priceLower?: Price<Token, Token>;
  priceUpper?: Price<Token, Token>;
  onLeftRangeInput: (typedValue: string) => void;
  onRightRangeInput: (typedValue: string) => void;
  interactive: boolean;
  priceFormat: PriceFormats;
}

export default function LiquidityChartRangeInput({
  currencyA,
  currencyB,
  feeAmount,
  ticksAtLimit,
  price,
  priceLower,
  priceUpper,
  onLeftRangeInput,
  onRightRangeInput,
  interactive,
  priceFormat,
}: LiquidityChartRangeInputProps) {
  const { t } = useTranslation();
  const {
    isLoading,
    isUninitialized,
    isError,
    error,
    formattedData,
  } = useDensityChartData({
    currencyA,
    currencyB,
    feeAmount,
    priceFormat,
  });

  const initialPrice = useInitialTokenPrice();
  const initialUSDPrices = useInitialUSDPrices();
  const currencyBUSD = useUSDCPrice(currencyB);

  const mockData = useMemo(() => {
    if (formattedData && formattedData.length > 0) return [];

    if (!initialPrice && !price) return [];

    if (priceFormat === PriceFormats.TOKEN) {
      return [
        {
          activeLiquidity: 0,
          price0: (price ?? +initialPrice) * ZOOM_LEVEL.initialMin,
        },
        {
          activeLiquidity: 0,
          price0: (price ?? +initialPrice) * ZOOM_LEVEL.initialMax,
        },
      ];
    } else {
      if (currencyBUSD || (initialUSDPrices.CURRENCY_B && initialPrice)) {
        const price =
          currencyBUSD?.toSignificant(8) || initialUSDPrices.CURRENCY_B;
        return [
          {
            activeLiquidity: 0,
            price0: +price * +initialPrice * ZOOM_LEVEL.initialMin,
          },
          {
            activeLiquidity: 0,
            price0: +price * +initialPrice * ZOOM_LEVEL.initialMax,
          },
        ];
      }
      return [];
    }
  }, [
    formattedData,
    initialPrice,
    price,
    priceFormat,
    currencyBUSD,
    initialUSDPrices.CURRENCY_B,
  ]);

  const mockPrice = useMemo(() => {
    if (formattedData && formattedData.length > 0) return 0;

    if (!initialPrice && !price) return 0;

    if (priceFormat === PriceFormats.TOKEN) {
      return price ?? +initialPrice;
    } else {
      if (currencyBUSD) return +currencyBUSD.toSignificant(5) * +initialPrice;
      if (initialUSDPrices.CURRENCY_B)
        return +initialUSDPrices.CURRENCY_B * +initialPrice;
    }

    return 0;
  }, [
    initialPrice,
    initialUSDPrices,
    currencyBUSD,
    priceFormat,
    formattedData,
    price,
  ]);

  const isSorted =
    currencyA &&
    currencyB &&
    currencyA?.wrapped.sortsBefore(currencyB?.wrapped);

  const onBrushDomainChangeEnded = useCallback(
    (domain: any[], mode: string) => {
      let leftRangeValue = Number(domain[0]);
      const rightRangeValue = Number(domain[1]);

      if (leftRangeValue <= 0) {
        leftRangeValue = 1 / 10 ** 6;
      }
    },
    [],
  );

  interactive = interactive && Boolean(formattedData?.length);

  const leftPrice = useMemo(() => {
    return isSorted ? priceLower : priceUpper?.invert();
  }, [isSorted, priceLower, priceUpper]);

  //TODO
  const leftPriceUSD = useUSDCValue(
    tryParseAmount(
      leftPrice
        ? +leftPrice.toSignificant(5) < 0.00000001
          ? undefined
          : Number(leftPrice.toSignificant(5)).toFixed(5)
        : undefined,
      currencyB,
    ),
    true,
  );

  const rightPrice = useMemo(() => {
    return isSorted ? priceUpper : priceLower?.invert();
  }, [isSorted, priceLower, priceUpper]);

  const rightPriceUSD = useUSDCValue(
    tryParseAmount(
      rightPrice
        ? rightPrice.toSignificant(5) ===
          '3384900000000000000000000000000000000000000000000'
          ? undefined
          : Number(rightPrice.toSignificant(5)).toFixed(5)
        : undefined,
      currencyB,
    ),
    true,
  );

  const brushDomain: [number, number] | undefined = useMemo(() => {
    if (!leftPrice || !rightPrice) return;

    if (priceFormat === PriceFormats.USD && leftPriceUSD && rightPriceUSD) {
      return [
        parseFloat(leftPriceUSD.toSignificant(5)),
        parseFloat(rightPriceUSD.toSignificant(5)),
      ];
    }

    if (priceFormat === PriceFormats.USD && initialUSDPrices.CURRENCY_B) {
      return [
        parseFloat(
          String(+leftPrice.toSignificant(5) * +initialUSDPrices.CURRENCY_B),
        ),
        parseFloat(
          String(+rightPrice.toSignificant(5) * +initialUSDPrices.CURRENCY_B),
        ),
      ];
    }

    return [
      parseFloat(leftPrice.toSignificant(5)),
      parseFloat(rightPrice.toSignificant(5)),
    ];
  }, [
    leftPrice,
    rightPrice,
    priceFormat,
    leftPriceUSD,
    rightPriceUSD,
    initialUSDPrices.CURRENCY_B,
  ]);

  const brushLabelValue = useCallback(
    (d: 'w' | 'e', x: number) => {
      const _price = price || mockPrice;

      if (!_price) return '';

      if (d === 'w' && ticksAtLimit[Bound.LOWER]) return '0';
      if (d === 'e' && ticksAtLimit[Bound.UPPER]) return '∞';

      const percent =
        (x < _price ? -1 : 1) *
        ((Math.max(x, _price) - Math.min(x, _price)) / _price) *
        100;

      return _price
        ? `${format(Math.abs(percent) > 1 ? '.2~s' : '.2~f')(percent)}%`
        : '';
    },
    [price, ticksAtLimit, mockPrice],
  );

  return (
    <Box
      width={1}
      minHeight='260px'
      className='flex justify-center items-center'
    >
      {isUninitialized ? (
        <p>{t('yourPositionAppearHere')}.</p>
      ) : isLoading ? (
        <p>{t('loading')}...</p>
      ) : isError ? (
        <p>{t('liquidityDataNotAvailable')}.</p>
      ) : !formattedData || formattedData.length === 0 || !price ? (
        <Chart
          data={{ series: mockData, current: mockPrice }}
          dimensions={{ width: 400, height: 230 }}
          margins={{ top: 20, right: 0, bottom: 30, left: 0 }}
          styles={{
            area: {
              selection: '#008FFF',
            },
          }}
          interactive={interactive}
          brushLabels={brushLabelValue}
          brushDomain={brushDomain}
          onBrushDomainChange={onBrushDomainChangeEnded}
          zoomLevels={ZOOM_LEVEL}
          priceFormat={priceFormat}
        />
      ) : (
        <Chart
          data={{ series: formattedData, current: price }}
          dimensions={{ width: 400, height: 230 }}
          margins={{ top: 20, right: 0, bottom: 30, left: 0 }}
          styles={{
            area: {
              selection: '#008FFF',
            },
          }}
          interactive={interactive}
          brushLabels={brushLabelValue}
          brushDomain={brushDomain}
          onBrushDomainChange={onBrushDomainChangeEnded}
          zoomLevels={ZOOM_LEVEL}
          priceFormat={priceFormat}
        />
      )}
    </Box>
  );
}
