import React, { useState } from 'react';
import { Box, Grid, Divider, Button } from 'theme/components';
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
import {
  useMultipleContractSingleData,
  useSingleCallResult,
} from 'state/multicall/hooks';
import GammaRewarder from 'constants/abis/gamma-rewarder.json';
import { Interface } from '@ethersproject/abi';
import { useTokenBalance } from 'state/wallet/hooks';
import { useIsXS } from 'hooks/useMediaQuery';

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
  const [attemptClaiming, setAttemptClaiming] = useState(false);
  const isMobile = useIsXS();
  const masterChefContract = useMasterChefContract();

  const lpToken = chainId
    ? new Token(chainId, pairData.address, 18)
    : undefined;
  const lpTokenBalance = useTokenBalance(account ?? undefined, lpToken);
  const availableStakeAmount = lpTokenBalance?.toExact() ?? '0';

  const stakedData = useSingleCallResult(masterChefContract, 'userInfo', [
    pairData.pid,
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

  const rewards: any[] =
    rewardData && rewardData['rewarders']
      ? Object.values(rewardData['rewarders'])
      : [];
  const rewarderAddresses =
    rewardData && rewardData['rewarders']
      ? Object.keys(rewardData['rewarders'])
      : [];
  const pendingRewardsData = useMultipleContractSingleData(
    rewarderAddresses,
    new Interface(GammaRewarder),
    'pendingToken',
    [pairData.pid, account ?? undefined],
  );
  const pendingRewards = pendingRewardsData.map((callData) =>
    !callData.loading && callData.result && callData.result.length > 0
      ? callData.result[0]
      : undefined,
  );

  const tokenMap = useSelectedTokenList();
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

  const parsedStakeAmount = tryParseAmount(stakeAmount, lpToken);
  const [approval, approveCallback] = useApproveCallback(
    parsedStakeAmount,
    masterChefContract?.address,
  );

  const claimButtonDisabled =
    pendingRewards.filter((reward) => reward && Number(reward) > 0).length ===
      0 || attemptClaiming;

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
    if (!masterChefContract || !account || !lpTokenBalance) return;
    const estimatedGas = await masterChefContract.estimateGas.deposit(
      pairData.pid,
      stakeAmount === availableStakeAmount
        ? lpTokenBalance.numerator.toString()
        : parseUnits(Number(stakeAmount).toFixed(18), 18),
      account,
    );
    const response: TransactionResponse = await masterChefContract.deposit(
      pairData.pid,
      stakeAmount === availableStakeAmount
        ? lpTokenBalance.numerator.toString()
        : parseUnits(Number(stakeAmount).toFixed(18), 18),
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
    if (!masterChefContract || !account || !stakedAmountBN) return;
    setAttemptUnstaking(true);
    try {
      const estimatedGas = await masterChefContract.estimateGas.withdraw(
        pairData.pid,
        unStakeAmount === stakedAmount
          ? stakedAmountBN
          : parseUnits(Number(unStakeAmount).toFixed(18), 18),
        account,
      );
      const response: TransactionResponse = await masterChefContract.withdraw(
        pairData.pid,
        unStakeAmount === stakedAmount
          ? stakedAmountBN
          : parseUnits(Number(unStakeAmount).toFixed(18), 18),
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
    setAttemptClaiming(true);
    try {
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
        <Box padding='12px'>
          <Box className='flex justify-between' margin='0 0 16px'>
            <small className='text-secondary'>{t('tvl')}</small>
            <small className='weight-600'>
              ${formatNumber(data && data['tvlUSD'] ? data['tvlUSD'] : 0)}
            </small>
          </Box>
          <Box className='flex justify-between' margin='0 0 16px'>
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
          <Box className='flex justify-between' margin='0 0 16px'>
            <small className='text-secondary'>{t('poolAPR')}</small>
            <small className='text-success weight-600'>
              {formatNumber(
                Number(
                  data &&
                    data['returns'] &&
                    data['returns']['allTime'] &&
                    data['returns']['allTime']['feeApr']
                    ? data['returns']['allTime']['feeApr']
                    : 0,
                ) * 100,
              )}
              %
            </small>
          </Box>
          <Box className='flex justify-between'>
            <small className='text-secondary'>{t('farmAPR')}</small>
            <small className='text-success weight-600'>
              {formatNumber(
                Number(
                  rewardData && rewardData['apr'] ? rewardData['apr'] : 0,
                ) * 100,
              )}
              %
            </small>
          </Box>
        </Box>
      )}
      <Box padding='12px' className='flex justify-between'>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box width='100%'>
              <Box className='flex justify-between'>
                <small className='text-secondary'>{t('available')}:</small>
                <small>
                  {formatNumber(availableStakeAmount)} LP ($
                  {positionData ? formatNumber(positionData.balanceUSD) : 0})
                </small>
              </Box>
              <Box
                className='flex items-center bg-palette'
                padding='12px 16px'
                borderRadius='10px'
                margin='16px 0 0'
              >
                <NumericalInput
                  value={stakeAmount}
                  onUserInput={setStakeAmount}
                />
                <span
                  className='weight-600 cursor-pointer text-primary'
                  onClick={() => setStakeAmount(availableStakeAmount)}
                >
                  {t('max')}
                </span>
              </Box>
              <Box margin='16px 0 0'>
                <Button
                  width='100%'
                  disabled={stakeButtonDisabled}
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
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box width='100%'>
              <Box className='flex justify-between'>
                <small className='text-secondary'>{t('deposited')}: </small>
                <small>
                  {formatNumber(stakedAmount)} LP (${formatNumber(stakedUSD)})
                </small>
              </Box>
              <Box
                className='flex items-center bg-palette'
                padding='12px 16px'
                borderRadius='10px'
                margin='16px 0 0'
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
              <Box margin='16px 0 0'>
                <Button
                  width='100%'
                  disabled={unStakeButtonDisabled}
                  onClick={unStakeLP}
                >
                  {attemptUnstaking
                    ? t('unstakingLPTokens')
                    : t('unstakeLPTokens')}
                </Button>
              </Box>
            </Box>
          </Grid>
          {rewards.length > 0 && chainId && (
            <Grid item xs={12} sm={4}>
              <Box height='100%' className='flex flex-col justify-between'>
                <small className='text-secondary'>{t('earnedRewards')}</small>
                <Box margin='16px 0'>
                  {rewards.map((reward, index) => {
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
                    const pendingReward = pendingRewards[index]
                      ? formatUnits(pendingRewards[index], rewardToken.decimals)
                      : 0;
                    return (
                      <Box
                        key={reward.rewardToken}
                        className='flex items-center justify-center'
                      >
                        <CurrencyLogo currency={rewardToken} size='16px' />
                        <Box margin='0 0 0 6px'>
                          <small>
                            {formatNumber(pendingReward)}{' '}
                            {reward.rewardTokenSymbol}
                          </small>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
                <Box width='100%'>
                  <Button
                    width='100%'
                    disabled={claimButtonDisabled}
                    onClick={claimReward}
                  >
                    {attemptClaiming ? t('claiming') : t('claim')}
                  </Button>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default GammaFarmCardDetails;
