import React, { useState } from 'react';
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
import { calculateGasMargin, formatNumber, getTokenFromAddress } from 'utils';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import {
  useDefiedgeStrategyContract,
  useMiniChefContract,
} from 'hooks/useContract';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback';
import { tryParseAmount } from 'state/swap/hooks';
import { useSingleCallResult } from 'state/multicall/v3/hooks';

const DefiedgeFarmCardDetails: React.FC<{
  pairData: any;
  rewardData: any;
  rewardToken: any;
}> = ({ pairData, rewardData, rewardToken }) => {
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

  const miniChefContract = useMiniChefContract(pairData.miniChefAddress);
  const strategyContract = useDefiedgeStrategyContract(pairData.id);

  const stakedData = useSingleCallResult(miniChefContract, 'userInfo', [
    pairData.pid,
    account ?? undefined,
  ]);

  const pendingRewardsResult = useSingleCallResult(
    miniChefContract,
    'pendingSushi',
    [pairData.pid, account ?? undefined],
  );

  const pendingRewardsBN =
    !pendingRewardsResult.loading &&
    pendingRewardsResult.result &&
    pendingRewardsResult.result.length > 0
      ? pendingRewardsResult.result[0]
      : undefined;

  const pendingRewards = pendingRewardsBN
    ? formatUnits(pendingRewardsBN, 18)
    : '0';

  const stakedAmountBN =
    !stakedData.loading && stakedData.result && stakedData.result.length > 0
      ? stakedData.result[0]
      : undefined;
  const stakedAmount = stakedAmountBN ? formatUnits(stakedAmountBN, 18) : '0';

  const lpToken = chainId ? new Token(chainId, pairData.id, 18) : undefined;
  const lpBalanceData = useSingleCallResult(strategyContract, 'balanceOf', [
    account ?? undefined,
  ]);
  const lpBalanceBN =
    !lpBalanceData.loading &&
    lpBalanceData.result &&
    lpBalanceData.result.length > 0
      ? lpBalanceData.result[0]
      : undefined;
  const availableStakeAmount = lpBalanceBN ? formatUnits(lpBalanceBN, 18) : '0';

  // const availableStakeUSD = Number(availableStakeAmount) * lpTokenUSD;
  const lpTokenBalance = chainId
    ? tryParseAmount(chainId, availableStakeAmount, lpToken)
    : undefined;
  const parsedStakeAmount = chainId
    ? tryParseAmount(chainId, stakeAmount, lpToken)
    : undefined;
  const stakeButtonDisabled =
    Number(stakeAmount) <= 0 ||
    !lpTokenBalance ||
    parsedStakeAmount?.greaterThan(lpTokenBalance) ||
    !miniChefContract ||
    !account ||
    approveOrStaking;
  const unStakeButtonDisabled =
    Number(unStakeAmount) <= 0 ||
    Number(unStakeAmount) > Number(stakedAmount) ||
    !miniChefContract ||
    !account ||
    attemptUnstaking;
  const [approval, approveCallback] = useApproveCallback(
    parsedStakeAmount,
    miniChefContract?.address,
  );

  const claimButtonDisabled = !Number(pendingRewards) || attemptClaiming;

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
    if (!miniChefContract || !account || !lpBalanceBN) return;

    const estimatedGas = await miniChefContract.estimateGas.deposit(
      pairData.pid,
      stakeAmount === availableStakeAmount
        ? lpBalanceBN
        : parseUnits(Number(stakeAmount).toFixed(18), 18),
      account,
    );
    const response: TransactionResponse = await miniChefContract.deposit(
      pairData.pid,
      stakeAmount === availableStakeAmount
        ? lpBalanceBN
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
    if (!miniChefContract || !account || !stakedAmountBN) return;
    setAttemptUnstaking(true);
    try {
      const estimatedGas = await miniChefContract.estimateGas.withdraw(
        pairData.pid,
        unStakeAmount === stakedAmount
          ? stakedAmountBN
          : parseUnits(Number(unStakeAmount).toFixed(18), 18),
        account,
      );
      const response: TransactionResponse = await miniChefContract.withdraw(
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
    if (!miniChefContract || !account) return;
    setAttemptClaiming(true);
    try {
      const estimatedGas = await miniChefContract.estimateGas.harvest(
        pairData.pid,
        account,
      );
      const response: TransactionResponse = await miniChefContract.harvest(
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
        <Box padding={1.5}>
          <Box className='flex justify-between' mb={2}>
            <small className='text-secondary'>{t('tvl')}</small>
            <small className='weight-600'>
              $
              {formatNumber(
                rewardData && rewardData['stakedAmountUSD']
                  ? rewardData['stakedAmountUSD']
                  : 0,
              )}
            </small>
          </Box>
          <Box className='flex justify-between' mb={2}>
            <small className='text-secondary'>{t('rewards')}</small>
            <Box textAlign='right'>
              <div>
                {rewardData && Number(rewardData['rewardPerSecond']) > 0 && (
                  <p className='small weight-600'>
                    {formatNumber(100 * 3600 * 24)} {'USDC'} / {t('day')}
                  </p>
                )}
              </div>
            </Box>
          </Box>
          <Box className='flex justify-between' mb={2}>
            <small className='text-secondary'>{t('poolAPR')}</small>
            <small className='text-success weight-600'>
              {formatNumber(Number(0) * 100)}%
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
      <Box padding={1.5}>
        <Grid container spacing={2}>
          {pairData.ableToFarm && (
            <Grid item xs={12} sm={4}>
              <Box className='flex justify-between'>
                <small className='text-secondary'>{t('available')}:</small>
                <small>{formatNumber(availableStakeAmount)} LP</small>
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

          <Grid item xs={12} sm={pairData.ableToFarm ? 4 : 6}>
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
          {chainId && (
            <Grid item xs={12} sm={pairData.ableToFarm ? 4 : 6}>
              <Box height='100%' className='flex flex-col justify-between'>
                <small className='text-secondary'>{t('earnedRewards')}</small>
                <Box my={2}>
                  <Box className='flex items-center justify-center'>
                    <CurrencyLogo currency={rewardToken} size='16px' />
                    <Box ml='6px'>
                      <small>
                        {formatNumber(pendingRewards)} {rewardToken?.symbol}
                      </small>
                    </Box>
                  </Box>
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
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default DefiedgeFarmCardDetails;
