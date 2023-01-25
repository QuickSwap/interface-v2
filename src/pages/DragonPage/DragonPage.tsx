import React from 'react';
import { Box, Grid } from 'theme/components';
import DragonBg1 from 'assets/images/DragonBg1.svg';
import DragonBg2 from 'assets/images/DragonBg2.svg';
import DragonLairMask from 'assets/images/DragonLairMask.svg';
import DragonsLair from './DragonsLair';
import DragonsSyrup from './DragonsSyrup';
import 'pages/styles/dragon.scss';
import { useTranslation } from 'react-i18next';
import AdsSlider from 'components/AdsSlider';
import { useIsXS } from 'hooks/useMediaQuery';

const DragonPage: React.FC = () => {
  const { t } = useTranslation();
  //showing old dragons lair until we're ready to deploy
  const showOld = true;
  const showNew = true;
  const isMobile = useIsXS();

  return (
    <Box width='100%' margin='0 0 24px'>
      <Grid container spacing={4}>
        <Grid spacing={4} item xs={12} sm={12} md={4}>
          <Box>
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
                  <small>{t('dragonLairTitle')}</small>
                </Box>
                <DragonsLair isNew={true} />
              </Box>
            )}
            {showOld && (
              <Box className='dragonWrapper' margin='10px 0 0'>
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
            <Box maxWidth={isMobile ? '320px' : '352px'} margin='16px auto 0'>
              <AdsSlider sort='dragons' />
            </Box>
          </Box>
        </Grid>
        <Grid spacing={4} item xs={12} sm={12} md={8}>
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
  );
};

export default DragonPage;
