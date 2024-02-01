import React, { useMemo } from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import Chart from 'react-apexcharts';
import { formatCompact } from 'utils';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

const LiquidityHubAnalyticsCoinVolume: React.FC<{
  data: any[] | undefined;
}> = ({ data }) => {
  const { t } = useTranslation();

  const volumeDates = useMemo(() => {
    if (!data) return [];
    return data
      .reduce<string[]>((memo, item) => {
        if (item && item.timestamp) {
          const date = dayjs.utc(item.timestamp).format('YYYY-MM-DD');
          if (!memo.includes(date)) {
            memo.push(date);
          }
        }
        return memo;
      }, [])
      .sort((date1, date2) => {
        return dayjs(date1).isBefore(dayjs(date2)) ? -1 : 1;
      });
  }, [data]);

  const volumeData = useMemo(() => {
    if (!data) return [];

    const tokens = data.reduce<string[]>((memo, item) => {
      if (item && item.srcTokenSymbol) {
        if (!memo.includes(item.srcTokenSymbol)) {
          memo.push(item.srcTokenSymbol);
        }
      }
      return memo;
    }, []);
    return tokens.map((token) => {
      return {
        name: token,
        data: volumeDates.map((date) =>
          data
            .filter(
              (item) =>
                item &&
                item.srcTokenSymbol &&
                item.timestamp &&
                item.srcTokenSymbol === token &&
                item.timestamp.includes(date),
            )
            .reduce((total, item) => total + item.dexAmountUSD, 0),
        ),
      };
    });
  }, [data, volumeDates]);

  return (
    <>
      {data && data.length > 0 ? (
        <Chart
          series={volumeData}
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
            legend: {
              position: 'right',
              fontSize: '14px',
              fontFamily: "'Inter', sans-serif",
              labels: {
                colors: ['#c7cad9'],
              },
              markers: {
                width: 10,
                height: 10,
                radius: 10,
              },
            },
            xaxis: {
              categories: volumeDates.map((item) =>
                dayjs(item).format('MMM DD'),
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
        <Box
          width='100%'
          height='400px'
          className='flex items-center justify-center'
        >
          <p>{t('lhNoData')}</p>
        </Box>
      )}
    </>
  );
};

export default LiquidityHubAnalyticsCoinVolume;
