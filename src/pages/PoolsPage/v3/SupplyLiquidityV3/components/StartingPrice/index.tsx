import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Currency, Token, Price } from '@uniswap/sdk-core';
import useUSDCPrice from 'hooks/v3/useUSDCPrice';
import './index.scss';
import { PriceFormats } from 'components/v3/PriceFomatToggler';
import {
  IDerivedMintInfo,
  useInitialTokenPrice,
  useInitialUSDPrices,
} from 'state/mint/v3/hooks';
import { useAppDispatch } from 'state/hooks';
import {
  Field,
  setInitialTokenPrice,
  setInitialUSDPrices,
  updateSelectedPreset,
} from 'state/mint/v3/actions';
import Input from 'components/NumericalInput';
import { Box, Button } from '@material-ui/core';
import Badge, { BadgeVariant } from 'components/v3/Badge';
import { Error } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';

interface IPrice {
  baseCurrency: Currency | undefined;
  quoteCurrency: Currency | undefined;
  basePrice: Price<Currency, Token> | undefined;
  quotePrice: Price<Currency, Token> | undefined;
  isLocked: boolean;
  isSelected: boolean;
}

interface ITokenPrice extends IPrice {
  userQuoteCurrencyToken?: string | undefined;
  changeQuotePriceHandler?: any;
}

interface IUSDPrice extends IPrice {
  userBaseCurrencyUSD: string | undefined;
  userQuoteCurrencyUSD: string | undefined;
  changeBaseCurrencyUSDHandler: any;
  changeQuoteCurrencyUSDHandler: any;
}

function TokenPrice({
  baseCurrency,
  quoteCurrency,
  basePrice,
  quotePrice,
  isLocked,
  userQuoteCurrencyToken,
  changeQuotePriceHandler,
  isSelected,
}: ITokenPrice) {
  const { t } = useTranslation();
  const [tokenQuotePrice, setTokenQuotePrice] = useState(
    userQuoteCurrencyToken || '',
  );
  const baseSymbol = useMemo(() => (baseCurrency ? baseCurrency.symbol : '-'), [
    baseCurrency,
  ]);
  const quoteSymbol = useMemo(
    () => (quoteCurrency ? quoteCurrency.symbol : '-'),
    [quoteCurrency],
  );

  const tokenRatio = useMemo(() => {
    if (!basePrice || !quotePrice) return `Loading...`;

    return String(
      (+basePrice.toSignificant(5) / +quotePrice.toSignificant(5)).toFixed(5),
    );
  }, [basePrice, quotePrice]);

  return (
    <Box className='v3-pool-starting-token-price'>
      <Box mr={1}>
        <small>1 {baseSymbol}</small>
      </Box>
      <small> = </small>
      <Box ml={1} flex={1} className='flex'>
        <Box className='flex items-center' pr={1}>
          <small>{quoteSymbol}</small>
        </Box>
        <Box flex={1} height='100%' position='relative'>
          {isLocked ? (
            <Box height={1} className='flex items-center'>
              <small>{tokenRatio}</small>
            </Box>
          ) : isSelected ? (
            <Box className='v3-pool-starting-token-price-input'>
              <Input
                placeholder={`${baseCurrency?.symbol} in ${quoteCurrency?.symbol}`}
                value={tokenQuotePrice}
                onUserInput={(e: string) => setTokenQuotePrice(e)}
              />
              <Button
                disabled={!tokenQuotePrice}
                onClick={() => changeQuotePriceHandler(tokenQuotePrice)}
              >
                {t('confirm')}
              </Button>
            </Box>
          ) : (
            <small>-</small>
          )}
        </Box>
      </Box>
    </Box>
  );
}

function USDPriceField({
  symbol,
  price,
  isSelected,
  userUSD,
  changeHandler,
}: {
  symbol: string | undefined;
  price: Price<Currency, Token> | undefined;
  isSelected: boolean;
  userUSD: string | undefined;
  changeHandler: (price: string) => void;
}) {
  const { t } = useTranslation();
  const _price = useMemo(
    () => (price ? price.toSignificant(5) : `Loading...`),
    [price],
  );
  const [userUSDVal, setUserUSDVal] = useState(userUSD || '');

  return (
    <Box className='v3-pool-starting-token-price'>
      <Box mr={1}>
        <small>1 {symbol}</small>
      </Box>
      <small>=</small>
      <Box ml={1}>
        <Box className='flex items-center' pr={1}>
          <small>$</small>
        </Box>
        {price ? (
          <small>{_price}</small>
        ) : isSelected ? (
          <Box flex={1} height='100%' position='relative'>
            <Box className='v3-pool-starting-token-price-input'>
              <Input
                value={userUSDVal}
                onUserInput={(e: string) => setUserUSDVal(e)}
                placeholder={`${symbol} in $`}
              />
              <Button
                disabled={!userUSDVal}
                onClick={() => changeHandler(userUSDVal)}
              >
                {t('confirm')}
              </Button>
            </Box>
          </Box>
        ) : (
          <small> - </small>
        )}
      </Box>
    </Box>
  );
}

function USDPrice({
  baseCurrency,
  quoteCurrency,
  basePrice,
  quotePrice,
  isLocked,
  userQuoteCurrencyUSD,
  userBaseCurrencyUSD,
  changeBaseCurrencyUSDHandler,
  changeQuoteCurrencyUSDHandler,
  isSelected,
}: IUSDPrice) {
  const baseSymbol = useMemo(() => (baseCurrency ? baseCurrency.symbol : '-'), [
    baseCurrency,
  ]);
  const quoteSymbol = useMemo(
    () => (quoteCurrency ? quoteCurrency.symbol : '-'),
    [quoteCurrency],
  );

  return (
    <Box className='flex'>
      <USDPriceField
        symbol={baseSymbol}
        price={basePrice}
        isSelected={isSelected}
        userUSD={userBaseCurrencyUSD}
        changeHandler={changeBaseCurrencyUSDHandler}
      ></USDPriceField>
      <Box ml={1}>
        <USDPriceField
          symbol={quoteSymbol}
          price={quotePrice}
          isSelected={isSelected}
          userUSD={userQuoteCurrencyUSD}
          changeHandler={changeQuoteCurrencyUSDHandler}
        ></USDPriceField>
      </Box>
    </Box>
  );
}

interface IStartingPrice {
  currencyA: Currency | undefined;
  currencyB: Currency | undefined;
  startPriceHandler: (value: string) => void;
  mintInfo: IDerivedMintInfo;
  priceFormat: PriceFormats;
}

export default function StartingPrice({
  currencyA,
  currencyB,
  startPriceHandler,
  mintInfo,
  priceFormat,
}: IStartingPrice) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const initialUSDPrices = useInitialUSDPrices();
  const initialTokenPrice = useInitialTokenPrice();

  const basePriceUSD = useUSDCPrice(currencyA ?? undefined);
  const quotePriceUSD = useUSDCPrice(currencyB ?? undefined);

  const isSorted =
    currencyA &&
    currencyB &&
    currencyA?.wrapped.sortsBefore(currencyB?.wrapped);

  const [userBaseCurrencyUSD, setUserBaseCurrencyUSD] = useState<
    string | undefined
  >(initialUSDPrices.CURRENCY_A);
  const [userQuoteCurrencyUSD, setUserQuoteCurrencyUSD] = useState<
    string | undefined
  >(initialUSDPrices.CURRENCY_B);

  const [userQuoteCurrencyToken, setUserQuoteCurrencyToken] = useState<
    string | undefined
  >(
    mintInfo && isSorted
      ? mintInfo.price?.toSignificant(5)
      : mintInfo.price?.invert().toSignificant(5) || undefined,
  );

  const isLocked = useMemo(() => Boolean(basePriceUSD && quotePriceUSD), [
    basePriceUSD,
    quotePriceUSD,
  ]);

  useEffect(() => {
    if (!initialUSDPrices.CURRENCY_A && basePriceUSD) {
      dispatch(
        setInitialUSDPrices({
          field: Field.CURRENCY_A,
          typedValue: basePriceUSD.toSignificant(8),
        }),
      );
    }
    if (!initialUSDPrices.CURRENCY_B && quotePriceUSD) {
      dispatch(
        setInitialUSDPrices({
          field: Field.CURRENCY_B,
          typedValue: quotePriceUSD.toSignificant(8),
        }),
      );
    }
    if (!initialTokenPrice && basePriceUSD && quotePriceUSD) {
      dispatch(
        setInitialTokenPrice({
          typedValue: String(
            (
              +basePriceUSD.toSignificant(8) / +quotePriceUSD.toSignificant(8)
            ).toFixed(5),
          ),
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    basePriceUSD,
    initialTokenPrice,
    initialUSDPrices.CURRENCY_A,
    initialUSDPrices.CURRENCY_B,
    quotePriceUSD,
  ]);

  const isUSD = useMemo(() => priceFormat === PriceFormats.USD, [priceFormat]);

  const handleUSDChange = useCallback(
    (field: Field, _typedValue: string) => {
      if (!_typedValue) {
        dispatch(setInitialTokenPrice({ typedValue: '' }));
        dispatch(setInitialUSDPrices({ field, typedValue: '' }));
        startPriceHandler('');
        if (field === Field.CURRENCY_A) {
          setUserBaseCurrencyUSD('');
        } else {
          setUserQuoteCurrencyUSD('');
        }
        setUserQuoteCurrencyToken('');
        return;
      }

      const typedValue = String(parseFloat(_typedValue));

      dispatch(setInitialUSDPrices({ field, typedValue }));

      if (field === Field.CURRENCY_A) {
        setUserBaseCurrencyUSD(_typedValue);
        const priceB =
          initialUSDPrices.CURRENCY_B || quotePriceUSD?.toSignificant(5);
        if (priceB) {
          if (!+typedValue) {
            startPriceHandler('');
            setUserQuoteCurrencyToken('');
            dispatch(setInitialTokenPrice({ typedValue: '' }));
          } else {
            const newPriceA = parseFloat(
              (+typedValue / (+priceB || 1)).toFixed(8),
            );
            startPriceHandler(String(newPriceA));
            setUserQuoteCurrencyToken(String(newPriceA));
            dispatch(setInitialTokenPrice({ typedValue: String(newPriceA) }));
          }
        }
      }

      if (field === Field.CURRENCY_B) {
        setUserQuoteCurrencyUSD(_typedValue);
        const priceA =
          initialUSDPrices.CURRENCY_A || basePriceUSD?.toSignificant(5);
        if (priceA) {
          if (!+typedValue) {
            startPriceHandler('');
            setUserQuoteCurrencyToken('');
            dispatch(setInitialTokenPrice({ typedValue: '' }));
          } else {
            const newPriceB = parseFloat((+priceA / +typedValue).toFixed(5));
            startPriceHandler(String(newPriceB));
            setUserQuoteCurrencyToken(String(newPriceB));
            dispatch(setInitialTokenPrice({ typedValue: String(newPriceB) }));
          }
        }
      }
    },
    [
      dispatch,
      startPriceHandler,
      initialUSDPrices.CURRENCY_B,
      initialUSDPrices.CURRENCY_A,
      quotePriceUSD,
      basePriceUSD,
    ],
  );

  const handleTokenChange = useCallback(
    (_typedValue: string) => {
      if (!_typedValue) {
        dispatch(setInitialTokenPrice({ typedValue: '' }));
        dispatch(
          setInitialUSDPrices({ field: Field.CURRENCY_A, typedValue: '' }),
        );
        dispatch(
          setInitialUSDPrices({ field: Field.CURRENCY_B, typedValue: '' }),
        );
        startPriceHandler('');
        setUserBaseCurrencyUSD('');
        setUserQuoteCurrencyUSD('');
        setUserQuoteCurrencyToken('');
        return;
      }

      setUserQuoteCurrencyToken(_typedValue);

      const typedValue = String(parseFloat(_typedValue));

      dispatch(setInitialTokenPrice({ typedValue }));

      startPriceHandler(typedValue);

      const usdA =
        basePriceUSD?.toSignificant(5) || initialUSDPrices.CURRENCY_A;
      const usdB =
        quotePriceUSD?.toSignificant(5) || initialUSDPrices.CURRENCY_B;

      if (usdA && usdA !== '0') {
        if (!basePriceUSD) {
          const newUSDA = (+usdA * +typedValue) / (+initialTokenPrice || 1);
          const fixedA = newUSDA ? parseFloat(newUSDA.toFixed(8)) : '0';
          dispatch(
            setInitialUSDPrices({
              field: Field.CURRENCY_A,
              typedValue: String(fixedA),
            }),
          );
          setUserBaseCurrencyUSD(String(fixedA));
          startPriceHandler(String(fixedA));
        }
      } else {
        if (usdB) {
          dispatch(
            setInitialUSDPrices({
              field: Field.CURRENCY_A,
              typedValue: String(
                parseFloat(
                  String((+usdB * +typedValue) / (+initialTokenPrice || 1)),
                ),
              ),
            }),
          );
          setUserBaseCurrencyUSD(
            String(
              parseFloat(
                String((+usdB * +typedValue) / (+initialTokenPrice || 1)),
              ),
            ),
          );
        }
      }

      if (usdB && usdB !== '0') {
        if (!quotePriceUSD) {
          const newUSDB = (+usdB * +typedValue) / (+initialTokenPrice || 1);
          const fixedB = newUSDB ? parseFloat(newUSDB.toFixed(8)) : '0';
          dispatch(
            setInitialUSDPrices({
              field: Field.CURRENCY_B,
              typedValue: String(fixedB),
            }),
          );
          setUserQuoteCurrencyUSD(String(fixedB));
          startPriceHandler(String(fixedB));
        }
      } else {
        if (usdA) {
          dispatch(
            setInitialUSDPrices({
              field: Field.CURRENCY_B,
              typedValue: String(
                parseFloat(
                  String((+usdA * +typedValue) / (+initialTokenPrice || 1)),
                ),
              ),
            }),
          );
          setUserQuoteCurrencyUSD(
            String(
              parseFloat(
                String((+usdA * +typedValue) / (+initialTokenPrice || 1)),
              ),
            ),
          );
        }
      }
    },
    [
      dispatch,
      startPriceHandler,
      basePriceUSD,
      initialUSDPrices.CURRENCY_A,
      initialUSDPrices.CURRENCY_B,
      quotePriceUSD,
      initialTokenPrice,
    ],
  );

  useEffect(() => {
    if (initialTokenPrice) {
      startPriceHandler(initialTokenPrice);
      setUserQuoteCurrencyToken(initialTokenPrice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTokenPrice]);

  useEffect(() => {
    dispatch(updateSelectedPreset({ preset: null }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceFormat]);

  return (
    <Box className='v3-pool-liquidity-starting-price'>
      <Box mb={2} className='flex'>
        {(isLocked || !basePriceUSD || !quotePriceUSD) && (
          <Badge
            text={
              isLocked
                ? `✨ ${t('pricesAutoFetched')}`
                : !basePriceUSD && !quotePriceUSD
                ? `${t('cantAutoFetchPrices')}.`
                : !basePriceUSD
                ? `${t('cantAutoFetchPrice', { symbol: currencyA?.symbol })}.`
                : `${t('cantAutoFetchPrice', { symbol: currencyB?.symbol })}.`
            }
            variant={isLocked ? BadgeVariant.PRIMARY : BadgeVariant.WARNING}
            icon={isLocked ? undefined : <Error width={14} height={14} />}
          />
        )}
      </Box>
      {priceFormat === PriceFormats.TOKEN ? (
        <TokenPrice
          baseCurrency={currencyA}
          quoteCurrency={currencyB}
          basePrice={basePriceUSD}
          quotePrice={quotePriceUSD}
          isLocked={isLocked}
          userQuoteCurrencyToken={userQuoteCurrencyToken}
          changeQuotePriceHandler={(v: string) => handleTokenChange(v)}
          isSelected={priceFormat === PriceFormats.TOKEN}
        ></TokenPrice>
      ) : (
        <USDPrice
          baseCurrency={currencyA}
          quoteCurrency={currencyB}
          basePrice={basePriceUSD}
          quotePrice={quotePriceUSD}
          isLocked={isLocked}
          userBaseCurrencyUSD={userBaseCurrencyUSD}
          userQuoteCurrencyUSD={userQuoteCurrencyUSD}
          changeBaseCurrencyUSDHandler={(v: string) =>
            handleUSDChange(Field.CURRENCY_A, v)
          }
          changeQuoteCurrencyUSDHandler={(v: string) =>
            handleUSDChange(Field.CURRENCY_B, v)
          }
          isSelected={priceFormat === PriceFormats.USD}
        ></USDPrice>
      )}
    </Box>
  );
}
