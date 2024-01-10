import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Skeleton } from '@material-ui/lab';
import { QuestionHelper } from 'components';
import { Box } from '@material-ui/core';

const VestedTimer: React.FC<{
  lastBlockTimestamp: string;
  vesting: string;
  userModalFlag?: boolean;
  transferModalFlag?: boolean;
  mobileFlag?: boolean;
}> = ({
  lastBlockTimestamp,
  vesting,
  userModalFlag,
  transferModalFlag,
  mobileFlag,
}) => {
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  const MINUTE = 60;
  const HOUR = MINUTE * 60;
  const DAY = HOUR * 24;

  let timeRemaining = Math.max(
    Number(lastBlockTimestamp) + Number(vesting) - currentTime,
    0,
  );

  const days = (timeRemaining - (timeRemaining % DAY)) / DAY;
  timeRemaining -= days * DAY;
  const hours = (timeRemaining - (timeRemaining % HOUR)) / HOUR;
  timeRemaining -= hours * HOUR;
  const minutes = (timeRemaining - (timeRemaining % MINUTE)) / MINUTE;
  timeRemaining -= minutes * MINUTE;

  const vestingTime = { days, hours, minutes };

  useEffect(() => {
    const timeInterval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000);
      setCurrentTime(_currentTime);
    }, 1000 * 60);
    return () => clearInterval(timeInterval);
  }, []);

  return transferModalFlag ? (
    <h5 className='text-gray32'>
      {vestingTime.days}d, {vestingTime.hours}h, {vestingTime.minutes}m
    </h5>
  ) : userModalFlag ? (
    <h5 className='font-bold text-gray32'>
      {vestingTime ? (
        `${vestingTime.days}d, ${vestingTime.hours}h, ${vestingTime.minutes}m`
      ) : (
        <Skeleton width='150px' height='32.5px' />
      )}
    </h5>
  ) : mobileFlag ? (
    <Box className='flex justify-between items-center'>
      <Box className='flex items-center'>
        <small>{t('fullyVested')}</small>
        <Box className='flex' ml='5px'>
          <QuestionHelper text={t('userBondVestedTimeTooltip')} />
        </Box>
      </Box>
      <p>{`${vestingTime.days}d, ${vestingTime.hours}h, ${vestingTime.minutes}m`}</p>
    </Box>
  ) : (
    <Box>
      <Box className='flex items-center'>
        <small>{t('fullyVested')}</small>
        <Box className='flex' ml='5px'>
          <QuestionHelper text={t('userBondVestedTimeTooltip')} />
        </Box>
      </Box>
      <p>{`${vestingTime.days}d, ${vestingTime.hours}h, ${vestingTime.minutes}m`}</p>
    </Box>
  );
};

export default React.memo(VestedTimer);
