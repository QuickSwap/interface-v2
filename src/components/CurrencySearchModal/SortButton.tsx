import React from 'react';
import { Box } from '@mui/material';
import styles from 'styles/components/CurrencySearchModal.module.scss';

interface SortButtonProps {
  toggleSortOrder: () => void;
  ascending: boolean;
}

const SortButton: React.FC<SortButtonProps> = ({
  toggleSortOrder,
  ascending,
}) => {
  return (
    <Box className={styles.filterWrapper} onClick={toggleSortOrder}>
      <p>{ascending ? '↑' : '↓'}</p>
    </Box>
  );
};

export default SortButton;
