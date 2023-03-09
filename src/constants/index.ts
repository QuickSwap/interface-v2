import { ChainId, JSBI, Percent, Token, WETH } from '@uniswap/sdk';
import { AbstractConnector } from '@web3-react/abstract-connector';
import {
  injected,
  walletconnect,
  walletlink,
  portis,
  arkaneconnect,
  safeApp,
  trustconnect,
  unstopabbledomains,
  metamask,
  zengoconnect,
} from '../connectors';
import MetamaskIcon from 'assets/images/metamask.png';
import BlockWalletIcon from 'assets/images/blockwalletIcon.svg';
import BraveWalletIcon from 'assets/images/braveWalletIcon.png';
import cypherDIcon from 'assets/images/cypherDIcon.png';
import BitKeepIcon from 'assets/images/bitkeep.png';
import CoinbaseWalletIcon from 'assets/images/coinbaseWalletIcon.svg';
import WalletConnectIcon from 'assets/images/walletConnectIcon.svg';
import PortisIcon from 'assets/images/portisIcon.png';
import VenlyIcon from 'assets/images/venly.svg';
import GnosisIcon from 'assets/images/gnosis_safe.png';
import TrustIcon from 'assets/images/trust.png';
import ZengoIcon from 'assets/images/zengo.webp';
import { Presets } from 'state/mint/v3/reducer';
import UnstoppableDomainsIcon from 'assets/images/unstoppableDomains.png';

const WETH_ONLY: ChainTokenList = {
  [ChainId.MUMBAI]: [WETH[ChainId.MUMBAI]],
  [ChainId.MATIC]: [WETH[ChainId.MATIC]],
};

// TODO: Remove this constant when supporting multichain
export const MATIC_CHAIN = ChainId.MATIC;

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
};

export const BONUS_CUTOFF_AMOUNT = {
  [ChainId.MUMBAI]: 0,
  [ChainId.MATIC]: 0,
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
    PARASWAP_PROXY_ROUTER_ADDRESS: {
      [ChainId.MATIC]: '0x216b4b4ba9f3e719726886d34a177484278bfcae',
      [ChainId.MUMBAI]: undefined,
    },
    PARASWAP_ROUTER_ADDRESS: {
      [ChainId.MATIC]: '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57',
      [ChainId.MUMBAI]: undefined,
    },
    SWAP_ROUTER_ADDRESS: {
      [ChainId.MATIC]: '0xfaa746afc5ff7d5ef0aa469bb26ddd6cd8f13911',
      [ChainId.MUMBAI]: undefined,
    },
    ROUTER_ADDRESS: {
      [ChainId.MATIC]: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
      [ChainId.MUMBAI]: '0x8954AfA98594b838bda56FE4C12a09D7739D179b',
    }, //'0x6207A65a8bbc87dD02C3109D2c74a6bCE4af1C8c';//
    ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',
    LAIR_ADDRESS: '0xf28164a485b0b2c90639e47b0f377b4a438a16b1',
    NEW_LAIR_ADDRESS: '0x958d208Cdf087843e9AD98d23823d32E17d723A1',
    QUICK_ADDRESS: '0x831753DD7087CaC61aB5644b308642cc1c33Dc13',
    NEW_QUICK_ADDRESS: '0xB5C064F955D8e7F38fE0460C556a72987494eE17',
    FACTORY_ADDRESS: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
    GOVERNANCE_ADDRESS: '0x5e4be8Bc9637f0EAA1A755019e06A68ce081D58F', //TODO: MATIC
    MERKLE_DISTRIBUTOR_ADDRESS: {
      // TODO: specify merkle distributor for mainnet
      [ChainId.MATIC]: '0x4087F566796b46eEB01A38174c06E2f9924eAea8', //TODO: MATIC
      [ChainId.MUMBAI]: undefined,
    },
    QUICK_CONVERSION: '0x333068d06563a8dfdbf330a0e04a9d128e98bf5a',
    MATIC_USDT_PAIR: '0x604229c960e5cacf2aaeac8be68ac07ba9df81c3',
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
    TRUST_WALLET: 'Trust Wallet',
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

export interface GammaPair {
  address: string;
  title: string;
  type: Presets;
  token0Address: string;
  token1Address: string;
  ableToFarm?: boolean;
  pid?: number;
}

export const GammaPairs: {
  [key: string]: GammaPair[];
} = {
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
      ableToFarm: true,
      pid: 18,
    },
    {
      type: Presets.GAMMA_WIDE,
      title: 'Wide',
      address: '0xccbbb572eb5edc973a90fdc57d07d7740bb027f5',
      token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
      token1Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
      ableToFarm: true,
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
      ableToFarm: true,
      pid: 20,
    },
    {
      type: Presets.GAMMA_WIDE,
      title: 'Wide',
      address: '0x5ec3511b49d4fe7798015a26a83abdc01261615b',
      token0Address: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
      token1Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
      ableToFarm: true,
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
      ableToFarm: true,
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
      ableToFarm: true,
      pid: 30,
    },
    {
      type: Presets.GAMMA_WIDE,
      title: 'Wide',
      address: '0x46840e073376178b1e669693c021329b17fb22aa',
      token0Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
      token1Address: '0xe5417af564e4bfda1c483642db72007871397896',
      ableToFarm: true,
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
      ableToFarm: true,
      pid: 32,
    },
    {
      type: Presets.GAMMA_WIDE,
      title: 'Wide',
      address: '0x69b2aaaf08ac9b04cd5b64a1d23ffcb40224fdaf',
      token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
      token1Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
      ableToFarm: true,
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
      ableToFarm: true,
      pid: 34,
    },
    {
      type: Presets.GAMMA_WIDE,
      title: 'Wide',
      address: '0x3ae59be14da16183f0a36e23518506c386e63a96',
      token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
      token1Address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
      ableToFarm: true,
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
      ableToFarm: true,
      pid: 36,
    },
    {
      type: Presets.GAMMA_WIDE,
      title: 'Wide',
      address: '0x2e18b825b049c4994370b0db6c35d0100295b96c',
      token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
      token1Address: '0xd0258a3fd00f38aa8090dfee343f10a9d4d30d3f',
      ableToFarm: true,
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
      ableToFarm: true,
      pid: 40,
    },
    {
      type: Presets.GAMMA_WIDE,
      title: 'Wide',
      address: '0x9a4b458a5ae5d96565455d1e1882301fea5c076f',
      token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
      token1Address: '0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b',
      ableToFarm: true,
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
      ableToFarm: true,
      pid: 42,
    },
    {
      type: Presets.GAMMA_WIDE,
      title: 'Wide',
      address: '0xee2a89071654333703b3d6c9be9ab8f085f977de',
      token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
      token1Address: '0xd0258a3fd00f38aa8090dfee343f10a9d4d30d3f',
      ableToFarm: true,
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
      ableToFarm: true,
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
      ableToFarm: true,
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
      ableToFarm: true,
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
      ableToFarm: true,
      pid: 51,
    },
    {
      type: Presets.GAMMA_WIDE,
      title: 'Wide',
      address: '0x535206aaeca58c038ef28ce9924c7782bbb3d94d',
      token0Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
      token1Address: '0xb5c064f955d8e7f38fe0460c556a72987494ee17',
      ableToFarm: true,
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
      ableToFarm: true,
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
};

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  CYPHERD: {
    connector: injected,
    name: GlobalConst.walletName.CYPHERD,
    iconName: cypherDIcon,
    description: 'CypherD browser extension.',
    href: null,
    color: '#E8831D',
  },
  METAMASK: {
    connector: metamask,
    name: GlobalConst.walletName.METAMASK,
    iconName: MetamaskIcon,
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D',
  },
  TRUST_WALLET: {
    connector: trustconnect,
    name: GlobalConst.walletName.TRUST_WALLET,
    iconName: TrustIcon,
    description: 'Trust wallet extension.',
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
  BRAVEWALLET: {
    connector: injected,
    name: GlobalConst.walletName.BRAVEWALLET,
    iconName: BraveWalletIcon,
    description: 'Brave browser wallet.',
    href: null,
    color: '#1673ff',
    mobile: true,
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
  UNSTOPABBLEDOMAINS: {
    connector: unstopabbledomains,
    name: 'Unstoppable Domains',
    iconName: UnstoppableDomainsIcon,
    description: 'Unstoppable Domains',
    href: null,
    color: '#E8831D',
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
  ZENGO_CONNECT: {
    connector: zengoconnect,
    name: GlobalConst.walletName.ZENGO_CONNECT,
    iconName: ZengoIcon,
    description: 'Connect to Zengo Wallet',
    href: null,
    color: '#4196FC',
    mobile: true,
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
      EMPTY: new Token(
        ChainId.MATIC,
        '0x0000000000000000000000000000000000000000',
        0,
        'EMPTY',
        'EMPTY',
      ),
      USDC: new Token(
        ChainId.MATIC,
        '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        6,
        'USDC',
        'USDC',
      ),
      USDT: new Token(
        ChainId.MATIC,
        '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        6,
        'USDT',
        'Tether USD',
      ),
      OLD_QUICK: new Token(
        ChainId.MATIC,
        GlobalConst.addresses.QUICK_ADDRESS,
        18,
        'QUICK(OLD)',
        'Quickswap(OLD)',
      ),
      NEW_QUICK: new Token(
        ChainId.MATIC,
        GlobalConst.addresses.NEW_QUICK_ADDRESS,
        18,
        'QUICK(NEW)',
        'QuickSwap(NEW)',
      ),
      OLD_DQUICK: new Token(
        ChainId.MATIC,
        '0xf28164A485B0B2C90639E47b0f377b4a438a16B1',
        18,
        'dQUICK',
        'Dragon QUICK',
      ),
      NEW_DQUICK: new Token(
        ChainId.MATIC,
        '0x958d208Cdf087843e9AD98d23823d32E17d723A1',
        18,
        'dQUICK',
        'Dragon QUICK',
      ),
      WBTC: new Token(
        ChainId.MATIC,
        '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
        8,
        'wBTC',
        'Wrapped Bitcoin',
      ),
      DAI: new Token(
        ChainId.MATIC,
        '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
        18,
        'DAI',
        'Dai Stablecoin',
      ),
      ETHER: new Token(
        ChainId.MATIC,
        '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
        18,
        'ETH',
        'Ether',
      ),
      CXETH: new Token(
        ChainId.MATIC,
        '0xfe4546feFe124F30788c4Cc1BB9AA6907A7987F9',
        18,
        'cxETH',
        'CelsiusX Wrapped ETH',
      ),
      MI: new Token(
        ChainId.MATIC,
        '0xa3Fa99A148fA48D14Ed51d610c367C61876997F1',
        18,
        'MAI',
        'miMATIC',
      ),
      VERSA: new Token(
        ChainId.MATIC,
        '0x8497842420cFdbc97896C2353D75d89Fc8D5Be5D',
        18,
        'VERSA',
        'VersaGames',
      ),
      SAND: new Token(
        ChainId.MATIC,
        '0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683',
        18,
        'SAND',
        'SAND',
      ),
      MAUSDC: new Token(
        ChainId.MATIC,
        '0x9719d867A500Ef117cC201206B8ab51e794d3F82',
        6,
        'maUSDC',
        'Matic Aave interest bearing USDC',
      ),
      FRAX: new Token(
        ChainId.MATIC,
        '0x45c32fA6DF82ead1e2EF74d17b76547EDdFaFF89',
        18,
        'FRAX',
        'FRAX',
      ),
      GHST: new Token(
        ChainId.MATIC,
        '0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7',
        18,
        'GHST',
        'Aavegotchi GHST Token',
      ),
      BOB: new Token(
        ChainId.MATIC,
        '0xB0B195aEFA3650A6908f15CdaC7D92F8a5791B0B',
        18,
        'BOB',
        'BOB',
      ),
      axlUSDC: new Token(
        ChainId.MATIC,
        '0x750e4C4984a9e0f12978eA6742Bc1c5D248f40ed',
        18,
        'axlUSDC',
        'Axelar Wrapped USDC',
      ),
      TUSD: new Token(
        ChainId.MATIC,
        '0x2e1AD108fF1D8C782fcBbB89AAd783aC49586756',
        18,
        'TUSD',
        'TrueUSD',
      ),
      UND: new Token(
        ChainId.MATIC,
        '0x1eBA4B44C4F8cc2695347C6a78F0B7a002d26413',
        18,
        'UND',
        'Unbound Dollar',
      ),
      USDD: new Token(
        ChainId.MATIC,
        '0xFFA4D863C96e743A2e1513824EA006B8D0353C57',
        18,
        'USDD',
        'Decentralized USD',
      ),
      MATICX: new Token(
        ChainId.MATIC,
        '0xfa68FB4628DFF1028CFEc22b4162FCcd0d45efb6',
        18,
        'MaticX',
        'Liquid Staking Matic',
      ),
      STMATIC: new Token(
        ChainId.MATIC,
        '0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4',
        18,
        'stMatic',
        'Staked MATIC',
      ),
    },
  },
  marketSDK: {
    QS_PoolDirectory: '0xDeFf0321cD7E62Dccc6df90A3C0720E0a3449CB4',
    QS_Pools: [
      '0x627742AaFe82EB5129DD33D237FF318eF5F76CBC',
      '0x9BE35bc002235e96deC9d3Af374037aAf62BDeF7',
      '0x1eD65DbBE52553A02b4bb4bF70aCD99e29af09f8',
    ],
    LENS: '0x4B1dfA99d53FFA6E4c0123956ec4Ac2a6D9F4c75',
    BLOCKSPERDAY: 0.5 * GlobalConst.utils.ONEDAYSECONDS,
  },
};

export const paraswapTax: { [key: string]: number } = {
  '0xed88227296943857409a8e0f15ad7134e70d0f73': 100,
  '0x37eb60f78e06c4bb2a5f836b0fc6bccbbaa995b3': 0,
  '0xf16ec50ec49abc95fa793c7871682833b6bc47e7': 1300,
};

export const GlobalData = {
  bases: {
    // used to construct intermediary pairs for trading
    BASES_TO_CHECK_TRADES_AGAINST: {
      ...WETH_ONLY,
      [ChainId.MATIC]: [
        ...WETH_ONLY[ChainId.MATIC],
        GlobalValue.tokens.COMMON.USDC,
        GlobalValue.tokens.COMMON.USDT,
        GlobalValue.tokens.COMMON.OLD_QUICK,
        GlobalValue.tokens.COMMON.NEW_QUICK,
        GlobalValue.tokens.COMMON.ETHER,
        GlobalValue.tokens.COMMON.WBTC,
        GlobalValue.tokens.COMMON.DAI,
        GlobalValue.tokens.COMMON.GHST,
        GlobalValue.tokens.COMMON.MI,
        GlobalValue.tokens.COMMON.VERSA,
      ],
    },
    // Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these tokens.
    CUSTOM_BASES: { [ChainId.MATIC]: undefined, [ChainId.MUMBAI]: undefined },
    // used for display in the default list when adding liquidity
    SUGGESTED_BASES: {
      ...WETH_ONLY,
      [ChainId.MATIC]: [
        ...WETH_ONLY[ChainId.MATIC],
        GlobalValue.tokens.COMMON.DAI,
        GlobalValue.tokens.COMMON.USDC,
        GlobalValue.tokens.COMMON.USDT,
        GlobalValue.tokens.COMMON.OLD_QUICK,
        GlobalValue.tokens.COMMON.NEW_QUICK,
        GlobalValue.tokens.COMMON.ETHER,
        GlobalValue.tokens.COMMON.WBTC,
        GlobalValue.tokens.COMMON.SAND,
        GlobalValue.tokens.COMMON.MI,
      ],
    },
    // used to construct the list of all pairs we consider by default in the frontend
    BASES_TO_TRACK_LIQUIDITY_FOR: {
      ...WETH_ONLY,
      [ChainId.MATIC]: [
        ...WETH_ONLY[ChainId.MATIC],
        GlobalValue.tokens.COMMON.DAI,
        GlobalValue.tokens.COMMON.USDC,
        GlobalValue.tokens.COMMON.USDT,
        GlobalValue.tokens.COMMON.OLD_QUICK,
        GlobalValue.tokens.COMMON.NEW_QUICK,
        GlobalValue.tokens.COMMON.ETHER,
        GlobalValue.tokens.COMMON.WBTC,
        GlobalValue.tokens.COMMON.VERSA,
      ],
    },
  },
  pairs: {
    PINNED_PAIRS: {
      [ChainId.MATIC]: [
        [GlobalValue.tokens.COMMON.USDC, GlobalValue.tokens.COMMON.USDT],
        [GlobalValue.tokens.COMMON.USDC, GlobalValue.tokens.COMMON.DAI],
        [GlobalValue.tokens.COMMON.ETHER, GlobalValue.tokens.COMMON.USDC],
        [GlobalValue.tokens.COMMON.WBTC, GlobalValue.tokens.COMMON.ETHER],
        [WETH[ChainId.MATIC], GlobalValue.tokens.COMMON.USDT],
        [WETH[ChainId.MATIC], GlobalValue.tokens.COMMON.USDC],
        [WETH[ChainId.MATIC], GlobalValue.tokens.COMMON.ETHER],
        [GlobalValue.tokens.COMMON.ETHER, GlobalValue.tokens.COMMON.OLD_QUICK],
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
  stableCoins: [
    GlobalValue.tokens.COMMON.USDC,
    GlobalValue.tokens.COMMON.USDT,
    GlobalValue.tokens.COMMON.MI,
    GlobalValue.tokens.COMMON.DAI,
    GlobalValue.tokens.COMMON.axlUSDC,
    GlobalValue.tokens.COMMON.BOB,
    GlobalValue.tokens.COMMON.TUSD,
    GlobalValue.tokens.COMMON.UND,
    GlobalValue.tokens.COMMON.USDD,
  ],
  blueChips: [
    WETH[ChainId.MATIC],
    GlobalValue.tokens.COMMON.ETHER,
    GlobalValue.tokens.COMMON.WBTC,
    GlobalValue.tokens.COMMON.USDC,
    GlobalValue.tokens.COMMON.USDT,
    GlobalValue.tokens.COMMON.DAI,
  ],
  stablePairs: [
    [
      GlobalValue.tokens.MATIC,
      GlobalValue.tokens.COMMON.MATICX,
      GlobalValue.tokens.COMMON.STMATIC,
    ],
    [GlobalValue.tokens.COMMON.NEW_QUICK, GlobalValue.tokens.COMMON.NEW_DQUICK],
  ],
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
  installLink?: string | null;
}
