import React from 'react';
import { Box, Grid, useMediaQuery, useTheme } from '@mui/material';
import { HelpOutline } from '@mui/icons-material';
import SupplyLiquidity from 'components/pages/pools/SupplyLiquidity';
import { useTranslation } from 'next-i18next';
import VersionToggle from 'components/Toggle/VersionToggle';
import { useIsV2 } from 'state/application/hooks';
import { SupplyLiquidityV3 } from 'components/pages/pools/SupplyLiquidityV3';
import YourLiquidityPools from 'components/pages/pools/YourLiquidityPools';
import MyLiquidityPoolsV3 from 'components/pages/pools/MyLiquidityPoolsV3';
import MyGammaPoolsV3 from 'components/pages/pools/MyGammaPoolsV3';
import { getConfig } from 'config/index';
import { useActiveWeb3React } from 'hooks';
import { ChainId } from '@uniswap/sdk';
import { GammaPairs } from 'constants/index';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Adshares } from 'components';

const PoolsPage = (_props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { t } = useTranslation();
  const { isV2 } = useIsV2();
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const config = getConfig(chainIdToUse);
  const v3 = config['v3'];
  const v2 = config['v2'];

  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  const helpURL = process.env.NEXT_PUBLIC_HELP_URL;
  const allGammaPairs = chainId ? GammaPairs[chainId] : {};

  return (
    <Box width='100%' mb={3}>
      <Box className='pageHeading'>
        <Box className='flex items-center row'>
          <h4>{t('pool')}</h4>
          {v2 && v3 && (
            <Box ml={2}>
              <VersionToggle />
            </Box>
          )}
        </Box>

        {helpURL && (
          <Box
            className='helpWrapper'
            onClick={() => window.open(helpURL, '_blank')}
          >
            <small>{t('help')}</small>
            <HelpOutline />
          </Box>
        )}
      </Box>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={5}>
          <Box className='wrapper'>
            {!isV2 ? <SupplyLiquidityV3 /> : <SupplyLiquidity />}
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={7}>
          <Box className='wrapper'>
            {!isV2 ? <MyLiquidityPoolsV3 /> : <YourLiquidityPools />}
          </Box>
          {!isV2 && Object.values(allGammaPairs).length > 0 && (
            <Box mt={4} className='wrapper'>
              <MyGammaPoolsV3 />
            </Box>
          )}
        </Grid>
      </Grid>
      <Box maxWidth={isMobile ? '320px' : '1136px'} margin='24px auto'>
        <Adshares />
      </Box>
    </Box>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

export default PoolsPage;
