import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ReactComponent as QuickIcon } from 'assets/images/quickIcon.svg';

const useStyles = makeStyles(({}) => ({
  footer: {
    textAlign: 'center',
    paddingBottom: 110,
    position: 'relative',
    '& p': {
      fontSize: 14,
      lineHeight: '24px',
      marginTop: 20,
    },
  },
}));

const Footer: React.FC = () => {
  const classes = useStyles();

  return (
    <Box className={classes.footer}>
      <QuickIcon />
      <Typography>© 2022 QuickSwap.</Typography>
    </Box>
  );
};

export default Footer;
