import React, { useEffect, useMemo } from 'react';
import { Currency, CurrencyAmount } from '@uniswap/sdk-core';
import './index.scss';
import { Field } from 'state/mint/actions';
import {
  IDerivedMintInfo,
  useV3MintActionHandlers,
  useV3MintState,
} from 'state/mint/v3/hooks';
import { ApprovalState, useApproveCallback } from 'hooks/useV3ApproveCallback';
import { useActiveWeb3React } from 'hooks';
import { useUSDCValue } from 'hooks/v3/useUSDCPrice';
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from 'constants/v3/addresses';
import { maxAmountSpend } from 'utils/v3/maxAmountSpend';
import { tryParseAmount } from 'state/swap/v3/hooks';
import { TokenAmountCard } from '../../components/TokenAmountCard';
import { PriceFormats } from 'components/v3/PriceFomatToggler';
import { Box, Button } from '@material-ui/core';
import Loader from 'components/Loader';
import { Check } from '@material-ui/icons';

interface IEnterAmounts {
  currencyA: Currency | undefined;
  currencyB: Currency | undefined;
  mintInfo: IDerivedMintInfo;
  priceFormat: PriceFormats;
}

export function EnterAmounts({
  currencyA,
  currencyB,
  mintInfo,
  priceFormat,
}: IEnterAmounts) {
  const { chainId } = useActiveWeb3React();

  const { independentField, typedValue } = useV3MintState();

  const {
    onFieldAInput,
    onFieldBInput,
    // onLeftRangeInput,
    // onRightRangeInput,
  } = useV3MintActionHandlers(mintInfo.noLiquidity);

  // get value and prices at ticks
  // const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = useMemo(() => {
  //   return mintInfo.ticks;
  // }, [mintInfo]);

  // this code may be needed when we are going to show token ratio component
  // const {
  //   getDecrementLower,
  //   getIncrementLower,
  //   getDecrementUpper,
  //   getIncrementUpper,
  // } = useRangeHopCallbacks(
  //   currencyA ?? undefined,
  //   currencyB ?? undefined,
  //   mintInfo.dynamicFee,
  //   tickLower,
  //   tickUpper,
  //   mintInfo.pool,
  // );

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [mintInfo.dependentField]:
      mintInfo.parsedAmounts[mintInfo.dependentField]?.toSignificant(6) ?? '',
  };

  const usdcValues = {
    [Field.CURRENCY_A]: useUSDCValue(
      mintInfo.parsedAmounts[Field.CURRENCY_A],
      true,
    ),
    [Field.CURRENCY_B]: useUSDCValue(
      mintInfo.parsedAmounts[Field.CURRENCY_B],
      true,
    ),
  };

  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [
    Field.CURRENCY_A,
    Field.CURRENCY_B,
  ].reduce((accumulator, field) => {
    return {
      ...accumulator,
      [field]: maxAmountSpend(mintInfo.currencyBalances[field]),
    };
  }, {});

  const atMaxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [
    Field.CURRENCY_A,
    Field.CURRENCY_B,
  ].reduce((accumulator, field) => {
    return {
      ...accumulator,
      [field]: maxAmounts[field]?.equalTo(mintInfo.parsedAmounts[field] ?? '0'),
    };
  }, {});

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(
    mintInfo.parsedAmounts[Field.CURRENCY_A] || tryParseAmount('1', currencyA),
    chainId ? NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId] : undefined,
  );
  const [approvalB, approveBCallback] = useApproveCallback(
    mintInfo.parsedAmounts[Field.CURRENCY_B] || tryParseAmount('1', currencyB),
    chainId ? NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId] : undefined,
  );

  const showApprovalA = useMemo(() => {
    if (approvalA === ApprovalState.UNKNOWN) return undefined;

    if (approvalA === ApprovalState.NOT_APPROVED) return true;

    return approvalA !== ApprovalState.APPROVED;
  }, [approvalA]);

  const showApprovalB = useMemo(() => {
    if (approvalB === ApprovalState.UNKNOWN) return undefined;

    if (approvalB === ApprovalState.NOT_APPROVED) return true;

    return approvalB !== ApprovalState.APPROVED;
  }, [approvalB]);

  const [token0Ratio, token1Ratio] = useMemo(() => {
    const currentPrice = mintInfo.price?.toSignificant(5);

    const left = mintInfo.lowerPrice?.toSignificant(5);
    const right = mintInfo.upperPrice?.toSignificant(5);

    //TODO
    if (
      right === '338490000000000000000000000000000000000000000000000' ||
      right === '338490000000000000000000000000000000000'
    )
      return ['50', '50'];

    if (!currentPrice) return ['0', '0'];

    if (!left && !right) return ['0', '0'];

    if (!left && right) return ['0', '100'];

    if (!right && left) return ['100', '0'];

    if (mintInfo.depositADisabled) {
      return ['0', '100'];
    }

    if (mintInfo.depositBDisabled) {
      return ['100', '0'];
    }

    if (left && right && currentPrice) {
      const leftRange = +currentPrice - +left;
      const rightRange = +right - +currentPrice;

      const totalSum = +leftRange + +rightRange;

      const leftRate = (+leftRange * 100) / totalSum;
      const rightRate = (+rightRange * 100) / totalSum;

      if (mintInfo.invertPrice) {
        return [String(leftRate), String(rightRate)];
      } else {
        return [String(rightRate), String(leftRate)];
      }
    }

    return ['0', '0'];
  }, [currencyA, currencyB, mintInfo]);

  const currencyAError = useMemo(() => {
    if (
      (mintInfo.errorCode !== 4 && mintInfo.errorCode !== 5) ||
      !mintInfo.errorMessage ||
      !currencyA
    )
      return;

    const erroredToken = mintInfo.errorMessage.split(' ')[1];

    if (currencyA.wrapped.symbol === erroredToken) return mintInfo.errorMessage;

    return;
  }, [mintInfo, currencyA]);

  const currencyBError = useMemo(() => {
    if (
      (mintInfo.errorCode !== 5 && mintInfo.errorCode !== 4) ||
      !mintInfo.errorMessage ||
      !currencyB
    )
      return;

    const erroredToken = mintInfo.errorMessage.split(' ')[1];

    if (currencyB.wrapped.symbol === erroredToken) return mintInfo.errorMessage;

    return;
  }, [mintInfo, currencyB]);

  // const leftPrice = useMemo(() => {
  //   return mintInfo.invertPrice
  //     ? mintInfo.upperPrice.invert()
  //     : mintInfo.lowerPrice;
  // }, [mintInfo]);

  // const rightPrice = useMemo(() => {
  //   return mintInfo.invertPrice
  //     ? mintInfo.lowerPrice.invert()
  //     : mintInfo.upperPrice;
  // }, [mintInfo]);

  return (
    <Box>
      <small className='weight-600'>Deposit Amounts</small>
      <Box my={2}>
        <TokenAmountCard
          currency={currencyA}
          otherCurrency={currencyB}
          value={formattedAmounts[Field.CURRENCY_A]}
          fiatValue={usdcValues[Field.CURRENCY_A]}
          handleInput={onFieldAInput}
          handleHalf={() =>
            onFieldAInput(
              maxAmounts[Field.CURRENCY_A]?.divide('2')?.toExact() ?? '',
            )
          }
          handleMax={() =>
            onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
          }
          // showApproval={showApprovalA}
          // isApproving={approvalA === ApprovalState.PENDING}
          // handleApprove={approveACallback}
          locked={mintInfo.depositADisabled}
          isMax={!!atMaxAmounts[Field.CURRENCY_A]}
          error={currencyAError}
          priceFormat={priceFormat}
          isBase={false}
        />
      </Box>
      <TokenAmountCard
        currency={currencyB}
        otherCurrency={currencyA}
        value={formattedAmounts[Field.CURRENCY_B]}
        fiatValue={usdcValues[Field.CURRENCY_B]}
        handleInput={onFieldBInput}
        handleHalf={() =>
          onFieldBInput(
            maxAmounts[Field.CURRENCY_B]?.divide('2')?.toExact() ?? '',
          )
        }
        handleMax={() =>
          onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
        }
        // showApproval={showApprovalB}
        // isApproving={approvalB === ApprovalState.PENDING}
        // handleApprove={approveBCallback}
        locked={mintInfo.depositBDisabled}
        isMax={!!atMaxAmounts[Field.CURRENCY_B]}
        error={currencyBError}
        priceFormat={priceFormat}
        isBase={true}
      />
      {/* <div className='full-h ml-2 mxs_ml-0 mxs_mb-2 ms_ml-0 mm_ml-0 mm_mb-1'>
          <TokenRatio
            currencyA={currencyA}
            currencyB={currencyB}
            token0Ratio={token0Ratio}
            token1Ratio={token1Ratio}
            decrementLeft={
              mintInfo.invertPrice ? getIncrementUpper : getDecrementLower
            }
            decrementRight={
              mintInfo.invertPrice ? getIncrementLower : getDecrementUpper
            }
            incrementLeft={
              mintInfo.invertPrice ? getDecrementUpper : getIncrementLower
            }
            incrementRight={
              mintInfo.invertPrice ? getDecrementLower : getIncrementUpper
            }
            incrementDisabled={mintInfo.ticksAtLimit[Bound.UPPER]}
            decrementDisabled={mintInfo.ticksAtLimit[Bound.UPPER]}
            onUserLeftInput={onLeftRangeInput}
            onUserRightInput={onRightRangeInput}
            lowerPrice={leftPrice?.toSignificant(5)}
            upperPrice={rightPrice?.toSignificant(5)}
            disabled={false}
          />
        </div> */}
      <Box mt={2} className='flex justify-between'>
        {showApprovalA !== undefined && (
          <Box width={showApprovalB === undefined ? '100%' : '49%'}>
            {showApprovalA ? (
              approvalA === ApprovalState.PENDING ? (
                <Box className='token-approve-button-loading'>
                  <Loader stroke='white' />
                  <p>Approving {currencyA?.symbol}</p>
                </Box>
              ) : (
                <Button
                  className='token-approve-button'
                  onClick={approveACallback}
                >
                  <p>Approve {currencyA?.symbol}</p>
                </Button>
              )
            ) : (
              <Box className='token-approve-button-loading'>
                <Check />
                <p>Approved {currencyA?.symbol}</p>
              </Box>
            )}
          </Box>
        )}
        {showApprovalB !== undefined && (
          <Box width={showApprovalA === undefined ? '100%' : '49%'}>
            {showApprovalB ? (
              approvalB === ApprovalState.PENDING ? (
                <Box className='token-approve-button-loading'>
                  <Loader stroke='white' />
                  <p>Approving {currencyB?.symbol}</p>
                </Box>
              ) : (
                <Button
                  className='token-approve-button'
                  onClick={approveBCallback}
                >
                  <p>Approve {currencyB?.symbol}</p>
                </Button>
              )
            ) : (
              <Box className='token-approve-button-loading'>
                <Check />
                <p>Approved {currencyB?.symbol}</p>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
