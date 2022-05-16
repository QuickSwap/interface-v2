import React, { useState } from 'react';
import { Box, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
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
import 'components/styles/FarmCard.scss';

const FarmCard: React.FC<{
  stakingInfo: StakingInfo | DualStakingInfo;
  stakingAPY: number;
  isLPFarm?: boolean;
}> = ({ stakingInfo, stakingAPY, isLPFarm }) => {
  const { breakpoints } = useTheme();
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
        <small>
          {currency0.symbol} / {currency1.symbol} LP
        </small>
      </Box>
    </Box>
  );

  return (
    <Box className={`farmLPCard ${isExpandCard ? 'highlightedCard' : ''}`}>
      <Box
        className='farmLPCardUp'
        onClick={() => setExpandCard(!isExpandCard)}
      >
        {isMobile ? (
          <>
            {renderPool(isExpandCard ? 0.95 : 0.7)}
            {!isExpandCard && (
              <Box width={0.25}>
                <Box display='flex' alignItems='center'>
                  <span className='text-secondary'>APY</span>
                  <Box ml={0.5} height={16}>
                    <img src={CircleInfoIcon} alt={'arrow up'} />
                  </Box>
                </Box>
                <Box mt={0.5}>
                  <small className='text-success'>{apyWithFee}%</small>
                </Box>
              </Box>
            )}
            <Box
              width={0.05}
              display='flex'
              justifyContent='flex-end'
              className='text-primary'
            >
              {isExpandCard ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </Box>
          </>
        ) : (
          <>
            {renderPool(0.3)}
            <Box width={0.2} textAlign='center'>
              <small>{tvl}</small>
            </Box>
            <Box width={0.25} textAlign='center'>
              <p className='small'>
                ${(isLPFarm ? lpRewards : dualRewards).toLocaleString()} / day
              </p>
              {isLPFarm ? (
                <p className='small'>{lpPoolRate}</p>
              ) : (
                <>
                  <p className='small'>{dualPoolRateA}</p>
                  <p className='small'>{dualPoolRateB}</p>
                </>
              )}
            </Box>
            <Box
              width={0.15}
              display='flex'
              justifyContent='center'
              alignItems='center'
              className='text-success'
            >
              <small>{apyWithFee}%</small>
              <Box ml={0.5} height={16}>
                <img src={CircleInfoIcon} alt={'arrow up'} />
              </Box>
            </Box>
            <Box width={0.2} textAlign='right'>
              <small>{earnedUSDStr}</small>
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
                  <small style={{ marginLeft: 5 }}>
                    {formatTokenAmount(lpStakingInfo.earnedAmount)}
                    &nbsp;{lpStakingInfo.rewardToken.symbol}
                  </small>
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
                    <small style={{ marginLeft: 5 }}>
                      {formatTokenAmount(dualStakingInfo.earnedAmountA)}
                      &nbsp;{dualStakingInfo.rewardTokenA.symbol}
                    </small>
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
                    <small style={{ marginLeft: 5 }}>
                      {formatTokenAmount(dualStakingInfo.earnedAmountB)}
                      &nbsp;{dualStakingInfo.rewardTokenB.symbol}
                    </small>
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
