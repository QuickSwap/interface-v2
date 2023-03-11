import React from 'react';
import { Box, Button } from '@material-ui/core';
import { useActiveWeb3React } from 'hooks';
import Loader from 'components/Loader';
import { useWalletModalToggle } from 'state/application/hooks';
import { useTranslation } from 'react-i18next';
import GammaLPList from './GammaLPList';
import { useQuery } from 'react-query';
import { getGammaPositions } from 'utils';
import { GammaPair, GammaPairs } from 'constants/index';
import { useMasterChefContract } from 'hooks/useContract';
import {
  useMultipleContractSingleData,
  useSingleContractMultipleData,
} from 'state/multicall/v3/hooks';
import GammaPairABI from 'constants/abis/gamma-hypervisor.json';
import { formatUnits, Interface } from 'ethers/lib/utils';
import { Token } from '@uniswap/sdk';
import { useTokenBalances } from 'state/wallet/hooks';

export default function MyLiquidityPoolsV3() {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();

  const showConnectAWallet = Boolean(!account);

  const toggleWalletModal = useWalletModalToggle();

  const fetchGammaPositions = async () => {
    if (!account) return;
    const gammaPositions = await getGammaPositions(account);
    return gammaPositions;
  };

  const fetchGammaData = async () => {
    try {
      const data = await fetch(
        `${process.env.REACT_APP_GAMMA_API_ENDPOINT}/quickswap/polygon/hypervisors/allData`,
      );
      const gammaData = await data.json();
      return gammaData;
    } catch {
      try {
        const data = await fetch(
          `${process.env.REACT_APP_GAMMA_API_ENDPOINT_BACKUP}/quickswap/polygon/hypervisors/allData`,
        );
        const gammaData = await data.json();
        return gammaData;
      } catch (e) {
        console.log(e);
        return;
      }
    }
  };

  const { isLoading: positionsLoading, data: gammaPositions } = useQuery(
    'fetchGammaPositions',
    fetchGammaPositions,
    {
      refetchInterval: 30000,
    },
  );

  const { isLoading: dataLoading, data: gammaData } = useQuery(
    'fetchGammaData',
    fetchGammaData,
    {
      refetchInterval: 30000,
    },
  );

  const allGammaPairsToFarm = ([] as GammaPair[])
    .concat(...Object.values(GammaPairs))
    .filter((item) => item.ableToFarm);

  const masterChefContract = useMasterChefContract();

  const stakedAmountData = useSingleContractMultipleData(
    masterChefContract,
    'userInfo',
    account ? allGammaPairsToFarm.map((pair) => [pair.pid, account]) : [],
  );

  const stakedAmounts = stakedAmountData.map((callData) => {
    return !callData.loading && callData.result && callData.result.length > 0
      ? formatUnits(callData.result[0], 18)
      : '0';
  });

  const stakedLoading = !!stakedAmountData.find((callData) => callData.loading);

  const stakedLPs = allGammaPairsToFarm
    .map((item, index) => {
      return { ...item, stakedAmount: Number(stakedAmounts[index]) };
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

  const gammaPositionList = gammaPositions
    ? Object.keys(gammaPositions)
        .filter(
          (value) =>
            !!Object.values(GammaPairs).find(
              (pairData) =>
                !!pairData.find(
                  (item) => item.address.toLowerCase() === value.toLowerCase(),
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
      <p className='weight-600'>{t('myGammaLP')}</p>
      <>
        {positionsLoading || stakedLoading || dataLoading ? (
          <Box mt={2} className='flex justify-center'>
            <Loader stroke='white' size={'2rem'} />
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
                <Button fullWidth onClick={toggleWalletModal}>
                  {t('connectWallet')}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </>
    </Box>
  );
}
