import React, { useState, useCallback, useEffect } from 'react';
import { Box } from '@material-ui/core';
import 'components/styles/NetworkSelectionDropdown.scss';
import { SUPPORTED_CHAINIDS } from 'constants/index';
import { getConfig } from 'config/index';
import { useActiveWeb3React } from 'hooks';
import { useTranslation } from 'react-i18next';
import { ChainId } from '@uniswap/sdk';
import { useIsSupportedNetwork } from 'utils';
import KavaImage from 'assets/images/KAVA.png';
import FlareImage from 'assets/images/flare.webp';
import { useArcxAnalytics } from '@arcxmoney/analytics';
import CustomTabSwitch from 'components/v3/CustomTabSwitch';
import ActiveDotImage from 'assets/images/chainActiveDot.png';
import { useSwitchNetwork } from '@web3modal/ethers5/react';

const NetworkSelectionDropdown: React.FC = () => {
  const { t } = useTranslation();
  const arcxSdk = useArcxAnalytics();
  const { chainId, account, currentChainId } = useActiveWeb3React();
  const { switchNetwork } = useSwitchNetwork();
  const networkTypes = [
    { id: 'mainnet', text: t('mainnets') },
    { id: 'testnet', text: t('testnets') },
  ];
  const [networkType, setNetworkType] = useState('mainnet');

  const supportedChains = SUPPORTED_CHAINIDS.filter((chain) => {
    const config = getConfig(chain);
    return (
      config &&
      config.visible &&
      config.isMainnet === (networkType === 'mainnet')
    );
  });
  const isSupportedNetwork = useIsSupportedNetwork();

  useEffect(() => {
    const localChainId = localStorage.getItem('localChainId');

    if (localChainId && Number(localChainId) !== chainId) {
      switchNetwork(Number(localChainId));
    } else {
      switchNetwork(chainId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchNetworkFunction = useCallback(
    async (chainId: ChainId) => {
      await switchNetwork(chainId);

      if (arcxSdk && account) {
        await arcxSdk.chain({ chainId, account });
      }
      localStorage.setItem('localChainId', chainId.toString());
      if (!currentChainId) {
        window.location.reload();
      }
    },
    [account, arcxSdk, currentChainId, switchNetwork],
  );

  return (
    <Box className='networkSelectionDropdown'>
      <p>{t('selectNetwork')}</p>
      <Box className='networkTypeWrapper'>
        <CustomTabSwitch
          items={networkTypes}
          value={networkType}
          handleTabChange={setNetworkType}
          height={40}
        />
      </Box>
      {supportedChains.map((chain) => {
        const config = getConfig(chain);
        return (
          <Box
            className='networkItemWrapper'
            key={chain}
            onClick={() => {
              switchNetworkFunction(chain);
            }}
          >
            <Box className='flex items-center'>
              <img
                src={config['nativeCurrencyImage']}
                alt='network Image'
                className='networkIcon'
              />
              <small className='weight-600'>{config['networkName']}</small>
            </Box>
            {isSupportedNetwork && chainId && chainId === chain && (
              <img
                src={ActiveDotImage}
                alt='chain active'
                width={12}
                height={12}
              />
            )}
          </Box>
        );
      })}
      {networkType === 'mainnet' && (
        <>
          <Box
            className='networkItemWrapper'
            onClick={() => {
              window.open('https://kinetix.finance/home', '_blank');
            }}
          >
            <Box className='flex items-center'>
              <img
                src={KavaImage}
                alt='network Image'
                className='networkIcon'
              />
              <small className='weight-600'>Kava - Kinetix</small>
            </Box>
          </Box>
          <Box
            className='networkItemWrapper'
            onClick={() => {
              window.open('https://sparkdex.ai/apps/swap', '_blank');
            }}
          >
            <Box className='flex items-center'>
              <img
                src={FlareImage}
                alt='network Image'
                className='networkIcon'
              />
              <small className='weight-600'>Flare - SparkDex</small>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default NetworkSelectionDropdown;
