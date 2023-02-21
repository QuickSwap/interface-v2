import React from 'react';
import { CustomModal } from 'components';
import { Box } from '@material-ui/core';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import 'components/styles/NetworkSelectionModal.scss';
import { SUPPORTED_CHAINIDS } from 'constants/index';
import { getConfig } from 'config';
import { useActiveWeb3React } from 'hooks';
import { isSupportedNetwork, switchNetwork } from 'utils';
import { useLocalChainId } from 'state/application/hooks';

interface NetworkSelectionModalProps {
  open: boolean;
  onClose: () => void;
}

const NetworkSelectionModal: React.FC<NetworkSelectionModalProps> = ({
  open,
  onClose,
}) => {
  const { chainId } = useActiveWeb3React();
  const supportedChains = SUPPORTED_CHAINIDS.filter((chain) => {
    const config = getConfig(chain);
    return config && config.isMainnet;
  });
  const { updateLocalChainId } = useLocalChainId();
  const { ethereum } = window as any;

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      modalWrapper='modalWrapperV3 networkSelectionModalWrapper'
    >
      <Box className='flex justify-between items-center'>
        <p>Select Network</p>
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
                if (
                  (ethereum && !isSupportedNetwork(ethereum)) ||
                  chain !== chainId
                ) {
                  switchNetwork(chain, updateLocalChainId);
                }
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
                    <span>Connected</span>
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
