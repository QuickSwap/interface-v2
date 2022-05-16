import React from 'react';
import { Box, Typography, Button } from '@material-ui/core';
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
        <Typography variant='h5'>
          {info.tokens[0].symbol?.toUpperCase()}-
          {info.tokens[1].symbol?.toUpperCase()}
        </Typography>
      </Box>
      <Box className='row'>
        <Typography>24h Fees</Typography>
        <Typography component='h4'>
          ${(info?.oneDayFee ?? 0).toLocaleString()}
        </Typography>
      </Box>
      <Box className='row'>
        <Typography>Rewards</Typography>
        <Typography component='h4'>
          ${rewards.toLocaleString()} / day
        </Typography>
      </Box>
      <Box className='row'>
        <Typography>TVL</Typography>
        <Typography component='h4'>{tvl}</Typography>
      </Box>
      <Box className='row'>
        <Typography>
          APR
          <HelpIcon />
        </Typography>
        <Typography component='h5'>{apyWithFee}%</Typography>
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
