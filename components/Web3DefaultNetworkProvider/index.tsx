import React from 'react';
import { createWeb3ReactRoot } from '@web3-react/core';
import { GlobalConst } from 'constants/index';
import { Web3Provider } from '@ethersproject/providers';

const Web3ReactProviderNetworkDefault = createWeb3ReactRoot(
  GlobalConst.utils.NetworkContextName,
);

const Web3ReactProviderNetworkDefaultSSR: React.FC<{
  children: React.ReactNode;
  getLibrary: (provider: any) => Web3Provider;
}> = ({ children, getLibrary }) => {
  return (
    <Web3ReactProviderNetworkDefault getLibrary={getLibrary}>
      {children}
    </Web3ReactProviderNetworkDefault>
  );
};

export default Web3ReactProviderNetworkDefaultSSR;
