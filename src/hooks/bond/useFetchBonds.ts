import { useQuery } from '@tanstack/react-query';
import { useActiveWeb3React } from 'hooks';
import { useEffect, useMemo, useState } from 'react';
import BondABI from 'constants/abis/bond.json';
import {
  useMultipleContractSingleData,
  useSingleContractMultipleData,
} from 'state/multicall/v3/hooks';
import { Interface, formatUnits } from 'ethers/lib/utils';
import {
  PRICE_GETTER_ADDRESS,
  V2_FACTORY_ADDRESSES,
  V3_CORE_FACTORY_ADDRESSES,
} from 'constants/v3/addresses';
import { usePriceGetterContract } from '../useContract';
import { LiquidityProtocol, getLiquidityDexIndex } from 'utils';
import { ZERO_ADDRESS } from 'constants/v3/misc';

export const useFetchBonds = () => {
  const { chainId } = useActiveWeb3React();
  const fetchBonds = async () => {
    try {
      const bondsURL = process.env.REACT_APP_BONDS_URL;
      if (!bondsURL) return [];
      const bondsRes = await fetch(bondsURL);
      const bonds = await bondsRes.json();
      if (!bonds) return [];
      const qsBonds = bonds.filter(
        (bond: any) =>
          bond &&
          bond.contractAddress &&
          bond.contractAddress[chainId] &&
          bond.bondPartner === 'QuickSwap',
      );
      return qsBonds;
    } catch {
      return [];
    }
  };

  const { isLoading, data, refetch } = useQuery({
    queryKey: ['fetchQuickswapBonds', chainId],
    queryFn: fetchBonds,
  });

  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000);
      setCurrentTime(_currentTime);
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  return { loading: isLoading, data };
};

export const useFetchBondsFromContract = (bonds: any[]) => {
  const { chainId } = useActiveWeb3React();
  const bondAddresses = useMemo(() => {
    return bonds.map((item: any) => item.contractAddress[chainId]);
  }, [bonds, chainId]);
  const v2BondAddresses = useMemo(() => {
    return bonds
      .filter((item: any) => item.billVersion === 'V2')
      .map((item: any) => item.contractAddress[chainId]);
  }, [bonds, chainId]);
  const v1BondAddresses = useMemo(() => {
    return bonds
      .filter((item: any) => item.billVersion === 'V1')
      .map((item: any) => item.contractAddress[chainId]);
  }, [bonds, chainId]);

  const priceGetterContract = usePriceGetterContract(
    PRICE_GETTER_ADDRESS[chainId],
  );
  const lpPriceParams = bonds.map((bond) => {
    const address =
      bond && bond.lpToken && bond.lpToken.address
        ? bond.lpToken.address[chainId]
        : undefined;
    const protocol =
      bond && bond.lpToken && bond.lpToken.liquidityDex
        ? getLiquidityDexIndex(bond.lpToken.liquidityDex[chainId], true)
        : undefined;
    const factoryV2 =
      protocol === LiquidityProtocol.V2
        ? V2_FACTORY_ADDRESSES[chainId]
        : ZERO_ADDRESS;
    const factoryV3 = ZERO_ADDRESS;
    const factoryAlgebra =
      protocol === LiquidityProtocol.Gamma
        ? V3_CORE_FACTORY_ADDRESSES[chainId]
        : ZERO_ADDRESS;
    return [address, protocol, factoryV2, factoryV3, factoryAlgebra];
  });
  const lpPriceCalls = useSingleContractMultipleData(
    priceGetterContract,
    'getLPPriceFromFactory',
    lpPriceParams,
  );
  const lpPrices = lpPriceCalls.map((call) =>
    !call.loading && call.result && call.result.length > 0
      ? call.result[0]
      : undefined,
  );

  const earnTokenPriceParams = bonds.map((bond) => {
    const address =
      bond && bond.earnToken && bond.earnToken.address
        ? bond.earnToken.address[chainId]
        : undefined;
    const protocol =
      bond && bond.earnToken && bond.earnToken.liquidityDex
        ? getLiquidityDexIndex(bond.earnToken.liquidityDex[chainId])
        : undefined;
    const factoryV2 =
      protocol === LiquidityProtocol.V2
        ? V2_FACTORY_ADDRESSES[chainId]
        : ZERO_ADDRESS;
    const factoryV3 = ZERO_ADDRESS;
    const factoryAlgebra =
      protocol === LiquidityProtocol.Algebra
        ? V3_CORE_FACTORY_ADDRESSES[chainId]
        : ZERO_ADDRESS;
    return [address, protocol, factoryV2, factoryV3, factoryAlgebra];
  });
  const earnTokenPriceCalls = useSingleContractMultipleData(
    priceGetterContract,
    'getPriceFromFactory',
    earnTokenPriceParams,
  );
  const earnTokenPrices = earnTokenPriceCalls.map((call) =>
    !call.loading && call.result && call.result.length > 0
      ? call.result[0]
      : undefined,
  );

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

  const bondTrueBillPrices = bondTrueBillPriceCalls.map((call) =>
    !call.loading && call.result && call.result.length > 0
      ? call.result[0]
      : undefined,
  );
  const bondTerms = bondTermsCalls.map((call) =>
    !call.loading && call.result ? call.result : undefined,
  );
  const bondTotalPayoutGivens = bondTotalPayoutGivenCalls.map((call) =>
    !call.loading && call.result && call.result.length > 0
      ? call.result[0]
      : undefined,
  );
  const bondMaxTotalPayouts = v2BondAddresses
    .map((address, index) => {
      const call = v2bondsMaxTotalPayoutCalls[index];
      const maxTotalPayout =
        !call.loading && call.result && call.result.length > 0
          ? call.result[0]
          : undefined;
      return { address, maxTotalPayout };
    })
    .concat(
      v1BondAddresses.map((address, index) => {
        const call = v1bondsMaxTotalPayoutCalls[index];
        const maxTotalPayout =
          !call.loading && call.result && call.result.length > 0
            ? call.result[0]
            : undefined;
        return { address, maxTotalPayout };
      }),
    );

  return bonds.map((bond, index) => {
    const address = bond.contractAddress[chainId];
    const trueBillPrice = bondTrueBillPrices[index];
    const totalPayoutGiven = bondTotalPayoutGivens[index];
    const term = bondTerms[index];
    const controlVariable = term && term.length > 0 ? term[0] : undefined;
    const vestingTerm = term && term.length > 1 ? term[1] : undefined;
    const minimumPrice = term && term.length > 2 ? term[2] : undefined;
    const maxPayout = term && term.length > 3 ? term[3] : undefined;
    const maxDebt = term && term.length > 4 ? term[4] : undefined;
    const maxTotalPayOut = bondMaxTotalPayouts.find(
      (item) =>
        item.address && item.address.toLowerCase() === address.toLowerCase(),
    )?.maxTotalPayout;
    const lpPrice = lpPrices[index];
    const lpPriceNumber = lpPrice ? Number(formatUnits(lpPrice)) : 0;
    const earnTokenPrice = earnTokenPrices[index];
    const earnTokenPriceNumber = earnTokenPrice
      ? Number(formatUnits(earnTokenPrice))
      : 0;
    const priceUsd = trueBillPrice
      ? Number(formatUnits(trueBillPrice.toString())) * lpPriceNumber
      : 0;
    const discount =
      earnTokenPriceNumber > 0
        ? ((earnTokenPriceNumber - priceUsd) / earnTokenPriceNumber) * 100
        : 0;

    return {
      ...bond,
      trueBillPrice,
      controlVariable,
      vestingTerm,
      minimumPrice,
      maxPayout,
      maxDebt,
      totalPayoutGiven,
      maxTotalPayOut,
      lpPrice: lpPriceNumber,
      earnTokenPrice: earnTokenPriceNumber,
      discount,
      priceUsd,
    };
  });
};
