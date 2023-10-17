import React, { useCallback, useEffect } from 'react';
import { CustomModal } from 'components';
import { Box } from '@material-ui/core';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import 'components/styles/NetworkSelectionModal.scss';
import { SUPPORTED_CHAINIDS } from 'constants/index';
import { getConfig } from 'config';
import { useActiveWeb3React } from 'hooks';
import {
  useModalOpen,
  useNetworkSelectionModalToggle,
} from 'state/application/hooks';
import { useTranslation } from 'react-i18next';
import { ChainId } from '@uniswap/sdk';
import { ApplicationModal } from 'state/application/actions';
import { useIsSupportedNetwork } from 'utils';
import {
  networkConnection,
  walletConnectConnection,
  zengoConnectConnection,
} from 'connectors';
import KavaImage from 'assets/images/KAVA.png';
import { useArcxAnalytics } from '@arcxmoney/analytics';

const NetworkSelectionModal: React.FC = () => {
  const { t } = useTranslation();
  const arcxSdk = useArcxAnalytics();
  const { chainId, connector, account } = useActiveWeb3React();
  const supportedChains = SUPPORTED_CHAINIDS.filter((chain) => {
    const config = getConfig(chain);
    return config && config.isMainnet;
  });
  const modalOpen = useModalOpen(ApplicationModal.NETWORK_SELECTION);
  const toggleModal = useNetworkSelectionModalToggle();
  const isSupportedNetwork = useIsSupportedNetwork();

  useEffect(() => {
    const localChainId = localStorage.getItem('localChainId');

    if (
      localChainId &&
      Number(localChainId) !== chainId &&
      connector === networkConnection.connector
    ) {
      connector.activate(Number(localChainId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        connector === zengoConnectConnection.connector ||
        connector === networkConnection.connector
      ) {
        await connector.activate(chainId);
      } else {
        await connector.activate(chainParam);
      }
      if (arcxSdk && account) {
        await arcxSdk.chain({ chainId, account });
      }
      localStorage.setItem('localChainId', chainId.toString());
    },
    [account, arcxSdk, connector],
  );

  return (
    <CustomModal
      open={modalOpen}
      onClose={toggleModal}
      modalWrapper='modalWrapperV3 networkSelectionModalWrapper'
    >
      <Box className='flex items-center justify-between'>
        <p>{t('selectNetwork')}</p>
        <CloseIcon className='cursor-pointer' onClick={toggleModal} />
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
                <img src={config['nativeCurrencyImage']} alt='network Image' />
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
        <Box
          className='networkItemWrapper'
          onClick={() => {
            window.open('https://dex.kinetix.finance', '_blank');
          }}
        >
          <Box className='flex items-center'>
            <img src={KavaImage} alt='network Image' />
            <small className='weight-600'>Kava - Kinetix</small>
          </Box>
        </Box>
      </Box>
    </CustomModal>
  );
};

export default NetworkSelectionModal;
