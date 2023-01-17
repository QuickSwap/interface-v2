import React from 'react';
import ReactSlider, { ReactSliderProps } from 'react-slider';
import 'components/styles/ColoredSlider.scss';

const ColoredSlider: React.FC<ReactSliderProps> = ({ ...props }) => {
  return (
    <div className='coloredSlider'>
      <ReactSlider {...props} />
    </div>
  );
};

export default ColoredSlider;
