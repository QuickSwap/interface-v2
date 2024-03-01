import React from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@material-ui/lab';
import { formatNumber } from 'utils';
import dayjs from 'dayjs';
import { useLHAnalyticsDaily } from 'hooks/useLHAnalytics';
import { AccessTime } from '@material-ui/icons';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

interface Props {
  startTime?: number;
  label?: string;
  timeLabel?: string;
  additionalText?: string;
}

const LiquidityHubAnalyticsVolume: React.FC<Props> = ({
  startTime,
  label = 'Volume',
  timeLabel,
  additionalText,
}) => {
  const { t } = useTranslation();

  const { isLoading, data: lhData } = useLHAnalyticsDaily();
  const items = lhData?.result?.rows ?? [];

  const totalVolume = items
    .filter((item: any) =>
      startTime ? dayjs.utc(item.evt_date).unix() >= startTime : true,
    )
    .reduce(
      (total: number, item: any) => total + item.daily_total_calculated_value,
      0,
    );

  const startDate = items[0]?.evt_date
    ? t('since') + ' ' + items[0]?.evt_date
    : undefined;
  const tLabel = timeLabel ?? startDate;

  return (
    <Box className='panel flex flex-col justify-between' height='100%'>
      <Box className='flex justify-between items-center'>
        <p>{label}</p>
        {tLabel && (
          <Box className='bg-gray38' borderRadius={11} padding='3px 8px'>
            <span>{tLabel}</span>
          </Box>
        )}
      </Box>
      <Box
        className='flex items-center justify-center flex-col'
        gridGap={6}
        padding='16px 32px'
      >
        {isLoading ? (
          <Skeleton width='100%' height={40} />
        ) : (
          <h4 className='weight-500'>${formatNumber(totalVolume)}</h4>
        )}
        {additionalText && (
          <span className='text-secondary text-center'>{additionalText}</span>
        )}
      </Box>
      <Box className='flex justify-between items-center'>
        <small className='text-secondary'>@orbs</small>
        {lhData && (
          <Box className='flex items-center text-secondary' gridGap={4}>
            <AccessTime fontSize='small' />
            <small>{dayjs(lhData?.execution_ended_at).fromNow()}</small>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default LiquidityHubAnalyticsVolume;
