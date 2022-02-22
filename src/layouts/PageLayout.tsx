import React from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Header, Footer, BetaWarningBanner } from 'components';
import Background from './Background';
import { useIsProMode } from 'state/application/hooks';
import { useLocation } from 'react-router-dom';

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
  const { pathname } = useLocation();
  const { isProMode } = useIsProMode();
  const isProModeSwap = isProMode && pathname === '/swap';

  return (
    <Box className={classes.page}>
      <BetaWarningBanner />
      <Header />
      {!isProModeSwap && <Background fallback={false} />}
      <Box className={isProModeSwap ? '' : classes.pageWrapper}>{children}</Box>
      <Footer />
    </Box>
  );
};

export default PageLayout;
