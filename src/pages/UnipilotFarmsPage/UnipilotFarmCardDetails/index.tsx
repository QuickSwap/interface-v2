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
import { useSelectedTokenList } from 'state/lists/hooks';
import { calculateGasMargin, formatNumber, getTokenFromAddress } from 'utils';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
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

  return (
    <Box>
      <Divider />
      {isMobile && (
        <Box padding={1.5}>
          <Box className='flex justify-between' mb={2}>
            <small className='text-secondary'>{t('tvl')}</small>
            {/* <small className='weight-600'>
              $
              {formatNumber(
                rewardData && rewardData['stakedAmountUSD']
                  ? rewardData['stakedAmountUSD']
                  : 0,
              )}
            </small> */}
          </Box>
          <Box className='flex justify-between' mb={2}>
            <small className='text-secondary'>{t('rewards')}</small>
            {/* <Box textAlign='right'>
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
            </Box> */}
          </Box>
          <Box className='flex justify-between' mb={2}>
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
            {/* <small className='text-success weight-600'>
              {formatNumber(
                Number(
                  rewardData && rewardData['apr'] ? rewardData['apr'] : 0,
                ) * 100,
              )}
              %
            </small> */}
          </Box>
        </Box>
      )}
      <Box padding={1.5}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box className='flex justify-between'>
              <small className='text-secondary'>{t('available')}:</small>
              {/* <small>
                {formatNumber(availableStakeAmount)} LP ($
                {formatNumber(availableStakeUSD)})
              </small> */}
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
                // onClick={() => setStakeAmount(availableStakeAmount)}
              >
                {t('max')}
              </span>
            </Box>
            <Box mt={2}>
              <Button
                style={{ height: 40, borderRadius: 10 }}
                // disabled={stakeButtonDisabled}
                fullWidth
                // onClick={approveOrStakeLP}
              >
                {/* {approval === ApprovalState.APPROVED
                  ? approveOrStaking
                    ? t('stakingLPTokens')
                    : t('stakeLPTokens')
                  : approveOrStaking
                  ? t('approving')
                  : t('approve')} */}
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box className='flex justify-between'>
              <small className='text-secondary'>{t('deposited')}: </small>
              {/* <small>
                {formatNumber(stakedAmount)} LP (${formatNumber(stakedUSD)})
              </small> */}
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
                // onClick={() => setUnStakeAmount(stakedAmount)}
              >
                {t('max')}
              </span>
            </Box>
            <Box mt={2}>
              <Button
                style={{ height: 40, borderRadius: 10 }}
                // disabled={unStakeButtonDisabled}
                fullWidth
                // onClick={unStakeLP}
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
                  {/* <CurrencyLogo currency={reward.token} size='16px' />
                  <Box ml='6px'>
                    <small>
                      {formatNumber(reward.amount)} {reward.token.symbol}
                    </small>
                  </Box> */}
                </Box>
              </Box>
              <Box width='100%'>
                <Button
                  style={{ height: 40, borderRadius: 10 }}
                  fullWidth
                  // disabled={claimButtonDisabled}
                  // onClick={claimReward}
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
