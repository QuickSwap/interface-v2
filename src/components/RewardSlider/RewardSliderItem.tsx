import React from 'react';
import { Box, Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { StakingInfo } from 'types';
import { DoubleCurrencyLogo } from 'components';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon.svg';
import {
  formatAPY,
  getAPYWithFee,
  getStakedAmountStakingInfo,
  getTVLStaking,
} from 'utils';

interface RewardSliderItemProps {
  info: StakingInfo;
  stakingAPY: number;
}

const RewardSliderItem: React.FC<RewardSliderItemProps> = ({
  info,
  stakingAPY,
}) => {
  const history = useHistory();

  const stakedAmounts = getStakedAmountStakingInfo(info);
  const tvl = getTVLStaking(
    stakedAmounts?.totalStakedUSD,
    stakedAmounts?.totalStakedBase,
  );

  const rewards = info.rate * info.rewardTokenPrice;

  let apyWithFee;
  if (stakingAPY && stakingAPY > 0) {
    apyWithFee = formatAPY(
      getAPYWithFee(info.perMonthReturnInRewards ?? 0, stakingAPY),
    );
  }

  return (
    <Box className='rewardsSliderItem'>
      <Box mb={4}>
        <Box className='rewardIcon'>
          <DoubleCurrencyLogo
            currency0={info.tokens[0]}
            currency1={info.tokens[1]}
            size={32}
          />
        </Box>
        <h5>
          {info.tokens[0].symbol?.toUpperCase()}-
          {info.tokens[1].symbol?.toUpperCase()}
        </h5>
      </Box>
      <Box className='row'>
        <p>24h Fees</p>
        <h4>${(info?.oneDayFee ?? 0).toLocaleString()}</h4>
      </Box>
      <Box className='row'>
        <p>Rewards</p>
        <h4>${rewards.toLocaleString()} / day</h4>
      </Box>
      <Box className='row'>
        <p>TVL</p>
        <h4>{tvl}</h4>
      </Box>
      <Box className='row'>
        <p>
          APR
          <HelpIcon />
        </p>
        <h5>{apyWithFee}%</h5>
      </Box>
      <Button
        fullWidth
        style={{ marginTop: '30px' }}
        onClick={() => {
          history.push(
            `/pools?currency0=${info.tokens[0].address}&currency1=${info.tokens[1].address}`,
          );
        }}
      >
        Deposit LP Tokens
      </Button>
    </Box>
  );
};

export default RewardSliderItem;
