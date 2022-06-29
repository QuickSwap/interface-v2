import { defaultAbiCoder } from '@ethersproject/abi'
import { getCreate2Address } from '@ethersproject/address'
import { keccak256 } from '@ethersproject/solidity'
import { Token } from '@uniswap/sdk-core'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

export const POOL_INIT_CODE_HASH = '0x6f8da21644d39435fbc8337b1031e14292c1d5a0042041eb303b6145c64c0a16'

/**
 * The default factory enabled fee amounts, denominated in hundredths of bips.
 */
export enum FeeAmount {
    LOW = 500,
    MEDIUM = 500,
    HIGH = 500,
}

/**
 * The default factory tick spacings by fee amount.
 */
export const TICK_SPACINGS: { [amount in FeeAmount]: number } = {
    [FeeAmount.LOW]: 60,
    [FeeAmount.MEDIUM]: 60,
    [FeeAmount.HIGH]: 60
}

/**
 * Computes a pool address
 * @param poolDeployer The Algebra factory address
 * @param tokenA The first token of the pair, irrespective of sort order
 * @param tokenB The second token of the pair, irrespective of sort order
 * @param fee The fee tier of the pool
 * @returns The pool address
 */
export function computePoolAddress({
    poolDeployer,
    tokenA,
    tokenB,
    initCodeHashManualOverride
}: {
    poolDeployer: string
    tokenA: Token
    tokenB: Token
    initCodeHashManualOverride?: string
}): string {
    const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA] // does safety checks
    return getCreate2Address(
        poolDeployer,
        keccak256(
            ['bytes'],
            [defaultAbiCoder.encode(['address', 'address'], [token0.address, token1.address])]
        ),
        initCodeHashManualOverride ?? POOL_INIT_CODE_HASH
    )
}
