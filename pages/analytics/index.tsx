import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

const AnalyticsPage: NextPage = () => {
  const router = useRouter();
  useEffect(() => {
    router.push('/analytics/total');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
};

export default AnalyticsPage;
