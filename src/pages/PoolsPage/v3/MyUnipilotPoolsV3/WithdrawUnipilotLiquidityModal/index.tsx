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
import '../UnipilotLPItemDetails/index.scss';
import { calculateGasMargin, formatNumber } from 'utils';
import { useActiveWeb3React } from 'hooks';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { JSBI } from '@uniswap/sdk';
import { formatUnits } from 'ethers/lib/utils';
import { useUniPilotVaultContract } from 'hooks/useContract';
import { UnipilotPosition } from 'hooks/v3/useV3Positions';
import { TransactionType } from 'models/enums';

interface WithdrawUnipilotLiquidityModalProps {
  open: boolean;
  onClose: () => void;
  position: UnipilotPosition;
}

export default function WithdrawUnipilotLiquidityModal({
  position,
  open,
  onClose,
}: WithdrawUnipilotLiquidityModalProps) {
  const { t } = useTranslation();
  const [percent, setPercent] = useState(0);
  const { account } = useActiveWeb3React();
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

  const uniPilotVaultContract = useUniPilotVaultContract(position.id);
  const lpBalance = JSBI.BigInt(position?.lpBalance ?? '0');
  const totalBalance = JSBI.BigInt(position?.balance ?? '0');

  const withdrawGammaLiquidity = async () => {
    if (!account || !uniPilotVaultContract) return;
    setAttemptingTxn(true);
    const withdrawAmount = JSBI.divide(
      JSBI.multiply(lpBalance, JSBI.BigInt(percent)),
      JSBI.BigInt(100),
    );
    try {
      const estimatedGas = await uniPilotVaultContract.estimateGas.withdraw(
        withdrawAmount.toString(),
        account,
        true,
      );
      const response: TransactionResponse = await uniPilotVaultContract.withdraw(
        withdrawAmount.toString(),
        account,
        true,
        { gasLimit: calculateGasMargin(estimatedGas) },
      );
      setAttemptingTxn(false);
      setTxPending(true);
      setTxnHash(response.hash);
      addTransaction(response, {
        summary: t('withdrawingUnipilotLiquidity'),
        type: TransactionType.WITHDRAW_LIQUIDITY,
      });
      const receipt = await response.wait();
      finalizedTransaction(receipt, {
        summary: t('withdrewUnipilotLiquidity'),
      });
      setTxPending(false);
    } catch (e) {
      setAttemptingTxn(false);
      setRemoveErrorMessage(t('errorInTx'));
    }
  };

  const totalBalanceNum = Number(formatUnits(totalBalance.toString()));
  const lpBalanceNum = Number(formatUnits(lpBalance.toString()));
  const token0Balance = useMemo(() => {
    if (!position?.token0Balance || !totalBalanceNum) return 0;
    return (
      (Number(
        formatUnits(
          position.token0Balance.toString(),
          position.token0?.decimals,
        ),
      ) /
        totalBalanceNum) *
      lpBalanceNum
    );
  }, [lpBalanceNum, position, totalBalanceNum]);

  const token1Balance = useMemo(() => {
    if (!position.token1Balance || !totalBalanceNum) return 0;
    return (
      (Number(
        formatUnits(
          position.token1Balance.toString(),
          position.token1?.decimals,
        ),
      ) /
        totalBalanceNum) *
      lpBalanceNum
    );
  }, [lpBalanceNum, position, totalBalanceNum]);

  const token0Amount = useMemo(() => {
    if (!token0Balance) return 0;

    return (token0Balance * percent) / 100;
  }, [percent, token0Balance]);

  const token1Amount = useMemo(() => {
    if (!token1Balance) return 0;

    return (token1Balance * percent) / 100;
  }, [percent, token1Balance]);

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
            className='gamma-liquidity-item-button'
            onClick={withdrawGammaLiquidity}
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
        <Box mt={2} className='bg-secondary1' borderRadius={10} p={2}>
          <Box className='flex justify-between'>
            <p>
              {t('pooled')} {position.token0?.symbol}
            </p>
            <Box className='flex items-center'>
              <p>{formatNumber(token0Balance)}</p>
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
              <p>{formatNumber(token1Balance)}</p>
              <Box className='flex' ml={1}>
                <CurrencyLogo size='24px' currency={position.token1} />
              </Box>
            </Box>
          </Box>
        </Box>
        <Box mt={2}>
          <Button
            className='gamma-liquidity-item-button'
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
