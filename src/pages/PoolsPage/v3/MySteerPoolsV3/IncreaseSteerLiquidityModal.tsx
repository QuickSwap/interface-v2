import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ConfirmationModalContent,
  CurrencyLogo,
  CustomModal,
  TransactionConfirmationModal,
  TransactionErrorContent,
} from 'components';
import { Box, Button } from '@material-ui/core';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import { useTranslation } from 'react-i18next';
import { calculateGasMargin, formatNumber, getSteerRatio } from 'utils';
import { useActiveWeb3React } from 'hooks';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import CurrencyInputPanel from 'components/v3/CurrencyInputPanel';
import './SteerLPItemDetails/index.scss';
import { useTokenBalance } from 'state/wallet/v3/hooks';
import { JSBI } from '@uniswap/sdk';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useSteerPeripheryContract } from 'hooks/useContract';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { SteerVault } from 'hooks/v3/useSteerData';
import { WrappedCurrency } from 'models/types';

interface IncreaseSteerLiquidityModalProps {
  open: boolean;
  onClose: () => void;
  position: SteerVault;
}

export default function IncreaseSteerLiquidityModal({
  position,
  open,
  onClose,
}: IncreaseSteerLiquidityModalProps) {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();
  const [isBaseInput, setIsBaseInput] = useState(true);
  const [deposit0, setDeposit0] = useState('');
  const [deposit1, setDeposit1] = useState('');

  const steerPeripheryContract = useSteerPeripheryContract();

  const dependentToken = isBaseInput ? position.token1 : position.token0;
  const independentDeposit = isBaseInput ? deposit0 : deposit1;

  const token0Balance = useTokenBalance(account ?? undefined, position.token0);
  const token1Balance = useTokenBalance(account ?? undefined, position.token1);

  const token0BalanceJSBI = token0Balance
    ? token0Balance.numerator
    : JSBI.BigInt('0');
  const token1BalanceJSBI = token1Balance
    ? token1Balance.numerator
    : JSBI.BigInt('0');

  const deposit0JSBI = JSBI.BigInt(
    parseUnits(
      !deposit0 ? '0' : Number(deposit0).toFixed(position.token0?.decimals),
      position.token0?.decimals,
    ),
  );
  const deposit1JSBI = JSBI.BigInt(
    parseUnits(
      !deposit1 ? '0' : Number(deposit1).toFixed(position.token1?.decimals),
      position.token1?.decimals,
    ),
  );

  const [showConfirm, setShowConfirm] = useState(false);
  const [attemptingTxn, setAttemptingTxn] = useState(false);
  const [txnHash, setTxnHash] = useState<string | undefined>();
  const [addErrorMessage, setAddErrorMessage] = useState('');
  const [txPending, setTxPending] = useState(false);
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();

  const buttonDisabled =
    !Number(deposit0) ||
    !Number(deposit1) ||
    !account ||
    JSBI.greaterThan(deposit0JSBI, token0BalanceJSBI) ||
    JSBI.greaterThan(deposit1JSBI, token1BalanceJSBI);

  const buttonText = useMemo(() => {
    if (!account) return t('connectWallet');
    if (JSBI.greaterThan(deposit0JSBI, token0BalanceJSBI))
      return t('insufficientBalance', {
        symbol: position.token0?.symbol,
      });
    if (JSBI.greaterThan(deposit1JSBI, token1BalanceJSBI))
      return t('insufficientBalance', {
        symbol: position.token1?.symbol,
      });
    if (!Number(deposit0) || !Number(deposit1)) return t('enterAmount');
    return t('addLiquidity');
  }, [
    account,
    t,
    deposit0JSBI,
    token0BalanceJSBI,
    position.token0?.symbol,
    position.token1?.symbol,
    deposit1JSBI,
    token1BalanceJSBI,
    deposit0,
    deposit1,
  ]);

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    if (txnHash) {
      setDeposit0('');
      setDeposit1('');
    }
    setAttemptingTxn(false);
    setTxnHash('');
    setTxPending(false);
    setAddErrorMessage('');
  }, [txnHash]);

  const addSteerLiquidity = async () => {
    if (!steerPeripheryContract || !account) return;
    setAttemptingTxn(true);
    try {
      const estimatedGas = await steerPeripheryContract.estimateGas.deposit(
        position.address,
        deposit0JSBI.toString(),
        deposit1JSBI.toString(),
        0,
        0,
        account,
      );
      const response: TransactionResponse = await steerPeripheryContract.deposit(
        position.address,
        deposit0JSBI.toString(),
        deposit1JSBI.toString(),
        0,
        0,
        account,
        {
          gasLimit: calculateGasMargin(estimatedGas),
        },
      );
      const summary = t('addLiquidityWithTokens', {
        symbolA: position.token0?.symbol,
        symbolB: position.token1?.symbol,
      });
      setAttemptingTxn(false);
      setTxPending(true);
      addTransaction(response, {
        summary,
      });
      setTxnHash(response.hash);
      const receipt = await response.wait();
      finalizedTransaction(receipt, {
        summary,
      });
      setTxPending(false);
    } catch (error) {
      console.error('Failed to send transaction', error);
      setAttemptingTxn(false);
      setTxPending(false);
      setAddErrorMessage(
        error?.code === 4001 ? t('txRejected') : t('errorInTx'),
      );
    }
  };

  const tokenType =
    dependentToken &&
    position.token0 &&
    dependentToken.address.toLowerCase() ===
      position.token0.address.toLowerCase()
      ? 0
      : 1;
  const steerRatio = getSteerRatio(tokenType, position);

  useEffect(() => {
    const dependentDeposit = steerRatio * Number(independentDeposit);
    const dependentDepositStr =
      independentDeposit === ''
        ? ''
        : Number(independentDeposit) === 0
        ? '0'
        : dependentDeposit.toFixed(dependentToken?.decimals);
    if (isBaseInput) {
      setDeposit1(dependentDepositStr);
    } else {
      setDeposit0(dependentDepositStr);
    }
  }, [isBaseInput, independentDeposit, steerRatio, dependentToken?.decimals]);

  const pendingText = t('addingLiquidityTokens', {
    amountA: formatNumber(deposit0),
    symbolA: position.token0?.symbol,
    amountB: formatNumber(deposit1),
    symbolB: position.token1?.symbol,
  });

  function modalHeader() {
    return (
      <Box>
        <Box mt={3} className='flex justify-between'>
          <p>{position.token0?.symbol}</p>
          <Box className='flex items-center'>
            <p>{formatNumber(deposit0)}</p>
            <Box className='flex' ml={1}>
              <CurrencyLogo size='24px' currency={position.token0} />
            </Box>
          </Box>
        </Box>
        <Box mt={2} className='flex justify-between'>
          <p>{position.token1?.symbol}</p>
          <Box className='flex items-center'>
            <p>{formatNumber(deposit1)}</p>
            <Box className='flex' ml={1}>
              <CurrencyLogo size='24px' currency={position.token1} />
            </Box>
          </Box>
        </Box>

        <Box mt={2}>
          <Button
            fullWidth
            className='steer-liquidity-item-button'
            onClick={addSteerLiquidity}
          >
            {t('confirm')}
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <CustomModal open={open} onClose={onClose}>
      {showConfirm && (
        <TransactionConfirmationModal
          isOpen={showConfirm}
          onDismiss={handleDismissConfirmation}
          attemptingTxn={attemptingTxn}
          txPending={txPending}
          hash={txnHash}
          content={() =>
            addErrorMessage ? (
              <TransactionErrorContent
                onDismiss={handleDismissConfirmation}
                message={addErrorMessage}
              />
            ) : (
              <ConfirmationModalContent
                title={t('addingLiquidity')}
                onDismiss={handleDismissConfirmation}
                content={modalHeader}
              />
            )
          }
          pendingText={pendingText}
          modalContent={
            txPending ? t('submittedTxLiquidity') : t('successAddedliquidity')
          }
        />
      )}
      <Box padding={3}>
        <Box className='flex justify-between'>
          <p className='weight-600'>{t('addLiquidity')}</p>
          <CloseIcon className='cursor-pointer' onClick={onClose} />
        </Box>
        <Box mt={2} className='bg-secondary1' borderRadius='10px' p={2}>
          <Box className='flex justify-between'>
            <p>
              {t('pooled')} {position.token0?.symbol}
            </p>
            <Box className='flex items-center'>
              <p>{formatNumber(position.token0BalanceWallet)}</p>
              <Box className='flex' ml={1}>
                <CurrencyLogo size='24px' currency={position.token0} />
              </Box>
            </Box>
          </Box>
          <Box mt={2} className='flex justify-between'>
            <p>
              {t('pooled')} {position.token1?.symbol}
            </p>
            <Box className='flex items-center'>
              <p>{formatNumber(position.token1BalanceWallet)}</p>
              <Box className='flex' ml={1}>
                <CurrencyLogo size='24px' currency={position.token1} />
              </Box>
            </Box>
          </Box>
        </Box>
        <Box mt={2}>
          <CurrencyInputPanel
            value={deposit0}
            onUserInput={(val) => {
              setDeposit0(val);
              setIsBaseInput(true);
            }}
            onMax={() => {
              setIsBaseInput(true);
              setDeposit0(
                formatUnits(
                  token0BalanceJSBI.toString(),
                  position.token0?.decimals,
                ),
              );
            }}
            showMaxButton={!JSBI.equal(token0BalanceJSBI, deposit0JSBI)}
            currency={position.token0 as WrappedCurrency}
            id='add-steer-liquidity-input-tokena'
            shallow={true}
            disabled={false}
            swap={false}
          />
        </Box>
        <Box mt={2} className='v3-increase-liquidity-input'>
          <CurrencyInputPanel
            value={deposit1}
            onUserInput={(val) => {
              setDeposit1(val);
              setIsBaseInput(false);
            }}
            onMax={() => {
              setIsBaseInput(false);
              setDeposit1(
                formatUnits(
                  token1BalanceJSBI.toString(),
                  position.token1?.decimals,
                ),
              );
            }}
            showMaxButton={!JSBI.equal(token1BalanceJSBI, deposit1JSBI)}
            currency={position.token1 as WrappedCurrency}
            id='add-steer-liquidity-input-tokenb'
            shallow={true}
            disabled={false}
            swap={false}
          />
        </Box>
        <Box mt={2}>
          <Button
            className='steer-liquidity-item-button'
            disabled={buttonDisabled}
            onClick={() => setShowConfirm(true)}
            fullWidth
          >
            {buttonText}
          </Button>
        </Box>
      </Box>
    </CustomModal>
  );
}