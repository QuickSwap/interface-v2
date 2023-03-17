import React from 'react';
import { Box } from '@mui/material';
import styles from 'styles/components/ChartType.module.scss';

interface ChartTypeProps {
  typeTexts: string[];
  chartTypes: number[];
  chartType: number;
  setChartType: (chartType: number) => void;
  size?: string;
  textClass?: string;
}

const ChartType: React.FC<ChartTypeProps> = ({
  typeTexts,
  chartTypes,
  chartType,
  setChartType,
  size = 'small',
  textClass = 'text-primaryText',
}) => {
  return (
    <Box className='flex flex-wrap items-center'>
      {chartTypes.map((value, index) => (
        <Box
          key={index}
          className={`${styles.chartType} ${
            size == 'big' ? styles.chartType_big : ''
          } ${
            chartType === value
              ? `bg-gray2 ${styles.chartType_selected}`
              : 'transparent'
          }`}
          onClick={() => setChartType(value)}
        >
          <span className={textClass}>{typeTexts[index]}</span>
        </Box>
      ))}
    </Box>
  );
};

export default ChartType;
