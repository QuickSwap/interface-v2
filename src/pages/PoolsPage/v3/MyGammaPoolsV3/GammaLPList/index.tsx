import React from 'react';
import { Box } from '@material-ui/core';
import { useActiveWeb3React } from 'hooks';
import { GammaPairs } from 'constants/index';
import { getTokenFromAddress } from 'utils';
import { useSelectedTokenList } from 'state/lists/hooks';
import GammaLPItem from '../GammaLPItem';
import { Token } from '@uniswap/sdk-core';
import { formatUnits } from 'ethers/lib/utils';

const GammaLPList: React.FC<{
  gammaPositions: any;
  gammaPairs: string[];
  stakedPositions: any[];
}> = ({ gammaPositions, gammaPairs, stakedPositions }) => {
  const { chainId } = useActiveWeb3React();
  const tokenMap = useSelectedTokenList();

  const getTokensFromPosition = (position: any) => {
    if (!chainId) return;
    const pairIndex = Object.values(GammaPairs).findIndex(
      (pairData) =>
        !!pairData.find(
          (item) =>
            item.address.toLowerCase() === position.pairAddress.toLowerCase(),
        ),
    );
    const tokenArray = Object.keys(GammaPairs)[pairIndex].split('-');
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
    return { token0, token1 };
  };

  const stakedLPs = stakedPositions.map((position) => {
    const tokens = getTokensFromPosition(position);
    if (!tokens) return { ...position, balance0: 0, balance1: 0 };
    const { token0, token1 } = tokens;
    const amount0 = position.totalAmount0
      ? Number(formatUnits(position.totalAmount0, token0.decimals))
      : 0;
    const amount1 = position.totalAmount1
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

  const positionsList = gammaPairs
    .map((pairAddress) => {
      const gammaData = gammaPositions[pairAddress];
      return { ...gammaData, pairAddress, farming: false };
    })
    .map((position: any) => {
      const tokens = getTokensFromPosition(position);
      if (!tokens) return position;

      const { token0, token1 } = tokens;
      return { ...position, token0, token1 };
    })
    .concat(stakedLPs);

  return (
    <Box>
      {positionsList.map((position, ind) => (
        <GammaLPItem key={ind} gammaPosition={position} />
      ))}
    </Box>
  );
};

export default GammaLPList;
