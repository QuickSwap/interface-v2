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
import { useTranslation } from 'react-i18next';

interface RewardSliderItemProps {
  info: StakingInfo;
  stakingAPY: number;
}

const RewardSliderItem: React.FC<RewardSliderItemProps> = ({
  info,
  stakingAPY,
}) => {
  const { t } = useTranslation();
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
    <Box className='rewardsSliderItem bg-palette'>
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
        <p className='text-gray22'>{t('24hFees')}</p>
        <p>${(info?.oneDayFee ?? 0).toLocaleString()}</p>
      </Box>
      <Box className='row'>
        <p className='text-gray22'>{t('rewards')}</p>
        <p>
          ${rewards.toLocaleString()} / {t('day')}
        </p>
      </Box>
      <Box className='row'>
        <p className='text-gray22'>{t('tvl')}</p>
        <p>{tvl}</p>
      </Box>
      <Box className='row'>
        <p className='text-gray22'>
          {t('apr')}
          <HelpIcon />
        </p>
        <Box className='rewardApyWrapper'>
          <p className='text-success'>{apyWithFee}%</p>
        </Box>
      </Box>
      <Box mt='30px'>
        <Button
          fullWidth
          onClick={() => {
            history.push(
              `/pools?currency0=${info.tokens[0].address}&currency1=${info.tokens[1].address}`,
            );
          }}
        >
          {t('depositLP')}
        </Button>
      </Box>
    </Box>
  );
};

export default RewardSliderItem;
