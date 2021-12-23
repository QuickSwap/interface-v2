import React, { useState } from 'react';
import { TransactionResponse } from '@ethersproject/providers';
import { Box, Typography, useMediaQuery } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { DualStakingInfo } from 'state/stake/hooks';
import { JSBI, TokenAmount, Pair, ETHER } from '@uniswap/sdk';
import { QUICK, EMPTY } from 'constants/index';
import { unwrappedToken } from 'utils/wrappedCurrency';
import {
  usePairContract,
  useDualRewardsStakingContract,
} from 'hooks/useContract';
import { useDerivedStakeInfo } from 'state/stake/hooks';
import { useTransactionAdder } from 'state/transactions/hooks';
import { DoubleCurrencyLogo, CurrencyLogo } from 'components';
import CircleInfoIcon from 'assets/images/circleinfo.svg';
import { Link } from 'react-router-dom';
import { useTokenBalance } from 'state/wallet/hooks';
import { useActiveWeb3React } from 'hooks';
import useTransactionDeadline from 'hooks/useTransactionDeadline';
import { useApproveCallback, ApprovalState } from 'hooks/useApproveCallback';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  syrupCard: {
    background: palette.secondary.dark,
    width: '100%',
    borderRadius: 10,
    marginTop: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  syrupCardUp: {
    background: palette.secondary.dark,
    width: '100%',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    cursor: 'pointer',
    [breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
  inputVal: {
    backgroundColor: palette.secondary.contrastText,
    borderRadius: '10px',
    height: '50px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    '& input': {
      flex: 1,
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
      outline: 'none',
      fontSize: 16,
      fontWeight: 600,
      color: palette.text.primary,
    },
    '& p': {
      cursor: 'pointer',
    },
  },
  buttonToken: {
    backgroundColor: '#3e4252',
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
  syrupText: {
    fontSize: 14,
    fontWeight: 600,
    color: palette.text.secondary,
  },
}));

const FarmDualCard: React.FC<{
  stakingInfo: DualStakingInfo;
  dQuicktoQuick: number;
  stakingAPY: number;
}> = ({ stakingInfo, dQuicktoQuick, stakingAPY }) => {
  const classes = useStyles();
  const { palette, breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const [isExpandCard, setExpandCard] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [attemptStaking, setAttemptStaking] = useState(false);
  const [attemptUnstaking, setAttemptUnstaking] = useState(false);
  const [attemptClaimReward, setAttemptClaimReward] = useState(false);
  // const [hash, setHash] = useState<string | undefined>();
  const [unstakeAmount, setUnStakeAmount] = useState('');

  const token0 = stakingInfo.tokens[0];
  const token1 = stakingInfo.tokens[1];

  const rewardTokenA = stakingInfo.rewardTokenA;
  const rewardTokenB = stakingInfo.rewardTokenB;

  const { account, library } = useActiveWeb3React();
  const addTransaction = useTransactionAdder();

  const currency0 = unwrappedToken(token0);
  const currency1 = unwrappedToken(token1);
  const baseTokenCurrency = unwrappedToken(stakingInfo.baseToken);
  const empty = unwrappedToken(EMPTY);

  // get the color of the token
  const baseToken =
    baseTokenCurrency === empty ? token0 : stakingInfo.baseToken;

  const totalSupplyOfStakingToken = stakingInfo.totalSupply;
  const stakingTokenPair = stakingInfo.stakingTokenPair;

  const userLiquidityUnstaked = useTokenBalance(
    account ?? undefined,
    stakingInfo.stakedAmount.token,
  );

  let valueOfTotalStakedAmountInBaseToken: TokenAmount | undefined;
  let valueOfMyStakedAmountInBaseToken: TokenAmount | undefined;
  let valueOfUnstakedAmountInBaseToken: TokenAmount | undefined;
  if (
    totalSupplyOfStakingToken &&
    stakingTokenPair &&
    stakingInfo &&
    baseToken
  ) {
    // take the total amount of LP tokens staked, multiply by ETH value of all LP tokens, divide by all LP tokens
    valueOfTotalStakedAmountInBaseToken = new TokenAmount(
      baseToken,
      JSBI.divide(
        JSBI.multiply(
          JSBI.multiply(
            stakingInfo.totalStakedAmount.raw,
            stakingTokenPair.reserveOf(baseToken).raw,
          ),
          JSBI.BigInt(2), // this is b/c the value of LP shares are ~double the value of the WETH they entitle owner to
        ),
        totalSupplyOfStakingToken.raw,
      ),
    );

    valueOfMyStakedAmountInBaseToken = new TokenAmount(
      baseToken,
      JSBI.divide(
        JSBI.multiply(
          JSBI.multiply(
            stakingInfo.stakedAmount.raw,
            stakingTokenPair.reserveOf(baseToken).raw,
          ),
          JSBI.BigInt(2), // this is b/c the value of LP shares are ~double the value of the WETH they entitle owner to
        ),
        totalSupplyOfStakingToken.raw,
      ),
    );

    if (userLiquidityUnstaked) {
      valueOfUnstakedAmountInBaseToken = new TokenAmount(
        baseToken,
        JSBI.divide(
          JSBI.multiply(
            JSBI.multiply(
              userLiquidityUnstaked.raw,
              stakingTokenPair.reserveOf(baseToken).raw,
            ),
            JSBI.BigInt(2),
          ),
          totalSupplyOfStakingToken.raw,
        ),
      );
    }
  }

  // get the USD value of staked WETH
  const USDPrice = stakingInfo.usdPrice;
  const valueOfTotalStakedAmountInUSDC =
    valueOfTotalStakedAmountInBaseToken &&
    USDPrice?.quote(valueOfTotalStakedAmountInBaseToken);

  const valueOfMyStakedAmountInUSDC =
    valueOfMyStakedAmountInBaseToken &&
    USDPrice?.quote(valueOfMyStakedAmountInBaseToken);

  const valueOfUnstakedAmountInUSDC =
    valueOfUnstakedAmountInBaseToken &&
    USDPrice?.quote(valueOfUnstakedAmountInBaseToken);

  let apyWithFee: number | string = 0;

  if (stakingAPY && stakingAPY > 0) {
    apyWithFee =
      ((1 +
        ((Number(stakingInfo.perMonthReturnInRewards) +
          Number(stakingAPY) / 12) *
          12) /
          12) **
        12 -
        1) *
      100;

    if (apyWithFee > 100000000) {
      apyWithFee = '>100000000';
    } else {
      apyWithFee = parseFloat(apyWithFee.toFixed(2)).toLocaleString();
    }
  }

  const tvl = valueOfTotalStakedAmountInUSDC
    ? `$${valueOfTotalStakedAmountInUSDC.toFixed(0, { groupSeparator: ',' })}`
    : `${valueOfTotalStakedAmountInBaseToken?.toSignificant(4, {
        groupSeparator: ',',
      }) ?? '-'} ETH`;

  const poolRateA = `${stakingInfo.totalRewardRateA
    ?.toFixed(2, { groupSeparator: ',' })
    .replace(/[.,]00$/, '') +
    ' ' +
    rewardTokenA?.symbol}  / day`;
  const poolRateB = `${stakingInfo.totalRewardRateB
    ?.toFixed(2, { groupSeparator: ',' })
    .replace(/[.,]00$/, '') +
    ' ' +
    rewardTokenB?.symbol} / day`;

  const stakingContract = useDualRewardsStakingContract(
    stakingInfo.stakingRewardAddress,
  );

  const onWithdraw = async () => {
    if (stakingContract && stakingInfo?.stakedAmount) {
      setAttemptUnstaking(true);
      await stakingContract
        .exit({ gasLimit: 300000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Withdraw deposited liquidity`,
          });
          // setHash(response.hash);
        })
        .catch((error: any) => {
          setAttemptUnstaking(false);
          console.log(error);
        });
    }
  };

  const onClaimReward = async () => {
    if (stakingContract && stakingInfo?.stakedAmount) {
      setAttemptClaimReward(true);
      await stakingContract
        .getReward({ gasLimit: 350000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Claim accumulated QUICK rewards`,
          });
          // setHash(response.hash);
        })
        .catch((error: any) => {
          setAttemptClaimReward(false);
          console.log(error);
        });
    }
    if (stakingContract && stakingInfo.stakedAmount) {
      await stakingContract
        .getReward({ gasLimit: 350000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Claim accumulated rewards`,
          });
          // setHash(response.hash);
        })
        .catch((error: any) => {
          console.log(error);
        });
    }
  };

  const { parsedAmount } = useDerivedStakeInfo(
    stakeAmount,
    stakingInfo.stakedAmount.token,
    userLiquidityUnstaked,
  );
  const deadline = useTransactionDeadline();
  const [approval, approveCallback] = useApproveCallback(
    parsedAmount,
    stakingInfo.stakingRewardAddress,
  );
  const [signatureData, setSignatureData] = useState<{
    v: number;
    r: string;
    s: string;
    deadline: number;
  } | null>(null);

  const dummyPair = new Pair(
    new TokenAmount(stakingInfo.tokens[0], '0'),
    new TokenAmount(stakingInfo.tokens[1], '0'),
  );
  const pairContract = usePairContract(
    stakingInfo.lp && stakingInfo.lp !== ''
      ? stakingInfo.lp
      : dummyPair.liquidityToken.address,
  );

  const onStake = async () => {
    setAttemptStaking(true);
    if (stakingContract && parsedAmount && deadline) {
      if (approval === ApprovalState.APPROVED) {
        await stakingContract.stake(`0x${parsedAmount.raw.toString(16)}`, {
          gasLimit: 350000,
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

    return approveCallback();
  };

  const earnedUSD =
    Number(stakingInfo.earnedAmountA.toSignificant()) *
      dQuicktoQuick *
      stakingInfo.quickPrice +
    Number(stakingInfo.earnedAmountB.toSignificant()) * stakingInfo.maticPrice;

  const earnedUSDStr =
    earnedUSD < 0.001 && earnedUSD > 0
      ? '< $0.001'
      : '$' + earnedUSD.toLocaleString();

  const rewards =
    stakingInfo?.rateA * stakingInfo?.quickPrice +
    stakingInfo?.rateB * Number(stakingInfo.rewardTokenBPrice);

  return (
    <Box className={classes.syrupCard}>
      <Box
        className={classes.syrupCardUp}
        onClick={() => setExpandCard(!isExpandCard)}
      >
        <Box
          display='flex'
          alignItems='center'
          justifyContent='space-between'
          width={isMobile ? 1 : 0.3}
          mb={isMobile ? 1.5 : 0}
        >
          {isMobile && (
            <Typography className={classes.syrupText}>Pool</Typography>
          )}
          <Box display='flex' alignItems='center'>
            <DoubleCurrencyLogo
              currency0={currency0}
              currency1={currency1}
              size={28}
            />
            <Box ml={1.5}>
              <Typography variant='body2'>
                {currency0.symbol} / {currency1.symbol} LP
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box
          width={isMobile ? 1 : 0.2}
          mb={isMobile ? 1.5 : 0}
          display='flex'
          justifyContent={isMobile ? 'space-between' : 'center'}
          alignItems='center'
        >
          {isMobile && (
            <Typography className={classes.syrupText}>TVL</Typography>
          )}
          <Typography variant='body2'>{tvl}</Typography>
        </Box>
        <Box
          mb={isMobile ? 1.5 : 0}
          width={isMobile ? 1 : 0.25}
          display='flex'
          justifyContent={isMobile ? 'space-between' : 'center'}
          alignItems='center'
        >
          {isMobile && (
            <Typography className={classes.syrupText}>Rewards</Typography>
          )}
          <Box textAlign={isMobile ? 'right' : 'left'}>
            <Typography variant='body2'>{`$${parseInt(
              rewards.toFixed(0),
            ).toLocaleString()} / day`}</Typography>
            <Typography variant='body2'>{poolRateA}</Typography>
            <Typography variant='body2'>{poolRateB}</Typography>
          </Box>
        </Box>
        <Box
          mb={isMobile ? 1.5 : 0}
          width={isMobile ? 1 : 0.15}
          display='flex'
          alignItems='center'
          justifyContent={isMobile ? 'space-between' : 'center'}
        >
          {isMobile && (
            <Typography className={classes.syrupText}>APY</Typography>
          )}
          <Box display='flex' alignItems='center'>
            <Typography variant='body2' style={{ color: palette.success.main }}>
              {apyWithFee}%
            </Typography>
            <Box ml={1} style={{ height: '16px' }}>
              <img src={CircleInfoIcon} alt={'arrow up'} />
            </Box>
          </Box>
        </Box>
        <Box
          width={isMobile ? 1 : 0.2}
          display='flex'
          justifyContent={isMobile ? 'space-between' : 'flex-end'}
        >
          {isMobile && (
            <Typography className={classes.syrupText}>Earned</Typography>
          )}
          <Box textAlign='right'>
            <Typography variant='body2'>{earnedUSDStr}</Typography>
            <Box display='flex' alignItems='center' justifyContent='flex-end'>
              <CurrencyLogo currency={QUICK} size='16px' />
              <Typography variant='body2' style={{ marginLeft: 5 }}>
                {stakingInfo.earnedAmountA.toSignificant(2)}
                <span>&nbsp;dQUICK</span>
              </Typography>
            </Box>
            <Box display='flex' alignItems='center' justifyContent='flex-end'>
              <CurrencyLogo
                currency={
                  rewardTokenB.symbol?.toLowerCase() === 'wmatic'
                    ? ETHER
                    : rewardTokenB
                }
                size='16px'
              />
              <Typography variant='body2' style={{ marginLeft: 5 }}>
                {stakingInfo.earnedAmountB.toSignificant(2)}
                <span>&nbsp;{rewardTokenB.symbol}</span>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {isExpandCard && (
        <Box
          width='100%'
          mt={2.5}
          pl={isMobile ? 2 : 4}
          pr={isMobile ? 2 : 4}
          pt={2}
          display='flex'
          flexDirection='row'
          flexWrap='wrap'
          borderTop='1px solid #444444'
          alignItems='center'
          justifyContent='space-between'
        >
          <Box
            minWidth={250}
            width={isMobile ? 1 : 0.3}
            color={palette.text.secondary}
            my={1.5}
          >
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
                  LP{' '}
                  <span>
                    (${valueOfUnstakedAmountInUSDC?.toSignificant(2)})
                  </span>
                </Typography>
                <Link
                  to={`/pools?currency0=${
                    token0.symbol?.toLowerCase() === 'wmatic'
                      ? 'ETH'
                      : token0.address
                  }&currency1=${
                    token1.symbol?.toLowerCase() === 'wmatic'
                      ? 'ETH'
                      : token1.address
                  }`}
                  style={{ color: palette.primary.main }}
                >
                  Get {currency0.symbol} / {currency1.symbol} LP
                </Link>
              </Box>
            </Box>
            <Box className={classes.inputVal} mb={2} mt={2} p={2}>
              <input
                placeholder='0.00'
                value={stakeAmount}
                onChange={(evt: any) => {
                  setStakeAmount(evt.target.value);
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
                    setStakeAmount(userLiquidityUnstaked.toSignificant());
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
                Number(!attemptStaking && stakeAmount) > 0 &&
                Number(stakeAmount) <=
                  Number(userLiquidityUnstaked?.toSignificant())
                  ? classes.buttonClaim
                  : classes.buttonToken
              }
              mb={2}
              mt={2}
              p={2}
              onClick={() => {
                if (
                  !attemptStaking &&
                  Number(stakeAmount) > 0 &&
                  Number(stakeAmount) <=
                    Number(userLiquidityUnstaked?.toSignificant())
                ) {
                  if (
                    approval === ApprovalState.APPROVED ||
                    signatureData !== null
                  ) {
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
                  : approval === ApprovalState.APPROVED ||
                    signatureData !== null
                  ? 'Stake LP Tokens'
                  : 'Approve'}
              </Typography>
            </Box>
          </Box>
          <Box
            minWidth={250}
            width={isMobile ? 1 : 0.3}
            my={1.5}
            color={palette.text.secondary}
          >
            <Box
              display='flex'
              flexDirection='row'
              alignItems='flex-start'
              justifyContent='space-between'
            >
              <Typography variant='body2'>My deposits:</Typography>
              <Typography variant='body2'>
                {stakingInfo.stakedAmount.toSignificant(2)} LP{' '}
                <span>(${valueOfMyStakedAmountInUSDC?.toSignificant(2)})</span>
              </Typography>
            </Box>
            <Box className={classes.inputVal} mb={2} mt={4.5} p={2}>
              <input
                placeholder='0.00'
                value={unstakeAmount}
                onChange={(evt: any) => {
                  setUnStakeAmount(evt.target.value);
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
                    setUnStakeAmount(stakingInfo.stakedAmount.toSignificant());
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
                  Number(stakingInfo.stakedAmount.toSignificant())
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
                    Number(stakingInfo.stakedAmount.toSignificant())
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
          <Box
            minWidth={250}
            my={1.5}
            width={isMobile ? 1 : 0.3}
            color={palette.text.secondary}
          >
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
                <CurrencyLogo currency={QUICK} />
                <CurrencyLogo
                  currency={
                    rewardTokenB.symbol?.toLowerCase() === 'wmatic'
                      ? ETHER
                      : rewardTokenB
                  }
                />
              </Box>
              <Box mb={1} textAlign='center'>
                <Typography variant='body1'>{earnedUSDStr}</Typography>
                <Typography variant='body1' color='textSecondary'>
                  {stakingInfo.earnedAmountA.toSignificant(2)}
                  <span>&nbsp;dQUICK</span>
                </Typography>
                <Typography variant='body1' color='textSecondary'>
                  {stakingInfo.earnedAmountB.toSignificant(2)}
                  <span>&nbsp;{rewardTokenB.symbol}</span>
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
        </Box>
      )}
    </Box>
  );
};

export default FarmDualCard;
