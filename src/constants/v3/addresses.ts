import { ChainId, WETH } from '@uniswap/sdk';
import { Token } from '@uniswap/sdk';
import { Token as TokenV3 } from '@uniswap/sdk-core';
import { Matic } from 'v3lib/entities/matic';
import { V3Currency } from 'v3lib/entities/v3Currency';

export enum V2Exchanges {
  Quickswap = 'Quickswap',
  SushiSwap = 'Sushiswap',
  //Uniswap = 'Uniswap',
}

type ExchangeAddressMap = { [exchange in V2Exchanges]: AddressMap };
type AddressMap = { [chainId: number]: string };

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[];
};

const WETH_ONLY: ChainTokenList = {
  [ChainId.MUMBAI]: [WETH[ChainId.MUMBAI]],
  [ChainId.MATIC]: [WETH[ChainId.MATIC]],
  [ChainId.DOEGCHAIN_TESTNET]: [WETH[ChainId.DOEGCHAIN_TESTNET]],
  [ChainId.DOGECHAIN]: [WETH[ChainId.DOGECHAIN]],
  [ChainId.ZKTESTNET]: [WETH[ChainId.ZKTESTNET]],
};

export const toV3Token = (t: {
  chainId: number;
  address: string;
  decimals: number;
  symbol?: string;
  name?: string;
}): TokenV3 => {
  return new TokenV3(t.chainId, t.address, t.decimals, t.symbol, t.name);
};

export const toV3Currency = (t: {
  chainId: number;
  decimals: number;
  symbol?: string;
  name?: string;
}): V3Currency => {
  return new V3Currency(t.chainId, t.decimals, t.symbol, t.name);
};

export const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MUMBAI]: '0xc7efb32470dee601959b15f1f923e017c6a918ca', //TODO: CHANGE THIS
  [ChainId.MATIC]: '0x02817C1e3543c2d908a590F5dB6bc97f933dB4BD',
  [ChainId.DOEGCHAIN_TESTNET]: '0x02817C1e3543c2d908a590F5dB6bc97f933dB4BD',
  [ChainId.DOGECHAIN]: '0x0110B3b142031F85a80Afdc9C7bcAA80dAfe7C63',
  [ChainId.ZKTESTNET]: '0x81D880BfaB1f7f08816D9bd4571E2f5953532287',
};

export const V3_CORE_FACTORY_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0x411b0fAcC3489691f28ad58c47006AF5E3Ab3A28',
  [ChainId.DOGECHAIN]: '0xd2480162Aa7F02Ead7BF4C127465446150D58452',
  [ChainId.ZKTESTNET]: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
};

export const POOL_DEPLOYER_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x2D98E2FA9da15aa6dC9581AB097Ced7af697CB92',
  [ChainId.DOGECHAIN]: '0x56c2162254b0E4417288786eE402c2B41d4e181e',
  [ChainId.ZKTESTNET]: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
};

export const QUOTER_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0xa15F0D7377B2A0C0c10db057f641beD21028FC89',
  [ChainId.DOGECHAIN]: '0xd8E1E7009802c914b0d39B31Fc1759A865b727B1',
  [ChainId.ZKTESTNET]: '0xc7efb32470dEE601959B15f1f923e017C6A918cA',
};

export const SWAP_ROUTER_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0xf5b509bB0909a69B1c207E495f687a596C168E12',
  [ChainId.DOGECHAIN]: '0x4aE2bD0666c76C7f39311b9B3e39b53C8D7C43Ea',
  [ChainId.ZKTESTNET]: '0x4857Dfd11c712e862eC362cEee29F7974B70EfcD',
};

export const SWAP_ROUTER_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0xfaa746afc5ff7d5ef0aa469bb26ddd6cd8f13911',
};

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0x8eF88E4c7CfbbaC1C163f7eddd4B578792201de6',
  [ChainId.DOGECHAIN]: '0x0b012055F770AE7BB7a8303968A7Fb6088A2296e',
  [ChainId.ZKTESTNET]: '0x61530d6E1c7A47BBB3e48e8b8EdF7569DcFeE121',
};

export const GAMMA_UNIPROXY_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0xe0A61107E250f8B5B24bf272baBFCf638569830C',
};

export const GAMMA_MASTERCHEF_ADDRESSES: AddressMap[] = [
  {
    [ChainId.MATIC]: '0x20ec0d06f447d550fc6edee42121bc8c1817b97d',
  },
  {
    [ChainId.MATIC]: '0x68678Cf174695fc2D27bd312DF67A3984364FFDd',
  },
];

export const MULTICALL_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x6ccb9426CeceE2903FbD97fd833fD1D31c100292',
  [ChainId.DOGECHAIN]: '0x23602819a9E2B1C8eC7605356D5b0F1FBB10ddA5',
  [ChainId.ZKTESTNET]: '0x450c0ff30A17B8F6ccBEc25e41e4461cF89719d7',
};

export const V3_MIGRATOR_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0x157B9913E00204f8c980bb00aa62E22b0dAb1a63',
  [ChainId.DOGECHAIN]: '0xB9aFAa5c407DdebA5098193F31CE23D21cFD9657',
};

export const REAL_STAKER_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x32CFF674763b06B983C0D55Ef2e41B84D16855bb',
  [ChainId.DOGECHAIN]: '0x32CFF674763b06B983C0D55Ef2e41B84D16855bb',
};

export const FINITE_FARMING: AddressMap = {
  [ChainId.MATIC]: '0x9923f42a02A82dA63EE0DbbC5f8E311e3DD8A1f8',
  [ChainId.DOGECHAIN]: '0x481FcFa00Ee6b2384FF0B3c3b5b29aD911c1AAA7',
};

export const INFINITE_FARMING_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x8a26436e41d0b5fc4C6Ed36C1976fafBe173444E',
  [ChainId.DOGECHAIN]: '0xC712F63E4D57ED1684FB4b428a1DFF10e3338F25',
};

export const FARMING_CENTER: AddressMap = {
  [ChainId.MATIC]: '0x7F281A8cdF66eF5e9db8434Ec6D97acc1bc01E78',
  [ChainId.DOGECHAIN]: '0x82831E9565cb574375596eFc090da465283E22A4',
};

export const V2_FACTORY_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
};

export const EXCHANGE_FACTORY_ADDRESS_MAPS: ExchangeAddressMap = {
  [V2Exchanges.Quickswap]: {
    [ChainId.MATIC]: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
  },
  [V2Exchanges.SushiSwap]: {
    [ChainId.MATIC]: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
  },
};

export const EXCHANGE_PAIR_INIT_HASH_MAPS: ExchangeAddressMap = {
  [V2Exchanges.Quickswap]: {
    //TODO: Verify the Pair INIT hash
    [ChainId.MATIC]:
      '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
  },
  [V2Exchanges.SushiSwap]: {
    [ChainId.MATIC]:
      '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
  },
};

export const V2_ROUTER_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
  [ChainId.MUMBAI]: '0x8954AfA98594b838bda56FE4C12a09D7739D179b',
};

export const PARASWAP_PROXY_ROUTER_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x216b4b4ba9f3e719726886d34a177484278bfcae',
};

export const PARASWAP_ROUTER_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57',
};

export const LAIR_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0xf28164a485b0b2c90639e47b0f377b4a438a16b1',
};

export const NEW_LAIR_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x958d208Cdf087843e9AD98d23823d32E17d723A1',
  [ChainId.DOGECHAIN]: '0xD0364429C7c236d7E2dd71fb1ac1cF438323A398',
};

export const QUICK_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x831753DD7087CaC61aB5644b308642cc1c33Dc13',
};

export const NEW_QUICK_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0xB5C064F955D8e7F38fE0460C556a72987494eE17',
};

export const DL_QUICK_ADDRESS: AddressMap = {
  [ChainId.MATIC]: NEW_QUICK_ADDRESS[ChainId.MATIC],
  [ChainId.DOGECHAIN]: '0x582daef1f36d6009f64b74519cfd612a8467be18',
};

export const QUICK_CONVERSION: AddressMap = {
  [ChainId.MATIC]: '0x333068d06563a8dfdbf330a0e04a9d128e98bf5a',
};

export const ENS_REGISTRAR_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
};

export const SOCKS_CONTROLLER_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0x65770b5283117639760beA3F867b69b3697a91dd',
};

export const V2_MATIC_USDT_PAIR: AddressMap = {
  [ChainId.MATIC]: '0x604229c960e5cacf2aaeac8be68ac07ba9df81c3',
};

export const LENDING_QS_POOL_DIRECTORY: AddressMap = {
  [ChainId.MATIC]: '0xDeFf0321cD7E62Dccc6df90A3C0720E0a3449CB4',
};

export const LENDING_LENS: AddressMap = {
  [ChainId.MATIC]: '0x4B1dfA99d53FFA6E4c0123956ec4Ac2a6D9F4c75',
};

export const LENDING_QS_POOLS: { [chainId: number]: string[] } = {
  [ChainId.MATIC]: [
    '0x4514EC28a1e91b0999d803775D716DB0e597992d',
    '0x11cCE62387D144150EB9ca12D2678795f2DB4873',
    '0x4e460721539d1643938151DB9f31fd751cDb37E1',
  ],
};

export const WMATIC_EXTENDED: { [chainId: number]: TokenV3 } = {
  [ChainId.MATIC]: new TokenV3(
    ChainId.MATIC,
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    18,
    'WMATIC',
    'Wrapped Matic',
  ),
  [ChainId.DOGECHAIN]: new TokenV3(
    ChainId.DOGECHAIN,
    '0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101',
    18,
    'WWDOGE',
    'Wrapped WDOGE',
  ),
  [ChainId.ZKTESTNET]: new TokenV3(
    ChainId.ZKTESTNET,
    '0xE9CC37904875B459Fa5D0FE37680d36F1ED55e38',
    18,
    'WETH',
    'Wrapped ETHER',
  ),
};

export const USDC: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    6,
    'USDC',
    'USD Coin',
  ),
  [ChainId.DOGECHAIN]: new Token(
    ChainId.DOGECHAIN,
    '0x765277EebeCA2e31912C9946eAe1021199B39C61',
    6,
    'USDC',
    'USD Coin',
  ),
  [ChainId.ZKTESTNET]: new Token(
    ChainId.ZKTESTNET,
    '0x6c28AeF8977c9B773996d0e8376d2EE379446F2f',
    6,
    'USDC',
    'USD Coin',
  ),
};

export const USDT: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    6,
    'USDT',
    'Tether USD',
  ),
  [ChainId.DOGECHAIN]: new Token(
    ChainId.DOGECHAIN,
    '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D',
    6,
    'USDT',
    'Tether USD',
  ),
};

export const OLD_QUICK: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    QUICK_ADDRESS[ChainId.MATIC],
    18,
    'QUICK(OLD)',
    'Quickswap(OLD)',
  ),
};

export const NEW_QUICK: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    NEW_QUICK_ADDRESS[ChainId.MATIC],
    18,
    'QUICK',
    'QuickSwap(NEW)',
  ),
};

export const OLD_DQUICK: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0xf28164A485B0B2C90639E47b0f377b4a438a16B1',
    18,
    'dQUICK',
    'Dragon QUICK',
  ),
};

export const NEW_DQUICK: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x958d208Cdf087843e9AD98d23823d32E17d723A1',
    18,
    'dQUICK',
    'Dragon QUICK',
  ),
};

export const WBTC: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
    8,
    'wBTC',
    'Wrapped Bitcoin',
  ),
  [ChainId.DOGECHAIN]: new Token(
    ChainId.DOGECHAIN,
    '0xfA9343C3897324496A05fC75abeD6bAC29f8A40f',
    8,
    'wBTC',
    'Wrapped Bitcoin',
  ),
};

export const DAI: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    18,
    'DAI',
    'Dai Stablecoin',
  ),
  [ChainId.DOGECHAIN]: new Token(
    ChainId.DOGECHAIN,
    '0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C',
    18,
    'DAI',
    'Dai Stablecoin',
  ),
};

export const ETHER: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    18,
    'ETH',
    'Ether',
  ),
  [ChainId.DOGECHAIN]: new Token(
    ChainId.DOGECHAIN,
    '0xB44a9B6905aF7c801311e8F4E76932ee959c663C',
    18,
    //TODO: this should really have a difference symbol but we use 'ETH' hardcoded to represent native
    //Due to Uniswap SDK implmentation
    'ETH',
    'Ether',
  ),
};

export const MI: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0xa3Fa99A148fA48D14Ed51d610c367C61876997F1',
    18,
    'MAI',
    'miMATIC',
  ),
  [ChainId.DOGECHAIN]: new Token(
    ChainId.DOGECHAIN,
    '0xb84Df10966a5D7e1ab46D9276F55d57bD336AFC7',
    18,
    'MAI',
    'miMATIC',
  ),
};

export const DC: { [chainId: number]: Token } = {
  [ChainId.DOGECHAIN]: new Token(
    ChainId.DOGECHAIN,
    '0x7b4328c127b85369d9f82ca0503b000d09cf9180',
    18,
    'DC',
    'Dogechain Token',
  ),
};

export const DD: { [chainId: number]: Token } = {
  [ChainId.DOGECHAIN]: new Token(
    ChainId.DOGECHAIN,
    DL_QUICK_ADDRESS[ChainId.DOGECHAIN],
    18,
    'DD',
    'Doge Dragon',
  ),
};

export const dDD: { [chainId: number]: Token } = {
  [ChainId.DOGECHAIN]: new Token(
    ChainId.DOGECHAIN,
    NEW_LAIR_ADDRESS[ChainId.DOGECHAIN],
    18,
    'dDD',
    'Dragon DD',
  ),
};

export const BOB: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0xB0B195aEFA3650A6908f15CdaC7D92F8a5791B0B',
    18,
    'BOB',
    'BOB',
  ),
};

export const axlUSDC: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x750e4C4984a9e0f12978eA6742Bc1c5D248f40ed',
    18,
    'axlUSDC',
    'Axelar Wrapped USDC',
  ),
};

export const TUSD: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x2e1AD108fF1D8C782fcBbB89AAd783aC49586756',
    18,
    'TUSD',
    'TrueUSD',
  ),
};

export const UND: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x1eBA4B44C4F8cc2695347C6a78F0B7a002d26413',
    18,
    'UND',
    'Unbound Dollar',
  ),
};

export const USDD: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0xFFA4D863C96e743A2e1513824EA006B8D0353C57',
    18,
    'USDD',
    'Decentralized USD',
  ),
};

export const DLQUICK: { [chainId: number]: Token } = {
  [ChainId.MATIC]: NEW_QUICK[ChainId.MATIC],
  [ChainId.DOGECHAIN]: DD[ChainId.DOGECHAIN],
};

export const DLDQUICK: { [chainId: number]: Token } = {
  [ChainId.MATIC]: NEW_DQUICK[ChainId.MATIC],
  [ChainId.DOGECHAIN]: dDD[ChainId.DOGECHAIN],
};

export const V2_BASES_TO_CHECK_TRADES_AGAINST: {
  [ChainId: number]: Token[];
} = {
  [ChainId.MATIC]: [
    ...WETH_ONLY[ChainId.MATIC],
    USDC[ChainId.MATIC],
    USDT[ChainId.MATIC],
    OLD_QUICK[ChainId.MATIC],
    NEW_QUICK[ChainId.MATIC],
    ETHER[ChainId.MATIC],
    WBTC[ChainId.MATIC],
    DAI[ChainId.MATIC],
    //GHST,
    MI[ChainId.MATIC],
  ],
};

export const StableCoins: { [ChainId: number]: Token[] } = {
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
  ],
};

// Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these tokens.
export const V2_CUSTOM_BASES: {
  [ChainId: number]: { [tokenAddress: string]: Token[] };
} = {};

export const V3_CUSTOM_BASES: {
  [chainId: number]: { [tokenAddress: string]: TokenV3[] };
} = {};

export const V3_BASES_TO_CHECK_TRADES_AGAINST: {
  [ChainId: number]: TokenV3[];
} = {
  [ChainId.MATIC]: [
    WMATIC_EXTENDED[ChainId.MATIC],
    toV3Token(USDC[ChainId.MATIC]),
  ],
  [ChainId.DOGECHAIN]: [
    WMATIC_EXTENDED[ChainId.DOGECHAIN],
    toV3Token(USDC[ChainId.DOGECHAIN]),
    toV3Token(DC[ChainId.DOGECHAIN]),
    toV3Token(DD[ChainId.DOGECHAIN]),
  ],
};

export const SUGGESTED_BASES: {
  [ChainId: number]: Token[];
} = {
  [ChainId.MATIC]: [
    ...WETH_ONLY[ChainId.MATIC],
    DAI[ChainId.MATIC],
    USDC[ChainId.MATIC],
    USDT[ChainId.MATIC],
    OLD_QUICK[ChainId.MATIC],
    NEW_QUICK[ChainId.MATIC],
    ETHER[ChainId.MATIC],
    WBTC[ChainId.MATIC],
    MI[ChainId.MATIC],
  ],
  [ChainId.DOGECHAIN]: [
    USDC[ChainId.DOGECHAIN],
    USDT[ChainId.DOGECHAIN],
    ETHER[ChainId.DOGECHAIN],
    WBTC[ChainId.DOGECHAIN],
    MI[ChainId.DOGECHAIN],
    DD[ChainId.DOGECHAIN],
    DC[ChainId.DOGECHAIN],
  ],
  [ChainId.ZKTESTNET]: [USDC[ChainId.ZKTESTNET]],
};

export const V2_BASES_TO_TRACK_LIQUIDITY_FOR: {
  [ChainId: number]: Token[];
} = {
  [ChainId.MATIC]: [
    ...WETH_ONLY[ChainId.MATIC],
    DAI[ChainId.MATIC],
    USDC[ChainId.MATIC],
    USDT[ChainId.MATIC],
    OLD_QUICK[ChainId.MATIC],
    NEW_QUICK[ChainId.MATIC],
    ETHER[ChainId.MATIC],
    WBTC[ChainId.MATIC],
  ],
};

export const V3_BASES_TO_TRACK_LIQUIDITY_FOR: {
  [ChainId: number]: TokenV3[];
} = {
  [ChainId.MATIC]: [
    WMATIC_EXTENDED[ChainId.MATIC],
    toV3Token(DAI[ChainId.MATIC]),
    toV3Token(USDC[ChainId.MATIC]),
    toV3Token(USDT[ChainId.MATIC]),
    toV3Token(OLD_QUICK[ChainId.MATIC]),
    toV3Token(NEW_QUICK[ChainId.MATIC]),
    toV3Token(ETHER[ChainId.MATIC]),
    toV3Token(WBTC[ChainId.MATIC]),
  ],
  [ChainId.DOGECHAIN]: [
    WMATIC_EXTENDED[ChainId.DOGECHAIN],
    toV3Token(USDC[ChainId.DOGECHAIN]),
    toV3Token(USDT[ChainId.DOGECHAIN]),
    toV3Token(ETHER[ChainId.DOGECHAIN]),
    toV3Token(DD[ChainId.DOGECHAIN]),
    toV3Token(DC[ChainId.DOGECHAIN]),
  ],
  [ChainId.ZKTESTNET]: [
    WMATIC_EXTENDED[ChainId.ZKTESTNET],
    toV3Token(USDC[ChainId.ZKTESTNET]),
  ],
};

export const V2_PINNED_PAIRS: {
  [ChainId: number]: [Token, Token][];
} = {
  [ChainId.MATIC]: [
    [USDC[ChainId.MATIC], USDT[ChainId.MATIC]],
    [USDC[ChainId.MATIC], DAI[ChainId.MATIC]],
    [ETHER[ChainId.MATIC], USDC[ChainId.MATIC]],
    [WBTC[ChainId.MATIC], ETHER[ChainId.MATIC]],
    [WETH[ChainId.MATIC], USDT[ChainId.MATIC]],
    [WETH[ChainId.MATIC], USDC[ChainId.MATIC]],
    [WETH[ChainId.MATIC], ETHER[ChainId.MATIC]],
    [ETHER[ChainId.MATIC], OLD_QUICK[ChainId.MATIC]],
  ],
};

export const V3_PINNED_PAIRS: {
  [ChainId: number]: [TokenV3, TokenV3][];
} = {
  [ChainId.MATIC]: [
    [toV3Token(USDC[ChainId.MATIC]), toV3Token(USDT[ChainId.MATIC])],
    [toV3Token(USDC[ChainId.MATIC]), toV3Token(DAI[ChainId.MATIC])],
    [toV3Token(ETHER[ChainId.MATIC]), toV3Token(USDC[ChainId.MATIC])],
    [toV3Token(WBTC[ChainId.MATIC]), toV3Token(ETHER[ChainId.MATIC])],
    [toV3Token(WETH[ChainId.MATIC]), toV3Token(USDT[ChainId.MATIC])],
    [toV3Token(WETH[ChainId.MATIC]), toV3Token(USDC[ChainId.MATIC])],
    [toV3Token(WETH[ChainId.MATIC]), toV3Token(ETHER[ChainId.MATIC])],
    [toV3Token(ETHER[ChainId.MATIC]), toV3Token(OLD_QUICK[ChainId.MATIC])],
  ],
};

export class ExtendedEther extends V3Currency {
  private static _cachedEther: { [chainId: number]: ExtendedEther } = {};

  public get wrapped(): TokenV3 {
    if (this.chainId in WMATIC_EXTENDED) return WMATIC_EXTENDED[this.chainId];
    throw new Error('Unsupported chain ID');
  }

  public static onChain(
    chainId: number,
    decimals: number,
    symbol?: string,
    name?: string,
  ): ExtendedEther {
    return (
      this._cachedEther[chainId] ??
      (this._cachedEther[chainId] = new ExtendedEther(
        chainId,
        decimals,
        symbol,
        name,
      ))
    );
  }
}
