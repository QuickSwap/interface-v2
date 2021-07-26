import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Container,
  useMediaQuery
} from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles'

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  header: {
  }
}));

const Header: React.FC = () => {
  const classes = useStyles();

  return (
    <Box>
    </Box>
  );
};

export default Header;
