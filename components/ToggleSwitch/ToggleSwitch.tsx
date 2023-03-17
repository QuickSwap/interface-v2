import React from 'react';
import { Box } from '@mui/material';
import styles from 'styles/components/ToggleSwitch.module.scss';

const ToggleSwitch: React.FC<{ toggled: boolean; onToggle: () => void }> = ({
  toggled,
  onToggle,
}) => {
  return (
    <Box
      className={`${styles.toggleWrapper} ${toggled ? styles.toggled : ''}`}
      onClick={onToggle}
    >
      <Box className={styles.innerCircle} />
    </Box>
  );
};

export default ToggleSwitch;
