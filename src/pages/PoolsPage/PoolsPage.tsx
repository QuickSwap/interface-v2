import React, { lazy, useCallback } from 'react';
import { Box, Grid } from '@material-ui/core';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import SupplyLiquidity from './SupplyLiquidity';
import { useTranslation } from 'react-i18next';
import 'pages/styles/pools.scss';
import useParsedQueryString from 'hooks/useParsedQueryString';
import VersionToggle from '../../components/Toggle/VersionToggle';
import { useHistory } from 'react-router-dom';
const YourLiquidityPools = lazy(() => import('./YourLiquidityPools'));

const PoolsPage: React.FC = () => {
  const parsedQuery = useParsedQueryString();
  const poolVersion =
    parsedQuery && parsedQuery.version ? (parsedQuery.version as string) : 'v3';

  const { t } = useTranslation();
  const history = useHistory();
  const handleToggleAction = useCallback(
    (isV3: boolean) => {
      const url = isV3 ? '/v3Pools' : '/pools';
      history.push(url);
    },
    [history],
  );

  return (
    <Box width='100%' mb={3}>
      <Box className='pageHeading'>
        <Box className='flex row items-center'>
          <h4>{t('pool')}</h4>
          <VersionToggle isV3={false} onToggleV3={handleToggleAction} />
        </Box>

        <Box className='helpWrapper' style={{ alignSelf: 'flex-end' }}>
          <small>{t('help')}</small>
          <HelpIcon />
        </Box>
      </Box>
      <Grid container spacing={4}>
        <Grid item>
          <Box className='wrapper'>
            <SupplyLiquidity />
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
