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
  PUSH,
  LINK,
  AAVE,
  USDCE,
  fxMETOD,
  PKR,
  SLING,
  NINJAZ,
  RNDR,
  USDV,
  NFTE,
  CRS,
  EURO3,
  DAIE,
  SD,
  ABOND,
  DSRUN,
  VDA,
} from './v3/addresses';
import { FeeAmount } from 'v3lib/utils';
import { BondToken } from 'types/bond';

export const bondAPIV2BaseURL = 'https://api-v2.apeswap.finance';
export const CEX_BILL_ADDRESS = '0x6D7637683eaD28F775F56506602191fdE417fF60';

export const AVERAGE_L1_BLOCK_TIME = 12000;

export const merklAMMs: { [chainId in ChainId]?: string[] } = {
  [ChainId.MATIC]: ['quickswapalgebra'],
  [ChainId.ZKEVM]: ['quickswapalgebra', 'quickswapuni'],
  [ChainId.LAYERX]: ['quickswapalgebra'],
};

export const blackListMerklFarms: { [chainId in ChainId]?: string[] } = {
  [ChainId.MATIC]: [
    '0x392DfB56cA9aA807571eC2a666c3bbf87c7FE63E',
    '0xAb86C5DD50F4e0B54ECb07c4fB07219c60150eBF',
    '0x19E4c89e983f5827e353ca0e8a0D6D26E703a8dF',
    '0x0Df98245e23e776Fe059F5793d03AC4221A0ef50',
  ],
  [ChainId.ZKEVM]: [
    '0x8C6B3411c2d04dfBA5E8e00406e8F0F247830A58',
    '0x29A529264a546B3526b0B2517D5369a6b6d43214',
    '0x6637724eB283B66c87d995267E25e891B9658985',
    '0x55d70076a5087a5BF22c927075Cca8ed2C8D1bf1',
    '0xC2a3BcA5e2BfDd89EB20b162037d4e6B876c995E',
    '0xE047186C37EfA99643660e4771D5F6602c35F33D',
    '0xB2687CcE107DDc1424E30CfB375178984f55A444',
    '0x885D9E016003E4EA6aa5e28C2f038C168a27Fc68',
    '0x712EBEc422d283e6540227721241be3A461D7C04',
  ],
};

export const subgraphNotReadyChains = [
  ChainId.ZKATANA,
  ChainId.X1,
  ChainId.ZKTESTNET,
  ChainId.MUMBAI,
  ChainId.DOEGCHAIN_TESTNET,
  ChainId.DOGECHAIN,
];

export const CHAIN_IDS_TO_NAMES = {
  [ChainId.MATIC]: 'matic',
  [ChainId.MUMBAI]: 'mumbai',
  [ChainId.DOGECHAIN]: 'dogechain',
  [ChainId.DOEGCHAIN_TESTNET]: 'dogechain_testnet',
  [ChainId.ZKEVM]: 'zkevm',
  [ChainId.ZKTESTNET]: 'zkevm_testnet',
  [ChainId.KAVA]: 'kava',
  [ChainId.MANTA]: 'manta',
  [ChainId.ZKATANA]: 'zKatana',
  [ChainId.BTTC]: 'bttc',
  [ChainId.TIMX]: 'tIMX',
  [ChainId.X1]: 'x1',
  [ChainId.IMX]: 'IMX',
  [ChainId.ASTARZKEVM]: 'astar_zkevm',
  [ChainId.LAYERX]: 'layerX',
};

export enum ZapType {
  ZAP = 0,
  ZAP_LP_MIGRATOR = 1,
  ZAP_LP_POOL = 2,
  ZAP_SINGLE_ASSET_POOL = 3,
  ZAP_T_BILL = 4,
  ZAP_MINI_APE = 5,
}

export enum SteerVaultState {
  PendingApproval,
  PendingThreshold,
  Paused,
  Active,
  Retired,
}

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

export const WALLCHAIN_PARAMS: {
  [chainId in ChainId]?: {
    [SmartRouter.PARASWAP]: { apiURL: string; apiKey: string };
    [SmartRouter.QUICKSWAP]: { apiURL: string; apiKey: string };
  };
} = {
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
};

export const BONUS_CUTOFF_AMOUNT: { [chainId in ChainId]?: number } = {
  [ChainId.MUMBAI]: 0,
  [ChainId.MATIC]: 0,
  [ChainId.DOEGCHAIN_TESTNET]: 0,
  [ChainId.DOGECHAIN]: 0,
  [ChainId.ZKTESTNET]: 0,
  [ChainId.ZKEVM]: 0,
  [ChainId.MANTA]: 0,
  [ChainId.KAVA]: 0,
  [ChainId.ZKATANA]: 0,
  [ChainId.BTTC]: 0,
  [ChainId.X1]: 0,
  [ChainId.TIMX]: 0,
  [ChainId.IMX]: 0,
};

export const MIN_NATIVE_CURRENCY_FOR_GAS: {
  [chainId in ChainId]: JSBI;
} = {
  [ChainId.MATIC]: JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)), // .01 ETH
  [ChainId.MUMBAI]: JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)),
  [ChainId.DOEGCHAIN_TESTNET]: JSBI.exponentiate(
    JSBI.BigInt(10),
    JSBI.BigInt(16),
  ),
  [ChainId.DOGECHAIN]: JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)),
  [ChainId.ZKEVM]: JSBI.multiply(
    JSBI.BigInt(3),
    JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(15)),
  ),
  [ChainId.ZKTESTNET]: JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(14)),
  [ChainId.MANTA]: JSBI.multiply(
    JSBI.BigInt(5),
    JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(14)),
  ),
  [ChainId.KAVA]: JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)),
  [ChainId.BTTC]: JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)),
  [ChainId.X1]: JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(15)),
  [ChainId.ZKATANA]: JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(14)),
  [ChainId.TIMX]: JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(14)),
  [ChainId.IMX]: JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(14)),
  [ChainId.ASTARZKEVM]: JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(14)),
  [ChainId.LAYERX]: JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(15)),
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
    INITIAL_ALLOWED_SLIPPAGE: 0, // default allowed slippage, in bips
    DEFAULT_DEADLINE_FROM_NOW: 60 * 20, // 20 minutes, denominated in seconds
    BIG_INT_ZERO: JSBI.BigInt(0),
    ONE_BIPS: new Percent(JSBI.BigInt(1), JSBI.BigInt(10000)), // one basis point
    BIPS_BASE: JSBI.BigInt(10000),
    BETTER_TRADE_LINK_THRESHOLD: new Percent(
      JSBI.BigInt(75),
      JSBI.BigInt(10000),
    ),
    // the Uniswap Default token list lives here
    // we add '' to remove the possibility of nulls
    DEFAULT_ADS_LIST_URL: process.env.REACT_APP_ADS_LIST_DEFAULT_URL + '',
    DEFAULT_TOKEN_LIST_URL: process.env.REACT_APP_TOKEN_LIST_DEFAULT_URL + '',
    COINGECKO_POLYGON_TOKEN_LIST_URL:
      process.env.REACT_APP_COINGECKO_POLYGON_URL + '',
    COINGECKO_POLYGON_ZKEVM_TOKEN_LIST_URL:
      process.env.REACT_APP_POLYGON_ZKEVM_URL + '',
    COINGECKO_MANTA_TOKEN_LIST_URL:
      process.env.REACT_APP_COINGECKO_MANTA_URL + '',
    COINGECKO_IMMUTABLE_TOKEN_LIST_URL:
      process.env.REACT_APP_COINGECKO_IMMUTABLE_URL + '',
    COINGECKO_DOGE_TOKEN_LIST_URL:
      process.env.REACT_APP_COINGECKO_DOGE_URL + '',
    COINGECKO_KAVA_TOKEN_LIST_URL:
      process.env.REACT_APP_COINGECKO_KAVA_URL + '',
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
    poolsFilter: {
      quickswap: '0',
      unipilot: '1',
      gamma: '2',
      steer: '3',
      defiedge: '4',
      ichi: '5',
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
    UNIPILOT_RANGE: '2',
    DEFIEDGE_RANGE: '3',
    STEER_RANGE: '4',
  },
  walletName: {
    METAMASK: 'Metamask',
    TRUST_WALLET: 'TrustWallet',
    PHANTOM_WALLET: 'Phantom',
    CYPHERD: 'CypherD',
    BLOCKWALLET: 'BlockWallet',
    BRAVEWALLET: 'BraveWallet',
    BITGET: 'Bitget Wallet',
    INJECTED: 'Injected',
    SAFE_APP: 'Gnosis Safe App',
    ARKANE_CONNECT: 'Venly',
    Portis: 'Portis',
    WALLET_LINK: 'Coinbase Wallet',
    WALLET_CONNECT: 'WalletConnect',
    ZENGO_CONNECT: 'ZenGo',
    OKXWALLET: 'OKX Wallet',
    CRYPTOCOM: 'Crypto.com DeFi Wallet',
    UNSTOPPABLEDOMAINS: 'Unstoppable Domains',
    BINANCEWALLET: 'Binance Web3 Wallet',
    PASSPORTWALLET: 'Passport Wallet',
  },
};

export const DEFAULT_LIST_OF_LISTS: string[] = [
  GlobalConst.utils.DEFAULT_TOKEN_LIST_URL,
  GlobalConst.utils.COINGECKO_POLYGON_TOKEN_LIST_URL,
  GlobalConst.utils.COINGECKO_POLYGON_ZKEVM_TOKEN_LIST_URL,
  GlobalConst.utils.COINGECKO_MANTA_TOKEN_LIST_URL,
  GlobalConst.utils.COINGECKO_IMMUTABLE_TOKEN_LIST_URL,
  GlobalConst.utils.COINGECKO_DOGE_TOKEN_LIST_URL,
  GlobalConst.utils.COINGECKO_KAVA_TOKEN_LIST_URL,
];

export const SUPPORTED_CHAINIDS = [
  ChainId.MATIC,
  ChainId.ZKEVM,
  ChainId.MANTA,
  ChainId.IMX,
  ChainId.ASTARZKEVM,
  ChainId.DOGECHAIN,
  ChainId.LAYERX,
  ChainId.ZKATANA,
  ChainId.X1,
  ChainId.TIMX,
  ChainId.ZKTESTNET,
  ChainId.MUMBAI,
  ChainId.DOEGCHAIN_TESTNET,
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
  withdrawOnly?: boolean;
  fee?: FeeAmount;
}

export const GammaPairs: {
  [chainId in ChainId]?: {
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
        withdrawOnly: true,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x3ae59be14da16183f0a36e23518506c386e63a96',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
        pid: 35,
        withdrawOnly: true,
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
        withdrawOnly: true,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x2e18b825b049c4994370b0db6c35d0100295b96c',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xd0258a3fd00f38aa8090dfee343f10a9d4d30d3f',
        pid: 37,
        withdrawOnly: true,
      },
    ],
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619-0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x2c53dfa65370b2d70975e40172b63210d477e470',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b',
        pid: 38,
        withdrawOnly: true,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xcfd4a6a885c4404a2a5720918a9b4880600876a8',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b',
        pid: 39,
        withdrawOnly: true,
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
        withdrawOnly: true,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x9a4b458a5ae5d96565455d1e1882301fea5c076f',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b',
        pid: 41,
        withdrawOnly: true,
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
        withdrawOnly: true,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xee2a89071654333703b3d6c9be9ab8f085f977de',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0xd0258a3fd00f38aa8090dfee343f10a9d4d30d3f',
        pid: 43,
        withdrawOnly: true,
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
        withdrawOnly: true,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x566452e9d621a1902f9ccf2adaf029cf0f36ec67',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xe5417af564e4bfda1c483642db72007871397896',
        pid: 45,
        withdrawOnly: true,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0xbbba073c31bf03b8acf7c28ef0738decf3695683': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xef4f95d8c252d64308c04f711fb31892cc4c9965',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xbbba073c31bf03b8acf7c28ef0738decf3695683',
        ableToFarm: true,
        pid: 46,
        withdrawOnly: true,
      },
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x62f88fb208df717b035325d065c6919d7913b937',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xbbba073c31bf03b8acf7c28ef0738decf3695683',
        pid: 47,
        withdrawOnly: true,
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
        withdrawOnly: true,
      },
    ],
    '0xa3fa99a148fa48d14ed51d610c367c61876997f1-0xc2132d05d31c914a87c6611c10748aeb04b58e8f': [
      {
        type: Presets.GAMMA_STABLE,
        title: 'Stable',
        address: '0x1825c76ced3c1625250b8af6204bf4fc4e5b9fcf',
        token0Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        token1Address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
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
        pid: 53,
        withdrawOnly: true,
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
        withdrawOnly: true,
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
        withdrawOnly: true,
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
        pid: 69,
        ableToFarm: true,
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
        ableToFarm: true,
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
        ableToFarm: true,
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
    '0x58001cc1a9e17a20935079ab40b1b8f4fc19efd1-0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x45a743cd8c58c96cbd566ece33c83698e2e49424',
        token0Address: '0x58001cc1a9e17a20935079ab40b1b8f4fc19efd1',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 84,
      },
    ],
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619-0xd6df932a45c0f255f85145f286ea0b292b21c90b': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x5ba383530db75a22e028239dbc777c7ee8ce4752',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0xd6df932a45c0f255f85145f286ea0b292b21c90b',
        ableToFarm: true,
        pid: 85,
      },
    ],
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619-0xba777ae3a3c91fcd83ef85bfe65410592bdd0f7c': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xc12e821ff75b464702d2AD55A0F4504ca6441bE5',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0xba777ae3a3c91fcd83ef85bfe65410592bdd0f7c',
        ableToFarm: true,
        pid: 87,
      },
    ],
    '0x27842334c55c01ddfe81bf687425f906816c5141-0xc2132d05d31c914a87c6611c10748aeb04b58e8f': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x5cdc18b774c6cd6f1398faf19d4bd4f31bc53c57',
        token0Address: '0x27842334c55c01ddfe81bf687425f906816c5141',
        token1Address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        pid: 88,
      },
    ],
    '0x18e73a5333984549484348a94f4d219f4fab7b81-0xc2132d05d31c914a87c6611c10748aeb04b58e8f': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'NARROW',
        address: '0x80709a760Ff54112bD3e0CE31C104d912bA51774',
        token0Address: '0x18e73a5333984549484348a94f4d219f4fab7b81',
        token1Address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        pid: 89,
      },
    ],
    '0x0c087f8d6a1f14f71bb7cc7e1b061ca297af7555-0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'NARROW',
        address: '0xf25645c4B5B1c040e9889E0FA4C252c2fC0b40bE',
        token0Address: '0x0c087f8d6a1f14f71bb7cc7e1b061ca297af7555',
        token1Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        ableToFarm: true,
        pid: 90,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0x65ad509db5924ef0001d977590985f965ef1aaaa': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0xdb9f075bb2cd4d0683ac25bb0d8566a9b7fef774',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0x65ad509db5924ef0001d977590985f965ef1aaaa',
        ableToFarm: true,
        pid: 91,
      },
    ],
    '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359-0xfc9fa9771145fbb98d15c8c2cc94b837a56d554c': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0xacb6a2c03c8012c2817efc4d81e33cc0978e3abd',
        token0Address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
        token1Address: '0xfc9fa9771145fbb98d15c8c2cc94b837a56d554c',
        ableToFarm: true,
        pid: 92,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0x10acbe3b9e6a2ff7f341e5cbf4b6617741ff44aa': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x1298b1da33c1d091a2e1340ae1c7983ebe91da8d',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0x10acbe3b9e6a2ff7f341e5cbf4b6617741ff44aa',
        pid: 93,
      },
    ],
    '0x6b021b3f68491974be6d4009fee61a4e3c708fd6-0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0xfb4f607dafe2f3b9f8e99a779d3e404aa703cb47',
        token0Address: '0x6b021b3f68491974be6d4009fee61a4e3c708fd6',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 94,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0x3c499c542cef5e3811e1192ce70d8cc03d5c3359': [
      {
        type: Presets.GAMMA_STABLE,
        title: 'Stable',
        address: '0x472de51a83e052d5d7aca104d4cf4c1f45394130',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
        ableToFarm: true,
        pid: 95,
      },
    ],
    '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359-0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x3974fbdc22741a1632e024192111107b202f214f',
        token0Address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 96,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0xc3c7d422809852031b44ab29eec9f1eff2a58756': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0xb56ff8144e1d4ff94e8b2801bade11bee0d87397',
        token0Address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
        token1Address: '0xC3C7d422809852031b44ab29EEC9F1EfF2A58756',
        ableToFarm: true,
        pid: 98,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x08f02173016278004c1951713091d9181b2dea81',
        token0Address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        token1Address: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39',
        ableToFarm: true,
        pid: 99,
      },
    ],
    '0x61299774020da444af134c82fa83e3810b309991-0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x44899605e50d20d84f58b58c5958ed1c5ddc111d',
        token0Address: '0x61299774020dA444Af134c82fa83E3810b309991',
        token1Address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
        ableToFarm: true,
        pid: 100,
      },
    ],
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619-0xe238ecb42c424e877652ad82d8a939183a04c35f': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x407eb8531f381cf2285ce45ef8ea3f190f33d1ea',
        token0Address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
        token1Address: '0xE238Ecb42C424E877652AD82d8A939183A04C35f',
        ableToFarm: true,
        pid: 102,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0xe238ecb42c424e877652ad82d8a939183a04c35f': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x31c1ae8f080fd194d979e2aa8b3051259baf79f2',
        token0Address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
        token1Address: '0xE238Ecb42C424E877652AD82d8A939183A04C35f',
        ableToFarm: true,
        pid: 105,
      },
    ],
    '0x162539172b53e9a93b7d98fb6c41682de558a320-0xb5c064f955d8e7f38fe0460c556a72987494ee17': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x90Eb82495B4A5E578FDFcB9Fe3084cD1a83265D6',
        token0Address: '0x162539172b53e9a93b7d98fb6c41682de558a320',
        token1Address: '0xb5C064f955D8e7f38fe0460c556a72987494ee17',
        ableToFarm: true,
        pid: 106,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0x162539172b53e9a93b7d98fb6c41682de558a320': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x72E102438957Fe544C36852F4ba436de42EFF4Fa',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0x162539172b53e9a93b7d98fb6c41682de558a320',
        ableToFarm: true,
        pid: 107,
      },
    ],
    '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359-0x8f3cf7ad23cd3cadbd9735aff958023239c6a063': [
      {
        type: Presets.GAMMA_STABLE,
        title: 'Stable',
        address: '0x39f223B2E0405FA62CeC7DC476FC5A307B435069',
        token0Address: '0x3c499c542cef5e3811e1192ce70d8cC03d5c3359',
        token1Address: '0x8f3Cf7ad23cd3caDbd9735aff958023239c6a063',
      },
    ],
    '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359-0xc2132d05d31c914a87c6611c10748aeb04b58e8f': [
      {
        type: Presets.GAMMA_STABLE,
        title: 'Stable',
        address: '0x953e523eA34E85AC55D40Be1Ff71D52aa62497b7',
        token0Address: '0x3c499c542cEF5E3811e1192ce70d8cc03d5c3359',
        token1Address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0x3c499c542cef5e3811e1192ce70d8cc03d5c3359': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x1cf4293125913cb3dea4ad7f2bb4795b9e896ce9',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
      },
    ],
    '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359-0xb5c064f955d8e7f38fe0460c556a72987494ee17': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x36b511A006cAc909DC56C2c24eb69CA304f74999',
        token0Address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
        token1Address: '0xb5c064f955d8e7f38fe0460c556a72987494ee17',
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0xdcb72ae4d5dc6ae274461d57e65db8d50d0a33ad': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x0566e8e9bae925894d80d9e0a4fd9a72aea1a2f2',
        token0Address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
        token1Address: '0xdCb72AE4d5dc6Ae274461d57E65dB8D50d0a33AD',
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x785A9F42a4568914773bE52008A10C4d62e5c63a',
        token0Address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
        token1Address: '0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7',
      },
    ],
    '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359-0xa3fa99a148fa48d14ed51d610c367c61876997f1': [
      {
        type: Presets.GAMMA_STABLE,
        title: 'Stable',
        address: '0xe0fb098af0544df0124dcd326b15c0df3ca62164',
        token0Address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
        token1Address: '0xa3fa99a148fa48D14ed51d610c367c61876997f1',
      },
    ],
    '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359-0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x9854aba3f857f19660f856bdb19718081ce6120a',
        token0Address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
        token1Address: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39',
      },
    ],
  },
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
        pid: 22,
      },
    ],
    '0x4b16e4752711a7abec32799c976f3cefc0111f2b-0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xECfA9CD134E77f573b079378940A4Be944993F17',
        token0Address: '0x4b16e4752711a7abec32799c976f3cefc0111f2b',
        token1Address: '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9',
        ableToFarm: true,
        pid: 23,
      },
    ],
    '0x3d5320821bfca19fb0b5428f2c79d63bd5246f89-0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xbAAA5a2D780C5914FB1BAD0Ea6Cbf7B99589d6FE',
        token0Address: '0x3d5320821bfca19fb0b5428f2c79d63bd5246f89',
        token1Address: '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9',
        ableToFarm: true,
        pid: 24,
      },
    ],
    '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9-0x68791cfe079814c46e0e25c19bcc5bfc71a744f7': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x06895D6f6680E5e8301604D5E0483A3655C547B8',
        token0Address: '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9',
        token1Address: '0x68791cfe079814c46e0e25c19bcc5bfc71a744f7',
        ableToFarm: true,
        pid: 25,
      },
    ],
    '0x819d1daa794c1c46b841981b61cc978d95a17b8e-0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035': [
      {
        type: Presets.STABLE,
        title: 'Stable',
        address: '0x9902bc1eb18c5d1594dd97907f1bb427d8a153da',
        token0Address: '0x819d1daa794c1c46b841981b61cc978d95a17b8e',
        token1Address: '0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035',
        pid: 26,
      },
    ],
    '0x1e4a5963abfd975d8c9021ce480b42188849d41d-0x37eaa0ef3549a5bb7d431be78a3d99bd360d19e5-100': [
      {
        type: Presets.STABLE,
        title: 'Stable',
        address: '0xb6537224d80a9d9a86eaf11260a1b222f3be3120',
        token0Address: '0x1E4a5963aBFD975d8c9021ce480b42188849D41d',
        token1Address: '0x37eAA0eF3549a5Bb7D431be78a3D99BD360d19e5',
        fee: FeeAmount.LOWEST,
      },
    ],
    '0x37eaa0ef3549a5bb7d431be78a3d99bd360d19e5-0x68286607a1d43602d880d349187c3c48c0fd05e6-3000': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x95dd2ecba4d0472d0440d764e9a540c6a99e79ee',
        token0Address: '0x37eAA0eF3549a5Bb7D431be78a3D99BD360d19e5',
        token1Address: '0x68286607A1d43602d880D349187c3c48c0fD05E6',
        fee: FeeAmount.MEDIUM,
      },
    ],
    '0x37eaa0ef3549a5bb7d431be78a3d99bd360d19e5-0xa2036f0538221a77a3937f1379699f44945018d0-500': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x63ff2134dd9a32607cdb42f4aeaecac2c3cda71d',
        token0Address: '0x37eAA0eF3549a5Bb7D431be78a3D99BD360d19e5',
        token1Address: '0xa2036f0538221a77A3937F1379699f44945018d0',
        fee: FeeAmount.LOW,
      },
    ],
    '0x37eaa0ef3549a5bb7d431be78a3d99bd360d19e5-0xea034fb02eb1808c2cc3adbc15f447b93cbe08e1-500': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x258d485a17e1ba65ff6367d0e8b8acc70ab200f2',
        token0Address: '0x37eAA0eF3549a5Bb7D431be78a3D99BD360d19e5',
        token1Address: '0xEA034fb02eB1808C2cc3adbC15f447B93CbE08e1',
        fee: FeeAmount.LOW,
      },
    ],
    '0x37eaa0ef3549a5bb7d431be78a3d99bd360d19e5-0x615b25500403eb688be49221b303084d9cf0e5b4-100': [
      {
        type: Presets.STABLE,
        title: 'Stable',
        address: '0xe7db8674dfb04adde4511de6897d21f28f9cde7d',
        token0Address: '0x37eAA0eF3549a5Bb7D431be78a3D99BD360d19e5',
        token1Address: '0x615B25500403Eb688Be49221b303084D9Cf0E5B4',
        fee: FeeAmount.LOWEST,
      },
    ],
    '0x37eaa0ef3549a5bb7d431be78a3d99bd360d19e5-0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9-500': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0xfd01230422d426955ac0bbb85eeeb752eb108a6e',
        token0Address: '0x37eAA0eF3549a5Bb7D431be78a3D99BD360d19e5',
        token1Address: '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9',
        fee: FeeAmount.LOW,
      },
    ],
    '0x37eaa0ef3549a5bb7d431be78a3d99bd360d19e5-0x68286607a1d43602d880d349187c3c48c0fd05e6': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xD2B816351c7eE21c41f540065bed5f55159D49bD',
        token0Address: '0x37eAA0eF3549a5Bb7D431be78a3D99BD360d19e5',
        token1Address: '0x68286607A1d43602d880D349187c3c48c0fD05E6',
      },
    ],
    '0x37eaa0ef3549a5bb7d431be78a3d99bd360d19e5-0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x497729103a496C445638Aa0A500f9309B1609FD8',
        token0Address: '0x37eAA0eF3549a5Bb7D431be78a3D99BD360d19e5',
        token1Address: '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9',
      },
    ],
    '0x37eaa0ef3549a5bb7d431be78a3d99bd360d19e5-0xa2036f0538221a77a3937f1379699f44945018d0': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x12A848F8455F7691209DCd0416dF7Ef91Af6D696',
        token0Address: '0x37eAA0eF3549a5Bb7D431be78a3D99BD360d19e5',
        token1Address: '0xa2036f0538221a77A3937F1379699f44945018d0',
      },
    ],
    '0x37eaa0ef3549a5bb7d431be78a3d99bd360d19e5-0xea034fb02eb1808c2cc3adbc15f447b93cbe08e1': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x2FD6FD1E3f1fE24cC1422D22e62884A4528d1A24',
        token0Address: '0x37eAA0eF3549a5Bb7D431be78a3D99BD360d19e5',
        token1Address: '0xea034fb02eb1808c2cc3adbc15f447b93cbe08e1',
      },
    ],
  },
  [ChainId.MANTA]: {
    '0x0dc808adce2099a9f62aa87d9670745aba741746-0xb73603c5d87fa094b7314c74ace2e64d165016fb-500': [
      {
        address: '0x0d8f8eb720f4e3c1bcaa50c78339f796cd4a380f',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0x0Dc808adcE2099A9F62AA87D9670745AbA741746',
        token1Address: '0xb73603C5d87fA094B7314C74ACE2e64D165016fb',
        fee: FeeAmount.LOW,
        ableToFarm: true,
        pid: 0,
      },
    ],
    '0x0dc808adce2099a9f62aa87d9670745aba741746-0xf417f5a458ec102b90352f697d6e2ac3a3d2851f-500': [
      {
        address: '0x2eab29331d62a8f9b42559d9fa844b02dc85ca37',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0x0Dc808adcE2099A9F62AA87D9670745AbA741746',
        token1Address: '0xf417F5A458eC102B90352F697D6e2Ac3A3d2851f',
        fee: FeeAmount.LOW,
        ableToFarm: true,
        pid: 1,
      },
    ],
    '0x0f52a51287f9b3894d73df05164d0ee2533ccbb4-0xb73603c5d87fa094b7314c74ace2e64d165016fb-500': [
      {
        address: '0x67a79c80382979d61a3a9ed892f44d8046163a9d',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0x0f52A51287f9b3894d73Df05164D0Ee2533ccBB4',
        token1Address: '0xb73603C5d87fA094B7314C74ACE2e64D165016fb',
        fee: FeeAmount.LOW,
        ableToFarm: true,
        pid: 2,
      },
    ],
    '0x0dc808adce2099a9f62aa87d9670745aba741746-0x305e88d809c9dc03179554bfbf85ac05ce8f18d6-500': [
      {
        address: '0xc40f63879630dff5b69dd6d287f7735e65e90702',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0x0Dc808adcE2099A9F62AA87D9670745AbA741746',
        token1Address: '0x305E88d809c9DC03179554BFbf85Ac05Ce8F18d6',
        fee: FeeAmount.LOW,
        ableToFarm: true,
        pid: 3,
      },
    ],
    '0xb73603c5d87fa094b7314c74ace2e64d165016fb-0xe22e3d44ea9fb0a87ea3f7a8f41d869c677f0020-10000': [
      {
        address: '0x22c0e57f6347dba505e0052d45d4c610a55baf71',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0xb73603C5d87fA094B7314C74ACE2e64D165016fb',
        token1Address: '0xE22E3D44Ea9Fb0A87Ea3F7a8f41D869C677f0020',
        fee: FeeAmount.HIGH,
        ableToFarm: true,
        pid: 4,
      },
    ],
    '0xb73603c5d87fa094b7314c74ace2e64d165016fb-0xf417f5a458ec102b90352f697d6e2ac3a3d2851f-100': [
      {
        address: '0x2ffaced56c4366115b65adbb8703a5541a27973d',
        type: Presets.GAMMA_STABLE,
        title: 'Stable',
        token0Address: '0xb73603C5d87fA094B7314C74ACE2e64D165016fb',
        token1Address: '0xf417F5A458eC102B90352F697D6e2Ac3A3d2851f',
        fee: FeeAmount.LOWEST,
        ableToFarm: true,
        pid: 5,
      },
    ],
    '0x0dc808adce2099a9f62aa87d9670745aba741746-0x2fe3ad97a60eb7c79a976fc18bb5ffd07dd94ba5-100': [
      {
        address: '0xa6e2673cd6dad4c9b4eb638ce35cf44e17d32319',
        type: Presets.GAMMA_DYNAMIC,
        title: 'Pegged Price',
        token0Address: '0x0dc808adce2099a9f62aa87d9670745aba741746',
        token1Address: '0x2FE3AD97a60EB7c79A976FC18Bb5fFD07Dd94BA5',
        fee: FeeAmount.LOWEST,
        ableToFarm: true,
        pid: 6,
      },
    ],
    '0xbdad407f77f44f7da6684b416b1951eca461fb07-0xec901da9c68e90798bbbb74c11406a32a70652c3-3000': [
      {
        address: '0x099dD23Eaab20F5eC43f50055D6e3030C66CC182',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0xbdAd407F77f44F7Da6684B416b1951ECa461FB07',
        token1Address: '0xEc901DA9c68E90798BbBb74c11406A32A70652C3',
        fee: FeeAmount.MEDIUM,
        ableToFarm: true,
        pid: 7,
      },
    ],
    '0x0dc808adce2099a9f62aa87d9670745aba741746-0xec901da9c68e90798bbbb74c11406a32a70652c3-3000': [
      {
        address: '0xa6e2673cd6dad4c9b4eb638ce35cf44e17d32319',
        type: Presets.GAMMA_DYNAMIC,
        title: 'Pegged Price',
        token0Address: '0x0dc808adce2099a9f62aa87d9670745aba741746',
        token1Address: '0xEc901DA9c68E90798BbBb74c11406A32A70652C3',
        fee: FeeAmount.MEDIUM,
        ableToFarm: true,
        pid: 8,
      },
    ],
    '0x95cef13441be50d20ca4558cc0a27b601ac544e5-0xb73603c5d87fa094b7314c74ace2e64d165016fb-500': [
      {
        address: '0xF0ceCcdFa8Dd478a22c88dAb0130fc0338205342',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0x95cef13441be50d20ca4558cc0a27b601ac544e5',
        token1Address: '0xb73603c5d87fa094b7314c74ace2e64d165016fb',
        fee: FeeAmount.LOW,
        ableToFarm: true,
        pid: 9,
      },
    ],
    '0x95cef13441be50d20ca4558cc0a27b601ac544e5-0xec901da9c68e90798bbbb74c11406a32a70652c3-3000': [
      {
        address: '0x9d4472934648975A3ccb558FEB2AbAbcE6359Ffa',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0x95cef13441be50d20ca4558cc0a27b601ac544e5',
        token1Address: '0xec901da9c68e90798bbbb74c11406a32a70652c3',
        fee: FeeAmount.MEDIUM,
        ableToFarm: true,
        pid: 11,
      },
    ],
    '0x0dc808adce2099a9f62aa87d9670745aba741746-0x95cef13441be50d20ca4558cc0a27b601ac544e5-3000': [
      {
        address: '0xc478124bbd0d95c6204d18a7d31d3d88967fd581',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0x0dc808adce2099a9f62aa87d9670745aba741746',
        token1Address: '0x95cef13441be50d20ca4558cc0a27b601ac544e5',
        fee: FeeAmount.MEDIUM,
        ableToFarm: true,
        pid: 12,
      },
    ],
    '0x95cef13441be50d20ca4558cc0a27b601ac544e5-0xbdad407f77f44f7da6684b416b1951eca461fb07-500': [
      {
        address: '0x4850d96222e7c6138b47071faa356baa232a7326',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0x95cef13441be50d20ca4558cc0a27b601ac544e5',
        token1Address: '0xbdAd407F77f44F7Da6684B416b1951ECa461FB07',
        fee: FeeAmount.LOW,
        ableToFarm: true,
        pid: 13,
      },
    ],
    '0x0dc808adce2099a9f62aa87d9670745aba741746-0xec901da9c68e90798bbbb74c11406a32a70652c3-500': [
      {
        address: '0x258D485a17E1BA65fF6367D0e8b8ACc70Ab200F2',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0x0dc808adce2099a9f62aa87d9670745aba741746',
        token1Address: '0xec901da9c68e90798bbbb74c11406a32a70652c3',
        fee: FeeAmount.LOW,
        ableToFarm: true,
        pid: 14,
      },
    ],
    '0xbdad407f77f44f7da6684b416b1951eca461fb07-0xec901da9c68e90798bbbb74c11406a32a70652c3-500': [
      {
        address: '0xB833e6fc4E634d38b91bf05E4eD672f5396fFEf2',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0xbdad407f77f44f7da6684b416b1951eca461fb07',
        token1Address: '0xec901da9c68e90798bbbb74c11406a32a70652c3',
        fee: FeeAmount.LOW,
        ableToFarm: true,
        pid: 15,
      },
    ],
    '0x0dc808adce2099a9f62aa87d9670745aba741746-0x95cef13441be50d20ca4558cc0a27b601ac544e5-500': [
      {
        address: '0x2795606690234b17CDa97304bE6835e753E4C499',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0x0dc808adce2099a9f62aa87d9670745aba741746',
        token1Address: '0x95cef13441be50d20ca4558cc0a27b601ac544e5',
        fee: FeeAmount.LOW,
        ableToFarm: true,
        pid: 16,
      },
    ],
    '0x95cef13441be50d20ca4558cc0a27b601ac544e5-0xec901da9c68e90798bbbb74c11406a32a70652c3-500': [
      {
        address: '0xE7549089F0D1ca6e9E3E2b06812B347E0Bbd68E1',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0x95cef13441be50d20ca4558cc0a27b601ac544e5',
        token1Address: '0xec901da9c68e90798bbbb74c11406a32a70652c3',
        fee: FeeAmount.LOW,
        ableToFarm: true,
        pid: 17,
      },
    ],
    '0xb73603c5d87fa094b7314c74ace2e64d165016fb-0xbdad407f77f44f7da6684b416b1951eca461fb07-100': [
      {
        address: '0xDf0B9b59E92A2554dEdB6F6F4AF6918d79DD54c4',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0xb73603c5d87fa094b7314c74ace2e64d165016fb',
        token1Address: '0xbdad407f77f44f7da6684b416b1951eca461fb07',
        fee: FeeAmount.LOWEST,
        ableToFarm: true,
        pid: 18,
      },
    ],
    '0xe22e3d44ea9fb0a87ea3f7a8f41d869c677f0020-0xec901da9c68e90798bbbb74c11406a32a70652c3-10000': [
      {
        address: '0x020dC3018c914A6973643502D4cC142276394A05',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0xe22e3d44ea9fb0a87ea3f7a8f41d869c677f0020',
        token1Address: '0xec901da9c68e90798bbbb74c11406a32a70652c3',
        fee: FeeAmount.HIGH,
        ableToFarm: true,
        pid: 19,
      },
    ],
    '0x95cef13441be50d20ca4558cc0a27b601ac544e5-0xe22e3d44ea9fb0a87ea3f7a8f41d869c677f0020-10000': [
      {
        address: '0x91Fa32Ec6b3802287905Af692F108Fd14D8eb698',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0x95cef13441be50d20ca4558cc0a27b601ac544e5',
        token1Address: '0xe22e3d44ea9fb0a87ea3f7a8f41d869c677f0020',
        fee: FeeAmount.HIGH,
        ableToFarm: true,
        pid: 20,
      },
    ],
    '0xbdad407f77f44f7da6684b416b1951eca461fb07-0xe22e3d44ea9fb0a87ea3f7a8f41d869c677f0020-10000': [
      {
        address: '0x6c384608f1e69eD8A0156D6A43efeE4E54297717',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0xbdad407f77f44f7da6684b416b1951eca461fb07',
        token1Address: '0xe22e3d44ea9fb0a87ea3f7a8f41d869c677f0020',
        fee: FeeAmount.HIGH,
        ableToFarm: true,
        pid: 21,
      },
    ],
  },
  [ChainId.IMX]: {
    '0x3a0c2ba54d6cbd3121f01b96dfd20e99d1696c9d-0x6de8acc0d406837030ce4dd28e7c08c5a96a30d2-500': [
      {
        address: '0x6e9d701fb6478ed5972a37886c2ba6c82a4cbb4c',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0x3A0C2Ba54D6CBd3121F01b96dFd20e99D1696C9D',
        token1Address: '0x6de8aCC0D406837030CE4dd28e7c08C5a96a30d2',
        fee: FeeAmount.LOW,
      },
    ],
    '0x3a0c2ba54d6cbd3121f01b96dfd20e99d1696c9d-0xb00ed913aaff8280c17bff33cce82fe6d79e85e8-3000': [
      {
        address: '0x4476433bc06210ba265d95736ebc630544d397d9',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0x3A0C2Ba54D6CBd3121F01b96dFd20e99D1696C9D',
        token1Address: '0xb00ed913aAFf8280C17BfF33CcE82fE6D79e85e8',
        fee: FeeAmount.MEDIUM,
      },
    ],
    '0x3a0c2ba54d6cbd3121f01b96dfd20e99d1696c9d-0x52a6c53869ce09a731cd772f245b97a4401d3348-3000': [
      {
        address: '0x6d257b17be32d4e7ebfebc3a337bf9c231da5aa7',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0x3A0C2Ba54D6CBd3121F01b96dFd20e99D1696C9D',
        token1Address: '0x52A6c53869Ce09a731CD772f245b97A4401d3348',
        fee: FeeAmount.MEDIUM,
      },
    ],
    '0x3a0c2ba54d6cbd3121f01b96dfd20e99d1696c9d-0x6de8acc0d406837030ce4dd28e7c08c5a96a30d2-3000': [
      {
        address: '0x216D3DF2DF6DeC7c95D3b51F018eE4b11E416eBb',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0x3A0C2Ba54D6CBd3121F01b96dFd20e99D1696C9D',
        token1Address: '0x6de8aCC0D406837030CE4dd28e7c08C5a96a30d2',
        fee: FeeAmount.MEDIUM,
      },
    ],
    '0x52a6c53869ce09a731cd772f245b97a4401d3348-0x6de8acc0d406837030ce4dd28e7c08c5a96a30d2-500': [
      {
        address: '0xc46ac687D23d8a631d0eF702520ca2ff55353523',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0x52A6c53869Ce09a731CD772f245b97A4401d3348',
        token1Address: '0x6de8aCC0D406837030CE4dd28e7c08C5a96a30d2',
        fee: FeeAmount.LOW,
      },
    ],
  },
  [ChainId.ASTARZKEVM]: {
    '0x1e4a5963abfd975d8c9021ce480b42188849d41d-0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035-100': [
      {
        address: '0x4476433bc06210ba265d95736ebc630544d397d9',
        type: Presets.GAMMA_STABLE,
        title: 'Stable',
        token0Address: '0x1E4a5963aBFD975d8c9021ce480b42188849D41d',
        token1Address: '0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035',
        fee: FeeAmount.LOWEST,
      },
    ],
    '0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035-0xe9cc37904875b459fa5d0fe37680d36f1ed55e38-500': [
      {
        address: '0x7eccd6d077e4ad7120150578e936a22f058fbcce',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035',
        token1Address: '0xE9CC37904875B459Fa5D0FE37680d36F1ED55e38',
        fee: FeeAmount.LOW,
      },
    ],
    '0x5d8cff95d7a57c0bf50b30b43c7cc0d52825d4a9-0xe9cc37904875b459fa5d0fe37680d36f1ed55e38-100': [
      {
        address: '0xbc7d3b581cd4c4f34fc2942491fa803761c574e2',
        type: Presets.GAMMA_DYNAMIC,
        title: 'Pegged Price',
        token0Address: '0x5D8cfF95D7A57c0BF50B30b43c7CC0D52825D4a9',
        token1Address: '0xE9CC37904875B459Fa5D0FE37680d36F1ED55e38',
        fee: FeeAmount.LOWEST,
      },
    ],
    '0x1e4a5963abfd975d8c9021ce480b42188849d41d-0xe9cc37904875b459fa5d0fe37680d36f1ed55e38-500': [
      {
        address: '0xe8a6565e7f395f551fe3f98bd674a922cb552524',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0x1E4a5963aBFD975d8c9021ce480b42188849D41d',
        token1Address: '0xE9CC37904875B459Fa5D0FE37680d36F1ED55e38',
        fee: FeeAmount.LOW,
      },
    ],
    '0xe9cc37904875b459fa5d0fe37680d36f1ed55e38-0xea034fb02eb1808c2cc3adbc15f447b93cbe08e1-500': [
      {
        address: '0x012f34c8bd206f2ff403e2388ac66c2fa5777391',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0xE9CC37904875B459Fa5D0FE37680d36F1ED55e38',
        token1Address: '0xEA034fb02eB1808C2cc3adbC15f447B93CbE08e1',
        fee: FeeAmount.LOW,
      },
    ],
    '0xdf41220c7e322bfef933d85d01821ad277f90172-0xe9cc37904875b459fa5d0fe37680d36f1ed55e38-500': [
      {
        address: '0xf66da0f517c6f5431c77f4d0525ebc4b3bb40578',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0xdf41220C7e322bFEF933D85D01821ad277f90172',
        token1Address: '0xE9CC37904875B459Fa5D0FE37680d36F1ED55e38',
        fee: FeeAmount.LOW,
      },
    ],
    '0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035-0xdf41220c7e322bfef933d85d01821ad277f90172-500': [
      {
        address: '0x8f249cda053070fdb135d87e25a89dfbc8785f1d',
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        token0Address: '0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035',
        token1Address: '0xdf41220C7e322bFEF933D85D01821ad277f90172',
        fee: FeeAmount.LOW,
      },
    ],
    '0x7746ef546d562b443ae4b4145541a3b1a3d75717-0xdf41220c7e322bfef933d85d01821ad277f90172-100': [
      {
        address: '0x216d3df2df6dec7c95d3b51f018ee4b11e416ebb',
        type: Presets.GAMMA_DYNAMIC,
        title: 'Pegged Price',
        token0Address: '0x7746ef546d562b443AE4B4145541a3b1a3D75717',
        token1Address: '0xdf41220C7e322bFEF933D85D01821ad277f90172',
        fee: FeeAmount.LOWEST,
      },
    ],
  },
};

export const UnipilotVaults: {
  [chainId in ChainId]?: string[];
} = {
  [ChainId.DOGECHAIN]: [
    '0x1749af477bb94cf84c942f0db69f4213959e0b12',
    '0x1768bdfb0f9a508374e596f2e2c84fec48dc207f',
    '0x2c054da252b032df9dd67c6be570b0fa2fbec905',
    '0x4fc58e1598735e4ee6dd46852dd77e00d26ee98a',
    '0x60ee3b3a281a18b6ceee85a2e7c4470916512c7b',
    '0xd139300ff6bdd6ae778b1835af5dbf242194cc2f',
    '0xf346f3eaa3e319f53413fc2a0008f0710c2ea448',
    '0xf9edf35c75f624207bf81242024d9ea6a4f4d245',
  ],
};

export const IchiVaults: {
  [chainId in ChainId]?: string[];
} = {
  [ChainId.MATIC]: [
    '0x74b706767f18a360c0083854ab42c1b96e076229',
    '0xCBD1f4Bc3E6d05b10fEb5dc454d27364767e76B5',
    '0x5D73D117Ffb8AD26e6CC9f2621d52f479AAA8C5B',
    '0xc46FAb3Af8aA7A56feDa351a22B56749dA313473',
    '0x5403e11D5Edf6564C27b47757d62A515a81D9781',
    '0x5D1b077212b624fe580a84384Ffea44da752ccb3',
    '0xe8Aa60c966eE8BE1340aBf1d871D0163d5739B95',
    '0x425D80e10A8103bedb57F5C08FF8d59253D6a259',
    '0x318047C9584cFD77C6dfc28d3df8BD0d8a29E095',
    '0xb2B34446D9cFb6719543ef5246481F218367b43a',
    '0x891F0c3159aCf7306c0c252757310db8F47B59B2',
    '0x7a384EA3Bb74a53798565fd6c2d0aE9BF1cA81D8',
    '0x29a5e9fa30a88EAf3Ac800FA71649Ae660254aef',
    '0x4D469cA8f3F67ef276c8d660E60fAc73067e298d',
    '0x4218d9843fF95e22e87B7F2B5bd95EBdb6FC42cC',
    '0x5eFe299401dD907b1b01950c9CdC6136f4205Ce7',
    '0xdA4C73f04c790802267b02e1dFe84eddE795124A',
    '0xB03b613545109d5E4Ee23eD3fF2a745d634b7319',
    '0x75A456b42DcEc70d644aebAE3bB2AEA768D9397A',
    '0xaE2979B6328Fb75eBf311B30e1b985Ecb1A813D2',
    '0xD79D60CEAD6406e2Fc228a6778B6bB5caE47BB8c',
    '0x29a117f122A5317A2b547b1A204624cb7E83FA6F',
    '0xdc58504630972421445CBa4f856ABbA3Ce1BCB8a',
    '0x2FF07791F125BF6CE120D938f862d0385Cf4c835',
    '0xb5a4B8d3c8F88a25801aF460f52fEc639403534f',
    '0x2ED64d3De2A2c060FF4b31e9B2f9268ADcE7e671',
    '0x6fD4058ED78608F3C613585EEa222F6F5480e0D5',
    '0x3c306334b3728F5E50c1eDfA8338ffe96C875812',
    '0xECD259DEdDc93B9881debDC67c7c4b553794Fd3c',
    '0x20268C918a6873aBB44d7f53A4Eb92a968Bb255b',
    '0xe3a2F6b642cBB29F7D5A82afa83a48b9c4E79244',
  ],
  [ChainId.ZKEVM]: [
    '0x423382e084f1d1d180bec638bc64cc6408896c3c',
    '0xb4eac29e630e38133e015ad17e3986886d5e8b35',
  ],
};

export interface DefiedgeStrategy {
  id: string;
  token0: string;
  token1: string;
  pool: string;
  ableToFarm?: boolean;
  pid?: number;
  miniChefAddress?: string;
  rewardToken?: string;
}

export const DefiedgeStrategies: {
  [chainId in ChainId]?: DefiedgeStrategy[];
} = {
  [ChainId.MATIC]: [
    {
      id: '0x8b207CA0B5602fEcF38Dbc748900B7f5C5903F12',
      token0: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6', // WBTC
      token1: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', // WETH
      pool: '0xac4494e30a85369e332bdb5230d6d694d4259dbc',
    },
    {
      id: '0xd778c83e7ca19c2217d98dadacf7fd03b79b18cb',
      token0: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
      token1: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
      pool: '0x479e1b71a702a595e19b6d5932cd5c863ab57ee0',
    },
    {
      id: '0x8e7b68e3ce0219e73bc8f237916875f6be8d79f9',
      token0: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
      token1: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
      pool: '0x55caabb0d2b704fd0ef8192a7e35d8837e678207',
    },
    {
      id: '0x4f53F458F4F00ad2Dd7e7177cebE1a2AFc38AB9E',
      token0: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
      token1: '0x172370d5cd63279efa6d502dab29171933a610af',
      pool: '0x00a6177c6455a29b8daa7144b2befc9f2147bb7e',
    },
    {
      id: '0x5b770a2d5d70cb6d71d4fdc8c02776f05a8c3742',
      token0: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
      token1: '0xd6df932a45c0f255f85145f286ea0b292b21c90b',
      pool: '0x44720a6f572649526ac9073cae9200755cc78e0a',
    },
    {
      id: '0x392fea7d91713630ded6d71befe388da9fa85e8d',
      token0: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
      token1: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
      pool: '0xa5cd8351cbf30b531c7b11b0d9d3ff38ea2e280f',
    },
    {
      id: '0x4f5e0df21608cd454fd75d106bccee1d2ede341c',
      token0: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      token1: '0xB5C064F955D8e7F38fE0460C556a72987494eE17',
      pool: '0xDE2D1fd2E8238aBA80a5B80c7262E4833D92f624',
    },
    {
      id: '0x35e07a3ad7dbfd87114a5f0a11930e42339c5e63',
      token0: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
      token1: '0xB5C064F955D8e7F38fE0460C556a72987494eE17',
      pool: '0x9F1A8cAF3C8e94e43aa64922d67dFf4dc3e88A42',
    },
    {
      id: '0xe32fDF1A5BD6C0723150DDeE23d2859A34BE7317',
      token0: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39',
      token1: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      pool: '0xAb52931301078E2405c3a3EBB86e11ad0dFD2CfD',
    },
    {
      id: '0x003a30218bbd59c55a34d795523b2efe34430884',
      token0: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
      token1: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      pool: '0x5b41EEDCfC8e0AE47493d4945Aa1AE4fe05430ff',
    },
    {
      id: '0x29f177eff806b8a71ff8c7259ec359312cace22d',
      token0: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
      token1: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      pool: '0xAE81FAc689A1b4b1e06e7ef4a2ab4CD8aC0A087D',
    },
    {
      id: '0x442706e08dd6c8fb606c4414881b293e60fdd33b',
      token0: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
      token1: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      pool: '0x6669B4706cC152F359e947BCa68E263A87c52634',
    },
    {
      id: '0xd9884071d6ba94d205f4bd6d13fd0256a1688c15',
      token0: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
      token1: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      pool: '0xdb975b96828352880409e86d5aE93c23c924f812',
    },
    {
      id: '0x42688eedFE34EAcf64D5e9dEC7575B9C32F8fFE6',
      token0: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      token1: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      pool: '0xa6AeDF7c4Ed6e821E67a6BfD56FD1702aD9a9719',
    },
    {
      id: '0xfEfa244712513407Ac6fd45203Cdc35Df2Cf7B72',
      token0: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      token1: '0xB5C064F955D8e7F38fE0460C556a72987494eE17',
      pool: '0x14Ef96A0f7d738Db906bdD5260E46AA47B1e6E45',
    },
    {
      id: '0x913912a9e05eea0bc36d097ea80dbde36e186e11',
      token0: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      token1: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      pool: '0xBC8f3da0bd42E1F2509cd8671Ce7c7E5f7fd39c8',
    },
    {
      id: '0x684a4c7e734d509d6aaca7636ff60fd513f59ad1',
      token0: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      token1: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      pool: '0x0e3Eb2C75Bd7dD0e12249d96b1321d9570764D77',
    },
    {
      id: '0xe1e1e644e77fc7cfc79cdf0fcd945588db39eefd',
      token0: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      token1: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      pool: '0xe7E0eB9F6bCcCfe847fDf62a3628319a092F11a2',
    },
    {
      id: '0xf9db53defa526073d0e042053d2d556e23d4162c',
      token0: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      token1: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      pool: '0xefFA9E5e63ba18160Ee26BdA56b42F3368719615',
    },
    {
      id: '0xd3d7c8876aa8a5df038f54a07c241612822d6dd1',
      token0: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
      token1: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      pool: '0x76D9553f9910c5CF1F5dBbb210dc95BC5a63EE68',
    },
    {
      id: '0x48c2d81426ea135ab9a34332252099cf21ca3a22',
      token0: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      token1: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      pool: '0x7B925e617aefd7FB3a93Abe3a701135D7a1Ba710',
    },
  ],
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
        USDCE[ChainId.MATIC],
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
        PUSH[ChainId.MATIC],
        fxMETOD[ChainId.MATIC],
        PKR[ChainId.MATIC],
        SLING[ChainId.MATIC],
        NINJAZ[ChainId.MATIC],
        RNDR[ChainId.MATIC],
        NFTE[ChainId.MATIC],
        CRS[ChainId.MATIC],
        SD[ChainId.MATIC],
        ABOND[ChainId.MATIC],
        DSRUN[ChainId.MATIC],
        VDA[ChainId.MATIC],
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
        CRV[ChainId.ZKEVM],
        LINK[ChainId.ZKEVM],
        AAVE[ChainId.ZKEVM],
      ],
      [ChainId.MUMBAI]: [],
      [ChainId.DOEGCHAIN_TESTNET]: [],
      [ChainId.ZKTESTNET]: [],
      [ChainId.KAVA]: [],
      [ChainId.MANTA]: [EMPTY[ChainId.MANTA], MATICX[ChainId.MANTA]],
      [ChainId.ZKATANA]: [],
      [ChainId.BTTC]: [],
      [ChainId.X1]: [],
      [ChainId.TIMX]: [],
      [ChainId.IMX]: [],
      [ChainId.ASTARZKEVM]: [],
      [ChainId.LAYERX]: [],
    },
  },
  marketSDK: {
    BLOCKSPERDAY: 0.5 * GlobalConst.utils.ONEDAYSECONDS,
  },
};

export const paraswapTaxBuy: { [key: string]: number } = {
  '0xed88227296943857409a8e0f15ad7134e70d0f73': 100,
  '0x37eb60f78e06c4bb2a5f836b0fc6bccbbaa995b3': 0,
  '0xf16ec50ec49abc95fa793c7871682833b6bc47e7': 1300,
  '0xfca466f2fa8e667a517c9c6cfa99cf985be5d9b1': 300,
  '0x74dd45dd579cad749f9381d6227e7e02277c944b': 300,
  '0x428360b02c1269bc1c79fbc399ad31d58c1e8fda': 200,
  '0x119fd89e56e3845b520644dcedf4a86cd0b66aa6': 300,
};

export const paraswapTaxSell: { [key: string]: number } = {
  '0xed88227296943857409a8e0f15ad7134e70d0f73': 100,
  '0x37eb60f78e06c4bb2a5f836b0fc6bccbbaa995b3': 0,
  '0xf16ec50ec49abc95fa793c7871682833b6bc47e7': 1300,
  '0xfca466f2fa8e667a517c9c6cfa99cf985be5d9b1': 300,
  '0x74dd45dd579cad749f9381d6227e7e02277c944b': 300,
  '0x428360b02c1269bc1c79fbc399ad31d58c1e8fda': 600,
  '0x119fd89e56e3845b520644dcedf4a86cd0b66aa6': 300,
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
      USDCE[ChainId.MATIC],
      USDT[ChainId.MATIC],
      MI[ChainId.MATIC],
      DAI[ChainId.MATIC],
      axlUSDC[ChainId.MATIC],
      BOB[ChainId.MATIC],
      TUSD[ChainId.MATIC],
      UND[ChainId.MATIC],
      USDD[ChainId.MATIC],
      DAVOS[ChainId.MATIC],
      USDV[ChainId.MATIC],
      EURO3[ChainId.MATIC],
    ],
    [ChainId.MUMBAI]: [],
    [ChainId.DOGECHAIN]: [
      USDC[ChainId.DOGECHAIN],
      USDT[ChainId.DOGECHAIN],
      DAI[ChainId.ZKEVM],
      MI[ChainId.DOGECHAIN],
    ],
    [ChainId.DOEGCHAIN_TESTNET]: [],
    [ChainId.ZKEVM]: [
      USDC[ChainId.ZKEVM],
      DAI[ChainId.ZKEVM],
      USDT[ChainId.ZKEVM],
      FRAX[ChainId.ZKEVM],
      USDCE[ChainId.ZKEVM],
      DAIE[ChainId.ZKEVM],
      MI[ChainId.ZKEVM],
    ],
    [ChainId.ZKTESTNET]: [],
    [ChainId.KAVA]: [],
    [ChainId.MANTA]: [
      USDC[ChainId.MANTA],
      USDT[ChainId.MANTA],
      DAI[ChainId.MANTA],
    ],
    [ChainId.ZKATANA]: [USDC[ChainId.ZKATANA]],
    [ChainId.TIMX]: [USDC[ChainId.TIMX]],
    [ChainId.BTTC]: [],
    [ChainId.X1]: [USDC[ChainId.X1]],
    [ChainId.IMX]: [USDC[ChainId.IMX], USDT[ChainId.IMX]],
    [ChainId.ASTARZKEVM]: [
      USDC[ChainId.ASTARZKEVM],
      USDT[ChainId.ASTARZKEVM],
      DAI[ChainId.ASTARZKEVM],
    ],
    [ChainId.LAYERX]: [
      USDC[ChainId.LAYERX],
      USDT[ChainId.LAYERX],
      DAI[ChainId.LAYERX],
    ],
  },
  blueChips: {
    [ChainId.MATIC]: [
      WETH[ChainId.MATIC],
      ETHER[ChainId.MATIC],
      WBTC[ChainId.MATIC],
      USDC[ChainId.MATIC],
      USDCE[ChainId.MATIC],
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
      USDCE[ChainId.ZKEVM],
      DAIE[ChainId.ZKEVM],
    ],
    [ChainId.ZKTESTNET]: [],
    [ChainId.KAVA]: [],
    [ChainId.MANTA]: [
      WETH[ChainId.MANTA],
      WBTC[ChainId.MANTA],
      USDC[ChainId.MANTA],
      USDT[ChainId.MANTA],
      DAI[ChainId.MANTA],
      MATIC[ChainId.MANTA],
    ],
    [ChainId.ZKATANA]: [WETH[ChainId.ZKATANA], USDC[ChainId.ZKATANA]],
    [ChainId.TIMX]: [WETH[ChainId.TIMX], USDC[ChainId.TIMX]],
    [ChainId.BTTC]: [],
    [ChainId.X1]: [WETH[ChainId.X1], USDC[ChainId.X1]],
    [ChainId.IMX]: [
      WETH[ChainId.IMX],
      USDC[ChainId.IMX],
      ETHER[ChainId.IMX],
      WBTC[ChainId.IMX],
      USDT[ChainId.IMX],
    ],
    [ChainId.ASTARZKEVM]: [
      WETH[ChainId.ASTARZKEVM],
      WBTC[ChainId.ASTARZKEVM],
      USDC[ChainId.ASTARZKEVM],
      USDT[ChainId.ASTARZKEVM],
      DAI[ChainId.ASTARZKEVM],
      MATIC[ChainId.ASTARZKEVM],
    ],
    [ChainId.LAYERX]: [
      WETH[ChainId.LAYERX],
      USDC[ChainId.LAYERX],
      USDT[ChainId.LAYERX],
      DAI[ChainId.LAYERX],
      WBTC[ChainId.LAYERX],
    ],
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
    [ChainId.KAVA]: [],
    [ChainId.MANTA]: [
      [MATICX[ChainId.MANTA], MATIC[ChainId.MANTA]],
      [WETH[ChainId.MANTA], WSTETH[ChainId.MANTA]],
    ],
    [ChainId.ZKATANA]: [],
    [ChainId.TIMX]: [],
    [ChainId.BTTC]: [],
    [ChainId.X1]: [],
    [ChainId.IMX]: [],
    [ChainId.ASTARZKEVM]: [
      [WETH[ChainId.ASTARZKEVM], WSTETH[ChainId.ASTARZKEVM]],
    ],
    [ChainId.LAYERX]: [],
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
    {
      name: 'Past Winners',
      address: 'past-winners',
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

export const unipilotVaultTypes = ['Wide', 'Balanced', 'Narrow'];

export const BOND_QUERY_KEYS = {
  INDUSTRY_STATS: 'industryStats',
  HISTORICAL_INDUSTRY_STATS: 'historicalIndustryStats',
  LHD_PROFILES: 'lhdProfiles',
  LHD_PROFILE: 'lhdProfile',
  LHD_PASSWORD_VERIFIED: 'lhdPasswordVerified',
  HOMEPAGE_STATS: 'homepageStats',
  LIVE_AND_UPCOMING: 'liveAndUpcoming',
  TVL_STATS: 'tvlStats',
  WIDO_QUOTE: 'widoQuote',
  WIDO_ALLOWANCE: 'widoAllowance',
  WIDO_APPROVAL: 'widoApproval',
  WIDO_SIGN_APPROVAL: 'widoSignApproval',
  TOKEN_HISTORIC: 'tokenHistoric',
  BONDS_LANDING: 'bondsLanding',
  BOND_POST_REFERENCE: 'bondPostReference',
};

export const zapInputTokens: Partial<Record<ChainId, BondToken[]>> = {
  [ChainId.MATIC]: [
    {
      symbol: 'wMATIC',
      address: {
        [ChainId.MATIC]: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
      },
      decimals: {
        [ChainId.MATIC]: 18,
      },
      active: true,
    },
    {
      symbol: 'USDC.e',
      address: {
        [ChainId.MATIC]: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      },
      decimals: {
        [ChainId.MATIC]: 6,
      },
      active: true,
    },
    {
      symbol: 'USDC',
      address: {
        [ChainId.MATIC]: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      },
      decimals: {
        [ChainId.MATIC]: 6,
      },
      active: true,
    },
    {
      symbol: 'USDT',
      address: {
        [ChainId.MATIC]: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      },
      decimals: {
        [ChainId.MATIC]: 6,
      },
      active: true,
    },
    {
      symbol: 'DAI',
      address: {
        [ChainId.MATIC]: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      },
      decimals: {
        [ChainId.MATIC]: 18,
      },
      active: true,
    },
    {
      symbol: 'wETH',
      address: {
        [ChainId.MATIC]: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      },
      decimals: {
        [ChainId.MATIC]: 18,
      },
      active: true,
    },
    {
      symbol: 'BTC',
      address: {
        [ChainId.MATIC]: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
      },
      decimals: {
        [ChainId.MATIC]: 18,
      },
      active: true,
    },
  ],
};
