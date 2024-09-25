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
import { calculateGasMargin, formatNumber, getFixedValue } from 'utils';
import { useActiveWeb3React } from 'hooks';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import CurrencyInputPanel from 'components/v3/CurrencyInputPanel';
import '../DefiedgeLPItemDetails/index.scss';
import { useTokenBalance } from 'state/wallet/v3/hooks';
import { ETHER, JSBI, Token, WETH } from '@uniswap/sdk';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import {
  useDefiedgeStrategyContract,
  useWETHContract,
} from 'hooks/useContract';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { useCurrencyBalance } from 'state/wallet/hooks';
import {
  useDefiedgeLiquidityRatio,
  useDefiedgeTicks,
} from 'hooks/v3/useDefiedgeStrategyData';
import { ApprovalState, useApproveCallback } from 'hooks/useV3ApproveCallback';
import { tryParseAmount } from 'state/swap/v3/hooks';
import Loader from 'components/Loader';
import { Check } from '@material-ui/icons';
import { TransactionType } from 'models/enums';
import { ETHER as ETHER_CURRENCY } from 'constants/v3/addresses';

interface IncreaseDefiedgeLiquidityModalProps {
  open: boolean;
  onClose: () => void;
  position: any;
}

export default function IncreaseDefiedgeLiquidityModal({
  position,
  open,
  onClose,
}: IncreaseDefiedgeLiquidityModalProps) {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();
  const [isBaseInput, setIsBaseInput] = useState(true);
  const [deposit0, setDeposit0] = useState('');
  const [deposit1, setDeposit1] = useState('');

  const strategyContract = useDefiedgeStrategyContract(position.id);
  const {
    loading: depositRatioLoading,
    ratio: depositRatio,
  } = useDefiedgeLiquidityRatio(
    position.id,
    position.pool,
    position.token0,
    position.token1,
  );

  const { tickLower, tickUpper, currentTick } = useDefiedgeTicks(
    position.id,
    position.pool,
  );

  const ethBalance = useCurrencyBalance(
    account ?? undefined,
    chainId ? ETHER[chainId] : undefined,
  );
  const token0Balance = useTokenBalance(account ?? undefined, position.token0);
  const token1Balance = useTokenBalance(account ?? undefined, position.token1);
  const token0isWETH =
    chainId &&
    position.token0.address.toLowerCase() ===
      WETH[chainId].address.toLowerCase();
  const token1isWETH =
    chainId &&
    position.token1.address.toLowerCase() ===
      WETH[chainId].address.toLowerCase();
  const token0BalanceJSBI = JSBI.add(
    token0isWETH && ethBalance ? ethBalance.numerator : JSBI.BigInt('0'),
    token0Balance ? token0Balance.numerator : JSBI.BigInt('0'),
  );
  const token1BalanceJSBI = JSBI.add(
    chainId &&
      position.token1.address.toLowerCase() ===
        WETH[chainId].address.toLowerCase() &&
      ethBalance
      ? ethBalance.numerator
      : JSBI.BigInt('0'),
    token1Balance ? token1Balance.numerator : JSBI.BigInt('0'),
  );
  const deposit0JSBI = JSBI.BigInt(
    parseUnits(
      !deposit0 ? '0' : getFixedValue(deposit0, position.token0.decimals),
      position.token0.decimals,
    ),
  );
  const deposit1JSBI = JSBI.BigInt(
    parseUnits(
      !deposit1 ? '0' : getFixedValue(deposit1, position.token1.decimals),
      position.token1.decimals,
    ),
  );

  const [approvalA, approveACallback] = useApproveCallback(
    tryParseAmount(deposit0, position.token0),
    chainId ? strategyContract?.address : undefined,
  );
  const [approvalB, approveBCallback] = useApproveCallback(
    tryParseAmount(deposit1, position.token1),
    chainId ? strategyContract?.address : undefined,
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

  const [wrappingETH, setWrappingETH] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [attemptingTxn, setAttemptingTxn] = useState(false);
  const [txnHash, setTxnHash] = useState<string | undefined>();
  const [addErrorMessage, setAddErrorMessage] = useState('');
  const [txPending, setTxPending] = useState(false);
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();

  const buttonDisabled =
    depositRatioLoading ||
    !account ||
    JSBI.greaterThan(deposit0JSBI, token0BalanceJSBI) ||
    JSBI.greaterThan(deposit1JSBI, token1BalanceJSBI) ||
    wrappingETH ||
    approvalA !== ApprovalState.APPROVED ||
    approvalB !== ApprovalState.APPROVED;

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
        symbol:
          (token0isWETH ? `${ETHER[chainId].symbol}+` : '') +
          position.token0.symbol,
      });
    if (JSBI.greaterThan(deposit1JSBI, token1BalanceJSBI))
      return t('insufficientBalance', {
        symbol:
          (token1isWETH ? `${ETHER[chainId].symbol}+` : '') +
          position.token1.symbol,
      });
    if (!Number(deposit0) || !Number(deposit1)) return t('enterAmount');
    if (wrapAmount) return t('wrapMATIC', { symbol: ETHER[chainId].symbol });
    return t('addLiquidity');
  }, [
    account,
    t,
    deposit0JSBI,
    token0BalanceJSBI,
    token0isWETH,
    position.token0.symbol,
    position.token1.symbol,
    deposit1JSBI,
    token1BalanceJSBI,
    token1isWETH,
    deposit0,
    deposit1,
    wrapAmount,
    wrappingETH,
    chainId,
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

  const addDefiedgeLiquidity = async () => {
    if (!strategyContract || !account) return;
    setAttemptingTxn(true);
    try {
      const estimatedGas = await strategyContract.estimateGas.mint(
        deposit0JSBI.toString(),
        deposit1JSBI.toString(),
        '0',
        '0',
        '0',
      );
      const response: TransactionResponse = await strategyContract.mint(
        deposit0JSBI.toString(),
        deposit1JSBI.toString(),
        '0',
        '0',
        '0',
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
        type: TransactionType.ADDED_LIQUIDITY,
        tokens: [position.token0?.address, position.token1?.address],
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
        error?.code === 'ACTION_REJECTED' ? t('txRejected') : t('errorInTx'),
      );
    }
  };

  const deposit0Disabled = useMemo(() => currentTick >= tickUpper, [
    currentTick,
    tickUpper,
  ]);

  const deposit1Disabled = useMemo(() => currentTick <= tickLower, [
    currentTick,
    tickLower,
  ]);

  useEffect(() => {
    if (!depositRatio) return;

    if (isBaseInput) {
      if (deposit1Disabled) {
        setDeposit1('');
      } else if (Number(deposit0) > 0) {
        setDeposit1(
          (Number(deposit0) * depositRatio).toFixed(position.token1.decimals),
        );
      } else {
        setDeposit1('');
      }
    } else {
      if (deposit0Disabled) {
        setDeposit0('');
      } else if (Number(deposit1) > 0) {
        setDeposit0(
          (Number(deposit1) * (1 / depositRatio)).toFixed(
            position.token0.decimals,
          ),
        );
      } else {
        setDeposit0('');
      }
    }
  }, [
    deposit0,
    deposit1,
    isBaseInput,
    position.token1.decimals,
    position.token0.decimals,
    depositRatio,
    deposit0Disabled,
    deposit1Disabled,
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
        <Box mt={3} className='flex justify-between'>
          <p>{position.token0.symbol}</p>
          <Box className='flex items-center'>
            <p>{formatNumber(deposit0)}</p>
            <Box className='flex' ml={1}>
              <CurrencyLogo size='24px' currency={position.token0} />
            </Box>
          </Box>
        </Box>
        <Box mt={2} className='flex justify-between'>
          <p>{position.token1.symbol}</p>
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
            className='gamma-liquidity-item-button'
            onClick={addDefiedgeLiquidity}
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
        <Box mt={2} className='bg-secondary1' borderRadius={10} p={2}>
          <Box className='flex justify-between'>
            <p>
              {t('pooled')} {position.token0.symbol}
            </p>
            <Box className='flex items-center'>
              <p>{formatNumber(position.balance0)}</p>
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
              <p>{formatNumber(position.balance1)}</p>
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
                  position.token0.decimals,
                ),
              );
            }}
            showMaxButton={!JSBI.equal(token0BalanceJSBI, deposit0JSBI)}
            currency={position.token0}
            id='add-gamma-liquidity-input-tokena'
            shallow={true}
            disabled={depositRatioLoading}
            swap={false}
            showETH={
              chainId &&
              position.token0.address.toLowerCase() ===
                WETH[chainId].address.toLowerCase()
            }
            locked={deposit0Disabled}
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
                  position.token1.decimals,
                ),
              );
            }}
            showMaxButton={!JSBI.equal(token1BalanceJSBI, deposit1JSBI)}
            currency={position.token1}
            id='add-gamma-liquidity-input-tokenb'
            shallow={true}
            disabled={depositRatioLoading}
            swap={false}
            showETH={
              chainId &&
              position.token1.address.toLowerCase() ===
                WETH[chainId].address.toLowerCase()
            }
            locked={deposit1Disabled}
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
            className='gamma-liquidity-item-button'
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
