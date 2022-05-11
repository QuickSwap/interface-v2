import React from 'react';
import { useTheme } from '@material-ui/core/styles';
import { Box, Typography, Grid, useMediaQuery } from '@material-ui/core';
import DragonBg1 from 'assets/images/DragonBg1.svg';
import DragonBg2 from 'assets/images/DragonBg2.svg';
import DragonLairMask from 'assets/images/DragonLairMask.svg';
import DragonAlert from './DragonAlert';
import DragonsLair from './DragonsLair';
import DragonsSyrup from './DragonsSyrup';
import 'pages/styles/dragon.scss';

const DragonPage: React.FC = () => {
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  return (
    <Box width='100%' mb={3}>
      <DragonAlert />
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={4}>
          <Box className='dragonWrapper'>
            <Box className='dragonBg'>
              <img src={DragonBg2} alt='Dragon Lair' />
            </Box>
            <img
              src={DragonLairMask}
              alt='Dragon Mask'
              style={{ width: '100%', position: 'absolute', top: 207 }}
            />
            <Box className='dragonTitle'>
              <Typography variant='h5'>Dragon’s Lair</Typography>
              <Typography variant='body2'>Stake QUICK to earn QUICK</Typography>
            </Box>
            <DragonsLair />
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={8}>
          <Box className='dragonWrapper'>
            <Box className='dragonBg'>
              <img src={isMobile ? DragonBg2 : DragonBg1} alt='Dragon Syrup' />
            </Box>
            <Box className='dragonTitle'>
              <Typography variant='h5'>Dragon’s Syrup</Typography>
              <Typography variant='body2'>
                Earn tokens of your choice over time
              </Typography>
            </Box>
            <DragonsSyrup />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DragonPage;
