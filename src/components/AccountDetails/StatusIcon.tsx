import React from 'react';
import { Box, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MetamaskIcon from 'assets/images/metamask.png';
import CoinbaseWalletIcon from 'assets/images/coinbaseWalletIcon.svg';
import WalletConnectIcon from 'assets/images/walletConnectIcon.svg';
import FortmaticIcon from 'assets/images/fortmaticIcon.png';
import PortisIcon from 'assets/images/portisIcon.png';
import { injected, walletconnect, walletlink, fortmatic, portis } from 'connectors';
import { useActiveWeb3React } from 'hooks';

const useStyles = makeStyles(({ palette }) => ({
  walletAction: {
    width: 'fit-content',
    fontWeight: 400,
    marginLeft: 8,
    fontSize: '0.825rem',
    padding: '4px 6px',
    '&:hover': {
      cursor: 'pointer',
      textDecoration: 'underline'
    }
  },
}));

const StatusIcon: React.FC = () => {
  const classes = useStyles();
  const { connector } = useActiveWeb3React();
  if (connector === injected) {
    return (
      <Box>
        <img src={MetamaskIcon} alt={'metamask logo'} />
      </Box>
    )
  } else if (connector === walletconnect) {
    return (
      <Box>
        <img src={WalletConnectIcon} alt={'wallet connect logo'} />
      </Box>
    )
  } else if (connector === walletlink) {
    return (
      <Box>
        <img src={CoinbaseWalletIcon} alt={'coinbase wallet logo'} />
      </Box>
    )
  } else if (connector === fortmatic) {
    return (
      <Box>
        <img src={FortmaticIcon} alt={'fortmatic logo'} />
      </Box>
    )
  } else if (connector === portis) {
    return (
      <Box>
        <img src={PortisIcon} alt={'portis logo'} />
        <Button className={classes.walletAction}
          onClick={() => {
            portis.portis.showPortis()
          }}
        >
          Show Portis
        </Button>
      </Box>
    )
  }
  return null
}

export default StatusIcon;