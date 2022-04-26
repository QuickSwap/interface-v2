import React, { useState } from 'react';
import { Box, Typography, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { AlertTriangle, XCircle } from 'react-feather';

const useStyles = makeStyles(({ palette }) => ({
  warningBanner: {
    width: '100%',
    background: '#e59840',
    color: palette.background.default,
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '8px 32px 8px 16px',
    '& span': {
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    '& button': {
      marginLeft: 8,
    },
  },
  closeBanner: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
  },
}));

const BetaWarningBanner: React.FC = () => {
  const classes = useStyles();
  const [showBanner, setShowBanner] = useState(true);
  return (
    <>
      {showBanner && (
        <Box className={classes.warningBanner}>
          <AlertTriangle size={20} />
          <Box
            width='calc(100% - 32px)'
            ml={1}
            display='flex'
            alignItems='center'
          >
            <Typography variant='caption'>
              The new Beta is out. You can check it out.
            </Typography>
            <Button
              size='small'
              onClick={() => window.open('https://beta.quickswap.exchange')}
            >
              Go to Beta
            </Button>
          </Box>
          <Box
            onClick={() => setShowBanner(false)}
            className={classes.closeBanner}
          >
            <XCircle size={20} />
          </Box>
        </Box>
      )}
    </>
  );
};

export default BetaWarningBanner;
