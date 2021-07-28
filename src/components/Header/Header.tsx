import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import {
  Box,
  Grid,
  Button,
  Typography,
  Container,
} from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import QuickLogo from 'assets/images/quickLogo.svg';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  header: {
    padding: '0 40px',
    display: 'flex',
    alignItems: 'center',
    minHeight: 88
  }
}));

const Header: React.FC = () => {
  const classes = useStyles();

  return (
    <Box className={classes.header}>
      <Grid container alignItems='center'>
        <Link to='/'>
          <img src={QuickLogo} />
        </Link>
        
      </Grid>
    </Box>
  );
};

export default Header;
