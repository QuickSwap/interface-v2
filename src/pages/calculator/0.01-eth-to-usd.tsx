import { Box } from '@mui/material';
import React, { useEffect } from 'react';
import { Calculator } from 'components/pages/calculator/Calculator';
import { Graph } from 'components/pages/calculator/Graph';
import { AboutSecction } from 'components/pages/calculator/AboutSection';
import { FaqSection } from 'components/pages/calculator/FaqSection';
import { HistoricalTable } from 'components/pages/calculator/HistoricalTable';
import { StepsSection } from 'components/pages/calculator/StepsSection';
import styles from 'styles/pages/Calculator.module.scss';
import { useQuery } from '@tanstack/react-query';
import { ChainId } from '@uniswap/sdk';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const CalculatorPage: React.FC = () => {
  const pairAddress = '0x55caabb0d2b704fd0ef8192a7e35d8837e678207';
  const version = 'v3';
  const chainId = ChainId.MATIC;

  const fetchChartData = async () => {
    if (chainId && version) {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_LEADERBOARD_APP_URL}/analytics/top-pair-chart-data/${pairAddress}/1/${version}?chainId=${chainId}`,
      );
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      return data && data.data ? data.data : null;
    }
    return null;
  };

  const fetchPairData = async () => {
    if (chainId && version) {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_LEADERBOARD_APP_URL}/analytics/top-pair-details/${pairAddress}/${version}?chainId=${chainId}`,
      );
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      return data && data.data ? data.data : null;
    }
    return null;
  };

  const { data } = useQuery({
    queryKey: ['fetchAnalyticsPairDetails', pairAddress, version, chainId],
    queryFn: fetchPairData,
    refetchInterval: 60000,
  });

  const { data: chartData } = useQuery({
    queryKey: ['fetchAnalyticsChartDetails', pairAddress, version, chainId],
    queryFn: fetchChartData,
    refetchInterval: 60000,
  });

  useEffect(() => {
    window?.scrollTo(0, 0);
  }, []);

  const pairData = data ? data.pairData : undefined;
  const pairChartData = chartData ? chartData.pairChartData : undefined;

  const v3Rate = pairData?.token0Price || 0;
  const prices = Array.isArray(pairChartData)
    ? pairChartData.map((p) => p.token0Price * 0.01)
    : [];
  const dates = Array.isArray(pairChartData)
    ? pairChartData.map((p) => p.date)
    : [];

  return (
    <Box width='100%' p={2} mb={3} className={styles.calculatorPage}>
      <Calculator factor={v3Rate} />
      <Graph factor={v3Rate} dates={dates} prices={prices} />
      <AboutSecction factor={v3Rate} />
      <StepsSection />
      <FaqSection />
      <HistoricalTable prices={prices} dates={dates} />
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

export default CalculatorPage;
