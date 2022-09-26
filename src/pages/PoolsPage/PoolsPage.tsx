import React from 'react';
import { Box, Grid, useMediaQuery, useTheme } from '@material-ui/core';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import SupplyLiquidity from './SupplyLiquidity';
import YourLiquidityPools from './YourLiquidityPools';
import { useTranslation } from 'react-i18next';
import 'pages/styles/pools.scss';
import AdsSlider from 'components/AdsSlider';

const PoolsPage: React.FC = () => {
  const { t } = useTranslation();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const helpURL = process.env.REACT_APP_HELP_URL;

  return (
    <Box width='100%' mb={3}>
      <Box className='pageHeading'>
        <h4>{t('pool')}</h4>
        {helpURL && (
          <Box
            className='helpWrapper'
            onClick={() => window.open(helpURL, '_blank')}
          >
            <small>{t('help')}</small>
            <HelpIcon />
          </Box>
        )}
      </Box>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={5}>
          <Box className='wrapper'>
            <SupplyLiquidity />
          </Box>
          <Box maxWidth={isMobile ? '320px' : '352px'} margin='16px auto 0'>
            <AdsSlider sort='pools' />
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={7}>
          <Box className='wrapper'>
            <YourLiquidityPools />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PoolsPage;
