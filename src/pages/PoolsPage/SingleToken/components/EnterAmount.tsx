import { Box } from '@material-ui/core';
import { CurrencyLogo, NumericalInput } from 'components';
import { useActiveWeb3React } from 'hooks';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  useSingleTokenCurrency,
  useSingleTokenTypeInput,
  useSingleTokenVault,
} from 'state/singleToken/hooks';
import { useCurrencyBalance } from 'state/wallet/v3/hooks';
import { formatNumber } from 'utils';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';

const SingleTokenEnterAmount: React.FC = () => {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();
  const currency = useSingleTokenCurrency();
  const { selectedVault } = useSingleTokenVault();
  const { typedValue, typeInput } = useSingleTokenTypeInput();
  const balance = useCurrencyBalance(account, currency);
  const { price: usdPrice } = useUSDCPriceFromAddress(
    currency?.wrapped.address ?? '',
  );

  return (
    <>
      <Box className='flex justify-between'>
        <small className='weight-600'>3. {t('enterAmount')}</small>
        {selectedVault && (
          <Box className='flex'>
            <small>
              {selectedVault.token0?.symbol}/{selectedVault.token1?.symbol}
            </small>
            <Box className='singleTokenPoolFee' ml='6px'>
              {formatNumber(selectedVault.fee)}%
            </Box>
          </Box>
        )}
      </Box>
      <Box className='singleTokenInputWrapper' mt={2}>
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
        <Box mt={2} className='flex justify-between items-center'>
          <small className='text-secondary'>
            ${formatNumber(usdPrice * Number(balance?.toSignificant() ?? 0))}
          </small>
          <Box className='flex items-center'>
            <small>
              <small className='text-secondary'>{t('available')}: </small>
              <small>{formatNumber(balance?.toExact() ?? 0)}</small>
            </small>
            <Box
              className='singleTokenInputMax'
              ml='4px'
              onClick={() => {
                typeInput(balance?.toExact() ?? '0');
              }}
            >
              {t('max')}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default SingleTokenEnterAmount;
