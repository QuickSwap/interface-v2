import React from 'react';
import { Box } from '@material-ui/core';
import SwapNewsletterSignup from 'pages/SwapPage/SwapNewsletterSignUp';
import 'pages/styles/swap.scss';

const NewsletterPage: React.FC = () => {
  return (
    <Box
      width='100%'
      maxWidth='550px'
      padding='32px 0 64px'
      id='newsletterPage'
      minHeight='calc(100vh - 600px)'
    >
      <SwapNewsletterSignup />
    </Box>
  );
};

export default NewsletterPage;
