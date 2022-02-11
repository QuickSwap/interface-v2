import React from 'react';
import { useHistory } from 'react-router-dom';
import { Typography, Button, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Skeleton } from '@material-ui/lab';
import { isSupportedNetwork, addMaticToMetamask } from 'utils';
import { useActiveWeb3React } from 'hooks';
import { useWalletModalToggle } from 'state/application/hooks';

const useStyles = makeStyles(({ palette }) => ({
  heroSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    textAlign: 'center',
    zIndex: 2,
    '& h3': {
      textTransform: 'uppercase',
      marginBottom: 20,
      paddingTop: 9,
    },
    '& h1': {
      fontSize: '55px',
      fontWeight: 700,
    },
    '& h5': {
      fontSize: '15px',
      color: palette.text.secondary,
    },
    '& > button': {
      height: 56,
      width: 194,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
}));

export const HeroSection: React.FC<{ globalData: any }> = ({ globalData }) => {
  const classes = useStyles();
  const history = useHistory();
  const { account } = useActiveWeb3React();
  const { ethereum } = window as any;
  const toggleWalletModal = useWalletModalToggle();

  return (
    <Box className={classes.heroSection}>
      <Typography variant='body2' style={{ fontWeight: 'bold' }}>
        Total Value Locked
      </Typography>
      {globalData ? (
        <Box display='flex' pt='5px'>
          <Typography variant='h3'>$</Typography>
          <Typography variant='h1'>
            {Number(globalData.totalLiquidityUSD).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </Typography>
        </Box>
      ) : (
        <Box my={1}>
          <Skeleton variant='rect' width={400} height={72} />
        </Box>
      )}
      <Typography variant='h5'>
        Top Asset Exchange on the Polygon Network
      </Typography>
      <Box mt={2} width={200} height={48}>
        <Button
          fullWidth
          style={{
            backgroundColor: '#004ce6',
            borderRadius: '30px',
            height: '100%',
            fontSize: 16,
            fontWeight: 500,
          }}
          onClick={() => {
            ethereum && !isSupportedNetwork(ethereum)
              ? addMaticToMetamask()
              : account
              ? history.push('/swap')
              : toggleWalletModal();
          }}
        >
          {ethereum && !isSupportedNetwork(ethereum)
            ? 'Switch to Polygon'
            : account
            ? 'Enter App'
            : 'Connect Wallet'}
        </Button>
      </Box>
    </Box>
  );
};
