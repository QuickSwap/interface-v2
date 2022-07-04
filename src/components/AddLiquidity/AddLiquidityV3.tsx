import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Box, Button } from '@material-ui/core';
import {
  CurrencyInput,
  TransactionErrorContent,
  TransactionConfirmationModal,
  ConfirmationModalContent,
  DoubleCurrencyLogo,
} from 'components';
import { useWalletModalToggle } from 'state/application/hooks';
import { TransactionResponse } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import ReactGA from 'react-ga';
import { useTranslation } from 'react-i18next';
import { Currency, Token, ETHER, TokenAmount } from '@uniswap/sdk';
import { GlobalConst } from 'constants/index';
import { useActiveWeb3React } from 'hooks';
import { useRouterContract } from 'hooks/useContract';
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
  calculateSlippageAmount,
  calculateGasMargin,
  returnTokenFromKey,
  isSupportedNetwork,
  formatTokenAmount,
} from 'utils';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import { ReactComponent as AddLiquidityIconV3 } from 'assets/images/AddLiquidityIconV3.svg';
import { ReactComponent as ArrowDownIcon } from 'assets/images/arrowDown.svg';
import { ReactComponent as SettingsIcon } from 'assets/images/SettingsIcon.svg';

import RateToggle from 'components/RateToggle';
import { CurrencySearchModal, CurrencyLogo, NumericalInput } from 'components';
import RangeCard from './RangeCard';
import RiskCard from './RiskStatCard';
import PriceRangeInput from './PriceRangeInput';
import { LinkButton, StyledLabel } from './CommonStyledElements';
import RiskStatCard from './RiskStatCard';
import RangeGraph from './RangeGraph';

const INPUT_RANGE_VALUES = ['Full Range', 'Safe', 'Common', 'Expert'];

const AddLiquidityV3: React.FC<{
  currency0?: Currency;
  currency1?: Currency;
  currencyBgClass?: string;
  handleSettingsOpen: (flag: boolean) => void;
}> = ({ currency0, currency1, currencyBgClass, handleSettingsOpen }) => {
  const { t } = useTranslation();
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
  const [rangeIndex, setRangeIndex] = useState(1);

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

  const liquidityTokenData = {
    amountA: formatTokenAmount(parsedAmounts[Field.CURRENCY_A]),
    symbolA: currencies[Field.CURRENCY_A]?.symbol,
    amountB: formatTokenAmount(parsedAmounts[Field.CURRENCY_B]),
    symbolB: currencies[Field.CURRENCY_B]?.symbol,
  };

  const pendingText = t('supplyingTokens', liquidityTokenData);

  const {
    onFieldAInput,
    onFieldBInput,
    onCurrencySelection,
  } = useMintActionHandlers(noLiquidity);

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
      : parsedAmounts[dependentField]?.toExact() ?? '',
  };

  const { ethereum } = window as any;
  const toggleWalletModal = useWalletModalToggle();
  const [approvingA, setApprovingA] = useState(false);
  const [approvingB, setApprovingB] = useState(false);
  const [approvalA, approveACallback] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_A],
    chainId ? GlobalConst.addresses.ROUTER_ADDRESS[chainId] : undefined,
  );
  const [approvalB, approveBCallback] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_B],
    chainId ? GlobalConst.addresses.ROUTER_ADDRESS[chainId] : undefined,
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
      onCurrencySelection(Field.CURRENCY_B, returnTokenFromKey('USDT'));
    }
  }, [onCurrencySelection, currency0, currency1]);

  const onAdd = () => {
    if (expertMode) {
      onAddLiquidity();
    } else {
      setShowConfirm(true);
    }
  };

  //   useEffect(() => {
  //     console.log('component  ', currencies.CURRENCY_A);
  //   }, [currencies]);

  const router = useRouterContract();

  const onAddLiquidity = async () => {
    if (!chainId || !library || !account || !router) return;

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
          const summary = t('addLiquidityTokens', liquidityTokenData);

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
            setAddLiquidityErrorMessage(t('errorInTx'));
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
        setAddLiquidityErrorMessage(t('txRejected'));
        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) {
          console.error(error);
        }
      });
  };

  const connectWallet = () => {
    if (ethereum && !isSupportedNetwork(ethereum)) {
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

  const buttonText = useMemo(() => {
    if (account) {
      return error ?? t('supply');
    } else if (ethereum && !isSupportedNetwork(ethereum)) {
      return t('switchPolygon');
    }
    return t('connectWallet');
  }, [account, ethereum, error, t]);

  const modalHeader = () => {
    return (
      <Box>
        <Box mt={10} mb={3} className='flex justify-center'>
          <DoubleCurrencyLogo
            currency0={currencies[Field.CURRENCY_A]}
            currency1={currencies[Field.CURRENCY_B]}
            size={48}
          />
        </Box>
        <Box mb={6} textAlign='center'>
          <h6>
            {t('supplyingTokens', liquidityTokenData)}
            <br />
            {t('receiveLPTokens', {
              amount: formatTokenAmount(liquidityMinted),
              symbolA: currencies[Field.CURRENCY_A]?.symbol,
              symbolB: currencies[Field.CURRENCY_B]?.symbol,
            })}
          </h6>
        </Box>
        <Box mb={3} textAlign='center'>
          <small className='text-secondary'>
            {t('outputEstimated', { slippage: allowedSlippage / 100 })}
          </small>
        </Box>
        <Box className='swapButtonWrapper'>
          <Button onClick={onAddLiquidity}>{t('confirmSupply')}</Button>
        </Box>
      </Box>
    );
  };

  const selectedRange = useMemo(() => {
    return INPUT_RANGE_VALUES?.[rangeIndex];
  }, [rangeIndex]);

  return (
    <Box>
      <Box className='flex justify-between items-center'>
        {/* <p className='weight-600'>{t('supplyLiquidity')}</p> */}
        <StyledLabel fontSize='16px'>{t('supplyLiquidity')}</StyledLabel>
        <Box className='flex items-center'>
          <Box className='headingItem'>
            <Box
              className='flex flex-end'
              style={{ width: 'fit-content', minWidth: 'fit-content' }}
            >
              <LinkButton
                style={{ marginRight: 10, alignSelf: 'center' }}
                fontSize='14px'
              >
                {' '}
                {t('Clear All')}
              </LinkButton>

              <RateToggle
                currencyA={{ symbol: 'MATIC' }}
                currencyB={{ symbol: 'USDT' }}
                handleRateToggle={() => {
                  // todo: handle toggle actions
                }}
              />
            </Box>
          </Box>
          <Box className='headingItem'>
            <SettingsIcon onClick={() => handleSettingsOpen(true)} />
          </Box>
        </Box>
      </Box>
      <Box className='flex justify-between items-center' mt={2.5}>
        {' '}
        Select Pair
      </Box>
      <Box mt={2.5}>
        {showConfirm && (
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
                  title={t('supplyingliquidity')}
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
        <Box className='flex justify-between items-center' mt={2.5}>
          <Box
            className={`currencyButton ${
              currencies.CURRENCY_A ? 'currencySelected' : 'noCurrency'
            }`}
          >
            {currencies.CURRENCY_A ? (
              <>
                <CurrencyLogo currency={currencies.CURRENCY_A} size={'28px'} />
                <p className='token-symbol-container' style={{ minWidth: 100 }}>
                  {currencies.CURRENCY_A?.symbol}
                </p>
                <ArrowDownIcon />
              </>
            ) : (
              <p>{t('selectToken')}</p>
            )}
          </Box>

          <Box className='exchangeSwap'>
            <AddLiquidityIconV3 />
          </Box>
          <Box
            className={`currencyButton ${
              currencies.CURRENCY_B ? 'currencySelected' : 'noCurrency'
            }`}
          >
            {currencies.CURRENCY_B ? (
              <>
                <CurrencyLogo currency={currencies.CURRENCY_B} size={'28px'} />
                <p className='token-symbol-container' style={{ minWidth: 100 }}>
                  {currencies.CURRENCY_B?.symbol}
                </p>
                <ArrowDownIcon />
              </>
            ) : (
              <p>{t('selectToken')}</p>
            )}
          </Box>
        </Box>
        <Box className='flex justify-between items-center' mt={2.5}>
          Select range
        </Box>

        <Box className='flex justify-between items-center' mt={2.5} mb={2.5}>
          {INPUT_RANGE_VALUES.map((range, index) => (
            <RangeCard
              key={index}
              label={range}
              selected={selectedRange === range}
              onSelect={() => setRangeIndex(index)}
            />
          ))}
        </Box>

        <RiskStatCard />

        <Box className='flex justify-center items-center' mt={1} mb={1}>
          <StyledLabel fontSize='12px' style={{ marginRight: 5 }}>
            Current Price: 0.55{' '}
          </StyledLabel>
          <StyledLabel fontSize='12px' color='#696c80'>
            USDT per Matic
          </StyledLabel>
        </Box>

        <Box className='flex justify-between items-center' mt={2.5} mb={2.5}>
          <PriceRangeInput />
          <PriceRangeInput />
        </Box>

        <RangeGraph />

        <Box className='flex justify-between items-center' mt={2.5} mb={2.5}>
          Deposit Amounts
        </Box>
        <Box mb={2}>
          <CurrencyInput
            id='add-liquidity-input-tokena'
            title={`${t('token')} 1:`}
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
                      Number(maxAmounts[Field.CURRENCY_A]?.toExact()) / 2
                    ).toString()
                  : '',
              )
            }
            handleCurrencySelect={handleCurrencyASelect}
            amount={formattedAmounts[Field.CURRENCY_A]}
            setAmount={onFieldAInput}
            bgClass={currencyBgClass}
          />
        </Box>

        <Box>
          <CurrencyInput
            id='add-liquidity-input-tokenb'
            title={`${t('token')} 2:`}
            showHalfButton={Boolean(maxAmounts[Field.CURRENCY_B])}
            currency={currencies[Field.CURRENCY_B]}
            showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
            onHalf={() =>
              onFieldBInput(
                maxAmounts[Field.CURRENCY_B]
                  ? (
                      Number(maxAmounts[Field.CURRENCY_B]?.toExact()) / 2
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
            bgClass={currencyBgClass}
          />
        </Box>

        <Box className='swapButtonWrapper flex-wrap'>
          {(approvalA === ApprovalState.NOT_APPROVED ||
            approvalA === ApprovalState.PENDING ||
            approvalB === ApprovalState.NOT_APPROVED ||
            approvalB === ApprovalState.PENDING) &&
            !error && (
              <Box className='flex fullWidth justify-between' mb={2}>
                {approvalA !== ApprovalState.APPROVED && (
                  <Box
                    width={
                      approvalB !== ApprovalState.APPROVED ? '48%' : '100%'
                    }
                  >
                    <Button
                      fullWidth
                      onClick={async () => {
                        setApprovingA(true);
                        try {
                          await approveACallback();
                          setApprovingA(false);
                        } catch (e) {
                          setApprovingA(false);
                        }
                      }}
                      disabled={
                        approvingA || approvalA === ApprovalState.PENDING
                      }
                    >
                      {approvalA === ApprovalState.PENDING
                        ? `${t('approving')} ${
                            currencies[Field.CURRENCY_A]?.symbol
                          }`
                        : `${t('approve')} ${
                            currencies[Field.CURRENCY_A]?.symbol
                          }`}
                    </Button>
                  </Box>
                )}
                {approvalB !== ApprovalState.APPROVED && (
                  <Box
                    width={
                      approvalA !== ApprovalState.APPROVED ? '48%' : '100%'
                    }
                  >
                    <Button
                      fullWidth
                      onClick={async () => {
                        setApprovingB(true);
                        try {
                          await approveBCallback();
                          setApprovingB(false);
                        } catch (e) {
                          setApprovingB(false);
                        }
                      }}
                      disabled={
                        approvingB || approvalB === ApprovalState.PENDING
                      }
                    >
                      {approvalB === ApprovalState.PENDING
                        ? `${t('approving')} ${
                            currencies[Field.CURRENCY_B]?.symbol
                          }`
                        : `${t('approve')} ${
                            currencies[Field.CURRENCY_B]?.symbol
                          }`}
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          <Button
            fullWidth
            disabled={
              Boolean(account) &&
              (Boolean(error) ||
                approvalA !== ApprovalState.APPROVED ||
                approvalB !== ApprovalState.APPROVED)
            }
            onClick={account ? onAdd : connectWallet}
          >
            {buttonText}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddLiquidityV3;
