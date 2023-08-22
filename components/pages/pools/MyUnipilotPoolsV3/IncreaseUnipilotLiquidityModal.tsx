import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ConfirmationModalContent,
  CurrencyLogo,
  CustomModal,
  TransactionConfirmationModal,
  TransactionErrorContent,
} from 'components';
import { Box, Button } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { calculateGasMargin, formatNumber } from 'utils';
import { useActiveWeb3React } from 'hooks';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import CurrencyInputPanel from 'components/v3/CurrencyInputPanel';
import styles from 'styles/pages/pools/UnipilotLPItemDetails.module.scss';
import { useTokenBalance } from 'state/wallet/v3/hooks';
import { ETHER, JSBI, WETH } from '@uniswap/sdk';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useUniPilotVaultContract } from 'hooks/useContract';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { useSingleCallResult } from 'state/multicall/v3/hooks';
import { useCurrencyBalance } from 'state/wallet/hooks';

interface IncreaseUnipilotLiquidityModalProps {
  open: boolean;
  onClose: () => void;
  position: any;
}

export default function IncreaseUnipilotLiquidityModal({
  position,
  open,
  onClose,
}: IncreaseUnipilotLiquidityModalProps) {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();
  const [isBaseInput, setIsBaseInput] = useState(true);
  const uniPilotVaultContract = useUniPilotVaultContract(position.vault.id);
  const [deposit0, setDeposit0] = useState('');
  const [deposit1, setDeposit1] = useState('');

  const unipilotToken0VaultBalance = useTokenBalance(
    position.vault.id,
    position.token0,
  );
  const unipilotToken1VaultBalance = useTokenBalance(
    position.vault.id,
    position.token1,
  );
  const uniPilotVaultPositionResult = useSingleCallResult(
    uniPilotVaultContract,
    'getPositionDetails',
  );
  const uniPilotVaultReserve = useMemo(() => {
    if (
      !uniPilotVaultPositionResult.loading &&
      uniPilotVaultPositionResult.result &&
      uniPilotVaultPositionResult.result.length > 1
    ) {
      return {
        token0: JSBI.add(
          JSBI.BigInt(uniPilotVaultPositionResult.result[0]),
          unipilotToken0VaultBalance?.numerator ?? JSBI.BigInt(0),
        ),
        token1: JSBI.add(
          JSBI.BigInt(uniPilotVaultPositionResult.result[1]),
          unipilotToken1VaultBalance?.numerator ?? JSBI.BigInt(0),
        ),
      };
    }
    return;
  }, [
    uniPilotVaultPositionResult,
    unipilotToken0VaultBalance,
    unipilotToken1VaultBalance,
  ]);

  const dependentToken = isBaseInput ? position.token1 : position.token0;
  const independentDeposit = isBaseInput
    ? JSBI.BigInt(
        parseUnits(
          Number(deposit0).toFixed(position.token0?.decimals),
          position.token0?.decimals,
        ),
      )
    : JSBI.BigInt(
        parseUnits(
          Number(deposit1).toFixed(position.token1?.decimals),
          position.token1?.decimals,
        ),
      );
  const independentReserve = isBaseInput
    ? uniPilotVaultReserve?.token0
    : uniPilotVaultReserve?.token1;
  const dependentReserve = isBaseInput
    ? uniPilotVaultReserve?.token1
    : uniPilotVaultReserve?.token0;

  const ethBalance = useCurrencyBalance(
    account ?? undefined,
    chainId ? ETHER[chainId] : undefined,
  );
  const token0Balance = useTokenBalance(account ?? undefined, position.token0);
  const token1Balance = useTokenBalance(account ?? undefined, position.token1);
  const token0isWETH =
    chainId &&
    position &&
    position.token0 &&
    position.token0.address.toLowerCase() ===
      WETH[chainId].address.toLowerCase();
  const token1isWETH =
    chainId &&
    position &&
    position.token1 &&
    position.token1.address.toLowerCase() ===
      WETH[chainId].address.toLowerCase();
  const token0BalanceJSBI = JSBI.add(
    token0isWETH && ethBalance ? ethBalance.numerator : JSBI.BigInt('0'),
    token0Balance ? token0Balance.numerator : JSBI.BigInt('0'),
  );
  const token1BalanceJSBI = JSBI.add(
    chainId &&
      position &&
      position.token1 &&
      position.token1.address.toLowerCase() ===
        WETH[chainId].address.toLowerCase() &&
      ethBalance
      ? ethBalance.numerator
      : JSBI.BigInt('0'),
    token1Balance ? token1Balance.numerator : JSBI.BigInt('0'),
  );
  const deposit0JSBI = JSBI.BigInt(
    parseUnits(!deposit0 ? '0' : deposit0, position.token0?.decimals),
  );
  const deposit1JSBI = JSBI.BigInt(
    parseUnits(!deposit1 ? '0' : deposit1, position.token1?.decimals),
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
    if (!uniPilotVaultReserve) return t('fetchingGammaDepositRange');
    if (JSBI.greaterThan(deposit0JSBI, token0BalanceJSBI))
      return t('insufficientBalance', {
        symbol:
          (token0isWETH ? `${ETHER[chainId].symbol}+` : '') +
          position.token0?.symbol,
      });
    if (JSBI.greaterThan(deposit1JSBI, token1BalanceJSBI))
      return t('insufficientBalance', {
        symbol:
          (token1isWETH ? `${ETHER[chainId].symbol}+` : '') +
          position.token1?.symbol,
      });
    if (!Number(deposit0) || !Number(deposit1)) return t('enterAmount');
    return t('addLiquidity');
  }, [
    account,
    t,
    deposit0JSBI,
    token0BalanceJSBI,
    token0isWETH,
    position.token0?.symbol,
    position.token1?.symbol,
    deposit1JSBI,
    token1BalanceJSBI,
    token1isWETH,
    deposit0,
    deposit1,
    chainId,
    uniPilotVaultReserve,
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

  const ethAmount = useMemo(() => {
    if (token0isWETH) {
      return JSBI.subtract(
        deposit0JSBI,
        token0Balance ? token0Balance.numerator : JSBI.BigInt(0),
      );
    }
    if (token1isWETH) {
      return JSBI.subtract(
        deposit1JSBI,
        token1Balance ? token1Balance.numerator : JSBI.BigInt(0),
      );
    }
    return JSBI.BigInt(0);
  }, [
    deposit0JSBI,
    deposit1JSBI,
    token0Balance,
    token0isWETH,
    token1Balance,
    token1isWETH,
  ]);

  const addUnipilotLiquidity = async () => {
    if (!uniPilotVaultContract || !account) return;
    setAttemptingTxn(true);
    try {
      const estimatedGas = await uniPilotVaultContract.estimateGas.deposit(
        deposit0JSBI.toString(),
        deposit1JSBI.toString(),
        account,
        { value: ethAmount.toString() },
      );
      const response: TransactionResponse = await uniPilotVaultContract.deposit(
        deposit0JSBI.toString(),
        deposit1JSBI.toString(),
        account,
        {
          gasLimit: calculateGasMargin(estimatedGas),
          value: ethAmount.toString(),
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
    } catch (err) {
      const error = err as any;
      console.error('Failed to send transaction', error);
      setAttemptingTxn(false);
      setTxPending(false);
      setAddErrorMessage(
        error?.code === 4001 ? t('txRejected') ?? '' : t('errorInTx') ?? '',
      );
    }
  };

  useEffect(() => {
    if (dependentReserve && independentReserve) {
      const dependentDeposit = JSBI.divide(
        JSBI.multiply(dependentReserve, independentDeposit),
        independentReserve,
      );
      if (isBaseInput) {
        setDeposit1(
          formatUnits(dependentDeposit.toString(), dependentToken?.decimals),
        );
      } else {
        setDeposit0(
          formatUnits(dependentDeposit.toString(), dependentToken?.decimals),
        );
      }
    }
  }, [
    isBaseInput,
    dependentReserve,
    dependentToken?.decimals,
    independentDeposit,
    independentReserve,
  ]);

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
            className='gamma-liquidity-item-button'
            onClick={addUnipilotLiquidity}
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
          <Close className='cursor-pointer' onClick={onClose} />
        </Box>
        <Box mt={2} className='bg-secondary1' borderRadius={10} p={2}>
          <Box className='flex justify-between'>
            <p>
              {t('pooled')} {position.token0?.symbol}
            </p>
            <Box className='flex items-center'>
              <p>
                {position.token0Balance
                  ? formatNumber(
                      formatUnits(
                        position.token0Balance.toString(),
                        position.token0?.decimals,
                      ),
                    )
                  : 0}
              </p>
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
              <p>
                {position.token1Balance
                  ? formatNumber(
                      formatUnits(
                        position.token1Balance.toString(),
                        position.token1?.decimals,
                      ),
                    )
                  : 0}
              </p>
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
            currency={position.token0}
            id='add-gamma-liquidity-input-tokena'
            shallow={true}
            disabled={false}
            swap={false}
            showETH={
              chainId &&
              position &&
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
            currency={position.token1}
            id='add-gamma-liquidity-input-tokenb'
            shallow={true}
            disabled={false}
            swap={false}
            showETH={
              chainId &&
              position &&
              position.token1 &&
              position.token1.address.toLowerCase() ===
                WETH[chainId].address.toLowerCase()
            }
          />
        </Box>
        <Box mt={2}>
          <Button
            className={styles.unipilotLiquidityItemButton}
            variant='contained'
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
