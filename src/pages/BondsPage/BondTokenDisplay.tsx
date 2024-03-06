import React, { useMemo } from 'react';
import { getTokenFromAddress } from '~/utils';
import { useSelectedTokenList } from '~/state/lists/hooks';
import { Token } from '@uniswap/sdk';
import { CurrencyLogo, DoubleCurrencyLogo } from '~/components';
import BondArrow from '~/assets/images/bondArrow.svg?react';
import { Box } from '@material-ui/core';
import { useActiveWeb3React } from '~/hooks';

interface BondTokenDisplayProps {
  token1Obj?: any;
  token2Obj?: any;
  token3Obj?: any;
  token4Obj?: any;
  stakeLP?: boolean;
  earnLp?: boolean;
  noEarnToken?: boolean;
  dualEarn?: boolean;
  size?: number;
}

const BondTokenDisplay: React.FC<BondTokenDisplayProps> = ({
  token1Obj,
  token2Obj,
  token3Obj,
  token4Obj,
  stakeLP,
  earnLp,
  noEarnToken,
  dualEarn,
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

  const token4Address =
    token4Obj && token4Obj.address ? token4Obj.address[chainId] : undefined;
  const token4 = useMemo(() => {
    if (!token4Address) return;
    const tokenFromAddress = getTokenFromAddress(
      token4Address,
      chainId,
      tokenMap,
      [],
    );
    if (tokenFromAddress) return tokenFromAddress;
    const tokenDecimals =
      token4Obj && token4Obj.decimals ? token4Obj.decimals[chainId] : undefined;
    if (tokenDecimals) {
      return new Token(
        chainId,
        token4Address,
        tokenDecimals,
        token4Obj?.symbol,
      );
    }
    return;
  }, [chainId, token4Obj, token4Address, tokenMap]);

  const LpToken = (
    <Box className='flex items-center'>
      <DoubleCurrencyLogo currency0={token1} currency1={token2} size={size} />
    </Box>
  );

  const StakeTokenEarnToken = (
    <Box className='flex items-center' gridGap={8}>
      <CurrencyLogo currency={token1} size={`${size}px`} />
      <BondArrow />
      <CurrencyLogo currency={token2} size={`${size}px`} />
    </Box>
  );

  const StakeLpEarnToken = (
    <Box className='flex items-center' gridGap={8}>
      <DoubleCurrencyLogo currency0={token1} currency1={token2} size={size} />
      <BondArrow />
      <CurrencyLogo currency={token3} size={`${size}px`} />
    </Box>
  );

  const StakeLpEarnLp = (
    <Box className='flex items-center' gridGap={8}>
      <DoubleCurrencyLogo currency0={token1} currency1={token2} size={size} />
      <BondArrow />
      {token4 ? (
        <DoubleCurrencyLogo currency0={token3} currency1={token4} size={size} />
      ) : (
        <CurrencyLogo currency={token3} size={`${size}px`} />
      )}
    </Box>
  );

  const DualEarn = (
    <Box className='flex items-center' gridGap={8}>
      <DoubleCurrencyLogo currency0={token1} currency1={token2} size={size} />
      <BondArrow />
      <DoubleCurrencyLogo currency0={token3} currency1={token4} size={size} />
    </Box>
  );

  const StakeTokenEarnLp = (
    <Box className='flex items-center' gridGap={8}>
      <CurrencyLogo currency={token1} size={`${size}px`} />
      <BondArrow />
      <DoubleCurrencyLogo currency0={token2} currency1={token2} size={size} />
    </Box>
  );

  if (token1 && !token2 && !token3 && !token4) {
    return (
      <Box className='flex items-center'>
        <CurrencyLogo currency={token1} size={`${size}px`} />
      </Box>
    );
  }
  if (stakeLP && earnLp) {
    return StakeLpEarnLp;
  }
  if (noEarnToken) {
    return LpToken;
  }
  if (dualEarn) {
    return DualEarn;
  }
  if (!stakeLP && !earnLp) {
    return StakeTokenEarnToken;
  }
  if (stakeLP && !earnLp) {
    return StakeLpEarnToken;
  }
  return StakeTokenEarnLp;
};

export default BondTokenDisplay;
