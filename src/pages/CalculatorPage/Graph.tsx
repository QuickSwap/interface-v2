import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Box } from '@material-ui/core';

import { AreaChart, ChartType, MixedChart, ColumnChart } from '~/components';
import {
  formatCompact,
  getPriceClass,
  getChartDates,
  getYAXISValuesAnalytics,
  getFormattedPercent,
} from '~/utils';
import { GlobalConst, GlobalData } from '~/constants/index';

export const Graph: React.FC<{
  factor: number;
  dates: number[];
  prices: number[];
}> = ({ factor = 0, dates = [], prices = [] }) => {
  const { t } = useTranslation();

  return (
    <Box width='100%' mb={3}>
      <Box className='heading heading-mb-0'>{t('howMuchETH')}</Box>
      <Box className='sub-heading'>
        0.01 ETH is <u>{(factor * 0.01).toFixed(4)}</u> USD
      </Box>
      <Box className='chart-container'>
        <Box className='chart-heading'>
          0.01 ETH to USD last 30d price chart
        </Box>
        <AreaChart
          data={prices}
          yAxisValues={getYAXISValuesAnalytics(prices)}
          dates={dates}
          width='100%'
          strokeColor='#3e92fe'
          gradientColor='#448aff'
          height={422}
          categories={getChartDates(
            dates.map((d) => {
              return {
                date: d,
              };
            }),
            1,
          )}
        />
        <Box className='chart-footer'>0.01 ETH to USD last 30d price chart</Box>
      </Box>
    </Box>
  );
};
