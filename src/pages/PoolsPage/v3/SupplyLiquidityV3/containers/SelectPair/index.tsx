import React from 'react';
import { Currency } from '@uniswap/sdk-core';
import './index.scss';
import { IDerivedMintInfo } from 'state/mint/v3/hooks';
import { PriceFormats } from 'components/v3/PriceFomatToggler';
import { Box, makeStyles, MenuItem, Select } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import V3CurrencySelect from 'components/v3/CurrencySelect';
import { useTranslation } from 'react-i18next';
import { Value } from 'sass';
import { useState } from 'react';
import Fire from 'assets/images/fire-new.svg';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import token from '../../../../../../assets/tokenLogo/0xfa9343c3897324496a05fc75abed6bac29f8a40f.png';

interface ISelectPair {
  baseCurrency: Currency | null | undefined;
  quoteCurrency: Currency | null | undefined;
  mintInfo: IDerivedMintInfo;
  priceFormat: PriceFormats;
  handleCurrencySwap?: () => void;
  handleCurrencyASelect: (newCurrency: Currency) => void;
  handleCurrencyBSelect: (newCurrency: Currency) => void;
  handlePopularPairSelection: (pair: [string, string]) => void;
  selectedDepositType: string;
  setSelectedDepositType: (a: string) => void;
}

const useStyles = makeStyles(() => ({
  formControl: {
    '& .MuiInputBase-root': {
      width: '100%',
      borderColor: '#6EC177',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '100px',
      minWidth: '120px',
      justifyContent: 'center',
      backgroundColor: '#282d3d',
    },
    '& .MuiSelect-select.MuiSelect-select': {
      paddingRight: '0px',
    },
  },
  select: {
    width: 'auto',
    fontSize: '12px',
    '&:focus': {
      backgroundColor: 'transparent',
    },
  },
  selectIcon: {
    position: 'relative',
    color: '#6a6c80',
    fontSize: '14px',
  },
  paper: {
    borderRadius: 12,
    marginTop: 8,
  },
  list: {
    paddingTop: 0,
    paddingBottom: 0,
    '& li': {
      fontWeight: 200,
      paddingTop: 8,
      paddingBottom: 8,
      fontSize: '12px',
    },
    '& li.Mui-selected': {
      color: 'white',
      background: '#282d3d',
    },
    '& li.Mui-selected:hover': {
      background: '#282d3da7',
    },
  },
}));

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
  const classes = useStyles();

  return (
    <Box className='deposit_type'>
      <small className='weight-600'>{t('selectPair')}</small>
      <Box display='flex'>
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
