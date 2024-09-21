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
import { Token } from '@uniswap/sdk-core';
import { Token as TokenV2 } from '@uniswap/sdk';
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
import { ApprovalState, useApproveCallback } from 'hooks/useV3ApproveCallback';
import { tryParseAmount } from 'state/swap/v3/hooks';
import { useSingleCallResult } from 'state/multicall/hooks';
import { useSteerFarmingContract } from 'hooks/useContract';
import { useTokenBalance } from 'state/wallet/v3/hooks';
import Loader from 'components/Loader';
import { TransactionType } from 'models/enums';

const V3SteerFarmCardDetails: React.FC<{
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
  const farmingContract = useSteerFarmingContract(
    data.stakingPool,
    data.isDualFactory,
  );
  const lpToken = chainId
    ? new Token(chainId, data.stakingToken, 18)
    : undefined;
  const parsedStakeAmount = lpToken
    ? tryParseAmount(stakeAmount, lpToken)
    : undefined;
  const [approval, approveCallback] = useApproveCallback(
    parsedStakeAmount,
    data.stakingPool,
  );

  const lpBalance = useTokenBalance(account, lpToken);

  const stakedAmountResult = useSingleCallResult(farmingContract, 'balanceOf', [
    account,
  ]);
  const stakedAmount =
    !stakedAmountResult.loading &&
    stakedAmountResult.result &&
    stakedAmountResult.result.length > 0
      ? formatUnits(stakedAmountResult.result[0], 18)
      : '0';

  const earnedAResult = useSingleCallResult(
    farmingContract,
    data.isDualFactory ? 'earnedA' : 'earned',
    [account],
  );
  const rewardA =
    !earnedAResult.loading &&
    earnedAResult.result &&
    earnedAResult.result.length > 0
      ? formatUnits(
          earnedAResult.result[0],
          data.rewardTokenADetail ? data.rewardTokenADetail.decimals : 18,
        )
      : '0';

  const earnedBResult = useSingleCallResult(
    data.isDualFactory ? farmingContract : undefined,
    'earnedB',
    [account],
  );
  const rewardB =
    !earnedBResult.loading &&
    earnedBResult.result &&
    earnedBResult.result.length > 0
      ? formatUnits(
          earnedBResult.result[0],
          data.rewardTokenBDetail ? data.rewardTokenBDetail.decimals : 18,
        )
      : '0';

  const rewardRateA = data.dailyEmissionRewardA
    ? Number(data.dailyEmissionRewardA)
    : 0;
  const rewardRateB = data.dailyEmissionRewardB
    ? Number(data.dailyEmissionRewardB)
    : 0;

  const rewardTokenA =
    data.rewardTokenA && data.rewardTokenADetail
      ? getTokenFromAddress(data.rewardTokenA, chainId, tokenMap, [
          new TokenV2(
            chainId,
            data.rewardTokenADetail.address,
            data.rewardTokenADetail.decimals,
            data.rewardTokenADetail.symbol,
            data.rewardTokenADetail.name,
          ),
        ])
      : undefined;
  const rewardTokenB =
    data.rewardTokenB && data.rewardTokenBDetail
      ? getTokenFromAddress(data.rewardTokenB, chainId, tokenMap, [
          new TokenV2(
            chainId,
            data.rewardTokenBDetail.address,
            data.rewardTokenBDetail.decimals,
            data.rewardTokenBDetail.symbol,
            data.rewardTokenBDetail.name,
          ),
        ])
      : undefined;

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
    if (!farmingContract || !account || !lpBalance) return;

    const estimatedGas = await farmingContract.estimateGas.stake(
      Number(stakeAmount) === Number(lpBalance.toExact())
        ? lpBalance.numerator.toString()
        : parseUnits(getFixedValue(stakeAmount), 18),
    );
    const response = await farmingContract.stake(
      Number(stakeAmount) === Number(lpBalance.toExact())
        ? lpBalance.numerator.toString()
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
    return (
      (Number(rewardA) === 0 &&
        (data.isDualFactory ? Number(rewardB) === 0 : true)) ||
      attemptClaiming
    );
  }, [attemptClaiming, data.isDualFactory, rewardA, rewardB]);

  const isActive = Date.now() < Number(data.periodFinish) * 1000;

  return (
    <Box>
      <Divider />
      {isMobile && (
        <Box padding={1.5}>
          <Box className='flex justify-between' mb={2}>
            <small className='text-secondary'>{t('tvl')}</small>
            {data.loading ? (
              <Loader />
            ) : (
              <small className='weight-600'>${formatNumber(data.tvl)}</small>
            )}
          </Box>
          <Box className='flex justify-between' mb={2}>
            <small className='text-secondary'>{t('rewards')}</small>
            <Box textAlign='right'>
              {rewardRateA > 0 && (
                <div>
                  <small className='small weight-600'>
                    {formatNumber(rewardRateA)} {data.rewardTokenADetail.symbol}{' '}
                    / {t('day')}
                  </small>
                </div>
              )}
              {rewardRateB > 0 && (
                <div>
                  <small className='small weight-600'>
                    {formatNumber(rewardRateB)} {data.rewardTokenBDetail.symbol}{' '}
                    / {t('day')}
                  </small>
                </div>
              )}
            </Box>
          </Box>
          <Box className='flex justify-between' mb={2}>
            <small className='text-secondary'>{t('vaultAPR')}</small>
            {data.loading ? (
              <Loader />
            ) : (
              <small className='text-success weight-600'>
                {formatNumber(data.feeAPR)}%
              </small>
            )}
          </Box>
          <Box className='flex justify-between'>
            <small className='text-secondary'>{t('farmAPR')}</small>
            {data.loading ? (
              <Loader />
            ) : (
              <small className='text-success weight-600'>
                {formatNumber(data.farmAPR)}%
              </small>
            )}
          </Box>
        </Box>
      )}
      <Box padding={1.5}>
        <Grid container spacing={2}>
          {isActive && (
            <Grid item xs={12} sm={4}>
              <Box className='flex justify-between'>
                <small className='text-secondary'>{t('available')}:</small>
                <small>{lpBalance?.toSignificant(2)} LP</small>
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
                  onClick={() => setStakeAmount(lpBalance?.toExact() ?? '')}
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

          <Grid item xs={12} sm={isActive ? 4 : 6}>
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
          <Grid item xs={12} sm={isActive ? 4 : 6}>
            <Box height='100%' className='flex flex-col justify-between'>
              <small className='text-secondary'>{t('earnedRewards')}</small>
              <Box my={2}>
                <Box className='flex items-center justify-center'>
                  <CurrencyLogo currency={rewardTokenA} size='20px' />
                  <Box ml='6px'>
                    <small>
                      {formatNumber(rewardA)} {rewardTokenA?.symbol}
                    </small>
                  </Box>
                </Box>
                {data.isDualFactory && (
                  <Box className='flex items-center justify-center' mt='2px'>
                    <CurrencyLogo currency={rewardTokenB} size='20px' />
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

export default V3SteerFarmCardDetails;
