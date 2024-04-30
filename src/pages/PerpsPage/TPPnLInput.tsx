import React, { useMemo, useRef, useState } from 'react';
import { useLocalStorage } from '@orderly.network/hooks';
import { Box } from '@material-ui/core';
import { ArrowDropDown, ArrowDropUp } from '@material-ui/icons';
import { Decimal, todpIfNeed } from '@orderly.network/utils';
import { formatDecimalInput } from 'utils/numbers';

export enum PnLMode {
  PnL = 'PnL',
  OFFSET = 'Offset',
  PERCENTAGE = 'Offset%',
}

interface Props {
  type: 'TP' | 'SL';
  quote: string;
  quote_dp?: number;
  onChange: (key: string, value: number | string) => void;
  values: {
    PnL: number | undefined;
    Offset: number | undefined;
    'Offset%': number | undefined;
  };
}

export const TPPnLInput: React.FC<Props> = ({
  type,
  quote,
  quote_dp = 2,
  onChange,
  values,
}) => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [valueFocused, setValueFocused] = useState(false);
  const [mode, setMode] = useLocalStorage<PnLMode>(
    'TP/SL_Mode',
    PnLMode.PERCENTAGE,
  );

  const percentageSuffix = useRef<string>('');

  const key = useMemo(() => {
    switch (mode) {
      case PnLMode.OFFSET:
        return `${type.toLowerCase()}_offset`;
      case PnLMode.PERCENTAGE:
        return `${type.toLowerCase()}_offset_percentage`;
      default:
        return `${type.toLowerCase()}_pnl`;
    }
  }, [mode, type]);

  const value = useMemo(() => {
    const val = values[mode as keyof Props['values']];

    if (!val) return '';

    if (mode === PnLMode.PnL || mode === PnLMode.OFFSET) {
      return val;
    }

    if (mode === PnLMode.PERCENTAGE) {
      return `${new Decimal(val)
        .mul(100)
        .todp(2, 4)
        .toString()}${percentageSuffix.current}`;
    }

    return val.toString();
  }, [values, mode]);

  return (
    <Box
      className={`tpslInputWrapper ${
        valueFocused ? 'border-primary' : 'border-secondary1'
      }`}
      flex={1}
      gridGap={8}
    >
      <small>{mode}</small>
      <Box className='flex items-center' position='relative'>
        <input
          value={value}
          placeholder={mode === PnLMode ? '%' : quote}
          onFocus={() => {
            setValueFocused(true);
            setOpenDropdown(false);
          }}
          onBlur={() => setValueFocused(false)}
          onChange={(e) => {
            const val = formatDecimalInput(e.target.value);
            if (val !== null && Number(val) !== Number(value)) {
              if (mode === PnLMode.PERCENTAGE) {
                percentageSuffix.current = val.endsWith('.') ? '.' : '';
                onChange(
                  key,
                  new Decimal(val)
                    .div(100)
                    .todp(4, 4)
                    .toNumber(),
                );
              } else {
                onChange(key, todpIfNeed(val, quote_dp));
              }
            }
          }}
        />
        <Box
          className='flex items-center'
          onClick={() => {
            setOpenDropdown(!openDropdown);
          }}
        >
          {openDropdown ? <ArrowDropUp /> : <ArrowDropDown />}
        </Box>
        {openDropdown && (
          <Box className='tpSLDropdown'>
            {Object.values(PnLMode).map((option) => (
              <Box
                key={option}
                onClick={() => {
                  setMode(option);
                  setOpenDropdown(false);
                }}
              >
                <small>{option}</small>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};
