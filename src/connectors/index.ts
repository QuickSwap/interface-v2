import { initializeConnector, Web3ReactHooks } from '@web3-react/core';
import { CoinbaseWallet } from '@web3-react/coinbase-wallet';
import { GnosisSafe } from '@web3-react/gnosis-safe';
import { MetaMask } from './Metamask';
import { Network } from '@web3-react/network';
import { Connector } from '@web3-react/types';
import { WalletConnectPopup } from './WalletConnect';
import { Venly } from './Arkane';
import { ChainId } from '@uniswap/sdk';
import MetamaskIcon from 'assets/images/metamask.png';
import BlockWalletIcon from 'assets/images/blockwalletIcon.svg';
import BraveWalletIcon from 'assets/images/braveWalletIcon.png';
import cypherDIcon from 'assets/images/cypherDIcon.png';
import BitKeepIcon from 'assets/images/bitkeep.png';
import CoinbaseWalletIcon from 'assets/images/coinbaseWalletIcon.svg';
import WalletConnectIcon from 'assets/images/walletConnectIcon.svg';
import PhantomIcon from 'assets/images/wallets/phantomIconPurple.svg';
import VenlyIcon from 'assets/images/venly.svg';
import UnstoppableDomainsIcon from 'assets/images/unstoppableDomains.png';
import GnosisIcon from 'assets/images/gnosis_safe.png';
import TrustIcon from 'assets/images/trust.png';
import ZengoIcon from 'assets/images/zengo.png';
import { GlobalConst } from 'constants/index';
import { RPC_PROVIDERS, rpcMap } from 'constants/providers';
import { SecretType } from '@venly/web3-provider';
import { Phantom } from './Phantom';
import { TrustWallet } from './TrustWallet';
import { BitKeep } from './BitKeep';
import { BlockWallet } from './BlockWallet';
import { BraveWallet } from './BraveWallet';
import { CypherD } from './CypherD';

const POLLING_INTERVAL = 12000;

function onError(error: Error) {
  console.debug(`web3-react error: ${error}`);
}

export enum ConnectionType {
  METAMASK = 'METAMASK',
  COINBASE_WALLET = 'COINBASE_WALLET',
  ARKANE = 'ARKANE_CONNECT',
  WALLET_CONNECT = 'WALLET_CONNECT',
  NETWORK = 'NETWORK',
  GNOSIS_SAFE = 'GNOSIS_SAFE',
  PHATOM = 'PHANTOM',
  TRUSTWALLET = 'TRUSTWALLET',
  BITKEEP = 'BITKEEP',
  BLOCKWALLET = 'BLOCKWALLET',
  BRAVEWALLET = 'BRAVEWALLET',
  CYPHERD = 'CYPHERD',
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

const FORMATIC_KEY = process.env.REACT_APP_FORTMATIC_KEY;

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

const [web3Metamask, web3MetamaskHooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions, onError }),
);

export const metamaskConnection: Connection = {
  key: 'METAMASK',
  name: GlobalConst.walletName.METAMASK,
  connector: web3Metamask,
  hooks: web3MetamaskHooks,
  type: ConnectionType.METAMASK,
  iconName: MetamaskIcon,
  color: '#E8831D',
  description: 'Easy-to-use browser extension.',
};

const [web3BlockWallet, web3BlockWalletHooks] = initializeConnector<
  BlockWallet
>(
  (actions) =>
    new BlockWallet({
      actions,
      onError,
    }),
);

export const blockWalletConnection: Connection = {
  key: 'BLOCKWALLET',
  name: GlobalConst.walletName.BLOCKWALLET,
  connector: web3BlockWallet,
  hooks: web3BlockWalletHooks,
  type: ConnectionType.BLOCKWALLET,
  iconName: BlockWalletIcon,
  color: '#1673ff',
  description: 'BlockWallet browser extension.',
};

const [web3BraveWallet, web3BraveWalletHooks] = initializeConnector<
  BraveWallet
>(
  (actions) =>
    new BraveWallet({
      actions,
      onError,
    }),
);

export const braveWalletConnection: Connection = {
  key: 'BRAVEWALLET',
  name: GlobalConst.walletName.BRAVEWALLET,
  connector: web3BraveWallet,
  hooks: web3BraveWalletHooks,
  type: ConnectionType.BRAVEWALLET,
  iconName: BraveWalletIcon,
  color: '#1673ff',
  description: 'Brave browser wallet.',
  mobile: true,
};

const [web3BitKeep, web3BitKeepHooks] = initializeConnector<BitKeep>(
  (actions) =>
    new BitKeep({
      actions,
      onError,
    }),
);

export const bitKeepConnection: Connection = {
  key: 'BITKEEP',
  name: GlobalConst.walletName.BITKEEP,
  connector: web3BitKeep,
  hooks: web3BitKeepHooks,
  type: ConnectionType.BITKEEP,
  iconName: BitKeepIcon,
  color: '#E8831D',
  description: 'BitKeep browser extension.',
};

const [web3CypherD, web3CypherDHooks] = initializeConnector<CypherD>(
  (actions) =>
    new CypherD({
      actions,
      onError,
    }),
);

export const cypherDConnection: Connection = {
  key: 'CYPHERD',
  name: GlobalConst.walletName.CYPHERD,
  connector: web3CypherD,
  hooks: web3CypherDHooks,
  type: ConnectionType.CYPHERD,
  iconName: cypherDIcon,
  color: '#E8831D',
  description: 'CypherD browser extension.',
};

const [web3Phantom, web3PhantomHooks] = initializeConnector<Phantom>(
  (actions) =>
    new Phantom({
      actions,
      onError,
    }),
);

export const phantomConnection: Connection = {
  key: 'PHANTOM_WALLET',
  name: GlobalConst.walletName.PHANTOM_WALLET,
  connector: web3Phantom,
  hooks: web3PhantomHooks,
  type: ConnectionType.PHATOM,
  iconName: PhantomIcon,
  color: '#E8831D',
  description: 'Phantom wallet extension.',
};

const [web3TrustWallet, web3TrustWalletHooks] = initializeConnector<
  TrustWallet
>(
  (actions) =>
    new TrustWallet({
      actions,
      onError,
    }),
);

export const trustWalletConnection: Connection = {
  key: 'TRUST_WALLET',
  name: GlobalConst.walletName.TRUST_WALLET,
  connector: web3TrustWallet,
  hooks: web3TrustWalletHooks,
  type: ConnectionType.TRUSTWALLET,
  iconName: TrustIcon,
  color: '#E8831D',
  description: 'TrustWallet extension.',
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
  description: 'Connect to ZenGo Wallet',
  mobile: true,
};

const [web3Arkane, web3ArkaneHooks] = initializeConnector<Venly>(
  (actions) =>
    new Venly({
      actions,
      options: {
        clientId: 'QuickSwap',
        skipAuthentication: false,
        secretType: SecretType.MATIC,
        authenticationOptions: {
          idpHint: 'password',
        },
      },
    }),
);

export const arkaneConnection: Connection = {
  key: 'ARKANE_CONNECT',
  name: GlobalConst.walletName.ARKANE_CONNECT,
  connector: web3Arkane,
  hooks: web3ArkaneHooks,
  type: ConnectionType.ARKANE,
  iconName: VenlyIcon,
  color: '#4196FC',
  description: 'Login using Venly hosted wallet.',
};

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

export function getConnections() {
  return [
    cypherDConnection,
    metamaskConnection,
    trustWalletConnection,
    phantomConnection,
    braveWalletConnection,
    blockWalletConnection,
    bitKeepConnection,
    gnosisSafeConnection,
    coinbaseWalletConnection,
    walletConnectConnection,
    zengoConnectConnection,
    arkaneConnection,
  ];
}
