import React, { useEffect } from 'react';
import { Currency } from '@uniswap/sdk-core';
import './index.scss';
import { useInfoLiquidity } from 'hooks/subgraph/useInfoLiquidity';
import { IDerivedMintInfo } from 'state/mint/v3/hooks';
import { PriceFormats } from 'components/v3/PriceFomatToggler';
import { Box } from 'theme/components';
import { Plus } from 'react-feather';
import V3CurrencySelect from 'components/v3/CurrencySelect';
import { useTranslation } from 'react-i18next';

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
  mintInfo,
  priceFormat,
  handleCurrencySwap,
  handleCurrencyASelect,
  handleCurrencyBSelect,
}: ISelectPair) {
  const { t } = useTranslation();
  const {
    fetchPopularPools: {
      popularPools,
      popularPoolsLoading,
      fetchPopularPoolsFn,
    },
  } = useInfoLiquidity();

  useEffect(() => {
    fetchPopularPoolsFn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      <small className='weight-600'>{t('selectPair')}</small>
      <Box margin='12px 0 0' className='flex items-center'>
        <Box flex={1}>
          <V3CurrencySelect
            currency={baseCurrency ?? undefined}
            otherCurrency={quoteCurrency ?? undefined}
            handleCurrencySelect={handleCurrencyASelect}
          />
        </Box>
        <Box margin='0 8px' className='v3PairPlusIcon'>
          <Plus />
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
