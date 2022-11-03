import React, { useCallback, useMemo, useState } from 'react';
import { useV3NFTPositionManagerContract } from 'hooks/useContract';
import useTransactionDeadline from 'hooks/useTransactionDeadline';
import { useActiveWeb3React } from 'hooks';
import { useIsExpertMode, useUserSlippageTolerance } from 'state/user/hooks';
import { NonfungiblePositionManager as NonFunPosMan } from 'v3lib/nonfungiblePositionManager';
import { Percent, Currency } from '@uniswap/sdk-core';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { GAS_PRICE_MULTIPLIER } from 'hooks/useGasPrice';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { IDerivedMintInfo, useAddLiquidityTxHash } from 'state/mint/v3/hooks';
import { ApprovalState, useApproveCallback } from 'hooks/useV3ApproveCallback';
import { Field } from 'state/mint/actions';
import { Bound, setAddLiquidityTxHash } from 'state/mint/v3/actions';
import { useIsNetworkFailedImmediate } from 'hooks/v3/useIsNetworkFailed';
import { JSBI } from '@uniswap/sdk';
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from 'constants/v3/addresses';
import { calculateGasMarginV3 } from 'utils';
import { Button, Box } from '@material-ui/core';
import {
  ConfirmationModalContent,
  CurrencyLogo,
  DoubleCurrencyLogo,
  TransactionConfirmationModal,
  TransactionErrorContent,
} from 'components';
import './index.scss';
import RangeBadge from 'components/v3/Badge/RangeBadge';
import RateToggle from 'components/v3/RateToggle';
import { useInverter } from 'hooks/v3/useInverter';

interface IAddLiquidityButton {
  baseCurrency: Currency | undefined;
  quoteCurrency: Currency | undefined;
  mintInfo: IDerivedMintInfo;
  handleAddLiquidity: () => void;
  title: string;
  setRejected?: (rejected: boolean) => void;
}
const DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE = new Percent(50, 10_000);

export function AddLiquidityButton({
  baseCurrency,
  quoteCurrency,
  mintInfo,
  handleAddLiquidity,
  title,
  setRejected,
}: IAddLiquidityButton) {
  const { chainId, library, account } = useActiveWeb3React();
  const [showConfirm, setShowConfirm] = useState(false);
  const [attemptingTxn, setAttemptingTxn] = useState(false);
  const [txPending, setTxPending] = useState(false);
  const [addLiquidityErrorMessage, setAddLiquidityErrorMessage] = useState<
    string | null
  >(null);
  const [manuallyInverted, setManuallyInverted] = useState(false);

  const positionManager = useV3NFTPositionManagerContract();

  const deadline = useTransactionDeadline();

  const dispatch = useAppDispatch();

  const txHash = useAddLiquidityTxHash();

  const expertMode = useIsExpertMode();

  const isNetworkFailed = useIsNetworkFailedImmediate();

  const [allowedSlippage] = useUserSlippageTolerance();
  const allowedSlippagePercent: Percent = useMemo(() => {
    return new Percent(JSBI.BigInt(allowedSlippage), JSBI.BigInt(10000));
  }, [allowedSlippage]);

  const gasPrice = useAppSelector((state) => {
    if (!state.application.gasPrice.fetched) return 36;
    return state.application.gasPrice.override
      ? 36
      : state.application.gasPrice.fetched;
  });

  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();

  const [approvalA] = useApproveCallback(
    mintInfo.parsedAmounts[Field.CURRENCY_A],
    chainId ? NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId] : undefined,
  );
  const [approvalB] = useApproveCallback(
    mintInfo.parsedAmounts[Field.CURRENCY_B],
    chainId ? NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId] : undefined,
  );

  const isReady = useMemo(() => {
    return Boolean(
      (mintInfo.depositADisabled
        ? true
        : approvalA === ApprovalState.APPROVED) &&
        (mintInfo.depositBDisabled
          ? true
          : approvalB === ApprovalState.APPROVED) &&
        !mintInfo.errorMessage &&
        !mintInfo.invalidRange &&
        !txHash &&
        !isNetworkFailed,
    );
  }, [
    mintInfo.depositADisabled,
    mintInfo.depositBDisabled,
    mintInfo.errorMessage,
    mintInfo.invalidRange,
    approvalA,
    approvalB,
    txHash,
    isNetworkFailed,
  ]);

  const onAddLiquidity = () => {
    if (expertMode) {
      onAdd();
    } else {
      setShowConfirm(true);
    }
  };

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    setAttemptingTxn(false);
    setTxPending(false);
    setAddLiquidityErrorMessage('');
    dispatch(setAddLiquidityTxHash({ txHash: '' }));
  }, [dispatch]);

  async function onAdd() {
    if (!chainId || !library || !account) return;

    if (!positionManager || !baseCurrency || !quoteCurrency) {
      return;
    }

    if (mintInfo.position && account && deadline) {
      const useNative = baseCurrency.isNative
        ? baseCurrency
        : quoteCurrency.isNative
        ? quoteCurrency
        : undefined;

      const { calldata, value } = NonFunPosMan.addCallParameters(
        mintInfo.position,
        {
          slippageTolerance: allowedSlippagePercent,
          recipient: account,
          deadline: deadline.toString(),
          useNative,
          createPool: mintInfo.noLiquidity,
        },
      );

      const txn: { to: string; data: string; value: string } = {
        to: NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId],
        data: calldata,
        value,
      };

      setRejected && setRejected(false);

      setAttemptingTxn(true);

      library
        .getSigner()
        .estimateGas(txn)
        .then((estimate) => {
          const newTxn = {
            ...txn,
            gasLimit: calculateGasMarginV3(chainId, estimate),
            gasPrice: gasPrice * GAS_PRICE_MULTIPLIER,
          };

          return library
            .getSigner()
            .sendTransaction(newTxn)
            .then(async (response: TransactionResponse) => {
              setAttemptingTxn(false);
              setTxPending(true);
              const summary = mintInfo.noLiquidity
                ? `Create pool and add ${baseCurrency?.symbol}/${quoteCurrency?.symbol} liquidity`
                : `Add ${baseCurrency?.symbol}/${quoteCurrency?.symbol} liquidity`;
              addTransaction(response, {
                summary,
              });

              dispatch(setAddLiquidityTxHash({ txHash: response.hash }));

              try {
                const receipt = await response.wait();
                finalizedTransaction(receipt, {
                  summary,
                });
                setTxPending(false);
                handleAddLiquidity();
              } catch (error) {
                console.error('Failed to send transaction', error);
                setTxPending(false);
                setAddLiquidityErrorMessage(
                  error?.code === 4001
                    ? 'Transaction Rejected.'
                    : 'There is an error in the transaction.',
                );
              }
            })
            .catch((err) => {
              console.error('Failed to send transaction', err);
              setAttemptingTxn(false);
              setAddLiquidityErrorMessage(
                err?.code === 4001
                  ? 'Transaction Rejected.'
                  : 'There is an error in the transaction.',
              );
            });
        })
        .catch((error) => {
          console.error('Failed to send transaction', error);
          // we only care if the error is something _other_ than the user rejected the tx
          setRejected && setRejected(true);
          setAttemptingTxn(false);
          setAddLiquidityErrorMessage(
            error?.code === 4001
              ? 'Transaction Rejected.'
              : 'There is an error in the transaction.',
          );
          if (error?.code !== 4001) {
            console.error(error);
          }
        });
    } else {
      return;
    }
  }

  const {
    [Bound.LOWER]: _priceLower,
    [Bound.UPPER]: _priceUpper,
  } = useMemo(() => {
    return mintInfo.pricesAtTicks;
  }, [mintInfo]);

  const quoteWrapped = quoteCurrency?.wrapped;
  const baseWrapped = baseCurrency?.wrapped;

  // handle manual inversion
  const { priceLower, priceUpper, base } = useInverter({
    priceLower: _priceLower,
    priceUpper: _priceUpper,
    quote: quoteWrapped,
    base: baseWrapped,
    invert: manuallyInverted,
  });

  const isSorted =
    baseWrapped && quoteWrapped && baseWrapped.sortsBefore(quoteWrapped);
  const inverted = isSorted
    ? quoteWrapped && base?.equals(quoteWrapped)
    : baseWrapped && base?.equals(baseWrapped);
  const currencyQuote = inverted ? baseCurrency : quoteCurrency;
  const currencyBase = inverted ? quoteCurrency : baseCurrency;

  const currentPrice = useMemo(() => {
    if (!mintInfo.price) return;

    const _price =
      (isSorted && inverted) || (!isSorted && !inverted)
        ? parseFloat(mintInfo.price.invert().toSignificant(5))
        : parseFloat(mintInfo.price.toSignificant(5));

    if (Number(_price) <= 0.0001) {
      return `< 0.0001`;
    } else {
      return _price;
    }
  }, [mintInfo.price, isSorted, inverted]);

  const modalHeader = () => {
    return (
      <Box>
        <Box mt={3} className='flex justify-between items-center'>
          <Box className='flex items-center'>
            <Box className='flex' mr={1}>
              <DoubleCurrencyLogo
                currency0={baseCurrency}
                currency1={quoteCurrency}
                size={48}
              />
            </Box>
            <h4>
              {baseCurrency?.symbol}-{quoteCurrency?.symbol}
            </h4>
          </Box>
          <RangeBadge
            removed={false}
            withTooltip={false}
            inRange={!mintInfo.outOfRange}
          />
        </Box>
        <Box
          mt='20px'
          padding='20px 16px'
          borderRadius='10px'
          className='bg-secondary1'
        >
          <Box className='flex justify-between'>
            <Box className='flex items-center'>
              <Box className='flex' mr='6px'>
                <CurrencyLogo currency={baseCurrency} size='24px' />
              </Box>
              <p>{baseCurrency?.symbol}</p>
            </Box>
            <p>{mintInfo.parsedAmounts[Field.CURRENCY_A]?.toSignificant()}</p>
          </Box>
          <Box mt={2} className='flex justify-between'>
            <Box className='flex items-center'>
              <Box className='flex' mr='6px'>
                <CurrencyLogo currency={quoteCurrency} size='24px' />
              </Box>
              <p>{quoteCurrency?.symbol}</p>
            </Box>
            <p>{mintInfo.parsedAmounts[Field.CURRENCY_B]?.toSignificant()}</p>
          </Box>
        </Box>
        <Box mt={3}>
          <Box className='flex justify-between items-center'>
            <p>Selected Range</p>
            {currencyBase && currencyQuote && (
              <RateToggle
                currencyA={currencyBase}
                currencyB={currencyQuote}
                handleRateToggle={() => setManuallyInverted(!manuallyInverted)}
              />
            )}
          </Box>
        </Box>
        <Box width={1} mt={2} className='flex justify-between'>
          {priceLower && (
            <Box
              className='v3-supply-liquidity-price-wrapper'
              width={priceUpper ? '49%' : '100%'}
            >
              <p>Min Price</p>
              <h6>{priceLower.toSignificant()}</h6>
              <p>
                {currencyQuote?.symbol} per {currencyBase?.symbol}
              </p>
              <p>
                Your position will be 100% Composed of {currencyBase?.symbol} at
                this price
              </p>
            </Box>
          )}
          {priceUpper && (
            <Box
              className='v3-supply-liquidity-price-wrapper'
              width={priceLower ? '49%' : '100%'}
            >
              <p>Min Price</p>
              <h6>{priceUpper.toSignificant()}</h6>
              <p>
                {currencyQuote?.symbol} per {currencyBase?.symbol}
              </p>
              <p>
                Your position will be 100% Composed of {currencyQuote?.symbol}{' '}
                at this price
              </p>
            </Box>
          )}
        </Box>
        {currentPrice && (
          <Box mt={2} className='v3-supply-liquidity-price-wrapper'>
            <p>Current Price</p>
            <h6>{currentPrice}</h6>
            <p>
              {currencyQuote?.symbol} per {currencyBase?.symbol}
            </p>
          </Box>
        )}
        <Box mt={2}>
          <Button className='v3-supply-liquidity-button' onClick={onAdd}>
            Confirm
          </Button>
        </Box>
      </Box>
    );
  };

  const pendingText = `Adding ${mintInfo.parsedAmounts[
    Field.CURRENCY_A
  ]?.toSignificant()} ${baseCurrency?.symbol} and ${mintInfo.parsedAmounts[
    Field.CURRENCY_B
  ]?.toSignificant()} ${quoteCurrency?.symbol} liquidity`;

  return (
    <>
      {showConfirm && (
        <TransactionConfirmationModal
          isOpen={showConfirm}
          onDismiss={handleDismissConfirmation}
          attemptingTxn={attemptingTxn}
          hash={txHash}
          txPending={txPending}
          content={() =>
            addLiquidityErrorMessage ? (
              <TransactionErrorContent
                onDismiss={handleDismissConfirmation}
                message={addLiquidityErrorMessage}
              />
            ) : (
              <ConfirmationModalContent
                title={'Supplying Liquidity'}
                onDismiss={handleDismissConfirmation}
                content={modalHeader}
              />
            )
          }
          pendingText={pendingText}
          modalContent={
            txPending
              ? 'Submitted Adding Liquidity'
              : 'Liquidity Added successfully'
          }
        />
      )}
      <Button
        className='v3-supply-liquidity-button'
        disabled={!isReady}
        onClick={onAddLiquidity}
      >
        {title}
      </Button>
    </>
  );
}
