import React from 'react';
import { Box } from 'theme/components';
import './CustomTabSwitch.scss';

interface tabItem {
  text: string;
  id: number;
  link: string;
}

interface CustomTabSwitchProps {
  width: string;
  height: string;
  items: tabItem[];
  selectedItem: tabItem;
  handleTabChange: (value: any) => void;
}

const CustomTabSwitch: React.FC<CustomTabSwitchProps> = ({
  width,
  height,
  items,
  selectedItem,
  handleTabChange,
}) => {
  return (
    <Box className='customTabWrapper' width={width} height={height}>
      {items.map((item, ind) => (
        <Box
          className={`customTab ${
            selectedItem.id === item.id ? 'selectedTab' : ''
          }`}
          key={item.id}
          onClick={() => handleTabChange(ind)}
        >
          {item.text}
        </Box>
      ))}
    </Box>
  );
};

export default CustomTabSwitch;
