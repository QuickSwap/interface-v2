import React from 'react';
import { Box } from '@mui/material';
import styles from './CustomSelector.module.scss';

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
    <Box className={styles.customSelectorWrapper}>
      {items.map((item) => (
        <Box key={item.id} className='flex items-center'>
          {item.hasSeparator && (
            <Box
              mr={1}
              height={height}
              className={styles.customSelectorSeparator}
            />
          )}
          <Box
            height={height}
            className={`${styles.customSelector} ${
              item.id === selectedItem.id ? styles.selectedCustomSelector : ''
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
