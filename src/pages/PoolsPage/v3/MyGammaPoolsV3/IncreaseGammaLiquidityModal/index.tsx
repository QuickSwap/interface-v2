import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ConfirmationModalContent,
  CurrencyLogo,
  CustomModal,
  TransactionConfirmationModal,
  TransactionErrorContent,
} from 'components';
import { Box, Button } from 'theme/components';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import { useTranslation } from 'react-i18next';
import { calculateGasMargin, formatNumber } from 'utils';
import { useActiveWeb3React } from 'hooks';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import CurrencyInputPanel from 'components/v3/CurrencyInputPanel';
import '../GammaLPItemDetails/index.scss';
import { useTokenBalance } from 'state/wallet/v3/hooks';
import { CurrencyAmount } from '@uniswap/sdk-core';
import { JSBI } from '@uniswap/sdk';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useGammaUNIProxyContract } from 'hooks/useContract';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { useSingleContractMultipleData } from 'state/multicall/hooks';

interface IncreaseGammaLiquidityModalProps {
  open: boolean;
  onClose: () => void;
  position: any;
}

export default function IncreaseGammaLiquidityModal({
  position,
  open,
  onClose,
}: IncreaseGammaLiquidityModalProps) {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();
  const [isBaseInput, setIsBaseInput] = useState(true);
  const gammaUNIPROXYContract = useGammaUNIProxyContract();

  const tokens = [position.token0, position.token1];

  const depositAmountsData = useSingleContractMultipleData(
    gammaUNIPROXYContract,
    'getDepositAmount',
    tokens.map((token) => [
      position.pairAddress,
      token.address,
      parseUnits('1', token.decimals),
    ]),
  );

  const depositRange = useMemo(() => {
    if (depositAmountsData.length < 1) return;
    const baseDepositMin =
      !depositAmountsData[1].loading &&
      depositAmountsData[1].result &&
      depositAmountsData[1].result.length > 1
        ? Number(
            formatUnits(
              depositAmountsData[1].result[0],
              position.token0.decimals,
            ),
          )
        : 0;
    const baseDepositMax =
      !depositAmountsData[1].loading &&
      depositAmountsData[1].result &&
      depositAmountsData[1].result.length > 1
        ? Number(
            formatUnits(
              depositAmountsData[1].result[1],
              position.token0.decimals,
            ),
          )
        : 0;
    const quoteDepositMin =
      !depositAmountsData[0].loading &&
      depositAmountsData[0].result &&
      depositAmountsData[0].result.length > 1
        ? Number(
            formatUnits(
              depositAmountsData[0].result[0],
              position.token1.decimals,
            ),
          )
        : 0;
    const quoteDepositMax =
      !depositAmountsData[0].loading &&
      depositAmountsData[0].result &&
      depositAmountsData[0].result.length > 1
        ? Number(
            formatUnits(
              depositAmountsData[0].result[1],
              position.token1.decimals,
            ),
          )
        : 0;

    return {
      base: { min: baseDepositMin, max: baseDepositMax },
      quote: { min: quoteDepositMin, max: quoteDepositMax },
    };
  }, [depositAmountsData, position.token0.decimals, position.token1.decimals]);

  const [deposit0, setDeposit0] = useState('');
  const [deposit1, setDeposit1] = useState('');
  const token0Balance = useTokenBalance(account ?? undefined, position.token0);
  const token1Balance = useTokenBalance(account ?? undefined, position.token1);
  const deposit0CurrencyAmount = CurrencyAmount.fromRawAmount(
    position.token0,
    JSBI.BigInt(
      parseUnits(!deposit0 ? '0' : deposit0, position.token0.decimals),
    ),
  );
  const deposit1CurrencyAmount = CurrencyAmount.fromRawAmount(
    position.token1,
    JSBI.BigInt(
      parseUnits(!deposit1 ? '0' : deposit1, position.token1.decimals),
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
    !depositRange ||
    !token0Balance ||
    deposit0CurrencyAmount.greaterThan(token0Balance) ||
    !token1Balance ||
    deposit1CurrencyAmount.greaterThan(token1Balance);

  const buttonText = useMemo(() => {
    if (!account) return t('connectWallet');
    if (!depositRange) return t('fetchingGammaDepositRange');
    if (!token0Balance || deposit0CurrencyAmount.greaterThan(token0Balance))
      return t('insufficientBalance', { symbol: position.token0.symbol });
    if (!token1Balance || deposit1CurrencyAmount.greaterThan(token1Balance))
      return t('insufficientBalance', { symbol: position.token1.symbol });
    if (!Number(deposit0) || !Number(deposit1)) return t('enterAmount');
    return t('addLiquidity');
  }, [
    account,
    t,
    depositRange,
    token0Balance,
    deposit0CurrencyAmount,
    position.token0.symbol,
    position.token1.symbol,
    token1Balance,
    deposit1CurrencyAmount,
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

  const addGammaLiquidity = async () => {
    if (!gammaUNIPROXYContract || !account) return;
    setAttemptingTxn(true);
    try {
      const estimatedGas = await gammaUNIPROXYContract.estimateGas.deposit(
        deposit0CurrencyAmount.numerator.toString(),
        deposit1CurrencyAmount.numerator.toString(),
        account,
        position.pairAddress,
        [0, 0, 0, 0],
      );
      const response: TransactionResponse = await gammaUNIPROXYContract.deposit(
        deposit0CurrencyAmount.numerator.toString(),
        deposit1CurrencyAmount.numerator.toString(),
        account,
        position.pairAddress,
        [0, 0, 0, 0],
        {
          gasLimit: calculateGasMargin(estimatedGas),
        },
      );
      const summary = t('addLiquidityWithTokens', {
        symbolA: position.token0.symbol,
        symbolB: position.token1.symbol,
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

  useEffect(() => {
    if (depositRange) {
      if (isBaseInput) {
        if (Number(deposit0) > 0) {
          const quoteDeposit =
            ((depositRange.quote.min + depositRange.quote.max) / 2) *
            Number(deposit0);
          setDeposit1(quoteDeposit.toFixed(position.token1.decimals));
        } else {
          setDeposit1('');
        }
      } else {
        if (Number(deposit1) > 0) {
          const baseDeposit =
            ((depositRange.base.min + depositRange.base.max) / 2) *
            Number(deposit1);
          setDeposit0(baseDeposit.toFixed(position.token0.decimals));
        } else {
          setDeposit0('');
        }
      }
    }
  }, [
    depositRange,
    deposit0,
    deposit1,
    isBaseInput,
    position.token1.decimals,
    position.token0.decimals,
  ]);

  const pendingText = t('addingLiquidityTokens', {
    amountA: formatNumber(deposit0),
    symbolA: position.token0.symbol,
    amountB: formatNumber(deposit1),
    symbolB: position.token1.symbol,
  });

  function modalHeader() {
    return (
      <Box>
        <Box margin='24px 0 0' className='flex justify-between'>
          <p>{position.token0.symbol}</p>
          <Box className='flex items-center'>
            <p>{formatNumber(deposit0)}</p>
            <Box className='flex' margin='0 0 0 8px'>
              <CurrencyLogo size='24px' currency={position.token0} />
            </Box>
          </Box>
        </Box>
        <Box margin='16px 0 0' className='flex justify-between'>
          <p>{position.token1.symbol}</p>
          <Box className='flex items-center'>
            <p>{formatNumber(deposit1)}</p>
            <Box className='flex' margin='0 0 0 8px'>
              <CurrencyLogo size='24px' currency={position.token1} />
            </Box>
          </Box>
        </Box>

        <Box margin='16px 0 0'>
          <Button
            width='100%'
            className='gamma-liquidity-item-button'
            onClick={addGammaLiquidity}
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
      <Box padding='24px'>
        <Box className='flex justify-between'>
          <p className='weight-600'>{t('addLiquidity')}</p>
          <CloseIcon className='cursor-pointer' onClick={onClose} />
        </Box>
        <Box
          margin='16px 0 0'
          className='bg-secondary1'
          borderRadius='10px'
          padding='16px'
        >
          <Box className='flex justify-between'>
            <p>
              {t('pooled')} {position.token0.symbol}
            </p>
            <Box className='flex items-center'>
              <p>{formatNumber(position.balance0)}</p>
              <Box className='flex' margin='0 0 0 8px'>
                <CurrencyLogo size='24px' currency={position.token0} />
              </Box>
            </Box>
          </Box>
          <Box margin='16px 0 0' className='flex justify-between'>
            <p>
              {t('pooled')} {position.token1.symbol}
            </p>
            <Box className='flex items-center'>
              <p>{formatNumber(position.balance1)}</p>
              <Box className='flex' margin='0 0 0 8px'>
                <CurrencyLogo size='24px' currency={position.token1} />
              </Box>
            </Box>
          </Box>
        </Box>
        <Box margin='16px 0 0'>
          <CurrencyInputPanel
            value={deposit0}
            onUserInput={(val) => {
              setDeposit0(val);
              setIsBaseInput(true);
            }}
            onMax={() => {
              setIsBaseInput(true);
              setDeposit0(token0Balance?.toExact() ?? '');
            }}
            showMaxButton={
              !(token0Balance && token0Balance.equalTo(deposit0CurrencyAmount))
            }
            currency={position.token0}
            id='add-gamma-liquidity-input-tokena'
            shallow={true}
            disabled={false}
            swap={false}
          />
        </Box>
        <Box margin='16px 0 0' className='v3-increase-liquidity-input'>
          <CurrencyInputPanel
            value={deposit1}
            onUserInput={(val) => {
              setDeposit1(val);
              setIsBaseInput(false);
            }}
            onMax={() => {
              setIsBaseInput(false);
              setDeposit1(token1Balance?.toExact() ?? '');
            }}
            showMaxButton={
              !(token1Balance && token1Balance.equalTo(deposit1CurrencyAmount))
            }
            currency={position.token1}
            id='add-gamma-liquidity-input-tokenb'
            shallow={true}
            disabled={false}
            swap={false}
          />
        </Box>
        <Box margin='16px 0 0'>
          <Button
            className='gamma-liquidity-item-button'
            disabled={buttonDisabled}
            onClick={() => setShowConfirm(true)}
            width='100%'
          >
            {buttonText}
          </Button>
        </Box>
      </Box>
    </CustomModal>
  );
}
