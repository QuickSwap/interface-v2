import React, { useEffect, useMemo, useRef, useState } from 'react';
import { max, scaleLinear, select, ZoomTransform } from 'd3';
import { Area } from './Area';
import { AxisBottom } from './AxisBottom';
import { Brush } from './Brush';
import { Line } from './Line';
import { ChartEntry, LiquidityChartRangeInputProps } from './types';
import Zoom from './Zoom';

export const xAccessor = (d: ChartEntry) => d.price0;
export const yAccessor = (d: ChartEntry) => d.activeLiquidity;

export function Chart({
  id = 'liquidityChartRangeInput',
  data: { series, current },
  styles,
  dimensions: { width, height },
  margins,
  interactive = true,
  brushDomain,
  brushLabels,
  onBrushDomainChange,
  zoomLevels,
  priceFormat,
}: LiquidityChartRangeInputProps) {
  const zoomRef = useRef<SVGRectElement | null>(null);

  const [zoom, setZoom] = useState<ZoomTransform | null>(null);

  const [innerHeight, innerWidth] = useMemo(
    () => [
      height - margins.top - margins.bottom,
      width - margins.left - margins.right,
    ],
    [width, height, margins],
  );

  const maxXScale = useMemo(
    () => series.reduce((acc, el) => (el.price0 > acc ? el.price0 : acc), 0),
    [series],
  );

  const { xScale, yScale } = useMemo(() => {
    const scales = {
      xScale: scaleLinear()
        .domain([
          current * zoomLevels.initialMin,
          current * zoomLevels.initialMax,
        ] as number[])
        .range([0, innerWidth]),
      yScale: scaleLinear()
        .domain([0, max(series, yAccessor)] as number[])
        .range([innerHeight, 0]),
    };

    if (zoom) {
      const newXscale = zoom.rescaleX(scales.xScale);
      scales.xScale.domain(newXscale.domain());
    }

    return scales;
  }, [
    current,
    zoomLevels.initialMin,
    zoomLevels.initialMax,
    innerWidth,
    series,
    innerHeight,
    zoom,
  ]);

  useEffect(() => {
    // reset zoom as necessary
    setZoom(null);
  }, [zoomLevels, priceFormat]);

  useEffect(() => {
    if (!brushDomain && current) {
      //L-1
      // const initialLowPrice = current * 0.75;
      // const initialHighPrice = current * 1.5;
      // onBrushDomainChange([initialLowPrice, initialHighPrice], undefined);
    }
  }, [brushDomain, current, onBrushDomainChange, xScale, priceFormat]);

  useEffect(() => {
    select('.tick:first-child').attr('transform', 'translate(10,0)');
  }, []);

  return (
    <>
      <Zoom
        svg={zoomRef.current}
        xScale={xScale}
        setZoom={setZoom}
        width={innerWidth}
        height={
          // allow zooming inside the x-axis
          height
        }
        showClear={false}
        zoomLevels={zoomLevels}
      />
      <svg width='100%' height='100%' viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <clipPath id={`${id}-chart-clip`}>
            <rect x='0' y='0' width={innerWidth} height={height} />
          </clipPath>

          <linearGradient
            id='liquidity-chart-gradient'
            x1='0%'
            y1='0%'
            x2='0%'
            y2='100%'
          >
            <stop offset='0%' stopColor='rgba(39, 151, 255, 0.2)'></stop>
            <stop offset='100%' stopColor='rgba(39, 151, 255, 0)'></stop>
          </linearGradient>
          {brushDomain && (
            // mask to highlight selected area
            <mask id={`${id}-chart-area-mask`}>
              <rect
                fill='white'
                x={xScale(brushDomain[0])}
                y='0'
                width={xScale(brushDomain[1]) - xScale(brushDomain[0])}
                height={innerHeight}
              />
            </mask>
          )}
        </defs>

        <g transform={`translate(${margins.left},${margins.top})`}>
          <g clipPath={`url(#${id}-chart-clip)`}>
            <Area
              priceFormat={priceFormat}
              series={series}
              xScale={xScale}
              yScale={yScale}
              xValue={xAccessor}
              yValue={yAccessor}
            />

            {brushDomain && (
              // duplicate area chart with mask for selected area
              <g mask={`url(#${id}-chart-area-mask)`}>
                <Area
                  priceFormat={priceFormat}
                  series={series}
                  xScale={xScale}
                  yScale={yScale}
                  xValue={xAccessor}
                  yValue={yAccessor}
                  fill={styles.area.selection}
                />
              </g>
            )}

            <Line value={current} xScale={xScale} innerHeight={innerHeight} />

            <AxisBottom xScale={xScale} innerHeight={innerHeight} />
          </g>

          <Brush
            id={id}
            xScale={xScale}
            interactive={interactive}
            brushLabelValue={brushLabels}
            brushExtent={brushDomain ?? (xScale.domain() as [number, number])}
            innerWidth={innerWidth}
            innerHeight={innerHeight}
            setBrushExtent={onBrushDomainChange}
          />
        </g>
      </svg>
    </>
  );
}
