import { fetchFarms } from '@cryption/dapp-factory-sdk';
import {
  IFarmRewardsData,
  IFullFarm,
} from '@cryption/dapp-factory-sdk/dist/sdkViews/FarmsAndPools/FarmService/fetchFarms';
import { ChainId } from '@uniswap/sdk';
import { CNTFarmListInfo, StakingRaw } from 'types';

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

function cntAdapter(input: IFarmRewardsData | IFullFarm): StakingRaw {
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
    rate: Number(rewardsPerToken),
    rewardToken: address,
    sponsored: false,
    stakingRewardAddress: id,
    tokens: [token0Address, token1Address],
  };
}

export default async function getCNTFarmList(
  chainId: ChainId,
  account: string | null | undefined,
  resolveENSContentHash: (ensName: string) => Promise<string>,
): Promise<CNTFarmListInfo> {
  return fetchFarms(chainId || ChainId.MATIC, 1, [], account || undefined).then(
    (response) => {
      const farms: Array<IFarmRewardsData | IFullFarm> = response.data;
      const stakings: Array<StakingRaw> = farms.map((cntFarm) =>
        cntAdapter(cntFarm),
      );
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
    },
  );
}
