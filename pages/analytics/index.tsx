import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

const AnalyticsPage: NextPage = () => {
  const router = useRouter();
  useEffect(() => {
    router.push('/analytics/total');
  }, [router]);
  return <></>;
};

export default AnalyticsPage;
