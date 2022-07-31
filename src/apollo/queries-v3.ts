import gql from 'graphql-tag';

export const GLOBAL_DATA_V3 = (block?: number) => {
  const qString = `
    query globalData {
      factories ${block ? `(block: { number: ${block} })` : ''} {
        totalVolumeUSD
        untrackedVolumeUSD
        totalValueLockedUSD
        totalValueLockedUSDUntracked
        totalFeesUSD
      }
    }
  `;
  return gql(qString);
};
