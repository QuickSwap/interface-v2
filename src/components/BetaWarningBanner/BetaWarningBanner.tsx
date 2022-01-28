import React, { useState } from 'react';
import { Box, Typography } from '@material-ui/core';
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
    '& > span': {
      marginLeft: 8,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      width: 'calc(100% - 32px)',
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
          <Typography variant='caption'>
            This site is in beta. By using this software, you understand,
            acknowledge and accept that Quickswap and/or the underlying software
            are provided “as is” and “as available” basis and without warranties
            or representations of any kind either expressed or implied
          </Typography>
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
