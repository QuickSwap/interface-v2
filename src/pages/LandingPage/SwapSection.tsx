import React, { useState } from 'react';
import {
  ButtonGroup,
  Typography,
  Button,
  Box,
  Grid,
  useMediaQuery,
} from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Swap, AddLiquidity } from 'components';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  swapContainer: {
    textAlign: 'center',
    padding: '20px 0',
    maxWidth: 1048,
    margin: 'auto',
    width: '100%',
    '& > div': {
      width: '100%',
    },
    '& .MuiButtonGroup-root': {
      marginBottom: 50,
      '& button': {
        maxWidth: 180,
        width: '50%',
        height: 48,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'transparent',
        border: `1px solid ${palette.primary.dark}`,
        color: 'white',
        '&.active': {
          background: '#FFFFFFDE',
          border: `1px solid transparent`,
          color: palette.background.default,
        },
        '&:first-child': {
          borderTopLeftRadius: 24,
          borderBottomLeftRadius: 24,
        },
        '&:last-child': {
          borderTopRightRadius: 24,
          borderBottomRightRadius: 24,
        },
      },
    },
    [breakpoints.down('xs')]: {
      '& .MuiGrid-item': {
        width: '100%',
        marginBottom: 32,
        textAlign: 'center',
      },
    },
  },
  buttonGroup: {
    textAlign: 'center',
    padding: '20px 0',
    maxWidth: 1048,
    margin: 'auto',
    width: '100%',
    '& > div': {
      width: '100%',
    },
    '& .MuiButtonGroup-root': {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 50,
      '& button': {
        maxWidth: 180,
        width: '50%',
        height: 48,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'transparent',
        border: `1px solid ${palette.primary.dark}`,
        color: palette.text.secondary,
        '&.active': {
          background: '#FFFFFFDE',
          border: `1px solid transparent`,
          color: palette.background.default,
        },
        '&:first-child': {
          borderTopLeftRadius: 24,
          borderBottomLeftRadius: 24,
        },
        '&:last-child': {
          borderTopRightRadius: 24,
          borderBottomRightRadius: 24,
        },
      },
    },
    [breakpoints.down('xs')]: {
      '& .MuiGrid-item': {
        width: '100%',
        marginBottom: 32,
        textAlign: 'center',
      },
    },
  },
  swapInfo: {
    textAlign: 'left',
    marginBottom: 60,
    [breakpoints.down('sm')]: {
      order: -1,
    },
    '& h3': {
      marginBottom: 16,
    },
  },
}));

const SWAP_TAB = 0;
const LIQUIDITY_TAB = 1;

export const SwapSection: React.FC = () => {
  const classes = useStyles();
  const { palette, breakpoints } = useTheme();
  const mobileWindowSize = useMediaQuery(breakpoints.down('sm'));
  const [tabIndex, setTabIndex] = useState(SWAP_TAB);
  const { t } = useTranslation();

  return (
    <>
      <Box className={classes.buttonGroup}>
        <ButtonGroup>
          <Button
            className={tabIndex === SWAP_TAB ? 'active' : ''}
            onClick={() => setTabIndex(SWAP_TAB)}
          >
            {t('swap')}
          </Button>
          <Button
            className={tabIndex === LIQUIDITY_TAB ? 'active' : ''}
            onClick={() => setTabIndex(LIQUIDITY_TAB)}
          >
            {t('liquidity')}
          </Button>
        </ButtonGroup>
      </Box>
      <Box className={classes.swapContainer}>
        <Grid container spacing={mobileWindowSize ? 0 : 8} alignItems='center'>
          <Grid item sm={12} md={6}>
            {tabIndex === SWAP_TAB ? (
              <Swap currencyBg={palette.background.paper} />
            ) : (
              <AddLiquidity currencyBg={palette.background.paper} />
            )}
          </Grid>
          <Grid item sm={12} md={6} className={classes.swapInfo}>
            <Typography variant='h4'>
              {tabIndex === SWAP_TAB
                ? t('swapSectionShortDesc')
                : t('liquiditySectionShortDesc')}
            </Typography>
            <Typography variant='body1' style={{ marginTop: '20px' }}>
              {tabIndex === SWAP_TAB
                ? t('swapSectionLongDesc')
                : t('liquiditySectionLongDesc')}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
