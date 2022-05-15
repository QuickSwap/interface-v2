import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import 'components/styles/ChartType.scss';

interface ChartTypeProps {
  typeTexts: string[];
  chartTypes: number[];
  chartType: number;
  setChartType: (chartType: number) => void;
}

const ChartType: React.FC<ChartTypeProps> = ({
  typeTexts,
  chartTypes,
  chartType,
  setChartType,
}) => {
  const { palette } = useTheme();

  return (
    <Box display='flex' alignItems='center'>
      {chartTypes.map((value, index) => (
        <Box
          key={index}
          className='chartType'
          bgcolor={chartType === value ? palette.grey.A400 : 'transparent'}
          onClick={() => setChartType(value)}
        >
          <Typography variant='caption'>{typeTexts[index]}</Typography>
        </Box>
      ))}
    </Box>
  );
};

export default ChartType;
