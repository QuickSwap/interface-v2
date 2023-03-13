import React from 'react';
import { Box } from '@material-ui/core';
import './CustomSelector.scss';

export interface SelectorItem {
  text: string;
  id: number;
  link: string;
  hasSeparator?: boolean;
}

interface CustomSelectorProps {
  height: number;
  items: SelectorItem[];
  selectedItem: SelectorItem;
  handleChange: (item: SelectorItem) => void;
}

const CustomSelector: React.FC<CustomSelectorProps> = ({
  height,
  items,
  selectedItem,
  handleChange,
}) => {
  return (
    <Box className='customSelectorWrapper'>
      {items.map((item) => (
        <Box key={item.id} className='flex items-center'>
          {item.hasSeparator && (
            <Box mr={1} height={height} className='customSelectorSeparator' />
          )}
          <Box
            height={height}
            className={`customSelector ${
              item.id === selectedItem.id ? 'selectedCustomSelector' : ''
            }`}
            onClick={() => {
              handleChange(item);
            }}
          >
            <small>{item.text}</small>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default CustomSelector;
