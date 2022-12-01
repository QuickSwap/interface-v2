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
const AreaChart: React.FC<ColumnChartProps> = ({
  categories = [],
  data = [],
  width = 500,
  height = 200,
  valueSuffix,
}) => {
  const dark = useIsDarkMode();

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
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories,
    },
    fill: {
      opacity: 1,
    },
    yaxis: {
      labels: {
        formatter: (y: number) => y.toFixed(0),
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

export default AreaChart;
