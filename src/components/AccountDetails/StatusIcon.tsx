import React from 'react';
import { Box } from '@material-ui/core';
import { SUPPORTED_WALLETS } from 'constants/index';
import { injected, portis } from 'connectors';
import { useActiveWeb3React } from 'hooks';
import { useTranslation } from 'react-i18next';

const StatusIcon: React.FC = () => {
  const { t } = useTranslation();
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
    <Box className='flex items-center'>
      <img src={icon} width={24} alt='wallet icon' />
      {connector === portis && (
        <Box
          ml={1}
          className='cursor-pointer'
          onClick={() => {
            portis.portis.showPortis();
          }}
        >
          <small>{t('showPortis')}</small>
        </Box>
      )}
    </Box>
  );
};

export default StatusIcon;
