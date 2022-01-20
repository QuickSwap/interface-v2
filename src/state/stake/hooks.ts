import {
  ChainId,
  CurrencyAmount,
  JSBI,
  Token,
  TokenAmount,
  Price,
  Pair,
} from '@uniswap/sdk';
import { useMemo, useEffect /** , useState */ } from 'react';
import { usePair, usePairs } from 'data/Reserves';

import { client, healthClient } from 'apollo/client';
import {
  GLOBAL_DATA,
  PAIRS_BULK,
  PAIRS_HISTORICAL_BULK,
  SUBGRAPH_HEALTH,
} from 'apollo/queries';
import { GlobalConst, GlobalData } from 'constants/index';
import {
  STAKING_REWARDS_INTERFACE,
  STAKING_DUAL_REWARDS_INTERFACE,
} from 'constants/abis/staking-rewards';
import { useActiveWeb3React } from 'hooks';
import {
  NEVER_RELOAD,
  useMultipleContractSingleData,
  useSingleCallResult,
  useSingleContractMultipleData,
} from 'state/multicall/hooks';
import { tryParseAmount } from 'state/swap/hooks';
import Web3 from 'web3';
import { useLairContract, useQUICKContract } from 'hooks/useContract';
import useUSDCPrice, { useUSDCPrices } from 'utils/useUSDCPrice';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { useTotalSupplys } from 'data/TotalSupply';
import { getOneYearFee, returnTokenFromKey } from 'utils';

const web3 = new Web3('https://polygon-rpc.com/');

export const STAKING_GENESIS = 1620842940;

export const REWARDS_DURATION_DAYS = 7;

let pairs: any = undefined;

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
      token: returnTokenFromKey('PSP'),
      stakingRewardAddress: '0xdcbDa338D12DBc823d0D484e7206E9AA55eeD844',
      ended: false,
      lp: '',
      name: '',
      baseToken: GlobalData.tokens.MATIC,
      rate: 5555.55,
      ending: 1649254544,
    },
    {
      token: returnTokenFromKey('CLAM2'),
      stakingRewardAddress: '0xb510935f4D67E27a11cD94E81bF0C465ee2a5509',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('MI'),
      rate: 83.33,
      ending: 1643900469,
    },
    {
      token: returnTokenFromKey('BLANK'),
      stakingRewardAddress: '0x5d6a48AF1a102CC9CD278fBd56b1Bdc833EeA1d0',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 2033,
      ending: 1646492469,
    },
    {
      token: returnTokenFromKey('WELT'),
      stakingRewardAddress: '0x7AB75F4e332Ea4410Dc46f644D9cCACC165581d8',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 20833.33,
      ending: 1643474718,
    },
    {
      token: returnTokenFromKey('MASQ'),
      stakingRewardAddress: '0x214758F370F7A7C802Ed64A91898e12c48aAAC67',
      ended: false,
      lp: '',
      name: '',
      baseToken: GlobalData.tokens.MATIC,
      rate: 6796.6,
      ending: 1646066718,
    },
    {
      token: returnTokenFromKey('SNE'),
      stakingRewardAddress: '0xf6Fe46F0001FDeFAde6b5E08635ED303f2E0a3aA',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 160000,
      ending: 1643302635,
    },
    {
      token: returnTokenFromKey('POLYPUG'),
      stakingRewardAddress: '0xA206A97b30343a0802553dB48d71af349AbF563A',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 177781944.44,
      ending: 1648223825,
    },
    {
      token: returnTokenFromKey('EGG'),
      stakingRewardAddress: '0x87C114Ca118987549e31f5023DfFF42041e446e4',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDT'),
      rate: 3.99,
      ending: 1645631825,
    },
    {
      token: returnTokenFromKey('PBR'),
      stakingRewardAddress: '0xa751f7B39F6c111d10e2C603bE2a12bd5F70Fc83',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDT'),
      rate: 1333.333333,
      ending: 1642697231,
    },
    {
      token: returnTokenFromKey('GAMER'),
      stakingRewardAddress: '0x35F1962fec6B4605ef3Be3b63396552fbf5e99d0',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 1250,
      ending: 1645289231,
    },
    {
      token: returnTokenFromKey('GNS'),
      stakingRewardAddress: '0xF5F645A01A4a7f874C15eC7F7Baa7221a71C180d',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('DAI'),
      rate: 833.3333333,
      ending: 1645289231,
    },
    {
      token: returnTokenFromKey('MM'),
      stakingRewardAddress: '0xB224d9F687538a2FAF8964DcAabb71bFe627Aee0',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 66.66666667,
      ending: 1644296104,
    },
    {
      token: returnTokenFromKey('ZIG'),
      stakingRewardAddress: '0xfE6174429a963bF4E25a80FE0B72d7Cce7Df6e2f',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 37037.03333,
      ending: 1646888104,
    },
    {
      token: returnTokenFromKey('TECH'),
      stakingRewardAddress: '0xD2C494057f57D845C67bb5825e83B657204875c8',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 40610.66,
      ending: 1644090690,
    },
    {
      token: returnTokenFromKey('WSG'),
      stakingRewardAddress: '0x2b91d985AEb645cc580E35BdF52DF2694e742ADF',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 41347011961.97,
      ending: 1643077140,
    },
    {
      token: returnTokenFromKey('DERC'),
      stakingRewardAddress: '0xE800041A775D269e1cD38261B4500b0D8F0e9916',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 777.78,
      ending: 1645669140,
    },
    {
      token: returnTokenFromKey('LMT'),
      stakingRewardAddress: '0x14902868ff379B89BaC6B6C47dcE06769A549Bfb',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 9222.22,
      ending: 1644944188,
    },
    {
      token: returnTokenFromKey('PNT'),
      stakingRewardAddress: '0x396dFF9c3DA3E0ACe3BB8F0635de5a693f990664',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 1500,
      ending: 1642352188,
    },
    {
      token: returnTokenFromKey('UM'),
      stakingRewardAddress: '0x1e027abDD77f8A93Cf58982b9878702d14941c56',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 16666.68,
      ending: 1642241616,
    },
    {
      token: returnTokenFromKey('ELON'),
      stakingRewardAddress: '0x0D0dD9b1f34101AF5Def323725a2e8a0C2Ba91Fc',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 4878682189.7,
      ending: 1643651726,
    },
    {
      token: returnTokenFromKey('DES'),
      stakingRewardAddress: '0xe436235f6062Eb689Ce81e5f434A005818F7d6f0',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 3858,
      ending: 1642525260,
    },
    {
      token: GlobalData.tokens.MATIC,
      stakingRewardAddress: '0xd6Ce4f3D692C1c6684fb449993414C5c9E5D0073',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 1913.43,
      ending: 1641845720,
    },
    {
      token: returnTokenFromKey('TEL'),
      stakingRewardAddress: '0x346C9e501aDc38F1f325CC0c2D44C325283eEaF1',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 333333.33,
      ending: 1645439402,
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
      token: returnTokenFromKey('COMBO'),
      stakingRewardAddress: '0xFAcba3A45354f27442406Df293D9C68FD8f0A8b1',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 8484.44,
      ending: 1641401056,
    },
    {
      token: returnTokenFromKey('GMEE'),
      stakingRewardAddress: '0xA0532E8c435437fE2473b84467ea79ab200f594c',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 15555.56,
      ending: 1641401056,
    },
    {
      token: returnTokenFromKey('UFI'),
      stakingRewardAddress: '0xE707bB8513873c2360811F01BfBd0e9EBFd96b0D',
      ended: true,
      lp: '',
      name: '',
      baseToken: GlobalData.tokens.MATIC,
      rate: 18315,
      ending: 1640485140,
    },
    {
      token: returnTokenFromKey('UCO'),
      stakingRewardAddress: '0xC328d6eC46d11a6ABdA3C02434861beA14739E1f',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 13833.33,
      ending: 1639933260,
    },
    {
      token: returnTokenFromKey('XCAD'),
      stakingRewardAddress: '0xbdF64bf352D1291587b09a28984eE06d3b6538eE',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 1300,
      ending: 1639844474,
    },
    {
      token: returnTokenFromKey('ETHA'),
      stakingRewardAddress: '0x2b1F043c8c97a6465F5B5A9E3F7027acb32CDC3b',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 7496.53,
      ending: 1639844474,
    },
    {
      token: returnTokenFromKey('CNTR'),
      stakingRewardAddress: '0xe59C2f9a2dCe18C6e19d63675e56BabA59a2339F',
      ended: true,
      lp: '',
      name: '',
      baseToken: GlobalData.tokens.MATIC,
      rate: 617283.95,
      ending: 1639844474,
    },
    {
      token: returnTokenFromKey('PERA'),
      stakingRewardAddress: '0xcA5b75C40583124DD08e7dF9cB148C0833418Fa8',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 8333.33,
      ending: 1639844474,
    },
    {
      token: returnTokenFromKey('RAMP'),
      stakingRewardAddress: '0x0a727387f3FF6d2203ECe6CB6e430E4e25032bcd',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 8128.1,
      ending: 1639844474,
    },
    {
      token: returnTokenFromKey('EROWAN'),
      stakingRewardAddress: '0x555670a51B56a310bcC71D55D96366F7B1ba1295',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 21891.67,
      ending: 1639844474,
    },
    {
      token: returnTokenFromKey('XCASH'),
      stakingRewardAddress: '0xe01e81c76253831602520582793991650225Bf81',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 27777777.78,
      ending: 1639408820,
    },
    {
      token: returnTokenFromKey('MCASH'),
      stakingRewardAddress: '0xb3DacE74b857C7b0F0890334B8E4770762Bcda5c',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 18333.33,
      ending: 1639241173,
    },
    {
      token: returnTokenFromKey('ALN'),
      stakingRewardAddress: '0x568E635426804400f306c6D3Ec56D14782D74261',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 18333.33,
      ending: 1639241173,
    },
    {
      token: returnTokenFromKey('WATCH'),
      stakingRewardAddress: '0x0B2b63500243FF87B1299A56094b76c7Db8A4087',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 3333.33,
      ending: 1639073521,
    },
    {
      token: returnTokenFromKey('KNIGHT'),
      stakingRewardAddress: '0xCAdfDB2077c32e04a5B78cbECA6de84B1694325c',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 2166.67,
      ending: 1639073521,
    },
    {
      token: returnTokenFromKey('PHX'),
      stakingRewardAddress: '0xcE4c95014Bd54B1D3ff30dbb585009aDf7358b0b',
      ended: true,
      lp: '',
      name: '',
      baseToken: GlobalData.tokens.MATIC,
      rate: 12000,
      ending: 1638027392,
    },
    {
      token: returnTokenFromKey('REI'),
      stakingRewardAddress: '0xc9097837c52f0e9785539BD2d265df7fA890cb1A',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 5127.75,
      ending: 1638027392,
    },
    {
      token: returnTokenFromKey('MITX'),
      stakingRewardAddress: '0xBBD9146D2A687C0df7e6201D7b8cc4cebc5DF976',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 29609.1,
      ending: 1637513623,
    },
    {
      token: returnTokenFromKey('D11'),
      stakingRewardAddress: '0xc7E4C8024c580f2a7889b369Ea02957BcAC05b79',
      ended: true,
      lp: '',
      name: '',
      baseToken: GlobalData.tokens.MATIC,
      rate: 728.6,
      ending: 1637341260,
    },
    {
      token: returnTokenFromKey('OM'),
      stakingRewardAddress: '0x304cd598F973208888e959D7f808052Ab863A7eA',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 15833.33,
      ending: 1637076798,
    },
    {
      token: returnTokenFromKey('ELET'),
      stakingRewardAddress: '0x18e23130973AA586652BB6d472f0eEf05a88fD3E',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 83333.33,
      ending: 1637076798,
    },
    {
      token: returnTokenFromKey('ODDZ'),
      stakingRewardAddress: '0x8DBa41FD5aDD941825f96a33b58d3242db7b918f',
      ended: true,
      lp: '',
      name: '',
      baseToken: GlobalData.tokens.MATIC,
      rate: 4065.05,
      ending: 1637076798,
    },
    {
      token: returnTokenFromKey('TCP'),
      stakingRewardAddress: '0x6d05D7aC6CC4b8A5552CF26cA04583c95e2F2b98',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 17475.7,
      ending: 1636816820,
    },
    {
      token: returnTokenFromKey('MEEB'),
      stakingRewardAddress: '0x639F9394Ca689824ABE4e3d4D6acdB726f4a54F0',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 166.67,
      ending: 1636816820,
    },
    {
      token: returnTokenFromKey('PLR'),
      stakingRewardAddress: '0x6E0635d3a2c76b38B69aB8Ef3c1a970D9e3475Fc',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 38402,
      ending: 1636390770,
    },
    {
      token: returnTokenFromKey('KOM'),
      stakingRewardAddress: '0x3B1ed79d61d13Ea50863c0667BAb5Da335feeD0b',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 1000000,
      ending: 1636390770,
    },
    {
      token: returnTokenFromKey('ANGEL'),
      stakingRewardAddress: '0x1D68F94a1c56ef1706cf2BB66F671E3830B3B0bA',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 6666.67,
      ending: 1635960912,
    },
    {
      token: returnTokenFromKey('TRADE'),
      stakingRewardAddress: '0x9f48eB6E139855ebc89de973ea91c7596583E6Bc',
      ended: true,
      lp: '',
      name: '',
      baseToken: GlobalData.tokens.MATIC,
      rate: 2458,
      ending: 1636117833,
    },
    {
      token: returnTokenFromKey('MASK'),
      stakingRewardAddress: '0x15cB4132e4438F11fde5199aC6aE15881f1C1456',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 641.03,
      ending: 1635858286,
    },
    {
      token: returnTokenFromKey('SWAP'),
      stakingRewardAddress: '0xf2717feF528DF66450511F869517086c26452De7',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 3133.33,
      ending: 1635700624,
    },
    {
      token: returnTokenFromKey('BUNNY'),
      stakingRewardAddress: '0x12388Ea2585cf0F69Fea6A09763A6a3B0fB30257',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 874.49,
      ending: 1635700624,
    },
    {
      token: returnTokenFromKey('MONA'),
      stakingRewardAddress: '0xDa8805782Fa38f859b7D0001bedfE498faFca94a',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 1.52,
      ending: 1635263542,
    },
    {
      token: returnTokenFromKey('OOE'),
      stakingRewardAddress: '0xa5ce7598af3F76c3A254CDDc62f914bBa9d8B7bd',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 2166.66,
      ending: 1635095958,
    },
    {
      token: returnTokenFromKey('XED'),
      stakingRewardAddress: '0xaD1862888d33F2EA8d4E5025e5fe01916f01b856',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 3030.3,
      ending: 1635095958,
    },
    {
      token: returnTokenFromKey('DHV'),
      stakingRewardAddress: '0xAb226093369B3D45209D84fb891397d418CaEe68',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 555.55,
      ending: 1635263542,
    },
    {
      token: returnTokenFromKey('MOONED'),
      stakingRewardAddress: '0xd66Df9f7Da33C90Ab21601349D5f44eCbB4a1e63',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 27333.33,
      ending: 1635263542,
    },
    {
      token: returnTokenFromKey('HONOR'),
      stakingRewardAddress: '0x1EFcD619455419ebE566eDFe0D46DC57139f052F',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 75757.57,
      ending: 1634921623,
    },
    {
      token: returnTokenFromKey('START'),
      stakingRewardAddress: '0xBC00cF775D78b50925895A872Aa945B728dB0EBB',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 116.67,
      ending: 1634680134,
    },
    {
      token: returnTokenFromKey('RELAY'),
      stakingRewardAddress: '0x747fC94E52ba06D870Cb793e11C98D7688b28887',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 500,
      ending: 1634680134,
    },
    {
      token: returnTokenFromKey('DNXC'),
      stakingRewardAddress: '0x476231Ca1c748fd84e5c759a03F6FB0852fA110B',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 4800,
      ending: 1634680134,
    },
    {
      token: returnTokenFromKey('REVV'),
      stakingRewardAddress: '0xBDeaCb01103C6459ED05c4836082b41143825F49',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 16816.67,
      ending: 1634680134,
    },
    {
      token: returnTokenFromKey('YAMP'),
      stakingRewardAddress: '0x88A989A72fF3981cE02cE3CB5ec81A23C1058382',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 9333.33,
      ending: 1634680134,
    },
    {
      token: returnTokenFromKey('FEAR'),
      stakingRewardAddress: '0x886d5186Be0255ed4b7DAcB4c493aF6f8cD1ed04',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 1157,
      ending: 1634680134,
    },
    {
      token: returnTokenFromKey('CHICK'),
      stakingRewardAddress: '0xBe35a3238bd6fdde7a7749CB8702d5f17217c1a5',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 3333.33,
      ending: 1634680134,
    },
    {
      token: returnTokenFromKey('ADS'),
      stakingRewardAddress: '0xC6b141B27c82d6DB104440edE21d4F8E046B6Aa2',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 2150,
      ending: 1634680134,
    },
    {
      token: returnTokenFromKey('CIOTX'),
      stakingRewardAddress: '0x54B1e1A8F2472230DB6092833249675Fc2E8DFe1',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 16666.67,
      ending: 1634680134,
    },
    {
      token: returnTokenFromKey('ADDY'),
      stakingRewardAddress: '0x3429f08D507EfBcA7B41BC0F99e9276918495F97',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 59.5,
      ending: 1634680134,
    },
    {
      token: returnTokenFromKey('POLYDOGE'),
      stakingRewardAddress: '0x0b32AC0A9b6bfdd0E24cd2f4d37d82F8d05B44d8',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 333333333333.33,
      ending: 1634410234,
    },
    {
      token: returnTokenFromKey('ANRX'),
      stakingRewardAddress: '0xfd0A00b0B9b2D05fa4152Ebd25cD85a4F527B375',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 17768.33,
      ending: 1634317059,
    },
    {
      token: returnTokenFromKey('GUARD'),
      stakingRewardAddress: '0x4D1677B68C33a0e4002c0B54e15E599F287185A4',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 3333.33,
      ending: 1634224820,
    },
    {
      token: returnTokenFromKey('WOW'),
      stakingRewardAddress: '0xb13dCB81D1f0b42aA682c0Fb5A5262D89bc509aC',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
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
      tokens: [GlobalData.tokens.MATIC, returnTokenFromKey('ETHER')],
      stakingRewardAddress: '0x3c1f53fed2238176419F8f897aEc8791C499e3c8',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rewardTokenA: returnTokenFromKey('DQUICK'),
      rewardTokenB: GlobalData.tokens.MATIC,
      rewardTokenBBase: returnTokenFromKey('USDC'),
      rateA: 33.48,
      rateB: 1000,
      pair: '0xadbf1854e5883eb8aa7baf50705338739e558e5b',
    },
    {
      tokens: [GlobalData.tokens.MATIC, returnTokenFromKey('USDC')],
      stakingRewardAddress: '0x14977e7E263FF79c4c3159F497D9551fbE769625',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rewardTokenA: returnTokenFromKey('DQUICK'),
      rewardTokenB: GlobalData.tokens.MATIC,
      rewardTokenBBase: returnTokenFromKey('USDC'),
      rateA: 14.136,
      rateB: 600,
      pair: '0x6e7a5fafcec6bb1e78bae2a1f0b612012bf14827',
    },
    {
      tokens: [GlobalData.tokens.MATIC, returnTokenFromKey('QUICK')],
      stakingRewardAddress: '0xd26E16f5a9dfb9Fe32dB7F6386402B8AAe1a5dd7',
      ended: false,
      lp: '',
      name: '',
      baseToken: GlobalData.tokens.MATIC,
      rewardTokenA: returnTokenFromKey('DQUICK'),
      rewardTokenB: GlobalData.tokens.MATIC,
      rewardTokenBBase: returnTokenFromKey('USDC'),
      rateA: 11.904,
      rateB: 100,
      pair: '0x019ba0325f1988213d448b3472fa1cf8d07618d7',
    },
    {
      tokens: [GlobalData.tokens.MATIC, returnTokenFromKey('USDT')],
      stakingRewardAddress: '0xc0eb5d1316b835F4B584B59f922d9c87cA5053E5',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDT'),
      rewardTokenA: returnTokenFromKey('DQUICK'),
      rewardTokenB: GlobalData.tokens.MATIC,
      rewardTokenBBase: returnTokenFromKey('USDC'),
      rateA: 5.952,
      rateB: 300,
      pair: '0x604229c960e5cacf2aaeac8be68ac07ba9df81c3',
    },
    {
      tokens: [returnTokenFromKey('KIRO'), GlobalData.tokens.MATIC],
      stakingRewardAddress: '0xfF22Bf1f778BcD6741D823b077285533EC582F78',
      ended: false,
      lp: '',
      name: '',
      baseToken: GlobalData.tokens.MATIC,
      rewardTokenA: returnTokenFromKey('DQUICK'),
      rewardTokenB: returnTokenFromKey('KIRO'),
      rewardTokenBBase: GlobalData.tokens.MATIC,
      rateA: 2.232,
      rateB: 20000,
      pair: '0x3f245c6f18442bd6198d964c567a01bd4202e290',
    },
    {
      tokens: [returnTokenFromKey('GENESIS'), returnTokenFromKey('QUICK')],
      stakingRewardAddress: '0x3620418dD43853c35fF8Df90cAb5508FB5df46Bf',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rewardTokenA: returnTokenFromKey('DQUICK'),
      rewardTokenB: returnTokenFromKey('GENESIS'),
      rewardTokenBBase: returnTokenFromKey('QUICK'),
      rateA: 1.488,
      rateB: 25000,
      pair: '0xf0696be85fa54f7a8c9f20aa98aa4409cd5c9d1b',
    },
    {
      tokens: [returnTokenFromKey('FODL'), GlobalData.tokens.MATIC],
      stakingRewardAddress: '0x75CA5C33ed96222ddE8488C385E823852161d44a',
      ended: false,
      lp: '',
      name: '',
      baseToken: GlobalData.tokens.MATIC,
      rewardTokenA: returnTokenFromKey('DQUICK'),
      rewardTokenB: returnTokenFromKey('FODL'),
      rewardTokenBBase: GlobalData.tokens.MATIC,
      rateA: 3.72,
      rateB: 14000,
      pair: '0x2fc4dfcee8c331d54341f5668a6d9bcdd86f8e2f',
    },
    {
      tokens: [returnTokenFromKey('PSP'), GlobalData.tokens.MATIC],
      stakingRewardAddress: '0x64D2B3994F64E3E82E48CC92e1122489e88e8727',
      ended: false,
      lp: '',
      name: '',
      baseToken: GlobalData.tokens.MATIC,
      rewardTokenA: returnTokenFromKey('DQUICK'),
      rewardTokenB: returnTokenFromKey('PSP'),
      rewardTokenBBase: GlobalData.tokens.MATIC,
      rateA: 5.208,
      rateB: 22223,
      pair: '0x7afc060acca7ec6985d982dd85cc62b111cac7a7',
    },
    {
      tokens: [returnTokenFromKey('QUICK'), returnTokenFromKey('TEL')],
      stakingRewardAddress: '0xF8bdC7bC282847EeB5d4291ec79172B48526e9dE',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rewardTokenA: returnTokenFromKey('DQUICK'),
      rewardTokenB: returnTokenFromKey('TEL'),
      rewardTokenBBase: returnTokenFromKey('QUICK'),
      rateA: 5.9534,
      rateB: 238095.24,
      pair: '0xe88e24f49338f974b528ace10350ac4576c5c8a1',
    },
    {
      tokens: [returnTokenFromKey('TEL'), returnTokenFromKey('ETHER')],
      stakingRewardAddress: '0xEda437364DCF8AB00f07b49bCc213CDf356b3962',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rewardTokenA: returnTokenFromKey('DQUICK'),
      rewardTokenB: returnTokenFromKey('TEL'),
      rewardTokenBBase: returnTokenFromKey('QUICK'),
      rateB: 148809.52,
      rateA: 5.209225,
      pair: '0xfc2fc983a411c4b1e238f7eb949308cf0218c750',
    },
    {
      tokens: [returnTokenFromKey('TEL'), returnTokenFromKey('USDC')],
      stakingRewardAddress: '0x84B3c86D660D680847258Fd20aAA1274Cc35EAcd',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rewardTokenA: returnTokenFromKey('DQUICK'),
      rewardTokenB: returnTokenFromKey('TEL'),
      rewardTokenBBase: returnTokenFromKey('QUICK'),
      rateB: 238095.24,
      rateA: 3.720875,
      pair: '0xa5cabfc725dfa129f618d527e93702d10412f039',
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
      tokens: [returnTokenFromKey('ETHER'), returnTokenFromKey('USDC')],
      stakingRewardAddress: '0xbB703E95348424FF9e94fbE4FB524f6d280331B8',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 29.016,
      pair: '0x853ee4b2a13f8a742d64c8f088be7ba2131f670d',
    },
    {
      tokens: [returnTokenFromKey('WBTC'), returnTokenFromKey('ETHER')],
      stakingRewardAddress: '0x2972175e1a35C403B5596354D6459C34Ae6A1070',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 11.904,
      pair: '0xdc9232e2df177d7a12fdff6ecbab114e2231198d',
    },
    {
      tokens: [returnTokenFromKey('ETHER'), returnTokenFromKey('USDT')],
      stakingRewardAddress: '0x45a5CB25F3E3bFEe615F6da0731740093F59b768',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 9.672,
      pair: '0xf6422b997c7f54d1c6a6e103bcb1499eea0a7046',
    },
    {
      tokens: [returnTokenFromKey('ETHER'), returnTokenFromKey('QUICK')],
      stakingRewardAddress: '0x5BcFcc24Db0A16b1C01BAC1342662eBd104e816c',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 7.44,
      pair: '0x1bd06b96dd42ada85fdd0795f3b4a79db914add5',
    },
    {
      tokens: [returnTokenFromKey('AAVE'), returnTokenFromKey('ETHER')],
      stakingRewardAddress: '0x9891548FB271C2350bd0FA25eb56A3b558cD4A64',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 6.696,
      pair: '0x90bc3e68ba8393a3bf2d79309365089975341a43',
    },
    {
      tokens: [returnTokenFromKey('DAI'), returnTokenFromKey('ETHER')],
      stakingRewardAddress: '0x8d6b2dBa9e85b897Dc97eD262C1aa3e4D76477dF',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('DAI'),
      rate: 6.696,
      pair: '0x4a35582a710e1f4b2030a3f826da20bfb6703c09',
    },
    {
      tokens: [returnTokenFromKey('DERC'), returnTokenFromKey('USDC')],
      stakingRewardAddress: '0xaBECe67c01cd2E8ecBFaA311bd08EC299dA03629',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 4.464,
      pair: '0x0a8a3cb9a21c893a207826e76125ef6faaad99ec',
    },
    {
      tokens: [returnTokenFromKey('WBTC'), returnTokenFromKey('USDC')],
      stakingRewardAddress: '0xBF0b0DEF82C1D473e6B8770458Ddc82f5C8C7504',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 4.464,
      pair: '0xf6a637525402643b0654a54bead2cb9a83c8b498',
    },
    {
      tokens: [returnTokenFromKey('USDC'), returnTokenFromKey('QUICK')],
      stakingRewardAddress: '0x939290Ed45514E82900BA767bBcfa38eE1067039',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 4.464,
      pair: '0x1f1e4c845183ef6d50e9609f16f6f9cae43bc9cb',
    },
    {
      tokens: [returnTokenFromKey('MSHEESHA'), returnTokenFromKey('USDT')],
      stakingRewardAddress: '0xD415D602216ca8ab12128288A76c6c5585eE030D',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDT'),
      rate: 4.464,
      pair: '0xf64d2b41ca5392ec86d519d616603d2bb85b2a5d',
    },
    {
      tokens: [returnTokenFromKey('UST'), GlobalData.tokens.MATIC],
      stakingRewardAddress: '0x03E215DeA6227af79FF4fEf1be4a7F1198ca43B7',
      ended: false,
      lp: '',
      name: '',
      baseToken: GlobalData.tokens.MATIC,
      rate: 4.464,
      pair: '0x9b7e966fe005d616b5560e4baa7cfa8747d6cbb9',
    },
    {
      tokens: [returnTokenFromKey('MI'), returnTokenFromKey('USDT')],
      stakingRewardAddress: '0x06e49078b1900A8489462Cd2355ED8c09f507499',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDT'),
      rate: 3.72,
      pair: '0xe89fae1b4ada2c869f05a0c96c87022dadc7709a',
    },
    {
      tokens: [returnTokenFromKey('MI'), returnTokenFromKey('DAI')],
      stakingRewardAddress: '0xb827B23e2276ceB912CB42088ab064800447c158',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('DAI'),
      rate: 3.72,
      pair: '0x74214f5d8aa71b8dc921d8a963a1ba3605050781',
    },
    {
      tokens: [returnTokenFromKey('USDC'), returnTokenFromKey('USDT')],
      stakingRewardAddress: '0xAFB76771C98351Aa7fCA13B130c9972181612b54',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 3.72,
      pair: '0x2cf7252e74036d1da831d11089d326296e64a728',
    },
    {
      tokens: [returnTokenFromKey('GNS'), returnTokenFromKey('DAI')],
      stakingRewardAddress: '0x33025b177A35F6275b78f9c25684273fc24B4e43',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('DAI'),
      rate: 3.72,
      pair: '0x6e53cb6942e518376e9e763554db1a45ddcd25c4',
    },
    {
      tokens: [returnTokenFromKey('POLYPUG'), returnTokenFromKey('QUICK')],
      stakingRewardAddress: '0xF423bA7C64b70F5D80F5E8046Df68213BCFa0d86',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 3.72,
      pair: '0x24324614b4305cf878cc967bef23af0f539b7701',
    },
    {
      tokens: [returnTokenFromKey('ORBS'), returnTokenFromKey('USDC')],
      stakingRewardAddress: '0x9CA237962823A0a74bbC8354764e1DAC9e4057F0',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 3.72,
      pair: '0xb2b6d423e535b57aad06e9866803b95fb66152ea',
    },
    {
      tokens: [returnTokenFromKey('LINK'), returnTokenFromKey('ETHER')],
      stakingRewardAddress: '0x1b077a0586b2ABD4062a39E6368E256dB2F723c4',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 2.976,
      pair: '0x5ca6ca6c3709e1e6cfe74a50cf6b2b6ba2dadd67',
    },
    {
      tokens: [returnTokenFromKey('LMT'), returnTokenFromKey('ETHER')],
      stakingRewardAddress: '0x0997BA719cdF1F216d8A14b52AD3355Bd2F9f477',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 2.976,
      pair: '0x82ee4008e2de03f3a3e25434506f0d4d423afaad',
    },
    {
      tokens: [returnTokenFromKey('WSG'), returnTokenFromKey('QUICK')],
      stakingRewardAddress: '0x3f7D24d2157d114366f96ddA987448Ebf50a0D09',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 2.976,
      pair: '0xaddd6bed667c361087a97b34b1a0da4e0d0131ed',
    },
    {
      tokens: [returnTokenFromKey('MASQ'), GlobalData.tokens.MATIC],
      stakingRewardAddress: '0x2637305CA186ce8763469C4CdD6570a2eA544a26',
      ended: false,
      lp: '',
      name: '',
      baseToken: GlobalData.tokens.MATIC,
      rate: 2.976,
      pair: '0xb5a7c572741d77f34d2096f928beb6168f31a621',
    },
    {
      tokens: [returnTokenFromKey('CLAM2'), returnTokenFromKey('MI')],
      stakingRewardAddress: '0x0A1Fddba82A78aEE9652971D12eE91b41D8C3dEB',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('MI'),
      rate: 2.976,
      pair: '0x1581802317f32a2665005109444233ca6e3e2d68',
    },
    {
      tokens: [returnTokenFromKey('EGG'), returnTokenFromKey('USDT')],
      stakingRewardAddress: '0x87DBeEdc8773e0D9294443fE2c54Cb2d3d4690d6',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDT'),
      rate: 2.976,
      pair: '0x76db81e10af2dd38258b08129238cd2cf3cb3300',
    },
    {
      tokens: [returnTokenFromKey('SAND'), GlobalData.tokens.MATIC],
      stakingRewardAddress: '0x411b772B9eb19a33E7af5fCD9B1629D2015DC886',
      ended: false,
      lp: '',
      name: '',
      baseToken: GlobalData.tokens.MATIC,
      rate: 2.232,
      pair: '0x369582d2010b6ed950b571f4101e3bb9b554876f',
    },
    {
      tokens: [returnTokenFromKey('PECO'), GlobalData.tokens.MATIC],
      stakingRewardAddress: '0x27b3f4e93b7dCE173F682E760F492665e7f15Ad9',
      ended: false,
      lp: '',
      name: '',
      baseToken: GlobalData.tokens.MATIC,
      rate: 2.232,
      pair: '0xc2ea6521f23358d18c3623d33ce1106f798acc64',
    },
    {
      tokens: [returnTokenFromKey('MM'), returnTokenFromKey('USDC')],
      stakingRewardAddress: '0x164A74cD08e6a0851fbE74B16E5E18d02c5E86f6',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 2.232,
      pair: '0x5e06e1da9b7cb3ddd0df596003ad4cb852f51955',
    },
    {
      tokens: [returnTokenFromKey('TECH'), returnTokenFromKey('ETHER')],
      stakingRewardAddress: '0xD039f25F567C406393D0534Cbae304d2294141d0',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 2.232,
      pair: '0x204a7adc76db7fe8c5e5f499cb3c4cff6d7282c2',
    },
    {
      tokens: [returnTokenFromKey('ELIXIR'), GlobalData.tokens.MATIC],
      stakingRewardAddress: '0x428F09ab6aF0B0A235fD0FcEC1519912DA610011',
      ended: false,
      lp: '',
      name: '',
      baseToken: GlobalData.tokens.MATIC,
      rate: 2.232,
      pair: '0x7a6830a9e6f964104b52243922a7738de4cff84a',
    },
    {
      tokens: [returnTokenFromKey('GAMER'), returnTokenFromKey('ETHER')],
      stakingRewardAddress: '0x9DFF9CeDaDFf61a918626fF24D93EDc65DC95391',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 2.232,
      pair: '0x1df661fc4319415a2f990bd5f49d5ca70efdee1c',
    },
    {
      tokens: [returnTokenFromKey('BLANK'), returnTokenFromKey('USDC')],
      stakingRewardAddress: '0xd8a4784bf0deBf82b815ED4822c0306dD5E7b457',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 2.232,
      pair: '0x3b480d50b9ed88b4891e066681467a73f78d8c22',
    },
    {
      tokens: [returnTokenFromKey('STZ'), returnTokenFromKey('USDC')],
      stakingRewardAddress: '0x751eDC99eECF35708b1b236cf7702ffaE8cbC5Cc',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 2.232,
      pair: '0xad308b210356d69026c08c5f51089197d4bb59a6',
    },
    {
      tokens: [returnTokenFromKey('RELAY'), returnTokenFromKey('QUICK')],
      stakingRewardAddress: '0x8eF44aF84D79717577C54DD7eC60a60945404680',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 2.232,
      pair: '0x7ca8e540df6326005b72661e50f1350c84c0e55d',
    },
    {
      tokens: [returnTokenFromKey('BCMC'), GlobalData.tokens.MATIC],
      stakingRewardAddress: '0xBFC77297F1a2cdE89a8222d01a293e8A90Be00e7',
      ended: false,
      lp: '',
      name: '',
      baseToken: GlobalData.tokens.MATIC,
      rate: 1.86,
      pair: '0xca3e450d0107db69cd7769641f62f419c42d5332',
    },
    {
      tokens: [returnTokenFromKey('ELON'), returnTokenFromKey('ETHER')],
      stakingRewardAddress: '0x79A8337F65127A2d1DF164AE23065f39102A1a5f',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 1.488,
      pair: '0x13305f843e66f7cc7f9cb1bbc40dabee7086d1f8',
    },
    {
      tokens: [returnTokenFromKey('SNE'), returnTokenFromKey('USDC')],
      stakingRewardAddress: '0xeB029E7a319207db79C54fdf4ee377Fe749A90b3',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 1.488,
      pair: '0x23baf6d86c80eb18b1799763ea47eae6fe727767',
    },
    {
      tokens: [returnTokenFromKey('SHIB'), GlobalData.tokens.MATIC],
      stakingRewardAddress: '0x807a2EF804a8557bF5eC9c03FF869888E6af8E83',
      ended: false,
      lp: '',
      name: '',
      baseToken: GlobalData.tokens.MATIC,
      rate: 1.488,
      pair: '0x5fb641de2663e8a94c9dea0a539817850d996e99',
    },
    {
      tokens: [returnTokenFromKey('DAI'), returnTokenFromKey('USDC')],
      stakingRewardAddress: '0xACb9EB5B52F495F09bA98aC96D8e61257F3daE14',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 1.488,
      pair: '0xf04adbf75cdfc5ed26eea4bbbb991db002036bdd',
    },
    {
      tokens: [returnTokenFromKey('AVAX'), GlobalData.tokens.MATIC],
      stakingRewardAddress: '0x0cAB010bA055a9F3B3f987BA39eE0ad3E2d1a830',
      ended: false,
      lp: '',
      name: '',
      baseToken: GlobalData.tokens.MATIC,
      rate: 1.488,
      pair: '0xeb477ae74774b697b5d515ef8ca09e24fee413b5',
    },
    {
      tokens: [returnTokenFromKey('SOL'), GlobalData.tokens.MATIC],
      stakingRewardAddress: '0xB332b9D67E20bb8Ce4B93308A63C2EE2F846D372',
      ended: false,
      lp: '',
      name: '',
      baseToken: GlobalData.tokens.MATIC,
      rate: 1.488,
      pair: '0x898386dd8756779a4ba4f1462891b92dd76b78ef',
    },
    {
      tokens: [returnTokenFromKey('BNB'), returnTokenFromKey('USDC')],
      stakingRewardAddress: '0xCd7E62D9E2D209EcB22EC48A942b4db9503aB97B',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 1.488,
      pair: '0x40a5df3e37152d4daf279e0450289af76472b02e',
    },
    {
      tokens: [returnTokenFromKey('FTM'), GlobalData.tokens.MATIC],
      stakingRewardAddress: '0xF81e664C8277d461Df561b353D50c4B698144664',
      ended: false,
      lp: '',
      name: '',
      baseToken: GlobalData.tokens.MATIC,
      rate: 1.488,
      pair: '0xd2b61a42d3790533fedc2829951a65120624034a',
    },
    {
      tokens: [returnTokenFromKey('MCRN'), returnTokenFromKey('ETHER')],
      stakingRewardAddress: '0x7Ddff049B9f8393636a3E277ef86639D0A1d6B82',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 1.488,
      pair: '0xde84c8f0562eb56a5fc8f07819cef1faf9df3ebc',
    },
    {
      tokens: [returnTokenFromKey('PNT'), returnTokenFromKey('ETHER')],
      stakingRewardAddress: '0xf3dD73a4fA42021e394f3BF20C0d55042eb789dE',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 1.488,
      pair: '0xf60618c6ab18e347428a3ee72bf95a720bb45ee6',
    },
    {
      tokens: [returnTokenFromKey('PBTC'), returnTokenFromKey('WBTC')],
      stakingRewardAddress: '0x4bBaE7Ab87D2604dCA240c8eC00Be6dcD35295D4',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('WBTC'),
      rate: 1.488,
      pair: '0x0850f9bf21cdba7d2817fca8e5f9d3b96feff3dd',
    },
    {
      tokens: [returnTokenFromKey('ZIG'), returnTokenFromKey('QUICK')],
      stakingRewardAddress: '0x089C2D16eFCf91A69dae6f0c5769cc1b6F1da26d',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 1.488,
      pair: '0x9d6d31d8bd564cd77a70b7a0cc1416be9dcd8b6f',
    },
    {
      tokens: [returnTokenFromKey('MANA'), GlobalData.tokens.MATIC],
      stakingRewardAddress: '0xee61B0C32ADf887d265236f57AC0a2449CC931C7',
      ended: false,
      lp: '',
      name: '',
      baseToken: GlobalData.tokens.MATIC,
      rate: 1.488,
      pair: '0x6b0ce31ead9b14c2281d80a5dde903ab0855313a',
    },
    {
      tokens: [returnTokenFromKey('WCRO'), GlobalData.tokens.MATIC],
      stakingRewardAddress: '0xd2A750C2Ce25E47C3A0Abe9B5966a20e60288091',
      ended: false,
      lp: '',
      name: '',
      baseToken: GlobalData.tokens.MATIC,
      rate: 1.488,
      pair: '0xfd168748dd07a32a401e800240aec8ec6efc706f',
    },
    {
      tokens: [returnTokenFromKey('PBR'), returnTokenFromKey('USDT')],
      stakingRewardAddress: '0x4c510d82FD85F2B54FD0C41975fbb9305a92751B',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDT'),
      rate: 1.488,
      pair: '0x53b02ad5f6615262ec5b483937260135429d5af9',
    },
    {
      tokens: [returnTokenFromKey('WONE'), GlobalData.tokens.MATIC],
      stakingRewardAddress: '0x28b833473e047f6116C46d8ed5117708eeb151F9',
      ended: false,
      lp: '',
      name: '',
      baseToken: GlobalData.tokens.MATIC,
      rate: 1.488,
      pair: '0x28c5367d8a4e85f8d7b41a0ca2579e66a58fccb6',
    },
    {
      tokens: [returnTokenFromKey('HBAR'), returnTokenFromKey('MI')],
      stakingRewardAddress: '0xCa379470379fCb2daBff4eECF975a2b6733bdF9E',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('MI'),
      rate: 1.488,
      pair: '0x71952d09aa093acccae0c1d5612d7fe26f20517f',
    },
    {
      tokens: [returnTokenFromKey('TOMB'), returnTokenFromKey('MI')],
      stakingRewardAddress: '0xe6d8Dda661Ff57Bc45d919AA868Ee219Ca9f03c7',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('MI'),
      rate: 1.488,
      pair: '0xbdbe9c09ffc1de53ad9fa3732ec1cd37da7ba52f',
    },
    {
      tokens: [returnTokenFromKey('UART'), returnTokenFromKey('USDT')],
      stakingRewardAddress: '0x1749A4ee5db033BCaB23544E54A71A69d06da054',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDT'),
      rate: 1.116,
      pair: '0x55fac9f86e274ac335046e8e434881b3f2a9c09a',
    },
    {
      tokens: [returnTokenFromKey('START'), returnTokenFromKey('QUICK')],
      stakingRewardAddress: '0xB1B2e2b4cBED8e7b6FF7Cca016760ccA9260f0Ec',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 0.744,
      pair: '0x9e2b254c7d6ad24afb334a75ce21e216a9aa25fc',
    },
    {
      tokens: [returnTokenFromKey('UFI'), GlobalData.tokens.MATIC],
      stakingRewardAddress: '0xa34cd2445597DEBcD8E1B85D45E9A075EA485d20',
      ended: false,
      lp: '',
      name: '',
      baseToken: GlobalData.tokens.MATIC,
      rate: 0.744,
      pair: '0x8095d1fb36138fc492337a63c52d03764d12e771',
    },
    {
      tokens: [returnTokenFromKey('EROWAN'), returnTokenFromKey('ATOM')],
      stakingRewardAddress: '0x70C674bCe0aEc05E0d13bFEdd692b2F231323899',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ATOM'),
      rate: 0.744,
      pair: '0x7051810a53030171f01d89e9aebd8a599de1b530',
    },
    {
      tokens: [returnTokenFromKey('GMEE'), returnTokenFromKey('QUICK')],
      stakingRewardAddress: '0x5454862d457d0e87f68Ff2eb6c2Ffb12FE5f254b',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 0.744,
      pair: '0xfe4ba2ab8562b6204a17f19651c760818a361571',
    },
    {
      tokens: [returnTokenFromKey('EROWAN'), returnTokenFromKey('QUICK')],
      stakingRewardAddress: '0xf113B8dec8368b7FeC4802fF7126cA317131F7cF',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 0.744,
      pair: '0x631f39d22430e889a3cfbea4fd73ed101059075f',
    },
    {
      tokens: [returnTokenFromKey('UM'), returnTokenFromKey('ETHER')],
      stakingRewardAddress: '0x7b6151f2935cE9420eEb79D2B9821515b7f3E876',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 0.744,
      pair: '0x78413ed015b19766c8881f6f1bb9011ce95ec786',
    },
    {
      tokens: [returnTokenFromKey('XPRT'), returnTokenFromKey('EROWAN')],
      stakingRewardAddress: '0xA0395e5f54f396527322fb11D922e50707552176',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('EROWAN'),
      rate: 0.744,
      pair: '0xf366df119532b2e0f4e416c81d6ff7728a60fe7d',
    },
    {
      tokens: [returnTokenFromKey('AKT'), returnTokenFromKey('EROWAN')],
      stakingRewardAddress: '0x9C2F4bebEA8B843485EdbD77801CD41B92805bBf',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('EROWAN'),
      rate: 0.744,
      pair: '0xa651ef83fa6a90e76206de4e79a5c69f80994556',
    },
    {
      tokens: [returnTokenFromKey('DES'), returnTokenFromKey('QUICK')],
      stakingRewardAddress: '0xd6bf3026664e4f64ADCb0FA10e9aB216C8935e43',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 0.744,
      pair: '0xdfb3d129f32b32852e74322e699580d75ca4521e',
    },
    {
      tokens: [returnTokenFromKey('REVV'), returnTokenFromKey('USDC')],
      stakingRewardAddress: '0x97E4bcF95DfA4C0EDAcFd12287317BfaF5B4866A',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 0.744,
      pair: '0xe4139dbf19e9c8d880f915711c8674022979d432',
    },
    {
      tokens: [returnTokenFromKey('DAI'), returnTokenFromKey('USDT')],
      stakingRewardAddress: '0xc45aB79526Dd16B00505EB39222E6B1Aed0Ef079',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('DAI'),
      rate: 0.744,
      pair: '0x59153f27eefe07e5ece4f9304ebba1da6f53ca88',
    },
    {
      tokens: [returnTokenFromKey('REVV'), returnTokenFromKey('QUICK')],
      stakingRewardAddress: '0xB84319392d51FEEBfA40EdA326C14Bf56c31D030',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 0.744,
      pair: '0xc52f4e49c7fb3ffceb48ad06c3f3a17ad5c0dbfe',
    },
    {
      tokens: [returnTokenFromKey('GHST'), returnTokenFromKey('USDC')],
      stakingRewardAddress: '0x3759D7904a5A0fcdB5AA2d55D5fF1132aE4f2575',
      ended: false,
      name: 'stkGHST-USDC',
      lp: '0x04439eC4ba8b09acfae0E9b5D75A82cC63b19f09',
      baseToken: returnTokenFromKey('USDC'),
      rate: 0.744,
      pair: '0x096c5ccb33cfc5732bcd1f3195c13dbefc4c82f4',
    },
    {
      tokens: [returnTokenFromKey('WELT'), returnTokenFromKey('USDC')],
      stakingRewardAddress: '0xE85f2dc81006fB580c7e5007399D5167Ea806F41',
      ended: false,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('USDC'),
      rate: 0.744,
      pair: '0x55e49f32fbba12aa360eec55200dafd1ac47aaed',
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
      tokens: [returnTokenFromKey('UCO'), returnTokenFromKey('ETHER')],
      stakingRewardAddress: '0x81f0076780F7CeeF57E801b10EF9DbC92f3a2B5a',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 1.498,
      pair: '0x25bae75f6760ac30554cc62f9282307c3038c3a0',
    },
    {
      tokens: [returnTokenFromKey('AUMI'), GlobalData.tokens.MATIC],
      stakingRewardAddress: '0x7549bD32cAbA7bdeb4d7bcAF3f7Ff8bed13577Bc',
      ended: true,
      lp: '',
      name: '',
      baseToken: GlobalData.tokens.MATIC,
      rate: 1.498,
      pair: '0x3a2fe73866bac2d28501e4e6149ef9057463c365',
    },
    {
      tokens: [returnTokenFromKey('ALN'), returnTokenFromKey('ETHER')],
      stakingRewardAddress: '0xEBa5ECcd528DB4f4d589f4381e1De26aC2035cb3',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 0.749,
      pair: '0x150255a6ba2d32ac058e8b435a445f5137a21857',
    },
    {
      tokens: [returnTokenFromKey('IRIS'), returnTokenFromKey('EROWAN')],
      stakingRewardAddress: '0x49734F8A9ED60CBdc489d90A3d80aaf41FaE0Ae4',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('EROWAN'),
      rate: 0.749,
      pair: '0x58ffb271c6f3d92f03c49e08e2887810f65b8cd6',
    },
    {
      tokens: [returnTokenFromKey('REGEN'), returnTokenFromKey('EROWAN')],
      stakingRewardAddress: '0xb72547668E5759a81BB2DD0C81a04437487e7F17',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('EROWAN'),
      rate: 0.749,
      pair: '0x66c37a00e426a613b188180198aac12b0b4ae4d4',
    },
    {
      tokens: [returnTokenFromKey('MCASH'), returnTokenFromKey('ETHER')],
      stakingRewardAddress: '0xd24FdB548704D8C6AA1e15B238E4cBe10d214119',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('ETHER'),
      rate: 0.749,
      pair: '0x1fef1ce437bb025c08609e0c14ab916622bd09f4',
    },
    {
      tokens: [returnTokenFromKey('ATOM'), returnTokenFromKey('QUICK')],
      stakingRewardAddress: '0xeF37c3272DAcdC0FaEe000b3862734d2Df1D9C91',
      ended: true,
      lp: '',
      name: '',
      baseToken: returnTokenFromKey('QUICK'),
      rate: 0.749,
      pair: '0xf7e659966196f069a23ce9b84b9586a809c4cd9a',
    },
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

export interface CommonStakingInfo {
  // the address of the reward contract
  stakingRewardAddress: string;
  // the tokens involved in this pair
  tokens: [Token, Token];
  // the amount of token currently staked, or undefined if no account
  stakedAmount: TokenAmount;
  // the total amount of token staked in the contract
  totalStakedAmount: TokenAmount;
  // when the period ends
  periodFinish: Date | undefined;

  ended: boolean;

  name: string;

  lp: string;

  baseToken: Token;

  pair: string;

  quickPrice: number;

  oneYearFeeAPY?: number;

  oneDayFee?: number;

  accountFee?: number;
  tvl?: string;
  perMonthReturnInRewards?: number;

  totalSupply?: TokenAmount;
  usdPrice?: Price;
  stakingTokenPair?: Pair | null;
  // calculates a hypothetical amount of token distributed to the active account per second.
  getHypotheticalRewardRate: (
    stakedAmount: TokenAmount,
    totalStakedAmount: TokenAmount,
    totalRewardRate: TokenAmount,
  ) => TokenAmount;
}

export interface StakingInfo extends CommonStakingInfo {
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount: TokenAmount;
  // the amount of token distributed per second to all LPs, constant
  totalRewardRate: TokenAmount;
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  rewardRate: TokenAmount;

  rate: number;

  dQuickToQuick: number;
  valueOfTotalStakedAmountInBaseToken?: TokenAmount;
}

export interface DualStakingInfo extends CommonStakingInfo {
  rewardTokenA: Token;
  rewardTokenB: Token;
  rewardTokenBBase: Token;
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmountA: TokenAmount;
  earnedAmountB: TokenAmount;
  // the amount of token distributed per second to all LPs, constant
  totalRewardRateA: TokenAmount;
  totalRewardRateB: TokenAmount;
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  rewardRateA: TokenAmount;
  rewardRateB: TokenAmount;

  maticPrice: number;

  rateA: number;
  rateB: number;
  rewardTokenBPrice?: number;
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

  rewards?: number;
  rewardTokenPriceinUSD?: number;

  // calculates a hypothetical amount of token distributed to the active account per second.
  getHypotheticalRewardRate: (
    stakedAmount: TokenAmount,
    totalStakedAmount: TokenAmount,
    totalRewardRate: TokenAmount,
  ) => TokenAmount;
}

export function useTotalRewardsDistributed() {
  const { chainId } = useActiveWeb3React();
  const [, quickUsdcPair] = usePair(
    returnTokenFromKey('QUICK'),
    returnTokenFromKey('USDC'),
  );
  const [, maticUsdcPair] = usePair(
    GlobalData.tokens.MATIC,
    returnTokenFromKey('USDC'),
  );
  const quickPrice = Number(
    quickUsdcPair?.priceOf(returnTokenFromKey('QUICK'))?.toSignificant(6),
  );
  const maticPrice = Number(
    maticUsdcPair?.priceOf(GlobalData.tokens.MATIC)?.toSignificant(6),
  );
  const syrupRewardsInfo = chainId ? SYRUP_REWARDS_INFO[chainId] ?? [] : [];
  const dualStakingRewardsInfo = chainId
    ? STAKING_DUAL_REWARDS_INFO[chainId] ?? []
    : [];
  const stakingRewardsInfo = chainId ? STAKING_REWARDS_INFO[chainId] ?? [] : [];

  const syrupTokenPairs = usePairs(
    syrupRewardsInfo.map((item) => [
      unwrappedToken(item.token),
      unwrappedToken(item.baseToken),
    ]),
  );
  const syrupUSDBaseTokenPrices = useUSDCPrices(
    syrupRewardsInfo.map((item) => unwrappedToken(item.baseToken)),
  );
  const syrupRewardsUSD = syrupRewardsInfo.reduce((total, item, index) => {
    const [, syrupTokenPair] = syrupTokenPairs[index];
    const tokenPairPrice = syrupTokenPair?.priceOf(item.token);
    const usdPriceBaseToken = syrupUSDBaseTokenPrices[index];
    const priceOfRewardTokenInUSD =
      Number(tokenPairPrice?.toSignificant()) *
      Number(usdPriceBaseToken?.toSignificant());
    return total + priceOfRewardTokenInUSD * item.rate;
  }, 0);

  const dualStakingTokenPairs = usePairs(
    dualStakingRewardsInfo.map((item) => [
      item.rewardTokenB,
      item.rewardTokenBBase,
    ]),
  );
  const dualStakingRewardsUSD = dualStakingRewardsInfo.reduce(
    (total, item, index) => {
      const [, rewardTokenBPair] = dualStakingTokenPairs[index];
      const rewardTokenBPriceInBaseToken = Number(
        rewardTokenBPair?.priceOf(item.rewardTokenB)?.toSignificant(6),
      );

      let rewardTokenBPrice = 0;
      if (item.rewardTokenBBase.equals(returnTokenFromKey('USDC'))) {
        rewardTokenBPrice = rewardTokenBPriceInBaseToken;
      } else if (item.rewardTokenBBase.equals(returnTokenFromKey('QUICK'))) {
        rewardTokenBPrice = rewardTokenBPriceInBaseToken * quickPrice;
      } else {
        rewardTokenBPrice = rewardTokenBPriceInBaseToken * maticPrice;
      }

      return total + item.rateA * quickPrice + item.rateB * rewardTokenBPrice;
    },
    0,
  );

  const stakingRewardsUSD = stakingRewardsInfo.reduce(
    (total, item) => total + item.rate * quickPrice,
    0,
  );

  return syrupRewardsUSD + dualStakingRewardsUSD + stakingRewardsUSD;
}

export function useUSDRewardsandFees(isLPFarm: boolean, bulkPairData: any) {
  const { chainId } = useActiveWeb3React();
  const [, quickUsdcPair] = usePair(
    returnTokenFromKey('QUICK'),
    returnTokenFromKey('USDC'),
  );
  const [, maticUsdcPair] = usePair(
    GlobalData.tokens.MATIC,
    returnTokenFromKey('USDC'),
  );
  const quickPrice = Number(
    quickUsdcPair?.priceOf(returnTokenFromKey('QUICK'))?.toSignificant(6),
  );
  const maticPrice = Number(
    maticUsdcPair?.priceOf(GlobalData.tokens.MATIC)?.toSignificant(6),
  );
  const dualStakingRewardsInfo =
    chainId && !isLPFarm ? STAKING_DUAL_REWARDS_INFO[chainId] ?? [] : [];
  const stakingRewardsInfo =
    chainId && isLPFarm ? STAKING_REWARDS_INFO[chainId] ?? [] : [];
  const rewardsInfos = isLPFarm ? stakingRewardsInfo : dualStakingRewardsInfo;
  const rewardsAddresses = useMemo(
    () => rewardsInfos.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [rewardsInfos],
  );
  const rewardPairs = useMemo(() => rewardsInfos.map(({ pair }) => pair), [
    rewardsInfos,
  ]);
  const totalSupplies = useMultipleContractSingleData(
    rewardsAddresses,
    isLPFarm ? STAKING_REWARDS_INTERFACE : STAKING_DUAL_REWARDS_INTERFACE,
    'totalSupply',
  );
  const dualStakingTokenPairs = usePairs(
    dualStakingRewardsInfo.map((item) => [
      item.rewardTokenB,
      item.rewardTokenBBase,
    ]),
  );
  let rewardsUSD: number | null = null;
  if (isLPFarm) {
    rewardsUSD = stakingRewardsInfo.reduce(
      (total, item) => total + item.rate * quickPrice,
      0,
    );
  } else {
    rewardsUSD = dualStakingRewardsInfo.reduce((total, item, index) => {
      const [, rewardTokenBPair] = dualStakingTokenPairs[index];
      const rewardTokenBPriceInBaseToken = Number(
        rewardTokenBPair?.priceOf(item.rewardTokenB)?.toSignificant(6),
      );

      let rewardTokenBPrice = 0;
      if (item.rewardTokenBBase.equals(returnTokenFromKey('USDC'))) {
        rewardTokenBPrice = rewardTokenBPriceInBaseToken;
      } else if (item.rewardTokenBBase.equals(returnTokenFromKey('QUICK'))) {
        rewardTokenBPrice = rewardTokenBPriceInBaseToken * quickPrice;
      } else {
        rewardTokenBPrice = rewardTokenBPriceInBaseToken * maticPrice;
      }

      return total + item.rateA * quickPrice + item.rateB * rewardTokenBPrice;
    }, 0);
  }
  const stakingFees = bulkPairData
    ? rewardPairs.reduce((total, pair, index) => {
        const oneYearFeeAPY = Number(bulkPairData[pair]?.oneDayVolumeUSD ?? 0);
        const totalSupplyState = totalSupplies[index];
        if (oneYearFeeAPY) {
          const totalSupply = web3.utils.toWei(
            pairs[pair]?.totalSupply,
            'ether',
          );
          const ratio =
            Number(totalSupplyState.result?.[0].toString()) /
            Number(totalSupply);
          const oneDayFee =
            oneYearFeeAPY * GlobalConst.utils.FEEPERCENT * ratio;
          return total + oneDayFee;
        } else {
          return total;
        }
      }, 0)
    : null;

  return { rewardsUSD, stakingFees };
}

export function useSyrupInfo(
  tokenToFilterBy?: Token | null,
  startIndex?: number,
  endIndex?: number,
  filter?: { search: string; isStaked: boolean },
): SyrupInfo[] {
  const { chainId, account } = useActiveWeb3React();
  //const [quickPrice,setQuickPrice] = useState(0);
  const [, quickUsdcPair] = usePair(
    returnTokenFromKey('QUICK'),
    returnTokenFromKey('USDC'),
  );
  const quickPrice = Number(
    quickUsdcPair?.priceOf(returnTokenFromKey('QUICK'))?.toSignificant(6),
  );
  const info = useMemo(
    () =>
      chainId
        ? SYRUP_REWARDS_INFO[chainId]
            ?.slice(startIndex, endIndex)
            .filter((stakingRewardInfo) =>
              tokenToFilterBy === undefined || tokenToFilterBy === null
                ? getSearchFiltered(
                    stakingRewardInfo,
                    filter ? filter.search : '',
                  )
                : tokenToFilterBy.equals(stakingRewardInfo.token) &&
                  tokenToFilterBy.equals(stakingRewardInfo.token),
            ) ?? []
        : [],
    [chainId, tokenToFilterBy, startIndex, endIndex, filter],
  );

  const uni = chainId ? GlobalData.tokens.UNI[chainId] : undefined;

  const rewardsAddresses = useMemo(
    () => info.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [info],
  );

  const accountArg = useMemo(() => [account ?? undefined], [account]);
  const lair = useLairContract();

  const inputs = ['1000000000000000000'];
  const USDPrice = useUSDCPrice(returnTokenFromKey('QUICK'));

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

  const stakingTokenPairs = usePairs(
    info.map((item) => [
      unwrappedToken(item.token),
      unwrappedToken(item.baseToken),
    ]),
  );

  const usdBaseTokenPrices = useUSDCPrices(
    info.map((item) => unwrappedToken(item.baseToken)),
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
          const [, stakingTokenPair] = stakingTokenPairs[index];
          const tokenPairPrice = stakingTokenPair?.priceOf(token);
          const usdPriceBaseToken = usdBaseTokenPrices[index];
          const priceOfRewardTokenInUSD =
            Number(tokenPairPrice?.toSignificant()) *
            Number(usdPriceBaseToken?.toSignificant());

          const rewards =
            Number(info[index].rate) *
            (priceOfRewardTokenInUSD ? priceOfRewardTokenInUSD : 0);

          // check for account, if no account set to 0
          const lp = info[index].lp;
          const rate = web3.utils.toWei(info[index].rate.toString());
          const stakedAmount = new TokenAmount(
            lp && lp !== ''
              ? new Token(137, lp, 18, 'SLP', 'Staked LP')
              : returnTokenFromKey('DQUICK'),
            JSBI.BigInt(balanceState?.result?.[0] ?? 0),
          );
          const totalStakedAmount = new TokenAmount(
            lp && lp !== ''
              ? new Token(137, lp, 18, 'SLP', 'Staked LP')
              : returnTokenFromKey('DQUICK'),
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
                    JSBI.multiply(totalRewardRate.raw, stakedAmount.raw),
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
            returnTokenFromKey('QUICK'),
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
              returnTokenFromKey('DQUICK'),
              JSBI.BigInt(_dQuickTotalSupply?.result?.[0] ?? 0),
            ),
            valueOfTotalStakedAmountInUSDC,
            oneDayVol: oneDayVol,
            rewardTokenPriceinUSD: priceOfRewardTokenInUSD,
            rewards,
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
    stakingTokenPairs,
    usdBaseTokenPrices,
  ]).filter((syrupInfo) =>
    filter && filter.isStaked ? syrupInfo.stakedAmount.greaterThan('0') : true,
  );
}

export function useOldSyrupInfo(
  tokenToFilterBy?: Token | null,
  startIndex?: number,
  endIndex?: number,
  filter?: { search: string; isStaked: boolean },
): SyrupInfo[] {
  const { chainId, account } = useActiveWeb3React();
  //const [quickPrice,setQuickPrice] = useState(0);
  const [, quickUsdcPair] = usePair(
    returnTokenFromKey('QUICK'),
    returnTokenFromKey('USDC'),
  );
  const quickPrice = Number(
    quickUsdcPair?.priceOf(returnTokenFromKey('QUICK'))?.toSignificant(6),
  );
  const info = useMemo(
    () =>
      chainId
        ? OLD_SYRUP_REWARDS_INFO[chainId]
            ?.slice(startIndex, endIndex)
            ?.filter((stakingRewardInfo) =>
              tokenToFilterBy === undefined || tokenToFilterBy === null
                ? getSearchFiltered(
                    stakingRewardInfo,
                    filter ? filter.search : '',
                  )
                : tokenToFilterBy.equals(stakingRewardInfo.token) &&
                  tokenToFilterBy.equals(stakingRewardInfo.token),
            ) ?? []
        : [],
    [chainId, tokenToFilterBy, startIndex, endIndex, filter],
  );

  const uni = chainId ? GlobalData.tokens.UNI[chainId] : undefined;

  const rewardsAddresses = useMemo(
    () => info.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [info],
  );

  const accountArg = useMemo(() => [account ?? undefined], [account]);

  const USDPrice = useUSDCPrice(returnTokenFromKey('QUICK'));

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

  const stakingTokenPairs = usePairs(
    info.map((item) => [
      unwrappedToken(item.token),
      unwrappedToken(item.baseToken),
    ]),
  );

  const usdBaseTokenPrices = useUSDCPrices(
    info.map((item) => unwrappedToken(item.baseToken)),
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
              : returnTokenFromKey('DQUICK'),
            JSBI.BigInt(balanceState?.result?.[0] ?? 0),
          );
          const totalStakedAmount = new TokenAmount(
            lp && lp !== ''
              ? new Token(137, lp, 18, 'SLP', 'Staked LP')
              : returnTokenFromKey('DQUICK'),
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
                    JSBI.multiply(totalRewardRate.raw, stakedAmount.raw),
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
            returnTokenFromKey('QUICK'),
            JSBI.BigInt(0),
          );
          const valueOfTotalStakedAmountInUSDC =
            Number(totalStakedAmount.toSignificant(6)) *
            Number(dQUICKtoQUICK.toSignificant(6)) *
            Number(USDPrice?.toSignificant(6));

          const [, stakingTokenPair] = stakingTokenPairs[index];
          const tokenPairPrice = stakingTokenPair?.priceOf(token);
          const usdPriceBaseToken = usdBaseTokenPrices[index];
          const priceOfRewardTokenInUSD =
            Number(tokenPairPrice?.toSignificant()) *
            Number(usdPriceBaseToken?.toSignificant());

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
            dQuickTotalSupply: new TokenAmount(
              returnTokenFromKey('DQUICK'),
              JSBI.BigInt(0),
            ),
            valueOfTotalStakedAmountInUSDC: valueOfTotalStakedAmountInUSDC,
            oneDayVol: 0,
            rewardTokenPriceinUSD: priceOfRewardTokenInUSD,
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
    stakingTokenPairs,
    usdBaseTokenPrices,
  ]).filter((syrupInfo) =>
    filter && filter.isStaked ? syrupInfo.stakedAmount.greaterThan('0') : true,
  );
}

export const getBulkPairData = async (pairList: any) => {
  // if (pairs !== undefined) {
  //   return;
  // }
  const currentBlock = await web3.eth.getBlockNumber();
  const oneDayOldBlock = currentBlock - 44000;

  try {
    const current = await client.query({
      query: PAIRS_BULK(pairList),
      fetchPolicy: 'network-only',
    });

    const [oneDayResult] = await Promise.all(
      [oneDayOldBlock].map(async (block) => {
        const cResult = await client.query({
          query: PAIRS_HISTORICAL_BULK(block, pairList),
          fetchPolicy: 'network-only',
        });
        return cResult;
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
  return Number(valueNow) - Number(value24HoursAgo);
};

function parseData(data: any, oneDayData: any) {
  // get volume changes
  const oneDayVolumeUSD = get2DayPercentChange(
    data?.volumeUSD,
    oneDayData?.volumeUSD ? oneDayData.volumeUSD : 0,
  );
  return {
    id: data.id,
    token0: data.token0,
    token1: data.token1,
    oneDayVolumeUSD,
    reserveUSD: data.reserveUSD,
    totalSupply: data.totalSupply,
  };
}

function getSearchFiltered(info: any, search: string) {
  if (info.tokens) {
    const infoToken0 = info.tokens[0];
    const infoToken1 = info.tokens[1];
    return (
      (infoToken0.symbol ?? '').toLowerCase().indexOf(search.toLowerCase()) >
        -1 ||
      (infoToken0.name ?? '').toLowerCase().indexOf(search.toLowerCase()) >
        -1 ||
      (infoToken0.address ?? '').toLowerCase().indexOf(search.toLowerCase()) >
        -1 ||
      (infoToken1.symbol ?? '').toLowerCase().indexOf(search.toLowerCase()) >
        -1 ||
      (infoToken1.name ?? '').toLowerCase().indexOf(search.toLowerCase()) >
        -1 ||
      (infoToken1.address ?? '').toLowerCase().indexOf(search.toLowerCase()) >
        -1
    );
  } else if (info.token) {
    return (
      (info.token.symbol ?? '').toLowerCase().indexOf(search.toLowerCase()) >
        -1 ||
      (info.token.name ?? '').toLowerCase().indexOf(search.toLowerCase()) >
        -1 ||
      (info.token.address ?? '').toLowerCase().indexOf(search.toLowerCase()) >
        -1
    );
  } else {
    return false;
  }
}

// gets the dual rewards staking info from the network for the active chain id
export function useDualStakingInfo(
  pairToFilterBy?: Pair | null,
  startIndex?: number,
  endIndex?: number,
  filter?: { search: string; isStaked: boolean },
): DualStakingInfo[] {
  const { chainId, account } = useActiveWeb3React();
  //const [quickPrice,setQuickPrice] = useState(0);
  const [, quickUsdcPair] = usePair(
    returnTokenFromKey('QUICK'),
    returnTokenFromKey('USDC'),
  );
  const [, maticUsdcPair] = usePair(
    GlobalData.tokens.MATIC,
    returnTokenFromKey('USDC'),
  );

  const quickPrice = Number(
    quickUsdcPair?.priceOf(returnTokenFromKey('QUICK'))?.toSignificant(6),
  );
  const maticPrice = Number(
    maticUsdcPair?.priceOf(GlobalData.tokens.MATIC)?.toSignificant(6),
  );

  const info = useMemo(
    () =>
      chainId
        ? STAKING_DUAL_REWARDS_INFO[chainId]
            ?.slice(startIndex, endIndex)
            ?.filter((stakingRewardInfo) =>
              pairToFilterBy === undefined || pairToFilterBy === null
                ? getSearchFiltered(
                    stakingRewardInfo,
                    filter ? filter.search : '',
                  )
                : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
                  pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1]),
            ) ?? []
        : [],
    [chainId, pairToFilterBy, startIndex, endIndex, filter],
  );

  const uni = chainId ? GlobalData.tokens.UNI[chainId] : undefined;

  const rewardsAddresses = useMemo(
    () => info.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [info],
  );
  // const pairAddresses = useMemo(() => info.map(({ pair }) => pair), [info]);

  // useEffect(() => {
  //   getDualBulkPairData(pairAddresses);
  // }, [pairAddresses]);

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

  const baseTokens = info.map((item) => {
    const unwrappedCurrency = unwrappedToken(item.baseToken);
    const empty = unwrappedToken(returnTokenFromKey('EMPTY'));
    return unwrappedCurrency === empty ? item.tokens[0] : item.baseToken;
  });

  const tokenPairs = usePairs(
    info.map((item) => [item.rewardTokenB, item.rewardTokenBBase]),
  );

  const usdPrices = useUSDCPrices(baseTokens);
  const totalSupplys = useTotalSupplys(
    info.map((item) => {
      const lp = item.lp;
      const dummyPair = new Pair(
        new TokenAmount(item.tokens[0], '0'),
        new TokenAmount(item.tokens[1], '0'),
      );
      return lp && lp !== ''
        ? new Token(137, lp, 18, 'SLP', 'Staked LP')
        : dummyPair.liquidityToken;
    }),
  );
  const stakingPairs = usePairs(info.map((item) => item.tokens));

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

          let valueOfTotalStakedAmountInBaseToken: TokenAmount | undefined;

          const [, stakingTokenPair] = stakingPairs[index];
          const totalSupply = totalSupplys[index];
          const usdPrice = usdPrices[index];

          if (totalSupply && stakingTokenPair && baseTokens[index]) {
            // take the total amount of LP tokens staked, multiply by ETH value of all LP tokens, divide by all LP tokens
            valueOfTotalStakedAmountInBaseToken = new TokenAmount(
              baseTokens[index],
              JSBI.divide(
                JSBI.multiply(
                  JSBI.multiply(
                    totalStakedAmount.raw,
                    stakingTokenPair.reserveOf(baseTokens[index]).raw,
                  ),
                  JSBI.BigInt(2), // this is b/c the value of LP shares are ~double the value of the WETH they entitle owner to
                ),
                totalSupply.raw,
              ),
            );
          }

          const valueOfTotalStakedAmountInUSDC =
            valueOfTotalStakedAmountInBaseToken &&
            usdPrice?.quote(valueOfTotalStakedAmountInBaseToken);

          const tvl = valueOfTotalStakedAmountInUSDC
            ? valueOfTotalStakedAmountInUSDC.toSignificant()
            : valueOfTotalStakedAmountInBaseToken?.toSignificant();

          const [, rewardTokenBPair] = tokenPairs[index];

          const rewardTokenBPriceInBaseToken = Number(
            rewardTokenBPair
              ?.priceOf(info[index].rewardTokenB)
              ?.toSignificant(6),
          );

          let rewardTokenBPrice = 0;

          if (info[index].rewardTokenBBase.equals(returnTokenFromKey('USDC'))) {
            rewardTokenBPrice = rewardTokenBPriceInBaseToken;
          } else if (
            info[index].rewardTokenBBase.equals(returnTokenFromKey('QUICK'))
          ) {
            rewardTokenBPrice = rewardTokenBPriceInBaseToken * quickPrice;
          } else {
            rewardTokenBPrice = rewardTokenBPriceInBaseToken * maticPrice;
          }

          const perMonthReturnInRewards =
            ((info[index].rateA * quickPrice +
              info[index].rateB * rewardTokenBPrice) *
              30) /
            Number(valueOfTotalStakedAmountInUSDC?.toSignificant(6));

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
            rewardTokenA: info[index].rewardTokenA,
            rewardTokenB: info[index].rewardTokenB,
            rewardTokenBBase: info[index].rewardTokenBBase,
            rewardTokenBPrice,
            tvl,
            perMonthReturnInRewards,
            totalSupply,
            usdPrice,
            stakingTokenPair,
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
    baseTokens,
    totalSupplys,
    usdPrices,
    stakingPairs,
    tokenPairs,
  ]).filter((stakingInfo) =>
    filter && filter.isStaked
      ? stakingInfo.stakedAmount.greaterThan('0')
      : true,
  );
}

export function useLairInfo(): LairInfo {
  const { account } = useActiveWeb3React();

  let accountArg = useMemo(() => [account ?? undefined], [account]);

  const inputs = ['1000000000000000000'];

  const lair = useLairContract();
  const quick = useQUICKContract();
  const [, quickUsdcPair] = usePair(
    returnTokenFromKey('QUICK'),
    returnTokenFromKey('USDC'),
  );
  const quickPrice = quickUsdcPair
    ? Number(
        quickUsdcPair.priceOf(returnTokenFromKey('QUICK')).toSignificant(6),
      )
    : 0;

  const dQuickToQuick = useSingleCallResult(lair, 'dQUICKForQUICK', inputs);
  const quickToDQuick = useSingleCallResult(lair, 'QUICKForDQUICK', inputs);

  const _dQuickTotalSupply = useSingleCallResult(lair, 'totalSupply', []);

  const quickBalance = useSingleCallResult(lair, 'QUICKBalance', accountArg);
  const dQuickBalance = useSingleCallResult(lair, 'balanceOf', accountArg);

  accountArg = [GlobalConst.addresses.LAIR_ADDRESS ?? undefined];

  const lairsQuickBalance = useSingleCallResult(quick, 'balanceOf', accountArg);

  useEffect(() => {
    getOneDayVolume().then((data) => {
      console.log(data);
    });
  }, []);

  return useMemo(() => {
    return {
      lairAddress: GlobalConst.addresses.LAIR_ADDRESS,
      dQUICKtoQUICK: new TokenAmount(
        returnTokenFromKey('QUICK'),
        JSBI.BigInt(dQuickToQuick?.result?.[0] ?? 0),
      ),
      QUICKtodQUICK: new TokenAmount(
        returnTokenFromKey('DQUICK'),
        JSBI.BigInt(quickToDQuick?.result?.[0] ?? 0),
      ),
      dQUICKBalance: new TokenAmount(
        returnTokenFromKey('DQUICK'),
        JSBI.BigInt(dQuickBalance?.result?.[0] ?? 0),
      ),
      QUICKBalance: new TokenAmount(
        returnTokenFromKey('QUICK'),
        JSBI.BigInt(quickBalance?.result?.[0] ?? 0),
      ),
      totalQuickBalance: new TokenAmount(
        returnTokenFromKey('QUICK'),
        JSBI.BigInt(lairsQuickBalance?.result?.[0] ?? 0),
      ),
      quickPrice,
      dQuickTotalSupply: new TokenAmount(
        returnTokenFromKey('DQUICK'),
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

// gets the staking info from the network for the active chain id
export function useStakingInfo(
  pairToFilterBy?: Pair | null,
  startIndex?: number,
  endIndex?: number,
  filter?: { search: string; isStaked: boolean },
): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React();
  //const [quickPrice,setQuickPrice] = useState(0);
  const [, quickUsdcPair] = usePair(
    returnTokenFromKey('QUICK'),
    returnTokenFromKey('USDC'),
  );
  const quickPrice = Number(
    quickUsdcPair?.priceOf(returnTokenFromKey('QUICK'))?.toSignificant(6),
  );
  const info = useMemo(
    () =>
      chainId
        ? STAKING_REWARDS_INFO[chainId]
            ?.slice(startIndex, endIndex)
            ?.filter((stakingRewardInfo) =>
              pairToFilterBy === undefined || pairToFilterBy === null
                ? getSearchFiltered(
                    stakingRewardInfo,
                    filter ? filter.search : '',
                  )
                : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
                  pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1]),
            ) ?? []
        : [],
    [chainId, pairToFilterBy, startIndex, endIndex, filter],
  );

  const uni = chainId ? GlobalData.tokens.UNI[chainId] : undefined;

  const rewardsAddresses = useMemo(
    () => info.map(({ stakingRewardAddress }) => stakingRewardAddress),
    [info],
  );
  // const pairAddresses = useMemo(() => info.map(({ pair }) => pair), [info]);

  // useEffect(() => {
  //   getBulkPairData(allPairAddress);
  // }, [allPairAddress]);

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

  const baseTokens = info.map((item) => {
    const unwrappedCurrency = unwrappedToken(item.baseToken);
    const empty = unwrappedToken(returnTokenFromKey('EMPTY'));
    return unwrappedCurrency === empty ? item.tokens[0] : item.baseToken;
  });

  const usdPrices = useUSDCPrices(baseTokens);
  const totalSupplys = useTotalSupplys(
    info.map((item) => {
      const lp = item.lp;
      const dummyPair = new Pair(
        new TokenAmount(item.tokens[0], '0'),
        new TokenAmount(item.tokens[1], '0'),
      );
      return lp && lp !== ''
        ? new Token(137, lp, 18, 'SLP', 'Staked LP')
        : dummyPair.liquidityToken;
    }),
  );
  const stakingPairs = usePairs(info.map((item) => item.tokens));

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
                    JSBI.multiply(totalRewardRate.raw, stakedAmount.raw),
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
              oneDayFee = oneYearFeeAPY * GlobalConst.utils.FEEPERCENT * ratio;
              accountFee = oneDayFee * myRatio;
              oneYearFeeAPY = getOneYearFee(
                oneYearFeeAPY,
                pairs[info[index].pair]?.reserveUSD,
              );
              //console.log(info[index].pair, oneYearFeeAPY);
            }
          }

          let valueOfTotalStakedAmountInBaseToken: TokenAmount | undefined;

          const [, stakingTokenPair] = stakingPairs[index];
          const totalSupply = totalSupplys[index];
          const usdPrice = usdPrices[index];

          if (totalSupply && stakingTokenPair && baseTokens[index]) {
            // take the total amount of LP tokens staked, multiply by ETH value of all LP tokens, divide by all LP tokens
            valueOfTotalStakedAmountInBaseToken = new TokenAmount(
              baseTokens[index],
              JSBI.divide(
                JSBI.multiply(
                  JSBI.multiply(
                    totalStakedAmount.raw,
                    stakingTokenPair.reserveOf(baseTokens[index]).raw,
                  ),
                  JSBI.BigInt(2), // this is b/c the value of LP shares are ~double the value of the WETH they entitle owner to
                ),
                totalSupply.raw,
              ),
            );
          }

          const valueOfTotalStakedAmountInUSDC =
            valueOfTotalStakedAmountInBaseToken &&
            usdPrice?.quote(valueOfTotalStakedAmountInBaseToken);

          const tvl = valueOfTotalStakedAmountInUSDC
            ? valueOfTotalStakedAmountInUSDC.toSignificant()
            : valueOfTotalStakedAmountInBaseToken?.toSignificant();

          const perMonthReturnInRewards =
            (Number(dQuickToQuick) * Number(quickPrice) * 30) /
            Number(valueOfTotalStakedAmountInUSDC?.toSignificant(6));

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
            tvl,
            perMonthReturnInRewards,
            valueOfTotalStakedAmountInBaseToken,
            usdPrice,
            stakingTokenPair,
            totalSupply,
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
    baseTokens,
    totalSupplys,
    usdPrices,
    stakingPairs,
  ]).filter((stakingInfo) =>
    filter && filter.isStaked
      ? stakingInfo.stakedAmount.greaterThan('0')
      : true,
  );
}

export function useOldStakingInfo(
  pairToFilterBy?: Pair | null,
  startIndex?: number,
  endIndex?: number,
  filter?: { search: string; isStaked: boolean },
): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React();

  const info = useMemo(
    () =>
      chainId
        ? OLD_STAKING_REWARDS_INFO[chainId]
            ?.slice(startIndex, endIndex)
            ?.filter((stakingRewardInfo) =>
              pairToFilterBy === undefined || pairToFilterBy === null
                ? getSearchFiltered(
                    stakingRewardInfo,
                    filter ? filter.search : '',
                  )
                : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
                  pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1]),
            ) ?? []
        : [],
    [chainId, pairToFilterBy, startIndex, endIndex, filter],
  );

  const uni = chainId ? GlobalData.tokens.UNI[chainId] : undefined;

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

  const stakingPairs = usePairs(info.map((item) => item.tokens));

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

          const [, stakingTokenPair] = stakingPairs[index];

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
            stakingTokenPair,
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
    stakingPairs,
  ]).filter((stakingInfo) =>
    filter && filter.isStaked
      ? stakingInfo.stakedAmount.greaterThan('0')
      : true,
  );
}

export function useTotalUniEarned(): TokenAmount | undefined {
  const { chainId } = useActiveWeb3React();
  const uni = chainId ? GlobalData.tokens.UNI[chainId] : undefined;
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
  stakingToken: Token | undefined,
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
