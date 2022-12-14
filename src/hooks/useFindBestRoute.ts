import { SmartRouter, RouterTypes } from 'constants/index';
import { SwapDelay, Field } from 'state/swap/actions';
import {
  tryParseAmount,
  useSwapActionHandlers,
  useSwapState,
} from 'state/swap/hooks';
import {
  useBonusRouterManager,
  useUserSlippageTolerance,
} from 'state/user/hooks';
import callWallchainAPI from 'utils/wallchainService';
import { useCurrency } from './Tokens';
import { useTradeExactIn, useTradeExactOut } from './Trades';
import { useActiveWeb3React } from 'hooks';
import { useSwapCallArguments } from './useSwapCallback';
import useParsedQueryString from './useParsedQueryString';

const useFindBestRoute = () => {
  const { onSetSwapDelay, onBestRoute } = useSwapActionHandlers();
  const parsedQuery = useParsedQueryString();
  const {
    recipient,
    swapDelay,
    independentField,
    typedValue,
    bestRoute,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState();
  const [allowedSlippage] = useUserSlippageTolerance();
  const [bonusRouterDisabled] = useBonusRouterManager();
  const { chainId, account } = useActiveWeb3React();
  const inputCurrency = useCurrency(inputCurrencyId);
  const outputCurrency = useCurrency(outputCurrencyId);
  const isExactIn: boolean = independentField === Field.INPUT;
  const parsedAmount = tryParseAmount(
    typedValue,
    (isExactIn ? inputCurrency : outputCurrency) ?? undefined,
  );
  const bestTradeExactIn = useTradeExactIn(
    isExactIn ? parsedAmount : undefined,
    outputCurrency ?? undefined,
    swapDelay,
    onSetSwapDelay,
  );
  const bestTradeExactOut = useTradeExactOut(
    inputCurrency ?? undefined,
    !isExactIn ? parsedAmount : undefined,
    swapDelay,
    onSetSwapDelay,
  );
  const v2Trade = isExactIn ? bestTradeExactIn : bestTradeExactOut;

  // Get the current router the trade will be going through
  const currentSmartRouter: SmartRouter = bestRoute.smartRouter;
  // Get the current router type based on the router
  const currentRouterType: RouterTypes =
    (currentSmartRouter !== SmartRouter.QUICKSWAP
      ? RouterTypes.SMART
      : RouterTypes.QUICKSWAP) || bestRoute.routerType;

  // This is to get the correct swap arguments for a bonus trade
  const swapCalls = useSwapCallArguments(
    v2Trade ?? undefined,
    allowedSlippage,
    recipient,
  );

  // To not cause a call on every user input the code will be executed when the delay is complete
  if (swapDelay !== SwapDelay.SWAP_COMPLETE) {
    return { v2Trade, bestTradeExactIn, bestTradeExactOut };
  }
  if (bonusRouterDisabled) {
    onBestRoute({
      routerType: currentRouterType,
      smartRouter: currentSmartRouter,
    });
    onSetSwapDelay(SwapDelay.SWAP_REFRESH);
    return { v2Trade, bestTradeExactIn, bestTradeExactOut };
  }
  if (
    account &&
    chainId &&
    swapCalls[0] &&
    parsedQuery &&
    parsedQuery.swapIndex === '1'
  ) {
    const {
      contract,
      parameters: { methodName, args, value },
    } = swapCalls[0];
    callWallchainAPI(
      methodName,
      args,
      value,
      chainId,
      account,
      contract,
      currentSmartRouter,
      currentRouterType,
      onBestRoute,
      onSetSwapDelay,
    );
  }
  return { v2Trade, bestTradeExactIn, bestTradeExactOut };
};

export default useFindBestRoute;
