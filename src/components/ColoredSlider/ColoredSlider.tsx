import React from 'react';
import ReactSlider, { ReactSliderProps } from 'react-slider';
import 'components/styles/ColoredSlider.scss';

const ColoredSlider: React.FC<ReactSliderProps> = ({ ...props }) => {
  return (
    <ReactSlider
      {...props}
      className='coloredSlider'
      thumbClassName='coloredSliderThumb'
      trackClassName='colorSliderTrack'
      renderThumb={(props) => <div {...props} />}
    />
  );
};

export default ColoredSlider;
