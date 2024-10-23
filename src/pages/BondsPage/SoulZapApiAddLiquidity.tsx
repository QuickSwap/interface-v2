import React, { FC, useCallback, useMemo, useState } from 'react';
import { ReactComponent as SettingsIcon } from 'assets/images/SettingsIcon.svg';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import { ReactComponent as BondArrow } from 'assets/images/bondArrow.svg';
import ZapSlippage from './DualAddLiquidity/ZapSlippage';

import { useCurrency } from 'hooks/v3/Tokens';
import { useCurrencyBalance, useCurrencyBalances } from 'state/wallet/v3/hooks';
import {
  ApprovalState,
  useApproveCallbackV3,
} from '../../hooks/useApproveCallback';
import { useTransactionAdder } from 'state/transactions/hooks';
import { useZapActionHandlers } from 'state/zap/hooks';

import { maxAmountSpend } from 'utils/v3/maxAmountSpend';
import BigNumber from 'bignumber.js';

// Types
import { Field } from 'state/zap/actions';
import { Currency, CurrencyAmount } from '@uniswap/sdk-core';

// Constants
import { LiquidityDex } from '@ape.swap/apeswap-lists';
import { ChainId, JSBI } from '@uniswap/sdk';
import { CustomModal, DoubleCurrencyLogo, NumericalInput } from 'components';
import { useActiveWeb3React } from 'hooks';
import { Box, Button } from '@material-ui/core';
import ZapCurrencyInput from 'components/ZapCurrencyInput';
import { useTranslation } from 'react-i18next';
import { SoulZapTokenManager } from 'constants/v3/addresses';
import Loader from 'components/Loader';
import { Bond } from 'types/bond';
import { parseUnits } from 'ethers/lib/utils';
import { getFixedValue } from 'utils';
import { useSoulZapLPApiQuote } from 'state/zap/soulZapApi/useSoulZapLPApiQuote';
import { useCurrencyFromSymbol } from 'hooks/Tokens';
import { TransactionType } from 'models/enums';

interface SoulZapApiAddLiquidityProps {
  open: boolean;
  onDismiss?: () => void;
  bond?: Bond;
  liquidityDex?: LiquidityDex;
  chainId: ChainId;
}

const SoulZapApiAddLiquidity: FC<SoulZapApiAddLiquidityProps> = ({
  open,
  onDismiss,
  bond,
  chainId,
}) => {
  const { t } = useTranslation();
  // Loading state for both approve and purchase functions
  const [pendingTx, setPendingTx] = useState(false);
  const [typedValue, setTypedValue] = useState('');
  const [inputTokenString, setInputTokenString] = useState('ETH');

  // Hooks
  const { account, provider } = useActiveWeb3React();
  const addTransaction = useTransactionAdder();

  // Zap hooks
  const { onCurrencySelection } = useZapActionHandlers();
  const lpAddress = bond?.lpToken?.address[chainId];

  const {
    loading,
    response: zapData,
    estimateOutput: consideredValue,
  } = useSoulZapLPApiQuote(typedValue, inputTokenString, lpAddress ?? '', bond);

  const inputCurrency = useCurrency(inputTokenString);
  const lpCurrency = useCurrency(lpAddress);
  const lpBalanceString = useCurrencyBalance(
    account,
    lpCurrency ?? undefined,
  )?.toExact();
  const bigValue =
    typedValue && Number(typedValue) > 0
      ? new BigNumber(consideredValue).toNumber()
      : 0;
  const outputUSD = bigValue * (bond?.lpPrice ?? 0);
  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    lpCurrency ?? undefined,
  ]);

  const currencyBalances = useMemo(() => {
    return {
      [Field.INPUT]: relevantTokenBalances[0],
      [Field.OUTPUT]: relevantTokenBalances[1],
    };
  }, [relevantTokenBalances]);

  //Functions
  const handleCurrencySelect = useCallback(
    (field: Field, currency: Currency[]) => {
      setTypedValue('');
      if (field === Field.INPUT) {
        setInputTokenString(currency[0].isToken ? currency[0].address : 'ETH');
      } else {
        onCurrencySelection(field, currency);
      }
    },
    [onCurrencySelection],
  );

  const handleMaxInput = useCallback(
    (field: Field) => {
      // eslint-disable-next-line no-unused-vars
      const maxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = {
        [Field.INPUT]: maxAmountSpend(currencyBalances[Field.INPUT]),
        [Field.OUTPUT]: maxAmountSpend(currencyBalances[Field.OUTPUT]),
      };
      if (maxAmounts) {
        setTypedValue(maxAmounts[field]?.toExact() ?? '');
      }
    },
    [currencyBalances],
  );

  const signer = provider?.getSigner();
  const validated18DecimalAmount = new BigNumber(typedValue ?? '0').toFixed(
    18,
    5,
  );

  const bigishInputAmount = new BigNumber(validated18DecimalAmount ?? '0')
    .times(new BigNumber(10).pow(inputCurrency?.decimals ?? 18))
    .toString();

  const soulZapCallback = useCallback(async () => {
    if (signer && zapData && zapData?.txData?.to && zapData?.txData?.data) {
      console.log(zapData);
      console.log('Attempting zap tx');
      const gas = await signer.estimateGas({
        to: zapData.txData.to,
        data: zapData.txData.data,
        value: inputCurrency?.isNative ? bigishInputAmount : undefined,
      });
      console.log(gas.toNumber());
      const gasToUse = Math.floor(gas?.toNumber() * 1.4);
      setPendingTx(true);
      await signer
        .sendTransaction({
          to: zapData.txData.to,
          data: zapData.txData.data,
          value: inputCurrency?.isNative ? bigishInputAmount : undefined,
          gasLimit: gasToUse,
        })
        .then((res) => {
          addTransaction(
            undefined,
            {
              summary: t('zapBond'),
              type: TransactionType.ZAP,
            },
            res.hash,
          );
          provider
            ?.waitForTransaction(res.hash)
            .then(() => {
              setPendingTx(false);
            })
            .catch((e) => {
              setPendingTx(false);
              console.error(e);
            });
        })
        .catch((e) => {
          console.log('Failed tx');
          console.log(e);
        })
        .finally(() => {
          setPendingTx(false);
        });
    }
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [signer, zapData, zapData?.txData?.to, zapData?.txData?.data]);

  // Approve logic
  const zapContractAddress = bond
    ? SoulZapTokenManager[bond.chainId]
    : undefined;
  const parsedAmount = inputCurrency
    ? CurrencyAmount.fromRawAmount(
        inputCurrency,
        JSBI.BigInt(
          parseUnits(
            getFixedValue(typedValue, inputCurrency?.decimals),
            inputCurrency?.decimals,
          ),
        ),
      )
    : undefined;
  const [approvalState, approveCallback] = useApproveCallbackV3(
    parsedAmount,
    zapContractAddress,
  );
  const handleApprove = useCallback(() => {
    setPendingTx(true);
    approveCallback().finally(() => {
      setPendingTx(false);
    });
  }, [approveCallback]);

  const [openZapSlippage, setOpenZapSlippage] = useState(false);

  const splited = bond?.lpToken?.symbol?.split('-');
  const lpTokenACurrency = useCurrencyFromSymbol(splited?.[0]);
  const lpTokenBCurrency = useCurrencyFromSymbol(splited?.[1]);

  return (
    <CustomModal
      open={open}
      onClose={onDismiss}
      modalWrapper='soulZapAddLiquidityModal'
    >
      {openZapSlippage && (
        <ZapSlippage
          open={openZapSlippage}
          onClose={() => setOpenZapSlippage(false)}
        />
      )}
      <Box p={2}>
        <Box
          className='flex items-center justify-between border-bottom'
          pb={2}
          mb={2}
        >
          <h4>Liquidity</h4>
          <Box className='flex items-center' gridGap={4}>
            <SettingsIcon
              className='cursor-pointer'
              onClick={() => setOpenZapSlippage(true)}
            />
            <CloseIcon className='cursor-pointer' onClick={onDismiss} />
          </Box>
        </Box>
        <p>{t('from')}:</p>
        <Box mt={1.5}>
          <ZapCurrencyInput
            currency={inputCurrency ?? undefined}
            otherCurrency={undefined}
            handleCurrencySelect={(cur: Currency) =>
              handleCurrencySelect(Field.INPUT, [cur])
            }
            amount={typedValue}
            setAmount={setTypedValue}
            onMax={() => handleMaxInput(Field.INPUT)}
            showMaxButton
          />
        </Box>
        <Box className='soulZapAddLiquidityArrowWrapper'>
          <BondArrow />
        </Box>
        <p>{t('to')}:</p>
        <Box className='soulZapAddLiquidityInput' my={1.5}>
          <Box className='flex items-center'>
            <NumericalInput value={bigValue} onUserInput={() => null} />
            <Box className='soulZapAddLiquidityCurrency' gridGap={8}>
              <DoubleCurrencyLogo
                currency0={lpTokenACurrency ?? undefined}
                currency1={lpTokenBCurrency ?? undefined}
                size={24}
              />
              <p>{bond?.lpToken?.symbol}</p>
            </Box>
          </Box>
          <Box className='flex justify-between' mt='12px'>
            <small className='text-secondary'>
              {!bond?.lpPrice && consideredValue !== '0.0' ? (
                <Loader />
              ) : consideredValue !== '0.0' &&
                bond?.lpPrice &&
                bond?.lpPrice !== 0 &&
                consideredValue ? (
                `$${outputUSD.toFixed(2)}`
              ) : null}
            </small>
            {account ? (
              <small>
                {t('balance')}: {lpBalanceString || 'loading'}
                {!lpBalanceString && <span className='loadingDots' />}
              </small>
            ) : null}
          </Box>
        </Box>
        {approvalState === ApprovalState.NOT_APPROVED ||
        approvalState === ApprovalState.PENDING ? (
          <Button
            onClick={handleApprove}
            fullWidth
            disabled={approvalState === ApprovalState.PENDING || pendingTx}
          >
            {pendingTx || approvalState === ApprovalState.PENDING
              ? t('enabling')
              : t('enable')}
          </Button>
        ) : (
          <Button
            onClick={soulZapCallback}
            fullWidth
            disabled={
              loading || pendingTx || !typedValue || !zapData || !lpCurrency
            }
          >
            {t('buy')}
          </Button>
        )}
        <Box className='soulZapAddLiquidityLink' mt='20px'>
          <a
            href='https://apeswap.gitbook.io/apeswap-finance/product-and-features/exchange/liquidity'
            target='_blank'
            rel='noreferrer'
          >
            {t('learnMore')}
            {' ->'}
          </a>
        </Box>
      </Box>
    </CustomModal>
  );
};

export default SoulZapApiAddLiquidity;
