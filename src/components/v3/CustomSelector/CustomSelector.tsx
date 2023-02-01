import React from 'react';
import { Box } from 'theme/components';
import './CustomSelector.scss';

export interface SelectorItem {
  text: string;
  id: number;
  link: string;
  hasSeparator?: boolean;
}

interface CustomSelectorProps {
  height: string;
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
        <>
          {item.hasSeparator && (
            <Box
              margin='0 8px 0 0'
              height={height}
              className='customSelectorSeparator'
            />
          )}
          <Box
            key={item.id}
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
        </>
      ))}
    </Box>
  );
};

export default CustomSelector;
