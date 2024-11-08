import React from 'react';
import { Box, Typography, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import HeroSection from './HeroSection';
import TradingInfo from './TradingInfo';
import { AvailableChainList } from 'components/AvailableChainList';
import { PartnerList } from 'components/PartnerList';
import { KeyboardArrowDown } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const GlobalSection: React.FC = () => {
  const { breakpoints } = useTheme();
  const mobileWindowSize = useMediaQuery(breakpoints.down('sm'));
  const { t } = useTranslation();
  return (
    <>
      <Box margin={mobileWindowSize ? '64px 0' : '100px 0 120px 0px'}>
        <HeroSection />
      </Box>
      <Box style={{ marginBottom: '127px' }}>
        <AvailableChainList />
      </Box>
      <Box style={{ marginBottom: '127px' }}>
        <PartnerList />
      </Box>
      <Box
        className='quick_statistics'
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          marginBottom: '40px',
        }}
      >
        <Typography
          className='title'
          style={{
            fontWeight: 600,
            color: '#448aff',
            lineHeight: ' 2.44',
          }}
        >
          {t('quickStatistics')}
        </Typography>
        <Typography
          className='desc'
          style={{
            color: '#ccd8e7',
            lineHeight: '1.67',
            maxWidth: '432px',
          }}
        >
          {t('quickStatisticsDescription')}
        </Typography>
      </Box>
      <Box className='flex tradingInfo' style={{ marginBottom: '45px' }}>
        <TradingInfo />
      </Box>
      <Box
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '134px',
        }}
      >
        <Link
          to='/analytics'
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            color: '#ccd8e7',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 'normal',
          }}
        >
          {t('viewAnalytics')}
          <KeyboardArrowDown
            style={{ transform: 'rotate(-90deg)', color: '#448aff' }}
          />
        </Link>
      </Box>
    </>
  );
};

export default GlobalSection;
