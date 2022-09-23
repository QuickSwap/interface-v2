import React, { useMemo } from 'react';
import {
  Axis as d3Axis,
  axisBottom,
  NumberValue,
  ScaleLinear,
  select,
} from 'd3';
import { StyledGroup } from './styled';

const Axis = ({ axisGenerator }: { axisGenerator: d3Axis<NumberValue> }) => {
  const axisRef = (axis: SVGGElement) => {
    axis && select(axis).call(axisGenerator);
  };

  return <g ref={axisRef} />;
};

export const AxisBottom = ({
  xScale,
  innerHeight,
  offset = 0,
}: {
  xScale: ScaleLinear<number, number>;
  innerHeight: number;
  offset?: number;
}) => {
  return useMemo(
    () => (
      <StyledGroup transform={`translate(0, ${innerHeight + offset})`}>
        <Axis
          axisGenerator={axisBottom(xScale)
            .ticks(6)
            .tickSizeOuter(0)}
        />
      </StyledGroup>
    ),
    [innerHeight, offset, xScale],
  );
};
