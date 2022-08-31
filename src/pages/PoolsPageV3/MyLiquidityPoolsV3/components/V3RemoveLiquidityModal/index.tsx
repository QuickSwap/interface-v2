import React, { useCallback, useMemo, useState } from 'react';
import {
  ConfirmationModalContent,
  CustomModal,
  NumericalInput,
  ToggleSwitch,
  TransactionConfirmationModal,
  TransactionErrorContent,
} from 'components';
import { Box, Button, Divider } from '@material-ui/core';
import { PositionPool } from 'models/interfaces';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import { useTranslation } from 'react-i18next';
import { Redirect, RouteComponentProps, useParams } from 'react-router-dom';
import { BigNumber } from '@ethersproject/bignumber';
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
import { formatUnits } from 'ethers/lib/utils';

interface V3RemoveLiquidityModalProps {
  open: boolean;
  onClose: () => void;
  position: PositionPool;
}

export default function V3RemoveLiquidityModal({
  position,
  open,
  onClose,
}: V3RemoveLiquidityModalProps) {
  const { t } = useTranslation();

  const [typedValue, setTypedValue] = useState('');
  const prevPosition = usePrevious({ ...position });
  const tokenId = position.tokenId;
  const _position = useMemo(() => {
    if (!position && prevPosition) {
      return { ...prevPosition };
    }
    return { ...position };
  }, [position]);

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
  }, [derivedInfo]);

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
            setAttemptingTxn(false);
            const summary = `Remove ${liquidityValue0.currency.symbol}/${liquidityValue1.currency.symbol} liquidity`;
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
    tokenId,
    liquidityValue0,
    liquidityValue1,
    deadline,
    allowedSlippagePercent,
    account,
    addTransaction,
    positionManager,
    chainId,
    feeValue0,
    feeValue1,
    library,
    liquidityPercentage,
    positionSDK,
  ]);

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    // if there was a tx hash, we want to clear the input
    if (txnHash) {
      onPercentSelectForSlider(0);
    }
    setAttemptingTxn(false);
    setTxnHash('');
  }, [onPercentSelectForSlider, txnHash]);

  const pendingText = `Removing ${liquidityValue0?.toSignificant(6)} ${
    liquidityValue0?.currency?.symbol
  } and ${liquidityValue1?.toSignificant(6)} ${
    liquidityValue1?.currency?.symbol
  }`;

  function modalHeader() {
    return (
      <Box>
        <Box mt={3} className='flex justify-between'>
          <p>Pooled {liquidityValue0?.currency?.symbol}</p>
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
          <p>Pooled {liquidityValue1?.currency?.symbol}</p>
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
            <p>You will also collect fees earned from this position.</p>
            <Box>
              <p>{feeValue0?.currency?.symbol} Fees Earned:</p>
              <Box>
                <p>{feeValue0?.toSignificant()}</p>
                <Box className='flex' ml={1}>
                  <CurrencyLogo
                    size='24px'
                    currency={feeValue0?.currency as WrappedCurrency}
                  />
                </Box>
              </Box>
            </Box>
            <Box>
              <p>{feeValue1?.currency?.symbol} Fees Earned:</p>
              <Box>
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
            Confirm
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
    <CustomModal open={open} onClose={onClose}>
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
      <Box padding={3}>
        <Box className='flex justify-between'>
          <p className='weight-600'>{t('removeLiquidity')}</p>
          <CloseIcon className='cursor-pointer' onClick={onClose} />
        </Box>
        <Box mt={3} className='flex justify-between'>
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
            <small className='text-secondary'>Amount</small>
            <small className='text-secondary'>
              Balance: {formatUnits(position.liquidity)}
            </small>
          </Box>
          <NumericalInput
            placeholder='0'
            value={typedValue}
            fontSize={28}
            onUserInput={(value) => {
              setTypedValue(value);
              onPercentSelectForSlider(
                Math.floor(
                  Math.min(
                    (Number(value) / Number(formatUnits(position.liquidity))) *
                      100,
                    100,
                  ),
                ),
              );
            }}
          />
          <Box mt={1} className='flex items-center'>
            <Box flex={1} mr={1}>
              <ColoredSlider
                min={1}
                max={100}
                step={1}
                value={percentForSlider}
                handleChange={(event, value) => {
                  onPercentSelectForSlider(value as number);
                  setTypedValue(
                    (
                      ((value as number) / 100) *
                      Number(formatUnits(position.liquidity))
                    ).toString(),
                  );
                }}
              />
            </Box>
            <small>{percentForSlider}%</small>
          </Box>
        </Box>
        <Box my={2} className='v3-remove-liquidity-info-wrapper'>
          <Box>
            <p>Pooled {liquidityValue0?.currency?.symbol}</p>
            <Box className='flex items-center'>
              <p>{liquidityValue0?.toSignificant()}</p>
              <CurrencyLogo currency={liquidityValue0?.currency} size='20px' />
            </Box>
          </Box>
          <Box mt={2}>
            <p>Pooled {liquidityValue1?.currency?.symbol}</p>
            <Box className='flex items-center'>
              <p>{liquidityValue1?.toSignificant()}</p>
              <CurrencyLogo currency={liquidityValue1?.currency} size='20px' />
            </Box>
          </Box>
          {(feeValue0?.greaterThan(0) || feeValue1?.greaterThan(0)) && (
            <Box mt={2}>
              <Divider />
              <Box my={2}>
                <p>{feeValue0?.currency?.symbol} Fees Earned:</p>
                <Box className='flex items-center'>
                  <p>{feeValue0?.toSignificant()}</p>
                  <CurrencyLogo currency={feeValue0?.currency} size='20px' />
                </Box>
              </Box>
              <Box>
                <p>{feeValue1?.currency?.symbol} Fees Earned:</p>
                <Box className='flex items-center'>
                  <p>{feeValue1?.toSignificant()}</p>
                  <CurrencyLogo currency={feeValue1?.currency} size='20px' />
                </Box>
              </Box>
            </Box>
          )}
        </Box>
        {showCollectAsWeth && (
          <Box mb={2} className='flex items-center'>
            <Box mr={1}>
              <p>Collect as WMATIC</p>
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
          Remove
        </Button>
      </Box>
    </CustomModal>
  );
}
