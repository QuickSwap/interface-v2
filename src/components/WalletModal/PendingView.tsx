import { AbstractConnector } from '@web3-react/abstract-connector';
import React from 'react';
import { Box, CircularProgress, Typography } from '@material-ui/core';
import { GlobalConst, SUPPORTED_WALLETS } from 'constants/index';
import { injected } from 'connectors';
import Option from './Option';

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

  return (
    <Box className='pendingSection'>
      <Box display='flex' alignItems='center' justifyContent='center' mb={4}>
        {error ? (
          <Box className='errorGroup'>
            <Typography variant='body1'>Error connecting.</Typography>
            <Box
              className='errorButton'
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
