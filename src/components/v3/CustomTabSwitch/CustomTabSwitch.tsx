import React from 'react';
import { Box, Tab, Tabs } from '@mui/material';

interface tabItem {
  text: string | React.ReactNode;
  id: string;
}

interface CustomTabSwitchProps {
  width?: number | string;
  height: number;
  items: tabItem[];
  value: string;
  handleTabChange: (item: string) => void;
}

const CustomTabSwitch: React.FC<CustomTabSwitchProps> = ({
  width = '100%',
  height,
  items,
  value,
  handleTabChange,
}) => {
  return (
    <Box className='customTabWrapper' width={width} height={height}>
      <Tabs
        value={value}
        onChange={(_, value) => {
          const itemToSelect = items.find((item) => item.id === value);
          if (itemToSelect) {
            handleTabChange(itemToSelect.id);
          }
        }}
      >
        {items?.map((_item) => (
          <Tab value={_item?.id} key={_item?.id} label={_item.text} />
        ))}
      </Tabs>
    </Box>
  );
};

export default CustomTabSwitch;
