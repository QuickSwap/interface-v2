import { Box, Grid, Typography } from '@material-ui/core';
import { HypeLabAds } from 'components';
import React from 'react';
import arrowRight from 'assets/images/icons/right-arrow.png';
import wallet from 'assets/images/icons/wallet.svg';
import { SwapBlock } from 'components/Bridge';
import { useTranslation } from 'react-i18next';

const BridgePage: React.FC = ({}) => {
  const { t } = useTranslation();

  return (
    <Box width={'100%'}>
      <Box margin='24px auto'>
        <HypeLabAds />
      </Box>
      <Grid>
        <Grid container justifyContent='center' spacing={2}>
          <Grid item xs={12} sm={12} md={6} lg={4}>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <Typography
                style={{
                  fontSize: '20px',
                  color: '#fff',
                  fontWeight: 500,
                }}
              >
                Bridge
              </Typography>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gridGap: '8px' }}
              >
                <Box
                  sx={{
                    bgcolor: '#1e263d',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gridGap: '4px',
                  }}
                >
                  <Typography style={{ fontSize: '12px', color: '#fff' }}>
                    3rd party bridges
                  </Typography>
                  <img src={arrowRight} alt='arrow' />
                </Box>
                <Box
                  sx={{
                    bgcolor: '#1e263d',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gridGap: '4px',
                  }}
                >
                  <img src={wallet} alt='arrow' />
                  <Typography style={{ fontSize: '12px', color: '#fff' }}>
                    : 0e58…324b
                  </Typography>
                </Box>
              </Box>
            </Box>
            <SwapBlock
              onConfirm={() => {
                console.log('asda');
              }}
            />
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
export default BridgePage;
