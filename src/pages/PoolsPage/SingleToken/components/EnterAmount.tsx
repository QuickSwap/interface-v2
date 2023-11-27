import { Box } from '@material-ui/core';
import { CurrencyLogo, NumericalInput } from 'components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  useSingleTokenCurrency,
  useSingleTokenTypeInput,
} from 'state/singleToken/hooks';

const SingleTokenEnterAmount: React.FC = () => {
  const { t } = useTranslation();
  const currency = useSingleTokenCurrency();
  const { typedValue, typeInput } = useSingleTokenTypeInput();

  return (
    <>
      <small className='weight-600'>3. {t('enterAmount')}</small>
      <Box className='singleTokenInputWrapper'>
        <Box className='flex items-center'>
          <NumericalInput onUserInput={typeInput} value={typedValue} />
          {currency ? (
            <Box className='flex items-center'>
              <CurrencyLogo currency={currency} size='18px' />
              <p className='font-bold'>{currency?.symbol}</p>
            </Box>
          ) : (
            <p>{t('selectToken')}</p>
          )}
        </Box>
      </Box>
    </>
  );
};

export default SingleTokenEnterAmount;
