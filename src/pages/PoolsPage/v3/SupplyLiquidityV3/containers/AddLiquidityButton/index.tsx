import React, { useCallback, useMemo, useState } from 'react';
import {
  useGammaUNIProxyContract,
  useV3NFTPositionManagerContract,
  useWETHContract,
} from 'hooks/useContract';
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
import {
  IDerivedMintInfo,
  useActivePreset,
  useAddLiquidityTxHash,
} from 'state/mint/v3/hooks';
import { ApprovalState, useApproveCallback } from 'hooks/useV3ApproveCallback';
import { Field } from 'state/mint/actions';
import { Bound, setAddLiquidityTxHash } from 'state/mint/v3/actions';
import { useIsNetworkFailedImmediate } from 'hooks/v3/useIsNetworkFailed';
import { JSBI, WETH } from '@uniswap/sdk';
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from 'constants/v3/addresses';
import { calculateGasMargin, calculateGasMarginV3 } from 'utils';
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
import { GammaPairs, GlobalConst } from 'constants/index';
import { useTranslation } from 'react-i18next';
import { useCurrencyBalance } from 'state/wallet/hooks';
import { formatUnits } from 'ethers/lib/utils';

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
  const { t } = useTranslation();
  const { chainId, library, account } = useActiveWeb3React();
  const [showConfirm, setShowConfirm] = useState(false);
  const [attemptingTxn, setAttemptingTxn] = useState(false);
  const [txPending, setTxPending] = useState(false);
  const [addLiquidityErrorMessage, setAddLiquidityErrorMessage] = useState<
    string | null
  >(null);
  const [manuallyInverted, setManuallyInverted] = useState(false);
  const preset = useActivePreset();

  const positionManager = useV3NFTPositionManagerContract();
  const gammaUNIPROXYContract = useGammaUNIProxyContract();
  const wethContract = useWETHContract();

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

  const baseCurrencyAddress =
    baseCurrency && baseCurrency.wrapped
      ? baseCurrency.wrapped.address.toLowerCase()
      : '';
  const quoteCurrencyAddress =
    quoteCurrency && quoteCurrency.wrapped
      ? quoteCurrency.wrapped.address.toLowerCase()
      : '';
  const gammaPair =
    GammaPairs[baseCurrencyAddress + '-' + quoteCurrencyAddress] ??
    GammaPairs[quoteCurrencyAddress + '-' + baseCurrencyAddress];
  const gammaPairAddress =
    gammaPair && gammaPair.length > 0
      ? gammaPair.find((pair) => pair.type === preset)?.address
      : undefined;
  const amountA = mintInfo.parsedAmounts[Field.CURRENCY_A];
  const amountB = mintInfo.parsedAmounts[Field.CURRENCY_B];
  const wmaticBalance = useCurrencyBalance(
    account ?? undefined,
    chainId ? WETH[chainId] : undefined,
  );

  const [wrappingETH, setWrappingETH] = useState(false);
  const amountToWrap = useMemo(() => {
    if (
      !baseCurrency ||
      !quoteCurrency ||
      !amountA ||
      !amountB ||
      !chainId ||
      mintInfo.liquidityRangeType ===
        GlobalConst.v3LiquidityRangeType.MANUAL_RANGE
    )
      return;
    if (
      baseCurrency.isNative ||
      baseCurrency.wrapped.address.toLowerCase() ===
        WETH[chainId].address.toLowerCase()
    ) {
      if (
        wmaticBalance &&
        JSBI.greaterThan(amountA.numerator, wmaticBalance.numerator)
      ) {
        return JSBI.subtract(amountA.numerator, wmaticBalance.numerator);
      }
      return;
    } else if (
      quoteCurrency.isNative ||
      quoteCurrency.wrapped.address.toLowerCase() ===
        WETH[chainId].address.toLowerCase()
    ) {
      if (
        wmaticBalance &&
        JSBI.greaterThan(amountB.numerator, wmaticBalance.numerator)
      ) {
        return JSBI.subtract(amountB.numerator, wmaticBalance.numerator);
      }
      return;
    }
    return;
  }, [
    amountA,
    amountB,
    baseCurrency,
    chainId,
    mintInfo.liquidityRangeType,
    quoteCurrency,
    wmaticBalance,
  ]);

  const [approvalA] = useApproveCallback(
    mintInfo.parsedAmounts[Field.CURRENCY_A],
    chainId
      ? mintInfo.liquidityRangeType ===
        GlobalConst.v3LiquidityRangeType.GAMMA_RANGE
        ? gammaPairAddress
        : NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId]
      : undefined,
  );
  const [approvalB] = useApproveCallback(
    mintInfo.parsedAmounts[Field.CURRENCY_B],
    chainId
      ? mintInfo.liquidityRangeType ===
        GlobalConst.v3LiquidityRangeType.GAMMA_RANGE
        ? gammaPairAddress
        : NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId]
      : undefined,
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
        !isNetworkFailed &&
        (amountToWrap ? !wrappingETH : true),
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
    amountToWrap,
    wrappingETH,
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

  async function onWrapMatic() {
    if (!chainId || !library || !account || !wethContract || !amountToWrap)
      return;

    setWrappingETH(true);
    try {
      const wrapEstimateGas = await wethContract.estimateGas.deposit({
        value: `0x${amountToWrap.toString(16)}`,
      });
      const wrapResponse: TransactionResponse = await wethContract.deposit({
        gasLimit: calculateGasMargin(wrapEstimateGas),
        value: `0x${amountToWrap.toString(16)}`,
      });
      setAttemptingTxn(false);
      setTxPending(true);
      const summary = `Wrap ${formatUnits(
        amountToWrap.toString(),
        18,
      )} ETH to WETH`;
      addTransaction(wrapResponse, {
        summary,
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
  }

  async function onAdd() {
    if (!chainId || !library || !account) return;

    if (!baseCurrency || !quoteCurrency) {
      return;
    }

    if (
      mintInfo.liquidityRangeType ===
      GlobalConst.v3LiquidityRangeType.GAMMA_RANGE
    ) {
      if (!gammaUNIPROXYContract) return;
      const baseCurrencyAddress = baseCurrency.wrapped
        ? baseCurrency.wrapped.address.toLowerCase()
        : '';
      const quoteCurrencyAddress = quoteCurrency.wrapped
        ? quoteCurrency.wrapped.address.toLowerCase()
        : '';
      const gammaPair =
        GammaPairs[baseCurrencyAddress + '-' + quoteCurrencyAddress] ??
        GammaPairs[quoteCurrencyAddress + '-' + baseCurrencyAddress];
      const gammaPairAddress =
        gammaPair && gammaPair.length > 0
          ? gammaPair.find((pair) => pair.type === preset)?.address
          : undefined;
      if (!amountA || !amountB || !gammaPairAddress) return;

      setRejected && setRejected(false);

      setAttemptingTxn(true);
      try {
        const estimatedGas = await gammaUNIPROXYContract.estimateGas.deposit(
          (GammaPairs[baseCurrencyAddress + '-' + quoteCurrencyAddress]
            ? amountA
            : amountB
          ).numerator.toString(),
          (GammaPairs[baseCurrencyAddress + '-' + quoteCurrencyAddress]
            ? amountB
            : amountA
          ).numerator.toString(),
          account,
          gammaPairAddress,
          [0, 0, 0, 0],
        );
        const response: TransactionResponse = await gammaUNIPROXYContract.deposit(
          (GammaPairs[baseCurrencyAddress + '-' + quoteCurrencyAddress]
            ? amountA
            : amountB
          ).numerator.toString(),
          (GammaPairs[baseCurrencyAddress + '-' + quoteCurrencyAddress]
            ? amountB
            : amountA
          ).numerator.toString(),
          account,
          gammaPairAddress,
          [0, 0, 0, 0],
          {
            gasLimit: calculateGasMargin(estimatedGas),
          },
        );
        const summary = mintInfo.noLiquidity
          ? t('createPoolandaddLiquidity', {
              symbolA: baseCurrency?.symbol,
              symbolB: quoteCurrency?.symbol,
            })
          : t('addLiquidityWithTokens', {
              symbolA: baseCurrency?.symbol,
              symbolB: quoteCurrency?.symbol,
            });
        setAttemptingTxn(false);
        setTxPending(true);
        addTransaction(response, {
          summary,
        });
        dispatch(setAddLiquidityTxHash({ txHash: response.hash }));
        const receipt = await response.wait();
        finalizedTransaction(receipt, {
          summary,
        });
        setTxPending(false);
        handleAddLiquidity();
      } catch (error) {
        console.error('Failed to send transaction', error);
        setAttemptingTxn(false);
        setTxPending(false);
        setAddLiquidityErrorMessage(
          error?.code === 4001 ? t('txRejected') : t('errorInTx'),
        );
      }
    } else if (mintInfo.position && account && deadline) {
      if (!positionManager) return;
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
                ? t('createPoolandaddLiquidity', {
                    symbolA: baseCurrency?.symbol,
                    symbolB: quoteCurrency?.symbol,
                  })
                : t('addLiquidityWithTokens', {
                    symbolA: baseCurrency?.symbol,
                    symbolB: quoteCurrency?.symbol,
                  });
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
                  error?.code === 4001 ? t('txRejected') : t('errorInTx'),
                );
              }
            })
            .catch((err) => {
              console.error('Failed to send transaction', err);
              setAttemptingTxn(false);
              setAddLiquidityErrorMessage(
                err?.code === 4001 ? t('txRejected') : t('errorInTx'),
              );
            });
        })
        .catch((error) => {
          console.error('Failed to send transaction', error);
          // we only care if the error is something _other_ than the user rejected the tx
          setRejected && setRejected(true);
          setAttemptingTxn(false);
          setAddLiquidityErrorMessage(
            error?.code === 4001 ? t('txRejected') : t('errorInTx'),
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
            <p>{t('selectedRange')}</p>
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
              <p>{t('minPrice')}</p>
              <h6>{priceLower.toSignificant()}</h6>
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
              className='v3-supply-liquidity-price-wrapper'
              width={priceLower ? '49%' : '100%'}
            >
              <p>{t('minPrice')}</p>
              <h6>{priceUpper.toSignificant()}</h6>
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
          <Box mt={2} className='v3-supply-liquidity-price-wrapper'>
            <p>{t('currentPrice')}</p>
            <h6>{currentPrice}</h6>
            <p>
              {currencyQuote?.symbol} {t('per')} {currencyBase?.symbol}
            </p>
          </Box>
        )}
        <Box mt={2}>
          <Button className='v3-supply-liquidity-button' onClick={onAdd}>
            {t('confirm')}
          </Button>
        </Box>
      </Box>
    );
  };

  const pendingText = t('addingLiquidityTokens', {
    amountA: mintInfo.parsedAmounts[Field.CURRENCY_A]?.toSignificant(),
    symbolA: baseCurrency?.symbol,
    amountB: mintInfo.parsedAmounts[Field.CURRENCY_B]?.toSignificant(),
    symbolB: quoteCurrency?.symbol,
  });

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
                title={t('supplyingliquidity')}
                onDismiss={handleDismissConfirmation}
                content={modalHeader}
              />
            )
          }
          pendingText={pendingText}
          modalContent={
            txPending
              ? t('submittedAddingLiquidity')
              : t('liquidityAddedSuccessfully')
          }
        />
      )}
      <Button
        className='v3-supply-liquidity-button'
        disabled={!isReady}
        onClick={amountToWrap ? onWrapMatic : onAddLiquidity}
      >
        {amountToWrap
          ? wrappingETH
            ? t('wrappingMATIC')
            : t('wrapMATIC')
          : title}
      </Button>
    </>
  );
}
