import { Box, Button } from '@material-ui/core';
import React, { useMemo, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import {
  useSingleTokenCurrency,
  useSingleTokenTypeInput,
  useSingleTokenVault,
} from 'state/singleToken/hooks';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon.svg';
import { ReportProblem } from '@material-ui/icons';
import { useCurrencyBalance } from 'state/wallet/hooks';
import { useActiveWeb3React } from 'hooks';
import {
  isDepositTokenApproved,
  SupportedDex,
  approveDepositToken,
  deposit,
} from '@ichidao/ichi-vaults-sdk';
import { useQuery } from '@tanstack/react-query';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { ETHER, JSBI, WETH } from '@uniswap/sdk';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useWETHContract } from 'hooks/useContract';
import { calculateGasMargin } from 'utils';

const SingleTokenDepositButton: React.FC = () => {
  const { t } = useTranslation();
  const { chainId, account, provider } = useActiveWeb3React();
  const currency = useSingleTokenCurrency();
  const { selectedVault } = useSingleTokenVault();
  const { typedValue } = useSingleTokenTypeInput();
  const tokenBalance = useCurrencyBalance(account, currency);
  const [approveOrDepositing, setApproveOrDepositing] = useState(false);
  const [wrappingETH, setWrappingETH] = useState(false);

  const isNativeToken =
    currency &&
    currency.wrapped.address.toLowerCase() ===
      WETH[chainId].address.toLowerCase();
  const ethBalance = useCurrencyBalance(account, ETHER[chainId]);
  const wethBalance = useCurrencyBalance(account, WETH[chainId]);
  const ethBalanceBN = ethBalance?.numerator ?? JSBI.BigInt(0);
  const wethBalanceBN = wethBalance?.numerator ?? JSBI.BigInt(0);
  const tokenBalanceBN = tokenBalance?.numerator ?? JSBI.BigInt(0);
  const balanceBN = useMemo(() => {
    if (isNativeToken) {
      return JSBI.add(ethBalanceBN, wethBalanceBN);
    }
    return tokenBalanceBN;
  }, [ethBalanceBN, isNativeToken, tokenBalanceBN, wethBalanceBN]);
  const typedValueBN = JSBI.BigInt(
    parseUnits(
      Number(typedValue).toFixed(currency?.decimals),
      currency?.decimals,
    ),
  );

  const isInsufficientBalance = JSBI.greaterThan(typedValueBN, balanceBN);

  const tokenIdx = useMemo(() => {
    if (selectedVault && currency && selectedVault.token1) {
      if (
        currency.wrapped.address.toLowerCase() ===
        selectedVault.token1.address.toLowerCase()
      )
        return 1;
      return 0;
    }
    return -1;
  }, [currency, selectedVault]);

  const { isLoading: loadingApproved, data: isApproved } = useQuery({
    queryKey: [
      'single-token-deposit-approval',
      account,
      selectedVault?.address,
      typedValue,
      tokenIdx,
    ],
    queryFn: async () => {
      if (!account || !selectedVault || !provider || tokenIdx === -1)
        return false;
      try {
        const approved = await isDepositTokenApproved(
          account,
          tokenIdx,
          Number(typedValue),
          selectedVault.address,
          provider,
          SupportedDex.Quickswap,
        );
        return approved;
      } catch (e) {
        console.log('Error getting vault approval', e);
        return false;
      }
    },
  });

  const wrapAmount = useMemo(() => {
    if (isNativeToken) {
      if (JSBI.greaterThan(typedValueBN, wethBalanceBN))
        return JSBI.subtract(typedValueBN, wethBalanceBN);
      return;
    }
    return;
  }, [isNativeToken, typedValueBN, wethBalanceBN]);

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
      const summary = `Wrap ${formatUnits(
        wrapAmount.toString(),
        18,
      )} ETH to WETH`;
      addTransaction(wrapResponse, {
        summary,
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

  const buttonText = useMemo(() => {
    if (!currency) return t('selectToken');
    if (!selectedVault) return t('selectPool');
    if (!typedValue) return t('enterAmount');
    if (isInsufficientBalance)
      return t('insufficientBalance', { symbol: currency.symbol });
    if (!isApproved) return approveOrDepositing ? t('approving') : t('approve');
    if (wrapAmount) return t('wrapMATIC', { symbol: ETHER[chainId].symbol });
    if (wrappingETH)
      return t('wrappingMATIC', { symbol: ETHER[chainId].symbol });
    return approveOrDepositing ? t('depositing') : t('deposit');
  }, [
    approveOrDepositing,
    chainId,
    currency,
    isApproved,
    isInsufficientBalance,
    selectedVault,
    t,
    typedValue,
    wrapAmount,
    wrappingETH,
  ]);

  const buttonDisabled =
    !currency ||
    !selectedVault ||
    !typedValue ||
    loadingApproved ||
    approveOrDepositing ||
    wrappingETH ||
    isInsufficientBalance;

  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();

  const depositSingleToken = async () => {
    if (!account || !selectedVault || !provider || tokenIdx === -1) return;
    setApproveOrDepositing(true);
    let txn: TransactionResponse;
    const summary = isApproved
      ? t('depositliquidity')
      : t('approve') + ' ' + currency?.symbol;
    try {
      if (isApproved) {
        txn = await deposit(
          account,
          tokenIdx === 0 ? Number(typedValue) : 0,
          tokenIdx === 1 ? Number(typedValue) : 0,
          selectedVault.address,
          provider,
          SupportedDex.Quickswap,
        );
      } else {
        txn = await approveDepositToken(
          account,
          tokenIdx,
          selectedVault.address,
          provider,
          SupportedDex.Quickswap,
        );
      }
      addTransaction(txn, {
        summary,
      });
      const receipt = await txn.wait();
      finalizedTransaction(receipt, {
        summary,
      });
      setApproveOrDepositing(false);
    } catch (e) {
      console.log(`Error ${isApproved ? 'deposit' : 'approve'}`, e);
      setApproveOrDepositing(false);
    }
  };

  return (
    <>
      {selectedVault && (
        <>
          <Box className='flex justify-between'>
            <p className='text-secondary'>{t('yourshareinvault')}</p>
            <p>%</p>
          </Box>
          <Box className='singleTokenInfoWrapper singleTokenHelp' mt={2}>
            <HelpIcon />
            <small>
              <Trans
                i18nKey='singleTokenHelp'
                components={{
                  alink: (
                    <a
                      href='https://docs.ichi.org/home/yield-iq/overview'
                      rel='noreferrer'
                      target='_blank'
                    />
                  ),
                }}
              />
            </small>
          </Box>
          <Box className='singleTokenInfoWrapper singleTokenWarning' my={2}>
            <ReportProblem />
            <small>{t('singleTokenWarning')}</small>
          </Box>
        </>
      )}
      <Button
        className='singleTokenDepositButton'
        disabled={buttonDisabled}
        onClick={wrapAmount ? wrapETH : depositSingleToken}
      >
        {buttonText}
      </Button>
    </>
  );
};

export default SingleTokenDepositButton;
