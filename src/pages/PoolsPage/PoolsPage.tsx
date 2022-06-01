import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Grid, Typography } from '@material-ui/core';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import SupplyLiquidity from './SupplyLiquidity';
import YourLiquidityPools from './YourLiquidityPools';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  helpWrapper: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    border: `1px solid ${palette.secondary.light}`,
    borderRadius: 10,
    '& p': {
      color: palette.text.hint,
    },
    '& svg': {
      marginLeft: 8,
    },
  },
  wrapper: {
    padding: 24,
    backgroundColor: palette.background.paper,
    borderRadius: 20,
    [breakpoints.down('xs')]: {
      padding: '16px 12px',
    },
  },
}));

const PoolsPage: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box width='100%' mb={3}>
      <Box
        mb={2}
        display='flex'
        alignItems='center'
        justifyContent='space-between'
        width='100%'
      >
        <Typography variant='h4'>{t('pool')}</Typography>
        <Box className={classes.helpWrapper}>
          <Typography variant='body2'>{t('help')}</Typography>
          <HelpIcon />
        </Box>
      </Box>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={5}>
          <Box className={classes.wrapper}>
            <SupplyLiquidity />
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={7}>
          <Box className={classes.wrapper}>
            <YourLiquidityPools />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PoolsPage;
