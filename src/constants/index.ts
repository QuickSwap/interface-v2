import { ChainId, JSBI, Percent, WETH } from '@uniswap/sdk';
import { Presets } from 'state/mint/v3/reducer';
import {
  DAI,
  MI,
  USDC,
  USDT,
  axlUSDC,
  BOB,
  TUSD,
  UND,
  USDD,
  DAVOS,
  ETHER,
  WBTC,
  MATICX,
  STMATIC,
  ANKRMATIC,
  RMATIC,
  NEW_QUICK,
  NEW_DQUICK,
  WSTETH,
  FXCBETH,
  MATIC,
  EMPTY,
  WMATIC_EXTENDED,
  OLD_QUICK,
  OLD_DQUICK,
  CXETH,
  VERSA,
  SAND,
  MAUSDC,
  FRAX,
  GHST,
  CRV,
  FBX,
  WEFI,
  DC,
  DD,
  dDD,
  frxETH,
} from './v3/addresses';

export const AVERAGE_L1_BLOCK_TIME = 12000;

export const CHAIN_IDS_TO_NAMES = {
  [ChainId.MATIC]: 'matic',
  [ChainId.MUMBAI]: 'mumbai',
  [ChainId.DOGECHAIN]: 'dogechain',
  [ChainId.DOEGCHAIN_TESTNET]: 'dogechain_testnet',
  [ChainId.ZKEVM]: 'zkevm',
  [ChainId.ZKTESTNET]: 'zkevm_testnet',
};

export enum TxnType {
  SWAP,
  ADD,
  REMOVE,
}

export enum RouterTypes {
  QUICKSWAP = 'QUICKSWAP',
  SMART = 'SMART',
  BONUS = 'BONUS',
}

export enum SmartRouter {
  PARASWAP = 'PARASWAP',
  QUICKSWAP = 'QUICKSWAP',
}

export const WALLCHAIN_PARAMS = {
  [ChainId.MATIC]: {
    [SmartRouter.PARASWAP]: {
      apiURL: 'https://matic.wallchains.com/upgrade_txn/',
      apiKey: '91b92acd-e8fd-49c3-80fd-db2bc58bb8cf',
    },
    [SmartRouter.QUICKSWAP]: {
      apiURL: 'https://matic.wallchains.com/upgrade_txn/',
      apiKey: '50eaf751-196d-4fe0-9506-b983f7c83735',
    },
  },
  [ChainId.MUMBAI]: {
    [SmartRouter.PARASWAP]: {
      apiURL: '',
      apiKey: '',
    },
    [SmartRouter.QUICKSWAP]: {
      apiURL: '',
      apiKey: '',
    },
  },
  [ChainId.DOEGCHAIN_TESTNET]: {
    [SmartRouter.PARASWAP]: {
      apiURL: '',
      apiKey: '',
    },
    [SmartRouter.QUICKSWAP]: {
      apiURL: '',
      apiKey: '',
    },
  },
  [ChainId.DOGECHAIN]: {
    [SmartRouter.PARASWAP]: {
      apiURL: '',
      apiKey: '',
    },
    [SmartRouter.QUICKSWAP]: {
      apiURL: '',
      apiKey: '',
    },
  },
  [ChainId.ZKTESTNET]: {
    [SmartRouter.PARASWAP]: {
      apiURL: '',
      apiKey: '',
    },
    [SmartRouter.QUICKSWAP]: {
      apiURL: '',
      apiKey: '',
    },
  },
  [ChainId.ZKEVM]: {
    [SmartRouter.PARASWAP]: {
      apiURL: '',
      apiKey: '',
    },
    [SmartRouter.QUICKSWAP]: {
      apiURL: '',
      apiKey: '',
    },
  },
};

export const BONUS_CUTOFF_AMOUNT = {
  [ChainId.MUMBAI]: 0,
  [ChainId.MATIC]: 0,
  [ChainId.DOEGCHAIN_TESTNET]: 0,
  [ChainId.DOGECHAIN]: 0,
  [ChainId.ZKTESTNET]: 0,
  [ChainId.ZKEVM]: 0,
};

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
    ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',
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
    // we add '' to remove the possibility of nulls
    DEFAULT_ADS_LIST_URL: process.env.REACT_APP_ADS_LIST_DEFAULT_URL + '',
    DEFAULT_TOKEN_LIST_URL: process.env.REACT_APP_TOKEN_LIST_DEFAULT_URL + '',
    DEFAULT_LP_FARMS_LIST_URL:
      process.env.REACT_APP_STAKING_LIST_DEFAULT_URL + '',
    DEFAULT_CNT_FARMS_LIST_URL:
      process.env.REACT_APP_CNT_STAKING_LIST_DEFAULT_URL + '',
    DEFAULT_DUAL_FARMS_LIST_URL:
      process.env.REACT_APP_DUAL_STAKING_LIST_DEFAULT_URL + '',
    DEFAULT_SYRUP_LIST_URL: process.env.REACT_APP_SYRUP_LIST_DEFAULT_URL + '',
    ANALYTICS_TOKENS_COUNT: 200,
    ANALYTICS_PAIRS_COUNT: 400,
    v3FarmSortBy: {
      pool: '1',
      tvl: '2',
      rewards: '3',
      apr: '4',
    },
    v3FarmFilter: {
      allFarms: '0',
      stableCoin: '1',
      blueChip: '2',
      stableLP: '3',
      otherLP: '4',
    },
  },
  analyticChart: {
    ONE_MONTH_CHART: 1,
    THREE_MONTH_CHART: 2,
    SIX_MONTH_CHART: 3,
    ONE_YEAR_CHART: 4,
    ALL_CHART: 5,
    CHART_COUNT: 60, //limit analytics chart items not more than 60
  },
  v2FarmTab: {
    LPFARM: 'lpFarm',
    DUALFARM: 'DualFarm',
    OTHER_LP: 'OtherFarm',
  },
  v3LiquidityRangeType: {
    MANUAL_RANGE: '0',
    GAMMA_RANGE: '1',
  },
  walletName: {
    METAMASK: 'Metamask',
    TRUST_WALLET: 'TrustWallet',
    PHANTOM_WALLET: 'Phantom',
    CYPHERD: 'CypherD',
    BLOCKWALLET: 'BlockWallet',
    BRAVEWALLET: 'BraveWallet',
    BITKEEP: 'BitKeep',
    INJECTED: 'Injected',
    SAFE_APP: 'Gnosis Safe App',
    ARKANE_CONNECT: 'Venly',
    Portis: 'Portis',
    WALLET_LINK: 'Coinbase Wallet',
    WALLET_CONNECT: 'WalletConnect',
    ZENGO_CONNECT: 'ZenGo',
  },
};

export const SUPPORTED_CHAINIDS = [
  ChainId.MATIC,
  ChainId.MUMBAI,
  ChainId.DOGECHAIN,
  ChainId.DOEGCHAIN_TESTNET,
  ChainId.ZKTESTNET,
  ChainId.ZKEVM,
];

export interface GammaPair {
  address: string;
  title: string;
  type: Presets;
  token0Address: string;
  token1Address: string;
  ableToFarm?: boolean;
  pid?: number;
  masterChefIndex?: number;
}

export const GammaPairs: {
  [chainId in ChainId]: {
    [key: string]: GammaPair[];
  };
} = {
  [ChainId.MATIC]: {
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x02203f2351e7ac6ab5051205172d3f772db7d814',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 0,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x81cec323bf8c4164c66ec066f53cc053a535f03d',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 1,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0x2791bca1f2de4661ed88a30c99a7a9449aa84174': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x04d521e2c414e6d898c6f2599fdd863edf49e247',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        ableToFarm: true,
        pid: 2,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x4a83253e88e77e8d518638974530d0cbbbf3b675',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        ableToFarm: true,
        pid: 3,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x3cc20a6795c4b57d9817399f68e83e71c8626580',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 4,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x6077177d4c41e114780d9901c9b5c784841c523f',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 5,
      },
    ],
    '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6-0x2791bca1f2de4661ed88a30c99a7a9449aa84174': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x3f35705479d9d77c619b2aac9dd7a64e57151506',
        token0Address: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
        token1Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        ableToFarm: true,
        pid: 6,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xe40a5aa22cbccc8165aedd86f6d03fc5f551c3c6',
        token0Address: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
        token1Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        ableToFarm: true,
        pid: 7,
      },
    ],
    '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6-0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x4b9e26a02121a1c541403a611b542965bd4b68ce',
        token0Address: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 8,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xadc7b4096c3059ec578585df36e6e1286d345367',
        token0Address: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 9,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0x8f3cf7ad23cd3cadbd9735aff958023239c6a063': [
      {
        type: Presets.GAMMA_STABLE,
        title: 'Stable',
        address: '0x9e31214db6931727b7d63a0d2b6236db455c0965',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
        ableToFarm: true,
        pid: 10,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0xc2132d05d31c914a87c6611c10748aeb04b58e8f': [
      {
        type: Presets.GAMMA_STABLE,
        title: 'Stable',
        address: '0x795f8c9b0a0da9cd8dea65fc10f9b57abc532e58',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        ableToFarm: true,
        pid: 11,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0xb5c064f955d8e7f38fe0460c556a72987494ee17': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x7f09bd2801a7b795df29c273c4afbb0ff15e2d63',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xb5c064f955d8e7f38fe0460c556a72987494ee17',
        ableToFarm: true,
        pid: 12,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x543403307bc9f9ec46fd9bc1048b263c9692a26a',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xb5c064f955d8e7f38fe0460c556a72987494ee17',
        ableToFarm: true,
        pid: 13,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0xfa68fb4628dff1028cfec22b4162fccd0d45efb6': [
      {
        type: Presets.GAMMA_DYNAMIC,
        title: 'Pegged Price',
        address: '0x8dd3bf71ef18dd88869d128bde058c9d8c270176',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xfa68fb4628dff1028cfec22b4162fccd0d45efb6',
        ableToFarm: true,
        pid: 14,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4': [
      {
        type: Presets.GAMMA_DYNAMIC,
        title: 'Pegged Price',
        address: '0xccbcaf47e87f50a338fac9bf58e567ed1c87be2b',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4',
        ableToFarm: true,
        pid: 15,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0xc2132d05d31c914a87c6611c10748aeb04b58e8f': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x598cA33b7F5FAB560ddC8E76D94A4b4AA52566d7',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        ableToFarm: true,
        pid: 16,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x9134f456D33d1288de26271730047AE0c5CB6F71',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        ableToFarm: true,
        pid: 17,
      },
    ],
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619-0xa3fa99a148fa48d14ed51d610c367c61876997f1': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0xac15baba7bcc532f8727c1a42b23501f59630115',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        pid: 18,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xccbbb572eb5edc973a90fdc57d07d7740bb027f5',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        pid: 19,
      },
    ],
    '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6-0xa3fa99a148fa48d14ed51d610c367c61876997f1': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x3e99b86b16f36dcf3b987ebc8b754c54030403b5',
        token0Address: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
        token1Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        pid: 20,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x5ec3511b49d4fe7798015a26a83abdc01261615b',
        token0Address: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
        token1Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        pid: 21,
      },
    ],
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619-0xb5c064f955d8e7f38fe0460c556a72987494ee17': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0xf86d6151d03007b1906465b63e36d6f48136bc39',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0xb5c064f955d8e7f38fe0460c556a72987494ee17',
        ableToFarm: true,
        pid: 22,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x454Ff7780A9A99Ecb3462ab61bA06fe4A886862E',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0xb5c064f955d8e7f38fe0460c556a72987494ee17',
        ableToFarm: true,
        pid: 23,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0xb5c064f955d8e7f38fe0460c556a72987494ee17': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0xa1c3e15b3307b04067e843d3bfaf3cead5b51cb7',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0xb5c064f955d8e7f38fe0460c556a72987494ee17',
        ableToFarm: true,
        pid: 24,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x4f7e090fe185aac68fc58e7fa1b9d4314d357327',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0xb5c064f955d8e7f38fe0460c556a72987494ee17',
        ableToFarm: true,
        pid: 25,
      },
    ],
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619-0xc2132d05d31c914a87c6611c10748aeb04b58e8f': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x5928f9f61902b139e1c40cba59077516734ff09f',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        ableToFarm: true,
        pid: 26,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x3672d301778750c41a7864980a5ddbc2af99476e',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        ableToFarm: true,
        pid: 27,
      },
    ],
    '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063-0xe5417af564e4bfda1c483642db72007871397896': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x7ae7fb44c92b4d41abb6e28494f46a2eb3c2a690',
        token0Address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
        token1Address: '0xe5417af564e4bfda1c483642db72007871397896',
        ableToFarm: true,
        pid: 28,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xfd73ce19d3842ad7b551bb184ac6c6256dc2c9ab',
        token0Address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
        token1Address: '0xe5417af564e4bfda1c483642db72007871397896',
        pid: 29,
      },
    ],
    '0xa3fa99a148fa48d14ed51d610c367c61876997f1-0xe5417af564e4bfda1c483642db72007871397896': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x1c1b4cf2a40810c49a8b42a9da857cb0b76d06e3',
        token0Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        token1Address: '0xe5417af564e4bfda1c483642db72007871397896',
        pid: 30,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x46840e073376178b1e669693c021329b17fb22aa',
        token0Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        token1Address: '0xe5417af564e4bfda1c483642db72007871397896',
        pid: 31,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0xa3fa99a148fa48d14ed51d610c367c61876997f1': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x14223bb48c8cf3ef49319be44a6e718e4dbf9486',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        pid: 32,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x69b2aaaf08ac9b04cd5b64a1d23ffcb40224fdaf',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        pid: 33,
      },
    ],
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619-0x8f3cf7ad23cd3cadbd9735aff958023239c6a063': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x683292172e2175bd08e3927a5e72fc301b161300',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
        pid: 34,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x3ae59be14da16183f0a36e23518506c386e63a96',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
        pid: 35,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0xd0258a3fd00f38aa8090dfee343f10a9d4d30d3f': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0xfe4bb996926aca85c9747bbec886ec2a3f510c66',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xd0258a3fd00f38aa8090dfee343f10a9d4d30d3f',
        pid: 36,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x2e18b825b049c4994370b0db6c35d0100295b96c',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xd0258a3fd00f38aa8090dfee343f10a9d4d30d3f',
        pid: 37,
      },
    ],
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619-0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x2c53dfa65370b2d70975e40172b63210d477e470',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b',
        ableToFarm: true,
        pid: 38,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xcfd4a6a885c4404a2a5720918a9b4880600876a8',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b',
        ableToFarm: true,
        pid: 39,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x05c731f5f922835796c49412a30615c46cca4d9e',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b',
        pid: 40,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x9a4b458a5ae5d96565455d1e1882301fea5c076f',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b',
        pid: 41,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0xd0258a3fd00f38aa8090dfee343f10a9d4d30d3f': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0xf6bE87Ae8976f50DCd231d42580e430CF6133400',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0xd0258a3fd00f38aa8090dfee343f10a9d4d30d3f',
        pid: 42,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xee2a89071654333703b3d6c9be9ab8f085f977de',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0xd0258a3fd00f38aa8090dfee343f10a9d4d30d3f',
        pid: 43,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0xe5417af564e4bfda1c483642db72007871397896': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x688cb9492bd2c72016f1765d813b2d713aa1f4c7',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xe5417af564e4bfda1c483642db72007871397896',
        ableToFarm: true,
        pid: 44,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x566452e9d621a1902f9ccf2adaf029cf0f36ec67',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xe5417af564e4bfda1c483642db72007871397896',
        pid: 45,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0xbbba073c31bf03b8acf7c28ef0738decf3695683': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0xef4f95d8c252d64308c04f711fb31892cc4c9965',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xbbba073c31bf03b8acf7c28ef0738decf3695683',
        ableToFarm: true,
        pid: 46,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x62f88fb208df717b035325d065c6919d7913b937',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xbbba073c31bf03b8acf7c28ef0738decf3695683',
        pid: 47,
      },
    ],
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619-0xc5102fe9359fd9a28f877a67e36b0f050d81a3cc': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x706bae8828c260d5e52ccfa96f1258a2d2f6fdda',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0xc5102fe9359fd9a28f877a67e36b0f050d81a3cc',
        pid: 48,
      },
    ],
    '0xa3fa99a148fa48d14ed51d610c367c61876997f1-0xc2132d05d31c914a87c6611c10748aeb04b58e8f': [
      {
        type: Presets.GAMMA_STABLE,
        title: 'Stable',
        address: '0x1825c76ced3c1625250b8af6204bf4fc4e5b9fcf',
        token0Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        token1Address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        ableToFarm: true,
        pid: 49,
      },
    ],
    '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063-0xa3fa99a148fa48d14ed51d610c367c61876997f1': [
      {
        type: Presets.GAMMA_STABLE,
        title: 'Stable',
        address: '0x3273c153ecc6891a68af60ee0b67c16dd7b2c7e5',
        token0Address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
        token1Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        ableToFarm: true,
        pid: 50,
      },
    ],
    '0xa3fa99a148fa48d14ed51d610c367c61876997f1-0xb5c064f955d8e7f38fe0460c556a72987494ee17': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x0f7e4c66cebb5f5cabd435684946585a917b2f65',
        token0Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        token1Address: '0xb5c064f955d8e7f38fe0460c556a72987494ee17',
        pid: 51,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x535206aaeca58c038ef28ce9924c7782bbb3d94d',
        token0Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        token1Address: '0xb5c064f955d8e7f38fe0460c556a72987494ee17',
        pid: 52,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b': [
      {
        type: Presets.GAMMA_STABLE,
        title: 'Stable',
        address: '0x33b0b883626c21ce5b3aad202bc435f876aee2c4',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b',
        ableToFarm: true,
        pid: 53,
      },
    ],
    '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4-0xfa68fb4628dff1028cfec22b4162fccd0d45efb6': [
      {
        type: Presets.STABLE,
        title: 'Stable',
        address: '0xe503c1dfd7012e72af4c415f4c5e8abf5b45c25f',
        token0Address: '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4',
        token1Address: '0xfa68fb4628dff1028cfec22b4162fccd0d45efb6',
        pid: 54,
      },
    ],
    '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063-0xc2132d05d31c914a87c6611c10748aeb04b58e8f': [
      {
        type: Presets.STABLE,
        title: 'Stable',
        address: '0x45a3a657b834699f5cc902e796c547f826703b79',
        token0Address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
        token1Address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        ableToFarm: true,
        pid: 55,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x3fb73a554defa86b18f72e543aa2174a4d5f9621',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7',
        ableToFarm: true,
        pid: 56,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x2ef46196d7d25b5111ca1fcba206b248fee32d8d',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7',
        ableToFarm: true,
        pid: 57,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0x0e9b89007eee9c958c0eda24ef70723c2c93dd58': [
      {
        type: Presets.GAMMA_DYNAMIC,
        title: 'Pegged Price',
        address: '0x8557dac2a7724712f12952de3dabeef54459bd97',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0x0e9b89007eee9c958c0eda24ef70723c2c93dd58',
        pid: 58,
      },
    ],
    '0x03b54a6e9a984069379fae1a4fc4dbae93b3bccd-0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': [
      {
        type: Presets.GAMMA_DYNAMIC,
        title: 'Pegged Price',
        address: '0x6a6d4d17c2e38d076264081676ffcdddf32c9715',
        token0Address: '0x03b54a6e9a984069379fae1a4fc4dbae93b3bccd',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 59,
      },
    ],
    '0x03b54a6e9a984069379fae1a4fc4dbae93b3bccd-0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x972a53e2ee68d5c2b1614f65061815e06b1cce68',
        token0Address: '0x03b54a6e9a984069379fae1a4fc4dbae93b3bccd',
        token1Address: '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4',
        pid: 60,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0x750e4c4984a9e0f12978ea6742bc1c5d248f40ed': [
      {
        type: Presets.GAMMA_STABLE,
        title: 'Stable',
        address: '0x374c44443553d7eb86b5f77597cc67a507b19179',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0x750e4c4984a9e0f12978ea6742bc1c5d248f40ed',
        ableToFarm: true,
        pid: 61,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0x67eb41a14c0fe5cd701fc9d5a3d6597a72f641a6': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x1ddae2e33c1d68211c5eae05948fd298e72c541a',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0x67eb41a14c0fe5cd701fc9d5a3d6597a72f641a6',
        ableToFarm: true,
        pid: 0,
        masterChefIndex: 1,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0x172370d5cd63279efa6d502dab29171933a610af': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x33eeafa7ef22cd4468d65819b2fe30f170db5b69',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0x172370d5cd63279efa6d502dab29171933a610af',
        ableToFarm: true,
        pid: 63,
      },
    ],
    '0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39-0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x3da7e0320c04d88b71e0ada960aad3d21f10cadf',
        token0Address: '0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 64,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0x8f3cf7ad23cd3cadbd9735aff958023239c6a063': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x5f528db1129488083434e1b96e9808e3c4c6ed83',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
        pid: 65,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0xec38621e72d86775a89c7422746de1f52bba5320': [
      {
        type: Presets.GAMMA_STABLE,
        title: 'Stable',
        address: '0x2385cb5590413b2cd1fae63e68886b9f2ce43a9a',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0xec38621e72d86775a89c7422746de1f52bba5320',
        ableToFarm: true,
        pid: 66,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0xc2a45fe7d40bcac8369371b08419ddafd3131b4a': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xc89004ce7becd2b39c44260327a603885da119b5',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xc2a45fe7d40bcac8369371b08419ddafd3131b4a',
        ableToFarm: true,
        pid: 67,
      },
    ],
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619-0xd125443f38a69d776177c2b9c041f462936f8218': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x9c3e0445559e6de1fe6391e8e018dca02b480836',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0xd125443f38a69d776177c2b9c041f462936f8218',
        ableToFarm: true,
        pid: 68,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0xfea715ab7e1de3640cd0662f6af0f9b25934e753',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4',
        ableToFarm: true,
        pid: 69,
      },
    ],
    '0x03b54a6e9a984069379fae1a4fc4dbae93b3bccd-0x2791bca1f2de4661ed88a30c99a7a9449aa84174': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x34ffbd9db6b9bd8b095a0d156de69a2ad2944666',
        token0Address: '0x03b54a6e9a984069379fae1a4fc4dbae93b3bccd',
        token1Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        ableToFarm: true,
        pid: 70,
      },
    ],
    '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4-0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x9dfdf32ae82c7e8ebc156ea28e6637b120e00d12',
        token0Address: '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 71,
      },
    ],
    '0x03b54a6e9a984069379fae1a4fc4dbae93b3bccd-0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x9f19ad14cd941e29b0e7ed8f5a1003fae4993dcd',
        token0Address: '0x03b54a6e9a984069379fae1a4fc4dbae93b3bccd',
        token1Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        ableToFarm: true,
        pid: 72,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0xfa68fb4628dff1028cfec22b4162fccd0d45efb6': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x49dcc56354a5a4875fb5d8bd7e7073c4f8868618',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0xfa68fb4628dff1028cfec22b4162fccd0d45efb6',
        ableToFarm: true,
        pid: 73,
      },
    ],
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619-0xfa68fb4628dff1028cfec22b4162fccd0d45efb6': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0xc6dd68b546d696d5a31837b05065a151d6b6f892',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0xfa68fb4628dff1028cfec22b4162fccd0d45efb6',
        ableToFarm: true,
        pid: 74,
      },
    ],
    '0x0c9c7712c83b3c70e7c5e11100d33d9401bdf9dd-0x2791bca1f2de4661ed88a30c99a7a9449aa84174': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x8Bb9247c8eFf487F7A13AB7E704F50904e91430D',
        token0Address: '0x0c9c7712c83b3c70e7c5e11100d33d9401bdf9dd',
        token1Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        ableToFarm: true,
        pid: 75,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0x6e4e624106cb12e168e6533f8ec7c82263358940': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x550fac19d0ff06725dcaf7721b2c97aba268e11f',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0x6e4e624106cb12e168e6533f8ec7c82263358940',
        ableToFarm: true,
        pid: 76,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0x9f28e2455f9ffcfac9ebd6084853417362bc5dbb': [
      {
        type: Presets.GAMMA_DYNAMIC,
        title: 'Pegged Price',
        address: '0x8089f11dadbabf175aea2415194a6a3a0575539d',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0x9f28e2455f9ffcfac9ebd6084853417362bc5dbb',
        ableToFarm: true,
        pid: 77,
      },
    ],
    '0x4b4327db1600b8b1440163f667e199cef35385f5-0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': [
      {
        type: Presets.GAMMA_DYNAMIC,
        title: 'Pegged Price',
        address: '0x0668331b4606beb78a1c8314e08d8b07653fbd3c',
        token0Address: '0x4b4327db1600b8b1440163f667e199cef35385f5',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 78,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0xffa188493c15dfaf2c206c97d8633377847b6a52': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xc491c1b173e932e97d9f739ccd9ae5b6d5fce4ce',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0xffa188493c15dfaf2c206c97d8633377847b6a52',
        pid: 80,
      },
    ],
    '0x67eb41a14c0fe5cd701fc9d5a3d6597a72f641a6-0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x2d08b4b4c74d0b2f4144ae7bd86ee40fb654acef',
        token0Address: '0x67eb41a14c0fe5cd701fc9d5a3d6597a72f641a6',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        pid: 1,
        masterChefIndex: 1,
      },
    ],
    '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6-0x67eb41a14c0fe5cd701fc9d5a3d6597a72f641a6': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xcbb7fae80e4f5c0cbfe1af7bb1f19692f9532cfa',
        token0Address: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
        token1Address: '0x67eb41a14c0fe5cd701fc9d5a3d6597a72f641a6',
        pid: 2,
        masterChefIndex: 1,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0xa3fa99a148fa48d14ed51d610c367c61876997f1': [
      {
        type: Presets.GAMMA_STABLE,
        title: 'Stable',
        address: '0x25B186eEd64ca5FDD1bc33fc4CFfd6d34069BAec',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        pid: 81,
        ableToFarm: true,
      },
    ],
    '0x236aa50979d5f3de3bd1eeb40e81137f22ab794b-0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0xadfc52d48d68b235b6b9453ef5130fc6dfd2513e',
        token0Address: '0x236aa50979d5f3de3bd1eeb40e81137f22ab794b',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 82,
      },
    ],
  },
  [ChainId.MUMBAI]: {},
  [ChainId.DOEGCHAIN_TESTNET]: {},
  [ChainId.DOGECHAIN]: {},
  [ChainId.ZKTESTNET]: {},
  [ChainId.ZKEVM]: {
    '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9-0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x04c6b11e1ffe1f1032bd62adb343c9d07767489c',
        token0Address: '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9',
        token1Address: '0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035',
        ableToFarm: true,
        pid: 0,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xfb3a24c0f289e695ceb87b32fc18a2b8bd896167',
        token0Address: '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9',
        token1Address: '0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035',
        ableToFarm: true,
        pid: 1,
      },
    ],
    '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9-0xa2036f0538221a77a3937f1379699f44945018d0': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x2f39293c9ed046822c014143fb18d5ae0479be93',
        token0Address: '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9',
        token1Address: '0xa2036f0538221a77a3937f1379699f44945018d0',
        ableToFarm: true,
        pid: 2,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x5ada298913d53aa823824de69b4a6e790aed9327',
        token0Address: '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9',
        token1Address: '0xa2036f0538221a77a3937f1379699f44945018d0',
        ableToFarm: true,
        pid: 3,
      },
    ],
    '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9-0xea034fb02eb1808c2cc3adbc15f447b93cbe08e1': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x1cc4ee0cb063e9db36e51f5d67218ff1f8dbfa0f',
        token0Address: '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9',
        token1Address: '0xea034fb02eb1808c2cc3adbc15f447b93cbe08e1',
        ableToFarm: true,
        pid: 4,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x64e78e990b2a45fad8b64b43e62a67d69a156042',
        token0Address: '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9',
        token1Address: '0xea034fb02eb1808c2cc3adbc15f447b93cbe08e1',
        ableToFarm: true,
        pid: 5,
      },
    ],
    '0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035-0xea034fb02eb1808c2cc3adbc15f447b93cbe08e1': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x9783c45564232c0aff8dc550a9c247c42e8c8b98',
        token0Address: '0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035',
        token1Address: '0xea034fb02eb1808c2cc3adbc15f447b93cbe08e1',
        ableToFarm: true,
        pid: 6,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x83de646a7125ac04950fea7e322481d4be66c71d',
        token0Address: '0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035',
        token1Address: '0xea034fb02eb1808c2cc3adbc15f447b93cbe08e1',
        ableToFarm: true,
        pid: 7,
      },
    ],
    '0x1e4a5963abfd975d8c9021ce480b42188849d41d-0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035': [
      {
        type: Presets.GAMMA_STABLE,
        title: 'Stable',
        address: '0x145d55aE4848f9782eFCAC785A655E3e5DcE1bCD',
        token0Address: '0x1e4a5963abfd975d8c9021ce480b42188849d41d',
        token1Address: '0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035',
        ableToFarm: true,
        pid: 8,
      },
    ],
    '0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035-0xc5015b9d9161dca7e18e32f6f25c4ad850731fd4': [
      {
        type: Presets.GAMMA_STABLE,
        title: 'Stable',
        address: '0xafad6e114cfbc8a19e91b8d7d04da740a7698595',
        token0Address: '0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035',
        token1Address: '0xc5015b9d9161dca7e18e32f6f25c4ad850731fd4',
        ableToFarm: true,
        pid: 9,
      },
    ],
    '0x1e4a5963abfd975d8c9021ce480b42188849d41d-0xc5015b9d9161dca7e18e32f6f25c4ad850731fd4': [
      {
        type: Presets.GAMMA_STABLE,
        title: 'Stable',
        address: '0xcd36b8a47a072e3e05e894b6ec89d294bec3d3ed',
        token0Address: '0x1e4a5963abfd975d8c9021ce480b42188849d41d',
        token1Address: '0xc5015b9d9161dca7e18e32f6f25c4ad850731fd4',
        ableToFarm: true,
        pid: 10,
      },
    ],
    '0x83b874c1e09d316059d929da402dcb1a98e92082-0xa2036f0538221a77a3937f1379699f44945018d0': [
      {
        type: Presets.GAMMA_DYNAMIC,
        title: 'Pegged Price',
        address: '0x9616052273a598bc04bd1ad7f7a753157c24f77e',
        token0Address: '0x83b874c1e09d316059d929da402dcb1a98e92082',
        token1Address: '0xa2036f0538221a77a3937f1379699f44945018d0',
        ableToFarm: true,
        pid: 11,
      },
    ],
    '0xa2036f0538221a77a3937f1379699f44945018d0-0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x19f4ebc0a1744b93a355c2320899276ae7f79ee5',
        token0Address: '0xa2036f0538221a77a3937f1379699f44945018d0',
        token1Address: '0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035',
        ableToFarm: true,
        pid: 12,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x8462e4173d63f8769f94bf7ae5bc1ac7ab5d96e3',
        token0Address: '0xa2036f0538221a77a3937f1379699f44945018d0',
        token1Address: '0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035',
        ableToFarm: true,
        pid: 13,
      },
    ],
    '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9-0x68286607a1d43602d880d349187c3c48c0fd05e6': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x686cfe074dd4ac97cac25f37552178b422041a1a',
        token0Address: '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9',
        token1Address: '0x68286607a1d43602d880d349187c3c48c0fd05e6',
        ableToFarm: true,
        pid: 14,
      },
    ],
    '0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035-0xff8544fed5379d9ffa8d47a74ce6b91e632ac44d': [
      {
        type: Presets.GAMMA_STABLE,
        title: 'Stable',
        address: '0x5158a66cA7181CbDca98491D3182cd4b8b3f8A2F',
        token0Address: '0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035',
        token1Address: '0xff8544fed5379d9ffa8d47a74ce6b91e632ac44d',
        ableToFarm: true,
        pid: 15,
      },
    ],
    '0xcf7ecee185f19e2e970a301ee37f93536ed66179-0xff8544fed5379d9ffa8d47a74ce6b91e632ac44d': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xe8A6565e7f395f551Fe3F98Bd674a922cB552524',
        token0Address: '0xcf7ecee185f19e2e970a301ee37f93536ed66179',
        token1Address: '0xff8544fed5379d9ffa8d47a74ce6b91e632ac44d',
        ableToFarm: true,
        pid: 16,
      },
    ],
    '0x68286607a1d43602d880d349187c3c48c0fd05e6-0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x317a0d8d2a247004370fe4fb9362b2b256d890c0',
        token0Address: '0x68286607a1d43602d880d349187c3c48c0fd05e6',
        token1Address: '0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035',
        ableToFarm: true,
        pid: 17,
      },
    ],
    '0x1e4a5963abfd975d8c9021ce480b42188849d41d-0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0xB5F43c2206e3cAFEcd62651F5FcE9091A0207488',
        token0Address: '0x1e4a5963abfd975d8c9021ce480b42188849d41d',
        token1Address: '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9',
        ableToFarm: true,
        pid: 18,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xA163C591B04242121A2aC9753A8526F63D576F9A',
        token0Address: '0x1e4a5963abfd975d8c9021ce480b42188849d41d',
        token1Address: '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9',
        ableToFarm: true,
        pid: 19,
      },
    ],
    '0x1e4a5963abfd975d8c9021ce480b42188849d41d-0xa2036f0538221a77a3937f1379699f44945018d0': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x1E97925c365cd96D74Ec55A04569915c4D65e5e0',
        token0Address: '0x1e4a5963abfd975d8c9021ce480b42188849d41d',
        token1Address: '0xa2036f0538221a77a3937f1379699f44945018d0',
        ableToFarm: true,
        pid: 20,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xd582226B586Ab06f3Bf9353f0F2B8618a3544719',
        token0Address: '0x1e4a5963abfd975d8c9021ce480b42188849d41d',
        token1Address: '0xa2036f0538221a77a3937f1379699f44945018d0',
        ableToFarm: true,
        pid: 21,
      },
    ],
    '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9-0xcf7ecee185f19e2e970a301ee37f93536ed66179': [
      {
        type: Presets.GAMMA_DYNAMIC,
        title: 'Pegged Price',
        address: '0x911bfbaca43f117e52197ae62d439d6a645c8886',
        token0Address: '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9',
        token1Address: '0xcf7ecee185f19e2e970a301ee37f93536ed66179',
        ableToFarm: true,
        pid: 22,
      },
    ],
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
    COMMON: {
      [ChainId.MATIC]: [
        EMPTY[ChainId.MATIC],
        USDC[ChainId.MATIC],
        USDT[ChainId.MATIC],
        OLD_QUICK[ChainId.MATIC],
        NEW_QUICK[ChainId.MATIC],
        OLD_DQUICK[ChainId.MATIC],
        NEW_DQUICK[ChainId.MATIC],
        WBTC[ChainId.MATIC],
        DAI[ChainId.MATIC],
        ETHER[ChainId.MATIC],
        MI[ChainId.MATIC],
        axlUSDC[ChainId.MATIC],
        TUSD[ChainId.MATIC],
        UND[ChainId.MATIC],
        USDD[ChainId.MATIC],
        CXETH[ChainId.MATIC],
        VERSA[ChainId.MATIC],
        SAND[ChainId.MATIC],
        MAUSDC[ChainId.MATIC],
        FRAX[ChainId.MATIC],
        GHST[ChainId.MATIC],
        MATICX[ChainId.MATIC],
        STMATIC[ChainId.MATIC],
        WSTETH[ChainId.MATIC],
        ANKRMATIC[ChainId.MATIC],
        CRV[ChainId.MATIC],
        DAVOS[ChainId.MATIC],
        FBX[ChainId.MATIC],
        FXCBETH[ChainId.MATIC],
        RMATIC[ChainId.MATIC],
        WEFI[ChainId.MATIC],
      ],
      [ChainId.DOGECHAIN]: [
        EMPTY[ChainId.DOGECHAIN],
        USDC[ChainId.DOGECHAIN],
        USDT[ChainId.DOGECHAIN],
        WBTC[ChainId.DOGECHAIN],
        DAI[ChainId.DOGECHAIN],
        ETHER[ChainId.DOGECHAIN],
        MATIC[ChainId.DOGECHAIN],
        MI[ChainId.DOGECHAIN],
        DC[ChainId.DOGECHAIN],
        DD[ChainId.DOGECHAIN],
        dDD[ChainId.DOGECHAIN],
      ],
      [ChainId.ZKEVM]: [
        EMPTY[ChainId.ZKEVM],
        USDC[ChainId.ZKEVM],
        USDT[ChainId.ZKEVM],
        WBTC[ChainId.ZKEVM],
        DAI[ChainId.ZKEVM],
        MATIC[ChainId.ZKEVM],
      ],
      [ChainId.MUMBAI]: [],
      [ChainId.DOEGCHAIN_TESTNET]: [],
      [ChainId.ZKTESTNET]: [],
    },
  },
  marketSDK: {
    BLOCKSPERDAY: 0.5 * GlobalConst.utils.ONEDAYSECONDS,
  },
};

export const paraswapTax: { [key: string]: number } = {
  '0xed88227296943857409a8e0f15ad7134e70d0f73': 100,
  '0x37eb60f78e06c4bb2a5f836b0fc6bccbbaa995b3': 0,
  '0xf16ec50ec49abc95fa793c7871682833b6bc47e7': 1300,
  '0xfca466f2fa8e667a517c9c6cfa99cf985be5d9b1': 300,
};

export const GlobalData = {
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
  stableCoins: {
    [ChainId.MATIC]: [
      USDC[ChainId.MATIC],
      USDT[ChainId.MATIC],
      MI[ChainId.MATIC],
      DAI[ChainId.MATIC],
      axlUSDC[ChainId.MATIC],
      BOB[ChainId.MATIC],
      TUSD[ChainId.MATIC],
      UND[ChainId.MATIC],
      USDD[ChainId.MATIC],
      DAVOS[ChainId.MATIC],
    ],
    [ChainId.MUMBAI]: [],
    [ChainId.DOGECHAIN]: [USDC[ChainId.DOGECHAIN], MI[ChainId.DOGECHAIN]],
    [ChainId.DOEGCHAIN_TESTNET]: [],
    [ChainId.ZKEVM]: [
      USDC[ChainId.ZKEVM],
      DAI[ChainId.ZKEVM],
      USDT[ChainId.ZKEVM],
      FRAX[ChainId.ZKEVM],
    ],
    [ChainId.ZKTESTNET]: [],
  },
  blueChips: {
    [ChainId.MATIC]: [
      WETH[ChainId.MATIC],
      ETHER[ChainId.MATIC],
      WBTC[ChainId.MATIC],
      USDC[ChainId.MATIC],
      USDT[ChainId.MATIC],
      DAI[ChainId.MATIC],
    ],
    [ChainId.MUMBAI]: [],
    [ChainId.DOGECHAIN]: [
      WETH[ChainId.DOGECHAIN],
      ETHER[ChainId.DOGECHAIN],
      MATIC[ChainId.DOGECHAIN],
      USDC[ChainId.DOGECHAIN],
    ],
    [ChainId.DOEGCHAIN_TESTNET]: [],
    [ChainId.ZKEVM]: [
      WETH[ChainId.ZKEVM],
      MATIC[ChainId.ZKEVM],
      WBTC[ChainId.ZKEVM],
      USDC[ChainId.ZKEVM],
      USDT[ChainId.ZKEVM],
      DAI[ChainId.ZKEVM],
    ],
    [ChainId.ZKTESTNET]: [],
  },
  stablePairs: {
    [ChainId.MATIC]: [
      [
        GlobalValue.tokens.MATIC,
        MATICX[ChainId.MATIC],
        STMATIC[ChainId.MATIC],
        ANKRMATIC[ChainId.MATIC],
        RMATIC[ChainId.MATIC],
      ],
      [NEW_QUICK[ChainId.MATIC], NEW_DQUICK[ChainId.MATIC]],
      [ETHER[ChainId.MATIC], WSTETH[ChainId.MATIC], FXCBETH[ChainId.MATIC]],
    ],
    [ChainId.MUMBAI]: [],
    [ChainId.DOGECHAIN]: [],
    [ChainId.DOEGCHAIN_TESTNET]: [],
    [ChainId.ZKEVM]: [
      [MATIC[ChainId.ZKEVM], STMATIC[ChainId.ZKEVM]],
      [frxETH[ChainId.ZKEVM], WETH[ChainId.ZKEVM]],
    ],
    [ChainId.ZKTESTNET]: [],
  },
};

export const ContestPairs: any = {
  [ChainId.MATIC]: [
    {
      name: 'All',
      address: 'all',
    },
    {
      name: 'WETH / USDC',
      address: '0x55caabb0d2b704fd0ef8192a7e35d8837e678207',
      token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
      token1Address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    },
    {
      name: 'WMATIC / USDC',
      address: '0xae81fac689a1b4b1e06e7ef4a2ab4cd8ac0a087d',
      token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
      token1Address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    },
    {
      name: 'WMATIC / USDT',
      address: '0x5b41eedcfc8e0ae47493d4945aa1ae4fe05430ff',
      token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
      token1Address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    },
    {
      name: 'WMATIC / WETH',
      address: '0x479e1b71a702a595e19b6d5932cd5c863ab57ee0',
      token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
      token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
    },
  ],
  [ChainId.ZKEVM]: [
    {
      name: 'All',
      address: 'all',
    },
    {
      name: 'WETH_USDC',
      address: '0xc44ad482f24fd750caeba387d2726d8653f8c4bb',
      token0Address: '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9',
      token1Address: '0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035',
    },
    {
      name: 'USDT_USDC',
      address: '0x9591b8a30c3a52256ea93e98da49ee43afa136a8',
      token0Address: '0x1e4a5963abfd975d8c9021ce480b42188849d41d',
      token1Address: '0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035',
    },
    {
      name: 'WMATIC_USDC',
      address: '0xc9853f9f29cdd15ece6965e20ca288a2946c15e6',
      token0Address: '0xa2036f0538221a77a3937f1379699f44945018d0',
      token1Address: '0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035',
    },
    {
      name: 'WMATIC_WETH',
      address: '0xb73abfb5a2c89f4038baa476ff3a7942a021c196',
      token0Address: '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9',
      token1Address: '0xa2036f0538221a77a3937f1379699f44945018d0',
    },
  ],
  [ChainId.DOEGCHAIN_TESTNET]: [],
  [ChainId.DOGECHAIN]: [],
  [ChainId.ZKTESTNET]: [],
  [ChainId.MUMBAI]: [],
};

export const LeaderBoardAnalytics = {
  CHART_DURATIONS: [1, 7, 30],
  CHART_DURATION_TEXTS: ['24H', '7D', '30D'],
};
