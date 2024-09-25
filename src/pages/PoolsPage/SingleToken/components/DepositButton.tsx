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
import { useActiveWeb3React } from 'hooks';
import {
  SupportedDex,
  approveDepositToken,
  deposit,
} from '@ichidao/ichi-vaults-sdk';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Currency, ETHER, Token } from '@uniswap/sdk';
import { formatUnits } from 'ethers/lib/utils';
import { useWETHContract } from 'hooks/useContract';
import { calculateGasMargin, formatNumber } from 'utils';
import {
  useICHIVaultApproval,
  useICHIVaultDepositData,
  useICHIVaultShare,
} from 'hooks/useICHIData';
import Loader from 'components/Loader';
import { TransactionType } from 'models/enums';
import { ETHER as ETHER_CURRENCY } from 'constants/v3/addresses';

const SingleTokenDepositButton: React.FC = () => {
  const { t } = useTranslation();
  const { chainId, account, provider } = useActiveWeb3React();
  const currency = useSingleTokenCurrency();
  const { selectedVault } = useSingleTokenVault();
  const { typedValue } = useSingleTokenTypeInput();
  const [approveOrDepositing, setApproveOrDepositing] = useState(false);
  const [wrappingETH, setWrappingETH] = useState(false);

  const { loading: loadingShare, data: vaultShare } = useICHIVaultShare(
    selectedVault,
  );

  const {
    isLoading: loadingDepositData,
    data: { tokenIdx, wrapAmount, isMorethanAvailable },
  } = useICHIVaultDepositData(typedValue, currency, selectedVault);

  const { isLoading: loadingApproved, data: isApproved } = useICHIVaultApproval(
    selectedVault,
    Number(typedValue),
    tokenIdx,
  );

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

  const buttonText = useMemo(() => {
    if (!currency) return t('selectToken');
    if (!selectedVault) return t('selectPool');
    if (!typedValue) return t('enterAmount');
    if (!isApproved)
      return `${approveOrDepositing ? t('approving') : t('approve')} ${
        currency.symbol
      }`;
    if (isMorethanAvailable) return t('morethanAvailable');
    if (wrapAmount) return t('wrapMATIC', { symbol: ETHER[chainId].symbol });
    if (wrappingETH)
      return t('wrappingMATIC', { symbol: ETHER[chainId].symbol });
    return approveOrDepositing ? t('depositing') : t('deposit');
  }, [
    approveOrDepositing,
    chainId,
    currency,
    isApproved,
    isMorethanAvailable,
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
    loadingDepositData ||
    loadingApproved ||
    approveOrDepositing ||
    wrappingETH ||
    (!!isApproved && isMorethanAvailable);

  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();

  const depositSingleToken = async () => {
    if (!account || !selectedVault || !provider || tokenIdx === undefined)
      return;
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
        type: isApproved ? TransactionType.SEND : TransactionType.APPROVED,
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
            {loadingShare ? <Loader /> : <p>{formatNumber(vaultShare)}%</p>}
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
