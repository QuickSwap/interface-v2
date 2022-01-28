import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';

const useStyles = makeStyles(({ palette }) => ({
  chartType: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 20,
    padding: '0 8px',
    borderRadius: 10,
    cursor: 'pointer',
    '& span': {
      color: palette.text.primary,
    },
  },
}));

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
  const classes = useStyles();
  const { palette } = useTheme();

  return (
    <Box display='flex' alignItems='center'>
      {chartTypes.map((value, index) => (
        <Box
          key={index}
          className={classes.chartType}
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
