import { Box, Typography } from '@material-ui/core';
import React from 'react';

export interface AvailableChainProps {
  networkName: string;
  nativeCurrencyImage: string;
}

const AvailableChain: React.FC<AvailableChainProps> = ({
  networkName,
  nativeCurrencyImage,
}) => {
  console.log('config', networkName);
  return (
    <Box className='chain_item'>
      <img
        src={nativeCurrencyImage}
        alt='network Image'
        className='availableChainIcon'
      />
      <Typography>{networkName}</Typography>
    </Box>
  );
  {
    /*              <Box className='flex items-center'>
                <img
                  src={config['nativeCurrencyImage']}
                  alt='network Image'
                  className='networkIcon'
                />
                <small className='weight-600'>{config['networkName']}</small>
              </Box> */
  }
};
export default AvailableChain;
