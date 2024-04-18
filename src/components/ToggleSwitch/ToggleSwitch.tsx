import React from 'react';
import { Box } from '@material-ui/core';
import 'components/styles/ToggleSwitch.scss';

const ToggleSwitch: React.FC<{
  disabled?: boolean;
  toggled: boolean;
  onToggle: () => void;
}> = ({ toggled, onToggle, disabled }) => {
  return (
    <Box
      className={`toggleWrapper${toggled ? ' toggled' : ''}${
        disabled ? ' opacity-disabled' : ' cursor-pointer'
      }`}
      onClick={() => {
        if (!disabled) {
          onToggle();
        }
      }}
    >
      <Box className='innerCircle' />
    </Box>
  );
};

export default ToggleSwitch;
