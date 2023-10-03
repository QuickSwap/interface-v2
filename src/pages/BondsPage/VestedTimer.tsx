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

  let timeRemaining =
    Number(lastBlockTimestamp) + Number(vesting) - currentTime;

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
    }, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  return transferModalFlag ? (
    <p>
      {vestingTime.days}d, {vestingTime.hours}h, {vestingTime.minutes}m
    </p>
  ) : userModalFlag ? (
    <p className='font-bold'>
      {vestingTime ? (
        `${vestingTime.days}d, ${vestingTime.hours}h, ${vestingTime.minutes}m`
      ) : (
        <Skeleton width='150px' height='32.5px' />
      )}
    </p>
  ) : mobileFlag ? (
    <Box className='flex'>
      <p>Fully Vested</p>
      <p>{`${vestingTime.days}d, ${vestingTime.hours}h, ${vestingTime.minutes}m`}</p>
      <QuestionHelper text='This is the time remaining until all tokens from the bill are available to claim.' />
    </Box>
  ) : (
    <Box className='flex'>
      <p>Fully Vested</p>
      <p>{`${vestingTime.days}d, ${vestingTime.hours}h, ${vestingTime.minutes}m`}</p>
      <QuestionHelper text='This is the time remaining until all tokens from the bill are available to claim.' />
    </Box>
  );
};

export default React.memo(VestedTimer);
