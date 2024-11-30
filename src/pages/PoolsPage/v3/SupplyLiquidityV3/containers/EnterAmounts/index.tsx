import React, { useMemo } from 'react';
import { Currency, CurrencyAmount } from '@uniswap/sdk-core';
import './index.scss';
import { Field } from 'state/mint/actions';
import {
  IDerivedMintInfo,
  useActivePreset,
  useV3MintActionHandlers,
  useV3MintState,
} from 'state/mint/v3/hooks';
import { ApprovalState, useApproveCallback } from 'hooks/useV3ApproveCallback';
import { useActiveWeb3React } from 'hooks';
import { useUSDCValue } from 'hooks/v3/useUSDCPrice';
import {
  NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
  UNI_NFT_POSITION_MANAGER_ADDRESS,
  ALGEBRA_INTEGRAL_NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
} from 'constants/v3/addresses';
import { halfAmountSpend, maxAmountSpend } from 'utils/v3/maxAmountSpend';
import { tryParseAmount } from 'state/swap/v3/hooks';
import { TokenAmountCard } from '../../components/TokenAmountCard';
import { PriceFormats } from 'components/v3/PriceFomatToggler';
import { Box, Button } from '@material-ui/core';
import Loader from 'components/Loader';
import { Check } from '@material-ui/icons';
import { GlobalConst } from 'constants/index';
import { useTranslation } from 'react-i18next';
import { getGammaPairsForTokens } from 'utils';
import { useSteerPeripheryContract } from 'hooks/useContract';

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
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const preset = useActivePreset();

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

  const halfAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [
    Field.CURRENCY_A,
    Field.CURRENCY_B,
  ].reduce((accumulator, field) => {
    return {
      ...accumulator,
      [field]: halfAmountSpend(mintInfo.currencyBalances[field]),
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

  const gammaPairData = getGammaPairsForTokens(
    chainId,
    currencyA?.wrapped.address,
    currencyB?.wrapped.address,
    mintInfo.feeAmount,
  );
  const gammaPairs = gammaPairData?.pairs;
  const gammaPair =
    gammaPairs && gammaPairs.length > 0
      ? gammaPairs.find((pair) => pair.type === preset)
      : undefined;

  const uniPilotVaultAddress = mintInfo.presetRange?.address;
  const defiedgeStrategyAddress = mintInfo.presetRange?.address;
  const isWithNative =
    mintInfo.liquidityRangeType ===
      GlobalConst.v3LiquidityRangeType.GAMMA_RANGE ||
    mintInfo.liquidityRangeType ===
      GlobalConst.v3LiquidityRangeType.STEER_RANGE;

  // check whether the user has approved the router on the tokens
  const currencyAApproval =
    isWithNative && currencyA && currencyA.isNative
      ? currencyA.wrapped
      : currencyA;
  const currencyBApproval =
    isWithNative && currencyB && currencyB.isNative
      ? currencyB.wrapped
      : currencyB;
  const positionManagerAddress = useMemo(() => {
    if (mintInfo.feeTier && mintInfo.feeTier.id.includes('uni')) {
      return UNI_NFT_POSITION_MANAGER_ADDRESS[chainId];
    } else if (
      mintInfo.liquidityRangeType ===
      GlobalConst.v3LiquidityRangeType.ALGEBRA_INTEGRAL
    ) {
      return ALGEBRA_INTEGRAL_NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId];
    }
    return NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId];
  }, [chainId, mintInfo.feeTier, mintInfo.liquidityRangeType]);

  const steerPeripheryContract = useSteerPeripheryContract();
  const [approvalA, approveACallback] = useApproveCallback(
    mintInfo.parsedAmounts[Field.CURRENCY_A] ||
      tryParseAmount('1', currencyAApproval),
    chainId
      ? mintInfo.liquidityRangeType ===
        GlobalConst.v3LiquidityRangeType.GAMMA_RANGE
        ? gammaPair?.address
        : mintInfo.liquidityRangeType ===
          GlobalConst.v3LiquidityRangeType.UNIPILOT_RANGE
        ? uniPilotVaultAddress
        : mintInfo.liquidityRangeType ===
          GlobalConst.v3LiquidityRangeType.DEFIEDGE_RANGE
        ? defiedgeStrategyAddress
        : mintInfo.liquidityRangeType ===
          GlobalConst.v3LiquidityRangeType.STEER_RANGE
        ? steerPeripheryContract?.address
        : mintInfo.liquidityRangeType ===
          GlobalConst.v3LiquidityRangeType.ALGEBRA_INTEGRAL
        ? ALGEBRA_INTEGRAL_NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId]
        : positionManagerAddress
      : undefined,
  );
  const [approvalB, approveBCallback] = useApproveCallback(
    mintInfo.parsedAmounts[Field.CURRENCY_B] ||
      tryParseAmount('1', currencyBApproval),
    chainId
      ? mintInfo.liquidityRangeType ===
        GlobalConst.v3LiquidityRangeType.GAMMA_RANGE
        ? gammaPair?.address
        : mintInfo.liquidityRangeType ===
          GlobalConst.v3LiquidityRangeType.UNIPILOT_RANGE
        ? uniPilotVaultAddress
        : mintInfo.liquidityRangeType ===
          GlobalConst.v3LiquidityRangeType.DEFIEDGE_RANGE
        ? defiedgeStrategyAddress
        : mintInfo.liquidityRangeType ===
          GlobalConst.v3LiquidityRangeType.STEER_RANGE
        ? steerPeripheryContract?.address
        : mintInfo.liquidityRangeType ===
          GlobalConst.v3LiquidityRangeType.ALGEBRA_INTEGRAL
        ? ALGEBRA_INTEGRAL_NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId]
        : positionManagerAddress
      : undefined,
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

  return (
    <>
      <TokenAmountCard
        currency={currencyA}
        otherCurrency={currencyB}
        value={formattedAmounts[Field.CURRENCY_A]}
        fiatValue={usdcValues[Field.CURRENCY_A]}
        handleInput={onFieldAInput}
        handleHalf={() =>
          onFieldAInput(halfAmounts[Field.CURRENCY_A]?.toExact() ?? '')
        }
        handleMax={() =>
          onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
        }
        locked={mintInfo.depositADisabled}
        isMax={!!atMaxAmounts[Field.CURRENCY_A]}
        error={mintInfo.token0ErrorMessage}
        priceFormat={priceFormat}
        isBase={false}
        isDual={isWithNative}
      />
      <Box mt={2}>
        <TokenAmountCard
          currency={currencyB}
          otherCurrency={currencyA}
          value={formattedAmounts[Field.CURRENCY_B]}
          fiatValue={usdcValues[Field.CURRENCY_B]}
          handleInput={onFieldBInput}
          handleHalf={() =>
            onFieldBInput(halfAmounts[Field.CURRENCY_B]?.toExact() ?? '')
          }
          handleMax={() =>
            onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
          }
          locked={mintInfo.depositBDisabled}
          isMax={!!atMaxAmounts[Field.CURRENCY_B]}
          error={mintInfo.token1ErrorMessage}
          priceFormat={priceFormat}
          isBase={true}
          isDual={isWithNative}
        />
      </Box>
      <Box mt={2} className='flex justify-between'>
        {showApprovalA !== undefined && (
          <Box width={showApprovalB === undefined ? '100%' : '49%'}>
            {showApprovalA ? (
              approvalA === ApprovalState.PENDING ? (
                <Box className='token-approve-button-loading'>
                  <Loader stroke='white' />
                  <p>
                    {t('approving')} {currencyAApproval?.symbol}
                  </p>
                </Box>
              ) : (
                <Button
                  className='token-approve-button'
                  onClick={approveACallback}
                >
                  <p>
                    {t('approve')} {currencyAApproval?.symbol}
                  </p>
                </Button>
              )
            ) : (
              <Box className='token-approve-button-loading'>
                <Check />
                <p>
                  {t('approved')} {currencyAApproval?.symbol}
                </p>
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
                  <p>
                    {t('approving')} {currencyBApproval?.symbol}
                  </p>
                </Box>
              ) : (
                <Button
                  className='token-approve-button'
                  onClick={approveBCallback}
                >
                  <p>
                    {t('approve')} {currencyBApproval?.symbol}
                  </p>
                </Button>
              )
            ) : (
              <Box className='token-approve-button-loading'>
                <Check />
                <p>
                  {t('approved')} {currencyBApproval?.symbol}
                </p>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </>
  );
}
