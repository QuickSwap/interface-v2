import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Divider, useMediaQuery } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Token } from '@uniswap/sdk';
import { TransactionResponse } from '@ethersproject/providers';
import { useOldSyrupInfo, useSyrupInfo } from 'state/stake/hooks';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { useTokenBalance } from 'state/wallet/hooks';
import { CurrencyLogo, StakeSyrupModal } from 'components';
import { useActiveWeb3React } from 'hooks';
import { useStakingContract } from 'hooks/useContract';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { returnTokenFromKey } from 'utils';

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

const SyrupCardDetails: React.FC<{ token: Token }> = ({ token }) => {
  const { palette, breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const [attemptingClaim, setAttemptingClaim] = useState(false);
  const [attemptingUnstake, setAttemptingUnstake] = useState(false);
  const [openStakeModal, setOpenStakeModal] = useState(false);
  const classes = useStyles();
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  const syrups = useSyrupInfo(token);
  const oldSyrups = useOldSyrupInfo(token);
  const syrup = useMemo(
    () =>
      syrups && syrups.length > 0
        ? syrups[0]
        : oldSyrups && oldSyrups.length > 0
        ? oldSyrups[0]
        : null,
    [syrups, oldSyrups],
  );
  const stakingContract = useStakingContract(syrup?.stakingRewardAddress);
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();

  const { account } = useActiveWeb3React();
  const currency = syrup ? unwrappedToken(syrup.token) : undefined;
  const isQUICKStakingToken = syrup?.stakingToken.equals(
    returnTokenFromKey('QUICK'),
  );

  const userLiquidityUnstaked = useTokenBalance(
    account ?? undefined,
    syrup?.stakedAmount.token,
  );

  const syrupEarnedUSD =
    Number(syrup?.earnedAmount.toSignificant(2)) *
    Number(syrup?.rewardTokenPriceinUSD ?? 0);

  const MINUTE = 60;
  const HOUR = MINUTE * 60;
  const DAY = HOUR * 24;
  const exactEnd = syrup ? syrup.periodFinish : 0;
  let timeRemaining = exactEnd - currentTime;

  const days = (timeRemaining - (timeRemaining % DAY)) / DAY;
  timeRemaining -= days * DAY;
  const hours = (timeRemaining - (timeRemaining % HOUR)) / HOUR;
  timeRemaining -= hours * HOUR;
  const minutes = (timeRemaining - (timeRemaining % MINUTE)) / MINUTE;
  timeRemaining -= minutes * MINUTE;

  const onClaimReward = async () => {
    if (syrup && stakingContract && syrup.stakedAmount) {
      setAttemptingClaim(true);
      await stakingContract
        .getReward({ gasLimit: 350000 })
        .then(async (response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Claim accumulated` + syrup.token.symbol + `rewards`,
          });
          try {
            const receipt = await response.wait();
            finalizedTransaction(receipt, {
              summary: `Claim accumulated` + syrup.token.symbol + `rewards`,
            });
            setAttemptingClaim(false);
          } catch (e) {
            setAttemptingClaim(false);
          }
        })
        .catch((error: any) => {
          setAttemptingClaim(false);
          console.log(error);
        });
    }
  };

  const onWithdraw = async () => {
    if (syrup && stakingContract && syrup.stakedAmount) {
      setAttemptingUnstake(true);
      await stakingContract
        .exit({ gasLimit: 300000 })
        .then(async (response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Withdraw deposited liquidity`,
          });
          try {
            const receipt = await response.wait();
            finalizedTransaction(receipt, {
              summary: `Withdraw deposited dQUICK`,
            });
            setAttemptingUnstake(false);
          } catch (e) {
            setAttemptingUnstake(false);
          }
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
    <>
      {openStakeModal && syrup && (
        <StakeSyrupModal
          open={openStakeModal}
          onClose={() => setOpenStakeModal(false)}
          syrup={syrup}
        />
      )}
      {syrup && (
        <>
          {' '}
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
                  {syrup.stakingToken.symbol}
                </span>
                <span style={{ color: palette.text.secondary, marginLeft: 4 }}>
                  $
                  {userLiquidityUnstaked
                    ? (
                        syrup.quickPrice *
                        (isQUICKStakingToken
                          ? 1
                          : Number(syrup.dQUICKtoQUICK.toSignificant())) *
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
                  {syrup.stakedAmount.toSignificant(2)}{' '}
                  {syrup.stakingToken.symbol}
                </span>
                <span style={{ color: palette.text.secondary, marginLeft: 4 }}>
                  $
                  {(
                    Number(syrup.stakedAmount.toSignificant()) *
                    (isQUICKStakingToken
                      ? 1
                      : Number(syrup.dQUICKtoQUICK.toSignificant())) *
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
                Earned {currency?.symbol}
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
                    {syrupEarnedUSD > 0 && syrupEarnedUSD < 0.001
                      ? '< $0.001'
                      : `$${syrupEarnedUSD.toLocaleString()}`}
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
                  </>
                )}
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
                      {attemptingUnstake ? 'Unstaking...' : 'Unstake'}
                    </Typography>
                  </Box>
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
                      {attemptingClaim ? 'Claiming...' : 'Claim'}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </>
      )}
    </>
  );
};

export default SyrupCardDetails;
