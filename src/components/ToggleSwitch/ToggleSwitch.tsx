import React from 'react';
import 'components/styles/ToggleSwitch.scss';

const ToggleSwitch: React.FC<{ toggled: boolean; onToggle: () => void }> = ({
  toggled,
  onToggle,
}) => {
  return (
    <div
      className={`toggleWrapper${toggled ? ' toggled' : ''}`}
      onClick={onToggle}
    >
      <div className='innerCircle' />
    </div>
  );
};

export default ToggleSwitch;
