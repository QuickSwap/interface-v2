import React, { lazy } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Grid, useMediaQuery, useTheme } from '@material-ui/core';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import SupplyLiquidity from './SupplyLiquidity';
import { useTranslation } from 'react-i18next';
import 'pages/styles/pools.scss';
import VersionToggle from 'components/Toggle/VersionToggle';
import AdsSlider from 'components/AdsSlider';
import { useIsV2 } from 'state/application/hooks';
import { SupplyLiquidityV3 } from './v3/SupplyLiquidityV3';
const YourLiquidityPools = lazy(() => import('./YourLiquidityPools'));
const MyLiquidityPoolsV3 = lazy(() => import('./v3/MyLiquidityPoolsV3'));

const PoolsPage: React.FC = () => {
  const { t } = useTranslation();
  const { isV2 } = useIsV2();

  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const helpURL = process.env.REACT_APP_HELP_URL;

  return (
    <Box width='100%' mb={3}>
      <Box className='pageHeading'>
        <Box className='flex row items-center'>
          <h4>{t('pool')}</h4>
          <Box ml={2}>
            <VersionToggle />
          </Box>
        </Box>

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
            {!isV2 ? <SupplyLiquidityV3 /> : <SupplyLiquidity />}
          </Box>
          <Box maxWidth={isMobile ? '320px' : '352px'} margin='16px auto 0'>
            <AdsSlider sort='pools' />
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={7}>
          <Box className='wrapper'>
            {!isV2 ? <MyLiquidityPoolsV3 /> : <YourLiquidityPools />}
          </Box>
        </Grid>
      </Grid>
      {isMobile ? (
        <>
          <Box className='flex justify-center' mt={2}>
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
          </Box>
          <Box className='flex justify-center' mt={2}>
            <div
              className='_0cbf1c3d417e250a'
              data-placement='8ded245cf3b74591963cc80217ffe4c0'
              style={{
                width: 320,
                height: 100,
                display: 'inline-block',
                margin: '0 auto',
              }}
            />
          </Box>
        </>
      ) : (
        <Box className='flex justify-center' mt={2}>
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
        </Box>
      )}
    </Box>
  );
};

export default PoolsPage;
