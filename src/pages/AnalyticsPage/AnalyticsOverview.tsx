import React, { useState } from 'react';
import { Box, Typography, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(({}) => ({
  panel: {
    background: '#1b1d26',
    borderRadius: 20,
  },
  volumeType: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 20,
    padding: '0 8px',
    borderRadius: 10,
    cursor: 'pointer',
    '& span': {
      color: '#ebecf2',
    },
  },
}));

const AnalyticsOverview: React.FC = () => {
  const classes = useStyles();
  const [volumeIndex, setVolumeIndex] = useState(0);
  return (
    <>
      <Grid container spacing={4}>
        <Grid item sm={12} md={6}>
          <Box className={classes.panel} padding={3} width={1}>
            <Typography
              variant='caption'
              style={{ color: '#626680', fontWeight: 'bold' }}
            >
              LIQUIDITY
            </Typography>
          </Box>
        </Grid>
        <Grid item sm={12} md={6}>
          <Box className={classes.panel} padding={3} width={1}>
            <Box display='flex' justifyContent='space-between'>
              <Typography
                variant='caption'
                style={{ color: '#626680', fontWeight: 'bold' }}
              >
                VOLUME
              </Typography>
              <Box display='flex' alignItems='center'>
                <Box
                  className={classes.volumeType}
                  bgcolor={volumeIndex === 0 ? '#3e4252' : 'transparent'}
                  onClick={() => setVolumeIndex(0)}
                >
                  <Typography variant='caption'>D</Typography>
                </Box>
                <Box
                  className={classes.volumeType}
                  ml={0.5}
                  bgcolor={volumeIndex === 1 ? '#3e4252' : 'transparent'}
                  onClick={() => setVolumeIndex(1)}
                >
                  <Typography variant='caption'>W</Typography>
                </Box>
                <Box
                  className={classes.volumeType}
                  ml={0.5}
                  bgcolor={volumeIndex === 2 ? '#3e4252' : 'transparent'}
                  onClick={() => setVolumeIndex(2)}
                >
                  <Typography variant='caption'>M</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default AnalyticsOverview;
