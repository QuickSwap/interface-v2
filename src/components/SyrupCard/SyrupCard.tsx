import React, { useMemo, useState } from 'react';
import { Box, Typography, useMediaQuery } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { SyrupInfo } from 'state/stake/hooks';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { CurrencyLogo } from 'components';
import {
  formatCompact,
  getDaysCurrentYear,
  getTokenAPRSyrup,
  returnTokenFromKey,
} from 'utils';
import SyrupCardDetails from './SyrupCardDetails';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  syrupCard: {
    background: palette.secondary.dark,
    width: '100%',
    borderRadius: 10,
    marginTop: 24,
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

  const currency = unwrappedToken(syrup.token);
  const isDQUICKStakingToken = syrup.stakingToken.equals(
    returnTokenFromKey('DQUICK'),
  );

  const depositAmount = syrup.valueOfTotalStakedAmountInUSDC
    ? `$${Number(syrup.valueOfTotalStakedAmountInUSDC).toLocaleString()}`
    : `${syrup.totalStakedAmount.toSignificant(6, { groupSeparator: ',' }) ??
        '-'} ${syrup.stakingToken.symbol}`;

  const dQUICKAPR = useMemo(
    () =>
      (((Number(syrup.oneDayVol) * 0.04 * 0.01) /
        Number(syrup.dQuickTotalSupply.toSignificant(6))) *
        daysCurrentYear) /
      (Number(syrup.dQUICKtoQUICK.toSignificant(6)) * Number(syrup.quickPrice)),
    [syrup, daysCurrentYear],
  );

  const dQUICKAPY = useMemo(
    () =>
      dQUICKAPR
        ? Number(
            (Math.pow(1 + dQUICKAPR / daysCurrentYear, daysCurrentYear) - 1) *
              100,
          ).toLocaleString()
        : 0,
    [dQUICKAPR, daysCurrentYear],
  );

  const syrupEarnedUSD =
    Number(syrup.earnedAmount.toSignificant()) *
    Number(syrup.rewardTokenPriceinUSD ?? 0);

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
              {syrup.stakingToken.symbol} Deposits
            </Typography>
          )}
          <Typography variant='body2'>{depositAmount}</Typography>
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
              {getTokenAPRSyrup(syrup).toLocaleString()}%
            </Typography>
            {isDQUICKStakingToken && (
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
            )}
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

export default React.memo(SyrupCard);
