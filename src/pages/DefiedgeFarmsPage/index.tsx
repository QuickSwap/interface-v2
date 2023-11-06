import React from 'react';
import { Box } from '@material-ui/core';
import { Frown } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { GlobalConst, GlobalData } from 'constants/index';
import DefiedgeFarmCard from './DefiedgeFarmCard';
import { getAllDefiedgeStrategies, getTokenFromAddress } from 'utils';
import { useActiveWeb3React } from 'hooks';
import { useSelectedTokenList } from 'state/lists/hooks';
import useParsedQueryString from 'hooks/useParsedQueryString';

const DefiedgeFarmsPage: React.FC<{
  farmFilter: string;
  search: string;
  sortBy: string;
  sortDesc: boolean;
}> = ({ farmFilter, search, sortBy, sortDesc }) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const tokenMap = useSelectedTokenList();
  const parsedQuery = useParsedQueryString();
  const farmStatus =
    parsedQuery && parsedQuery.farmStatus
      ? (parsedQuery.farmStatus as string)
      : 'active';

  const allDefiedgeFarms = getAllDefiedgeStrategies(chainId).filter(
    (item) => !!item.ableToFarm === (farmStatus === 'active'),
  );
  const sortMultiplier = sortDesc ? -1 : 1;
  const { v3FarmSortBy, v3FarmFilter } = GlobalConst.utils;

  const filteredFarms = allDefiedgeFarms
    .map((item) => {
      if (chainId) {
        const token0 = getTokenFromAddress(item.token0, chainId, tokenMap, []);
        const token1 = getTokenFromAddress(item.token1, chainId, tokenMap, []);
        return { ...item, token0: token0 ?? null, token1: token1 ?? null };
      }
      return { ...item, token0: null, token1: null };
    })
    .filter((item) => {
      const searchCondition =
        (item.token0 &&
          item.token0.symbol &&
          item.token0.symbol.toLowerCase().includes(search.toLowerCase())) ||
        (item.token0 &&
          item.token0.address.toLowerCase().includes(search.toLowerCase())) ||
        (item.token1 &&
          item.token1.symbol &&
          item.token1.symbol.toLowerCase().includes(search.toLowerCase())) ||
        (item.token1 &&
          item.token1.address.toLowerCase().includes(search.toLowerCase()));
      const blueChipCondition =
        !!GlobalData.blueChips[chainId].find(
          (token) =>
            item.token0 &&
            token.address.toLowerCase() === item.token0.address.toLowerCase(),
        ) &&
        !!GlobalData.blueChips[chainId].find(
          (token) =>
            item.token1 &&
            token.address.toLowerCase() === item.token1.address.toLowerCase(),
        );
      const stableCoinCondition =
        !!GlobalData.stableCoins[chainId].find(
          (token) =>
            item.token0 &&
            token.address.toLowerCase() === item.token0.address.toLowerCase(),
        ) &&
        !!GlobalData.stableCoins[chainId].find(
          (token) =>
            item.token1 &&
            token.address.toLowerCase() === item.token1.address.toLowerCase(),
        );

      const stablePair0 = GlobalData.stablePairs[chainId].find(
        (tokens) =>
          !!tokens.find(
            (token) =>
              item.token0 &&
              token.address.toLowerCase() === item.token0.address.toLowerCase(),
          ),
      );
      const stablePair1 = GlobalData.stablePairs[chainId].find(
        (tokens) =>
          !!tokens.find(
            (token) =>
              item.token1 &&
              token.address.toLowerCase() === item.token1.address.toLowerCase(),
          ),
      );
      const stableLPCondition =
        (stablePair0 &&
          stablePair0.find(
            (token) =>
              item.token1 &&
              token.address.toLowerCase() === item.token1.address.toLowerCase(),
          )) ||
        (stablePair1 &&
          stablePair1.find(
            (token) =>
              item.token0 &&
              token.address.toLowerCase() === item.token0.address.toLowerCase(),
          ));

      return (
        searchCondition &&
        (farmFilter === v3FarmFilter.blueChip
          ? blueChipCondition
          : farmFilter === v3FarmFilter.stableCoin
          ? stableCoinCondition
          : farmFilter === v3FarmFilter.stableLP
          ? stableLPCondition
          : farmFilter === v3FarmFilter.otherLP
          ? !blueChipCondition && !stableCoinCondition && !stableLPCondition
          : true)
      );
    });

  return (
    <Box px={2} py={3}>
      {filteredFarms.length === 0 ? (
        <div
          className='flex flex-col items-center'
          style={{ padding: '16px 0' }}
        >
          <Frown size={'2rem'} stroke={'white'} />
          <p style={{ marginTop: 12 }}>{t('noDefiedgeFarms')}</p>
        </div>
      ) : filteredFarms.length > 0 && chainId ? (
        <Box>
          {filteredFarms.map((farm) => {
            return (
              <Box mb={2} key={farm.id}>
                <DefiedgeFarmCard
                  token0={farm.token0}
                  token1={farm.token1}
                  pairData={farm}
                />
              </Box>
            );
          })}
        </Box>
      ) : null}
    </Box>
  );
};

export default DefiedgeFarmsPage;
