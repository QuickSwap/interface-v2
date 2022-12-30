import React, { useCallback, useMemo, useState } from 'react';
import { TransactionResponse } from '@ethersproject/providers';
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core';
import { useV3NFTPositionManagerContract } from 'hooks/useContract';
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from 'components/TransactionConfirmationModal';
import { useActiveWeb3React } from 'hooks';
import useTransactionDeadline from 'hooks/useTransactionDeadline';
import { useWalletModalToggle } from 'state/application/hooks';
import { Bound, Field } from 'state/mint/v3/actions';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { useIsExpertMode, useUserSlippageTolerance } from 'state/user/hooks';
import {
  useV3DerivedMintInfo,
  useV3MintActionHandlers,
  useV3MintState,
} from 'state/mint/v3/hooks';
import { useDerivedPositionInfo } from 'hooks/v3/useDerivedPositionInfo';
import { NonfungiblePositionManager as NonFunPosMan } from 'v3lib/nonfungiblePositionManager';
import './index.scss';
import ReactGA from 'react-ga';
import { WrappedCurrency } from 'models/types';
import { ApprovalState, useApproveCallback } from 'hooks/useV3ApproveCallback';
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from 'constants/v3/addresses';
import { useUSDCValue } from 'hooks/v3/useUSDCPrice';
import CurrencyInputPanel from 'components/v3/CurrencyInputPanel';
import { maxAmountSpend } from 'utils/v3/maxAmountSpend';
import { calculateGasMarginV3 } from 'utils';
import { useToken } from 'hooks/v3/Tokens';
import { JSBI } from '@uniswap/sdk';
import { PositionPool } from 'models/interfaces';
import { useTranslation } from 'react-i18next';
import { DoubleCurrencyLogo, CurrencyLogo } from 'components';
import { Box, Button } from '@material-ui/core';
import RangeBadge from 'components/v3/Badge/RangeBadge';
import RateToggle from 'components/v3/RateToggle';
import { formatTickPrice } from 'utils/v3/formatTickPrice';
import { unwrappedToken } from 'utils/unwrappedToken';

interface IncreaseLiquidityV3Props {
  positionDetails: PositionPool;
}

export default function IncreaseLiquidityV3({
  positionDetails,
}: IncreaseLiquidityV3Props) {
  const { t } = useTranslation();

  const expertMode = useIsExpertMode();
  const toggleWalletModal = useWalletModalToggle();

  const { chainId, account, library } = useActiveWeb3React();
  const { position: existingPosition } = useDerivedPositionInfo(
    positionDetails,
  );
  const feeAmount = 100;

  const token0Id = positionDetails.token0;
  const token1Id = positionDetails.token1;
  const token0 = useToken(token0Id);
  const token1 = useToken(token1Id);
  const baseCurrency = token0 ? unwrappedToken(token0) : undefined;
  const currencyB = token1 ? unwrappedToken(token1) : undefined;
  // prevent an error if they input ETH/WETH
  //TODO
  const quoteCurrency =
    baseCurrency && currencyB && baseCurrency.wrapped.equals(currencyB.wrapped)
      ? undefined
      : currencyB;

  const positionManager = useV3NFTPositionManagerContract();
  const tokenId = positionDetails.tokenId.toString();
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();

  // mint state
  const { independentField, typedValue } = useV3MintState();

  const {
    ticks,
    dependentField,
    pricesAtTicks,
    parsedAmounts,
    currencyBalances,
    position,
    noLiquidity,
    currencies,
    errorMessage,
    invalidPool,
    invalidRange,
    outOfRange,
    depositADisabled,
    depositBDisabled,
    ticksAtLimit,
    dynamicFee,
  } = useV3DerivedMintInfo(
    baseCurrency ?? undefined,
    quoteCurrency ?? undefined,
    feeAmount,
    baseCurrency ?? undefined,
    existingPosition,
  );

  const { onFieldAInput, onFieldBInput } = useV3MintActionHandlers(noLiquidity);

  const isValid = !errorMessage && !invalidRange;

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false);
  const [txPending, setTxPending] = useState(false);
  const [increaseErrorMessage, setIncreaseErrorMessage] = useState('');

  // txn values
  const deadline = useTransactionDeadline(); // custom from users settings

  const [txHash, setTxHash] = useState<string>('');

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  };

  const usdcValues = {
    [Field.CURRENCY_A]: useUSDCValue(parsedAmounts[Field.CURRENCY_A]),
    [Field.CURRENCY_B]: useUSDCValue(parsedAmounts[Field.CURRENCY_B]),
  };

  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [
    Field.CURRENCY_A,
    Field.CURRENCY_B,
  ].reduce((accumulator, field) => {
    return {
      ...accumulator,
      [field]: maxAmountSpend(currencyBalances[field]),
    };
  }, {});

  const atMaxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [
    Field.CURRENCY_A,
    Field.CURRENCY_B,
  ].reduce((accumulator, field) => {
    return {
      ...accumulator,
      [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0'),
    };
  }, {});

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_A],
    chainId ? NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId] : undefined,
  );
  const [approvalB, approveBCallback] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_B],
    chainId ? NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId] : undefined,
  );

  const [allowedSlippage] = useUserSlippageTolerance();
  const allowedSlippagePercent: Percent = useMemo(() => {
    return new Percent(JSBI.BigInt(allowedSlippage), JSBI.BigInt(10000));
  }, [allowedSlippage]);

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    setAttemptingTxn(false);
    setTxPending(false);
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('');
      onFieldBInput('');
    }
    setTxHash('');
    setIncreaseErrorMessage('');
  }, [onFieldAInput, onFieldBInput, txHash]);

  async function onAdd() {
    if (!chainId || !library || !account) return;

    if (!positionManager || !baseCurrency || !quoteCurrency) {
      return;
    }

    if (position && account && deadline) {
      const useNative = baseCurrency.isNative
        ? baseCurrency
        : quoteCurrency.isNative
        ? quoteCurrency
        : undefined;

      const { calldata, value } = tokenId
        ? NonFunPosMan.addCallParameters(position, {
            tokenId,
            slippageTolerance: allowedSlippagePercent,
            deadline: deadline.toString(),
            useNative,
          })
        : NonFunPosMan.addCallParameters(position, {
            slippageTolerance: allowedSlippagePercent,
            recipient: account,
            deadline: deadline.toString(),
            useNative,
            createPool: noLiquidity,
          });

      const txn: { to: string; data: string; value: string } = {
        to: NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId],
        data: calldata,
        value,
      };

      setAttemptingTxn(true);

      library
        .getSigner()
        .estimateGas(txn)
        .then((estimate) => {
          const newTxn = {
            ...txn,
            gasLimit: calculateGasMarginV3(chainId, estimate),
          };

          return library
            .getSigner()
            .sendTransaction(newTxn)
            .then(async (response: TransactionResponse) => {
              setAttemptingTxn(false);
              setTxPending(true);
              const summaryData = {
                symbolA: baseCurrency?.symbol,
                symbolB: quoteCurrency?.symbol,
              };
              const summary = t(
                noLiquidity
                  ? 'createPoolandaddLiquidity'
                  : 'addLiquidityWithTokens',
                summaryData,
              );
              addTransaction(response, {
                summary,
              });
              setTxHash(response.hash);
              ReactGA.event({
                category: 'Liquidity',
                action: 'Add',
                label: [
                  currencies[Field.CURRENCY_A]?.symbol,
                  currencies[Field.CURRENCY_B]?.symbol,
                ].join('/'),
              });
              try {
                const receipt = await response.wait();
                finalizedTransaction(receipt, {
                  summary,
                });
                setTxPending(false);
              } catch (error) {
                setTxPending(false);
                setIncreaseErrorMessage(t('errorInTx'));
              }
            });
        })
        .catch((error) => {
          console.error('Failed to send transaction', error);
          setAttemptingTxn(false);
          setTxPending(false);
          setIncreaseErrorMessage(t('errorInTx'));
          // we only care if the error is something _other_ than the user rejected the tx
          if (error?.code !== 4001) {
            console.error(error);
          }
        });
    } else {
      return;
    }
  }

  const removed =
    position?.liquidity && JSBI.equal(position?.liquidity, JSBI.BigInt(0));

  const [manuallyInverted, setManuallyInverted] = useState(false);

  const currencyBase = manuallyInverted ? baseCurrency : quoteCurrency;
  const currencyQuote = manuallyInverted ? quoteCurrency : baseCurrency;

  const priceLower = manuallyInverted
    ? existingPosition?.token0PriceLower
    : existingPosition?.token0PriceUpper.invert();
  const priceUpper = manuallyInverted
    ? existingPosition?.token0PriceUpper
    : existingPosition?.token0PriceLower.invert();

  const currentPrice = manuallyInverted
    ? existingPosition?.pool.priceOf(existingPosition?.pool.token0)
    : existingPosition?.pool.priceOf(existingPosition?.pool.token1);

  const showApprovalA =
    approvalA !== ApprovalState.APPROVED && !!parsedAmounts[Field.CURRENCY_A];
  const showApprovalB =
    approvalB !== ApprovalState.APPROVED && !!parsedAmounts[Field.CURRENCY_B];

  const modalHeader = () => (
    <>
      <Box className='flex justify-center' mt={4} mb={2}>
        <DoubleCurrencyLogo
          currency0={currencies[Field.CURRENCY_A]}
          currency1={currencies[Field.CURRENCY_B]}
          size={48}
        />
      </Box>
      <Box mb={4} textAlign='center'>
        <p>
          {t('addLiquidityTokens', {
            amountA: formattedAmounts[Field.CURRENCY_A],
            symbolA: currencies[Field.CURRENCY_A]?.symbol,
            amountB: formattedAmounts[Field.CURRENCY_B],
            symbolB: currencies[Field.CURRENCY_B]?.symbol,
          })}
        </p>
      </Box>
      <Button className='v3-increase-liquidity-button' onClick={onAdd}>
        {t('confirm')}
      </Button>
    </>
  );

  const pendingText = t('addingLiquidityTokens', {
    amountA: formattedAmounts[Field.CURRENCY_A],
    symbolA: currencies[Field.CURRENCY_A]?.symbol,
    amountB: formattedAmounts[Field.CURRENCY_B],
    symbolB: currencies[Field.CURRENCY_B]?.symbol,
  });

  return (
    <>
      {showConfirm && (
        <TransactionConfirmationModal
          isOpen={showConfirm}
          onDismiss={handleDismissConfirmation}
          attemptingTxn={attemptingTxn}
          txPending={txPending}
          hash={txHash}
          content={() =>
            increaseErrorMessage ? (
              <TransactionErrorContent
                onDismiss={handleDismissConfirmation}
                message={increaseErrorMessage}
              />
            ) : (
              <ConfirmationModalContent
                title={t('increasingLiquidity')}
                onDismiss={handleDismissConfirmation}
                content={modalHeader}
              />
            )
          }
          pendingText={pendingText}
          modalContent={
            txPending
              ? t('submittedTxIncreaseLiquidity')
              : t('successfullyIncreasedLiquidity')
          }
        />
      )}

      <Box className='flex justify-between'>
        <Box className='flex items-center'>
          <Box className='flex' mr={1}>
            <DoubleCurrencyLogo
              currency0={baseCurrency ?? undefined}
              currency1={quoteCurrency ?? undefined}
              size={32}
            />
          </Box>
          <h5>
            {baseCurrency?.symbol}-{quoteCurrency?.symbol}
          </h5>
        </Box>
        <RangeBadge removed={removed} inRange={!outOfRange} />
      </Box>
      <Box my={2} className='v3-increase-liquidity-info-wrapper'>
        <Box>
          <Box className='flex items-center'>
            <CurrencyLogo currency={baseCurrency ?? undefined} size='20px' />
            <p>{baseCurrency?.symbol}</p>
          </Box>
          <p>{existingPosition?.amount0?.toSignificant()}</p>
        </Box>
        <Box mt={2}>
          <Box className='flex items-center'>
            <CurrencyLogo currency={quoteCurrency ?? undefined} size='20px' />
            <p>{quoteCurrency?.symbol}</p>
          </Box>
          <p>{existingPosition?.amount1?.toSignificant()}</p>
        </Box>
        {existingPosition?.pool.fee && (
          <Box mt={2}>
            <p>{t('fee')}</p>
            <p>{existingPosition?.pool?.fee / 10000}%</p>
          </Box>
        )}
      </Box>
      <Box mt={2} className='flex justify-between'>
        <p>{t('selectRange')}</p>
        {currencyBase && currencyQuote && (
          <RateToggle
            currencyA={currencyBase}
            currencyB={currencyQuote}
            handleRateToggle={() => setManuallyInverted(!manuallyInverted)}
          />
        )}
      </Box>
      <Box width={1} mt={2} className='flex justify-between'>
        {priceLower && (
          <Box
            className='v3-increase-liquidity-price-wrapper'
            width={priceUpper ? '49%' : '100%'}
          >
            <p>{t('minPrice')}</p>
            <h6>{formatTickPrice(priceLower, ticksAtLimit, Bound.LOWER)}</h6>
            <p>
              {currencyQuote?.symbol} {t('per')} {currencyBase?.symbol}
            </p>
            <p>
              {t('positionComposedAtThisPrice', {
                symbol: currencyBase?.symbol,
              })}
            </p>
          </Box>
        )}
        {priceUpper && (
          <Box
            className='v3-increase-liquidity-price-wrapper'
            width={priceLower ? '49%' : '100%'}
          >
            <p>{t('minPrice')}</p>
            <h6>{formatTickPrice(priceUpper, ticksAtLimit, Bound.UPPER)}</h6>
            <p>
              {currencyQuote?.symbol} {t('per')} {currencyBase?.symbol}
            </p>
            <p>
              {t('positionComposedAtThisPrice', {
                symbol: currencyQuote?.symbol,
              })}
            </p>
          </Box>
        )}
      </Box>
      {currentPrice && (
        <Box mt={2} className='v3-increase-liquidity-price-wrapper'>
          <p>{t('currentPrice')}</p>
          <h6>{currentPrice.toSignificant()}</h6>
          <p>
            {currencyQuote?.symbol} {t('per')} {currencyBase?.symbol}
          </p>
        </Box>
      )}
      <Box mt={2}>
        <p>{t('addMoreLiquidity')}</p>
      </Box>
      <Box mt={2}>
        <CurrencyInputPanel
          value={formattedAmounts[Field.CURRENCY_A]}
          onUserInput={onFieldAInput}
          onMax={() => {
            onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '');
          }}
          showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
          currency={currencies[Field.CURRENCY_A] as WrappedCurrency}
          id='add-liquidity-input-tokena'
          fiatValue={usdcValues[Field.CURRENCY_A]}
          showCommonBases
          locked={depositADisabled}
          hideInput={depositADisabled}
          shallow={true}
          showBalance={!depositADisabled}
          page={'addLiq'}
          disabled={false}
          swap={false}
        />
      </Box>
      <Box mt={2}>
        <CurrencyInputPanel
          value={formattedAmounts[Field.CURRENCY_B]}
          onUserInput={onFieldBInput}
          onMax={() => {
            onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '');
          }}
          showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
          fiatValue={usdcValues[Field.CURRENCY_B]}
          currency={currencies[Field.CURRENCY_B] as WrappedCurrency}
          id='add-liquidity-input-tokenb'
          showCommonBases
          locked={depositBDisabled}
          hideInput={depositBDisabled}
          showBalance={!depositBDisabled}
          shallow={true}
          page={'addLiq'}
          disabled={false}
          swap={false}
        />
      </Box>

      {(approvalA === ApprovalState.NOT_APPROVED ||
        approvalA === ApprovalState.PENDING ||
        approvalB === ApprovalState.NOT_APPROVED ||
        approvalB === ApprovalState.PENDING) &&
        isValid && (
          <Box mt={2} className='flex justify-between'>
            {showApprovalA && (
              <Box width={showApprovalB ? '48%' : '100%'}>
                <Button
                  onClick={() => {
                    approveACallback();
                  }}
                  className='v3-increase-liquidity-button'
                  disabled={approvalA === ApprovalState.PENDING}
                >
                  {approvalA === ApprovalState.PENDING ? (
                    <p>
                      {t('approving')} {currencies[Field.CURRENCY_A]?.symbol}
                    </p>
                  ) : (
                    `${t('approve')} ${currencies[Field.CURRENCY_A]?.symbol}`
                  )}
                </Button>
              </Box>
            )}
            {showApprovalB && (
              <Box width={showApprovalA ? '48%' : '100%'}>
                <Button
                  className='v3-increase-liquidity-button'
                  onClick={() => {
                    approveBCallback();
                  }}
                  disabled={approvalB === ApprovalState.PENDING}
                >
                  {approvalB === ApprovalState.PENDING ? (
                    <p>
                      {t('approving')} {currencies[Field.CURRENCY_B]?.symbol}
                    </p>
                  ) : (
                    `${t('approve')} ${currencies[Field.CURRENCY_B]?.symbol}`
                  )}
                </Button>
              </Box>
            )}
          </Box>
        )}
      <Box mt={2}>
        <Button
          className='v3-increase-liquidity-button'
          disabled={
            attemptingTxn ||
            txPending ||
            noLiquidity ||
            !isValid ||
            (approvalA !== ApprovalState.APPROVED && !depositADisabled) ||
            (approvalB !== ApprovalState.APPROVED && !depositBDisabled)
          }
          onClick={() => {
            if (!account) {
              toggleWalletModal();
            } else if (expertMode) {
              onAdd();
            } else {
              setShowConfirm(true);
            }
          }}
        >
          {noLiquidity ? t('add') : errorMessage ? errorMessage : t('preview')}
        </Button>
      </Box>
    </>
  );
}
