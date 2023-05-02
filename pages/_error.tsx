import React from 'react';
import Head from 'next/head';
import { NextPage, GetStaticProps } from 'next';

const ErrorPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Error Page</title>
      </Head>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  return {
    redirect: {
      destination: '/',
      permanent: true,
    },
  };
};

export default ErrorPage;
