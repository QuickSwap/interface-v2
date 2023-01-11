import React, { useCallback, useMemo, useState } from 'react';
import {
  ConfirmationModalContent,
  ToggleSwitch,
  TransactionConfirmationModal,
  TransactionErrorContent,
} from 'components';
import { Box, Button, Divider } from '@material-ui/core';
import { PositionPool } from 'models/interfaces';
import { useTranslation } from 'react-i18next';
import {
  useBurnV3ActionHandlers,
  useBurnV3State,
  useDerivedV3BurnInfo,
} from 'state/burn/v3/hooks';
import CurrencyLogo from 'components/CurrencyLogo';

import { useV3NFTPositionManagerContract } from 'hooks/useContract';
import useTransactionDeadline from 'hooks/useTransactionDeadline';
import { TransactionResponse } from '@ethersproject/providers';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { Percent } from '@uniswap/sdk-core';

import ReactGA from 'react-ga';
import { useAppSelector } from 'state/hooks';
import { useActiveWeb3React } from 'hooks';
import { calculateGasMarginV3 } from 'utils';
import usePrevious from 'hooks/usePrevious';
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler';
import { GAS_PRICE_MULTIPLIER } from 'hooks/useGasPrice';
import { WMATIC_EXTENDED } from 'constants/v3/addresses';
import { NonfungiblePositionManager } from 'v3lib/nonfungiblePositionManager';
import { WrappedCurrency } from 'models/types';
import RangeBadge from 'components/v3/Badge/RangeBadge';
import DoubleCurrencyLogo from 'components/DoubleCurrencyLogo';
import ColoredSlider from 'components/ColoredSlider';
import { JSBI } from '@uniswap/sdk';
import { useUserSlippageTolerance } from 'state/user/hooks';
import './index.scss';

interface RemoveLiquidityV3Props {
  position: PositionPool;
}

export default function RemoveLiquidityV3({
  position,
}: RemoveLiquidityV3Props) {
  const { t } = useTranslation();

  const tokenId = position.tokenId;

  const gasPrice = useAppSelector((state) => {
    if (!state.application.gasPrice.fetched) return 36;
    return state.application.gasPrice.override
      ? 36
      : state.application.gasPrice.fetched;
  });

  // flag for receiving WETH
  const [receiveWETH, setReceiveWETH] = useState(false);

  // burn state
  const { percent } = useBurnV3State();

  const { account, chainId, library } = useActiveWeb3React();

  const derivedInfo = useDerivedV3BurnInfo(position, receiveWETH);
  const prevDerivedInfo = usePrevious({ ...derivedInfo });
  const {
    positionSDK,
    liquidityPercentage,
    liquidityValue0,
    liquidityValue1,
    feeValue0,
    feeValue1,
    outOfRange,
    error,
  } = useMemo(() => {
    if (
      (!derivedInfo.feeValue0 ||
        !derivedInfo.liquidityValue0 ||
        !derivedInfo.position) &&
      prevDerivedInfo
    ) {
      return {
        positionSDK: prevDerivedInfo.position,
        error: prevDerivedInfo.error,
        ...prevDerivedInfo,
      };
    }

    return {
      positionSDK: derivedInfo.position,
      error: derivedInfo.error,
      ...derivedInfo,
    };
  }, [derivedInfo, prevDerivedInfo]);

  const { onPercentSelect } = useBurnV3ActionHandlers();

  const removed = position?.liquidity?.eq(0);

  // boilerplate for the slider
  const [
    percentForSlider,
    onPercentSelectForSlider,
  ] = useDebouncedChangeHandler(percent, onPercentSelect);

  const deadline = useTransactionDeadline(); // custom from users settings
  const [allowedSlippage] = useUserSlippageTolerance();
  const allowedSlippagePercent: Percent = useMemo(() => {
    return new Percent(JSBI.BigInt(allowedSlippage), JSBI.BigInt(10000));
  }, [allowedSlippage]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [attemptingTxn, setAttemptingTxn] = useState(false);
  const [txnHash, setTxnHash] = useState<string | undefined>();
  const [removeErrorMessage, setRemoveErrorMessage] = useState('');
  const [txPending, setTxPending] = useState(false);
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();
  const positionManager = useV3NFTPositionManagerContract();

  const burn = useCallback(async () => {
    if (
      !positionManager ||
      !liquidityValue0 ||
      !liquidityValue1 ||
      !deadline ||
      !account ||
      !chainId ||
      !feeValue0 ||
      !feeValue1 ||
      !positionSDK ||
      !liquidityPercentage ||
      !library
    ) {
      return;
    }

    const { calldata, value } = NonfungiblePositionManager.removeCallParameters(
      positionSDK,
      {
        tokenId: tokenId.toString(),
        liquidityPercentage,
        slippageTolerance: allowedSlippagePercent,
        deadline: deadline.toString(),
        collectOptions: {
          expectedCurrencyOwed0: feeValue0,
          expectedCurrencyOwed1: feeValue1,
          recipient: account,
        },
      },
    );

    const txn = {
      to: positionManager.address,
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
          gasPrice: gasPrice * GAS_PRICE_MULTIPLIER,
        };

        return library
          .getSigner()
          .sendTransaction(newTxn)
          .then(async (response: TransactionResponse) => {
            setAttemptingTxn(false);
            setTxPending(true);
            ReactGA.event({
              category: 'Liquidity',
              action: 'RemoveV3',
              label: [
                liquidityValue0.currency.symbol,
                liquidityValue1.currency.symbol,
              ].join('/'),
            });
            setTxnHash(response.hash);
            const summary = t('removeLiquidityWithTokens', {
              symbol0: liquidityValue0.currency.symbol,
              symbol1: liquidityValue1.currency.symbol,
            });
            addTransaction(response, {
              summary,
            });

            try {
              const receipt = await response.wait();
              finalizedTransaction(receipt, {
                summary,
              });
              setTxPending(false);
            } catch (error) {
              setTxPending(false);
              setRemoveErrorMessage(t('errorInTx'));
            }
          });
      })
      .catch((error) => {
        setTxPending(false);
        setAttemptingTxn(false);
        setRemoveErrorMessage(t('errorInTx'));
        console.error(error);
      });
  }, [
    positionManager,
    liquidityValue0,
    liquidityValue1,
    deadline,
    account,
    chainId,
    feeValue0,
    feeValue1,
    positionSDK,
    liquidityPercentage,
    library,
    tokenId,
    allowedSlippagePercent,
    gasPrice,
    addTransaction,
    finalizedTransaction,
    t,
  ]);

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    // if there was a tx hash, we want to clear the input
    if (txnHash) {
      onPercentSelectForSlider(0);
    }
    setAttemptingTxn(false);
    setTxnHash('');
    setTxPending(false);
    setRemoveErrorMessage('');
  }, [onPercentSelectForSlider, txnHash]);

  const pendingText = t('removingLiquidityMsg', {
    amount1: liquidityValue0?.toSignificant(6),
    symbol1: liquidityValue0?.currency?.symbol,
    amount2: liquidityValue1?.toSignificant(6),
    symbol2: liquidityValue1?.currency?.symbol,
  });

  function modalHeader() {
    return (
      <Box>
        <Box mt={3} className='flex justify-between'>
          <p>
            {t('pooled')} {liquidityValue0?.currency?.symbol}
          </p>
          <Box className='flex items-center'>
            <p>{liquidityValue0?.toSignificant()}</p>
            <Box className='flex' ml={1}>
              <CurrencyLogo
                size='24px'
                currency={liquidityValue0?.currency as WrappedCurrency}
              />
            </Box>
          </Box>
        </Box>
        <Box mt={2} className='flex justify-between'>
          <p>
            {t('pooled')} {liquidityValue1?.currency?.symbol}
          </p>
          <Box className='flex items-center'>
            <p>{liquidityValue1?.toSignificant()}</p>
            <Box className='flex' ml={1}>
              <CurrencyLogo
                size='24px'
                currency={liquidityValue1?.currency as WrappedCurrency}
              />
            </Box>
          </Box>
        </Box>
        {(feeValue0?.greaterThan(0) || feeValue1?.greaterThan(0)) && (
          <Box mt={2}>
            <p>{t('collectFeeFromThisPosition')}.</p>
            <Box mt={2} className='flex justify-between'>
              <p>
                {feeValue0?.currency?.symbol} {t('feeEarned')}:
              </p>
              <Box className='flex items-center'>
                <p>{feeValue0?.toSignificant()}</p>
                <Box className='flex' ml={1}>
                  <CurrencyLogo
                    size='24px'
                    currency={feeValue0?.currency as WrappedCurrency}
                  />
                </Box>
              </Box>
            </Box>
            <Box mt={2} className='flex justify-between'>
              <p>
                {feeValue1?.currency?.symbol} {t('feeEarned')}:
              </p>
              <Box className='flex items-center'>
                <p>{feeValue1?.toSignificant()}</p>
                <Box className='flex' ml={1}>
                  <CurrencyLogo
                    size='24px'
                    currency={feeValue1?.currency as WrappedCurrency}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        )}
        <Box mt={2}>
          <Button className='v3-remove-liquidity-button' onClick={burn}>
            {t('confirm')}
          </Button>
        </Box>
      </Box>
    );
  }

  const showCollectAsWeth = Boolean(
    !chainId &&
      liquidityValue0?.currency &&
      liquidityValue1?.currency &&
      (liquidityValue0.currency.isNative ||
        liquidityValue1.currency.isNative ||
        liquidityValue0.currency.wrapped.equals(
          WMATIC_EXTENDED[liquidityValue0.currency.chainId],
        ) ||
        liquidityValue1.currency.wrapped.equals(
          WMATIC_EXTENDED[liquidityValue1.currency.chainId],
        )),
  );

  return (
    <>
      {showConfirm && (
        <TransactionConfirmationModal
          isOpen={showConfirm}
          onDismiss={handleDismissConfirmation}
          attemptingTxn={attemptingTxn}
          txPending={txPending}
          hash={txnHash}
          content={() =>
            removeErrorMessage ? (
              <TransactionErrorContent
                onDismiss={handleDismissConfirmation}
                message={removeErrorMessage}
              />
            ) : (
              <ConfirmationModalContent
                title={t('removingLiquidity')}
                onDismiss={handleDismissConfirmation}
                content={modalHeader}
              />
            )
          }
          pendingText={pendingText}
          modalContent={
            txPending
              ? t('submittedTxRemoveLiquidity')
              : t('successRemovedLiquidity')
          }
        />
      )}
      <Box className='flex justify-between'>
        <Box className='flex items-center'>
          <Box className='flex' mr={1}>
            <DoubleCurrencyLogo
              currency0={feeValue0?.currency}
              currency1={feeValue1?.currency}
              size={32}
            />
          </Box>
          <h5>
            {feeValue0?.currency.symbol}-{feeValue1?.currency.symbol}
          </h5>
        </Box>
        <RangeBadge removed={removed} inRange={!outOfRange} />
      </Box>
      <Box mt={2} className='v3-remove-liquidity-input-wrapper'>
        <Box mb={2} className='flex justify-between'>
          <small className='text-secondary'>{t('amount')}</small>
        </Box>
        <Box mb={2} className='flex items-center justify-between'>
          <h3>{percentForSlider}%</h3>
          <Box ml={1} className='v3-remove-liquidity-percent-buttons'>
            <Button onClick={() => onPercentSelectForSlider(25)}>25%</Button>
            <Button onClick={() => onPercentSelectForSlider(50)}>50%</Button>
            <Button onClick={() => onPercentSelectForSlider(75)}>75%</Button>
            <Button onClick={() => onPercentSelectForSlider(100)}>100%</Button>
          </Box>
        </Box>
        <ColoredSlider
          min={0}
          max={100}
          step={1}
          value={percentForSlider}
          handleChange={(event, value) => {
            onPercentSelectForSlider(value as number);
          }}
        />
      </Box>
      <Box my={2} className='v3-remove-liquidity-info-wrapper'>
        <Box>
          <p>
            {t('pooled')} {liquidityValue0?.currency?.symbol}
          </p>
          <Box className='flex items-center'>
            <p>{liquidityValue0?.toSignificant()}</p>
            <CurrencyLogo currency={liquidityValue0?.currency} size='20px' />
          </Box>
        </Box>
        <Box mt={2}>
          <p>
            {t('pooled')} {liquidityValue1?.currency?.symbol}
          </p>
          <Box className='flex items-center'>
            <p>{liquidityValue1?.toSignificant()}</p>
            <CurrencyLogo currency={liquidityValue1?.currency} size='20px' />
          </Box>
        </Box>
        {(feeValue0?.greaterThan(0) || feeValue1?.greaterThan(0)) && (
          <>
            <Box mt={2} width='100%' height='1px' className='border' />
            <Box my={2}>
              <p>
                {feeValue0?.currency?.symbol} {t('feeEarned')}:
              </p>
              <Box className='flex items-center'>
                <p>{feeValue0?.toSignificant()}</p>
                <CurrencyLogo currency={feeValue0?.currency} size='20px' />
              </Box>
            </Box>
            <Box>
              <p>
                {feeValue1?.currency?.symbol} {t('feeEarned')}:
              </p>
              <Box className='flex items-center'>
                <p>{feeValue1?.toSignificant()}</p>
                <CurrencyLogo currency={feeValue1?.currency} size='20px' />
              </Box>
            </Box>
          </>
        )}
      </Box>
      {showCollectAsWeth && (
        <Box mb={2} className='flex items-center'>
          <Box mr={1}>
            <p>{t('collectAsWmatic')}</p>
          </Box>
          <ToggleSwitch
            toggled={receiveWETH}
            onToggle={() => setReceiveWETH((receiveWETH) => !receiveWETH)}
          />
        </Box>
      )}
      <Button
        className='v3-remove-liquidity-button'
        disabled={removed || percent === 0 || !liquidityValue0}
        onClick={() => setShowConfirm(true)}
      >
        {percent ? t('remove') : t('enterAmount')}
      </Button>
    </>
  );
}
