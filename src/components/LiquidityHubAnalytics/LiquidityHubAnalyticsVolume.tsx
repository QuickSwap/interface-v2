import React from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@material-ui/lab';
import Chart from 'react-apexcharts';
import { formatCompact } from 'utils';
import dayjs from 'dayjs';
import { useLHAnalyticsDaily } from 'hooks/useLHAnalytics';

interface Props {
  startTime?: number;
  label?: string;
}

const LiquidityHubAnalyticsVolume: React.FC<Props> = ({
  startTime,
  label = 'Volume',
}) => {
  const { t } = useTranslation();

  const { isLoading, data: lhData } = useLHAnalyticsDaily();
  const data = lhData ?? [];

  return <Box className='panel'></Box>;
};

export default LiquidityHubAnalyticsVolume;
