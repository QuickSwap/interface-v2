import React, { useCallback, useEffect } from 'react';
import { useActiveWeb3React } from 'hooks';
import { NavLink, useHistory, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './index.scss';
import { EthereumWindow } from 'models/types';
import VersionToggle from 'components/Toggle/VersionToggle';
import { Box, Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { SupplyLiquidityV3 } from './SupplyLiquidityV3';
import { MyLiquidityPoolsV3 } from './MyLiquidityPoolsV3';

export default function Pool() {
  const { account, chainId } = useActiveWeb3React();

  let chainSymbol;

  if (chainId === 137) {
    chainSymbol = 'MATIC';
  }

  const reload = useCallback(() => window.location.reload(), []);

  useEffect(() => {
    const _window = window as EthereumWindow;

    if (!_window.ethereum) return;

    _window.ethereum.on('accountsChanged', reload);
    return () => _window.ethereum.removeListener('accountsChanged', reload);
  }, []);

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
    <>
      <Box width='100%' mb={3}>
        <Box className='pageHeading'>
          <Box className='flex row items-center'>
            <h4>{t('pool')}</h4>
            <Box ml={2}>
              <VersionToggle isV3={true} onToggleV3={handleToggleAction} />
            </Box>
          </Box>

          <Box className='helpWrapper' style={{ alignSelf: 'flex-end' }}>
            <small>{t('help')}</small>
            <HelpIcon />
          </Box>
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={12} md={5}>
            <Box className='wrapper'>
              <SupplyLiquidityV3 />
            </Box>
          </Grid>
          <Grid item xs={12} sm={12} md={7}>
            <MyLiquidityPoolsV3 />
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
