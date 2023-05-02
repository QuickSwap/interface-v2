import React from 'react';
import Head from 'next/head';
import { NextPage, GetStaticProps } from 'next';

const Custom404Page: NextPage = () => {
  return (
    <>
      <Head>
        <title>404 Page</title>
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

export default Custom404Page;
