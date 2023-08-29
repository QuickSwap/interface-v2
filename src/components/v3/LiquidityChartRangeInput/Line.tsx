import React, { useMemo } from 'react';
import { ScaleLinear } from 'd3';
import styles from 'styles/components/v3/LiquidityChartRangeInput.module.scss';
import { useTranslation } from 'next-i18next';

export const Line = ({
  value,
  xScale,
  innerHeight,
}: {
  value: number;
  xScale: ScaleLinear<number, number>;
  innerHeight: number;
}) => {
  const { t } = useTranslation();
  return useMemo(
    () => (
      <>
        <line
          className={styles.styledLine}
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
          {t('currPrice')}
        </text>
      </>
    ),
    [value, xScale, innerHeight, t],
  );
};
