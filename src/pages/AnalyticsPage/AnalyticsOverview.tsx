import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, useMediaQuery } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Skeleton from '@material-ui/lab/Skeleton';
import { ArrowForwardIos } from '@material-ui/icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useGlobalData } from 'state/application/hooks';
import {
  getEthPrice,
  getTopPairs,
  getTopTokens,
  getGlobalData,
  getBulkPairData,
} from 'utils';
import { GlobalConst } from 'constants/index';
import { TokensTable, PairTable } from 'components';
import AnalyticsInfo from './AnalyticsInfo';
import AnalyticsLiquidityChart from './AnalyticsLiquidityChart';
import AnalyticsVolumeChart from './AnalyticsVolumeChart';

dayjs.extend(utc);

const useStyles = makeStyles(({ palette }) => ({
  panel: {
    background: palette.grey.A700,
    borderRadius: 20,
  },
  headingWrapper: {
    display: 'flex',
    alignItems: 'center',
    '& h6': {
      color: palette.text.disabled,
    },
    '& svg': {
      height: 16,
      marginLeft: 2,
      color: '#3d71ff',
    },
  },
}));

const AnalyticsOverview: React.FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const { globalData, updateGlobalData } = useGlobalData();
  const [topTokens, updateTopTokens] = useState<any[] | null>(null);
  const [topPairs, updateTopPairs] = useState<any[] | null>(null);

  useEffect(() => {
    const fetchGlobalData = async () => {
      const [newPrice, oneDayPrice] = await getEthPrice();
      const globalData = await getGlobalData(newPrice, oneDayPrice);
      if (globalData) {
        updateGlobalData({ data: globalData });
      }
    };
    const fetchTopTokens = async () => {
      updateTopTokens(null);
      const [newPrice, oneDayPrice] = await getEthPrice();
      const topTokensData = await getTopTokens(
        newPrice,
        oneDayPrice,
        GlobalConst.utils.ROWSPERPAGE,
      );
      if (topTokensData) {
        updateTopTokens(topTokensData);
      }
    };
    const fetchTopPairs = async () => {
      updateTopPairs(null);
      const [newPrice] = await getEthPrice();
      const pairs = await getTopPairs(GlobalConst.utils.ROWSPERPAGE);
      const formattedPairs = pairs
        ? pairs.map((pair: any) => {
            return pair.id;
          })
        : [];
      const pairData = await getBulkPairData(formattedPairs, newPrice);
      if (pairData) {
        updateTopPairs(pairData);
      }
    };
    fetchGlobalData();
    fetchTopTokens();
    fetchTopPairs();
  }, [updateGlobalData, updateTopTokens, updateTopPairs]);

  return (
    <Box width='100%' mb={3}>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={6}>
          <Box className={classes.panel} padding={isMobile ? 1.5 : 3} width={1}>
            <AnalyticsLiquidityChart />
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <Box
            className={classes.panel}
            padding={isMobile ? 1.5 : 3}
            width={1}
            height={1}
            display='flex'
            flexDirection='column'
            justifyContent='space-between'
          >
            <AnalyticsVolumeChart />
          </Box>
        </Grid>
      </Grid>
      <Box mt={4}>
        <Box
          display='flex'
          flexWrap='wrap'
          paddingX={4}
          paddingY={1.5}
          className={classes.panel}
        >
          {globalData ? (
            <AnalyticsInfo data={globalData} />
          ) : (
            <Skeleton width='100%' height={20} />
          )}
        </Box>
      </Box>
      <Box mt={4}>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Box className={classes.headingWrapper}>
            <Typography variant='h6'>Top Tokens</Typography>
          </Box>
          <Box
            className={classes.headingWrapper}
            style={{ cursor: 'pointer' }}
            onClick={() => history.push(`/analytics?tabIndex=1`)}
          >
            <Typography variant='h6'>See All</Typography>
            <ArrowForwardIos />
          </Box>
        </Box>
      </Box>
      <Box
        mt={3}
        paddingX={isMobile ? 1.5 : 4}
        paddingY={isMobile ? 1.5 : 3}
        className={classes.panel}
      >
        {topTokens ? (
          <TokensTable data={topTokens} />
        ) : (
          <Skeleton variant='rect' width='100%' height={150} />
        )}
      </Box>
      <Box mt={4}>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Box className={classes.headingWrapper}>
            <Typography variant='h6'>Top Pairs</Typography>
          </Box>
          <Box
            className={classes.headingWrapper}
            style={{ cursor: 'pointer' }}
            onClick={() => history.push(`/analytics?tabIndex=2`)}
          >
            <Typography variant='h6'>See All</Typography>
            <ArrowForwardIos />
          </Box>
        </Box>
      </Box>
      <Box
        mt={3}
        paddingX={isMobile ? 1.5 : 4}
        paddingY={isMobile ? 1.5 : 3}
        className={classes.panel}
      >
        {topPairs ? (
          <PairTable data={topPairs} />
        ) : (
          <Skeleton variant='rect' width='100%' height={150} />
        )}
      </Box>
    </Box>
  );
};

export default AnalyticsOverview;
