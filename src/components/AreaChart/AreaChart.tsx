import React from 'react';
import { createStyles, makeStyles, useTheme } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import Chart from 'react-apexcharts';
import moment from 'moment';
import { useIsDarkMode } from 'state/user/hooks';

const useStyles = makeStyles(({ palette }) =>
  createStyles({
    chartContainer: {
      flex: 1,
      marginTop: -20,
    },
    categoryValues: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: -40,
      '& p': {
        fontSize: 14,
        lineHeight: '18px',
        color: palette.text.secondary,
        opacity: 0.47,
      },
    },
    yAxis: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      marginRight: 8,
      marginBottom: 50,
      '& p': {
        fontSize: 11,
        fontWeight: 500,
        color: palette.text.secondary,
      },
    },
  }),
);

export interface AreaChartProps {
  backgroundColor?: string;
  data?: Array<any>;
  categories?: Array<string | null>;
  width?: number | string;
  height?: number | string;
  showYAxis?: boolean;
  multiDimension?: boolean;
}
const AreaChart: React.FC<AreaChartProps> = ({
  backgroundColor = '#004ce6',
  categories = [],
  data = [],
  width = 500,
  height = 200,
  showYAxis = false,
  multiDimension = false,
}) => {
  const dark = useIsDarkMode();
  const theme = useTheme();

  const strokeColor = '#00dced';
  const gradientColor = dark ? '#64fbd3' : '#D4F8FB';

  const yMax = multiDimension
    ? Math.ceil(Math.max(...data.map((item) => item.value)) / 10) * 10
    : 0;
  const yMin = multiDimension
    ? Math.floor(Math.min(...data.map((item) => item.value)) / 10) * 10
    : 0;

  const yCount = (yMax - yMin) / 10;

  const options = {
    chart: {
      sparkline: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
      width: '100%',
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
      min: multiDimension ? yMin : undefined,
      max: multiDimension ? yMax : undefined,
      tickAmount: yCount,
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
    tooltip: {
      enabled: true,
      theme: dark ? 'dark' : 'light',
      fillSeriesColor: false,
      custom: (props: any) => {
        return categories[props.dataPointIndex]
          ? `<div class="tooltip" style="display: flex; flex-direction: column; box-shadow: none; border-radius: 12px; background: transparent;">` +
              `<span style="padding: 0.5rem; border: 1px solid ${
                dark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'
              }; border-radius: 12px 12px 0 0; background: ${
                dark ? 'rgba(0, 0, 0, 0.91)' : 'rgba(255, 255, 255, 0.91)'
              }; color: ${dark ? '#646464' : '#8D97A0'};">` +
              moment(
                categories[props.dataPointIndex],
                'YYYY/MM/DD HH:mm',
              ).format('DD MMM, h:mm A') +
              '</span>' +
              `<span style="padding: 0.5rem; border: 1px solid ${
                dark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'
              }; border-top: none; border-radius: 0 0 12px 12px; background: ${
                dark ? 'rgba(0, 0, 0, 0.91)' : 'rgba(255, 255, 255, 0.91)'
              }; color: ${dark ? '#646464' : '#8D97A0'};">` +
              `${multiDimension ? 'Profit' : 'Price level'}: <b style="color: ${
                dark ? 'white' : 'rgba(0, 0, 0, 0.91)'
              };">` +
              (multiDimension
                ? data[props.dataPointIndex].value1 + '%'
                : props.series[props.seriesIndex][props.dataPointIndex]) +
              '</b></span>' +
              '</div>'
          : '';
      },
    },
  };

  const series = [
    {
      name: 'Prices',
      data: multiDimension ? data.map((item) => item.value) : data,
    },
  ];

  const classes = useStyles();

  const yAxisValues = Array.from({ length: yCount + 1 }).map((_, index) =>
    Math.round(yMax - (index * (yMax - yMin)) / yCount),
  );

  return (
    <Box display='flex' mt={2.5} width={width}>
      {showYAxis && (
        <Box className={classes.yAxis}>
          {yAxisValues.map((item, index) => (
            <Typography key={index}>
              {item}
              {item === 0 ? '' : '%'}
            </Typography>
          ))}
        </Box>
      )}
      <Box className={classes.chartContainer}>
        <Chart
          options={options}
          series={series}
          type='area'
          width='100%'
          height={height}
        />
        <Box className={classes.categoryValues}>
          {categories.map((val, ind) => (
            <Typography key={ind}>{val}</Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default AreaChart;
