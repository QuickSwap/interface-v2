import React, { useEffect, useMemo, useState } from 'react';
import { TokenCard } from '../../components/TokenCard';
import { Currency } from '@uniswap/sdk-core';
import './index.scss';
import { useInfoLiquidity } from 'hooks/subgraph/useInfoLiquidity';
import { IDerivedMintInfo } from 'state/mint/v3/hooks';
import { StepTitle } from '../../components/StepTitle';
import { PriceFormats } from '../..//components/PriceFomatToggler';
import { useHistory } from 'react-router-dom';
import { Box } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import V3CurrencySelect from 'components/v3/CurrencySelect';

interface ISelectPair {
  baseCurrency: Currency | null | undefined;
  quoteCurrency: Currency | null | undefined;
  mintInfo: IDerivedMintInfo;
  isCompleted: boolean;
  priceFormat: PriceFormats;
  handleCurrencySwap: () => void;
  handleCurrencyASelect: (newCurrency: Currency) => void;
  handleCurrencyBSelect: (newCurrency: Currency) => void;
  handlePopularPairSelection: (pair: [string, string]) => void;
}

export function SelectPair({
  baseCurrency,
  quoteCurrency,
  mintInfo,
  isCompleted,
  priceFormat,
  handleCurrencySwap,
  handleCurrencyASelect,
  handleCurrencyBSelect,
}: ISelectPair) {
  const history = useHistory();

  const {
    fetchPopularPools: {
      popularPools,
      popularPoolsLoading,
      fetchPopularPoolsFn,
    },
  } = useInfoLiquidity();

  useEffect(() => {
    fetchPopularPoolsFn();
  }, []);

  // useEffect(() => {
  //   return () => {
  //     if (history.action === 'POP') {
  //       history.push('/v3pools');
  //     }
  //   };
  // }, []);

  return (
    <Box>
      <small className='weight-600'>Select a pair</small>
      <Box mt={1.5} className='flex items-center'>
        <Box flex={1}>
          <V3CurrencySelect
            currency={baseCurrency ?? undefined}
            otherCurrency={quoteCurrency ?? undefined}
            handleCurrencySelect={handleCurrencyASelect}
          />
        </Box>
        <Box mx={1} className='v3PairPlusIcon'>
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
