import React from 'react';
import { Box } from '@material-ui/core';
import { useWalletInfo } from '@web3modal/ethers5/react';
import { useTranslation } from 'react-i18next';

const StatusIcon: React.FC = () => {
  const { walletInfo } = useWalletInfo();
  return (
    <Box className='flex items-center'>
      {walletInfo?.icon && (
        <img src={walletInfo.icon} width={24} alt='wallet icon' />
      )}
    </Box>
  );
};

export default StatusIcon;
