import React from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@material-ui/lab';
import Chart from 'react-apexcharts';
import { formatCompact } from 'utils';
import dayjs from 'dayjs';

const LiquidityHubAnalyticsTotal: React.FC = () => {
  const { t } = useTranslation();

  const fetchAnalyticsDaily = async () => {
    const apiURL = 'https://hub.orbs.network/analytics-daily/v1';
    try {
      const res = await fetch(apiURL);
      const data = await res.json();
      return data?.result?.rows ?? [];
    } catch {
      return [];
    }
  };

  const { isLoading, data: lhData } = useQuery({
    queryKey: ['fetchLHAnalyticsDaily'],
    queryFn: fetchAnalyticsDaily,
    refetchInterval: 600000,
  });

  const data = lhData ?? [];

  return (
    <Box className='panel'>
      <p>{t('liquidityHub')}</p>
      {isLoading ? (
        <Skeleton width='100%' height={400} />
      ) : data && data.length > 0 ? (
        <Chart
          series={[
            {
              name: 'Liquidity Hub',
              data: data.map((item: any) => item.daily_total_calculated_value),
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
              categories: data.map((item: any) =>
                dayjs(item.evt_date).format('MMM DD'),
              ),
              labels: {
                style: {
                  fontSize: '11px',
                  fontFamily: "'Inter', sans-serif",
                  colors: data.map(() => '#696c80'),
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
        <Box width='100%' height='400px'>
          <p>{t('lhNoData')}</p>
        </Box>
      )}
    </Box>
  );
};

export default LiquidityHubAnalyticsTotal;
