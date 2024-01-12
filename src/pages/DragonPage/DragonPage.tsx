import React, { useEffect } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { Box, Grid, useMediaQuery, Tab, Tabs } from '@material-ui/core';
import DragonBg1 from 'assets/images/DragonBg1.svg';
import DragonBg2 from 'assets/images/DragonBg2.svg';
import DragonLairMask from 'assets/images/DragonLairMask.svg';
import DragonsLair from './DragonsLair';
import DragonsSyrup from './DragonsSyrup';
import 'pages/styles/dragon.scss';
import { useTranslation } from 'react-i18next';
import { HypeLabAds } from 'components';
import { getConfig } from 'config/index';
import { useActiveWeb3React } from 'hooks';
import { ChainId } from '@uniswap/sdk';
import { useHistory } from 'react-router-dom';
import { DLDQUICK, DLQUICK } from 'constants/v3/addresses';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import ConvertQUICK from 'pages/ConvertQUICKPage';

const DragonPage: React.FC = () => {
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const { t } = useTranslation();
  //showing old dragons lair until we're ready to deploy

  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const quickToken = DLQUICK[chainIdToUse];
  const dQuickToken = DLDQUICK[chainIdToUse];
  const config = getConfig(chainIdToUse);
  const showLair = config['lair']['available'];
  const showOld = config['lair']['oldLair'];
  const showNew = config['lair']['newLair'];
  const history = useHistory();

  const [tabValue, setTabValue] = React.useState('1');

  const handleTabChange = (event: any, newValue: string) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (!showLair) {
      history.push('/');
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
          <Box className='dragonWrapper-container'>
            <Box className='dragonBg'>
              <img src={DragonBg2} alt='Dragon Lair' />
            </Box>
            <img
              src={DragonLairMask}
              alt='Dragon Mask'
              className='dragonMask'
            />
            <Box className='dragonWrapper-heading'>
              <h5>{t('newDragonLair')}</h5>
              <small>
                {t('dragonLairTitle', {
                  symbol: quickToken?.symbol,
                  symbol1: dQuickToken?.symbol,
                })}
              </small>
            </Box>
            {showNew && showOld && (
              <Box className='dragonWrapper-tab-container'>
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
            )}
            <Box mt='48px' p='24px'>
              {showNew && !showOld && <DragonsLair isNew={true} />}
              {!showNew && showOld && <DragonsLair isNew={false} />}
            </Box>
          </Box>
          <Box className='dragonWrapper-container' mt={2}>
            <ConvertQUICK isWidget={true} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={8}>
          <Box className='dragonWrapper'>
            <Box className='dragonBg'>
              <img src={isMobile ? DragonBg2 : DragonBg1} alt='Dragon Syrup' />
            </Box>
            <Box className='dragonTitle'>
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

export default DragonPage;
