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
import '../GammaLPItemDetails/index.scss';
import { calculateGasMargin, formatNumber } from 'utils';
import { BigNumber } from 'ethers';
import GammaHyperVisorABI from 'constants/abis/gamma-hypervisor.json';
import { useContract } from 'hooks/useContract';
import { useActiveWeb3React } from 'hooks';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { JSBI, Token } from '@uniswap/sdk';
import { useTokenBalance } from 'state/wallet/hooks';

interface WithdrawGammaLiquidityModalProps {
  open: boolean;
  onClose: () => void;
  position: any;
}

export default function WithdrawGammaLiquidityModal({
  position,
  open,
  onClose,
}: WithdrawGammaLiquidityModalProps) {
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

  const hyperVisorContract = useContract(
    position.pairAddress,
    GammaHyperVisorABI,
  );

  const lpToken = chainId
    ? new Token(chainId, position.pairAddress, 18)
    : undefined;
  const lpBalance = useTokenBalance(account ?? undefined, lpToken);
  const lpBalanceNumber = lpBalance
    ? Number(lpBalance.numerator.toString())
    : 0;
  const withdrawPercent =
    position && position.shares > 0 ? lpBalanceNumber / position.shares : 0;

  const buttonDisabled = !percent || !hyperVisorContract || !account;
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

  const withdrawGammaLiquidity = async () => {
    if (!hyperVisorContract || !account || !lpBalance) return;
    setAttemptingTxn(true);
    const withdrawAmount = BigNumber.from(lpBalance.numerator.toString())
      .mul(BigNumber.from(percent))
      .div(BigNumber.from(100));

    try {
      const estimatedGas = await hyperVisorContract.estimateGas.withdraw(
        withdrawAmount,
        account,
        account,
        [0, 0, 0, 0],
      );
      const response: TransactionResponse = await hyperVisorContract.withdraw(
        withdrawAmount,
        account,
        account,
        [0, 0, 0, 0],
        { gasLimit: calculateGasMargin(estimatedGas) },
      );
      setAttemptingTxn(false);
      setTxPending(true);
      setTxnHash(response.hash);
      addTransaction(response, {
        summary: t('withdrawingGammaLiquidity'),
      });
      const receipt = await response.wait();
      finalizedTransaction(receipt, {
        summary: t('withdrewGammaLiquidity'),
      });
      setTxPending(false);
    } catch (e) {
      setAttemptingTxn(false);
      setRemoveErrorMessage(t('errorInTx'));
    }
  };

  const pendingText = t('removingLiquidityMsg', {
    amount1: formatNumber(
      (position.balance0 * withdrawPercent * percent) / 100,
    ),
    symbol1: position.token0.symbol,
    amount2: formatNumber(
      (position.balance1 * withdrawPercent * percent) / 100,
    ),
    symbol2: position.token1.symbol,
  });

  function modalHeader() {
    return (
      <Box>
        <Box mt={3} className='flex justify-between'>
          <p>
            {t('pooled')} {position.token0.symbol}
          </p>
          <Box className='flex items-center'>
            <p>
              {formatNumber(
                (position.balance0 * withdrawPercent * percent) / 100,
              )}
            </p>
            <Box className='flex' ml={1}>
              <CurrencyLogo size='24px' currency={position.token0} />
            </Box>
          </Box>
        </Box>
        <Box mt={2} className='flex justify-between'>
          <p>
            {t('pooled')} {position.token1.symbol}
          </p>
          <Box className='flex items-center'>
            <p>
              {formatNumber(
                (position.balance1 * withdrawPercent * percent) / 100,
              )}
            </p>
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
            {position.token0.symbol}-{position.token1.symbol}
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
              {t('pooled')} {position.token0.symbol}
            </p>
            <Box className='flex items-center'>
              <p>{formatNumber(position.balance0 * withdrawPercent)}</p>
              <Box className='flex' ml={1}>
                <CurrencyLogo size='24px' currency={position.token0} />
              </Box>
            </Box>
          </Box>
          <Box mt={2} className='flex justify-between'>
            <p>
              {t('pooled')} {position.token1.symbol}
            </p>
            <Box className='flex items-center'>
              <p>{formatNumber(position.balance1 * withdrawPercent)}</p>
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
