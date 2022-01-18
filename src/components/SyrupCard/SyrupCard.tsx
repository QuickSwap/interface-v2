import React, { useEffect, useState } from 'react';
import { Box, Typography, useMediaQuery } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { SyrupInfo } from 'state/stake/hooks';
import { GlobalConst } from 'constants/index';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { CurrencyLogo } from 'components';
import { formatCompact, getDaysCurrentYear, returnTokenFromKey } from 'utils';
import SyrupCardDetails from './SyrupCardDetails';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  syrupCard: {
    background: palette.secondary.dark,
    width: '100%',
    borderRadius: 10,
    marginTop: 24,
  },
  syrupButton: {
    backgroundImage:
      'linear-gradient(280deg, #64fbd3 0%, #00cff3 0%, #0098ff 10%, #004ce6 100%)',
    borderRadius: 10,
    cursor: 'pointer',
    width: 134,
    height: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    [breakpoints.down('xs')]: {
      width: '100%',
    },
    '& p': {
      color: palette.text.primary,
    },
  },
  syrupText: {
    fontSize: 14,
    fontWeight: 600,
    color: palette.text.secondary,
  },
}));

const SyrupCard: React.FC<{ syrup: SyrupInfo }> = ({ syrup }) => {
  const daysCurrentYear = getDaysCurrentYear();
  const { palette, breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const [expanded, setExpanded] = useState(false);
  const classes = useStyles();
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  const currency = unwrappedToken(syrup.token);

  const dQuickDeposit = syrup.valueOfTotalStakedAmountInUSDC
    ? `$${Number(syrup.valueOfTotalStakedAmountInUSDC).toLocaleString()}`
    : `${syrup.totalStakedAmount.toSignificant(6, { groupSeparator: ',' }) ??
        '-'} dQUICK`;

  const tokenAPR =
    syrup.valueOfTotalStakedAmountInUSDC > 0
      ? (
          ((syrup.rewards ?? 0) / syrup.valueOfTotalStakedAmountInUSDC) *
          daysCurrentYear *
          100
        ).toLocaleString()
      : 0;

  const dQUICKAPR =
    (((Number(syrup.oneDayVol) * 0.04 * 0.01) /
      Number(syrup.dQuickTotalSupply.toSignificant(6))) *
      daysCurrentYear) /
    (Number(syrup.dQUICKtoQUICK.toSignificant(6)) * Number(syrup.quickPrice));

  const dQUICKAPY = dQUICKAPR
    ? Number(
        (Math.pow(1 + dQUICKAPR / daysCurrentYear, daysCurrentYear) - 1) * 100,
      ).toLocaleString()
    : 0;

  const syrupEarnedUSD =
    Number(syrup.earnedAmount.toSignificant()) *
    Number(syrup.rewardTokenPriceinUSD ?? 0);

  const MINUTE = 60;
  const HOUR = MINUTE * 60;
  const DAY = HOUR * 24;
  const exactEnd = syrup.periodFinish;
  let timeRemaining = exactEnd - currentTime;

  const days = (timeRemaining - (timeRemaining % DAY)) / DAY;
  timeRemaining -= days * DAY;
  const hours = (timeRemaining - (timeRemaining % HOUR)) / HOUR;
  timeRemaining -= hours * HOUR;
  const minutes = (timeRemaining - (timeRemaining % MINUTE)) / MINUTE;
  timeRemaining -= minutes * MINUTE;

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  return (
    <Box className={classes.syrupCard}>
      <Box
        display='flex'
        flexWrap='wrap'
        alignItems='center'
        width={1}
        paddingY={2}
        paddingX={3}
        style={{ cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box
          display='flex'
          alignItems='center'
          justifyContent='space-between'
          width={isMobile ? 1 : 0.3}
          mb={isMobile ? 1.5 : 0}
        >
          {isMobile && (
            <Typography className={classes.syrupText}>Earn</Typography>
          )}
          <Box display='flex' alignItems='center'>
            <CurrencyLogo currency={currency} size='32px' />
            <Box ml={1.5}>
              <Typography variant='body2'>{currency.symbol}</Typography>
              <Box display='flex' mt={0.25}>
                <Typography variant='caption'>
                  {syrup.rate >= 1000000
                    ? formatCompact(syrup.rate)
                    : syrup.rate.toLocaleString()}
                  <span style={{ color: palette.text.secondary }}> / day</span>
                </Typography>
              </Box>
              <Box display='flex' mt={0.25}>
                <Typography variant='caption'>
                  $
                  {Number(
                    (syrup.rate * Number(syrup.rewardTokenPriceinUSD)).toFixed(
                      2,
                    ),
                  ).toLocaleString()}{' '}
                  <span style={{ color: palette.text.secondary }}> / day</span>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box
          display='flex'
          alignItems='center'
          justifyContent='space-between'
          width={isMobile ? 1 : 0.3}
          mb={isMobile ? 1.5 : 0}
        >
          {isMobile && (
            <Typography className={classes.syrupText}>
              dQUICK Deposits
            </Typography>
          )}
          <Typography variant='body2'>{dQuickDeposit}</Typography>
        </Box>
        <Box
          display='flex'
          alignItems='center'
          justifyContent='space-between'
          width={isMobile ? 1 : 0.2}
          mb={isMobile ? 1.5 : 0}
        >
          {isMobile && (
            <Typography className={classes.syrupText}>APR</Typography>
          )}
          <Box textAlign={isMobile ? 'right' : 'left'}>
            <Typography variant='body2' style={{ color: palette.success.main }}>
              {tokenAPR}%
            </Typography>
            <Box display='flex'>
              <Box
                borderRadius='4px'
                border={`1px solid ${palette.grey.A400}`}
                padding='4px 6px'
                marginTop='6px'
                display='flex'
                alignItems='center'
              >
                <CurrencyLogo
                  currency={returnTokenFromKey('QUICK')}
                  size='12px'
                />
                <Typography variant='caption' style={{ marginLeft: 4 }}>
                  {dQUICKAPY}%{' '}
                  <span style={{ color: palette.text.hint }}>APY</span>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box
          display='flex'
          alignItems='center'
          justifyContent={isMobile ? 'space-between' : 'flex-end'}
          width={isMobile ? 1 : 0.2}
        >
          {isMobile && (
            <Typography className={classes.syrupText}>Earned</Typography>
          )}
          <Box textAlign='right'>
            <Box
              display='flex'
              alignItems='center'
              justifyContent='flex-end'
              mb={0.25}
            >
              <CurrencyLogo currency={currency} size='16px' />
              <Typography variant='body2' style={{ marginLeft: 5 }}>
                {syrup.earnedAmount.toSignificant(2)}
              </Typography>
            </Box>
            <Typography
              variant='body2'
              style={{ color: palette.text.secondary }}
            >
              {syrupEarnedUSD > 0 && syrupEarnedUSD < 0.001
                ? '< $0.001'
                : `$${syrupEarnedUSD.toLocaleString()}`}
            </Typography>
          </Box>
        </Box>
      </Box>
      {expanded && syrup && <SyrupCardDetails token={syrup.token} />}
    </Box>
  );
};

export default SyrupCard;
