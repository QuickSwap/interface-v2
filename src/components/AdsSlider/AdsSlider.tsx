import React from 'react';
import { useMediaQuery, useTheme } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import Slider from 'react-slick';
import { useDefaultAdsList } from 'state/ads/hooks';

interface AdsSliderProps {
  isSmall?: boolean;
  sort: string;
}

const AdsSlider: React.FC<AdsSliderProps> = ({ isSmall, sort }) => {
  const { t } = useTranslation();
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

  return (
    <Slider {...adsSliderSettings}>
      {ads.map((item, ind) => (
        <a
          key={ind}
          className='no-outline'
          href={item.link}
          target='_blank'
          rel='noreferrer'
        >
          <img
            src={
              isMobile
                ? item.mobileImage
                : isSmall
                ? item.smallImage
                : item.largeImage
            }
            width='100%'
          />
        </a>
      ))}
    </Slider>
  );
};

export default AdsSlider;
