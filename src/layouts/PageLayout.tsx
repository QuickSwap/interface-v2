import React from 'react';
import {
  Box
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Header, Footer } from 'components';

const useStyles = makeStyles(({ palette }) => ({
  page: {
    backgroundColor: palette.background.default,
    width: '100%',
    minHeight: '100vh',
  },
}));

export interface PageLayoutProps {
  children: any;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const classes = useStyles();

  return (
    <Box className={classes.page}>
      <Header />
      { children }
      <Footer />
    </Box>
  );
};

export default PageLayout;
