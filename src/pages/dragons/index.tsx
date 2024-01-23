import React, { useEffect } from 'react';
import { Box, Grid, useMediaQuery, useTheme, Tab } from '@mui/material';
import DragonsLair from 'components/pages/dragons/DragonsLair';
import DragonsSyrup from 'components/pages/dragons/DragonsSyrup';
import styles from 'styles/pages/Dragon.module.scss';
import { useTranslation } from 'next-i18next';
import { DLDQUICK, DLQUICK } from 'constants/v3/addresses';
import { ChainId } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { getConfig } from 'config/index';
import { useRouter } from 'next/router';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { ConvertQuick, HypeLabAds } from 'components';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import Image from 'next/image';
import DragonBg1 from 'svgs/DragonBg1.svg';
import DragonBg2 from 'svgs/DragonBg2.svg';

const DragonPage = (_props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const { t } = useTranslation();

  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const quickToken = DLQUICK[chainIdToUse];
  const dQuickToken = DLDQUICK[chainIdToUse];
  const config = getConfig(chainIdToUse);
  const showLair = config['lair']['available'];
  const showOld = config['lair']['oldLair'];
  const showNew = config['lair']['newLair'];
  const router = useRouter();

  const [tabValue, setTabValue] = React.useState('1');

  const handleTabChange = (_: any, newValue: string) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (!showLair) {
      router.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLair]);

  return showLair ? (
    <Box width='100%' mb={3}>
      <Box margin='0 auto 24px'>
        <HypeLabAds />
      </Box>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={4}>
          <Box className={styles.dragonWrapperContainer}>
            <Box className={styles.dragonBg}>
              <DragonBg2 />
            </Box>
            <Image
              src='/assets/images/DragonLairMask.svg'
              alt='Dragon Mask'
              layout='fill'
              objectFit='contain'
            />
            <Box className={styles.dragonWrapperHeading}>
              <h5>{t('newDragonLair')}</h5>
              <small>
                {t('dragonLairTitle', {
                  symbol: quickToken?.symbol,
                  symbol1: dQuickToken?.symbol,
                })}
              </small>
            </Box>
            {showNew && showOld ? (
              <Box className={styles.dragonWrapperTabContainer}>
                <TabContext value={tabValue}>
                  <TabList onChange={handleTabChange} variant='fullWidth'>
                    {showNew && <Tab label='QUICK (NEW)' value='1'></Tab>}
                    {showOld && <Tab label='QUICK (OLD)' value='2'></Tab>}
                  </TabList>

                  <TabPanel value='1'>
                    <DragonsLair isNew={true} />
                  </TabPanel>
                  <TabPanel value='2'>
                    <DragonsLair isNew={false} />
                  </TabPanel>
                </TabContext>
              </Box>
            ) : (
              <Box mt='48px' p='24px'>
                {showNew && !showOld && <DragonsLair isNew={true} />}
                {!showNew && showOld && <DragonsLair isNew={false} />}
              </Box>
            )}
          </Box>
          <Box className={styles.dragonWrapperContainer} mt={2}>
            <ConvertQuick isWidget={true} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={8}>
          <Box className={styles.dragonWrapper}>
            <Box className={styles.dragonBg}>
              {isMobile ? <DragonBg2 /> : <DragonBg1 />}
            </Box>
            <Box className={styles.dragonTitle}>
              <h5>{t('dragonSyrup')}</h5>
              <small>{t('dragonSyrupTitle')}</small>
            </Box>
            <DragonsSyrup />
          </Box>
        </Grid>
      </Grid>
    </Box>
  ) : (
    <></>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

export default DragonPage;
