import React from 'react';
import { Box } from '@mui/material';
import QuickIcon from 'svgs/quickIcon.svg';
import 'components/styles/Footer.scss';

const Footer: React.FC = () => {
  const copyrightYear = new Date().getFullYear();

  return (
    <Box className='footer'>
      <QuickIcon />
      <p>© {copyrightYear} QuickSwap.</p>
    </Box>
  );
};

export default Footer;
