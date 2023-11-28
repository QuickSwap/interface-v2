import { Box, Button } from '@material-ui/core';
import React, { useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import {
  useSingleTokenCurrency,
  useSingleTokenTypeInput,
  useSingleTokenVault,
} from 'state/singleToken/hooks';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon.svg';
import { ReportProblem } from '@material-ui/icons';
import { useCurrencyBalance } from 'state/wallet/v3/hooks';
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

const SingleTokenDepositButton: React.FC = () => {
  const { t } = useTranslation();
  const { account, provider } = useActiveWeb3React();
  const currency = useSingleTokenCurrency();
  const { selectedVault } = useSingleTokenVault();
  const { typedValue } = useSingleTokenTypeInput();
  const balance = useCurrencyBalance(account, currency);

  const tokenIdx =
    selectedVault && currency
      ? selectedVault.token1 &&
        currency.wrapped.address.toLowerCase() ===
          selectedVault.token1.address.toLowerCase()
        ? 1
        : 0
      : -1;
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
      const approved = await isDepositTokenApproved(
        account,
        tokenIdx,
        Number(typedValue),
        selectedVault.address,
        provider,
        SupportedDex.Quickswap,
      );
      return approved;
    },
  });

  const buttonText = useMemo(() => {
    if (!currency) return t('selectToken');
    if (!selectedVault) return t('selectPool');
    if (!typedValue) return t('enterAmount');
    if (Number(typedValue) > Number(balance?.toExact() ?? 0))
      return t('insufficientBalance', { symbol: currency.symbol });
    if (!isApproved) return t('approve');
    return t('deposit');
  }, [balance, currency, isApproved, selectedVault, t, typedValue]);

  const buttonDisabled =
    !currency ||
    !selectedVault ||
    !typedValue ||
    loadingApproved ||
    Number(typedValue) > Number(balance?.toExact() ?? 0);

  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();

  const depositSingleToken = async () => {
    if (!account || !selectedVault || !provider || tokenIdx === -1) return;
    let txn: TransactionResponse;
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
      summary: t('depositliquidity'),
    });
    const receipt = await txn.wait();
    finalizedTransaction(receipt, {
      summary: t('depositliquidity'),
    });
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
                  alink: <a href={''} rel='noreferrer' target='_blank' />,
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
        onClick={depositSingleToken}
      >
        {buttonText}
      </Button>
    </>
  );
};

export default SingleTokenDepositButton;
