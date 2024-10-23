import React, { lazy, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import SupplyLiquidity from './SupplyLiquidity';
import { useTranslation } from 'react-i18next';
import 'pages/styles/pools.scss';
import VersionToggle from 'components/Toggle/VersionToggle';
import { useIsLpLock, useIsV2 } from 'state/application/hooks';
import { SupplyLiquidityV3 } from './v3/SupplyLiquidityV3';
import { getConfig } from '../../config/index';
import { useActiveWeb3React } from 'hooks';
import { ChainId } from '@uniswap/sdk';
import { HypeLabAds } from 'components';
import LockLiquidity from './lpLock/LockLiquidity';
import { useParams } from 'react-router-dom';
import { SingleTokenSupplyLiquidity } from './SingleToken/SupplyLiquidity';

const YourLiquidityPools = lazy(() => import('./YourLiquidityPools'));
const MyLiquidityPoolsV3 = lazy(() => import('./v3/MyLiquidityPoolsV3'));
const MyLiquidityLocks = lazy(() => import('./lpLock/MyLiquidityLocks'));

const PoolsPage: React.FC = () => {
  const { t } = useTranslation();
  const { isV2, updateIsV2 } = useIsV2();
  const { isLpLock } = useIsLpLock();
  const { chainId } = useActiveWeb3React();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  const chainIdToUse = chainId ?? ChainId.MATIC;
  const config = getConfig(chainIdToUse);
  const v3 = config['v3'];
  const v2 = config['v2'];
  const ichiEnabled = config['ichi']['available'];
  const showVersion = (v2 && v3) || (v2 && ichiEnabled) || (v3 && ichiEnabled);
  const params: any = useParams();
  const version = params?.version ?? 'v3';

  const helpURL = process.env.REACT_APP_HELP_URL;

  useEffect(() => {
    if (!v2) {
      updateIsV2(false);
    }
  }, [updateIsV2, v2]);

  const showPools = config['pools']['available'];

  if (!showPools) {
    location.href = '/';
  }

  useEffect(() => {
    if (!showPools) {
      location.href = '/';
    }
  }, [showPools]);

  return (
    <Box width='100%' mb={3}>
      {isMobile ? (
        <>
          <Box mt={2} className='pageHeading'>
            <Typography variant='h6'>{t('pool')}</Typography>
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
          {showVersion && (
            <Box my={2}>
              <VersionToggle />
            </Box>
          )}
        </>
      ) : (
        <Box className='pageHeading'>
          <Box className='flex row items-center'>
            <Typography variant='h6'>{t('pool')}</Typography>
            {showVersion && (
              <Box ml={2}>
                <VersionToggle />
              </Box>
            )}
          </Box>
        </Box>
      )}
      {/* <Box margin='24px auto'>
        <HypeLabAds />
      </Box> */}
      <Grid container spacing={4}>
        <Grid
          style={{
            backgroundColor: '#1b1e29',
            borderRadius: '20px',
            padding: '22px 24px 24px',
          }}
          item
          xs={12}
          sm={12}
          md={5}
        >
          <Box className='wrapper'>
            {version === 'singleToken' ? (
              <SingleTokenSupplyLiquidity />
            ) : isLpLock ? (
              <LockLiquidity />
            ) : !isV2 ? (
              <SupplyLiquidityV3 />
            ) : (
              <SupplyLiquidity />
            )}
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={7}>
          <Box className='wrapper'>
            {isLpLock ? (
              <MyLiquidityLocks />
            ) : !isV2 ? (
              <MyLiquidityPoolsV3 />
            ) : (
              <YourLiquidityPools />
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PoolsPage;
