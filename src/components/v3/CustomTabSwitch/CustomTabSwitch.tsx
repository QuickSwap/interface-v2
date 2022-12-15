import React from 'react';
import { Box, Divider } from '@material-ui/core';
import './CustomTabSwitch.scss';

export interface TabItem {
  text: string;
  id: number;
  link: string;
  hasSeparator?: boolean;
}

interface CustomTabSwitchProps {
  height: number;
  items: TabItem[];
  selectedItem: TabItem;
  handleTabChange: (item: TabItem) => void;
}

const CustomTabSwitch: React.FC<CustomTabSwitchProps> = ({
  height,
  items,
  selectedItem,
  handleTabChange,
}) => {
  return (
    <Box className='customTabWrapper'>
      {items.map((item) => (
        <>
          {item.hasSeparator && (
            <Box mr={1} height={height} className='customTabSeparator' />
          )}
          <Box
            key={item.id}
            height={height}
            className={`customTab ${
              item.id === selectedItem.id ? 'selectedCustomTab' : ''
            }`}
            onClick={() => {
              handleTabChange(item);
            }}
          >
            <small>{item.text}</small>
          </Box>
        </>
      ))}
    </Box>
  );
};

export default CustomTabSwitch;
