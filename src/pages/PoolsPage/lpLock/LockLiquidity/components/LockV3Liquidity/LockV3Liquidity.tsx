import React, { useCallback, useEffect, useState } from 'react';
import {
  TransactionErrorContent,
  TransactionConfirmationModal,
  ConfirmationModalContent,
} from 'components';
import { useTranslation } from 'react-i18next';
import {
  ChainId,
} from '@uniswap/sdk';
import { ethers } from 'ethers';
import { V2_FACTORY_ADDRESSES } from 'constants/lockers';
import { useActiveWeb3React } from 'hooks';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@material-ui/core';
import { ApprovalState, useApproveCallbackTokenId} from 'hooks/useApproveCallback';
import { useUniV3Positions, useV3Positions } from 'hooks/v3/useV3Positions';
import { useTokenLockerContract } from 'hooks/useContract';
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from 'constants/v3/addresses';
import { calculateGasMargin } from 'utils';

const defaultDate = '2024-12-24T10:30'
/* dayjs.extend(duration) */

const LockV3Liquidity: React.FC = () => {
  const { t } = useTranslation();
  const { account, chainId, library } = useActiveWeb3React();
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;

  // inputs
  const [unlockDate, setUnlockDate] = useState(new Date(defaultDate))
  const [tokenId, setTokenId] = useState('');
  const [amount, setAmount] = useState('')
  const [removeErrorMessage, setRemoveErrorMessage] = useState('');
  const [feesInEth, setFeesInEth] = useState(ethers.BigNumber.from(0));
  const [errorMsg, setErrorMsg] = useState('');

  const [showConfirm, setShowConfirm] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [txPending, setTxPending] = useState(false);
  const [approving, setApproving] = useState(false);
  const [attemptingTxn, setAttemptingTxn] = useState(false);

  const {
    positions: algebraPositions,
    loading: algebraPositionsLoading,
  } = useV3Positions(account);
  const {
    positions: uniV3Positions,
    loading: uniV3PositionsLoading,
  } = useUniV3Positions(account);
  const positionsLoading = algebraPositionsLoading || uniV3PositionsLoading;
  const positions = (algebraPositions ?? []).concat(uniV3Positions ?? []);
  const tokenLockerContract = useTokenLockerContract(chainId);
  const nftPosManContractAddress = NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId];
 
  const [approval, approveCallback] = useApproveCallbackTokenId(
    tokenId != '' ? tokenId : undefined,
    chainId ? V2_FACTORY_ADDRESSES[chainId] : undefined
  );

  const handleChange = (e: any) => {
      setTokenId(e.target.value);
  };

  const handleChangeDate = (e: string) => {
    setUnlockDate(new Date(e));
  };

  useEffect(()=> {
    async function getFeesInEth (address: string) {
      setFeesInEth(await tokenLockerContract?.getFeesInETH(address))
    }
    if (nftPosManContractAddress) {
      getFeesInEth(nftPosManContractAddress)
    }
  }, [nftPosManContractAddress])

  // @Hassaan: Implement approval logic here
  const onAttemptToApprove = async () => {
    console.log('On attempt to approves')
    await approveCallback();
  };

  // @Hassaan: Implement lock logic here
  const onLock = async () => {
    console.log('On attempt to lock')
    if (!nftPosManContractAddress || !library || !tokenLockerContract || !tokenId || tokenId == '') {
      setErrorMsg(t('missingdependencies'));
      throw new Error(t('missingdependencies'));
    }
    console.log('nftPosManContractAddress', nftPosManContractAddress)
    console.log('account', account)
    console.log('unlockDate.getTime() / 1000', unlockDate.getTime() / 1000)
    console.log('', )
    console.log('', )

    const gasEstimate = await tokenLockerContract?.estimateGas.lockNFT(
      nftPosManContractAddress,
      account,
      1,
      unlockDate.getTime() / 1000,
      tokenId,
      false,
      ethers.constants.AddressZero, {
        value: feesInEth,
      }
    )
    const gasEstimateWithMargin = calculateGasMargin(gasEstimate);
    const response = await tokenLockerContract?.lockNFT(
      nftPosManContractAddress,
      account,
      1,
      unlockDate.getTime() / 1000,
      tokenId,
      false,
      ethers.constants.AddressZero, {
        value: feesInEth,
        gasLimit: gasEstimateWithMargin
      }
    )
    console.log(response, 'response after lock')
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
            removeErrorMessage ? (
              <TransactionErrorContent
                onDismiss={handleDismissConfirmation}
                message={removeErrorMessage}
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
          modalContent={
            txPending
              ? 'Submitting'
              : 'Success'
          }
        />
      )}
      <Box p={2} className='bg-secondary2 rounded-md'>
        <Box>
          <FormControl fullWidth variant="outlined">
            <InputLabel>V3 LP Token</InputLabel>
            <Select
              disabled={positionsLoading}
              value={tokenId}
              onChange={handleChange}
              label="LP Token"
              renderValue={(value) => `TokenId: ${value}`}
            >
              <MenuItem value=''>
                <em>None</em>
              </MenuItem>
              {positions.map((position) => (
                <MenuItem key={position.tokenId.toString()} value={position.tokenId.toString()}>{position.tokenId.toString()}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box mt={2.5}>
          <TextField
            fullWidth
            label="Lock until"
            type="datetime-local"
            defaultValue={defaultDate}
            onChange={(e)=> handleChangeDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Box>
        {/* <Box mt={2.5}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker value={value} onChange={(e)=> setValue(e)} />
          </LocalizationProvider>
        </Box> */}
      </Box>
      <Box className='swapButtonWrapper'>
        <Button
          fullWidth
          disabled={approving || approval !== ApprovalState.NOT_APPROVED }
          onClick={onAttemptToApprove}
        >
          {approving ? 'Approving...' : 'Approve'}
        </Button>
      </Box>
      <Box mt={2} className='swapButtonWrapper'>
        <Button
          fullWidth
          // @Hassaan: disable button if not approved
           disabled={approval !== ApprovalState.APPROVED} 
          onClick={() => {
            setRemoveErrorMessage('');
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
