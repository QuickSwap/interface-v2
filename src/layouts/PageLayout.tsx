import React, { useEffect } from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import { Header, Footer, BetaWarningBanner } from 'components';
import Background from './Background';
import { useIsProMode } from 'state/application/hooks';

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
  const history = useHistory();
  const { isProMode, updateIsProMode } = useIsProMode();

  useEffect(() => {
    const unlisten = history.listen((location) => {
      updateIsProMode(false);
    });
    return function cleanup() {
      unlisten();
    };
  }, [history, updateIsProMode]);

  return (
    <Box className={classes.page}>
      <BetaWarningBanner />
      <Header />
      {!isProMode && <Background fallback={false} />}
      <Box className={isProMode ? '' : classes.pageWrapper}>{children}</Box>
      <Footer />
    </Box>
  );
};

export default PageLayout;
