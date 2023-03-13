import React from 'react';
import { Box, Tab, Tabs } from '@material-ui/core';
import './CustomTabSwitch.scss';

interface tabItem {
  text: string;
  id: string;
}

interface CustomTabSwitchProps {
  width?: number | string;
  height: number;
  items: tabItem[];
  selectedItem: tabItem;
  handleTabChange: (item: tabItem) => void;
}

const CustomTabSwitch: React.FC<CustomTabSwitchProps> = ({
  width = '100%',
  height,
  items,
  selectedItem,
  handleTabChange,
}) => {
  return (
    <Box className='customTabWrapper' width={width} height={height}>
      <Tabs
        value={selectedItem?.id}
        onChange={(evt, value) => {
          const itemToSelect = items.find((item) => item.id === value);
          if (itemToSelect) {
            handleTabChange(itemToSelect);
          }
        }}
      >
        {items?.map((_item) => (
          <Tab
            value={_item?.id}
            key={_item?.id}
            className='tabText'
            label={_item.text}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default CustomTabSwitch;
