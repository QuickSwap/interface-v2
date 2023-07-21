import React from 'react';
import Head from 'next/head';
import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Image404 from 'svgs/404.svg';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps, InferGetServerSidePropsType } from 'next';

const Custom404Page = (
  _props: InferGetServerSidePropsType<typeof getStaticProps>,
) => {
  const { t } = useTranslation();
  const router = useRouter();
  const goBack = () => {
    router.back();
  };

  return (
    <>
      <Head>
        <title>404 Page</title>
      </Head>
      <div
        id='landing-page'
        style={{
          width: '100%',
        }}
      >
        <Box
          display='flex'
          className='text-center'
          sx={{
            height: '100%',
            minHeight: 'calc(100vh - 232px)',
          }}
        >
          <Box marginTop={'auto'} marginBottom={'auto'} ml={'auto'} mr='auto'>
            <Box>
              <Image404 />
            </Box>
            <Box my={2}>
              <Typography variant='h5'>{t('pageNotFound')}</Typography>
            </Box>
            <Box
              marginLeft={'auto'}
              marginRight={'auto'}
              my={2}
              className='text-secondary text-center'
              sx={{
                width: { xs: '100%', md: '600px' },
              }}
            >
              {t('pageNotFoundDesc')}
            </Box>
            <Box>
              <Button onClick={goBack}>{t('goBack')}</Button>
            </Box>
          </Box>
        </Box>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

export default Custom404Page;
