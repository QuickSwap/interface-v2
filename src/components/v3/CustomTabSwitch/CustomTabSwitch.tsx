import React from 'react';
import { Box, Tab, Tabs } from '@material-ui/core';
import './CustomTabSwitch.scss';

interface tabItem {
  text: string;
  id: number;
  link: string;
}

interface CustomTabSwitchProps {
  width: number;
  height: number;
  items: tabItem[];
  selectedItem: tabItem;
  handleTabChange: (event: any, value: any) => void;
}

const CustomTabSwitch: React.FC<CustomTabSwitchProps> = ({
  width,
  height,
  items,
  selectedItem,
  handleTabChange,
}) => {
  return (
    <Box width={width}>
      <Tabs
        value={selectedItem?.id}
        onChange={handleTabChange}
        textColor='primary'
        indicatorColor='primary'
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
