import React, { FC, useCallback, useMemo, useState } from 'react';
import { Settings, Close } from '@mui/icons-material';
import DoubleCurrencyLogo from 'components/DoubleCurrencyLogo';

import { useCurrency } from 'hooks/v3/Tokens';
import { useSoulZapQuote } from 'state/zap/soulZap/useSoulZapQuote';
import { ApprovalState, useApproveCallbackV3 } from 'hooks/useApproveCallback';
import { useZapActionHandlers, useZapState } from 'state/zap/hooks';
import { Field } from 'state/zap/actions';
import { ZapDataBond } from '@soulsolidity/soulzap-v1/dist/src/types';
import { DEX } from '@soulsolidity/soulzap-v1';
import { LiquidityDex } from '@ape.swap/apeswap-lists';
import { useTransactionAdder } from 'state/transactions/hooks';
import { useSoulZap } from 'state/application/hooks';
import { useCurrencyBalance, useCurrencyBalances } from 'state/wallet/v3/hooks';
import { Currency, CurrencyAmount } from '@uniswap/sdk-core';
import { maxAmountSpend } from 'utils/v3/maxAmountSpend';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { JSBI } from '@uniswap/sdk';
import { CustomModal, NumericalInput } from 'components';
import { Box, Button, CircularProgress } from '@mui/material';
import { getFixedValue, getLiquidityDEX } from 'utils';
import ZapSlippage from './DualAddLiquidity/ZapSlippage';
import { useTranslation } from 'next-i18next';
import ZapCurrencyInput from 'components/ZapCurrencyInput';
import { useActiveWeb3React } from 'hooks';
import styles from 'styles/pages/Bonds.module.scss';

interface SoulZapAddLiquidityProps {
  open: boolean;
  onDismiss?: () => void;
  lpAddress?: string;
  liquidityDex?: LiquidityDex;
  lpPrice?: number;
  token0?: string;
  token1?: string;
}

const SoulZapAddLiquidity: FC<SoulZapAddLiquidityProps> = ({
  open,
  onDismiss,
  lpAddress,
  liquidityDex,
  lpPrice,
  token0,
  token1,
}) => {
  const { t } = useTranslation();
  // Loading state for both approve and purchase functions
  const [pendingTx, setPendingTx] = useState(false);

  // Hooks
  const { account, provider } = useActiveWeb3React();
  // const [onPresentSettingsModal] = useModal(<ZapSlippage />);
  const addTransaction = useTransactionAdder();

  // Zap hooks
  const soulZap = useSoulZap();
  const { INPUT, typedValue } = useZapState();
  const { onUserInput, onCurrencySelection } = useZapActionHandlers();
  const { loading, response: zapData } = useSoulZapQuote(
    lpAddress ?? '',
    getLiquidityDEX(liquidityDex) as DEX,
    false,
  );

  const lpTokenACurrency = useCurrency(token0);
  const lpTokenBCurrency = useCurrency(token1);
  const inputCurrency = useCurrency(INPUT.currencyId);
  const lpCurrency = useCurrency(lpAddress);
  const lpBalanceString = useCurrencyBalance(
    account,
    lpCurrency ?? undefined,
  )?.toSignificant(6);
  const consideredValue =
    zapData?.zapParams?.liquidityPath?.lpAmount.toString() ?? '0';
  const bigValue = formatUnits(consideredValue, 18);

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
      onUserInput(field, '');
      onCurrencySelection(field, currency);
    },
    [onCurrencySelection, onUserInput],
  );

  const handleMaxInput = useCallback(
    (field: Field) => {
      const maxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = {
        [Field.INPUT]: maxAmountSpend(currencyBalances[Field.INPUT]),
        [Field.OUTPUT]: maxAmountSpend(currencyBalances[Field.OUTPUT]),
      };
      if (maxAmounts) {
        onUserInput(field, maxAmounts[field]?.toExact() ?? '');
      }
    },
    [currencyBalances, onUserInput],
  );

  const soulZapCallback = useCallback(async () => {
    if (soulZap && zapData) {
      console.log('Attempting zap tx');
      console.log(zapData);
      setPendingTx(true);
      return await soulZap
        //TODO: remove ts ignore once type is fixed
        //@ts-ignore
        .zap(zapData as ZapDataBond)
        .then((res: any) => {
          console.log('Successful tx');
          console.log(res);
          if (res.success) {
            addTransaction(
              undefined,
              {
                summary: t('zapBond') ?? '',
              },
              res.txHash,
            );
            provider
              ?.waitForTransaction(res.txHash)
              .then(() => {
                setPendingTx(false);
              })
              .catch((e) => {
                setPendingTx(false);
                console.error(e);
              });
          } else {
            setPendingTx(false);
            console.log(res);
          }
        })
        .catch((e) => {
          console.log(e);
          setPendingTx(false);
        });
    }
  }, [addTransaction, provider, soulZap, t, zapData]);

  // Approve logic
  const zapContractAddress = soulZap?.getZapContract().address;
  const currency = useCurrency(INPUT.currencyId);
  const parsedAmount = currency
    ? CurrencyAmount.fromRawAmount(
        currency,
        JSBI.BigInt(
          parseUnits(
            getFixedValue(typedValue, currency?.decimals),
            currency?.decimals,
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

  return (
    <CustomModal
      open={open}
      onClose={onDismiss}
      modalWrapper={styles.soulZapAddLiquidityModal}
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
          <Box className='flex items-center' gap='4px'>
            <Settings
              className='cursor-pointer'
              onClick={() => setOpenZapSlippage(true)}
            />
            <Close className='cursor-pointer' onClick={onDismiss} />
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
            setAmount={(val: string) => onUserInput(Field.INPUT, val)}
            onMax={() => handleMaxInput(Field.INPUT)}
            showMaxButton
          />
        </Box>
        <Box className={styles.soulZapAddLiquidityArrowWrapper}>
          <picture>
            <img src='/assets/images/bondArrow.svg' alt='Bond Arrow' />
          </picture>
        </Box>
        <p>{t('to')}:</p>
        <Box className={styles.soulZapAddLiquidityInput} my={1.5}>
          <Box className='flex items-center'>
            <NumericalInput
              fontSize={22}
              value={bigValue}
              onUserInput={() => null}
            />
            <Box className={styles.soulZapAddLiquidityCurrency} gap='8px'>
              <DoubleCurrencyLogo
                currency0={lpTokenACurrency ?? undefined}
                currency1={lpTokenBCurrency ?? undefined}
                size={24}
              />
              <p>
                {lpTokenBCurrency?.symbol}-{lpTokenACurrency?.symbol}
              </p>
            </Box>
          </Box>
          <Box className='flex justify-between' mt='12px'>
            <small className='text-secondary'>
              {!lpPrice && consideredValue !== '0.0' ? (
                <CircularProgress size='16px' />
              ) : consideredValue !== '0.0' &&
                lpPrice &&
                lpPrice !== 0 &&
                consideredValue ? (
                `$${(lpPrice * parseFloat(bigValue.toString())).toFixed(2)}`
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
            disabled={loading || pendingTx || !zapData || !lpCurrency}
          >
            {t('buy')}
          </Button>
        )}
        <Box className={styles.soulZapAddLiquidityLink} mt='20px'>
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

export default SoulZapAddLiquidity;
