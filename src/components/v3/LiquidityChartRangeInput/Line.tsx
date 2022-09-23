import React, { useMemo } from 'react';
import { ScaleLinear } from 'd3';
import { StyledLine } from './styled';

export const Line = ({
  value,
  xScale,
  innerHeight,
}: {
  value: number;
  xScale: ScaleLinear<number, number>;
  innerHeight: number;
}) =>
  useMemo(
    () => (
      <>
        <StyledLine
          x1={xScale(value)}
          y1='0'
          x2={xScale(value)}
          y2={innerHeight - 1}
        />
        <rect
          x={xScale(value) - 22}
          y={0}
          width={53}
          height={15}
          fill={'#2797FF'}
          rx={4}
        />
        <text fill={'white'} fontSize={9} x={xScale(value) - 18} y={11}>
          Curr. price
        </text>
      </>
    ),
    [value, xScale, innerHeight],
  );
