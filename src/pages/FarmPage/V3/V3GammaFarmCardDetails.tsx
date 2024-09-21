import React, { useState } from 'react';
import {
  Box,
  Grid,
  Divider,
  Button,
  useTheme,
  useMediaQuery,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { CurrencyLogo, NumericalInput } from 'components';
import { Token } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { useSelectedTokenList } from 'state/lists/hooks';
import {
  calculateGasMargin,
  formatNumber,
  getFixedValue,
  getTokenFromAddress,
} from 'utils';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import {
  useGammaHypervisorContract,
  useMasterChefContract,
} from 'hooks/useContract';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback';
import { tryParseAmount } from 'state/swap/hooks';
import {
  useMultipleContractSingleData,
  useSingleCallResult,
} from 'state/multicall/v3/hooks';
import GammaRewarder from 'constants/abis/gamma-rewarder.json';
import { Interface } from '@ethersproject/abi';
import QIGammaMasterChef from 'constants/abis/gamma-masterchef1.json';
import { TransactionType } from 'models/enums';

const V3GammaFarmCardDetails: React.FC<{
  data: any;
}> = ({ data }) => {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unStakeAmount, setUnStakeAmount] = useState('');
  const [approveOrStaking, setApproveOrStaking] = useState(false);
  const [attemptUnstaking, setAttemptUnstaking] = useState(false);
  const [attemptClaiming, setAttemptClaiming] = useState(false);
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const masterChefContract = useMasterChefContract(
    data.masterChefIndex ?? 0,
    undefined,
    data.masterChefIndex === 2 ? QIGammaMasterChef : undefined,
  );
  const hypervisorContract = useGammaHypervisorContract(data.address);
  const tokenMap = useSelectedTokenList();

  const lpToken = chainId ? new Token(chainId, data.address, 18) : undefined;
  const lpBalanceData = useSingleCallResult(hypervisorContract, 'balanceOf', [
    account ?? undefined,
  ]);
  const lpBalanceBN =
    !lpBalanceData.loading &&
    lpBalanceData.result &&
    lpBalanceData.result.length > 0
      ? lpBalanceData.result[0]
      : undefined;
  const availableStakeAmount = lpBalanceBN ? formatUnits(lpBalanceBN, 18) : '0';

  const stakedData = useSingleCallResult(masterChefContract, 'userInfo', [
    data.pid,
    account ?? undefined,
  ]);
  const stakedAmountBN =
    !stakedData.loading && stakedData.result && stakedData.result.length > 0
      ? stakedData.result[0]
      : undefined;
  const stakedAmount = stakedAmountBN ? formatUnits(stakedAmountBN, 18) : '0';
  const lpTokenUSD =
    data && data.totalSupply && Number(data.totalSupply) > 0
      ? (Number(data.tvlUSD) / Number(data.totalSupply)) * 10 ** 18
      : 0;
  const stakedUSD = Number(stakedAmount) * lpTokenUSD;
  const availableStakeUSD = Number(availableStakeAmount) * lpTokenUSD;

  const rewards: any[] = data.rewards;
  const rewarderAddresses =
    data.masterChefIndex !== 2 && data && data.rewards
      ? data.rewards.map((reward: any) => reward.address)
      : [];
  const gammaPendingRewardsData = useMultipleContractSingleData(
    rewarderAddresses,
    new Interface(GammaRewarder),
    'pendingToken',
    [data.pid, account ?? undefined],
  );
  const qipendingRewardData = useSingleCallResult(
    data.masterChefIndex === 2 ? masterChefContract : undefined,
    'pending',
    [data.pid, account ?? undefined],
  );

  const pendingRewardsData =
    data.masterChefIndex === 2
      ? [qipendingRewardData]
      : gammaPendingRewardsData;

  const pendingRewards = pendingRewardsData
    .reduce<{ token: Token; amount: number }[]>(
      (rewardArray, callData, index) => {
        const reward = rewards.length > 0 ? rewards[index] : undefined;
        if (chainId && reward && tokenMap) {
          const rewardToken = getTokenFromAddress(
            reward?.token?.address,
            chainId,
            tokenMap,
            [],
          );

          if (rewardToken) {
            const existingRewardIndex = rewardArray.findIndex(
              (item) =>
                reward?.rewardToken &&
                item?.token?.address &&
                item.token.address.toLowerCase() ===
                  reward.rewardToken.toLowerCase(),
            );
            const rewardAmountBN =
              !callData.loading && callData.result && callData.result.length > 0
                ? callData.result[0]
                : undefined;

            const rewardAmount =
              (rewardAmountBN
                ? Number(formatUnits(rewardAmountBN, rewardToken.decimals))
                : 0) +
              (existingRewardIndex > -1
                ? rewardArray[existingRewardIndex].amount
                : 0);
            if (existingRewardIndex === -1) {
              rewardArray.push({ token: rewardToken, amount: rewardAmount });
            } else {
              rewardArray[existingRewardIndex] = {
                token: rewardToken,
                amount: rewardAmount,
              };
            }
          }
        }
        return rewardArray;
      },
      [],
    )
    .filter((reward) => reward && Number(reward.amount) > 0);

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

  const parsedStakeAmount = chainId
    ? tryParseAmount(chainId, stakeAmount, lpToken)
    : undefined;
  const [approval, approveCallback] = useApproveCallback(
    parsedStakeAmount,
    masterChefContract?.address,
  );

  const claimButtonDisabled = pendingRewards.length === 0 || attemptClaiming;

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
    if (!masterChefContract || !account || !lpBalanceBN) return;
    let response: TransactionResponse;
    if (data.masterChefIndex === 2) {
      const estimatedGas = await masterChefContract.estimateGas.deposit(
        data.pid,
        stakeAmount === availableStakeAmount
          ? lpBalanceBN
          : parseUnits(getFixedValue(stakeAmount), 18),
      );
      response = await masterChefContract.deposit(
        data.pid,
        stakeAmount === availableStakeAmount
          ? lpBalanceBN
          : parseUnits(getFixedValue(stakeAmount), 18),
        {
          gasLimit: calculateGasMargin(estimatedGas),
        },
      );
    } else {
      const estimatedGas = await masterChefContract.estimateGas.deposit(
        data.pid,
        stakeAmount === availableStakeAmount
          ? lpBalanceBN
          : parseUnits(getFixedValue(stakeAmount), 18),
        account,
      );
      response = await masterChefContract.deposit(
        data.pid,
        stakeAmount === availableStakeAmount
          ? lpBalanceBN
          : parseUnits(getFixedValue(stakeAmount), 18),
        account,
        {
          gasLimit: calculateGasMargin(estimatedGas),
        },
      );
    }
    addTransaction(response, {
      summary: t('depositliquidity'),
      type: TransactionType.SEND,
    });
    const receipt = await response.wait();
    finalizedTransaction(receipt, {
      summary: t('depositliquidity'),
    });
  };

  const unStakeLP = async () => {
    if (!masterChefContract || !account || !stakedAmountBN) return;
    setAttemptUnstaking(true);
    try {
      let response: TransactionResponse;
      if (data.masterChefIndex === 2) {
        const estimatedGas = await masterChefContract.estimateGas.withdraw(
          data.pid,
          unStakeAmount === stakedAmount
            ? stakedAmountBN
            : parseUnits(getFixedValue(unStakeAmount), 18),
        );
        response = await masterChefContract.withdraw(
          data.pid,
          unStakeAmount === stakedAmount
            ? stakedAmountBN
            : parseUnits(getFixedValue(unStakeAmount), 18),
          {
            gasLimit: calculateGasMargin(estimatedGas),
          },
        );
      } else {
        const estimatedGas = await masterChefContract.estimateGas.withdraw(
          data.pid,
          unStakeAmount === stakedAmount
            ? stakedAmountBN
            : parseUnits(getFixedValue(unStakeAmount), 18),
          account,
        );
        response = await masterChefContract.withdraw(
          data.pid,
          unStakeAmount === stakedAmount
            ? stakedAmountBN
            : parseUnits(getFixedValue(unStakeAmount), 18),
          account,
          {
            gasLimit: calculateGasMargin(estimatedGas),
          },
        );
      }

      addTransaction(response, {
        summary: t('withdrawliquidity'),
        type: TransactionType.RECEIVED,
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
    setAttemptClaiming(true);
    try {
      let response: TransactionResponse;
      if (data.masterChefIndex === 2) {
        const estimatedGas = await masterChefContract.estimateGas.deposit(
          data.pid,
          '0',
        );
        response = await masterChefContract.deposit(data.pid, '0', {
          gasLimit: calculateGasMargin(estimatedGas),
        });
      } else {
        const estimatedGas = await masterChefContract.estimateGas.harvest(
          data.pid,
          account,
        );
        response = await masterChefContract.harvest(data.pid, account, {
          gasLimit: calculateGasMargin(estimatedGas),
        });
      }
      addTransaction(response, {
        summary: t('claimrewards'),
        type: TransactionType.CLAIMED_REWARDS,
      });
      const receipt = await response.wait();
      finalizedTransaction(receipt, {
        summary: t('claimrewards'),
      });
      setAttemptClaiming(false);
    } catch (e) {
      setAttemptClaiming(false);
      console.log('err: ', e);
    }
  };

  return (
    <Box>
      <Divider />
      {isMobile && (
        <Box padding={1.5}>
          <Box className='flex justify-between' mb={2}>
            <small className='text-secondary'>{t('tvl')}</small>
            <small className='weight-600'>${formatNumber(data.tvl)}</small>
          </Box>
          <Box className='flex justify-between' mb={2}>
            <small className='text-secondary'>{t('rewards')}</small>
            <Box textAlign='right'>
              {rewards.map((reward, ind) => (
                <div key={ind}>
                  {reward && Number(reward['rewardPerSecond']) > 0 && (
                    <p className='small weight-600'>
                      {formatNumber(reward.rewardPerSecond * 3600 * 24)}{' '}
                      {reward.rewardTokenSymbol} / {t('day')}
                    </p>
                  )}
                </div>
              ))}
            </Box>
          </Box>
          <Box className='flex justify-between' mb={2}>
            <small className='text-secondary'>{t('poolAPR')}</small>
            <small className='text-success weight-600'>
              {formatNumber(data.poolAPR)}%
            </small>
          </Box>
          <Box className='flex justify-between'>
            <small className='text-secondary'>{t('farmAPR')}</small>
            <small className='text-success weight-600'>
              {formatNumber(data.farmAPR)}%
            </small>
          </Box>
        </Box>
      )}
      <Box padding={1.5} className='flex justify-between'>
        <Grid container spacing={2}>
          {data.ableToFarm && (
            <Grid item xs={12} sm={4}>
              <Box className='flex justify-between'>
                <small className='text-secondary'>{t('available')}:</small>
                <small>
                  {formatNumber(availableStakeAmount)} LP ($
                  {formatNumber(availableStakeUSD)})
                </small>
              </Box>
              <Box
                className='flex items-center bg-palette'
                p='12px 16px'
                borderRadius='10px'
                mt={2}
              >
                <NumericalInput
                  value={stakeAmount}
                  onUserInput={setStakeAmount}
                />
                <span
                  className='cursor-pointer weight-600 text-primary'
                  onClick={() => setStakeAmount(availableStakeAmount)}
                >
                  {t('max')}
                </span>
              </Box>
              <Box mt={2}>
                <Button
                  style={{ height: 40, borderRadius: 10 }}
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
            </Grid>
          )}
          <Grid item xs={12} sm={data.ableToFarm ? 4 : 6}>
            <Box className='flex justify-between'>
              <small className='text-secondary'>{t('deposited')}: </small>
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
                className='cursor-pointer weight-600 text-primary'
                onClick={() => setUnStakeAmount(stakedAmount)}
              >
                {t('max')}
              </span>
            </Box>
            <Box mt={2}>
              <Button
                style={{ height: 40, borderRadius: 10 }}
                disabled={unStakeButtonDisabled}
                fullWidth
                onClick={unStakeLP}
              >
                {attemptUnstaking
                  ? t('unstakingLPTokens')
                  : t('unstakeLPTokens')}
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} sm={data.ableToFarm ? 4 : 6}>
            <Box height='100%' className='flex flex-col justify-between'>
              <small className='text-secondary'>{t('earnedRewards')}</small>
              <Box my={2}>
                {pendingRewards.map((reward) => {
                  return (
                    <Box
                      key={reward.token.address}
                      className='flex items-center justify-center'
                    >
                      <CurrencyLogo currency={reward.token} size='16px' />
                      <Box ml='6px'>
                        <small>
                          {formatNumber(reward.amount)} {reward.token.symbol}
                        </small>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
              <Box width='100%'>
                <Button
                  fullWidth
                  style={{ height: 40, borderRadius: 10 }}
                  disabled={claimButtonDisabled}
                  onClick={claimReward}
                >
                  {attemptClaiming ? t('claiming') : t('claim')}
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default V3GammaFarmCardDetails;
