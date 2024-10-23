import React, { useCallback, useMemo, useState } from 'react';
import {
  ColoredSlider,
  ConfirmationModalContent,
  CurrencyLogo,
  CustomModal,
  DoubleCurrencyLogo,
  TransactionConfirmationModal,
  TransactionErrorContent,
} from 'components';
import { Box, Button } from '@material-ui/core';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import { useTranslation } from 'react-i18next';
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler';
import './SteerLPItemDetails/index.scss';
import { calculateGasMargin, formatNumber } from 'utils';
import { useActiveWeb3React } from 'hooks';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { JSBI } from '@uniswap/sdk';
import { useSteerVaultContract } from 'hooks/useContract';
import { SteerVault } from 'hooks/v3/useSteerData';
import { useTokenBalance } from 'state/wallet/v3/hooks';
import { Token } from '@uniswap/sdk-core';
import { TransactionType } from 'models/enums';

interface WithdrawSteerLiquidityModalProps {
  open: boolean;
  onClose: () => void;
  position: SteerVault;
}

export default function WithdrawSteerLiquidityModal({
  position,
  open,
  onClose,
}: WithdrawSteerLiquidityModalProps) {
  const { t } = useTranslation();
  const [percent, setPercent] = useState(0);
  const { chainId, account } = useActiveWeb3React();
  const [
    percentForSlider,
    onPercentSelectForSlider,
  ] = useDebouncedChangeHandler(percent, setPercent);

  const [showConfirm, setShowConfirm] = useState(false);
  const [attemptingTxn, setAttemptingTxn] = useState(false);
  const [txnHash, setTxnHash] = useState<string | undefined>();
  const [removeErrorMessage, setRemoveErrorMessage] = useState('');
  const [txPending, setTxPending] = useState(false);
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();
  const vaultContract = useSteerVaultContract(position.address);

  const buttonDisabled = !percent || !account;
  const buttonText = useMemo(() => {
    if (!account) return t('connectWallet');
    if (!percent) return t('enterAmount');
    return t('withdraw');
  }, [t, percent, account]);

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    if (txnHash) {
      onPercentSelectForSlider(0);
    }
    setAttemptingTxn(false);
    setTxnHash('');
    setTxPending(false);
    setRemoveErrorMessage('');
  }, [onPercentSelectForSlider, txnHash]);

  const lpToken = new Token(
    chainId,
    position.address,
    position.vaultDecimals,
    position.vaultSymbol,
    position.vaultName,
  );
  const lpBalance = useTokenBalance(account, lpToken);
  const withdrawSteerLiquidity = async () => {
    if (!account || !vaultContract || !lpBalance) return;
    setAttemptingTxn(true);
    const withdrawAmount = JSBI.divide(
      JSBI.multiply(lpBalance.numerator, JSBI.BigInt(percent)),
      JSBI.BigInt(100),
    );
    try {
      const estimatedGas = await vaultContract.estimateGas.withdraw(
        withdrawAmount.toString(),
        0,
        0,
        account,
      );
      const response: TransactionResponse = await vaultContract.withdraw(
        withdrawAmount.toString(),
        0,
        0,
        account,
        { gasLimit: calculateGasMargin(estimatedGas) },
      );
      setAttemptingTxn(false);
      setTxPending(true);
      setTxnHash(response.hash);
      addTransaction(response, {
        summary: t('withdrawingSteerLiquidity'),
        type: TransactionType.WITHDRAW_LIQUIDITY,
      });
      const receipt = await response.wait();
      finalizedTransaction(receipt, {
        summary: t('withdrewSteerLiquidity'),
      });
      setTxPending(false);
    } catch (e) {
      setAttemptingTxn(false);
      setRemoveErrorMessage(t('errorInTx'));
    }
  };

  const token0BalanceWallet = useMemo(() => {
    if (!position.token0BalanceWallet || !position.totalBalance) return 0;
    return (
      (position.token0BalanceWallet / position.totalBalance) *
      Number(lpBalance?.toExact() ?? 0)
    );
  }, [lpBalance, position]);

  const token1BalanceWallet = useMemo(() => {
    if (!position.token1BalanceWallet || !position.totalBalance) return 0;
    return (
      (position.token1BalanceWallet / position.totalBalance) *
      Number(lpBalance?.toExact() ?? 0)
    );
  }, [lpBalance, position]);

  const token0Amount = useMemo(() => {
    if (!token0BalanceWallet) return 0;
    return (token0BalanceWallet * percent) / 100;
  }, [percent, token0BalanceWallet]);

  const token1Amount = useMemo(() => {
    if (!token1BalanceWallet) return 0;
    return (token1BalanceWallet * percent) / 100;
  }, [percent, token1BalanceWallet]);

  const pendingText = t('removingLiquidityMsg', {
    amount1: formatNumber(token0Amount),
    symbol1: position.token0?.symbol,
    amount2: formatNumber(token1Amount),
    symbol2: position.token1?.symbol,
  });

  function modalHeader() {
    return (
      <Box>
        <Box mt={3} className='flex justify-between'>
          <p>
            {t('pooled')} {position.token0?.symbol}
          </p>
          <Box className='flex items-center'>
            <p>{formatNumber(token0Amount)}</p>
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
            <p>{formatNumber(token1Amount)}</p>
            <Box className='flex' ml={1}>
              <CurrencyLogo size='24px' currency={position.token1} />
            </Box>
          </Box>
        </Box>

        <Box mt={2}>
          <Button
            fullWidth
            className='steer-liquidity-item-button'
            onClick={withdrawSteerLiquidity}
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
            removeErrorMessage ? (
              <TransactionErrorContent
                onDismiss={handleDismissConfirmation}
                message={removeErrorMessage}
              />
            ) : (
              <ConfirmationModalContent
                title={t('removingLiquidity')}
                onDismiss={handleDismissConfirmation}
                content={modalHeader}
              />
            )
          }
          pendingText={pendingText}
          modalContent={
            txPending
              ? t('submittedTxRemoveLiquidity')
              : t('successRemovedLiquidity')
          }
        />
      )}
      <Box padding={3}>
        <Box className='flex justify-between'>
          <p className='weight-600'>{t('removeLiquidity')}</p>
          <CloseIcon className='cursor-pointer' onClick={onClose} />
        </Box>
        <Box mt={3} className='flex items-center'>
          <Box className='flex' mr={1}>
            <DoubleCurrencyLogo
              currency0={position.token0}
              currency1={position.token1}
              size={32}
            />
          </Box>
          <h5>
            {position.token0?.symbol}-{position.token1?.symbol}
          </h5>
        </Box>
        <Box mt={2} className='v3-remove-liquidity-input-wrapper'>
          <Box mb={2} className='flex justify-between'>
            <small className='text-secondary'>{t('amount')}</small>
          </Box>
          <Box mb={2} className='flex items-center justify-between'>
            <h3>{percentForSlider}%</h3>
            <Box ml={1} className='v3-remove-liquidity-percent-buttons'>
              <Button onClick={() => onPercentSelectForSlider(25)}>25%</Button>
              <Button onClick={() => onPercentSelectForSlider(50)}>50%</Button>
              <Button onClick={() => onPercentSelectForSlider(75)}>75%</Button>
              <Button onClick={() => onPercentSelectForSlider(100)}>
                100%
              </Button>
            </Box>
          </Box>
          <ColoredSlider
            min={0}
            max={100}
            step={1}
            value={percentForSlider}
            handleChange={(event, value) => {
              onPercentSelectForSlider(value as number);
            }}
          />
        </Box>
        <Box mt={2} className='bg-secondary1' borderRadius='10px' p={2}>
          <Box className='flex justify-between'>
            <p>
              {t('pooled')} {position.token0?.symbol}
            </p>
            <Box className='flex items-center'>
              <p>{formatNumber(token0BalanceWallet)}</p>
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
              <p>{formatNumber(token1BalanceWallet)}</p>
              <Box className='flex' ml={1}>
                <CurrencyLogo size='24px' currency={position.token1} />
              </Box>
            </Box>
          </Box>
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
