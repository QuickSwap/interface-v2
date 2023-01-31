import React from 'react';
import Chart from 'react-apexcharts';
import { useIsDarkMode } from 'state/user/hooks';
import 'components/styles/AreaChart.scss';

export interface ColumnChartProps {
  data?: Array<any>;
  categories?: Array<string | null>;
  width?: number | string;
  height?: number | string;
  valueSuffix?: string;
}
const ColumnChart: React.FC<ColumnChartProps> = ({
  categories = [],
  data = [],
  width = 500,
  height = 200,
  valueSuffix,
}) => {
  const dark = useIsDarkMode();
  const lineSeries = data
    .map((item, ind) => {
      return { type: item.type, ind };
    })
    .filter((item) => item.type && item.type === 'line')
    .map((item) => item.ind);

  const options = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded',
      },
    },
    dataLabels: {
      enabled: false,
      enabledOnSeries: lineSeries,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: categories.map((_) => '#c7cad9'),
        },
      },
    },
    fill: {
      opacity: 1,
    },
    yaxis: {
      labels: {
        formatter: (y: number) => y.toFixed(0),
        style: {
          colors: ['#c7cad9'],
        },
      },
    },
    legend: {
      labels: {
        colors: '#c7cad9',
        useSeriesColors: false,
      },
    },
    tooltip: {
      theme: dark ? 'dark' : 'light',
      fillSeriesColor: false,
      custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
        return `<div class="areaChartTooltip"><small>${
          w.globals.seriesNames[seriesIndex]
        }</small><small><b>${series[seriesIndex][dataPointIndex].toLocaleString(
          'us',
        )} ${valueSuffix}</b></small></div>`;
      },
    },
  };

  return (
    <Chart
      options={options}
      series={data}
      type='bar'
      width={width}
      height={height}
    />
  );
};

export default ColumnChart;
