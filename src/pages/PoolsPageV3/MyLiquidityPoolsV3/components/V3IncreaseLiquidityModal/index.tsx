import React, { useCallback, useMemo, useState } from 'react';
import { TransactionResponse } from '@ethersproject/providers';
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core';
import { useV3NFTPositionManagerContract } from 'hooks/useContract';
import { RouteComponentProps, useHistory, useParams } from 'react-router-dom';
import { Text } from 'rebass';
import { ThemeContext } from 'styled-components/macro';
import TransactionConfirmationModal, {
  ConfirmationModalContent,
} from 'components/TransactionConfirmationModal';
// import { Review } from './Review';
import { useActiveWeb3React } from 'hooks';
import useTransactionDeadline from 'hooks/useTransactionDeadline';
import { useWalletModalToggle } from 'state/application/hooks';
import { Bound, Field } from 'state/mint/v3/actions';
import { useTransactionAdder } from 'state/transactions/hooks';
import { useIsExpertMode, useUserSlippageTolerance } from 'state/user/hooks';
import {
  useV3DerivedMintInfo,
  useV3MintActionHandlers,
  useV3MintState,
} from 'state/mint/v3/hooks';
import { useV3PositionFromTokenId } from 'hooks/v3/useV3Positions';
import { useDerivedPositionInfo } from 'hooks/v3/useDerivedPositionInfo';
import { BigNumber } from '@ethersproject/bignumber';
import { AddRemoveTabs } from 'components/v3/NavigationTabs';
import { NonfungiblePositionManager as NonFunPosMan } from 'v3lib/nonfungiblePositionManager';
import './index.scss';
import ReactGA from 'react-ga';
import { WrappedCurrency } from 'models/types';
import { useIsNetworkFailed } from 'hooks/v3/useIsNetworkFailed';
import { ApprovalState, useApproveCallback } from 'hooks/useV3ApproveCallback';
import { ZERO_PERCENT } from 'constants/v3/misc';
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from 'constants/v3/addresses';
import { AutoColumn } from 'components/v3/Column';
import { useUSDCValue } from 'hooks/v3/useUSDCPrice';
import { RowBetween } from 'components/v3/Row';
import CurrencyInputPanel from 'components/v3/CurrencyInputPanel';
import { PositionPreview } from 'components/v3/PositionPreview';
import { maxAmountSpend } from 'utils/v3/maxAmountSpend';
import { calculateGasMarginV3 } from 'utils';
import { useCurrency } from 'hooks/v3/Tokens';
import { ButtonError, ButtonPrimary } from 'components/v3/Button';
import { JSBI } from '@uniswap/sdk';
import { PositionPool } from 'models/interfaces';
import { useTranslation } from 'react-i18next';
import { CustomModal, DoubleCurrencyLogo, CurrencyLogo } from 'components';
import { Box, Button, Divider } from '@material-ui/core';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import RangeBadge from 'components/v3/Badge/RangeBadge';
import { unwrappedToken } from 'utils/unwrappedToken';
import RateToggle from 'components/v3/RateToggle';
import { formatTickPrice } from 'utils/v3/formatTickPrice';

interface V3IncreaseLiquidityModalProps {
  open: boolean;
  onClose: () => void;
  positionDetails: PositionPool;
}

export default function V3IncreaseLiquidityModal({
  positionDetails,
  open,
  onClose,
}: V3IncreaseLiquidityModalProps) {
  const { t } = useTranslation();

  const { chainId, account, library } = useActiveWeb3React();
  const { position: existingPosition } = useDerivedPositionInfo(
    positionDetails,
  );
  const feeAmount = 100;

  const currencyIdA = positionDetails.token0;
  const currencyIdB = positionDetails.token1;
  const baseCurrency = useCurrency(currencyIdA);
  const currencyB = useCurrency(currencyIdB);
  // prevent an error if they input ETH/WETH
  //TODO
  const quoteCurrency =
    baseCurrency && currencyB && baseCurrency.wrapped.equals(currencyB.wrapped)
      ? undefined
      : currencyB;

  const positionManager = useV3NFTPositionManagerContract();
  const tokenId = positionDetails.tokenId.toString();
  const addTransaction = useTransactionAdder();

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
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false); // clicked confirm

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
            .then((response: TransactionResponse) => {
              setAttemptingTxn(false);
              addTransaction(response, {
                summary: noLiquidity
                  ? `Create pool and add ${baseCurrency?.symbol}/${quoteCurrency?.symbol} liquidity`
                  : `Add ${baseCurrency?.symbol}/${quoteCurrency?.symbol} liquidity`,
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
            });
        })
        .catch((error) => {
          console.error('Failed to send transaction', error);
          setAttemptingTxn(false);
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

  const [currencyBase, setCurrencyBase] = useState(baseCurrency);

  const sorted = currencyBase === baseCurrency;
  const currencyQuote = sorted ? quoteCurrency : baseCurrency;

  const priceLower = sorted
    ? existingPosition?.token0PriceLower
    : existingPosition?.token0PriceUpper.invert();
  const priceUpper = sorted
    ? existingPosition?.token0PriceUpper
    : existingPosition?.token0PriceLower.invert();

  const currentPrice = sorted
    ? existingPosition?.pool.priceOf(existingPosition?.pool.token0)
    : existingPosition?.pool.priceOf(existingPosition?.pool.token1);

  return (
    <CustomModal open={open} onClose={onClose}>
      {/* {showConfirm && (
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
      )} */}
      <Box padding={3}>
        <Box className='flex justify-between'>
          <p className='weight-600'>Increase Liquidity</p>
          <CloseIcon className='cursor-pointer' onClick={onClose} />
        </Box>
        <Box mt={3} className='flex justify-between'>
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
              <p>Fee</p>
              <p>{existingPosition?.pool?.fee / 10000}%</p>
            </Box>
          )}
        </Box>
        <Box mt={2} className='flex justify-between'>
          <p>Select Range</p>
          {currencyBase && currencyQuote && (
            <RateToggle
              currencyA={currencyBase}
              currencyB={currencyQuote}
              handleRateToggle={() => setCurrencyBase(quoteCurrency)}
            />
          )}
        </Box>
        <Box width={1} mt={2} className='flex justify-between'>
          {priceLower && (
            <Box
              className='v3-supply-liquidity-price-wrapper'
              width={priceUpper ? '49%' : '100%'}
            >
              <p>Min Price</p>
              <h6>{formatTickPrice(priceLower, ticksAtLimit, Bound.LOWER)}</h6>
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
              <h6>{formatTickPrice(priceUpper, ticksAtLimit, Bound.UPPER)}</h6>
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
            <h6>{currentPrice.toSignificant()}</h6>
            <p>
              {currencyQuote?.symbol} per {currencyBase?.symbol}
            </p>
          </Box>
        )}
        <Box mt={2}>
          <p>Add more liquidity</p>
        </Box>
        {/* {showCollectAsWeth && (
          <Box mb={2} className='flex items-center'>
            <Box mr={1}>
              <p>Collect as WMATIC</p>
            </Box>
            <ToggleSwitch
              toggled={receiveWETH}
              onToggle={() => setReceiveWETH((receiveWETH) => !receiveWETH)}
            />
          </Box>
        )} */}
        {/* <Button
          className='v3-increase-liquidity-button'
          disabled={removed || percent === 0 || !liquidityValue0}
          onClick={() => setShowConfirm(true)}
        >
          Remove
        </Button> */}
      </Box>
    </CustomModal>
  );
}
