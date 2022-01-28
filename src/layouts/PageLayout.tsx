import React from 'react';
import { Box } from '@material-ui/core';
import { useLocation } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import HeroBkg from 'assets/images/heroBkg.png';
import HeroBkg1 from 'assets/images/heroBkg.svg';
import { Header, Footer, BetaWarningBanner } from 'components';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  page: {
    backgroundColor: palette.background.default,
    width: '100%',
    minHeight: '100vh',
  },
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
  pageWrapper: {
    maxWidth: 1312,
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    margin: '24px auto',
    padding: '0 32px',
    [breakpoints.down('xs')]: {
      padding: '0 12px',
    },
  },
}));

export interface PageLayoutProps {
  children: any;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const classes = useStyles();
  const { pathname } = useLocation();

  return (
    <Box className={classes.page}>
      <BetaWarningBanner />
      <Header />
      <Box className={classes.heroBkg}>
        <img
          src={pathname === '/' ? HeroBkg : HeroBkg1}
          alt='Hero Background'
        />
      </Box>
      <Box className={classes.pageWrapper}>{children}</Box>
      <Footer />
    </Box>
  );
};

export default PageLayout;
