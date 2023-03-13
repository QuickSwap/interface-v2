import { USDPricedPoolAsset } from '../../utils/marketxyz/fetchPoolData';
import { useMemo } from 'react';

export const useBorrowLimit = (
  assets?: USDPricedPoolAsset[],
  options?: { ignoreIsEnabledCheckFor: string },
) => {
  const maxBorrow = useMemo(() => {
    if (!assets) return 0;
    let maxBorrow = 0;
    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];

      if (
        (options &&
          options.ignoreIsEnabledCheckFor.toLowerCase() ===
            asset.cToken.address.toLowerCase()) ||
        asset.membership
      ) {
        maxBorrow +=
          asset.supplyBalanceUSD *
          (Number(asset.collateralFactor.toString()) / 1e18);
      }
    }
    return maxBorrow;
  }, [assets, options]);

  return maxBorrow;
};
