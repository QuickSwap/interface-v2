import { SwapDataV3 } from 'models/interfaces/contest';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { SWAP_TRANSACTIONS_V3 } from 'apollo/queries-v3';
import { clientV3 } from 'apollo/client';
dayjs.extend(utc);
dayjs.extend(weekOfYear);

export const getSwapTransactionsV3 = async (
  poolId: string,
  fromTime?: number,
  toTime?: number,
  skip = 0,
): Promise<SwapDataV3[]> => {
  const today = dayjs()
    .utc()
    .unix();
  const oneDayAgo = dayjs
    .utc()
    .subtract(1, 'day')
    .unix();
  const fromTimestamp = fromTime ?? oneDayAgo;
  const toTimestamp = toTime ?? today;

  try {
    const result = await clientV3.query({
      query: SWAP_TRANSACTIONS_V3,
      variables: {
        pool: poolId,
        timestamp_gte: fromTimestamp,
        timestamp_lte: toTimestamp,
        skip: skip,
      },
      fetchPolicy: 'network-only',
    });

    const swaps: SwapDataV3[] = result.data.swaps;

    return swaps;
  } catch (e) {
    console.error('error getSwapTransactionsV3', e);
    return [];
  }
};
