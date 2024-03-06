import { SwapDataV3, ContestLeaderBoard } from '~/models/interfaces/contest';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
dayjs.extend(utc);
dayjs.extend(weekOfYear);

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
