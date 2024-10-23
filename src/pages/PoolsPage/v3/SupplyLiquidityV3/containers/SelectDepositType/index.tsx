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

export function SelectDepositType({
  baseCurrency,
  quoteCurrency,
  mintInfo,
  priceFormat,
  handleCurrencySwap,
  handleCurrencyASelect,
  handleCurrencyBSelect,
  selectedDepositType,
  setSelectedDepositType,
}: ISelectPair) {
  const { t } = useTranslation();
  const classes = useStyles();
  // const [depositToken, setDepositToken] = useState('wbtc');

  // const menuProps = {
  //   classes: {
  //     list: classes.list,
  //     paper: classes.paper,
  //   },
  //   // anchorOrigin: {
  //   //   vertical: 'bottom',
  //   //   horizontal: 'center',
  //   // },
  //   // transformOrigin: {
  //   //   vertical: 'top',
  //   //   horizontal: 'center',
  //   // },
  //   getContentAnchorEl: null,
  // };

  const depositType = [
    {
      isSingle: false,
      title: 'Double Sided',
      value: 'double',
      icon: '/icons/pools/multiple-deposit.svg',
    },
    {
      isSingle: true,
      title: 'Single Sided',
      value: 'single',
      isNew: true,
      poweredBy: {
        logo: '/ichi-logo.png',
      },
      icon: '/icons/pools/single-deposit.svg',
    },
  ];

  return (
    <Box className='deposit_type'>
      {/* <small className='weight-600'>{t('selectPair')}</small> */}
      <p>{t('selectDepositType')}</p>
      <Box mt={1.5} mb={1.5} gridGap={16} className='flex items-center'>
        {depositType.map((item, index) => {
          const isSelected = item.value === selectedDepositType;
          return (
            <Box
              key={index}
              onClick={() => {
                setSelectedDepositType(item.value);
              }}
              style={{
                width: '100%',
                height: '105px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                backgroundColor: '#282d3d',
                borderRadius: '12px',
                position: 'relative',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <img src={item.icon} alt='deposit icon' />
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <p
                  style={{
                    fontSize: '14px',
                    color: '#c7cad9c',
                  }}
                >
                  {item.title}
                </p>
                {item.isNew && <img src={Fire} alt='fire' />}
              </Box>

              {item.poweredBy && (
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    justifyContent: 'center',
                  }}
                >
                  <p
                    style={{
                      textTransform: 'uppercase',
                      color: '#636780',
                      fontSize: '8px',
                    }}
                  >
                    Powered by
                  </p>
                  <img
                    src={item.poweredBy.logo}
                    alt='poweredby'
                    style={{ width: '20%' }}
                  />
                </Box>
              )}
              {isSelected && (
                <Box
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    left: 0,
                    top: 0,
                    border: 'solid 1.6px rgba(68, 138, 255, 0.8)',

                    borderRadius: '12px',
                    pointerEvents: 'none',
                  }}
                ></Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
