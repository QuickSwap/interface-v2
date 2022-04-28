import React, { useState } from 'react';
import { Typography, Button, Box } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import FiatMask from 'assets/images/FiatMask.svg';
import BuyWithFiat from 'assets/images/featured/BuywithFiat.svg';
import { BuyFiatModal, MoonpayModal } from 'components';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  buyFiatContainer: {
    background: palette.background.paper,
    height: 338,
    borderRadius: 48,
    marginBottom: 160,
    overflow: 'hidden',
    position: 'relative',
    [breakpoints.down('sm')]: {
      height: 'auto',
    },
    [breakpoints.down('xs')]: {
      marginBottom: 80,
    },
    '& > img': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 1248,
    },
    '& > div': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingRight: 80,
      height: '100%',
      position: 'relative',
      zIndex: 2,
      [breakpoints.down('sm')]: {
        flexDirection: 'column',
        padding: 0,
      },
    },
    '& .buyFiatInfo': {
      display: 'flex',
      width: '50%',
      alignItems: 'center',
      position: 'relative',
      '& img': {
        width: 200,
        maxWidth: 320,
      },
      '& > div': {
        width: 'calc(100% - 200px)',
        '& > h3': {
          marginBottom: 12,
        },
      },
      [breakpoints.down('sm')]: {
        width: '100%',
      },
      [breakpoints.down('xs')]: {
        flexDirection: 'column',
        '& img, & > div': {
          width: '100%',
        },
        '& img': {
          margin: '-32px 0',
        },
        '& div': {
          padding: '0 20px 20px',
        },
      },
    },
    '& .buyFiatWrapper': {
      width: 408,
      position: 'relative',
      [breakpoints.down('sm')]: {
        width: 'calc(100% - 64px)',
        marginBottom: 32,
      },
      [breakpoints.down('xs')]: {
        width: 'calc(100% - 40px)',
      },
      '& .buyContent': {
        background: palette.background.default,
        borderRadius: 20,
        padding: 24,
        '& > div': {
          padding: 0,
          border: 'none',
          background: 'transparent',
          '& > p': {
            marginBottom: 8,
          },
        },
      },
      '& > button': {
        height: 56,
      },
    },
  },
}));

export const BuyFiatSection: React.FC = () => {
  const classes = useStyles();
  const [openMenu, setOpenMenu] = useState(false);
  const [showMoonPayWidget, setShowMoonPayWidget] = useState(false);

  return (
    <Box className={classes.buyFiatContainer}>
      {showMoonPayWidget && (
        <MoonpayModal
          open={showMoonPayWidget}
          onClose={() => setShowMoonPayWidget(false)}
        />
      )}
      {openMenu && (
        <BuyFiatModal
          open={openMenu}
          onClose={() => setOpenMenu(false)}
          buyMoonpay={() => {
            setShowMoonPayWidget(true);
            setOpenMenu(false);
          }}
        />
      )}
      <img src={FiatMask} alt='Fiat Mask' />
      <Box>
        <Box className='buyFiatInfo'>
          <img src={BuyWithFiat} alt='buy with fiat' />
          <Box>
            <Typography variant='h3'>Buy crypto with Fiat</Typography>
            <Typography variant='h6'>
              Simple way to buy or sell crypto with a credit card, bank transfer
              and more
            </Typography>
          </Box>
        </Box>
        <Box className='buyFiatWrapper'>
          <Button
            fullWidth
            color='primary'
            onClick={() => {
              setOpenMenu(true);
            }}
          >
            Buy Now
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
