import React from 'react';
import { Box } from '@material-ui/core';
import { useLocation } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import HeroBkg from 'assets/images/heroBkg.jpg';
import HeroBkg1 from 'assets/images/heroBkg.svg';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  heroBkg: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
    width: '100%',
    overflow: 'hidden',
    '& img': {
      width: '100%',
      minWidth: 1200,
    },
  },
}));

const Background: React.FC<{ fallback: boolean | undefined }> = ({
  fallback = false,
}) => {
  const classes = useStyles();
  const { pathname } = useLocation();

  if (fallback) {
    return <img src={HeroBkg1} alt='Hero Background' />;
  }
  return (
    <>
      <Box className={classes.heroBkg}>
        <img
          src={pathname === '/' ? HeroBkg : HeroBkg1}
          alt='Hero Background'
        />
      </Box>
    </>
  );
};

export default React.memo(Background);
