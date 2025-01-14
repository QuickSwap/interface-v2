import { defaultAbiCoder } from '@ethersproject/abi';
import { getCreate2Address } from '@ethersproject/address';
import { keccak256 } from '@ethersproject/solidity';
import { Token } from '@uniswap/sdk-core';
import {
  FeeAmount,
  POOL_INIT_CODE_HASH,
  UNI_POOL_INIT_CODE_HASH,
} from './v3constants';
import { getConfig } from '../../config/index';

/**
 * Computes a pool address
 * @param poolDeployer Algebra pool deploy or uniswap v3 factory address
 * @param tokenA The first token of the pair, irrespective of sort order
 * @param tokenB The second token of the pair, irrespective of sort order
 * @param fee The fee tier of the pool
 * @returns The pool address
 */
export function computePoolAddress({
  poolDeployer,
  tokenA,
  tokenB,
  fee,
  initCodeHashManualOverride,
}: {
  poolDeployer: string;
  tokenA: Token;
  tokenB: Token;
  fee?: FeeAmount;
  initCodeHashManualOverride?: string;
}): string {
  const [token0, token1] = tokenA.sortsBefore(tokenB)
    ? [tokenA, tokenB]
    : [tokenB, tokenA]; // does safety checks
  const config = getConfig(tokenA.chainId);
  const poolInitCodeHash = config['poolInitCodeHash'];
  return getCreate2Address(
    poolDeployer,
    keccak256(
      ['bytes'],
      [
        fee
          ? defaultAbiCoder.encode(
              ['address', 'address', 'uint24'],
              [token0.address, token1.address, fee],
            )
          : defaultAbiCoder.encode(
              ['address', 'address'],
              [token0.address, token1.address],
            ),
      ],
    ),
    initCodeHashManualOverride ?? fee
      ? UNI_POOL_INIT_CODE_HASH
      : poolInitCodeHash
      ? poolInitCodeHash
      : POOL_INIT_CODE_HASH,
  );
}
