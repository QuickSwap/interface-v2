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

  const { onFieldAInput, onFieldBInput } = useV3MintActionHandlers(
    mintInfo.noLiquidity,
  );

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
        locked={mintInfo.depositBDisabled}
        isMax={!!atMaxAmounts[Field.CURRENCY_B]}
        error={currencyBError}
        priceFormat={priceFormat}
        isBase={true}
      />

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
