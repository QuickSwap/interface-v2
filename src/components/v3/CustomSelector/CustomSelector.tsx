import React from 'react';
import { Box } from '@mui/material';
import styles from 'styles/components/v3/CustomSelector.module.scss';

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
