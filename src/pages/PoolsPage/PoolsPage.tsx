import React, { lazy } from 'react';
import { Box, Grid } from '@material-ui/core';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import SupplyLiquidity from './SupplyLiquidity';
import { useTranslation } from 'react-i18next';
import 'pages/styles/pools.scss';
import useParsedQueryString from 'hooks/useParsedQueryString';
import VersionToggle from '../../components/Toggle/VersionToggle';
const YourLiquidityPools = lazy(() => import('./YourLiquidityPools'));
const YourV3LiquidityPools = lazy(() => import('./YourV3LiquidityPools'));

const PoolsPage: React.FC = () => {
  const parsedQuery = useParsedQueryString();
  const poolVersion =
    parsedQuery && parsedQuery.version ? (parsedQuery.version as string) : 'v3';

  const { t } = useTranslation();

  return (
    <Box width='100%' mb={3}>
      <Box className='pageHeading'>
        <Box className='flex row items-center'>
          <h4>{t('pool')}</h4>
          <VersionToggle baseUrl={'pools'} />
        </Box>

        <Box className='helpWrapper' style={{ alignSelf: 'flex-end' }}>
          <small>{t('help')}</small>
          <HelpIcon />
        </Box>
      </Box>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={5}>
          <Box className='wrapper'>
            <SupplyLiquidity isV3={poolVersion === 'v3'} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={7}>
          <Box className='wrapper'>
            {poolVersion === 'v2' ? (
              <YourLiquidityPools />
            ) : (
              <YourV3LiquidityPools />
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PoolsPage;
