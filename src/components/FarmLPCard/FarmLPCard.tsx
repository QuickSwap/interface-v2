import React, { useState } from 'react';
import { Box, Typography, useMediaQuery } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { StakingInfo } from 'state/stake/hooks';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { DoubleCurrencyLogo, CurrencyLogo } from 'components';
import CircleInfoIcon from 'assets/images/circleinfo.svg';
import FarmLPCardDetails from './FarmLPCardDetails';
import {
  getAPYWithFee,
  returnTokenFromKey,
  getRewardRate,
  getStakedAmountStakingInfo,
  getTVLStaking,
  getEarnedUSDLPFarm,
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
    height: 74,
    padding: '0 16px',
    cursor: 'pointer',
  },
  farmLPText: {
    fontSize: 14,
    fontWeight: 600,
    color: palette.text.secondary,
  },
}));

const FarmLPCard: React.FC<{
  stakingInfo: StakingInfo;
  stakingAPY: number;
}> = ({ stakingInfo, stakingAPY }) => {
  const classes = useStyles();
  const { palette, breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const [isExpandCard, setExpandCard] = useState(false);

  const token0 = stakingInfo.tokens[0];
  const token1 = stakingInfo.tokens[1];

  const currency0 = unwrappedToken(token0);
  const currency1 = unwrappedToken(token1);

  const stakedAmounts = getStakedAmountStakingInfo(stakingInfo);

  let apyWithFee: number | string = 0;

  if (stakingAPY && stakingAPY > 0 && stakingInfo.perMonthReturnInRewards) {
    apyWithFee = getAPYWithFee(stakingInfo.perMonthReturnInRewards, stakingAPY);

    if (apyWithFee > 100000000) {
      apyWithFee = '>100000000';
    } else {
      apyWithFee = Number(apyWithFee.toFixed(2)).toLocaleString();
    }
  }

  const tvl = getTVLStaking(
    stakedAmounts?.totalStakedUSD,
    stakedAmounts?.totalStakedBase,
  );

  const poolRate = getRewardRate(
    stakingInfo.totalRewardRate,
    stakingInfo.rewardToken,
  );

  const earnedUSDStr = getEarnedUSDLPFarm(stakingInfo);

  const rewards = stakingInfo.rewardTokenPrice * stakingInfo.rate;

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
                ${Number(rewards.toFixed(0)).toLocaleString()} / day
              </Typography>
              <Typography variant='body2'>{poolRate}</Typography>
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
              <Box display='flex' alignItems='center' justifyContent='flex-end'>
                <CurrencyLogo
                  currency={returnTokenFromKey('QUICK')}
                  size='16px'
                />
                <Typography variant='body2' style={{ marginLeft: 5 }}>
                  {stakingInfo.earnedAmount.toSignificant(2)}
                  <span>&nbsp;dQUICK</span>
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </Box>

      {isExpandCard && (
        <FarmLPCardDetails
          pair={stakingInfo.stakingTokenPair}
          stakingAPY={stakingAPY}
        />
      )}
    </Box>
  );
};

export default FarmLPCard;
