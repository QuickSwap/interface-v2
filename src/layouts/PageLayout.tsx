import React from 'react';
import {
  Box
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(({ palette }) => ({
  page: {
    backgroundColor: palette.common.white,
    width: '100%',
    minHeight: '100vh',
    paddingTop: 88
  },
}));

export interface PageLayoutProps {
  children: any;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const classes = useStyles();

  return (
    <Box className={classes.page}>
    </Box>
  );
};

export default PageLayout;
