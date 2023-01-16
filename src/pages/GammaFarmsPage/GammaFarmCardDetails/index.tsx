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

const GammaFarmCardDetails: React.FC<{
  pairData: any;
  rewardData: any;
  positionData: any;
}> = ({ pairData, rewardData, positionData }) => {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unStakeAmount, setUnStakeAmount] = useState('');
  const [approveOrStaking, setApproveOrStaking] = useState(false);
  const [attemptUnstaking, setAttemptUnstaking] = useState(false);
  const rewards: any[] =
    rewardData && rewardData['rewarders']
      ? Object.values(rewardData['rewarders'])
      : [];
  const tokenMap = useSelectedTokenList();
  const masterChefContract = useMasterChefContract();
  const stakeButtonDisabled =
    Number(stakeAmount) <= 0 ||
    Number(stakeAmount) > Number(formatUnits(positionData.shares, 18)) ||
    !masterChefContract ||
    !account ||
    approveOrStaking;
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

  return (
    <Box>
      <Divider />
      <Box padding={1.5} className='flex justify-between'>
        <Box width='calc(33% - 32px)' px='16px'>
          <Box className='flex justify-between'>
            <small className='text-secondary'>{t('available')}:</small>
            <small>
              {positionData
                ? formatNumber(formatUnits(positionData.shares, 18))
                : 0}{' '}
              LP ($
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
              onClick={() =>
                setStakeAmount(formatUnits(positionData.shares, 18))
              }
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
            <small>LP ($)</small>
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
            <span className='weight-600 cursor-pointer text-primary'>
              {t('max')}
            </span>
          </Box>
          <Box mt={2}>
            <Button disabled={!Number(unStakeAmount)} fullWidth>
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
              <Button fullWidth>{t('claim')}</Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default GammaFarmCardDetails;
