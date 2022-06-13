import { ChainId, JSBI, Percent, Token, WETH } from '@uniswap/sdk';
import { AbstractConnector } from '@web3-react/abstract-connector';
import {
  injected,
  walletconnect,
  walletlink,
  portis,
  arkaneconnect,
  safeApp,
} from '../connectors';
import MetamaskIcon from 'assets/images/metamask.png';
import BlockWalletIcon from 'assets/images/blockwalletIcon.svg';
import BitKeepIcon from 'assets/images/bitkeep.png';
import CoinbaseWalletIcon from 'assets/images/coinbaseWalletIcon.svg';
import WalletConnectIcon from 'assets/images/walletConnectIcon.svg';
import PortisIcon from 'assets/images/portisIcon.png';
import VenlyIcon from 'assets/images/venly.svg';
import GnosisIcon from 'assets/images/gnosis_safe.png';
import { returnTokenFromKey } from 'utils';

const WETH_ONLY: ChainTokenList = {
  [ChainId.MUMBAI]: [WETH[ChainId.MUMBAI]],
  [ChainId.MATIC]: [WETH[ChainId.MATIC]],
};

export enum TxnType {
  SWAP,
  ADD,
  REMOVE,
}

export const GlobalConst = {
  blacklists: {
    TOKEN_BLACKLIST: [
      '0x495c7f3a713870f68f8b418b355c085dfdc412c3',
      '0xc3761eb917cd790b30dad99f6cc5b4ff93c4f9ea',
      '0xe31debd7abff90b06bca21010dd860d8701fd901',
      '0xfc989fbb6b3024de5ca0144dc23c18a063942ac1',
      '0xf4eda77f0b455a12f3eb44f8653835f377e36b76',
    ],
    PAIR_BLACKLIST: [
      '0xb6a741f37d6e455ebcc9f17e2c16d0586c3f57a5',
      '0x97cb8cbe91227ba87fc21aaf52c4212d245da3f8',
    ],
  },
  addresses: {
    ROUTER_ADDRESS: {
      [ChainId.MATIC]: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
      [ChainId.MUMBAI]: '0x8954AfA98594b838bda56FE4C12a09D7739D179b',
    }, //'0x6207A65a8bbc87dD02C3109D2c74a6bCE4af1C8c';//
    ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',
    LAIR_ADDRESS: '0xf28164a485b0b2c90639e47b0f377b4a438a16b1',
    QUICK_ADDRESS: '0x831753DD7087CaC61aB5644b308642cc1c33Dc13',
    FACTORY_ADDRESS: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
    GOVERNANCE_ADDRESS: '0x5e4be8Bc9637f0EAA1A755019e06A68ce081D58F', //TODO: MATIC
    MERKLE_DISTRIBUTOR_ADDRESS: {
      // TODO: specify merkle distributor for mainnet
      [ChainId.MATIC]: '0x4087F566796b46eEB01A38174c06E2f9924eAea8', //TODO: MATIC
      [ChainId.MUMBAI]: undefined,
    },
    QUICK_CONVERSION: '0x333068d06563a8dfdbf330a0e04a9d128e98bf5a',
  },
  utils: {
    QUICK_CONVERSION_RATE: 1000,
    ONEDAYSECONDS: 60 * 60 * 24,
    DQUICKFEE: 0.04,
    DQUICKAPR_MULTIPLIER: 0.01,
    ROWSPERPAGE: 10,
    FEEPERCENT: 0.003,
    BUNDLE_ID: '1',
    PROPOSAL_LENGTH_IN_DAYS: 7, // TODO this is only approximate, it's actually based on blocks
    NetworkContextName: 'NETWORK',
    INITIAL_ALLOWED_SLIPPAGE: 50, // default allowed slippage, in bips
    DEFAULT_DEADLINE_FROM_NOW: 60 * 20, // 20 minutes, denominated in seconds
    BIG_INT_ZERO: JSBI.BigInt(0),
    ONE_BIPS: new Percent(JSBI.BigInt(1), JSBI.BigInt(10000)), // one basis point
    BIPS_BASE: JSBI.BigInt(10000),
    // used to ensure the user doesn't send so much ETH so they end up with <.01
    MIN_ETH: JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)), // .01 ETH
    BETTER_TRADE_LINK_THRESHOLD: new Percent(
      JSBI.BigInt(75),
      JSBI.BigInt(10000),
    ),
    // the Uniswap Default token list lives here
    DEFAULT_TOKEN_LIST_URL:
      'https://unpkg.com/quickswap-default-token-list@1.2.38/build/quickswap-default.tokenlist.json',
  },
  analyticChart: {
    ONE_MONTH_CHART: 1,
    THREE_MONTH_CHART: 2,
    SIX_MONTH_CHART: 3,
    ONE_YEAR_CHART: 4,
    ALL_CHART: 5,
    CHART_COUNT: 60, //limit analytics chart items not more than 60
  },
  farmIndex: {
    LPFARM_INDEX: 0,
    DUALFARM_INDEX: 1,
  },
  walletName: {
    METAMASK: 'Metamask',
    BLOCKWALLET: 'BlockWallet',
    BITKEEP: 'BitKeep',
    INJECTED: 'Injected',
    SAFE_APP: 'Gnosis Safe App',
    ARKANE_CONNECT: 'Venly',
    Portis: 'Portis',
    WALLET_LINK: 'Coinbase Wallet',
    WALLET_CONNECT: 'WalletConnect',
  },
};

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  METAMASK: {
    connector: injected,
    name: GlobalConst.walletName.METAMASK,
    iconName: MetamaskIcon,
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D',
  },
  BLOCKWALLET: {
    connector: injected,
    name: GlobalConst.walletName.BLOCKWALLET,
    iconName: BlockWalletIcon,
    description: 'BlockWallet browser extension.',
    href: null,
    color: '#1673ff',
  },
  BITKEEP: {
    connector: injected,
    name: GlobalConst.walletName.BITKEEP,
    iconName: BitKeepIcon,
    description: 'BitKeep browser extension.',
    href: null,
    color: '#E8831D',
  },
  INJECTED: {
    connector: injected,
    name: GlobalConst.walletName.INJECTED,
    iconName: 'arrow-right.svg',
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true,
  },
  SAFE_APP: {
    connector: safeApp,
    name: GlobalConst.walletName.SAFE_APP,
    iconName: GnosisIcon,
    description: 'Login using gnosis safe app',
    href: null,
    color: '#4196FC',
    mobile: true,
  },
  ARKANE_CONNECT: {
    connector: arkaneconnect,
    name: GlobalConst.walletName.ARKANE_CONNECT,
    iconName: VenlyIcon,
    description: 'Login using Venly hosted wallet.',
    href: null,
    color: '#4196FC',
  },
  Portis: {
    connector: portis,
    name: GlobalConst.walletName.Portis,
    iconName: PortisIcon,
    description: 'Login using Portis hosted wallet',
    href: null,
    color: '#4A6C9B',
    mobile: true,
  },
  WALLET_LINK: {
    connector: walletlink,
    name: GlobalConst.walletName.WALLET_LINK,
    iconName: CoinbaseWalletIcon,
    description: 'Use Coinbase Wallet app on mobile device',
    href: null,
    color: '#315CF5',
  },
  WALLET_CONNECT: {
    connector: walletconnect,
    name: GlobalConst.walletName.WALLET_CONNECT,
    iconName: WalletConnectIcon,
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
    href: null,
    color: '#4196FC',
    mobile: true,
  },
};

export const GlobalData = {
  bases: {
    // used to construct intermediary pairs for trading
    BASES_TO_CHECK_TRADES_AGAINST: {
      ...WETH_ONLY,
      [ChainId.MATIC]: [
        ...WETH_ONLY[ChainId.MATIC],
        returnTokenFromKey('USDC'),
        returnTokenFromKey('USDT'),
        returnTokenFromKey('QUICK'),
        returnTokenFromKey('ETHER'),
        returnTokenFromKey('WBTC'),
        returnTokenFromKey('DAI'),
        returnTokenFromKey('MAUSDC'),
        returnTokenFromKey('MI'),
        returnTokenFromKey('CXETH'),
        returnTokenFromKey('GHST'),
      ],
    },
    // Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these tokens.
    CUSTOM_BASES: { [ChainId.MATIC]: undefined, [ChainId.MUMBAI]: undefined },
    // used for display in the default list when adding liquidity
    SUGGESTED_BASES: {
      ...WETH_ONLY,
      [ChainId.MATIC]: [
        ...WETH_ONLY[ChainId.MATIC],
        returnTokenFromKey('DAI'),
        returnTokenFromKey('USDC'),
        returnTokenFromKey('USDT'),
        returnTokenFromKey('QUICK'),
        returnTokenFromKey('ETHER'),
        returnTokenFromKey('WBTC'),
        returnTokenFromKey('SAND'),
        returnTokenFromKey('MI'),
      ],
    },
    // used to construct the list of all pairs we consider by default in the frontend
    BASES_TO_TRACK_LIQUIDITY_FOR: {
      ...WETH_ONLY,
      [ChainId.MATIC]: [
        ...WETH_ONLY[ChainId.MATIC],
        returnTokenFromKey('DAI'),
        returnTokenFromKey('USDC'),
        returnTokenFromKey('USDT'),
        returnTokenFromKey('QUICK'),
        returnTokenFromKey('ETHER'),
        returnTokenFromKey('WBTC'),
      ],
    },
  },
  pairs: {
    PINNED_PAIRS: {
      [ChainId.MATIC]: [
        [returnTokenFromKey('USDC'), returnTokenFromKey('USDT')],
        [returnTokenFromKey('USDC'), returnTokenFromKey('DAI')],
        [returnTokenFromKey('ETHER'), returnTokenFromKey('USDC')],
        [returnTokenFromKey('WBTC'), returnTokenFromKey('ETHER')],
        [WETH[ChainId.MATIC], returnTokenFromKey('USDT')],
        [WETH[ChainId.MATIC], returnTokenFromKey('USDC')],
        [WETH[ChainId.MATIC], returnTokenFromKey('ETHER')],
        [returnTokenFromKey('ETHER'), returnTokenFromKey('QUICK')],
      ],
      [ChainId.MUMBAI]: undefined,
    },
  },
  analytics: {
    CHART_DURATIONS: [
      GlobalConst.analyticChart.ONE_MONTH_CHART,
      GlobalConst.analyticChart.THREE_MONTH_CHART,
      GlobalConst.analyticChart.SIX_MONTH_CHART,
      GlobalConst.analyticChart.ONE_YEAR_CHART,
      GlobalConst.analyticChart.ALL_CHART,
    ],
    CHART_DURATION_TEXTS: ['1M', '3M', '6M', '1Y', 'All'],
  },
};

export const GlobalValue = {
  percents: {
    ALLOWED_PRICE_IMPACT_LOW: new Percent( // used for warning states
      JSBI.BigInt(100),
      GlobalConst.utils.BIPS_BASE,
    ), // 1%
    ALLOWED_PRICE_IMPACT_MEDIUM: new Percent(
      JSBI.BigInt(300),
      GlobalConst.utils.BIPS_BASE,
    ), // 3%
    ALLOWED_PRICE_IMPACT_HIGH: new Percent(
      JSBI.BigInt(500),
      GlobalConst.utils.BIPS_BASE,
    ), // 5%
    PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: new Percent( // if the price slippage exceeds this number, force the user to type 'confirm' to execute
      JSBI.BigInt(1000),
      GlobalConst.utils.BIPS_BASE,
    ), // 10%
    BLOCKED_PRICE_IMPACT_NON_EXPERT: new Percent( // for non expert mode disable swaps above this
      JSBI.BigInt(1500),
      GlobalConst.utils.BIPS_BASE,
    ), // 15%
  },
  tokens: {
    MATIC: WETH[ChainId.MATIC],
    UNI: {
      [ChainId.MATIC]: new Token(
        ChainId.MATIC,
        GlobalConst.addresses.QUICK_ADDRESS,
        18,
        'QUICK',
        'Quickswap',
      ),
      [ChainId.MUMBAI]: new Token(
        ChainId.MUMBAI,
        GlobalConst.addresses.QUICK_ADDRESS,
        18,
        'QUICK',
        'Quickswap',
      ),
    },
  },
};

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[];
};

export interface WalletInfo {
  connector?: AbstractConnector;
  name: string;
  iconName: string;
  description: string;
  href: string | null;
  color: string;
  primary?: true;
  mobile?: true;
  mobileOnly?: true;
}
