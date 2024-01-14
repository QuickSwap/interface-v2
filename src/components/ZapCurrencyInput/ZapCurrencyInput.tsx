import React from 'react';
import { Currency } from '@uniswap/sdk-core';
import { Box } from '@mui/material';
import { useCurrencyBalance } from 'state/wallet/v3/hooks';
import { NumericalInput } from 'components';
import { useActiveWeb3React } from 'hooks';
import { useTranslation } from 'next-i18next';
import ZapCurrencySelect from './ZapCurrencySelect';
import { default as useUSDCPrice } from 'hooks/v3/useUSDCPrice';
import styles from 'styles/components/ZapCurrencyInput.module.scss';

interface ZapCurrencyInputProps {
  title?: string;
  handleCurrencySelect: (currency: Currency) => void;
  currency: Currency | undefined;
  otherCurrency?: Currency | undefined;
  amount: string;
  setAmount: (value: string) => void;
  onMax?: () => void;
  showMaxButton?: boolean;
  showPrice?: boolean;
  bgClass?: string;
  id?: string;
}

const ZapCurrencyInput: React.FC<ZapCurrencyInputProps> = ({
  handleCurrencySelect,
  currency,
  otherCurrency,
  amount,
  setAmount,
  onMax,
  showMaxButton,
  id,
}) => {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();
  const selectedCurrencyBalance = useCurrencyBalance(
    account ?? undefined,
    currency,
  );
  const usdPriceObj = useUSDCPrice(currency);
  const usdPrice = Number(usdPriceObj?.toSignificant() ?? 0);

  return (
    <Box id={id} className={styles.zapCurrencyInputBox}>
      <Box mb={2} className='flex items-center'>
        <NumericalInput
          fontSize={22}
          value={amount}
          placeholder='0.00'
          onUserInput={(val) => {
            setAmount(val);
          }}
        />
        <ZapCurrencySelect
          id={id}
          currency={currency}
          otherCurrency={otherCurrency}
          handleCurrencySelect={handleCurrencySelect}
        />
      </Box>
      <Box className='flex justify-between'>
        <small className='text-secondary'>
          ${(usdPrice * Number(amount)).toLocaleString('us')}
        </small>
        <Box className='flex items-center' gap='8px'>
          <small>
            {t('balance')}:{' '}
            {Number(selectedCurrencyBalance?.toExact() ?? 0).toLocaleString(
              'us',
            )}
          </small>
          {account && currency && showMaxButton && (
            <Box className={styles.zapCurrencyInputMaxWrapper} onClick={onMax}>
              <small>{t('max')}</small>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ZapCurrencyInput;
