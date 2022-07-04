import React, { useEffect, useRef } from 'react';
import { StyledSelectableBox } from './CommonStyledElements';
// import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';

export default function RangeGraph() {
  const canvas: any = useRef();

  const options: any = {
    series: [
      {
        data: [0, 34, 44, 54, 21, 12, 43, 33, 23, 66, 66, 58],
      },
    ],
    chart: {
      type: 'line',
      height: 350,
    },
    stroke: {
      curve: 'stepline',
    },
    grid: {
      show: false,
    },

    dataLabels: {
      enabled: false,
    },
    // title: {
    //   text: 'Stepline Chart',
    //   align: 'left',
    // },
    markers: {
      hover: {
        sizeOffset: 4,
      },
    },
  };

  // // initialize the canvas context
  // useEffect(() => {
  //   chart.render();
  // }, []);

  return (
    <StyledSelectableBox
      // height={'100%'}
      width='100%'
      className='flex flex-col justify-evenly items-center'
      borderRadius={12}
    >
      <Chart
        options={options}
        series={options.series}
        type='line'
        height={250}
        width={400}
      />
    </StyledSelectableBox>
  );
}
