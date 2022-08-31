import { Comptroller } from 'market-sdk';
import { useQuery } from 'react-query';

export const useExtraPoolData = (
  comptroller: Comptroller | undefined,
  address: string | undefined,
) => {
  const fetchExtraPoolData = async () => {
    if (!comptroller) {
      return;
    }

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

    return {
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
    };
  };

  const { data } = useQuery('fetchExtraPoolData', fetchExtraPoolData, {
    refetchInterval: 3000,
  });

  return data;
};
