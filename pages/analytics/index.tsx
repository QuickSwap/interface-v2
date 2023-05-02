import React from 'react';
import { NextPage, GetStaticProps } from 'next';

const AnalyticsPage: NextPage = () => {
  return <></>;
};

export const getStaticProps: GetStaticProps = async () => {
  return {
    redirect: {
      destination: '/analytics/total',
      permanent: true,
    },
  };
};

export default AnalyticsPage;
