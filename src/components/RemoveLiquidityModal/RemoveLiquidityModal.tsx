import React, { useState, useMemo, useCallback } from 'react';
import { Contract } from '@ethersproject/contracts';
import { ArrowLeft, ArrowDown } from 'react-feather';
import { Box, Typography, Button } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Currency, ETHER, JSBI, Percent } from '@uniswap/sdk';
import ReactGA from 'react-ga';
import { BigNumber } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/providers';
import { GlobalConst } from 'constants/index';
import {
  CustomModal,
  DoubleCurrencyLogo,
  ColoredSlider,
  CurrencyLogo,
  TransactionConfirmationModal,
  TransactionErrorContent,
  ConfirmationModalContent,
  NumericalInput,
} from 'components';
import {
  useDerivedBurnInfo,
  useBurnState,
  useBurnActionHandlers,
} from 'state/burn/hooks';
import { Field } from 'state/burn/actions';
import { useUserSlippageTolerance } from 'state/user/hooks';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { useTokenBalance } from 'state/wallet/hooks';
import { useActiveWeb3React } from 'hooks';
import { usePairContract } from 'hooks/useContract';
import {
  calculateGasMargin,
  calculateSlippageAmount,
  formatTokenAmount,
} from 'utils';
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler';
import useTransactionDeadline from 'hooks/useTransactionDeadline';
import { useApproveCallback, ApprovalState } from 'hooks/useApproveCallback';
import { useRouterContract } from 'hooks/useContract';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import { useTotalSupply } from 'data/TotalSupply';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';

const useStyles = makeStyles(({ palette }) => ({
  removeButton: {
    backgroundImage:
      'linear-gradient(104deg, #004ce6 -32%, #0098ff 54%, #00cff3 120%, #64fbd3 198%)',
    backgroundColor: 'transparent',
    height: 48,
    width: '48%',
    borderRadius: 10,
    '& span': {
      fontSize: 16,
      fontWeight: 600,
    },
    '&.Mui-disabled': {
      backgroundImage: 'none',
      backgroundColor: palette.secondary.dark,
    },
  },
}));

interface RemoveLiquidityModalProps {
  currency0: Currency;
  currency1: Currency;
  open: boolean;
  onClose: () => void;
}

const RemoveLiquidityModal: React.FC<RemoveLiquidityModalProps> = ({
  currency0,
  currency1,
  open,
  onClose,
}) => {
  const classes = useStyles();
  const { palette } = useTheme();
  const [showConfirm, setShowConfirm] = useState(false);
  const [txPending, setTxPending] = useState(false);
  const [approving, setApproving] = useState(false);
  const [attemptingTxn, setAttemptingTxn] = useState(false);
  const [removeErrorMessage, setRemoveErrorMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [txHash, setTxHash] = useState('');
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();
  const { chainId, account, library } = useActiveWeb3React();
  const [tokenA, tokenB] = useMemo(
    () => [
      wrappedCurrency(currency0, chainId),
      wrappedCurrency(currency1, chainId),
    ],
    [currency0, currency1, chainId],
  );

  const { independentField, typedValue } = useBurnState();
  const { pair, parsedAmounts, error } = useDerivedBurnInfo(
    currency0,
    currency1,
  );
  const deadline = useTransactionDeadline();
  const { onUserInput: _onUserInput } = useBurnActionHandlers();
  const [allowedSlippage] = useUserSlippageTolerance();

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      return _onUserInput(field, typedValue);
    },
    [_onUserInput],
  );

  const onLiquidityInput = useCallback(
    (typedValue: string): void => onUserInput(Field.LIQUIDITY, typedValue),
    [onUserInput],
  );

  const liquidityPercentChangeCallback = useCallback(
    (value: number) => {
      onUserInput(Field.LIQUIDITY_PERCENT, value.toString());
    },
    [onUserInput],
  );

  const [
    innerLiquidityPercentage,
    setInnerLiquidityPercentage,
  ] = useDebouncedChangeHandler(
    Number.parseInt(parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0)),
    liquidityPercentChangeCallback,
  );
  const userPoolBalance = useTokenBalance(
    account ?? undefined,
    pair?.liquidityToken,
  );
  const totalPoolTokens = useTotalSupply(pair?.liquidityToken);
  const poolTokenPercentage =
    !!userPoolBalance &&
    !!totalPoolTokens &&
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined;

  const formattedAmounts = {
    [Field.LIQUIDITY_PERCENT]: parsedAmounts[Field.LIQUIDITY_PERCENT].equalTo(
      '0',
    )
      ? '0'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].lessThan(new Percent('1', '100'))
      ? '<1'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
    [Field.LIQUIDITY]:
      independentField === Field.LIQUIDITY
        ? typedValue
        : parsedAmounts[Field.LIQUIDITY]?.toExact() ?? '',
    [Field.CURRENCY_A]:
      independentField === Field.CURRENCY_A
        ? typedValue
        : parsedAmounts[Field.CURRENCY_A]?.toExact() ?? '',
    [Field.CURRENCY_B]:
      independentField === Field.CURRENCY_B
        ? typedValue
        : parsedAmounts[Field.CURRENCY_B]?.toExact() ?? '',
  };

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(
            pair.token0,
            totalPoolTokens,
            userPoolBalance,
            false,
          ),
          pair.getLiquidityValue(
            pair.token1,
            totalPoolTokens,
            userPoolBalance,
            false,
          ),
        ]
      : [undefined, undefined];

  const pairContract: Contract | null = usePairContract(
    pair?.liquidityToken?.address,
  );
  const [approval, approveCallback] = useApproveCallback(
    parsedAmounts[Field.LIQUIDITY],
    chainId ? GlobalConst.addresses.ROUTER_ADDRESS[chainId] : undefined,
  );
  const onAttemptToApprove = async () => {
    if (!pairContract || !pair || !library || !deadline) {
      setErrorMsg('missing dependencies');
      return;
    }
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY];
    if (!liquidityAmount) {
      setErrorMsg('missing liquidity amount');
      return;
    }
    setApproving(true);
    try {
      await approveCallback();
      setApproving(false);
    } catch (e) {
      setApproving(false);
    }
  };

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    setTxHash('');
  }, []);

  const router = useRouterContract();

  const onRemove = async () => {
    if (!chainId || !library || !account || !deadline || !router)
      throw new Error('missing dependencies');
    const {
      [Field.CURRENCY_A]: currencyAmountA,
      [Field.CURRENCY_B]: currencyAmountB,
    } = parsedAmounts;
    if (!currencyAmountA || !currencyAmountB) {
      throw new Error('missing currency amounts');
    }

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(
        currencyAmountA,
        allowedSlippage,
      )[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(
        currencyAmountB,
        allowedSlippage,
      )[0],
    };

    const liquidityAmount = parsedAmounts[Field.LIQUIDITY];
    if (!liquidityAmount) throw new Error('missing liquidity amount');

    const currencyBIsETH = currency1 === ETHER;
    const oneCurrencyIsETH = currency0 === ETHER || currencyBIsETH;

    if (!tokenA || !tokenB) throw new Error('could not wrap');

    let methodNames: string[],
      args: Array<string | string[] | number | boolean>;
    // we have approval, use normal remove liquidity
    if (approval === ApprovalState.APPROVED) {
      // removeLiquidityETH
      if (oneCurrencyIsETH) {
        methodNames = [
          'removeLiquidityETH',
          'removeLiquidityETHSupportingFeeOnTransferTokens',
        ];
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[
            currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B
          ].toString(),
          amountsMin[
            currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A
          ].toString(),
          account,
          deadline.toHexString(),
        ];
      }
      // removeLiquidity
      else {
        methodNames = ['removeLiquidity'];
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          deadline.toHexString(),
        ];
      }
    } else {
      throw new Error(
        'Attempting to confirm without approval. Please contact support.',
      );
    }

    const safeGasEstimates: (BigNumber | undefined)[] = await Promise.all(
      methodNames.map((methodName) =>
        router.estimateGas[methodName](...args)
          .then(calculateGasMargin)
          .catch((error) => {
            console.error(`estimateGas failed`, methodName, args, error);
            return undefined;
          }),
      ),
    );

    const indexOfSuccessfulEstimation = safeGasEstimates.findIndex(
      (safeGasEstimate) => BigNumber.isBigNumber(safeGasEstimate),
    );

    // all estimations failed...
    if (indexOfSuccessfulEstimation === -1) {
      console.error('This transaction would fail. Please contact support.');
    } else {
      const methodName = methodNames[indexOfSuccessfulEstimation];
      const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation];

      setAttemptingTxn(true);
      await router[methodName](...args, {
        gasLimit: safeGasEstimate,
      })
        .then(async (response: TransactionResponse) => {
          setAttemptingTxn(false);
          setTxPending(true);
          const summary =
            'Remove ' +
            parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
            ' ' +
            currency0.symbol +
            ' and ' +
            parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
            ' ' +
            currency1.symbol;

          addTransaction(response, {
            summary,
          });

          setTxHash(response.hash);

          try {
            const receipt = await response.wait();
            finalizedTransaction(receipt, {
              summary,
            });
            setTxPending(false);
          } catch (error) {
            setTxPending(false);
            setRemoveErrorMessage('There is an error in transaction.');
          }

          ReactGA.event({
            category: 'Liquidity',
            action: 'Remove',
            label: [currency0.symbol, currency1.symbol].join('/'),
          });
        })
        .catch((error: Error) => {
          setAttemptingTxn(false);
          // we only care if the error is something _other_ than the user rejected the tx
          console.error(error);
        });
    }
  };

  const modalHeader = () => {
    return (
      <Box>
        <Box mt={10} mb={3} display='flex' justifyContent='center'>
          <DoubleCurrencyLogo
            currency0={currency0}
            currency1={currency1}
            size={48}
          />
        </Box>
        <Box mb={6} color={palette.text.primary} textAlign='center'>
          <Typography variant='h6'>
            Removing {formattedAmounts[Field.LIQUIDITY]} {currency0.symbol} /{' '}
            {currency1.symbol} LP Tokens
            <br />
            You will receive {parsedAmounts[Field.CURRENCY_A]?.toSignificant(
              2,
            )}{' '}
            {currency0.symbol} and{' '}
            {parsedAmounts[Field.CURRENCY_B]?.toSignificant(2)}{' '}
            {currency1.symbol}
          </Typography>
        </Box>
        <Box mb={3} color={palette.text.secondary} textAlign='center'>
          <Typography variant='body2'>
            {`Output is estimated. If the price changes by more than ${allowedSlippage /
              100}% your transaction will revert.`}
          </Typography>
        </Box>
        <Box mt={2}>
          <Button
            style={{ width: '100%' }}
            className={classes.removeButton}
            onClick={onRemove}
          >
            Confirm
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <CustomModal open={open} onClose={onClose}>
      <Box paddingX={3} paddingY={4}>
        {showConfirm && (
          <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={handleDismissConfirmation}
            attemptingTxn={attemptingTxn}
            txPending={txPending}
            hash={txHash}
            content={() =>
              removeErrorMessage ? (
                <TransactionErrorContent
                  onDismiss={handleDismissConfirmation}
                  message={removeErrorMessage}
                />
              ) : (
                <ConfirmationModalContent
                  title='Removing Liquidity'
                  onDismiss={handleDismissConfirmation}
                  content={modalHeader}
                />
              )
            }
            pendingText=''
            modalContent={
              txPending
                ? 'Submitted transaction to remove liquidity'
                : 'Successfully removed liquidity'
            }
          />
        )}
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <ArrowLeft
            color={palette.text.secondary}
            style={{ cursor: 'pointer' }}
            onClick={onClose}
          />
          <Typography
            variant='subtitle2'
            style={{ color: palette.text.primary }}
          >
            Remove Liquidity
          </Typography>
          <CloseIcon style={{ cursor: 'pointer' }} onClick={onClose} />
        </Box>
        <Box
          mt={3}
          bgcolor={palette.background.default}
          border='1px solid rgba(105, 108, 128, 0.12)'
          borderRadius='10px'
          padding='16px'
        >
          <Box
            display='flex'
            alignItems='center'
            justifyContent='space-between'
          >
            <Typography variant='body2'>
              {currency0.symbol} / {currency1.symbol} LP
            </Typography>
            <Typography variant='body2'>
              Balance: {formatTokenAmount(userPoolBalance)}
            </Typography>
          </Box>
          <Box mt={2}>
            <NumericalInput
              placeholder='0'
              value={formattedAmounts[Field.LIQUIDITY]}
              fontSize={28}
              onUserInput={(value) => {
                onLiquidityInput(value);
              }}
            />
          </Box>
          <Box display='flex' alignItems='center'>
            <Box flex={1} mr={2} mt={0.5}>
              <ColoredSlider
                min={1}
                max={100}
                step={1}
                value={innerLiquidityPercentage}
                onChange={(evt: any, value) =>
                  setInnerLiquidityPercentage(value as number)
                }
              />
            </Box>
            <Typography variant='body2'>
              {formattedAmounts[Field.LIQUIDITY_PERCENT]}%
            </Typography>
          </Box>
        </Box>
        <Box display='flex' my={3} justifyContent='center'>
          <ArrowDown color={palette.text.secondary} />
        </Box>
        <Box
          padding='16px'
          bgcolor={palette.secondary.light}
          borderRadius='10px'
        >
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
          >
            <Typography variant='body1'>Pooled {currency0.symbol}</Typography>
            <Box display='flex' alignItems='center'>
              <Typography variant='body1' style={{ marginRight: 6 }}>
                {formatTokenAmount(token0Deposited)}
              </Typography>
              <CurrencyLogo currency={currency0} />
            </Box>
          </Box>
          <Box
            mt={1}
            display='flex'
            justifyContent='space-between'
            alignItems='center'
          >
            <Typography
              variant='body1'
              style={{ color: 'rgba(68, 138, 255, 0.5)' }}
            >
              - Withdraw {currency0.symbol}
            </Typography>
            <Typography
              variant='body1'
              style={{ color: 'rgba(68, 138, 255, 0.5)' }}
            >
              {formattedAmounts[Field.CURRENCY_A]}
            </Typography>
          </Box>
          <Box
            mt={1}
            display='flex'
            justifyContent='space-between'
            alignItems='center'
          >
            <Typography variant='body1'>Pooled {currency1.symbol}</Typography>
            <Box display='flex' alignItems='center'>
              <Typography variant='body1' style={{ marginRight: 6 }}>
                {formatTokenAmount(token1Deposited)}
              </Typography>
              <CurrencyLogo currency={currency1} />
            </Box>
          </Box>
          <Box
            mt={1}
            display='flex'
            justifyContent='space-between'
            alignItems='center'
          >
            <Typography
              variant='body1'
              style={{ color: 'rgba(68, 138, 255, 0.5)' }}
            >
              - Withdraw {currency1.symbol}
            </Typography>
            <Typography
              variant='body1'
              style={{ color: 'rgba(68, 138, 255, 0.5)' }}
            >
              {formattedAmounts[Field.CURRENCY_B]}
            </Typography>
          </Box>
          <Box
            mt={1}
            display='flex'
            justifyContent='space-between'
            alignItems='center'
          >
            <Typography variant='body1'>Your Pool Share</Typography>
            <Typography variant='body1'>
              {poolTokenPercentage
                ? poolTokenPercentage.toSignificant() + '%'
                : '-'}
            </Typography>
          </Box>
        </Box>
        {pair && (
          <Box
            display='flex'
            mt={2}
            px={2}
            alignItems='center'
            justifyContent='space-between'
          >
            <Typography variant='body2'>
              1 {currency0.symbol} ={' '}
              {tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'}{' '}
              {currency1.symbol}
            </Typography>
            <Typography variant='body2'>
              1 {currency1.symbol} ={' '}
              {tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'}{' '}
              {currency0.symbol}
            </Typography>
          </Box>
        )}
        <Box
          mt={2}
          display='flex'
          alignItems='center'
          justifyContent='space-between'
        >
          <Button
            className={classes.removeButton}
            onClick={onAttemptToApprove}
            disabled={approving || approval !== ApprovalState.NOT_APPROVED}
          >
            {approving
              ? 'Approving...'
              : approval === ApprovalState.APPROVED
              ? 'Approved'
              : 'Approve'}
          </Button>
          <Button
            className={classes.removeButton}
            onClick={() => {
              setShowConfirm(true);
            }}
            disabled={Boolean(error) || approval !== ApprovalState.APPROVED}
          >
            {error || 'Remove'}
          </Button>
        </Box>
        <Box mt={2}>
          <Typography variant='body1' style={{ color: palette.error.main }}>
            {errorMsg}
          </Typography>
        </Box>
      </Box>
    </CustomModal>
  );
};

export default RemoveLiquidityModal;
