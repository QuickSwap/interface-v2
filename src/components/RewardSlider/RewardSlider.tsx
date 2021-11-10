import React from 'react';
import Slider from 'react-slick';
import { useMediaQuery } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { useStakingInfo } from 'state/stake/hooks';
import RewardSliderItem from './RewardSliderItem';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  rewardsSlider: {
    width: 1072,
    display: 'flex',
    justifyContent: 'space-between',
    margin: '64px auto 56px',
    '& .slick-slide': {
      padding: '0 20px',
      [breakpoints.down('xs')]: {
        padding: '0 6px'
      }
    },
    '& .slick-arrow': {
      color: palette.success.dark,
      width: 32,
      height: 32,
    },
    [breakpoints.down('md')]: {
      width: 776
    },
    [breakpoints.down('sm')]: {
      width: 360,
    },
    [breakpoints.down('xs')]: {
      width: 320,
    }
  },
}));

const RewardSlider: React.FC = () => {
  const classes = useStyles();
  const theme = useTheme();
  const tabletWindowSize = useMediaQuery(theme.breakpoints.down('md'));
  const mobileWindowSize = useMediaQuery(theme.breakpoints.down('sm'));
  const stakingInfos = useStakingInfo();
  const rewardItems = stakingInfos.slice(0, 5);

  const rewardSliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: mobileWindowSize ? 1 : tabletWindowSize ? 2 : 3,
    slidesToScroll: 1,
    nextArrow: <ChevronRightIcon />,
    prevArrow: <ChevronLeftIcon />
  };

  return (
    <Slider {...rewardSliderSettings} className={classes.rewardsSlider}>
      {
        rewardItems.map((item, index) => (
          <RewardSliderItem key={index} info={item} />
        ))
      }
    </Slider>
  )
}

export default RewardSlider; 