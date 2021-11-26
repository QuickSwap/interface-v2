import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { TopMovers } from 'components';

const useStyles = makeStyles(({}) => ({}));

const AnalyticsTokens: React.FC = () => {
  const classes = useStyles();

  return (
    <>
      <TopMovers background='#1b1d26' hideArrow={true} />
    </>
  );
};

export default AnalyticsTokens;
