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
  const adsData = useDefaultAdsList();
  const ads = adsData.data[sort];

  const startIndex =
    ads && ads.length > 0 ? Math.floor(Math.random() * ads.length) : 0;

  const adsSliderSettings = {
    dots: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed:
      adsData.config && adsData.config.autoPlaySpeed
        ? adsData.config.autoPlaySpeed
        : 20000,
    speed: 500,
    initialSlide: startIndex,
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
      <div>
        <div className='flex justify-center'>
          {isMobile ? (
            <div
              className='_0cbf1c3d417e250a'
              data-placement='0d0cfcd486a34feaa39ee2bf22c383ce'
              style={{
                width: 320,
                height: 50,
                display: 'inline-block',
                margin: '0 auto',
              }}
            />
          ) : (
            <div
              className='_0cbf1c3d417e250a'
              data-placement='b694dc6256a744bdb31467ccec38def3'
              style={{
                width: 970,
                height: 90,
                display: 'inline-block',
                margin: '0 auto',
              }}
            />
          )}
        </div>
      </div>
    </Slider>
  ) : (
    <></>
  );
};

export default React.memo(AdsSlider);
