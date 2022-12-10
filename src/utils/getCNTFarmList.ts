import { fetchFarms, IFarmRewardsData, IFullFarm } from '@cryption/df-sdk-core';
import { ChainId } from '@uniswap/sdk';
import { CNTFarmListInfo, StakingRaw } from 'types';
import Web3 from 'web3';

const web3 = new Web3();
const TOKEN_PREFS = [
  'USDC',
  'ETHER',
  'WMATIC',
  'USDT',
  'MAI',
  'DAI',
  'WBTC',
  'QUICK',
  'FRAX',
  'GHST',
];

function identifyBaseToken(
  token0Symbol: string,
  token0Address: string,
  token1Symbol: string,
  token1Address: string,
): string {
  for (const key of TOKEN_PREFS) {
    if (token0Symbol.toUpperCase() === key) {
      return token0Address;
    } else if (token1Symbol.toUpperCase() === key) {
      return token1Address;
    }
  }

  // Default set to token 0 address
  return token0Address;
}

function cntAdapter(input: IFullFarm | IFarmRewardsData): StakingRaw {
  const currentDate = Math.floor(new Date().getTime() / 1000);
  const {
    id,
    inputToken,
    token0Address,
    token1Address,
    token0Symbol,
    token1Symbol,
    rewardToken,
  } = input;

  const { address, rewardsPerToken } = rewardToken;
  const rewardValue: any = web3.utils.fromWei(rewardsPerToken);
  let isEnded = true;

  if ('periodFinish' in input) {
    isEnded = currentDate >= Number(input.periodFinish);
  }

  return {
    baseToken: identifyBaseToken(
      token0Symbol,
      token0Address,
      token1Symbol,
      token1Address,
    ),
    ended: isEnded,
    link: '',
    lp: '',
    name: '',
    pair: inputToken,
    rate: Number(rewardValue) * 86400,
    rewardToken: address,
    sponsored: false,
    stakingRewardAddress: id,
    tokens: [token0Address, token1Address],
  };
}

const isBannedFarm = (farm: IFullFarm | IFarmRewardsData) => {
  const bannedFarmIds = [
    '0x198156de74eb6b2aafa0aa88be9e0ed8e1228df2',
    '0x48f630083878aea063165260c0935908346741cf',
    '0x76e9c913e169d609c7943cc9b9f59bc0fdbb9ba5',
    '0xb78d8a8fafde4cb983cdef00b4aa5a1b448ab894',
  ];

  const index = bannedFarmIds.findIndex((d) => farm.id === d);
  return index > -1;
};

export default async function getCNTFarmList(
  chainId: ChainId,
  account: string | null | undefined,
  resolveENSContentHash: (ensName: string) => Promise<string>,
): Promise<CNTFarmListInfo> {
  const info: CNTFarmListInfo = {
    active: [],
    closed: [],
    name: 'CNT Farm List',
    timestamp: new Date().getTime().toString(),
    version: {
      major: 1,
      minor: 0,
      patch: 0,
    },
  };

  return fetchFarms(
    chainId || ChainId.MATIC,
    1,
    null,
    account || undefined,
  ).then((response) => {
    const farms: Array<IFullFarm | IFarmRewardsData> = response.data;

    const stakings: Array<StakingRaw> = farms
      .filter((f) => !isBannedFarm(f))
      .map((cntFarm) => cntAdapter(cntFarm));
    const info: CNTFarmListInfo = {
      active: stakings.filter((s) => s.ended === false),
      closed: stakings.filter((s) => s.ended),
      name: 'CNT Farm List',
      timestamp: new Date().getTime().toString(),
      version: {
        major: 1,
        minor: 0,
        patch: 0,
      },
    };

    return info;
  });
}
