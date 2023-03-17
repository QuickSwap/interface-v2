import React from 'react';
import { Box } from '@mui/material';
import QuickIcon from 'svgs/quickIcon.svg';
import styles from 'styles/components/Footer.module.scss';

const Footer: React.FC = () => {
  const copyrightYear = new Date().getFullYear();

  return (
    <Box className={styles.footer}>
      <QuickIcon />
      <p>© {copyrightYear} QuickSwap.</p>
    </Box>
  );
};

export default Footer;
