import React from 'react';
import { Box } from '@material-ui/core';
import 'components/styles/BarChart.scss';

export interface BarChartProps {
  data?: Array<number>;
  isV3: boolean;
  categories?: Array<any>;
  height?: number;
  onHover?: (index: number) => void;
  onMouseLeave?: () => void;
}

const BarChart: React.FC<BarChartProps> = ({
  data = [],
  isV3,
  categories,
  height = 200,
  onHover,
  onMouseLeave,
}) => {
  const maxValue = Math.max(...data);
  return (
    <Box onMouseLeave={onMouseLeave}>
      <Box className='flex items-end justify-between'>
        {data.map((value, index) => (
          <Box
            key={index}
            className={`barChartItem ${isV3 && 'isV3'}`}
            width={`calc(${100 / data.length}% - 2px)`}
            height={`${Math.max(6, (value / maxValue) * height)}px`} // set min height of bar to 6px for the items with small amount
            onMouseOver={() => onHover && onHover(index)}
          />
        ))}
      </Box>
      {categories && data.length > 0 && (
        <Box className={`categoryValues`} mt={2}>
          {categories.map((val, ind) => (
            <p key={ind}>{val}</p>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default BarChart;
