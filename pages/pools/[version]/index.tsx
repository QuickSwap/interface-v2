import React, { useEffect } from 'react';
import { Box, Grid, useMediaQuery, useTheme } from '@mui/material';
import { HelpOutline } from '@mui/icons-material';
import SupplyLiquidity from 'components/pages/pools/SupplyLiquidity';
import { useTranslation } from 'next-i18next';
import VersionToggle from 'components/Toggle/VersionToggle';
import { useIsV2 } from 'state/application/hooks';
import { SupplyLiquidityV3 } from 'components/pages/pools/SupplyLiquidityV3';
import YourLiquidityPools from 'components/pages/pools/YourLiquidityPools';
import MyLiquidityPoolsV3 from 'components/pages/pools/MyLiquidityPoolsV3';
import { getConfig } from 'config/index';
import { useActiveWeb3React } from 'hooks';
import { ChainId } from '@uniswap/sdk';
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Adshares } from 'components';

const PoolsPage = (_props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { t } = useTranslation();
  const { isV2, updateIsV2 } = useIsV2();
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const config = getConfig(chainIdToUse);
  const v3 = config['v3'];
  const v2 = config['v2'];

  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));

  const helpURL = process.env.NEXT_PUBLIC_HELP_URL;

  useEffect(() => {
    if (!v2) {
      updateIsV2(false);
    }
  }, [updateIsV2, v2]);

  return (
    <Box width='100%' mb={3}>
      <Box className='pageHeading'>
        <Box className='flex items-center row'>
          <h1 className='h4'>{t('pool')}</h1>
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

export const getStaticPaths: GetStaticPaths = async () => {
  const versions = ['v2', 'v3'];
  const paths =
    versions?.map((version) => ({
      params: { version },
    })) || [];

  return {
    paths,
    fallback: 'blocking',
  };
};

export default PoolsPage;
