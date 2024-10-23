import React, { useMemo, useState } from 'react';
import {
  Box,
  Divider,
  Button,
  Grid,
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
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback';
import { tryParseAmount } from 'state/swap/hooks';
import { useSingleCallResult } from 'state/multicall/v3/hooks';
import {
  useUniPilotVaultContract,
  useUnipilotFarmingContract,
} from 'hooks/useContract';
import { TransactionType } from 'models/enums';

const UnipilotFarmCardDetails: React.FC<{
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

  const tokenMap = useSelectedTokenList();
  const farmingContract = useUnipilotFarmingContract(
    data.id,
    data.isDualReward,
  );
  const lpToken = chainId
    ? new Token(chainId, data.stakingAddress, 18)
    : undefined;
  const parsedStakeAmount = chainId
    ? tryParseAmount(chainId, stakeAmount, lpToken)
    : undefined;
  const [approval, approveCallback] = useApproveCallback(
    parsedStakeAmount,
    data.id,
  );

  const vaultContract = useUniPilotVaultContract(data.stakingAddress);
  const lpBalanceResult = useSingleCallResult(vaultContract, 'balanceOf', [
    account,
  ]);
  const lpBalanceBN =
    !lpBalanceResult.loading &&
    lpBalanceResult.result &&
    lpBalanceResult.result.length > 0
      ? lpBalanceResult.result[0]
      : undefined;
  const lpBalance = lpBalanceBN ? formatUnits(lpBalanceBN) : '0';

  const stakedAmountResult = useSingleCallResult(farmingContract, 'balanceOf', [
    account,
  ]);
  const stakedAmount =
    !stakedAmountResult.loading &&
    stakedAmountResult.result &&
    stakedAmountResult.result.length > 0
      ? formatUnits(stakedAmountResult.result[0], 18)
      : '0';

  const rewardTokenResult = useSingleCallResult(
    data.isDualReward ? undefined : farmingContract,
    'rewardsToken',
    [],
  );
  const rewardTokenAddress =
    !rewardTokenResult.loading &&
    rewardTokenResult.result &&
    rewardTokenResult.result.length > 0
      ? rewardTokenResult.result[0]
      : '';
  const rewardToken = getTokenFromAddress(
    rewardTokenAddress,
    chainId,
    tokenMap,
    [],
  );

  const rewardResult = useSingleCallResult(
    data.isDualReward ? undefined : farmingContract,
    'rewards',
    [account],
  );
  const reward =
    !rewardResult.loading &&
    rewardResult.result &&
    rewardResult.result.length > 0
      ? formatUnits(rewardResult.result[0], rewardToken?.decimals)
      : '0';

  const rewardTokenAResult = useSingleCallResult(
    data.isDualReward ? farmingContract : undefined,
    'rewardsTokenA',
    [],
  );
  const rewardTokenAAddress =
    !rewardTokenAResult.loading &&
    rewardTokenAResult.result &&
    rewardTokenAResult.result.length > 0
      ? rewardTokenAResult.result[0]
      : '';
  const rewardTokenA = getTokenFromAddress(
    rewardTokenAAddress,
    chainId,
    tokenMap,
    [],
  );

  const rewardAResult = useSingleCallResult(
    data.isDualReward ? farmingContract : undefined,
    'rewardsA',
    [account],
  );
  const rewardA =
    !rewardAResult.loading &&
    rewardAResult.result &&
    rewardAResult.result.length > 0
      ? formatUnits(rewardAResult.result[0], rewardTokenA?.decimals)
      : '0';

  const rewardTokenBResult = useSingleCallResult(
    data.isDualReward ? farmingContract : undefined,
    'rewardsTokenB',
    [],
  );
  const rewardTokenBAddress =
    !rewardTokenBResult.loading &&
    rewardTokenBResult.result &&
    rewardTokenBResult.result.length > 0
      ? rewardTokenBResult.result[0]
      : '';
  const rewardTokenB = getTokenFromAddress(
    rewardTokenBAddress,
    chainId,
    tokenMap,
    [],
  );

  const rewardBResult = useSingleCallResult(
    data.isDualReward ? farmingContract : undefined,
    'rewardsB',
    [account],
  );
  const rewardB =
    !rewardBResult.loading &&
    rewardBResult.result &&
    rewardBResult.result.length > 0
      ? formatUnits(rewardBResult.result[0], rewardTokenB?.decimals)
      : '0';

  const approveOrStakeLP = async () => {
    if (!account) return;
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
    if (!farmingContract || !account) return;

    const estimatedGas = await farmingContract.estimateGas.stake(
      stakeAmount === lpBalance
        ? lpBalanceBN
        : parseUnits(getFixedValue(stakeAmount), 18),
    );
    const response = await farmingContract.stake(
      stakeAmount === lpBalance
        ? lpBalanceBN
        : parseUnits(getFixedValue(stakeAmount), 18),
      {
        gasLimit: calculateGasMargin(estimatedGas),
      },
    );

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
    if (!farmingContract || !account) return;
    setAttemptUnstaking(true);
    try {
      let response: TransactionResponse;
      if (unStakeAmount === stakedAmount) {
        const estimatedGas = await farmingContract.estimateGas.exit();
        response = await farmingContract.exit({
          gasLimit: calculateGasMargin(estimatedGas),
        });
      } else {
        const estimatedGas = await farmingContract.estimateGas.withdraw(
          parseUnits(getFixedValue(unStakeAmount), 18),
        );
        response = await farmingContract.withdraw(
          parseUnits(getFixedValue(unStakeAmount), 18),
          {
            gasLimit: calculateGasMargin(estimatedGas),
          },
        );
      }
      addTransaction(response, {
        summary: t('withdrawliquidity'),
        type: TransactionType.WITHDRAW_LIQUIDITY,
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
    if (!farmingContract || !account) return;
    setAttemptClaiming(true);
    try {
      const estimatedGas = await farmingContract.estimateGas.getReward();
      const response = await farmingContract.getReward({
        gasLimit: calculateGasMargin(estimatedGas),
      });

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

  const stakeButtonDisabled =
    Number(stakeAmount) <= 0 ||
    Number(stakeAmount) > Number(lpBalance) ||
    !farmingContract ||
    !account ||
    approveOrStaking;
  const unStakeButtonDisabled =
    Number(unStakeAmount) <= 0 ||
    Number(unStakeAmount) > Number(stakedAmount) ||
    !farmingContract ||
    !account ||
    attemptUnstaking;
  const claimButtonDisabled = useMemo(() => {
    if (data.isDualReward) {
      return (
        (Number(rewardA) === 0 && Number(rewardB) === 0) || attemptClaiming
      );
    }
    return Number(reward) === 0 || attemptClaiming;
  }, [attemptClaiming, data.isDualReward, reward, rewardA, rewardB]);

  const rewardRateA =
    data.rewardRate && data.rewardRate.rateA && data.rewardRate.tokenA
      ? Number(
          formatUnits(data.rewardRate.rateA, data.rewardRate.tokenA.decimals),
        ) *
        24 *
        3600
      : 0;
  const rewardRateB =
    data.rewardRate && data.rewardRate.rateB && data.rewardRate.tokenB
      ? Number(
          formatUnits(data.rewardRate.rateB, data.rewardRate.tokenB.decimals),
        ) *
        24 *
        3600
      : 0;

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
              {rewardRateA > 0 && (
                <div>
                  <small className='small weight-600'>
                    {formatNumber(rewardRateA)} {data.rewardRate.tokenA.symbol}{' '}
                    / {t('day')}
                  </small>
                </div>
              )}
              {rewardRateB > 0 && (
                <div>
                  <small className='small weight-600'>
                    {formatNumber(rewardRateB)} {data.rewardRate.tokenB.symbol}{' '}
                    / {t('day')}
                  </small>
                </div>
              )}
            </Box>
          </Box>
          <Box className='flex justify-between' mb={2}>
            <small className='text-secondary'>{t('vaultAPR')}</small>
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
      <Box padding={1.5}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box className='flex justify-between'>
              <small className='text-secondary'>{t('available')}:</small>
              <small>{formatNumber(lpBalance)} LP</small>
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
                onClick={() => setStakeAmount(lpBalance)}
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

          <Grid item xs={12} sm={4}>
            <Box className='flex justify-between'>
              <small className='text-secondary'>{t('deposited')}: </small>
              <small>{formatNumber(stakedAmount)} LP</small>
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
          <Grid item xs={12} sm={4}>
            <Box height='100%' className='flex flex-col justify-between'>
              <small className='text-secondary'>{t('earnedRewards')}</small>
              <Box my={2}>
                <Box className='flex items-center justify-center'>
                  <CurrencyLogo
                    currency={data.isDualReward ? rewardTokenA : rewardToken}
                    size='16px'
                  />
                  <Box ml='6px'>
                    <small>
                      {formatNumber(data.isDualReward ? rewardA : reward)}{' '}
                      {(data.isDualReward ? rewardTokenA : rewardToken)?.symbol}
                    </small>
                  </Box>
                </Box>
                {data.isDualReward && (
                  <Box className='flex items-center justify-center' mt='5px'>
                    <CurrencyLogo currency={rewardTokenB} size='16px' />
                    <Box ml='6px'>
                      <small>
                        {formatNumber(rewardB)} {rewardTokenB?.symbol}
                      </small>
                    </Box>
                  </Box>
                )}
              </Box>
              <Box width='100%'>
                <Button
                  style={{ height: 40, borderRadius: 10 }}
                  fullWidth
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

export default UnipilotFarmCardDetails;
