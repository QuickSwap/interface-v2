import React from 'react';
import { Box } from '@mui/material';
import { useActiveWeb3React } from 'hooks';
import { getWalletKeys } from 'utils';

const StatusIcon: React.FC = () => {
  const { connector } = useActiveWeb3React();
  const icon = getWalletKeys(connector).map(
    (connection) => connection.iconName,
  )[0];
  return (
    <Box className='flex items-center'>
      <picture>
        <img src={icon} width={24} alt='wallet icon' />
      </picture>
    </Box>
  );
};

export default StatusIcon;
