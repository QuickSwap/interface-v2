import React from 'react';
import { Box, useMediaQuery, useTheme } from '@material-ui/core';
import Slider from 'react-slick';
import { useDefaultAdsList } from 'state/ads/hooks';

interface AdsSliderProps {
  sort: string;
}

const AdsSlider: React.FC<AdsSliderProps> = ({ sort }) => {
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const ads = useDefaultAdsList()[sort];

  const adsSliderSettings = {
    dots: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 25000,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

  return ads ? (
    <Slider {...adsSliderSettings}>
      {ads.map((item, ind) => (
        <a
          key={ind}
          className='no-outline'
          href={item.link}
          target='_blank'
          rel='noreferrer'
        >
          <img src={isMobile ? item.mobileURL : item.desktopURL} width='100%' />
        </a>
      ))}
    </Slider>
  ) : (
    <></>
  );
};

export default AdsSlider;
