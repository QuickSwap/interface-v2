import React from 'react';
import { Box, Slider, SliderProps } from '@mui/material';

interface ColoredSliderProps extends SliderProps {
  handleChange: (event: Event, value: number | number[]) => void;
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
