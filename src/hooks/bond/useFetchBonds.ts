import { useQuery } from '@tanstack/react-query';
import { useActiveWeb3React } from 'hooks';
import { useMemo } from 'react';
import BondABI from 'constants/abis/bond.json';
import {
  useMultipleContractSingleData,
  useSingleContractMultipleData,
} from 'state/multicall/v3/hooks';
import { Interface, formatUnits } from 'ethers/lib/utils';
import { usePriceGetterContract } from '../useContract';
import { getDexScreenerChainName, getPriceGetterCallData } from 'utils';
import { Bond, BondConfig, BondToken } from 'types/bond';
import { LiquidityDex } from '@ape.swap/apeswap-lists';
import { ERC20_ABI } from 'constants/abis/erc20';

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

  const lpTokens = useMemo(() => {
    if (!bonds) return [];
    return bonds
      .map((bond) => bond.lpToken)
      .filter(
        (token) => token?.liquidityDex?.[chainId] !== LiquidityDex.External,
      )
      .reduce((acc: BondToken[], token) => {
        const itemIsExisting = !!acc.find((item) => {
          const itemAddress = item.address[chainId];
          const tokenAddress = token.address[chainId];
          const itemLiquidityDex = item.liquidityDex?.[chainId];
          const tokenLiquidityDex = item.liquidityDex?.[chainId];
          return (
            itemAddress &&
            tokenAddress &&
            itemAddress.toLowerCase() === tokenAddress.toLowerCase() &&
            itemLiquidityDex === tokenLiquidityDex
          );
        });
        if (!itemIsExisting) {
          acc.push(token);
        }
        return acc;
      }, []);
  }, [bonds, chainId]);

  const bondTokens = useMemo(() => {
    if (!bonds) return [];
    return bonds
      .map((bond) => bond.earnToken)
      .filter(
        (token) => token.liquidityDex?.[chainId] !== LiquidityDex.External,
      )
      .reduce((acc: BondToken[], token) => {
        const itemIsExisting = !!acc.find((item) => {
          const itemAddress = item.address[chainId];
          const tokenAddress = token.address[chainId];
          const itemLiquidityDex = item.liquidityDex?.[chainId];
          const tokenLiquidityDex = item.liquidityDex?.[chainId];
          return (
            itemAddress &&
            tokenAddress &&
            itemAddress.toLowerCase() === tokenAddress.toLowerCase() &&
            itemLiquidityDex === tokenLiquidityDex
          );
        });
        if (!itemIsExisting) {
          acc.push(token);
        }
        return acc;
      }, []);
  }, [bonds, chainId]);

  const dexScreenerTokens = useMemo(() => {
    if (!bonds) return [];
    return bonds
      .map((bond) => bond.earnToken)
      .filter(
        (token) => token.liquidityDex?.[chainId] === LiquidityDex.External,
      )
      .reduce((acc: BondToken[], token) => {
        const itemIsExisting = !!acc.find((item) => {
          const itemAddress = item.address[chainId];
          const tokenAddress = token.address[chainId];
          return (
            itemAddress &&
            tokenAddress &&
            itemAddress.toLowerCase() === tokenAddress.toLowerCase()
          );
        });
        if (!itemIsExisting) {
          acc.push(token);
        }
        return acc;
      }, []);
  }, [bonds, chainId]);

  const dexScreenerLPTokens = useMemo(() => {
    if (!bonds) return [];
    return bonds
      .map((bond) => bond.lpToken)
      .filter(
        (token) => token?.liquidityDex?.[chainId] === LiquidityDex.External,
      )
      .reduce((acc: BondToken[], token) => {
        const itemIsExisting = !!acc.find((item) => {
          const itemAddress = item.address[chainId];
          const tokenAddress = token.address[chainId];
          return (
            itemAddress &&
            tokenAddress &&
            itemAddress.toLowerCase() === tokenAddress.toLowerCase()
          );
        });
        if (!itemIsExisting) {
          acc.push(token);
        }
        return acc;
      }, []);
  }, [bonds, chainId]);

  const dexScreenerBaseURL = 'https://api.dexscreener.com/latest/dex';
  const { data: dexScreenerPrices } = useQuery({
    queryKey: [
      'dexScreener-prices',
      dexScreenerTokens.map((token) => token.address[chainId]).join('-'),
    ],
    queryFn: async () => {
      const tokenPrices = await Promise.all(
        dexScreenerTokens.map(async (token) => {
          if (['USDT', 'USDC'].includes(token.symbol)) {
            return { price: 1, token };
          } else {
            const endpoint = `${dexScreenerBaseURL}/tokens/${token.address[chainId]}`;
            const res = await fetch(endpoint);
            const data = await res.json();
            return {
              price: Number(
                data.pairs
                  .filter((pair: any) => {
                    const tokenAddress = token.address[chainId];
                    return (
                      pair.chainId === chainName &&
                      tokenAddress &&
                      pair.baseToken.address.toLowerCase() ===
                        tokenAddress.toLowerCase()
                    );
                  })
                  .sort(
                    (a: any, b: any) => b?.liquidity?.usd - a?.liquidity?.usd,
                  )[0]?.priceUsd ?? 0,
              ),
              token,
            };
          }
        }),
      );
      return tokenPrices;
    },
  });

  const chainName = getDexScreenerChainName(chainId);

  const erc20Interface = new Interface(ERC20_ABI);
  const bondLPTotalSupplyCalls = useMultipleContractSingleData(
    dexScreenerLPTokens.map((token) => token.address[chainId]),
    erc20Interface,
    'totalSupply',
  );

  const { data: dexScreenerLPPrices } = useQuery({
    queryKey: [
      'dexScreener-LP-prices',
      dexScreenerLPTokens.map((token) => token.address[chainId]).join('-'),
    ],
    queryFn: async () => {
      const tokenPrices = await Promise.all(
        dexScreenerLPTokens.map(async (token, ind) => {
          const endpoint = `${dexScreenerBaseURL}/pairs/${chainName}/${token.address[chainId]}`;
          const res = await fetch(endpoint);
          const data = await res.json();
          const liquidity = data.pair.liquidity.usd;
          const call = bondLPTotalSupplyCalls[ind];
          const supply =
            call && !call.loading && call.result && call.result.length > 0
              ? Number(formatUnits(call.result[0]))
              : 0;
          return { price: supply > 0 ? Number(liquidity) / supply : 0, token };
        }),
      );
      return tokenPrices;
    },
  });

  const priceGetterContract = usePriceGetterContract();
  const lpPriceParams = getPriceGetterCallData(lpTokens, chainId, true);
  const lpPriceCalls = useSingleContractMultipleData(
    priceGetterContract,
    'getLPPriceFromFactory',
    lpPriceParams,
  );
  const lpPrices = lpTokens.map((token, index) => {
    const call = lpPriceCalls[index];
    const price =
      call && !call.loading && call.result && call.result.length > 0
        ? call.result[0]
        : undefined;
    return { loading: call && call.loading, price, token };
  });

  const bondTokenPriceParams = getPriceGetterCallData(
    bondTokens,
    chainId,
    false,
  );
  const bondTokenPriceCalls = useSingleContractMultipleData(
    priceGetterContract,
    'getPriceFromFactory',
    bondTokenPriceParams,
  );
  const bondTokenPrices = bondTokens.map((token, index) => {
    const call = bondTokenPriceCalls[index];
    const price =
      call && !call.loading && call.result && call.result.length > 0
        ? call.result[0]
        : undefined;
    return { loading: call && call.loading, token, price };
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
      const lpPrice = lpPrices.find((item) => {
        const lpTokenAddress = item.token.address[chainId];
        const bondLPTokenAddress = bond.lpToken.address[chainId];
        return (
          lpTokenAddress &&
          bondLPTokenAddress &&
          lpTokenAddress.toLowerCase() === bondLPTokenAddress.toLowerCase()
        );
      });
      const dexScreenerLpPrice = (dexScreenerLPPrices ?? []).find((item) => {
        const lpTokenAddress = item.token.address[chainId];
        const bondLPTokenAddress = bond.lpToken.address[chainId];
        return (
          lpTokenAddress &&
          bondLPTokenAddress &&
          lpTokenAddress.toLowerCase() === bondLPTokenAddress.toLowerCase()
        );
      })?.price;
      const lpPriceNumber =
        lpPrice && lpPrice.price
          ? Number(formatUnits(lpPrice.price))
          : dexScreenerLpPrice ?? 0;
      const earnTokenPrice = bondTokenPrices.find((item) => {
        const earnTokenAddress = item.token.address[chainId];
        const bondEarnTokenAddress = bond.earnToken.address[chainId];
        return (
          earnTokenAddress &&
          bondEarnTokenAddress &&
          earnTokenAddress.toLowerCase() === bondEarnTokenAddress.toLowerCase()
        );
      });
      const dexScreenerEarnTokenPrice = (dexScreenerPrices ?? []).find(
        (item) => {
          const earnTokenAddress = item.token.address[chainId];
          const bondEarnTokenAddress = bond.earnToken.address[chainId];
          return (
            earnTokenAddress &&
            bondEarnTokenAddress &&
            earnTokenAddress.toLowerCase() ===
              bondEarnTokenAddress.toLowerCase()
          );
        },
      )?.price;
      const earnTokenPriceNumber =
        earnTokenPrice && earnTokenPrice.price
          ? Number(formatUnits(earnTokenPrice.price))
          : dexScreenerEarnTokenPrice ?? 0;

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
    bondTokenPrices,
    bondTotalPayoutGivens,
    bondTrueBillPrices,
    bonds,
    chainId,
    dexScreenerLPPrices,
    dexScreenerPrices,
    lpPrices,
  ]);

  return { loading: isLoading, data: updatedBonds };
};
