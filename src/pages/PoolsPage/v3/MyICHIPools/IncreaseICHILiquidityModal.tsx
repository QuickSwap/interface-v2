import React, { useCallback, useMemo, useState } from 'react';
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
import { calculateGasMargin, formatNumber, getFixedValue } from 'utils';
import { useActiveWeb3React } from 'hooks';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import CurrencyInputPanel from 'components/v3/CurrencyInputPanel';
import './ICHILPItemDetails/index.scss';
import { ETHER, JSBI, Token } from '@uniswap/sdk';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useWETHContract } from 'hooks/useContract';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { WrappedCurrency } from 'models/types';
import { SupportedDex, deposit } from '@ichidao/ichi-vaults-sdk';
import {
  ICHIVault,
  useICHIVaultApproval,
  useICHIVaultDepositData,
} from 'hooks/useICHIData';
import { BigNumber } from 'ethers';
import { TransactionType } from 'models/enums';
import { ETHER as ETHER_CURRENCY } from 'constants/v3/addresses';

interface IncreaseICHILiquidityModalProps {
  open: boolean;
  onClose: () => void;
  position: ICHIVault;
}

export default function IncreaseICHILiquidityModal({
  position,
  open,
  onClose,
}: IncreaseICHILiquidityModalProps) {
  const { t } = useTranslation();
  const { chainId, account, provider } = useActiveWeb3React();
  const [typedValue, setTypedValue] = useState('');
  const [wrappingETH, setWrappingETH] = useState(false);

  const currency = position.allowToken0 ? position.token0 : position.token1;
  const {
    data: { isNativeToken, availableAmount, tokenIdx },
  } = useICHIVaultDepositData(typedValue, currency, position);

  const { isLoading: loadingApproved, data: isApproved } = useICHIVaultApproval(
    position,
    Number(typedValue),
    tokenIdx,
  );

  const typedValueJSBI = JSBI.BigInt(
    parseUnits(
      !typedValue ? '0' : getFixedValue(typedValue, position.token0?.decimals),
      position.token0?.decimals,
    ),
  );

  const [showConfirm, setShowConfirm] = useState(false);
  const [attemptingTxn, setAttemptingTxn] = useState(false);
  const [txnHash, setTxnHash] = useState<string | undefined>();
  const [addErrorMessage, setAddErrorMessage] = useState('');
  const [txPending, setTxPending] = useState(false);
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();
  const [approving, setApproving] = useState(false);

  const buttonDisabled =
    !Number(typedValue) ||
    !account ||
    JSBI.greaterThan(typedValueJSBI, availableAmount) ||
    wrappingETH ||
    loadingApproved;

  const wrapAmount = useMemo(() => {
    if (isNativeToken && JSBI.greaterThan(typedValueJSBI, availableAmount))
      return JSBI.subtract(typedValueJSBI, availableAmount);
    return;
  }, [availableAmount, isNativeToken, typedValueJSBI]);

  const buttonText = useMemo(() => {
    if (wrappingETH)
      return t('wrappingMATIC', { symbol: ETHER[chainId].symbol });
    if (!account) return t('connectWallet');
    if (JSBI.greaterThan(typedValueJSBI, availableAmount))
      return t('insufficientBalance', {
        symbol: position.token0?.symbol,
      });
    if (!Number(typedValue)) return t('enterAmount');
    if (!isApproved)
      return `${approving ? t('approving') : t('approve')} ${currency?.symbol}`;
    if (wrapAmount) return t('wrapMATIC', { symbol: ETHER[chainId].symbol });
    return t('addLiquidity');
  }, [
    wrappingETH,
    t,
    chainId,
    account,
    typedValueJSBI,
    availableAmount,
    position.token0?.symbol,
    typedValue,
    isApproved,
    approving,
    currency?.symbol,
    wrapAmount,
  ]);

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    if (txnHash) {
      setTypedValue('');
    }
    setAttemptingTxn(false);
    setTxnHash('');
    setTxPending(false);
    setAddErrorMessage('');
  }, [txnHash]);

  const wethContract = useWETHContract();
  const wrapETH = async () => {
    if (!chainId || !account || !wethContract || !wrapAmount) return;

    setWrappingETH(true);
    try {
      const wrapEstimateGas = await wethContract.estimateGas.deposit({
        value: wrapAmount.toString(),
      });
      const wrapResponse: TransactionResponse = await wethContract.deposit({
        gasLimit: calculateGasMargin(wrapEstimateGas),
        value: wrapAmount.toString(),
      });
      setAttemptingTxn(false);
      setTxPending(true);
      const summary = `Wrap ${formatUnits(
        wrapAmount.toString(),
        18,
      )} ETH to WETH`;
      addTransaction(wrapResponse, {
        summary,
        type: TransactionType.WRAP,
        tokens: [Token.ETHER[chainId]],
      });
      const receipt = await wrapResponse.wait();
      finalizedTransaction(receipt, {
        summary,
      });
      setWrappingETH(false);
    } catch (e) {
      console.error(e);
      setWrappingETH(false);
    }
  };

  const approveICHI = async () => {
    if (!account || !provider) return;
    setApproving(true);
    try {
      const response = await deposit(
        account,
        tokenIdx === 0 ? Number(typedValue) : 0,
        tokenIdx === 1 ? Number(typedValue) : 0,
        position.address,
        provider,
        SupportedDex.Quickswap,
      );
      const summary = t('approve', {
        symbol: currency?.symbol,
      });
      addTransaction(response, {
        summary,
        type: TransactionType.APPROVED,
      });
      const receipt = await response.wait();
      finalizedTransaction(receipt, {
        summary,
      });
      setApproving(false);
    } catch (error) {
      console.error('Failed to send transaction', error);
      setApproving(false);
      setAddErrorMessage(
        error?.code === 4001 ? t('txRejected') : t('errorInTx'),
      );
    }
  };

  const addICHILiquidity = async () => {
    if (!account || !provider) return;
    setAttemptingTxn(true);
    try {
      const response = await deposit(
        account,
        tokenIdx === 0 ? BigNumber.from(typedValueJSBI.toString()) : 0,
        tokenIdx === 1 ? BigNumber.from(typedValueJSBI.toString()) : 0,
        position.address,
        provider,
        SupportedDex.Quickswap,
      );
      const summary = t('addICHILiquidityWithToken', {
        symbol: currency?.symbol,
      });
      setAttemptingTxn(false);
      setTxPending(true);
      addTransaction(response, {
        summary,
        type: TransactionType.ADDED_LIQUIDITY,
        tokens: [currency?.address ?? '', currency?.address ?? ''],
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

  const pendingText = t('addingICHILiquidityToken', {
    amount: formatNumber(typedValue),
    symbol: currency?.symbol,
  });

  function modalHeader() {
    return (
      <Box>
        <Box mt={3} className='flex justify-between'>
          <p>{position.token0?.symbol}</p>
          <Box className='flex items-center'>
            <p>{formatNumber(typedValue)}</p>
            <Box className='flex' ml={1}>
              <CurrencyLogo size='24px' currency={position.token0} />
            </Box>
          </Box>
        </Box>

        <Box mt={2}>
          <Button
            fullWidth
            className='ichi-liquidity-item-button'
            onClick={addICHILiquidity}
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
              <p>{formatNumber(position.token0Balance)}</p>
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
              <p>{formatNumber(position.token1Balance)}</p>
              <Box className='flex' ml={1}>
                <CurrencyLogo size='24px' currency={position.token1} />
              </Box>
            </Box>
          </Box>
        </Box>
        <Box mt={2}>
          <CurrencyInputPanel
            value={typedValue}
            onUserInput={(val) => {
              setTypedValue(val);
            }}
            onMax={() => {
              setTypedValue(
                formatUnits(availableAmount.toString(), currency?.decimals),
              );
            }}
            showMaxButton={!JSBI.equal(availableAmount, typedValueJSBI)}
            currency={currency as WrappedCurrency}
            id='add-ichi-liquidity-input-tokena'
            shallow={true}
            disabled={false}
            swap={false}
            showETH={isNativeToken}
          />
        </Box>
        <Box mt={2}>
          <Button
            className='ichi-liquidity-item-button'
            disabled={buttonDisabled}
            onClick={() =>
              !isApproved
                ? approveICHI()
                : wrapAmount
                ? wrapETH()
                : setShowConfirm(true)
            }
            fullWidth
          >
            {buttonText}
          </Button>
        </Box>
      </Box>
    </CustomModal>
  );
}
