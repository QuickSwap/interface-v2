import React, { useState, useEffect, useMemo } from 'react';
import Slider from 'react-slick';
import { useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { StakingInfo } from 'types';
import { useStakingInfo, getBulkPairData } from 'state/stake/hooks';
import RewardSliderItem from './RewardSliderItem';
import { useActiveWeb3React } from 'hooks';
import { getOneYearFee } from 'utils';
import 'components/styles/RewardSlider.scss';
import { useDefaultFarmList } from 'state/farms/hooks';
import { ChainId } from '@uniswap/sdk';

const RewardSlider: React.FC = () => {
  const theme = useTheme();
  const { chainId } = useActiveWeb3React();
  const tabletWindowSize = useMediaQuery(theme.breakpoints.down('md'));
  const mobileWindowSize = useMediaQuery(theme.breakpoints.down('sm'));
  const defaultChainId = chainId ?? ChainId.MATIC;
  const rewardItems = useStakingInfo(defaultChainId, null, 0, 5);
  const [bulkPairs, setBulkPairs] = useState<any>(null);
  const farms = useDefaultFarmList()[defaultChainId];

  const stakingPairLists = useMemo(() => {
    return Object.values(farms)
      .filter((item) => !item.ended)
      .slice(0, 5)
      .map((item) => item.pair);
  }, [farms]);

  useEffect(() => {
    getBulkPairData(stakingPairLists).then((data) => setBulkPairs(data));
  }, [stakingPairLists]);

  const stakingAPYs = useMemo(() => {
    if (bulkPairs && rewardItems.length > 0) {
      return rewardItems.map((info: StakingInfo) => {
        const oneDayVolume = bulkPairs[info.pair]?.oneDayVolumeUSD;
        const reserveUSD = bulkPairs[info.pair]?.reserveUSD;
        if (oneDayVolume && reserveUSD) {
          return getOneYearFee(oneDayVolume, reserveUSD);
        } else {
          return 0;
        }
      });
    } else {
      return [];
    }
  }, [bulkPairs, rewardItems]);

  const rewardSliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: mobileWindowSize ? 1 : tabletWindowSize ? 2 : 3,
    slidesToScroll: 1,
    nextArrow: <ChevronRightIcon />,
    prevArrow: <ChevronLeftIcon />,
  };

  return (
    <Slider {...rewardSliderSettings} className='rewardsSlider'>
      {rewardItems.map((item, index) => (
        <RewardSliderItem
          key={index}
          stakingAPY={stakingAPYs[index]}
          info={item}
        />
      ))}
    </Slider>
  );
};

export default React.memo(RewardSlider);
