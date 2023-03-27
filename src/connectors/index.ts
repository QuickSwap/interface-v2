import { Web3Provider } from '@ethersproject/providers';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { LedgerConnector } from '@web3-react/ledger-connector';
import { UAuthConnector } from '@uauth/web3-react';
import { WalletLinkConnector } from './WalletLink';
import { PortisConnector } from './Portis';

import { FortmaticConnector } from './Fortmatic';
import { ArkaneConnector } from './Arkane';
import { NetworkConnector } from './NetworkConnector';
import { SafeAppConnector } from './SafeApp';
import {
  getTrustWalletInjectedProvider,
  TrustWalletConnector,
} from './TrustWalletConnector';
import { MetaMaskConnector } from './MetaMaskConnector';
import { ChainId } from '@uniswap/sdk';
import { PhantomWalletConnector } from './PhantomWalletConnector';

const POLLING_INTERVAL = 12000;

export interface NetworkInfo {
  rpcUrl: string;
  scanUrl: string;
}

export type NetworkInfoChainMap = Readonly<
  {
    [chainId in ChainId]: NetworkInfo;
  }
>;

export const networkInfoMap: NetworkInfoChainMap = {
  [ChainId.MATIC]: {
    rpcUrl: 'https://polygon-rpc.com/',
    scanUrl: 'https://polygonscan.com/',
  },
  [ChainId.DOGECHAIN]: {
    rpcUrl: 'https://rpc-sg.dogechain.dog/',
    scanUrl: 'https://explorer.dogechain.dog/',
  },
  [ChainId.MUMBAI]: {
    rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
    scanUrl: 'https://mumbai.polygonscan.com/',
  },
  [ChainId.DOEGCHAIN_TESTNET]: {
    rpcUrl: 'https://rpc-testnet.dogechain.dog',
    scanUrl: 'https://explorer-testnet.dogechain.dog/',
  },
  [ChainId.ZKTESTNET]: {
    rpcUrl: 'https://rpc.public.zkevm-test.net',
    scanUrl: 'https://testnet-zkevm.polygonscan.com/',
  },
  [ChainId.ZKEVM]: {
    rpcUrl: 'https://zkevm-rpc.com',
    scanUrl: 'https://zkevm.polygonscan.com/',
  },
};

const NETWORK_URL = 'https://polygon-rpc.com/';
// const FORMATIC_KEY = 'pk_live_F937DF033A1666BF'
// const PORTIS_ID = 'c0e2bf01-4b08-4fd5-ac7b-8e26b58cd236'
const FORMATIC_KEY = process.env.REACT_APP_FORTMATIC_KEY;
const PORTIS_ID = process.env.REACT_APP_PORTIS_ID;
const MAINNET_NETWORK_URL = process.env.REACT_APP_MAINNET_NETWORK_URL;

export const NETWORK_CHAIN_ID: number = parseInt(
  process.env.REACT_APP_CHAIN_ID ?? '137',
);

export const rpcMap = {
  [ChainId.MATIC]: networkInfoMap[ChainId.MATIC].rpcUrl,
  [ChainId.MUMBAI]: networkInfoMap[ChainId.MUMBAI].rpcUrl,
  [ChainId.DOGECHAIN]: networkInfoMap[ChainId.DOGECHAIN].rpcUrl,
  [ChainId.DOEGCHAIN_TESTNET]: networkInfoMap[ChainId.DOEGCHAIN_TESTNET].rpcUrl,
  [ChainId.ZKTESTNET]: networkInfoMap[ChainId.ZKTESTNET].rpcUrl,
};

export const network = new NetworkConnector({
  urls: rpcMap,
  defaultChainId: ChainId.MATIC,
});

export const mainnetNetwork = new NetworkConnector({
  urls: {
    [Number('1')]: MAINNET_NETWORK_URL || 'https://rpc.ankr.com/eth',
  },
});

export function getMainnetNetworkLibrary(): Web3Provider {
  return new Web3Provider(mainnetNetwork.provider as any);
}

let networkLibrary: Web3Provider | undefined;
export function getNetworkLibrary(): Web3Provider {
  return (networkLibrary =
    networkLibrary ?? new Web3Provider(network.provider as any));
}

const supportedChainIds: number[] = [
  ChainId.MATIC,
  ChainId.DOGECHAIN,
  ChainId.MUMBAI,
  ChainId.DOEGCHAIN_TESTNET,
  ChainId.ZKTESTNET,
  ChainId.ZKEVM,
];

export const injected = new InjectedConnector({
  supportedChainIds: supportedChainIds,
});

export const metamask = new MetaMaskConnector({
  supportedChainIds: supportedChainIds,
});

export const safeApp = new SafeAppConnector();

export const phantomconnect = new PhantomWalletConnector({
  supportedChainIds: [137, 80001],
});

export const zengoconnect = new WalletConnectConnector({
  rpc: { 137: NETWORK_URL },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  qrcodeModalOptions: { mobileLinks: ['ZenGo'] },
});

// mainnet only
export const walletconnect = new WalletConnectConnector({
  rpc: rpcMap,
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
});

// mainnet only
export const trustconnect = !!getTrustWalletInjectedProvider()
  ? new TrustWalletConnector({
      supportedChainIds: [137],
    })
  : new WalletConnectConnector({
      rpc: { 137: NETWORK_URL },
      bridge: 'https://bridge.walletconnect.org',
      qrcode: true,
    });

// mainnet only
export const arkaneconnect = new ArkaneConnector({
  clientID: 'QuickSwap',
  chainId: 137,
});

// mainnet only
export const fortmatic = new FortmaticConnector({
  apiKey: FORMATIC_KEY ?? '',
  chainId: 137,
});

// mainnet only
export const portis = new PortisConnector({
  dAppId: PORTIS_ID ?? '',
  networks: [137],
  config: {
    nodeUrl: NETWORK_URL,
    chainId: 137,
  },
});

// mainnet only
export const walletlink = new WalletLinkConnector({
  url: NETWORK_URL,
  appName: 'Uniswap',
  appLogoUrl:
    'https://mpng.pngfly.com/20181202/bex/kisspng-emoji-domain-unicorn-pin-badges-sticker-unicorn-tumblr-emoji-unicorn-iphoneemoji-5c046729264a77.5671679315437924251569.jpg',
  supportedChainIds: [137],
});

export const ledger = new LedgerConnector({
  chainId: 137,
  url: NETWORK_URL,
  pollingInterval: POLLING_INTERVAL,
});

export const unstopabbledomains = new UAuthConnector({
  clientID: process.env.REACT_APP_UNSTOPPABLE_DOMAIN_CLIENT_ID,
  redirectUri: process.env.REACT_APP_UNSTOPPABLE_DOMAIN_REDIRECT_URI,

  // Scope must include openid and wallet
  scope: 'openid wallet',

  // Injected and walletconnect connectors are required.
  connectors: { injected, walletconnect },
});
