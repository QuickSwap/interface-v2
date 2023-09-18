import React, { useMemo } from 'react';
import { getTokenFromAddress } from 'utils';
import { useSelectedTokenList } from 'state/lists/hooks';
import { Token } from '@uniswap/sdk';
import { CurrencyLogo, DoubleCurrencyLogo } from 'components';
import { ReactComponent as BondArrow } from 'assets/images/bondArrow.svg';
import { Box } from '@material-ui/core';
import { useActiveWeb3React } from 'hooks';

interface BondTokenDisplayProps {
  token1Obj?: any;
  token2Obj?: any;
  token3Obj?: any;
  stakeLP?: boolean;
  size?: number;
}

const BondTokenDisplay: React.FC<BondTokenDisplayProps> = ({
  token1Obj,
  token2Obj,
  token3Obj,
  stakeLP,
  size = 32,
}) => {
  const { chainId } = useActiveWeb3React();
  const tokenMap = useSelectedTokenList();
  const token1Address =
    token1Obj && token1Obj.address ? token1Obj.address[chainId] : undefined;
  const token1 = useMemo(() => {
    if (!token1Address) return;
    const tokenFromAddress = getTokenFromAddress(
      token1Address,
      chainId,
      tokenMap,
      [],
    );
    if (tokenFromAddress) return tokenFromAddress;
    const tokenDecimals =
      token1Obj && token1Obj.decimals ? token1Obj.decimals[chainId] : undefined;
    if (tokenDecimals) {
      return new Token(
        chainId,
        token1Address,
        tokenDecimals,
        token1Obj?.symbol,
      );
    }
    return;
  }, [chainId, token1Obj, token1Address, tokenMap]);
  const token2Address =
    token2Obj && token2Obj.address ? token2Obj.address[chainId] : undefined;
  const token2 = useMemo(() => {
    if (!token2Address) return;
    const tokenFromAddress = getTokenFromAddress(
      token2Address,
      chainId,
      tokenMap,
      [],
    );
    if (tokenFromAddress) return tokenFromAddress;
    const tokenDecimals =
      token2Obj && token2Obj.decimals ? token2Obj.decimals[chainId] : undefined;
    if (tokenDecimals) {
      return new Token(
        chainId,
        token2Address,
        tokenDecimals,
        token2Obj?.symbol,
      );
    }
    return;
  }, [chainId, token2Address, token2Obj, tokenMap]);
  const token3Address =
    token3Obj && token3Obj.address ? token3Obj.address[chainId] : undefined;
  const token3 = useMemo(() => {
    if (!token3Address) return;
    const tokenFromAddress = getTokenFromAddress(
      token3Address,
      chainId,
      tokenMap,
      [],
    );
    if (tokenFromAddress) return tokenFromAddress;
    const tokenDecimals =
      token3Obj && token3Obj.decimals ? token3Obj.decimals[chainId] : undefined;
    if (tokenDecimals) {
      return new Token(
        chainId,
        token3Address,
        tokenDecimals,
        token3Obj?.symbol,
      );
    }
    return;
  }, [chainId, token3Obj, token3Address, tokenMap]);

  return (
    <Box className='flex items-center'>
      {stakeLP && token1 && token2 ? (
        <DoubleCurrencyLogo currency0={token1} currency1={token2} size={size} />
      ) : (
        <CurrencyLogo currency={token1} size={`${size}px`} />
      )}
      {token1 && token2 && token3 && (
        <Box className='flex' mx={1}>
          <BondArrow />
        </Box>
      )}
      {token3 && (
        <>
          {stakeLP ? (
            <CurrencyLogo currency={token3} size={`${size}px`} />
          ) : (
            <DoubleCurrencyLogo
              currency0={token2}
              currency1={token3}
              size={size}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default BondTokenDisplay;
