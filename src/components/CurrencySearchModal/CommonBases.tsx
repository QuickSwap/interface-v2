import React, { useEffect, useState } from 'react';
import { ChainId, Currency, currencyEquals, ETHER, Token } from '@uniswap/sdk';
import { Box, Button, Checkbox, Typography } from '@material-ui/core';
import { CurrencyLogo, QuestionHelper } from 'components';
import { useTranslation } from 'react-i18next';
import { SUGGESTED_BASES, WMATIC_EXTENDED } from 'constants/v3/addresses';
import { useIsV2 } from 'state/application/hooks';
import { NativeCurrency } from '@uniswap/sdk-core';
import CustomTabSwitch from 'components/v3/CustomTabSwitch';
import Fire from 'assets/images/fire-new.svg';
import { Favorite, FavoriteBorder } from '@material-ui/icons';
interface CommonBasesProps {
  chainId?: ChainId;
  selectedCurrency?: Currency | null;
  onSelect: (currency: Currency) => void;
  onRemoveFavorite: (currency: Currency) => void;
  currencies: Currency[];
}

const CommonBases: React.FC<CommonBasesProps> = ({
  chainId,
  onSelect,
  selectedCurrency,
  currencies,
  onRemoveFavorite,
}) => {
  const { t } = useTranslation();

  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  const { isV2 } = useIsV2();
  const nativeCurrency = isV2
    ? ETHER[chainIdToUse]
    : ({
        ...ETHER[chainIdToUse],
        isNative: true,
        isToken: false,
        wrapped: WMATIC_EXTENDED[chainIdToUse],
      } as NativeCurrency);
  return (
    <Box mb={2}>
      {/* <Box display='flex' my={1.5}>
        <Box mr='6px'>
          <span>{t('commonBase')}</span>
        </Box>
        <QuestionHelper text={t('commonBaseHelper')} />
      </Box> */}
      <Box className='flex flex-wrap'>
        <Box
          className='baseWrapper'
          onClick={() => {
            if (
              !selectedCurrency ||
              !currencyEquals(selectedCurrency, nativeCurrency)
            ) {
              onSelect(nativeCurrency);
            }
          }}
        >
          <CurrencyLogo currency={nativeCurrency} size='24px' />
          <small>{nativeCurrency.symbol}</small>
        </Box>

        {(chainId ? SUGGESTED_BASES[chainId] ?? [] : [])
          .filter((item) => !currencies.some((c) => c.symbol === item.symbol))
          .map((token: Token) => {
            const selected = Boolean(
              selectedCurrency && currencyEquals(selectedCurrency, token),
            );
            return (
              <Box
                className='baseWrapper'
                key={token.symbol}
                onClick={() => {
                  if (!selected) {
                    onSelect(token);
                  }
                }}
              >
                <CurrencyLogo currency={token} size='24px' />
                <small>{token.symbol}</small>
              </Box>
            );
          })}

        {currencies.map((token: Currency) => {
          const selected = Boolean(
            selectedCurrency && currencyEquals(selectedCurrency, token),
          );
          return (
            <Box className='baseWrapper' key={token.symbol}>
              <Box
                display='flex'
                alignItems='center'
                onClick={() => {
                  if (!selected) {
                    onSelect(token);
                  }
                }}
              >
                <CurrencyLogo currency={token} size='24px' />
                <small>{token.symbol}</small>
              </Box>
              <small className='pl-2' onClick={() => onRemoveFavorite(token)}>
                x
              </small>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default CommonBases;
