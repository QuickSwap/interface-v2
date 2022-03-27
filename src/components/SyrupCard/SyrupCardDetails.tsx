import React, { useState } from 'react';
import { Box, Typography, Divider, useMediaQuery } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { TransactionResponse } from '@ethersproject/providers';
import { SyrupInfo } from 'types';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { useTokenBalance } from 'state/wallet/hooks';
import { CurrencyLogo, StakeSyrupModal } from 'components';
import { useActiveWeb3React } from 'hooks';
import { useStakingContract } from 'hooks/useContract';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { formatCompact, formatTokenAmount, getEarnedUSDSyrup } from 'utils';
import SyrupTimerLabel from './SyrupTimerLabel';
import CircleInfoIcon from 'assets/images/circleinfo.svg';
import SyrupAPR from './SyrupAPR';
import { useUSDCPriceToken } from 'utils/useUSDCPrice';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
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
      width: '49%',
    },
    '& p': {
      color: palette.text.primary,
    },
  },
}));

const SyrupCardDetails: React.FC<{ syrup: SyrupInfo; dQUICKAPY: string }> = ({
  syrup,
  dQUICKAPY,
}) => {
  const { palette, breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const [attemptingClaim, setAttemptingClaim] = useState(false);
  const [attemptingUnstake, setAttemptingUnstake] = useState(false);
  const [openStakeModal, setOpenStakeModal] = useState(false);
  const classes = useStyles();

  const stakingTokenPrice = useUSDCPriceToken(syrup.stakingToken);
  const stakingContract = useStakingContract(syrup?.stakingRewardAddress);
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();

  const { account } = useActiveWeb3React();
  const currency = syrup ? unwrappedToken(syrup.token) : undefined;

  const userLiquidityUnstaked = useTokenBalance(
    account ?? undefined,
    syrup.stakedAmount?.token,
  );

  const exactEnd = syrup ? syrup.periodFinish : 0;

  const depositAmount =
    syrup && syrup.valueOfTotalStakedAmountInUSDC
      ? `$${Number(syrup.valueOfTotalStakedAmountInUSDC).toLocaleString()}`
      : `${formatTokenAmount(syrup?.totalStakedAmount)} ${
          syrup?.stakingToken.symbol
        }`;

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

  const StakeButton = () => (
    <Box
      className={classes.syrupButton}
      onClick={() => setOpenStakeModal(true)}
    >
      <Typography variant='body2'>Stake</Typography>
    </Box>
  );

  const UnstakeButton = () => (
    <Box
      className={classes.syrupButton}
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
  );

  const ClaimButton = () => (
    <Box
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
  );

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
          <Divider />
          <Box padding={3}>
            {isMobile && (
              <Box mb={3}>
                <Box display='flex' justifyContent='space-between' mb={2}>
                  <Typography
                    variant='body2'
                    style={{ color: palette.text.secondary }}
                  >
                    {syrup.stakingToken.symbol} Deposits:
                  </Typography>
                  <Typography variant='body2'>{depositAmount}</Typography>
                </Box>
                <Box display='flex' justifyContent='space-between' mb={2}>
                  <Typography
                    variant='body2'
                    style={{ color: palette.text.secondary }}
                  >
                    Daily Rewards:
                  </Typography>
                  <Typography variant='body2'>
                    {syrup.rate >= 1000000
                      ? formatCompact(syrup.rate)
                      : syrup.rate.toLocaleString()}{' '}
                    {syrup.token.symbol}
                    <span style={{ color: palette.text.secondary }}>
                      {' '}
                      / day
                    </span>
                  </Typography>
                </Box>
                <Box mb={2}>
                  <SyrupTimerLabel exactEnd={exactEnd} isEnded={syrup?.ended} />
                </Box>
                <Box display='flex' justifyContent='space-between' mb={3}>
                  <Box display='flex' alignItems='center'>
                    <Typography
                      variant='body2'
                      style={{ color: palette.text.secondary }}
                    >
                      APR:
                    </Typography>
                    <Box ml={0.5} height={16}>
                      <img src={CircleInfoIcon} alt={'arrow up'} />
                    </Box>
                  </Box>
                  <Box textAlign='right'>
                    <SyrupAPR syrup={syrup} dQUICKAPY={dQUICKAPY} />
                  </Box>
                </Box>
                <Divider />
              </Box>
            )}
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
                    ? formatTokenAmount(userLiquidityUnstaked)
                    : 0}{' '}
                  {syrup.stakingToken.symbol}
                </span>
                <span style={{ color: palette.text.secondary, marginLeft: 4 }}>
                  $
                  {userLiquidityUnstaked
                    ? (
                        stakingTokenPrice *
                        Number(userLiquidityUnstaked.toExact())
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
                  {formatTokenAmount(syrup.stakedAmount)}{' '}
                  {syrup.stakingToken.symbol}
                </span>
                <span style={{ color: palette.text.secondary, marginLeft: 4 }}>
                  {syrup.stakedAmount
                    ? `$${(
                        stakingTokenPrice * Number(syrup.stakedAmount.toExact())
                      ).toLocaleString()}`
                    : '-'}
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
                    {formatTokenAmount(syrup.earnedAmount)}
                  </span>
                  <span
                    style={{ color: palette.text.secondary, marginLeft: 4 }}
                  >
                    {getEarnedUSDSyrup(syrup)}
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
              {!isMobile && (
                <SyrupTimerLabel exactEnd={exactEnd} isEnded={syrup?.ended} />
              )}
              {isMobile ? (
                <>
                  {syrup.earnedAmount && syrup.earnedAmount.greaterThan('0') && (
                    <Box
                      width={1}
                      mb={1.5}
                      display='flex'
                      justifyContent='flex-end'
                    >
                      <ClaimButton />
                    </Box>
                  )}
                  <Box
                    width={1}
                    mb={1.5}
                    display='flex'
                    justifyContent={
                      syrup.stakedAmount && syrup.stakedAmount.greaterThan('0')
                        ? 'space-between'
                        : 'flex-end'
                    }
                  >
                    {!syrup.ended && <StakeButton />}
                    {syrup.stakedAmount &&
                      syrup.stakedAmount.greaterThan('0') && <UnstakeButton />}
                  </Box>
                </>
              ) : (
                <Box display='flex' flexWrap='wrap' my={1}>
                  {!syrup.ended && <StakeButton />}
                  {syrup.stakedAmount && syrup.stakedAmount.greaterThan('0') && (
                    <Box ml={1}>
                      <UnstakeButton />
                    </Box>
                  )}
                  {syrup.earnedAmount && syrup.earnedAmount.greaterThan('0') && (
                    <Box ml={1}>
                      <ClaimButton />
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </>
      )}
    </>
  );
};

export default React.memo(SyrupCardDetails);
