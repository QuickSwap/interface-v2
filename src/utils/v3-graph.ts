import { clientV3 } from 'apollo/client';
import { GLOBAL_ALLDATA, GLOBAL_DATA } from 'apollo/queries';
import { GLOBAL_DATA_V3 } from 'apollo/queries-v3';
import { getBlocksFromTimestamps, getPercentChange } from 'utils';
import dayjs from 'dayjs';

export async function getGlobalDataV3(): Promise<any> {
  let data: any = {};

  try {
    const utcCurrentTime = dayjs();

    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();

    const [oneDayBlock] = await getBlocksFromTimestamps([utcOneDayBack]);

    const dataCurrent = await clientV3.query({
      query: GLOBAL_DATA_V3(),
      fetchPolicy: 'network-only',
    });

    const data24H = await clientV3.query({
      query: GLOBAL_DATA_V3(oneDayBlock.number),
      fetchPolicy: 'network-only',
    });

    const [statsCurrent, stats24H] = [
      dataCurrent.data.factories[0],
      data24H.data.factories[0],
    ];

    const volumeUSD =
      statsCurrent && stats24H
        ? parseFloat(statsCurrent.totalVolumeUSD) -
          parseFloat(stats24H.totalVolumeUSD)
        : parseFloat(statsCurrent.totalVolumeUSD);

    const volumeUSDChange = getPercentChange(
      statsCurrent ? statsCurrent.totalVolumeUSD : undefined,
      stats24H ? stats24H.totalVolumeUSD : undefined,
    );

    const tvlUSDChange = getPercentChange(
      statsCurrent ? statsCurrent.totalValueLockedUSD : undefined,
      stats24H ? stats24H.totalValueLockedUSD : undefined,
    );

    const feesUSD =
      statsCurrent && stats24H
        ? parseFloat(statsCurrent.totalFeesUSD) -
          parseFloat(stats24H.totalFeesUSD)
        : parseFloat(statsCurrent.totalFeesUSD);

    const feesUSDChange = getPercentChange(
      statsCurrent ? statsCurrent.totalFeesUSD : undefined,
      stats24H ? stats24H.totalFeesUSD : undefined,
    );

    data = {
      tvlUSD: statsCurrent.totalValueLockedUSD,
      tvlUSDChange,
      volumeUSD,
      volumeUSDChange,
      feesUSD,
      feesUSDChange,
    };
  } catch (e) {
    console.log(e);
  }

  return data;
}
