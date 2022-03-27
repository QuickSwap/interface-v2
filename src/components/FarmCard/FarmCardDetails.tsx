import React, { useState } from 'react';
import { TransactionResponse } from '@ethersproject/providers';
import { Box, Typography, useMediaQuery } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { StakingInfo, DualStakingInfo } from 'types';
import { TokenAmount, Pair } from '@uniswap/sdk';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { usePairContract, useStakingContract } from 'hooks/useContract';
import { useDerivedStakeInfo } from 'state/stake/hooks';
import { useTransactionAdder } from 'state/transactions/hooks';
import { useTokenBalance } from 'state/wallet/hooks';
import { CurrencyLogo, NumericalInput } from 'components';
import { Link } from 'react-router-dom';
import { useActiveWeb3React } from 'hooks';
import useTransactionDeadline from 'hooks/useTransactionDeadline';
import { useApproveCallback, ApprovalState } from 'hooks/useApproveCallback';
import {
  getAPYWithFee,
  getRewardRate,
  getTokenAddress,
  getTVLStaking,
  getStakedAmountStakingInfo,
  getUSDString,
  getEarnedUSDLPFarm,
  formatTokenAmount,
  formatAPY,
  getEarnedUSDDualFarm,
  getExactTokenAmount,
} from 'utils';
import CircleInfoIcon from 'assets/images/circleinfo.svg';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  inputVal: {
    backgroundColor: palette.secondary.contrastText,
    borderRadius: '10px',
    height: '50px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    '& p': {
      cursor: 'pointer',
    },
  },
  buttonToken: {
    backgroundColor: palette.grey.A400,
    borderRadius: '10px',
    height: '50px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  buttonClaim: {
    backgroundImage:
      'linear-gradient(280deg, #64fbd3 0%, #00cff3 0%, #0098ff 10%, #004ce6 100%)',
    borderRadius: '10px',
    height: '50px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'white',
  },
  buttonWrapper: {
    minWidth: 250,
    width: '30%',
    color: palette.text.secondary,
    borderRadius: 16,
    [breakpoints.down('xs')]: {
      width: '100%',
      padding: 16,
      border: `1px solid ${palette.divider}`,
    },
  },
}));

const FarmCardDetails: React.FC<{
  stakingInfo: StakingInfo | DualStakingInfo;
  stakingAPY: number;
  isLPFarm?: boolean;
}> = ({ stakingInfo, stakingAPY, isLPFarm }) => {
  const classes = useStyles();
  const { palette, breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const [stakeAmount, setStakeAmount] = useState('');
  const [attemptStaking, setAttemptStaking] = useState(false);
  const [attemptUnstaking, setAttemptUnstaking] = useState(false);
  const [attemptClaiming, setAttemptClaiming] = useState(false);
  const [approving, setApproving] = useState(false);
  const [unstakeAmount, setUnStakeAmount] = useState('');

  const lpStakingInfo = stakingInfo as StakingInfo;
  const dualStakingInfo = stakingInfo as DualStakingInfo;

  const token0 = stakingInfo ? stakingInfo.tokens[0] : undefined;
  const token1 = stakingInfo ? stakingInfo.tokens[1] : undefined;

  const { account, library } = useActiveWeb3React();
  const addTransaction = useTransactionAdder();

  const currency0 = token0 ? unwrappedToken(token0) : undefined;
  const currency1 = token1 ? unwrappedToken(token1) : undefined;

  const userLiquidityUnstaked = useTokenBalance(
    account ?? undefined,
    stakingInfo.stakedAmount?.token,
  );

  const stakedAmounts = getStakedAmountStakingInfo(
    stakingInfo,
    userLiquidityUnstaked,
  );

  let apyWithFee: number | string = 0;

  if (
    stakingInfo &&
    stakingInfo.perMonthReturnInRewards &&
    stakingAPY &&
    stakingAPY > 0
  ) {
    apyWithFee = formatAPY(
      getAPYWithFee(stakingInfo.perMonthReturnInRewards, stakingAPY),
    );
  }

  const stakingContract = useStakingContract(stakingInfo?.stakingRewardAddress);

  const { parsedAmount: unstakeParsedAmount } = useDerivedStakeInfo(
    unstakeAmount,
    stakingInfo.stakedAmount?.token,
    stakingInfo.stakedAmount,
  );

  const onWithdraw = async () => {
    if (stakingInfo && stakingContract && unstakeParsedAmount) {
      setAttemptUnstaking(true);
      await stakingContract
        .withdraw(`0x${unstakeParsedAmount.raw.toString(16)}`, {
          gasLimit: 300000,
        })
        .then(async (response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Withdraw deposited liquidity`,
          });
          try {
            await response.wait();
            setAttemptUnstaking(false);
          } catch (error) {
            setAttemptUnstaking(false);
          }
        })
        .catch((error: any) => {
          setAttemptUnstaking(false);
          console.log(error);
        });
    }
  };

  const onClaimReward = async () => {
    if (stakingContract && stakingInfo && stakingInfo.stakedAmount) {
      setAttemptClaiming(true);
      await stakingContract
        .getReward({ gasLimit: 350000 })
        .then(async (response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Claim accumulated rewards`,
          });
          try {
            await response.wait();
            setAttemptClaiming(false);
          } catch (error) {
            setAttemptClaiming(false);
          }
        })
        .catch((error: any) => {
          setAttemptClaiming(false);
          console.log(error);
        });
    }
  };

  const { parsedAmount } = useDerivedStakeInfo(
    stakeAmount,
    stakingInfo.stakedAmount?.token,
    userLiquidityUnstaked,
  );
  const deadline = useTransactionDeadline();
  const [approval, approveCallback] = useApproveCallback(
    parsedAmount,
    stakingInfo?.stakingRewardAddress,
  );

  const dummyPair = stakingInfo
    ? new Pair(
        new TokenAmount(stakingInfo.tokens[0], '0'),
        new TokenAmount(stakingInfo.tokens[1], '0'),
      )
    : null;
  const pairContract = usePairContract(
    stakingInfo && stakingInfo.lp && stakingInfo.lp !== ''
      ? stakingInfo.lp
      : dummyPair?.liquidityToken.address,
  );

  const onStake = async () => {
    if (stakingContract && parsedAmount && deadline) {
      setAttemptStaking(true);
      stakingContract
        .stake(`0x${parsedAmount.raw.toString(16)}`, {
          gasLimit: 350000,
        })
        .then(async (response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Deposit liquidity`,
          });
          try {
            await response.wait();
            setAttemptStaking(false);
          } catch (error) {
            setAttemptStaking(false);
          }
        })
        .catch((error: any) => {
          setAttemptStaking(false);
          console.log(error);
        });
    } else {
      throw new Error(
        'Attempting to stake without approval or a signature. Please contact support.',
      );
    }
  };

  const onAttemptToApprove = async () => {
    if (!pairContract || !library || !deadline)
      throw new Error('missing dependencies');
    const liquidityAmount = parsedAmount;
    if (!liquidityAmount) throw new Error('missing liquidity amount');
    setApproving(true);
    try {
      await approveCallback();
      setApproving(false);
    } catch (e) {
      setApproving(false);
    }
  };

  const earnedUSDStr = isLPFarm
    ? getEarnedUSDLPFarm(lpStakingInfo)
    : getEarnedUSDDualFarm(dualStakingInfo);

  const tvl = getTVLStaking(
    stakedAmounts?.totalStakedUSD,
    stakedAmounts?.totalStakedBase,
  );

  const lpRewards = lpStakingInfo.rate * lpStakingInfo.rewardTokenPrice;

  const lpPoolRate = getRewardRate(
    lpStakingInfo.totalRewardRate,
    lpStakingInfo.rewardToken,
  );

  const dualRewards =
    dualStakingInfo.rateA * dualStakingInfo.rewardTokenAPrice +
    dualStakingInfo.rateB * Number(dualStakingInfo.rewardTokenBPrice);

  const dualPoolRateA = getRewardRate(
    dualStakingInfo.totalRewardRateA,
    dualStakingInfo.rewardTokenA,
  );
  const dualPoolRateB = getRewardRate(
    dualStakingInfo.totalRewardRateB,
    dualStakingInfo.rewardTokenB,
  );

  return (
    <Box
      width='100%'
      p={2}
      display='flex'
      flexDirection='row'
      flexWrap='wrap'
      borderTop='1px solid #444444'
      alignItems='center'
      justifyContent={stakingInfo?.ended ? 'flex-end' : 'space-between'}
    >
      {stakingInfo && (
        <>
          {isMobile && (
            <>
              <Box
                mt={2}
                width={1}
                display='flex'
                justifyContent='space-between'
              >
                <Typography variant='body2' color='textSecondary'>
                  TVL
                </Typography>
                <Typography variant='body2'>{tvl}</Typography>
              </Box>
              <Box
                mt={2}
                width={1}
                display='flex'
                justifyContent='space-between'
              >
                <Typography variant='body2' color='textSecondary'>
                  Rewards
                </Typography>
                <Box textAlign='right'>
                  <Typography variant='body2'>
                    ${(isLPFarm ? lpRewards : dualRewards).toLocaleString()} /
                    day
                  </Typography>
                  {isLPFarm ? (
                    <Typography variant='body2'>{lpPoolRate}</Typography>
                  ) : (
                    <>
                      <Typography variant='body2'>{dualPoolRateA}</Typography>
                      <Typography variant='body2'>{dualPoolRateB}</Typography>
                    </>
                  )}
                </Box>
              </Box>
              <Box
                mt={2}
                width={1}
                display='flex'
                justifyContent='space-between'
              >
                <Box display='flex' alignItems='center'>
                  <Typography variant='body2' color='textSecondary'>
                    APY
                  </Typography>
                  <Box ml={0.5} height={16}>
                    <img src={CircleInfoIcon} alt={'arrow up'} />
                  </Box>
                </Box>
                <Box color={palette.success.main}>
                  <Typography variant='body2'>{apyWithFee}%</Typography>
                </Box>
              </Box>
            </>
          )}
          {!stakingInfo.ended && (
            <Box className={classes.buttonWrapper} mt={isMobile ? 2 : 0}>
              <Box display='flex' justifyContent='space-between'>
                <Typography variant='body2'>In Wallet:</Typography>
                <Box
                  display='flex'
                  flexDirection='column'
                  alignItems='flex-end'
                  justifyContent='flex-start'
                >
                  <Typography variant='body2'>
                    {formatTokenAmount(userLiquidityUnstaked)} LP{' '}
                    <span>({getUSDString(stakedAmounts?.unStakedUSD)})</span>
                  </Typography>
                  <Link
                    to={`/pools?currency0=${getTokenAddress(
                      token0,
                    )}&currency1=${getTokenAddress(token1)}`}
                    style={{ color: palette.primary.main }}
                  >
                    Get {currency0?.symbol} / {currency1?.symbol} LP
                  </Link>
                </Box>
              </Box>
              <Box className={classes.inputVal} mb={2} mt={2} p={2}>
                <NumericalInput
                  placeholder='0.00'
                  value={stakeAmount}
                  fontSize={16}
                  onUserInput={(value) => {
                    setStakeAmount(value);
                  }}
                />
                <Typography
                  variant='body2'
                  style={{
                    color:
                      userLiquidityUnstaked &&
                      userLiquidityUnstaked.greaterThan('0')
                        ? palette.primary.main
                        : palette.text.hint,
                  }}
                  onClick={() => {
                    if (
                      userLiquidityUnstaked &&
                      userLiquidityUnstaked.greaterThan('0')
                    ) {
                      setStakeAmount(userLiquidityUnstaked.toExact());
                    } else {
                      setStakeAmount('');
                    }
                  }}
                >
                  MAX
                </Typography>
              </Box>
              <Box
                className={
                  !approving &&
                  !attemptStaking &&
                  Number(stakeAmount) > 0 &&
                  Number(stakeAmount) <=
                    getExactTokenAmount(userLiquidityUnstaked)
                    ? classes.buttonClaim
                    : classes.buttonToken
                }
                mt={2}
                p={2}
                onClick={async () => {
                  if (
                    !approving &&
                    !attemptStaking &&
                    Number(stakeAmount) > 0 &&
                    Number(stakeAmount) <=
                      getExactTokenAmount(userLiquidityUnstaked)
                  ) {
                    if (approval === ApprovalState.APPROVED) {
                      onStake();
                    } else {
                      onAttemptToApprove();
                    }
                  }
                }}
              >
                <Typography variant='body1'>
                  {attemptStaking
                    ? 'Staking LP Tokens...'
                    : approval === ApprovalState.APPROVED
                    ? 'Stake LP Tokens'
                    : approving
                    ? 'Approving...'
                    : 'Approve'}
                </Typography>
              </Box>
            </Box>
          )}
          <Box className={classes.buttonWrapper} mx={isMobile ? 0 : 2} my={2}>
            <Box display='flex' justifyContent='space-between'>
              <Typography variant='body2'>My deposits:</Typography>
              <Typography variant='body2'>
                {formatTokenAmount(stakingInfo.stakedAmount)} LP{' '}
                <span>({getUSDString(stakedAmounts?.myStakedUSD)})</span>
              </Typography>
            </Box>
            <Box className={classes.inputVal} mb={2} mt={4.5} p={2}>
              <NumericalInput
                placeholder='0.00'
                value={unstakeAmount}
                fontSize={16}
                onUserInput={(value) => {
                  setUnStakeAmount(value);
                }}
              />
              <Typography
                variant='body2'
                style={{
                  color:
                    stakingInfo.stakedAmount &&
                    stakingInfo.stakedAmount.greaterThan('0')
                      ? palette.primary.main
                      : palette.text.hint,
                }}
                onClick={() => {
                  if (
                    stakingInfo.stakedAmount &&
                    stakingInfo.stakedAmount.greaterThan('0')
                  ) {
                    setUnStakeAmount(stakingInfo.stakedAmount.toExact());
                  } else {
                    setUnStakeAmount('');
                  }
                }}
              >
                MAX
              </Typography>
            </Box>
            <Box
              className={
                !attemptUnstaking &&
                Number(unstakeAmount) > 0 &&
                Number(unstakeAmount) <=
                  getExactTokenAmount(stakingInfo.stakedAmount)
                  ? classes.buttonClaim
                  : classes.buttonToken
              }
              mt={2}
              p={2}
              onClick={() => {
                if (
                  !attemptUnstaking &&
                  Number(unstakeAmount) > 0 &&
                  Number(unstakeAmount) <=
                    getExactTokenAmount(stakingInfo.stakedAmount)
                ) {
                  onWithdraw();
                }
              }}
            >
              <Typography variant='body1'>
                {attemptUnstaking
                  ? 'Unstaking LP Tokens...'
                  : 'Unstake LP Tokens'}
              </Typography>
            </Box>
          </Box>
          <Box className={classes.buttonWrapper}>
            <Box
              display='flex'
              flexDirection='column'
              alignItems='center'
              justifyContent='space-between'
            >
              <Box mb={1}>
                <Typography variant='body2'>Unclaimed Rewards:</Typography>
              </Box>
              {isLPFarm ? (
                <>
                  <Box mb={1}>
                    <CurrencyLogo currency={lpStakingInfo.rewardToken} />
                  </Box>
                  <Box mb={1} textAlign='center'>
                    <Typography variant='body1' color='textSecondary'>
                      {formatTokenAmount(lpStakingInfo.earnedAmount)}
                      <span>&nbsp;{lpStakingInfo.rewardToken.symbol}</span>
                    </Typography>
                    <Typography variant='body2'>{earnedUSDStr}</Typography>
                  </Box>
                </>
              ) : (
                <>
                  <Box mb={1} display='flex'>
                    <CurrencyLogo
                      currency={unwrappedToken(dualStakingInfo.rewardTokenA)}
                    />
                    <CurrencyLogo
                      currency={unwrappedToken(dualStakingInfo.rewardTokenB)}
                    />
                  </Box>
                  <Box mb={1} textAlign='center'>
                    <Typography variant='body1'>{earnedUSDStr}</Typography>
                    <Typography variant='body1' color='textSecondary'>
                      {formatTokenAmount(dualStakingInfo.earnedAmountA)}
                      <span>&nbsp;{dualStakingInfo.rewardTokenA.symbol}</span>
                    </Typography>
                    <Typography variant='body1' color='textSecondary'>
                      {formatTokenAmount(dualStakingInfo.earnedAmountB)}
                      <span>&nbsp;{dualStakingInfo.rewardTokenB.symbol}</span>
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
            <Box
              className={
                !attemptClaiming &&
                (isLPFarm
                  ? lpStakingInfo.earnedAmount &&
                    lpStakingInfo.earnedAmount.greaterThan('0')
                  : dualStakingInfo.earnedAmountA &&
                    dualStakingInfo.earnedAmountA.greaterThan('0'))
                  ? classes.buttonClaim
                  : classes.buttonToken
              }
              p={2}
              onClick={() => {
                if (
                  !attemptClaiming &&
                  (isLPFarm
                    ? lpStakingInfo.earnedAmount &&
                      lpStakingInfo.earnedAmount.greaterThan('0')
                    : dualStakingInfo.earnedAmountA &&
                      dualStakingInfo.earnedAmountA.greaterThan('0'))
                ) {
                  onClaimReward();
                }
              }}
            >
              <Typography variant='body1'>
                {attemptClaiming ? 'Claiming...' : 'Claim'}
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default FarmCardDetails;
