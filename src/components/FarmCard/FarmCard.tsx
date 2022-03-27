import React, { useState } from 'react';
import { Box, Typography, useMediaQuery } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { DualStakingInfo, StakingInfo } from 'types';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { DoubleCurrencyLogo, CurrencyLogo } from 'components';
import CircleInfoIcon from 'assets/images/circleinfo.svg';
import FarmCardDetails from './FarmCardDetails';
import {
  getAPYWithFee,
  getRewardRate,
  getStakedAmountStakingInfo,
  getTVLStaking,
  getEarnedUSDLPFarm,
  getEarnedUSDDualFarm,
  formatTokenAmount,
  formatAPY,
} from 'utils';
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';

const useStyles = makeStyles(({ palette }) => ({
  farmLPCard: {
    background: palette.secondary.dark,
    width: '100%',
    borderRadius: 10,
    marginTop: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  farmLPCardUp: {
    background: palette.secondary.dark,
    width: '100%',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    cursor: 'pointer',
  },
  farmLPText: {
    fontSize: 14,
    fontWeight: 600,
    color: palette.text.secondary,
  },
}));

const FarmCard: React.FC<{
  stakingInfo: StakingInfo | DualStakingInfo;
  stakingAPY: number;
  isLPFarm?: boolean;
}> = ({ stakingInfo, stakingAPY, isLPFarm }) => {
  const classes = useStyles();
  const { palette, breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const [isExpandCard, setExpandCard] = useState(false);
  const lpStakingInfo = stakingInfo as StakingInfo;
  const dualStakingInfo = stakingInfo as DualStakingInfo;

  const token0 = stakingInfo.tokens[0];
  const token1 = stakingInfo.tokens[1];

  const currency0 = unwrappedToken(token0);
  const currency1 = unwrappedToken(token1);

  const stakedAmounts = getStakedAmountStakingInfo(stakingInfo);

  let apyWithFee: number | string = 0;

  if (stakingAPY && stakingAPY > 0 && stakingInfo.perMonthReturnInRewards) {
    apyWithFee = formatAPY(
      getAPYWithFee(stakingInfo.perMonthReturnInRewards, stakingAPY),
    );
  }

  const tvl = getTVLStaking(
    stakedAmounts?.totalStakedUSD,
    stakedAmounts?.totalStakedBase,
  );

  const lpPoolRate = getRewardRate(
    lpStakingInfo.totalRewardRate,
    lpStakingInfo.rewardToken,
  );

  const dualPoolRateA = getRewardRate(
    dualStakingInfo.totalRewardRateA,
    dualStakingInfo.rewardTokenA,
  );
  const dualPoolRateB = getRewardRate(
    dualStakingInfo.totalRewardRateB,
    dualStakingInfo.rewardTokenB,
  );

  const earnedUSDStr = isLPFarm
    ? getEarnedUSDLPFarm(lpStakingInfo)
    : getEarnedUSDDualFarm(dualStakingInfo);

  const lpRewards = lpStakingInfo.rewardTokenPrice * lpStakingInfo.rate;
  const dualRewards =
    dualStakingInfo.rateA * dualStakingInfo.rewardTokenAPrice +
    dualStakingInfo.rateB * dualStakingInfo.rewardTokenBPrice;

  const renderPool = (width: number) => (
    <Box display='flex' alignItems='center' width={width}>
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
  );

  return (
    <Box className={classes.farmLPCard}>
      <Box
        className={classes.farmLPCardUp}
        onClick={() => setExpandCard(!isExpandCard)}
      >
        {isMobile ? (
          <>
            {renderPool(isExpandCard ? 0.95 : 0.7)}
            {!isExpandCard && (
              <Box width={0.25}>
                <Box display='flex' alignItems='center'>
                  <Typography variant='caption' color='textSecondary'>
                    APY
                  </Typography>
                  <Box ml={0.5} height={16}>
                    <img src={CircleInfoIcon} alt={'arrow up'} />
                  </Box>
                </Box>
                <Box mt={0.5} color={palette.success.main}>
                  <Typography variant='body2'>{apyWithFee}%</Typography>
                </Box>
              </Box>
            )}
            <Box
              width={0.05}
              display='flex'
              justifyContent='flex-end'
              color={palette.primary.main}
            >
              {isExpandCard ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </Box>
          </>
        ) : (
          <>
            {renderPool(0.3)}
            <Box width={0.2} textAlign='center'>
              <Typography variant='body2'>{tvl}</Typography>
            </Box>
            <Box width={0.25} textAlign='center'>
              <Typography variant='body2'>
                ${(isLPFarm ? lpRewards : dualRewards).toLocaleString()} / day
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
            <Box
              width={0.15}
              display='flex'
              justifyContent='center'
              alignItems='center'
              color={palette.success.main}
            >
              <Typography variant='body2'>{apyWithFee}%</Typography>
              <Box ml={0.5} height={16}>
                <img src={CircleInfoIcon} alt={'arrow up'} />
              </Box>
            </Box>
            <Box width={0.2} textAlign='right'>
              <Typography variant='body2'>{earnedUSDStr}</Typography>
              {isLPFarm ? (
                <Box
                  display='flex'
                  alignItems='center'
                  justifyContent='flex-end'
                >
                  <CurrencyLogo
                    currency={lpStakingInfo.rewardToken}
                    size='16px'
                  />
                  <Typography variant='body2' style={{ marginLeft: 5 }}>
                    {formatTokenAmount(lpStakingInfo.earnedAmount)}
                    <span>&nbsp;{lpStakingInfo.rewardToken.symbol}</span>
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box
                    display='flex'
                    alignItems='center'
                    justifyContent='flex-end'
                  >
                    <CurrencyLogo
                      currency={unwrappedToken(dualStakingInfo.rewardTokenA)}
                      size='16px'
                    />
                    <Typography variant='body2' style={{ marginLeft: 5 }}>
                      {formatTokenAmount(dualStakingInfo.earnedAmountA)}
                      <span>&nbsp;{dualStakingInfo.rewardTokenA.symbol}</span>
                    </Typography>
                  </Box>
                  <Box
                    display='flex'
                    alignItems='center'
                    justifyContent='flex-end'
                  >
                    <CurrencyLogo
                      currency={unwrappedToken(dualStakingInfo.rewardTokenB)}
                      size='16px'
                    />
                    <Typography variant='body2' style={{ marginLeft: 5 }}>
                      {formatTokenAmount(dualStakingInfo.earnedAmountB)}
                      <span>&nbsp;{dualStakingInfo.rewardTokenB.symbol}</span>
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </>
        )}
      </Box>

      {isExpandCard && (
        <FarmCardDetails
          stakingInfo={stakingInfo}
          stakingAPY={stakingAPY}
          isLPFarm={isLPFarm}
        />
      )}
    </Box>
  );
};

export default FarmCard;
