import React, { FC, useCallback, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { AML_SCORE_THRESHOLD } from 'config';
import { ReactComponent as SettingsIcon } from 'assets/images/SettingsIcon.svg';
// Components
import DoubleCurrencyLogo from 'components/DoubleCurrencyLogo';

import { useCurrency } from 'hooks/v3/Tokens';
import { useSoulZapQuote } from 'state/zap/soulZap/useSoulZapQuote';
import {
  ApprovalState,
  useApproveCallbackV3,
} from '../../hooks/useApproveCallback';
import { useZapActionHandlers, useZapState } from 'state/zap/hooks';

import { Field } from 'state/zap/actions';
import { ZapDataBond } from '@soulsolidity/soulzap-v1/dist/src/types';
import { DEX } from '@soulsolidity/soulzap-v1';
import { LiquidityDex } from '@ape.swap/apeswap-lists';
import { useTransactionAdder } from 'state/transactions/hooks';
import { useSoulZap } from 'state/application/hooks';
import { useCurrencyBalance, useCurrencyBalances } from 'state/wallet/v3/hooks';
import { useAmlScore } from 'state/user/hooks';
import { Currency, CurrencyAmount } from '@uniswap/sdk-core';
import { maxAmountSpend } from 'utils/v3/maxAmountSpend';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { JSBI } from '@uniswap/sdk';
import { CustomModal, NumericalInput } from 'components';
import { Box, Button } from '@material-ui/core';
import Loader from 'components/Loader';
import { getFixedValue, getLiquidityDEX } from 'utils';
import ZapSlippage from './DualAddLiquidity/ZapSlippage';
import { ReactComponent as BondArrow } from 'assets/images/bondArrow.svg';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import { useTranslation } from 'react-i18next';
import ZapCurrencyInput from 'components/ZapCurrencyInput';
import { useActiveWeb3React } from 'hooks';
import { BondToken } from 'types/bond';
import { useCurrencyFromSymbol } from 'hooks/Tokens';

interface SoulZapAddLiquidityProps {
  open: boolean;
  onDismiss?: () => void;
  lpToken?: BondToken;
  liquidityDex?: LiquidityDex;
  lpPrice?: number;
}

const SoulZapAddLiquidity: FC<SoulZapAddLiquidityProps> = ({
  open,
  onDismiss,
  lpToken,
  liquidityDex,
  lpPrice,
}) => {
  const history = useHistory();
  const { t } = useTranslation();
  // Loading state for both approve and purchase functions
  const [pendingTx, setPendingTx] = useState(false);

  // Hooks
  const { account, provider, chainId } = useActiveWeb3React();
  // const [onPresentSettingsModal] = useModal(<ZapSlippage />);
  const addTransaction = useTransactionAdder();

  // Zap hooks
  const soulZap = useSoulZap();
  const { INPUT, typedValue } = useZapState();
  const { onUserInput, onCurrencySelection } = useZapActionHandlers();
  const { loading, response: zapData } = useSoulZapQuote(
    lpToken?.address[chainId] ?? '',
    getLiquidityDEX(liquidityDex) as DEX,
    false,
  );

  const inputCurrency = useCurrency(INPUT.currencyId);
  const lpCurrency = useCurrency(lpToken?.address[chainId] ?? '');
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

  const { isLoading: isAmlScoreLoading, score: amlScore } = useAmlScore();

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
    if (amlScore > AML_SCORE_THRESHOLD) {
      history.push('/forbidden');
      return;
    }
    if (soulZap && zapData) {
      console.log('Attempting zap tx');
      console.log(zapData);
      setPendingTx(true);
      return await soulZap
        //TODO: remove ts ignore once type is fixed
        //@ts-ignore
        .zap(zapData as ZapDataBond)
        .then((res) => {
          console.log('Successful tx');
          console.log(res);
          if (res.success) {
            addTransaction(
              undefined,
              {
                summary: t('zapBond'),
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
  }, [addTransaction, history, amlScore, provider, soulZap, t, zapData]);

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
  const splited = lpToken?.symbol?.split('-');
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
            setAmount={(val: string) => onUserInput(Field.INPUT, val)}
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
            <NumericalInput
              fontSize={22}
              value={bigValue}
              onUserInput={() => null}
            />
            <Box className='soulZapAddLiquidityCurrency' gridGap={8}>
              <DoubleCurrencyLogo
                currency0={lpTokenACurrency}
                currency1={lpTokenBCurrency}
                size={24}
              />
              <p>{lpToken?.symbol}</p>
            </Box>
          </Box>
          <Box className='flex justify-between' mt='12px'>
            <small className='text-secondary'>
              {!lpPrice && consideredValue !== '0.0' ? (
                <Loader />
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
            disabled={
              loading ||
              pendingTx ||
              !zapData ||
              !lpCurrency ||
              isAmlScoreLoading
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

export default SoulZapAddLiquidity;
