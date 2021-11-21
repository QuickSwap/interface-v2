import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Typography } from '@material-ui/core';
import {
  CurrencyInput,
  TransactionErrorContent,
  TransactionConfirmationModal,
  ConfirmationModalContent,
  DoubleCurrencyLogo,
} from 'components';
import { makeStyles } from '@material-ui/core/styles';
import { useWalletModalToggle } from 'state/application/hooks';
import { TransactionResponse } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import ReactGA from 'react-ga';
import { Currency, Token, ETHER, TokenAmount } from '@uniswap/sdk';
import { ROUTER_ADDRESS } from 'constants/index';
import { useAllTokens } from 'hooks/Tokens';
import { useActiveWeb3React } from 'hooks';
import useTransactionDeadline from 'hooks/useTransactionDeadline';
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback';
import { Field } from 'state/mint/actions';
import { PairState } from 'data/Reserves';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import {
  useDerivedMintInfo,
  useMintActionHandlers,
  useMintState,
} from 'state/mint/hooks';
import { useTokenBalance } from 'state/wallet/hooks';
import { useIsExpertMode, useUserSlippageTolerance } from 'state/user/hooks';
import {
  maxAmountSpend,
  addMaticToMetamask,
  getRouterContract,
  calculateSlippageAmount,
  calculateGasMargin,
} from 'utils';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import { ReactComponent as AddLiquidityIcon } from 'assets/images/AddLiquidityIcon.svg';

const useStyles = makeStyles(({}) => ({
  exchangeSwap: {
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '16px auto',
    zIndex: 2,
    position: 'relative',
  },
  swapButtonWrapper: {
    marginTop: 16,
    '& button': {
      height: 56,
      fontSize: 18,
      fontWeight: 600,
      width: (props: any) => (props.showApproveFlow ? '48%' : '100%'),
      backgroundImage: 'linear-gradient(to bottom, #448aff, #004ce6)',
      '&.Mui-disabled': {
        backgroundImage: 'linear-gradient(to bottom, #282d3d, #1d212c)',
        color: '#696c80',
        opacity: 0.5,
      },
      '& .content': {
        display: 'flex',
        alignItems: 'center',
        '& > div': {
          color: 'white',
          marginLeft: 6,
        },
      },
    },
  },
  swapPrice: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '6px 24px 0',
    '& p': {
      display: 'flex',
      alignItems: 'center',
      color: '#c7cad9',
      '& svg': {
        marginLeft: 8,
        width: 16,
        height: 16,
        cursor: 'pointer',
      },
    },
  },
  approveButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
}));

const AddLiquidity: React.FC<{
  currency0?: Currency;
  currency1?: Currency;
}> = ({ currency0, currency1 }) => {
  const classes = useStyles({});
  const [addLiquidityErrorMessage, setAddLiquidityErrorMessage] = useState<
    string | null
  >(null);

  const { account, chainId, library } = useActiveWeb3React();

  const [showConfirm, setShowConfirm] = useState(false);
  const [attemptingTxn, setAttemptingTxn] = useState(false);
  const [txPending, setTxPending] = useState(false);
  const [allowedSlippage] = useUserSlippageTolerance();
  const deadline = useTransactionDeadline();
  const [txHash, setTxHash] = useState('');
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();

  const { independentField, typedValue, otherTypedValue } = useMintState();
  const expertMode = useIsExpertMode();
  const {
    dependentField,
    currencies,
    pair,
    pairState,
    currencyBalances,
    parsedAmounts,
    price,
    noLiquidity,
    liquidityMinted,
    poolTokenPercentage,
    error,
  } = useDerivedMintInfo();

  const pendingText = `Supplying ${parsedAmounts[
    Field.CURRENCY_A
  ]?.toSignificant(6)} ${
    currencies[Field.CURRENCY_A]?.symbol
  } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${
    currencies[Field.CURRENCY_B]?.symbol
  }`;

  const {
    onFieldAInput,
    onFieldBInput,
    onCurrencySelection,
  } = useMintActionHandlers(noLiquidity);

  const allTokens = useAllTokens();

  const maxAmounts: { [field in Field]?: TokenAmount } = [
    Field.CURRENCY_A,
    Field.CURRENCY_B,
  ].reduce((accumulator, field) => {
    return {
      ...accumulator,
      [field]: maxAmountSpend(currencyBalances[field]),
    };
  }, {});

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: noLiquidity
      ? otherTypedValue
      : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  };

  const { ethereum } = window as any;

  const isnotMatic =
    ethereum && ethereum.isMetaMask && Number(ethereum.chainId) !== 137;
  const toggleWalletModal = useWalletModalToggle();
  const [approvalA, approveACallback] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_A],
    ROUTER_ADDRESS,
  );
  const [approvalB, approveBCallback] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_B],
    ROUTER_ADDRESS,
  );

  const userPoolBalance = useTokenBalance(
    account ?? undefined,
    pair?.liquidityToken,
  );

  const atMaxAmounts: { [field in Field]?: TokenAmount } = [
    Field.CURRENCY_A,
    Field.CURRENCY_B,
  ].reduce((accumulator, field) => {
    return {
      ...accumulator,
      [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0'),
    };
  }, {});

  const handleCurrencyASelect = useCallback(
    (currencyA: Currency) => {
      onCurrencySelection(Field.CURRENCY_A, currencyA);
    },
    [onCurrencySelection],
  );

  const handleCurrencyBSelect = useCallback(
    (currencyB: Currency) => {
      onCurrencySelection(Field.CURRENCY_B, currencyB);
    },
    [onCurrencySelection],
  );

  useEffect(() => {
    if (currency0) {
      onCurrencySelection(Field.CURRENCY_A, currency0);
    } else {
      onCurrencySelection(Field.CURRENCY_A, Token.ETHER);
    }
    if (currency1) {
      onCurrencySelection(Field.CURRENCY_B, currency1);
    } else {
      const quickToken = Object.values(allTokens).find(
        (val) => val.symbol === 'QUICK',
      );
      if (quickToken) {
        onCurrencySelection(Field.CURRENCY_B, quickToken);
      }
    }
  }, [onCurrencySelection, allTokens, currency0, currency1]);

  const onAdd = () => {
    if (expertMode) {
      onAddLiquidity();
    } else {
      setShowConfirm(true);
    }
  };

  const onAddLiquidity = async () => {
    if (!chainId || !library || !account) return;
    const router = getRouterContract(chainId, library, account);

    const {
      [Field.CURRENCY_A]: parsedAmountA,
      [Field.CURRENCY_B]: parsedAmountB,
    } = parsedAmounts;
    if (
      !parsedAmountA ||
      !parsedAmountB ||
      !currencies[Field.CURRENCY_A] ||
      !currencies[Field.CURRENCY_B] ||
      !deadline
    ) {
      return;
    }

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(
        parsedAmountA,
        noLiquidity ? 0 : allowedSlippage,
      )[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(
        parsedAmountB,
        noLiquidity ? 0 : allowedSlippage,
      )[0],
    };

    let estimate,
      method: (...args: any) => Promise<TransactionResponse>,
      args: Array<string | string[] | number>,
      value: BigNumber | null;
    if (
      currencies[Field.CURRENCY_A] === ETHER ||
      currencies[Field.CURRENCY_B] === ETHER
    ) {
      const tokenBIsETH = currencies[Field.CURRENCY_B] === ETHER;
      estimate = router.estimateGas.addLiquidityETH;
      method = router.addLiquidityETH;
      args = [
        wrappedCurrency(
          tokenBIsETH
            ? currencies[Field.CURRENCY_A]
            : currencies[Field.CURRENCY_B],
          chainId,
        )?.address ?? '', // token
        (tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(), // token desired
        amountsMin[
          tokenBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B
        ].toString(), // token min
        amountsMin[
          tokenBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A
        ].toString(), // eth min
        account,
        deadline.toHexString(),
      ];
      value = BigNumber.from(
        (tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString(),
      );
    } else {
      estimate = router.estimateGas.addLiquidity;
      method = router.addLiquidity;
      args = [
        wrappedCurrency(currencies[Field.CURRENCY_A], chainId)?.address ?? '',
        wrappedCurrency(currencies[Field.CURRENCY_B], chainId)?.address ?? '',
        parsedAmountA.raw.toString(),
        parsedAmountB.raw.toString(),
        amountsMin[Field.CURRENCY_A].toString(),
        amountsMin[Field.CURRENCY_B].toString(),
        account,
        deadline.toHexString(),
      ];
      value = null;
    }

    setAttemptingTxn(true);
    await estimate(...args, value ? { value } : {})
      .then((estimatedGasLimit) =>
        method(...args, {
          ...(value ? { value } : {}),
          gasLimit: calculateGasMargin(estimatedGasLimit),
        }).then(async (response) => {
          setAttemptingTxn(false);
          setTxPending(true);
          const summary =
            'Add ' +
            parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
            ' ' +
            currencies[Field.CURRENCY_A]?.symbol +
            ' and ' +
            parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
            ' ' +
            currencies[Field.CURRENCY_B]?.symbol;

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
            setAddLiquidityErrorMessage('There is an error in transaction.');
          }

          ReactGA.event({
            category: 'Liquidity',
            action: 'Add',
            label: [
              currencies[Field.CURRENCY_A]?.symbol,
              currencies[Field.CURRENCY_B]?.symbol,
            ].join('/'),
          });
        }),
      )
      .catch((error) => {
        setAttemptingTxn(false);
        setAddLiquidityErrorMessage('Transaction rejected.');
        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) {
          console.error(error);
        }
      });
  };

  const connectWallet = () => {
    if (isnotMatic) {
      addMaticToMetamask();
    } else {
      toggleWalletModal();
    }
  };

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('');
    }
    setTxHash('');
  }, [onFieldAInput, txHash]);

  const modalHeader = () => {
    return (
      <Box>
        <Box mt={10} mb={3} display='flex' justifyContent='center'>
          <DoubleCurrencyLogo
            currency0={currencies[Field.CURRENCY_A]}
            currency1={currencies[Field.CURRENCY_B]}
            size={48}
          />
        </Box>
        <Box mb={6} color='#c7cad9' textAlign='center'>
          <Typography variant='h6'>
            Supplying {parsedAmounts[Field.CURRENCY_A]?.toSignificant()}&nbsp;
            {currencies[Field.CURRENCY_A]?.symbol}&nbsp;and&nbsp;
            {parsedAmounts[Field.CURRENCY_B]?.toSignificant()}
            {currencies[Field.CURRENCY_B]?.symbol}
            <br />
            You will receive {liquidityMinted?.toSignificant(6)}{' '}
            {currencies[Field.CURRENCY_A]?.symbol} /{' '}
            {currencies[Field.CURRENCY_B]?.symbol} LP Tokens
          </Typography>
        </Box>
        <Box mb={3} color='#696c80' textAlign='center'>
          <Typography variant='body2'>
            {`Output is estimated. If the price changes by more than ${allowedSlippage /
              100}% your transaction will revert.`}
          </Typography>
        </Box>
        <Box className={classes.swapButtonWrapper}>
          <Button onClick={onAddLiquidity}>Confirm Supply</Button>
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={handleDismissConfirmation}
        attemptingTxn={attemptingTxn}
        txPending={txPending}
        hash={txHash}
        content={() =>
          addLiquidityErrorMessage ? (
            <TransactionErrorContent
              onDismiss={handleDismissConfirmation}
              message={addLiquidityErrorMessage}
            />
          ) : (
            <ConfirmationModalContent
              title='Supplying Liquidity'
              onDismiss={handleDismissConfirmation}
              content={modalHeader}
            />
          )
        }
        pendingText={pendingText}
        modalContent={
          txPending
            ? 'Submitted transaction to add liquidity'
            : 'Successfully added liquidity'
        }
      />
      <CurrencyInput
        title='Token 1:'
        currency={currencies[Field.CURRENCY_A]}
        showHalfButton={Boolean(maxAmounts[Field.CURRENCY_A])}
        showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
        onMax={() =>
          onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
        }
        onHalf={() =>
          onFieldAInput(
            maxAmounts[Field.CURRENCY_A]
              ? (
                  Number(maxAmounts[Field.CURRENCY_A]?.toSignificant()) / 2
                ).toString()
              : '',
          )
        }
        handleCurrencySelect={handleCurrencyASelect}
        amount={formattedAmounts[Field.CURRENCY_A]}
        setAmount={onFieldAInput}
      />
      <Box className={classes.exchangeSwap}>
        <AddLiquidityIcon />
      </Box>
      <CurrencyInput
        title='Token 2:'
        showHalfButton={Boolean(maxAmounts[Field.CURRENCY_B])}
        currency={currencies[Field.CURRENCY_B]}
        showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
        onHalf={() =>
          onFieldBInput(
            maxAmounts[Field.CURRENCY_B]
              ? (
                  Number(maxAmounts[Field.CURRENCY_B]?.toSignificant()) / 2
                ).toString()
              : '',
          )
        }
        onMax={() =>
          onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
        }
        handleCurrencySelect={handleCurrencyBSelect}
        amount={formattedAmounts[Field.CURRENCY_B]}
        setAmount={onFieldBInput}
      />
      {currencies[Field.CURRENCY_A] &&
        currencies[Field.CURRENCY_B] &&
        pairState !== PairState.INVALID &&
        price && (
          <Box my={2}>
            <Box className={classes.swapPrice}>
              <Typography variant='body2'>
                1 {currencies[Field.CURRENCY_A]?.symbol} ={' '}
                {price.toSignificant(3)} {currencies[Field.CURRENCY_B]?.symbol}{' '}
              </Typography>
              <Typography variant='body2'>
                1 {currencies[Field.CURRENCY_B]?.symbol} ={' '}
                {price.invert().toSignificant(3)}{' '}
                {currencies[Field.CURRENCY_A]?.symbol}{' '}
              </Typography>
            </Box>
            <Box className={classes.swapPrice}>
              <Typography variant='body2'>Your pool share:</Typography>
              <Typography variant='body2'>
                {poolTokenPercentage
                  ? poolTokenPercentage.toFixed(6) + '%'
                  : '-'}
              </Typography>
            </Box>
            <Box className={classes.swapPrice}>
              <Typography variant='body2'>LP Tokens Received:</Typography>
              <Typography variant='body2'>
                {userPoolBalance?.toSignificant()} LP Tokens
              </Typography>
            </Box>
          </Box>
        )}
      <Box className={classes.swapButtonWrapper}>
        {(approvalA === ApprovalState.NOT_APPROVED ||
          approvalA === ApprovalState.PENDING ||
          approvalB === ApprovalState.NOT_APPROVED ||
          approvalB === ApprovalState.PENDING) &&
          !error && (
            <Box className={classes.approveButtons}>
              {approvalA !== ApprovalState.APPROVED && (
                <Box
                  width={approvalB !== ApprovalState.APPROVED ? '48%' : '100%'}
                >
                  <Button
                    onClick={approveACallback}
                    disabled={approvalA === ApprovalState.PENDING}
                  >
                    {approvalA === ApprovalState.PENDING
                      ? `Approving ${currencies[Field.CURRENCY_A]?.symbol}`
                      : 'Approve ' + currencies[Field.CURRENCY_A]?.symbol}
                  </Button>
                </Box>
              )}
              {approvalB !== ApprovalState.APPROVED && (
                <Box
                  width={approvalA !== ApprovalState.APPROVED ? '48%' : '100%'}
                >
                  <Button
                    onClick={approveBCallback}
                    disabled={approvalB === ApprovalState.PENDING}
                  >
                    {approvalB === ApprovalState.PENDING
                      ? `Approving ${currencies[Field.CURRENCY_B]?.symbol}`
                      : 'Approve ' + currencies[Field.CURRENCY_B]?.symbol}
                  </Button>
                </Box>
              )}
            </Box>
          )}
        <Button
          disabled={
            Boolean(account) &&
            (Boolean(error) ||
              approvalA !== ApprovalState.APPROVED ||
              approvalB !== ApprovalState.APPROVED)
          }
          onClick={account ? onAdd : connectWallet}
        >
          {account ? error ?? 'Supply' : 'Connect Wallet'}
        </Button>
      </Box>
    </Box>
  );
};

export default AddLiquidity;
