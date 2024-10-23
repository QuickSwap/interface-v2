import React from 'react';
import { Box } from '@material-ui/core';
import { useActiveWeb3React } from 'hooks';
import { getAllDefiedgeStrategies, getTokenFromAddress } from 'utils';
import { useSelectedTokenList } from 'state/lists/hooks';
import DefiedgeLPItem from '../DefiedgeLPItem';
import { DefiedgeStrategy } from 'constants/index';

const DefiedgeLPList: React.FC<{
  defiedgePositions: DefiedgeStrategy[];
}> = ({ defiedgePositions }) => {
  const { chainId } = useActiveWeb3React();
  const tokenMap = useSelectedTokenList();

  const getTokensFromPosition = (position: any) => {
    if (!chainId) return;
    const defiedgeStrategy = getAllDefiedgeStrategies(chainId).find(
      (strategy) => strategy.id.toLowerCase() === position.id.toLowerCase(),
    );
    const token0 = defiedgeStrategy
      ? getTokenFromAddress(defiedgeStrategy.token0, chainId, tokenMap, [])
      : undefined;
    const token1 = defiedgeStrategy
      ? getTokenFromAddress(defiedgeStrategy?.token1, chainId, tokenMap, [])
      : undefined;
    return { token0, token1 };
  };

  const positionsList = defiedgePositions.map((position) => {
    const tokens = getTokensFromPosition(position);
    if (!tokens) return { ...position, balance0: 0, balance1: 0 };
    const { token0, token1 } = tokens;

    return {
      ...position,
      token0,
      token1,
    };
  });

  return (
    <Box>
      {positionsList.map((position, ind) => (
        <DefiedgeLPItem key={ind} defiedgePosition={position} />
      ))}
    </Box>
  );
};

export default DefiedgeLPList;
