import {
  Currency,
  Percent,
  TradeType,
  CurrencyAmount,
} from '@uniswap/sdk-core';
import { Trade } from '~/lib/src/trade';
import { Pair, ChainId, TokenAmount } from '@uniswap/sdk';
import { PairState } from '~/data/Reserves';
import { MergedZap } from './actions';
import JSBI from 'jsbi';
import { computeZapPriceBreakdown } from '~/utils/v3/prices';
import {
  WMATIC_EXTENDED,
  toV2Token,
  toV3Currency,
  toV3Token,
} from '~/constants/v3/addresses';
import { wrappedCurrency } from '~/utils/wrappedCurrency';

// Since a best zap can be null when its the same token we have to check for each possibility
export function mergeBestZaps(
  bestZapOne: Trade<Currency, Currency, TradeType> | null,
  bestZapTwo: Trade<Currency, Currency, TradeType> | null,
  out1: Currency | undefined,
  out2: Currency | undefined,
  outputPair: [PairState, Pair | null],
  allowedSlippage: Percent,
  totalPairSupply: TokenAmount | undefined,
  chainId: ChainId,
): MergedZap | undefined {
  const currencyIn =
    bestZapOne?.inputAmount.currency || bestZapTwo?.inputAmount.currency;
  const slippageTolerance = allowedSlippage;

  // We need to check if a zap path will wrap to not estimate a route

  const inAndOutWrappedOne =
    (currencyIn?.isNative && out1?.wrapped.equals(WMATIC_EXTENDED[chainId])) ||
    (currencyIn?.wrapped.equals(WMATIC_EXTENDED[chainId]) && out1?.isNative);
  const inAndOutWrappedTwo =
    (currencyIn?.isNative && out2?.wrapped.equals(WMATIC_EXTENDED[chainId])) ||
    (currencyIn?.wrapped.equals(WMATIC_EXTENDED[chainId]) && out2?.isNative);

  // If the input token and output token are the same we need to handle values differently
  const inAndOutAreTheSame1Flag = currencyIn === out1 || inAndOutWrappedOne;
  const inAndOutAreTheSame2Flag = currencyIn === out2 || inAndOutWrappedTwo;

  // output currencies
  const outputCurrencyOne = out1?.wrapped;
  const outputCurrencyTwo = out2?.wrapped;
  const outputCurrencyOneV2 = out1 ? toV2Token(out1?.wrapped) : undefined;
  const outputCurrencyTwoV2 = out2 ? toV2Token(out2?.wrapped) : undefined;

  const halfInput = bestZapOne?.inputAmount || bestZapTwo?.inputAmount;
  // Since we divide the input by two for each route we add both inputs here
  const inputAmount =
    bestZapOne && bestZapTwo
      ? JSBI.add(
          bestZapOne.inputAmount.quotient,
          bestZapTwo.inputAmount.quotient,
        )
      : bestZapOne
      ? JSBI.add(
          bestZapOne.inputAmount.quotient,
          bestZapOne.inputAmount.quotient,
        )
      : bestZapTwo
      ? JSBI.add(
          bestZapTwo.inputAmount.quotient,
          bestZapTwo.inputAmount.quotient,
        )
      : JSBI.BigInt(0);

  // get best paths for each
  const pathOne = bestZapOne ? bestZapOne.route.tokenPath : [];
  const pathTwo = bestZapTwo ? bestZapTwo.route.tokenPath : [];

  // get output amounts
  const outputOne = inAndOutAreTheSame1Flag
    ? halfInput
    : bestZapOne?.outputAmount;
  const outputTwo = inAndOutAreTheSame2Flag
    ? halfInput
    : bestZapTwo?.outputAmount;

  // output pairs
  const [pairState, pair] = outputPair;

  const swapOutOne = outputOne;
  const swapOutTwo = outputTwo;

  const minSwapOutOne = inAndOutAreTheSame1Flag
    ? halfInput
    : bestZapOne?.minimumAmountOut(slippageTolerance);
  const minSwapOutTwo = inAndOutAreTheSame2Flag
    ? halfInput
    : bestZapTwo?.minimumAmountOut(slippageTolerance);

  // Wrap currencies to handle native
  const [wOutputOne, wOutputTwo, wMinSwapOutOne, wMinSwapOutTwo] = [
    outputOne?.wrapped,
    outputTwo?.wrapped,
    minSwapOutOne?.wrapped,
    minSwapOutTwo?.wrapped,
  ];

  const wOutputOneV2 = wOutputOne
    ? new TokenAmount(toV2Token(wOutputOne?.currency), wOutputOne?.quotient)
    : undefined;
  const wOutputTwoV2 = wOutputTwo
    ? new TokenAmount(toV2Token(wOutputTwo?.currency), wOutputTwo?.quotient)
    : undefined;
  const wMinSwapOutOneV2 = wMinSwapOutOne
    ? new TokenAmount(
        toV2Token(wMinSwapOutOne?.currency),
        wMinSwapOutOne?.quotient,
      )
    : undefined;
  const wMinSwapOutTwoV2 = wMinSwapOutTwo
    ? new TokenAmount(
        toV2Token(wMinSwapOutTwo?.currency),
        wMinSwapOutTwo?.quotient,
      )
    : undefined;

  const {
    priceImpactWithoutFee: priceImpactWithoutFeeOne,
    realizedLPFee: realizedLPFeeOne,
  } = computeZapPriceBreakdown(bestZapOne);

  const {
    priceImpactWithoutFee: priceImpactWithoutFeeTwo,
    realizedLPFee: realizedLPFeeTwo,
  } = computeZapPriceBreakdown(bestZapTwo);

  // Take the greater price impact as that will be used for the LP value
  const totalPriceImpact =
    priceImpactWithoutFeeOne && priceImpactWithoutFeeTwo
      ? priceImpactWithoutFeeOne.greaterThan(priceImpactWithoutFeeTwo)
        ? priceImpactWithoutFeeOne
        : priceImpactWithoutFeeTwo
      : priceImpactWithoutFeeOne
      ? priceImpactWithoutFeeOne
      : priceImpactWithoutFeeTwo;

  // Add fees if swap occurs otherwise use swap
  const liquidityProviderFee =
    realizedLPFeeOne && realizedLPFeeTwo
      ? realizedLPFeeOne?.add(realizedLPFeeTwo)
      : realizedLPFeeOne
      ? realizedLPFeeOne
      : realizedLPFeeTwo;

  let pairInAmount;
  let minPairInAmount;
  let liquidityMinted;
  let poolTokenPercentage;

  try {
    pairInAmount =
      outputCurrencyOneV2 &&
      wOutputOneV2 &&
      wOutputTwoV2 &&
      outputCurrencyTwoV2 &&
      pair
        ?.priceOf(
          inAndOutAreTheSame1Flag ? outputCurrencyTwoV2 : outputCurrencyOneV2,
        )
        ?.quote(inAndOutAreTheSame1Flag ? wOutputTwoV2 : wOutputOneV2);

    minPairInAmount =
      outputCurrencyOneV2 &&
      wMinSwapOutOneV2 &&
      wMinSwapOutTwoV2 &&
      outputCurrencyTwoV2 &&
      pair
        ?.priceOf(
          inAndOutAreTheSame1Flag ? outputCurrencyTwoV2 : outputCurrencyOneV2,
        )
        ?.quote(inAndOutAreTheSame1Flag ? wMinSwapOutTwoV2 : wMinSwapOutOneV2)
        ?.quotient.toString();

    liquidityMinted =
      wOutputOneV2 &&
      wOutputTwoV2 &&
      totalPairSupply &&
      pair?.getLiquidityMinted(totalPairSupply, wOutputOneV2, wOutputTwoV2);

    poolTokenPercentage =
      liquidityMinted && totalPairSupply
        ? new Percent(
            liquidityMinted.quotient,
            totalPairSupply.add(liquidityMinted).quotient,
          )
        : null;
  } catch (e) {
    console.error(e);
  }

  const totalSupplyToken = wrappedCurrency(totalPairSupply?.currency, chainId);
  const totalPairSupplyV3 =
    totalPairSupply && totalSupplyToken
      ? CurrencyAmount.fromRawAmount(
          toV3Token(totalSupplyToken),
          totalPairSupply.numerator,
        )
      : undefined;

  const liquidityMintedToken = wrappedCurrency(
    liquidityMinted?.currency,
    chainId,
  );
  const liquidityMintedV3 =
    liquidityMinted && liquidityMintedToken
      ? CurrencyAmount.fromRawAmount(
          toV3Token(liquidityMintedToken),
          liquidityMinted.numerator,
        )
      : undefined;
  const pairInAmountV3 = pairInAmount
    ? CurrencyAmount.fromRawAmount(
        toV3Currency({ ...pairInAmount.currency, chainId }),
        pairInAmount.numerator,
      )
    : undefined;

  if (
    !currencyIn ||
    !outputCurrencyOne ||
    !outputOne ||
    !minSwapOutOne ||
    !outputCurrencyTwo ||
    !outputTwo ||
    !minSwapOutTwo ||
    !pair ||
    !totalPairSupplyV3 ||
    !liquidityMintedV3
  )
    return;
  return {
    currencyIn: {
      currency: currencyIn,
      inputAmount,
    },
    currencyOut1: {
      outputCurrency: outputCurrencyOne,
      outputAmount: outputOne,
      minOutputAmount: minSwapOutOne?.quotient.toString(),
      path: pathOne,
    },
    currencyOut2: {
      outputCurrency: outputCurrencyTwo,
      outputAmount: outputTwo,
      minOutputAmount: minSwapOutTwo?.quotient.toString(),
      path: pathTwo,
    },
    pairOut: {
      pair,
      pairState,
      totalPairSupply: totalPairSupplyV3,
      liquidityMinted: liquidityMintedV3,
      inAmount: inAndOutAreTheSame1Flag
        ? { token1: pairInAmountV3, token2: swapOutTwo }
        : { token1: swapOutOne, token2: pairInAmountV3 },
      minInAmount: inAndOutAreTheSame1Flag
        ? {
            token1: minPairInAmount ?? '0',
            token2: minSwapOutTwo?.quotient.toString() ?? '0',
          }
        : {
            token1: minSwapOutOne?.quotient.toString() ?? '0',
            token2: minPairInAmount ?? '0',
          },
      poolTokenPercentage,
    },
    liquidityProviderFee,
    totalPriceImpact,
    chainId,
  };
}
