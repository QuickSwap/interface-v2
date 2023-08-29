import React from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { useActiveWeb3React } from 'hooks';
import { useWalletModalToggle } from 'state/application/hooks';
import { useTranslation } from 'next-i18next';
import GammaLPList from './GammaLPList';
import { useQuery } from '@tanstack/react-query';
import { getGammaData, getGammaPositions } from 'utils';
import { GammaPair, GammaPairs } from 'constants/index';
import { useMasterChefContracts } from 'hooks/useContract';
import {
  useMultipleContractMultipleData,
  useMultipleContractSingleData,
} from 'state/multicall/v3/hooks';
import GammaPairABI from 'constants/abis/gamma-hypervisor.json';
import { formatUnits, Interface } from 'ethers/lib/utils';
import { Token } from '@uniswap/sdk';
import { useTokenBalances } from 'state/wallet/hooks';
import { useLastTransactionHash } from 'state/transactions/hooks';

export default function MyGammaPoolsV3() {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();

  const showConnectAWallet = Boolean(!account);

  const toggleWalletModal = useWalletModalToggle();

  const fetchGammaPositions = async () => {
    const gammaPositions = await getGammaPositions(account, chainId);
    return gammaPositions;
  };

  const fetchGammaData = async () => {
    const gammaData = await getGammaData(chainId);
    return gammaData;
  };

  const lastTxHash = useLastTransactionHash();

  const { isLoading: positionsLoading, data: gammaPositions } = useQuery({
    queryKey: ['fetchGammaPositionsPools', lastTxHash, account, chainId],
    queryFn: fetchGammaPositions,
  });

  const { isLoading: dataLoading, data: gammaData } = useQuery({
    queryKey: ['fetchGammaDataPools', lastTxHash, chainId],
    queryFn: fetchGammaData,
  });

  const allGammaPairsToFarm = chainId
    ? ([] as GammaPair[]).concat(...Object.values(GammaPairs[chainId]))
    : [];

  const masterChefContracts = useMasterChefContracts();

  const stakedAmountData = useMultipleContractMultipleData(
    account ? masterChefContracts : [],
    'userInfo',
    account
      ? masterChefContracts.map((_, ind) =>
          allGammaPairsToFarm
            .filter((pair) => (pair.masterChefIndex ?? 0) === ind)
            .map((pair) => [pair.pid, account]),
        )
      : [],
  );

  const stakedAmounts = stakedAmountData.map((callStates, ind) => {
    const gammaPairsFiltered = allGammaPairsToFarm.filter(
      (pair) => (pair.masterChefIndex ?? 0) === ind,
    );
    return callStates.map((callData, index) => {
      const amount =
        !callData.loading && callData.result && callData.result.length > 0
          ? formatUnits(callData.result[0], 18)
          : '0';
      const gPair =
        gammaPairsFiltered.length > index
          ? gammaPairsFiltered[index]
          : undefined;
      return {
        amount,
        pid: gPair?.pid,
        masterChefIndex: ind,
      };
    });
  });

  const stakedLoading = !!stakedAmountData.find(
    (callStates) => !!callStates.find((callData) => callData.loading),
  );

  const stakedLPs = allGammaPairsToFarm
    .map((item) => {
      const masterChefIndex = item.masterChefIndex ?? 0;
      const sItem =
        stakedAmounts && stakedAmounts.length > masterChefIndex
          ? stakedAmounts[masterChefIndex].find(
              (sAmount) => sAmount.pid === item.pid,
            )
          : undefined;
      return { ...item, stakedAmount: sItem ? Number(sItem.amount) : 0 };
    })
    .filter((item) => {
      return item.stakedAmount > 0;
    });

  const stakedLPAddresses = stakedLPs.map((lp) => lp.address);

  const lpTokens = chainId
    ? stakedLPAddresses.map((address) => new Token(chainId, address, 18))
    : undefined;
  const lpBalances = useTokenBalances(account ?? undefined, lpTokens);

  const lpTotalAmounts = useMultipleContractSingleData(
    stakedLPAddresses,
    new Interface(GammaPairABI),
    'getTotalAmounts',
  );
  const lpTotalSupply = useMultipleContractSingleData(
    stakedLPAddresses,
    new Interface(GammaPairABI),
    'totalSupply',
  );

  const stakedPositions = stakedLPs.map((lp, ind) => {
    const totalAmountsCalldata = lpTotalAmounts[ind];
    const totalSupplyCalldata = lpTotalSupply[ind];
    const totalAmount0 =
      !totalAmountsCalldata.loading &&
      totalAmountsCalldata.result &&
      totalAmountsCalldata.result.length > 0
        ? totalAmountsCalldata.result[0]
        : undefined;
    const totalAmount1 =
      !totalAmountsCalldata.loading &&
      totalAmountsCalldata.result &&
      totalAmountsCalldata.result.length > 1
        ? totalAmountsCalldata.result[1]
        : undefined;
    const totalSupply =
      !totalSupplyCalldata.loading &&
      totalSupplyCalldata.result &&
      totalSupplyCalldata.result.length > 0
        ? Number(formatUnits(totalSupplyCalldata.result[0], 18))
        : 0;

    const lpData = gammaData ? gammaData[lp.address.toLowerCase()] : undefined;
    const lpUSD =
      lpData && lpData.totalSupply && Number(lpData.totalSupply) > 0
        ? (Number(lpData.tvlUSD) / Number(lpData.totalSupply)) * 10 ** 18
        : 0;
    const lpBalanceInd = Object.keys(lpBalances).findIndex(
      (addr) => addr.toLowerCase() === lp.address.toLowerCase(),
    );
    const lpBalance =
      lpBalanceInd >= 0 ? Object.values(lpBalances)[lpBalanceInd] : undefined;
    const lpBalanceNumber = lpBalance ? Number(lpBalance.toExact()) : 0;
    const balanceUSD = (lpBalanceNumber + lp.stakedAmount) * lpUSD;

    return {
      totalAmount0,
      totalAmount1,
      totalSupply,
      balanceUSD,
      lpAmount: lpBalanceNumber + lp.stakedAmount,
      pairAddress: lp.address,
      token0Address: lp.token0Address,
      token1Address: lp.token1Address,
      farming: true,
    };
  });

  const gammaPositionList =
    gammaPositions && chainId
      ? Object.keys(gammaPositions)
          .filter(
            (value) =>
              !!Object.values(GammaPairs[chainId]).find(
                (pairData) =>
                  !!pairData.find(
                    (item) =>
                      item.address.toLowerCase() === value.toLowerCase(),
                  ),
              ),
          )
          .filter(
            (pairAddress) =>
              !stakedPositions.find(
                (item) =>
                  item.pairAddress.toLowerCase() === pairAddress.toLowerCase(),
              ),
          )
      : [];

  return (
    <Box>
      {positionsLoading || stakedLoading || dataLoading ? (
        <Box mt={2} className='flex justify-center'>
          <CircularProgress size={'2rem'} />
        </Box>
      ) : (gammaPositions && gammaPositionList.length > 0) ||
        stakedPositions.length > 0 ? (
        <GammaLPList
          gammaPairs={gammaPositionList}
          gammaPositions={gammaPositions}
          stakedPositions={stakedPositions}
        />
      ) : (
        <Box mt={2} textAlign='center'>
          <p>{t('noLiquidityPositions')}.</p>
          {showConnectAWallet && (
            <Box maxWidth={250} margin='20px auto 0'>
              <Button variant='contained' fullWidth onClick={toggleWalletModal}>
                {t('connectWallet')}
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
