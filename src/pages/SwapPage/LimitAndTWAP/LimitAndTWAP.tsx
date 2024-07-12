import { OnTxSubmitValues } from '@orbs-network/twap-ui';
import {
  TWAP as QuickSwapTWAP,
  Orders as QuickSwapOrders,
} from '@orbs-network/twap-ui-quickswap';
import { useWeb3Modal } from '@web3modal/ethers5/react';
import { SwapSide } from '@paraswap/sdk';
import { useQuery } from '@tanstack/react-query';
import BN from 'bignumber.js';
import { CurrencySearchModal } from 'components';
import { liquidityHubAnalytics } from 'components/Swap/LiquidityHub';
import { GlobalValue, paraswapTaxBuy, paraswapTaxSell } from 'constants/index';
import { useIsProMode, useActiveWeb3React } from 'hooks';
import { useAllTokens } from 'hooks/Tokens';
import useGasPrice from 'hooks/useGasPrice';
import { getBestTradeCurrencyAddress, useParaswap } from 'hooks/useParaswap';
import useSwapRedirects from 'hooks/useSwapRedirect';
import React, { useCallback, useMemo, useState } from 'react';
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
} from 'state/swap/hooks';
import { Field } from 'state/swap/v3/actions';
import { useExpertModeManager } from 'state/user/hooks';
import { getTokenLogoURL } from 'utils/getTokenLogoURL';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';

const getLogo = (value: string) => {
  try {
    return getTokenLogoURL(value).find((it) => it !== 'error') as any;
  } catch (error) {}
};

const usePriceUSD = (address?: string) => {
  return useUSDCPriceFromAddress(address ?? '').price;
};

function TWAPBase({ limit }: { limit?: boolean }) {
  const { account, chainId, library } = useActiveWeb3React();
  useDefaultsFromURLSearch();
  const [srcAmount, setSrcAmount] = useState('');
  const gasPrice = useGasPrice();

  const allTokens = useAllTokens();
  const { open } = useWeb3Modal();
  const { onCurrencySelection } = useSwapActionHandlers();
  const { isProMode } = useIsProMode();
  const { redirectWithCurrency } = useSwapRedirects();

  const { currencies } = useDerivedSwapInfo();

  const onSrcSelect = useCallback(
    (token: any) => {
      onCurrencySelection(Field.INPUT, token);
      redirectWithCurrency(token, true);
    },
    [onCurrencySelection, redirectWithCurrency],
  );

  const onDstSelect = useCallback(
    (token: any) => {
      onCurrencySelection(Field.OUTPUT, token);
      redirectWithCurrency(token, false);
    },
    [onCurrencySelection, redirectWithCurrency],
  );

  const onTxSubmitted = useCallback(
    (value: OnTxSubmitValues) => {
      const args = {
        srcAmount: value.srcAmount,
        srcTokenAddress: value.srcToken.address,
        srcTokenSymbol: value.srcToken.symbol,
        dexAmountOut: value.dstAmount,
        dstTokenAddress: value.dstToken.address,
        dstTokenSymbol: value.dstToken.symbol,
        dstTokenUsdValue: Number(value.dstUSD),
        chainId,
      };
      if (limit) {
        liquidityHubAnalytics.onLimitTrade(args);
      } else {
        liquidityHubAnalytics.onTwapTrade(args);
      }
    },
    [limit, chainId],
  );

  const onInputChange = useCallback(
    (value: string) => {
      setSrcAmount(value);
    },
    [setSrcAmount],
  );

  const paraswap = useParaswap();
  const [isExpertMode] = useExpertModeManager();

  const maxImpactAllowed = useMemo(() => {
    return isExpertMode
      ? 100
      : Number(
          GlobalValue.percents.BLOCKED_PRICE_IMPACT_NON_EXPERT.multiply(
            '100',
          ).toFixed(4),
        );
  }, [isExpertMode]);

  const hasSrcAmount = BN(srcAmount || '0').gt(0);
  const inputCurrency = currencies[Field.INPUT];
  const outputCurrency = currencies[Field.OUTPUT];
  const srcToken = inputCurrency
    ? getBestTradeCurrencyAddress(inputCurrency, chainId)
    : undefined;
  const destToken = outputCurrency
    ? getBestTradeCurrencyAddress(outputCurrency, chainId)
    : undefined;

  const {
    isLoading: loadingOptimalRate,
    data: optimalRateData,
    refetch: reFetchOptimalRate,
  } = useQuery({
    queryKey: [
      'fetchTwapOptimalRate',
      srcToken,
      destToken,
      srcAmount,
      account,
      chainId,
      maxImpactAllowed,
    ],
    queryFn: async () => {
      if (!srcToken || !destToken || !srcAmount || !account)
        return { error: undefined, rate: undefined };
      try {
        const rate = await paraswap.getRate({
          srcToken,
          destToken,
          srcDecimals: inputCurrency?.decimals,
          destDecimals: outputCurrency?.decimals,
          amount: srcAmount,
          side: SwapSide.SELL,
          options: {
            includeDEXS: 'quickswap,quickswapv3,quickswapv3.1,quickperps',
            maxImpact: maxImpactAllowed,
            partner: 'quickswapv3',
            //@ts-ignore
            srcTokenTransferFee: paraswapTaxSell[srcToken.toLowerCase()],
            destTokenTransferFee: paraswapTaxBuy[destToken.toLowerCase()],
          },
        });

        return { error: undefined, rate };
      } catch (err) {
        return { error: err.message, rate: undefined };
      }
    },
    refetchInterval: 5000,
    enabled: !!srcToken && !!destToken && hasSrcAmount && !!account,
  });

  return (
    <>
      <QuickSwapTWAP
        limit={limit}
        isProMode={isProMode}
        connect={() => {
          open();
        }}
        connectedChainId={chainId}
        provider={library?.provider}
        account={account}
        dappTokens={allTokens as any}
        srcToken={inputCurrency?.symbol}
        dstToken={outputCurrency?.symbol}
        TokenSelectModal={CurrencySearchModal}
        onSrcTokenSelected={onSrcSelect}
        onDstTokenSelected={onDstSelect}
        getTokenLogoURL={getLogo}
        onTxSubmitted={onTxSubmitted}
        usePriceUSD={usePriceUSD}
        onInputChange={onInputChange}
        dstAmountOut={optimalRateData?.rate?.destAmount}
        dstAmountLoading={hasSrcAmount && loadingOptimalRate}
        maxFeePerGas={gasPrice?.toString()}
      />
      <QuickSwapOrders />
    </>
  );
}

export default TWAPBase;
