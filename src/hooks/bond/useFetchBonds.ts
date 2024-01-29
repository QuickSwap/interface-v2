import { useQuery } from '@tanstack/react-query';
import { useActiveWeb3React } from 'hooks';
import { useMemo } from 'react';
import BondABI from 'constants/abis/bond.json';
import {
  useMultipleContractSingleData,
  useSingleContractMultipleData,
} from 'state/multicall/v3/hooks';
import { Interface, formatUnits } from 'ethers/lib/utils';
import {
  V2_FACTORY_ADDRESSES,
  V2_FACTORY_BOND,
  V3_CORE_FACTORY_ADDRESSES,
  V3_FACTORY_BOND,
} from 'constants/v3/addresses';
import { usePriceGetterContract } from '../useContract';
import { LiquidityProtocol, getLiquidityDexIndex } from 'utils';
import { ZERO_ADDRESS } from 'constants/v3/misc';
import { Bond, BondConfig } from 'types/bond';

export const useFetchBonds = () => {
  const { chainId } = useActiveWeb3React();
  const fetchBonds = async () => {
    try {
      const bondsURL = process.env.REACT_APP_BONDS_URL;
      if (!bondsURL) return;
      const bondsRes = await fetch(bondsURL);
      const bonds = await bondsRes.json();
      if (!bonds) return;
      const qsBonds: BondConfig[] = bonds.filter(
        (bond: any) =>
          bond &&
          bond.contractAddress &&
          bond.contractAddress[chainId] &&
          bond.bondPartner === 'QuickSwap',
      );
      return qsBonds;
    } catch {
      return;
    }
  };

  const { isLoading, data: bonds } = useQuery({
    queryKey: ['fetchQuickswapBonds', chainId],
    queryFn: fetchBonds,
    refetchInterval: 300000,
  });

  const bondAddresses = useMemo(() => {
    if (!bonds) return [];
    return bonds.map((item: any) => item.contractAddress[chainId]);
  }, [bonds, chainId]);
  const v2BondAddresses = useMemo(() => {
    if (!bonds) return [];
    return bonds
      .filter((item: any) => item.billVersion === 'V2')
      .map((item: any) => item.contractAddress[chainId]);
  }, [bonds, chainId]);
  const v1BondAddresses = useMemo(() => {
    if (!bonds) return [];
    return bonds
      .filter((item: any) => item.billVersion === 'V1')
      .map((item: any) => item.contractAddress[chainId]);
  }, [bonds, chainId]);

  const priceGetterContract = usePriceGetterContract();
  const lpPriceParams = useMemo(() => {
    if (!bonds) return [];
    return bonds.map((bond) => {
      const address =
        bond && bond.lpToken && bond.lpToken.address
          ? bond.lpToken.address[chainId]
          : undefined;
      const protocol =
        bond && bond.lpToken && bond.lpToken.liquidityDex
          ? getLiquidityDexIndex(bond.lpToken.liquidityDex[chainId], true)
          : LiquidityProtocol.V2;
      let factoryV2 = V2_FACTORY_BOND[chainId] ?? ZERO_ADDRESS;
      if (bond && bond.lpToken && bond.lpToken.liquidityDex) {
        factoryV2 = V2_FACTORY_ADDRESSES[chainId];
      }
      const factoryV3 = V3_FACTORY_BOND[chainId] ?? ZERO_ADDRESS;
      const factoryAlgebra = V3_CORE_FACTORY_ADDRESSES[chainId] ?? ZERO_ADDRESS;
      const factorySolidly = ZERO_ADDRESS;
      return [
        address,
        protocol,
        factoryV2,
        factoryV3,
        factoryAlgebra,
        factorySolidly,
      ];
    });
  }, [bonds, chainId]);
  const lpPriceCalls = useSingleContractMultipleData(
    priceGetterContract,
    'getLPPriceFromFactory',
    lpPriceParams,
  );
  const lpPrices = bondAddresses.map((address, index) => {
    const call = lpPriceCalls[index];
    const price =
      call && !call.loading && call.result && call.result.length > 0
        ? call.result[0]
        : undefined;
    return { loading: call && call.loading, price, address };
  });

  const earnTokenPriceParams = useMemo(() => {
    if (!bonds) return [];
    return bonds.map((bond) => {
      const address =
        bond && bond.earnToken && bond.earnToken.address
          ? bond.earnToken.address[chainId]
          : undefined;
      const protocol =
        bond && bond.earnToken && bond.earnToken.liquidityDex
          ? getLiquidityDexIndex(bond.earnToken.liquidityDex[chainId])
          : undefined;
      let factoryV2 = V2_FACTORY_BOND[chainId] ?? ZERO_ADDRESS;
      if (bond && bond.earnToken && bond.earnToken.liquidityDex) {
        factoryV2 = V2_FACTORY_ADDRESSES[chainId];
      }
      const factoryV3 = V3_FACTORY_BOND[chainId] ?? ZERO_ADDRESS;
      const factoryAlgebra = V3_CORE_FACTORY_ADDRESSES[chainId] ?? ZERO_ADDRESS;
      const factorySolidly = ZERO_ADDRESS;
      return [
        address,
        protocol,
        factoryV2,
        factoryV3,
        factoryAlgebra,
        factorySolidly,
      ];
    });
  }, [bonds, chainId]);
  const earnTokenPriceCalls = useSingleContractMultipleData(
    priceGetterContract,
    'getPriceFromFactory',
    earnTokenPriceParams,
  );
  const earnTokenPrices = bondAddresses.map((address, index) => {
    const call = earnTokenPriceCalls[index];
    const price =
      call && !call.loading && call.result && call.result.length > 0
        ? call.result[0]
        : undefined;
    return { loading: call && call.loading, address, price };
  });

  const bondInterface = new Interface(BondABI);
  const bondTrueBillPriceCalls = useMultipleContractSingleData(
    bondAddresses,
    bondInterface,
    'trueBillPrice',
  );
  const bondTermsCalls = useMultipleContractSingleData(
    bondAddresses,
    bondInterface,
    'terms',
  );
  const bondTotalPayoutGivenCalls = useMultipleContractSingleData(
    bondAddresses,
    bondInterface,
    'totalPayoutGiven',
  );
  const v2bondsMaxTotalPayoutCalls = useMultipleContractSingleData(
    v2BondAddresses,
    bondInterface,
    'getMaxTotalPayout',
  );
  const v1bondsMaxTotalPayoutCalls = useMultipleContractSingleData(
    v1BondAddresses,
    bondInterface,
    'maxTotalPayout',
  );
  const bondMaxPayoutCalls = useMultipleContractSingleData(
    bondAddresses,
    bondInterface,
    'maxPayout',
  );

  const bondTrueBillPrices = bondAddresses.map((address, ind) => {
    const call = bondTrueBillPriceCalls[ind];
    const data =
      call && !call.loading && call.result && call.result.length > 0
        ? call.result[0].toString()
        : undefined;
    return { loading: call && call.loading, data, address };
  });
  const bondTerms = bondAddresses.map((address, ind) => {
    const call = bondTermsCalls[ind];
    const data = call && !call.loading ? call.result : undefined;
    return { loading: call && call.loading, data, address };
  });
  const bondTotalPayoutGivens = bondAddresses.map((address, ind) => {
    const call = bondTotalPayoutGivenCalls[ind];
    const data =
      call && !call.loading && call.result && call.result.length > 0
        ? call.result[0].toString()
        : undefined;
    return { loading: call && call.loading, data, address };
  });
  const bondMaxTotalPayouts = v2BondAddresses
    .map((address, index) => {
      const call = v2bondsMaxTotalPayoutCalls[index];
      const maxTotalPayout =
        call && !call.loading && call.result && call.result.length > 0
          ? call.result[0].toString()
          : undefined;
      return { address, maxTotalPayout, loading: call && call.loading };
    })
    .concat(
      v1BondAddresses.map((address, index) => {
        const call = v1bondsMaxTotalPayoutCalls[index];
        const maxTotalPayout =
          call && !call.loading && call.result && call.result.length > 0
            ? call.result[0].toString()
            : undefined;
        return { address, maxTotalPayout, loading: call && call.loading };
      }),
    );
  const bondMaxPayouts = bondAddresses.map((address, ind) => {
    const call = bondMaxPayoutCalls[ind];
    const data =
      call && !call.loading && call.result && call.result.length > 0
        ? call.result[0].toString()
        : undefined;
    return { loading: call && call.loading, data, address };
  });

  const updatedBonds: Bond[] = useMemo(() => {
    if (!bonds) return [];
    return bonds.map((bond) => {
      const address = bond.contractAddress[chainId];
      const trueBillPrice = bondTrueBillPrices.find(
        (item) =>
          item.address &&
          address &&
          item.address.toLowerCase() === address.toLowerCase(),
      );
      const totalPayoutGiven = bondTotalPayoutGivens.find(
        (item) =>
          item.address &&
          address &&
          item.address.toLowerCase() === address.toLowerCase(),
      );
      const term = bondTerms.find(
        (item) =>
          item.address &&
          address &&
          item.address.toLowerCase() === address.toLowerCase(),
      );
      const termData = term?.data;
      const controlVariable =
        termData && termData.length > 0 ? termData[0] : undefined;
      const vestingTerm =
        termData && termData.length > 1 ? termData[1] : undefined;
      const minimumPrice =
        termData && termData.length > 2 ? termData[2] : undefined;
      const maxPayout =
        termData && termData.length > 3 ? termData[3] : undefined;
      const maxDebt = termData && termData.length > 4 ? termData[4] : undefined;
      const bondMaxTotalPayOut = bondMaxTotalPayouts.find(
        (item) =>
          item.address &&
          address &&
          item.address.toLowerCase() === address.toLowerCase(),
      );
      const bondMaxPayOut = bondMaxPayouts.find(
        (item) =>
          item.address &&
          address &&
          item.address.toLowerCase() === address.toLowerCase(),
      );
      const lpPrice = lpPrices.find(
        (item) =>
          item.address &&
          address &&
          item.address.toLowerCase() === address.toLowerCase(),
      );
      const lpPriceNumber =
        lpPrice && lpPrice.price ? Number(formatUnits(lpPrice.price)) : 0;
      const earnTokenPrice = earnTokenPrices.find(
        (item) =>
          item.address &&
          address &&
          item.address.toLowerCase() === address.toLowerCase(),
      );
      const earnTokenPriceNumber =
        earnTokenPrice && earnTokenPrice.price
          ? Number(formatUnits(earnTokenPrice.price))
          : 0;
      const priceUsd =
        trueBillPrice && trueBillPrice.data
          ? Number(formatUnits(trueBillPrice.data.toString())) * lpPriceNumber
          : 0;
      const discount =
        earnTokenPriceNumber > 0
          ? ((earnTokenPriceNumber - priceUsd) / earnTokenPriceNumber) * 100
          : 0;

      const loading =
        trueBillPrice?.loading ||
        totalPayoutGiven?.loading ||
        term?.loading ||
        lpPrice?.loading ||
        earnTokenPrice?.loading ||
        bondMaxTotalPayOut?.loading ||
        bondMaxPayOut?.loading;

      return {
        ...bond,
        loading,
        price: trueBillPrice?.data,
        trueBillPrice: trueBillPrice?.data,
        controlVariable,
        vestingTerm,
        minimumPrice,
        maxPayout,
        maxDebt,
        totalPayoutGiven: totalPayoutGiven?.data,
        maxTotalPayOut: bondMaxTotalPayOut?.maxTotalPayout,
        lpPrice: lpPriceNumber,
        earnTokenPrice: earnTokenPriceNumber,
        discount,
        priceUsd,
        maxPayoutTokens: bondMaxPayOut?.data,
      };
    });
  }, [
    bondMaxPayouts,
    bondMaxTotalPayouts,
    bondTerms,
    bondTotalPayoutGivens,
    bondTrueBillPrices,
    bonds,
    chainId,
    earnTokenPrices,
    lpPrices,
  ]);

  return { loading: isLoading, data: updatedBonds };
};
