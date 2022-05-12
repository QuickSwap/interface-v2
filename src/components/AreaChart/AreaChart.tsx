import React from 'react';
import { Box, Typography } from '@material-ui/core';
import Chart from 'react-apexcharts';
import moment from 'moment';
import { useIsDarkMode } from 'state/user/hooks';
import { formatCompact, formatNumber } from 'utils';
import 'components/styles/AreaChart.scss';

export interface AreaChartProps {
  backgroundColor?: string;
  data?: Array<any>;
  dates?: Array<any>;
  yAxisValues?: Array<number>;
  categories?: Array<string | null>;
  width?: number | string;
  height?: number | string;
}
const AreaChart: React.FC<AreaChartProps> = ({
  backgroundColor = '#004ce6',
  categories = [],
  data = [],
  dates = [],
  yAxisValues,
  width = 500,
  height = 200,
}) => {
  const dark = useIsDarkMode();

  const strokeColor = '#00dced';
  const gradientColor = dark ? '#64fbd3' : '#D4F8FB';

  const yMax = yAxisValues
    ? Math.max(...yAxisValues.map((val) => Number(val)))
    : 0;
  const yMin = yAxisValues
    ? Math.min(...yAxisValues.map((val) => Number(val)))
    : 0;

  const options = {
    chart: {
      sparkline: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
      width: '100%',
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 2,
      colors: [strokeColor],
      curve: 'smooth' as any,
    },
    markers: {
      colors: [strokeColor],
      strokeWidth: 0,
    },
    fill: {
      type: 'gradient',
      colors: [gradientColor],
      gradient: {
        gradientToColors: [backgroundColor],
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.15,
        stops: [0, 100],
      },
    },
    xaxis: {
      categories: categories.map(() => ''),
      axisBorder: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: new Array(categories.length).fill(
            dark ? '#646464' : '#CACED3',
          ),
        },
      },
    },
    yaxis: {
      show: false,
      min: yAxisValues ? yMin : undefined,
      max: yAxisValues ? yMax : undefined,
      tickAmount: yAxisValues?.length,
    },
    grid: {
      show: false,
      padding: {
        left: 0,
        right: 0,
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: true,
      theme: dark ? 'dark' : 'light',
      fillSeriesColor: false,
      custom: ({ series, seriesIndex, dataPointIndex }: any) => {
        return (
          `<div class="tooltip" style="display: flex; flex-direction: column; box-shadow: none; border-radius: 12px; background: transparent;">` +
          `<span style="padding: 0.5rem; border: 1px solid ${
            dark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'
          }; border-radius: 12px 12px 0 0; background: ${
            dark ? 'rgba(0, 0, 0, 0.91)' : 'rgba(255, 255, 255, 0.91)'
          }; color: ${dark ? '#646464' : '#8D97A0'};">` +
          moment(dates[dataPointIndex] * 1000).format('MMM DD, YYYY') +
          '</span>' +
          `<span style="padding: 0.5rem; border: 1px solid ${
            dark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'
          }; border-top: none; border-radius: 0 0 12px 12px; background: ${
            dark ? 'rgba(0, 0, 0, 0.91)' : 'rgba(255, 255, 255, 0.91)'
          }; color: ${dark ? '#646464' : '#8D97A0'};"><b style="color: ${
            dark ? 'white' : 'rgba(0, 0, 0, 0.91)'
          };">$` +
          formatCompact(series[seriesIndex][dataPointIndex]) +
          '</b></span>' +
          '</div>'
        );
      },
    },
  };

  const series = [
    {
      name: 'Prices',
      data,
    },
  ];

  return (
    <Box display='flex' mt={2.5} width={width}>
      <Box className='chartContainer'>
        <Chart
          options={options}
          series={series}
          type='area'
          width='100%'
          height={height}
        />
        <Box className='categoryValues' mt={-5}>
          {categories.map((val, ind) => (
            <Typography key={ind}>{val}</Typography>
          ))}
        </Box>
      </Box>
      {yAxisValues && (
        <Box className='yAxis'>
          {yAxisValues.map((value, index) => (
            <Typography key={index}>
              $
              {// this is to show small numbers less than 0.0001
              value > 0.0001 ? formatCompact(value) : formatNumber(value)}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default AreaChart;
