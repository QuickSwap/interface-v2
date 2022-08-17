import React, { useCallback, useContext, useMemo, useState } from 'react';
import { TransactionResponse } from '@ethersproject/providers';
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core';
import { useV3NFTPositionManagerContract } from '../../hooks/useContract';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { Text } from 'rebass';
import { ThemeContext } from 'styled-components/macro';
import TransactionConfirmationModal, {
  ConfirmationModalContent,
} from '../../components/TransactionConfirmationModal';
import { Review } from './Review';
import { useActiveWeb3React } from 'hooks';
import useTransactionDeadline from '../../hooks/useTransactionDeadline';
import { useWalletModalToggle } from '../../state/application/hooks';
import { Bound, Field } from '../../state/mint/v3/actions';
import { useTransactionAdder } from '../../state/transactions/hooks';
import {
  useIsExpertMode,
  useUserSlippageTolerance,
} from '../../state/user/hooks';
import { HideMedium, MediumOnly, RightContainer, Dots } from './styled';
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
import { WrappedCurrency } from '../../models/types';
import { useIsNetworkFailed } from 'hooks/v3/useIsNetworkFailed';
import { ApprovalState, useApproveCallback } from 'hooks/useV3ApproveCallback';
import { TYPE } from 'theme/index';
import Card from 'components/v3/Card/Card';
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

const DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE = new Percent(50, 10_000);

export default function AddLiquidity() {
  // {
  //   match: {
  //       params: { currencyIdA, currencyIdB, tokenId },
  //   },
  //   history,
  // }: RouteComponentProps<{ currencyIdA?: string; currencyIdB?: string; feeAmount?: string; tokenId?: string }>
  //TODO Fix pools to work with proper routing/token select
  const tokenId = '20';
  const currencyIdA = 'MATIC';
  const currencyIdB = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
  const history = useHistory();

  const { account, chainId, library } = useActiveWeb3React();
  const theme = useContext(ThemeContext);
  const toggleWalletModal = useWalletModalToggle(); // toggle wallet when disconnected
  const expertMode = useIsExpertMode();
  const addTransaction = useTransactionAdder();
  const positionManager = useV3NFTPositionManagerContract();

  // check for existing position if tokenId in url
  const {
    position: existingPositionDetails,
    loading: positionLoading,
  } = useV3PositionFromTokenId(tokenId ? BigNumber.from(tokenId) : undefined);

  const networkFailed = useIsNetworkFailed();

  const hasExistingPosition = !!existingPositionDetails && !positionLoading;
  const { position: existingPosition } = useDerivedPositionInfo(
    existingPositionDetails,
  );
  const feeAmount = 100;

  const baseCurrency = useCurrency(currencyIdA);
  const currencyB = useCurrency(currencyIdB);
  // prevent an error if they input ETH/WETH
  //TODO
  const quoteCurrency =
    baseCurrency && currencyB && baseCurrency.wrapped.equals(currencyB.wrapped)
      ? undefined
      : currencyB;

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

      const { calldata, value } =
        hasExistingPosition && tokenId
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

  // flag for whether pool creation must be a separate tx
  const mustCreateSeparately = noLiquidity;

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('');
      // dont jump to pool page if creating
      if (!mustCreateSeparately) {
        history.push('/pool');
      }
    }
    setTxHash('');
  }, [history, mustCreateSeparately, onFieldAInput, txHash]);

  // get value and prices at ticks
  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks;
  const {
    [Bound.LOWER]: priceLower,
    [Bound.UPPER]: priceUpper,
  } = pricesAtTicks;

  // we need an existence check on parsed amounts for single-asset deposits
  const showApprovalA =
    approvalA !== ApprovalState.APPROVED && !!parsedAmounts[Field.CURRENCY_A];
  const showApprovalB =
    approvalB !== ApprovalState.APPROVED && !!parsedAmounts[Field.CURRENCY_B];

  const pendingText = 'Loading...';

  const Buttons = () =>
    !account ? (
      <button
        className={'btn primary pv-1 br-12 b'}
        onClick={toggleWalletModal}
      >
        Connect wallet
      </button>
    ) : (
      <AutoColumn gap={'md'}>
        {(approvalA === ApprovalState.NOT_APPROVED ||
          approvalA === ApprovalState.PENDING ||
          approvalB === ApprovalState.NOT_APPROVED ||
          approvalB === ApprovalState.PENDING) &&
          isValid && (
            <RowBetween>
              {showApprovalA && (
                <ButtonPrimary
                  onClick={approveACallback}
                  style={{ color: 'white', background: theme.winterMainButton }}
                  disabled={approvalA === ApprovalState.PENDING}
                  width={showApprovalB ? '48%' : '100%'}
                >
                  {approvalA === ApprovalState.PENDING ? (
                    <Dots>
                      Approving {currencies[Field.CURRENCY_A]?.symbol}
                    </Dots>
                  ) : (
                    `Approve ${currencies[Field.CURRENCY_A]?.symbol}`
                  )}
                </ButtonPrimary>
              )}
              {showApprovalB && (
                <ButtonPrimary
                  onClick={approveBCallback}
                  style={{ color: 'white', background: theme.winterMainButton }}
                  disabled={approvalB === ApprovalState.PENDING}
                  width={showApprovalA ? '48%' : '100%'}
                >
                  {approvalB === ApprovalState.PENDING ? (
                    <Dots>
                      Approving {currencies[Field.CURRENCY_B]?.symbol}
                    </Dots>
                  ) : (
                    `Approve ${currencies[Field.CURRENCY_B]?.symbol}`
                  )}
                </ButtonPrimary>
              )}
            </RowBetween>
          )}
        {mustCreateSeparately && (
          <ButtonError disabled={!isValid || attemptingTxn || !position}>
            {attemptingTxn ? (
              <Dots>Confirm Create</Dots>
            ) : (
              <Text fontWeight={500}>
                {errorMessage ? errorMessage : 'Create'}
              </Text>
            )}
          </ButtonError>
        )}
        <button
          className={'btn primary pv-1 br-12 b'}
          onClick={() => (expertMode ? onAdd() : setShowConfirm(true))}
          disabled={
            mustCreateSeparately ||
            !isValid ||
            (approvalA !== ApprovalState.APPROVED && !depositADisabled) ||
            (approvalB !== ApprovalState.APPROVED && !depositBDisabled)
          }
          // error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
        >
          <Text fontWeight={500}>
            {mustCreateSeparately
              ? 'Add'
              : errorMessage
              ? errorMessage
              : 'Preview'}
          </Text>
        </button>
      </AutoColumn>
    );

  return (
    <div className={'maw-765 mh-a'}>
      {/* <TransactionConfirmationModal
                isOpen={showConfirm}
                onDismiss={handleDismissConfirmation}
                attemptingTxn={attemptingTxn}
                hash={txHash}
                content={() => (
                    <ConfirmationModalContent
                        title={t`Increase Liquidity`}
                        onDismiss={handleDismissConfirmation}
                        topContent={() => <Review position={position} outOfRange={outOfRange} ticksAtLimit={ticksAtLimit} />}
                        bottomContent={() => (
                            <ButtonPrimary style={{ marginTop: "1rem", color: "white" }} onClick={onAdd}>
                                <Text fontWeight={500} fontSize={20}>
                                    Add
                                </Text>
                            </ButtonPrimary>
                        )}
                    />
                )}
                pendingText={pendingText}
            /> */}
      <Card classes={'p-2 br-24'}>
        <AddRemoveTabs
          creating={false}
          adding={true}
          positionID={tokenId}
          defaultSlippage={DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE}
          showBackLink={!hasExistingPosition}
        />
        <div
          className={'add-liquidity pt-1 mt-1'}
          data-wide={!hasExistingPosition && !networkFailed}
        >
          <AutoColumn gap='lg'>
            {hasExistingPosition && existingPosition && (
              <PositionPreview
                position={existingPosition}
                title={'Selected Range'}
                inRange={!outOfRange}
                ticksAtLimit={ticksAtLimit}
              />
            )}
          </AutoColumn>
          <Card
            isDark={false}
            classes={'add-liquidity__bottom p-1 br-12'}
            data-disabled={
              tickLower === undefined ||
              tickUpper === undefined ||
              invalidPool ||
              invalidRange
            }
          >
            <TYPE.label>
              {hasExistingPosition ? 'Add more liquidity' : 'Deposit Amounts'}
            </TYPE.label>

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
          </Card>
          {!hasExistingPosition ? (
            <>
              <HideMedium>
                <Buttons />
              </HideMedium>
              <RightContainer gap='lg'>
                <MediumOnly>
                  <Buttons />
                </MediumOnly>
              </RightContainer>
            </>
          ) : (
            <Buttons />
          )}
        </div>
      </Card>
    </div>
  );
}
