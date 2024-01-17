import React from 'react';
import { Box } from '@mui/material';
import { useActiveWeb3React } from 'hooks';
import { getAllGammaPairs, getTokenFromAddress } from 'utils';
import { useSelectedTokenList } from 'state/lists/hooks';
import GammaLPItem from './GammaLPItem';
import { formatUnits } from 'ethers/lib/utils';

const GammaLPList: React.FC<{
  gammaPositions: any[];
}> = ({ gammaPositions }) => {
  const { chainId } = useActiveWeb3React();
  const tokenMap = useSelectedTokenList();

  const getTokensFromPosition = (position: any) => {
    if (!chainId) return;
    const gammaPair = getAllGammaPairs(chainId).find(
      (pair) =>
        pair.address.toLowerCase() === position.pairAddress.toLowerCase(),
    );
    const token0 = gammaPair
      ? getTokenFromAddress(gammaPair.token0Address, chainId, tokenMap, [])
      : undefined;
    const token1 = gammaPair
      ? getTokenFromAddress(gammaPair.token1Address, chainId, tokenMap, [])
      : undefined;
    return { token0, token1 };
  };

  const positionsList = gammaPositions.map((position) => {
    const tokens = getTokensFromPosition(position);
    if (!tokens) return { ...position, balance0: 0, balance1: 0 };
    const { token0, token1 } = tokens;
    const amount0 =
      position.totalAmount0 && token0
        ? Number(formatUnits(position.totalAmount0, token0.decimals))
        : 0;
    const amount1 =
      position.totalAmount1 && token1
        ? Number(formatUnits(position.totalAmount1, token1.decimals))
        : 0;
    const balance0 =
      position.totalSupply && position.totalSupply > 0
        ? (amount0 * position.lpAmount) / position.totalSupply
        : 0;
    const balance1 =
      position.totalSupply && position.totalSupply > 0
        ? (amount1 * position.lpAmount) / position.totalSupply
        : 0;
    return {
      ...position,
      balance0,
      balance1,
      token0,
      token1,
      shares: position.lpAmount * 10 ** 18,
    };
  });

  return (
    <Box>
      {positionsList.map((position, ind) => (
        <GammaLPItem key={ind} gammaPosition={position} />
      ))}
    </Box>
  );
};

export default GammaLPList;
