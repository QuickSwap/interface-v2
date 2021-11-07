import { ChainId, JSBI, Percent, Token, WETH } from "@uniswap/sdk";
import { AbstractConnector } from "@web3-react/abstract-connector";

import {
  injected,
  walletconnect,
  walletlink,
  portis,
  arkaneconnect,
  safeApp,
} from "../connectors";

export const ROUTER_ADDRESS = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff"; //'0x6207A65a8bbc87dD02C3109D2c74a6bCE4af1C8c';//

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const LAIR_ADDRESS = "0xf28164a485b0b2c90639e47b0f377b4a438a16b1";

export const QUICK_ADDRESS = "0x831753DD7087CaC61aB5644b308642cc1c33Dc13";

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[];
};

//Remove these 2 after testing
export const TOKENA = new Token(
  ChainId.MATIC,
  "0xd46422d62c1d3b6b6934727be2f8aad4162a88dc",
  18,
  "TokenA",
  "TokenA"
);
export const TOKENB = new Token(
  ChainId.MATIC,
  "0xc447b32a05819d82b06bf95f9bb878f6ae9c7ecc",
  18,
  "TokenB",
  "TokenA"
);

export const EMPTY = new Token(
  ChainId.MATIC,
  "0x0000000000000000000000000000000000000000",
  0,
  "EMPTY",
  "EMPTY"
);
export const DAI = new Token(
  ChainId.MATIC,
  "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  18,
  "DAI",
  "Dai Stablecoin"
);
export const USDC = new Token(
  ChainId.MATIC,
  "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  6,
  "USDC",
  "USDC"
);
export const USDT = new Token(
  ChainId.MATIC,
  "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  6,
  "USDT",
  "Tether USD"
);
export const COMP = new Token(
  ChainId.MATIC,
  "0x8505b9d2254A7Ae468c0E9dd10Ccea3A837aef5c",
  18,
  "COMP",
  "Compound"
);
export const UNITOKEN = new Token(
  ChainId.MATIC,
  "0xb33EaAd8d922B1083446DC23f610c2567fB5180f",
  18,
  "UNI",
  "Uniswap"
);
//export const TT01 = new Token(ChainId.MATIC, '0x55BeE1bD3Eb9986f6d2d963278de09eE92a3eF1D', 18, 'TT01', 'Test Token 01')
//export const TT02 = new Token(ChainId.MATIC, '0xF6Ad3CcF71Abb3E12beCf6b3D2a74C963859ADCd', 18, 'TT01', 'Test Token 02')
export const ETHER = new Token(
  ChainId.MATIC,
  "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  18,
  "ETH",
  "Ether"
);
export const QUICK = new Token(
  ChainId.MATIC,
  "0x831753DD7087CaC61aB5644b308642cc1c33Dc13",
  18,
  "QUICK",
  "QuickSwap"
);
export const WBTC = new Token(
  ChainId.MATIC,
  "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
  18,
  "wBTC",
  "Wrapped Bitcoin"
);
export const IGG = new Token(
  ChainId.MATIC,
  "0xe6FC6C7CB6d2c31b359A49A33eF08aB87F4dE7CE",
  18,
  "IGG",
  "IG Gold"
);
export const OM = new Token(
  ChainId.MATIC,
  "0xC3Ec80343D2bae2F8E680FDADDe7C17E71E114ea",
  18,
  "OM",
  "OM Mantra DAO"
);
export const GHST = new Token(
  ChainId.MATIC,
  "0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7",
  18,
  "GHST",
  "Aavegotchi GHST Token"
);
export const MAUSDC = new Token(
  ChainId.MATIC,
  "0x9719d867A500Ef117cC201206B8ab51e794d3F82",
  6,
  "maUSDC",
  "Matic Aave interest bearing USDC"
);
export const MADAI = new Token(
  ChainId.MATIC,
  "0xE0b22E0037B130A9F56bBb537684E6fA18192341",
  18,
  "maDAI",
  "Matic Aave interest bearing DAI"
);
//export const SWG  = new Token(ChainId.MATIC, '0x043a3aa319b563ac25d4e342d32bffb51298db7b', 18, 'SWG', 'Swirge')
//export const RBAL  = new Token(ChainId.MATIC, '0x03247a4368A280bEc8133300cD930A3a61d604f6', 18, 'RBAL', 'Rebalance Token')
export const DG = new Token(
  ChainId.MATIC,
  "0x2a93172c8DCCbfBC60a39d56183B7279a2F647b4",
  18,
  "$DG",
  "decentral.games"
);
export const SX = new Token(
  ChainId.MATIC,
  "0x840195888Db4D6A99ED9F73FcD3B225Bb3cB1A79",
  18,
  "SX",
  "SportX"
);
//export const WRX  = new Token(ChainId.MATIC, '0x72d6066F486bd0052eefB9114B66ae40e0A6031a', 8, 'WRX', 'WazirX')
//export const MUST  = new Token(ChainId.MATIC, '0x9C78EE466D6Cb57A4d01Fd887D2b5dFb2D46288f', 18, 'MUST', 'Must')
export const FRAX = new Token(
  ChainId.MATIC,
  "0x104592a158490a9228070E0A8e5343B499e125D0",
  18,
  "FRAX",
  "FRAX"
);
export const FXS = new Token(
  ChainId.MATIC,
  "0x3e121107F6F22DA4911079845a470757aF4e1A1b",
  18,
  "FXS",
  "Frax Shares"
);
export const MAWETH = new Token(
  ChainId.MATIC,
  "0x20D3922b4a1A8560E1aC99FBA4faDe0c849e2142",
  18,
  "maWETH",
  "Matic Aave interest bearing WETH"
);
export const MAAAVE = new Token(
  ChainId.MATIC,
  "0x823CD4264C1b951C9209aD0DeAea9988fE8429bF",
  18,
  "maAAVE",
  "Matic Aave interest bearing AAVE"
);
export const MALINK = new Token(
  ChainId.MATIC,
  "0x98ea609569bD25119707451eF982b90E3eb719cD",
  18,
  "maLINK",
  "Matic Aave interest bearing LINK"
);
export const MAUSDT = new Token(
  ChainId.MATIC,
  "0xDAE5F1590db13E3B40423B5b5c5fbf175515910b",
  6,
  "maUSDT",
  "Matic Aave interest bearing USDT"
);
export const MATUSD = new Token(
  ChainId.MATIC,
  "0xF4b8888427b00d7caf21654408B7CBA2eCf4EbD9",
  18,
  "maTUSD",
  "Matic Aave interest bearing TUSD"
);
export const MAUNI = new Token(
  ChainId.MATIC,
  "0x8c8bdBe9CeE455732525086264a4Bf9Cf821C498",
  18,
  "maUNI",
  "Matic Aave interest bearing UNI"
);
export const MAYFI = new Token(
  ChainId.MATIC,
  "0xe20f7d1f0eC39C4d5DB01f53554F2EF54c71f613",
  18,
  "maYFI",
  "Matic Aave interest bearing YFI"
);
//export const MRBAL  = new Token(ChainId.MATIC, '0x66768ad00746aC4d68ded9f64886d55d5243f5Ec', 18, 'mRBAL', 'Matic Rebalance Token')
export const GAME = new Token(
  ChainId.MATIC,
  "0x8d1566569d5b695d44a9a234540f68D393cDC40D",
  18,
  "GAME",
  "GAME Credits"
);
//export const SENT  = new Token(ChainId.MATIC, '0x48e3883233461C2eF4cB3FcF419D6db07fb86CeA', 8, 'SENT', 'Sentinel')
export const ELET = new Token(
  ChainId.MATIC,
  "0x07738Eb4ce8932CA961c815Cb12C9d4ab5Bd0Da4",
  18,
  "ELET",
  "Elementum"
);
export const HEX = new Token(
  ChainId.MATIC,
  "0x23D29D30e35C5e8D321e1dc9A8a61BFD846D4C5C",
  8,
  "HEX",
  "HEXX"
);
export const SWAP = new Token(
  ChainId.MATIC,
  "0x3809dcDd5dDe24B37AbE64A5a339784c3323c44F",
  18,
  "SWAP",
  "TrustSwap Token"
);
export const DB = new Token(
  ChainId.MATIC,
  "0x0e59D50adD2d90f5111aca875baE0a72D95B4762",
  18,
  "DB",
  "Dark.Build"
);
//export const ZUT  = new Token(ChainId.MATIC, '0xe86E8beb7340659DDDCE61727E500e3A5aD75a90', 18, 'ZUT', 'ZeroUtility')

export const UBT = new Token(
  ChainId.MATIC,
  "0x7FBc10850caE055B27039aF31bD258430e714c62",
  8,
  "UBT",
  "Unibright"
);
export const VISION = new Token(
  ChainId.MATIC,
  "0x034b2090b579228482520c589dbD397c53Fc51cC",
  18,
  "VISION",
  "Vision Token"
);
export const IFARM = new Token(
  ChainId.MATIC,
  "0xab0b2ddB9C7e440fAc8E140A89c0dbCBf2d7Bbff",
  18,
  "iFARM",
  "iFARM"
);
//export const PPDEX  = new Token(ChainId.MATIC, '0x127984b5E6d5c59f81DACc9F1C8b3Bdc8494572e', 18, 'PPDEX', 'Pepedex')

export const CEL = new Token(
  ChainId.MATIC,
  "0xd85d1e945766fea5eda9103f918bd915fbca63e6",
  4,
  "CEL",
  "Celsius"
);
export const ARIA20 = new Token(
  ChainId.MATIC,
  "0x46F48FbdedAa6F5500993BEDE9539ef85F4BeE8e",
  18,
  "ARIA20",
  "ARIANEE"
);
//export const CFI  = new Token(ChainId.MATIC, '0xeCf8f2FA183b1C4d2A269BF98A54fCe86C812d3e', 18, 'CFI', 'CyberFi Token')
export const DSLA = new Token(
  ChainId.MATIC,
  "0xa0E390e9ceA0D0e8cd40048ced9fA9EA10D71639",
  18,
  "DSLA",
  "DSLA"
);
//export const DRC  = new Token(ChainId.MATIC, '0xFeD16c746CB5BFeD009730f9E3e6A673006105c7', 0, 'DRC', 'Digital Reserve Currency')
export const LINK = new Token(
  ChainId.MATIC,
  "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39",
  18,
  "LINK",
  "Chainlink Token"
);

export const SUPER = new Token(
  ChainId.MATIC,
  "0xa1428174F516F527fafdD146b883bB4428682737",
  18,
  "SUPER",
  "SuperFarm"
);
//export const XMARK  = new Token(ChainId.MATIC, '0xf153eff70dc0bf3b085134928daeea248d9b30d0', 9, 'xMARK', 'Standard')
export const DEFI5 = new Token(
  ChainId.MATIC,
  "0x42435F467D33e5C4146a4E8893976ef12BBCE762",
  18,
  "DEFI5",
  "DEFI Top 5 Tokens Index"
);
//export const AZUKI  = new Token(ChainId.MATIC, '0x7CdC0421469398e0F3aA8890693d86c840Ac8931', 18, 'AZUKI', 'DokiDokiAzuki')
//export const HH  = new Token(ChainId.MATIC, '0x521CddC0CBa84F14c69C1E99249F781AA73Ee0BC', 18, 'HH', 'Holyheld')
//export const MDEF  = new Token(ChainId.MATIC, '0x82B6205002ecd05e97642D38D61e2cFeaC0E18cE', 9, 'mDEF', 'Matic Deflect Protocol')
//export const DMT  = new Token(ChainId.MATIC, '0xd28449BB9bB659725aCcAd52947677ccE3719fD7', 18, 'DMT', 'Dark Matter Token')
export const DEGEN = new Token(
  ChainId.MATIC,
  "0x8a2870fb69A90000D6439b7aDfB01d4bA383A415",
  18,
  "DEGEN",
  "DEGEN Index"
);
export const DQUICK = new Token(
  ChainId.MATIC,
  "0xf28164A485B0B2C90639E47b0f377b4a438a16B1",
  18,
  "dQUICK",
  "Dragon QUICK"
);
export const MONA = new Token(
  ChainId.MATIC,
  "0x6968105460f67c3BF751bE7C15f92F5286Fd0CE5",
  18,
  "MONA",
  "Monavale"
);
export const WISE = new Token(
  ChainId.MATIC,
  "0xB77e62709e39aD1cbeEBE77cF493745AeC0F453a",
  18,
  "WISE",
  "Wise Token"
);
export const CC10 = new Token(
  ChainId.MATIC,
  "0x9c49BA0212Bb5Db371e66b59D1565b7c06E4894e",
  18,
  "CC10",
  "Cryptocurrency Top Tokens Index"
);
export const MOCEAN = new Token(
  ChainId.MATIC,
  "0x282d8efCe846A88B159800bd4130ad77443Fa1A1",
  18,
  "mOCEAN",
  "Ocean Token"
);
//export const ZUZ  = new Token(ChainId.MATIC, '0x232eaB56c4fB3f84c6Fb0a50c087c74b7B43c6Ad', 18, 'ZUZ', 'Zeus')

//export const BTU  = new Token(ChainId.MATIC, '0xFdc26CDA2d2440d0E83CD1DeE8E8bE48405806DC', 18, 'BTU', 'BTU Protocol')
export const WOLF = new Token(
  ChainId.MATIC,
  "0x8f18dC399594b451EdA8c5da02d0563c0b2d0f16",
  9,
  "WOLF",
  "moonwolf.io"
);
export const AGA = new Token(
  ChainId.MATIC,
  "0x033d942A6b495C4071083f4CDe1f17e986FE856c",
  4,
  "AGA",
  "AGA Token"
);
export const AGAr = new Token(
  ChainId.MATIC,
  "0xF84BD51eab957c2e7B7D646A3427C5A50848281D",
  8,
  "AGAr",
  "AGA Rewards"
);
//export const CTSI  = new Token(ChainId.MATIC, '0x2727Ab1c2D22170ABc9b595177B2D5C6E1Ab7B7B', 18, 'CTSI', 'Cartesi Token')
export const TEL = new Token(
  ChainId.MATIC,
  "0xdF7837DE1F2Fa4631D716CF2502f8b230F1dcc32",
  2,
  "TEL",
  "Telcoin"
);

export const GFARM2 = new Token(
  ChainId.MATIC,
  "0x7075cAB6bCCA06613e2d071bd918D1a0241379E2",
  18,
  "GFARM2",
  "Gains V2"
);
//export const NFTP  = new Token(ChainId.MATIC, '0xf7d9e281c5Cb4C6796284C5b663b3593D2037aF2', 18, 'NFTP', 'NFT Platform Index')

export const AAVE = new Token(
  ChainId.MATIC,
  "0xD6DF932A45C0f255f85145f286eA0b292B21C90B",
  18,
  "AAVE",
  "Aave"
);
//export const FSN  = new Token(ChainId.MATIC, '0x2bF9b864cdc97b08B6D79ad4663e71B8aB65c45c', 18, 'FSN', 'Fusion')
//export const ANY  = new Token(ChainId.MATIC, '0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8', 18, 'Any', 'Anyswap')
//export const PLOT  = new Token(ChainId.MATIC, '0xe82808eaA78339b06a691fd92E1Be79671cAd8D3', 18, 'PLOT', 'PLOT')
//export const OPU  = new Token(ChainId.MATIC, '0x7ff2FC33E161E3b1C6511B934F0209D304267857', 18, 'OPU', 'Opu Coin')
//export const KRILL  = new Token(ChainId.MATIC, '0x05089C9EBFFa4F0AcA269e32056b1b36B37ED71b', 18, 'Krill', 'Krill')
//export const FISH  = new Token(ChainId.MATIC, '0x3a3Df212b7AA91Aa0402B9035b098891d276572B', 18, 'FISH', 'Fish')

export const BIFI = new Token(
  ChainId.MATIC,
  "0xFbdd194376de19a88118e84E279b977f165d01b8",
  18,
  "BIFI",
  "beefy.finance"
);
export const QI = new Token(
  ChainId.MATIC,
  "0x580A84C73811E1839F75d86d75d88cCa0c241fF4",
  18,
  "QI",
  "Qi Dao"
);
export const MI = new Token(
  ChainId.MATIC,
  "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1",
  18,
  "MAI",
  "miMATIC"
);
export const POLYDOGE = new Token(
  ChainId.MATIC,
  "0x8A953CfE442c5E8855cc6c61b1293FA648BAE472",
  18,
  "PolyDoge",
  "PolyDoge"
);
export const EMON = new Token(
  ChainId.MATIC,
  "0xd6a5ab46ead26f49b03bbb1f9eb1ad5c1767974a",
  18,
  "EMON",
  "EthermonToken"
);

//export const MOON  = new Token(ChainId.MATIC, '0xc56d17dD519e5eB43a19C9759b5D5372115220BD', 18, 'MOON', 'Polywolf')
export const ADDY = new Token(
  ChainId.MATIC,
  "0xc3FdbadC7c795EF1D6Ba111e06fF8F16A20Ea539",
  18,
  "ADDY",
  "Adamant"
);
export const QuickChart = new Token(
  ChainId.MATIC,
  "0x0Af77B096cbDF53B5c39c2fcff8F14C5E3a36356",
  9,
  "QuickChart",
  "QuickChart"
);
export const PAUTO = new Token(
  ChainId.MATIC,
  "0x7f426F6Dc648e50464a0392E60E1BB465a67E9cf",
  18,
  "PAUTO",
  "Orbit Bridge Polygon AUTOv2"
);
export const UFT = new Token(
  ChainId.MATIC,
  "0x5B4CF2C120A9702225814E18543ee658c5f8631e",
  18,
  "UFT",
  "UniLend Finance Token"
);

export const IRON = new Token(
  ChainId.MATIC,
  "0xD86b5923F3AD7b585eD81B448170ae026c65ae9a",
  18,
  "IRON",
  "IRON Stablecoin"
);
export const TITAN = new Token(
  ChainId.MATIC,
  "0xaAa5B9e6c589642f98a1cDA99B9D024B8407285A",
  18,
  "TITAN",
  "IRON Titanium Token"
);
//export const ZEE  = new Token(ChainId.MATIC, '0xfd4959c06FbCc02250952DAEbf8e0Fb38cF9FD8C', 18, 'ZEE', 'ZeroSwapToken')
export const FFF = new Token(
  ChainId.MATIC,
  "0x9aCeB6f749396d1930aBc9e263eFc449E5e82c13",
  18,
  "FFF",
  "Future of Finance Fund"
);
export const IQ = new Token(
  ChainId.MATIC,
  "0xB9638272aD6998708de56BBC0A290a1dE534a578",
  18,
  "IQ",
  "Everipedia IQ"
);
//export const INRP  = new Token(ChainId.MATIC, '0xde485931674F4EdD3Ed3bf22e86E7d3C7D5347a1', 18, 'INRP', 'Rupeeto')

//export const GFI  = new Token(ChainId.MATIC, '0x874e178A2f3f3F9d34db862453Cd756E7eAb0381', 18, 'GFI', 'Gravity Finance')
export const CHUM = new Token(
  ChainId.MATIC,
  "0x2e2DDe47952b9c7deFDE7424d00dD2341AD927Ca",
  18,
  "CHUM",
  "ChumHum"
);
//export const ELE  = new Token(ChainId.MATIC, '0xAcD7B3D9c10e97d0efA418903C0c7669E702E4C0', 18, 'ELE', 'Eleven.finance')
//export const CRV  = new Token(ChainId.MATIC, '0x172370d5Cd63279eFa6d502DAB29171933a610AF', 18, 'CRV', 'CRV')

export const PBNB = new Token(
  ChainId.MATIC,
  "0x7e9928aFe96FefB820b85B4CE6597B8F660Fe4F4",
  18,
  "PBNB",
  "Orbit Bridge Polygon Binance Coin"
);
export const IOI = new Token(
  ChainId.MATIC,
  "0xAF24765F631C8830B5528B57002241eE7eef1C14",
  6,
  "IOI",
  "IOI Token"
);
export const ERN = new Token(
  ChainId.MATIC,
  "0x0E50BEA95Fe001A370A4F1C220C49AEdCB982DeC",
  18,
  "ERN",
  "Ethernity Chain"
);
export const RAMP = new Token(
  ChainId.MATIC,
  "0xaECeBfcF604AD245Eaf0D5BD68459C3a7A6399c2",
  18,
  "RAMP",
  "RAMP"
);
export const RUSD = new Token(
  ChainId.MATIC,
  "0xfC40a4F89b410a1b855b5e205064a38fC29F5eb5",
  18,
  "rUSD",
  "rUSD"
);
//export const MEM  = new Token(ChainId.MATIC, '0x42dbBd5ae373FEA2FC320F62d44C058522Bb3758', 18, 'MEM', 'Memecoin')
export const WBUSD = new Token(
  ChainId.MATIC,
  "0x87ff96aba480f1813aF5c780387d8De7cf7D8261",
  18,
  "WBUSD",
  "Wrapped BUSD"
);
//export const BORING  = new Token(ChainId.MATIC, '0xff88434E29d1E2333aD6baa08D358b436196da6b', 18, 'BORING', 'BoringDAO')
export const WOO = new Token(
  ChainId.MATIC,
  "0x1B815d120B3eF02039Ee11dC2d33DE7aA4a8C603",
  18,
  "WOO",
  "Wootrade Network"
);

export const START = new Token(
  ChainId.MATIC,
  "0x6Ccf12B480A99C54b23647c995f4525D544A7E72",
  18,
  "START",
  "BSCstarter"
);
//export const SAFU  = new Token(ChainId.MATIC, '0x26f6Cb841F9D4D72b68D7dCb6fDB5d6C832dD2A7', 9, 'SAFU', 'polySAFU')
export const HONOR = new Token(
  ChainId.MATIC,
  "0xb82A20B4522680951F11c94c54B8800c1C237693",
  18,
  "HONOR",
  "HONOR"
);
//export const FSW  = new Token(ChainId.MATIC, '0xad5dc12E88C6534Eea8cFe2265851D9d4A1472AD', 18, 'FSW', 'FalconSwap Token')
export const YAYO = new Token(
  ChainId.MATIC,
  "0xf7058856f405542cd660e8ce4751248F2d037f2B",
  4,
  "YAYO",
  "YAYO Coin"
);
export const CGG = new Token(
  ChainId.MATIC,
  "0x2Ab4f9aC80F33071211729e45Cfc346C1f8446d5",
  18,
  "CGG",
  "ChainGuardians Governance Token"
);

export const BUNNY = new Token(
  ChainId.MATIC,
  "0x4C16f69302CcB511c5Fac682c7626B9eF0Dc126a",
  18,
  "polyBUNNY",
  "Polygon BUNNY Token"
);
export const GBTS = new Token(
  ChainId.MATIC,
  "0xbe9512e2754cb938dd69Bbb96c8a09Cb28a02D6D",
  18,
  "GBTS",
  "GemBites"
);

export const FOR = new Token(
  ChainId.MATIC,
  "0x546b4c391520E6652897c65153074088BFC0A909",
  18,
  "FOR",
  "The Force Token"
);
export const RDOGE = new Token(
  ChainId.MATIC,
  "0xcE829A89d4A55a63418bcC43F00145adef0eDB8E",
  8,
  "renDOGE",
  "renDOGE"
);

export const COMBO = new Token(
  ChainId.MATIC,
  "0x6DdB31002abC64e1479Fc439692F7eA061e78165",
  18,
  "COMBO",
  "Furucombo"
);
export const FEAR = new Token(
  ChainId.MATIC,
  "0xa2CA40DBe72028D3Ac78B5250a8CB8c404e7Fb8C",
  18,
  "FEAR",
  "Fear NFTs"
);

export const MBTM = new Token(
  ChainId.MATIC,
  "0xA16EbA3b7562FC92597579A80Fe53a92DCab7122",
  8,
  "mBTM",
  "Bytom minted"
);
export const RENDGB = new Token(
  ChainId.MATIC,
  "0x2628568509E87c4429fBb5c664Ed11391BE1BD29",
  8,
  "renDGB",
  "renDGB"
);
export const NEXO = new Token(
  ChainId.MATIC,
  "0x41b3966B4FF7b427969ddf5da3627d6AEAE9a48E",
  18,
  "NEXO",
  "Nexo"
);

export const GNO = new Token(
  ChainId.MATIC,
  "0x5FFD62D3C3eE2E81C00A7b9079FB248e7dF024A8",
  18,
  "GNO",
  "Gnosis Token"
);

export const BEL = new Token(
  ChainId.MATIC,
  "0x28C388FB1F4fa9F9eB445f0579666849EE5eeb42",
  18,
  "BEL",
  "Bella"
);
export const SOL = new Token(
  ChainId.MATIC,
  "0x7DfF46370e9eA5f0Bad3C4E29711aD50062EA7A4",
  18,
  "SOL",
  "SOL"
);
export const PUSD = new Token(
  ChainId.MATIC,
  "0x9aF3b7DC29D3C4B1A5731408B6A9656fA7aC3b72",
  18,
  "PUSD",
  "PUSD"
);
export const DINO = new Token(
  ChainId.MATIC,
  "0xAa9654BECca45B5BDFA5ac646c939C62b527D394",
  18,
  "DINO",
  "DinoSwap"
);
export const PYR = new Token(
  ChainId.MATIC,
  "0x348e62131fce2F4e0d5ead3Fe1719Bc039B380A9",
  18,
  "PYR",
  "PYR Token"
);
export const YAMP = new Token(
  ChainId.MATIC,
  "0x87f654c4b347230C60CAD8d7ea9cF0D7238bcc79",
  18,
  "YAMP",
  "YAMP.FINANCE"
);

export const OMEN = new Token(
  ChainId.MATIC,
  "0x76e63a3E7Ba1e2E61D3DA86a87479f983dE89a7E",
  18,
  "OMEN",
  "Augury Finance"
);
export const KOGECOIN = new Token(
  ChainId.MATIC,
  "0x13748d548D95D78a3c83fe3F32604B4796CFfa23",
  9,
  "KOGECOIN",
  "kogecoin.io"
);
export const MEEB = new Token(
  ChainId.MATIC,
  "0x64aFDF9e28946419E325d801Fb3053d8B8FFdC23",
  18,
  "MEEB",
  "MeebMaster.com Token"
);
export const IMX = new Token(
  ChainId.MATIC,
  "0x60bB3D364B765C497C8cE50AE0Ae3f0882c5bD05",
  18,
  "IMX",
  "Impermax"
);
export const AVAX = new Token(
  ChainId.MATIC,
  "0x2C89bbc92BD86F8075d1DEcc58C7F4E0107f286b",
  18,
  "AVAX",
  "Avalanche Token"
);
export const GUARD = new Token(
  ChainId.MATIC,
  "0x948d2a81086A075b3130BAc19e4c6DEe1D2E3fE8",
  18,
  "Guard",
  "Helmet.insure on Polygon"
);
export const YEL = new Token(
  ChainId.MATIC,
  "0xD3b71117E6C1558c1553305b44988cd944e97300",
  18,
  "YEL",
  "YEL Token"
);
export const PSWAMP = new Token(
  ChainId.MATIC,
  "0x5f1657896B38c4761dbc5484473c7A7C845910b6",
  18,
  "pSwamp",
  "pSwampy"
);
export const RELAY = new Token(
  ChainId.MATIC,
  "0x904371845Bc56dCbBcf0225ef84a669b2fD6bd0d",
  18,
  "RELAY",
  "Relay Token"
);

export const ADS = new Token(
  ChainId.MATIC,
  "0x598e49f01bEfeB1753737934a5b11fea9119C796",
  11,
  "ADS",
  "Adshares"
);
export const O3 = new Token(
  ChainId.MATIC,
  "0xEe9801669C6138E84bD50dEB500827b776777d28",
  18,
  "O3",
  "O3 Swap Token"
);
export const EZ = new Token(
  ChainId.MATIC,
  "0x34C1b299A74588D6Abdc1b85A53345A48428a521",
  18,
  "EZ",
  "EASY V2"
);
export const DNXC = new Token(
  ChainId.MATIC,
  "0xcaF5191fc480F43e4DF80106c7695ECA56E48B18",
  18,
  "DNXC",
  "DinoX Coin"
);
export const POOL = new Token(
  ChainId.MATIC,
  "0x25788a1a171ec66Da6502f9975a15B609fF54CF6",
  18,
  "POOL",
  "PoolTogether"
);

export const MOD = new Token(
  ChainId.MATIC,
  "0x8346Ab8d5EA7A9Db0209aEd2d1806AFA0E2c4C21",
  18,
  "MOD",
  "MODEFI"
);
export const EGG = new Token(
  ChainId.MATIC,
  "0x245e5ddb65eFea6522Fa913229dF1f4957fB2e21",
  18,
  "EGG",
  "LoserchickEgg"
);
export const CHICK = new Token(
  ChainId.MATIC,
  "0x9e725Cf7265D12fd5f59499AFf1258CA92CAc74d",
  18,
  "CHICK",
  "loserchick"
);
export const HT = new Token(
  ChainId.MATIC,
  "0xA731349fa468614c1698fc46ebf06Da6F380239e",
  18,
  "HT",
  "Huobi Token"
);

export const CIOTX = new Token(
  ChainId.MATIC,
  "0x300211Def2a644b036A9bdd3e58159bb2074d388",
  18,
  "CIOTX",
  "Crosschain IOTX"
);
export const REVV = new Token(
  ChainId.MATIC,
  "0x70c006878a5A50Ed185ac4C87d837633923De296",
  18,
  "REVV",
  "REVV"
);

export const XCAD = new Token(
  ChainId.MATIC,
  "0xA55870278d6389ec5B524553D03C04F5677c061E",
  18,
  "XCAD",
  "XCAD Token"
);
export const XED = new Token(
  ChainId.MATIC,
  "0x2fe8733dcb25BFbbA79292294347415417510067",
  18,
  "XED",
  "Exeedme"
);
export const OOE = new Token(
  ChainId.MATIC,
  "0x9d5565dA88e596730522CbC5a918d2A89dbC16d9",
  18,
  "OOE",
  "OpenOcean"
);
export const MOONED = new Token(
  ChainId.MATIC,
  "0x7E4c577ca35913af564ee2a24d882a4946Ec492B",
  18,
  "MOONED",
  "MoonEdge"
);
export const DHV = new Token(
  ChainId.MATIC,
  "0x5fCB9de282Af6122ce3518CDe28B7089c9F97b26",
  18,
  "DHV",
  "DeHive."
);
export const WOW = new Token(
  ChainId.MATIC,
  "0x855D4248672a1fCE482165e8DBE1207b94b1968a",
  18,
  "WOW",
  "WOWswap"
);

export const ANRX = new Token(
  ChainId.MATIC,
  "0x554f074d9cCda8F483d1812d4874cBebD682644E",
  18,
  "$ANRX",
  "AnRKey X"
);
export const MASK = new Token(
  ChainId.MATIC,
  "0x2B9E7ccDF0F4e5B24757c1E1a80e311E34Cb10c7",
  18,
  "MASK",
  "Mask Network"
);
export const RING = new Token(
  ChainId.MATIC,
  "0x9C1C23E60B72Bc88a043bf64aFdb16A02540Ae8f",
  18,
  "Ring",
  "Darwinia"
);
export const TCP = new Token(
  ChainId.MATIC,
  "0x032F85b8FbF8540a92B986d953e4C3A61C76d39E",
  18,
  "TCP",
  "The Crypto Prophecies"
);
export const ANGEL = new Token(
  ChainId.MATIC,
  "0x0B6afe834dab840335F87d99b45C2a4bd81A93c7",
  18,
  "ANGEL",
  "Angel"
);
export const UGT = new Token(
  ChainId.MATIC,
  "0xBa4c54Ea2d66b904C82847A7d2357d22B857E812",
  18,
  "UGT",
  "Unreal Governance Token"
);
export const KOM = new Token(
  ChainId.MATIC,
  "0xC004e2318722EA2b15499D6375905d75Ee5390B8",
  8,
  "KOM",
  "Kommunitas"
);
export const UST = new Token(
  ChainId.MATIC,
  "0x692597b009d13C4049a947CAB2239b7d6517875F",
  18,
  "UST",
  "Wrapped UST Token"
);
export const LUNA = new Token(
  ChainId.MATIC,
  "0x24834BBEc7E39ef42f4a75EAF8E5B6486d3F0e57",
  18,
  "LUNA",
  "Wrapped LUNA Token"
);
export const CNTR = new Token(
  ChainId.MATIC,
  "0xdae89dA41a96956e9e70320Ac9c0dd077070D3a5",
  18,
  "CNTR",
  "Centaur Token"
);
export const TRADE = new Token(
  ChainId.MATIC,
  "0x692AC1e363ae34b6B489148152b12e2785a3d8d6",
  18,
  "TRADE",
  "Polytrade"
);

export const PLR = new Token(
  ChainId.MATIC,
  "0xa6b37fC85d870711C56FbcB8afe2f8dB049AE774",
  18,
  "PLR",
  "PILLAR"
);
export const RENBTC = new Token(
  ChainId.MATIC,
  "0xDBf31dF14B66535aF65AaC99C32e9eA844e14501",
  8,
  "renBTC",
  "renBTC"
);
export const ORBS = new Token(
  ChainId.MATIC,
  "0x614389EaAE0A6821DC49062D56BDA3d9d45Fa2ff",
  18,
  "ORBS",
  "Orbs"
);
export const SHI3LD = new Token(
  ChainId.MATIC,
  "0xF239E69ce434c7Fb408b05a0Da416b14917d934e",
  18,
  "SHI3LD",
  "PolyShield"
);
export const BABYQUICK = new Token(
  ChainId.MATIC,
  "0x9a05D1FF699ea187Dc8523E333eD63503f0d82db",
  18,
  "BABYQUICK",
  "BABYQUICK"
);
export const PERA = new Token(
  ChainId.MATIC,
  "0xe95fD76CF16008c12FF3b3a937CB16Cd9Cc20284",
  18,
  "PERA",
  "PERA"
);
//export const IRIS = new Token(ChainId.MATIC, '0xdaB35042e63E93Cc8556c9bAE482E5415B5Ac4B1', 18, 'IRIS', 'Iris')
export const XCASH = new Token(
  ChainId.MATIC,
  "0x03678f2c2c762DC63c2Bb738c3a837D366eDa560",
  18,
  "XCASH",
  "X-Cash"
);
export const SNK = new Token(
  ChainId.MATIC,
  "0x689f8e5913C158fFB5Ac5aeb83b3C875F5d20309",
  18,
  "SNK",
  "Snook"
);

export const BNB = new Token(
  ChainId.MATIC,
  "0x5c4b7CCBF908E64F32e12c6650ec0C96d717f03F",
  18,
  "BNB",
  "Binance Token"
);
export const ETHA = new Token(
  ChainId.MATIC,
  "0x59E9261255644c411AfDd00bD89162d09D862e38",
  18,
  "ETHA",
  "ETHA"
);
export const MITX = new Token(
  ChainId.MATIC,
  "0x31042A4E66eDa0d12143ffc8cC1552D611dA4cbA",
  18,
  "MITx",
  "Morpheus Infrastructure Token"
);
export const ZUSD = new Token(
  ChainId.MATIC,
  "0x5668F6d40E15188045a1dE6295054103C13ffAc1",
  18,
  "zUSD",
  "Zerogoki USD"
);
export const REI = new Token(
  ChainId.MATIC,
  "0xB9f9e37c2CdbaFF928C3Da730b02F06fE09aE70E",
  18,
  "REI",
  "Zerogoki Token"
);
export const PHX = new Token(
  ChainId.MATIC,
  "0x9C6BfEdc14b5C23E3900889436Edca7805170f01",
  18,
  "PHX",
  "Phoenix Token"
);
export const ODDZ = new Token(
  ChainId.MATIC,
  "0x4e830F67Ec499E69930867f9017AEb5B3f629c73",
  18,
  "ODDZ",
  "OddzToken"
);

export const D11 = new Token(
  ChainId.MATIC,
  "0xc58158c14D4757EF36Ce25e493758F2fcEEDec5D",
  18,
  "D11",
  "DeFi11"
);
export const PBR = new Token(
  ChainId.MATIC,
  "0x0D6ae2a429df13e44A07Cd2969E085e4833f64A0",
  18,
  "PBR",
  "PolkaBridge"
);
export const MVERSE = new Token(
  ChainId.MATIC,
  "0x0B313b4C589A3BD3350f625f2e94DC80AB50017E",
  18,
  "Mverse",
  "MaticVerse"
);
export const TECH = new Token(
  ChainId.MATIC,
  "0x6286A9e6f7e745A6D884561D88F94542d6715698",
  18,
  "TECH",
  "Cryptomeda"
);
export const GMEE = new Token(
  ChainId.MATIC,
  "0xcf32822ff397Ef82425153a9dcb726E5fF61DCA7",
  18,
  "GAMEE",
  "GMEE"
);

export const YFDAI = new Token(
  ChainId.MATIC,
  "0x7E7fF932FAb08A0af569f93Ce65e7b8b23698Ad8",
  18,
  "Yf-DAI",
  "YfDAI.finance"
);
export const MOT = new Token(
  ChainId.MATIC,
  "0x2db0Db271a10661e7090b6758350E18F6798a49D",
  18,
  "MOT",
  "Mobius Token"
);
export const NSDX = new Token(
  ChainId.MATIC,
  "0xE8d17b127BA8b9899a160D9a07b69bCa8E08bfc6",
  18,
  "NSDX",
  "NASDEX Token"
);
export const EROWAN = new Token(
  ChainId.MATIC,
  "0xa7051C5a22d963b81D71C2BA64D46a877fBc1821",
  18,
  "EROWAN",
  "SifChain (erowan)"
);
export const ATOM = new Token(
  ChainId.MATIC,
  "0xac51C4c48Dc3116487eD4BC16542e27B5694Da1b",
  18,
  "ATOM",
  "Cosmos"
);

export const WATCH = new Token(
  ChainId.MATIC,
  "0x09211Dc67f9fe98Fb7bBB91Be0ef05f4a12FA2b2",
  18,
  "WATCH",
  "yieldwatch"
);
export const MCASH = new Token(
  ChainId.MATIC,
  "0xa25610a77077390A75aD9072A084c5FbC7d43A0d",
  18,
  "MCASH",
  "Monsoon Finance"
);
export const KNIGHT = new Token(
  ChainId.MATIC,
  "0x4455eF8B4B4A007a93DaA12DE63a47EEAC700D9D",
  18,
  "KNIGHT",
  "Forest Knight"
);
export const JRT = new Token(
  ChainId.MATIC,
  "0x596eBE76e2DB4470966ea395B0d063aC6197A8C5",
  18,
  "JRT",
  "Jarvis Reward Token"
);

export const BLOK = new Token(
  ChainId.MATIC,
  "0x229b1b6C23ff8953D663C4cBB519717e323a0a84",
  18,
  "BLOK",
  "BLOK"
);
export const ALN = new Token(
  ChainId.MATIC,
  "0xa8fcEe762642f156b5D757b6FabC36E06b6d4A1A",
  18,
  "ALN",
  "Aluna"
);
export const XPRT = new Token(
  ChainId.MATIC,
  "0xb3b9c016AD1E9f7EFdAE451b04EF696e05658b32",
  6,
  "XPRT",
  "Persistence"
);
export const IRIS = new Token(
  ChainId.MATIC,
  "0x3dc6052a693E4a2fc28Eb2Ea12fe0CfD3BD221D1",
  6,
  "IRIS",
  "IRISnet"
);
export const AKT = new Token(
  ChainId.MATIC,
  "0xf14fbC6B30e2c4BC05A1D4fbE34bf9f14313309D",
  6,
  "AKT",
  "Akash Network"
);
export const UCO = new Token(
  ChainId.MATIC,
  "0x3C720206bFaCB2d16fA3ac0ed87D2048Dbc401Fc",
  18,
  "UCO",
  "UnirisToken"
);
export const REGEN = new Token(
  ChainId.MATIC,
  "0xEc482De9569a5EA3Dd9779039b79e53F15791fDE",
  6,
  "REGEN",
  "Regen Network"
);

export const DPI = new Token(
  ChainId.MATIC,
  "0x85955046DF4668e1DD369D2DE9f3AEB98DD2A369",
  18,
  "DPI",
  "DefiPulse Index"
);
export const FTM = new Token(
  ChainId.MATIC,
  "0xB85517b87BF64942adf3A0B9E4c71E4Bc5Caa4e5",
  18,
  "FTM",
  "Fantom Token"
);
export const ELON = new Token(
  ChainId.MATIC,
  "0xE0339c80fFDE91F3e20494Df88d4206D86024cdF",
  18,
  "ELON",
  "Dogelon"
);
export const SHIB = new Token(
  ChainId.MATIC,
  "0x6f8a06447Ff6FcF75d803135a7de15CE88C1d4ec",
  18,
  "SHIB",
  "SHIBA INU"
);
export const DES = new Token(
  ChainId.MATIC,
  "0xa062fc09cA6bdeb2f6E3b77E1d4e09C42C964742",
  18,
  "DES",
  "DeSpace Protocol"
);
export const SNE = new Token(
  ChainId.MATIC,
  "0x32934CB16DA43fd661116468c1B225Fc26CF9A8c",
  18,
  "SNE",
  "StrongNodeEdge Token"
);

export const ICE = new Token(
  ChainId.MATIC,
  "0xc6C855AD634dCDAd23e64DA71Ba85b8C51E5aD7c",
  18,
  "ICE",
  "Decentral Games ICE"
);
export const UFI = new Token(
  ChainId.MATIC,
  "0x3c205C8B3e02421Da82064646788c82f7bd753B9",
  18,
  "UFI",
  "PureFi Token"
);
export const TETU = new Token(
  ChainId.MATIC,
  "0x255707B70BF90aa112006E1b07B9AeA6De021424",
  18,
  "TETU",
  "TETU Reward Token"
);
export const GNS = new Token(
  ChainId.MATIC,
  "0xE5417Af564e4bFDA1c483642db72007871397896",
  18,
  "GNS",
  "Gains Network"
);
export const SCA = new Token(
  ChainId.MATIC,
  "0x11a819Beb0AA3327E39f52F90d65Cc9bCA499F33",
  18,
  "SCA",
  "ScaleSwapToken"
);

export const TT = new Token(
  ChainId.MATIC,
  "0x16887befea6772175240a8b3aa797c460f80a08e",
  18,
  "TT",
  "Test Token"
);
export const MATIC = WETH[ChainId.MATIC];
// TODO this is only approximate, it's actually based on blocks
export const PROPOSAL_LENGTH_IN_DAYS = 7;

export const GOVERNANCE_ADDRESS = "0x5e4be8Bc9637f0EAA1A755019e06A68ce081D58F"; //TODO: MATIC

const UNI_ADDRESS = "0x831753DD7087CaC61aB5644b308642cc1c33Dc13"; //TODO: MATIC QUICK

export const UNI: { [chainId in ChainId]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    UNI_ADDRESS,
    18,
    "QUICK",
    "Quickswap"
  ),
  [ChainId.MUMBAI]: new Token(
    ChainId.MUMBAI,
    UNI_ADDRESS,
    18,
    "QUICK",
    "Quickswap"
  ),
};

// TODO: specify merkle distributor for mainnet
export const MERKLE_DISTRIBUTOR_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.MATIC]: "0x4087F566796b46eEB01A38174c06E2f9924eAea8", //TODO: MATIC
};

const WETH_ONLY: ChainTokenList = {
  [ChainId.MUMBAI]: [WETH[ChainId.MUMBAI]],
  [ChainId.MATIC]: [WETH[ChainId.MATIC]],
};

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MATIC]: [
    ...WETH_ONLY[ChainId.MATIC],
    USDC,
    USDT,
    QUICK,
    ETHER,
    WBTC,
    DAI,
    MAUSDC,
    MI,
    EROWAN,
  ],
};

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: {
  [chainId in ChainId]?: { [tokenAddress: string]: Token[] };
} = {};

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MATIC]: [
    ...WETH_ONLY[ChainId.MATIC],
    DAI,
    USDC,
    USDT,
    QUICK,
    ETHER,
    WBTC,
  ],
};

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MATIC]: [
    ...WETH_ONLY[ChainId.MATIC],
    DAI,
    USDC,
    USDT,
    QUICK,
    ETHER,
    WBTC,
    MAUSDC,
  ],
};

export const PINNED_PAIRS: {
  readonly [chainId in ChainId]?: [Token, Token][];
} = {
  [ChainId.MATIC]: [
    [USDC, USDT],
    [USDC, DAI],
    [DAI, USDT],
    [ETHER, DAI],
    [ETHER, USDC],
    [WETH[ChainId.MATIC], USDT],
    [WETH[ChainId.MATIC], USDC],
    [WETH[ChainId.MATIC], USDT],
    [WETH[ChainId.MATIC], DAI],
    [WETH[ChainId.MATIC], ETHER],
    [ETHER, QUICK],
    [UNITOKEN, USDT],
    [QUICK, UNITOKEN],
  ],
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

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: "Injected",
    iconName: "arrow-right.svg",
    description: "Injected web3 provider.",
    href: null,
    color: "#010101",
    primary: true,
  },
  METAMASK: {
    connector: injected,
    name: "MetaMask",
    iconName: "metamask.png",
    description: "Easy-to-use browser extension.",
    href: null,
    color: "#E8831D",
  },
  SAFE_APP: {
    connector: safeApp,
    name: "Gnosis Safe App",
    iconName: "gnosis_safe.png",
    description: "Login using gnosis safe app",
    href: null,
    color: "#4196FC",
    mobile: true,
  },
  ARKANE_CONNECT: {
    connector: arkaneconnect,
    name: "Venly",
    iconName: "venly.svg",
    description: "Login using Venly hosted wallet.",
    href: null,
    color: "#4196FC",
  },
  Portis: {
    connector: portis,
    name: "Portis",
    iconName: "portisIcon.png",
    description: "Login using Portis hosted wallet",
    href: null,
    color: "#4A6C9B",
    mobile: true,
  },
  WALLET_LINK: {
    connector: walletlink,
    name: "Coinbase Wallet",
    iconName: "coinbaseWalletIcon.svg",
    description: "Use Coinbase Wallet app on mobile device",
    href: null,
    color: "#315CF5",
  },
  WALLET_CONNECT: {
    connector: walletconnect,
    name: "WalletConnect",
    iconName: "walletConnectIcon.svg",
    description: "Connect to Trust Wallet, Rainbow Wallet and more...",
    href: null,
    color: "#4196FC",
    mobile: true,
  },
};

export const NetworkContextName = "NETWORK";

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50;
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20;

export const BIG_INT_ZERO = JSBI.BigInt(0);

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000));
export const BIPS_BASE = JSBI.BigInt(10000);
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(
  JSBI.BigInt(100),
  BIPS_BASE
); // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(
  JSBI.BigInt(300),
  BIPS_BASE
); // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(
  JSBI.BigInt(500),
  BIPS_BASE
); // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(
  JSBI.BigInt(1000),
  BIPS_BASE
); // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(
  JSBI.BigInt(1500),
  BIPS_BASE
); // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(
  JSBI.BigInt(10),
  JSBI.BigInt(16)
); // .01 ETH
export const BETTER_TRADE_LINK_THRESHOLD = new Percent(
  JSBI.BigInt(75),
  JSBI.BigInt(10000)
);

// the Uniswap Default token list lives here
export const DEFAULT_TOKEN_LIST_URL =
  "https://unpkg.com/quickswap-default-token-list@1.2.4/build/quickswap-default.tokenlist.json";
