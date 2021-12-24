import React, { useEffect, useState } from 'react';
import { Box, Typography, Divider, useMediaQuery } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { TransactionResponse } from '@ethersproject/providers';
import { SyrupInfo } from 'state/stake/hooks';
import { QUICK } from 'constants/index';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { useTokenBalance } from 'state/wallet/hooks';
import { CurrencyLogo, StakeSyrupModal } from 'components';
import { useActiveWeb3React } from 'hooks';
import { useStakingContract } from 'hooks/useContract';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { formatCompact } from 'utils';

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
  const { palette, breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const [expanded, setExpanded] = useState(false);
  const [attemptingClaim, setAttemptingClaim] = useState(false);
  const [attemptingUnstake, setAttemptingUnstake] = useState(false);
  const [openStakeModal, setOpenStakeModal] = useState(false);
  const [hashClaim, setHashClaim] = useState('');
  const [hashUnstake, setHashUnstake] = useState('');
  const classes = useStyles();
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const stakingContract = useStakingContract(syrup.stakingRewardAddress);
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();

  const { account } = useActiveWeb3React();
  const currency = unwrappedToken(syrup.token);

  const dQuickDeposit = syrup.valueOfTotalStakedAmountInUSDC
    ? `$${Number(syrup.valueOfTotalStakedAmountInUSDC).toLocaleString()}`
    : `${syrup.totalStakedAmount.toSignificant(6, { groupSeparator: ',' }) ??
        '-'} dQUICK`;

  const userLiquidityUnstaked = useTokenBalance(
    account ?? undefined,
    syrup.stakedAmount.token,
  );

  const tokenAPR =
    syrup.valueOfTotalStakedAmountInUSDC > 0
      ? (
          ((syrup.rewards ?? 0) / syrup.valueOfTotalStakedAmountInUSDC) *
          365 *
          100
        ).toLocaleString()
      : 0;

  const dQUICKAPR =
    (((Number(syrup.oneDayVol) * 0.04 * 0.01) /
      Number(syrup.dQuickTotalSupply.toSignificant(6))) *
      365) /
    (Number(syrup.dQUICKtoQUICK.toSignificant(6)) * Number(syrup.quickPrice));

  const dQUICKAPY = dQUICKAPR
    ? Number((Math.pow(1 + dQUICKAPR / 365, 365) - 1) * 100).toLocaleString()
    : 0;

  const syrupEarnedUSD =
    Number(syrup.earnedAmount.toSignificant(2)) *
    Number(syrup.usdPriceToken ? syrup.usdPriceToken.toSignificant(2) : 0);

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

  const onClaimReward = async () => {
    if (stakingContract && syrup.stakedAmount) {
      setAttemptingClaim(true);
      await stakingContract
        .getReward({ gasLimit: 350000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Claim accumulated` + syrup.token.symbol + `rewards`,
          });
          setHashClaim(response.hash);
        })
        .catch((error: any) => {
          setAttemptingClaim(false);
          console.log(error);
        });
    }
  };

  const onWithdraw = async () => {
    if (stakingContract && syrup.stakedAmount) {
      setAttemptingUnstake(true);
      await stakingContract
        .exit({ gasLimit: 300000 })
        .then(async (response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Withdraw deposited liquidity`,
          });
          setHashUnstake(response.hash);
          const receipt = await response.wait();
          finalizedTransaction(receipt, {
            summary: `Withdraw deposited dQUICK`,
          });
        })
        .catch((error: any) => {
          setAttemptingUnstake(false);
          console.log(error);
        });
    }
  };

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  return (
    <Box className={classes.syrupCard}>
      {openStakeModal && (
        <StakeSyrupModal
          open={openStakeModal}
          onClose={() => setOpenStakeModal(false)}
          syrup={syrup}
        />
      )}
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
              <Typography variant='caption'>
                {syrup.rate >= 1000000
                  ? formatCompact(syrup.rate)
                  : syrup.rate.toLocaleString()}
                <span style={{ color: palette.text.secondary }}> / day</span>
              </Typography>
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
                border='1px solid #3e4252'
                padding='4px 6px'
                marginTop='6px'
                display='flex'
                alignItems='center'
              >
                <CurrencyLogo currency={QUICK} size='12px' />
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
              $
              {syrupEarnedUSD < 0.001
                ? syrupEarnedUSD.toFixed(5)
                : syrupEarnedUSD.toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Box>
      {expanded && (
        <>
          <Divider />
          <Box padding={3}>
            <Box
              display='flex'
              alignItems='center'
              justifyContent='space-between'
              mb={1}
            >
              <Typography
                variant='body2'
                style={{ color: palette.text.secondary }}
              >
                In wallet
              </Typography>
              <Typography variant='body2'>
                <span style={{ color: palette.text.primary }}>
                  {userLiquidityUnstaked
                    ? userLiquidityUnstaked.toSignificant(2)
                    : 0}{' '}
                  dQUICK
                </span>
                <span style={{ color: palette.text.secondary, marginLeft: 4 }}>
                  $
                  {userLiquidityUnstaked
                    ? (
                        syrup.quickPrice *
                        Number(syrup.dQUICKtoQUICK.toSignificant()) *
                        Number(userLiquidityUnstaked.toSignificant())
                      ).toLocaleString()
                    : 0}
                </span>
              </Typography>
            </Box>
            <Box
              display='flex'
              alignItems='center'
              justifyContent='space-between'
              mb={1}
            >
              <Typography
                variant='body2'
                style={{ color: palette.text.secondary }}
              >
                Staked
              </Typography>
              <Typography variant='body2'>
                <span style={{ color: palette.text.primary }}>
                  {syrup.stakedAmount.toSignificant(2)} dQUICK
                </span>
                <span style={{ color: palette.text.secondary, marginLeft: 4 }}>
                  $
                  {(
                    Number(syrup.stakedAmount.toSignificant()) *
                    Number(syrup.dQUICKtoQUICK.toSignificant()) *
                    syrup.quickPrice
                  ).toLocaleString()}
                </span>
              </Typography>
            </Box>
            <Box
              display='flex'
              alignItems='center'
              justifyContent='space-between'
              mb={2}
            >
              <Typography
                variant='body2'
                style={{ color: palette.text.secondary }}
              >
                Earned {currency.symbol}
              </Typography>
              <Box display='flex' alignItems='center'>
                <CurrencyLogo currency={currency} size='16px' />
                <Typography variant='body2' style={{ marginLeft: 4 }}>
                  <span style={{ color: palette.text.primary }}>
                    {syrup.earnedAmount.toSignificant(2)}
                  </span>
                  <span
                    style={{ color: palette.text.secondary, marginLeft: 4 }}
                  >
                    $
                    {syrupEarnedUSD < 0.001
                      ? syrupEarnedUSD.toFixed(5)
                      : syrupEarnedUSD.toLocaleString()}
                  </span>
                </Typography>
              </Box>
            </Box>
            <Box
              display='flex'
              flexWrap='wrap'
              alignItems='center'
              justifyContent='space-between'
            >
              {!syrup.ended && Number.isFinite(timeRemaining) && (
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
              {syrup.ended && (
                <Typography variant='body2' color='textSecondary'>
                  Rewards Ended
                </Typography>
              )}
              <Box
                width={isMobile ? 1 : 'unset'}
                display='flex'
                flexWrap='wrap'
              >
                {!syrup.ended && (
                  <>
                    <Box
                      mt={isMobile ? 1.5 : 0}
                      className={classes.syrupButton}
                      onClick={() => setOpenStakeModal(true)}
                    >
                      <Typography variant='body2'>Stake</Typography>
                    </Box>
                    {syrup.stakedAmount.greaterThan('0') && (
                      <Box
                        className={classes.syrupButton}
                        mt={isMobile ? 1.5 : 0}
                        ml={isMobile ? 0 : 1.5}
                        style={{ opacity: attemptingUnstake ? 0.6 : 1 }}
                        onClick={() => {
                          if (!attemptingUnstake) {
                            onWithdraw();
                          }
                        }}
                      >
                        <Typography variant='body2'>
                          {attemptingUnstake && !hashUnstake
                            ? 'Unstaking...'
                            : 'Unstake'}
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
                {syrup.earnedAmount.greaterThan('0') && (
                  <Box
                    mt={isMobile ? 1.5 : 0}
                    ml={isMobile ? 0 : 1.5}
                    className={classes.syrupButton}
                    style={{ opacity: attemptingClaim ? 0.6 : 1 }}
                    onClick={() => {
                      if (!attemptingClaim) {
                        onClaimReward();
                      }
                    }}
                  >
                    <Typography variant='body2'>
                      {attemptingClaim && !hashClaim ? 'Claiming...' : 'Claim'}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default SyrupCard;
