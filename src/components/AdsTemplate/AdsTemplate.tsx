import React from 'react';
import { Box, useMediaQuery, useTheme } from '@material-ui/core';
import 'components/styles/AdsTemplate.scss';
import { useTranslation } from 'react-i18next';
import V3BannerLargeBg from 'assets/images/v3BannerLargeBg.png';
import V3BannerSmallBg from 'assets/images/v3BannerSmallBg.png';
import V3BannerLargeLogo from 'assets/images/v3BannerLargeLogo.png';
import V3BannerMobileLogo from 'assets/images/v3BannerMobileLogo.png';
import V3BannerSmallLogo from 'assets/images/v3BannerSmallLogo.png';

interface AdsTemplateProps {
  isSmall?: boolean;
}

const AdsTemplate: React.FC<AdsTemplateProps> = ({ isSmall }) => {
  const { t } = useTranslation();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const adsBg = isMobile || isSmall ? V3BannerSmallBg : V3BannerLargeBg;
  const adsLogo = isMobile
    ? V3BannerMobileLogo
    : isSmall
    ? V3BannerSmallLogo
    : V3BannerLargeLogo;

  return (
    <Box
      className={`adsWrapper${
        isMobile ? ' mobileAds' : isSmall ? ' smallAds' : ''
      }`}
    >
      <Box className='adsBg'>
        <img src={adsBg} />
      </Box>
      <Box className='adsContent'>
        <img src={adsLogo} />
        <Box className='adsText'>
          <p>{t('v3LiquidityLive')}</p>
          <p className='adsTextFilter'>{t('v3LiquidityLive')}</p>
        </Box>
        <Box className='adsButton'>{t('trynow')}</Box>
      </Box>
    </Box>
  );
};

export default AdsTemplate;
