import React from 'react';
import { Box, Slider, SliderProps } from '@mui/material';
import 'components/styles/ColoredSlider.scss';

interface ColoredSliderProps extends SliderProps {
  handleChange: (
    event: React.ChangeEvent<any>,
    value: number | number[],
  ) => void;
}

const ColoredSlider: React.FC<ColoredSliderProps> = ({
  handleChange,
  ...props
}) => {
  return (
    <Box className='coloredSlider'>
      <Slider {...props} onChange={handleChange} />
    </Box>
  );
};

export default ColoredSlider;
