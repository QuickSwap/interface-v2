import React from 'react';
import { Box } from '@material-ui/core';
import { Frown } from 'react-feather';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/Loader';
import { GammaPairs } from 'constants/index';
import { useQuery } from 'react-query';
import GammaFarmCard from './GammaFarmCard';
import { getTokenFromAddress } from 'utils';
import { useActiveWeb3React } from 'hooks';
import { useSelectedTokenList } from 'state/lists/hooks';
import { Token } from '@uniswap/sdk';
import { GAMMA_MASTERCHEF_ADDRESSES } from 'constants/v3/addresses';

const GammaFarmsPage: React.FC<{
  farmFilter: number;
  search: string;
  sortBy: string;
  sortDesc: boolean;
}> = ({ farmFilter, search }) => {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();
  const tokenMap = useSelectedTokenList();
  const gammaFarms = Object.keys(GammaPairs).filter((pairStr) => {
    const gammaPair = GammaPairs[pairStr];
    return gammaPair && gammaPair.find((pairData) => pairData.ableToFarm);
  });
  const fetchGammaData = async () => {
    try {
      const data = await fetch(
        `https://gammawire.net/quickswap/polygon/hypervisors/allData`,
      );
      const gammaData = await data.json();
      return gammaData;
    } catch (e) {
      console.log(e);
      return;
    }
  };

  const fetchGammaRewards = async () => {
    try {
      const data = await fetch(
        `https://gammawire.net/quickswap/polygon/allRewards2`,
      );
      const gammaData = await data.json();
      return gammaData;
    } catch (e) {
      console.log(e);
      return;
    }
  };

  const fetchGammaPositions = async () => {
    if (!account) return;
    try {
      const data = await fetch(
        `https://gammawire.net/quickswap/polygon/user/${account}`,
      );
      const positions = await data.json();
      return positions[account.toLowerCase()];
    } catch (e) {
      console.log(e);
      return;
    }
  };

  const { isLoading: positionsLoading, data: gammaPositions } = useQuery(
    'fetchGammaPositions',
    fetchGammaPositions,
    {
      refetchInterval: 30000,
    },
  );

  const { isLoading: gammaFarmsLoading, data: gammaData } = useQuery(
    'fetchGammaData',
    fetchGammaData,
    {
      refetchInterval: 30000,
    },
  );

  const { isLoading: gammaRewardsLoading, data: gammaRewards } = useQuery(
    'fetchGammaRewards',
    fetchGammaRewards,
    {
      refetchInterval: 30000,
    },
  );

  return (
    <Box px={2} py={3}>
      {positionsLoading || gammaFarmsLoading || gammaRewardsLoading ? (
        <div>
          <Loader stroke='white' size='1.5rem' />
        </div>
      ) : !gammaFarms || gammaFarms.length === 0 ? (
        <div>
          <p>{t('noEternalFarms')}</p>
          <Frown size={'2rem'} stroke={'white'} />
        </div>
      ) : !gammaFarmsLoading && gammaFarms.length > 0 && chainId ? (
        <Box>
          {gammaFarms.map((farm) => (
            <>
              {GammaPairs[farm].map((pair) => {
                const tokenArray = farm.split('-');
                const token0Data = getTokenFromAddress(
                  tokenArray[0],
                  chainId,
                  tokenMap,
                  [],
                );
                const token1Data = getTokenFromAddress(
                  tokenArray[1],
                  chainId,
                  tokenMap,
                  [],
                );
                const token0 = new Token(
                  chainId,
                  token0Data.address,
                  token0Data.decimals,
                  token0Data.symbol,
                  token0Data.name,
                );
                const token1 = new Token(
                  chainId,
                  token1Data.address,
                  token1Data.decimals,
                  token1Data.symbol,
                  token1Data.name,
                );
                return (
                  <Box mb={2} key={pair.address}>
                    <GammaFarmCard
                      key={pair.address}
                      token0={token0}
                      token1={token1}
                      pairData={pair}
                      positionData={gammaPositions[pair.address.toLowerCase()]}
                      data={
                        gammaData
                          ? gammaData[pair.address.toLowerCase()]
                          : undefined
                      }
                      rewardData={
                        gammaRewards &&
                        gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[chainId]] &&
                        gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[chainId]][
                          'pools'
                        ]
                          ? gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[chainId]][
                              'pools'
                            ][pair.address.toLowerCase()]
                          : undefined
                      }
                    />
                  </Box>
                );
              })}
            </>
          ))}
        </Box>
      ) : null}
    </Box>
  );
};

export default GammaFarmsPage;
