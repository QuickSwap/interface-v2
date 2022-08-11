import React from 'react';
import { Box, useMediaQuery, useTheme } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import Slider from 'react-slick';
import AdsImage from 'assets/images/AdsImage.png';

interface AdsSliderProps {
  isSmall?: boolean;
}

const AdsSlider: React.FC<AdsSliderProps> = ({ isSmall }) => {
  const { t } = useTranslation();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  const adsItems = [
    { image: AdsImage, link: 'https://www.google.com' },
    { image: AdsImage, link: 'https://www.google.com' },
  ];

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

  return (
    <Slider {...adsSliderSettings}>
      {adsItems.map((item, ind) => (
        <a
          key={ind}
          className='no-outline'
          href={item.link}
          target='_blank'
          rel='noreferrer'
        >
          <img src={item.image} width='100%' />
        </a>
      ))}
    </Slider>
  );
};

export default AdsSlider;
