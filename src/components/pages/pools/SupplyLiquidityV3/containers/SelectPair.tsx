import React from 'react';
import { Currency } from '@uniswap/sdk-core';
import styles from 'styles/pages/pools/SelectPair.module.scss';
import { IDerivedMintInfo } from 'state/mint/v3/hooks';
import { PriceFormats } from 'components/v3/PriceFomatToggler';
import { Box } from '@mui/material';
import { Add } from '@mui/icons-material';
import V3CurrencySelect from 'components/v3/CurrencySelect';
import { useTranslation } from 'next-i18next';

interface ISelectPair {
  baseCurrency: Currency | null | undefined;
  quoteCurrency: Currency | null | undefined;
  mintInfo: IDerivedMintInfo;
  priceFormat: PriceFormats;
  handleCurrencySwap?: () => void;
  handleCurrencyASelect: (newCurrency: Currency) => void;
  handleCurrencyBSelect: (newCurrency: Currency) => void;
  handlePopularPairSelection: (pair: [string, string]) => void;
}

export function SelectPair({
  baseCurrency,
  quoteCurrency,
  handleCurrencyASelect,
  handleCurrencyBSelect,
}: ISelectPair) {
  const { t } = useTranslation();

  return (
    <Box>
      <small className='weight-600'>{t('selectPair')}</small>
      <Box mt={1.5} className='flex items-center'>
        <Box flex={1}>
          <V3CurrencySelect
            currency={baseCurrency ?? undefined}
            otherCurrency={quoteCurrency ?? undefined}
            handleCurrencySelect={handleCurrencyASelect}
          />
        </Box>
        <Box mx={1} className={styles.v3PairPlusIcon}>
          <Add />
        </Box>
        <Box flex={1}>
          <V3CurrencySelect
            currency={quoteCurrency ?? undefined}
            otherCurrency={baseCurrency ?? undefined}
            handleCurrencySelect={handleCurrencyBSelect}
          />
        </Box>
      </Box>
    </Box>
  );
}
