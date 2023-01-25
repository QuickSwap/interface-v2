import React, { useEffect, useState } from 'react';
import { Button, Box, Grid } from 'theme/components';
import { Swap, AddLiquidity } from 'components';
import { useTranslation } from 'react-i18next';
import { useIsV2 } from 'state/application/hooks';
import { useIsXS } from 'hooks/useMediaQuery';

const SWAP_TAB = 0;
const LIQUIDITY_TAB = 1;

const SwapSection: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(SWAP_TAB);
  const { t } = useTranslation();
  const { updateIsV2 } = useIsV2();
  const isMobile = useIsXS();

  useEffect(() => {
    updateIsV2(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Box className='buttonGroup justify-center'>
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
      </Box>
      <Box className='swapContainer'>
        <Grid container spacing={isMobile ? 0 : 8} alignItems='center'>
          <Grid item spacing={isMobile ? 0 : 8} sm={12} md={6}>
            {tabIndex === SWAP_TAB ? (
              <Swap currencyBgClass='bg-palette' />
            ) : (
              <AddLiquidity currencyBgClass='bg-palette' />
            )}
          </Grid>
          <Grid
            item
            spacing={isMobile ? 0 : 8}
            sm={12}
            md={6}
            className='swapInfo'
          >
            <Box>
              <h4>
                {tabIndex === SWAP_TAB
                  ? t('swapSectionShortDesc')
                  : t('liquiditySectionShortDesc')}
              </h4>
              <p style={{ marginTop: '20px' }}>
                {tabIndex === SWAP_TAB
                  ? t('swapSectionLongDesc')
                  : t('liquiditySectionLongDesc')}
              </p>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default SwapSection;
