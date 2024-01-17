import React, { useEffect } from 'react';
import { Box, Grid } from '@mui/material';
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
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { HypeLabAds } from 'components';
import { SingleTokenSupplyLiquidity } from 'components/pages/pools/SingleToken/SupplyLiquidity';
import { useRouter } from 'next/router';

const PoolsPage = (
  _props: InferGetServerSidePropsType<typeof getServerSideProps>,
) => {
  const { t } = useTranslation();
  const { isV2, updateIsV2 } = useIsV2();
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const config = getConfig(chainIdToUse);
  const v3 = config['v3'];
  const v2 = config['v2'];
  const ichiEnabled = config['ichi']['available'];
  const showVersion = (v2 && v3) || (v2 && ichiEnabled) || (v3 && ichiEnabled);
  const router = useRouter();
  const version =
    router.query && router.query.version
      ? (router.query?.version as string)
      : 'v3';

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
          {showVersion && (
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
      <Box margin='24px auto'>
        <HypeLabAds />
      </Box>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={5}>
          <Box className='wrapper'>
            {version === 'singleToken' ? (
              <SingleTokenSupplyLiquidity />
            ) : !isV2 ? (
              <SupplyLiquidityV3 />
            ) : (
              <SupplyLiquidity />
            )}
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={7}>
          <Box className='wrapper'>
            {!isV2 ? <MyLiquidityPoolsV3 /> : <YourLiquidityPools />}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

export default PoolsPage;
