import React, { useState, useMemo } from 'react';
import { TransactionResponse } from '@ethersproject/providers';
import { Box, Typography, useMediaQuery } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useDualStakingInfo } from 'state/stake/hooks';
import { TokenAmount, Pair } from '@uniswap/sdk';
import { unwrappedToken } from 'utils/wrappedCurrency';
import {
  usePairContract,
  useDualRewardsStakingContract,
} from 'hooks/useContract';
import { useDerivedStakeInfo } from 'state/stake/hooks';
import { useTransactionAdder } from 'state/transactions/hooks';
import { CurrencyLogo, NumericalInput } from 'components';
import { Link } from 'react-router-dom';
import { useTokenBalance } from 'state/wallet/hooks';
import { useActiveWeb3React } from 'hooks';
import useTransactionDeadline from 'hooks/useTransactionDeadline';
import { useApproveCallback, ApprovalState } from 'hooks/useApproveCallback';
import {
  getAPYWithFee,
  getEarnedUSDDualFarm,
  getRewardRate,
  getStakedAmountStakingInfo,
  getTokenAddress,
  getTVLStaking,
  getUSDString,
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

const FarmDualCardDetails: React.FC<{
  pair: Pair | null | undefined;
  stakingAPY: number;
}> = ({ pair, stakingAPY }) => {
  const classes = useStyles();
  const { palette, breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const [stakeAmount, setStakeAmount] = useState('');
  const [attemptStaking, setAttemptStaking] = useState(false);
  const [attemptUnstaking, setAttemptUnstaking] = useState(false);
  const [attemptClaimReward, setAttemptClaimReward] = useState(false);
  const [approving, setApproving] = useState(false);
  const [unstakeAmount, setUnStakeAmount] = useState('');

  const stakingInfos = useDualStakingInfo(pair);
  const stakingInfo = useMemo(
    () =>
      stakingInfos && stakingInfos.length > 0 ? stakingInfos[0] : undefined,
    [stakingInfos],
  );

  const token0 = stakingInfo ? stakingInfo.tokens[0] : undefined;
  const token1 = stakingInfo ? stakingInfo.tokens[1] : undefined;

  const { account, library } = useActiveWeb3React();
  const addTransaction = useTransactionAdder();

  const currency0 = token0 ? unwrappedToken(token0) : undefined;
  const currency1 = token1 ? unwrappedToken(token1) : undefined;

  const userLiquidityUnstaked = useTokenBalance(
    account ?? undefined,
    stakingInfo?.stakedAmount.token,
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
    apyWithFee = getAPYWithFee(stakingInfo.perMonthReturnInRewards, stakingAPY);

    if (apyWithFee > 100000000) {
      apyWithFee = '>100000000';
    } else {
      apyWithFee = parseFloat(apyWithFee.toFixed(2)).toLocaleString();
    }
  }

  const stakingContract = useDualRewardsStakingContract(
    stakingInfo?.stakingRewardAddress,
  );

  const { parsedAmount: unstakeParsedAmount } = useDerivedStakeInfo(
    unstakeAmount,
    stakingInfo?.stakedAmount.token,
    stakingInfo?.stakedAmount,
  );

  const onWithdraw = () => {
    if (stakingInfo && stakingContract && unstakeParsedAmount) {
      setAttemptUnstaking(true);
      stakingContract
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

  const onClaimReward = () => {
    if (stakingInfo && stakingContract && stakingInfo.stakedAmount) {
      setAttemptClaimReward(true);
      stakingContract
        .getReward({ gasLimit: 350000 })
        .then(async (response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Claim accumulated QUICK rewards`,
          });
          try {
            await response.wait();
            setAttemptClaimReward(false);
          } catch (error) {
            setAttemptClaimReward(false);
          }
        })
        .catch((error: any) => {
          setAttemptClaimReward(false);
          console.log(error);
        });
    }
  };

  const { parsedAmount } = useDerivedStakeInfo(
    stakeAmount,
    stakingInfo?.stakedAmount.token,
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
    : undefined;
  const pairContract = usePairContract(
    stakingInfo && stakingInfo.lp && stakingInfo.lp !== ''
      ? stakingInfo.lp
      : dummyPair?.liquidityToken.address,
  );

  const onStake = async () => {
    setAttemptStaking(true);
    if (stakingContract && parsedAmount && deadline) {
      if (approval === ApprovalState.APPROVED) {
        stakingContract
          .stake(`0x${parsedAmount.raw.toString(16)}`, {
            gasLimit: 350000,
          })
          .then(async (response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Stake Deposited Liquidity`,
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
        setAttemptStaking(false);
        throw new Error(
          'Attempting to stake without approval or a signature. Please contact support.',
        );
      }
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

  const earnedUSDStr = getEarnedUSDDualFarm(stakingInfo);

  const tvl = getTVLStaking(
    stakedAmounts?.totalStakedUSD,
    stakedAmounts?.totalStakedBase,
  );

  const rewards = useMemo(() => {
    if (!stakingInfo) return 0;
    return (
      stakingInfo.rateA * stakingInfo.rewardTokenAPrice +
      stakingInfo.rateB * Number(stakingInfo.rewardTokenBPrice)
    );
  }, [stakingInfo]);

  const poolRateA = getRewardRate(
    stakingInfo?.totalRewardRateA,
    stakingInfo?.rewardTokenA,
  );
  const poolRateB = getRewardRate(
    stakingInfo?.totalRewardRateB,
    stakingInfo?.rewardTokenB,
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
              <Box width={1} display='flex' justifyContent='space-between'>
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
                    ${Number(rewards.toFixed(0)).toLocaleString()} / day
                  </Typography>
                  <Typography variant='body2'>{poolRateA}</Typography>
                  <Typography variant='body2'>{poolRateB}</Typography>
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
              <Box
                display='flex'
                flexDirection='row'
                alignItems='flex-start'
                justifyContent='space-between'
              >
                <Typography variant='body2'>In Wallet:</Typography>
                <Box
                  display='flex'
                  flexDirection='column'
                  alignItems='flex-end'
                  justifyContent='flex-start'
                >
                  <Typography variant='body2'>
                    {userLiquidityUnstaked
                      ? userLiquidityUnstaked.toSignificant(2)
                      : 0}{' '}
                    LP <span>({getUSDString(stakedAmounts?.unStakedUSD)})</span>
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
                  Number(!attemptStaking && stakeAmount) > 0 &&
                  Number(stakeAmount) <=
                    Number(userLiquidityUnstaked?.toExact())
                    ? classes.buttonClaim
                    : classes.buttonToken
                }
                mb={2}
                mt={2}
                p={2}
                onClick={async () => {
                  if (
                    !approving &&
                    !attemptStaking &&
                    Number(stakeAmount) > 0 &&
                    Number(stakeAmount) <=
                      Number(userLiquidityUnstaked?.toExact())
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
                {stakingInfo.stakedAmount.toSignificant(2)} LP{' '}
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
                  Number(stakingInfo.stakedAmount.toExact())
                  ? classes.buttonClaim
                  : classes.buttonToken
              }
              mb={2}
              mt={2}
              p={2}
              onClick={() => {
                if (
                  !attemptUnstaking &&
                  Number(unstakeAmount) > 0 &&
                  Number(unstakeAmount) <=
                    Number(stakingInfo.stakedAmount.toExact())
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
              <Box mb={1} display='flex'>
                <CurrencyLogo
                  currency={unwrappedToken(stakingInfo.rewardTokenA)}
                />
                <CurrencyLogo
                  currency={unwrappedToken(stakingInfo.rewardTokenB)}
                />
              </Box>
              <Box mb={1} textAlign='center'>
                <Typography variant='body1'>{earnedUSDStr}</Typography>
                <Typography variant='body1' color='textSecondary'>
                  {stakingInfo.earnedAmountA.toSignificant(2)}
                  <span>&nbsp;{stakingInfo.rewardTokenA.symbol}</span>
                </Typography>
                <Typography variant='body1' color='textSecondary'>
                  {stakingInfo.earnedAmountB.toSignificant(2)}
                  <span>&nbsp;{stakingInfo.rewardTokenB.symbol}</span>
                </Typography>
              </Box>
            </Box>
            <Box
              className={
                !attemptClaimReward &&
                stakingInfo.earnedAmountA.greaterThan('0')
                  ? classes.buttonClaim
                  : classes.buttonToken
              }
              mb={2}
              p={2}
              onClick={() => {
                if (
                  !attemptClaimReward &&
                  stakingInfo.earnedAmountA.greaterThan('0')
                ) {
                  onClaimReward();
                }
              }}
            >
              <Typography variant='body1'>
                {attemptClaimReward ? 'Claiming...' : 'Claim'}
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default FarmDualCardDetails;
