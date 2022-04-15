import { USDPricedPoolAsset } from '../../utils/marketxyz/fetchPoolData';
import { useMemo } from 'react';

export const useBorrowLimit = (
  assets: USDPricedPoolAsset[],
  options?: { ignoreIsEnabledCheckFor: string },
) => {
  const maxBorrow = useMemo(() => {
    let maxBorrow = 0;
    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];

      if (
        options?.ignoreIsEnabledCheckFor === asset.cToken.address ||
        asset.membership
      ) {
        maxBorrow +=
          asset.supplyBalanceUSD *
          (Number(asset.collateralFactor.toString()) / 1e18);
      }
    }
    return maxBorrow;
  }, [assets, options?.ignoreIsEnabledCheckFor]);

  return maxBorrow;
};

export const useBorrowLimits = (
  assetsArray: USDPricedPoolAsset[][] | null,
  options?: { ignoreIsEnabledCheckFor: string },
) => {
  const maxBorrows = useMemo(() => {
    return assetsArray?.map((assets) => {
      let maxBorrow = 0;
      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];

        if (
          options?.ignoreIsEnabledCheckFor === asset.cToken.address ||
          asset.membership
        ) {
          maxBorrow +=
            asset.supplyBalanceUSD *
            (Number(asset.collateralFactor.toString()) / 1e18);
        }
      }
      return maxBorrow;
    });
  }, [assetsArray, options?.ignoreIsEnabledCheckFor]);

  return maxBorrows;
};
