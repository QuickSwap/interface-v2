import React, { useEffect, lazy } from 'react';
import { Box, Grid, useMediaQuery, useTheme } from '@material-ui/core';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import SupplyLiquidity from './SupplyLiquidity';
import { useTranslation } from 'react-i18next';
import 'pages/styles/pools.scss';
import VersionToggle from 'components/Toggle/VersionToggle';
import AdsSlider from 'components/AdsSlider';
import { useIsV3 } from 'state/application/hooks';
import { SupplyLiquidityV3 } from './v3/SupplyLiquidityV3';
const YourLiquidityPools = lazy(() => import('./YourLiquidityPools'));
const MyLiquidityPoolsV3 = lazy(() => import('./v3/MyLiquidityPoolsV3'));
import { getConfig } from '../../config/index';
import { useActiveWeb3React } from 'hooks';
import { ChainId } from '@uniswap/sdk';

const PoolsPage: React.FC = () => {
  const { t } = useTranslation();
  const { isV3, updateIsV3 } = useIsV3();
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const config = getConfig(chainIdToUse);
  const pool = config['pools']['available'];
  const v3 = config['v3'];
  const v2 = config['v2'];

  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  useEffect(() => {
    updateIsV3(
      v2 === true && v3 === true
        ? isV3 === true
          ? true
          : false
        : v2
        ? false
        : true,
    );
  }, [v2, v3, isV3]);

  return (
    <Box width='100%' mb={3}>
      <Box className='pageHeading'>
        <Box className='flex row items-center'>
          <h4>{t('pool')}</h4>
          {v2 && v3 && (
            <Box ml={2}>
              <VersionToggle />
            </Box>
          )}
        </Box>

        <Box className='helpWrapper' style={{ alignSelf: 'flex-end' }}>
          <small>{t('help')}</small>
          <HelpIcon />
        </Box>
      </Box>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={5}>
          <Box className='wrapper'>
            {isV3 || !v2 ? <SupplyLiquidityV3 /> : <SupplyLiquidity />}
          </Box>
          <Box maxWidth={isMobile ? '320px' : '352px'} margin='16px auto 0'>
            <AdsSlider sort='pools' />
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={7}>
          <Box className='wrapper'>
            {isV3 || !v2 ? <MyLiquidityPoolsV3 /> : <YourLiquidityPools />}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PoolsPage;
