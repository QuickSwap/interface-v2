import React, { useCallback, useEffect, useState } from 'react';
import { useCurrency } from 'hooks/Tokens';
import { Field } from 'state/zap/actions';
import {
  useDerivedZapInfo,
  useSetZapInputList,
  useZapActionHandlers,
  useZapState,
} from 'state/zap/hooks';
import { useUserZapSlippageTolerance } from 'state/user/hooks';
// import ZapPanel from 'views/V2/Zap/components/ZapPanel';
// import DistributionPanel from 'views/V2/Zap/components/DistributionPanel/DistributionPanel';
// import ZapLiquidityActions from 'views/V2/Zap/components/ZapLiquidityActions';
// import DexPanel from 'components/DexPanel';
// import LoadingBestRoute from 'views/Swap/components/LoadingBestRoute';
// import { TradeState } from 'state/routing/types';
// import ModalProvider from '../../contexts/ModalContext';
// import { Pricing } from '../DexPanel/types';

// Hooks
import { useSignTransaction } from 'state/transactions/hooks';

// Types
import { useActiveWeb3React, useTokenPriceUsd } from 'hooks';
import { useTranslation } from 'react-i18next';
import { Currency, CurrencyAmount } from '@uniswap/sdk-core';
import { Box } from '@material-ui/core';
import { ToggleSwitch } from 'components';
import { WrappedTokenInfo } from 'state/lists/v3/wrappedTokenInfo';
import { getCurrencyInfo } from 'utils';
import { Pair } from '@uniswap/sdk';
import { ZapType } from 'constants/index';
import { useZapCallback } from 'hooks/bond/useZapCallback';
import { maxAmountSpend } from 'utils/v3/maxAmountSpend';
import { useHistory } from 'react-router-dom';
import { usePair } from 'data/Reserves';
import { V3TradeState } from 'hooks/v3/useBestV3Trade';

interface ZapLiquidityProps {
  handleConfirmedTx: (hash: string, pairOut?: Pair) => void;
  poolAddress: string;
  pid: string;
  zapIntoProductType: ZapType;
  zapable: boolean;
  txHash?: string;
}

const ZapLiquidity: React.FC<ZapLiquidityProps> = ({
  handleConfirmedTx,
  poolAddress,
  pid,
  zapIntoProductType,
  zapable,
  txHash,
}) => {
  useSetZapInputList();
  const [zapErrorMessage, setZapErrorMessage] = useState<string>('');
  const [stakeIntoProduct, setStakeIntoProduct] = useState<boolean>(true);
  const [disableZap, setDisableZap] = useState<boolean>(false);

  const { location } = useHistory();
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const { signTransaction } = useSignTransaction();

  const { INPUT, typedValue, recipient, zapType, OUTPUT } = useZapState();
  const [zapSlippage] = useUserZapSlippageTolerance();

  const currencyA = INPUT.currencyId;
  const { currency1, currency2 } = OUTPUT;
  const outputCurrencyA = useCurrency(currency1);
  const outputCurrencyB = useCurrency(currency2);
  const inputCurrency = useCurrency(currencyA);

  const [, outputPair] = usePair(
    outputCurrencyA as Currency,
    outputCurrencyB as Currency,
  );

  const {
    address: outputCurrencyId,
    chainId: outputCurrencyChainId,
  } = getCurrencyInfo({
    currencyA: outputCurrencyA as WrappedTokenInfo,
    currencyB: outputCurrencyB as WrappedTokenInfo,
    pair: outputPair,
  });

  const {
    address: inputTokenAddress,
    decimals: inputTokenDecimals,
    chainId: inputCurrencyChainId,
  } = getCurrencyInfo({
    currencyA: inputCurrency as WrappedTokenInfo,
  });

  const {
    zap,
    inputError: zapInputError,
    currencyBalances,
    zapRouteState,
  } = useDerivedZapInfo();
  const {
    onUserInput,
    onInputSelect,
    onCurrencySelection,
    onSetZapType,
  } = useZapActionHandlers();

  const [tokenPrice] = useTokenPriceUsd(zap?.currencyIn.currency);

  const handleCurrencySelect = useCallback(
    (field: Field, currency: Currency[]) => {
      onUserInput(field, '');
      onCurrencySelection(field, currency);
    },
    [onCurrencySelection, onUserInput],
  );

  const handleOutputSelect = useCallback(
    (currencyIdA: Currency, currencyIdB: Currency) => {
      onCurrencySelection(Field.OUTPUT, [currencyIdA, currencyIdB]);
      setDisableZap(true);
      onSetZapType(ZapType.ZAP);
      setStakeIntoProduct(false);
    },
    [onCurrencySelection, onSetZapType],
  );

  const handleStakeIntoProduct = (value: boolean) => {
    setStakeIntoProduct(value);
    if (value) {
      onSetZapType(zapIntoProductType);
    } else {
      onSetZapType(ZapType.ZAP);
    }
  };

  const { callback: zapCallback } = useZapCallback(
    zap,
    zapType,
    zapSlippage,
    recipient,
    poolAddress,
    '',
    pid,
  );

  const handleZap = useCallback(() => {
    setZapErrorMessage('');
    zapCallback
      .then((hash: any) => {
        handleConfirmedTx(hash, zap?.pairOut.pair);
      })
      .catch((error: any) => {
        setZapErrorMessage(error.message);
      });
  }, [handleConfirmedTx, zap, zapCallback]);

  const handleDismissConfirmation = useCallback(() => {
    // clear zapErrorMessage if user closes the error modal
    setZapErrorMessage('');
  }, []);

  const handleMaxInput = useCallback(
    (field: Field) => {
      const maxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = {
        [Field.INPUT]: maxAmountSpend(currencyBalances[Field.INPUT]),
        [Field.OUTPUT]: maxAmountSpend(currencyBalances[Field.OUTPUT]),
      };
      if (maxAmounts) {
        onUserInput(field, maxAmounts[field]?.toExact() ?? '');
      }
    },
    [currencyBalances, onUserInput],
  );

  // reset input value to zero on first render
  useEffect(() => {
    onUserInput(Field.INPUT, '');
    onSetZapType(zapable ? zapIntoProductType : ZapType.ZAP);
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [zapable]);

  return (
    <div>
      <Box>
        {zapable && zap?.pairOut?.pair?.token0?.symbol && (
          <Box
            sx={{
              marginBottom: '10px',
              fontSize: '12px',
              alignItems: 'center',
            }}
          >
            <p>
              {t('Stake in')}{' '}
              {`${zap?.pairOut?.pair?.token0?.symbol} - ${
                zap?.pairOut?.pair?.token1?.symbol
              } ${t('Farm')}`}
            </p>
            <Box sx={{ width: '50px', marginLeft: '10px' }}>
              <ToggleSwitch
                toggled={stakeIntoProduct}
                onToggle={() => handleStakeIntoProduct(!stakeIntoProduct)}
                // disabled={disableZap}
              />
            </Box>
          </Box>
        )}
        <Box sx={{ marginTop: '30px' }}>
          {/* <DexPanel
            value={typedValue}
            panelText='From:'
            currency={inputCurrency}
            otherCurrency={null}
            fieldType={Field.INPUT}
            onCurrencySelect={(cur: Currency) =>
              handleCurrencySelect(Field.INPUT, [cur])
            }
            onUserInput={(val: string) => onUserInput(Field.INPUT, val)}
            handleMaxInput={handleMaxInput}
            isZapInput
            pricing={Pricing.PRICEGETTER}
          /> */}
        </Box>
        <Box sx={{ margin: '10px', justifyContent: 'center' }}>
          {/* <Svg icon='ZapArrow' color='primaryButton' /> */}
        </Box>
        {/* <ZapPanel
          value={zap?.pairOut?.liquidityMinted?.toSignificant(10) || '0.0'}
          onSelect={handleOutputSelect}
          lpPair={zap?.pairOut.pair}
        /> */}

        {/* {zapRouteState === V3TradeState.LOADING && (
          <Box mt='10px'>
            <LoadingBestRoute />
          </Box>
        )} */}
        {/* {typedValue &&
          parseFloat(typedValue) > 0 &&
          zap?.pairOut?.liquidityMinted && (
            <Box sx={{ marginTop: '40px' }}>
              <DistributionPanel zap={zap} />
            </Box>
          )}
        <ModalProvider>
          <ZapLiquidityActions
            zapInputError={zapInputError}
            zap={zap}
            handleZap={handleZap}
            zapErrorMessage={zapErrorMessage}
            zapRouteState={zapRouteState}
            handleDismissConfirmation={handleDismissConfirmation}
            shouldUseWido={shouldUseWido}
            widoQuote={widoQuote}
            inputTokenAddress={inputTokenAddress}
            inputTokenDecimals={inputTokenDecimals}
            inputTokenChainId={inputCurrencyChainId}
            outputTokenChainId={outputCurrencyChainId}
            toTokenAddress={outputCurrencyId}
          />
        </ModalProvider> */}
        <Box sx={{ marginTop: '10px', justifyContent: 'center' }}>
          <a
            href='https://apeswap.gitbook.io/apeswap-finance/product-and-features/exchange/liquidity'
            target='_blank'
            rel='noreferrer'
          >
            <small
              style={{
                fontSize: '12px',
                lineHeight: '18px',
                fontWeight: 400,
                borderBottom: '1px solid',
              }}
            >
              Learn more{'>'}
            </small>
          </a>
        </Box>
      </Box>
    </div>
  );
};

export default React.memo(ZapLiquidity);
