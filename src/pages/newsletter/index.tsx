import React from 'react';
import { Box } from '@mui/material';
import SwapNewsletterSignup from 'components/pages/swap/SwapNewsletterSignUp';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

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

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

export default NewsletterPage;
