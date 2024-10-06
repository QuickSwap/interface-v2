import React, { useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { TransactionResponse } from '@ethersproject/providers';
import { CustomModal, ColoredSlider, NumericalInput } from 'components';
import { useDerivedLairInfo } from 'state/stake/hooks';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import { useCurrencyBalance, useTokenBalance } from 'state/wallet/hooks';
import { useActiveWeb3React } from 'hooks';
import { useApproveCallback, ApprovalState } from 'hooks/useApproveCallback';
import { useLairContract, useNewLairContract } from 'hooks/useContract';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { calculateGasMargin, formatTokenAmount } from 'utils';
import 'components/styles/StakeModal.scss';
import { useTranslation } from 'react-i18next';
import { DLQUICK, OLD_QUICK } from 'constants/v3/addresses';
import { ChainId } from '@uniswap/sdk';
import { TransactionType } from 'models/enums';

interface StakeQuickModalProps {
  open: boolean;
  onClose: () => void;
  isNew?: boolean;
}

const StakeQuickModal: React.FC<StakeQuickModalProps> = ({
  open,
  onClose,
  isNew,
}) => {
  const { t } = useTranslation();
  const [attempting, setAttempting] = useState(false);
  const { account, chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();
  const quickToken = isNew ? DLQUICK[chainIdToUse] : OLD_QUICK[chainIdToUse];
  const quickBalance = useCurrencyBalance(account ?? undefined, quickToken);
  const userLiquidityUnstaked = useTokenBalance(
    account ?? undefined,
    quickToken,
  );

  const [typedValue, setTypedValue] = useState('');
  const [stakePercent, setStakePercent] = useState(0);
  const [approving, setApproving] = useState(false);
  const { parsedAmount, error } = useDerivedLairInfo(
    typedValue,
    quickToken,
    userLiquidityUnstaked,
  );

  const lairContract = useLairContract();
  const newLairContract = useNewLairContract();
  const lairContractToUse = isNew ? newLairContract : lairContract;
  const [approval, approveCallback] = useApproveCallback(
    parsedAmount,
    lairContractToUse?.address,
  );

  const onAttemptToApprove = async () => {
    if (!lairContractToUse) throw new Error(t('missingdependencies'));
    const liquidityAmount = parsedAmount;
    if (!liquidityAmount) throw new Error(t('missingliquidity'));
    return approveCallback();
  };

  const onStake = async () => {
    setAttempting(true);
    if (lairContractToUse && parsedAmount) {
      if (approval === ApprovalState.APPROVED) {
        try {
          const estimatedGas = await lairContractToUse.estimateGas.enter(
            `0x${parsedAmount.raw.toString(16)}`,
          );
          const response: TransactionResponse = await lairContractToUse.enter(
            `0x${parsedAmount.raw.toString(16)}`,
            {
              gasLimit: calculateGasMargin(estimatedGas),
            },
          );
          addTransaction(response, {
            summary: `${t('stake')} ${quickToken?.symbol}`,
            type: TransactionType.STAKE,
          });
          const receipt = await response.wait();
          finalizedTransaction(receipt, {
            summary: `${t('stake')} ${quickToken?.symbol}`,
          });
          setAttempting(false);
          setStakePercent(0);
          setTypedValue('');
        } catch (err) {
          setAttempting(false);
        }
      } else {
        setAttempting(false);
        throw new Error(t('stakewithoutapproval'));
      }
    }
  };

  return (
    <CustomModal open={open} onClose={onClose}>
      <Box paddingX={3} paddingY={4}>
        <Box className='flex items-center justify-between'>
          <h5>
            {t('stake')} {quickToken?.symbol}
          </h5>
          <CloseIcon className='cursor-pointer' onClick={onClose} />
        </Box>
        <Box
          mt={3}
          className='bg-default border-gray14'
          borderRadius='10px'
          padding='16px'
        >
          <Box className='flex items-center justify-between'>
            <small>{quickToken?.symbol}</small>
            <small>
              {t('balance')}: {formatTokenAmount(quickBalance)}
            </small>
          </Box>
          <Box mt={2} className='flex items-center'>
            <NumericalInput
              placeholder='0'
              value={typedValue}
              fontSize={28}
              onUserInput={(value) => {
                const totalBalance = quickBalance
                  ? Number(quickBalance.toExact())
                  : 0;
                setTypedValue(value);
                setStakePercent(
                  totalBalance > 0 ? (Number(value) / totalBalance) * 100 : 0,
                );
              }}
            />
            <span
              className='text-primary text-bold cursor-pointer'
              onClick={() => {
                setTypedValue(quickBalance ? quickBalance.toExact() : '0');
                setStakePercent(100);
              }}
            >
              {t('max')}
            </span>
          </Box>
          <Box className='flex items-center'>
            <Box flex={1} mr={2} mt={0.5}>
              <ColoredSlider
                min={1}
                max={100}
                step={1}
                value={stakePercent}
                handleChange={(evt: any, value) => {
                  setStakePercent(value as number);
                  setTypedValue(
                    quickBalance
                      ? stakePercent < 100
                        ? (
                            (Number(quickBalance.toExact()) * stakePercent) /
                            100
                          ).toString()
                        : quickBalance.toExact()
                      : '0',
                  );
                }}
              />
            </Box>
            <small>{Math.min(stakePercent, 100).toLocaleString('us')}%</small>
          </Box>
        </Box>
        <Box mt={3} className='flex items-center justify-between'>
          <Box width='48%'>
            <Button
              className='stakeButton'
              disabled={approving || approval !== ApprovalState.NOT_APPROVED}
              onClick={async () => {
                setApproving(true);
                try {
                  await onAttemptToApprove();
                  setApproving(false);
                } catch (e) {
                  setApproving(false);
                }
              }}
            >
              {approving ? `${t('approving')}...` : t('approve')}
            </Button>
          </Box>
          <Box width='48%'>
            <Button
              className='stakeButton'
              disabled={
                !!error || attempting || approval !== ApprovalState.APPROVED
              }
              onClick={onStake}
            >
              {attempting ? `${t('staking')}...` : t('stake')}
            </Button>
          </Box>
        </Box>
      </Box>
    </CustomModal>
  );
};

export default StakeQuickModal;
