import { ChainId, WETH } from '@uniswap/sdk';
import { Token } from '@uniswap/sdk';
import { Token as TokenV3 } from '@uniswap/sdk-core';
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
  [ChainId.ZKEVM]: [WETH[ChainId.ZKEVM]],
  [ChainId.MANTA]: [WETH[ChainId.MANTA]],
  [ChainId.KAVA]: [WETH[ChainId.KAVA]],
  [ChainId.ZKATANA]: [WETH[ChainId.ZKATANA]],
  [ChainId.BTTC]: [WETH[ChainId.BTTC]],
  [ChainId.X1]: [WETH[ChainId.X1]],
  [ChainId.TIMX]: [WETH[ChainId.TIMX]],
  [ChainId.IMX]: [WETH[ChainId.IMX]],
  [ChainId.ASTARZKEVM]: [WETH[ChainId.ASTARZKEVM]],
  [ChainId.LAYERX]: [WETH[ChainId.LAYERX]],
};

export const toV2Token = (t: {
  chainId: number;
  address: string;
  decimals: number;
  symbol?: string;
  name?: string;
}): Token => {
  return new Token(t.chainId, t.address, t.decimals, t.symbol, t.name);
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

export const NATIVE_TOKEN_ADDRESS =
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export const PRICE_GETTER_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x56CC45d405483e38d7f6533184b3435C5269eEf1',
};

export const MULTICALL_NETWORKS: { [chainId in ChainId]?: string } = {
  [ChainId.MUMBAI]: '0xc7efb32470dee601959b15f1f923e017c6a918ca', //TODO: CHANGE THIS
  [ChainId.MATIC]: '0x02817C1e3543c2d908a590F5dB6bc97f933dB4BD',
  [ChainId.DOEGCHAIN_TESTNET]: '0x02817C1e3543c2d908a590F5dB6bc97f933dB4BD',
  [ChainId.DOGECHAIN]: '0x0110B3b142031F85a80Afdc9C7bcAA80dAfe7C63',
  [ChainId.ZKTESTNET]: '0x54E11f6955B533CC3AcEe908c89C407e3e754fc0',
  [ChainId.ZKEVM]: '0x6a1d2eca13222E7ffDDfdf1Df701D41D3E4cC0BE',
  [ChainId.MANTA]: '0x55BeE1bD3Eb9986f6d2d963278de09eE92a3eF1D',
  [ChainId.ZKATANA]: '0xF6Ad3CcF71Abb3E12beCf6b3D2a74C963859ADCd',
  [ChainId.TIMX]: '0x55BeE1bD3Eb9986f6d2d963278de09eE92a3eF1D',
  [ChainId.X1]: '0x55BeE1bD3Eb9986f6d2d963278de09eE92a3eF1D',
  [ChainId.IMX]: '0x55BeE1bD3Eb9986f6d2d963278de09eE92a3eF1D',
  [ChainId.ASTARZKEVM]: '0xc7efb32470dEE601959B15f1f923e017C6A918cA',
  [ChainId.LAYERX]: '0xd8E1E7009802c914b0d39B31Fc1759A865b727B1',
};

export const V2_FACTORY_BOND: AddressMap = {
  [ChainId.MATIC]: '0xcf083be4164828f00cae704ec15a36d711491284',
};

export const V3_FACTORY_BOND: AddressMap = {
  [ChainId.MATIC]: '0x1f98431c8ad98523631ae4a59f267346ea31f984',
};

export const V3_CORE_FACTORY_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0x411b0fAcC3489691f28ad58c47006AF5E3Ab3A28',
  [ChainId.DOGECHAIN]: '0xd2480162Aa7F02Ead7BF4C127465446150D58452',
  [ChainId.ZKTESTNET]: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  [ChainId.ZKEVM]: '0x4B9f4d2435Ef65559567e5DbFC1BbB37abC43B57',
  [ChainId.LAYERX]: '0xd2480162Aa7F02Ead7BF4C127465446150D58452',
};

export const POOL_DEPLOYER_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x2D98E2FA9da15aa6dC9581AB097Ced7af697CB92',
  [ChainId.DOGECHAIN]: '0x56c2162254b0E4417288786eE402c2B41d4e181e',
  [ChainId.ZKTESTNET]: '0x6c28AeF8977c9B773996d0e8376d2EE379446F2f',
  [ChainId.ZKEVM]: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  [ChainId.LAYERX]: '0x56c2162254b0E4417288786eE402c2B41d4e181e',
};

export const QUOTER_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0xa15F0D7377B2A0C0c10db057f641beD21028FC89',
  [ChainId.DOGECHAIN]: '0xd8E1E7009802c914b0d39B31Fc1759A865b727B1',
  [ChainId.ZKTESTNET]: '0x930388c769Da7B4616493d47B5D093D8ec26C969',
  [ChainId.ZKEVM]: '0x55BeE1bD3Eb9986f6d2d963278de09eE92a3eF1D',
  [ChainId.LAYERX]: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
};

export const UNIV3_QUOTER_ADDRESSES: AddressMap = {
  [ChainId.ZKEVM]: '0xB18FB423Fb241CE0DE345d74904f97D60792FFd8',
  [ChainId.MANTA]: '0x3005827fB92A0cb7D0f65738D6D645d98A4Ad96b',
  [ChainId.ZKATANA]: '0x6c28AeF8977c9B773996d0e8376d2EE379446F2f',
  [ChainId.TIMX]: '0xE9CC37904875B459Fa5D0FE37680d36F1ED55e38',
  [ChainId.X1]: '0xE9CC37904875B459Fa5D0FE37680d36F1ED55e38',
  [ChainId.IMX]: '0xE9CC37904875B459Fa5D0FE37680d36F1ED55e38',
  [ChainId.ASTARZKEVM]: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
};

export const SWAP_ROUTER_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0xf5b509bB0909a69B1c207E495f687a596C168E12',
  [ChainId.DOGECHAIN]: '0x4aE2bD0666c76C7f39311b9B3e39b53C8D7C43Ea',
  [ChainId.ZKTESTNET]: '0x481FcFa00Ee6b2384FF0B3c3b5b29aD911c1AAA7',
  [ChainId.ZKEVM]: '0xF6Ad3CcF71Abb3E12beCf6b3D2a74C963859ADCd',
  [ChainId.LAYERX]: '0x4B9f4d2435Ef65559567e5DbFC1BbB37abC43B57',
};

export const SWAP_ROUTER_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0xfaa746afc5ff7d5ef0aa469bb26ddd6cd8f13911',
};

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0x8eF88E4c7CfbbaC1C163f7eddd4B578792201de6',
  [ChainId.DOGECHAIN]: '0x0b012055F770AE7BB7a8303968A7Fb6088A2296e',
  [ChainId.ZKTESTNET]: '0xE86Ba90bf805cEa452c8FA6E37b4ae2D17D32599',
  [ChainId.ZKEVM]: '0xd8E1E7009802c914b0d39B31Fc1759A865b727B1',
  [ChainId.LAYERX]: '0xF6Ad3CcF71Abb3E12beCf6b3D2a74C963859ADCd',
};

export const UNI_V3_FACTORY_ADDRESS: AddressMap = {
  [ChainId.ZKEVM]: '0xD9a2AD9E927Bd7014116CC5c7328f028D4318178',
  [ChainId.MANTA]: '0x56c2162254b0E4417288786eE402c2B41d4e181e',
  [ChainId.ZKATANA]: '0x56c2162254b0E4417288786eE402c2B41d4e181e',
  [ChainId.TIMX]: '0x56c2162254b0E4417288786eE402c2B41d4e181e',
  [ChainId.X1]: '0x56c2162254b0E4417288786eE402c2B41d4e181e',
  [ChainId.IMX]: '0x56c2162254b0E4417288786eE402c2B41d4e181e',
  [ChainId.ASTARZKEVM]: '0x56c2162254b0E4417288786eE402c2B41d4e181e',
};

export const UNI_NFT_POSITION_MANAGER_ADDRESS: AddressMap = {
  [ChainId.ZKEVM]: '0x331F3a300b7115A45ba31E3428AC002267BB6D77',
  [ChainId.MANTA]: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
  [ChainId.ZKATANA]: '0x55BeE1bD3Eb9986f6d2d963278de09eE92a3eF1D',
  [ChainId.TIMX]: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
  [ChainId.X1]: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
  [ChainId.IMX]: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
  [ChainId.ASTARZKEVM]: '0xF6Ad3CcF71Abb3E12beCf6b3D2a74C963859ADCd',
};

export const UNI_SWAP_ROUTER: AddressMap = {
  [ChainId.MATIC]: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
  [ChainId.ZKEVM]: '0x1E7E4c855520b2106320952A570a3e5E3E618101',
  [ChainId.MANTA]: '0xfdE3eaC61C5Ad5Ed617eB1451cc7C3a0AC197564',
  [ChainId.ZKATANA]: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  [ChainId.TIMX]: '0x6c28AeF8977c9B773996d0e8376d2EE379446F2f',
  [ChainId.X1]: '0x6c28AeF8977c9B773996d0e8376d2EE379446F2f',
  [ChainId.IMX]: '0x6c28AeF8977c9B773996d0e8376d2EE379446F2f',
  [ChainId.ASTARZKEVM]: '0x4B9f4d2435Ef65559567e5DbFC1BbB37abC43B57',
};

export const GAMMA_MASTERCHEF_ADDRESSES: AddressMap[] = [
  {
    [ChainId.MATIC]: '0x20ec0d06f447d550fc6edee42121bc8c1817b97d',
    [ChainId.ZKEVM]: '0x1e2D8f84605D32a2CBf302E30bFd2387bAdF35dD',
    [ChainId.MANTA]: '0x3fe1278d7dd785e234b9d2969c8ca7d8e1e7f918',
  },
  {
    [ChainId.MATIC]: '0x68678Cf174695fc2D27bd312DF67A3984364FFDd',
  },
  {
    [ChainId.MATIC]: '0xcc54afcecd0d89e0b2db58f5d9e58468e7ad20dc',
  },
];

export const MULTICALL_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x6ccb9426CeceE2903FbD97fd833fD1D31c100292',
  [ChainId.DOGECHAIN]: '0x23602819a9E2B1C8eC7605356D5b0F1FBB10ddA5',
  [ChainId.ZKTESTNET]: '0x49b698B703D7bdFC81488Ca3C22Ad010eBCf2126',
  [ChainId.ZKEVM]: '0x61530d6E1c7A47BBB3e48e8b8EdF7569DcFeE121',
  [ChainId.MANTA]: '0x1FD671daC06DF1431E79d772037E93bdB2dfeb48',
  [ChainId.ZKATANA]: '0x61211321E272584d6686F79bb205082C4cDa5d5F',
  [ChainId.TIMX]: '0x4857Dfd11c712e862eC362cEee29F7974B70EfcD',
  [ChainId.X1]: '0x4857Dfd11c712e862eC362cEee29F7974B70EfcD',
  [ChainId.IMX]: '0xc7efb32470dEE601959B15f1f923e017C6A918cA',
  [ChainId.ASTARZKEVM]: '0x81D880BfaB1f7f08816D9bd4571E2f5953532287',
  [ChainId.LAYERX]: '0xc7efb32470dEE601959B15f1f923e017C6A918cA',
};

export const V3_MIGRATOR_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0x157B9913E00204f8c980bb00aa62E22b0dAb1a63',
  [ChainId.DOGECHAIN]: '0xB9aFAa5c407DdebA5098193F31CE23D21cFD9657',
  [ChainId.ZKTESTNET]: '0x6909BE1eA255885a02D182bdFB54eD838502Ec91',
  [ChainId.ZKEVM]: '0x4aE2bD0666c76C7f39311b9B3e39b53C8D7C43Ea',
};

export const REAL_STAKER_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x32CFF674763b06B983C0D55Ef2e41B84D16855bb',
  [ChainId.DOGECHAIN]: '0x32CFF674763b06B983C0D55Ef2e41B84D16855bb',
};

export const FINITE_FARMING: AddressMap = {
  [ChainId.MATIC]: '0x9923f42a02A82dA63EE0DbbC5f8E311e3DD8A1f8',
  [ChainId.DOGECHAIN]: '0x481FcFa00Ee6b2384FF0B3c3b5b29aD911c1AAA7',
  [ChainId.ZKEVM]: '0x17bE2Ed4409d8e6c22d46dE599f7C9Af40bD0759',
};

export const INFINITE_FARMING_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x8a26436e41d0b5fc4C6Ed36C1976fafBe173444E',
  [ChainId.DOGECHAIN]: '0xC712F63E4D57ED1684FB4b428a1DFF10e3338F25',
  [ChainId.ZKEVM]: '0x1fd3f47B363f5b844eD7B7FAB6ceb679A367621E',
};

export const FARMING_CENTER: AddressMap = {
  [ChainId.MATIC]: '0x7F281A8cdF66eF5e9db8434Ec6D97acc1bc01E78',
  [ChainId.DOGECHAIN]: '0x82831E9565cb574375596eFc090da465283E22A4',
  [ChainId.ZKEVM]: '0x481FcFa00Ee6b2384FF0B3c3b5b29aD911c1AAA7',
};

export const V2_FACTORY_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
  [ChainId.DOGECHAIN]: '0xC3550497E591Ac6ed7a7E03ffC711CfB7412E57F',
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
  [ChainId.DOGECHAIN]: '0xAF96E63f965374dB6514e8CF595fB0a3f4d7763c',
};

export const PARASWAP_PROXY_ROUTER_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x216b4b4ba9f3e719726886d34a177484278bfcae',
  [ChainId.ZKEVM]: '0xc8a21fcd5a100c3ecc037c97e2f9c53a8d3a02a1',
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
  [ChainId.ZKEVM]: '0x68286607A1d43602d880D349187c3c48c0fD05E6',
};

export const DL_QUICK_ADDRESS: AddressMap = {
  [ChainId.MATIC]: NEW_QUICK_ADDRESS[ChainId.MATIC],
  [ChainId.DOGECHAIN]: '0x582daef1f36d6009f64b74519cfd612a8467be18',
};

export const QUICK_CONVERSION: AddressMap = {
  [ChainId.MATIC]: '0x333068d06563a8dfdbf330a0e04a9d128e98bf5a',
  [ChainId.ZKTESTNET]: '0xFa1bd67907E391d1B8A9110dbf57E2Ee92465E8e',
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

export const BANANA_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0x5d47baba0d66083c52009271faf3f50dcc01023c',
};

export const ZAP_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x236290f7da54465BF7A26f279d2B3553e5402780',
};

export const LENDING_QS_POOLS: { [chainId: number]: string[] } = {
  [ChainId.MATIC]: [
    '0x4514EC28a1e91b0999d803775D716DB0e597992d',
    '0x11cCE62387D144150EB9ca12D2678795f2DB4873',
    '0x4e460721539d1643938151DB9f31fd751cDb37E1',
  ],
};

export const STEER_PERIPHERY: AddressMap = {
  [ChainId.MATIC]: '0x29E1888F7DD0757f2873E494463Ec389dab38D27',
  [ChainId.MANTA]: '0xD90c8970708FfdFC403bdb56636621e3E9CCe921',
  [ChainId.ASTARZKEVM]: '0x37Cff062D52Dd6E9E39Df619CCd30c037a36bB83',
};

export const STEER_VAULT_REGISTRY: AddressMap = {
  [ChainId.MATIC]: '0x24825B3C44742600D3995d1D3760cceE999A7f0b',
  [ChainId.MANTA]: '0x38a07152ee64C7067fEeBA904D72ABc9a9DA0C77',
  [ChainId.ASTARZKEVM]: '0xa1Dd21fbd9e1F0BF28d41F18bDC22326e50C02e9',
};

export const MERKL_DISTRIBUTOR = '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae';

export const NATIVE_CONVERTER: AddressMap = {
  [ChainId.ZKEVM]: '0xd4F3531Fc95572D9e7b9e9328D9FEaa8e8496054',
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
    '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
    18,
    'WETH',
    'Wrapped ETHER',
  ),
  [ChainId.ZKEVM]: new TokenV3(
    ChainId.ZKEVM,
    '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9',
    18,
    'WETH',
    'Wrapped ETHER',
  ),
  [ChainId.MANTA]: new TokenV3(
    ChainId.MANTA,
    '0x0Dc808adcE2099A9F62AA87D9670745AbA741746',
    18,
    'WETH',
    'Wrapped ETHER',
  ),
  [ChainId.ZKATANA]: new TokenV3(
    ChainId.ZKATANA,
    '0xd2480162Aa7F02Ead7BF4C127465446150D58452',
    18,
    'WETH',
    'Wrapped ETHER',
  ),
  [ChainId.TIMX]: new TokenV3(
    ChainId.TIMX,
    '0x1CcCa691501174B4A623CeDA58cC8f1a76dc3439',
    18,
    'Wrapped IMX',
    'WIMX',
  ),
  [ChainId.X1]: toV3Token(WETH[ChainId.X1]),
  [ChainId.IMX]: toV3Token(WETH[ChainId.IMX]),
  [ChainId.ASTARZKEVM]: toV3Token(WETH[ChainId.ASTARZKEVM]),
  [ChainId.LAYERX]: toV3Token(WETH[ChainId.LAYERX]),
};

export const USDC: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
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
  [ChainId.ZKEVM]: new Token(
    ChainId.ZKEVM,
    '0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035',
    6,
    'USDC',
    'USD Coin',
  ),
  [ChainId.MANTA]: new Token(
    ChainId.MANTA,
    '0xb73603C5d87fA094B7314C74ACE2e64D165016fb',
    6,
    'USDC',
    'USD Coin',
  ),
  [ChainId.ZKATANA]: new Token(
    ChainId.ZKATANA,
    '0xE5a02c2Be08406c3fB36F9Aa29bF7C7A09CAe50B',
    6,
    'USDC',
    'USD Coin',
  ),
  [ChainId.X1]: new Token(
    ChainId.X1,
    '0x04292af1cf8687235a83766d55b307880fc5e76d',
    6,
    'USDC',
    'USD Coin',
  ),
  [ChainId.TIMX]: new Token(
    ChainId.TIMX,
    '0xB9aFAa5c407DdebA5098193F31CE23D21cFD9657',
    6,
    'USDC',
    'USD Coin',
  ),
  [ChainId.IMX]: new Token(
    ChainId.IMX,
    '0x6de8aCC0D406837030CE4dd28e7c08C5a96a30d2',
    6,
    'USDC',
    'USD Coin',
  ),
  [ChainId.ASTARZKEVM]: new Token(
    ChainId.ASTARZKEVM,
    '0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035',
    6,
    'USDC',
    'USD Coin',
  ),
  [ChainId.LAYERX]: new Token(
    ChainId.LAYERX,
    '0x74b7F16337b8972027F6196A17a631aC6dE26d22',
    6,
    'USDC',
    'USDC',
  ),
};

export const USDCE: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    6,
    'USDC.e',
    'Bridged USDC',
  ),
  [ChainId.ZKEVM]: new Token(
    ChainId.ZKEVM,
    '0x37eAA0eF3549a5Bb7D431be78a3D99BD360d19e5',
    6,
    'USDC.E',
    'USD Coin',
  ),
};

export const DAIE: { [chainId: number]: Token } = {
  [ChainId.ZKEVM]: new Token(
    ChainId.ZKEVM,
    '0x744C5860ba161b5316F7E80D9Ec415e2727e5bD5',
    6,
    'DAI.E',
    'Dai Stablecoin',
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
  [ChainId.ZKTESTNET]: new Token(
    ChainId.ZKTESTNET,
    '0x7379a261bC347BDD445484A91648Abf4A2BDEe5E',
    6,
    'USDT',
    'Tether USD',
  ),
  [ChainId.ZKEVM]: new Token(
    ChainId.ZKEVM,
    '0x1E4a5963aBFD975d8c9021ce480b42188849D41d',
    6,
    'USDT',
    'Tether USD',
  ),
  [ChainId.MANTA]: new Token(
    ChainId.MANTA,
    '0xf417F5A458eC102B90352F697D6e2Ac3A3d2851f',
    6,
    'USDT',
    'Tether USD',
  ),
  [ChainId.IMX]: new Token(
    ChainId.IMX,
    '0x68bcc7F1190AF20e7b572BCfb431c3Ac10A936Ab',
    6,
    'USDT',
    'Tether USD',
  ),
  [ChainId.ASTARZKEVM]: new Token(
    ChainId.ASTARZKEVM,
    '0x1E4a5963aBFD975d8c9021ce480b42188849D41d',
    6,
    'USDT',
    'Tether USD',
  ),
  [ChainId.LAYERX]: new Token(
    ChainId.LAYERX,
    '0x1E4a5963aBFD975d8c9021ce480b42188849D41d',
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
  [ChainId.ZKEVM]: new Token(
    ChainId.ZKEVM,
    NEW_QUICK_ADDRESS[ChainId.ZKEVM],
    18,
    'QUICK',
    'QuickSwap',
  ),
  [ChainId.MANTA]: new Token(
    ChainId.MANTA,
    '0xE22E3D44Ea9Fb0A87Ea3F7a8f41D869C677f0020',
    18,
    'QUICK',
    'QuickSwap',
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
    'WBTC',
    'Wrapped BTC',
  ),
  [ChainId.DOGECHAIN]: new Token(
    ChainId.DOGECHAIN,
    '0xfA9343C3897324496A05fC75abeD6bAC29f8A40f',
    8,
    'WBTC',
    'Wrapped Bitcoin',
  ),
  [ChainId.ZKEVM]: new Token(
    ChainId.ZKEVM,
    '0xEA034fb02eB1808C2cc3adbC15f447B93CbE08e1',
    8,
    'WBTC',
    'Wrapped BTC',
  ),
  [ChainId.MANTA]: new Token(
    ChainId.MANTA,
    '0x305E88d809c9DC03179554BFbf85Ac05Ce8F18d6',
    8,
    'WBTC',
    'Wrapped BTC',
  ),
  [ChainId.IMX]: new Token(
    ChainId.IMX,
    '0x235F9A2Dc29E51cE7D103bcC5Dfb4F5c9c3371De',
    8,
    'WBTC',
    'Wrapped BTC',
  ),
  [ChainId.ASTARZKEVM]: new Token(
    ChainId.ASTARZKEVM,
    '0xEA034fb02eB1808C2cc3adbC15f447B93CbE08e1',
    8,
    'WBTC',
    'Wrapped BTC',
  ),
  [ChainId.LAYERX]: new Token(
    ChainId.LAYERX,
    '0xEA034fb02eB1808C2cc3adbC15f447B93CbE08e1',
    8,
    'WBTC',
    'Wrapped BTC',
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
  [ChainId.ZKEVM]: new Token(
    ChainId.ZKEVM,
    '0xC5015b9d9161Dca7e18e32f6f25C4aD850731Fd4',
    18,
    'DAI',
    'Dai Stablecoin',
  ),
  [ChainId.MANTA]: new Token(
    ChainId.MANTA,
    '0x1c466b9371f8aBA0D7c458bE10a62192Fcb8Aa71',
    18,
    'DAI',
    'Dai Stablecoin',
  ),
  [ChainId.ASTARZKEVM]: new Token(
    ChainId.ASTARZKEVM,
    '0xC5015b9d9161Dca7e18e32f6f25C4aD850731Fd4',
    18,
    'DAI',
    'Dai Stablecoin',
  ),
  [ChainId.LAYERX]: new Token(
    ChainId.LAYERX,
    '0xC5015b9d9161Dca7e18e32f6f25C4aD850731Fd4',
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
  [ChainId.IMX]: new Token(
    ChainId.IMX,
    '0x52A6c53869Ce09a731CD772f245b97A4401d3348',
    18,
    'ETH',
    'Ether',
  ),
  [ChainId.LAYERX]: new Token(
    ChainId.LAYERX,
    '0x5A77f1443D16ee5761d310e38b62f77f726bC71c',
    18,
    'ETH',
    'Ether',
  ),
};

export const MATIC: { [chainId: number]: Token } = {
  [ChainId.ZKEVM]: new Token(
    ChainId.ZKEVM,
    '0xa2036f0538221a77A3937F1379699f44945018d0',
    18,
    'MATIC',
    'Matic',
  ),
  [ChainId.DOGECHAIN]: new Token(
    ChainId.DOGECHAIN,
    '0xDC42728B0eA910349ed3c6e1c9Dc06b5FB591f98',
    18,
    'MATIC',
    'Matic',
  ),
  [ChainId.MANTA]: new Token(
    ChainId.MANTA,
    '0x0f52A51287f9b3894d73Df05164D0Ee2533ccBB4',
    18,
    'MATIC',
    'Matic',
  ),
  [ChainId.ASTARZKEVM]: new Token(
    ChainId.ASTARZKEVM,
    '0xa2036f0538221a77A3937F1379699f44945018d0',
    18,
    'MATIC',
    'Matic',
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
  [ChainId.ZKEVM]: new Token(
    ChainId.ZKEVM,
    '0x615B25500403Eb688Be49221b303084D9Cf0E5B4',
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

export const CXETH: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0xfe4546feFe124F30788c4Cc1BB9AA6907A7987F9',
    18,
    'cxETH',
    'CelsiusX Wrapped ETH',
  ),
};

export const VERSA: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x8497842420cFdbc97896C2353D75d89Fc8D5Be5D',
    18,
    'VERSA',
    'VersaGames',
  ),
};

export const SAND: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683',
    18,
    'SAND',
    'SAND',
  ),
};

export const MAUSDC: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x9719d867A500Ef117cC201206B8ab51e794d3F82',
    6,
    'maUSDC',
    'Matic Aave interest bearing USDC',
  ),
};

export const FRAX: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x45c32fA6DF82ead1e2EF74d17b76547EDdFaFF89',
    18,
    'FRAX',
    'FRAX',
  ),
  [ChainId.ZKEVM]: new Token(
    ChainId.ZKEVM,
    '0xFf8544feD5379D9ffa8D47a74cE6b91e632AC44D',
    18,
    'FRAX',
    'FRAX',
  ),
};

export const GHST: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7',
    18,
    'GHST',
    'Aavegotchi GHST Token',
  ),
};

export const MATICX: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0xfa68FB4628DFF1028CFEc22b4162FCcd0d45efb6',
    18,
    'MaticX',
    'Liquid Staking Matic',
  ),
  [ChainId.MANTA]: new Token(
    ChainId.MANTA,
    '0x01d27580c464d5b3b26f78bee12e684901dbc02a',
    18,
    'MaticX',
    'Liquid Staking Matic',
  ),
};

export const STMATIC: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4',
    18,
    'stMatic',
    'Staked MATIC',
  ),
  [ChainId.ZKEVM]: new Token(
    ChainId.ZKEVM,
    '0x83b874c1e09d316059d929da402dcb1a98e92082',
    18,
    'stMatic',
    'Staked MATIC',
  ),
};

export const WSTETH: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x03b54a6e9a984069379fae1a4fc4dbae93b3bccd',
    18,
    'wstETH',
    'Wrapped liquid staked Ether 2.0',
  ),
  [ChainId.MANTA]: new Token(
    ChainId.MANTA,
    '0x2FE3AD97a60EB7c79A976FC18Bb5fFD07Dd94BA5',
    18,
    'wstETH',
    'Wrapped liquid staked Ether 2.0',
  ),
  [ChainId.ASTARZKEVM]: new Token(
    ChainId.ASTARZKEVM,
    '0x5D8cfF95D7A57c0BF50B30b43c7CC0D52825D4a9',
    18,
    'wstETH',
    'Wrapped liquid staked Ether 2.0',
  ),
};

export const ASTR: { [chainId: number]: Token } = {
  [ChainId.ASTARZKEVM]: new Token(
    ChainId.ASTARZKEVM,
    '0xdf41220C7e322bFEF933D85D01821ad277f90172',
    18,
    'ASTR',
    'Astar',
  ),
};

export const ANKRMATIC: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x0E9b89007eEE9c958c0EDA24eF70723C2C93dD58',
    18,
    'ankrMATIC',
    'Ankr Staked MATIC',
  ),
};

export const CRV: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x172370d5Cd63279eFa6d502DAB29171933a610AF',
    18,
    'CRV',
    'CRV (PoS)',
  ),
  [ChainId.ZKEVM]: new Token(
    ChainId.ZKEVM,
    '0x3d5320821bfca19fb0b5428f2c79d63bd5246f89',
    18,
    'CRV',
    'Curve DAO Token',
  ),
};

export const DAVOS: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0xec38621e72d86775a89c7422746de1f52bba5320',
    18,
    'DAVOS',
    'Davos',
  ),
};

export const FBX: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0xD125443F38A69d776177c2B9c041f462936F8218',
    18,
    'FBX',
    'FireBotToken',
  ),
};

export const FXCBETH: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x4b4327db1600b8b1440163f667e199cef35385f5',
    18,
    'cbEth',
    'Coinbase Wrapped Staked ETH (FXERC20)',
  ),
};

export const RMATIC: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x9f28e2455f9ffcfac9ebd6084853417362bc5dbb',
    18,
    'rMATIC',
    'StaFi rMATIC (PoS)',
  ),
};

export const WEFI: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0xffa188493c15dfaf2c206c97d8633377847b6a52',
    18,
    'WEFI',
    'WeFi',
  ),
};

export const frxETH: { [chainId: number]: Token } = {
  [ChainId.ZKEVM]: new Token(
    ChainId.ZKEVM,
    '0xcf7ecee185f19e2e970a301ee37f93536ed66179',
    18,
    'frxETH',
    'Frax Ether',
  ),
};

export const PUSH: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x58001cc1a9e17a20935079ab40b1b8f4fc19efd1',
    18,
    'PUSH',
    'Ethereum Push Notification Service (PoS)',
  ),
};

export const LINK: { [chainId: number]: Token } = {
  [ChainId.ZKEVM]: new Token(
    ChainId.ZKEVM,
    '0x4b16e4752711a7abec32799c976f3cefc0111f2b',
    18,
    'LINK',
    'ChainLink Token',
  ),
};

export const AAVE: { [chainId: number]: Token } = {
  [ChainId.ZKEVM]: new Token(
    ChainId.ZKEVM,
    '0x68791cfe079814c46e0e25c19bcc5bfc71a744f7',
    18,
    'AAVE',
    'Aave Token',
  ),
};

export const fxMETOD: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x65ad509db5924ef0001d977590985f965ef1aaaa',
    18,
    'fxMETOD',
    'META TOY DRAGONZ TOKEN (FXERC20)',
  ),
};

export const PKR: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x140a4e80dd8184536acc45f1c452d7540472e6e1',
    18,
    'PKR',
    'POLKER',
  ),
};

export const RNDR: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x61299774020da444af134c82fa83e3810b309991',
    18,
    'RNDR',
    'Render Token',
  ),
};

export const SLING: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0xfc9fa9771145fbb98d15c8c2cc94b837a56d554c',
    18,
    'SLING',
    'Slingshot',
  ),
};

export const NINJAZ: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x10acbe3b9e6a2ff7f341e5cbf4b6617741ff44aa',
    18,
    'NINJAZ',
    'NINJAZ@polygon',
  ),
};

export const STONE: { [chainId: number]: Token } = {
  [ChainId.MANTA]: new Token(
    ChainId.MANTA,
    '0xEc901DA9c68E90798BbBb74c11406A32A70652C3',
    18,
    'STONE',
    'StakeStone Ether',
  ),
};

export const USDV: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x323665443CEf804A3b5206103304BD4872EA4253',
    6,
    'USDV',
    'USDV',
  ),
};

export const NFTE: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x492Fa53b88614923937B7197C87E0F7F8EEb7B20',
    18,
    'NFTE',
    'NFTEarthOFT',
  ),
};

export const MANTA: { [chainId: number]: Token } = {
  [ChainId.MANTA]: new Token(
    ChainId.MANTA,
    '0x95CeF13441Be50d20cA4558CC0a27B601aC544E5',
    18,
    'MANTA',
    'Manta',
  ),
};

export const CRS: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x731C79f054DF3A567584Ee21A95399d343103143',
    18,
    'CRS',
    'Corgi Studio',
  ),
};

export const EURO3: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0xA0e4c84693266a9d3BBef2f394B33712c76599Ab',
    18,
    'EURO3',
    'EURO3',
  ),
};

export const SD: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x1d734a02ef1e1f5886e66b0673b71af5b53ffa94',
    18,
    'SD',
    'Stader (PoS)',
  ),
};

export const EMPTY: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x0000000000000000000000000000000000000000',
    0,
    'EMPTY',
    'EMPTY',
  ),
  [ChainId.DOGECHAIN]: new Token(
    ChainId.DOGECHAIN,
    '0x0000000000000000000000000000000000000000',
    0,
    'EMPTY',
    'EMPTY',
  ),
  [ChainId.ZKEVM]: new Token(
    ChainId.ZKEVM,
    '0x0000000000000000000000000000000000000000',
    0,
    'EMPTY',
    'EMPTY',
  ),
  [ChainId.MANTA]: new Token(
    ChainId.MANTA,
    '0x0000000000000000000000000000000000000000',
    0,
    'EMPTY',
    'EMPTY',
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
    USDCE[ChainId.MATIC],
    USDT[ChainId.MATIC],
    OLD_QUICK[ChainId.MATIC],
    NEW_QUICK[ChainId.MATIC],
    ETHER[ChainId.MATIC],
    WBTC[ChainId.MATIC],
    DAI[ChainId.MATIC],
    //GHST,
    MI[ChainId.MATIC],
  ],
  [ChainId.DOGECHAIN]: [
    WETH[ChainId.DOGECHAIN],
    USDC[ChainId.DOGECHAIN],
    USDT[ChainId.DOGECHAIN],
    DC[ChainId.DOGECHAIN],
    DD[ChainId.DOGECHAIN],
  ],
  [ChainId.ZKEVM]: [],
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
    toV3Token(USDT[ChainId.MATIC]),
    toV3Token(ETHER[ChainId.MATIC]),
    toV3Token(DAI[ChainId.MATIC]),
    toV3Token(MI[ChainId.MATIC]),
    toV3Token(WBTC[ChainId.MATIC]),
    toV3Token(NEW_QUICK[ChainId.MATIC]),
    toV3Token(USDCE[ChainId.MATIC]),
  ],
  [ChainId.DOGECHAIN]: [
    WMATIC_EXTENDED[ChainId.DOGECHAIN],
    toV3Token(USDC[ChainId.DOGECHAIN]),
    toV3Token(DC[ChainId.DOGECHAIN]),
    toV3Token(DD[ChainId.DOGECHAIN]),
  ],
  [ChainId.ZKTESTNET]: [
    WMATIC_EXTENDED[ChainId.ZKTESTNET],
    toV3Token(USDT[ChainId.ZKTESTNET]),
  ],
  [ChainId.ZKEVM]: [
    WMATIC_EXTENDED[ChainId.ZKEVM],
    toV3Token(USDT[ChainId.ZKEVM]),
    //toV3Token(USDC[ChainId.ZKEVM]),
    //toV3Token(MATIC[ChainId.ZKEVM]),
    //toV3Token(DAI[ChainId.ZKEVM]),
    //toV3Token(WBTC[ChainId.ZKEVM]),
    //toV3Token(NEW_QUICK[ChainId.ZKEVM]),
    //toV3Token(DAIE[ChainId.ZKEVM]),
    toV3Token(USDCE[ChainId.ZKEVM]),
  ],
  [ChainId.MANTA]: [
    WMATIC_EXTENDED[ChainId.MANTA],
    //toV3Token(USDT[ChainId.MANTA]),
    toV3Token(USDC[ChainId.MANTA]),
    //toV3Token(WBTC[ChainId.MANTA]),
    //toV3Token(MATIC[ChainId.MANTA]),
    //toV3Token(NEW_QUICK[ChainId.MANTA]),
    toV3Token(STONE[ChainId.MANTA]),
    toV3Token(MANTA[ChainId.MANTA]),
  ],
  [ChainId.ZKATANA]: [
    WMATIC_EXTENDED[ChainId.ZKATANA],
    toV3Token(USDC[ChainId.ZKATANA]),
  ],
  [ChainId.X1]: [WMATIC_EXTENDED[ChainId.X1], toV3Token(USDC[ChainId.X1])],
  [ChainId.TIMX]: [
    WMATIC_EXTENDED[ChainId.TIMX],
    toV3Token(USDC[ChainId.TIMX]),
  ],
  [ChainId.IMX]: [
    WMATIC_EXTENDED[ChainId.IMX],
    toV3Token(USDC[ChainId.IMX]),
    toV3Token(USDT[ChainId.IMX]),
    toV3Token(ETHER[ChainId.IMX]),
    toV3Token(WBTC[ChainId.IMX]),
  ],
  [ChainId.ASTARZKEVM]: [
    WMATIC_EXTENDED[ChainId.ASTARZKEVM],
    toV3Token(USDC[ChainId.ASTARZKEVM]),
    toV3Token(ASTR[ChainId.ASTARZKEVM]),
  ],
  [ChainId.LAYERX]: [
    WMATIC_EXTENDED[ChainId.LAYERX],
    toV3Token(USDT[ChainId.LAYERX]),
    toV3Token(ETHER[ChainId.LAYERX]),
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
    NEW_QUICK[ChainId.MATIC],
    ETHER[ChainId.MATIC],
    WBTC[ChainId.MATIC],
    USDCE[ChainId.MATIC],
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
  [ChainId.ZKTESTNET]: [WETH[ChainId.ZKTESTNET], USDT[ChainId.ZKTESTNET]],
  [ChainId.ZKEVM]: [
    WETH[ChainId.ZKEVM],
    USDT[ChainId.ZKEVM],
    USDCE[ChainId.ZKEVM],
    MATIC[ChainId.ZKEVM],
    DAIE[ChainId.ZKEVM],
    WBTC[ChainId.ZKEVM],
    NEW_QUICK[ChainId.ZKEVM],
  ],
  [ChainId.MANTA]: [
    WETH[ChainId.MANTA],
    USDT[ChainId.MANTA],
    USDC[ChainId.MANTA],
    WBTC[ChainId.MANTA],
    MATIC[ChainId.MANTA],
    NEW_QUICK[ChainId.MANTA],
    MANTA[ChainId.MANTA],
  ],
  [ChainId.ZKATANA]: [WETH[ChainId.ZKATANA], USDC[ChainId.ZKATANA]],
  [ChainId.X1]: [WETH[ChainId.X1], USDC[ChainId.X1]],
  [ChainId.TIMX]: [WETH[ChainId.TIMX], USDC[ChainId.TIMX]],
  [ChainId.IMX]: [
    WETH[ChainId.IMX],
    USDC[ChainId.IMX],
    USDT[ChainId.IMX],
    ETHER[ChainId.IMX],
    WBTC[ChainId.IMX],
  ],
  [ChainId.ASTARZKEVM]: [
    WETH[ChainId.ASTARZKEVM],
    USDC[ChainId.ASTARZKEVM],
    USDT[ChainId.ASTARZKEVM],
    MATIC[ChainId.ASTARZKEVM],
    WBTC[ChainId.ASTARZKEVM],
    ASTR[ChainId.ASTARZKEVM],
  ],
  [ChainId.LAYERX]: [
    ETHER[ChainId.LAYERX],
    WETH[ChainId.LAYERX],
    WBTC[ChainId.LAYERX],
    USDC[ChainId.LAYERX],
    USDT[ChainId.LAYERX],
  ],
};

export const V2_BASES_TO_TRACK_LIQUIDITY_FOR: {
  [ChainId: number]: Token[];
} = {
  [ChainId.MATIC]: [
    ...WETH_ONLY[ChainId.MATIC],
    //DAI[ChainId.MATIC],
    //USDC[ChainId.MATIC],
    //USDT[ChainId.MATIC],
    //OLD_QUICK[ChainId.MATIC],
    //NEW_QUICK[ChainId.MATIC],
    ETHER[ChainId.MATIC],
    //WBTC[ChainId.MATIC],
    USDCE[ChainId.MATIC],
  ],
  [ChainId.DOGECHAIN]: [
    WETH[ChainId.DOGECHAIN],
    USDC[ChainId.DOGECHAIN],
    USDT[ChainId.DOGECHAIN],
    DC[ChainId.DOGECHAIN],
    DD[ChainId.DOGECHAIN],
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
    //toV3Token(OLD_QUICK[ChainId.MATIC]),
    toV3Token(NEW_QUICK[ChainId.MATIC]),
    toV3Token(ETHER[ChainId.MATIC]),
    toV3Token(WBTC[ChainId.MATIC]),
    toV3Token(USDCE[ChainId.MATIC]),
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
    toV3Token(USDT[ChainId.ZKTESTNET]),
  ],
  [ChainId.ZKEVM]: [
    WMATIC_EXTENDED[ChainId.ZKEVM],
    toV3Token(USDT[ChainId.ZKEVM]),
    toV3Token(USDC[ChainId.ZKEVM]),
    toV3Token(MATIC[ChainId.ZKEVM]),
    //toV3Token(DAI[ChainId.ZKEVM]),
    //toV3Token(WBTC[ChainId.ZKEVM]),
  ],
  [ChainId.MANTA]: [
    WMATIC_EXTENDED[ChainId.MANTA],
    //toV3Token(USDT[ChainId.MANTA]),
    toV3Token(USDC[ChainId.MANTA]),
    //toV3Token(WBTC[ChainId.MANTA]),
    //toV3Token(MATIC[ChainId.MANTA]),
    //toV3Token(NEW_QUICK[ChainId.MANTA]),
    toV3Token(STONE[ChainId.MANTA]),
    toV3Token(MANTA[ChainId.MANTA]),
  ],
  [ChainId.ZKATANA]: [
    WMATIC_EXTENDED[ChainId.ZKATANA],
    toV3Token(USDC[ChainId.ZKATANA]),
  ],
  [ChainId.X1]: [WMATIC_EXTENDED[ChainId.X1], toV3Token(USDC[ChainId.X1])],
  [ChainId.TIMX]: [
    WMATIC_EXTENDED[ChainId.TIMX],
    toV3Token(USDC[ChainId.TIMX]),
  ],
  [ChainId.IMX]: [
    WMATIC_EXTENDED[ChainId.IMX],
    toV3Token(USDC[ChainId.IMX]),
    toV3Token(USDT[ChainId.IMX]),
    toV3Token(ETHER[ChainId.IMX]),
    //toV3Token(WBTC[ChainId.IMX]),
  ],
  [ChainId.ASTARZKEVM]: [
    WMATIC_EXTENDED[ChainId.ASTARZKEVM],
    toV3Token(USDC[ChainId.ASTARZKEVM]),
    toV3Token(ASTR[ChainId.ASTARZKEVM]),
  ],
  [ChainId.LAYERX]: [
    WMATIC_EXTENDED[ChainId.LAYERX],
    toV3Token(USDC[ChainId.LAYERX]),
    toV3Token(USDT[ChainId.LAYERX]),
    toV3Token(ETHER[ChainId.LAYERX]),
  ],
};

export const V2_PINNED_PAIRS: {
  [ChainId: number]: [Token, Token][];
} = {
  [ChainId.MATIC]: [
    [USDC[ChainId.MATIC], USDT[ChainId.MATIC]],
    [USDCE[ChainId.MATIC], USDT[ChainId.MATIC]],
    [USDC[ChainId.MATIC], DAI[ChainId.MATIC]],
    [USDCE[ChainId.MATIC], DAI[ChainId.MATIC]],
    [ETHER[ChainId.MATIC], USDC[ChainId.MATIC]],
    [ETHER[ChainId.MATIC], USDCE[ChainId.MATIC]],
    [WBTC[ChainId.MATIC], ETHER[ChainId.MATIC]],
    [WETH[ChainId.MATIC], USDT[ChainId.MATIC]],
    [WETH[ChainId.MATIC], USDC[ChainId.MATIC]],
    [WETH[ChainId.MATIC], USDCE[ChainId.MATIC]],
    [WETH[ChainId.MATIC], ETHER[ChainId.MATIC]],
    [ETHER[ChainId.MATIC], OLD_QUICK[ChainId.MATIC]],
  ],
};

export const V3_PINNED_PAIRS: {
  [ChainId: number]: [TokenV3, TokenV3][];
} = {
  [ChainId.MATIC]: [
    [toV3Token(USDC[ChainId.MATIC]), toV3Token(USDT[ChainId.MATIC])],
    [toV3Token(USDCE[ChainId.MATIC]), toV3Token(USDT[ChainId.MATIC])],
    [toV3Token(USDC[ChainId.MATIC]), toV3Token(DAI[ChainId.MATIC])],
    [toV3Token(USDCE[ChainId.MATIC]), toV3Token(DAI[ChainId.MATIC])],
    [toV3Token(ETHER[ChainId.MATIC]), toV3Token(USDC[ChainId.MATIC])],
    [toV3Token(ETHER[ChainId.MATIC]), toV3Token(USDCE[ChainId.MATIC])],
    [toV3Token(WBTC[ChainId.MATIC]), toV3Token(ETHER[ChainId.MATIC])],
    [toV3Token(WETH[ChainId.MATIC]), toV3Token(USDT[ChainId.MATIC])],
    [toV3Token(WETH[ChainId.MATIC]), toV3Token(USDC[ChainId.MATIC])],
    [toV3Token(WETH[ChainId.MATIC]), toV3Token(USDCE[ChainId.MATIC])],
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
