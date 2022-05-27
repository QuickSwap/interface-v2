import {
  PoolDirectoryV1,
  PoolAsset,
  Comptroller,
  Pool,
  PoolLensV1,
} from 'market-sdk';
import Web3 from 'web3';
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

  const lens = new PoolLensV1(sdk, sdk.options!.poolLens);

  const summary = await lens.getPoolSummary(pool.comptroller);
  const assets = (await lens.getPoolAssetsWithData(pool.comptroller, {
    from: address,
    gas: 1e18,
  })) as USDPricedPoolAsset[];

  let totalLiquidityUSD = 0;

  let totalSupplyBalanceUSD = 0;
  let totalBorrowBalanceUSD = 0;

  let totalSuppliedUSD = 0;
  let totalBorrowedUSD = 0;

  const ethPrice = Web3.utils.toBN(Math.round((await getEthPrice())[0] * 1e2));
  const _1e36 = Web3.utils.toBN(10).pow(Web3.utils.toBN(36));

  await Promise.all(
    assets.map(async (asset) => {
      asset.isPaused = await pool.comptroller.borrowGuardianPaused(
        asset.cToken.address,
      );
      asset.isSupplyPaused = await pool.comptroller.mintGuardianPaused(
        asset.cToken.address,
      );

      asset.supplyBalanceUSD =
        parseInt(
          asset.supplyBalance
            .mul(asset.underlyingPrice)
            .mul(ethPrice)
            .div(_1e36)
            .toString(),
        ) / 1e2;

      asset.borrowBalanceUSD =
        parseInt(
          asset.borrowBalance
            .mul(asset.underlyingPrice)
            .mul(ethPrice)
            .div(_1e36)
            .toString(),
        ) / 1e2;

      totalSupplyBalanceUSD += asset.supplyBalanceUSD;
      totalBorrowBalanceUSD += asset.borrowBalanceUSD;

      asset.totalSupplyUSD =
        parseInt(
          asset.totalSupply
            .mul(asset.underlyingPrice)
            .mul(ethPrice)
            .div(_1e36)
            .toString(),
        ) / 1e2;
      asset.totalBorrowUSD =
        parseInt(
          asset.totalBorrow
            .mul(asset.underlyingPrice)
            .mul(ethPrice)
            .div(_1e36)
            .toString(),
        ) / 1e2;

      totalSuppliedUSD += asset.totalSupplyUSD;
      totalBorrowedUSD += asset.totalBorrowUSD;

      asset.liquidityUSD =
        parseInt(
          asset.liquidity
            .mul(asset.underlyingPrice)
            .mul(ethPrice)
            .div(_1e36)
            .toString(),
        ) / 1e2;

      totalLiquidityUSD += asset.liquidityUSD;
      return asset;
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
