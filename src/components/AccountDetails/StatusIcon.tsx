import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { SUPPORTED_WALLETS } from 'constants/index';
import { injected, portis } from 'connectors';
import { useActiveWeb3React } from 'hooks';

const StatusIcon: React.FC = () => {
  const { connector } = useActiveWeb3React();
  const { ethereum } = window as any;
  const isMetaMask = !!(ethereum && !ethereum.isBitKeep && ethereum.isMetaMask);
  const isBlockWallet = !!(ethereum && ethereum.isBlockWallet);
  const isBitkeep = !!(ethereum && ethereum.isBitKeep);
  const icon = Object.keys(SUPPORTED_WALLETS)
    .filter(
      (k) =>
        SUPPORTED_WALLETS[k].connector === connector &&
        (connector !== injected ||
          (isBlockWallet && k === 'BLOCKWALLET') ||
          (isBitkeep && k === 'BITKEEP') ||
          (isMetaMask && k === 'METAMASK')),
    )
    .map((k) => SUPPORTED_WALLETS[k].iconName)[0];
  return (
    <Box display='flex' alignItems='center'>
      <img src={icon} width={24} alt='wallet icon' />
      {connector === portis && (
        <Box
          ml={1}
          style={{ cursor: 'pointer' }}
          onClick={() => {
            portis.portis.showPortis();
          }}
        >
          <Typography variant='body2'>Show Portis</Typography>
        </Box>
      )}
    </Box>
  );
};

export default StatusIcon;
