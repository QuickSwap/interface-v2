import React from 'react';
import { Box, Typography } from '@material-ui/core';
import MetamaskIcon from 'assets/images/metamask.png';
import CoinbaseWalletIcon from 'assets/images/coinbaseWalletIcon.svg';
import WalletConnectIcon from 'assets/images/walletConnectIcon.svg';
import FortmaticIcon from 'assets/images/fortmaticIcon.png';
import PortisIcon from 'assets/images/portisIcon.png';
import {
  injected,
  walletconnect,
  walletlink,
  fortmatic,
  portis,
} from 'connectors';
import { useActiveWeb3React } from 'hooks';

const StatusIcon: React.FC = () => {
  const { connector } = useActiveWeb3React();
  if (connector === injected) {
    return <img src={MetamaskIcon} width={24} alt='metamask logo' />;
  } else if (connector === walletconnect) {
    return <img src={WalletConnectIcon} width={24} alt='wallet connect logo' />;
  } else if (connector === walletlink) {
    return <img src={CoinbaseWalletIcon} width={24} alt='coinbase wallet' />;
  } else if (connector === fortmatic) {
    return <img src={FortmaticIcon} width={24} alt='fortmatic logo' />;
  } else if (connector === portis) {
    return (
      <Box display='flex' alignItems='center'>
        <img src={PortisIcon} width={24} alt='portis logo' />
        <Box
          ml={1}
          onClick={() => {
            portis.portis.showPortis();
          }}
        >
          <Typography variant='body2'>Show Portis</Typography>
        </Box>
      </Box>
    );
  }
  return null;
};

export default StatusIcon;
