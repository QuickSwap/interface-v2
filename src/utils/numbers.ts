import numbro from 'numbro';
import { DEFAULT_LOCALE, SupportedLocale } from 'constants/v3/locales';
import { Percent } from '@uniswap/sdk-core';

// using a currency library here in case we want to add more in future
export const formatDollarAmount = (
  num: number | undefined,
  digits = 2,
  round = true,
) => {
  if (num === 0) return '$0.00';
  if (!num) return '-';
  if (num < 0.001 && digits <= 3) {
    return '<$0.001';
  }

  return numbro(num).formatCurrency({
    average: round,
    mantissa: num > 1000 ? 2 : digits,
    abbreviations: {
      thousand: 'K',
      million: 'M',
      billion: 'B',
    },
  });
};

// using a currency library here in case we want to add more in future

export const formatPercent = (
  num: number | undefined,
  digits = 2,
  round = true,
) => {
  if (num === 0) return '-';
  if (!num) return '-';
  if (num < 0.001 && digits <= 3) {
    return '<0.01%';
  }

  return parseFloat(num.toString()).toFixed(2) + '%';
};

export const formatAdvancedPercent = (
  percent: Percent | undefined,
  locale: SupportedLocale = DEFAULT_LOCALE,
) => {
  if (!percent) return '0';

  return Number(percent.toFixed(3)).toLocaleString(locale, {
    maximumFractionDigits: 3,
    useGrouping: false,
  });
};

export const formatAmount = (num: number | undefined, digits = 3) => {
  if (num === 0) return '0';
  if (!num) return '-';
  if (num < 0.001) {
    return '<0.001';
  }
  return numbro(num).format({
    average: true,
    mantissa: num > 1000 ? 2 : digits,
    abbreviations: {
      thousand: 'K',
      million: 'M',
      billion: 'B',
    },
  });
};

export const formatFloat = (num: number | undefined, digits = 3) => {
  if (num === 0) return '0';
  if (!num) return '-';

  return numbro(num).format({
    average: true,
    mantissa: num > 1000 ? 2 : digits,
    abbreviations: {
      thousand: 'K',
      million: 'M',
      billion: 'B',
    },
  });
};

export const formatAmountTokens = (num: number | undefined, average?: any) => {
  if (num === 0) return '0';
  if (!num) return '-';
  if (num < 0.001) {
    return '<0.001';
  }
  return numbro(num).format({
    thousandSeparated: true,
    average: !!average,
    mantissa: average ? 1 : 0,
    abbreviations: {
      thousand: 'K',
      billion: 'B',
    },
  });
};

export function formatDecimalInput(
  inputFieldValue: string,
  decimal?: number,
): string | null {
  const decimalCutOffIndedx = decimal !== undefined ? decimal : 18;
  let value = inputFieldValue.replace(',', '.').replace(/[^0-9.]/g, '');
  const decSeperatorCount = value.replace(/[^.]/g, '').length;
  if (decSeperatorCount > 1) {
    return null;
  }

  if (decimal === 0) {
    return value.split('.')[0];
  }

  if (value === '') {
    return '';
  }
  if (value === '.') {
    return '0.';
  }
  if (value === '0') {
    return '0';
  }
  // prevent numbers smaller than a satoshi *even for 18 decimal tokens.
  if (
    (value.startsWith('0.0000000') || value.startsWith('.0000000')) &&
    Number(value) < 0.00000001
  ) {
    return Number(value).toPrecision(7);
  }
  if (value.startsWith('0') && value[1] !== '.') {
    const last = value.length;
    value = value.slice(1, last);
  }
  if (value.includes('.')) {
    // remove extra decimal values:
    const decialSplit = value.split('.');
    if (decialSplit[1].length > 1) {
      const afterDecimal = decialSplit[1];
      if (afterDecimal.length > decimalCutOffIndedx) {
        const decimalIndex = value.indexOf('.');
        const lastDecimalIndex = decimalIndex + decimalCutOffIndedx;
        value = value.slice(0, lastDecimalIndex + 1);
      }
    }
  }
  if (value) {
    return value;
  }

  return '';
}
