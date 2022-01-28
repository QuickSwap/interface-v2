import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

export interface BarChartProps {
  data?: Array<number>;
  categories?: Array<any>;
  height?: number;
  onHover?: (index: number) => void;
  onMouseLeave?: () => void;
}

const useStyles = makeStyles(({ palette }) => ({
  barChartItem: {
    background:
      'linear-gradient(to bottom, #64fbd3, #00cff3 34%, #0098ff 63%, #004ce6)',
    opacity: 0.1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    cursor: 'pointer',
    '&:hover': {
      opacity: 0.8,
    },
  },
  categoryValues: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 12,
    marginRight: 8,
    '& p': {
      fontSize: 12,
      color: palette.text.disabled,
    },
  },
}));

const BarChart: React.FC<BarChartProps> = ({
  data = [],
  categories,
  height = 200,
  onHover,
  onMouseLeave,
}) => {
  const classes = useStyles();
  const maxValue = Math.max(...data);
  return (
    <Box onMouseLeave={onMouseLeave}>
      <Box display='flex' alignItems='flex-end' justifyContent='space-between'>
        {data.map((value, index) => (
          <Box
            key={index}
            className={classes.barChartItem}
            width={`calc(${100 / data.length}% - 2px)`}
            height={`${Math.max(6, (value / maxValue) * height)}px`} // set min height of bar to 6px for the items with small amount
            onMouseOver={() => onHover && onHover(index)}
          />
        ))}
      </Box>
      {categories && data.length > 0 && (
        <Box className={classes.categoryValues}>
          {categories.map((val, ind) => (
            <Typography key={ind}>{val}</Typography>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default BarChart;
