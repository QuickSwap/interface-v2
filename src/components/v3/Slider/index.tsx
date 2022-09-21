import React, { useCallback } from 'react';
import { StyledRangeInput } from './styled';

interface InputSliderProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  size?: number;
  disabled: boolean;
}

export default function Slider({
  value,
  onChange,
  min = 0,
  step = 1,
  max = 100,
  size = 28,
  disabled,
  ...rest
}: InputSliderProps) {
  const changeCallback = useCallback(
    (e) => {
      onChange(parseInt(e.target.value));
    },
    [onChange],
  );

  return (
    <StyledRangeInput
      size={size}
      {...rest}
      type='range'
      value={value}
      style={{ padding: '15px 0' }}
      onChange={changeCallback}
      aria-labelledby='input slider'
      step={step}
      min={min}
      max={max}
      disabled={disabled}
    />
  );
}
