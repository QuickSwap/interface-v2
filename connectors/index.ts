import { initializeConnector, Web3ReactHooks } from '@web3-react/core';
import { CoinbaseWallet } from '@web3-react/coinbase-wallet';
import { GnosisSafe } from '@web3-react/gnosis-safe';
import { MetaMask } from '@web3-react/metamask';
import { Network } from '@web3-react/network';
import { Connector } from '@web3-react/types';
import { WalletConnectPopup } from './WalletConnect';
// import { UAuthConnector } from '@uauth/web3-react';
// import { FortmaticConnector } from './Fortmatic';
// import { ArkaneConnector } from './Arkane';
import { ChainId } from '@uniswap/sdk';
import { GlobalConst } from 'constants/index';
import { RPC_PROVIDERS, rpcMap } from 'constants/providers';

const MetamaskIcon = 'assets/images/metamask.png';
const BlockWalletIcon = 'assets/images/blockwalletIcon.svg';
const BraveWalletIcon = 'assets/images/braveWalletIcon.png';
const cypherDIcon = 'assets/images/cypherDIcon.png';
const BitKeepIcon = 'assets/images/bitkeep.png';
const CoinbaseWalletIcon = 'assets/images/coinbaseWalletIcon.svg';
const WalletConnectIcon = 'assets/images/walletConnectIcon.svg';
const PhantomIcon = 'assets/images/wallets/phantomIconPurple.svg';
const VenlyIcon = 'assets/images/venly.svg';
const UnstoppableDomainsIcon = 'assets/images/unstoppableDomains.png';
const GnosisIcon = 'assets/images/gnosis_safe.png';
const TrustIcon = 'assets/images/trust.png';
const ZengoIcon = 'assets/images/zengo.png';

function onError(error: Error) {
  console.debug(`web3-react error: ${error}`);
}

export enum ConnectionType {
  INJECTED = 'INJECTED',
  COINBASE_WALLET = 'COINBASE_WALLET',
  ARKANE = 'ARKANE_CONNECT',
  WALLET_CONNECT = 'WALLET_CONNECT',
  NETWORK = 'NETWORK',
  GNOSIS_SAFE = 'GNOSIS_SAFE',
}

export interface Connection {
  key: string;
  connector: Connector;
  hooks: Web3ReactHooks;
  type: ConnectionType;
  name: string;
  iconName: string;
  description: string;
  color: string;
  href?: string;
  primary?: true;
  mobile?: true;
  mobileOnly?: true;
  installLink?: string | null;
}

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

export const NETWORK_CHAIN_ID: number = parseInt(
  process.env.NEXT_PUBLIC_CHAIN_ID ?? '137',
);

const [web3Network, web3NetworkHooks] = initializeConnector<Network>(
  (actions) =>
    new Network({ actions, urlMap: RPC_PROVIDERS, defaultChainId: 137 }),
);

export const networkConnection: Connection = {
  key: 'NETWORK',
  name: 'Network',
  connector: web3Network,
  hooks: web3NetworkHooks,
  type: ConnectionType.NETWORK,
  iconName: '',
  description: '',
  color: '',
};

const [web3GnosisSafe, web3GnosisSafeHooks] = initializeConnector<GnosisSafe>(
  (actions) => new GnosisSafe({ actions }),
);
export const gnosisSafeConnection: Connection = {
  key: 'SAFE_APP',
  name: GlobalConst.walletName.SAFE_APP,
  connector: web3GnosisSafe,
  hooks: web3GnosisSafeHooks,
  type: ConnectionType.GNOSIS_SAFE,
  iconName: GnosisIcon,
  color: '#4196FC',
  description: 'Login using gnosis safe app',
};

const [web3Injected, web3InjectedHooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions, onError }),
);
export const injectedConnection: Connection = {
  key: 'INJECTED',
  name: GlobalConst.walletName.INJECTED,
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
  iconName: 'arrow-right.svg',
  color: '#010101',
  description: 'Injected web3 provider.',
};

export const metamaskConnection: Connection = {
  key: 'METAMASK',
  name: GlobalConst.walletName.METAMASK,
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
  iconName: MetamaskIcon,
  color: '#E8831D',
  description: 'Easy-to-use browser extension.',
};

export const blockWalletConnection: Connection = {
  key: 'BLOCKWALLET',
  name: GlobalConst.walletName.BLOCKWALLET,
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
  iconName: BlockWalletIcon,
  color: '#1673ff',
  description: 'BlockWallet browser extension.',
};

export const braveWalletConnection: Connection = {
  key: 'BRAVEWALLET',
  name: GlobalConst.walletName.BRAVEWALLET,
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
  iconName: BraveWalletIcon,
  color: '#1673ff',
  description: 'Brave browser wallet.',
  mobile: true,
};

export const bitKeepConnection: Connection = {
  key: 'BITKEEP',
  name: GlobalConst.walletName.BITKEEP,
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
  iconName: BitKeepIcon,
  color: '#E8831D',
  description: 'BitKeep browser extension.',
};

export const cypherDConnection: Connection = {
  key: 'CYPHERD',
  name: GlobalConst.walletName.CYPHERD,
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
  iconName: cypherDIcon,
  color: '#E8831D',
  description: 'CypherD browser extension.',
};

export const phantomConnection: Connection = {
  key: 'PHANTOM_WALLET',
  name: GlobalConst.walletName.PHANTOM_WALLET,
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
  iconName: PhantomIcon,
  color: '#E8831D',
  description: 'Phantom wallet extension.',
};

export const trustWalletConnection: Connection = {
  key: 'TRUST_WALLET',
  name: GlobalConst.walletName.TRUST_WALLET,
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
  iconName: TrustIcon,
  color: '#E8831D',
  description: 'Trust wallet extension.',
};

const [web3WalletConnect, web3WalletConnectHooks] = initializeConnector<
  WalletConnectPopup
>((actions) => new WalletConnectPopup({ actions, onError }));

export const walletConnectConnection: Connection = {
  key: 'WALLET_CONNECT',
  name: GlobalConst.walletName.WALLET_CONNECT,
  connector: web3WalletConnect,
  hooks: web3WalletConnectHooks,
  type: ConnectionType.WALLET_CONNECT,
  iconName: WalletConnectIcon,
  color: '#4196FC',
  description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
  mobile: true,
};

const [web3ZengoConnect, web3ZengoConnectHooks] = initializeConnector<
  WalletConnectPopup
>(
  (actions) =>
    new WalletConnectPopup({
      actions,
      onError,
      qrcodeModalOptions: { mobileLinks: ['ZenGo'] },
    }),
);

export const zengoConnectConnection: Connection = {
  key: 'ZENGO_CONNECT',
  name: GlobalConst.walletName.ZENGO_CONNECT,
  connector: web3ZengoConnect,
  hooks: web3ZengoConnectHooks,
  type: ConnectionType.WALLET_CONNECT,
  iconName: ZengoIcon,
  color: '#4196FC',
  description: 'Connect to Zengo Wallet',
  mobile: true,
};

// mainnet only
// export const arkaneconnect = new ArkaneConnector({
//   clientID: 'QuickSwap',
//   chainId: 137,
// });

// mainnet only
// export const fortmatic = new FortmaticConnector({
//   apiKey: FORMATIC_KEY ?? '',
//   chainId: 137,
// });

// const [web3Arkane, web3ArkaneHooks] = initializeConnector<ArkaneConnector>(
//   (actions) =>
//     new ArkaneConnector({
//       clientID: 'QuickSwap',
//       chainId: 137,
//       actions,
//       onError,
//     }),
// );

// export const arkaneConnection: Connection = {
//   key: 'ARKANE_CONNECT',
//   name: GlobalConst.walletName.ARKANE_CONNECT,
//   connector: web3Arkane,
//   hooks: web3ArkaneHooks,
//   type: ConnectionType.COINBASE_WALLET,
//   iconName: VenlyIcon,
//   color: '#4196FC',
//   description: 'Login using Venly hosted wallet.',
// };

const [web3CoinbaseWallet, web3CoinbaseWalletHooks] = initializeConnector<
  CoinbaseWallet
>(
  (actions) =>
    new CoinbaseWallet({
      actions,
      options: {
        url: rpcMap[ChainId.MATIC],
        appName: 'QuickSwap',
        appLogoUrl: CoinbaseWalletIcon,
        reloadOnDisconnect: false,
      },
      onError,
    }),
);

export const coinbaseWalletConnection: Connection = {
  key: 'WALLET_LINK',
  name: GlobalConst.walletName.WALLET_LINK,
  connector: web3CoinbaseWallet,
  hooks: web3CoinbaseWalletHooks,
  type: ConnectionType.COINBASE_WALLET,
  iconName: CoinbaseWalletIcon,
  color: '#315CF5',
  description: 'Use Coinbase Wallet app on mobile device',
};

// export const unstopabbledomains = new UAuthConnector({
//   clientID: process.env.NEXT_PUBLIC_UNSTOPPABLE_DOMAIN_CLIENT_ID,
//   redirectUri: process.env.NEXT_PUBLIC_UNSTOPPABLE_DOMAIN_REDIRECT_URI,

//   // Scope must include openid and wallet
//   scope: 'openid wallet',

//   // Injected and walletconnect connectors are required.
//   connectors: { injected, walletconnect },
// });

export function getConnections() {
  return [
    cypherDConnection,
    metamaskConnection,
    trustWalletConnection,
    phantomConnection,
    braveWalletConnection,
    blockWalletConnection,
    bitKeepConnection,
    injectedConnection,
    gnosisSafeConnection,
    coinbaseWalletConnection,
    walletConnectConnection,
    zengoConnectConnection,
  ];
}
