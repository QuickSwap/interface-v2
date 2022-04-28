import { AbstractConnector } from '@web3-react/abstract-connector';
import React from 'react';
import { Box, CircularProgress, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { GlobalConst, SUPPORTED_WALLETS } from 'constants/index';
import { injected } from 'connectors';
import Option from './Option';

const useStyles = makeStyles(({ palette }) => ({
  pendingSection: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    '& > *': {
      width: '100%',
    },
  },
  errorGroup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    color: palette.error.main,
  },
  errorButton: {
    borderRadius: 8,
    fontSize: 12,
    color: palette.text.primary,
    backgroundColor: palette.background.default,
    marginLeft: '1rem',
    padding: '0.5rem',
    fontWeight: 600,
    userSelect: 'none',
    cursor: 'pointer',
  },
}));

interface PendingViewProps {
  connector?: AbstractConnector;
  error?: boolean;
  setPendingError: (error: boolean) => void;
  tryActivation: (connector: AbstractConnector) => void;
}

const PendingView: React.FC<PendingViewProps> = ({
  connector,
  error = false,
  setPendingError,
  tryActivation,
}) => {
  const isMetamask = (window as any).ethereum?.isMetaMask;
  const isBlockWallet = (window as any).ethereum?.isBlockWallet;
  const isBitKeep = (window as any).ethereum?.isBitKeep;
  const classes = useStyles();

  return (
    <Box className={classes.pendingSection}>
      <Box display='flex' alignItems='center' justifyContent='center' mb={4}>
        {error ? (
          <Box className={classes.errorGroup}>
            <Typography variant='body1'>Error connecting.</Typography>
            <Box
              className={classes.errorButton}
              onClick={() => {
                setPendingError(false);
                connector && tryActivation(connector);
              }}
            >
              Try Again
            </Box>
          </Box>
        ) : (
          <>
            <CircularProgress />
            <Typography variant='body1' style={{ marginLeft: 12 }}>
              Initializing...
            </Typography>
          </>
        )}
      </Box>
      {Object.keys(SUPPORTED_WALLETS).map((key) => {
        const option = SUPPORTED_WALLETS[key];
        if (option.connector === connector) {
          if (option.connector === injected) {
            if (isMetamask && option.name !== GlobalConst.walletName.METAMASK) {
              return null;
            }
            if (
              !isMetamask &&
              option.name === GlobalConst.walletName.METAMASK
            ) {
              return null;
            }
            if (isBitKeep && option.name !== GlobalConst.walletName.BITKEEP) {
              return null;
            }
            if (!isBitKeep && option.name === GlobalConst.walletName.BITKEEP) {
              return null;
            }
            if (
              isBlockWallet &&
              option.name !== GlobalConst.walletName.BLOCKWALLET
            ) {
              return null;
            }
            if (
              !isBlockWallet &&
              option.name === GlobalConst.walletName.BLOCKWALLET
            ) {
              return null;
            }
          }
          return (
            <Option
              id={`connect-${key}`}
              key={key}
              clickable={false}
              color={option.color}
              header={option.name}
              subheader={option.description}
              icon={option.iconName}
            />
          );
        }
        return null;
      })}
    </Box>
  );
};

export default PendingView;
