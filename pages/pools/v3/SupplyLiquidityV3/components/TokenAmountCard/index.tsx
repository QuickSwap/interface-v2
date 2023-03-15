import React, { useMemo } from 'react';
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core';

import CurrencyLogo from 'components/CurrencyLogo';
import { useCurrencyBalance } from 'state/wallet/hooks';
import { useActiveWeb3React } from 'hooks';
import Loader from 'components/Loader';
import { PriceFormats } from 'components/v3/PriceFomatToggler';
import './index.scss';
import { Box } from '@material-ui/core';
import { LockOutlined } from '@material-ui/icons';
import NumericalInput from 'components/NumericalInput';
import { ETHER, WETH } from '@uniswap/sdk';
import { useTranslation } from 'react-i18next';
import { useV3MintState } from 'state/mint/v3/hooks';
import { GlobalConst } from 'constants/index';
import { DoubleCurrencyLogo } from 'components';

interface ITokenAmountCard {
  currency: Currency | undefined | null;
  otherCurrency: Currency | undefined | null;
  value: string;
  fiatValue: CurrencyAmount<Token> | null;
  handleHalf?: () => void;
  handleMax: () => void;
  handleInput: (value: string) => void;
  locked: boolean;
  isMax: boolean;
  error: string | undefined;
  priceFormat: PriceFormats;
  isBase: boolean;
}

export function TokenAmountCard({
  currency,
  otherCurrency,
  value,
  fiatValue,
  handleHalf,
  handleMax,
  handleInput,
  locked,
  isMax,
  error,
  priceFormat,
  isBase,
}: ITokenAmountCard) {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();
  const { liquidityRangeType } = useV3MintState();

  const balance = useCurrencyBalance(
    account ?? undefined,
    currency?.isNative ? ETHER : currency ?? undefined,
  );
  const ethBalance = useCurrencyBalance(account ?? undefined, ETHER);
  const wETHBalance = useCurrencyBalance(
    account ?? undefined,
    chainId ? WETH[chainId] : undefined,
  );
  // const balanceUSD = useUSDCPrice(currency ?? undefined);

  // const [localUSDValue, setLocalUSDValue] = useState('');
  // const [localTokenValue, setLocalTokenValue] = useState('');

  // const valueUSD = useUSDCValue(
  //   tryParseAmount(
  //     value,
  //     currency ? (currency.isNative ? currency.wrapped : currency) : undefined,
  //   ),
  //   true,
  // );
  // const USDC_POLYGON = toToken(GlobalValue.tokens.COMMON.USDC);
  // const tokenValue = useBestV3TradeExactIn(
  //   tryParseAmount('1', USDC_POLYGON),
  //   currency ?? undefined,
  // );

  // const currencyPrice = useUSDCPrice(currency ?? undefined);
  // const otherCurrencyPrice = useUSDCPrice(otherCurrency ?? undefined);

  // const initialUSDPrices = useInitialUSDPrices();
  // const initialTokenPrice = useInitialTokenPrice();

  // const isUSD = useMemo(() => {
  //   return priceFormat === PriceFormats.USD;
  // }, [priceFormat]);

  // useEffect(() => {
  //   if (currencyPrice) {
  //     setLocalUSDValue(String(+value * +currencyPrice.toSignificant(5)));
  //   } else if (isBase && initialUSDPrices.CURRENCY_B) {
  //     setLocalUSDValue(String(+value * +initialUSDPrices.CURRENCY_B));
  //   } else if (!isBase && initialUSDPrices.CURRENCY_A) {
  //     setLocalUSDValue(String(+value * +initialUSDPrices.CURRENCY_A));
  //   } else if (initialTokenPrice && otherCurrencyPrice) {
  //     setLocalUSDValue(
  //       String(
  //         +value * +initialTokenPrice * +otherCurrencyPrice.toSignificant(5),
  //       ),
  //     );
  //   }

  //   setLocalTokenValue(value ?? '');
  // }, [
  //   isBase,
  //   initialTokenPrice,
  //   initialUSDPrices,
  //   currencyPrice,
  //   otherCurrencyPrice,
  //   value,
  // ]);

  const balanceString = useMemo(() => {
    if (!balance || !currency) return t('loading');

    if (
      liquidityRangeType === GlobalConst.v3LiquidityRangeType.GAMMA_RANGE &&
      chainId &&
      currency.wrapped.address.toLowerCase() ===
        WETH[chainId].address.toLowerCase()
    ) {
      return (
        (wETHBalance ? Number(wETHBalance.toExact()) : 0) +
        (ethBalance ? Number(ethBalance.toExact()) : 0)
      ).toFixed(5);
    } else {
      return balance.toSignificant();
    }
  }, [
    balance,
    currency,
    t,
    liquidityRangeType,
    chainId,
    wETHBalance,
    ethBalance,
  ]);

  return (
    <>
      <Box className='v3-token-amount-card-wrapper'>
        {locked && (
          <div className='token-amount-card-locked'>
            <LockOutlined />
            <p className='span'>
              {t('priceOutsidePriceRange')}.
              <br />
              {t('singleAssetDepositOnly')}.
            </p>
          </div>
        )}
        {currency ? (
          <Box className='flex flex-col items-start'>
            <div className='token-amount-card-logo'>
              {liquidityRangeType ===
                GlobalConst.v3LiquidityRangeType.GAMMA_RANGE &&
              chainId &&
              currency.wrapped.address.toLowerCase() ===
                WETH[chainId].address.toLowerCase() ? (
                <DoubleCurrencyLogo
                  size={24}
                  currency0={ETHER}
                  currency1={WETH[chainId]}
                />
              ) : (
                <CurrencyLogo size='24px' currency={currency} />
              )}
              <p className='weight-600'>
                {liquidityRangeType ===
                  GlobalConst.v3LiquidityRangeType.GAMMA_RANGE &&
                chainId &&
                currency.wrapped.address.toLowerCase() ===
                  WETH[chainId].address.toLowerCase()
                  ? 'MATIC+WMATIC'
                  : currency.symbol}
              </p>
            </div>
            <Box mt={1} className='token-amount-card-balance'>
              {balanceString === 'loading' ? (
                <Box className='flex items-center'>
                  <small className='text-secondary'>{t('balance')}: </small>
                  <Box className='flex' ml='5px'>
                    <Loader stroke='white' />
                  </Box>
                </Box>
              ) : (
                <small className='text-secondary'>
                  {t('balance')}: {balanceString}
                </small>
              )}
              {handleHalf && (
                <button onClick={handleHalf}>
                  <small>50%</small>
                </button>
              )}
              <button
                onClick={handleMax}
                disabled={isMax || balance?.toSignificant(5) === '0'}
              >
                <small>{t('max')}</small>
              </button>
            </Box>
          </Box>
        ) : (
          <Box className='token-amount-select-token'>
            <p className='weight-600'>{t('selectToken')}</p>
          </Box>
        )}
        <NumericalInput
          value={value}
          id={`amount-${currency?.symbol}`}
          disabled={locked}
          onUserInput={(val) => {
            handleInput(val.trim());
          }}
          placeholder='0'
        />
      </Box>
      {error && (
        <div className='token-amount-card-error'>
          <small>{error}</small>
        </div>
      )}
    </>
  );
}
