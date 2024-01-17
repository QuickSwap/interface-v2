import React, { useMemo } from 'react';
import { area, curveStepAfter, ScaleLinear } from 'd3';
import styles from 'styles/components/v3/LiquidityChartRangeInput.module.scss';
import { ChartEntry } from './types';
import inRange from 'lodash/inRange';
import { PriceFormats } from '../PriceFomatToggler';

export const Area = ({
  series,
  xScale,
  yScale,
  xValue,
  yValue,
  fill,
}: {
  series: ChartEntry[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  xValue: (d: ChartEntry) => number;
  yValue: (d: ChartEntry) => number;
  fill?: string | undefined;
  priceFormat: PriceFormats;
}) =>
  useMemo(
    () => (
      <path
        className={`${styles.path} ${fill ? styles.filledPath : ''}`}
        d={
          area()
            .curve(curveStepAfter)
            .x((d: unknown) => xScale(xValue(d as ChartEntry)))
            .y1((d: unknown) => yScale(yValue(d as ChartEntry)))
            .y0(yScale(0))(
            series.filter((d) =>
              inRange(xScale(xValue(d)), 0, innerWidth),
            ) as Iterable<[number, number]>,
          ) ?? undefined
        }
      />
    ),
    [fill, series, xScale, xValue, yScale, yValue],
  );
