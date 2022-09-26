import { ChainId } from '@uniswap/sdk';

import { fetchFarms } from '@cryption/dapp-factory-sdk';
import { IFarmRewardsData } from '@cryption/dapp-factory-sdk/dist/sdkViews/FarmsAndPools/FarmService/fetchFarms';

export async function useCNTFarmList(
  chainId: ChainId,
  account: string | null | undefined,
): Promise<IFarmRewardsData[]> {
  console.log('Chain Id => ', chainId);
  console.log('Account => ', account);
  const farms = await fetchFarms(chainId || 137, 1, [], account || undefined);
  if (farms?.success) {
    console.log('Farms Data => ', farms.data);
    return farms.data;
  } else {
    return [];
  }
}
