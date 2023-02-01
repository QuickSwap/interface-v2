import React, { lazy } from 'react';
import { Box, Grid } from 'theme/components';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import SupplyLiquidity from './SupplyLiquidity';
import { useTranslation } from 'react-i18next';
import 'pages/styles/pools.scss';
import VersionToggle from 'components/Toggle/VersionToggle';
import AdsSlider from 'components/AdsSlider';
import { useIsV2 } from 'state/application/hooks';
import { SupplyLiquidityV3 } from './v3/SupplyLiquidityV3';
import { useIsXS } from 'hooks/useMediaQuery';
const YourLiquidityPools = lazy(() => import('./YourLiquidityPools'));
const MyLiquidityPoolsV3 = lazy(() => import('./v3/MyLiquidityPoolsV3'));
const MyGammaPoolsV3 = lazy(() => import('./v3/MyGammaPoolsV3'));

const PoolsPage: React.FC = () => {
  const { t } = useTranslation();
  const { isV2 } = useIsV2();
  const isMobile = useIsXS();

  const helpURL = process.env.REACT_APP_HELP_URL;

  return (
    <Box width='100%' margin='0 0 24px'>
      <Box className='pageHeading'>
        <Box className='flex row items-center'>
          <h4>{t('pool')}</h4>
          <Box margin='0 0 0 16px'>
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
        <Grid spacing={4} item xs={12} sm={12} md={5}>
          <Box width='100%'>
            <Box className='wrapper'>
              {!isV2 ? <SupplyLiquidityV3 /> : <SupplyLiquidity />}
            </Box>
            <Box maxWidth={isMobile ? '320px' : '352px'} margin='16px auto 0'>
              <AdsSlider sort='pools' />
            </Box>
          </Box>
        </Grid>
        <Grid spacing={4} item xs={12} sm={12} md={7}>
          <Box width='100%'>
            <Box width='100%' className='wrapper'>
              {!isV2 ? <MyLiquidityPoolsV3 /> : <YourLiquidityPools />}
            </Box>
            {!isV2 && (
              <Box margin='32px 0 0' className='wrapper'>
                <MyGammaPoolsV3 />
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PoolsPage;
