import React, { useState } from 'react';
import { Box, Divider, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { CurrencyLogo, NumericalInput } from 'components';
import { Token } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { useSelectedTokenList } from 'state/lists/hooks';
import { calculateGasMargin, formatNumber, getTokenFromAddress } from 'utils';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useMasterChefContract } from 'hooks/useContract';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback';
import { tryParseAmount } from 'state/swap/hooks';
import { useQuery } from 'react-query';

const GammaFarmCardDetails: React.FC<{
  data: any;
  pairData: any;
  rewardData: any;
  positionData: any;
}> = ({ pairData, rewardData, positionData, data }) => {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unStakeAmount, setUnStakeAmount] = useState('');
  const [approveOrStaking, setApproveOrStaking] = useState(false);
  const [attemptUnstaking, setAttemptUnstaking] = useState(false);

  const fetchStakedData = async () => {
    if (!account) return;
    try {
      const data = await fetch(
        `https://gammawire.net/quickswap/polygon/userRewards2/${account}`,
      );
      const gammaData = await data.json();
      return gammaData ? gammaData.stakes : undefined;
    } catch (e) {
      console.log(e);
      return;
    }
  };

  const { data: stakedData } = useQuery('fetchStakedData', fetchStakedData, {
    refetchInterval: 30000,
  });

  const availableStakeAmount = positionData
    ? formatUnits(positionData.shares, 18)
    : '0';
  const stakedAmount =
    stakedData && stakedData.length > 0
      ? stakedData[0].stakedAmount.toFixed(18)
      : '0';
  const lpTokenUSD =
    data && data.totalSupply && Number(data.totalSupply) > 0
      ? Number(data.tvlUSD) / Number(formatUnits(data.totalSupply, 18))
      : 0;
  const stakedUSD = Number(stakedAmount) * lpTokenUSD;

  const rewards: any[] =
    rewardData && rewardData['rewarders']
      ? Object.values(rewardData['rewarders'])
      : [];
  const tokenMap = useSelectedTokenList();
  const masterChefContract = useMasterChefContract();
  const stakeButtonDisabled =
    Number(stakeAmount) <= 0 ||
    Number(stakeAmount) > Number(availableStakeAmount) ||
    !masterChefContract ||
    !account ||
    approveOrStaking;
  const unStakeButtonDisabled =
    Number(unStakeAmount) <= 0 ||
    Number(unStakeAmount) > Number(stakedAmount) ||
    !masterChefContract ||
    !account ||
    attemptUnstaking;
  const lpToken = chainId
    ? new Token(chainId, pairData.address, 18)
    : undefined;
  const parsedStakeAmount = tryParseAmount(stakeAmount, lpToken);
  const [approval, approveCallback] = useApproveCallback(
    parsedStakeAmount,
    masterChefContract?.address,
  );

  const approveOrStakeLP = async () => {
    setApproveOrStaking(true);
    try {
      if (approval === ApprovalState.APPROVED) {
        await stakeLP();
      } else {
        await approveCallback();
      }
      setApproveOrStaking(false);
    } catch (e) {
      console.log('Err:', e);
      setApproveOrStaking(false);
    }
  };

  const stakeLP = async () => {
    if (!masterChefContract || !account) return;
    const estimatedGas = await masterChefContract.estimateGas.deposit(
      pairData.pid,
      parseUnits(Number(stakeAmount).toFixed(18), 18),
      account,
    );
    const response: TransactionResponse = await masterChefContract.deposit(
      pairData.pid,
      parseUnits(Number(stakeAmount).toFixed(18), 18),
      account,
      {
        gasLimit: calculateGasMargin(estimatedGas),
      },
    );
    addTransaction(response, {
      summary: t('depositliquidity'),
    });
    const receipt = await response.wait();
    finalizedTransaction(receipt, {
      summary: t('depositliquidity'),
    });
  };

  const unStakeLP = async () => {
    if (!masterChefContract || !account) return;
    setAttemptUnstaking(true);
    try {
      const estimatedGas = await masterChefContract.estimateGas.withdraw(
        pairData.pid,
        parseUnits(Number(unStakeAmount).toFixed(18), 18),
        account,
      );
      const response: TransactionResponse = await masterChefContract.withdraw(
        pairData.pid,
        parseUnits(Number(unStakeAmount).toFixed(18), 18),
        account,
        {
          gasLimit: calculateGasMargin(estimatedGas),
        },
      );
      addTransaction(response, {
        summary: t('withdrawliquidity'),
      });
      const receipt = await response.wait();
      finalizedTransaction(receipt, {
        summary: t('withdrawliquidity'),
      });
      setAttemptUnstaking(false);
    } catch (e) {
      setAttemptUnstaking(false);
      console.log('err: ', e);
    }
  };

  const claimReward = async () => {
    if (!masterChefContract || !account) return;
    const estimatedGas = await masterChefContract.estimateGas.harvest(
      pairData.pid,
      account,
    );
    const response: TransactionResponse = await masterChefContract.harvest(
      pairData.pid,
      account,
      {
        gasLimit: calculateGasMargin(estimatedGas),
      },
    );
    addTransaction(response, {
      summary: t('claimrewards'),
    });
    const receipt = await response.wait();
    finalizedTransaction(receipt, {
      summary: t('claimrewards'),
    });
  };

  return (
    <Box>
      <Divider />
      <Box padding={1.5} className='flex justify-between'>
        <Box width='calc(33% - 32px)' px='16px'>
          <Box className='flex justify-between'>
            <small className='text-secondary'>{t('available')}:</small>
            <small>
              {formatNumber(availableStakeAmount)} LP ($
              {positionData ? formatNumber(positionData.balanceUSD) : 0})
            </small>
          </Box>
          <Box
            className='flex items-center bg-palette'
            p='12px 16px'
            borderRadius='10px'
            mt={2}
          >
            <NumericalInput value={stakeAmount} onUserInput={setStakeAmount} />
            <span
              className='weight-600 cursor-pointer text-primary'
              onClick={() => setStakeAmount(availableStakeAmount)}
            >
              {t('max')}
            </span>
          </Box>
          <Box mt={2}>
            <Button
              disabled={stakeButtonDisabled}
              fullWidth
              onClick={approveOrStakeLP}
            >
              {approval === ApprovalState.APPROVED
                ? approveOrStaking
                  ? t('stakingLPTokens')
                  : t('stakeLPTokens')
                : approveOrStaking
                ? t('approving')
                : t('approve')}
            </Button>
          </Box>
        </Box>
        <Box width='calc(33% - 32px)' px='16px'>
          <Box className='flex justify-between'>
            <small className='text-secondary'>{t('deposited')}:</small>
            <small>
              {formatNumber(stakedAmount)} LP (${formatNumber(stakedUSD)})
            </small>
          </Box>
          <Box
            className='flex items-center bg-palette'
            p='12px 16px'
            borderRadius='10px'
            mt={2}
          >
            <NumericalInput
              value={unStakeAmount}
              onUserInput={setUnStakeAmount}
            />
            <span
              className='weight-600 cursor-pointer text-primary'
              onClick={() => setUnStakeAmount(stakedAmount)}
            >
              {t('max')}
            </span>
          </Box>
          <Box mt={2}>
            <Button
              disabled={unStakeButtonDisabled}
              fullWidth
              onClick={unStakeLP}
            >
              {attemptUnstaking ? t('unstakingLPTokens') : t('unstakeLPTokens')}
            </Button>
          </Box>
        </Box>
        {rewards.length > 0 && chainId && (
          <Box
            width='calc(33% - 32px)'
            px='16px'
            className='flex flex-col items-center justify-between'
          >
            <small className='text-secondary'>{t('earnedRewards')}</small>
            <Box>
              {rewards.map((reward) => {
                const rewardTokenData = getTokenFromAddress(
                  reward.rewardToken,
                  chainId,
                  tokenMap,
                  [],
                );
                const rewardToken = new Token(
                  chainId,
                  rewardTokenData.address,
                  rewardTokenData.decimals,
                  rewardTokenData.symbol,
                  rewardTokenData.name,
                );
                return (
                  <Box
                    key={reward.rewardToken}
                    className='flex items-center justify-center'
                  >
                    <CurrencyLogo currency={rewardToken} size='16px' />
                    <Box ml='6px'>
                      <small>0.00 {reward.rewardTokenSymbol}</small>
                    </Box>
                  </Box>
                );
              })}
            </Box>
            <Box width='100%'>
              <Button fullWidth onClick={claimReward}>
                {t('claim')}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default GammaFarmCardDetails;
