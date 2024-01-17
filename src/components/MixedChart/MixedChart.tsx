import React from 'react';
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import { useIsDarkMode } from 'state/user/hooks';

export interface MixedChartProps {
  data?: Array<any>;
  categories?: Array<string | null>;
  width?: number | string;
  height?: number | string;
}
const MixedChart: React.FC<MixedChartProps> = ({
  categories = [],
  data = [],
  width = 500,
  height = 200,
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
      enabled: true,
      enabledOnSeries: lineSeries,
    },
    stroke: {
      show: true,
      width: 2,
      curve: 'smooth' as any,
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
    yaxis: [
      {
        labels: {
          formatter: (y: number) => y.toFixed(0),
          style: {
            colors: ['#c7cad9'],
          },
        },
      },
      {
        opposite: true,
        labels: {
          formatter: (y: number) => y.toFixed(0),
          style: {
            colors: ['#c7cad9'],
          },
        },
      },
    ],
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
        const seriesName = w.globals.seriesNames[seriesIndex];
        return `<div class="areaChartTooltip"><small>${seriesName}</small><small><b>${
          seriesName !== 'V/R Ratio' && seriesName !== 'Avg # Txns' ? '$ ' : ''
        }${series[seriesIndex][dataPointIndex].toLocaleString(
          'us',
        )}</b></small></div>`;
      },
    },
  };

  return (
    <Chart
      options={options}
      series={data}
      type='line'
      width={width}
      height={height}
    />
  );
};

export default MixedChart;
