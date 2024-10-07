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
import {
  calculateGasMargin,
  formatNumber,
  getSteerRatio,
  maxAmountSpend,
  getFixedValue,
} from 'utils';
import { useActiveWeb3React } from 'hooks';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import CurrencyInputPanel from 'components/v3/CurrencyInputPanel';
import './SteerLPItemDetails/index.scss';
import { useTokenBalance } from 'state/wallet/v3/hooks';
import { ETHER, JSBI, Token, WETH } from '@uniswap/sdk';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useSteerPeripheryContract, useWETHContract } from 'hooks/useContract';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { SteerVault } from 'hooks/v3/useSteerData';
import { WrappedCurrency } from 'models/types';
import { useCurrencyBalance } from 'state/wallet/hooks';
import { ApprovalState, useApproveCallback } from 'hooks/useV3ApproveCallback';
import { tryParseAmount } from 'state/swap/v3/hooks';
import Loader from 'components/Loader';
import { Check } from '@material-ui/icons';
import { TransactionType } from 'models/enums';
import { ETHER as ETHER_CURRENCY } from 'constants/v3/addresses';

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
  const { chainId, account } = useActiveWeb3React();
  const [isBaseInput, setIsBaseInput] = useState(true);
  const [deposit0, setDeposit0] = useState('');
  const [deposit1, setDeposit1] = useState('');
  const [wrappingETH, setWrappingETH] = useState(false);

  const steerPeripheryContract = useSteerPeripheryContract();

  const dependentToken = isBaseInput ? position.token1 : position.token0;
  const independentDeposit = isBaseInput ? deposit0 : deposit1;

  const token0Balance = useTokenBalance(account ?? undefined, position.token0);
  const token1Balance = useTokenBalance(account ?? undefined, position.token1);

  const token0isWETH =
    chainId &&
    position.token0 &&
    position.token0.address.toLowerCase() ===
      WETH[chainId].address.toLowerCase();
  const token1isWETH =
    chainId &&
    position.token1 &&
    position.token1.address.toLowerCase() ===
      WETH[chainId].address.toLowerCase();

  const ethBalance = useCurrencyBalance(
    account ?? undefined,
    chainId ? ETHER[chainId] : undefined,
  );
  const maxSpendETH = chainId ? maxAmountSpend(chainId, ethBalance) : undefined;
  const token0BalanceJSBI = JSBI.add(
    token0isWETH && maxSpendETH ? maxSpendETH.numerator : JSBI.BigInt('0'),
    token0Balance ? token0Balance.numerator : JSBI.BigInt('0'),
  );
  const token1BalanceJSBI = JSBI.add(
    token1isWETH && maxSpendETH ? maxSpendETH.numerator : JSBI.BigInt('0'),
    token1Balance ? token1Balance.numerator : JSBI.BigInt('0'),
  );

  const deposit0JSBI = JSBI.BigInt(
    parseUnits(
      !deposit0 ? '0' : getFixedValue(deposit0, position.token0?.decimals),
      position.token0?.decimals,
    ),
  );
  const deposit1JSBI = JSBI.BigInt(
    parseUnits(
      !deposit1 ? '0' : getFixedValue(deposit1, position.token1?.decimals),
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

  const wrapAmount = useMemo(() => {
    if (token0isWETH) {
      const token0BalanceJSBI = token0Balance
        ? token0Balance.numerator
        : JSBI.BigInt('0');
      if (JSBI.greaterThan(deposit0JSBI, token0BalanceJSBI))
        return JSBI.subtract(deposit0JSBI, token0BalanceJSBI);
      return;
    } else if (token1isWETH) {
      const token1BalanceJSBI = token1Balance
        ? token1Balance.numerator
        : JSBI.BigInt('0');
      if (JSBI.greaterThan(deposit1JSBI, token1BalanceJSBI))
        return JSBI.subtract(deposit1JSBI, token1BalanceJSBI);
      return;
    }
    return;
  }, [
    deposit0JSBI,
    deposit1JSBI,
    token0Balance,
    token0isWETH,
    token1Balance,
    token1isWETH,
  ]);

  const buttonText = useMemo(() => {
    if (wrappingETH)
      return t('wrappingMATIC', { symbol: ETHER[chainId].symbol });
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
    if (wrapAmount) return t('wrapMATIC', { symbol: ETHER[chainId].symbol });
    return t('addLiquidity');
  }, [
    wrappingETH,
    t,
    chainId,
    account,
    deposit0JSBI,
    token0BalanceJSBI,
    position.token0?.symbol,
    position.token1?.symbol,
    deposit1JSBI,
    token1BalanceJSBI,
    deposit0,
    deposit1,
    wrapAmount,
  ]);

  const [approvalA, approveACallback] = useApproveCallback(
    tryParseAmount(deposit0, position.token0),
    chainId ? steerPeripheryContract?.address : undefined,
  );
  const [approvalB, approveBCallback] = useApproveCallback(
    tryParseAmount(deposit1, position.token1),
    chainId ? steerPeripheryContract?.address : undefined,
  );

  const showApprovalA = useMemo(() => {
    if (approvalA === ApprovalState.UNKNOWN) return undefined;

    if (approvalA === ApprovalState.NOT_APPROVED) return true;

    return approvalA !== ApprovalState.APPROVED;
  }, [approvalA]);

  const showApprovalB = useMemo(() => {
    if (approvalB === ApprovalState.UNKNOWN) return undefined;

    if (approvalB === ApprovalState.NOT_APPROVED) return true;

    return approvalB !== ApprovalState.APPROVED;
  }, [approvalB]);

  const buttonDisabled =
    !Number(deposit0) ||
    !Number(deposit1) ||
    !account ||
    JSBI.greaterThan(deposit0JSBI, token0BalanceJSBI) ||
    JSBI.greaterThan(deposit1JSBI, token1BalanceJSBI) ||
    wrappingETH ||
    approvalA !== ApprovalState.APPROVED ||
    approvalB !== ApprovalState.APPROVED;

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
        type: TransactionType.ADDED_LIQUIDITY,
        tokens: [
          position.token0?.address ?? '',
          position.token1?.address ?? '',
        ],
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
            showETH={
              chainId &&
              position.token0 &&
              position.token0.address.toLowerCase() ===
                WETH[chainId].address.toLowerCase()
            }
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
            showETH={
              chainId &&
              position.token1 &&
              position.token1.address.toLowerCase() ===
                WETH[chainId].address.toLowerCase()
            }
          />
        </Box>
        <Box mt={2} className='flex justify-between'>
          {showApprovalA !== undefined && (
            <Box width={showApprovalB === undefined ? '100%' : '49%'}>
              {showApprovalA ? (
                approvalA === ApprovalState.PENDING ? (
                  <Box className='token-approve-button-loading'>
                    <Loader stroke='white' />
                    <p>
                      {t('approving')} {position.token0?.symbol}
                    </p>
                  </Box>
                ) : (
                  <Button
                    className='token-approve-button'
                    onClick={approveACallback}
                  >
                    <p>
                      {t('approve')} {position.token0?.symbol}
                    </p>
                  </Button>
                )
              ) : (
                <Box className='token-approve-button-loading'>
                  <Check />
                  <p>
                    {t('approved')} {position.token0?.symbol}
                  </p>
                </Box>
              )}
            </Box>
          )}
          {showApprovalB !== undefined && (
            <Box width={showApprovalA === undefined ? '100%' : '49%'}>
              {showApprovalB ? (
                approvalB === ApprovalState.PENDING ? (
                  <Box className='token-approve-button-loading'>
                    <Loader stroke='white' />
                    <p>
                      {t('approving')} {position.token1?.symbol}
                    </p>
                  </Box>
                ) : (
                  <Button
                    className='token-approve-button'
                    onClick={approveBCallback}
                  >
                    <p>
                      {t('approve')} {position.token1?.symbol}
                    </p>
                  </Button>
                )
              ) : (
                <Box className='token-approve-button-loading'>
                  <Check />
                  <p>
                    {t('approved')} {position.token1?.symbol}
                  </p>
                </Box>
              )}
            </Box>
          )}
        </Box>
        <Box mt={2}>
          <Button
            className='steer-liquidity-item-button'
            disabled={buttonDisabled}
            onClick={() => (wrapAmount ? wrapETH() : setShowConfirm(true))}
            fullWidth
          >
            {buttonText}
          </Button>
        </Box>
      </Box>
    </CustomModal>
  );
}
