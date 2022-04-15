import { Comptroller } from 'market-sdk';
import { useEffect, useState } from 'react';

export const useExtraPoolData = (
  comptroller: Comptroller | undefined,
  address: string | undefined,
) => {
  const [extraPoolData, setExtraPoolData] = useState<{
    admin: string;
    upgradeable: boolean;
    enforceWhitelist: boolean;
    whitelist: string[];
    isPowerfulAdmin: boolean;
    oracle: string;
    closeFactor: number;
    liquidationIncentive: number;
    pendingAdmin: string;
  }>();

  useEffect(() => {
    if (!comptroller) {
      return;
    }

    (async () => {
      const [
        admin,
        upgradeable,
        oracle,
        closeFactor,
        liquidationIncentive,
        enforceWhitelist,
        whitelist,
        pendingAdmin,
      ] = await Promise.all([
        comptroller.admin(),
        comptroller.adminHasRights(),

        comptroller.oracle(),
        comptroller.closeFactorMantissa(),
        comptroller.liquidationIncentiveMantissa(),

        comptroller.enforceWhitelist().catch((_: any) => false),
        comptroller.getWhitelist().catch((_: any) => [] as string[]),

        comptroller.pendingAdmin(),
      ]);

      setExtraPoolData({
        admin,
        upgradeable,
        enforceWhitelist,
        whitelist: whitelist,
        isPowerfulAdmin:
          !!address &&
          admin.toLowerCase() === address.toLowerCase() &&
          upgradeable,
        oracle,
        closeFactor: Number(closeFactor),
        liquidationIncentive: Number(liquidationIncentive),
        pendingAdmin,
      });
    })();
  }, [comptroller, address]);

  return extraPoolData;
};
