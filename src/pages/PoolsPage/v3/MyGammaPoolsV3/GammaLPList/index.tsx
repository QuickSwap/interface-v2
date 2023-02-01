import React from 'react';
import { useActiveWeb3React } from 'hooks';
import { GammaPairs } from 'constants/index';
import { getTokenFromAddress } from 'utils';
import { useSelectedTokenList } from 'state/lists/hooks';
import GammaLPItem from '../GammaLPItem';
import { Token } from '@uniswap/sdk-core';

const GammaLPList: React.FC<{ gammaPositions: any; gammaPairs: string[] }> = ({
  gammaPositions,
  gammaPairs,
}) => {
  const { chainId } = useActiveWeb3React();
  const tokenMap = useSelectedTokenList();

  const positionsList = chainId
    ? gammaPairs.map((pairAddress) => {
        const gammaData = gammaPositions[pairAddress];
        const pairIndex = Object.values(GammaPairs).findIndex(
          (pairData) =>
            !!pairData.find(
              (item) =>
                item.address.toLowerCase() === pairAddress.toLowerCase(),
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
        return { ...gammaData, token0, token1, pairAddress };
      })
    : [];

  return (
    <div>
      {positionsList.map((position, ind) => (
        <GammaLPItem key={ind} gammaPosition={position} />
      ))}
    </div>
  );
};

export default GammaLPList;
