import React, { useCallback, useMemo, useState } from 'react';
import {
  TransactionErrorContent,
  TransactionConfirmationModal,
  ConfirmationModalContent,
} from 'components';
import { useTranslation } from 'react-i18next';
import { JSBI } from '@uniswap/sdk';
import { ethers } from 'ethers';
import { RESTRICTED_TOKENS, V2_FACTORY_ADDRESSES } from 'constants/lockers';
import { useActiveWeb3React } from 'hooks';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@material-ui/core';
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from 'constants/v3/addresses';
import {
  ApprovalState,
  useApproveCallbackTokenId,
} from 'hooks/useApproveCallback';
import { useV3Positions } from 'hooks/v3/useV3Positions';
import { useTokenLockerContract } from 'hooks/useContract';
import { updateUserLiquidityLock } from 'state/data/liquidityLocker';
import { calculateGasMargin, formatNumber } from 'utils';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import './index.scss';
import { useETHBalances } from 'state/wallet/v3/hooks';
import { useGetFeesAndWhitelistedWallet } from 'hooks/lpLock/useGetFeesAndWhitelisted';
import { formatUnits } from 'ethers/lib/utils';
dayjs.extend(utc);

const LockV3Liquidity: React.FC = () => {
  const { t } = useTranslation();
  const { account, chainId, library } = useActiveWeb3React();

  // inputs
  const [unlockDate, setUnlockDate] = useState(dayjs().add(90, 'days'));
  const [selectedExtendDate, setSelectedExtendDate] = useState('3M');
  const [tokenId, setTokenId] = useState('');
  const [lockErrorMessage, setLockErrorMessage] = useState('');

  const [showConfirm, setShowConfirm] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [txPending, setTxPending] = useState(false);
  const [approving, setApproving] = useState(false);
  const [attemptingTxn, setAttemptingTxn] = useState(false);

  const { positions: allPositions, loading: positionsLoading } = useV3Positions(
    account,
    true,
  );

  const restrictedTokens = (RESTRICTED_TOKENS[chainId] ?? []).map((address) =>
    address.toLowerCase(),
  );

  const positions = allPositions?.filter(
    (pos) =>
      !restrictedTokens.includes(pos.token0.toLowerCase()) ||
      !restrictedTokens.includes(pos.token1.toLowerCase()),
  );

  const tokenLockerContract = useTokenLockerContract(chainId);
  const ethBalanceData = useETHBalances(account ? [account] : []);
  const ethBalance = account ? ethBalanceData?.[account] : undefined;
  const nftPosManContractAddress =
    NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId];

  const {
    data: feeData,
    isLoading: isLoadingFeeData,
  } = useGetFeesAndWhitelistedWallet(nftPosManContractAddress);

  const errorMsg = useMemo(() => {
    if (
      !nftPosManContractAddress ||
      !library ||
      !tokenLockerContract ||
      !tokenId ||
      tokenId == ''
    ) {
      return t('missingdependencies');
    }
    if (isLoadingFeeData) return;
    if (feeData?.isWhitelisted) return;
    if (
      feeData?.fee &&
      ethBalance?.numerator &&
      JSBI.greaterThan(JSBI.BigInt(feeData.fee), ethBalance?.numerator)
    )
      return `${formatNumber(
        formatUnits(feeData.fee),
      )} Matic is required for fee. You don't have enough Matic.`;
  }, [
    ethBalance?.numerator,
    feeData?.fee,
    feeData?.isWhitelisted,
    isLoadingFeeData,
    library,
    nftPosManContractAddress,
    t,
    tokenId,
    tokenLockerContract,
  ]);

  const [approval, approveCallback] = useApproveCallbackTokenId(
    tokenId != '' ? tokenId : undefined,
    chainId ? V2_FACTORY_ADDRESSES[chainId] : undefined,
  );

  const handleChange = (e: any) => {
    setTokenId(e.target.value);
  };

  const handleChangeDate = (e: string) => {
    setUnlockDate(dayjs(e));
  };

  const addMonths = (months: number) => {
    const newDate = dayjs().add(months, 'month');
    setUnlockDate(newDate);
    setSelectedExtendDate(`${months}M`);
  };

  const addYears = (years: number) => {
    const newDate = dayjs().add(years, 'year');
    setUnlockDate(newDate);
    setSelectedExtendDate(`${years}Y`);
  };

  const onAttemptToApprove = async () => {
    setApproving(true);
    try {
      await approveCallback();
      setApproving(false);
    } catch (e) {
      setApproving(false);
    }
  };

  // @Hassaan: Implement lock logic here
  const onLock = async () => {
    if (!tokenLockerContract) return;
    try {
      setAttemptingTxn(true);
      const gasEstimate = await tokenLockerContract?.estimateGas.lockNFT(
        nftPosManContractAddress,
        account,
        1,
        unlockDate.unix(),
        tokenId,
        false,
        ethers.constants.AddressZero,
        {
          value: feeData?.isWhitelisted ? undefined : feeData?.fee,
        },
      );
      const gasEstimateWithMargin = calculateGasMargin(gasEstimate);
      const response = await tokenLockerContract?.lockNFT(
        nftPosManContractAddress,
        account,
        1,
        unlockDate.unix(),
        tokenId,
        false,
        ethers.constants.AddressZero,
        {
          value: feeData?.isWhitelisted ? undefined : feeData?.fee,
          gasLimit: gasEstimateWithMargin,
        },
      );
      console.log(response, 'response after lock');
      setTxHash(response.hash);
      setAttemptingTxn(false);
      setTxPending(true);

      const receipt = await response.wait();
      console.log(receipt);
      const depositId = await tokenLockerContract?.depositId();
      await updateUserLiquidityLock(
        V2_FACTORY_ADDRESSES[chainId],
        Number(depositId),
      );
      setTxPending(false);
    } catch (error) {
      setAttemptingTxn(false);
      setTxPending(false);
      setLockErrorMessage(t('errorInTx'));
    }
  };

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    setTxHash('');
  }, []);

  const modalHeader = () => {
    return (
      <Box>
        <Box className='flex justify-center' mt={10} mb={3}>
          Locking V3 Liquidity
        </Box>
        <Box mt={2}>
          <Button fullWidth className='lockButton' onClick={onLock}>
            {t('confirm')}
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      {showConfirm && (
        <TransactionConfirmationModal
          isOpen={showConfirm}
          onDismiss={handleDismissConfirmation}
          attemptingTxn={attemptingTxn}
          txPending={txPending}
          hash={txHash}
          content={() =>
            lockErrorMessage ? (
              <TransactionErrorContent
                onDismiss={handleDismissConfirmation}
                message={lockErrorMessage}
              />
            ) : (
              <ConfirmationModalContent
                title={t('lockingLiquidity')}
                onDismiss={handleDismissConfirmation}
                content={modalHeader}
              />
            )
          }
          pendingText=''
          modalContent={txPending ? 'Submitting' : 'Success'}
        />
      )}
      <Box p={2} className='bg-secondary2 rounded-md'>
        <Box>
          <FormControl fullWidth variant='outlined'>
            <InputLabel>V3 LP Token</InputLabel>
            <Select
              disabled={positionsLoading}
              value={tokenId}
              onChange={handleChange}
              label='LP Token'
              renderValue={(value) => `TokenId: ${value}`}
            >
              <MenuItem value=''>
                <em>None</em>
              </MenuItem>
              {(positions ?? []).map((position) => (
                <MenuItem
                  key={position.tokenId.toString()}
                  value={position.tokenId.toString()}
                >
                  {position.tokenId.toString()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box mt={2.5}>
          <TextField
            fullWidth
            label='Lock until'
            type='datetime-local'
            value={unlockDate.format('YYYY-MM-DDTHH:mm')}
            onChange={(e) => handleChangeDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Box>
        <Box className='flex flex-wrap items-center flex-wrap' mt={1}>
          <Box
            className={`durationWrapper${
              selectedExtendDate === '3M' ? ' selectedDurationWrapper' : ''
            }`}
            onClick={() => addMonths(3)}
          >
            <small>3M</small>
          </Box>
          <Box
            className={`durationWrapper${
              selectedExtendDate === '6M' ? ' selectedDurationWrapper' : ''
            }`}
            onClick={() => addMonths(6)}
            ml={1}
          >
            <small>6M</small>
          </Box>
          <Box
            className={`durationWrapper${
              selectedExtendDate === '9M' ? ' selectedDurationWrapper' : ''
            }`}
            onClick={() => addMonths(9)}
            ml={1}
          >
            <small>9M</small>
          </Box>
          <Box
            className={`durationWrapper${
              selectedExtendDate === '1Y' ? ' selectedDurationWrapper' : ''
            }`}
            onClick={() => addYears(1)}
            ml={1}
          >
            <small>1Y</small>
          </Box>
          <Box
            className={`durationWrapper${
              selectedExtendDate === '2Y' ? ' selectedDurationWrapper' : ''
            }`}
            onClick={() => addYears(2)}
            ml={1}
          >
            <small>2Y</small>
          </Box>
          <Box
            className={`durationWrapper${
              selectedExtendDate === '5Y' ? ' selectedDurationWrapper' : ''
            }`}
            onClick={() => addYears(5)}
            ml={1}
          >
            <small>5Y</small>
          </Box>
        </Box>
      </Box>
      {errorMsg && (
        <Box my={2} className='border-error text-center' borderRadius={8} p={1}>
          <p className='text-error'>{errorMsg}</p>
        </Box>
      )}
      <Box className='swapButtonWrapper'>
        <Button
          fullWidth
          disabled={
            approving ||
            approval !== ApprovalState.NOT_APPROVED ||
            isLoadingFeeData ||
            !!errorMsg
          }
          onClick={onAttemptToApprove}
        >
          {approving ? 'Approving...' : 'Approve'}
        </Button>
      </Box>
      <Box mt={2} className='swapButtonWrapper'>
        <Button
          fullWidth
          disabled={
            approval !== ApprovalState.APPROVED ||
            isLoadingFeeData ||
            !!errorMsg
          }
          onClick={() => {
            setLockErrorMessage('');
            setShowConfirm(true);
          }}
        >
          Lock Liquidity
        </Button>
      </Box>
    </Box>
  );
};

export default LockV3Liquidity;
