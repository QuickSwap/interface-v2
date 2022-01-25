import React, { useEffect, useState } from 'react';
import { Box, Typography, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';

const SyrupTimerLabel: React.FC<{ exactEnd: number; isEnded: boolean }> = ({
  exactEnd,
  isEnded,
}) => {
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const { palette, breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  const MINUTE = 60;
  const HOUR = MINUTE * 60;
  const DAY = HOUR * 24;

  let timeRemaining = exactEnd - currentTime;

  const days = (timeRemaining - (timeRemaining % DAY)) / DAY;
  timeRemaining -= days * DAY;
  const hours = (timeRemaining - (timeRemaining % HOUR)) / HOUR;
  timeRemaining -= hours * HOUR;
  const minutes = (timeRemaining - (timeRemaining % MINUTE)) / MINUTE;
  timeRemaining -= minutes * MINUTE;

  useEffect(() => {
    if (isEnded) {
      return;
    }
    const timeInterval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000);
      setCurrentTime(_currentTime);
    }, 1000);
    return () => clearInterval(timeInterval);
  }, [isEnded]);

  return (
    <>
      {!isEnded && Number.isFinite(timeRemaining) && (
        <Box
          display={isMobile ? 'flex' : 'unset'}
          flexWrap='wrap'
          alignItems='center'
        >
          <Typography
            variant='caption'
            style={{ color: palette.text.secondary }}
          >
            Time Remaining
          </Typography>
          <Typography
            variant='body2'
            style={{
              color: palette.text.secondary,
              marginLeft: isMobile ? 4 : 0,
            }}
          >
            {`${days}d ${hours
              .toString()
              .padStart(2, '0')}h ${minutes
              .toString()
              .padStart(2, '0')}m ${timeRemaining}s`}
          </Typography>
        </Box>
      )}
      {(isEnded || !Number.isFinite(timeRemaining)) && (
        <Typography variant='body2' color='textSecondary'>
          Rewards Ended
        </Typography>
      )}
    </>
  );
};

export default SyrupTimerLabel;
