import React, { useEffect } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { Box, Grid, useMediaQuery } from '@material-ui/core';
import DragonBg1 from 'assets/images/DragonBg1.svg';
import DragonBg2 from 'assets/images/DragonBg2.svg';
import DragonLairMask from 'assets/images/DragonLairMask.svg';
import DragonAlert from './DragonAlert';
import DragonsLair from './DragonsLair';
import DragonsSyrup from './DragonsSyrup';
import 'pages/styles/dragon.scss';
import { useTranslation } from 'react-i18next';
import AdsSlider from 'components/AdsSlider';
import { getConfig } from 'config';
import { useActiveWeb3React } from 'hooks';
import { ChainId } from '@uniswap/sdk';
import { useHistory } from 'react-router-dom';
import { DLDQUICK, DLQUICK } from 'constants/v3/addresses';

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

  useEffect(() => {
    if (!showLair) {
      history.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLair]);

  return (
    <Box width='100%' mb={3}>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={4}>
          {showNew && (
            <Box className='dragonWrapper'>
              <Box className='dragonBg'>
                <img src={DragonBg2} alt='Dragon Lair' />
              </Box>
              <img
                src={DragonLairMask}
                alt='Dragon Mask'
                className='dragonMask'
              />
              <Box className='dragonTitle'>
                <h5>{t('newDragonLair')}</h5>
                <small>
                  {t('dragonLairTitle', {
                    symbol: quickToken?.symbol,
                    symbol1: dQuickToken?.symbol,
                  })}
                </small>
              </Box>
              <DragonsLair isNew={true} />
            </Box>
          )}
          {showOld && (
            <Box className='dragonWrapper' mt='10px'>
              <Box className='dragonBg' style={{ maxHeight: 170 }}>
                <img src={DragonBg2} alt='Dragon Lair' />
              </Box>
              <img
                src={DragonLairMask}
                alt='Dragon Mask'
                className='dragonMask'
              />
              <Box className='dragonTitle' width='85%'>
                <h5>{t('dragonLair')}</h5>
                <small>{t('oldDragonLairTitle')}</small>
              </Box>
              <DragonsLair isNew={false} />
            </Box>
          )}
          {/* <Box maxWidth={isMobile ? '320px' : '352px'} margin='16px auto 0'>
            <AdsSlider sort='dragons' />
          </Box> */}
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
        <Grid item>
          <Box
            id={'addbox-bottom'}
            maxWidth={isMobile ? '320px' : '1136px'}
            margin='0 auto 24px'
          >
            <AdsSlider sort='analytics' />
          </Box>
        </Grid>
      </Grid>
      <Box className='flex justify-center' mt={2}>
        {isMobile ? (
          <div
            className='_0cbf1c3d417e250a'
            data-placement='0d0cfcd486a34feaa39ee2bf22c383ce'
            style={{
              width: 320,
              height: 50,
              display: 'inline-block',
              margin: '0 auto',
            }}
          />
        ) : (
          <div
            className='_0cbf1c3d417e250a'
            data-placement='b694dc6256a744bdb31467ccec38def3'
            style={{
              width: 970,
              height: 90,
              display: 'inline-block',
              margin: '0 auto',
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default DragonPage;
