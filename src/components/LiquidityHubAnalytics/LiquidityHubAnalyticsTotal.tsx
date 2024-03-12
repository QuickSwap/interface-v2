import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@material-ui/lab';
import Chart from 'react-apexcharts';
import { formatCompact } from 'utils';
import dayjs from 'dayjs';
import { useLHAnalyticsDaily } from 'hooks/useLHAnalytics';
import ChartType from 'components/ChartType';
import { GlobalData, GlobalConst } from 'constants/index';

const LiquidityHubAnalyticsTotal: React.FC = () => {
  const { t } = useTranslation();
  const [durationIndex, setDurationIndex] = useState(
    GlobalConst.analyticChart.ONE_MONTH_CHART,
  );

  const { isLoading, data: lhData } = useLHAnalyticsDaily();
  const data: any[] = lhData?.result?.rows ?? [];
  const startTime =
    durationIndex === GlobalConst.analyticChart.ALL_CHART
      ? undefined
      : dayjs(
          dayjs()
            .subtract(
              durationIndex === GlobalConst.analyticChart.ONE_MONTH_CHART
                ? 1
                : durationIndex === GlobalConst.analyticChart.THREE_MONTH_CHART
                ? 3
                : durationIndex === GlobalConst.analyticChart.SIX_MONTH_CHART
                ? 6
                : 12,
              'month',
            )
            .format('YYYY-MM-DD'),
        ).unix();
  const filteredData = data.filter((item) =>
    startTime ? dayjs(item.evt_date).unix() >= startTime : true,
  );

  return (
    <Box className='panel'>
      <Box mb={2} className='flex flex-wrap justify-between' gridGap={8}>
        <p>{t('liquidityHub')}</p>
        <ChartType
          typeTexts={GlobalData.analytics.CHART_DURATION_TEXTS}
          chartTypes={GlobalData.analytics.CHART_DURATIONS}
          chartType={durationIndex}
          setChartType={setDurationIndex}
        />
      </Box>
      {isLoading ? (
        <Skeleton width='100%' height={400} />
      ) : filteredData.length > 0 ? (
        <Chart
          series={[
            {
              name: 'Liquidity Hub',
              data: filteredData.map(
                (item: any) => item.daily_total_calculated_value,
              ),
            },
          ]}
          type='bar'
          height={400}
          options={{
            chart: {
              stacked: true,
              toolbar: {
                show: false,
              },
            },
            dataLabels: {
              enabled: false,
            },
            grid: {
              borderColor: 'rgba(130, 177, 255, 0.08)',
            },
            xaxis: {
              categories: filteredData.map((item: any) =>
                dayjs(item.evt_date).format('MMM DD'),
              ),
              labels: {
                style: {
                  fontSize: '11px',
                  fontFamily: "'Inter', sans-serif",
                  colors: filteredData.map(() => '#696c80'),
                },
              },
              axisTicks: {
                show: false,
              },
              axisBorder: {
                show: false,
              },
            },
            yaxis: {
              labels: {
                formatter: function(val) {
                  return formatCompact(val);
                },
                style: {
                  colors: ['#c7cad9'],
                  fontSize: '14px',
                  fontFamily: "'Inter', sans-serif",
                },
              },
            },
          }}
        />
      ) : (
        <Box
          width='100%'
          height='400px'
          className='flex items-center justify-center'
        >
          <p>{t('lhNoData')}</p>
        </Box>
      )}
    </Box>
  );
};

export default LiquidityHubAnalyticsTotal;
