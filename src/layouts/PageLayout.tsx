import React from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Header, Footer, BetaWarningBanner } from 'components';
import Background from './Background';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  page: {
    backgroundColor: palette.background.default,
    width: '100%',
    minHeight: '100vh',
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

  return (
    <Box className={classes.page}>
      <BetaWarningBanner />
      <Header />
      <Background fallback={false} />
      <Box className={classes.pageWrapper}>{children}</Box>
      <Footer />
    </Box>
  );
};

export default PageLayout;
