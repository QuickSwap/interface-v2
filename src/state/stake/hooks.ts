import {
  ChainId,
  CurrencyAmount,
  JSBI,
  Token,
  TokenAmount,
  Pair,
} from '@uniswap/sdk';
import { useMemo, useEffect /** , useState */ } from 'react';
import { usePair } from '../../data/Reserves';

import { client, healthClient } from '../../apollo/client';
import {
  GLOBAL_DATA,
  PAIRS_BULK,
  PAIRS_HISTORICAL_BULK,
  SUBGRAPH_HEALTH,
} from '../../apollo/queries';
import {
  UNI,
  USDC,
  ETHER,
  UNITOKEN,
  QUICK,
  DAI,
  IGG,
  WBTC,
  USDT,
  MATIC,
  OM,
  GHST,
  MAUSDC,
  MAAAVE,
  SX,
  MALINK,
  MAUNI,
  MAYFI,
  MAUSDT,
  MATUSD,
  MADAI,
  MAWETH,
  SWAP,
  DB,
  GAME,
  HEX,
  FRAX,
  IFARM,
  VISION,
  DG,
  UBT,
  FXS,
  LINK,
  DSLA,
  ARIA20,
  CEL,
  SUPER,
  DEFI5,
  DEGEN,
  LAIR_ADDRESS,
  DQUICK,
  CC10,
  WISE,
  MOCEAN,
  AGA,
  AGAr,
  ELET,
  WOLF,
  GFARM2,
  AAVE,
  TEL,
  //KRILL,
  POLYDOGE,
  BIFI,
  ADDY,
  //FISH,
  UFT,
  PAUTO,
  EMON,
  FFF,
  MI,
  //ELE,
  CHUM,
  //GFI,
  QI,
  //BORING,
  //EMPTY,
  IQ,
  TITAN,
  ERN,
  IOI,
  //MEM,
  PBNB,
  RAMP,
  RUSD,
  WOO,
  QuickChart,
  START,
  CGG,
  BUNNY,
  FOR,
  RDOGE,
  FEAR,
  MBTM,
  NEXO,
  RENDGB,
  SOL,
  YAMP,
  AVAX,
  GUARD,
  GBTS,
  HONOR,
  IMX,
  PSWAMP,
  KOGECOIN,
  RELAY,
  EZ,
  POOL,
  ADS,
  HT,
  MOD,
  CIOTX,
  DNXC,
  EGG,
  REVV,
  CHICK,
  DHV,
  MONA,
  MOONED,
  OOE,
  WOW,
  XCAD,
  XED,
  ANGEL,
  CNTR,
  KOM,
  MASK,
  MEEB,
  TRADE,
  UGT,
  PERA,
  PLR,
  TCP,
  XCASH,
  ANRX,
  BNB,
  ETHA,
  MITX,
  ODDZ,
  PHX,
  REI,
  ZUSD,
  PBR,
  //TOKENA,
  //TOKENB,
  ATOM,
  D11,
  EROWAN,
  GMEE,
  KNIGHT,
  MCASH,
  WATCH,
  COMBO,
  AKT,
  IRIS,
  REGEN,
  UCO,
  XPRT,
  ALN,
  DES,
  DPI,
  FTM,
  SHIB,
  EMPTY,
  ELON,
  GNS,
  SNE,
  UFI,
  GENESIS,
  LMT,
  MCRN,
  PBTC,
  PNT,
  AUMI,
  DERC,
  UM,
  WSG,
} from '../../constants';
import {
  STAKING_REWARDS_INTERFACE,
  STAKING_DUAL_REWARDS_INTERFACE,
} from '../../constants/abis/staking-rewards';
import { useActiveWeb3React } from '../../hooks';
import {
  NEVER_RELOAD,
  useMultipleContractSingleData,
  useSingleCallResult,
  useSingleContractMultipleData,
} from '../multicall/hooks';
import { tryParseAmount } from '../swap/hooks';
import Web3 from 'web3';
import { useLairContract, useQUICKContract } from '../../hooks/useContract';
import useUSDCPrice from '../../utils/useUSDCPrice';
import { useSelector } from 'react-redux';
import { AppState } from '..';

const web3 = new Web3('https://polygon-rpc.com/');

export const STAKING_GENESIS = 1620842940;

export const REWARDS_DURATION_DAYS = 7;

let pairs: any = undefined;

let dualPairs: any = undefined;

export const SYRUP_REWARDS_INFO: {
  [chainId in ChainId]?: {
    token: Token;
    stakingRewardAddress: string;
    ended: boolean;
    name: string;
    lp: string;
    baseToken: Token;
    rate: number;
    ending: number; //DATE IN UNIX TIMESTAMP
  }[];
} = {
  [ChainId.MATIC]: [
    {
      token: MCASH,
      stakingRewardAddress: '0xb3DacE74b857C7b0F0890334B8E4770762Bcda5c',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 18333.33,
      ending: 1639241173,
    },
    {
      token: ALN,
      stakingRewardAddress: '0x568E635426804400f306c6D3Ec56D14782D74261',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 18333.33,
      ending: 1639241173,
    },
    {
      token: WATCH,
      stakingRewardAddress: '0x0B2b63500243FF87B1299A56094b76c7Db8A4087',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 3333.33,
      ending: 1639073521,
    },
    {
      token: KNIGHT,
      stakingRewardAddress: '0xCAdfDB2077c32e04a5B78cbECA6de84B1694325c',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 2166.67,
      ending: 1639073521,
    },
    {
      token: ELON,
      stakingRewardAddress: '0x0D0dD9b1f34101AF5Def323725a2e8a0C2Ba91Fc',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 4878682189.7,
      ending: 1643651726,
    },
    {
      token: DES,
      stakingRewardAddress: '0xe436235f6062Eb689Ce81e5f434A005818F7d6f0',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 3858,
      ending: 1642525260,
    },
    {
      token: D11,
      stakingRewardAddress: '0xc7E4C8024c580f2a7889b369Ea02957BcAC05b79',
      ended: false,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 728.6,
      ending: 1637341260,
    },
    {
      token: UCO,
      stakingRewardAddress: '0xC328d6eC46d11a6ABdA3C02434861beA14739E1f',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 13833.33,
      ending: 1639933260,
    },
    {
      token: ETHA,
      stakingRewardAddress: '0x2b1F043c8c97a6465F5B5A9E3F7027acb32CDC3b',
      ended: false,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 7496.53,
      ending: 1639844474,
    },
    {
      token: CNTR,
      stakingRewardAddress: '0xe59C2f9a2dCe18C6e19d63675e56BabA59a2339F',
      ended: false,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 617283.95,
      ending: 1639844474,
    },
    {
      token: PERA,
      stakingRewardAddress: '0xcA5b75C40583124DD08e7dF9cB148C0833418Fa8',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 8333.33,
      ending: 1639844474,
    },
    {
      token: RAMP,
      stakingRewardAddress: '0x0a727387f3FF6d2203ECe6CB6e430E4e25032bcd',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 8128.1,
      ending: 1639844474,
    },
    {
      token: EROWAN,
      stakingRewardAddress: '0x555670a51B56a310bcC71D55D96366F7B1ba1295',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 21891.67,
      ending: 1639844474,
    },
    {
      token: XCAD,
      stakingRewardAddress: '0xbdF64bf352D1291587b09a28984eE06d3b6538eE',
      ended: false,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 1300,
      ending: 1639844474,
    },
    {
      token: MATIC,
      stakingRewardAddress: '0xd6Ce4f3D692C1c6684fb449993414C5c9E5D0073',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 2783.33,
      ending: 1639155366,
    },
    {
      token: COMBO,
      stakingRewardAddress: '0xFAcba3A45354f27442406Df293D9C68FD8f0A8b1',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 8484.44,
      ending: 1641401056,
    },
    {
      token: GMEE,
      stakingRewardAddress: '0xA0532E8c435437fE2473b84467ea79ab200f594c',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 15555.56,
      ending: 1641401056,
    },
    {
      token: PBR,
      stakingRewardAddress: '0xa751f7B39F6c111d10e2C603bE2a12bd5F70Fc83',
      ended: false,
      lp: '',
      name: '',
      baseToken: USDT,
      rate: 3333.33,
      ending: 1638280789,
    },
    {
      token: PHX,
      stakingRewardAddress: '0xcE4c95014Bd54B1D3ff30dbb585009aDf7358b0b',
      ended: false,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 12000,
      ending: 1638027392,
    },
    {
      token: REI,
      stakingRewardAddress: '0xc9097837c52f0e9785539BD2d265df7fA890cb1A',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 5127.75,
      ending: 1638027392,
    },
    {
      token: MITX,
      stakingRewardAddress: '0xBBD9146D2A687C0df7e6201D7b8cc4cebc5DF976',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 29609.1,
      ending: 1637513623,
    },
    {
      token: OM,
      stakingRewardAddress: '0x304cd598F973208888e959D7f808052Ab863A7eA',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 15833.33,
      ending: 1637076798,
    },
    {
      token: ELET,
      stakingRewardAddress: '0x18e23130973AA586652BB6d472f0eEf05a88fD3E',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 83333.33,
      ending: 1637076798,
    },
    {
      token: ODDZ,
      stakingRewardAddress: '0x8DBa41FD5aDD941825f96a33b58d3242db7b918f',
      ended: false,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 4065.05,
      ending: 1637076798,
    },
    {
      token: XCASH,
      stakingRewardAddress: '0xe01e81c76253831602520582793991650225Bf81',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 27777777.78,
      ending: 1639408820,
    },
    {
      token: TCP,
      stakingRewardAddress: '0x6d05D7aC6CC4b8A5552CF26cA04583c95e2F2b98',
      ended: false,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 17475.7,
      ending: 1636816820,
    },
    {
      token: MEEB,
      stakingRewardAddress: '0x639F9394Ca689824ABE4e3d4D6acdB726f4a54F0',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 166.67,
      ending: 1636816820,
    },
    {
      token: TEL,
      stakingRewardAddress: '0x346C9e501aDc38F1f325CC0c2D44C325283eEaF1',
      ended: false,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 333333.33,
      ending: 1640200125,
    },
  ],
};

export const OLD_SYRUP_REWARDS_INFO: {
  [chainId in ChainId]?: {
    token: Token;
    stakingRewardAddress: string;
    ended: boolean;
    name: string;
    lp: string;
    baseToken: Token;
    rate: number;
    ending: number; //DATE IN UNIX TIMESTAMP
  }[];
} = {
  [ChainId.MATIC]: [
    {
      token: PLR,
      stakingRewardAddress: '0x6E0635d3a2c76b38B69aB8Ef3c1a970D9e3475Fc',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 38402,
      ending: 1636390770,
    },
    {
      token: KOM,
      stakingRewardAddress: '0x3B1ed79d61d13Ea50863c0667BAb5Da335feeD0b',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 1000000,
      ending: 1636390770,
    },
    {
      token: ANGEL,
      stakingRewardAddress: '0x1D68F94a1c56ef1706cf2BB66F671E3830B3B0bA',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 6666.67,
      ending: 1635960912,
    },
    {
      token: TRADE,
      stakingRewardAddress: '0x9f48eB6E139855ebc89de973ea91c7596583E6Bc',
      ended: true,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 2458,
      ending: 1636117833,
    },
    {
      token: MASK,
      stakingRewardAddress: '0x15cB4132e4438F11fde5199aC6aE15881f1C1456',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 641.03,
      ending: 1635858286,
    },
    {
      token: SWAP,
      stakingRewardAddress: '0xf2717feF528DF66450511F869517086c26452De7',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 3133.33,
      ending: 1635700624,
    },
    {
      token: BUNNY,
      stakingRewardAddress: '0x12388Ea2585cf0F69Fea6A09763A6a3B0fB30257',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 874.49,
      ending: 1635700624,
    },
    {
      token: MONA,
      stakingRewardAddress: '0xDa8805782Fa38f859b7D0001bedfE498faFca94a',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 1.52,
      ending: 1635263542,
    },
    {
      token: OOE,
      stakingRewardAddress: '0xa5ce7598af3F76c3A254CDDc62f914bBa9d8B7bd',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 2166.66,
      ending: 1635095958,
    },
    {
      token: XED,
      stakingRewardAddress: '0xaD1862888d33F2EA8d4E5025e5fe01916f01b856',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 3030.3,
      ending: 1635095958,
    },
    {
      token: DHV,
      stakingRewardAddress: '0xAb226093369B3D45209D84fb891397d418CaEe68',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 555.55,
      ending: 1635263542,
    },
    {
      token: MOONED,
      stakingRewardAddress: '0xd66Df9f7Da33C90Ab21601349D5f44eCbB4a1e63',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 27333.33,
      ending: 1635263542,
    },
    {
      token: HONOR,
      stakingRewardAddress: '0x1EFcD619455419ebE566eDFe0D46DC57139f052F',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 75757.57,
      ending: 1634921623,
    },
    {
      token: START,
      stakingRewardAddress: '0xBC00cF775D78b50925895A872Aa945B728dB0EBB',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 116.67,
      ending: 1634680134,
    },
    {
      token: RELAY,
      stakingRewardAddress: '0x747fC94E52ba06D870Cb793e11C98D7688b28887',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 500,
      ending: 1634680134,
    },
    {
      token: DNXC,
      stakingRewardAddress: '0x476231Ca1c748fd84e5c759a03F6FB0852fA110B',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 4800,
      ending: 1634680134,
    },
    {
      token: REVV,
      stakingRewardAddress: '0xBDeaCb01103C6459ED05c4836082b41143825F49',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 16816.67,
      ending: 1634680134,
    },
    {
      token: YAMP,
      stakingRewardAddress: '0x88A989A72fF3981cE02cE3CB5ec81A23C1058382',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 9333.33,
      ending: 1634680134,
    },
    {
      token: FEAR,
      stakingRewardAddress: '0x886d5186Be0255ed4b7DAcB4c493aF6f8cD1ed04',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 1157,
      ending: 1634680134,
    },
    {
      token: CHICK,
      stakingRewardAddress: '0xBe35a3238bd6fdde7a7749CB8702d5f17217c1a5',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 3333.33,
      ending: 1634680134,
    },
    {
      token: ADS,
      stakingRewardAddress: '0xC6b141B27c82d6DB104440edE21d4F8E046B6Aa2',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 2150,
      ending: 1634680134,
    },
    {
      token: CIOTX,
      stakingRewardAddress: '0x54B1e1A8F2472230DB6092833249675Fc2E8DFe1',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 16666.67,
      ending: 1634680134,
    },
    {
      token: ADDY,
      stakingRewardAddress: '0x3429f08D507EfBcA7B41BC0F99e9276918495F97',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 59.5,
      ending: 1634680134,
    },
    {
      token: POLYDOGE,
      stakingRewardAddress: '0x0b32AC0A9b6bfdd0E24cd2f4d37d82F8d05B44d8',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 333333333333.33,
      ending: 1634410234,
    },
    {
      token: ANRX,
      stakingRewardAddress: '0xfd0A00b0B9b2D05fa4152Ebd25cD85a4F527B375',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 17768.33,
      ending: 1634317059,
    },
    {
      token: GUARD,
      stakingRewardAddress: '0x4D1677B68C33a0e4002c0B54e15E599F287185A4',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 3333.33,
      ending: 1634224820,
    },
    {
      token: WOW,
      stakingRewardAddress: '0xb13dCB81D1f0b42aA682c0Fb5A5262D89bc509aC',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 196.67,
      ending: 1633108624,
    },
  ],
};

let oneDayVol: any = undefined;

export const STAKING_DUAL_REWARDS_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token];
    stakingRewardAddress: string;
    ended: boolean;
    name: string;
    lp: string;
    baseToken: Token;
    rewardTokenA: Token;
    rewardTokenB: Token;
    rewardTokenBBase: Token;
    rateA: number;
    rateB: number;
    pair: string;
  }[];
} = {
  [ChainId.MATIC]: [
    {
      tokens: [MATIC, ETHER],
      stakingRewardAddress: '0x3c1f53fed2238176419F8f897aEc8791C499e3c8',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rewardTokenA: DQUICK,
      rewardTokenB: MATIC,
      rewardTokenBBase: USDC,
      rateA: 30.537,
      rateB: 3000,
      pair: '0xadbf1854e5883eb8aa7baf50705338739e558e5b',
    },
    {
      tokens: [MATIC, USDC],
      stakingRewardAddress: '0x14977e7E263FF79c4c3159F497D9551fbE769625',
      ended: false,
      lp: '',
      name: '',
      baseToken: USDC,
      rewardTokenA: DQUICK,
      rewardTokenB: MATIC,
      rewardTokenBBase: USDC,
      rateA: 11.745,
      rateB: 3000,
      pair: '0x6e7a5fafcec6bb1e78bae2a1f0b612012bf14827',
    },
    {
      tokens: [MATIC, USDT],
      stakingRewardAddress: '0xc0eb5d1316b835F4B584B59f922d9c87cA5053E5',
      ended: false,
      lp: '',
      name: '',
      baseToken: USDT,
      rewardTokenA: DQUICK,
      rewardTokenB: MATIC,
      rewardTokenBBase: USDC,
      rateA: 5.481,
      rateB: 2500,
      pair: '0x604229c960e5cacf2aaeac8be68ac07ba9df81c3',
    },
    {
      tokens: [MATIC, QUICK],
      stakingRewardAddress: '0xd26E16f5a9dfb9Fe32dB7F6386402B8AAe1a5dd7',
      ended: false,
      lp: '',
      name: '',
      baseToken: MATIC,
      rewardTokenA: DQUICK,
      rewardTokenB: MATIC,
      rewardTokenBBase: USDC,
      rateA: 11.745,
      rateB: 1500,
      pair: '0x019ba0325f1988213d448b3472fa1cf8d07618d7',
    },
    {
      tokens: [GENESIS, QUICK],
      stakingRewardAddress: '0x3620418dD43853c35fF8Df90cAb5508FB5df46Bf',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rewardTokenA: DQUICK,
      rewardTokenB: GENESIS,
      rewardTokenBBase: QUICK,
      rateA: 3.835,
      rateB: 25000,
      pair: '0xf0696be85fa54f7a8c9f20aa98aa4409cd5c9d1b',
    },
  ],
};
// TODO add staking rewards addresses here
export const STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token];
    stakingRewardAddress: string;
    ended: boolean;
    name: string;
    lp: string;
    baseToken: Token;
    rate: number;
    pair: string;
  }[];
} = {
  [ChainId.MATIC]: [
    {
      tokens: [ETHER, USDC],
      stakingRewardAddress: '0xbB703E95348424FF9e94fbE4FB524f6d280331B8',
      ended: false,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 32.466,
      pair: '0x853ee4b2a13f8a742d64c8f088be7ba2131f670d',
    },
    {
      tokens: [WBTC, ETHER],
      stakingRewardAddress: '0x2972175e1a35C403B5596354D6459C34Ae6A1070',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 13.141,
      pair: '0xdc9232e2df177d7a12fdff6ecbab114e2231198d',
    },
    {
      tokens: [ETHER, USDT],
      stakingRewardAddress: '0x45a5CB25F3E3bFEe615F6da0731740093F59b768',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 10.822,
      pair: '0xf6422b997c7f54d1c6a6e103bcb1499eea0a7046',
    },
    {
      tokens: [ETHER, QUICK],
      stakingRewardAddress: '0x5BcFcc24Db0A16b1C01BAC1342662eBd104e816c',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 8.503,
      pair: '0x1bd06b96dd42ada85fdd0795f3b4a79db914add5',
    },
    {
      tokens: [AAVE, ETHER],
      stakingRewardAddress: '0x9891548FB271C2350bd0FA25eb56A3b558cD4A64',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 7.73,
      pair: '0x90bc3e68ba8393a3bf2d79309365089975341a43',
    },
    {
      tokens: [DAI, ETHER],
      stakingRewardAddress: '0x8d6b2dBa9e85b897Dc97eD262C1aa3e4D76477dF',
      ended: false,
      lp: '',
      name: '',
      baseToken: DAI,
      rate: 7.73,
      pair: '0x4a35582a710e1f4b2030a3f826da20bfb6703c09',
    },
    {
      tokens: [MI, USDT],
      stakingRewardAddress: '0x06e49078b1900A8489462Cd2355ED8c09f507499',
      ended: false,
      lp: '',
      name: '',
      baseToken: USDT,
      rate: 6.184,
      pair: '0xe89fae1b4ada2c869f05a0c96c87022dadc7709a',
    },
    {
      tokens: [MI, DAI],
      stakingRewardAddress: '0xb827B23e2276ceB912CB42088ab064800447c158',
      ended: false,
      lp: '',
      name: '',
      baseToken: DAI,
      rate: 6.184,
      pair: '0x74214f5d8aa71b8dc921d8a963a1ba3605050781',
    },
    {
      tokens: [WBTC, USDC],
      stakingRewardAddress: '0xBF0b0DEF82C1D473e6B8770458Ddc82f5C8C7504',
      ended: false,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 5.411,
      pair: '0xf6a637525402643b0654a54bead2cb9a83c8b498',
    },
    {
      tokens: [DERC, USDC],
      stakingRewardAddress: '0xaBECe67c01cd2E8ecBFaA311bd08EC299dA03629',
      ended: false,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 5.411,
      pair: '0x0a8a3cb9a21c893a207826e76125ef6faaad99ec',
    },
    {
      tokens: [QI, ETHER],
      stakingRewardAddress: '0x17fE4630A855FF6e546C19c315BE7f3ED01f38Ff',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 4.638,
      pair: '0x8c1b40ea78081b70f661c3286c74e71b4602c9c0',
    },
    {
      tokens: [LINK, ETHER],
      stakingRewardAddress: '0x1b077a0586b2ABD4062a39E6368E256dB2F723c4',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 4.638,
      pair: '0x5ca6ca6c3709e1e6cfe74a50cf6b2b6ba2dadd67',
    },
    {
      tokens: [USDC, QUICK],
      stakingRewardAddress: '0x939290Ed45514E82900BA767bBcfa38eE1067039',
      ended: false,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 4.638,
      pair: '0x1f1e4c845183ef6d50e9609f16f6f9cae43bc9cb',
    },
    {
      tokens: [POLYDOGE, QUICK],
      stakingRewardAddress: '0x403A2604226585Cb1e07D644780930D650EA4b73',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 4.638,
      pair: '0xbedee6a7c572aa855a0c84d2f504311d482862f4',
    },
    {
      tokens: [XCASH, QUICK],
      stakingRewardAddress: '0x7E9E46BBAa92a2d18c17B8e8c537Cc488f0f1559',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 3.865,
      pair: '0x30167fea9499c11795bfd104667240bdac939d3a',
    },
    {
      tokens: [USDC, USDT],
      stakingRewardAddress: '0xAFB76771C98351Aa7fCA13B130c9972181612b54',
      ended: false,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 3.865,
      pair: '0x2cf7252e74036d1da831d11089d326296e64a728',
    },
    {
      tokens: [UCO, ETHER],
      stakingRewardAddress: '0x81f0076780F7CeeF57E801b10EF9DbC92f3a2B5a',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 3.865,
      pair: '0x25bae75f6760ac30554cc62f9282307c3038c3a0',
    },
    {
      tokens: [ELON, ETHER],
      stakingRewardAddress: '0x79A8337F65127A2d1DF164AE23065f39102A1a5f',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 3.865,
      pair: '0x13305f843e66f7cc7f9cb1bbc40dabee7086d1f8',
    },
    {
      tokens: [LMT, ETHER],
      stakingRewardAddress: '0x0997BA719cdF1F216d8A14b52AD3355Bd2F9f477',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 3.865,
      pair: '0x82ee4008e2de03f3a3e25434506f0d4d423afaad',
    },
    {
      tokens: [WSG, QUICK],
      stakingRewardAddress: '0x3f7D24d2157d114366f96ddA987448Ebf50a0D09',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 3.865,
      pair: '0xaddd6bed667c361087a97b34b1a0da4e0d0131ed',
    },
    {
      tokens: [RUSD, USDC],
      stakingRewardAddress: '0x94d024C05E2eae6ee3C9E0711D3E18C80F8CebA8',
      ended: false,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 3.092,
      pair: '0x5ef8747d1dc4839e92283794a10d448357973ac0',
    },
    {
      tokens: [GMEE, QUICK],
      stakingRewardAddress: '0x5454862d457d0e87f68Ff2eb6c2Ffb12FE5f254b',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 3.092,
      pair: '0xfe4ba2ab8562b6204a17f19651c760818a361571',
    },
    {
      tokens: [EROWAN, QUICK],
      stakingRewardAddress: '0xf113B8dec8368b7FeC4802fF7126cA317131F7cF',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 3.092,
      pair: '0x631f39d22430e889a3cfbea4fd73ed101059075f',
    },
    {
      tokens: [EROWAN, ATOM],
      stakingRewardAddress: '0x70C674bCe0aEc05E0d13bFEdd692b2F231323899',
      ended: false,
      lp: '',
      name: '',
      baseToken: ATOM,
      rate: 3.092,
      pair: '0x7051810a53030171f01d89e9aebd8a599de1b530',
    },
    {
      tokens: [SHIB, MATIC],
      stakingRewardAddress: '0x807a2EF804a8557bF5eC9c03FF869888E6af8E83',
      ended: false,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 3.092,
      pair: '0x5fb641de2663e8a94c9dea0a539817850d996e99',
    },
    {
      tokens: [SNE, USDC],
      stakingRewardAddress: '0xeB029E7a319207db79C54fdf4ee377Fe749A90b3',
      ended: false,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 3.092,
      pair: '0x23baf6d86c80eb18b1799763ea47eae6fe727767',
    },
    {
      tokens: [UNITOKEN, ETHER],
      stakingRewardAddress: '0x76cC4059Dd19518c377934CD799615B3543967fd',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 2.319,
      pair: '0xf7135272a5584eb116f5a77425118a8b4a2ddfdb',
    },
    {
      tokens: [MCASH, ETHER],
      stakingRewardAddress: '0xd24FdB548704D8C6AA1e15B238E4cBe10d214119',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 2.319,
      pair: '0x1fef1ce437bb025c08609e0c14ab916622bd09f4',
    },
    {
      tokens: [START, QUICK],
      stakingRewardAddress: '0xB1B2e2b4cBED8e7b6FF7Cca016760ccA9260f0Ec',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 2.319,
      pair: '0x9e2b254c7d6ad24afb334a75ce21e216a9aa25fc',
    },
    {
      tokens: [UFI, MATIC],
      stakingRewardAddress: '0xa34cd2445597DEBcD8E1B85D45E9A075EA485d20',
      ended: false,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 2.319,
      pair: '0x8095d1fb36138fc492337a63c52d03764d12e771',
    },
    {
      tokens: [GNS, DAI],
      stakingRewardAddress: '0x33025b177A35F6275b78f9c25684273fc24B4e43',
      ended: false,
      lp: '',
      name: '',
      baseToken: DAI,
      rate: 2.319,
      pair: '0x6e53cb6942e518376e9e763554db1a45ddcd25c4',
    },
    {
      tokens: [AUMI, MATIC],
      stakingRewardAddress: '0x7549bD32cAbA7bdeb4d7bcAF3f7Ff8bed13577Bc',
      ended: false,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 2.319,
      pair: '0x3a2fe73866bac2d28501e4e6149ef9057463c365',
    },
    {
      tokens: [UM, ETHER],
      stakingRewardAddress: '0x7b6151f2935cE9420eEb79D2B9821515b7f3E876',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 2.319,
      pair: '0x78413ed015b19766c8881f6f1bb9011ce95ec786',
    },
    {
      tokens: [DPI, ETHER],
      stakingRewardAddress: '0x906F45309470C528625Ad860282ccB6D268e8b4f',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 1.9325,
      pair: '0x9f77ef7175032867d26e75d2fa267a6299e3fb57',
    },
    {
      tokens: [MASK, USDC],
      stakingRewardAddress: '0xDa734d661BEf168895EFB2aC0634950C7874B5Ec',
      ended: false,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 1.546,
      pair: '0x253d637068fbf11b18d0f2a1bf3b167d37802687',
    },
    {
      tokens: [ELET, QUICK],
      stakingRewardAddress: '0x7b4125d303eE59e8Ef5aB66ca06314904E45DA7E',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 1.546,
      pair: '0x592d8faea9e740facbd6115abd92d2e6acb2f8f1',
    },
    {
      tokens: [DAI, USDC],
      stakingRewardAddress: '0xACb9EB5B52F495F09bA98aC96D8e61257F3daE14',
      ended: false,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 1.546,
      pair: '0xf04adbf75cdfc5ed26eea4bbbb991db002036bdd',
    },
    {
      tokens: [AVAX, MATIC],
      stakingRewardAddress: '0x0cAB010bA055a9F3B3f987BA39eE0ad3E2d1a830',
      ended: false,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 1.546,
      pair: '0xeb477ae74774b697b5d515ef8ca09e24fee413b5',
    },
    {
      tokens: [RDOGE, ETHER],
      stakingRewardAddress: '0x16043947b496a5B31932bcF9f41dD66880ff2Bb7',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 1.546,
      pair: '0xab1403de66519b898b38028357b74df394a54a37',
    },
    {
      tokens: [SOL, MATIC],
      stakingRewardAddress: '0xB332b9D67E20bb8Ce4B93308A63C2EE2F846D372',
      ended: false,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 1.546,
      pair: '0x898386dd8756779a4ba4f1462891b92dd76b78ef',
    },
    {
      tokens: [BNB, USDC],
      stakingRewardAddress: '0xCd7E62D9E2D209EcB22EC48A942b4db9503aB97B',
      ended: false,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 1.546,
      pair: '0x40a5df3e37152d4daf279e0450289af76472b02e',
    },
    {
      tokens: [WATCH, QUICK],
      stakingRewardAddress: '0x4f5f46Db08D28b7c6A96653B7C4BdB8a209c6331',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 1.546,
      pair: '0x8000fe11cffa3ced146d98f091d95c9bc2c55c97',
    },
    {
      tokens: [XPRT, EROWAN],
      stakingRewardAddress: '0xA0395e5f54f396527322fb11D922e50707552176',
      ended: false,
      lp: '',
      name: '',
      baseToken: EROWAN,
      rate: 1.546,
      pair: '0xf366df119532b2e0f4e416c81d6ff7728a60fe7d',
    },
    {
      tokens: [IRIS, EROWAN],
      stakingRewardAddress: '0x49734F8A9ED60CBdc489d90A3d80aaf41FaE0Ae4',
      ended: false,
      lp: '',
      name: '',
      baseToken: EROWAN,
      rate: 1.546,
      pair: '0x58ffb271c6f3d92f03c49e08e2887810f65b8cd6',
    },
    {
      tokens: [REGEN, EROWAN],
      stakingRewardAddress: '0xb72547668E5759a81BB2DD0C81a04437487e7F17',
      ended: false,
      lp: '',
      name: '',
      baseToken: EROWAN,
      rate: 1.546,
      pair: '0x66c37a00e426a613b188180198aac12b0b4ae4d4',
    },
    {
      tokens: [AKT, EROWAN],
      stakingRewardAddress: '0x9C2F4bebEA8B843485EdbD77801CD41B92805bBf',
      ended: false,
      lp: '',
      name: '',
      baseToken: EROWAN,
      rate: 1.546,
      pair: '0xa651ef83fa6a90e76206de4e79a5c69f80994556',
    },
    {
      tokens: [FTM, MATIC],
      stakingRewardAddress: '0xF81e664C8277d461Df561b353D50c4B698144664',
      ended: false,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 1.546,
      pair: '0xd2b61a42d3790533fedc2829951a65120624034a',
    },
    {
      tokens: [ALN, ETHER],
      stakingRewardAddress: '0xEBa5ECcd528DB4f4d589f4381e1De26aC2035cb3',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 1.546,
      pair: '0x150255a6ba2d32ac058e8b435a445f5137a21857',
    },
    {
      tokens: [DES, QUICK],
      stakingRewardAddress: '0xd6bf3026664e4f64ADCb0FA10e9aB216C8935e43',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 1.546,
      pair: '0xdfb3d129f32b32852e74322e699580d75ca4521e',
    },
    {
      tokens: [MCRN, ETHER],
      stakingRewardAddress: '0x7Ddff049B9f8393636a3E277ef86639D0A1d6B82',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 1.546,
      pair: '0xde84c8f0562eb56a5fc8f07819cef1faf9df3ebc',
    },
    {
      tokens: [PNT, ETHER],
      stakingRewardAddress: '0xf3dD73a4fA42021e394f3BF20C0d55042eb789dE',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 1.546,
      pair: '0xf60618c6ab18e347428a3ee72bf95a720bb45ee6',
    },
    {
      tokens: [PBTC, WBTC],
      stakingRewardAddress: '0x4bBaE7Ab87D2604dCA240c8eC00Be6dcD35295D4',
      ended: false,
      lp: '',
      name: '',
      baseToken: WBTC,
      rate: 1.546,
      pair: '0x0850f9bf21cdba7d2817fca8e5f9d3b96feff3dd',
    },
    {
      tokens: [NEXO, ETHER],
      stakingRewardAddress: '0x1476331f814c00F1d15dc6187A0EB1e1E403D745',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 1.1595,
      pair: '0x10062ec62c0be26cc9e2f50a1cf784a89ded075f',
    },
    {
      tokens: [REVV, USDC],
      stakingRewardAddress: '0x97E4bcF95DfA4C0EDAcFd12287317BfaF5B4866A',
      ended: false,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 1.1595,
      pair: '0xe4139dbf19e9c8d880f915711c8674022979d432',
    },
    {
      tokens: [TCP, USDC],
      stakingRewardAddress: '0x43CdB843Bdc76DDfb9F5aE1B9F20424E9D77cED6',
      ended: false,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 0.773,
      pair: '0xad431d0bde99e21d9848691615a0756a09ed3dce',
    },
    {
      tokens: [OM, QUICK],
      stakingRewardAddress: '0x7Cb08B1dd9A9fA5da22ef99E7Fb00a856DA6A2c7',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.773,
      pair: '0xdfa81e266ff54a7d9d26c5083f9631e685d833d7',
    },
    {
      tokens: [RELAY, QUICK],
      stakingRewardAddress: '0x8eF44aF84D79717577C54DD7eC60a60945404680',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.773,
      pair: '0x7ca8e540df6326005b72661e50f1350c84c0e55d',
    },
    {
      tokens: [UGT, ETHER],
      stakingRewardAddress: '0x4Cef5a7B5736e65ad9dd6Ab52eD79eF1BbeBec84',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.773,
      pair: '0x15551bedc20b01b473da93e6cfa29b1eb7baeabb',
    },
    {
      tokens: [ZUSD, USDC],
      stakingRewardAddress: '0xE3Cd2c9971C12F817Aac1350654CBae53BE72433',
      ended: false,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 0.773,
      pair: '0xca8e44fdf749a7c5c28bc927726ea21ccd669969',
    },
    {
      tokens: [MATIC, MI],
      stakingRewardAddress: '0x5F709F81cdA3E84fC2af3662B8B8C3F4f44e3d4E',
      ended: false,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 0.773,
      pair: '0x7805b64e2d99412d3b8f10dfe8fc55217c5cc954',
    },
    {
      tokens: [REI, QUICK],
      stakingRewardAddress: '0x5189B2e1A3896c053D094633B77Adc6AeBCF7C03',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.773,
      pair: '0x1c75bd54ad15449d12e6c24a9b5e8ce1a62c567c',
    },
    {
      tokens: [ETHA, QUICK],
      stakingRewardAddress: '0xDBFb709a40F4B6C10DbfC27Cd96F90cf67EbBcF1',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.773,
      pair: '0x8167d3156fccdbaf3e43ae019a0e842e5d1f1ac1',
    },
    {
      tokens: [MEEB, ETHER],
      stakingRewardAddress: '0x7a066B2e504ae958926F5DAa2A31aC5Fa278c52D',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.773,
      pair: '0xd0a4bbb49ddd36b0d832d485974a2387d81dbdd3',
    },
    {
      tokens: [DAI, USDT],
      stakingRewardAddress: '0xc45aB79526Dd16B00505EB39222E6B1Aed0Ef079',
      ended: false,
      lp: '',
      name: '',
      baseToken: DAI,
      rate: 0.773,
      pair: '0x59153f27eefe07e5ece4f9304ebba1da6f53ca88',
    },
    {
      tokens: [REVV, QUICK],
      stakingRewardAddress: '0xB84319392d51FEEBfA40EdA326C14Bf56c31D030',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.773,
      pair: '0xc52f4e49c7fb3ffceb48ad06c3f3a17ad5c0dbfe',
    },
    {
      tokens: [BUNNY, ETHER],
      stakingRewardAddress: '0x7475b9eDfc13cdc994AeF39F67F5b4211515C873',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.773,
      pair: '0x62052b489cb5bc72a9dc8eeae4b24fd50639921a',
    },
    {
      tokens: [UGT, QUICK],
      stakingRewardAddress: '0x20b07BF5d7c84171c84Daf1ec327306830561AD9',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.773,
      pair: '0x29429e4099ed88884729b8fa800b9c65dbe57b63',
    },
    {
      tokens: [ETHA, USDC],
      stakingRewardAddress: '0xE73580E28A4cCb796fEBb276902F2fa2F5a39067',
      ended: false,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 0.773,
      pair: '0xb417da294ae7c5cbd9176d1a7a0c7d7364ae1c4e',
    },
    {
      tokens: [MITX, ETHER],
      stakingRewardAddress: '0x2a33666D3e06FdBE07F8AeA0d0ae22861F8C7e73',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.773,
      pair: '0xa28864af52aedcef717c34bffca2ccf9d6aa23cc',
    },
    {
      tokens: [ODDZ, QUICK],
      stakingRewardAddress: '0x4Fdc40A3F4926E04BC8B76eB4a83433318D6f0E6',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.773,
      pair: '0x8df6f7da556b9e70e272434bdc581dbb4848dffc',
    },
    {
      tokens: [MITX, QUICK],
      stakingRewardAddress: '0xeD79D524B50e16ccC5d57193a2CAdF1964d484E7',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.773,
      pair: '0x5938dc50094e151c7dd64e5b774a2a91cd414daf',
    },
    {
      tokens: [D11, MATIC],
      stakingRewardAddress: '0xC105a406ad18f3736bd8Af158D811E85a018ef00',
      ended: false,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 0.773,
      pair: '0x4c27eee5f50eeee292ef438a87a42292bd629e70',
    },
    {
      tokens: [GHST, USDC],
      stakingRewardAddress: '0x3759D7904a5A0fcdB5AA2d55D5fF1132aE4f2575',
      ended: false,
      name: 'stkGHST-USDC',
      lp: '0x04439eC4ba8b09acfae0E9b5D75A82cC63b19f09',
      baseToken: USDC,
      rate: 0.773,
      pair: '0x096c5ccb33cfc5732bcd1f3195c13dbefc4c82f4',
    },
    {
      tokens: [ATOM, QUICK],
      stakingRewardAddress: '0xeF37c3272DAcdC0FaEe000b3862734d2Df1D9C91',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.773,
      pair: '0xf7e659966196f069a23ce9b84b9586a809c4cd9a',
    },
    {
      tokens: [KNIGHT, ETHER],
      stakingRewardAddress: '0x426953d2ebBC76aCB9EbFADb2f4d6100a795286d',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.773,
      pair: '0x7f7c12acec546cdceb028cc5b57f7aa2d91f0887',
    },
    {
      tokens: [XED, QUICK],
      stakingRewardAddress: '0x3fC5c25f946894e14AA2e9cE755Be55d98B7d515',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.3865,
      pair: '0x222789b185a145ccbd19803a448143252612d012',
    },
    {
      tokens: [ANRX, ETHER],
      stakingRewardAddress: '0xB8219752b7E35E82B2a37845D74351580A6AC3cc',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.3865,
      pair: '0x3dd6a0d31818fdacd2724f2b0b3b220f14a54215',
    },
    {
      tokens: [PLR, QUICK],
      stakingRewardAddress: '0x0e72b1b7658FFb0e3f45562A489FD4Bc15873E4B',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.3865,
      pair: '0xb980171e5647a8531d3b28134622d225bc3cdb82',
    },
    {
      tokens: [PERA, QUICK],
      stakingRewardAddress: '0x9DD277679F4BB9412Ec68D7E0F41cb2985BEF0c7',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.3865,
      pair: '0x8bab360e41468dff5326df636e2377a858ad0670',
    },
    {
      tokens: [CNTR, QUICK],
      stakingRewardAddress: '0xa19220e11C3a3d5C71CBB29C2e581125f087450D',
      ended: false,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.3865,
      pair: '0xb56843b5550e3f78613ca5abf6bd6ae6f84cd11e',
    },
    {
      tokens: [IMX, ETHER],
      stakingRewardAddress: '0xBba6c7B2D1B088ecC969E13140b801714f9b1a20',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.3865,
      pair: '0x5f819f510ca9b1469e6a3ffe4ecd7f0c1126f8f5',
    },
    {
      tokens: [RAMP, ETHER],
      stakingRewardAddress: '0x5D2680B93D851B137626361Dfa1F97e60c796615',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.3865,
      pair: '0xe55739e1feb9f9aed4ce34830a06ca6cc37494a0',
    },
    {
      tokens: [PBR, USDT],
      stakingRewardAddress: '0x4c510d82FD85F2B54FD0C41975fbb9305a92751B',
      ended: false,
      lp: '',
      name: '',
      baseToken: USDT,
      rate: 0.3865,
      pair: '0x53b02ad5f6615262ec5b483937260135429d5af9',
    },
    {
      tokens: [PHX, MATIC],
      stakingRewardAddress: '0x7aE6190a279a919612B5C563296C93CAe983e457',
      ended: false,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 0.3865,
      pair: '0x666dd949db4f3807c6e8e360a79473a5f0c7075a',
    },
    {
      tokens: [POOL, ETHER],
      stakingRewardAddress: '0x00e13b2873465A07043c701FE5eE7e5AA4D8bA96',
      ended: false,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.3865,
      pair: '0x1585d301b58661bc0cb5a8eba24ecae7b4600470',
    },
  ],
};

export const OLD_STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token];
    stakingRewardAddress: string;
    ended: boolean;
    name: string;
    lp: string;
    baseToken: Token;
    rate: number;
    pair: string;
  }[];
} = {
  [ChainId.MATIC]: [
    {
      tokens: [ODDZ, MATIC],
      stakingRewardAddress: '0x2458D6CE80963915Be56FD9bfBd702728EE899b0',
      ended: true,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 0.778,
      pair: '0x972d0c9d46742d04a35e2521e8ff1657e8107b2c',
    },
    {
      tokens: [RENDGB, ETHER],
      stakingRewardAddress: '0x6491F7eb102233453951aC933b6bc5181077560B',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.778,
      pair: '0xbf453e64ee7f43513afdc801f6c0fab250fbcf09',
    },
    {
      tokens: [UNITOKEN, QUICK],
      stakingRewardAddress: '0xa444aed39Fa4Fd4fB7518877963046453c075CAb',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.389,
      pair: '0x4b4c614b9219397c02296f6f4e2351259840b3c7',
    },
    {
      tokens: [WOW, QUICK],
      stakingRewardAddress: '0xaA1C17a1d8EC352095f5F67fd1cce8FD60099746',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.389,
      pair: '0xd5211a55d978bf651b9da899cc8bb09491ff39a1',
    },
    {
      tokens: [EZ, QUICK],
      stakingRewardAddress: '0x32B249cd2717799bEd634940a47c2e8Da56EB670',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.778,
      pair: '0xf745a6358790f7a2ef5da0538b714cbbcc635c40',
    },
    {
      tokens: [BUNNY, QUICK],
      stakingRewardAddress: '0x6d06DcC1FA6226C3F2e5ECE0aA6c1e4273368F68',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.778,
      pair: '0x976b7b7fe4293111cacd946c422a64f24a223564',
    },
    {
      tokens: [DHV, QUICK],
      stakingRewardAddress: '0x09DdB5E6B740De10b4b710E72ac4AF100d47428B',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.389,
      pair: '0xfd0e242c95b271844bf6860d4bc0e3e136bc0f7c',
    },
    {
      tokens: [OOE, QUICK],
      stakingRewardAddress: '0x7fF1ed1960108Ff896be37199796Cc474B2C070D',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 1.167,
      pair: '0x23e93ce78d7fb5287e4b6a8d91403bc5e7ac845a',
    },
    {
      tokens: [ANGEL, QUICK],
      stakingRewardAddress: '0x7381EC7FB10d4242447A4056a84EF75b007D1a00',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.778,
      pair: '0x5701026955d90e9d9ea79eba2cc70596a6a7accd',
    },
    {
      tokens: [SWAP, QUICK],
      stakingRewardAddress: '0x3486D306c3Fe9e1cC7809e2C171766CA942c144A',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.778,
      pair: '0xfcb980cfd282027b7a0544802a03b8af63ee9cc4',
    },
    {
      tokens: [TRADE, QUICK],
      stakingRewardAddress: '0x789c93e6fd3F6327Ff2f2d1F394e694DE442044e',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.778,
      pair: '0x36d906b17371678ba39de21b8631854c9490e87e',
    },
    {
      tokens: [KOM, QUICK],
      stakingRewardAddress: '0x91061e09e9c7819CBbb92a418240954A4D8a9fed',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.778,
      pair: '0x082b58350a04d8d38b4bcae003bb1191b9aae565',
    },
    {
      tokens: [MOONED, QUICK],
      stakingRewardAddress: '0xd0AA987bb9C5b6c211094fAC5B3AcA8bA3e6B562',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.778,
      pair: '0x3ba7afa5f600be15607b89d03f98aa791c8ecef8',
    },
    {
      tokens: [XCAD, USDC],
      stakingRewardAddress: '0x7efCff893e01D36F3856a5b063A50b91Bbad303D',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 0.778,
      pair: '0x602fe85ceba5d27fd4d48c241cfb83ce045a179d',
    },
    {
      tokens: [MOONED, USDC],
      stakingRewardAddress: '0xfBAafCc888E68153a667CA36020B0dc2c5019bAC',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 0.389,
      pair: '0x2d252d4a903a450afa9dac54cb696f0690259a62',
    },
    {
      tokens: [TRADE, ETHER],
      stakingRewardAddress: '0x5db8eB2cbcd7C74CF700173eCf86338247898c1a',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.389,
      pair: '0x12909209228cedad659a6e13d41f82a4d53ee8d1',
    },
    {
      tokens: [WOW, USDC],
      stakingRewardAddress: '0x98f4a0a1e5C9A8d93Bda40B0636dFEd870cc40A3',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 0.389,
      pair: '0x7600cc75fa9045986efe0bddee8e18621a8dd49e',
    },
    {
      tokens: [WOO, ETHER],
      stakingRewardAddress: '0x114114214C0AD1C7C8C8e74458138e6e792a89f8',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.389,
      pair: '0x70294d7aa244bd342c536f9b502152564057162e',
    },
  ],
};

export const VERY_OLD_STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token];
    stakingRewardAddress: string;
    ended: boolean;
    name: string;
    lp: string;
    baseToken: Token;
    rate: number;
    pair: string;
  }[];
} = {
  [ChainId.MATIC]: [
    //TODO: MATIC

    {
      tokens: [GFARM2, DAI],
      stakingRewardAddress: '0xC0389A2A49aCe18eF35Fa8285Ab47D9B1D1315a0',
      ended: true,
      lp: '',
      name: '',
      baseToken: DAI,
      rate: 1.562,
      pair: '0x0c7ad41d3e0dbc1cfdcdd717afb0a72a65cdf069',
    },
    {
      tokens: [GFARM2, QUICK],
      stakingRewardAddress: '0x9fD3642874a58308644DF36192046000bB726853',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.781,
      pair: '0x065d609ff57e8ce4ee5fbc3c040a442354e8a2e4',
    },
    {
      tokens: [ADS, USDC],
      stakingRewardAddress: '0x4a01270909A3a11810B8d73dF11083106f7833Ce',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 0.781,
      pair: '0x85ba262be13329a2db5acf9aa46ac2345b5df4ff',
    },
    {
      tokens: [ADS, QUICK],
      stakingRewardAddress: '0x132A9714939d0194eAC5B97725BFE0d7D6fFb8bb',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.781,
      pair: '0x5a25c9e27097ebac600ed1df3f31441272af9d38',
    },
    {
      tokens: [DNXC, USDC],
      stakingRewardAddress: '0xEce832aBe253681FC0C4fE116ca3De8d18D811e2',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 0.781,
      pair: '0xe169a660d720917b4fb7e95f045b6f60a64eb10a',
    },
    {
      tokens: [DNXC, QUICK],
      stakingRewardAddress: '0xc003fC1a62f7eEa5b07FeFf89BA45A925AC46f1d',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.781,
      pair: '0xb61fbe5aac9e91c16f477c8505cf21fb919048f6',
    },
    {
      tokens: [CIOTX, USDC],
      stakingRewardAddress: '0xeaF39eba018F086e7723CdECdb700BC2b7862ade',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 0.781,
      pair: '0xcddf91a44c579765227722da371136a4f12dc81b',
    },
    {
      tokens: [MONA, USDT],
      stakingRewardAddress: '0xb323d6f17A0cDFaE1BfD263839B39eBB5210155a',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDT,
      rate: 0.781,
      pair: '0x856ad56defbb685db8392d9e54441df609bc5ce1',
    },
    {
      tokens: [MONA, QUICK],
      stakingRewardAddress: '0xFef9DF77b67037b184a22cBB449EaBE571Dd7Ff5',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.781,
      pair: '0x82f1676ef298db09da935f4cb7bd3c44fb73d83a',
    },
    {
      tokens: [CIOTX, QUICK],
      stakingRewardAddress: '0xB2ef545E18946a04aE0a82eC4fb199630025F2Ce',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.3905,
      pair: '0x7de19d534c6ecc2f5e236349d36b7d5bb645bfef',
    },
    {
      tokens: [FEAR, USDC],
      stakingRewardAddress: '0xf32E91281f453644F95038526Ee491d2718Db9e2',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 0.3905,
      pair: '0x4e56843592da70ce073ad6599b3fb3ce3bf02f3b',
    },
    {
      tokens: [FEAR, QUICK],
      stakingRewardAddress: '0xc599CdE2c17084E40D25BC4Ca8f33aF04bE5C9B1',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.3905,
      pair: '0xbea282f98df962c54be80a2050a211b64ff1aee0',
    },
    {
      tokens: [GUARD, USDC],
      stakingRewardAddress: '0xF5c305F9D817a462Fa0eCE578a552C3F05F58b40',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 0.3905,
      pair: '0xd2eeeedfcaf1457f7bc9cba28d5316f73bb83b49',
    },
    {
      tokens: [YAMP, QUICK],
      stakingRewardAddress: '0x474e655CCD715393E31d66077a007491b7e52070',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.3905,
      pair: '0x66ff795535cf162d29f6b15ed546a3e148eff0fb',
    },
    {
      tokens: [YAMP, USDC],
      stakingRewardAddress: '0xf588C993b3A410d937bDC24Cb73392e196E0e634',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 0.3915,
      pair: '0x87d68f797623590e45982ad0f21228557207fdda',
    },
    {
      tokens: [EGG, QUICK],
      stakingRewardAddress: '0x8D79CA210442f67FB21951E6Ec16c974c6B4d278',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.785,
      pair: '0x5f98d4150e299df500c2a9463c66985025494e63',
    },
    {
      tokens: [EGG, USDC],
      stakingRewardAddress: '0x51BAbd09082e83FfB8cbe4F10E6dC5B2a5D888b5',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 0.785,
      pair: '0x4f76de0543f06b7879ebf5c2908cefc478e29fa2',
    },
    {
      tokens: [QI, QUICK],
      stakingRewardAddress: '0x4238474E92734E762784EAA20d3D454b616986a2',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.785,
      pair: '0x25d56e2416f20de1efb1f18fd06dd12efec3d3d0',
    },
    {
      tokens: [IMX, QUICK],
      stakingRewardAddress: '0xbAa4E89245f462B6746CBfadDe6a1Ae120fb62C3',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.3925,
      pair: '0x7e1cf35e362caea8c1a132ba4e4222080f26d8b0',
    },
    {
      tokens: [ETHER, MATIC],
      stakingRewardAddress: '0x4b678cA360c5f53a2B0590e53079140F302A9DcD',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 30.615,
      pair: '0xadbf1854e5883eb8aa7baf50705338739e558e5b',
    },
    {
      tokens: [MATIC, QUICK],
      stakingRewardAddress: '0xdD8758eBB792C9aed3517e9E28ce03C090564DA0',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 16.485,
      pair: '0x019ba0325f1988213d448b3472fa1cf8d07618d7',
    },
    {
      tokens: [MATIC, USDC],
      stakingRewardAddress: '0x9854e01432b348194e025DF773e6412892cBc900',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 6.28,
      pair: '0x6e7a5fafcec6bb1e78bae2a1f0b612012bf14827',
    },
    {
      tokens: [MATIC, USDT],
      stakingRewardAddress: '0xE1F991f93997085472469B2fA72Fd5454469Fa94',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDT,
      rate: 2.355,
      pair: '0x604229c960e5cacf2aaeac8be68ac07ba9df81c3',
    },
    {
      tokens: [ETHER, USDC],
      stakingRewardAddress: '0x4A73218eF2e820987c59F838906A82455F42D98b',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 42,
      pair: '0x853ee4b2a13f8a742d64c8f088be7ba2131f670d',
    },
    {
      tokens: [ETHER, MATIC],
      stakingRewardAddress: '0x8FF56b5325446aAe6EfBf006a4C1D88e4935a914',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 39,
      pair: '0xadbf1854e5883eb8aa7baf50705338739e558e5b',
    },
    {
      tokens: [MATIC, QUICK],
      stakingRewardAddress: '0x7Ca29F0DB5Db8b88B332Aa1d67a2e89DfeC85E7E',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 21,
      pair: '0x019ba0325f1988213d448b3472fa1cf8d07618d7',
    },
    {
      tokens: [ETHER, USDT],
      stakingRewardAddress: '0xB26bfcD52D997211C13aE4C35E82ced65AF32A02',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 17,
      pair: '0xf6422b997c7f54d1c6a6e103bcb1499eea0a7046',
    },
    {
      tokens: [WBTC, ETHER],
      stakingRewardAddress: '0x070D182EB7E9C3972664C959CE58C5fC6219A7ad',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 17,
      pair: '0xdc9232e2df177d7a12fdff6ecbab114e2231198d',
    },
    {
      tokens: [AAVE, ETHER],
      stakingRewardAddress: '0x573bb5CCC26222d8108EdaCFcC7F7cb9e388Af10',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 12,
      pair: '0x90bc3e68ba8393a3bf2d79309365089975341a43',
    },
    {
      tokens: [DAI, ETHER],
      stakingRewardAddress: '0x785AaCd49c1Aa3ca573F2a32Bb90030A205b8147',
      ended: true,
      lp: '',
      name: '',
      baseToken: DAI,
      rate: 12,
      pair: '0x4a35582a710e1f4b2030a3f826da20bfb6703c09',
    },
    {
      tokens: [ETHER, QUICK],
      stakingRewardAddress: '0xD1C762861AAe85dF2e586a668A793AAfF820932b',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 11,
      pair: '0x1bd06b96dd42ada85fdd0795f3b4a79db914add5',
    },
    {
      tokens: [MI, USDT],
      stakingRewardAddress: '0xf036557fDD98485D34ae8B7D8111De2624AEAD1F',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDT,
      rate: 10,
      pair: '0xe89fae1b4ada2c869f05a0c96c87022dadc7709a',
    },
    {
      tokens: [QI, ETHER],
      stakingRewardAddress: '0xb47f7120a57381c217e4d6F3a79F066bfAAe6C93',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 10,
      pair: '0x8c1b40ea78081b70f661c3286c74e71b4602c9c0',
    },
    {
      tokens: [MI, DAI],
      stakingRewardAddress: '0xBfBeCAf31F6Aa873660d5b7c98fd8Cbd542cC0fD',
      ended: true,
      lp: '',
      name: '',
      baseToken: DAI,
      rate: 10,
      pair: '0x74214f5d8aa71b8dc921d8a963a1ba3605050781',
    },
    {
      tokens: [XCASH, QUICK],
      stakingRewardAddress: '0x89666405Fe76bAC78379938eF280739A815C1437',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 10,
      pair: '0x30167fea9499c11795bfd104667240bdac939d3a',
    },
    {
      tokens: [LINK, ETHER],
      stakingRewardAddress: '0x97D69E23DF7BBB01F9eA78b5651cb6ad125D6d9a',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 8,
      pair: '0x5ca6ca6c3709e1e6cfe74a50cf6b2b6ba2dadd67',
    },
    {
      tokens: [MATIC, USDC],
      stakingRewardAddress: '0x6C6920aD61867B86580Ff4AfB517bEc7a499A7Bb',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 8,
      pair: '0x6e7a5fafcec6bb1e78bae2a1f0b612012bf14827',
    },
    {
      tokens: [NEXO, ETHER],
      stakingRewardAddress: '0x5Ce139242C77fC31479E5329626fef736Ac8CeBE',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 7,
      pair: '0x10062ec62c0be26cc9e2f50a1cf784a89ded075f',
    },
    {
      tokens: [WBTC, USDC],
      stakingRewardAddress: '0x8f2ac4EC8982bF1699a6EeD696e204FA2ccD5D91',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 7,
      pair: '0xf6a637525402643b0654a54bead2cb9a83c8b498',
    },
    {
      tokens: [RUSD, USDC],
      stakingRewardAddress: '0x5C1186F784A4fEFd53Dc40c492b02dEEd97E7944',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 6,
      pair: '0x5ef8747d1dc4839e92283794a10d448357973ac0',
    },
    {
      tokens: [USDC, USDT],
      stakingRewardAddress: '0x251d9837a13F38F3Fe629ce2304fa00710176222',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 6,
      pair: '0x2cf7252e74036d1da831d11089d326296e64a728',
    },
    {
      tokens: [MASK, USDC],
      stakingRewardAddress: '0xDEb69421fc2FbA0c3b4F8b1ae291029f7CCa344E',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 6,
      pair: '0x253d637068fbf11b18d0f2a1bf3b167d37802687',
    },
    {
      tokens: [USDC, QUICK],
      stakingRewardAddress: '0x8cFad56Eb742BA8CAEA813e47779E9C38f27cA6E',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 6,
      pair: '0x1f1e4c845183ef6d50e9609f16f6f9cae43bc9cb',
    },
    {
      tokens: [GMEE, QUICK],
      stakingRewardAddress: '0xC738C596bf61EB3187E07CA168a6A253CEba1499',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 6,
      pair: '0xfe4ba2ab8562b6204a17f19651c760818a361571',
    },
    {
      tokens: [UNITOKEN, ETHER],
      stakingRewardAddress: '0x9Bb7C0A778676689E86602d905c4013221AcC7C6',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 5,
      pair: '0xf7135272a5584eb116f5a77425118a8b4a2ddfdb',
    },
    {
      tokens: [TCP, USDC],
      stakingRewardAddress: '0x695886a14D48A916fe10A84B3C8f5D9fBf33d7f4',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 5,
      pair: '0xad431d0bde99e21d9848691615a0756a09ed3dce',
    },
    {
      tokens: [REVV, USDC],
      stakingRewardAddress: '0xa8be0f0A7e432D5B12E3F84117da74Ebe3dA7C59',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 4,
      pair: '0xe4139dbf19e9c8d880f915711c8674022979d432',
    },
    {
      tokens: [DNXC, USDC],
      stakingRewardAddress: '0x2b3b9F20b56a8CA413081aF69c6Eb37DC3AEB868',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 4,
      pair: '0xe169a660d720917b4fb7e95f045b6f60a64eb10a',
    },
    {
      tokens: [OM, QUICK],
      stakingRewardAddress: '0xe1fE89651932D84e7880651187547869CA524976',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 4,
      pair: '0xdfa81e266ff54a7d9d26c5083f9631e685d833d7',
    },
    {
      tokens: [REVV, QUICK],
      stakingRewardAddress: '0xcBA63630BDae39F28814dff40D535Dbc4fF083E4',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 4,
      pair: '0xc52f4e49c7fb3ffceb48ad06c3f3a17ad5c0dbfe',
    },
    {
      tokens: [DNXC, QUICK],
      stakingRewardAddress: '0x4e2d84AA0D38B59655f1D3d6C1e67723bf2Bfcad',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 4,
      pair: '0xb61fbe5aac9e91c16f477c8505cf21fb919048f6',
    },
    {
      tokens: [ADS, USDC],
      stakingRewardAddress: '0xa5d7a868A596289fEAfB36CABc50e84A8f13750f',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 4,
      pair: '0x85ba262be13329a2db5acf9aa46ac2345b5df4ff',
    },
    {
      tokens: [ADS, QUICK],
      stakingRewardAddress: '0x6668241Bb8D34731F6dD8Eb4c83cE819B5990b2d',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 4,
      pair: '0x5a25c9e27097ebac600ed1df3f31441272af9d38',
    },
    {
      tokens: [ELET, QUICK],
      stakingRewardAddress: '0x0E5a923524fC0A14fA4ab108145e4a019D2f2C6a',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 4,
      pair: '0x592d8faea9e740facbd6115abd92d2e6acb2f8f1',
    },
    {
      tokens: [ANGEL, QUICK],
      stakingRewardAddress: '0x8b20Fb818eAd157c18ea297f06726588B04e2980',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 4,
      pair: '0x5701026955d90e9d9ea79eba2cc70596a6a7accd',
    },
    {
      tokens: [EROWAN, QUICK],
      stakingRewardAddress: '0x62f7427edA4A5F2050Ebad9aeB3A1a5aFcDB9fa5',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 4,
      pair: '0x631f39d22430e889a3cfbea4fd73ed101059075f',
    },
    {
      tokens: [EROWAN, ATOM],
      stakingRewardAddress: '0x61b7b7AbA54B9c10760a4F8001167687682f7b56',
      ended: true,
      lp: '',
      name: '',
      baseToken: ATOM,
      rate: 4,
      pair: '0x7051810a53030171f01d89e9aebd8a599de1b530',
    },
    {
      tokens: [RELAY, QUICK],
      stakingRewardAddress: '0xD7B606AC407652FdB4bf7A7f17987C24047631bA',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 3.5,
      pair: '0x7ca8e540df6326005b72661e50f1350c84c0e55d',
    },
    {
      tokens: [BUNNY, ETHER],
      stakingRewardAddress: '0x9F37eF37818b3b81Cd8600d602DC5D8Df7B9e3E4',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 3.5,
      pair: '0x62052b489cb5bc72a9dc8eeae4b24fd50639921a',
    },
    {
      tokens: [UGT, QUICK],
      stakingRewardAddress: '0x7EC53d48808FC741917D7d2146ea94b21cEd90c8',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 3.5,
      pair: '0x29429e4099ed88884729b8fa800b9c65dbe57b63',
    },
    {
      tokens: [UGT, ETHER],
      stakingRewardAddress: '0x7110e7024B72B98BA245538Ded099A659351eBd7',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 3.5,
      pair: '0x15551bedc20b01b473da93e6cfa29b1eb7baeabb',
    },
    {
      tokens: [POLYDOGE, QUICK],
      stakingRewardAddress: '0xDE571d6ee61a9Ce8358b9cF011452ff5290ACc21',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 3,
      pair: '0xbedee6a7c572aa855a0c84d2f504311d482862f4',
    },
    {
      tokens: [SWAP, QUICK],
      stakingRewardAddress: '0x219ab685344518c60eFb399a039EBC73cC4f1471',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 3,
      pair: '0xfcb980cfd282027b7a0544802a03b8af63ee9cc4',
    },
    {
      tokens: [ZUSD, USDC],
      stakingRewardAddress: '0x5Dd915407A2AA5Dfa4fb9309DFec717646bB8Ce1',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 3,
      pair: '0xca8e44fdf749a7c5c28bc927726ea21ccd669969',
    },
    {
      tokens: [START, QUICK],
      stakingRewardAddress: '0x77eB20d5eB77b6ba543734d903FE1259d551cbd3',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 3,
      pair: '0x9e2b254c7d6ad24afb334a75ce21e216a9aa25fc',
    },
    {
      tokens: [MATIC, USDT],
      stakingRewardAddress: '0x5191c8391Db53f409b8170faC88d517ACE1edEE4',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDT,
      rate: 3,
      pair: '0x604229c960e5cacf2aaeac8be68ac07ba9df81c3',
    },
    {
      tokens: [OOE, QUICK],
      stakingRewardAddress: '0xcC4Ad7131f02974D408a6bcaD26e09d790a68DD7',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 3,
      pair: '0x23e93ce78d7fb5287e4b6a8d91403bc5e7ac845a',
    },
    {
      tokens: [REI, QUICK],
      stakingRewardAddress: '0x4326C97b0c3F8e4247365fcAAeb2110D4eAD7F17',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 3,
      pair: '0x1c75bd54ad15449d12e6c24a9b5e8ce1a62c567c',
    },
    {
      tokens: [EGG, QUICK],
      stakingRewardAddress: '0x2dDc1cABfcBbE4768FB198059f02Ed9a0A99a6c3',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 2,
      pair: '0x5f98d4150e299df500c2a9463c66985025494e63',
    },
    {
      tokens: [EGG, USDC],
      stakingRewardAddress: '0x79D6fB23cD4667331C17C564357bE8A705eb6bcD',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 2,
      pair: '0x4f76de0543f06b7879ebf5c2908cefc478e29fa2',
    },
    {
      tokens: [DHV, QUICK],
      stakingRewardAddress: '0x4D756a5e49A2b4cAfBa6C3e615e1e22189DDb0bA',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 2,
      pair: '0xfd0e242c95b271844bf6860d4bc0e3e136bc0f7c',
    },
    {
      tokens: [MATIC, MI],
      stakingRewardAddress: '0x270be4F2B283496C761f6eba7165028C41D6b769',
      ended: true,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 2,
      pair: '0x7805b64e2d99412d3b8f10dfe8fc55217c5cc954',
    },
    {
      tokens: [XED, QUICK],
      stakingRewardAddress: '0x6554Ac50164bE2fbb5cEa44f5042AFC5f533d5a5',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 2,
      pair: '0x222789b185a145ccbd19803a448143252612d012',
    },
    {
      tokens: [DAI, USDC],
      stakingRewardAddress: '0xEd8413eCEC87c3d4664975743c02DB3b574012a7',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 2,
      pair: '0xf04adbf75cdfc5ed26eea4bbbb991db002036bdd',
    },
    {
      tokens: [AVAX, MATIC],
      stakingRewardAddress: '0x02e33E4713Cf231D4b7A9894DE3F075A16e19201',
      ended: true,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 2,
      pair: '0xeb477ae74774b697b5d515ef8ca09e24fee413b5',
    },
    {
      tokens: [CIOTX, USDC],
      stakingRewardAddress: '0xEa4fDB87E55AC455Ddf0Ab96DD23fE1242600C4d',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 2,
      pair: '0xcddf91a44c579765227722da371136a4f12dc81b',
    },
    {
      tokens: [FEAR, QUICK],
      stakingRewardAddress: '0x413313F565F1B442114425bbad342024D37900Fa',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 2,
      pair: '0xbea282f98df962c54be80a2050a211b64ff1aee0',
    },
    {
      tokens: [PLR, QUICK],
      stakingRewardAddress: '0xE229C421F2079900E1544e4c98ee165AfAe78203',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 2,
      pair: '0xb980171e5647a8531d3b28134622d225bc3cdb82',
    },
    {
      tokens: [CNTR, QUICK],
      stakingRewardAddress: '0xd23a615e206150D94f376641527F405BE24E70CC',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 2,
      pair: '0xb56843b5550e3f78613ca5abf6bd6ae6f84cd11e',
    },
    {
      tokens: [ETHA, USDC],
      stakingRewardAddress: '0xB3CF543C9403fc0312e3f2d39d6F748245D40814',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 2,
      pair: '0xb417da294ae7c5cbd9176d1a7a0c7d7364ae1c4e',
    },
    {
      tokens: [RDOGE, ETHER],
      stakingRewardAddress: '0xe2519a7b81Cf038C055ddD667A9c06A0790945f4',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 2,
      pair: '0xab1403de66519b898b38028357b74df394a54a37',
    },
    {
      tokens: [MITX, ETHER],
      stakingRewardAddress: '0xCB1B532f13c45a601f2D2eBD651dec8f738d2969',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 2,
      pair: '0xa28864af52aedcef717c34bffca2ccf9d6aa23cc',
    },
    {
      tokens: [ODDZ, MATIC],
      stakingRewardAddress: '0x02fdC298A125ee8AFd2CEf81F1c7120E3D0aFCe6',
      ended: true,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 2,
      pair: '0x972d0c9d46742d04a35e2521e8ff1657e8107b2c',
    },
    {
      tokens: [ODDZ, QUICK],
      stakingRewardAddress: '0x722796b1F84A1e023672d1d7f3d6c4CD2689E669',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 2,
      pair: '0x8df6f7da556b9e70e272434bdc581dbb4848dffc',
    },
    {
      tokens: [PERA, QUICK],
      stakingRewardAddress: '0x99640EEDA4b97e7760ae077E2B4a089F629c1A9f',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 2,
      pair: '0x8bab360e41468dff5326df636e2377a858ad0670',
    },
    {
      tokens: [SOL, MATIC],
      stakingRewardAddress: '0x590226869C2A1334394392231Ed6de5F63C9dC98',
      ended: true,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 2,
      pair: '0x898386dd8756779a4ba4f1462891b92dd76b78ef',
    },
    {
      tokens: [MONA, USDT],
      stakingRewardAddress: '0x9Ec201D943a16B57D2238cdfA469c22aFd77B9e4',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDT,
      rate: 2,
      pair: '0x856ad56defbb685db8392d9e54441df609bc5ce1',
    },
    {
      tokens: [ETHA, QUICK],
      stakingRewardAddress: '0x568f468E4b5EcCBF308216C8115813CE481d15cd',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 2,
      pair: '0x8167d3156fccdbaf3e43ae019a0e842e5d1f1ac1',
    },
    {
      tokens: [CIOTX, QUICK],
      stakingRewardAddress: '0xe12cF778Da0494919567B27426fb85bCF22B9782',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 2,
      pair: '0x7de19d534c6ecc2f5e236349d36b7d5bb645bfef',
    },
    {
      tokens: [MEEB, QUICK],
      stakingRewardAddress: '0x96CA8Ec02c59BF85A9f12B2e1214850Edd775490',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 2,
      pair: '0x67b8e4082a59ef8ca0ac7df11af58c11b4ccfbee',
    },
    {
      tokens: [PHX, MATIC],
      stakingRewardAddress: '0x4CCe973585bbff82FE5574752BB329a7Ad737f66',
      ended: true,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 2,
      pair: '0x666dd949db4f3807c6e8e360a79473a5f0c7075a',
    },
    {
      tokens: [XCAD, USDC],
      stakingRewardAddress: '0xC255Ff6E74c7C6d7f24d6F7D6D7De8faf762785d',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 2,
      pair: '0x602fe85ceba5d27fd4d48c241cfb83ce045a179d',
    },
    {
      tokens: [MITX, QUICK],
      stakingRewardAddress: '0x36Cf81D44F0f01bb0aaf01ec836792cE809dD501',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 2,
      pair: '0x5938dc50094e151c7dd64e5b774a2a91cd414daf',
    },
    {
      tokens: [FEAR, USDC],
      stakingRewardAddress: '0x473F341f5aDfeCabf19B5a7299015ddFA0e1C091',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 2,
      pair: '0x4e56843592da70ce073ad6599b3fb3ce3bf02f3b',
    },
    {
      tokens: [BNB, USDC],
      stakingRewardAddress: '0x3a353b71ae9b6C688ac474aD07632b8e0d499264',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 2,
      pair: '0x40a5df3e37152d4daf279e0450289af76472b02e',
    },
    {
      tokens: [ANRX, ETHER],
      stakingRewardAddress: '0xED9c0a272001b796087fd16CAD762717BeF1E687',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 2,
      pair: '0x3dd6a0d31818fdacd2724f2b0b3b220f14a54215',
    },
    {
      tokens: [MOONED, QUICK],
      stakingRewardAddress: '0x1301AE3e88021532FBA7722A0b7Bc8E2E071d196',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 2,
      pair: '0x3ba7afa5f600be15607b89d03f98aa791c8ecef8',
    },
    {
      tokens: [TRADE, QUICK],
      stakingRewardAddress: '0xeD345d7A19DAa7D5A00285f04f342D0ba344bD99',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 2,
      pair: '0x36d906b17371678ba39de21b8631854c9490e87e',
    },
    {
      tokens: [MOONED, USDC],
      stakingRewardAddress: '0x056Ab2768c1018b16E7d0d9c5053c05e1Ea82379',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 2,
      pair: '0x2d252d4a903a450afa9dac54cb696f0690259a62',
    },
    {
      tokens: [TRADE, ETHER],
      stakingRewardAddress: '0x1F5fE1c32dbfe8811adB3d81b047240D2782eB83',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 2,
      pair: '0x12909209228cedad659a6e13d41f82a4d53ee8d1',
    },
    {
      tokens: [KOM, QUICK],
      stakingRewardAddress: '0x2f58B48A013BAde935e43f7bCc31f1378Ae68d55',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 2,
      pair: '0x082b58350a04d8d38b4bcae003bb1191b9aae565',
    },
    {
      tokens: [PBR, USDT],
      stakingRewardAddress: '0x4d3D3659A87a71E9D6137C7acb183b6C41223D4f',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDT,
      rate: 2,
      pair: '0x53b02ad5f6615262ec5b483937260135429d5af9',
    },
    {
      tokens: [D11, MATIC],
      stakingRewardAddress: '0x7dB4edd376C714815B38aE13ab1e4D9c7Ae6AE5d',
      ended: true,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 2,
      pair: '0x4c27eee5f50eeee292ef438a87a42292bd629e70',
    },
    {
      tokens: [YAMP, USDC],
      stakingRewardAddress: '0x1DdF6be5B3c6fe04e5161701e2753b28bBF85dc2',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 1.5,
      pair: '0x87d68f797623590e45982ad0f21228557207fdda',
    },
    {
      tokens: [YAMP, QUICK],
      stakingRewardAddress: '0xF42405d54c8F443126Ac06A47b5023BbfC7a85D3',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 1.5,
      pair: '0x66ff795535cf162d29f6b15ed546a3e148eff0fb',
    },
    {
      tokens: [MONA, QUICK],
      stakingRewardAddress: '0xd02b619cDa463bC63Fe6adDF36d3e2370d8B1742',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 1.5,
      pair: '0x82f1676ef298db09da935f4cb7bd3c44fb73d83a',
    },
    {
      tokens: [DAI, USDT],
      stakingRewardAddress: '0x97Efe8470727FeE250D7158e6f8F63bb4327c8A2',
      ended: true,
      lp: '',
      name: '',
      baseToken: DAI,
      rate: 1.4,
      pair: '0x59153f27eefe07e5ece4f9304ebba1da6f53ca88',
    },
    {
      tokens: [ATOM, QUICK],
      stakingRewardAddress: '0xC55c26Ad415Dc7DBe2E383eBBaE900581be42043',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 1,
      pair: '0xf7e659966196f069a23ce9b84b9586a809c4cd9a',
    },
    {
      tokens: [EZ, QUICK],
      stakingRewardAddress: '0x026C9182aE247675CCedfFE18b32Cf4fFf08B828',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 1,
      pair: '0xf745a6358790f7a2ef5da0538b714cbbcc635c40',
    },
    {
      tokens: [IMX, QUICK],
      stakingRewardAddress: '0xd7BA0FC827FD629f0a1fA8F189BD93Ea860AE051',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 1,
      pair: '0x7e1cf35e362caea8c1a132ba4e4222080f26d8b0',
    },
    {
      tokens: [IMX, ETHER],
      stakingRewardAddress: '0x162e50560d701ddEa3187F0E4A637960B77D9616',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 1,
      pair: '0x5f819f510ca9b1469e6a3ffe4ecd7f0c1126f8f5',
    },
    {
      tokens: [QI, QUICK],
      stakingRewardAddress: '0xad9E0d2FC293fD9a0f6c3C16c16A69d36B6D3b06',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 1,
      pair: '0x25d56e2416f20de1efb1f18fd06dd12efec3d3d0',
    },
    {
      tokens: [RAMP, ETHER],
      stakingRewardAddress: '0xBD5F8b3663F5ce456c9F53B26b0f6bC3EA22B6AA',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 1,
      pair: '0xe55739e1feb9f9aed4ce34830a06ca6cc37494a0',
    },
    {
      tokens: [GUARD, USDC],
      stakingRewardAddress: '0x8782772E35e262Ba7f481DDDb015424Fc1aABC62',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 1,
      pair: '0xd2eeeedfcaf1457f7bc9cba28d5316f73bb83b49',
    },
    {
      tokens: [RENDGB, ETHER],
      stakingRewardAddress: '0xcFCa8D0fcEc1A3A30B6f9B963F1794C3B8f8E391',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 1,
      pair: '0xbf453e64ee7f43513afdc801f6c0fab250fbcf09',
    },
    {
      tokens: [BUNNY, QUICK],
      stakingRewardAddress: '0xdaC489D994d12Be53388D4dB3cAC5135177390f0',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 1,
      pair: '0x976b7b7fe4293111cacd946c422a64f24a223564',
    },
    {
      tokens: [HT, MATIC],
      stakingRewardAddress: '0x58e52a5Bb13c4474a1954CC013B3B70C87ccbC92',
      ended: true,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 1,
      pair: '0x20e28214946b4e0f18b2c1aa7c976df087695a5d',
    },
    {
      tokens: [POOL, ETHER],
      stakingRewardAddress: '0x3868163FB27BC3b45F5E581d6920466B6515396F',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 1,
      pair: '0x1585d301b58661bc0cb5a8eba24ecae7b4600470',
    },
    {
      tokens: [GHST, USDC],
      stakingRewardAddress: '0xfDC02Dc768a587514b992b03Fb713F74061764a2',
      ended: true,
      name: 'stkGHST-USDC',
      lp: '0x04439eC4ba8b09acfae0E9b5D75A82cC63b19f09',
      baseToken: USDC,
      rate: 1,
      pair: '0x096c5ccb33cfc5732bcd1f3195c13dbefc4c82f4',
    },
    {
      tokens: [WOW, QUICK],
      stakingRewardAddress: '0x92EFadd7E1d625aEe3A32Cdf0baa7641E2aFdD13',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.5,
      pair: '0xd5211a55d978bf651b9da899cc8bb09491ff39a1',
    },
    {
      tokens: [MOD, USDC],
      stakingRewardAddress: '0x42e939E60Cdd95af8e35a2f8b729e4B34317b537',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 0.5,
      pair: '0x81e796089262df8569ff11d8d3a43bfb5c4d9e26',
    },
    {
      tokens: [EZ, USDC],
      stakingRewardAddress: '0x670F566cA98C8A28D9cEc9B3a58ce18Bd4c14f0c',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 0.5,
      pair: '0xb96fb16fefd59e51d4a76be6050df3e50c916451',
    },
    {
      tokens: [UNITOKEN, QUICK],
      stakingRewardAddress: '0x72ed24d2b2D98D3c4b5297ce244f623B9357F798',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.5,
      pair: '0x4b4c614b9219397c02296f6f4e2351259840b3c7',
    },
    {
      tokens: [WOW, USDC],
      stakingRewardAddress: '0x679993A5cf340F18d2be82bb1d075483DcF07C42',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 0.5,
      pair: '0x7600cc75fa9045986efe0bddee8e18621a8dd49e',
    },
    {
      tokens: [WOO, ETHER],
      stakingRewardAddress: '0xfA9A5abaC50B97c61addC7b317C813a006579aeA',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.5,
      pair: '0x70294d7aa244bd342c536f9b502152564057162e',
    },

    //QUICK
    {
      tokens: [WOO, QUICK],
      stakingRewardAddress: '0x1067112E5dB21aEC7eB144C5773f8aef8C85966a',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.5,
      pair: '0x7622804ba94940a9efddd1546d12d8d0d6a16e53',
    },
    {
      tokens: [CEL, ETHER],
      stakingRewardAddress: '0x8917692e0Bdb47AF1D36837805E141Ed79065dFC',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 1,
      pair: '0xeaa5e4620373d9ded4dcb9267f46fcfc6698c867',
    },
    {
      tokens: [GHST, QUICK],
      stakingRewardAddress: '0xa132faD61EDe08f1f288a35ff4c10dcD1cB9E107',
      ended: true,
      name: 'StkGHST-QUICK',
      lp: '0xa02d547512bb90002807499f05495fe9c4c3943f',
      baseToken: QUICK,
      rate: 1,
      pair: '0x9bcfd9b9a5cbe2669ad30b0ad02693afac0485f1',
    },
    {
      tokens: [MI, USDC],
      stakingRewardAddress: '0x1fdDd7F3A4c1f0e7494aa8B637B8003a64fdE21A',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 1,
      pair: '0x160532d2536175d65c03b97b0630a9802c274dad',
    },
    {
      tokens: [VISION, ETHER],
      stakingRewardAddress: '0x34D4257C4935673Fb5059f29602B9AAe9Dea0296',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.5,
      pair: '0x47be4b1b6921a36591142e108b8c9e04bb55e015',
    },
    {
      tokens: [UBT, ETHER],
      stakingRewardAddress: '0x219670F92CC0e0ef1C16BDB0aE266F0472930906',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.5,
      pair: '0xcc203f45a31ae086218170f6a9e9623fa1655486',
    },
    {
      tokens: [SUPER, QUICK],
      stakingRewardAddress: '0xe818cbeE29477e6C6915Df1e9757dd663f10106d',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.3,
      pair: '0x4fa5e499eea684c2fee4b67e96271ee916c26155',
    },
    {
      tokens: [SUPER, ETHER],
      stakingRewardAddress: '0x214249a7bd9a6C10AdfF8fAd70749ebf8108494a',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.2,
      pair: '0x0712323f8451cf7acc1141083baa60cc70dc32a8',
    },
    {
      tokens: [ADDY, ETHER],
      stakingRewardAddress: '0xF6Bd4FE52efD9C3881eea1134193E4DB3c1d4801',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 2,
      pair: '0xa5bf14bb945297447fe96f6cd1b31b40d31175cb',
    },
    {
      tokens: [PBNB, QUICK],
      stakingRewardAddress: '0xffA5b82d09DcaE32b9Ee96D3cD02C9391b63cdaB',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 1,
      pair: '0x53e27dadf6473d062717be8807c453af212c7102',
    },
    {
      tokens: [PBNB, USDC],
      stakingRewardAddress: '0x64Ec5b01D6eD81C432eF8628541BB2Bf9380b337',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 1,
      pair: '0xe55cb144e02cffb6fbd65d9a4bd62378998bc267',
    },
    {
      tokens: [DG, ETHER],
      stakingRewardAddress: '0x0C7395bc2b25603941a67e4DaF327362dB8f7D54',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.75,
      pair: '0xb1ff609d3341fe5a822faae973b8c5a227d8889e',
    },
    {
      tokens: [PSWAMP, MATIC],
      stakingRewardAddress: '0x928Dc054085b84DeDf734A46e096141b382988C3',
      ended: true,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 0.1,
      pair: '0x1a477272f6030eab135cb3ba40646f3eb26b382a',
    },
    {
      tokens: [GAME, QUICK],
      stakingRewardAddress: '0x8FC0a8dE57d15dF22238FCd165Cd5d6658ac4788',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.3,
      pair: '0x6276969983510b3dfae28fe6b7b8e2a858f0c2bd',
    },
    {
      tokens: [RENDGB, QUICK],
      stakingRewardAddress: '0xE682EB8F4F93EdABe17C52FFf5AA663f80D9B428',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.3,
      pair: '0x5cb85aa163b1b443f88a1f9124153e70f6586400',
    },
    {
      tokens: [KOGECOIN, MATIC],
      stakingRewardAddress: '0xDEb9d9D209687EC73488A89b68fE84B2364a8d86',
      ended: true,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 0.1,
      pair: '0x3885503aef5e929fcb7035fbdca87239651c8154',
    },
    {
      tokens: [MBTM, USDC],
      stakingRewardAddress: '0x9c6604378bB8b9D3A7f0C4416d8Fe3203EB68979',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 0.1,
      pair: '0x28763bdd88c43f902b026c7be5494f32cbdaad91',
    },
    {
      tokens: [ERN, MATIC],
      stakingRewardAddress: '0xA8F8A46f5dD3F68D2B7B1b04Dd20526CebCE7E7A',
      ended: true,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 0.3,
      pair: '0x124de7e03b8ee7363974d5ca3b1868ddf3a23cd3',
    },
    {
      tokens: [MBTM, QUICK],
      stakingRewardAddress: '0xb087b7a71fBb43EBabAcfabBdA368aA941eA1c9D',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.1,
      pair: '0x5223b2f033dce7d9de567a260c915e37f7d300a7',
    },
    {
      tokens: [UFT, QUICK],
      stakingRewardAddress: '0x63F423B8fbCc810Ed8A0C2f4921E3946a83eBe9C',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.1,
      pair: '0x6928f1577b3507de99490ca8c5acea6fc1d24a84',
    },
    {
      tokens: [QUICK, CC10],
      stakingRewardAddress: '0xab1d645fe5148322D4991fCB3bceF6848a5e8123',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.5,
      pair: '0x42fd10ddc7628b82d80c3b2c286f3e79555fd7a1',
    },
    {
      tokens: [ETHER, DEGEN],
      stakingRewardAddress: '0x729970954a0c26cdBe765A93020efC787283dfcA',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.5,
      pair: '0xfdbdb3a2bbdc7d9dc6203dcef9d53f1735135951',
    },
    {
      tokens: [ETHER, DEFI5],
      stakingRewardAddress: '0xf563fAe71bDAcDD370098CeCff14dbe2c9518a6b',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.5,
      pair: '0x654e651b658f784406125400cf648588cb9773e8',
    },
    {
      tokens: [FFF, QUICK],
      stakingRewardAddress: '0xB4A7e2FCf1FdC1481cbF24eE76e083d3c17F0859',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.5,
      pair: '0x2648ec89875d944e38f55925df77d9cfe0b01edd',
    },
    {
      tokens: [CC10, ETHER],
      stakingRewardAddress: '0x7cc64850E4c65e753247A1Ed2c8DF63DCF7d002d',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.5,
      pair: '0xbf646010b1ae86ad7fbb4cff5fd93c7019331cc9',
    },
    {
      tokens: [QUICK, DEFI5],
      stakingRewardAddress: '0xDdB4E83F0977CAf315f5A4d71930FD72DA00d8d9',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.5,
      pair: '0xa975ceeb05b379cf67fdfa63e7b2770f9f1d72c6',
    },
    {
      tokens: [DEGEN, QUICK],
      stakingRewardAddress: '0x65Bb31f4ad1D9958Cd808d4337eaaB6F40CFaD2e',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.5,
      pair: '0x75a4917aee97bda48d3572f431e04003743da85e',
    },
    {
      tokens: [FFF, ETHER],
      stakingRewardAddress: '0xd4C325Fa5A95220b4dD4bFbe3da71F78dE0F5d15',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.5,
      pair: '0x4935270aa19ba0b88fe99ea9feb10519feafa758',
    },
    {
      tokens: [PAUTO, ETHER],
      stakingRewardAddress: '0xBDEb6D4eC1B90EdB9D09259B6B030A646D373116',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 1,
      pair: '0x451cce13c6e013f463df6c156b7661b19df6541a',
    },
    {
      tokens: [PAUTO, QUICK],
      stakingRewardAddress: '0x6b9C78e419C3038dAC2DAb9dB2bfd5D9F1E05904',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 1,
      pair: '0x3bb367f673d52d1a5f0812c4d8c9030e5876ad44',
    },
    {
      tokens: [BIFI, ETHER],
      stakingRewardAddress: '0xd79424b32E2Ef944AA9f4021d39D835fdd615B87',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 1,
      pair: '0x8b80417d92571720949fc22404200ab8faf7775f',
    },
    {
      tokens: [BIFI, QUICK],
      stakingRewardAddress: '0xA2B969faCA14AAdeb6a7672c941A228260a481a2',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 1,
      pair: '0xc6a23bdd628c3b17fc0df270e6bf8e48511950e2',
    },
    /**{
      tokens: [ELE,MATIC],
      stakingRewardAddress: '0x9318F6f64e61AfB7B51D51E61B5dD6C4E39E7dd9',
      ended: true,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 0.5,
      pair: '0xadcb09fd3346c72c98753e518397b336333cf227'
    },*/
    {
      tokens: [FOR, QUICK],
      stakingRewardAddress: '0x6223cf24a0D7a8425DA45BBF072111a28c9ffeB0',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.5,
      pair: '0xb7ff4eeab22f78425fa8dbecc64efa9d6c91db03',
    },
    {
      tokens: [GBTS, USDC],
      stakingRewardAddress: '0xE692580F12A4228211B6a5b4b3A7470941A7Bdf8',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 0.3,
      pair: '0xbb93f7e7295565553eb77aadd9c0f0c632069414',
    },
    {
      tokens: [ETHER, WISE],
      stakingRewardAddress: '0xb11856d3Aea0203e50B8520479C6332daBcF3f82',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.2,
      pair: '0xdf8139e9bebecadecf48bec8c8064ccefb618e2b',
    },
    {
      tokens: [QUICK, WISE],
      stakingRewardAddress: '0x3CB338519AD8AE7cbaCb4A1035052BE6DA7e0b59',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.3,
      pair: '0xda5a2d1c048e58e2d1e6b55d840c2e2294caeec4',
    },
    {
      tokens: [ADDY, QUICK],
      stakingRewardAddress: '0x3Bf8602069d15a6F70Ede1887CB4a6576c492f7B',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.3,
      pair: '0xc4a707353599436859af654f829b75e635fde289',
    },
    {
      tokens: [ETHER, WISE],
      stakingRewardAddress: '0xb11856d3Aea0203e50B8520479C6332daBcF3f82',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.2,
      pair: '0xdf8139e9bebecadecf48bec8c8064ccefb618e2b',
    },
    {
      tokens: [UFT, ETHER],
      stakingRewardAddress: '0xd898A0223a1d3aBD18428065A45bE318784D8A91',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.3,
      pair: '0xaef2b47b5e30661c3cc03b3e17fd8dcddc1f27b6',
    },
    {
      tokens: [CGG, QUICK],
      stakingRewardAddress: '0xcf813b2416e23aFC10D21e733EB10544b0f52825',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.1,
      pair: '0xdf1d5afd6339ee4b02e2adc34ecbd6384e90cab2',
    },
    {
      tokens: [NEXO, QUICK],
      stakingRewardAddress: '0xd36f382F44678a07eCF79E89dc13a63D5Ef08d3E',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 3,
      pair: '0xaca37a3282078dbf41a6d0c6314c53d7f9ced6ec',
    },
    {
      tokens: [LINK, QUICK],
      stakingRewardAddress: '0xfEc1E86786841FF699588DD1e88178AB2BB6DAbC',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.7,
      pair: '0xdea8f0f1e6e98c6aee891601600e5fba294b5e36',
    },
    {
      tokens: [HONOR, USDC],
      stakingRewardAddress: '0xBB21082fc478f2a5Bb5D6ca1367571c456739b5F',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 0.1,
      pair: '0x46489f825f11d7473d20279699b108acaa246e73',
    },
    {
      tokens: [HEX, QUICK],
      stakingRewardAddress: '0x4E5317608D854104ffcC02F9741b52d1f07225Ac',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.1,
      pair: '0xd6c1fe4e4dd9a949c05c9b6904c353b87e3cea3a',
    },
    /**{
      tokens: [FISH,QUICK],
      stakingRewardAddress: '0x41D7f788D6c09fbed8594BccAcDf6E1879348409',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.75,
      pair: '0x83e5f826f35fa4a884ef53ea1497fafae1bed1d0'
    },
    {
      tokens: [FISH,USDC],
      stakingRewardAddress: '0xf92CF9141a0bE91918cF16804858ba5dEdd4760B',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 0.5,
      pair: '0x0df9e46c0eaedf41b9d4bbe2cea2af6e8181b033'
    },*/
    {
      tokens: [POLYDOGE, MATIC],
      stakingRewardAddress: '0x774685013B4248c9f7ddE063cfBdA0a87269C0Cd',
      ended: true,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 0.3,
      pair: '0x264e6bc3f95633725658e4d9640f7f7d9100f6ac',
    },
    {
      tokens: [SX, ETHER],
      stakingRewardAddress: '0x225d8F0f5FB5D66cA7C0a27da85F462689c47C23',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.25,
      pair: '0x3ff616172e87429a037e4b42843fb11bf0c945bb',
    },
    /**{
      tokens: [ELE,QUICK],
      stakingRewardAddress: '0xd00f210E67ef9c3F674e2D6A7A619602E888345d',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.3,
      pair: '0x6696db3a5ef00e24c065edcfbc114b13ea9ee997'
    },*/
    {
      tokens: [QUICK, CEL],
      stakingRewardAddress: '0x0BA297E04008070E3075Fa08a920bB3CeC2ed45b',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.3,
      pair: '0xf8b5e03841c07a72035f719979ccd6f4589bbb8a',
    },
    {
      tokens: [DG, QUICK],
      stakingRewardAddress: '0x4aC2D949D9E7e2c47e0FB6c7e2316BAE58d27599',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.3,
      pair: '0x96fdd975c4ba24c49e21140284ee09d6537e8ef7',
    },
    /**{
      tokens: [BORING,ETHER],
      stakingRewardAddress: '0x5b0a814D971aF818DA2BD7A7e1163d11674d4dCB',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.1,
      pair: '0xab71ce8d652c4a858654fbb6450cf2e3116d6062'
    },
    
    {
      tokens: [FRAX,QUICK],
      stakingRewardAddress: '0xa859D2C37A49bbd5992E39FCC37a7dD56aE130E7',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.9,
      pair: '0x2aa7a18ceabf2ef893d2f7c0145cc45e6f10b223'
    },*/
    {
      tokens: [IQ, QUICK],
      stakingRewardAddress: '0x41D770310daF599F3b96A1bbF1b15805F9A4E29c',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.5,
      pair: '0xf63b80af6d52f57b7f1dfb2a857f5e5592d0620f',
    },
    {
      tokens: [IOI, USDC],
      stakingRewardAddress: '0x71d5669Ea3e0dCFCDA0700ceF4f867dEc4B11dDa',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 0.5,
      pair: '0x8ef139998a743d2cad66df2e750a8c4936f306b9',
    },
    /**{
      tokens: [ANY,QUICK],
      stakingRewardAddress: '0xD6E9C2576FEa298c5C9FA9F2cBC5f124c5f97625',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.3,
      pair: '0xeb275d1d930f157504cca7d7afce38360c7302b5'
    },*/
    {
      tokens: [CHUM, QUICK],
      stakingRewardAddress: '0x51fE4871BD8BFb0d88243194761C361dA4803a2f',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.1,
      pair: '0x0a126ad4e9c446c6219519062932f624d82e075e',
    },
    /**{
      tokens: [MATIC,MOCEAN],
      stakingRewardAddress: '0xEEc558404E179dEb5561fB043D8fd0567227FDE7',
      ended: true,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 0.1,
      pair: '0x5a94f81d25c73eddbdd84b84e8f6d36c58270510'
    },*/
    {
      tokens: [QuickChart, QUICK],
      stakingRewardAddress: '0x45cf73aA2014442BcEb3f28070E054868828f033',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.1,
      pair: '0xa7ff9f67b7de2d210b106b6faa3552fe0537907f',
    },
    {
      tokens: [QuickChart, MATIC],
      stakingRewardAddress: '0x3FC6D202140277b34F0f8B5708DD4502B874BD33',
      ended: true,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 0.1,
      pair: '0x545c671ecb54c9f48901158c6ebb15fdf69c20b5',
    },
    /**{
      tokens: [MEM,ETHER],
      stakingRewardAddress: '0xA553785c55B374ad0eB91EcBEf1e7c7D300970Ba',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.1,
      pair: '0xb0c4464f5351bb9f712ac3e5b21cf97173e85574'
    },*/
    {
      tokens: [IFARM, QUICK],
      stakingRewardAddress: '0xEa2EC0713D3B48234Ad4b2f14EDb4978D1228aE5',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.1,
      pair: '0xd7668414bfd52de6d59e16e5f647c9761992c435',
    },
    {
      tokens: [UBT, QUICK],
      stakingRewardAddress: '0x24830905906b53F737cDc8a227C9475C52795C5C',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 1,
      pair: '0x08a945b6de91a7d0e242e55484a99a4a5f3810a8',
    },
    {
      tokens: [IGG, QUICK],
      stakingRewardAddress: '0x0aC274597134209b640A18Fc70FaE075D33D1d87',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.5,
      pair: '0x2e026b382bccc90df4e73985d1bfadb8ca4ab13b',
    },
    /**{
      tokens: [GFI,QUICK],
      stakingRewardAddress: '0x6FB9803570E0ceBcFAeD26F67Aaef38D4E4AAf75',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.2,
      pair: '0xab37d9048698dff0f6bd01c6b36620a1105be823'
    },*/
    {
      tokens: [TEL, QUICK],
      stakingRewardAddress: '0x19f227C90Ccd615858A7F7848b3b1eb2C652E328',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 11,
      pair: '0xe88e24f49338f974b528ace10350ac4576c5c8a1',
    },
    {
      tokens: [TEL, ETHER],
      stakingRewardAddress: '0xe99e60462C8FCd1470AE258b5649d9fcd3122999',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 10,
      pair: '0xfc2fc983a411c4b1e238f7eb949308cf0218c750',
    },

    {
      tokens: [WOLF, MATIC],
      stakingRewardAddress: '0x3139523e1507cF6B0700Be2EABea6D5e919C6369',
      ended: true,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 0.3,
      pair: '0x652a7b75c229850714d4a11e856052aac3e9b065',
    },
    {
      tokens: [SX, DAI],
      stakingRewardAddress: '0xefF782c32385B5eBd196fFD860629a5c69216c25',
      ended: true,
      lp: '',
      name: '',
      baseToken: DAI,
      rate: 0.1,
      pair: '0x8ed2dac7145865def7838623f715c835dea154cf',
    },
    {
      tokens: [FRAX, FXS],
      stakingRewardAddress: '0x2f5c21A2084fE66E3CEDe1dfd048Ea00b3dcf1f4',
      ended: true,
      lp: '',
      name: '',
      baseToken: FRAX,
      rate: 0.1,
      pair: '0x4756ff6a714ab0a2c69a566e548b59c72eb26725',
    },
    {
      tokens: [TITAN, ETHER],
      stakingRewardAddress: '0x2dF6A6b1B7aA23a842948a81714a2279e603e32f',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 65,
      pair: '0xa28ade2f27b9554b01964fdce97ed643301411d9',
    },
    /**{
      tokens: [KRILL,QUICK],
      stakingRewardAddress: '0xD3435396c763aBA84FD6C6FBFA94243Fc033227c',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 3,
      pair: '0xfc24a83a657a1f3f299a5f801af8816e2d14ff46'
    },
  {
      tokens: [KRILL,USDC],
      stakingRewardAddress: '0x589a0C538c056b99B0D9F40f8e79DeABede87060',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 2,
      pair: '0x6405ebc22cb0899fc21f414085ac4044b4721a0d'
    },  */
    {
      tokens: [AGAr, QUICK],
      stakingRewardAddress: '0xa6b85D97853248973d11B9c806492D405D1B50e5',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.4,
      pair: '0xba29f611473f3eccadb995d85a39b87677f620fe',
    },
    {
      tokens: [EMON, QUICK],
      stakingRewardAddress: '0x6BcCF1f0825826964c2eCC2408B00659eb357b6D',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.2,
      pair: '0x9b6550471fbf39d4708c407eee3fe3d82c6ac6c3',
    },
    {
      tokens: [EMON, MATIC],
      stakingRewardAddress: '0xC9212Ee9bb5A5Cc4fe4D827c65e6De7324297F77',
      ended: true,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 0.1,
      pair: '0xa408a751b6d05d1649c5bbd7c38842fb17ea1846',
    },
    {
      tokens: [AGA, AGAr],
      stakingRewardAddress: '0x855b8dCA0Dfe3A1AC474f5A25792d4326580E06A',
      ended: true,
      lp: '',
      name: '',
      baseToken: AGA,
      rate: 0.1,
      pair: '0x1e794afed730e913d2a514033773c90dc0b59c54',
    },
    /**{
      tokens: [QUICK,XMARK],
      stakingRewardAddress: '0xFd20CfF4eBD6EaD961E86A1264eEa4B64F847150',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.2,
      pair: '0x7579fb88f46adc9ad97d51c3b22e8dcdb6f68a57'
  },
  {
      tokens: [VISION,QUICK],
      stakingRewardAddress: '0x859f1E2490B4F62C5D32cf9409e2bBF43dfA3B61',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.2,
      pair: '0x52f31162e07c0158c5dda8c922ca09b52881e471'
  },
  {
      tokens: [DRC,QUICK],
      stakingRewardAddress: '0x86806771672fb51a04be7BcdC4546fC111BBbA57',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.1,
      pair: '0xeb951f0da8148a0a3fad7a568194ff9495fc464b'
  },
  {
      tokens: [CTSI,QUICK],
      stakingRewardAddress: '0x4AB627237c2ce3719Ca42940c641Cd3dDbC83C0A',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.1,
      pair: '0x4f4b7477850466d96cbcab5b74e58150ed0f2b24'
  },*/
    {
      tokens: [AGA, QUICK],
      stakingRewardAddress: '0x4D637F2d946b4028705BEb436e66Bf1Ffb85C22D',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.7,
      pair: '0x282b89e71325551a2b6d1d30cc10349ea0c79f12',
    },
    /**{
      tokens: [PLOT,QUICK],
      stakingRewardAddress: '0x74A7fdA76A008276705c39B0599916ee8513965c',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.7,
      pair: '0x5278a593fa07f7ec723b992d293f4edc3ae65927'
},
{
      tokens: [BTU,QUICK],
      stakingRewardAddress: '0x6065BAD6E8d8760b0cA729fCE35A98641CE1060C',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.4,
      pair: '0x7c3b697f63a17ccdcd450d6bdb93cabcf9cff114'
},
{
      tokens: [NFTP,QUICK],
      stakingRewardAddress: '0xB771f27de915529DcbBCeFd3b73f2537B94Ab3Fa',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.4,
      pair: '0x2af64089156efa9ce3677c3392ef8fbd9a06a8ad'
},*/
    {
      tokens: [QUICK, MOCEAN],
      stakingRewardAddress: '0xC29996f70BC8D7052287Ada2B7B7765360A69a32',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.4,
      pair: '0xbfe3bb39c514f74f37e20115785bbe58089865a0',
    },
    /**{
      tokens: [FSN,QUICK],
      stakingRewardAddress: '0x631F21B329C958e6A522c7b857F22c0C5E013368',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.3,
      pair: '0xc1950da9e676d352954c1424b341afccf8c4c608'
},*/
    {
      tokens: [ARIA20, ETHER],
      stakingRewardAddress: '0x5Afc79ce4481a4565B88074393F2DbFc19CbCDdC',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 1,
      pair: '0xd88810f3fe698862669448dce29808b242b9a1bc',
    },
    {
      tokens: [ARIA20, QUICK],
      stakingRewardAddress: '0xc74dAA25035577E20db7C1cDEb01bcfFfe4927Ac',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.6,
      pair: '0x8075cda830ea117457f914b790daf93f93c66136',
    },
    {
      tokens: [SX, QUICK],
      stakingRewardAddress: '0x78A8Ef79CB397FeDD933922b3A3Ced03dAcE52d4',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.75,
      pair: '0x049AB22922e2FA63CB259f9D0D30294748cB3E1b',
    },
    {
      tokens: [WOLF, QUICK],
      stakingRewardAddress: '0x8732f213E8F82c6580e2579Dc2E3310aFF90E972',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.45,
      pair: '0x19e524d444f12dc572bea6a45bd7e0bd38818693',
    },
    {
      tokens: [GFARM2, QUICK],
      stakingRewardAddress: '0x395c81AcB66aEfb84CAcc501Bd581f0B261e4Fc1',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.4,
      pair: '0x065d609ff57e8ce4ee5fbc3c040a442354e8a2e4',
    },
    {
      tokens: [ELET, QUICK],
      stakingRewardAddress: '0x0E5a923524fC0A14fA4ab108145e4a019D2f2C6a',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.2,
      pair: '0x592d8faea9e740facbd6115abd92d2e6acb2f8f1',
    },
    /**{
      tokens: [QUICK,DMT],
      stakingRewardAddress: '0xcb099768c2eB727f5380c9E7AF93153E8d0e3766',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.15,
      pair: '0x3cb10463648e3f35ed7c5b64394d482a1b7287b5'
    },*/
    {
      tokens: [DSLA, QUICK],
      stakingRewardAddress: '0xB9Ce318ac54EC8b3aa17d18dFfb0EC3c46E88fef',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 0.1,
      pair: '0x9c8e56e594831951de0791577c0b9bf9aadfbb9e',
    },
    {
      tokens: [SWAP, ETHER],
      stakingRewardAddress: '0x897Bc9871F1D1c520F7c200480b556f87D6638e7',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 1,
      pair: '0xbA8a6d86cD5577426ffbEA6C40B7334650Ff3900',
    },
    {
      tokens: [IFARM, MATIC],
      stakingRewardAddress: '0xD26C29d8B22105d0f4dBBf5c421B228B74722C86',
      ended: true,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 2,
      pair: '0x2a574629ca405fa43a8f21faa64ff73dd320f45b',
    },
    /**{
      tokens: [ETHER,HH],
      stakingRewardAddress: '0xfc4a45f220EaB0a740635eBb3B3b391abbae4e07',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 4,
      pair: '0x64a1d96e6bb8cc8809b8fe068683577c130f75ef'
    },
    {
      tokens: [QUICK,HH],
      stakingRewardAddress: '0xDdAFf21FC862dc1ecf805ca1CEBbfEae95b16E6D',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 1.5,
      pair: '0x4599fa60065fff34b0af5e5f66bebbd9ad137c94'
    },*/
    {
      tokens: [GAME, ETHER],
      stakingRewardAddress: '0x5554281f7e473d93779722e5aa4c2f62C11283fd',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 1.5,
      pair: '0x4b23803040321868fc2eeb6d3e9c353c3237031d',
    },
    /**{
      tokens: [PLOT,USDC],
      stakingRewardAddress: '0xB0755c5b3594A9C8845EB383e6E05E7F49460141',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 1,
      pair: '0x78fd833ec4464d3d6d470e5853dbfc2de0ca6f5b'
    },
    {
      tokens: [CTSI,MATIC],
      stakingRewardAddress: '0x2d0D7FD1bFcbF01947fdc40B507BD73B0863f2D5',
      ended: true,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 1,
      pair: '0xb2e178aa4fa1f0b263a636e8b61e10886fc1938b'
    },*/
    {
      tokens: [GFARM2, ETHER],
      stakingRewardAddress: '0x145bB9b8ebD72Ce915D1DDF6bcf3082027A38C9a',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.5,
      pair: '0xdb869dab270331c6fe2e690f3b6c93a077ed53d5',
    },
    {
      tokens: [HEX, ETHER],
      stakingRewardAddress: '0x9Be3481DD287345Bb9C8B8DDC836e1D0054Edd46',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.5,
      pair: '0x7a81ab0f4fbfcd8cbfc8e96ec8cad5e1e0c67c97',
    },
    /**{
      tokens: [ETHER,DMT],
      stakingRewardAddress: '0x255Df2Ae958aCe49eC9E24B59d5327c6D918C81b',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.5,
      pair: '0x871ff6e567c63644ad0399a8213580101e5d66f8'
    },*/
    {
      tokens: [ELET, MATIC],
      stakingRewardAddress: '0xDa534f1282F832BAc82Ec4502dA6fAd7a60e63A3',
      ended: true,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 0.25,
      pair: '0x9ad3264517167936fc588954f87e6fed23535630',
    },
    {
      tokens: [IGG, ETHER],
      stakingRewardAddress: '0x88D6E84D7220A001F031fA5C8b44E77F957Fe1cD',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 1,
      pair: '0xbcdf529aefb71797cf2e7fb4792f5e11233ec313',
    },
    /**{
      tokens: [BTU,MATIC],
      stakingRewardAddress: '0xe46E640b9E47080aE2cDe82B30500445C857d6d1',
      ended: true,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 0.75,
      pair: '0xe86368fc4e24fad14517f0f0389560e9d1af52ac'
    },*/
    {
      tokens: [MAUSDC, USDC],
      stakingRewardAddress: '0x9Aac6390103C1Af774220aaB85bEB49Ae2DF11d6',
      ended: true,
      lp: '',
      name: '',
      baseToken: USDC,
      rate: 5,
      pair: '0x7295304b10740BA8e037826787d3e9386FD99925',
    },
    {
      tokens: [MAAAVE, QUICK],
      stakingRewardAddress: '0x994c2f4b860B9DC412502a57a60473d7b5AB20e5',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 3,
      pair: '0x6583dD93f9060A919E2b3F1875985d606d0eDdfb',
    },

    {
      tokens: [MAUSDC, QUICK],
      stakingRewardAddress: '0x8df5AdD0eB677d12EA86C5f83DdB7e184b750116',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 4,
      pair: '0x1697D88Dda5e913D9a29111e858292855CA0d9cF',
    },
    {
      tokens: [MAYFI, MAUSDC],
      stakingRewardAddress: '0xe13876aAFb5cd2e162ec253499Eb414083a96Af2',
      ended: true,
      lp: '',
      name: '',
      baseToken: MAUSDC,
      rate: 4,
      pair: '0x0C7131aA808dbc1132515cE7B83fc3c84a603c91',
    },
    {
      tokens: [MADAI, MAUSDC],
      stakingRewardAddress: '0x7131eBbC3e08E8e0D8938DFd36D3E76B874Fc75e',
      ended: true,
      lp: '',
      name: '',
      baseToken: MAUSDC,
      rate: 2,
      pair: '0x6Fc2a79b1f0c31Ec4DC4343157cBD8becb0f6aaF',
    },
    {
      tokens: [MAWETH, MAUSDC],
      stakingRewardAddress: '0x2Ee1eaE8fB3F5F56ABB882D48E2d767DA0211D8E',
      ended: true,
      lp: '',
      name: '',
      baseToken: MAUSDC,
      rate: 2,
      pair: '0x95E6c356C87A5AB6Cc415040F1C794e82015207E',
    },
    {
      tokens: [QUICK, OM],
      stakingRewardAddress: '0xe1fE89651932D84e7880651187547869CA524976',
      ended: true,
      lp: '',
      name: '',
      baseToken: QUICK,
      rate: 2,
      pair: '0xdfa81e266ff54a7d9d26c5083f9631e685d833d7',
    },
    {
      tokens: [MAAAVE, MAUSDC],
      stakingRewardAddress: '0xe985c9416D05B3b3872d9e640C9590FaC37705Bd',
      ended: true,
      lp: '',
      name: '',
      baseToken: MAUSDC,
      rate: 1.5,
      pair: '0xaCe1E8B717202bC122a7d98C308824C33f4cC20D',
    },
    {
      tokens: [MATUSD, MAUSDC],
      stakingRewardAddress: '0xD854f08373a97237C7a830e1e34475535CB1eaDE',
      ended: true,
      lp: '',
      name: '',
      baseToken: MAUSDC,
      rate: 1.5,
      pair: '0xc8f51057e1aeA189f18011A278432ef2dC6D204a',
    },
    {
      tokens: [MAUSDT, MAUSDC],
      stakingRewardAddress: '0xA694345b2f208DA59ebF3fc6b66E97c0CA18C3E1',
      ended: true,
      lp: '',
      name: '',
      baseToken: MAUSDC,
      rate: 1.5,
      pair: '0x2EeA2D478787DFCAA4aa5398622556b9d775f194',
    },
    {
      tokens: [DB, MATIC],
      stakingRewardAddress: '0x35CEADEd1457aE4AaD028ff996DC5A889Ea8d7C1',
      ended: true,
      lp: '',
      name: '',
      baseToken: MATIC,
      rate: 1,
      pair: '0x8422afe8c0285c393dd0f63da1fb12642fb154fd',
    },
    {
      tokens: [DB, ETHER],
      stakingRewardAddress: '0xd437c3c9Ca21D634878BDDBf973bCFB23D280E86',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 1,
      pair: '0xeeac90aa76960d0622ca5ae2528b5418f0ec7bb4',
    },
    {
      tokens: [MALINK, MAUSDC],
      stakingRewardAddress: '0x211B1312Bb797Ee7c7193AE87481E0B5f259c0a5',
      ended: true,
      lp: '',
      name: '',
      baseToken: MAUSDC,
      rate: 1,
      pair: '0xd94cBaE5484f510A44d905956b590c9f5E668Ed0',
    },
    /**{
  tokens: [ETHER,AZUKI],
  stakingRewardAddress: '0x8d8fDaEcCC776c8E76B8320e8BC29dcC8BC07907',
  ended: true,
  lp: '',
  name: '',
  baseToken: ETHER,
  rate: 0.1,
  pair: '0x52a1c3d399ac185aad5db5993ce05089c3416206'
},
{
  tokens: [CFI,QUICK],
  stakingRewardAddress: '0x04cda3ed6750AAb11e2A50029460543E914dD81D',
  ended: true,
  lp: '',
  name: '',
  baseToken: QUICK,
  rate: 0.8,
  pair: '0xa2df4607db485ce3e79c01c12d100f202584786f'
},
{
  tokens: [DSLA,ETHER],
  stakingRewardAddress: '0x4A47Ea19241058b1F960331c3f1a1B4BD7D4A584',
  ended: true,
  lp: '',
  name: '',
  baseToken: ETHER,
  rate: 0.5,
  pair: '0xeeb92e3cb8e38375e2c20201e9b9fb8740d0133f'
},
{
  tokens: [QUICK,ZUZ],
  stakingRewardAddress: '0xC1B0A3f47f05A58a7D83855B9F9e8C5f4042dc8c',
  ended: true,
  lp: '',
  name: '',
  baseToken: QUICK,
  rate: 0.4,
  pair: '0xcfb7fc1d8eca39a1d4647e9e492dc5f651e4fd5a'
},*/
    {
      tokens: [ETHER, OM],
      stakingRewardAddress: '0xA0218a57CC1D595aF0b79Af450f37fc4207dE94C',
      ended: true,
      lp: '',
      name: '',
      baseToken: ETHER,
      rate: 0.25,
      pair: '0xff2bbcb399ad50bbd06debadd47d290933ae1038',
    },
    /*{
  tokens: [PPDEX,QUICK],
  stakingRewardAddress: '0xC6a6B2d95B99CA9c3149f8dF8f22E1e34fb75ccc',
  ended: true,
  lp: '',
  name: '',
  baseToken: QUICK,
  rate: 0.25,
  pair: '0xa945e334f25e869a13ca0bcf8e6828963b270938'
},
{
  tokens: [DRC,QUICK],
  stakingRewardAddress: '0x86806771672fb51a04be7BcdC4546fC111BBbA57',
  ended: true,
  lp: '',
  name: '',
  baseToken: QUICK,
  rate: 0.2,
  pair: '0xeb951f0da8148a0a3fad7a568194ff9495fc464b'
},*/
    /**{
  tokens: [QUICK,MDEF],
  stakingRewardAddress: '0xdE1140Ff770F83a59e91c3a04c6628D86e8414f2',
  ended: true,
  lp: '',
  name: '',
  baseToken: QUICK,
  rate: 0.2,
  pair: '0x338b23d1a3f3a46d871a84b4467f20a0b023c03f'
},
{
  tokens: [ZUT,QUICK],
  stakingRewardAddress: '0x06c0b1461740a8570f755cf26e7B418862c3998B',
  ended: true,
  lp: '',
  name: '',
  baseToken: QUICK,
  rate: 0.2,
  pair: '0x8d4fde3403e6d2d6525ad1b4ea4680c7ede00b79'
},
{
  tokens: [CFI,USDC],
  stakingRewardAddress: '0x579eabaED8cdA62D502c219392d9C07B142e0af6',
  ended: true,
  lp: '',
  name: '',
  baseToken: USDC,
  rate: 0.1,
  pair: '0xf436257335b28e2b14861bf5f3b17b8a21bbd6df'
},
{
  tokens: [QUICK,AZUKI],
  stakingRewardAddress: '0xfBCf532DeE2A6d2f45bD89419adaA07457d50CF9',
  ended: true,
  lp: '',
  name: '',
  baseToken: QUICK,
  rate: 1,
  pair: '0xe17672606cf179278f63e15b8a4bcbf936058233'
},*/
    {
      tokens: [MAUNI, MAUSDC],
      stakingRewardAddress: '0x3e9951ba9ea39FF1ACDCA838E1A294c7C8675b23',
      ended: true,
      lp: '',
      name: '',
      baseToken: MAUSDC,
      rate: 3,
      pair: '0xca84c15C5F46d39EE3fd0cD9278CE19579424Dc2',
    },
    {
      tokens: [MATIC, QUICK],
      stakingRewardAddress: '0xA958408a73253a7CA59aa62c4F048B1d21E3DA32',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [GHST, QUICK],
      stakingRewardAddress: '0xb02eE9583cd78B781B060B1c96E0Ab43dd35865C',
      ended: true,
      rate: 0,
      pair: '',
      name: 'StkGHST-QUICK',
      lp: '0xA02d547512Bb90002807499F05495Fe9C4C3943f',
      baseToken: QUICK,
    },
    {
      tokens: [ETHER, MATIC],
      stakingRewardAddress: '0x9bCfD9B9a5Cbe2669AD30B0AD02693aFac0485f1',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [WBTC, ETHER],
      stakingRewardAddress: '0x804bE64d74D1611C2240B4E26e75DD15611B1AD8',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [MAUSDC, USDC],
      stakingRewardAddress: '0xF440356a4c7BD396ED4834b191323cd7631F4e48',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: USDC,
    },
    {
      tokens: [GHST, USDC],
      stakingRewardAddress: '0x641797a37E9bFE6c1d8acC480d88dFb1F650469E',
      ended: true,
      rate: 0,
      pair: '',
      name: 'stkGHST-USDC',
      lp: '0x04439eC4ba8b09acfae0E9b5D75A82cC63b19f09',
      baseToken: USDC,
    },
    {
      tokens: [ETHER, WISE],
      stakingRewardAddress: '0x63872458DF5aFc02a4C94aC35c5Bd3b290157d4E',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [LINK, ETHER],
      stakingRewardAddress: '0x1caaE46899f1408c56DB17BeDCbC4F5258201677',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [USDC, QUICK],
      stakingRewardAddress: '0xc1625138D914aEEB6C1c0538F2D982fDC12B1E94',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: USDC,
    },
    {
      tokens: [AGA, AGAr],
      stakingRewardAddress: '0x34B23B92b99b04aB959A35d80dc86b4B6543798D',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: AGA,
    },
    {
      tokens: [QUICK, WISE],
      stakingRewardAddress: '0x7f5649FB6b517Da2Fb94C9C13270F6019587be95',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [CEL, ETHER],
      stakingRewardAddress: '0xAbaaBB7932941E995e297762428Aee671B3897CB',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [SX, ETHER],
      stakingRewardAddress: '0xbC37455390309b8CD05CD20D9bDC9d8e86F05E44',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [WOLF, MATIC],
      stakingRewardAddress: '0x97ADf29d52113a201928903DFC0d1ddB4DF55c5f',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MATIC,
    },
    {
      tokens: [ETHER, USDC],
      stakingRewardAddress: '0x6E25652E99ACeEbeE08677523E57485B8814D828',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: USDC,
    },
    {
      tokens: [ETHER, QUICK],
      stakingRewardAddress: '0x1B92675fD23464b08e3846D1651546B1b55d8440',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [MAAAVE, QUICK],
      stakingRewardAddress: '0x35d6A1a4D8d6e6B6b7ecAfa3624B2b58D84DEA87',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [FRAX, QUICK],
      stakingRewardAddress: '0xB96483272c47b4eA28AB84CCa90b39Bb5E72461d',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [FRAX, FXS],
      stakingRewardAddress: '0x20e1cd604a3b3E36FfE3be0AaDb00A11493e013F',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: FRAX,
    },
    {
      tokens: [ETHER, DEFI5],
      stakingRewardAddress: '0x3Dc98a487e9c0Fa6818e2AC8d1e0c6859864fBB2',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [QUICK, DEFI5],
      stakingRewardAddress: '0xc9efCF977e2e616BAd165Be2C821404A747241e1',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [SWAP, QUICK],
      stakingRewardAddress: '0x7A3ECA5cb983aEfF1498AA97FcCFf4E622071861',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [DG, ETHER],
      stakingRewardAddress: '0x77B3fc66a479352680aCc73F54d4E5C61Aee031E',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [LINK, QUICK],
      stakingRewardAddress: '0x8aaadD27f054AA431deaDB2a27Dcb01bFDbA065D',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [DG, QUICK],
      stakingRewardAddress: '0x3fCF47aE7fce0F7cD11DF857bB5EdB10B6B46d85',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [QUICK, CC10],
      stakingRewardAddress: '0x4E15567FA3019C3D3E06b61db291e34a7C706588',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [ETHER, DEGEN],
      stakingRewardAddress: '0x2eb5089210F74C8181d73b57583Db2dFB8f5F99B',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [DEGEN, QUICK],
      stakingRewardAddress: '0xDEE71EB6a43d6C78A76DfEdEc58b909e40A65113',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [GAME, QUICK],
      stakingRewardAddress: '0x12918AE5DB0A44003F30513c3C6D79b9A6DFDD7A',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [ARIA20, ETHER],
      stakingRewardAddress: '0x7c10d4d1373d68Ef0C6562A055746490F095884e',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [GFARM2, ETHER],
      stakingRewardAddress: '0x23839054C80405d8f17975A69928e98F688e19F4',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    /**{ tokens: [NFTP,QUICK],
      stakingRewardAddress: '0x89c4dEf39208FCAd8576203FDB822113251F336D',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [MAYFI,MAUSDC],
      stakingRewardAddress: '0xec8EDe9b9c611875204DCD6D230E6f4d27093e83',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC },
    { tokens: [ETHER,HH],
      stakingRewardAddress: '0x8Ae80Fb622AD0E0cC07f2C1Df542127643D6de5B',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },*/
    {
      tokens: [QUICK, CEL],
      stakingRewardAddress: '0x76Fde8bF414dC50424369cC8cD5Cfe4FB8a723E7',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [UBT, ETHER],
      stakingRewardAddress: '0xcC7aD1515B0597B9F6349296e32bFBFce7A0647B',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [SUPER, QUICK],
      stakingRewardAddress: '0xCAe5859a7b015C8712097Aa5035f0cb550727f11',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [CC10, ETHER],
      stakingRewardAddress: '0x3554268f2b33d7437055CeE63761fA74D7f4eF01',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [MAUSDC, QUICK],
      stakingRewardAddress: '0x0dD81cfB657257C8B3Def470F7f9B73dB0cdF999',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [UNITOKEN, QUICK],
      stakingRewardAddress: '0xC6F3D941734038705202339BfbE9FF304D225578',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [DAI, ETHER],
      stakingRewardAddress: '0x0B8D16bb9d352A4e7e28B126480dB28C75a41099',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: DAI,
    },
    {
      tokens: [MAUNI, MAUSDC],
      stakingRewardAddress: '0x2425aFCE5E595A49D288e04A4AB0500C5b8de166',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC,
    },
    {
      tokens: [IFARM, MATIC],
      stakingRewardAddress: '0x857015ed5FABB889F3502fdC1a9292742435c1d2',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MATIC,
    },
    {
      tokens: [WOLF, QUICK],
      stakingRewardAddress: '0x3524bdf73A734E59fAC15164656ab1948De683F2',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [IGG, QUICK],
      stakingRewardAddress: '0x64dE4A52f6657BAc9b2F7BfD6b2dEdd4784aDb21',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    /**{ tokens: [QUICK,XMARK],
      stakingRewardAddress: '0x43AdE98902bF121C8eaB832313EFFff084CcAbE4',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },*/
    {
      tokens: [ELET, QUICK],
      stakingRewardAddress: '0xe4D994A4f5cbDe9C58708B618B577eE24Bbc7A4F',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [IFARM, QUICK],
      stakingRewardAddress: '0x085bF80e14F6623566bADE65cD2e80ba30d75594',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [MATIC, MOCEAN],
      stakingRewardAddress: '0x0B6BcA5fD3AC33DBe359186EDcE20Bb8e2f5F412',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MATIC,
    },
    {
      tokens: [MADAI, MAUSDC],
      stakingRewardAddress: '0x5128891a4491778b7C4D5977adaD2AA0fcaaa4B3',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC,
    },
    {
      tokens: [SX, QUICK],
      stakingRewardAddress: '0x3a806E445E76eC82AB9E9eD52d1Ea26b86b20535',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [VISION, ETHER],
      stakingRewardAddress: '0xd6773Ec3Df8aEfBfbeAe228d8e35547d660A75D2',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    /**{ tokens: [QUICK,HH],
      stakingRewardAddress: '0xa0f066630a448cC5D749F40CB76c8D6C2FB26de1',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },*/
    {
      tokens: [UBT, QUICK],
      stakingRewardAddress: '0xf3D1e34FB6d7B7387B48DebFeBDEa095dD04C728',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [SX, DAI],
      stakingRewardAddress: '0x185DE8B523A1917aC9707D58caF88C99b894a86B',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: DAI,
    },
    {
      tokens: [MATUSD, MAUSDC],
      stakingRewardAddress: '0x3d0695b1A356Bce355C2eE5748c0b6F588bC2460',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC,
    },
    {
      tokens: [QUICK, MOCEAN],
      stakingRewardAddress: '0x9Dc0968cb466efbcaCCAaF11A968e2f4C6B6DFD7',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [SWAP, ETHER],
      stakingRewardAddress: '0xf6D11f1BCEd96E406459B3C61e5FF7bA08118810',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [SUPER, ETHER],
      stakingRewardAddress: '0x876aC040AB328735A962FA564f6c96892E991b52',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [MAWETH, MAUSDC],
      stakingRewardAddress: '0x06963e6F7D8F07CF51C0Bf0B62afEf66070251c0',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC,
    },
    {
      tokens: [DB, ETHER],
      stakingRewardAddress: '0x40B2e5857C11f0cb17475Bd0dB799d11B96835dA',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [ARIA20, QUICK],
      stakingRewardAddress: '0x65a3Fa9E294014754c127708422296EC2f3DDDEd',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [GFARM2, QUICK],
      stakingRewardAddress: '0x643e41cC2B3E1D4fe5eb6726DF27362Fcc4cdf47',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    /**{ tokens: [CTSI,QUICK],
      stakingRewardAddress: '0x6D24AFeb3f83645E0569A7Ad30b2Ee7A8c2Af8B7',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [CTSI,MATIC],
      stakingRewardAddress: '0x44ba17f47e1a8fE909ca99F9854001091293E6Ff',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: MATIC },
    { tokens: [AGAr,QUICK],
      stakingRewardAddress: '0x3238Cd353fd549DDdd1703f1aa30aA1439c1C89F',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [QUICK,DMT],
      stakingRewardAddress: '0x77Fae246AB517778FD0B9f131A5F7c8609c39beB',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },*/
    {
      tokens: [DSLA, QUICK],
      stakingRewardAddress: '0x297182f8cE4A9753071c046FD2c7a2b8Af3d7E3b',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [MAAAVE, MAUSDC],
      stakingRewardAddress: '0xB8c89BCCAB833705e2c261d38D56e04281e5DfC0',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC,
    },
    {
      tokens: [MAUSDT, MAUSDC],
      stakingRewardAddress: '0xd157ceF172a04C77eF9Bf9AE4221FFeAAefC3cd6',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC,
    },
    {
      tokens: [DB, MATIC],
      stakingRewardAddress: '0x6eA21F2b8EB4c33F1Dcc09ce13067922F9eBCb29',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MATIC,
    },
    {
      tokens: [AGA, QUICK],
      stakingRewardAddress: '0x35c738000dA563A4BA7A8243d48DA1288d275de0',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [MATIC, USDC],
      stakingRewardAddress: '0x0Dd8cf4410e18C6B2559CC561Ee32113DfF1ED9d',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: USDC,
    },
    {
      tokens: [HEX, QUICK],
      stakingRewardAddress: '0xb5536ecB9dD16D6E9f53460C46B75CEF99A81B47',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [VISION, QUICK],
      stakingRewardAddress: '0x554aE50F333758DCe71bfe36F7cf7DA4AE6C6C7D',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    /**{ tokens: [BTU,QUICK],
      stakingRewardAddress: '0x981803904e7E38cf7D053B17AcDd07b312A5cAfF',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },*/
    {
      tokens: [GAME, ETHER],
      stakingRewardAddress: '0x18eE880Da337B9ef245aa607225Df0C3e855d7ae',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [IGG, ETHER],
      stakingRewardAddress: '0xb4efe5E33f32D3B00Ff2237a7eC8C6d6FF7cEb7F',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    /**{ tokens: [ETHER,DMT],
      stakingRewardAddress: '0x9774a4649A8ca32942776687f1e6989dA9a5f2C1',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },*/
    {
      tokens: [ELET, MATIC],
      stakingRewardAddress: '0x9fD1FF330aC9e73eD6491342c33bcFCAf5e76f9D',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MATIC,
    },
    {
      tokens: [DSLA, ETHER],
      stakingRewardAddress: '0xD854701dD42a0B78697B51D9678F3FFa1fD536FA',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [MALINK, MAUSDC],
      stakingRewardAddress: '0xb87A500aA5DE176F08c23288AC46AF72740c81CA',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC,
    },
    {
      tokens: [QUICK, OM],
      stakingRewardAddress: '0x5141905F200c951438152496DEe74A000ed1e5E9',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    /**{ tokens: [BTU,MATIC],
      stakingRewardAddress: '0x5144Bf60788920e1B3C566F62692DBFee9139925',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: MATIC },
    { tokens: [QUICK,AZUKI],
      stakingRewardAddress: '0xd4F2605f077Bf215c72614C5A447BDcFa7792532',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [QUICK,ZUZ],
      stakingRewardAddress: '0xBbD31D613ff98d0f56d1Acc1de7b5C08Da49ACB8',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [HEX,ETHER],
      stakingRewardAddress: '0xe09792F7716d820C62d7746BBAF2A418EeE8135D',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [CFI,QUICK],
      stakingRewardAddress: '0x3Ede2fbC9F720c05ceC8296857480fAA71f074C4',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },*/
    {
      tokens: [USDC, USDT],
      stakingRewardAddress: '0x69F8E212c97DB9Ec721f508a038a1BA724131946',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: USDC,
    },
    /**{ tokens: [ETHER,AZUKI],
      stakingRewardAddress: '0x6162f89F1582A74D6B8918b5989994c678A762a8',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [ETHER,OM],
      stakingRewardAddress: '0x4909E3fdabf5eCA5e489E7Ac4227C412619838a1',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [PPDEX,QUICK],
      stakingRewardAddress: '0x02e564da1f53BC11Ea2cb60c394f69d2bfD348d7',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [ZUT,QUICK],
      stakingRewardAddress: '0xc8fC0635F8369Ad79B9ed801963047D2f523C4d9',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [CFI,USDC],
      stakingRewardAddress: '0x027DfAf5128a64522aC52FD68370150E4A6C5da4',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: USDC },
    { tokens: [QUICK,MDEF],
      stakingRewardAddress: '0x3052faD089A5115C84a201dCc8bfE57722542814',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [DRC,QUICK],
      stakingRewardAddress: '0x8290c27e97707B84C7fFbcB0F33dc68cFEe8ae2a',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },*/
    {
      tokens: [DB, QUICK],
      stakingRewardAddress: '0x15D04518278a4D271706a291242734e16D4D9D32',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },

    {
      tokens: [MATIC, QUICK],
      stakingRewardAddress: '0xA958408a73253a7CA59aa62c4F048B1d21E3DA32',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [GHST, QUICK],
      stakingRewardAddress: '0xb02eE9583cd78B781B060B1c96E0Ab43dd35865C',
      ended: true,
      rate: 0,
      pair: '',
      name: 'StkGHST-QUICK',
      lp: '0xA02d547512Bb90002807499F05495Fe9C4C3943f',
      baseToken: QUICK,
    },
    {
      tokens: [ETHER, MATIC],
      stakingRewardAddress: '0x9bCfD9B9a5Cbe2669AD30B0AD02693aFac0485f1',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [WBTC, ETHER],
      stakingRewardAddress: '0x804bE64d74D1611C2240B4E26e75DD15611B1AD8',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [MAUSDC, USDC],
      stakingRewardAddress: '0xF440356a4c7BD396ED4834b191323cd7631F4e48',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: USDC,
    },
    {
      tokens: [GHST, USDC],
      stakingRewardAddress: '0x641797a37E9bFE6c1d8acC480d88dFb1F650469E',
      ended: true,
      rate: 0,
      pair: '',
      name: 'stkGHST-USDC',
      lp: '0x04439eC4ba8b09acfae0E9b5D75A82cC63b19f09',
      baseToken: USDC,
    },
    {
      tokens: [ETHER, WISE],
      stakingRewardAddress: '0x63872458DF5aFc02a4C94aC35c5Bd3b290157d4E',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [LINK, ETHER],
      stakingRewardAddress: '0x1caaE46899f1408c56DB17BeDCbC4F5258201677',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [USDC, QUICK],
      stakingRewardAddress: '0xc1625138D914aEEB6C1c0538F2D982fDC12B1E94',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: USDC,
    },
    {
      tokens: [AGA, AGAr],
      stakingRewardAddress: '0x34B23B92b99b04aB959A35d80dc86b4B6543798D',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: AGA,
    },
    {
      tokens: [QUICK, WISE],
      stakingRewardAddress: '0x7f5649FB6b517Da2Fb94C9C13270F6019587be95',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [CEL, ETHER],
      stakingRewardAddress: '0xAbaaBB7932941E995e297762428Aee671B3897CB',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [SX, ETHER],
      stakingRewardAddress: '0xbC37455390309b8CD05CD20D9bDC9d8e86F05E44',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [WOLF, MATIC],
      stakingRewardAddress: '0x97ADf29d52113a201928903DFC0d1ddB4DF55c5f',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MATIC,
    },
    {
      tokens: [ETHER, USDC],
      stakingRewardAddress: '0x6E25652E99ACeEbeE08677523E57485B8814D828',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: USDC,
    },
    {
      tokens: [ETHER, QUICK],
      stakingRewardAddress: '0x1B92675fD23464b08e3846D1651546B1b55d8440',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [MAAAVE, QUICK],
      stakingRewardAddress: '0x35d6A1a4D8d6e6B6b7ecAfa3624B2b58D84DEA87',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [FRAX, QUICK],
      stakingRewardAddress: '0xB96483272c47b4eA28AB84CCa90b39Bb5E72461d',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [FRAX, FXS],
      stakingRewardAddress: '0x20e1cd604a3b3E36FfE3be0AaDb00A11493e013F',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: FRAX,
    },
    {
      tokens: [ETHER, DEFI5],
      stakingRewardAddress: '0x3Dc98a487e9c0Fa6818e2AC8d1e0c6859864fBB2',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [QUICK, DEFI5],
      stakingRewardAddress: '0xc9efCF977e2e616BAd165Be2C821404A747241e1',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [SWAP, QUICK],
      stakingRewardAddress: '0x7A3ECA5cb983aEfF1498AA97FcCFf4E622071861',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [DG, ETHER],
      stakingRewardAddress: '0x77B3fc66a479352680aCc73F54d4E5C61Aee031E',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [LINK, QUICK],
      stakingRewardAddress: '0x8aaadD27f054AA431deaDB2a27Dcb01bFDbA065D',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [DG, QUICK],
      stakingRewardAddress: '0x3fCF47aE7fce0F7cD11DF857bB5EdB10B6B46d85',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [QUICK, CC10],
      stakingRewardAddress: '0x4E15567FA3019C3D3E06b61db291e34a7C706588',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [ETHER, DEGEN],
      stakingRewardAddress: '0x2eb5089210F74C8181d73b57583Db2dFB8f5F99B',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [DEGEN, QUICK],
      stakingRewardAddress: '0xDEE71EB6a43d6C78A76DfEdEc58b909e40A65113',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [GAME, QUICK],
      stakingRewardAddress: '0x12918AE5DB0A44003F30513c3C6D79b9A6DFDD7A',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [ARIA20, ETHER],
      stakingRewardAddress: '0x7c10d4d1373d68Ef0C6562A055746490F095884e',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [GFARM2, ETHER],
      stakingRewardAddress: '0x23839054C80405d8f17975A69928e98F688e19F4',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    /**{ tokens: [NFTP,QUICK],
      stakingRewardAddress: '0x89c4dEf39208FCAd8576203FDB822113251F336D',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [MAYFI,MAUSDC],
      stakingRewardAddress: '0xec8EDe9b9c611875204DCD6D230E6f4d27093e83',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC },
    { tokens: [ETHER,HH],
      stakingRewardAddress: '0x8Ae80Fb622AD0E0cC07f2C1Df542127643D6de5B',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },*/
    {
      tokens: [QUICK, CEL],
      stakingRewardAddress: '0x76Fde8bF414dC50424369cC8cD5Cfe4FB8a723E7',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [UBT, ETHER],
      stakingRewardAddress: '0xcC7aD1515B0597B9F6349296e32bFBFce7A0647B',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [SUPER, QUICK],
      stakingRewardAddress: '0xCAe5859a7b015C8712097Aa5035f0cb550727f11',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [CC10, ETHER],
      stakingRewardAddress: '0x3554268f2b33d7437055CeE63761fA74D7f4eF01',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [MAUSDC, QUICK],
      stakingRewardAddress: '0x0dD81cfB657257C8B3Def470F7f9B73dB0cdF999',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [UNITOKEN, QUICK],
      stakingRewardAddress: '0xC6F3D941734038705202339BfbE9FF304D225578',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [DAI, ETHER],
      stakingRewardAddress: '0x0B8D16bb9d352A4e7e28B126480dB28C75a41099',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: DAI,
    },
    {
      tokens: [MAUNI, MAUSDC],
      stakingRewardAddress: '0x2425aFCE5E595A49D288e04A4AB0500C5b8de166',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC,
    },
    {
      tokens: [IFARM, MATIC],
      stakingRewardAddress: '0x857015ed5FABB889F3502fdC1a9292742435c1d2',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MATIC,
    },
    {
      tokens: [WOLF, QUICK],
      stakingRewardAddress: '0x3524bdf73A734E59fAC15164656ab1948De683F2',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [IGG, QUICK],
      stakingRewardAddress: '0x64dE4A52f6657BAc9b2F7BfD6b2dEdd4784aDb21',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    /**{ tokens: [QUICK,XMARK],
      stakingRewardAddress: '0x43AdE98902bF121C8eaB832313EFFff084CcAbE4',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },*/
    {
      tokens: [ELET, QUICK],
      stakingRewardAddress: '0xe4D994A4f5cbDe9C58708B618B577eE24Bbc7A4F',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [IFARM, QUICK],
      stakingRewardAddress: '0x085bF80e14F6623566bADE65cD2e80ba30d75594',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [MATIC, MOCEAN],
      stakingRewardAddress: '0x0B6BcA5fD3AC33DBe359186EDcE20Bb8e2f5F412',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MATIC,
    },
    {
      tokens: [MADAI, MAUSDC],
      stakingRewardAddress: '0x5128891a4491778b7C4D5977adaD2AA0fcaaa4B3',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC,
    },

    {
      tokens: [SX, QUICK],
      stakingRewardAddress: '0x3a806E445E76eC82AB9E9eD52d1Ea26b86b20535',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [VISION, ETHER],
      stakingRewardAddress: '0xd6773Ec3Df8aEfBfbeAe228d8e35547d660A75D2',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    /**{ tokens: [QUICK,HH],
      stakingRewardAddress: '0xa0f066630a448cC5D749F40CB76c8D6C2FB26de1',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },*/
    {
      tokens: [UBT, QUICK],
      stakingRewardAddress: '0xf3D1e34FB6d7B7387B48DebFeBDEa095dD04C728',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [SX, DAI],
      stakingRewardAddress: '0x185DE8B523A1917aC9707D58caF88C99b894a86B',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: DAI,
    },
    {
      tokens: [MATUSD, MAUSDC],
      stakingRewardAddress: '0x3d0695b1A356Bce355C2eE5748c0b6F588bC2460',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC,
    },
    {
      tokens: [QUICK, MOCEAN],
      stakingRewardAddress: '0x9Dc0968cb466efbcaCCAaF11A968e2f4C6B6DFD7',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [SWAP, ETHER],
      stakingRewardAddress: '0xf6D11f1BCEd96E406459B3C61e5FF7bA08118810',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [SUPER, ETHER],
      stakingRewardAddress: '0x876aC040AB328735A962FA564f6c96892E991b52',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [MAWETH, MAUSDC],
      stakingRewardAddress: '0x06963e6F7D8F07CF51C0Bf0B62afEf66070251c0',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC,
    },
    {
      tokens: [DB, ETHER],
      stakingRewardAddress: '0x40B2e5857C11f0cb17475Bd0dB799d11B96835dA',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [ARIA20, QUICK],
      stakingRewardAddress: '0x65a3Fa9E294014754c127708422296EC2f3DDDEd',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [GFARM2, QUICK],
      stakingRewardAddress: '0x643e41cC2B3E1D4fe5eb6726DF27362Fcc4cdf47',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    /**{ tokens: [CTSI,QUICK],
      stakingRewardAddress: '0x6D24AFeb3f83645E0569A7Ad30b2Ee7A8c2Af8B7',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [CTSI,MATIC],
      stakingRewardAddress: '0x44ba17f47e1a8fE909ca99F9854001091293E6Ff',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: MATIC },
    { tokens: [AGAr,QUICK],
      stakingRewardAddress: '0x3238Cd353fd549DDdd1703f1aa30aA1439c1C89F',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [QUICK,DMT],
      stakingRewardAddress: '0x77Fae246AB517778FD0B9f131A5F7c8609c39beB',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },*/
    {
      tokens: [DSLA, QUICK],
      stakingRewardAddress: '0x297182f8cE4A9753071c046FD2c7a2b8Af3d7E3b',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [MAAAVE, MAUSDC],
      stakingRewardAddress: '0xB8c89BCCAB833705e2c261d38D56e04281e5DfC0',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC,
    },
    {
      tokens: [MAUSDT, MAUSDC],
      stakingRewardAddress: '0xd157ceF172a04C77eF9Bf9AE4221FFeAAefC3cd6',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC,
    },
    {
      tokens: [DB, MATIC],
      stakingRewardAddress: '0x6eA21F2b8EB4c33F1Dcc09ce13067922F9eBCb29',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MATIC,
    },
    {
      tokens: [AGA, QUICK],
      stakingRewardAddress: '0x35c738000dA563A4BA7A8243d48DA1288d275de0',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [MATIC, USDC],
      stakingRewardAddress: '0x0Dd8cf4410e18C6B2559CC561Ee32113DfF1ED9d',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: USDC,
    },
    {
      tokens: [HEX, QUICK],
      stakingRewardAddress: '0xb5536ecB9dD16D6E9f53460C46B75CEF99A81B47',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [VISION, QUICK],
      stakingRewardAddress: '0x554aE50F333758DCe71bfe36F7cf7DA4AE6C6C7D',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    /**{ tokens: [BTU,QUICK],
      stakingRewardAddress: '0x981803904e7E38cf7D053B17AcDd07b312A5cAfF',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [GAME,ETHER],
      stakingRewardAddress: '0x18eE880Da337B9ef245aa607225Df0C3e855d7ae',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [IGG,ETHER],
      stakingRewardAddress: '0xb4efe5E33f32D3B00Ff2237a7eC8C6d6FF7cEb7F',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [ETHER,DMT],
      stakingRewardAddress: '0x9774a4649A8ca32942776687f1e6989dA9a5f2C1',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },*/
    {
      tokens: [ELET, MATIC],
      stakingRewardAddress: '0x9fD1FF330aC9e73eD6491342c33bcFCAf5e76f9D',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MATIC,
    },
    {
      tokens: [DSLA, ETHER],
      stakingRewardAddress: '0xD854701dD42a0B78697B51D9678F3FFa1fD536FA',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [MALINK, MAUSDC],
      stakingRewardAddress: '0xb87A500aA5DE176F08c23288AC46AF72740c81CA',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC,
    },
    {
      tokens: [QUICK, OM],
      stakingRewardAddress: '0x5141905F200c951438152496DEe74A000ed1e5E9',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    /**{ tokens: [BTU,MATIC],
      stakingRewardAddress: '0x5144Bf60788920e1B3C566F62692DBFee9139925',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: MATIC },
    { tokens: [QUICK,AZUKI],
      stakingRewardAddress: '0xd4F2605f077Bf215c72614C5A447BDcFa7792532',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [QUICK,ZUZ],
      stakingRewardAddress: '0xBbD31D613ff98d0f56d1Acc1de7b5C08Da49ACB8',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },*/
    {
      tokens: [HEX, ETHER],
      stakingRewardAddress: '0xe09792F7716d820C62d7746BBAF2A418EeE8135D',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    /**{ tokens: [CFI,QUICK],
      stakingRewardAddress: '0x3Ede2fbC9F720c05ceC8296857480fAA71f074C4',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [USDC,USDT],
      stakingRewardAddress: '0x69F8E212c97DB9Ec721f508a038a1BA724131946',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: USDC },
    { tokens: [ETHER,AZUKI],
      stakingRewardAddress: '0x6162f89F1582A74D6B8918b5989994c678A762a8',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [ETHER,OM],
      stakingRewardAddress: '0x4909E3fdabf5eCA5e489E7Ac4227C412619838a1',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [PPDEX,QUICK],
      stakingRewardAddress: '0x02e564da1f53BC11Ea2cb60c394f69d2bfD348d7',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [ZUT,QUICK],
      stakingRewardAddress: '0xc8fC0635F8369Ad79B9ed801963047D2f523C4d9',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [CFI,USDC],
      stakingRewardAddress: '0x027DfAf5128a64522aC52FD68370150E4A6C5da4',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: USDC },
    { tokens: [QUICK,MDEF],
      stakingRewardAddress: '0x3052faD089A5115C84a201dCc8bfE57722542814',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [DRC,QUICK],
      stakingRewardAddress: '0x8290c27e97707B84C7fFbcB0F33dc68cFEe8ae2a',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },*/
    {
      tokens: [DB, QUICK],
      stakingRewardAddress: '0x15D04518278a4D271706a291242734e16D4D9D32',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [MATIC, QUICK],
      stakingRewardAddress: '0x760c18f57aDe2Eb793832BF37f1a38EBE5909e7c',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [GHST, QUICK],
      stakingRewardAddress: '0xdA41a4b32cc2a1Ce5a1725b5c8eA957d30A1FEa7',
      ended: true,
      rate: 0,
      pair: '',
      name: 'StkGHST-QUICK',
      lp: '0xA02d547512Bb90002807499F05495Fe9C4C3943f',
      baseToken: QUICK,
    },
    {
      tokens: [ETHER, MATIC],
      stakingRewardAddress: '0x2a75B9F3F16a276fd5d4bb5C2A6169388Fac92BB',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [MAUSDC, USDC],
      stakingRewardAddress: '0x79ef40BCFE5CD4Ab8FfA1018B95B8e67a9a61FA6',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: USDC,
    },
    {
      tokens: [WBTC, ETHER],
      stakingRewardAddress: '0xc6eFeC77e083D43FeeC338de40bb4a319e30D1B5',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [ETHER, USDC],
      stakingRewardAddress: '0x0563C5C7631c7eBEF5FbA145e59efD8A94a1E9bE',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: USDC,
    },
    {
      tokens: [ETHER, WISE],
      stakingRewardAddress: '0x44f653aE620B01e5F18E0288cA08F17a2F17f1bD',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [LINK, ETHER],
      stakingRewardAddress: '0x151ECdf11f87D79Ae746e26005C59828D71D4Ff9',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [GHST, USDC],
      stakingRewardAddress: '0x124560D444eea90C1E3535F297993D317a0ade3E',
      ended: true,
      rate: 0,
      pair: '',
      name: 'stkGHST-USDC',
      lp: '0x04439eC4ba8b09acfae0E9b5D75A82cC63b19f09',
      baseToken: USDC,
    },
    {
      tokens: [USDC, QUICK],
      stakingRewardAddress: '0xC0e37aeC523860A78b7cE4290758d5E279d18f0e',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: USDC,
    },
    {
      tokens: [AGA, AGAr],
      stakingRewardAddress: '0x36534085EaD446a519A0acdFE2D6fF5a0AD9B895',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: AGA,
    },
    {
      tokens: [QUICK, WISE],
      stakingRewardAddress: '0x256A8c77a98414e3D5176bb377233599391fa48A',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [CEL, ETHER],
      stakingRewardAddress: '0x5F83dFAe43E8fea06197F4D9F4DBB5c82e51Ee13',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [MAAAVE, QUICK],
      stakingRewardAddress: '0xcd9233Ef3c4Cfccb9dB13A2e399a9Ba4502258CC',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [SX, ETHER],
      stakingRewardAddress: '0xB4556635860a40721f79AaD3894D5a6095763d75',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [FRAX, QUICK],
      stakingRewardAddress: '0x9CcEc45252Fe367c0B863e98A76ea954dC91e17A',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [WOLF, MATIC],
      stakingRewardAddress: '0x33a48aEcBb36743a99D82aE4aC7A146B8Ff2A2A6',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MATIC,
    },
    {
      tokens: [ETHER, DEFI5],
      stakingRewardAddress: '0xCE4Aef8d77CaEFbc939Cd629B5eCE9143C8e1eDA',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [FRAX, FXS],
      stakingRewardAddress: '0x32a334F5D3B6eE2efa5772B541944880fb114A67',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: FRAX,
    },
    {
      tokens: [ETHER, QUICK],
      stakingRewardAddress: '0xCF80a2f37899b6a82C444D8e9183544e3CeA0D3f',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [QUICK, DEFI5],
      stakingRewardAddress: '0x4f4FaB530C845c79eb617d85e1F14bBADe0C0169',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [SWAP, QUICK],
      stakingRewardAddress: '0xA1ea89ecafF2297Afa157790d1D0a438fAc5e4b6',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [QUICK, CC10],
      stakingRewardAddress: '0x78fBF502875931f27527d2d225550E9d34d5dF3b',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [DG, ETHER],
      stakingRewardAddress: '0x99CBABc880f011B179D5D92E97BE7Ae8242cF1eB',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [ETHER, DEGEN],
      stakingRewardAddress: '0x71324576fD096B067cB64a008a51d9FdaE022846',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [DG, QUICK],
      stakingRewardAddress: '0x461C554C6C2c175730cC8e43a348A1a75fbefADe',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [LINK, QUICK],
      stakingRewardAddress: '0xedABADd0e07921D9B54e3658dFb8477bB7F0dE95',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [DEGEN, QUICK],
      stakingRewardAddress: '0x49dDaC7fff1b58138BA646C03463A0619155550c',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [DAI, ETHER],
      stakingRewardAddress: '0xD03F9F73C13D89bB965B97227051193228C3A18b',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: DAI,
    },
    {
      tokens: [GAME, QUICK],
      stakingRewardAddress: '0x9742CeaFf7b09849d1Bdf3Dc58da4E5BE19461cE',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [ARIA20, ETHER],
      stakingRewardAddress: '0x8483888b8fBFf4F088fFee75fed5CE93c93155f2',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [MAYFI, MAUSDC],
      stakingRewardAddress: '0x7D2f33AB7614B1D54FBa92d70Ac9706Fd1f3767B',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC,
    },
    {
      tokens: [QUICK, CEL],
      stakingRewardAddress: '0x494537215D7Bd2e809640A49424A49bC394ff8aA',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [UBT, ETHER],
      stakingRewardAddress: '0xdAEadE0e7e7f7aC28d20Dd823aa3D11bedb1a40F',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [SUPER, QUICK],
      stakingRewardAddress: '0xA5e35B4900AE653E5075832Feb6718BCd50c09ab',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [MAUNI, MAUSDC],
      stakingRewardAddress: '0xD1540331b82c36EA64b5f25F64bDAff8f5A0Fd2d',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC,
    },
    {
      tokens: [MATUSD, MAUSDC],
      stakingRewardAddress: '0x4E9134ba0B711878196d7D85cd9539836621e005',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC,
    },
    /**{ tokens: [ETHER,HH],
      stakingRewardAddress: '0x59EfAD917839A638F352E42fB7d84D56fA5b336A',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },*/
    {
      tokens: [MAUSDC, QUICK],
      stakingRewardAddress: '0xB71B3BB6Fa6D68c7Db2631cA3C47080cfa23a1d2',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [IFARM, QUICK],
      stakingRewardAddress: '0x57E82326c8605f3cB2FFe2986Bb1cC58C5d3e680',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [MAAAVE, MAUSDC],
      stakingRewardAddress: '0x4dCf9047e2eA55FacA95b5E8fAc47f1aF32e5CEC',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC,
    },
    {
      tokens: [IFARM, MATIC],
      stakingRewardAddress: '0x97411Ead424738c6e36b110cb91622740F9A7B29',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MATIC,
    },
    /**{ tokens: [QUICK,XMARK],
      stakingRewardAddress: '0xc4BE7e0977b2b5e29AD7530101442d390879e056',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },*/
    {
      tokens: [UNITOKEN, QUICK],
      stakingRewardAddress: '0xEdB2Bacf800Ce9fdC4fF4FDbDe5Db5D643373332',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [ELET, QUICK],
      stakingRewardAddress: '0x2b3cB9061BcE6Df8aB03B7C992cB6969D0D3DEDe',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [QUICK, MOCEAN],
      stakingRewardAddress: '0xEDB59F9b142EA7c97E4394C4b2945Bad7436A4B9',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [MALINK, MAUSDC],
      stakingRewardAddress: '0x79791Ae4c010fa0f0Fd6dB711F5d28428c88F5D9',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC,
    },
    {
      tokens: [MATIC, MOCEAN],
      stakingRewardAddress: '0xc4ef17Df8829A295dA87174d26E82DFA2AC08ccb',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MATIC,
    },
    {
      tokens: [MADAI, MAUSDC],
      stakingRewardAddress: '0x9b05Abd1E63c28238c52e067D2B1437634F861BA',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC,
    },
    {
      tokens: [MAUSDT, MAUSDC],
      stakingRewardAddress: '0x8C73d5d13f2b703542Ca56450A451E1Ac325D215',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC,
    },
    {
      tokens: [SWAP, ETHER],
      stakingRewardAddress: '0x031c8264071dfc903A2f7Bcb86a26Ea37f045F18',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [WOLF, QUICK],
      stakingRewardAddress: '0x6cC98Dd5d9B94ffC773A46EB8409f76E91932975',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [UBT, QUICK],
      stakingRewardAddress: '0x89A95A0a3f05Ec3956cB7036a446238F900855e9',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [SX, QUICK],
      stakingRewardAddress: '0x7CD378c646bE4473A44D513A7Ca97ADB5B202656',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [AGAr, QUICK],
      stakingRewardAddress: '0xcD9dB8baBA4270987FEF106fC2205ADee0745089',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [SX, DAI],
      stakingRewardAddress: '0x496E533038C87A964473090e32cc38dd3e875E82',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: DAI,
    },
    {
      tokens: [VISION, ETHER],
      stakingRewardAddress: '0xfC4ff3D8D2f960131E9d47226c37f4C4A2791BDf',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [DB, MATIC],
      stakingRewardAddress: '0x12aa0c98b2b42e0b779Ae5E14dd9D55264cE340a',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MATIC,
    },
    {
      tokens: [SUPER, ETHER],
      stakingRewardAddress: '0x4CDFc343Bee6dF7489872Bd070f98c08f8371E7c',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [MAWETH, MAUSDC],
      stakingRewardAddress: '0x410c0D74903A70F1927f6d0290F95b1969ea3280',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC,
    },
    {
      tokens: [DB, ETHER],
      stakingRewardAddress: '0x4AaFe90A7D42Af61b9e6E5375545A714708e90F0',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    /**{ tokens: [QUICK,HH],
      stakingRewardAddress: '0x10988CDF2411135F986bc7053327328C15065b3A',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },*/
    {
      tokens: [ARIA20, QUICK],
      stakingRewardAddress: '0xcB5F4E9C29281915d31DDcD94A2B99744985198F',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [AGA, QUICK],
      stakingRewardAddress: '0x7e033E7586eDCaa0714cC95AFC03C813e4A8A137',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [MATIC, USDC],
      stakingRewardAddress: '0xB130f85E0b970aaFCCe943BC79CC87312e92131d',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: USDC,
    },
    /**{ tokens: [ETHER,DMT],
      stakingRewardAddress: '0xE67570Eae35ae74D015712CAed97C2c34d0798eF',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [HEX,QUICK],
      stakingRewardAddress: '0x07969ecC01f1b6f96c9f9bf23F7B41456491C11B',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [QUICK,DMT],
      stakingRewardAddress: '0x51f3e892a46560E16F6679d22e0945E24b9ED0E8',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [VISION,QUICK],
      stakingRewardAddress: '0x2E72ba83c59f393575Aa3619c5153214f6CE2307',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [BTU,QUICK],
      stakingRewardAddress: '0x436442fd8887B9EA0c09256b3dbf75092b9b5711',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [QUICK,AZUKI],
      stakingRewardAddress: '0xdDa752bF5afb79F93632c44BC9BF9D8d0674E8cC',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },*/
    {
      tokens: [GAME, ETHER],
      stakingRewardAddress: '0x884636e960e3573Aa81DE89e7F4D6EB06b1b9B16',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [ELET, MATIC],
      stakingRewardAddress: '0xEBFaB5a23Ac3E6a5892C1623b93028b6637F00f6',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MATIC,
    },
    {
      tokens: [QUICK, OM],
      stakingRewardAddress: '0xe07a352772e9c47d78B1B6917bd45FEF7Dd9275b',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    /**{ tokens: [MRBAL,QUICK],
      stakingRewardAddress: '0x6544928F5Fbf0503f51a02E5C086FFde5874379F',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [QUICK,ZUZ],
      stakingRewardAddress: '0x3f38cD298994eD6Adf2E272e2080ee959cFefc7e',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [BTU,MATIC],
      stakingRewardAddress: '0xC8dbdF35C0086A8Eb0c4741D4D8586d1D1c9e48d',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: MATIC },
    { tokens: [DSLA,QUICK],
      stakingRewardAddress: '0x6F58505E1342D57a3115A58cBF2501EfBC5E6f3a',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },*/
    {
      tokens: [DB, QUICK],
      stakingRewardAddress: '0xb8fFC77Fd7c430E6354fFB2A9e6D3a4c0e91986C',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [USDC, USDT],
      stakingRewardAddress: '0xf1A99964822316C920E47823e5C67388a52aD326',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: USDC,
    },
    /**{ tokens: [ETHER,AZUKI],
      stakingRewardAddress: '0x925B371184490de0cd3a6fF2455986dA25456bBa',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },*/
    {
      tokens: [HEX, ETHER],
      stakingRewardAddress: '0xC735dCB3A7A5cF04AF0938C385C0999C4ad13609',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [ETHER, OM],
      stakingRewardAddress: '0x9632Fd2E96E600D0B0F0ecBC2cc06DEc0B5d2c0B',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    /**{ tokens: [CFI,QUICK],
      stakingRewardAddress: '0x8c7e01E1086969a288C75E968B79cCebB31c422f',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [PPDEX,QUICK],
      stakingRewardAddress: '0x1F9Fdc142702C89261aCC9754EB3e1dF22a23c92',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [ZUT,QUICK],
      stakingRewardAddress: '0x255093F38a09B6909D4AD00165e16d1D73fe709f',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [DSLA,ETHER],
      stakingRewardAddress: '0xd2be3Af972252D7821f32F024cB86d3D8E7593D5',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [CFI,USDC],
      stakingRewardAddress: '0xf02AEE0b7c5D38deE155cb1D44D93F2b6021bA2b',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: USDC },*/
    /**{ tokens: [QUICK,MDEF],
      stakingRewardAddress: '0xE7f82c99211E9849F2DD2417c05a308deE1b4491',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [MATIC,MRBAL],
      stakingRewardAddress: '0x3347aaf65771D032157f30B4dc4473402B250a21',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: MATIC },
    { tokens: [DRC,QUICK],
      stakingRewardAddress: '0xF3Fc8269189B2BA3a8749586bDB91a57e1fD6273',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK }
  ,*/
    {
      tokens: [GHST, QUICK],
      stakingRewardAddress: '0x24E6D900985bf2B6a59dAC5A306b267b9836b7E2',
      ended: true,
      rate: 0,
      pair: '',
      name: 'StkGHST-QUICK',
      lp: '0xA02d547512Bb90002807499F05495Fe9C4C3943f',
      baseToken: QUICK,
    },
    {
      tokens: [MATIC, QUICK],
      stakingRewardAddress: '0x3280EAe9011093c0ab8ef7bc4B9B0C5a16782Fa2',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [MAUSDC, USDC],
      stakingRewardAddress: '0x096a536c4a91C03c90f3190cf7387Efa60D05aed',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: USDC,
    },
    {
      tokens: [WBTC, ETHER],
      stakingRewardAddress: '0xE2E9b08d6e556FE3e3cAe167d771a0825489F844',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [ETHER, MATIC],
      stakingRewardAddress: '0x99Dd173d47ed51954875f67929D07cBA15487B68',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [ETHER, USDC],
      stakingRewardAddress: '0x3ABB60e80aCd507a89CC1C48c40DfBcc66d4197D',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: USDC,
    },
    {
      tokens: [LINK, ETHER],
      stakingRewardAddress: '0xFc891BfcA1Ac4959171123547a1AfaF79FE1006E',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [GHST, USDC],
      stakingRewardAddress: '0xb23dC586ab75De399461768bfc047E930F58D4Ea',
      ended: true,
      rate: 0,
      pair: '',
      name: 'stkGHST-USDC',
      lp: '0x04439eC4ba8b09acfae0E9b5D75A82cC63b19f09',
      baseToken: USDC,
    },
    {
      tokens: [QUICK, WISE],
      stakingRewardAddress: '0x4405117A9379A3EBa5eA5Ee08d9820640B5A0524',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [FRAX, FXS],
      stakingRewardAddress: '0x6c1506624fB87120387355B6Dc90eEb2Cef8D336',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: FRAX,
    },
    {
      tokens: [ETHER, WISE],
      stakingRewardAddress: '0xE69d7BB570d55a9Ef10Bb18F3d1609E128d5a6Ce',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [USDC, QUICK],
      stakingRewardAddress: '0x1843936FbfF1F65Ee5d2860FaCFDFed3AD92cC7D',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: USDC,
    },
    {
      tokens: [MAAAVE, QUICK],
      stakingRewardAddress: '0x8263032143f2d7a46b2124B1fDB0b23C86B1E797',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [CEL, ETHER],
      stakingRewardAddress: '0xeab691696312B730429bc934a6c166b508686959',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [ETHER, DEGEN],
      stakingRewardAddress: '0x4AF17ea16620029e91f13565D7912B39D96d0c0F',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [FRAX, QUICK],
      stakingRewardAddress: '0xA3C1a3F32896D02143821B5302d2D16CF7C4259E',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [SX, ETHER],
      stakingRewardAddress: '0x88729279cF7d1b996d27e6a57F4FE7B8A224adFC',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [ETHER, DEFI5],
      stakingRewardAddress: '0x2C6444f925ED06f7fC36191d913Deb155b4dBe23',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [DEGEN, QUICK],
      stakingRewardAddress: '0x607346469bddC67a219BC3e0fD6441067B32B7E5',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [ETHER, QUICK],
      stakingRewardAddress: '0xee0c45AFF4c64da567d2Fa82B850797E5802B18E',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [QUICK, CC10],
      stakingRewardAddress: '0x746008253470928c5D894F5692F3CE3dCB65D41d',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [DAI, ETHER],
      stakingRewardAddress: '0xd9Fc7bf48FD0b4b0bd83dBA375bd3ebC42877126',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: DAI,
    },
    {
      tokens: [QUICK, DEFI5],
      stakingRewardAddress: '0xa264dC4eC5e9E3D49F46C74d66570CED12C16ED3',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [DG, QUICK],
      stakingRewardAddress: '0x9E6d15B51cf22A4831355229c64fcE02435c00FE',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [SWAP, QUICK],
      stakingRewardAddress: '0x1393c8238E5Ac1d56062A7f2833D51a95D0bA3FD',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [GAME, QUICK],
      stakingRewardAddress: '0xb587D382DA6c0DEB08B14B32D1a9a5aEd797dD9e',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [LINK, QUICK],
      stakingRewardAddress: '0xc0050f60B813C1d443dea4aa7c418Efc6664d4A5',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [DG, ETHER],
      stakingRewardAddress: '0xb2Dbd29eA634cd09Dc0c1cfE575164aba593DE67',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [QUICK, CEL],
      stakingRewardAddress: '0x4CAbb612219A50bBAf60Ba72a8939ad3D2709760',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [ARIA20, ETHER],
      stakingRewardAddress: '0x7ADaed604E9947559f9D28E9d6BfFfe4f9d6F046',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [QUICK, MOCEAN],
      stakingRewardAddress: '0x43B872A4d17B8FaBE28ceac21787a054D79f4409',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [MATIC, MOCEAN],
      stakingRewardAddress: '0x4077Db56ADdD1E183B37727AE9787739757a8479',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MATIC,
    },
    {
      tokens: [DB, QUICK],
      stakingRewardAddress: '0x69627ACE33398538caE386808F14D9DD21dD286e',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: QUICK,
    },
    {
      tokens: [MATUSD, MAUSDC],
      stakingRewardAddress: '0x477Cdd18ff380e1fA3e8474d4F278494BACC333e',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC,
    },
    {
      tokens: [MAYFI, MAUSDC],
      stakingRewardAddress: '0x4C38c0430e7c8529D8eD56A9765300A8d8296B74',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC,
    },
    {
      tokens: [UBT, ETHER],
      stakingRewardAddress: '0x4c222554519A52c474072bc88cCa99a7b79560b2',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: ETHER,
    },
    {
      tokens: [MADAI, MAUSDC],
      stakingRewardAddress: '0x1Efd52814be7eaC88A80f3508755eD5EBBC35bd3',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC,
    },
    {
      tokens: [MATIC, USDC],
      stakingRewardAddress: '0x5Fe476B0B473f4aA02409711d6F70f7596f0D174',
      ended: true,
      rate: 0,
      pair: '',
      lp: '',
      name: '',
      baseToken: USDC,
    },
    /**{ tokens: [ETHER,HH],
      stakingRewardAddress: '0x043449B5D41A65d3256a9B3be7822df34d0d4Ba4',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [IFARM,QUICK],
      stakingRewardAddress: '0x73d99729857e1452DFb87ee42822FF55def74706',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [MAUSDC,QUICK],
      stakingRewardAddress: '0xAE0035A87A513DfeDcb76767Ae89f8fcE6b664Df',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [MAAAVE,MAUSDC],
      stakingRewardAddress: '0xF8aB37C16596077D551B4c7dB9F319f4ec774573',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC },
    { tokens: [IFARM,MATIC],
      stakingRewardAddress: '0xaf03948Eee936D8Dd95Bd52b16Bc862B67E52b02',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: MATIC },
    { tokens: [MAUSDT,MAUSDC],
      stakingRewardAddress: '0xdA56080d7f531E612A8C9c340D59f2ce791e277A',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC },
    { tokens: [QUICK,XMARK],
      stakingRewardAddress: '0xfB834aB3ABB9F54Fb3091e7D868E040f772EA9F7',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [SUPER,QUICK],
      stakingRewardAddress: '0xD97e48a3461861D5F7DF1efc53A130a24E1A7E4a',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [MAUNI,MAUSDC],
      stakingRewardAddress: '0xC224d73da464318688B94156553A8eBAaB6d8C18',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC },
    { tokens: [DB,MATIC],
      stakingRewardAddress: '0x224F7a3649A91E346666889FAad17A3e1768DdA4',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: MATIC },
    { tokens: [UNITOKEN,QUICK],
      stakingRewardAddress: '0xB018259A3Ed0970b31c6E0e549576ec4Fd00B8E1',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [QUICK,ZUZ],
      stakingRewardAddress: '0xBD63092DdEc0A19441EBb6a493cFD3D0723b520B',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [MALINK,MAUSDC],
      stakingRewardAddress: '0x4DAd518191CdC089B2D05F71F91Cc57cB30cFf7A',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC },
    { tokens: [SUPER,ETHER],
      stakingRewardAddress: '0xaD3730dc36B5208966852a3200C2cA98d743F34F',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [SWAP,ETHER],
      stakingRewardAddress: '0x4F343B86907C534ebD3eDc0656EAD8E90ed4A85E',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [UBT,QUICK],
      stakingRewardAddress: '0xF79971bB055010a17a9C55D51f78BB55faB33b78',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [USDC,USDT],
      stakingRewardAddress: '0xb00cbd3a3Aef53E4A4DAfEB10eE051F5695fBdba',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: USDC },
    { tokens: [SX,QUICK],
      stakingRewardAddress: '0xCd19329065D282029Cc183941bbd4E8444A129Ca',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [VISION,ETHER],
      stakingRewardAddress: '0x3f8574F51Ce9fB7563E46592BBCaDc61262b7094',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [MAWETH,MAUSDC],
      stakingRewardAddress: '0x931e48FF9d82832355Bb5bddDfd2d524ca976624',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC },
    { tokens: [DB,ETHER],
      stakingRewardAddress: '0xF21d2Eb9d047dF7c64D3cA207D5696019170F14B',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [QUICK,HH],
      stakingRewardAddress: '0x4d92ba81B298C6b25C026a75a805FadD93Ca8c24',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [ETHER,DMT],
      stakingRewardAddress: '0xC8b0B69C78B697B2F863f1396128ec27510F13d0',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    
    { tokens: [HEX,QUICK],
      stakingRewardAddress: '0x16F564E63a59663685b4fAbF0B930Db51C10680E',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [QUICK,AZUKI],
      stakingRewardAddress: '0x9eC47f9cEEdD8729fCF4924a034c32Ad48D7D1a1',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [SX,DAI],
      stakingRewardAddress: '0x782888CBca733370018dEd580b11bB262Ea74aaC',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: DAI },
    { tokens: [QUICK,DMT],
      stakingRewardAddress: '0x37150A948b7BF10d985Cc6236a78A962Cd907309',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [GAME,ETHER],
      stakingRewardAddress: '0x7BbdB6A6D8574201BEA92EDBFAE38aab30590B83',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [VISION,QUICK],
      stakingRewardAddress: '0xB601C1b554A5581795503210863Be4183e9438E4',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [ETHER,AZUKI],
      stakingRewardAddress: '0x49ceCcC529646bCFDe760A70E10b820b62FF082b',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [QUICK,OM],
      stakingRewardAddress: '0xfe99eb504FE976BE32CDCEFE0607FeBfB8EC5852',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [DSLA,QUICK],
      stakingRewardAddress: '0xBC62f8E20988b148B2dD1c594F951FC5DaBBC6e7',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [ARIA20,QUICK],
      stakingRewardAddress: '0xa56132909a6489272b8Da5c4B29295E1c198C2f5',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [CFI,QUICK],
      stakingRewardAddress: '0xbd8d72e6c0f97a856cB1d9620f8AF692029FEFAa',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [DSLA,ETHER],
      stakingRewardAddress: '0xdCBaF301cf75E8927D26043f7505B0A8Be403818',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [HEX,ETHER],
      stakingRewardAddress: '0x17d576D6e77208bD24b98C42f61D61b794546CcD',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [ETHER,OM],
      stakingRewardAddress: '0x24447faDa54cE60a060885DD91F98e8B0846cc02',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [CFI,USDC],
      stakingRewardAddress: '0xE6c947e89C519EB2285D12B5ea30e299a3D3aD99',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: USDC },
    { tokens: [DRC,QUICK],
      stakingRewardAddress: '0x809Dba8D1D4Ab78b9Cb9ac37996455Ef34A606DF',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [PPDEX,QUICK],
      stakingRewardAddress: '0x3a243F55266B3BB35187bf8fD63d52003Bb9e69d',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [ZUT,QUICK],
      stakingRewardAddress: '0x473E418cd0e2B7e704D9C5510bAb2A848eFe3240',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [QUICK,MDEF],
      stakingRewardAddress: '0xec1360B07c57996B01968b054e737C9ab3038f5D',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [MATIC,MRBAL],
      stakingRewardAddress: '0x086EA5c740780Afbc0269bA79B090886b828326D',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: MATIC },
    { tokens: [MRBAL,QUICK],
      stakingRewardAddress: '0x75c0b1898F5Fff3431A1ADbDC2d05FB5c2C6422e',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [DRC,USDC],
      stakingRewardAddress: '0xdBA1C0b5465023a42C0cea28E59071B7e6d367c2',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: USDC },
    { tokens: [MAUSDC,USDC],
      stakingRewardAddress: '0x67C5Eda539c9A5e6FF6ceD94D2cc9452416A7f88',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: USDC },*/
    {
      tokens: [GHST, QUICK],
      stakingRewardAddress: '0x867875D8225e92f25549B2baC7B1379DbF0cc66D',
      ended: true,
      rate: 0,
      pair: '',
      name: 'StkGHST-QUICK',
      lp: '0xA02d547512Bb90002807499F05495Fe9C4C3943f',
      baseToken: QUICK,
    },
    /**{ tokens: [WBTC,ETHER],
      stakingRewardAddress: '0xfE54aCf90f3F88cc2486710aa2B9234d05c833b7',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [MATIC,QUICK],
      stakingRewardAddress: '0xc419BF84922a3695899144473ABFfcea9D3F492e',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [LINK,ETHER],
      stakingRewardAddress: '0xD2365152dfB7C3f896e1ba9fA73b80e7e6888805',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [ETHER,MATIC],
      stakingRewardAddress: '0x35deCFb44FDC18d9e5B3A7F85cc28dfc3b185a39',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [ETHER,USDC],
      stakingRewardAddress: '0x2260A04EDd0b3E72778206843Cb12cC535f5E656',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: USDC },*/
    {
      tokens: [GHST, USDC],
      stakingRewardAddress: '0xcB7249F0800F299F90b977E26a7Af34E94C4Ca70',
      ended: true,
      rate: 0,
      pair: '',
      name: 'stkGHST-USDC',
      lp: '0x04439eC4ba8b09acfae0E9b5D75A82cC63b19f09',
      baseToken: USDC,
    },
    /**{ tokens: [MAAAVE,QUICK],
      stakingRewardAddress: '0xAc7Ce318f0bbBF1b6132383a63e560711019F3bf',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [FRAX,FXS],
      stakingRewardAddress: '0xC4c83eaaBb76d4ef70342A2E66f4C080A1378782',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: FRAX },
    { tokens: [CEL,ETHER],
      stakingRewardAddress: '0x7EAE699ADd9C2B0128Db06EE07153d1863790A32',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [ETHER,DEFI5],
      stakingRewardAddress: '0xC70fAfD776b5C4b24eD25C8754eCabf5860F8cE9',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [FRAX,QUICK],
      stakingRewardAddress: '0x56fA7Fd005Aa9143bfe638ac784A60e46b02A465',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [DEGEN,QUICK],
      stakingRewardAddress: '0xA962dE558655e1c4c77afFE8362b532389a7dDAe',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [DAI,ETHER],
      stakingRewardAddress: '0xE3109dbAA0744e4480223fEA418c3702136532Cd',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: DAI },
    { tokens: [QUICK,DEFI5],
      stakingRewardAddress: '0x4BB809afd6d8F6cAd09cfdfA88577a0Ccc037259',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [SX,ETHER],
      stakingRewardAddress: '0xc1942fe5F9f0eF039eD0EFb411D413CCD6a8bD69',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [USDC,QUICK],
      stakingRewardAddress: '0x36613a52B272bA901EcFE4E76D490AF6Acbc005b',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: USDC },
    { tokens: [ETHER,QUICK],
      stakingRewardAddress: '0x524A38c1F5E9bFC528ABc5bD2e2AfeE01c24B7E2',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [DB,QUICK],
      stakingRewardAddress: '0xe630Fe16F48df044A668053A655C513594e55361',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [DG,QUICK],
      stakingRewardAddress: '0x747d0Aa4A8C4eF704DdECd23885e020B79d43cE9',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [LINK,QUICK],
      stakingRewardAddress: '0xa69BE44aE9Db6b9684B74256Bf6a217d36891d19',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [UBT,ETHER],
      stakingRewardAddress: '0x359c7f2fEc1FB7b9a3A88c2bd388e58EB24b98fb',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [QUICK,CEL],
      stakingRewardAddress: '0x9f229439716FDAC3D5093D5fD98F1C81785a72d6',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [MATUSD,MAUSDC],
      stakingRewardAddress: '0x04cba2d8b8DB56626bbd0236d081329bbB28EeBa',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC },
    { tokens: [DG,ETHER],
      stakingRewardAddress: '0x96a87830bBf522bb205A2A77320CC7c426844df7',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [SWAP,QUICK],
      stakingRewardAddress: '0x0E1B4043543C84dC40FcbA0B8E7E895377Af14C6',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [IFARM,MATIC],
      stakingRewardAddress: '0x2bfC489AeD1943879332BCa3cFAA8B7E9B406BAc',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: MATIC },
    { tokens: [MAUSDT,MAUSDC],
      stakingRewardAddress: '0x4a27b46B3d7cFC62686D4621649655af8Ebc590A',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC },
    { tokens: [ARIA20,ETHER],
      stakingRewardAddress: '0x8B6f5a397Fd2a49Cc5DAcd9B28be16C511aAb079',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [QUICK,XMARK],
      stakingRewardAddress: '0x7BDa91E5B73760335BB353894d9067AAD85d37DD',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [MADAI,MAUSDC],
      stakingRewardAddress: '0x812890108687f12D6A4366AA32A7c8b0d08e8025',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC },
    { tokens: [SUPER,QUICK],
      stakingRewardAddress: '0x515584b6c266CC6d1Fb50CE95eb1d16c5EDdBB7D',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [SUPER,ETHER],
      stakingRewardAddress: '0xb3dBF90899177594ef2F123487A2E791fE13da00',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [IFARM,QUICK],
      stakingRewardAddress: '0x4B413d529442C0039c8e854B8267d502692694FA',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [MAYFI,MAUSDC],
      stakingRewardAddress: '0x726c42cB8f2012EA222408d7df0243117747Ef91',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC },
    { tokens: [MAUNI,MAUSDC],
      stakingRewardAddress: '0x044343dcD512A1169A8C19d2D2948019B73AaEB8',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC },
    { tokens: [GAME,QUICK],
      stakingRewardAddress: '0x49f9D07Ec803664a92502DD09094bc1819A58bb4',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [DB,MATIC],
      stakingRewardAddress: '0xD02053bB6c244199A995A3bE2d861fE9D6bEE3b3',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: MATIC },
    { tokens: [SWAP,ETHER],
      stakingRewardAddress: '0xc0DD4e629f26b91F7FA387608A88c4F139f8bB36',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [MATIC,USDC],
      stakingRewardAddress: '0xd0dacd91413fE7561700A7222d5A8afC178dd6fe',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: USDC },
    { tokens: [MAWETH,MAUSDC],
      stakingRewardAddress: '0xd66ebd64577C3201f845E8BB88552a7cedDe7E08',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC },
    { tokens: [MAUSDC,QUICK],
      stakingRewardAddress: '0xa46ABc9ECe1B6364Bf9257fB7abD3C6808000105',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [UNITOKEN,QUICK],
      stakingRewardAddress: '0x4036F3610CE025810B0C3d5F703F58F4A3aa31A6',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [MALINK,MAUSDC],
      stakingRewardAddress: '0x4393e146010B35Be6f1b3f5164D8b1B9e4E83b3e',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC },
    { tokens: [MAAAVE,MAUSDC],
      stakingRewardAddress: '0xED59c17ee7Ecd7B61B275F1E742082Bba5A87c79',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: MAUSDC },
    { tokens: [DB,ETHER],
      stakingRewardAddress: '0xceC7607e603D7665856088cC5Cd086454cd5624b',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [HEX,ETHER],
      stakingRewardAddress: '0xDD9Fff9C41321A65DdDe6849433AA1611a8Ce2f7',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [HEX,QUICK],
      stakingRewardAddress: '0x9f8d97859d7113De0fA4F27cc3840198641ebe34',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [UBT,QUICK],
      stakingRewardAddress: '0x8FFcaA8e6d2a3141Cd066D04fE54D2A1da24028a',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [ETHER,HH],
      stakingRewardAddress: '0x5211c45377f033d913Df1b74257131FF16365A8A',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [SX,QUICK],
      stakingRewardAddress: '0x38284f873B2F9b43754E509105a7C1b8bccEE150',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [QUICK,HH],
      stakingRewardAddress: '0xA7B4e642316555Fd660fC22682463F8A28Dda9f8',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [ETHER,DMT],
      stakingRewardAddress: '0xA77728Fd7B4ea7DE784DfbA67838972ff0987cde',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    
    { tokens: [QUICK,AZUKI],
      stakingRewardAddress: '0xE90960FaFdbbbCA56e339f59B24Ef85B851519fD',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [SX,DAI],
      stakingRewardAddress: '0x22cbe5a96b9057A3F9a68523d61Af4f685D11863',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: DAI },
    { tokens: [VISION,ETHER],
      stakingRewardAddress: '0x603123d6798fa3B11290144fEd21F9a40453A22f',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [QUICK,DMT],
      stakingRewardAddress: '0x41220025fCF199333Ca575D25f4568EA06FC7F2e',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [GAME,ETHER],
      stakingRewardAddress: '0xa3b0e2799d9A0656FB333c1E9B4aD131FBd6B139',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [ARIA20,QUICK],
      stakingRewardAddress: '0x8330aa05Db8f7D98C794608f565BD0530F08ba0F',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [ETHER,AZUKI],
      stakingRewardAddress: '0x499D074E1966e0Bb5C858Ca872D763F68e1d09FE',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [VISION,QUICK],
      stakingRewardAddress: '0xdcf1A0D8Ea7102884C73A39F8e90a2945494eA2c',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [QUICK,OM],
      stakingRewardAddress: '0x559cF318A1a1869d1871b55f26801f657442B7A9',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [MATIC,MRBAL],
      stakingRewardAddress: '0xC2F99D34B8dC20A5A868bFA474F8a786e501ab1F',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: MATIC },
    { tokens: [ETHER,OM],
      stakingRewardAddress: '0xd5dA80F60C931D8542501450aE67f1663a56F4Fa',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [CFI,QUICK],
      stakingRewardAddress: '0x59e63cDFB26AfC3C786F3D0e194AF76EcBAC4f69',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [ZUT,QUICK],
      stakingRewardAddress: '0x4432c332EC0F39450803a6371519D342709175e1',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [CFI,USDC],
      stakingRewardAddress: '0xFf2300669A0f7e12d5FB40Ba2D03bAb6855c7CB4',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: USDC },
    { tokens: [DRC,QUICK],
      stakingRewardAddress: '0x629F0b2F56b40E009a3289D44934b7c9467119a3',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [PPDEX,QUICK],
      stakingRewardAddress: '0x5d790cCaD673B041180A0433a52cD4f0BF265982',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [MRBAL,QUICK],
      stakingRewardAddress: '0x68B4eca6EE1b802E5a7ee3A743ca4FBa4b1376b4',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [DSLA,QUICK],
      stakingRewardAddress: '0xBf8442359c9F172B5bFe4a6be751CAb03d27dF93',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [QUICK,MDEF],
      stakingRewardAddress: '0x23d4253bB9434959088013eFD87385DB21990029',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [DSLA,ETHER],
      stakingRewardAddress: '0x310B0e340e451F6169aAA13d7D4Cb039d9517317',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [DRC,USDC],
      stakingRewardAddress: '0xDbd2cBd1e69777643301b7623a99610E60fAD3A7',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: USDC },
    { tokens: [MAUSDC,USDC],
      stakingRewardAddress: '0x19FD308bfC9fdC7979a7141A10bc0B4C0267AbBB',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: USDC },*/
    {
      tokens: [GHST, QUICK],
      stakingRewardAddress: '0xe8ebE7e46D885d283fb0e0177af7df454DCA111C',
      ended: true,
      rate: 0,
      pair: '',
      name: 'StkGHST-QUICK',
      lp: '0xA02d547512Bb90002807499F05495Fe9C4C3943f',
      baseToken: QUICK,
    },
    /**{ tokens: [WBTC,ETHER],
      stakingRewardAddress: '0x62AEF7797512095b6d640E4103264c41386063ae',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [MATIC,QUICK],
      stakingRewardAddress: '0xbEe47F087200a493bb8a71c6C76A9CD5396e9F94',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: QUICK },
    { tokens: [ETHER,MATIC],
      stakingRewardAddress: '0x5298d2Ea83ca981fCda625df1F9AA03a305738C0',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: ETHER },
    { tokens: [ETHER,USDC],
      stakingRewardAddress: '0x16b4Ea4417C610f0F11dAf49EAb8155bbAE4FeEE',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: USDC },*/
    {
      tokens: [GHST, USDC],
      stakingRewardAddress: '0x201D66d7d7139E137c51be0DD22c3736B3A81835',
      ended: true,
      rate: 0,
      pair: '',
      name: 'stkGHST-USDC',
      lp: '0x04439eC4ba8b09acfae0E9b5D75A82cC63b19f09',
      baseToken: USDC,
    },
    /**{ tokens: [LINK,ETHER],
      stakingRewardAddress: '0x90BB3F41c7c4C47A16406347EC1112D42c189A9e',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: ETHER },
    { tokens: [DAI,ETHER],
      stakingRewardAddress: '0xEc1294419F2dda918a14d1D14fE9f3faacf81008',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: ETHER },
    { tokens: [FRAX,FXS],
      stakingRewardAddress: '0x99cbBa72d919791009a8c6Db5AaDF1DeA883e0d1',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: FRAX },
    { tokens: [ETHER,DEFI5],
      stakingRewardAddress: '0xBe3AF49Bd0EeB5ff7990deaA381ed887eD25938a',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: ETHER },
    { tokens: [QUICK,DEFI5],
      stakingRewardAddress: '0xD2d83D63205f5bc44787c21D382FB9f9b8752FFF',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [ETHER,QUICK],
      stakingRewardAddress: '0xff2cc7bb508c40bC201D45A32b1804e822F48058',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: ETHER },
    { tokens: [CEL,ETHER],
      stakingRewardAddress: '0xef2c19bbc8e6AA85BBB5F50aB7528c2c0eFDb74C',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: ETHER },
    { tokens: [MAAAVE,QUICK],
      stakingRewardAddress: '0x5104D3b09b6b12c63584d9abE1f3EcF96E5Fe56C',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [FRAX,QUICK],
      stakingRewardAddress: '0x34aC099bea7Ac58B4a9a6c10ac8F2Eae247d2928',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [QUICK,CEL],
      stakingRewardAddress: '0xEA782586eA4f463B022A63D24C221cb4335c32A6',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [USDC,QUICK],
      stakingRewardAddress: '0x1d86182103c803DD6bde2412A5a9D66Ca7E80a67',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: USDC },
    { tokens: [SX,ETHER],
      stakingRewardAddress: '0x5074f8250534B20160c87bF7Cb48Fe06811C0DBb',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: ETHER },
    { tokens: [QUICK,XMARK],
      stakingRewardAddress: '0x7334054b00bA72DeE9a84B1135D76851d21A2938',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [DB,MATIC],
      stakingRewardAddress: '0x30aD68a11A4c904Eb7B4858CFa643e9D26516Bc6',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: MATIC },
    { tokens: [SUPER,QUICK],
      stakingRewardAddress: '0xdc00407aF961A1F116d9484fB240Bf226BC9bFf3',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [IFARM,MATIC],
      stakingRewardAddress: '0xB367eF9Ff258bCCaF7004b9bC7a007E955C92120',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: MATIC },
    { tokens: [SUPER,ETHER],
      stakingRewardAddress: '0xa6c3a26D8b0c4f811413CD7Fc7817C0d04e408A7',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: ETHER },
    { tokens: [MAUSDT,MAUSDC],
      stakingRewardAddress: '0x5Ce6c2521538711997707105132055De2E334684',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: MAUSDC },
    { tokens: [MATUSD,MAUSDC],
      stakingRewardAddress: '0x3655D05758d68938B3Beb3A5461A4863e9327345',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: MAUSDC },
    { tokens: [LINK,QUICK],
      stakingRewardAddress: '0xd143d387fC456608a117Ab730a023F80e7A914f5',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [MADAI,MAUSDC],
      stakingRewardAddress: '0x9869367db942A5D690Bfe238347f2d91Bb94A139',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: MAUSDC },
    { tokens: [SWAP,ETHER],
      stakingRewardAddress: '0x87ADb629401664EA47F58c03805F0c28e75943C4',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: ETHER },
    { tokens: [SWAP,QUICK],
      stakingRewardAddress: '0x4eB3EfC4b04eE340A6C3623921Be21c285a3034f',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [MATIC,USDC],
      stakingRewardAddress: '0xfD15a6a3F07C89B15DB9b59e6880EF1a6550aFb9',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: USDC },
    { tokens: [UBT,ETHER],
      stakingRewardAddress: '0x3765C3b243c456020BD8f947E439f06ba9A8049e',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: ETHER },
    { tokens: [DB,ETHER],
      stakingRewardAddress: '0x34c065c2aE774037734877B8C308688415AE6688',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: ETHER },
    { tokens: [DG,QUICK],
      stakingRewardAddress: '0xF9414A4FB22fc040b354f1F9E7C2567F477d8536',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [DG,ETHER],
      stakingRewardAddress: '0xF077a4789666eF79E0CfC409b66E2082c3b53872',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: ETHER },
    { tokens: [IFARM,QUICK],
      stakingRewardAddress: '0xd8Be944Dd5F5BbC2De00478c44A7770333fdc446',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [MAYFI,MAUSDC],
      stakingRewardAddress: '0xC87328298649DACA11228e6Bbf36d3B4AAF4Ae2b',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: MAUSDC },
    { tokens: [MAWETH,MAUSDC],
      stakingRewardAddress: '0x046bd5fb1A30046B96Ea85f587241029b0991Cd5',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: MAUSDC },
    { tokens: [QUICK,AZUKI],
      stakingRewardAddress: '0xb7A25b8f17Ad1B5E12dab7B03f8e5fEa5043f7b8',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [ETHER,AZUKI],
      stakingRewardAddress: '0x2ab140994D8f060b70f1D9f8F775E9dA8D1e6Cd1',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: ETHER },
    { tokens: [MAUNI,MAUSDC],
      stakingRewardAddress: '0x483A66864e09F62272b4dC57EE6a36F1313D6730',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: MAUSDC },
    { tokens: [MAUSDC,QUICK],
      stakingRewardAddress: '0xdF39E6998bDE3131F8E79d3110fC772ba74e4613',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [UNITOKEN,QUICK],
      stakingRewardAddress: '0xBF6407a5aBD5215dC5aC9B7554C5C9EA8D9953BF',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [HEX,ETHER],
      stakingRewardAddress: '0x8b6156625C7879421Bf2C8C498F8f1dfE9eA8391',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: ETHER },
    { tokens: [HEX,QUICK],
      stakingRewardAddress: '0x8B6e5dF82AB0393c26abEeC1dBf6D9a635be45D6',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [ARIA20,ETHER],
      stakingRewardAddress: '0xd78bBf1D86d3D27A59368371E6482B79D284c6b5',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: ETHER },
    { tokens: [MALINK,MAUSDC],
      stakingRewardAddress: '0x0f8CB585A95A807CB68E7c2b5DEBbc2d9E8398d3',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: MAUSDC },
    { tokens: [QUICK,OM],
      stakingRewardAddress: '0x295B6bd267B49F5CcaCc0378A15BE4805A7CbBdD',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [QUICK,HH],
      stakingRewardAddress: '0xa9987f077d583305eDB335E2241C18c37c91f1AD',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [UBT,QUICK],
      stakingRewardAddress: '0x00A289344afF9dcA5c40350dCbb4885DFf9521C0',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [QUICK,DMT],
      stakingRewardAddress: '0x739e730D85F0E5C154d2BB9b31B4f3bA5e95ba3F',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [GAME,QUICK],
      stakingRewardAddress: '0xA05Bd910424E2c848D8874C48E9fb8207C496E03',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [MAAAVE,MAUSDC],
      stakingRewardAddress: '0x41204E879Cf5f499C1b419792F9E47c6538c040B',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: MAUSDC },
    { tokens: [ETHER,HH],
      stakingRewardAddress: '0x976a261de050935CC816f6e4Df149FEe41b0949F',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: ETHER },
    { tokens: [GAME,ETHER],
      stakingRewardAddress: '0x2ef72f744366c6c7c9D9BA967EE0703D6F1f24E9',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: ETHER },
    { tokens: [ETHER,DMT],
      stakingRewardAddress: '0x43180e5D0aeC6d3be1E81DC6a83c1DEC049aF5fC',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: ETHER },
    
    { tokens: [SX,DAI],
      stakingRewardAddress: '0x38f8eB09a82B96B5a86773681D20d1Ad587385b8',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: DAI },
    { tokens: [ETHER,OM],
      stakingRewardAddress: '0x7aB50EC4b2df4283219996C92d1BE0Eca5F974dB',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: ETHER },
    { tokens: [ARIA20,QUICK],
      stakingRewardAddress: '0xed2D83020610d216ed41feD8F9e2361e4A9B5e13',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [SX,QUICK],
      stakingRewardAddress: '0x02D3B842c8Cb2B217D87E9d73cd76CB70242587A',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [VISION,ETHER],
      stakingRewardAddress: '0x2c2b1b3e180E227F87E3AA0Ec4338866109566eD',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: ETHER },
    { tokens: [CFI,QUICK],
      stakingRewardAddress: '0x6eD883d937fedce9505868433E6749a63eb974fE',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [VISION,QUICK],
      stakingRewardAddress: '0x9d87912B51Fb2bc9eF395512Fdc7066FCba78201',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [MRBAL,QUICK],
      stakingRewardAddress: '0x14d69736b4B72E14dB372A36a0944C025759DfF1',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [ZUT,QUICK],
      stakingRewardAddress: '0x4E6ab1521c5A02E1b7F00D726445910E68164C67',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [MUST,MATIC],
      stakingRewardAddress: '0x74Bf881daDaFa45149FEd02D269D6bDF2C482E32',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: MATIC },
    { tokens: [DSLA,ETHER],
      stakingRewardAddress: '0x5A61ac95F86C2458d844ff1869AC3b3BB5F72D6c',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: ETHER },
    { tokens: [CFI,USDC],
      stakingRewardAddress: '0x2ee4CF224546DA48453474472A96138c1A2fCc98',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: USDC },
    { tokens: [DSLA,QUICK],
      stakingRewardAddress: '0x05378BdAeE39e1EDda3a711BE174c7771712387E',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [QUICK,MDEF],
      stakingRewardAddress: '0x5E3A895cE02f8c8101A6Bc44520CFE2D0f5654ec',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [MATIC,MRBAL],
      stakingRewardAddress: '0xEa4A37B036E15ec89b71ffaf445795f9f70f10E0',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: MATIC },
    { tokens: [DRC,QUICK],
      stakingRewardAddress: '0xf86Cffba04665e549EFBd946CA1DDFa58af998D4',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [MUST,QUICK],
      stakingRewardAddress: '0x76eaF915ea94fD8261CAF9d8453446768753c82d',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [PPDEX,QUICK],
      stakingRewardAddress: '0xD6c4b56BCd1Fd5A5E3e684125865D995Ff282EB0',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: QUICK },
    { tokens: [DRC,USDC],
      stakingRewardAddress: '0x8E85aA9d2D28130D603F855747fC863aE531120b',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: USDC },
    { tokens: [MAUSDC,USDC],
      stakingRewardAddress: '0x111C8Fb82c3BAf533ca7A0deeB5a7BF31D6B2b57',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
      baseToken: EMPTY },*/
    {
      tokens: [QUICK, GHST],
      stakingRewardAddress: '0x0A1d12b089577870FE94176Cc6fb2B87A94f268C',
      ended: true,
      rate: 0,
      pair: '',
      name: 'StkGHST-QUICK',
      lp: '0xA02d547512Bb90002807499F05495Fe9C4C3943f',
      baseToken: EMPTY,
    },
    /**{ tokens: [ETHER,USDC],
      stakingRewardAddress: '0x4571948F99Af3c39ac9831874E413E907981a341',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [MATIC,QUICK],
      stakingRewardAddress: '0x6376Fd1ee8d76096a5Ba7A54D9E0Dea9B6c89C20',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [FRAX,FXS],
      stakingRewardAddress: '0x71Fe8138C81d7a0cd7e463c8C7Ff524085A411ab',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [WBTC,ETHER],
      stakingRewardAddress: '0xdD7538d82E7A38A07A09E96c15279CE74cC14ABC',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [ETHER,MATIC],
      stakingRewardAddress: '0x88963CC8DF67208DdD7FF78A093fB2F9242d9e00',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [CEL,ETHER],
      stakingRewardAddress: '0xdeeFB589f8dd66b9A4FbCaff589028f6DE9D4C73',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [QUICK,CEL],
      stakingRewardAddress: '0x6dED557bd6E2bcD2653bA0B43d0e0f1B2D3Dbd99',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [GHST,USDC],
      stakingRewardAddress: '0xF235f75ea0F053037F5de99778aefae9c6AB9C84',
      ended: true,
rate: 0,
pair: '',
      name: 'stkGHST-USDC',
      lp: '0x04439eC4ba8b09acfae0E9b5D75A82cC63b19f09',
      baseToken: EMPTY
    },
    { tokens: [FRAX,QUICK],
      stakingRewardAddress: '0x536D4757dfA353a4Db2B821cF1adD3A76cc0E63b',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [DAI,ETHER],
      stakingRewardAddress: '0x1732a459fba48ab2E5fEA9d3932906E2FF7cAA99',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [MAAAVE,QUICK],
      stakingRewardAddress: '0xF0756eB4106b82c4CBd82Db266313a58A5E5844E',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [ETHER,QUICK],
      stakingRewardAddress: '0xAEB63c546Be3d6b4f1390e59A07933bc9abB3839',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [SWAP,ETHER],
      stakingRewardAddress: '0x4c44AF5349e651cb886Fb0dc3D3668a179733762',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [USDC,QUICK],
      stakingRewardAddress: '0x8cf4f5b9A2d87F176ED23272aE9DcE4959f7C8FF',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [LINK,ETHER],
      stakingRewardAddress: '0xA0dC0D47C064b228a56cE3ee821408AE74473e2a',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [LINK,QUICK],
      stakingRewardAddress: '0x1c26fa3280814aFD43Fe55cB94e842Ce38070060',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [SWAP,QUICK],
      stakingRewardAddress: '0xB0955Ed458cd03Ff2d46903020de4549C72E3995',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [SX,ETHER],
      stakingRewardAddress: '0x4Ee7A892E887902248bbE6D10dad20C6edB603b4',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [MATIC,USDC],
      stakingRewardAddress: '0x682e7eac9A54c1d50DbFCE15a0e48Ee04d8b4EE7',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [IFARM,MATIC],
      stakingRewardAddress: '0xA61d3F278E01bF427ebd180C5cb316DB7156d3DF',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [MATUSD,MAUSDC],
      stakingRewardAddress: '0x6a0E0Cfae54D0e8e713367F3da0D1E95C385a130',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [MAUSDT,MAUSDC],
      stakingRewardAddress: '0x94E34803393882eF97D8254d6682ab03fC407ED3',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [IFARM,QUICK],
      stakingRewardAddress: '0xbd3FAB81C05D6BC92F85059B93f62E6031fBb39c',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [MADAI,MAUSDC],
      stakingRewardAddress: '0xD454425F85C1CEfFACd91172312F6704A6b158F5',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [MAYFI,MAUSDC],
      stakingRewardAddress: '0x5DD8BE8E5b43b4db266d3d7b911a8241d6610BBf',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [UBT,ETHER],
      stakingRewardAddress: '0x048B32F30C115F033D0aAf869351e872F21A7cab',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [DB,MATIC],
      stakingRewardAddress: '0x152f15A8128D8De734932CA7986F97321006f0Ad',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [QUICK,OM],
      stakingRewardAddress: '0xb160BF8878123AE85b3DB6dCE37B5F848ec9cf0f',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [ETHER,OM],
      stakingRewardAddress: '0x5356c27664C5e23513a9419E272576a5d2E6832e',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [MAWETH,MAUSDC],
      stakingRewardAddress: '0x3c6C4F00a1c7525D229046512E03d1474B27E7C7',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [MAAAVE,MAUSDC],
      stakingRewardAddress: '0xA2C4BE3F83DEACb1e60a62675Aef314a2cB3D05E',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [UNITOKEN,QUICK],
      stakingRewardAddress: '0xCB26D1DFa93F0506Fded0F3C799D46784B65Abd5',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [MALINK,MAUSDC],
      stakingRewardAddress: '0x453f7e2Ae4a7829Aeb7F95CAe18CE083e38fd78F',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [MAUNI,MAUSDC],
      stakingRewardAddress: '0xCeBe4F02454DF590532f3980e0fcF076BE6e3301',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [DG,ETHER],
      stakingRewardAddress: '0xBcf91097e3585B8B201E642C5429cc0caa453C3b',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [DG,QUICK],
      stakingRewardAddress: '0xA4FF67A10f7250e9Ce5468f267a72e1E200c0F82',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [UBT,QUICK],
      stakingRewardAddress: '0xB169F29E98Db049ccD9118bf3eF17BB1B576fEF5',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [DB,ETHER],
      stakingRewardAddress: '0x74D7E554abc97f0700E79bfB1a12a72DbdE7414B',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [HEX,ETHER],
      stakingRewardAddress: '0x790faEbd419e68F862fc2AC178530e5993150136',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [HEX,QUICK],
      stakingRewardAddress: '0xbeB94A09E8ea0bCaBdF45Dc35c063be5eFa8098A',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [MAUSDC,QUICK],
      stakingRewardAddress: '0xAA0505C616070aDBB5849Cd2e69001D790F83C23',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    
    { tokens: [SX,QUICK],
      stakingRewardAddress: '0x6E2c6Ec20B1D37C68d55853F041E26C7085F0609',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [GAME,QUICK],
      stakingRewardAddress: '0x5d5E93dAf02503838839cC2Efc469dDF09f9970B',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [GAME,ETHER],
      stakingRewardAddress: '0x8a2c0E8668CEA0ed4E4F7f8054CCf2B596dB6593',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [ARIA20,ETHER],
      stakingRewardAddress: '0x4BaCe30A7d51fC6143B76630F0d4dDe9A84aD026',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [SX,DAI],
      stakingRewardAddress: '0xd730DA4945Ed2cAb4859F5Ff5120563F89F4d946',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [ARIA20,QUICK],
      stakingRewardAddress: '0xf993e7aB870414b975c0c86fEBc485Ac55Ca4ce2',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [ZUT,QUICK],
      stakingRewardAddress: '0xe71Ee2AEd6ac7F0f79a39e8eabC661A8a81d9445',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [MRBAL,QUICK],
      stakingRewardAddress: '0xED4632e6e62F0B21Da5FcCc73219F90679180a10',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [VISION,ETHER],
      stakingRewardAddress: '0x5688d4a096EaaC58A4E97cDAf47148156aEa894d',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [MUST,MATIC],
      stakingRewardAddress: '0xF1c11f2db9a79674D37A2B5143bA75C3C37B4b24',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [MUST,QUICK],
      stakingRewardAddress: '0x3EFF4110dE6BB8fa02a13a13811c4A0b951e5868',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [VISION,QUICK],
      stakingRewardAddress: '0x443991561B978B910b2A712e747Bf73B62F59Fd7',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [CFI,USDC],
      stakingRewardAddress: '0x79Dc8AC9a0062D283F2EA755cB8671a76c1F4289',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [CFI,QUICK],
      stakingRewardAddress: '0xECc943eB73877450F43142265fB4EfFc102988C2',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [PPDEX,QUICK],
      stakingRewardAddress: '0xCaAF5CC13cb23988028a95c9162FCf11B5524D36',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [DSLA,QUICK],
      stakingRewardAddress: '0x67a7CC86D3Cf578b1a4AC37dC503F0d1093d45Fa',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [DSLA,ETHER],
      stakingRewardAddress: '0xa9B2852263a7e32B5D90f43380c21e367e350472',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [DRC,QUICK],
      stakingRewardAddress: '0x0684311298C4F705517098c142f095bc0d810e37',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    { tokens: [DRC,USDC],
      stakingRewardAddress: '0x98c700BC3F366Bc1b7759a8149c94dDE0edC0536',
      ended: true,
rate: 0,
pair: '',
      lp: '',
      name: '',
baseToken: EMPTY },
    {
      tokens: [USDC, MAUSDC],
      stakingRewardAddress: '0x68910d18332fFDc1D11caEA4fE93C94Ccd540732',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, GHST],
      stakingRewardAddress: '0x7E8DC91771296F8d5c03ad5c074F9Dc219C6F8A3',
      ended: true,
rate: 0,
pair: '',
      
      name: 'StkGHST-QUICK',
      lp: '0xA02d547512Bb90002807499F05495Fe9C4C3943f',
      baseToken: EMPTY
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [FRAX, FXS],
      stakingRewardAddress: '0x5DA02A2B3F401605181D55583E42a99206A795ba',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, FRAX],
      stakingRewardAddress: '0x5E405eBCc4914ACD27aA4A5EfF7BaBc04521E87A',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, MAAAVE],
      stakingRewardAddress: '0x40251Dd84EA72001627f71aD1924EAb56192363F',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [GHST, USDC],
      stakingRewardAddress: '0x04Bd1c14b42b200B5D51fB322EDC57ff8c9c7cc0',
      ended: true,
rate: 0,
pair: '',
      
      name: 'stkGHST-USDC',
      lp: '0x04439eC4ba8b09acfae0E9b5D75A82cC63b19f09',
      baseToken: EMPTY
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MATIC, ETHER],
      stakingRewardAddress: '0xC6C65bdf0EC4481ED70354463af0A8F5fC236A8C',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, ETHER],
      stakingRewardAddress: '0x53CE63267F4faf45f6eb4c5656cc53705144496a',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, MATIC],
      stakingRewardAddress: '0xf3535a4EC27613f7b6608DFCBbc31Aaeb47c2d8A',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [ETHER, WBTC],
      stakingRewardAddress: '0x74aF83811468d7a51452128727AB14507B7DC57E',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, SWAP],
      stakingRewardAddress: '0x5D9baBB81BAA29EAC55498a8155098e4bCC90657',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [ETHER, SWAP],
      stakingRewardAddress: '0x8187b7F03A90826Ad79f890F9e55117C74C60C98',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, USDC],
      stakingRewardAddress: '0x99B39206ef9b4C6757ebaf36C1BdEE9824d5FC4a',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [ETHER, USDC],
      stakingRewardAddress: '0x9732E1cC876d8D0B61389385fC1FC756920404fd',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [ETHER, DAI],
      stakingRewardAddress: '0xDFc1b89b6184DfCC7371E3dd898377ECBFEf7058',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MATIC, USDC],
      stakingRewardAddress: '0xF6B03C8092751Fc1A4AD793Ebf72f8ae1Cb720d7',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MAUSDC, MATUSD],
      stakingRewardAddress: '0x5AE1e3Af79270e600D0e86609bB56B6c6CE23Ee8',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MAUSDC, MAUSDT],
      stakingRewardAddress: '0x66aCCDc838F563D36D0695539c5A01E651eAAEC9',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MAUSDC, MADAI],
      stakingRewardAddress: '0x0A8E11C2C9B89285e810A206D391CE480dbA7562',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, UNITOKEN],
      stakingRewardAddress: '0x3991E2EF480Cc56859de294b4c38219D2160f8F4',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, IFARM],
      stakingRewardAddress: '0xFEaf88193eCD50eEDc4b8100cB069Fa07F245324',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MATIC, IFARM],
      stakingRewardAddress: '0x13FD442B86caE142C4F06730860AE14BC03194b4',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MAUSDC, MAYFI],
      stakingRewardAddress: '0xe77F457935701Ae04a19fEdE930360bD3bc8B077',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, MAUSDC],
      stakingRewardAddress: '0xE7Cf8098be964a2034BBB11Ab373B59CACFC955e',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [ETHER, SX],
      stakingRewardAddress: '0xcb5eaa6141722b7ECd8865Fb8fDd28Ba78153A36',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    
    {
      tokens: [MAUSDC, MAWETH],
      stakingRewardAddress: '0x22c79bB6641a0D2f573cCa0d8E2349F4fcFa6BED',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, SX],
      stakingRewardAddress: '0xF2514375270A988F3dce1b63e6093475a2134E65',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MAUSDC, MAAAVE],
      stakingRewardAddress: '0xb2e4aC9AF7bC5f74ACF826DD81a1EE361FAb7052',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, GAME],
      stakingRewardAddress: '0x688cf18efEF9385dCB5c961B5e3e8EDB73e4f92d',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MAUSDC, MALINK],
      stakingRewardAddress: '0x1c15a10EA6d42127CE7446304fE32DE4D6503539',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MAUSDC, MAUNI],
      stakingRewardAddress: '0xA9c67F0377999c93978430922E4D9DD9394F6292',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [ETHER, UBT],
      stakingRewardAddress: '0x462a089E0115610586d0BEc74b1436C4B18193D9',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, UBT],
      stakingRewardAddress: '0xD91b7C331F220596068278AF5a0AD7AD61b488f1',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [ETHER, DG],
      stakingRewardAddress: '0x744C0F3f2ef797A22f87cD33A6E3A15a848c312e',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, DG],
      stakingRewardAddress: '0x294118caB442669ea29E49a54FF8f51C954DcD54',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MATIC, DB],
      stakingRewardAddress: '0xa7a2FC8D0AA647dFF90Bb914f81F8ebbfDaC54E5',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [ETHER, GAME],
      stakingRewardAddress: '0xfe6223eC2ad07cE55C9eE23202D4D3f35Aa55259',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [ETHER, HEX],
      stakingRewardAddress: '0x3DB374fBCf306Da680CFAE1E2C7A60C95447a31d',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, HEX],
      stakingRewardAddress: '0x587E811A008373DAf584F14d474b0d9094E3718F',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [ETHER, DB],
      stakingRewardAddress: '0xE9C16C34f687d6Ca742e4f78682c34d9DCA085b9',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, ZUT],
      stakingRewardAddress: '0x0B614B3a0B3aD1bFb8B15Ec372834f36125ac5bA',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, MRBAL],
      stakingRewardAddress: '0x4C912FD46B5612fe0De5b9a0384a0404676A632b',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [DAI, SX],
      stakingRewardAddress: '0x5f426A6aBe6F2fdF9B144F8FC9CC0D6e669b33A3',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MATIC, MUST],
      stakingRewardAddress: '0xD7C465E1BA3F2eA56603610B6959162eEd10EdfE',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, MUST],
      stakingRewardAddress: '0x25397E9A3c874B49E86aAD308f0049A1294594ad',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, VISION],
      stakingRewardAddress: '0xA662c541aB5668D32EaF83221546D119e794F922',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [ETHER, VISION],
      stakingRewardAddress: '0xd84d9f9C8C86e87c141fDbF6946FE9806f4d7253',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, PPDEX],
      stakingRewardAddress: '0xad1D6c4519deeE5e396E17A87C886ef0fdcB3651',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, MAAAVE],
      stakingRewardAddress: '0xD8e091bbbF9F74487D4A0eE483F65b363a4bbbc9',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, GHST],
      stakingRewardAddress: '0x440E9C828ECbf6B99C51EAb217c5D6e8c8715610',
      ended: true,
rate: 0,
pair: '',
      
      name: 'StkQUICK-GHST',
      lp: '0xA02d547512Bb90002807499F05495Fe9C4C3943f',
      baseToken: EMPTY
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [USDC, MAUSDC],
      stakingRewardAddress: '0x269f1972C0fB8aCCd3Cd835115153a1EB09a6FC3',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [USDC, QUICK],
      stakingRewardAddress: '0x3d0AA307E6Dcf0c19C6df9616318AE52fdE1408A',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, MAUSDC],
      stakingRewardAddress: '0xAA1Ce6Bf8016ddFEdCF521beA5724Fc5e19902a5',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [ETHER, USDC],
      stakingRewardAddress: '0xC52614C03508d4A787Ac8E746607595Acd3614Bb',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [ETHER, MATIC],
      stakingRewardAddress: '0x9FAFF83312fcE0079fc76A87a049078606148b02',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, MATIC],
      stakingRewardAddress: '0xC0fa29d6D6F60d56eb08FD5Cb4E9b7a9E1D3d2F4',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [USDC, MATIC],
      stakingRewardAddress: '0x5c6A1676585D029a72063fA2C47a741BC8eB336F',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [WBTC, ETHER],
      stakingRewardAddress: '0x3e1F5C03fd60B9472CFc463ED8F13674F8ea3C01',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, UNITOKEN],
      stakingRewardAddress: '0x8135937A57034A8a814625b2FEb35447D23E4C9E',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [ETHER, SX],
      stakingRewardAddress: '0x804B18A358e193Fe816949E42ed26f2ed408aAD9',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [GHST, USDC],
      stakingRewardAddress: '0x4371b24Bff5F753f971a93b0Ef84c2B4d85A9a95',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MAUSDC, MALINK],
      stakingRewardAddress: '0x3c987E7C57A178674F45c92efbD7F99bDE1CF84A',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MAUSDC, MAUNI],
      stakingRewardAddress: '0x5A3714c41c6B09b52c532A52fB6432089089eBc7',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MAUSDC, MAYFI],
      stakingRewardAddress: '0xbc6A1b6d4e04aD4A8bdb8Cc7c7aB9C4513190B64',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MAUSDC, MAWETH],
      stakingRewardAddress: '0xdC68FFe4251548af0DDb79E211af8976F8b6b381',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MAUSDC, MAUSDT],
      stakingRewardAddress: '0x1b9794926759DCE8487A9614bB15Dc1767b9854d',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MAUSDC, MATUSD],
      stakingRewardAddress: '0x014FF8cb58AeA532bB2Db28D49f2704A691621e5',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MAUSDC, MADAI],
      stakingRewardAddress: '0x061aD501BFCd276fb0dCe1bb4aB93629581F342e',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MAUSDC, MAAAVE],
      stakingRewardAddress: '0x99b870c615Fb6a5b0fc2514deef6eF2a1d55a015',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, SX],
      stakingRewardAddress: '0x897edc5758E41C1c6470614b2764e21c88897eAA',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, GHST],
      stakingRewardAddress: '0x120cCE80Ca4D7CBC2c7A912321Ea1a4c32952938',
      ended: true,
rate: 0,
pair: '',
      
      name: 'StkQUICK-GHST',
      lp: '0xA02d547512Bb90002807499F05495Fe9C4C3943f',
      baseToken: EMPTY
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, UNITOKEN],
      stakingRewardAddress: '0xF44eA460Da8938227508075f7b3611A809E53042',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [USDC, QUICK],
      stakingRewardAddress: '0x5F3dc91D19661940C705B9aC4D1A8C456DC3a56E',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [USDC, GHST],
      stakingRewardAddress: '0x776976a62604643fd660bCB23c055d66d86DEc79',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, MAUSDC],
      stakingRewardAddress: '0x1538FEc5f4F3F5717929CF6E07168f831690348F',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xce2944738CA9Ae803E692124F6Fa78C1cbE3a354
    },
    {
      tokens: [MATIC, ETHER],
      stakingRewardAddress: '0xe341C094D391C40c9e1b0dfD3A0Ecf78D414c38e',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [WBTC, USDC],
      stakingRewardAddress: '0x99dFae5242b0f1883041356C00262579D07cC06a',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [ETHER, USDC],
      stakingRewardAddress: '0x848E683EeDbaB60Da6a28763318404cc8E625DDB',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [DAI, USDC],
      stakingRewardAddress: '0x4a0f78b3e398181871b8BA050c286aFEf6C06837',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MATIC, USDC],
      stakingRewardAddress: '0x513826BbF9ddcDE925322f7dFCb01A687E393F54',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, GHST],
      stakingRewardAddress: '0x7B471EA4Ee31F316B2426fe5559808c32619aCDa',
      ended: true,
rate: 0,
pair: '',
      
      name: 'StkQUICK-GHST',
      lp: '0xA02d547512Bb90002807499F05495Fe9C4C3943f',
      baseToken: EMPTY
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, UNITOKEN],
      stakingRewardAddress: '0x275d0038398Bf5D45F6E5fdC2435E6e85eA914DB',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [USDC, QUICK],
      stakingRewardAddress: '0xDCdFF945Aa9BB7841F56e9b430a859407Ecb87bF',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [USDC, GHST],
      stakingRewardAddress: '0xC1BB398b6a937889988FD51956385D29D682F85c',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, MAUSDC],
      stakingRewardAddress: '0x8626Eab301D85D4aF717918b100C2132c870883A',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xce2944738CA9Ae803E692124F6Fa78C1cbE3a354
    },
    {
      tokens: [MATIC, ETHER],
      stakingRewardAddress: '0xFEb99caeb4d137AaFdE495df139bcCDF1D2655A4',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [WBTC, USDC],
      stakingRewardAddress: '0x2E5CE665bE8641b38E4113Fec44C85EAf4669265',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [ETHER, USDC],
      stakingRewardAddress: '0x9B4f4A03166bc58Bc8efAd75a35BBfe5C43635DB',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [DAI, USDC],
      stakingRewardAddress: '0x1c6B863A5953fb4fA062cA000606605bC0cc5Cf3',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MATIC, USDC],
      stakingRewardAddress: '0xEAb6b892e106142B1e28eaeb3Cd51580d2607cE0',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, USDC],
      stakingRewardAddress: '0x1e224b8643b68a4d6b869e9596d979A708B26aB7',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, UNITOKEN],
      stakingRewardAddress: '0xa78F3cDc2D2aE9d518c2fe60007811e437DEc9CD',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MATIC, QUICK],
      stakingRewardAddress: '0x2435361A37AF5a57cB14ba8379b7Cd9dcF9d83aC',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, GHST],
      stakingRewardAddress: '0xf9d375F824D108E91c9B3c0F3c47DB2Db0A7c050',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, ETHER],
      stakingRewardAddress: '0xAfa27B566D4b077835458Eae0Ee8D1D2DD1d638E',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xce2944738CA9Ae803E692124F6Fa78C1cbE3a354
    },
    {
      tokens: [USDC, GHST],
      stakingRewardAddress: '0x16300c8811C7870260e44dC7ecBCaF854A9aCaED',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MATIC, USDC],
      stakingRewardAddress: '0xB35Ce61B63994256d263aebDDD1c3eE8447Cab38',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [WBTC, USDC],
      stakingRewardAddress: '0x71a7D3a5e09C21d18FfdF57a7Ad5499B21e587f4',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [ETHER, USDC],
      stakingRewardAddress: '0xbC2710eD5fac42e7b97fc2D3dB37176989c81ddD',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [OM, USDC],
      stakingRewardAddress: '0x663ea801BC5Dfe2430d59Da8c817EfE669D4801A',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [USDT, USDC],
      stakingRewardAddress: '0x9b19421DE59E8ca04CB194667A3352e143F09f2c',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [USDC, DAI],
      stakingRewardAddress: '0x7a503862489bA1aD2C519E8A875ec56dBAe0e8F1',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },


    {
      tokens: [QUICK, UNITOKEN],
      stakingRewardAddress: '0xD9298cBea9d1C2f134c1a70D25071DD143E00F3C',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xce2944738CA9Ae803E692124F6Fa78C1cbE3a354
    },
    {
      tokens: [QUICK, ETHER],
      stakingRewardAddress: '0x9A3EC4Ba0f979A889575754D8A1237804670a18d',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xce2944738CA9Ae803E692124F6Fa78C1cbE3a354
    },
    {
      tokens: [QUICK, USDC],
      stakingRewardAddress: '0x1975075a30Ef629A5BD480D8098EC2544010f8B9',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xce2944738CA9Ae803E692124F6Fa78C1cbE3a354
    },
    {
      tokens: [UNITOKEN, USDC],
      stakingRewardAddress: '0xa135E326a3C8bc76DECa64e6ff05c98bA1F7600e',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xce2944738CA9Ae803E692124F6Fa78C1cbE3a354
    },
    {
      tokens: [WBTC, USDC],
      stakingRewardAddress: '0x3B46d756c9963555454B70B4F04141605D0d2001',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xce2944738CA9Ae803E692124F6Fa78C1cbE3a354
    },
    {
      tokens: [USDT, USDC],
      stakingRewardAddress: '0x4c7026015f187F263b5FfAd194935372FbA07ba3',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xce2944738CA9Ae803E692124F6Fa78C1cbE3a354
    },
    {
      tokens: [ETHER, USDC],
      stakingRewardAddress: '0xc959b7ED5cfDdF7787793ee2D73f3b6576B5eb0c',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xce2944738CA9Ae803E692124F6Fa78C1cbE3a354
    },
    {
      tokens: [USDC, DAI],
      stakingRewardAddress: '0x8d4Ce6785a7c4D063d7E6Fe9a2Ca375263D7b7eF',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xce2944738CA9Ae803E692124F6Fa78C1cbE3a354
    },
    {
      tokens: [MATIC, ETHER],
      stakingRewardAddress: '0x65D3373e2Bd823B7ddA5794b32Fb5b41D97da8D0',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xce2944738CA9Ae803E692124F6Fa78C1cbE3a354
    },
    {
      tokens: [MATIC, USDC],
      stakingRewardAddress: '0x554AF11c6C9B16132C0A524495080814FE04b478',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xce2944738CA9Ae803E692124F6Fa78C1cbE3a354
    },


    {
      tokens: [QUICK, UNITOKEN],
      stakingRewardAddress: '0x451bd5921e381BFd56D5786C51F46fD49F1eB574',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xEbA9170fd5c04452Ebd40276515803687fF64162
    },
    {
      tokens: [UNITOKEN, USDC],
      stakingRewardAddress: '0xDdF1Fb44d0e8db1139138bd8c4f82FF474361744',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xEbA9170fd5c04452Ebd40276515803687fF64162
    },
    {
      tokens: [QUICK, ETHER],
      stakingRewardAddress: '0x6d8B49a865258CC53DbbAB698c362FcAd6B3FEFA',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xEbA9170fd5c04452Ebd40276515803687fF64162
    },
    {
      tokens: [QUICK, USDC],
      stakingRewardAddress: '0x6cbdcfD243FDFd740d173B321420579026Be9742',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xEbA9170fd5c04452Ebd40276515803687fF64162
    },
    {
      tokens: [MATIC, USDC],
      stakingRewardAddress: '0xF20a06123a465440263F20Aeef04930eCee8b520',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xEbA9170fd5c04452Ebd40276515803687fF64162
    },
    {
      tokens: [MATIC, ETHER],
      stakingRewardAddress: '0x5776d886459d7f202545d50377673077F27419b5',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xEbA9170fd5c04452Ebd40276515803687fF64162
    },
    {
      tokens: [WBTC, USDC],
      stakingRewardAddress: '0x58D1FD497B2FcfA64C862986bCf45d6A7Cfaa6F3',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xEbA9170fd5c04452Ebd40276515803687fF64162
    },
    {
      tokens: [USDT, USDC],
      stakingRewardAddress: '0x58196ED395e8EA60DF69e87655385AAB5B123AAB',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xEbA9170fd5c04452Ebd40276515803687fF64162
    },
    {
      tokens: [ETHER, USDC],
      stakingRewardAddress: '0x304ec0c4C85E08308Bc52362801c8AAE5cbb0Abf',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xEbA9170fd5c04452Ebd40276515803687fF64162
    },
    {
      tokens: [USDC, DAI],
      stakingRewardAddress: '0x843Db20345080d718e660bB99613f50D60092a65',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xEbA9170fd5c04452Ebd40276515803687fF64162
    },
    {
      tokens: [USDC, OM],
      stakingRewardAddress: '0x6eaaF92aaA842e88a9F6A9345aA8c3e7B1D0B52e',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xEbA9170fd5c04452Ebd40276515803687fF64162
    },


    {
      tokens: [QUICK, UNITOKEN],
      stakingRewardAddress: '0xF3331039E0090616D440798EcFcCF83552aDbc7A',
      ended: true,
rate: 0,
pair: '',

      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0x8A121aECBFFa81A9d4B1eeA6290F20C4487d990D
    },
    {
      tokens: [QUICK, ETHER],
      stakingRewardAddress: '0xF8930990505F0d2404f61778D6eC49f95A87dd6f',
      ended: true,
rate: 0,
pair: '',

      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0x8A121aECBFFa81A9d4B1eeA6290F20C4487d990D
    },
    {
      tokens: [QUICK, USDC],
      stakingRewardAddress: '0x51C8ed98427ED9984836bC4a5371DA24573333c1',
      ended: true,
rate: 0,
pair: '',

      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0x8A121aECBFFa81A9d4B1eeA6290F20C4487d990D
    },
    {
      tokens: [UNITOKEN, USDC],
      stakingRewardAddress: '0xB72Ed7502150B922667Fd512b82Dc2a62999ab93',
      ended: true,
rate: 0,
pair: '',

      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0x8A121aECBFFa81A9d4B1eeA6290F20C4487d990D
    },
    {
      tokens: [WBTC, USDC],
      stakingRewardAddress: '0x8B0c71AF620850D32546ba5862995Be07633D9E2',
      ended: true,
rate: 0,
pair: '',

      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0x8A121aECBFFa81A9d4B1eeA6290F20C4487d990D
    },
    {
      tokens: [USDT, USDC],
      stakingRewardAddress: '0x7EF2510AAf83E286886b8A1D4BE0b88099308CF0',
      ended: true,
rate: 0,
pair: '',

      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0x8A121aECBFFa81A9d4B1eeA6290F20C4487d990D
    },
    {
      tokens: [ETHER, USDC],
      stakingRewardAddress: '0xf3bc3ECb14831F36B8dfE67abC51eB23B31839D1',
      ended: true,
rate: 0,
pair: '',

      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0x8A121aECBFFa81A9d4B1eeA6290F20C4487d990D
    },
    {
      tokens: [USDC, DAI],
      stakingRewardAddress: '0xA937169A29b9858fFD98521CEA3023D2e565A987',
      ended: true,
rate: 0,
pair: '',

      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0x8A121aECBFFa81A9d4B1eeA6290F20C4487d990D
    },
    {
      tokens: [MATIC, ETHER],
      stakingRewardAddress: '0x78B2455b4cAa92c4a3678D7bFE1BfD18bA3D647c',
      ended: true,
rate: 0,
pair: '',

      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0x8A121aECBFFa81A9d4B1eeA6290F20C4487d990D
    },
    {
      tokens: [MATIC, USDC],
      stakingRewardAddress: '0xDD86a8516188010A1301Ac79CE8A1D04fEC602a3',
      ended: true,
rate: 0,
pair: '',

      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0x8A121aECBFFa81A9d4B1eeA6290F20C4487d990D
    },



    {
      tokens: [QUICK, UNITOKEN],
      stakingRewardAddress: '0x92eB672C46ba00CE303878B56A5a6288058954bb',
      ended: true,
rate: 0,
pair: '',

      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0xE8aF51444824b23d71987166b3ECa9d4C28eA4A6
    },
    {
      tokens: [QUICK, ETHER],
      stakingRewardAddress: '0x1F92A2bd44C52cc94Aa111Ba7557c0FA10bBF428',
      ended: true,
rate: 0,
pair: '',

      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0xE8aF51444824b23d71987166b3ECa9d4C28eA4A6
    },
    {
      tokens: [QUICK, USDC],
      stakingRewardAddress: '0xa4D93BbE0E0C75F94859e1bD0bB2AF7226Af1aF4',
      ended: true,
rate: 0,
pair: '',

      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0xE8aF51444824b23d71987166b3ECa9d4C28eA4A6
    },
    {
      tokens: [UNITOKEN, USDC],
      stakingRewardAddress: '0x3EA879F7fa2285Fde5676E464483dBcC502961eA',
      ended: true,
rate: 0,
pair: '',

      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0xE8aF51444824b23d71987166b3ECa9d4C28eA4A6
    },
    {
      tokens: [WBTC, USDC],
      stakingRewardAddress: '0x1b295617072f5065b5112e3aE39420933c985dDF',
      ended: true,
rate: 0,
pair: '',

      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0xE8aF51444824b23d71987166b3ECa9d4C28eA4A6
    },
    {
      tokens: [USDT, USDC],
      stakingRewardAddress: '0xFc62e4c7f6FeE3d2D70221A1BdB9335aDbf4700e',
      ended: true,
rate: 0,
pair: '',

      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0xE8aF51444824b23d71987166b3ECa9d4C28eA4A6
    },
    {
      tokens: [ETHER, USDC],
      stakingRewardAddress: '0x124837e8585b7f2CdF9D0eA643F428696bB4491C',
      ended: true,
rate: 0,
pair: '',

      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0xE8aF51444824b23d71987166b3ECa9d4C28eA4A6
    },
    {
      tokens: [USDC, DAI],
      stakingRewardAddress: '0x398822B15d412344387B8CCF82453A25187203f3',
      ended: true,
rate: 0,
pair: '',

      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0xE8aF51444824b23d71987166b3ECa9d4C28eA4A6
    },
    {
      tokens: [MATIC, USDC],
      stakingRewardAddress: '0x1bdAf7D03e83580ccAc8c0403212e78FFf69c538',
      ended: true,
rate: 0,
pair: '',

      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0xE8aF51444824b23d71987166b3ECa9d4C28eA4A6
    },


    {
      tokens: [QUICK, UNITOKEN],
      stakingRewardAddress: '0xFF448d419D52B56aF7c7D78cB504C5da76Ba2D29',
      ended: true,
rate: 0,
pair: '',

      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0x122cfEd20D7C812cbcEC5538BB8DE3e46c94BEf6
    },
    {
      tokens: [QUICK, ETHER],
      stakingRewardAddress: '0xb99d3f2e5eDA2081fB2A70038589566D33c149c3',
      ended: true,
rate: 0,
pair: '',

      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0x122cfEd20D7C812cbcEC5538BB8DE3e46c94BEf6
    },
    {
      tokens: [QUICK, USDC],
      stakingRewardAddress: '0x05748fD0d03780637A85dF5B2293ce857C1Fa309',
      ended: true,
rate: 0,
pair: '',

      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0x122cfEd20D7C812cbcEC5538BB8DE3e46c94BEf6
    },
    {
      tokens: [UNITOKEN, USDC],
      stakingRewardAddress: '0x8dbf46c0f6Db05383Dc870036ad0F7619F7BDc3a',
      ended: true,
rate: 0,
pair: '',

      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0x122cfEd20D7C812cbcEC5538BB8DE3e46c94BEf6
    },
    {
      tokens: [WBTC, USDC],
      stakingRewardAddress: '0xf0f22765B9ea540929c7eC9BBCF7077C9f8E3117',
      ended: true,
rate: 0,
pair: '',

      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0x122cfEd20D7C812cbcEC5538BB8DE3e46c94BEf6
    },
    {
      tokens: [USDT, USDC],
      stakingRewardAddress: '0x73c601264d64d0DCbCa47ddef2dFC97E363E88a4',
      ended: true,
rate: 0,
pair: '',

      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0x122cfEd20D7C812cbcEC5538BB8DE3e46c94BEf6
    },
    {
      tokens: [ETHER, USDC],
      stakingRewardAddress: '0x46385DF67DF1A058d0C07420e4B7D9c3a40eACE8',
      ended: true,
rate: 0,
pair: '',
      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0x122cfEd20D7C812cbcEC5538BB8DE3e46c94BEf6
    },
    {
      tokens: [IGG, USDC],
      stakingRewardAddress: '0x6d48CeD6521B55F64Bdb5FbFe27e0A19Fb46F1C8',
      ended: true,
rate: 0,
pair: '',
      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0x122cfEd20D7C812cbcEC5538BB8DE3e46c94BEf6
    },
    {
      tokens: [MATIC, USDC],
      stakingRewardAddress: '0x5d445F4EDdCaee519F51Bb9AB7fEE0A74c8F37C1',
      ended: true,
rate: 0,
pair: '',
      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0x122cfEd20D7C812cbcEC5538BB8DE3e46c94BEf6
    },


    {
      tokens: [QUICK, DAI],
      stakingRewardAddress: '0xcd7A989C8a21871ff9Da645F74916e23b7b83601',
      ended: true,
rate: 0,
pair: '',
      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0x17D0a95553625CfF6A7320c69aD0060969331e39
    },
    {
      tokens: [QUICK, USDC],
      stakingRewardAddress: '0x7341554a23A89a97186f339597AE365bBB0c4a26',
      ended: true,
rate: 0,
pair: '',
      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0x17D0a95553625CfF6A7320c69aD0060969331e39
    },
    {
      tokens: [QUICK, UNITOKEN],
      stakingRewardAddress: '0x7d59413E87dA59552a662103782CcA860Dc3d3c4',
      ended: true,
rate: 0,
pair: '',
      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0x17D0a95553625CfF6A7320c69aD0060969331e39
    },
    {
      tokens: [ETHER, USDC],
      stakingRewardAddress: '0xf91056D1A58a38A783a4F6122A1F995EEE4f60B3',
      ended: true,
rate: 0,
pair: '',
      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0x17D0a95553625CfF6A7320c69aD0060969331e39
    },
    {
      tokens: [ETHER, DAI],
      stakingRewardAddress: '0x88d4D1a7A0E917DB41De09A1AcA437726c1C418a',
      ended: true,
rate: 0,
pair: '',
      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0x17D0a95553625CfF6A7320c69aD0060969331e39
    },
    {
      tokens: [ETHER, USDC],
      stakingRewardAddress: '0x0cc1c20c8A5640aeFdD41b2aa3E8Dc2c2EdcDDbD',
      ended: true,
rate: 0,
pair: '',
      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0x80F13018Eb0CbD2579924Eb8039C5d36E467EB49
    },
    {
      tokens: [QUICK, USDC],
      stakingRewardAddress: '0x457d88690e0B543445e69c03b5a760b38Ce07078',
      ended: true,
rate: 0,
pair: '',
      name: '',
baseToken: EMPTY,
      lp: ''
      
      //STAKINGREWARDSFACTORY- 0x80F13018Eb0CbD2579924Eb8039C5d36E467EB49
    },



    {
      tokens: [USDC, MAUSDC],
      stakingRewardAddress: '0xFB5ddc9a2B675E3C13272f1B2Db0ED68340A6141',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, GHST],
      stakingRewardAddress: '0xc7A34b9fB20A195e8F077CF2D4830682FBbc58dA',
      ended: true,
rate: 0,
pair: '',
      
      name: 'StkGHST-QUICK',
      lp: '0xA02d547512Bb90002807499F05495Fe9C4C3943f',
      baseToken: EMPTY
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, MAAAVE],
      stakingRewardAddress: '0x627671bF401A990577063784055c0E758b62Ecc6',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [ETHER, SWAP],
      stakingRewardAddress: '0x7F1d94D95fAD3200F238256dE8cE4C559a421437',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, SWAP],
      stakingRewardAddress: '0x39D158D8cf47Ed30c3fB8EA64C4CbC0A1155D931',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, USDC],
      stakingRewardAddress: '0xd6875b41EE725E8803407793501c70153eF6Fc23',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [GHST, USDC],
      stakingRewardAddress: '0x59A03B35a1379F498c32018b286250066348061F',
      ended: true,
rate: 0,
pair: '',
      
      name: 'stkGHST-USDC',
      lp: '0x04439eC4ba8b09acfae0E9b5D75A82cC63b19f09',
      baseToken: EMPTY
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MATIC, ETHER],
      stakingRewardAddress: '0xAE2D461aD54e1C98d1495B7424Fc0Cf495276f11',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, ETHER],
      stakingRewardAddress: '0xcdB04b9F0a134505c3FbE89A310C5C43165885e5',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, MATIC],
      stakingRewardAddress: '0xA36B18065D77B6F282F9A7dBC999Af23eE80FDf5',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [WBTC, ETHER],
      stakingRewardAddress: '0x088e190FcF2320B63944967854D066856EdAa435',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [USDC, ETHER],
      stakingRewardAddress: '0xc7Dc6829E32a511d6be2F93243121932F78719ff',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [USDC, MATIC],
      stakingRewardAddress: '0x3d63feCf1045f3E5bd4517e520F66CD6E9378850',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [ETHER, SX],
      stakingRewardAddress: '0x8Fb8f95628b85E35F2E4B5249F887D074086154C',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, UNITOKEN],
      stakingRewardAddress: '0xc6fd2B6b27e726A0555574419d1beAa37D75738a',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, MAUSDC],
      stakingRewardAddress: '0xe8595596a85249dd2DEFd925e911d0C227fcc1c5',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, SX],
      stakingRewardAddress: '0x4E011A95374377842651fFf882c53fA195759dde',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MAUSDC, MALINK],
      stakingRewardAddress: '0xB94747D2a1506c370B4D67F2d52a8439df72d8dD',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MAUSDC, MAUNI],
      stakingRewardAddress: '0x0858f451cBb7F3c5ea2FBa3dC4287578Ad496633',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MAUSDC, MAYFI],
      stakingRewardAddress: '0x61Dc7A5Ed893304b6A12D022C042Cc99cb4d74a0',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MAUSDC, MAWETH],
      stakingRewardAddress: '0xCD032679f9eaFa8e4f068280932B4C9a7f021029',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MAUSDC, MAUSDT],
      stakingRewardAddress: '0xC18Fd4298F1A5abBFF1CD777c590db1776986023',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MAUSDC, MATUSD],
      stakingRewardAddress: '0x36d078bfa649cBBd1d0F4cfc5F3d70401d849a71',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MAUSDC, MADAI],
      stakingRewardAddress: '0x0eC57767a4dE065bb50429702671942f51A8ab37',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MAUSDC, MAAAVE],
      stakingRewardAddress: '0xf8B210c70b108104aAF9C301367cD575D69E1f6e',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, GAME],
      stakingRewardAddress: '0x1090dA8B2EA11DB28cB39B9ebFf9711d285F897A',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [ETHER, GAME],
      stakingRewardAddress: '0x527C91ad95430a2064637EF6413e9520784568a9',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [ETHER, HEX],
      stakingRewardAddress: '0x20D06b4E5516111C08a023Aa3cAC8A12e220f51d',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, HEX],
      stakingRewardAddress: '0x1161d9270c60e3A158727C59F4A92C067d664C22',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [ETHER, DB],
      stakingRewardAddress: '0x6240b9142Ac1087F5f0244413747E1C1cc79a03b',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [MATIC, DB],
      stakingRewardAddress: '0xA498c012fa5fc5DBEaf4F26bdA42227c22527945',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, MRBAL],
      stakingRewardAddress: '0xCD732D7c41753503B7d0311173cf90878bfF8806',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [QUICK, ZUT],
      stakingRewardAddress: '0x3A06DDc718ED7Cd15C1653187A4aB181Ec25E23C',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    },
    {
      tokens: [DAI, SX],
      stakingRewardAddress: '0xca5Da81e08E573D5D92aCDe4Ac9Cc6534c3fAe09',
      ended: true,
rate: 0,
pair: '',
      
      name: '',
baseToken: EMPTY,
      lp: ''
      //STAKINGREWARDSFACTORY- 0xbD20FAdBdd65A73A15452Ce0adf7d4943e102b69
    }*/
  ],
};

export interface LairInfo {
  lairAddress: string;

  dQUICKtoQUICK: TokenAmount;

  QUICKtodQUICK: TokenAmount;

  dQUICKBalance: TokenAmount;

  QUICKBalance: TokenAmount;

  totalQuickBalance: TokenAmount;

  quickPrice: number;

  dQuickTotalSupply: TokenAmount;

  oneDayVol: number;
}

export interface StakingInfo {
  // the address of the reward contract
  stakingRewardAddress: string;
  // the tokens involved in this pair
  tokens: [Token, Token];
  // the amount of token currently staked, or undefined if no account
  stakedAmount: TokenAmount;
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount: TokenAmount;
  // the total amount of token staked in the contract
  totalStakedAmount: TokenAmount;
  // the amount of token distributed per second to all LPs, constant
  totalRewardRate: TokenAmount;
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  rewardRate: TokenAmount;
  // when the period ends
  periodFinish: Date | undefined;

  ended: boolean;

  name: string;

  lp: string;

  baseToken: Token;

  pair: string;

  quickPrice: number;

  rate: number;

  oneYearFeeAPY: number;

  oneDayFee: number;

  accountFee: number;
  dQuickToQuick: number;
  // calculates a hypothetical amount of token distributed to the active account per second.
  getHypotheticalRewardRate: (
    stakedAmount: TokenAmount,
    totalStakedAmount: TokenAmount,
    totalRewardRate: TokenAmount,
  ) => TokenAmount;
}

export interface DualStakingInfo {
  // the address of the reward contract
  stakingRewardAddress: string;
  // the tokens involved in this pair
  tokens: [Token, Token];

  rewardTokenA: Token;
  rewardTokenB: Token;
  rewardTokenBBase: Token;
  // the amount of token currently staked, or undefined if no account
  stakedAmount: TokenAmount;
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmountA: TokenAmount;
  earnedAmountB: TokenAmount;
  // the total amount of token staked in the contract
  totalStakedAmount: TokenAmount;
  // the amount of token distributed per second to all LPs, constant
  totalRewardRateA: TokenAmount;
  totalRewardRateB: TokenAmount;
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  rewardRateA: TokenAmount;
  rewardRateB: TokenAmount;
  // when the period ends
  periodFinish: Date | undefined;

  ended: boolean;

  name: string;

  lp: string;

  baseToken: Token;

  pair: string;

  quickPrice: number;
  maticPrice: number;

  rateA: number;
  rateB: number;

  oneYearFeeAPY: number;

  oneDayFee: number;

  accountFee: number;
  // calculates a hypothetical amount of token distributed to the active account per second.
  getHypotheticalRewardRate: (
    stakedAmount: TokenAmount,
    totalStakedAmount: TokenAmount,
    totalRewardRate: TokenAmount,
  ) => TokenAmount;
}

export interface SyrupInfo {
  // the address of the reward contract
  stakingRewardAddress: string;
  // the token involved in this staking
  token: Token;
  // the amount of token currently staked, or undefined if no account
  stakedAmount: TokenAmount;
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount: TokenAmount;
  // the total amount of token staked in the contract
  totalStakedAmount: TokenAmount;
  // the amount of token distributed per second to all stakers, constant
  totalRewardRate: TokenAmount;
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  rewardRate: TokenAmount;
  // when the period ends
  periodFinish: number;

  ended: boolean;

  name: string;

  lp: string;

  baseToken: Token;

  quickPrice: number;

  rate: number;

  dQUICKtoQUICK: TokenAmount;

  dQuickTotalSupply: TokenAmount;

  oneDayVol: number;

  valueOfTotalStakedAmountInUSDC: number;

  // calculates a hypothetical amount of token distributed to the active account per second.
  getHypotheticalRewardRate: (
    stakedAmount: TokenAmount,
    totalStakedAmount: TokenAmount,
    totalRewardRate: TokenAmount,
  ) => TokenAmount;
}

export function useSyrupInfo(tokenToFilterBy?: Token | null): SyrupInfo[] {
  const { chainId, account } = useActiveWeb3React();
  //const [quickPrice,setQuickPrice] = useState(0);
  const [, quickUsdcPair] = usePair(QUICK, USDC);
  const quickPrice = Number(quickUsdcPair?.priceOf(QUICK)?.toSignificant(6));
  const info = useMemo(
    () =>
      chainId
        ? SYRUP_REWARDS_INFO[chainId]?.filter((stakingRewardInfo) =>
            tokenToFilterBy === undefined
              ? true
              : tokenToFilterBy === null
              ? true
              : tokenToFilterBy.equals(stakingRewardInfo.token) &&
                tokenToFilterBy.equals(stakingRewardInfo.token),
          ) ?? []
        : [],
    [chainId, tokenToFilterBy],
  );

  const uni = chainId ? UNI[chainId] : undefined;

  const rewardsAddresses = useMemo(
    () => info.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [info],
  );

  const accountArg = useMemo(() => [account ?? undefined], [account]);
  const lair = useLairContract();

  const inputs = ['1000000000000000000'];
  const USDPrice = useUSDCPrice(QUICK);

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'balanceOf',
    accountArg,
  );
  const earnedAmounts = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'earned',
    accountArg,
  );
  const totalSupplies = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'totalSupply',
  );
  const dQuickToQuick = useSingleCallResult(lair, 'dQUICKForQUICK', inputs);
  const _dQuickTotalSupply = useSingleCallResult(lair, 'totalSupply', []);

  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD,
  );
  const rewardRates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'rewardRate',
    undefined,
    NEVER_RELOAD,
  );

  useEffect(() => {
    getOneDayVolume().then((data) => {
      console.log(data);
    });
  }, []);

  return useMemo(() => {
    if (!chainId || !uni) return [];

    return rewardsAddresses.reduce<SyrupInfo[]>(
      (memo, rewardsAddress, index) => {
        // these two are dependent on account
        const balanceState = balances[index];
        const earnedAmountState = earnedAmounts[index];

        // these get fetched regardless of account
        const totalSupplyState = totalSupplies[index];
        const rewardRateState = rewardRates[index];
        const periodFinishState = periodFinishes[index];

        if (
          // these may be undefined if not logged in
          !dQuickToQuick?.loading &&
          !balanceState?.loading &&
          !earnedAmountState?.loading &&
          // always need these
          totalSupplyState &&
          !totalSupplyState.loading &&
          rewardRateState &&
          !rewardRateState.loading &&
          periodFinishState &&
          !periodFinishState.loading
        ) {
          if (
            dQuickToQuick?.error ||
            balanceState?.error ||
            earnedAmountState?.error ||
            totalSupplyState.error ||
            rewardRateState.error ||
            periodFinishState.error
          ) {
            console.error('Failed to load syrup rewards info');
            return memo;
          }
          // get the LP token
          const token = info[index].token;

          // check for account, if no account set to 0
          const lp = info[index].lp;
          const rate = web3.utils.toWei(info[index].rate.toString());
          const stakedAmount = new TokenAmount(
            lp && lp !== ''
              ? new Token(137, lp, 18, 'SLP', 'Staked LP')
              : DQUICK,
            JSBI.BigInt(balanceState?.result?.[0] ?? 0),
          );
          const totalStakedAmount = new TokenAmount(
            lp && lp !== ''
              ? new Token(137, lp, 18, 'SLP', 'Staked LP')
              : DQUICK,
            JSBI.BigInt(totalSupplyState.result?.[0]),
          );
          const totalRewardRate = new TokenAmount(token, JSBI.BigInt(rate));
          //const pair = info[index].pair.toLowerCase();
          //const fees = (pairData && pairData[pair] ? pairData[pair].oneDayVolumeUSD * 0.0025: 0);
          const totalRewardRate01 = new TokenAmount(
            token,
            JSBI.BigInt(rewardRateState.result?.[0]),
          );
          const getHypotheticalRewardRate = (
            stakedAmount: TokenAmount,
            totalStakedAmount: TokenAmount,
            totalRewardRate: TokenAmount,
          ): TokenAmount => {
            return new TokenAmount(
              token,
              JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
                ? JSBI.divide(
                    JSBI.multiply(totalRewardRate01.raw, stakedAmount.raw),
                    totalStakedAmount.raw,
                  )
                : JSBI.BigInt(0),
            );
          };

          const individualRewardRate = getHypotheticalRewardRate(
            stakedAmount,
            totalStakedAmount,
            totalRewardRate01,
          );

          const periodFinishMs = info[index].ending;
          const dQUICKtoQUICK = new TokenAmount(
            QUICK,
            JSBI.BigInt(dQuickToQuick?.result?.[0] ?? 0),
          );
          const valueOfTotalStakedAmountInUSDC =
            Number(totalStakedAmount.toSignificant(6)) *
            Number(dQUICKtoQUICK.toSignificant(6)) *
            Number(USDPrice?.toSignificant(6));

          memo.push({
            stakingRewardAddress: rewardsAddress,
            token: info[index].token,
            ended: info[index].ended,
            name: info[index].name,
            lp: info[index].lp,
            periodFinish: periodFinishMs,
            earnedAmount: new TokenAmount(
              token,
              JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0),
            ),
            rewardRate: individualRewardRate,
            totalRewardRate: totalRewardRate,
            stakedAmount: stakedAmount,
            totalStakedAmount: totalStakedAmount,
            getHypotheticalRewardRate,
            baseToken: info[index].baseToken,
            quickPrice: quickPrice,
            rate: info[index].rate,
            dQUICKtoQUICK: dQUICKtoQUICK,
            dQuickTotalSupply: new TokenAmount(
              DQUICK,
              JSBI.BigInt(_dQuickTotalSupply?.result?.[0] ?? 0),
            ),
            valueOfTotalStakedAmountInUSDC: valueOfTotalStakedAmountInUSDC,
            oneDayVol: oneDayVol,
          });
        }
        return memo;
      },
      [],
    );
  }, [
    balances,
    chainId,
    earnedAmounts,
    info,
    periodFinishes,
    rewardsAddresses,
    totalSupplies,
    uni,
    dQuickToQuick,
    USDPrice,
    _dQuickTotalSupply,
    quickPrice,
    rewardRates,
  ]);
}

export function useOldSyrupInfo(tokenToFilterBy?: Token | null): SyrupInfo[] {
  const { chainId, account } = useActiveWeb3React();
  //const [quickPrice,setQuickPrice] = useState(0);
  const [, quickUsdcPair] = usePair(QUICK, USDC);
  const quickPrice = Number(quickUsdcPair?.priceOf(QUICK)?.toSignificant(6));
  const info = useMemo(
    () =>
      chainId
        ? OLD_SYRUP_REWARDS_INFO[chainId]?.filter((stakingRewardInfo) =>
            tokenToFilterBy === undefined
              ? true
              : tokenToFilterBy === null
              ? true
              : tokenToFilterBy.equals(stakingRewardInfo.token) &&
                tokenToFilterBy.equals(stakingRewardInfo.token),
          ) ?? []
        : [],
    [chainId, tokenToFilterBy],
  );

  const uni = chainId ? UNI[chainId] : undefined;

  const rewardsAddresses = useMemo(
    () => info.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [info],
  );

  const accountArg = useMemo(() => [account ?? undefined], [account]);

  const USDPrice = useUSDCPrice(QUICK);

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'balanceOf',
    accountArg,
  );
  const earnedAmounts = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'earned',
    accountArg,
  );
  const totalSupplies = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'totalSupply',
  );

  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD,
  );
  const rewardRates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'rewardRate',
    undefined,
    NEVER_RELOAD,
  );

  return useMemo(() => {
    if (!chainId || !uni) return [];

    return rewardsAddresses.reduce<SyrupInfo[]>(
      (memo, rewardsAddress, index) => {
        // these two are dependent on account
        const balanceState = balances[index];
        const earnedAmountState = earnedAmounts[index];

        // these get fetched regardless of account
        const totalSupplyState = totalSupplies[index];
        const rewardRateState = rewardRates[index];
        const periodFinishState = periodFinishes[index];

        if (
          // these may be undefined if not logged in
          !balanceState?.loading &&
          !earnedAmountState?.loading &&
          // always need these
          totalSupplyState &&
          !totalSupplyState.loading &&
          rewardRateState &&
          !rewardRateState.loading &&
          periodFinishState &&
          !periodFinishState.loading
        ) {
          if (
            balanceState?.error ||
            earnedAmountState?.error ||
            totalSupplyState.error ||
            rewardRateState.error ||
            periodFinishState.error
          ) {
            console.error('Failed to load syrup rewards info');
            return memo;
          }
          // get the LP token
          const token = info[index].token;

          // check for account, if no account set to 0
          const lp = info[index].lp;
          const rate = web3.utils.toWei(info[index].rate.toString());
          const stakedAmount = new TokenAmount(
            lp && lp !== ''
              ? new Token(137, lp, 18, 'SLP', 'Staked LP')
              : DQUICK,
            JSBI.BigInt(balanceState?.result?.[0] ?? 0),
          );
          const totalStakedAmount = new TokenAmount(
            lp && lp !== ''
              ? new Token(137, lp, 18, 'SLP', 'Staked LP')
              : DQUICK,
            JSBI.BigInt(totalSupplyState.result?.[0]),
          );
          const totalRewardRate = new TokenAmount(token, JSBI.BigInt(rate));
          //const pair = info[index].pair.toLowerCase();
          //const fees = (pairData && pairData[pair] ? pairData[pair].oneDayVolumeUSD * 0.0025: 0);
          const totalRewardRate01 = new TokenAmount(
            token,
            JSBI.BigInt(rewardRateState.result?.[0]),
          );
          const getHypotheticalRewardRate = (
            stakedAmount: TokenAmount,
            totalStakedAmount: TokenAmount,
            totalRewardRate: TokenAmount,
          ): TokenAmount => {
            return new TokenAmount(
              token,
              JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
                ? JSBI.divide(
                    JSBI.multiply(totalRewardRate01.raw, stakedAmount.raw),
                    totalStakedAmount.raw,
                  )
                : JSBI.BigInt(0),
            );
          };

          const individualRewardRate = getHypotheticalRewardRate(
            stakedAmount,
            totalStakedAmount,
            totalRewardRate01,
          );

          const periodFinishMs = info[index].ending;
          const dQUICKtoQUICK = new TokenAmount(QUICK, JSBI.BigInt(0));
          const valueOfTotalStakedAmountInUSDC =
            Number(totalStakedAmount.toSignificant(6)) *
            Number(dQUICKtoQUICK.toSignificant(6)) *
            Number(USDPrice?.toSignificant(6));

          memo.push({
            stakingRewardAddress: rewardsAddress,
            token: info[index].token,
            ended: info[index].ended,
            name: info[index].name,
            lp: info[index].lp,
            periodFinish: periodFinishMs,
            earnedAmount: new TokenAmount(
              token,
              JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0),
            ),
            rewardRate: individualRewardRate,
            totalRewardRate: totalRewardRate,
            stakedAmount: stakedAmount,
            totalStakedAmount: totalStakedAmount,
            getHypotheticalRewardRate,
            baseToken: info[index].baseToken,
            quickPrice: quickPrice,
            rate: 0,
            dQUICKtoQUICK: dQUICKtoQUICK,
            dQuickTotalSupply: new TokenAmount(DQUICK, JSBI.BigInt(0)),
            valueOfTotalStakedAmountInUSDC: valueOfTotalStakedAmountInUSDC,
            oneDayVol: 0,
          });
        }
        return memo;
      },
      [],
    );
  }, [
    balances,
    chainId,
    earnedAmounts,
    info,
    periodFinishes,
    rewardsAddresses,
    totalSupplies,
    uni,
    USDPrice,
    quickPrice,
    rewardRates,
  ]);
}

const getBulkPairData = async (pairList: any) => {
  if (pairs !== undefined) {
    return;
  }
  const current = await web3.eth.getBlockNumber();
  const oneDayOldBlock = current - 44000;

  try {
    const current = await client.query({
      query: PAIRS_BULK(pairList),
      variables: {
        allPairs: pairList,
      },
      fetchPolicy: 'cache-first',
    });

    const [oneDayResult] = await Promise.all(
      [oneDayOldBlock].map(async (block) => {
        const result = client.query({
          query: PAIRS_HISTORICAL_BULK(block, pairList),
          fetchPolicy: 'cache-first',
        });
        return result;
      }),
    );

    const oneDayData = oneDayResult?.data?.pairs.reduce(
      (obj: any, cur: any, i: any) => {
        return { ...obj, [cur.id]: cur };
      },
      {},
    );

    const pairData = await Promise.all(
      current &&
        current.data.pairs.map(async (pair: any) => {
          let data = pair;
          const oneDayHistory = oneDayData?.[pair.id];

          data = parseData(data, oneDayHistory);
          return data;
        }),
    );

    const object = convertArrayToObject(pairData, 'id');
    if (Object.keys(object).length > 0) {
      pairs = object;
      return object;
    }
    return object;
  } catch (e) {
    console.log(e);
    return;
  }
};

const getDualBulkPairData = async (pairList: any) => {
  if (dualPairs !== undefined) {
    return;
  }
  const current = await web3.eth.getBlockNumber();
  const oneDayOldBlock = current - 44000;

  try {
    const current = await client.query({
      query: PAIRS_BULK(pairList),
      variables: {
        allPairs: pairList,
      },
      fetchPolicy: 'cache-first',
    });

    const [oneDayResult] = await Promise.all(
      [oneDayOldBlock].map(async (block) => {
        const result = client.query({
          query: PAIRS_HISTORICAL_BULK(block, pairList),
          fetchPolicy: 'cache-first',
        });
        return result;
      }),
    );

    const oneDayData = oneDayResult?.data?.pairs.reduce(
      (obj: any, cur: any, i: any) => {
        return { ...obj, [cur.id]: cur };
      },
      {},
    );

    const pairData = await Promise.all(
      current &&
        current.data.pairs.map(async (pair: any) => {
          let data = pair;
          const oneDayHistory = oneDayData?.[pair.id];

          data = parseData(data, oneDayHistory);
          return data;
        }),
    );

    const object = convertArrayToObject(pairData, 'id');
    if (Object.keys(object).length > 0) {
      dualPairs = object;
      return object;
    }
    return object;
  } catch (e) {
    console.log(e);
    return;
  }
};

const getOneDayVolume = async () => {
  let data: any = {};
  let oneDayData: any = {};

  const healthInfo = await healthClient.query({
    query: SUBGRAPH_HEALTH,
  });
  const current = Number(
    healthInfo.data.indexingStatusForCurrentVersion.chains[0].latestBlock
      .number,
  );
  const oneDayOldBlock = current - 45000;

  const result = await client.query({
    query: GLOBAL_DATA(current),
    fetchPolicy: 'network-only',
  });
  data = result.data.uniswapFactories[0];

  // fetch the historical data
  const oneDayResult = await client.query({
    query: GLOBAL_DATA(oneDayOldBlock),
    fetchPolicy: 'network-only',
  });
  oneDayData = oneDayResult.data.uniswapFactories[0];

  let oneDayVolumeUSD: any = 0;

  if (data && oneDayData) {
    oneDayVolumeUSD = get2DayPercentChange(
      data.totalVolumeUSD,
      oneDayData.totalVolumeUSD ? oneDayData.totalVolumeUSD : 0,
    );
    oneDayVol = oneDayVolumeUSD;
  }

  return oneDayVolumeUSD;
};

const convertArrayToObject = (array: any, key: any) => {
  const initialValue = {};
  return array.reduce((obj: any, item: any) => {
    return {
      ...obj,
      [item[key]]: item,
    };
  }, initialValue);
};

export const get2DayPercentChange = (valueNow: any, value24HoursAgo: any) => {
  // get volume info for both 24 hour periods
  const currentChange = parseFloat(valueNow) - parseFloat(value24HoursAgo);
  return currentChange;
};

function parseData(data: any, oneDayData: any) {
  // get volume changes
  const oneDayVolumeUSD = get2DayPercentChange(
    data?.volumeUSD,
    oneDayData?.volumeUSD ? oneDayData.volumeUSD : 0,
  );
  const returnData: any = {};
  returnData.id = data.id;
  returnData.token0 = data.token0;
  returnData.token1 = data.token1;
  returnData.oneDayVolumeUSD = parseFloat(oneDayVolumeUSD?.toString());
  returnData.reserveUSD = data.reserveUSD;
  returnData.totalSupply = data.totalSupply;

  return returnData;
}

// gets the dual rewards staking info from the network for the active chain id
export function useDualStakingInfo(
  pairToFilterBy?: Pair | null,
): DualStakingInfo[] {
  const { chainId, account } = useActiveWeb3React();
  //const [quickPrice,setQuickPrice] = useState(0);
  const [, quickUsdcPair] = usePair(QUICK, USDC);
  const [, maticUsdcPair] = usePair(MATIC, USDC);

  const quickPrice = Number(quickUsdcPair?.priceOf(QUICK)?.toSignificant(6));
  const maticPrice = Number(maticUsdcPair?.priceOf(MATIC)?.toSignificant(6));

  const info = useMemo(
    () =>
      chainId
        ? STAKING_DUAL_REWARDS_INFO[chainId]?.filter((stakingRewardInfo) =>
            pairToFilterBy === undefined
              ? true
              : pairToFilterBy === null
              ? true
              : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
                pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1]),
          ) ?? []
        : [],
    [chainId, pairToFilterBy],
  );

  const uni = chainId ? UNI[chainId] : undefined;

  const rewardsAddresses = useMemo(
    () => info.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [info],
  );
  const pairAddresses = useMemo(() => info.map(({ pair }) => pair), [info]);

  useEffect(() => {
    getDualBulkPairData(pairAddresses);
  }, [pairAddresses]);

  const accountArg = useMemo(() => [account ?? undefined], [account]);

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_DUAL_REWARDS_INTERFACE,
    'balanceOf',
    accountArg,
  );
  const earnedAAmounts = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_DUAL_REWARDS_INTERFACE,
    'earnedA',
    accountArg,
  );
  const earnedBAmounts = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_DUAL_REWARDS_INTERFACE,
    'earnedB',
    accountArg,
  );
  const totalSupplies = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_DUAL_REWARDS_INTERFACE,
    'totalSupply',
  );

  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_DUAL_REWARDS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD,
  );
  const rewardRatesA = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_DUAL_REWARDS_INTERFACE,
    'rewardRateA',
    undefined,
    NEVER_RELOAD,
  );

  const rewardRatesB = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_DUAL_REWARDS_INTERFACE,
    'rewardRateB',
    undefined,
    NEVER_RELOAD,
  );

  return useMemo(() => {
    if (!chainId || !uni) return [];

    return rewardsAddresses.reduce<DualStakingInfo[]>(
      (memo, rewardsAddress, index) => {
        // these two are dependent on account
        const balanceState = balances[index];
        const earnedAAmountState = earnedAAmounts[index];
        const earnedBAmountState = earnedBAmounts[index];

        // these get fetched regardless of account
        const totalSupplyState = totalSupplies[index];
        const rewardRateAState = rewardRatesA[index];
        const rewardRateBState = rewardRatesB[index];
        const periodFinishState = periodFinishes[index];

        if (
          // these may be undefined if not logged in
          !balanceState?.loading &&
          !earnedAAmountState?.loading &&
          !earnedBAmountState?.loading &&
          // always need these
          totalSupplyState &&
          !totalSupplyState.loading &&
          rewardRateAState &&
          !rewardRateAState.loading &&
          rewardRateBState &&
          !rewardRateBState.loading &&
          periodFinishState &&
          !periodFinishState.loading
        ) {
          if (
            balanceState?.error ||
            earnedAAmountState?.error ||
            earnedBAmountState?.error ||
            totalSupplyState.error ||
            rewardRateAState.error ||
            rewardRateBState.error ||
            periodFinishState.error
          ) {
            console.error('Failed to load staking rewards info');
            return memo;
          }
          // get the LP token
          const tokens = info[index].tokens;
          const dummyPair = new Pair(
            new TokenAmount(tokens[0], '0'),
            new TokenAmount(tokens[1], '0'),
          );

          // check for account, if no account set to 0
          const lp = info[index].lp;
          const rateA = web3.utils.toWei(info[index].rateA.toString());
          const rateB = web3.utils.toWei(info[index].rateB.toString());
          const stakedAmount = new TokenAmount(
            lp && lp !== ''
              ? new Token(137, lp, 18, 'SLP', 'Staked LP')
              : dummyPair.liquidityToken,
            JSBI.BigInt(balanceState?.result?.[0] ?? 0),
          );
          const totalStakedAmount = new TokenAmount(
            lp && lp !== ''
              ? new Token(137, lp, 18, 'SLP', 'Staked LP')
              : dummyPair.liquidityToken,
            JSBI.BigInt(totalSupplyState.result?.[0]),
          );
          const totalRewardRateA = new TokenAmount(uni, JSBI.BigInt(rateA));
          const totalRewardRateB = new TokenAmount(uni, JSBI.BigInt(rateB));
          //const pair = info[index].pair.toLowerCase();
          //const fees = (pairData && pairData[pair] ? pairData[pair].oneDayVolumeUSD * 0.0025: 0);
          const totalRewardRateA01 = new TokenAmount(
            uni,
            JSBI.BigInt(rewardRateAState.result?.[0]),
          );
          const totalRewardRateB01 = new TokenAmount(
            uni,
            JSBI.BigInt(rewardRateBState.result?.[0]),
          );

          const getHypotheticalRewardRate = (
            stakedAmount: TokenAmount,
            totalStakedAmount: TokenAmount,
            totalRewardRate: TokenAmount,
          ): TokenAmount => {
            return new TokenAmount(
              uni,
              JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
                ? JSBI.divide(
                    JSBI.multiply(totalRewardRate.raw, stakedAmount.raw),
                    totalStakedAmount.raw,
                  )
                : JSBI.BigInt(0),
            );
          };

          const individualRewardRateA = getHypotheticalRewardRate(
            stakedAmount,
            totalStakedAmount,
            totalRewardRateA01,
          );
          const individualRewardRateB = getHypotheticalRewardRate(
            stakedAmount,
            totalStakedAmount,
            totalRewardRateB01,
          );

          const periodFinishMs = periodFinishState.result?.[0]
            ?.mul(1000)
            ?.toNumber();
          let oneYearFeeAPY = 0;
          let oneDayFee = 0;
          let accountFee = 0;
          if (dualPairs !== undefined) {
            oneYearFeeAPY = dualPairs[info[index].pair]?.oneDayVolumeUSD;

            if (oneYearFeeAPY) {
              const totalSupply = web3.utils.toWei(
                dualPairs[info[index].pair]?.totalSupply,
                'ether',
              );
              const ratio =
                Number(totalSupplyState.result?.[0].toString()) /
                Number(totalSupply);
              const myRatio =
                Number(balanceState?.result?.[0].toString()) /
                Number(totalSupplyState.result?.[0].toString());
              oneDayFee = oneYearFeeAPY * 0.003 * ratio;
              accountFee = oneDayFee * myRatio;
              oneYearFeeAPY =
                (oneYearFeeAPY * 0.003 * 365) /
                dualPairs[info[index].pair]?.reserveUSD;
              //console.log(info[index].pair, oneYearFeeAPY);
            }
          }

          memo.push({
            stakingRewardAddress: rewardsAddress,
            tokens: info[index].tokens,
            ended: info[index].ended,
            name: info[index].name,
            lp: info[index].lp,
            periodFinish:
              periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
            earnedAmountA: new TokenAmount(
              uni,
              JSBI.BigInt(earnedAAmountState?.result?.[0] ?? 0),
            ),
            earnedAmountB: new TokenAmount(
              uni,
              JSBI.BigInt(earnedBAmountState?.result?.[0] ?? 0),
            ),
            rewardRateA: individualRewardRateA,
            rewardRateB: individualRewardRateB,
            totalRewardRateA: totalRewardRateA,
            totalRewardRateB: totalRewardRateB,
            stakedAmount: stakedAmount,
            totalStakedAmount: totalStakedAmount,
            getHypotheticalRewardRate,
            baseToken: info[index].baseToken,
            pair: info[index].pair,
            quickPrice: quickPrice,
            maticPrice: maticPrice,
            rateA: info[index].rateA,
            rateB: info[index].rateB,
            oneYearFeeAPY: oneYearFeeAPY,
            oneDayFee,
            accountFee,
            rewardTokenA: info[index].rewardTokenA,
            rewardTokenB: info[index].rewardTokenB,
            rewardTokenBBase: info[index].rewardTokenBBase,
          });
        }
        return memo;
      },
      [],
    );
  }, [
    balances,
    chainId,
    earnedAAmounts,
    earnedBAmounts,
    info,
    periodFinishes,
    rewardsAddresses,
    totalSupplies,
    uni,
    quickPrice,
    maticPrice,
    rewardRatesA,
    rewardRatesB,
  ]);
}

export function useLairInfo(): LairInfo {
  const { account } = useActiveWeb3React();

  let accountArg = useMemo(() => [account ?? undefined], [account]);

  const inputs = ['1000000000000000000'];

  const lair = useLairContract();
  const quick = useQUICKContract();
  const [, quickUsdcPair] = usePair(QUICK, USDC);
  const quickPrice = Number(quickUsdcPair?.priceOf(QUICK)?.toSignificant(6));

  const dQuickToQuick = useSingleCallResult(lair, 'dQUICKForQUICK', inputs);
  const quickToDQuick = useSingleCallResult(lair, 'QUICKForDQUICK', inputs);

  const _dQuickTotalSupply = useSingleCallResult(lair, 'totalSupply', []);

  const quickBalance = useSingleCallResult(lair, 'QUICKBalance', accountArg);
  const dQuickBalance = useSingleCallResult(lair, 'balanceOf', accountArg);

  accountArg = [LAIR_ADDRESS ?? undefined];

  const lairsQuickBalance = useSingleCallResult(quick, 'balanceOf', accountArg);

  useEffect(() => {
    getOneDayVolume().then((data) => {
      console.log(data);
    });
  }, []);

  return useMemo(() => {
    return {
      lairAddress: LAIR_ADDRESS,
      dQUICKtoQUICK: new TokenAmount(
        QUICK,
        JSBI.BigInt(dQuickToQuick?.result?.[0] ?? 0),
      ),
      QUICKtodQUICK: new TokenAmount(
        DQUICK,
        JSBI.BigInt(quickToDQuick?.result?.[0] ?? 0),
      ),
      dQUICKBalance: new TokenAmount(
        DQUICK,
        JSBI.BigInt(dQuickBalance?.result?.[0] ?? 0),
      ),
      QUICKBalance: new TokenAmount(
        QUICK,
        JSBI.BigInt(quickBalance?.result?.[0] ?? 0),
      ),
      totalQuickBalance: new TokenAmount(
        QUICK,
        JSBI.BigInt(lairsQuickBalance?.result?.[0] ?? 0),
      ),
      quickPrice,
      dQuickTotalSupply: new TokenAmount(
        DQUICK,
        JSBI.BigInt(_dQuickTotalSupply?.result?.[0] ?? 0),
      ),
      oneDayVol: oneDayVol,
    };
  }, [
    dQuickToQuick,
    quickToDQuick,
    quickBalance,
    dQuickBalance,
    _dQuickTotalSupply,
    quickPrice,
    lairsQuickBalance,
  ]);
}

// export function useStakingInfos(): StakingInfo[] {
//   return useSelector((state: AppState) => state.stake.stakingInfo);
// }

// export function useSyrupInfos(): SyrupInfo[] {
//   return useSelector((state: AppState) => state.stake.syrupInfo);
// }

// gets the staking info from the network for the active chain id
export function useStakingInfo(pairToFilterBy?: Pair | null): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React();
  //const [quickPrice,setQuickPrice] = useState(0);
  const [, quickUsdcPair] = usePair(QUICK, USDC);
  const quickPrice = Number(quickUsdcPair?.priceOf(QUICK)?.toSignificant(6));
  const info = useMemo(
    () =>
      chainId
        ? STAKING_REWARDS_INFO[chainId]?.filter((stakingRewardInfo) =>
            pairToFilterBy === undefined
              ? true
              : pairToFilterBy === null
              ? true
              : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
                pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1]),
          ) ?? []
        : [],
    [chainId, pairToFilterBy],
  );

  const uni = chainId ? UNI[chainId] : undefined;

  const rewardsAddresses = useMemo(
    () => info.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [info],
  );
  const pairAddresses = useMemo(() => info.map(({ pair }) => pair), [info]);

  useEffect(() => {
    getBulkPairData(pairAddresses);
  }, [pairAddresses]);

  const lair = useLairContract();
  const args = useMemo(
    () => info.map(({ rate }) => [web3.utils.toWei(rate.toString(), 'ether')]),
    [info],
  );
  const accountArg = useMemo(() => [account ?? undefined], [account]);

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'balanceOf',
    accountArg,
  );
  const earnedAmounts = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'earned',
    accountArg,
  );
  const totalSupplies = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'totalSupply',
  );
  const dQuickToQuicks = useSingleContractMultipleData(
    lair,
    'dQUICKForQUICK',
    args,
  );

  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD,
  );
  const rewardRates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'rewardRate',
    undefined,
    NEVER_RELOAD,
  );

  return useMemo(() => {
    if (!chainId || !uni) return [];

    return rewardsAddresses.reduce<StakingInfo[]>(
      (memo, rewardsAddress, index) => {
        // these two are dependent on account
        const balanceState = balances[index];
        const dQuickToQuickState = dQuickToQuicks[index];
        const earnedAmountState = earnedAmounts[index];

        // these get fetched regardless of account
        const totalSupplyState = totalSupplies[index];
        const rewardRateState = rewardRates[index];
        const periodFinishState = periodFinishes[index];

        if (
          // these may be undefined if not logged in
          !dQuickToQuickState?.loading &&
          !balanceState?.loading &&
          !earnedAmountState?.loading &&
          // always need these
          totalSupplyState &&
          !totalSupplyState.loading &&
          rewardRateState &&
          !rewardRateState.loading &&
          periodFinishState &&
          !periodFinishState.loading
        ) {
          if (
            dQuickToQuickState?.error ||
            balanceState?.error ||
            earnedAmountState?.error ||
            totalSupplyState.error ||
            rewardRateState.error ||
            periodFinishState.error
          ) {
            console.error('Failed to load staking rewards info');
            return memo;
          }
          // get the LP token
          const tokens = info[index].tokens;
          const dummyPair = new Pair(
            new TokenAmount(tokens[0], '0'),
            new TokenAmount(tokens[1], '0'),
          );

          // check for account, if no account set to 0
          const lp = info[index].lp;
          const rate = web3.utils.toWei(info[index].rate.toString());
          const stakedAmount = new TokenAmount(
            lp && lp !== ''
              ? new Token(137, lp, 18, 'SLP', 'Staked LP')
              : dummyPair.liquidityToken,
            JSBI.BigInt(balanceState?.result?.[0] ?? 0),
          );
          const totalStakedAmount = new TokenAmount(
            lp && lp !== ''
              ? new Token(137, lp, 18, 'SLP', 'Staked LP')
              : dummyPair.liquidityToken,
            JSBI.BigInt(totalSupplyState.result?.[0]),
          );
          const totalRewardRate = new TokenAmount(uni, JSBI.BigInt(rate));
          //const pair = info[index].pair.toLowerCase();
          //const fees = (pairData && pairData[pair] ? pairData[pair].oneDayVolumeUSD * 0.0025: 0);
          const totalRewardRate01 = new TokenAmount(
            uni,
            JSBI.BigInt(rewardRateState.result?.[0]),
          );
          const getHypotheticalRewardRate = (
            stakedAmount: TokenAmount,
            totalStakedAmount: TokenAmount,
            totalRewardRate: TokenAmount,
          ): TokenAmount => {
            return new TokenAmount(
              uni,
              JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
                ? JSBI.divide(
                    JSBI.multiply(totalRewardRate01.raw, stakedAmount.raw),
                    totalStakedAmount.raw,
                  )
                : JSBI.BigInt(0),
            );
          };

          const individualRewardRate = getHypotheticalRewardRate(
            stakedAmount,
            totalStakedAmount,
            totalRewardRate01,
          );

          const periodFinishMs = periodFinishState.result?.[0]
            ?.mul(1000)
            ?.toNumber();
          let oneYearFeeAPY = 0;
          let oneDayFee = 0;
          let accountFee = 0;
          let dQuickToQuick: any = dQuickToQuickState?.result?.[0] ?? 0;

          dQuickToQuick = web3.utils.fromWei(dQuickToQuick.toString(), 'ether');
          if (pairs !== undefined) {
            oneYearFeeAPY = pairs[info[index].pair]?.oneDayVolumeUSD;

            if (oneYearFeeAPY) {
              const totalSupply = web3.utils.toWei(
                pairs[info[index].pair]?.totalSupply,
                'ether',
              );
              const ratio =
                Number(totalSupplyState.result?.[0].toString()) /
                Number(totalSupply);
              const myRatio =
                Number(balanceState?.result?.[0].toString()) /
                Number(totalSupplyState.result?.[0].toString());
              oneDayFee = oneYearFeeAPY * 0.003 * ratio;
              accountFee = oneDayFee * myRatio;
              oneYearFeeAPY =
                (oneYearFeeAPY * 0.003 * 365) /
                pairs[info[index].pair]?.reserveUSD;
              //console.log(info[index].pair, oneYearFeeAPY);
            }
          }

          memo.push({
            stakingRewardAddress: rewardsAddress,
            tokens: info[index].tokens,
            ended: info[index].ended,
            name: info[index].name,
            lp: info[index].lp,
            periodFinish:
              periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
            earnedAmount: new TokenAmount(
              uni,
              JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0),
            ),
            rewardRate: individualRewardRate,
            totalRewardRate: totalRewardRate,
            stakedAmount: stakedAmount,
            totalStakedAmount: totalStakedAmount,
            getHypotheticalRewardRate,
            baseToken: info[index].baseToken,
            pair: info[index].pair,
            quickPrice: quickPrice,
            rate: info[index].rate,
            oneYearFeeAPY: oneYearFeeAPY,
            oneDayFee,
            accountFee,
            dQuickToQuick: dQuickToQuick,
          });
        }
        return memo;
      },
      [],
    );
  }, [
    balances,
    chainId,
    earnedAmounts,
    info,
    periodFinishes,
    rewardsAddresses,
    totalSupplies,
    uni,
    quickPrice,
    rewardRates,
    dQuickToQuicks,
  ]);
}

// gets the staking info from the network for the active chain id
export function useVeryOldStakingInfo(
  pairToFilterBy?: Pair | null,
): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React();

  const info = useMemo(
    () =>
      chainId
        ? VERY_OLD_STAKING_REWARDS_INFO[chainId]?.filter((stakingRewardInfo) =>
            pairToFilterBy === undefined
              ? true
              : pairToFilterBy === null
              ? true
              : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
                pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1]),
          ) ?? []
        : [],
    [chainId, pairToFilterBy],
  );

  const uni = chainId ? UNI[chainId] : undefined;

  const rewardsAddresses = useMemo(
    () => info.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [info],
  );

  const accountArg = useMemo(() => [account ?? undefined], [account]);

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'balanceOf',
    accountArg,
  );
  const earnedAmounts = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'earned',
    accountArg,
  );
  const totalSupplies = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'totalSupply',
  );

  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD,
  );

  return useMemo(() => {
    if (!chainId || !uni) return [];

    return rewardsAddresses.reduce<StakingInfo[]>(
      (memo, rewardsAddress, index) => {
        // these two are dependent on account
        const balanceState = balances[index];
        const earnedAmountState = earnedAmounts[index];

        // these get fetched regardless of account
        const totalSupplyState = totalSupplies[index];
        const periodFinishState = periodFinishes[index];

        if (
          // these may be undefined if not logged in
          !balanceState?.loading &&
          !earnedAmountState?.loading &&
          // always need these
          totalSupplyState &&
          !totalSupplyState.loading &&
          periodFinishState &&
          !periodFinishState.loading
        ) {
          if (
            balanceState?.error ||
            earnedAmountState?.error ||
            totalSupplyState.error ||
            periodFinishState.error
          ) {
            console.error('Failed to load staking rewards info');
            return memo;
          }

          // get the LP token
          const tokens = info[index].tokens;
          const dummyPair = new Pair(
            new TokenAmount(tokens[0], '0'),
            new TokenAmount(tokens[1], '0'),
          );

          // check for account, if no account set to 0
          const lp = info[index].lp;

          const stakedAmount = new TokenAmount(
            lp && lp !== ''
              ? new Token(137, lp, 18, 'SLP', 'Staked LP')
              : dummyPair.liquidityToken,
            JSBI.BigInt(balanceState?.result?.[0] ?? 0),
          );
          const totalStakedAmount = new TokenAmount(
            lp && lp !== ''
              ? new Token(137, lp, 18, 'SLP', 'Staked LP')
              : dummyPair.liquidityToken,
            JSBI.BigInt(totalSupplyState.result?.[0]),
          );
          const totalRewardRate = new TokenAmount(uni, JSBI.BigInt(0));
          const getHypotheticalRewardRate = (
            stakedAmount: TokenAmount,
            totalStakedAmount: TokenAmount,
            totalRewardRate: TokenAmount,
          ): TokenAmount => {
            return new TokenAmount(
              uni,
              JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
                ? JSBI.divide(
                    JSBI.multiply(totalRewardRate.raw, stakedAmount.raw),
                    totalStakedAmount.raw,
                  )
                : JSBI.BigInt(0),
            );
          };

          const individualRewardRate = getHypotheticalRewardRate(
            stakedAmount,
            totalStakedAmount,
            totalRewardRate,
          );

          const periodFinishMs = periodFinishState.result?.[0]
            ?.mul(1000)
            ?.toNumber();

          memo.push({
            stakingRewardAddress: rewardsAddress,
            tokens: info[index].tokens,
            ended: info[index].ended,
            name: info[index].name,
            lp: info[index].lp,
            periodFinish:
              periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
            earnedAmount: new TokenAmount(
              uni,
              JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0),
            ),
            rewardRate: individualRewardRate,
            totalRewardRate: totalRewardRate,
            stakedAmount: stakedAmount,
            totalStakedAmount: totalStakedAmount,
            baseToken: info[index].baseToken,
            getHypotheticalRewardRate,
            pair: info[index].pair,
            quickPrice: 0,
            rate: info[index].rate,
            oneYearFeeAPY: 0,
            oneDayFee: 0,
            accountFee: 0,
            dQuickToQuick: 0,
          });
        }
        return memo;
      },
      [],
    );
  }, [
    balances,
    chainId,
    earnedAmounts,
    info,
    periodFinishes,
    rewardsAddresses,
    totalSupplies,
    uni,
  ]);
}

export function useOldStakingInfo(pairToFilterBy?: Pair | null): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React();

  const info = useMemo(
    () =>
      chainId
        ? OLD_STAKING_REWARDS_INFO[chainId]?.filter((stakingRewardInfo) =>
            pairToFilterBy === undefined
              ? true
              : pairToFilterBy === null
              ? true
              : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
                pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1]),
          ) ?? []
        : [],
    [chainId, pairToFilterBy],
  );

  const uni = chainId ? UNI[chainId] : undefined;

  const rewardsAddresses = useMemo(
    () => info.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [info],
  );

  const accountArg = useMemo(() => [account ?? undefined], [account]);

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'balanceOf',
    accountArg,
  );
  const earnedAmounts = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'earned',
    accountArg,
  );
  const totalSupplies = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'totalSupply',
  );

  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD,
  );

  return useMemo(() => {
    if (!chainId || !uni) return [];

    return rewardsAddresses.reduce<StakingInfo[]>(
      (memo, rewardsAddress, index) => {
        // these two are dependent on account
        const balanceState = balances[index];
        const earnedAmountState = earnedAmounts[index];

        // these get fetched regardless of account
        const totalSupplyState = totalSupplies[index];

        const periodFinishState = periodFinishes[index];

        if (
          // these may be undefined if not logged in
          !balanceState?.loading &&
          !earnedAmountState?.loading &&
          // always need these
          totalSupplyState &&
          !totalSupplyState.loading &&
          periodFinishState &&
          !periodFinishState.loading
        ) {
          if (
            balanceState?.error ||
            earnedAmountState?.error ||
            totalSupplyState.error ||
            periodFinishState.error
          ) {
            console.error('Failed to load staking rewards info');
            return memo;
          }

          // get the LP token
          const tokens = info[index].tokens;
          const dummyPair = new Pair(
            new TokenAmount(tokens[0], '0'),
            new TokenAmount(tokens[1], '0'),
          );

          // check for account, if no account set to 0
          const lp = info[index].lp;

          const stakedAmount = new TokenAmount(
            lp && lp !== ''
              ? new Token(137, lp, 18, 'SLP', 'Staked LP')
              : dummyPair.liquidityToken,
            JSBI.BigInt(balanceState?.result?.[0] ?? 0),
          );
          const totalStakedAmount = new TokenAmount(
            lp && lp !== ''
              ? new Token(137, lp, 18, 'SLP', 'Staked LP')
              : dummyPair.liquidityToken,
            JSBI.BigInt(totalSupplyState.result?.[0]),
          );
          const totalRewardRate = new TokenAmount(uni, JSBI.BigInt(0));

          const getHypotheticalRewardRate = (
            stakedAmount: TokenAmount,
            totalStakedAmount: TokenAmount,
            totalRewardRate: TokenAmount,
          ): TokenAmount => {
            return new TokenAmount(
              uni,
              JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
                ? JSBI.divide(
                    JSBI.multiply(totalRewardRate.raw, stakedAmount.raw),
                    totalStakedAmount.raw,
                  )
                : JSBI.BigInt(0),
            );
          };

          const individualRewardRate = getHypotheticalRewardRate(
            stakedAmount,
            totalStakedAmount,
            totalRewardRate,
          );

          const periodFinishMs = periodFinishState.result?.[0]
            ?.mul(1000)
            ?.toNumber();

          memo.push({
            stakingRewardAddress: rewardsAddress,
            tokens: info[index].tokens,
            ended: info[index].ended,
            name: info[index].name,
            lp: info[index].lp,
            periodFinish:
              periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
            earnedAmount: new TokenAmount(
              uni,
              JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0),
            ),
            rewardRate: individualRewardRate,
            totalRewardRate: totalRewardRate,
            stakedAmount: stakedAmount,
            totalStakedAmount: totalStakedAmount,
            baseToken: info[index].baseToken,
            getHypotheticalRewardRate,
            pair: info[index].pair,
            quickPrice: 0,
            rate: info[index].rate,
            oneYearFeeAPY: 0,
            oneDayFee: 0,
            accountFee: 0,
            dQuickToQuick: 0,
          });
        }
        return memo;
      },
      [],
    );
  }, [
    balances,
    chainId,
    earnedAmounts,
    info,
    periodFinishes,
    rewardsAddresses,
    totalSupplies,
    uni,
  ]);
}

export function useTotalUniEarned(): TokenAmount | undefined {
  const { chainId } = useActiveWeb3React();
  const uni = chainId ? UNI[chainId] : undefined;
  const newStakingInfos = useStakingInfo();
  const oldStakingInfos = useOldStakingInfo();
  const stakingInfos = newStakingInfos.concat(oldStakingInfos);

  return useMemo(() => {
    if (!uni) return undefined;
    return (
      stakingInfos?.reduce(
        (accumulator, stakingInfo) => accumulator.add(stakingInfo.earnedAmount),
        new TokenAmount(uni, '0'),
      ) ?? new TokenAmount(uni, '0')
    );
  }, [stakingInfos, uni]);
}

export function useDerivedSyrupInfo(
  typedValue: string,
  stakingToken: Token,
  userLiquidityUnstaked: TokenAmount | undefined,
): {
  parsedAmount?: CurrencyAmount;
  error?: string;
} {
  const { account } = useActiveWeb3React();

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(
    typedValue,
    stakingToken,
  );

  const parsedAmount =
    parsedInput &&
    userLiquidityUnstaked &&
    JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityUnstaked.raw)
      ? parsedInput
      : undefined;

  let error: string | undefined;
  if (!account) {
    error = 'Connect Wallet';
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount';
  }

  return {
    parsedAmount,
    error,
  };
}

// based on typed value
export function useDerivedStakeInfo(
  typedValue: string,
  stakingToken: Token,
  userLiquidityUnstaked: TokenAmount | undefined,
): {
  parsedAmount?: CurrencyAmount;
  error?: string;
} {
  const { account } = useActiveWeb3React();

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(
    typedValue,
    stakingToken,
  );

  const parsedAmount =
    parsedInput &&
    userLiquidityUnstaked &&
    JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityUnstaked.raw)
      ? parsedInput
      : undefined;

  let error: string | undefined;
  if (!account) {
    error = 'Connect Wallet';
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount';
  }

  return {
    parsedAmount,
    error,
  };
}

export function useDerivedLairInfo(
  typedValue: string,
  stakingToken: Token,
  userLiquidityUnstaked: TokenAmount | undefined,
): {
  parsedAmount?: CurrencyAmount;
  error?: string;
} {
  const { account } = useActiveWeb3React();

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(
    typedValue,
    stakingToken,
  );

  const parsedAmount =
    parsedInput &&
    userLiquidityUnstaked &&
    JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityUnstaked.raw)
      ? parsedInput
      : undefined;

  let error: string | undefined;
  if (!account) {
    error = 'Connect Wallet';
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount';
  }

  return {
    parsedAmount,
    error,
  };
}

// based on typed value
export function useDerivedUnstakeInfo(
  typedValue: string,
  stakingAmount: TokenAmount,
): {
  parsedAmount?: CurrencyAmount;
  error?: string;
} {
  const { account } = useActiveWeb3React();

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(
    typedValue,
    stakingAmount.token,
  );

  const parsedAmount =
    parsedInput && JSBI.lessThanOrEqual(parsedInput.raw, stakingAmount.raw)
      ? parsedInput
      : undefined;

  let error: string | undefined;
  if (!account) {
    error = 'Connect Wallet';
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount';
  }

  return {
    parsedAmount,
    error,
  };
}

// based on typed value
export function useDerivedUnstakeLairInfo(
  typedValue: string,
  stakingAmount: TokenAmount,
): {
  parsedAmount?: CurrencyAmount;
  error?: string;
} {
  const { account } = useActiveWeb3React();

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(
    typedValue,
    stakingAmount.token,
  );

  const parsedAmount =
    parsedInput && JSBI.lessThanOrEqual(parsedInput.raw, stakingAmount.raw)
      ? parsedInput
      : undefined;

  let error: string | undefined;
  if (!account) {
    error = 'Connect Wallet';
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount';
  }

  return {
    parsedAmount,
    error,
  };
}
