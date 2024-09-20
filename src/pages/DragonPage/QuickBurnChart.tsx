import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import { Box } from '@material-ui/core';
import 'pages/styles/dragon.scss';
const CHART_DURATION_TEXTS = ['1D', '1W', '1M', 'All'];

const QuickBurnChart: React.FC = () => {
  const [chartType, setChartType] = useState(0);
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
      colors: ['#3e92fe'],
      curve: 'smooth' as any,
    },
    markers: {
      colors: ['#3e92fe'],
      strokeWidth: 0,
    },
    fill: {
      type: 'gradient',
      colors: ['#448aff'],
      gradient: {
        gradientToColors: ['#004ce6'],
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.15,
        stops: [0, 100],
      },
    },
    xaxis: {
      categories: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
      ],
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
  };

  const series = [
    {
      name: 'Desktops',
      data: [10, 41, 35, 51, 49, 62, 69, 91, 148],
    },
  ];

  return (
    <Box className='dragonLairBg'>
      <Box className='dragonQuickBurnChart'>
        <Box className='sub-title'>
          <h5>QUICK Burn Data</h5>
          <small>Total Burned: 245,244 QUICK • $101,231.12</small>
        </Box>
        <Box className='chart-type'>
          {CHART_DURATION_TEXTS.map((type, index) => (
            <Box
              key={`chart-type-${index}`}
              className={`chart-type-button ${
                chartType == index ? 'selected' : 'unselected'
              } `}
              onClick={() => setChartType(index)}
            >
              {type}
            </Box>
          ))}
        </Box>
        <Box>
          <Chart
            options={options}
            series={series}
            type='area'
            width='100%'
            height={250}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default QuickBurnChart;
