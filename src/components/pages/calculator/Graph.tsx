import React from 'react';
import { useTranslation } from 'next-i18next';
import { Box } from '@mui/material';
import { AreaChart } from 'components';
import { getChartDates, getYAXISValuesAnalytics } from 'utils';
import styles from 'styles/pages/Calculator.module.scss';

export const Graph: React.FC<{
  factor: number;
  dates: number[];
  prices: number[];
}> = ({ factor = 0, dates = [], prices = [] }) => {
  const { t } = useTranslation();

  return (
    <Box width='100%' mb={3}>
      <Box className={`${styles.heading} ${styles.headingMb0}`}>
        {t('howMuchETH')}
      </Box>
      <Box className={styles.subHeading}>
        0.01 ETH is <u>{(factor * 0.01).toFixed(4)}</u> USD
      </Box>
      <Box className={styles.chartContainer}>
        <Box className={styles.chartHeading}>
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
        <Box className={styles.chartFooter}>
          0.01 ETH to USD last 30d price chart
        </Box>
      </Box>
    </Box>
  );
};
