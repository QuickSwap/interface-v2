import React, { useCallback } from 'react';
import { CustomModal } from 'components';
import { Box } from '@material-ui/core';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import 'components/styles/NetworkSelectionModal.scss';
import { SUPPORTED_CHAINIDS } from 'constants/index';
import { getConfig } from 'config';
import { useActiveWeb3React } from 'hooks';
import { isSupportedNetwork } from 'utils';
import { useLocalChainId } from 'state/application/hooks';
import { useTranslation } from 'react-i18next';
import { ChainId } from '@uniswap/sdk';

interface NetworkSelectionModalProps {
  open: boolean;
  onClose: () => void;
}

const NetworkSelectionModal: React.FC<NetworkSelectionModalProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const { chainId, connector } = useActiveWeb3React();
  const supportedChains = SUPPORTED_CHAINIDS.filter((chain) => {
    const config = getConfig(chain);
    return config && config.isMainnet;
  });
  const { updateLocalChainId } = useLocalChainId();
  const { ethereum } = window as any;

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
      if (ethereum) {
        await connector.activate(chainParam);
      } else {
        localStorage.setItem('quickswap_chainId', chainId.toString());
        updateLocalChainId(chainId);
      }
    },
    [ethereum, updateLocalChainId, connector],
  );

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      modalWrapper='modalWrapperV3 networkSelectionModalWrapper'
    >
      <Box className='flex items-center justify-between'>
        <p>{t('selectNetwork')}</p>
        <CloseIcon className='cursor-pointer' onClick={onClose} />
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
                onClose();
              }}
            >
              <Box className='flex items-center'>
                <img src={config['nativeCurrencyImage']} alt='network Image' />
                <small className='weight-600'>{config['networkName']}</small>
              </Box>
              {(!ethereum || isSupportedNetwork(ethereum)) &&
                chainId &&
                chainId === chain && (
                  <Box className='flex items-center'>
                    <Box className='networkConnectedDot' />
                    <span>{t('connected')}</span>
                  </Box>
                )}
            </Box>
          );
        })}
      </Box>
    </CustomModal>
  );
};

export default NetworkSelectionModal;
