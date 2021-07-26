import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  footer: {

  }
}));

const Footer: React.FC = () => {
  const classes = useStyles();

  return (
    <Box className={classes.footer}>
    </Box>
  );
};

export default Footer;
