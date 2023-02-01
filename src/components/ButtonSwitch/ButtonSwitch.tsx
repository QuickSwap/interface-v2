import React from 'react';
import { Box } from 'theme/components';
import 'components/styles/ButtonSwitch.scss';

interface Item {
  label: React.ReactNode;
  icon?: any;
  value: string;
}

interface ButtonSwitchProps {
  items?: Item[];
  value?: string;
  onChange: (value: string) => void;
  height?: number;
  padding?: number;
  width?: string;
}

const ButtonSwitch: React.FC<ButtonSwitchProps> = ({
  items = [],
  height = 44,
  padding = 5,
  width = '100%',
  value,
  onChange,
}) => {
  const minHeight = height - padding * 2;

  return (
    <Box width={width} maxWidth='100%'>
      <Box className='buttonSwitchContainer' padding={`${padding}px`}>
        {items.map((item, index) => {
          return (
            <Box
              className={`buttonSwitchItem${
                item.value === value ? ' buttonSwitchItemActive' : ''
              }`}
              height={`${minHeight}px`}
              key={index}
              onClick={() => onChange(item.value)}
            >
              {item.label}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default ButtonSwitch;
