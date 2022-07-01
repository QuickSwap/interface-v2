import numbro from 'numbro';

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
