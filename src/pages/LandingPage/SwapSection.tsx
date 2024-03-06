import React, { useState } from 'react';
import {
  ButtonGroup,
  Button,
  Box,
  Grid,
  useMediaQuery,
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { Swap, AddLiquidity } from '~/components';
import { useTranslation } from 'react-i18next';
import { getConfig } from '~/config/index';
import { useActiveWeb3React } from '~/hooks';
import SwapV3Page from '~/pages/SwapPage/V3/Swap';

const SWAP_TAB = 0;
const LIQUIDITY_TAB = 1;

const SwapSection: React.FC = () => {
  const { breakpoints } = useTheme();
  const mobileWindowSize = useMediaQuery(breakpoints.down('sm'));
  const [tabIndex, setTabIndex] = useState(SWAP_TAB);
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const config = getConfig(chainId);
  const v2 = config['v2'];

  return (
    <>
      <Box className='buttonGroup'>
        <ButtonGroup>
          <Button
            className={tabIndex === SWAP_TAB ? 'active' : ''}
            onClick={() => setTabIndex(SWAP_TAB)}
          >
            {t('swap')}
          </Button>
          <Button
            className={tabIndex === LIQUIDITY_TAB ? 'active' : ''}
            onClick={() => setTabIndex(LIQUIDITY_TAB)}
          >
            {t('liquidity')}
          </Button>
        </ButtonGroup>
      </Box>
      <Box className='swapContainer'>
        <Grid container spacing={mobileWindowSize ? 0 : 8} alignItems='center'>
          <Grid item sm={12} md={6}>
            {tabIndex === SWAP_TAB ? (
              v2 ? (
                <Swap currencyBgClass='bg-palette' />
              ) : (
                <SwapV3Page />
              )
            ) : (
              <AddLiquidity currencyBgClass='bg-palette' />
            )}
          </Grid>
          <Grid item sm={12} md={6} className='swapInfo'>
            <h1 className='h4'>
              {tabIndex === SWAP_TAB
                ? t('swapSectionShortDesc')
                : t('liquiditySectionShortDesc')}
            </h1>
            <p style={{ marginTop: '20px' }}>
              {tabIndex === SWAP_TAB
                ? t('swapSectionLongDesc')
                : t('liquiditySectionLongDesc')}
            </p>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default SwapSection;
