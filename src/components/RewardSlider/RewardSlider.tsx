import React, { useState, useEffect, useMemo } from 'react';
import Slider from 'react-slick';
import { ChevronLeft, ChevronRight } from 'react-feather';
import {
  useStakingInfo,
  getBulkPairData,
  useDualStakingInfo,
} from 'state/stake/hooks';
import RewardSliderItem from './RewardSliderItem';
import { useActiveWeb3React } from 'hooks';
import { getOneYearFee } from 'utils';
import 'components/styles/RewardSlider.scss';
import { ChainId } from '@uniswap/sdk';
import { useIsXS, useIsSM } from 'hooks/useMediaQuery';

const RewardSlider: React.FC = () => {
  const { chainId } = useActiveWeb3React();
  const tabletWindowSize = useIsSM();
  const mobileWindowSize = useIsXS();
  const defaultChainId = chainId ?? ChainId.MATIC;
  const lprewardItems = useStakingInfo(defaultChainId, null, 0, 2);
  const dualrewardItems = useDualStakingInfo(defaultChainId, null, 0, 1);
  const [bulkPairs, setBulkPairs] = useState<any>(null);

  const stakingPairListStr = useMemo(() => {
    return lprewardItems
      .map((item) => item.pair)
      .concat(dualrewardItems.map((item) => item.pair))
      .join(',');
  }, [dualrewardItems, lprewardItems]);

  const stakingPairLists = stakingPairListStr.split(',');

  useEffect(() => {
    const stakingPairLists = stakingPairListStr.split(',');
    if (stakingPairListStr) {
      getBulkPairData(stakingPairLists).then((data) => setBulkPairs(data));
    }
  }, [stakingPairListStr]);

  const stakingAPYs = useMemo(() => {
    if (bulkPairs && stakingPairLists.length > 0) {
      return stakingPairLists.map((pair) => {
        const oneDayVolume = bulkPairs[pair]?.oneDayVolumeUSD;
        const reserveUSD = bulkPairs[pair]?.reserveUSD;
        if (oneDayVolume && reserveUSD) {
          return getOneYearFee(oneDayVolume, reserveUSD);
        } else {
          return 0;
        }
      });
    } else {
      return [];
    }
  }, [bulkPairs, stakingPairLists]);

  const rewardSliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: mobileWindowSize ? 1 : tabletWindowSize ? 2 : 3,
    slidesToScroll: 1,
    nextArrow: <ChevronRight />,
    prevArrow: <ChevronLeft />,
  };

  return (
    <Slider {...rewardSliderSettings} className='rewardsSlider'>
      {lprewardItems.map((item, index) => (
        <RewardSliderItem
          key={index}
          stakingAPY={stakingAPYs[index]}
          info={item}
        />
      ))}
      {dualrewardItems.map((item, index) => (
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
