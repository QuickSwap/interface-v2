import { Web3Provider } from '@ethersproject/providers';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { LedgerConnector } from '@web3-react/ledger-connector';
import { WalletLinkConnector } from './WalletLink';
import { PortisConnector } from './Portis';

import { FortmaticConnector } from './Fortmatic';
import { ArkaneConnector } from './Arkane';
import { NetworkConnector } from './NetworkConnector';
import { SafeAppConnector } from './SafeApp';
import { ChainId } from '@uniswap/sdk';

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
    rpcUrl: 'https://dogechain.ankr.com',
    scanUrl: 'https://explorer.dogechain.dog/',
  },
  [ChainId.MUMBAI]: {
    rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
    scanUrl: 'https://mumbai.polygonscan.com/',
  },
  [ChainId.DOEGCHAIN_TESTNET]: {
    rpcUrl: 'https://rpc-testnet.dogechain.dog',
    scanUrl: ': https://explorer-testnet.dogechain.dog',
  },
};

const NETWORK_URL = 'https://polygon-rpc.com/';
// const FORMATIC_KEY = 'pk_live_F937DF033A1666BF'
// const PORTIS_ID = 'c0e2bf01-4b08-4fd5-ac7b-8e26b58cd236'
const FORMATIC_KEY = process.env.REACT_APP_FORTMATIC_KEY;
const PORTIS_ID = process.env.REACT_APP_PORTIS_ID;

export const NETWORK_CHAIN_ID: number = parseInt(
  process.env.REACT_APP_CHAIN_ID ?? '137',
);

export const rpcMap = {
  [ChainId.MATIC]: networkInfoMap[ChainId.MATIC].rpcUrl,
  [ChainId.MUMBAI]: networkInfoMap[ChainId.MUMBAI].rpcUrl,
  [ChainId.DOGECHAIN]: networkInfoMap[ChainId.DOGECHAIN].rpcUrl,
  [ChainId.DOEGCHAIN_TESTNET]: networkInfoMap[ChainId.DOEGCHAIN_TESTNET].rpcUrl,
};

export const network = new NetworkConnector({
  urls: rpcMap,
  defaultChainId: ChainId.MATIC,
});

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
];

export const injected = new InjectedConnector({
  supportedChainIds: supportedChainIds,
});

export const safeApp = new SafeAppConnector({ supportedChainIds });

// mainnet only
export const walletconnect = new WalletConnectConnector({
  rpc: rpcMap,
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
