import { Box, Typography } from '@material-ui/core';
import { getConfig } from 'config/index';
import { SUPPORTED_CHAINIDS } from 'constants/index';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AvailableChain from './AvailableChain';
import 'components/styles/AvailableNetwork.scss';

const AvailableChainList: React.FC = ({}) => {
  const supportedChains = SUPPORTED_CHAINIDS.filter((chain: any) => {
    const config = getConfig(chain);
    return config && config.visible;
  });
  const { t } = useTranslation();

  return (
    <Box className='available_chain_list'>
      <Typography className='available_chain_title' variant='h4'>
        {t('availableOn')}
      </Typography>
      <Box
        className='chain_list'
        sx={{
          display: 'flex',
        }}
      >
        {supportedChains.map((chain: any, index) => {
          const config = getConfig(chain);
          console.log('🚀 ~ {supportedChains.map ~ config:', config);
          if (!config.isMainnet) return;
          return (
            <Box className='availableNetworkWrapper' key={chain}>
              <AvailableChain
                networkName={config.networkName}
                nativeCurrencyImage={config.nativeCurrencyImage}
              ></AvailableChain>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
export default AvailableChainList;
