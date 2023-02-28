import { SwapDataV3, ContestLeaderBoard } from 'models/interfaces/contest';
import { getSwapTransactionsV3 } from 'utils/v3/contest';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
dayjs.extend(utc);
dayjs.extend(weekOfYear);

export const getTradingDataOfDay = async (
  pool: string[],
  fromTime: number,
  toTime: number,
  origin: string,
) => {
  let daysTrades: SwapDataV3[] = [];
  /**
   * We can query graph with max limit = 1000, skip=5000, exceeds the limit will throw error
   * Loop through the pages and get the data
   * If the page data is less than 1000 (which means there is no data on next page), break the loop
   */
  for (let index = 0; index <= 5; index++) {
    const pageData = await getSwapTransactionsV3(
      pool,
      fromTime,
      toTime,
      origin,
      index * 1000,
    );
    daysTrades = daysTrades.concat(pageData);
    if (pageData.length < 1000) {
      break;
    }
  }
  return daysTrades;
};

export const getTradingDataBetweenDates = async (
  pool: string[],
  fromDate: number,
  toDate: number,
  origin: string,
) => {
  const diffDays = dayjs(toDate).diff(dayjs(fromDate), 'day');
  let weeksTradeData: SwapDataV3[] = [];
  for (let i = 0; i < diffDays; i++) {
    const fromTime = dayjs(fromDate)
      .add(i, 'day')
      .unix();
    const toTime = dayjs(fromDate)
      .add(i + 1, 'day')
      .unix();
    const swapData = await getTradingDataOfDay(pool, fromTime, toTime, origin);
    weeksTradeData = weeksTradeData.concat(swapData);
  }
  return weeksTradeData;
};

export const getFormattedLeaderBoardData = (swapData: SwapDataV3[]) => {
  let formattedLeaderBoardData = swapData.reduce(
    (p: ContestLeaderBoard[], c) => {
      const i = p.findIndex((e: ContestLeaderBoard) => e.origin === c.origin);

      if (i === -1) {
        p.push({
          origin: c.origin,
          amountUSD: +c.amountUSD,
          txCount: 1,
          rank: '>300',
        } as ContestLeaderBoard);
      } else {
        p[i].amountUSD += +c.amountUSD;
        p[i].txCount += 1;
      }
      return p;
    },
    [],
  );
  formattedLeaderBoardData = formattedLeaderBoardData.sort(
    (a, b) => b.amountUSD - a.amountUSD,
  );
  return formattedLeaderBoardData;
};
