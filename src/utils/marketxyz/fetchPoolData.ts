import { PoolDirectoryV1, PoolAsset, Comptroller, Pool } from 'market-sdk';
import { getEthPrice } from '../index';

export interface USDPricedPoolAsset extends PoolAsset {
  supplyBalanceUSD: number;
  borrowBalanceUSD: number;

  totalSupplyUSD: number;
  totalBorrowUSD: number;

  liquidityUSD: number;

  isPaused: boolean;
  isSupplyPaused: boolean;
}

export const getPoolIdFromComptroller = async (
  comptroller: Comptroller | string,
  directory: PoolDirectoryV1,
) => {
  if (typeof comptroller === 'string') {
    comptroller = new Comptroller(directory.sdk, comptroller);
  }
  const pools = await directory.getAllPools();

  return pools
    .findIndex((pool) => {
      return pool.comptroller.address == (comptroller as Comptroller).address;
    })
    .toString();
};

export interface PoolData {
  poolId: string;
  pool: Pool;
  summary: any;
  assets: USDPricedPoolAsset[];
  totalLiquidityUSD: number;
  totalSuppliedUSD: number;
  totalBorrowedUSD: number;
  totalSupplyBalanceUSD: number;
  totalBorrowBalanceUSD: number;
}

export const fetchPoolData = async (
  poolId: string | undefined,
  address: string | undefined,
  directory: PoolDirectoryV1,
): Promise<PoolData | undefined> => {
  if (!poolId) return undefined;

  const sdk = directory.sdk;
  const pool = await directory.pools(poolId, { from: address });

  const summary = await sdk.lens.v1?.getPoolSummary(pool.comptroller);
  const assets = (await sdk.lens.v1?.getPoolAssetsWithData(pool.comptroller, {
    from: address,
    gas: 1e18,
  })) as USDPricedPoolAsset[];

  let totalLiquidityUSD = 0;

  let totalSupplyBalanceUSD = 0;
  let totalBorrowBalanceUSD = 0;

  let totalSuppliedUSD = 0;
  let totalBorrowedUSD = 0;

  const ethPrice = sdk.web3.utils
    .toBN(Math.round((await getEthPrice())[0] * 1e10))
    .mul(sdk.web3.utils.toBN(1e8));

  const _1e36 = sdk.web3.utils.toBN(1e4).pow(sdk.web3.utils.toBN(9));

  await Promise.all(
    assets.map(async (asset) => {
      asset.isPaused = await pool.comptroller.borrowGuardianPaused(
        asset.cToken.address,
      );
      asset.isSupplyPaused = await pool.comptroller.mintGuardianPaused(
        asset.cToken.address,
      );

      asset.supplyBalanceUSD = asset.supplyBalance
        .mul(asset.underlyingPrice)
        .mul(ethPrice)
        .div(_1e36)
        .toNumber();

      asset.borrowBalanceUSD = asset.borrowBalance
        .mul(asset.underlyingPrice)
        .mul(ethPrice)
        .div(_1e36)
        .toNumber();

      totalSupplyBalanceUSD += asset.supplyBalanceUSD;
      totalBorrowBalanceUSD += asset.borrowBalanceUSD;

      asset.totalSupplyUSD = asset.totalSupply
        .mul(asset.underlyingPrice)
        .mul(ethPrice)
        .div(_1e36)
        .toNumber();

      asset.totalBorrowUSD = asset.totalBorrow
        .mul(asset.underlyingPrice)
        .mul(ethPrice)
        .div(_1e36)
        .toNumber();

      totalSuppliedUSD += asset.totalSupplyUSD;
      totalBorrowedUSD += asset.totalBorrowUSD;

      asset.liquidityUSD = asset.liquidity
        .mul(asset.underlyingPrice)
        .mul(ethPrice)
        .div(_1e36)
        .toNumber();

      totalLiquidityUSD += asset.liquidityUSD;
    }),
  );

  return {
    poolId,
    pool,
    summary,
    assets: assets.sort((a, b) => (b.liquidityUSD > a.liquidityUSD ? 1 : -1)),

    totalLiquidityUSD,
    totalSuppliedUSD,
    totalBorrowedUSD,
    totalSupplyBalanceUSD,
    totalBorrowBalanceUSD,
  };
};
