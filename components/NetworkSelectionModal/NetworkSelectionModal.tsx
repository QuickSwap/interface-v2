import React, { useCallback } from 'react';
import { CustomModal } from 'components';
import { Box } from '@mui/material';
import { Close } from '@mui/icons-material';
import styles from 'styles/components/NetworkSelectionModal.module.scss';
import { SUPPORTED_CHAINIDS } from 'constants/index';
import { getConfig } from 'config';
import { useActiveWeb3React } from 'hooks';
import {
  useModalOpen,
  useNetworkSelectionModalToggle,
} from 'state/application/hooks';
import Image from 'next/image';
import { ApplicationModal } from 'state/application/actions';
import { useIsSupportedNetwork } from 'utils';
import { ChainId } from '@uniswap/sdk';
import { useTranslation } from 'next-i18next';
import { networkConnection, walletConnectConnection } from 'connectors';

const NetworkSelectionModal: React.FC = () => {
  const { t } = useTranslation();
  const { chainId, connector } = useActiveWeb3React();
  const supportedChains = SUPPORTED_CHAINIDS.filter((chain) => {
    const config = getConfig(chain);
    return config && config.isMainnet;
  });
  const modalOpen = useModalOpen(ApplicationModal.NETWORK_SELECTION);
  const toggleModal = useNetworkSelectionModalToggle();
  const isSupportedNetwork = useIsSupportedNetwork();

  const switchNetwork = useCallback(
    async (chainId: ChainId) => {
      const config = getConfig(chainId);
      const chainParam = {
        chainId,
        chainName: `${config['networkName']} Network`,
        rpcUrls: [config['rpc']],
        nativeCurrency: config['nativeCurrency'],
        blockExplorerUrls: [config['blockExplorer']],
      };
      if (
        connector === walletConnectConnection.connector ||
        connector === networkConnection.connector
      ) {
        await connector.activate(chainId);
      } else {
        await connector.activate(chainParam);
      }
    },
    [connector],
  );

  return (
    <CustomModal open={modalOpen} onClose={toggleModal}>
      <Box className={styles.networkSelectionModalWrapper}>
        <Box className='flex items-center justify-between'>
          <p>{t('selectNetwork')}</p>
          <Close className='cursor-pointer' onClick={toggleModal} />
        </Box>
        <Box mt='20px'>
          {supportedChains.map((chain) => {
            const config = getConfig(chain);
            return (
              <Box
                className='networkItemWrapper'
                key={chain}
                onClick={() => {
                  switchNetwork(chain);
                  toggleModal();
                }}
              >
                <Box className='flex items-center'>
                  <Image
                    src={config['nativeCurrencyImage']}
                    alt='network Image'
                    width={24}
                    height={24}
                  />
                  <small className='weight-600'>{config['networkName']}</small>
                </Box>
                {isSupportedNetwork && chainId && chainId === chain && (
                  <Box className='flex items-center'>
                    <Box className='networkConnectedDot' />
                    <span>{t('connected')}</span>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </CustomModal>
  );
};

export default NetworkSelectionModal;
