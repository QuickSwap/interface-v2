import React from 'react';
import { Box } from '@material-ui/core';
import { useActiveWeb3React } from 'hooks';
import { useTranslation } from 'react-i18next';
import { getWalletKeys } from 'utils';

const StatusIcon: React.FC = () => {
  const { t } = useTranslation();
  const { connector } = useActiveWeb3React();
  const icon = getWalletKeys(connector).map(
    (connection) => connection.iconName,
  )[0];
  return (
    <Box className='flex items-center'>
      <img src={icon} width={24} alt='wallet icon' />
    </Box>
  );
};

export default StatusIcon;
